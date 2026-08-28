// Offline smoke tests — every case is a Break-it/Prove-it item from the chapters.
// Run: npm test  (tsc && node dist/tests/smoke.js). No network; every stream is a fixture string.
import assert from "node:assert/strict";
import { traceCall } from "../tracer.js";
import { StreamNormalizer, type Event } from "../stream-normalizer.js";
import { CacheLedger } from "../cache-ledger.js";
import { classify, backoffDelayMs, TokenBucket, QuotaLedger, RetryPolicy, kOfN } from "../rate-scheduler.js";
import { Router, type RouteRule } from "../router.js";
import { SessionStore, classifyIdle, ttlRequestFor } from "../session-store.js";

const usageOf = (es: Event[]) => { const e = es.find((e) => e.type === "usage"); if (!e || e.type !== "usage") throw new Error("no usage event"); return e; };
const toolOf = (es: Event[], id: string) => { const e = es.find((e) => e.type === "tool_call" && e.callId === id); if (!e || e.type !== "tool_call") throw new Error(`no tool_call ${id}`); return e; };
const stopOf = (es: Event[]) => { const e = es.find((e) => e.type === "stop_reason"); if (!e || e.type !== "stop_reason") throw new Error("no stop_reason event"); return e; };

// ---- Chapter 1: the tracer and the identity ------------------------------------------
{
  const sent = 10.0, deltas = [10.4, 10.425, 10.45, 10.475]; // TTFT 0.4 s, ITL 25 ms × 3
  const t = traceCall(sent, deltas, 4);
  assert.ok(Math.abs(t.ttftSeconds - 0.4) < 1e-9);
  assert.ok(Math.abs(t.e2eSeconds - 0.475) < 1e-9);
  assert.ok(Math.abs(t.identityGapSeconds) < 1e-9, "identity holds with zero jitter");
}

// ---- Chapter 12: the normalizer -------------------------------------------------------
{
  const n = new StreamNormalizer("openai-chat");
  // Meta-only line and sentinel: skipped without crashing (spec-legal meta events).
  assert.deepEqual(n.ingest(": keep-alive"), []);
  assert.deepEqual(n.ingest("event: ping"), []);
  assert.deepEqual(n.ingest("data: [DONE]"), []);
  // Text delta with ttftSeconds stamped on the first content delta only.
  const first = n.ingest(`data: ${JSON.stringify({ choices: [{ delta: { role: "assistant", content: "Hel" } }] })}`);
  assert.equal(first[0].type, "text_delta");
  assert.ok("ttftSeconds" in first[0]);
  const second = n.ingest(`data: ${JSON.stringify({ choices: [{ delta: { content: "lo" } }] })}`);
  assert.ok(!("ttftSeconds" in second[0]));
  // Usage identity + reasoning tokens, chat grammar.
  const u = usageOf(n.ingest(`data: ${JSON.stringify({ usage: { prompt_tokens: 1000,
    prompt_tokens_details: { cached_tokens: 600 }, completion_tokens: 40,
    completion_tokens_details: { reasoning_tokens: 12 } } })}`));
  assert.equal(u.freshIn, 400);
  assert.equal(u.cachedIn, 600);
  assert.equal(u.reasoning, 12);
  assert.equal(u.freshIn + u.cachedIn, 1000); // the identity: fresh + cached = reported prompt tokens
  assert.ok(u.cachedIn <= 1000);             // cache reads can never exceed input
}
{
  // Portland, in three fragments, split mid-escape-sequence (ch. 12's worked example).
  // Target args JSON: {"greeting": "They call it \"Portland\""} — the fragments are not individually parseable.
  const n = new StreamNormalizer("openai-chat");
  const frag = (s: string, i: number) => `data: ${JSON.stringify({ choices: [{ delta: { tool_calls: [
    { index: 0, id: i === 0 ? "call_1" : undefined, function: { name: i === 0 ? "get_city" : undefined, arguments: s } } ] } }] })}`;
  n.ingest(frag(`{"greeting": "They call it `, 0));
  n.ingest(frag(`\\"Portla`, 1));
  n.ingest(frag(`nd\\""}`, 2));
  const call = toolOf(n.finish(), "call_1"); // parse exactly once, at the finish
  assert.deepEqual(call.args, { greeting: 'They call it "Portland"' });
}
{
  // "" → {} coercion; unknown finish reason mapped to unknown, loop alive (GLM's network_error).
  const n = new StreamNormalizer("openai-chat");
  n.ingest(`data: ${JSON.stringify({ choices: [{ delta: { tool_calls: [{ index: 0, id: "c", function: { name: "ping", arguments: "" } }] } }] })}`);
  const stopChunk = n.ingest(`data: ${JSON.stringify({ choices: [{ delta: {}, finish_reason: "network_error" }] })}`);
  const out = n.finish();
  const call = toolOf(out, "c");
  assert.equal(call.name, "ping");
  assert.deepEqual(call.args, {}); // "" → {} coercion
  const stop = stopOf(stopChunk);
  assert.equal(stop.value, "unknown");
  assert.equal(stop.raw, "network_error");
}
{
  // Anthropic grammar: ordered event log, toolu_ id keying, stop_reason in message_delta.
  const n = new StreamNormalizer("anthropic");
  assert.deepEqual(n.ingest("event: ping"), []); // pings are legal anywhere in the stream
  n.ingest(`data: ${JSON.stringify({ type: "message_start", message: { usage: { input_tokens: 90, cache_read_input_tokens: 800, cache_creation_input_tokens: 110 } } })}`);
  n.ingest(`data: ${JSON.stringify({ type: "content_block_start", content_block: { type: "tool_use", id: "toolu_01", name: "extract" } })}`);
  n.ingest(`data: ${JSON.stringify({ type: "content_block_delta", delta: { type: "input_json_delta", partial_json: '{"a":' } })}`);
  n.ingest(`data: ${JSON.stringify({ type: "content_block_delta", delta: { type: "input_json_delta", partial_json: "1}" } })}`);
  const deltaChunk = n.ingest(`data: ${JSON.stringify({ type: "message_delta", delta: { stop_reason: "tool_use" }, usage: { output_tokens: 7 } })}`);
  const out = n.finish();
  const call = toolOf(out, "toolu_01");
  assert.equal(call.name, "extract");
  assert.deepEqual(call.args, { a: 1 });
  const stop = stopOf(deltaChunk);
  assert.equal(stop.value, "tool_call");
}
{
  // Gemini grammar: args arrive as objects; finishReason rides the last chunk; usage from usageMetadata.
  const n = new StreamNormalizer("gemini");
  n.ingest(`data: ${JSON.stringify({ candidates: [{ content: { parts: [{ functionCall: { name: "get_weather", args: { city: "Portland" } } }] } }] })}`);
  const out = n.ingest(`data: ${JSON.stringify({ candidates: [{ finishReason: "STOP" }],
    usageMetadata: { promptTokenCount: 50, promptTokensDetails: { cachedContentTokenCount: 30 }, candidatesTokenCount: 5, thoughtsTokenCount: 2 } })}`).concat(n.finish());
  const call = toolOf(out, "step:get_weather");
  assert.deepEqual(call.args, { city: "Portland" });
  const stop = stopOf(out), u = usageOf(out);
  assert.equal(stop.value, "stop");
  assert.ok(u.freshIn === 20 && u.cachedIn === 30 && u.out === 5 && u.reasoning === 2);
}

