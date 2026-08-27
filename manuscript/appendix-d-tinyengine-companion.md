# Appendix D. The tinyengine companion guide

> **Appendices — the reference shelf.** The chapters estimated the code; this guide delivers it. Every "Build it" in the book, assembled in one place.

The chapters said it in one sentence, and it remains the truest sentence in this appendix: **tinyengine is roughly seven hundred lines that sit between your agent loop and every model endpoint it calls.** Each module was designed in the chapter that needed it, at the size that chapter estimated, and every estimate carried a tilde. The shipped code keeps those promises:

| Module | Designed in | Estimated | Shipped | Owns |
|---|---|---|---|---|
| `tracer.ts` | Chapter 1 | ~10 | 20 | TTFT, inter-token latency, the identity |
| `stream-normalizer.ts` | Chapter 12 | ~150 | 153 | one event grammar for four provider grammars |
| `cache-ledger.ts` | Chapter 14 | ~130 | 109 | the money meter |
| `rate-scheduler.ts` | Chapter 15 | ~120 | 111 | quota ledger, bucket, jitter, wave pacer |
| `router.ts` | Chapter 16 | ~150 | 133 | routing, breakers, classified fallback |
| `session-store.ts` | Chapter 17 | ~160 | 113 | byte-exact sessions |

(The estimates were tildes, not contracts; the shipped totals run a little under because TypeScript type declarations compress what the chapters described in prose. No chapter's promise is broken — every interface this table's chapters named exists in the code, under the name the chapter used.)

## D.1 The wiring order

Chapter 18's assembly sequence, made concrete. Read it as the request does:

```mermaid
graph LR
    A[agent loop] --> S[SessionStore<br/>renders 5 layers]
    S --> Q[RateScheduler<br/>quota ledger + bucket]
    Q --> R[Router<br/>weights, pin, breakers]
    R --> H[hosted endpoint]
    R --> L[local endpoint<br/>llama.cpp / Ollama]
    H --> N[StreamNormalizer<br/>4 events]
    L --> N
    N --> T[tracer<br/>timestamps]
    N --> M[CacheLedger<br/>prices + TTL]
    M --> S
```

The composition properties from chapter 18 hold by construction: **one dial per instrument** (the scheduler never inspects stream grammar; the normalizer never prices tokens), **no uninstrumented crossings** (every arrow in the diagram passes through a metered component), and **policy in config, not code** — prices arrive as dated `PriceRow` objects, quotas as `QuotaMeters`; nothing commercial is hardcoded, so when a price sheet ages, you replace data, not logic.

## D.2 The tracer (chapters 1–2)

The seed instrument — chapter 1's ten-line promise, kept:

```typescript
export function traceCall(sentAt: number, deltasAt: number[], tokens: number): Trace {
  const first = deltasAt[0], last = deltasAt[deltasAt.length - 1];
  const itl = deltasAt.slice(1).map((t, i) => t - deltasAt[i]);
  const mean = itl.length ? itl.reduce((a, b) => a + b, 0) / itl.length : 0;
  return { ttftSeconds: first - sentAt, e2eSeconds: last - sentAt, itlSamples: itl, tokens,
    identityGapSeconds: (last - sentAt) - (first - sentAt + (tokens - 1) * mean) };
}
```

Three timestamps in, the decode-time identity out, and — the part most tracers omit — the **identity gap**: `e2e − (TTFT + (N−1) × mean ITL)`. When that residual grows, the queue grew (chapter 5) or the network did (chapter 12); when it is zero, your latency is all engine, and chapters 3 through 11 own the explanation.

## D.3 The stream normalizer (chapter 12)

Intake: raw SSE lines from any of the four grammars (`openai-chat`, `openai-responses`, `anthropic`, `gemini`). Output: the four internal events — `text_delta`, `tool_call_delta`, `usage`, `stop_reason` — each stamped with a receive timestamp, and `ttft_seconds` on the first content delta. Three rules carry the chapter's lessons:

1. **Meta-only events skip, never crash.** Lines that do not start with `data:` — comments, `event:`, pings — return nothing. The WHATWG spec allows them; the normalizer survives them.
2. **Tool arguments parse exactly once, at the finish.** The `ToolCallAccumulator` keys fragments by provider-agnostic call id (Chat `index` → id once it arrives, Responses `item_id`, Anthropic `toolu_` id from `content_block_start`, Gemini function name), concatenates blindly, and parses once when the stream ends. A fragment split mid-escape-sequence (`\"Portla` / `nd\"`) reassembles fine because no fragment is ever parsed alone. Empty arguments coerce `""` → `{}`; unparseable arguments become an `incomplete_call` marker, not an exception.
3. **Unknown finish reasons map to `unknown` and stay audible.** A provider's mid-stream `network_error` maps to `unknown` with the raw value preserved — the loop lives, the log knows.

## D.4 The cache ledger (chapter 14)

The money meter. Four-term cost from dated config, never from code:

```typescript
cost = (freshIn × P.in + cacheWriteIn × write_mult × P.in
      + cachedIn × read_mult × P.in + out × P.out) / 1e6;
```

