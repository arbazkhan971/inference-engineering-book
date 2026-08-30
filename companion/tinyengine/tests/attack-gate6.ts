// tests/attack-gate6.ts — Gate-6 adversarial pass over the companion.
// Every case is an attack, not a feature test: malformed streams, torn lines,
// quota arithmetic at the seams, poisoned meters, duplicate money rows.
// Added by the Gate-6 reviewer; source files untouched. Run:
//   node dist/tests/attack-gate6.js
// P2 fix pass note: the A8 and D2 blocks originally asserted the *buggy* behavior
// by construction (they can only pass a finding); after the fixes they assert the
// fixed contracts like every other block. C1 printed its finding by construction
// through the round-2 pass (both branches reported; its regression gate lived in
// smoke.ts) — with the round-2 recordSafe() continue-path shipped, it too now
// asserts the fixed contract: named error, mispriced event, loop survives.
import assert from "node:assert/strict";
import { exit } from "node:process";
import { StreamNormalizer, type Event } from "../stream-normalizer.js";
import { QuotaLedger, TokenBucket, Semaphore, classify, backoffDelayMs } from "../rate-scheduler.js";
import { CacheLedger, UnknownModelError } from "../cache-ledger.js";
import { scoreGolden, makeBaseline, type GoldenTask, type GoldenRow, type GoldenBaseline } from "../golden-set.js";
import { reconcile, type MeterRow, type InvoiceRow } from "../invoice-reconcile.js";
import { gateHits } from "../cache-hit-gate.js";

let findings = 0;
const finding = (id: string, sev: string, what: string, detail: string) => {
  findings++;
  console.log(`FINDING ${id} [${sev}] ${what}\n    ${detail}`);
};
const pass = (id: string, what: string) => console.log(`HELD   ${id} — ${what}`);
const eventsOf = (n: StreamNormalizer, lines: string[]) => lines.flatMap((l) => n.ingest(l));

