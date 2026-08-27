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

export interface CacheEvent {
  session: string; kind: "write" | "read" | "miss" | "ttl_expired" | "deploy" | "keep_alive";
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
  record(session: string, u: Usage, model: string, now = Date.now() / 1000): number {
    const p = this.prices[model], s = this.session(session, now);
    s.fresh += u.freshIn; s.cached += u.cachedIn;
    if (u.cacheWriteIn > 0) {
      s.writes += u.cacheWriteIn; s.readsSinceWrite = 0;
      this.events.push({ session, kind: "write", tokens: u.cacheWriteIn, costUsd: this.cost(u, model), at: now });
    } else if (u.cachedIn > 0) {
      s.readsSinceWrite++;
      this.events.push({ session, kind: "read", tokens: u.cachedIn, costUsd: this.cost(u, model), at: now,
        ttlRemainingSeconds: Math.max(0, s.ttlSeconds - (now - s.lastRequestStart)) });
    } else {
      this.events.push({ session, kind: "miss", tokens: u.freshIn, costUsd: this.cost(u, model), at: now });
    }
    return this.cost(u, model);
  }

  cost(u: Usage, model: string): number {
    const p = this.prices[model], M = 1e6;
    const w = p.cacheWriteMultiplier ?? 0, r = p.cacheReadMultiplier ?? 0;
    return (u.freshIn * p.in + u.cacheWriteIn * w * p.in + u.cachedIn * r * p.in + u.out * p.out) / M;
  }

  hitRate(session: string): number {
    const s = this.sessions.get(session);
    if (!s) return 0;
    const total = s.fresh + s.cached + s.writes;
    return total === 0 ? 0 : s.cached / total;
  }

  // Break-even read count after a write: N ≥ (w−1)/(1−r) → 1 read at 1.25/0.1, 2 at 2/0.1.
  breakEvenReads(model: string): number {
    const p = this.prices[model];
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
