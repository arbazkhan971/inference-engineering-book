// tinyengine/router.ts — an endpoint can fail without failing you (Chapter 16).
import type { CacheLedger } from "./cache-ledger.js";

export type Lane = "interactive" | "batch" | "flex";
export type GuaranteeTier = "strict" | "strict_tool" | "response_schema" | "json_object";

export interface Deployment {
  id: string; model: string; provider: string; weight?: number;
  guaranteeTier?: GuaranteeTier; lane?: Lane; tags?: string[];
}
export interface RouteRule { alias: string; deployments: Deployment[]; pinSessions?: boolean }

export type RouterError =
  | { cls: "rate_limit" } | { cls: "overloaded" } | { cls: "timeout" } | { cls: "network" }
  | { cls: "auth" } | { cls: "not_found" };

type BreakerState = "closed" | "open" | "half_open";
type Bench = { until: number; reason: string; probeInFlight: boolean };
export interface BreakerOptions {
  rateBenchSeconds: number;
  failFracPerMinute: number;
  cooldownSeconds: number;
  minSamples: number;
}

export class Breaker {
  private bench: Bench | null = null;
  private minuteWindow: { at: number; failed: boolean }[] = [];
  private readonly opts: BreakerOptions;

  constructor(options: Partial<BreakerOptions> = {}) {
    this.opts = { rateBenchSeconds: 5, failFracPerMinute: 0.5,
      cooldownSeconds: 30, minSamples: 4, ...options };
    if (!Number.isFinite(this.opts.rateBenchSeconds) || this.opts.rateBenchSeconds < 0
      || !(this.opts.failFracPerMinute >= 0 && this.opts.failFracPerMinute <= 1)
      || !Number.isFinite(this.opts.cooldownSeconds) || this.opts.cooldownSeconds < 0
      || !Number.isInteger(this.opts.minSamples) || this.opts.minSamples < 1)
      throw new Error("invalid breaker options");
  }

  report(err: RouterError, now = Date.now() / 1000, wasProbe = false): void {
    if (err.cls === "auth" || err.cls === "not_found") {
      this.bench = { until: Infinity, reason: `${err.cls}: human action required`, probeInFlight: false };
      return;
    }
    if (err.cls === "rate_limit") {
      this.bench = { until: Math.max(this.bench?.until ?? 0, now + this.opts.rateBenchSeconds),
        reason: "rate limit", probeInFlight: false };
      return;
    }
    this.record(true, now);
    const failures = this.minuteWindow.filter((e) => e.failed).length;
    // A failed HALF_OPEN probe must always start a fresh cooldown. The rolling
    // minute may have aged below minSamples while the breaker was open; leaving
    // the expired bench and its probe lease in place would wedge it half-open.
    if (wasProbe || (this.minuteWindow.length >= this.opts.minSamples
      && failures / this.minuteWindow.length > this.opts.failFracPerMinute)
    )
      this.bench = { until: now + this.opts.cooldownSeconds,
        reason: `${failures}/${this.minuteWindow.length} failures in rolling minute`, probeInFlight: false };
  }

  state(now = Date.now() / 1000): BreakerState {
    if (!this.bench) return "closed";
    if (now >= this.bench.until) return "half_open";
    return "open";
  }

  // Auth/not-found benches require human action and are intentionally never a
  // last-resort target. Finite cooldowns may be bypassed, loudly, when every
  // otherwise eligible endpoint is temporarily open.
  canBypass(): boolean { return this.bench !== null && Number.isFinite(this.bench.until); }

  // Exactly one caller leases HALF_OPEN. A second concurrent caller stays local.
  admit(isProbe: boolean, now = Date.now() / 1000): boolean {
    const state = this.state(now);
    if (state === "closed") return true;
    if (state === "open" || !isProbe || this.bench?.probeInFlight) return false;
    this.bench!.probeInFlight = true;
    return true;
  }

  success(now = Date.now() / 1000, wasProbe = false): void {
    this.record(false, now);
    // An old in-flight success must not erase a newer outage. Only the leased
    // half-open probe is allowed to close an open breaker.
    if (wasProbe) this.bench = null;
  }

  rejectProbe(now = Date.now() / 1000, reason = "probe response rejected"): void {
    if (this.bench?.probeInFlight)
      this.bench = { until: now + this.opts.cooldownSeconds, reason, probeInFlight: false };
  }

  cancelProbe(): void {
    if (this.bench?.probeInFlight) this.bench.probeInFlight = false;
  }

  private record(failed: boolean, now: number): void {
    this.minuteWindow.push({ at: now, failed });
    this.minuteWindow = this.minuteWindow.filter((e) => now - e.at < 60);
  }
}

