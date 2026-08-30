// Offline executable proof of the assembled path. No credentials, no network.
import { TinyEngine } from "./engine.js";

const prices = { demo: { date: "2026-08-30", in: 1, out: 2,
  cacheWriteMultiplier: 1.25, cacheReadMultiplier: 0.1 } };
const engine = new TinyEngine({
  routes: [{ alias: "demo", pinSessions: true, deployments: [
    { id: "local-demo", model: "demo", provider: "openai", weight: 1 },
  ] }],
  prices,
  priceTableVersion: "demo-2026-08-30",
  transport: { call: async (_deployment, _body, send) => {
    send.markSent(); // exact boundary immediately before the real fetch/write in production
    return { status: 200, body: { ok: true }, stream: [
      'data: {"choices":[{"delta":{"content":"engine "}}]}',
      'data: {"choices":[{"delta":{"content":"ready"},"finish_reason":"stop"}]}',
      'data: {"usage":{"prompt_tokens":12,"completion_tokens":2}}',
    ] };
  } },
});

const result = await engine.call({ alias: "demo", sessionId: "demo-session",
  template: { id: "demo", version: "1", tools: [], system: "Answer briefly." },
  content: "Say the status.", maxTokens: 8, estimatedPromptTokens: 12 });
console.log(JSON.stringify({ text: result.text, receipt: result.receipt }, null, 2));
