// tinyengine/engine.ts — the assembled request path promised in Chapter 18.
import { CacheLedger, type PriceRow, type Usage } from "./cache-ledger.js";
import { QuotaLedger, Semaphore, type QuotaMeters } from "./rate-scheduler.js";
import { Router, RouterAbortError, type Deployment, type RouteReceipt, type RouteRule,
  type RouterResponse } from "./router.js";
import { SessionStore, type SessionEventStore, type Template } from "./session-store.js";
import { StreamNormalizer, type Event, type Provider } from "./stream-normalizer.js";
import { traceCall, type Trace } from "./tracer.js";

export interface TinyEngineTransport {
  call(deployment: Deployment, body: unknown,
       send: { markSent: () => void }): Promise<RouterResponse>;
}

export interface TinyEngineConfig {
  routes: RouteRule[];
  prices: Record<string, PriceRow>;
  quotas?: QuotaMeters[];
  transport: TinyEngineTransport;
  priceTableVersion: string;
  providerGrammars?: Record<string, Provider>;
  sessionEventStore?: SessionEventStore;
  maxInFlight?: number;
  validate?: (body: unknown, tier?: Deployment["guaranteeTier"])
    => boolean | Promise<boolean>;
  log?: (message: string, fields?: Record<string, unknown>) => void;
  now?: () => number;
  random?: () => number;
}

export interface EngineCall {
  alias: string;
  sessionId: string;
  template: Template;
  content: string;
  body?: Record<string, unknown>;
  maxTokens: number;
  estimatedPromptTokens: number;
  cacheReadTokens?: number;
  cacheWriteTokens?: number;
  ttlSeconds?: number;
}

export interface EngineReceipt {
  requestId: string;
  route: RouteReceipt;
  promptHash: string;
  priceTableVersion: string;
  usage: Usage;
  costUsd: number;
  quotaOutputAccepted: boolean;
}

export interface EngineResult {
  text: string;
  events: Event[];
  trace?: Trace;
  receipt: EngineReceipt;
}

export class TinyEngineCallError extends Error {
  constructor(message: string) { super(message); this.name = "TinyEngineCallError"; }
}

type WireBody = Record<string, unknown> & {
  __tinyengine: { requestId: string; maxTokens: number;
    estimatedPromptTokens: number; cacheReadTokens: number;
    cacheWriteTokens: number };
};

export class TinyEngine {
  readonly cacheLedger: CacheLedger;
  readonly quotaLedger = new QuotaLedger();
  readonly sessions: SessionStore;
  readonly router: Router;
  private readonly semaphore: Semaphore;
  private readonly sessionTails = new Map<string, Promise<void>>();
  private requestSequence = 0;

  constructor(private config: TinyEngineConfig) {
    this.cacheLedger = new CacheLedger(config.prices);
    this.sessions = new SessionStore(this.cacheLedger, undefined, config.sessionEventStore);
    this.semaphore = new Semaphore(config.maxInFlight ?? 32);
    for (const quota of config.quotas ?? []) this.quotaLedger.configure(quota, this.now());
    this.router = new Router(config.routes, {
      cacheLedger: this.cacheLedger,
      log: config.log ?? (() => undefined),
      validate: config.validate,
      random: config.random,
      now: () => this.now(),
      fetchDeployment: async (deployment, rawBody) => {
        const body = rawBody as WireBody;
        const meta = body.__tinyengine;
        const reservationId = `${meta.requestId}:${deployment.id}`;
        const reservation = this.quotaLedger.reserveRequest(deployment.provider, {
          requestId: reservationId,
          maxTokens: meta.maxTokens,
          estimatedPromptTokens: meta.estimatedPromptTokens,
          cacheReadTokens: meta.cacheReadTokens,
          cacheWriteTokens: meta.cacheWriteTokens,
        }, this.now());
        if (!reservation.ok) return { status: 429, localFailure: "quota",
          body: { error: "local quota exhausted before wire send" } };
        let sentAt: number | undefined;
        let marks = 0;
        const response = await config.transport.call(deployment, rawBody, {
          markSent: () => {
            marks++;
            if (marks !== 1)
              throw new RouterAbortError(`transport for ${deployment.id} called markSent more than once`);
            sentAt = this.now();
            if (!Number.isFinite(sentAt))
              throw new RouterAbortError(`transport for ${deployment.id} produced a non-finite send timestamp`);
          },
        });
        if (marks !== 1 || sentAt === undefined)
          throw new RouterAbortError(
            `transport for ${deployment.id} returned without calling markSent immediately before wire I/O`,
          );
        if (response.status === 200 && !response.stream)
          throw new RouterAbortError(
            `transport for ${deployment.id} returned HTTP 200 without a response stream`,
          );
        return { ...response, reservationId: reservation.reservationId, sentAt };
      },
    }, config.priceTableVersion);
  }

