// tinyengine/router.ts — an endpoint can fail without failing you (Chapter 16).
import type { CacheLedger } from "./cache-ledger.js";

export type Lane = "interactive" | "batch" | "flex";
export type GuaranteeTier = "strict" | "strict_tool" | "response_schema" | "json_object"; // ch. 13's ladder

export interface Deployment {
  id: string; model: string; provider: string; weight?: number;
  guaranteeTier?: GuaranteeTier; lane?: Lane; tags?: string[];
}
export interface RouteRule { alias: string; deployments: Deployment[]; pinSessions?: boolean }

// Error classes the breaker understands. Malformed requests (400) and garbage 200s are NOT here:
// they go to the validator path — fallbacks fire only on classified errors (ch. 16's rule).
export type RouterError =
  | { cls: "rate_limit" } | { cls: "overloaded" } | { cls: "timeout" } | { cls: "network" }
  | { cls: "auth" } | { cls: "not_found" };

type Bench = { until: number; reason: string; probes: number };

export class Breaker {
  private bench: Bench | null = null;
  private minuteWindow: { at: number; failed: boolean }[] = [];
  constructor(private opts = { rateBenchSeconds: 5, failFracPerMinute: 0.5, cooldownSeconds: 30 }) {}

  // Error-class-aware trips (ch. 16): 429 → short bench (LiteLLM anchors 5 s); 401/404 → permanent;
  // >50% of a minute failing → cooldown bench. State machine: CLOSED → OPEN → HALF_OPEN (probe).
  report(err: RouterError, now = Date.now() / 1000): void {
    if (err.cls === "auth" || err.cls === "not_found") this.bench = { until: Infinity, reason: `${err.cls}: human action required`, probes: 0 };
    else if (err.cls === "rate_limit") this.bench = { until: Math.max(this.bench?.until ?? 0, now + this.opts.rateBenchSeconds), reason: "rate limit", probes: 0 };
    else {
      this.minuteWindow.push({ at: now, failed: true });
      this.minuteWindow = this.minuteWindow.filter((e) => now - e.at < 60);
      if (this.minuteWindow.length >= 4 && this.minuteWindow.every((e) => e.failed))
        this.bench = { until: now + this.opts.cooldownSeconds, reason: ">50% of minute failing", probes: 0 };
    }
  }
  state(now = Date.now() / 1000): "closed" | "open" | "half_open" {
    if (!this.bench) return "closed";
    if (now >= this.bench.until) return "half_open";
    return "open";
  }
  // HALF_OPEN admits a probe, not full traffic.
  admit(isProbe: boolean, now = Date.now() / 1000): boolean {
    const st = this.state(now);
    if (st === "closed") return true;
    if (st === "half_open") return isProbe;
    return false;
  }
  success(now = Date.now() / 1000): void { this.minuteWindow.push({ at: now, failed: false }); this.bench = null; }
}

export interface RouterDeps {
  cacheLedger?: CacheLedger;                    // fallback breaks recorded as cache events
  log: (msg: string, fields?: Record<string, unknown>) => void;
  validate?: (body: unknown, tier?: GuaranteeTier) => boolean | Promise<boolean>; // ch. 13's validator path
  fetchDeployment: (d: Deployment, body: unknown) => Promise<{ status: number; body: unknown }>;
}

export class Router {
  private breakers = new Map<string, Breaker>();
  private pins = new Map<string, string>();     // session → deployment id, resolved at session start
  priceTableVersion: string;                    // travels on every meter event (drift is visible)

  constructor(private rules: RouteRule[], private deps: RouterDeps, priceTableVersion = "unversioned") {
    this.priceTableVersion = priceTableVersion;
    for (const r of rules) for (const d of r.deployments) this.breakers.set(d.id, new Breaker());
  }

  // Alias → deployment. Weighted pick among healthy; session pin survives until a fallback breaks it.
  pick(alias: string, sessionId?: string, now = Date.now() / 1000): Deployment | null {
    const rule = this.rules.find((r) => r.alias === alias);
    if (!rule) return null;
    if (sessionId && this.pins.has(sessionId)) {
      const pinned = rule.deployments.find((d) => d.id === this.pins.get(sessionId));
      if (pinned && this.breakers.get(pinned.id)!.state(now) !== "open") return pinned;
      if (pinned) { // the pin broke — record it as the cache event it is, then fall through
        this.deps.cacheLedger?.events.push({ session: sessionId, kind: "deploy", tokens: 0, costUsd: 0, at: now,
          note: `session pin broke off ${pinned.id}: next turn re-prices at a write` });
        this.pins.delete(sessionId);
      }
    }
    const healthy = rule.deployments.filter((d) => this.breakers.get(d.id)!.state(now) === "closed");
    if (healthy.length === 0) {
      this.deps.log("ALL DEPLOYMENTS OPEN", { alias, action: "serving from best benched deployment — loud by design" });
      return rule.deployments[0] ?? null;      // the bypass serves something rather than dead-end
    }
    const total = healthy.reduce((a, d) => a + (d.weight ?? 1), 0);
    let roll = Math.random() * total;
    const chosen = healthy.find((d) => (roll -= d.weight ?? 1) <= 0) ?? healthy[0];
    if (sessionId && rule.pinSessions) this.pins.set(sessionId, chosen.id);
    return chosen;
  }

  // Execute with fallback: walk the chain ONLY on classified errors. A malformed 400 or a garbage 200
  // goes to the validator path — those failures fallbacks cannot see.
  async execute(alias: string, body: unknown, sessionId?: string): Promise<{ deployment: Deployment; status: number; body: unknown } | null> {
    const rule = this.rules.find((r) => r.alias === alias);
    if (!rule) return null;
    for (const d of rule.deployments) {
      const brk = this.breakers.get(d.id)!;
      const firstTry = d === rule.deployments[0];
      if (!brk.admit(!firstTry)) continue;
      try {
        const res = await this.deps.fetchDeployment(d, body);
        if (res.status === 200) {
          if (this.deps.validate && !await this.deps.validate(res.body, d.guaranteeTier)) {
            this.deps.log("GARBAGE 200", { deployment: d.id, action: "validator-retry path, not fallback" });
            return null; // NOT a fallback condition — ch. 16's classified-error rule
          }
          brk.success(); return { deployment: d, status: res.status, body: res.body };
        }
        const err = this.mapStatus(res.status);
        if (!err) { this.deps.log("NON-CLASSIFIED STATUS", { deployment: d.id, status: res.status }); return null; }
        brk.report(err); this.deps.log("FAILOVER", { from: d.id, cls: err.cls });
      } catch (e) {
        brk.report({ cls: "network" }); this.deps.log("FAILOVER", { from: d.id, cls: "network" });
      }
    }
    this.deps.log("ALL DEPLOYMENTS FAILED", { alias, sessionId });
    return null;
  }

  private mapStatus(status: number): RouterError | null {
    if (status === 429) return { cls: "rate_limit" };
    if (status === 529 || status === 503) return { cls: "overloaded" };
    if (status === 408) return { cls: "timeout" };
    if (status === 401) return { cls: "auth" };
    if (status === 404) return { cls: "not_found" };
    if (status >= 500) return { cls: "overloaded" };
    return null; // 400 malformed etc.: not classified, not fallback-worthy
  }
}