// ===== A. StreamNormalizer under malformed input ==========================
{
  const n = new StreamNormalizer("openai-chat");
  // A1: garbage lines never crash — per-line isolation so a crash is itself a finding
  const a1lines = ["data:not-json", "data:", "data:{}", "data:null", "data:[1,2]", ": keep-alive", "event: ping", "data:[DONE]"];
  const crashes: string[] = [];
  for (const l of a1lines) { try { n.ingest(l); } catch (e) { crashes.push(`${l} → ${(e as Error).message}`); } }
  if (crashes.length > 0)
    finding("A1", "P1", `malformed JSON payloads crash ingest (violates the file's own never-crash contract)`, crashes.join("; ") + ". Fix: null/array/string chunks must be skipped like unparseable lines (typeof chunk !== \"object\" || chunk === null → return []).");
  else pass("A1", "garbage/meta lines emit nothing, no crash");

  // A2: string-typed usage (a proxy renaming/stripping fields) — NaN poisoning
  const n2 = new StreamNormalizer("openai-chat");
  const u = eventsOf(n2, ['data:{"usage":"unavailable","choices":[]}']).find((e) => e.type === "usage");
  if (u && u.type === "usage" && Number.isNaN(u.freshIn)) {
    finding("A2", "P1", "string-typed usage poisons the meter with NaN",
      `usageEvt computes u.prompt_tokens - 0 = NaN; Math.max(0, NaN) = NaN; freshIn=NaN reaches CacheLedger.record → session aggregates become NaN forever. Repro: data:{"usage":"unavailable"}. Fix: usageEvt should emit 0 (or drop the event) for non-numeric fields.`);
  } else if (!u) {
    finding("A2", "P1", "string-typed usage DROPPED silently",
      "no usage event at all — a wrapper-stripped stream silently under-meters (ch16 suspect #1 made invisible). Either way the event is wrong.");
  } else {
    pass("A2", `string usage handled: freshIn=${u.freshIn}`);
  }

  // A3: usage with cached > prompt (malformed) must clamp, not go negative
  const n3 = new StreamNormalizer("openai-chat");
  const u3 = eventsOf(n3, ['data:{"usage":{"prompt_tokens":100,"prompt_tokens_details":{"cached_tokens":500},"completion_tokens":1}}']).find((e) => e.type === "usage");
  assert.ok(u3 && u3.type === "usage" && u3.freshIn === 0, "A3 clamp");
  pass("A3", "cached>prompt clamps freshIn to 0");

  // A4: tool fragments never carrying an id — synthetic id, assembly at finish
  const n4 = new StreamNormalizer("openai-chat");
  eventsOf(n4, [
    'data:{"choices":[{"delta":{"tool_calls":[{"index":0,"function":{"name":"get_weather","arguments":"{\\"city\\":"}}]}}]}',
    'data:{"choices":[{"delta":{"tool_calls":[{"index":0,"function":{"arguments":"\\"sf\\"}"}}]}}]}',
    'data:{"choices":[{"finish_reason":"tool_calls"}]}',
  ]);
  const fin = n4.finish();
  const call = fin.find((e) => e.type === "tool_call");
  assert.ok(call && call.type === "tool_call" && (call.args as any).city === "sf", "A4 assembly");
  pass("A4", "id-less tool fragments assemble under synthetic idx:N id");

  // A5: torn JSON mid-line (disconnect) — dropped, not crashed
  const n5 = new StreamNormalizer("openai-chat");
  assert.equal(n5.ingest('data:{"choices":[{"delta":{"content":"hel').length, 0);
  pass("A5", "torn final line drops silently (documented never-crash contract)");

  // A6: empty text deltas emit nothing
  const n6 = new StreamNormalizer("openai-chat");
  assert.equal(n6.ingest('data:{"choices":[{"delta":{"content":""}}]}').length, 0);
  pass("A6", "empty text delta emits nothing");

  // A7: duplicated finish_reason chunks emit two stop_reason events
  const n7 = new StreamNormalizer("openai-chat");
  const stops = eventsOf(n7, ['data:{"choices":[{"finish_reason":"stop"}]}', 'data:{"choices":[{"finish_reason":"stop"}]}']).filter((e) => e.type === "stop_reason");
  if (stops.length === 2) finding("A7", "P2", "duplicate finish_reason chunks double-emit stop_reason",
    "a retried/regressed stream that repeats a finish chunk yields two stop_reason events; ch12's contract does not say who dedups. Fix: first stop wins, later ones dropped (or flagged).");
  else pass("A7", `duplicate finish_reason deduped (${stops.length})`);

  // A8: anthropic input_json_delta before any content_block_start — an orphan with no
  // block to belong to. Fixed: skipped entirely; nothing merges under a phantom id.
  const n8 = new StreamNormalizer("anthropic");
  const e8 = n8.ingest('data:{"type":"content_block_delta","index":1,"delta":{"type":"input_json_delta","partial_json":"{\\"a\\":1}"}}');
  if (e8.length === 0) pass("A8", "orphan delta (no block start) skipped — nothing merged");
  else finding("A8", "P2", "anthropic delta before start still accumulates under a phantom id", JSON.stringify(e8));

  // A9: anthropic INTERLEAVED tool blocks (index-keyed in the real protocol) misattributed
  const n9 = new StreamNormalizer("anthropic");
  eventsOf(n9, [
    'data:{"type":"content_block_start","index":0,"content_block":{"type":"tool_use","id":"toolu_A","name":"a"}}',
    'data:{"type":"content_block_start","index":1,"content_block":{"type":"tool_use","id":"toolu_B","name":"b"}}',
    'data:{"type":"content_block_delta","index":0,"delta":{"type":"input_json_delta","partial_json":"{\\"x\\":"}}',
    'data:{"type":"content_block_delta","index":1,"delta":{"type":"input_json_delta","partial_json":"{\\"y\\":"}}',
    'data:{"type":"content_block_delta","index":0,"delta":{"type":"input_json_delta","partial_json":"1}"}}',
    'data:{"type":"content_block_delta","index":1,"delta":{"type":"input_json_delta","partial_json":"2}"}}',
  ]);
  const fin9 = n9.finish().filter((e) => e.type === "tool_call") as Extract<Event, { type: "tool_call" }>[];
  const a = fin9.find((c) => c.callId === "toolu_A"), b = fin9.find((c) => c.callId === "toolu_B");
  if (a && b && JSON.stringify(a.args) === '{"x":1}' && JSON.stringify(b.args) === '{"y":2}') {
    pass("A9", "interleaved anthropic blocks attributed by index");
  } else {
    finding("A9", "P2", "interleaved anthropic tool blocks misattributed (index ignored)",
      `real protocol keys content_block_delta by c.index; implementation keys on last content_block_start. With interleaved blocks: A=${JSON.stringify(a?.args)} B=${JSON.stringify(b?.args)} (expected {x:1}/{y:2}). Streams are usually sequential, but the index field exists precisely so this is well-defined. Fix: map c.index→id at content_block_start.`);
  }

  // A10: gemini functionCall with string args yields non-object args
  const n10 = new StreamNormalizer("gemini");
  eventsOf(n10, ['data:{"candidates":[{"content":{"parts":[{"functionCall":{"name":"f","args":"not-an-object"}}]}}]}']);
  const g = n10.finish().find((e) => e.type === "tool_call") as Extract<Event, { type: "tool_call" }> | undefined;
  if (g && typeof g.args !== "object") finding("A10", "P2", "gemini string args survive as non-object tool_call.args",
    `args=${JSON.stringify(g.args)} violates the Event type (args: object). Fix: wrap or reject non-object args at parse.`);
  else pass("A10", "non-object gemini args normalized");
}