// ---- Chapter 14: the cache ledger -----------------------------------------------------
const PRICES = {
  "sonnet-4.6": { date: "2026-08-27", in: 3, out: 15, cacheWriteMultiplier: 1.25, cacheReadMultiplier: 0.1 },
  "opus-5-1h": { date: "2026-08-27", in: 5, out: 25, cacheWriteMultiplier: 2, cacheReadMultiplier: 0.1 },
};
{
  // The 10-turn worked example: $0.645 cached vs $3.00 uncached ≈ 79% (ch. 14).
  const led = new CacheLedger(PRICES);
  const S = "s1", M = "sonnet-4.6";
  led.requestStart(S);
  const t1 = led.record(S, { freshIn: 0, cachedIn: 0, cacheWriteIn: 100_000, out: 0 }, M);
  const readTurn = led.record(S, { freshIn: 0, cachedIn: 100_000, cacheWriteIn: 0, out: 0 }, M);
  const total = t1 + 9 * readTurn;
  assert.ok(Math.abs(total - 0.645) < 1e-9, `worked example $0.645, got ${total}`);
  assert.ok(total < 0.25 * 3.0, "~79% saving vs $3.00 uncached");
  assert.equal(led.breakEvenReads(M), 1);           // 1.25 write pays back after one read
  assert.equal(led.breakEvenReads("opus-5-1h"), 2); // 2× write pays back after two (docs' own arithmetic)
}
{
  // TTL expiry is a ledger event; keep-alive respects the rate budget.
  let budget = 0;
  const led = new CacheLedger(PRICES, { tryAcquire: () => (budget > 0 ? (budget--, true) : false) });
  led.requestStart("s", 300, 0);
  led.record("s", { freshIn: 0, cachedIn: 0, cacheWriteIn: 10_000, out: 0 }, "sonnet-4.6", 0);
  led.record("s", { freshIn: 10, cachedIn: 10_000, cacheWriteIn: 0, out: 0 }, "sonnet-4.6", 10); // a hit exists
  assert.ok(!led.keepAliveDue("s", true, 100)); // too early: more than half the window remains
  budget = 1;
  assert.ok(led.keepAliveDue("s", true, 200));  // idle, likely resume, budget admits: fire the tick
  assert.ok(!led.keepAliveDue("s", true, 205)); // budget exhausted — the gate held
  led.requestStart("s", 300, 200);              // the tick resets the clock
  led.requestStart("s", 300, 1000);             // resume 800 s later: past TTL + stream time
  assert.ok(led.events.some((e) => e.kind === "ttl_expired"));
}
{
  // Deploy hook: one changed template token becomes a visible cache event.
  const led = new CacheLedger(PRICES);
  const tpl = (v: string) => `You are a triage agent. Rules v${v}.`;
  led.deploy("sys", tpl("1"));
  assert.equal(led.deploy("sys", tpl("1")).length, 16); // stable hash
  led.deploy("sys", tpl("2"));
  assert.ok(led.events.some((e) => e.kind === "deploy" && /changed/.test(e.note ?? "")));
}

