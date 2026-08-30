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
    if (!Number.isFinite(capacity) || capacity < 0
      || !Number.isFinite(refillPerSecond) || refillPerSecond < 0)
      throw new Error("token bucket capacity and refill must be finite and non-negative");
    this.tokens = capacity; this.last = now;
  }
  private fill(now: number): void {
    if (!Number.isFinite(now)) throw new Error("token bucket clock must be finite");
    if (now < this.last) return; // non-monotonic clock (NTP step, VM resume): ignore it, never drain the bucket (gate-6 B4)
    this.tokens = Math.min(this.capacity, this.tokens + (now - this.last) * this.refillPerSecond);
    this.last = now;
  }
  tryAcquire(n = 1, now = Date.now() / 1000): boolean {
    if (!validAmount(n)) return false;
    this.fill(now);
    if (this.tokens >= n) { this.tokens -= n; return true; }
    return false;
  }
  credit(n: number, now = Date.now() / 1000): void {
    requireAmount(n); this.fill(now); this.tokens = Math.min(this.capacity, this.tokens + n);
  }
  debit(n: number, now = Date.now() / 1000): void {
    requireAmount(n); this.fill(now); this.tokens -= n;
  } // overrun charge: may go negative — admission freezes until refill covers it
  charge(n: number, now = Date.now() / 1000): boolean {
    requireAmount(n); this.fill(now);
    const covered = this.tokens >= n;
    this.tokens -= n;
    return covered;
  }
  available(now = Date.now() / 1000): number { this.fill(now); return this.tokens; }
}

function validAmount(n: number): boolean { return Number.isFinite(n) && n >= 0; }
function requireAmount(n: number): void {
  if (!validAmount(n)) throw new Error("token amount must be finite and non-negative");
}

// Little's Law sizing: in-flight ≈ throughput × latency. Excess waits in a visible local queue, never on the wire.
export class Semaphore {
  private queue: (() => void)[] = []; active = 0;
  constructor(private maxInFlight: number) {
    if (!Number.isInteger(maxInFlight) || maxInFlight < 1)
      throw new Error("maxInFlight must be a positive integer");
  }
  private async acquireSlot(): Promise<void> {
    if (this.active < this.maxInFlight) { this.active++; return; }
    await new Promise<void>((res) => this.queue.push(res));
  }
  // Hand the occupied slot directly to the next waiter. Decrementing first
  // creates a race in which a double release can admit two holders into one slot.
  private releaseSlot(): void {
    const next = this.queue.shift();
    if (next) { next(); return; }
    if (this.active > 0) this.active--;
  }
  async acquire(): Promise<{ release: () => void }> { return this.acquirePermit(); }
  async acquirePermit(): Promise<{ release: () => void }> {
    await this.acquireSlot();
    let live = true;
    return { release: () => { if (live) { live = false; this.releaseSlot(); } } };
  }
  async withPermit<T>(fn: () => Promise<T>): Promise<T> {
    const permit = await this.acquirePermit();
    try { return await fn(); } finally { permit.release(); }
  }
  get queued(): number { return this.queue.length; }
}

// Per-provider quota ledger. Reservations match the provider's own meter arithmetic.
export interface QuotaRequest {
  requestId?: string;
  maxTokens: number;
  estimatedPromptTokens: number;
  cacheReadTokens?: number;
  cacheWriteTokens?: number;
}
export interface ReservationResult { ok: boolean; reservationId?: string }
type Reservation = { id: string; charge: number };