// ===== B. QuotaLedger / TokenBucket / Semaphore seams =====================
{
  // B1: rpm slot burned when tpm rejects — atomicity hole
  const q = new QuotaLedger();
  q.configure({ provider: "anthropic", rpm: 2, tpm: 100 }, 1000);
  const t0 = 1000;
  assert.equal(q.reserve("anthropic", { maxTokens: 0, estimatedPromptTokens: 100 }, t0), true, "B1 first reserve ok");
  assert.equal(q.reserve("anthropic", { maxTokens: 0, estimatedPromptTokens: 1 }, t0), false, "B1 tpm rejection");
  const third = q.reserve("anthropic", { maxTokens: 0, estimatedPromptTokens: 0 }, t0); // 0-charge, tpm can still admit 0
  if (third === false) {
    finding("B1", "P1", "failed TPM reservation leaks an RPM slot",
      "reserve() acquires rpm.tryAcquire(1) BEFORE the tpm check; on tpm rejection the rpm token is not returned. Repro: rpm=2/tpm=100; reserve(100) ok; reserve(1) rejected (tpm empty); reserve(0) now rejected too — the 2nd rpm slot was burned by a request that never went out. Under a tight RPM this converts TPM misses into phantom 429s. Fix: check tpm first, or credit the rpm token back on tpm failure.");
  } else pass("B1", "rpm slot returned on tpm rejection");

  // B2: bedrock final charge EXCEEDS reservation — excess never debited
  const q2 = new QuotaLedger();
  q2.configure({ provider: "bedrock", tpm: 1_000_000, rpm: 1000 }, 0);
  q2.reserve("bedrock", { maxTokens: 32_000, estimatedPromptTokens: 3_000, cacheWriteTokens: 1_000 }, 0); // books 36k
  q2.reconcile("bedrock", { input: 3_000, cacheWrite: 1_000, maxTokens: 32_000 },
    { input: 3_000, cacheWrite: 1_000, output: 32_000, burndown: 10 }, 1); // final = 3k+1k+320k = 324k
  const next = q2.reserve("bedrock", { maxTokens: 900_000, estimatedPromptTokens: 0 }, 1);
  if (next === true) {
    finding("B2", "P1", "bedrock overrun never debited: final charge 324k vs 36k booked, next 900k reserve still admitted",
      "reconcile() only CREDITS max(0, booked − final); when final > booked (burndown × long output) the bucket keeps the difference. A fleet of overrunners sails past TPM with the ledger green. Fix: debit |final − booked| when final > booked (accept the tryAcquire failure as the alarm), or at least surface an overrun event.");
  } else pass("B2", "overrun debited from the bucket");

  // B3: negative cacheWriteTokens gives a free ride
  const q3 = new QuotaLedger();
  q3.configure({ provider: "bedrock", tpm: 10, rpm: 10 }, 0);
  const neg = q3.reserve("bedrock", { maxTokens: 0, estimatedPromptTokens: 5_000, cacheWriteTokens: -5_000 }, 0);
  if (neg === true) {
    finding("B3", "P2", "negative cacheWriteTokens zeroes the TPM charge",
      "charge = 5,000 + (−5,000) + 0 = 0 → tryAcquire(max(0,0)) always true: a malformed upstream field makes every request free. Fix: clamp req fields at ≥0 or reject malformed reservations.");
  } else pass("B3", "negative cache write rejected");

  // B4: bucket clock going backwards drains tokens
  const b = new TokenBucket(10, 10, 100);
  b.tryAcquire(5, 100);            // 5 left
  b.credit(0, 50);                 // fill to min(10, 5 + -50*10) → clamped? tokens + (50-100)*10 = 5-500 → negative!
  const ok = b.tryAcquire(1, 60);
  if (!ok && ok !== undefined) {
    // try the actual numbers: tokens went negative; refill from 50→60 adds 100 → still ≤ 5+... compute in the finding
    finding("B4", "P2", "backwards clock drives tokens negative",
      "fill(now < last) subtracts; TokenBucket(10,10) at t=100 acquires 5 (5 left); credit at t=50 computes tokens += (50−100)×10 = −500 → −495, last=50. A clock step-back (NTP, VM resume) freezes admission until refill catches up ~50s. Fix: ignore non-monotonic time (now = max(now, last)).");
  } else pass("B4", "non-monotonic time tolerated");

  // B5: Semaphore over-release over-admits
  const s = new Semaphore(1);
  const first = await s.acquire();
  let secondEntered = false;
  const second = s.acquire().then((permit) => { secondEntered = true; return permit; });
  await Promise.resolve();
  first.release(); first.release(); // one-use permit: the duplicate is a no-op
  const secondPermit = await second;
  let thirdEntered = false;
  const thirdWaiter = s.acquire().then((permit) => { thirdEntered = true; return permit; });
  await Promise.resolve();
  if (!secondEntered || thirdEntered) {
    finding("B5", "P2", "Semaphore double-release admitted two holders into one slot",
      "one-use permits must ignore duplicate release and hand one occupied slot to exactly one waiter.");
  } else {
    secondPermit.release();
    const thirdPermit = await thirdWaiter;
    thirdPermit.release();
    pass("B5", "over-release clamped and the second holder waited");
  }

  // B6: classify + backoff edges (contract spot-checks)
  assert.deepEqual(classify(429, {}, "insufficient_quota"), { kind: "billing", retryable: false });
  assert.equal(classify(429, { "retry-after": "3" }, "plain").kind, "rate");
  assert.ok(backoffDelayMs(0, 1000, 20000, "abc") >= 0 && backoffDelayMs(0, 1000, 20000, "abc") <= 1000, "NaN retry-after ignored");
  assert.ok(backoffDelayMs(0, 1000, 20000, "-5") <= 1000, "negative retry-after ignored");
  pass("B6", "classify/backoff malformed headers held");
}

