// tinyengine/rate-scheduler.ts — client-side scheduling that respects the limit (Chapter 15).
export interface QuotaMeters {        // How each provider counts. A snapshot in config — re-date when it drifts.
  provider: "openai" | "anthropic" | "gemini" | "bedrock";
  tpm?: number; itpm?: number; otpm?: number; rpm?: number;
  bedrockBurndown?: number;           // output tokens × multiplier against the quota (e.g. 5, 10, 15)
}

export type FailKind =
  | { kind: "rate"; retryable: true }                       // 429 rate_limit: retry with backoff
  | { kind: "overloaded"; retryable: true }                 // 529 / overloaded 429: their queue, back off
  | { kind: "spend_cap"; retryable: false; parkFleet: true } // 429 with no Retry-After + "regain access": park, don't burn attempts
  | { kind: "billing"; retryable: false }                   // insufficient_quota: fail fast, page a human
  | { kind: "transient"; retryable: true };                 // 500/503/timeout/network

// Classify BEFORE retrying (ch. 15): the wrong classifier is the zombie fleet.
export function classify(status: number, headers: Record<string, string>, body: string): FailKind {
  const ra = headers["retry-after"];
  if (status === 429) {
    if (/insufficient_quota|billing/i.test(body)) return { kind: "billing", retryable: false };
    if (ra === undefined && /regain access|spend limit|usage cap/i.test(body))
      return { kind: "spend_cap", retryable: false, parkFleet: true };
    if (/overloaded/i.test(body)) return { kind: "overloaded", retryable: true };
    return { kind: "rate", retryable: true };
  }
  if (status === 529 || status === 503) return { kind: "overloaded", retryable: true };
  if (status >= 500 || status === 408) return { kind: "transient", retryable: true };
  return { kind: "billing", retryable: false }; // 4xx otherwise: not retryable, not our machine
}

// Full jitter (AWS 2015): random(0, min(cap, base × 2^attempt)); Retry-After is a floor, not a suggestion.
export function backoffDelayMs(attempt: number, baseMs = 1000, capMs = 20000, retryAfterHeader?: string): number {
  const ceiling = Math.min(capMs, baseMs * 2 ** attempt);
  let d = Math.random() * ceiling;
  if (retryAfterHeader !== undefined) d = Math.max(d, parseFloat(retryAfterHeader) * 1000 || 0);
  return d;
}

export class TokenBucket {             // Continuous refill — the provider's meter is a bucket, not a window (ch. 15).
  private tokens: number; private last: number;
  constructor(private capacity: number, private refillPerSecond: number, now = Date.now() / 1000) {
    this.tokens = capacity; this.last = now;
  }
  private fill(now: number): void {
    if (now < this.last) return; // non-monotonic clock (NTP step, VM resume): ignore it, never drain the bucket (gate-6 B4)
    this.tokens = Math.min(this.capacity, this.tokens + (now - this.last) * this.refillPerSecond);
    this.last = now;
  }
  tryAcquire(n = 1, now = Date.now() / 1000): boolean { this.fill(now); if (this.tokens >= n) { this.tokens -= n; return true; } return false; }
  credit(n: number, now = Date.now() / 1000): void { this.fill(now); this.tokens = Math.min(this.capacity, this.tokens + n); }
  debit(n: number, now = Date.now() / 1000): void { this.fill(now); this.tokens -= n; } // overrun charge: may go negative — admission freezes until refill covers it
}

// Little's Law sizing: in-flight ≈ throughput × latency. Excess waits in a visible local queue, never on the wire.
export class Semaphore {
  private queue: (() => void)[] = []; active = 0;
  constructor(private maxInFlight: number) {}
  async acquire(): Promise<void> {
    if (this.active < this.maxInFlight) { this.active++; return; }
    await new Promise<void>((res) => this.queue.push(res));
    this.active++;
  }
  release(): void { this.active--; this.queue.shift()?.(); }
  get queued(): number { return this.queue.length; }
}

