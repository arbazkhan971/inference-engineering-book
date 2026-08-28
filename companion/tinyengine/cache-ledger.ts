// tinyengine/cache-ledger.ts — the money meter (Chapter 14).
// Four-term cost: fresh×in + writes×write_mult×in + reads×read_mult×in + out×out. Prices live in config, never code.
import { createHash } from "node:crypto";

export interface PriceRow {           // USD per 1M tokens; dated when loaded — a snapshot, not a fact
  date: string; in: number; out: number;
  cacheWriteMultiplier?: number;      // e.g. 1.25 (Anthropic 5m / OpenAI 5.6+), 2 (Anthropic 1h)
  cacheReadMultiplier?: number;       // e.g. 0.1 on most, ~0.03 on DeepSeek-style hit pricing
}
export interface Usage { freshIn: number; cachedIn: number; cacheWriteIn: number; out: number }

export interface RateBudgetGate { tryAcquire(n: number): boolean }   // Chapter 15's interface (injected)

// A model missing from the price map is ch. 16's named suspect ("a bucket the meter does not
// know: new model, renamed alias") — route it, don't let it kill the meter loop mid-stream (gate-6 C1).
export class UnknownModelError extends Error {
  constructor(public model: string) { super(`unknown model in the price map: ${model}`); this.name = "UnknownModelError"; }
}

export interface CacheEvent {
  session: string; kind: "write" | "read" | "miss" | "ttl_expired" | "deploy" | "keep_alive" | "mispriced";
  tokens: number; costUsd: number; ttlRemainingSeconds?: number; note?: string; at: number;
}

interface Session {
  fresh: number; cached: number; writes: number; readsSinceWrite: number;
  lastRequestStart: number; lastStreamSeconds: number; ttlSeconds: number;
}

export class CacheLedger {
  private sessions = new Map<string, Session>();
  events: CacheEvent[] = [];

  constructor(private prices: Record<string, PriceRow>, private rateBudget?: RateBudgetGate) {}

  priceRow(model: string): PriceRow { return this.prices[model]; }

  // Called at request START — the TTL clock starts here (ch. 14: stream time burns the window).
  requestStart(session: string, ttlSeconds = 300, now = Date.now() / 1000): void {
    const s = this.session(session, now);
    if (s.lastRequestStart > 0 && now - s.lastRequestStart > s.ttlSeconds + s.lastStreamSeconds)
      this.events.push({ session, kind: "ttl_expired", tokens: 0, costUsd: 0, at: now, note: "next turn re-prices at full write" });
    s.lastRequestStart = now; s.ttlSeconds = ttlSeconds;
  }

  // Feed one usage event (Chapter 12's normalizer emits them). Returns the four-term cost of the turn.
  // Unknown model: named error BEFORE any session mutation — the caller routes it (price 0? page?) —
  // never a raw TypeError after half the row is booked (gate-6 C1).
  // The meter is the trust boundary (gate-6 C3): usage fields clamp non-negative (and non-finite
  // to 0) here, with a note on the event — an upstream clamp bug becomes visible, never negative money.
  record(session: string, u: Usage, model: string, now = Date.now() / 1000): number {
    const p = this.prices[model];
    if (!p) throw new UnknownModelError(model);
    const nn = (x: number) => (Number.isFinite(x) ? Math.max(0, x) : 0);
    const c: Usage = { freshIn: nn(u.freshIn), cachedIn: nn(u.cachedIn), cacheWriteIn: nn(u.cacheWriteIn), out: nn(u.out) };
    const clamped = (c.freshIn !== u.freshIn || c.cachedIn !== u.cachedIn
      || c.cacheWriteIn !== u.cacheWriteIn || c.out !== u.out);
    const note = clamped ? "usage clamped non-negative at the meter (upstream corruption?)" : undefined;
    const s = this.session(session, now);
    s.fresh += c.freshIn; s.cached += c.cachedIn;
    // A turn can both read cached bytes and write new ones (gate-6 C4): both events are
    // logged. Costs split so a turn's events always sum to its full cost — read-only and
    // write-only turns keep their single full-cost event; a dual turn splits it (read
    // carries its own term, write carries the rest) — so a replay of the event stream
    // never understates reads and never double-counts the turn.
    const readTerm = c.cachedIn > 0 ? (c.cachedIn * (p.cacheReadMultiplier ?? 0) * p.in) / 1e6 : 0;
    const full = this.cost(c, model);
    if (c.cachedIn > 0) {
      s.readsSinceWrite++;
      this.events.push({ session, kind: "read", tokens: c.cachedIn, costUsd: c.cacheWriteIn > 0 ? readTerm : full, at: now,
        ttlRemainingSeconds: Math.max(0, s.ttlSeconds - (now - s.lastRequestStart)),
        note: c.cacheWriteIn > 0 ? "read + write in one turn" : note });
    }
    if (c.cacheWriteIn > 0) {
      s.writes += c.cacheWriteIn; s.readsSinceWrite = 0; // the write owns the turn's tail: reads-after count from zero
      this.events.push({ session, kind: "write", tokens: c.cacheWriteIn, costUsd: full - (c.cachedIn > 0 ? readTerm : 0), at: now, note });
    }
    if (c.cachedIn === 0 && c.cacheWriteIn === 0)
      this.events.push({ session, kind: "miss", tokens: c.freshIn, costUsd: full, at: now, note });
    return full;
  }