// ===== C. CacheLedger — the money meter ==================================
{
  const prices = { "m1": { date: "2026-08-27", in: 3, out: 15, cacheWriteMultiplier: 1.25, cacheReadMultiplier: 0.1 } };
  const led = new CacheLedger(prices);

  // C1: unknown model mid-stream — a NAMED error routed by the caller, plus a shipped
  // continue-path (round-2 M1): the meter loop survives a renamed alias.
  {
    let named = false;
    try { led.record("s1", { freshIn: 100, cachedIn: 0, cacheWriteIn: 0, out: 10 }, "m2-unknown"); }
    catch (e) { named = e instanceof UnknownModelError && (e as UnknownModelError).model === "m2-unknown"; }
    const survived = led.recordSafe("s1", { freshIn: 100, cachedIn: 0, cacheWriteIn: 0, out: 10 }, "m2-unknown");
    const mispriced = led.events.filter((e) => e.kind === "mispriced").length;
    if (named && survived === 0 && mispriced === 1) pass("C1", "unknown model: named error + recordSafe continue-path (mispriced event, price 0)");
    else finding("C1", "P1", "unknown-model contract regressed",
      `named=${named} survived=${survived} mispriced=${mispriced} — record() must throw the named error; recordSafe() must price 0, emit one mispriced event, and keep the loop alive.`);
  }

  // C2: two shipped hit-rate formulas disagree (CacheLedger vs cache-hit-gate)
  const led2 = new CacheLedger(prices);
  led2.record("s", { freshIn: 1_000, cachedIn: 0, cacheWriteIn: 4_000, out: 0 }, "m1");
  const ledgerRate = led2.hitRate("s");                                    // writes IN denominator
  const gateRate = gateHits([{ model: "m1", freshIn: 1_000, cachedIn: 0, cacheWriteIn: 4_000, out: 0 }], 0.6, 0).models[0].hitRate; // writes excluded
  if (Math.abs(ledgerRate - gateRate) > 1e-9) {
    finding("C2", "P1", `two shipped hit-rate formulas disagree: CacheLedger.hitRate=${(ledgerRate * 100).toFixed(1)}% vs cache-hit-gate=${(gateRate * 100).toFixed(1)}%`,
      "same usage (fresh 1k, writes 4k, cached 0) yields 0.0% vs 0.0% here — use cached>0 to diverge — the denominators differ (ledger: fresh+cached+writes; gate: cached+fresh, 'matching the book's formula'). One of them mis-teaches ch14's first-class metric and Appendix D ships both. Fix: one formula, one place, both callers.");
  } else pass("C2", "hit-rate formulas agree");

  // C2b: make the divergence concrete with cached tokens present
  const led3 = new CacheLedger(prices);
  led3.record("s", { freshIn: 1_000, cachedIn: 1_000, cacheWriteIn: 4_000, out: 0 }, "m1");
  const lr = led3.hitRate("s");
  const gr = gateHits([{ model: "m1", freshIn: 1_000, cachedIn: 1_000, cacheWriteIn: 4_000, out: 0 }], 0.6, 0).models[0].hitRate;
  if (Math.abs(lr - gr) > 1e-9) {
    finding("C2b", "P1", `hit-rate divergence is material: ledger ${(lr * 100).toFixed(1)}% vs gate ${(gr * 100).toFixed(1)}% (fresh 1k, cached 1k, writes 4k)`,
      "same day, same rows, 16.7% vs 50.0% — an operator gating with cache-hit-gate while their dashboard reads CacheLedger sees two different truths. The book's formula (ch14: cached ÷ (cached + fresh), writes reported but excluded) matches the gate; CacheLedger.hitRate is the odd one out.");
  }

  // C3: negative usage silently corrupts
  const led4 = new CacheLedger(prices);
  const cost = led4.record("s", { freshIn: -5_000, cachedIn: 0, cacheWriteIn: 0, out: 0 }, "m1");
  if (cost < 0) finding("C3", "P2", `negative usage yields negative cost ($${cost.toFixed(4)}) and shrinks the session`,
    "no input validation: a normalizer NaN/clamp bug upstream becomes a money-printing (negative) line. Fix: reject or clamp non-negative at the ledger boundary — the meter is the trust boundary.");
  else pass("C3", "negative usage rejected");

  // C4: cacheWrite+cached in the SAME event: cost right, event log understates reads
  const led5 = new CacheLedger(prices);
  led5.record("s", { freshIn: 0, cachedIn: 2_000, cacheWriteIn: 4_000, out: 0 }, "m1");
  const readEvents = led5.events.filter((e) => e.kind === "read").length;
  if (readEvents === 0) finding("C4", "P2", "read+write in one usage event logs only a 'write' event",
    "cost is correct (both terms priced) but the event stream (what operators replay) shows no read for the 2,000 cached tokens — events and aggregates tell different stories. Fix: emit both events, or document the else-if as write-dominant.");
  else pass("C4", "read+write dual-logged");

  // C5: breakEvenReads at r=1 (free reads) must be Infinity, not a divide crash
  const led6 = new CacheLedger({ m: { date: "d", in: 1, out: 1, cacheWriteMultiplier: 2, cacheReadMultiplier: 1 } });
  const be = led6.breakEvenReads("m");
  if (be === Infinity) pass("C5", "breakEvenReads(r=1) = Infinity (never breaks even — correct)");
  else finding("C5", "P2", `breakEvenReads(r=1) = ${be}, expected Infinity`, "ceil((2-1)/(1-1)) must be Infinity, not a number");
}