`breakEvenReads` implements the docs' own arithmetic — N ≥ (w−1)/(1−r) — so 1.25×/0.1× pricing answers "one read" and the 1-hour 2× write answers "two." The ledger's test is the chapter's worked example, verbatim: a 100,000-token prefix on a $3-per-million model, ten turns, **$0.645 cached against $3.00 uncached**. The TTL clock starts at `requestStart` (stream duration burns the window), expiry is an event (`ttl_expired`) before it is a surprise, `keepAliveDue` fires a minimal cache-reading tick only when a session is idle, likely to resume, *and* the injected rate budget (chapter 15's gate) admits it — and `deploy()` hashes your frozen-template bytes so a one-token template change arrives as a `deploy` cache event across the fleet, which is what chapter 6 promised deploys look like.

## D.5 The rate scheduler (chapter 15)

Four parts, one per chapter section. The **quota ledger** encodes each provider's actual meter: OpenAI reserves `max(max_tokens, character-estimate)`, Anthropic splits input/output meters and exempts cache reads, Bedrock books `input + cache-write + max_tokens` up front and re-credits at completion against the burndown multiplier. The **token bucket** refills continuously — the burst-trap test in the suite proves a 60-per-minute bucket refuses a 60-in-second-one launch, which is the provider-side arithmetic chapter 15 documented. The **retry module** classifies before it retries: billing 429s fail fast, spend-cap 429s (no `Retry-After`, "regain access" wording) park the fleet instead of burning attempts all night, `Retry-After` is a floor, full jitter spreads `random(0, min(cap, base·2^attempt))`, a 3-attempt cap bounds amplification at 3×, and a ~10% retry budget rejects surplus retries locally. The **wave pacer** spaces a fanout with jittered delays and a K-of-N completion contract — the tail law's answer from chapter 15's close.

## D.6 The router (chapter 16)

The routing table is data: alias → deployments, each with weight, guarantee tier (chapter 13's ladder, so the structured-output tier is a routing input), and lane. Session pins resolve at session start and survive until a fallback breaks them — and the break is *recorded as a cache event on the ledger*, because re-pinning re-prices the next turn at a write. Breakers are error-class-aware: a 429 benches for seconds (LiteLLM's 5-second default is the anchor), 401/404 benches permanently pending a human, sustained failure benches for a cooldown — and half-open admits a probe, never full traffic. The rule chapter 16 risked its Break-it on is enforced in code: **fallbacks fire only on classified errors.** A malformed 400 never walks the chain; a garbage 200 goes to the validator path and comes back `null` with a loud log line — the failure fallbacks cannot see. When every deployment is open, the bypass serves from the first one anyway and logs `ALL DEPLOYMENTS OPEN` rather than dead-ending.

## D.7 The session store (chapter 17)

The renderer serializes the five layers in the frozen order — template header, tools, system, static context, transcript, tail — with tool order sorted at render time and object keys sorted recursively (`stableStringify`), because hash-map key order is a named cache-breaker. The test the chapter demanded is the test the suite runs: render → hash → render again → hash again → **equality**, including across a store rebuilt with the tool array deliberately reordered (the lying-serializer defense, inverted). Breakpoints hold the four-max with the leapfrog — the oldest mark rolls, never a fifth. `classifyIdle` maps idle minutes to interactive / think-time / overnight and requests the 5-minute or 1-hour entry class accordingly; keep-alive ticks route through the injected scheduler gate. `spawn()` renders shared-preamble children — template layers only, never the parent transcript — staggered behind the first child's write so siblings land on reads.

## D.8 Running and proving it

```bash
cd companion/tinyengine
npm test          # tsc -p tsconfig.json && node dist/tests/smoke.js
```

No network. Every stream is a fixture string; every price is a test constant. The suite is the chapters' Prove-it list: Portland in three fragments split mid-escape; the meta-only ping; the unknown finish reason; the usage identity; the $0.645 worked example; both break-evens; the TTL-expiry event; the budget-gated keep-alive; full-jitter bounds with `Retry-After` as floor; the burst trap; the zombie-fleet classifier; the dead-primary failover; the garbage-200 no-fallback rule; the all-open bypass; the priced pin break; the byte-exact hash; the leapfrog; the idle taxonomy; child isolation. Two `node:` built-ins are used (`crypto` for hashing, `assert` for tests) with minimal type shims in `env.d.ts`, so the project compiles with a bare `tsc` and zero npm dependencies — delete the shim if you install `@types/node`.

Chapter 18's closing rule applies to the companion too: kill each instrument in turn and read what fails silently. The tests are the staging version of that drill. The nightly cadence — golden set, cache-hit gate, invoice reconciliation — is yours to wire; the instruments are on the shelf.

---

*The companion is deliberately not a framework. It does not manage your prompts, choose your models, or hide a single decision from you. It instruments them. If you extend it, keep the three properties: one dial per instrument, no uninstrumented crossings, policy in dated config. The code will age with the provider facts it is fed; the properties are the durable part, and they are the book's.*
