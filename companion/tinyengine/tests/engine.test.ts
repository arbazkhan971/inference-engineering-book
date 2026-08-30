import test from "node:test";
import assert from "node:assert/strict";
import { TinyEngine, TinyEngineCallError } from "../engine.js";
import { MemorySessionEventStore } from "../session-store.js";
import { StreamNormalizer } from "../stream-normalizer.js";

test("TTFT begins at the injected wire-send boundary", () => {
  let now = 1;
  const normalizer = new StreamNormalizer("openai-chat", { now: () => now });
  now = 5; normalizer.markSent();
  now = 8;
  const events = normalizer.ingest('data: {"choices":[{"delta":{"content":"x"}}]}');
  assert.equal(events[0]?.type, "text_delta");
  assert.equal(events[0]?.type === "text_delta" ? events[0].ttftSeconds : -1, 3);
  assert.throws(() => normalizer.markSent(), /markSent may be called only once/);
});

test("tool-only content gets TTFT and a backwards clock never makes it negative", () => {
  let now = 5;
  const normalizer = new StreamNormalizer("openai-chat", { sentAt: 10, now: () => now });
  const events = normalizer.ingest(
    'data: {"choices":[{"delta":{"tool_calls":[{"index":0,"id":"c","function":{"name":"f","arguments":"{}"}}]}}]}',
  );
  const delta = events.find((event) => event.type === "tool_call_delta");
  assert.equal(delta?.type === "tool_call_delta" ? delta.ttftSeconds : -1, 0);
  assert.equal(delta?.ts, 10);
});

test("assembled path falls back, streams, meters, pins, and resumes the prompt", async () => {
  let now = 100;
  const calls: { id: string; prompt: string }[] = [];
  const engine = new TinyEngine({
    routes: [{ alias: "answer", pinSessions: true, deployments: [
      { id: "primary", model: "m", provider: "openai", weight: 1 },
      { id: "backup", model: "m", provider: "openai", weight: 1 },
    ] }],
    prices: { m: { date: "2026-08-30", in: 1, out: 2,
      cacheWriteMultiplier: 1.25, cacheReadMultiplier: 0.1 } },
    quotas: [{ provider: "openai", tpm: 10_000, rpm: 100 }],
    priceTableVersion: "prices-2026-08-30",
    random: () => 0,
    now: () => now,
    transport: { call: async (deployment, body, send) => {
      calls.push({ id: deployment.id,
        prompt: String((body as { prompt?: string }).prompt ?? "") });
      now += deployment.id === "primary" ? 10 : 5;
      send.markSent();
      if (deployment.id === "primary") { now += 5; return { status: 529, body: "busy" }; }
      return { status: 200, body: { ok: true }, stream: (async function* () {
        now += 3; yield 'data: {"choices":[{"delta":{"content":"hello "}}]}';
        now += 1; yield 'data: {"choices":[{"delta":{"content":"world"},"finish_reason":"stop"}]}';
        now += 1; yield 'data: {"usage":{"prompt_tokens":20,"completion_tokens":2}}';
      })() };
    } },
  });
  const template = { id: "t", version: "1", tools: [], system: "Be clear." };
  const first = await engine.call({ alias: "answer", sessionId: "s", template,
    content: "first", maxTokens: 10, estimatedPromptTokens: 20 });
  assert.equal(first.text, "hello world");
  assert.equal(first.receipt.route.selectedBy, "fallback");
  assert.equal(first.receipt.route.priceTableVersion, "prices-2026-08-30");
  assert.ok(first.receipt.costUsd > 0);
  assert.equal(first.trace?.ttftSeconds, 3,
    "TTFT starts at the successful backup send, excluding primary failure and routing time");
  const second = await engine.call({ alias: "answer", sessionId: "s", template,
    content: "second", maxTokens: 10, estimatedPromptTokens: 20 });
  assert.equal(second.receipt.route.selectedBy, "pin");
  assert.deepEqual(calls.map((call) => call.id), ["primary", "backup", "backup"]);
  assert.ok(calls[2].prompt.includes("assistant: hello world"));
  assert.ok(calls[2].prompt.includes("user: second"));
});