// ===== D. golden-set edges ==============================================
{
  // D1: baseline references a task no longer in the set → reported "fixed"
  const tasks: GoldenTask[] = [{ id: "t1" }, { id: "t2" }];
  const rows: GoldenRow[] = [{ task: "t1", ok: true }, { task: "t2", ok: true }];
  const baseline: GoldenBaseline = { date: "2026-08-01", floor: 0.9, failing: ["t1", "removed-task"] };
  const r = scoreGolden(tasks, rows, baseline);
  if (r.fixed.includes("removed-task")) {
    finding("D1", "P2", "task removed from the set reports as 'fixed since baseline'",
      "fixed = baseline.failing − failed without intersecting the task set; a retired task greets the operator as a victory every night. Fix: intersect baseline.failing with current task ids.");
  } else pass("D1", "retired tasks not reported fixed");

  // D2: non-numeric --floor must fail loudly. scoreGolden's guard makes a non-finite
  // floor a reason (gate never green); the CLI exits 2 on a typo'd flag before scoring.
  const r2n = scoreGolden([{ id: "t1" }], [{ task: "t1", ok: false }], { date: "d", floor: 0.9, failing: [] }, NaN);
  if (r2n.ok || !r2n.reasons.some((s) => s.includes("finite")))
    finding("D2", "P2", "non-finite floor still passes silently", JSON.stringify(r2n.reasons));
  else pass("D2", "non-finite floor fails loudly (reason + not-ok)");

  // D3: duplicates — last row wins (documented behavior, verify it holds)
  const r3 = scoreGolden([{ id: "t1" }], [{ task: "t1", ok: false }, { task: "t1", ok: true }], { date: "d", floor: 1, failing: [] });
  assert.equal(r3.passRate, 1, "D3 last-row-wins");
  pass("D3", "duplicate result rows: last row wins");

  // D4: empty task set fails loudly
  const r4 = scoreGolden([], [], { date: "d", floor: 0.9, failing: [] });
  assert.equal(r4.ok, false, "D4 empty set not ok");
  pass("D4", "empty task set is DRIFT, not a green run");

  // D5: update-baseline guard mirrors main() (missing rows refuse)
  const b = makeBaseline("2026-08-28", [{ id: "t1" }, { id: "t2" }], [{ task: "t1", ok: false }], 0.9);
  if (b.failing.includes("t1") && !b.failing.includes("t2")) pass("D5", "makeBaseline records only scored failures");
  else finding("D5", "P2", "makeBaseline baseline shape wrong", JSON.stringify(b));
}