  cost(u: Usage, model: string): number {
    const p = this.prices[model];
    if (!p) throw new UnknownModelError(model);
    const M = 1e6;
    const w = p.cacheWriteMultiplier ?? 0, r = p.cacheReadMultiplier ?? 0;
    return (u.freshIn * p.in + u.cacheWriteIn * w * p.in + u.cachedIn * r * p.in + u.out * p.out) / M;
  }

  // The continue-path (attack2 M1): record() keeps the fail-fast contract for callers that
  // want a named error; recordSafe() is what a meter LOOP calls — an unknown model (a renamed
  // alias, a new model the price map has not dated yet) prices 0, emits a loud mispriced
  // event, and lets the loop keep metering every other turn. The meter never dies mid-stream,
  // and the mispricing is visible in the event log the nightly instruments already read.
  recordSafe(session: string, u: Usage, model: string, now = Date.now() / 1000): number {
    try { return this.record(session, u, model, now); }
    catch (e) {
      if (!(e instanceof UnknownModelError)) throw e;
      const t = [u.freshIn, u.cachedIn, u.cacheWriteIn, u.out]
        .reduce((a, x) => a + (Number.isFinite(x) ? Math.max(0, x) : 0), 0);
      this.events.push({ session, kind: "mispriced", tokens: t, costUsd: 0, at: now,
        note: `unknown model ${e.model}: priced 0 — add it to the price map (chapter 16's renamed-alias suspect); metering continued` });
      return 0;
    }
  }

  // The book's formula, one place (ch. 14): cached ÷ (cached + fresh). Writes are priced as
  // re-admissions but excluded from the rate — cache-hit-gate computes the same ratio, and a
  // dashboard and a gate must never disagree on the same rows (gate-6 C2/C2b).
  hitRate(session: string): number {
    const s = this.sessions.get(session);
    if (!s) return 0;
    const total = s.fresh + s.cached;
    return total === 0 ? 0 : s.cached / total;
  }

  // Break-even read count after a write: N ≥ (w−1)/(1−r) → 1 read at 1.25/0.1, 2 at 2/0.1.
  breakEvenReads(model: string): number {
    const p = this.prices[model];
    if (!p) throw new UnknownModelError(model);
    return Math.ceil(((p.cacheWriteMultiplier ?? 1) - 1) / (1 - (p.cacheReadMultiplier ?? 0)));
  }

  ttlRemaining(session: string, now = Date.now() / 1000): number {
    const s = this.sessions.get(session);
    return s ? Math.max(0, s.ttlSeconds - (now - s.lastRequestStart)) : 0;
  }

  // Keep-alive: fire a minimal cache-reading request when a session is idle inside the TTL window
  // AND likely to resume — but only if the rate budget (ch. 15) admits the request.
  keepAliveDue(session: string, likelyResume: boolean, now = Date.now() / 1000): boolean {
    const s = this.sessions.get(session);
    if (!s || !likelyResume) return false;
    const left = this.ttlRemaining(session, now);
    if (left <= 0 || left > s.ttlSeconds / 2 || s.cached === 0) return false;
    if (this.rateBudget && !this.rateBudget.tryAcquire(1)) return false;
    this.events.push({ session, kind: "keep_alive", tokens: 0, costUsd: 0, at: now, note: "read refreshes the TTL clock" });
    return true;
  }

  // Deploy hook: hash the frozen-prefix template bytes; a change is a cache event, not a surprise.
  deploy(templateId: string, bytes: string | Uint8Array, now = Date.now() / 1000): string {
    const h = createHash("sha256").update(bytes).digest("hex").slice(0, 16);
    if (this.lastTemplate.get(templateId) && this.lastTemplate.get(templateId) !== h)
      this.events.push({ session: "*", kind: "deploy", tokens: 0, costUsd: 0, at: now,
        note: `template ${templateId} changed ${this.lastTemplate.get(templateId)} → ${h}: expect fleet-wide writes` });
    this.lastTemplate.set(templateId, h);
    return h;
  }
  private lastTemplate = new Map<string, string>();

  private session(id: string, now: number): Session {
    let s = this.sessions.get(id);
    if (!s) { s = { fresh: 0, cached: 0, writes: 0, readsSinceWrite: 0, lastRequestStart: 0, lastStreamSeconds: 0, ttlSeconds: 300 }; this.sessions.set(id, s); }
    return s;
  }
}