test("transport must mark the exact send boundary", async () => {
  const engine = new TinyEngine({
    routes: [{ alias: "a", deployments: [{ id: "d", model: "m", provider: "openai" }] }],
    prices: { m: { date: "2026-08-30", in: 1, out: 1 } },
    priceTableVersion: "v",
    transport: { call: async () => ({ status: 200, body: {}, stream: [] }) },
  });
  let error: unknown;
  try {
    await engine.call({ alias: "a", sessionId: "s", template: {
      id: "t", version: "1", tools: [], system: "s",
    }, content: "x", maxTokens: 1, estimatedPromptTokens: 1 });
  } catch (caught) { error = caught; }
  assert.ok(error instanceof TinyEngineCallError);
  assert.ok(/without calling markSent/.test(error.message));
});

test("assembled engine resumes a durable session instead of recreating it", async () => {
  const eventStore = new MemorySessionEventStore();
  const prompts: string[] = [];
  const makeEngine = () => new TinyEngine({
    routes: [{ alias: "a", deployments: [{ id: "d", model: "m", provider: "openai" }] }],
    prices: { m: { date: "2026-08-30", in: 1, out: 1 } },
    priceTableVersion: "v",
    sessionEventStore: eventStore,
    transport: { call: async (_deployment, body, send) => {
      prompts.push(String((body as { prompt?: string }).prompt));
      send.markSent();
      return { status: 200, body: {}, stream: [
        'data: {"choices":[{"delta":{"content":"ok"},"finish_reason":"stop"}]}',
        'data: {"usage":{"prompt_tokens":1,"completion_tokens":1}}',
      ] };
    } },
  });
  const request = { alias: "a", sessionId: "durable", template: {
    id: "t", version: "1", tools: [], system: "persist",
  }, content: "first", maxTokens: 1, estimatedPromptTokens: 1 };
  await makeEngine().call(request);
  await makeEngine().call({ ...request, content: "second" });
  assert.equal(prompts.length, 2);
  assert.ok(prompts[1].includes("user: first"));
  assert.ok(prompts[1].includes("assistant: ok"));
  assert.ok(prompts[1].includes("user: second"));
});

test("concurrent calls for one session serialize their transcript turns", async () => {
  let releaseFirst!: () => void;
  const firstGate = new Promise<void>((resolve) => { releaseFirst = resolve; });
  let firstEntered!: () => void;
  const entered = new Promise<void>((resolve) => { firstEntered = resolve; });
  const prompts: string[] = [];
  let callNumber = 0;
  const engine = new TinyEngine({
    routes: [{ alias: "a", deployments: [{ id: "d", model: "m", provider: "openai" }] }],
    prices: { m: { date: "2026-08-30", in: 1, out: 1 } },
    priceTableVersion: "v",
    transport: { call: async (_deployment, body, send) => {
      const n = ++callNumber;
      prompts.push(String((body as { prompt?: string }).prompt));
      send.markSent();
      if (n === 1) { firstEntered(); await firstGate; }
      return { status: 200, body: {}, stream: [
        `data: {"choices":[{"delta":{"content":"answer-${n}"},"finish_reason":"stop"}]}`,
        'data: {"usage":{"prompt_tokens":1,"completion_tokens":1}}',
      ] };
    } },
  });
  const base = { alias: "a", sessionId: "s", template: {
    id: "t", version: "1", tools: [], system: "serialize",
  }, maxTokens: 1, estimatedPromptTokens: 1 };
  const first = engine.call({ ...base, content: "first" });
  const second = engine.call({ ...base, content: "second" });
  await entered;
  assert.equal(callNumber, 1, "the second same-session call is still local");
  releaseFirst();
  await Promise.all([first, second]);
  assert.equal(callNumber, 2);
  assert.ok(prompts[1].includes("assistant: answer-1"));
  assert.ok(prompts[1].includes("user: second"));
});