// ---- Chapter 15: the scheduler ---------------------------------------------------------
{
  assert.deepEqual(classify(429, {}, "Error: insufficient_quota"), { kind: "billing", retryable: false });
  assert.equal(classify(429, { "retry-after": "7" }, "rate limit").kind, "rate");
  const spendCap = classify(429, {}, "usage cap; you will regain access");
  assert.equal(spendCap.kind, "spend_cap"); // the zombie-fleet classifier parks instead of retrying
  assert.equal(classify(529, {}, "").kind, "overloaded");
  assert.equal(classify(500, {}, "").kind, "transient");
  for (let a = 0; a < 30; a++) {
    const d = backoffDelayMs(a);                       // full jitter: uniform in [0, min(cap, base·2^a))
    assert.ok(d >= 0 && d <= Math.min(20000, 1000 * 2 ** a) + 1e-9);
    assert.ok(backoffDelayMs(0, 1000, 20000, "8") >= 8000); // Retry-After is a floor
  }
  const b = new TokenBucket(60, 1, 0);                 // 60/min, continuous refill
  assert.equal(b.tryAcquire(59, 0), true);
  assert.equal(b.tryAcquire(2, 0), false);             // the burst trap: 60 in second one 429s
  assert.equal(b.tryAcquire(2, 1.1), true);            // refilled while waiting
  // The per-provider quota ledger — chapter 15's Checkpoint 2, replayed:
  // Bedrock books 2,000 input + 500 cache-write + 16,000 reservation = 18,500 at request start.
  const ledger = new QuotaLedger();
  ledger.configure({ provider: "bedrock", tpm: 20000 }, 0);
  assert.equal(ledger.reserve("bedrock", { maxTokens: 16000, estimatedPromptTokens: 2000, cacheWriteTokens: 500 }, 0), true);
  assert.equal(ledger.reserve("bedrock", { maxTokens: 500, estimatedPromptTokens: 2000 }, 0), false); // only 1,500 of quota left
  assert.equal(ledger.reserve("bedrock", { maxTokens: 0, estimatedPromptTokens: 1500 }, 0), true);
  // Reconcile: final = 2,000 + 500 + 800×10 = 10,500; the unused 8,000 reservation is re-credited.
  ledger.reconcile("bedrock", { input: 2000, cacheWrite: 500, maxTokens: 16000 }, { input: 2000, cacheWrite: 500, output: 800, burndown: 10 }, 0);
  assert.equal(ledger.reserve("bedrock", { maxTokens: 0, estimatedPromptTokens: 8000 }, 0), true);   // the re-credited 8,000
  assert.equal(ledger.reserve("bedrock", { maxTokens: 0, estimatedPromptTokens: 1 }, 0), false);    // ...and nothing more
}
{
  const p = new RetryPolicy(3, 0.1);
  for (let i = 0; i < 30; i++) p.record(false);        // a struggling dependency
  assert.equal(p.allows(), false);                     // surplus retries rejected locally
  const { done, winners } = kOfN([1, null, 3, null], 2);
  assert.equal(done, true);
  assert.deepEqual(winners, [1, 3]);                   // K-of-N completion contract
}