export class QuotaLedger {
  private books = new Map<string, { rpm: TokenBucket; tpm: TokenBucket;
    otpm?: TokenBucket; meters: QuotaMeters }>();
  private outstanding = new Map<string, Reservation[]>();
  private nextReservation = 0;
  configure(m: QuotaMeters, now?: number): void {
    if (m.bedrockBurndown !== undefined && !validAmount(m.bedrockBurndown))
      throw new Error("bedrockBurndown must be finite and non-negative");
    const rpm = m.rpm ?? 60, tpm = m.tpm ?? m.itpm ?? 1e6;
    this.books.set(m.provider, { rpm: new TokenBucket(rpm, rpm / 60, now),
      tpm: new TokenBucket(tpm, tpm / 60, now),
      otpm: m.otpm === undefined ? undefined : new TokenBucket(m.otpm, m.otpm / 60, now),
      meters: m });
  }
  reserve(provider: string, req: QuotaRequest, now?: number): boolean {
    return this.reserveRequest(provider, req, now).ok;
  }
  reserveRequest(provider: string, req: QuotaRequest, now?: number): ReservationResult {
    const b = this.books.get(provider);
    if (!b) return { ok: true, reservationId: req.requestId };
    // An actual-output meter can go negative after an overrun. Do not admit
    // another generation until continuous refill has paid that debt back.
    if (b.otpm && b.otpm.available(now) <= 0) return { ok: false };
    const id = req.requestId ?? `${provider}:${++this.nextReservation}`;
    if ((this.outstanding.get(provider) ?? []).some((r) => r.id === id)) return { ok: false };
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
    if (!b.tpm.tryAcquire(Math.max(0, charge), now)) return { ok: false }; // TPM first: a miss burns nothing
    if (!b.rpm.tryAcquire(1, now)) {
      b.tpm.credit(Math.max(0, charge), now);
      return { ok: false };
    }
    if (provider === "bedrock") {
      const out = this.outstanding.get(provider) ?? [];
      out.push({ id, charge });
      this.outstanding.set(provider, out);
    }
    return { ok: true, reservationId: id };
  }

  // Anthropic's output meter counts actual output, not max_tokens. Feed the
  // usage event here as it arrives; a false return means the local OTPM meter
  // is exhausted and the next generation must wait.
  recordOutput(provider: string, outputTokens: number, now?: number): boolean {
    const bucket = this.books.get(provider)?.otpm;
    if (!bucket) return true;
    if (!validAmount(outputTokens)) {
      const remaining = bucket.available(now);
      if (remaining > 0) bucket.charge(remaining, now);
      return false;
    }
    // The model already emitted these tokens. Even when they exceed the local
    // balance, charge every token and carry the debt into future admission.
    return bucket.charge(outputTokens, now);
  }
  // Bedrock books input + cache-write + max_tokens up front, then reconciles at completion
  // (final charge = input + writes + output × burndown; cache reads never counted — ch. 15's
  // worked example). Under-runs re-credit the unused reservation; OVER-runs debit the
  // difference (gate-6 B2) — output × burndown can outrun max_tokens, and a ledger that only
  // credits lets a fleet of overrunners sail past TPM with the bucket green. One reconcile
  // settles the exact request id when supplied. Legacy callers without one use
  // FIFO, but concurrent integrations should always propagate requestId.
  reconcile(provider: string, booked: { requestId?: string; input: number; cacheWrite?: number; maxTokens: number }, actual: { input: number; cacheWrite?: number; output: number; burndown?: number }, now?: number): void {
    const b = this.books.get(provider); if (!b || provider !== "bedrock") return;
    const out = this.outstanding.get(provider);
    if (!out || out.length === 0) return;                       // nothing booked to settle — no-op
    const index = booked.requestId === undefined ? 0 : out.findIndex((r) => r.id === booked.requestId);
    if (index < 0) return;                                      // duplicate or never-booked completion
    const [reservation] = out.splice(index, 1);
    const burndown = actual.burndown ?? b.meters.bedrockBurndown ?? 1;
    if (![actual.input, actual.cacheWrite ?? 0, actual.output, burndown].every(validAmount))
      return; // keep the up-front reservation charged; malformed usage must never mint credit
    const finalCharge = actual.input + (actual.cacheWrite ?? 0) + actual.output * burndown;
    if (!validAmount(finalCharge)) return;
    const delta = finalCharge - reservation.charge;
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