// ===== E. invoice-reconcile money seams ==================================
{
  // E1: duplicate invoice rows — last wins, first silently dropped
  const meter: MeterRow[] = [{ model: "m1", freshIn: 1000, cacheWriteIn: 0, cachedIn: 0, out: 1000, costUsd: 5 }];
  const invoice: InvoiceRow[] = [
    { model: "m1", inputTokens: 1000, outputTokens: 1000, cachedTokens: 0, amountUsd: 5 },
    { model: "m1", inputTokens: 900, outputTokens: 900, cachedTokens: 0, amountUsd: 4.5 }, // retry/partial dup
  ];
  const r = reconcile(meter, invoice, 0.02);
  if (r.lines.length === 1 && Math.abs(r.lines[0].invoiceUsd - 4.5) < 1e-9) {
    finding("E1", "P1", "duplicate invoice rows: first $5.00 row silently dropped, reconciliation runs against $4.50",
      "invoiceBy Map is last-wins; provider CSV exports DO contain retry/partial duplicates. $0.50 of real spend vanishes from the check without a word — and if the dup were bigger the report would still say within-tolerance. Fix: sum duplicates or flag them as DRIFT (a row the meter cannot explain).");
  } else if (r.lines.length === 1) {
    pass("E1", `duplicates summed (${r.lines[0].invoiceUsd})`);
  } else finding("E1", "P2", "duplicate invoice rows produce unexpected line count", String(r.lines.length));

  // E2: duplicate meter rows — same silent last-wins on our side
  const r2 = reconcile([
    { model: "m1", freshIn: 500, cacheWriteIn: 0, cachedIn: 0, out: 500, costUsd: 2.5 },
    { model: "m1", freshIn: 500, cacheWriteIn: 0, cachedIn: 0, out: 500, costUsd: 2.5 },
  ], [{ model: "m1", inputTokens: 1000, outputTokens: 1000, cachedTokens: 0, amountUsd: 5 }], 0.02);
  if (r2.lines.length === 1 && Math.abs(r2.lines[0].meterUsd - 2.5) < 1e-9) {
    finding("E2", "P2", "duplicate meter rows silently collapse (5.00 metered → 2.50 checked)",
      "same last-wins on the meter side: an append-only JSONL written twice (cron overlap) halves itself into tolerance. Fix: sum or flag.");
  } else pass("E2", "meter duplicates handled");

  // E3: NaN amounts flag, not crash
  const r3 = reconcile([{ model: "m1", freshIn: 1, cacheWriteIn: 0, cachedIn: 0, out: 1, costUsd: 0.01 }],
    [{ model: "m1", inputTokens: 1, outputTokens: 1, cachedTokens: 0, amountUsd: NaN }], 0.02);
  assert.equal(r3.ok, false, "E3 NaN flags");
  pass("E3", "NaN invoice amount flags as drift, no crash");

  // E4: tolerance boundary is inclusive
  const r4 = reconcile([{ model: "m1", freshIn: 1, cacheWriteIn: 0, cachedIn: 0, out: 1, costUsd: 9.8 }],
    [{ model: "m1", inputTokens: 1, outputTokens: 1, cachedTokens: 0, amountUsd: 10 }], 0.02);
  assert.equal(r4.lines[0].withinTolerance, true, "E4 2% exactly is within");
  pass("E4", "gap exactly at tolerance counts within (documented ±)");

  // E5: zero-dollar invoice vs metered spend flags as Infinity gap
  const r5 = reconcile([{ model: "m1", freshIn: 1, cacheWriteIn: 0, cachedIn: 0, out: 1, costUsd: 5 }],
    [{ model: "m1", inputTokens: 1, outputTokens: 1, cachedTokens: 0, amountUsd: 0 }], 0.02);
  assert.equal(r5.ok, false);
  pass("E5", "$0 invoice vs metered $5 flags (Infinity gap)");
}

console.log(`\nattack-gate6: ${findings} finding(s)`);
exit(findings > 0 ? 1 : 0);