export interface RouterResponse {
  status: number;
  body: unknown;
  stream?: Iterable<string> | AsyncIterable<string>;
  reservationId?: string;
  sentAt?: number;
  localFailure?: "quota";
}

/** A caller-contract failure that must never be retried as an endpoint outage. */
export class RouterAbortError extends Error {
  constructor(message: string) { super(message); this.name = "RouterAbortError"; }
}

export interface RouterDeps {
  cacheLedger?: CacheLedger;
  log: (msg: string, fields?: Record<string, unknown>) => void;
  validate?: (body: unknown, tier?: GuaranteeTier) => boolean | Promise<boolean>;
  fetchDeployment: (d: Deployment, body: unknown) => Promise<RouterResponse>;
  random?: () => number;
  now?: () => number;
}

export interface RouteReceipt {
  alias: string;
  deploymentId: string;
  model: string;
  provider: string;
  priceTableVersion: string;
  selectedBy: "pin" | "weighted" | "fallback" | "all_open_bypass";
  attempt: number;
  at: number;
}

export interface RoutedResponse extends RouterResponse {
  deployment: Deployment;
  receipt: RouteReceipt;
}

type Decision = { deployment: Deployment; selectedBy: RouteReceipt["selectedBy"] };

export class Router {
  private breakers = new Map<string, Breaker>();
  private pins = new Map<string, string>();
  readonly priceTableVersion: string;

  constructor(private rules: RouteRule[], private deps: RouterDeps,
              priceTableVersion = "unversioned") {
    this.priceTableVersion = priceTableVersion;
    const ids = new Set<string>();
    const aliases = new Set<string>();
    for (const rule of rules) {
      if (aliases.has(rule.alias)) throw new Error(`duplicate route alias: ${rule.alias}`);
      aliases.add(rule.alias);
      if (rule.deployments.length === 0)
        throw new Error(`route ${rule.alias} must declare at least one deployment`);
      for (const deployment of rule.deployments) {
        if (ids.has(deployment.id)) throw new Error(`duplicate deployment id: ${deployment.id}`);
        if (deployment.weight !== undefined
          && (!Number.isFinite(deployment.weight) || deployment.weight < 0))
          throw new Error(`invalid weight for deployment ${deployment.id}`);
        ids.add(deployment.id);
        this.breakers.set(deployment.id, new Breaker());
      }
      if (!rule.deployments.some((deployment) => (deployment.weight ?? 1) > 0))
        throw new Error(`route ${rule.alias} must have a positive deployment weight`);
    }
  }

  pick(alias: string, sessionId?: string, now = this.now()): Deployment | null {
    return this.decide(alias, sessionId, now)?.deployment ?? null;
  }

  async execute(alias: string, body: unknown, sessionId?: string): Promise<RoutedResponse | null> {
    const rule = this.rules.find((r) => r.alias === alias);
    if (!rule) return null;
    const first = this.decide(alias, sessionId, this.now());
    if (!first) return null;
    const ordered = [first.deployment,
      ...rule.deployments.filter((d) => d.id !== first.deployment.id)];

    for (let attempt = 0; attempt < ordered.length; attempt++) {
      const deployment = ordered[attempt];
      const breaker = this.breakers.get(deployment.id)!;
      const state = breaker.state(this.now());
      const bypass = attempt === 0 && first.selectedBy === "all_open_bypass";
      const isProbe = state === "half_open";
      if (!bypass && !breaker.admit(isProbe, this.now())) continue;
      let response: RouterResponse;
      try {
        response = await this.deps.fetchDeployment(deployment, body);
      } catch (error) {
        if (error instanceof RouterAbortError) { breaker.cancelProbe(); throw error; }
        breaker.report({ cls: "network" }, this.now(), isProbe);
        this.breakPin(alias, sessionId, deployment, this.now());
        this.log("FAILOVER", { from: deployment.id, cls: "network",
          priceTableVersion: this.priceTableVersion });
        continue;
      }
      if (response.localFailure === "quota") {
        breaker.cancelProbe();
        this.log("LOCAL QUOTA REJECTION", { deployment: deployment.id,
          action: "try another deployment without changing endpoint health" });
        continue;
      }
      if (response.status === 200) {
        if (this.deps.validate) {
          let valid: boolean;
          try { valid = await this.deps.validate(response.body, deployment.guaranteeTier); }
          catch (error) {
            breaker.rejectProbe(this.now(), "validator threw during half-open probe");
            this.log("VALIDATOR ERROR", { deployment: deployment.id,
              error: error instanceof Error ? error.message : String(error),
              action: "abort route; do not duplicate a successful endpoint call" });
            return null;
          }
          if (!valid) {
            breaker.rejectProbe(this.now(), "validator rejected half-open probe");
            this.log("GARBAGE 200", { deployment: deployment.id,
              action: "validator-retry path, not fallback" });
            return null;
          }
        }
        breaker.success(this.now(), isProbe);
        if (sessionId && rule.pinSessions) this.pins.set(this.pinKey(alias, sessionId), deployment.id);
        const receipt = this.receipt(alias, deployment,
          attempt === 0 ? first.selectedBy : "fallback", attempt + 1);
        this.log("ROUTE RECEIPT", receipt as unknown as Record<string, unknown>);
        return { ...response, deployment, receipt };
      }
      const err = this.mapStatus(response.status);
      if (!err) {
        breaker.rejectProbe(this.now(), `unclassified status ${response.status}`);
        this.log("NON-CLASSIFIED STATUS", { deployment: deployment.id,
          status: response.status });
        return null;
      }
      breaker.report(err, this.now(), isProbe);
      this.breakPin(alias, sessionId, deployment, this.now());
      this.log("FAILOVER", { from: deployment.id, cls: err.cls,
        priceTableVersion: this.priceTableVersion });
    }
    this.log("ALL DEPLOYMENTS FAILED", { alias, sessionId,
      priceTableVersion: this.priceTableVersion });
    return null;
  }