// Per-provider quota ledger. Reservations match the provider's own meter arithmetic.
export class QuotaLedger {
  private books = new Map<string, { rpm: TokenBucket; tpm: TokenBucket }>();
  // Bedrock reservations awaiting settlement, FIFO (attack2 H1/H2): reconcile
  // consumes the oldest — a double-fire (timeout + late success) or a reconcile
  // for a request the ledger never booked finds nothing outstanding and no-ops,
  // so a retry wrapper cannot manufacture quota nobody paid for.
  private outstanding = new Map<string, number[]>();
  configure(m: QuotaMeters, now?: number): void {
    this.books.set(m.provider, { rpm: new TokenBucket(m.rpm ?? 60, (m.rpm ?? 60) / 60, now), tpm: new TokenBucket(m.tpm ?? m.itpm ?? 1e6, (m.tpm ?? m.itpm ?? 1e6) / 60, now) });
  }
  reserve(provider: string, req: { maxTokens: number; estimatedPromptTokens: number; cacheReadTokens?: number; cacheWriteTokens?: number }, now?: number): boolean {
    const b = this.books.get(provider); if (!b) return true;
    // Fields clamp at the door (gate-6 B3): a malformed negative estimate or cache-write
    // must never cancel positive terms into a zero charge — that is a free ride past the meter.
    const est = Math.max(0, req.estimatedPromptTokens);
    const maxT = Math.max(0, req.maxTokens);
    const cacheWrite = Math.max(0, req.cacheWriteTokens ?? 0);
    const cacheRead = Math.min(Math.max(0, req.cacheReadTokens ?? 0), est); // reads ride inside the prompt
    let charge = 0;
    if (provider === "openai") charge = Math.max(maxT, est); // max(max_tokens, estimate)
    else if (provider === "anthropic") charge = est - cacheRead; // reads bypass ITPM
    else if (provider === "bedrock") charge = est + cacheWrite + maxT; // input + cache-write + max_tokens, booked up front
    else charge = est;                                        // gemini: input TPM only
    // Atomic reservation (gate-6 B1): a TPM miss must leave RPM untouched, and an RPM miss must
    // return the TPM tokens — a leaked slot is a phantom 429 for a request that never went out.
    if (!b.tpm.tryAcquire(Math.max(0, charge), now)) return false; // TPM first: a miss burns nothing
    if (!b.rpm.tryAcquire(1, now)) { b.tpm.credit(Math.max(0, charge), now); return false; }
    if (provider === "bedrock") {
      const out = this.outstanding.get(provider) ?? [];
      out.push(charge); this.outstanding.set(provider, out);   // booked — one reconcile settles it
    }
    return true;
  }
  // Bedrock books input + cache-write + max_tokens up front, then reconciles at completion
  // (final charge = input + writes + output × burndown; cache reads never counted — ch. 15's
  // worked example). Under-runs re-credit the unused reservation; OVER-runs debit the
  // difference (gate-6 B2) — output × burndown can outrun max_tokens, and a ledger that only
  // credits lets a fleet of overrunners sail past TPM with the bucket green. One reconcile
  // settles ONE outstanding reservation, oldest first (attack2 H1/H2): with nothing
  // outstanding it is a no-op — reconcile in completion order, once per completed request.
  reconcile(provider: string, booked: { input: number; cacheWrite?: number; maxTokens: number }, actual: { input: number; cacheWrite?: number; output: number; burndown?: number }, now?: number): void {
    const b = this.books.get(provider); if (!b || provider !== "bedrock") return;
    const out = this.outstanding.get(provider);
    if (!out || out.length === 0) return;                       // nothing booked to settle — no-op
    out.shift();
    const bookedTotal = booked.input + (booked.cacheWrite ?? 0) + booked.maxTokens;
    const finalCharge = actual.input + (actual.cacheWrite ?? 0) + actual.output * (actual.burndown ?? 1);
    const delta = finalCharge - bookedTotal;
    if (delta > 0) b.tpm.debit(delta, now); else b.tpm.credit(-delta, now);
  }
}

// A 3-attempt cap bounds amplification at 3×; a ~10% retry budget rejects surplus retries locally.
export class RetryPolicy {
  constructor(readonly maxAttempts = 3, readonly budgetFraction = 0.1) {}
  private window: boolean[] = [];
  allows(): boolean {
    const recent = this.window.slice(-100);
    if (recent.length >= 20) {
      const fails = recent.filter((x) => !x).length;
      if (fails / recent.length > this.budgetFraction) return false; // reject locally: the dependency needs room
    }
    return true;
  }
  record(ok: boolean): void { this.window.push(ok); if (this.window.length > 1000) this.window.shift(); }
}

// Wave pacer: spread a fanout over time with jittered spacing; K-of-N lets the pacer stop early.
export function waveDelays(n: number, spacingMs: number, jitter = 0.5): number[] {
  return Array.from({ length: n }, () => Math.round(spacingMs * (1 - jitter / 2 + Math.random() * jitter)));
}
export function kOfN<T>(results: (T | null)[], k: number): { done: boolean; winners: T[] } {
  const winners = results.filter((r): r is T => r !== null);
  return { done: winners.length >= k, winners };
}