  async call(request: EngineCall): Promise<EngineResult> {
    return this.withSessionTurn(request.sessionId, () => this.semaphore.withPermit(async () => {
      if (!this.sessions.has(request.sessionId)) {
        this.sessions.create(request.template, request.sessionId, this.now());
      }
      this.sessions.append(request.sessionId, "user", request.content, this.now());
      const rendered = this.sessions.render(request.sessionId, "");
      this.cacheLedger.requestStart(request.sessionId, request.ttlSeconds ?? 300, this.now());
      const requestId = `req-${++this.requestSequence}`;
      const body: WireBody = { ...(request.body ?? {}), prompt: rendered.prompt,
        __tinyengine: { requestId, maxTokens: request.maxTokens,
          estimatedPromptTokens: request.estimatedPromptTokens,
          cacheReadTokens: request.cacheReadTokens ?? 0,
          cacheWriteTokens: request.cacheWriteTokens ?? 0 } };
      let response;
      try { response = await this.router.execute(request.alias, body, request.sessionId); }
      catch (error) {
        if (error instanceof RouterAbortError) throw new TinyEngineCallError(error.message);
        throw error;
      }
      if (!response) throw new TinyEngineCallError(`no valid deployment response for ${request.alias}`);
      if (!response.stream) throw new TinyEngineCallError(
        `deployment ${response.deployment.id} returned no stream`);
      if (!Number.isFinite(response.sentAt)) throw new TinyEngineCallError(
        `deployment ${response.deployment.id} returned without a valid wire-send timestamp`);
      const sentAt = response.sentAt as number;

      const normalizer = new StreamNormalizer(
        this.grammarFor(response.deployment.provider), { sentAt, now: () => this.now() });
      const events: Event[] = [];
      for await (const line of response.stream) events.push(...normalizer.ingest(line));
      events.push(...normalizer.finish());

      const usage = events.filter(
        (event): event is Extract<Event, { type: "usage" }> => event.type === "usage",
      ).reduce<Usage>((sum, event) => ({
          freshIn: sum.freshIn + event.freshIn,
          cachedIn: sum.cachedIn + event.cachedIn,
          cacheWriteIn: sum.cacheWriteIn + event.cacheWriteIn,
          out: sum.out + event.out,
        }), { freshIn: 0, cachedIn: 0, cacheWriteIn: 0, out: 0 });
      const costUsd = this.cacheLedger.recordSafe(request.sessionId, usage,
        response.deployment.model, this.now());
      const quotaOutputAccepted = this.quotaLedger.recordOutput(
        response.deployment.provider, usage.out, this.now());
      if (response.deployment.provider === "bedrock" && response.reservationId) {
        this.quotaLedger.reconcile("bedrock", { requestId: response.reservationId,
          input: request.estimatedPromptTokens,
          cacheWrite: request.cacheWriteTokens,
          maxTokens: request.maxTokens }, { input: usage.freshIn,
          cacheWrite: usage.cacheWriteIn, output: usage.out }, this.now());
      }

      const textEvents = events.filter(
        (event): event is Extract<Event, { type: "text_delta" }> => event.type === "text_delta",
      );
      const text = textEvents.map((event) => event.text).join("");
      this.sessions.append(request.sessionId, "assistant", text, this.now());
      const deltasAt = events.filter((event) =>
        event.type === "text_delta" || event.type === "tool_call_delta",
      ).map((event) => event.ts);
      const trace = deltasAt.length > 0
        ? traceCall(sentAt, deltasAt, Math.max(usage.out, deltasAt.length)) : undefined;
      return { text, events, trace, receipt: { requestId, route: response.receipt,
        promptHash: rendered.hash, priceTableVersion: this.config.priceTableVersion,
        usage, costUsd, quotaOutputAccepted } };
    }));
  }

  private async withSessionTurn<T>(sessionId: string, fn: () => Promise<T>): Promise<T> {
    const previous = this.sessionTails.get(sessionId) ?? Promise.resolve();
    let release!: () => void;
    const turn = new Promise<void>((resolve) => { release = resolve; });
    const tail = previous.then(() => turn);
    this.sessionTails.set(sessionId, tail);
    await previous;
    try { return await fn(); }
    finally {
      release();
      if (this.sessionTails.get(sessionId) === tail) this.sessionTails.delete(sessionId);
    }
  }

  private grammarFor(provider: string): Provider {
    const configured = this.config.providerGrammars?.[provider];
    if (configured) return configured;
    if (provider === "anthropic") return "anthropic";
    if (provider === "gemini") return "gemini";
    return "openai-chat";
  }

  private now(): number { return this.config.now?.() ?? Date.now() / 1000; }
}