  private decide(alias: string, sessionId: string | undefined, now: number): Decision | null {
    const rule = this.rules.find((r) => r.alias === alias);
    if (!rule || rule.deployments.length === 0) return null;
    const pinKey = sessionId ? this.pinKey(alias, sessionId) : undefined;
    const pinnedId = pinKey ? this.pins.get(pinKey) : undefined;
    if (pinnedId) {
      const pinned = rule.deployments.find((d) => d.id === pinnedId);
      if (pinned && this.breakers.get(pinned.id)!.state(now) !== "open")
        return { deployment: pinned, selectedBy: "pin" };
      if (pinned) this.breakPin(alias, sessionId, pinned, now);
      else this.pins.delete(pinKey!);
    }

    const eligible = rule.deployments.filter((d) =>
      this.breakers.get(d.id)!.state(now) !== "open" && (d.weight ?? 1) > 0);
    if (eligible.length === 0) {
      const lastResort = rule.deployments.find((deployment) =>
        (deployment.weight ?? 1) > 0 && this.breakers.get(deployment.id)!.canBypass());
      if (!lastResort) {
        this.log("ALL DEPLOYMENTS REQUIRE HUMAN ACTION", { alias,
          action: "stop asking; auth/not-found breakers are not bypassable" });
        return null;
      }
      this.log("ALL DEPLOYMENTS OPEN", { alias,
        action: `serving from ${lastResort.id} during a finite cooldown — loud last resort` });
      return { deployment: lastResort, selectedBy: "all_open_bypass" };
    }
    const total = eligible.reduce((sum, d) => sum + (d.weight ?? 1), 0);
    let roll = this.random() * total;
    const chosen = eligible.find((d) => (roll -= d.weight ?? 1) < 0)
      ?? eligible[eligible.length - 1];
    return { deployment: chosen, selectedBy: "weighted" };
  }

  private breakPin(alias: string, sessionId: string | undefined,
                   deployment: Deployment, now: number): void {
    if (!sessionId) return;
    const key = this.pinKey(alias, sessionId);
    if (this.pins.get(key) !== deployment.id) return;
    this.deps.cacheLedger?.events.push({ session: sessionId, kind: "deploy",
      tokens: 0, costUsd: 0, at: now,
      note: `session pin broke off ${deployment.id}: next turn re-prices at a write` });
    this.pins.delete(key);
  }

  private pinKey(alias: string, sessionId: string): string { return `${alias}\u0000${sessionId}`; }

  private log(message: string, fields?: Record<string, unknown>): void {
    // Observability is not part of the delivery transaction. A broken sink must
    // never replay a successful model call against a fallback deployment.
    try { this.deps.log(message, fields); } catch { /* keep routing semantics intact */ }
  }

  private receipt(alias: string, deployment: Deployment,
                  selectedBy: RouteReceipt["selectedBy"], attempt: number): RouteReceipt {
    return { alias, deploymentId: deployment.id, model: deployment.model,
      provider: deployment.provider, priceTableVersion: this.priceTableVersion,
      selectedBy, attempt, at: this.now() };
  }

  private random(): number { return this.deps.random?.() ?? Math.random(); }
  private now(): number { return this.deps.now?.() ?? Date.now() / 1000; }

  private mapStatus(status: number): RouterError | null {
    if (status === 429) return { cls: "rate_limit" };
    if (status === 529 || status === 503) return { cls: "overloaded" };
    if (status === 408) return { cls: "timeout" };
    if (status === 401) return { cls: "auth" };
    if (status === 404) return { cls: "not_found" };
    if (status >= 500) return { cls: "overloaded" };
    return null;
  }
}