// ---- Chapter 16: the router ------------------------------------------------------------
function makeRouter(impl: (id: string) => Promise<{ status: number; body: unknown }>) {
  const rules: RouteRule[] = [{ alias: "extract", pinSessions: true, deployments: [
    { id: "primary", model: "gpt-5.6-sol", provider: "openai", weight: 3, guaranteeTier: "strict", lane: "interactive" },
    { id: "backup", model: "sonnet-4.6", provider: "anthropic", weight: 1, guaranteeTier: "strict_tool" },
  ] }];
  const logs: string[] = [];
  const ledger = new CacheLedger(PRICES);
  const r = new Router(rules, {
    log: (m) => logs.push(m),
    cacheLedger: ledger,
    validate: (body) => body !== "GARBAGE",
    fetchDeployment: (d) => impl(d.id),
  }, "prices-2026-08-27");
  return { r, logs, ledger };
}
{
  // Dead primary: failover to the backup on the first classified error.
  const calls: string[] = [];
  const { r } = makeRouter(async (id) => { calls.push(id); return id === "primary" ? { status: 429, body: "rate" } : { status: 200, body: "ok" }; });
  const res = await r.execute("extract", { q: 1 }, "sess-1");
  assert.ok(res);
  assert.equal(res.deployment.id, "backup");
  assert.deepEqual(calls, ["primary", "backup"]);
}
{
  // Garbage 200: NOT a classified error — the validator path catches it; no fallback walk.
  const calls: string[] = [];
  const { r, logs } = makeRouter(async (id) => { calls.push(id); return id === "primary" ? { status: 200, body: "GARBAGE" } : { status: 200, body: "ok" }; });
  const res = await r.execute("extract", { q: 1 });
  assert.equal(res, null);
  assert.deepEqual(calls, ["primary"], "fallback must not fire on a garbage 200");
  assert.ok(logs.some((l) => l.startsWith("GARBAGE 200")));
}
{
  // All-open: the bypass still picks a deployment and says so loudly.
  const { r, logs } = makeRouter(async () => ({ status: 529, body: "overloaded" }));
  await r.execute("extract", {});
  const picked = r.pick("extract", "s2");
  assert.ok(picked !== null);
  assert.ok(logs.some((l) => l.includes("ALL DEPLOYMENTS")));
}
{
  // A broken session pin is recorded as the cache event it is.
  const { r, ledger } = makeRouter(async () => ({ status: 200, body: "ok" }));
  for (let i = 0; i < 50 && (r as any).pins.get("sess-9") !== "primary"; i++) {
    (r as any).pins.delete("sess-9"); // re-roll the weighted pick until it lands on the primary
    r.pick("extract", "sess-9");
  } // pin resolves at session start
  assert.equal((r as any).pins.get("sess-9"), "primary");
  (r as any).breakers.get("primary").report({ cls: "rate_limit" }); // bench the pinned deployment
  r.pick("extract", "sess-9");                       // pin breaks → cache event + re-pick
  assert.ok(ledger.events.some((e) => e.kind === "deploy" && /pin broke/.test(e.note ?? "")), "pin break priced");
}

// ---- Chapter 17: the session store -----------------------------------------------------
{
  const led = new CacheLedger(PRICES);
  const store = new SessionStore(led, { tryAcquire: () => true });
  const tpl = { id: "triage", version: "3", tools: [{ name: "b_tool" }, { name: "a_tool" }], system: "You triage.", staticContext: "Runbook v2." };
  store.create(tpl, "s1");
  store.append("s1", "user", "Ticket 4711: login loop");
  store.append("s1", "assistant", "Checking auth logs…");
  const r1 = store.render("s1", "Continue.");
  assert.equal(r1.hash, store.render("s1", "Continue.").hash);   // byte-exact across renders
  // Tool order in the template cannot change the bytes — sorted at render (the lying-serializer defense).
  const store2 = new SessionStore(new CacheLedger(PRICES), { tryAcquire: () => true });
  store2.create({ ...tpl, tools: [...tpl.tools].reverse() }, "s1");
  store2.append("s1", "user", "Ticket 4711: login loop");
  store2.append("s1", "assistant", "Checking auth logs…");
  assert.equal(store2.render("s1", "Continue.").hash, r1.hash);
  // Breakpoints: 4-max with the leapfrog — the oldest mark rolls off.
  for (const m of ["b1", "b2", "b3"]) store.addBreakpoint("s1", m);
  assert.equal(store.getBreakpoints("s1").length, 4);
  store.addBreakpoint("s1", "b4");
  assert.equal(store.getBreakpoints("s1").length, 4);
  assert.ok(!store.getBreakpoints("s1").includes("triage:tools"), "oldest rolled by the leapfrog");
  assert.ok(store.getBreakpoints("s1").includes("b4"));
  // Idle taxonomy and TTL class.
  assert.equal(classifyIdle(2), "interactive");
  assert.equal(classifyIdle(30), "think_time");
  assert.equal(classifyIdle(600), "overnight");
  assert.equal(ttlRequestFor("interactive"), 300);
  assert.equal(ttlRequestFor("overnight"), 3600);
  // Children share the template preamble, never the transcript.
  const kids = store.spawn(tpl, ["task a", "task b"], "s1");
  assert.equal(kids.length, 2);
  assert.notEqual(store.render(kids[0], "go").hash, store.render("s1", "go").hash); // isolated contexts
}

console.log("tinyengine: all smoke tests green");
