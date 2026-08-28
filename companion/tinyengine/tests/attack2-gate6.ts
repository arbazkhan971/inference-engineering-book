// tests/attack2-gate6.ts — Gate-6 adversarial round 2 over the companion.
// Round 2 surfaces (per the architect's queue): interleaved streams,
// usage-after-finish, mid-flight/double reconcile, duplicate-id and corrupt
// baselines, floor boundaries, CRLF/quoted/negative/BOM CSVs, two-scheduler
// interleavings, and the queued unknown-model caller-routing P1.
// Every case is an attack, not a feature test. Run:
//   node dist/tests/attack2-gate6.js
// Fix-pass note: like round 1, blocks assert the FIXED contracts once fixed;
// the findings below are the record of what fired before the fix pass.
import assert from "node:assert/strict";
import { exit } from "node:process";
import { StreamNormalizer, type Event } from "../stream-normalizer.js";
import { QuotaLedger } from "../rate-scheduler.js";
import { CacheLedger, UnknownModelError } from "../cache-ledger.js";
import { scoreGolden, type GoldenTask, type GoldenRow, type GoldenBaseline } from "../golden-set.js";
import { gateHits, type UsageRow } from "../cache-hit-gate.js";
import { reconcile, invoiceFromCsv } from "../invoice-reconcile.js";
import { readJson, readJsonl, readCsv } from "../cadence-io.js";

let findings = 0;
const finding = (id: string, sev: string, what: string, detail: string) => {
  findings++;
  console.log(`FINDING ${id} [${sev}] ${what}\n    ${detail}`);
};
const pass = (id: string, what: string) => console.log(`HELD   ${id} — ${what}`);
const toolCalls = (n: StreamNormalizer) =>
  n.finish().filter((e): e is Extract<Event, { type: "tool_call" }> => e.type === "tool_call");

// ===== F. Interleaved streams ============================================
{
  // F1: openai-chat, two calls interleaved by index, ids on first fragments (legal shape)
  const n = new StreamNormalizer("openai-chat");
  const ev = (o: unknown) => `data: ${JSON.stringify(o)}`;
  for (const o of [
    { choices: [{ delta: { tool_calls: [{ index: 0, id: "call_a", function: { name: "f", arguments: "{\"x\":" } }] } }] },
    { choices: [{ delta: { tool_calls: [{ index: 1, id: "call_b", function: { name: "g", arguments: "{\"y\":" } }] } }] },
    { choices: [{ delta: { tool_calls: [{ index: 0, function: { arguments: "1}" } }] } }] },
    { choices: [{ delta: { tool_calls: [{ index: 1, function: { arguments: "2}" } }] } }] },
  ]) n.ingest(ev(o));
  const calls = toolCalls(n);
  const a = calls.find((c) => c.callId === "call_a"), b = calls.find((c) => c.callId === "call_b");
  if (a && b && JSON.stringify(a.args) === '{"x":1}' && JSON.stringify(b.args) === '{"y":2}')
    pass("F1", "interleaved indexed calls (ids first) attribute correctly");
  else finding("F1", "P2", "interleaved indexed tool calls misattributed", `a=${JSON.stringify(a?.args)} b=${JSON.stringify(b?.args)} (expected {x:1}/{y:2})`);

  // F2: id arriving LATE for an index that already banked fragments under its
  // synthetic id — the comment claims "index → id, resolved when id arrives".
  const n2 = new StreamNormalizer("openai-chat");
  for (const o of [
    { choices: [{ delta: { tool_calls: [{ index: 0, id: "call_a", function: { name: "f", arguments: "{\"x\":" } }] } }] },
    { choices: [{ delta: { tool_calls: [{ index: 1, function: { arguments: "{\"y\":" } }] } }] },   // no id yet
    { choices: [{ delta: { tool_calls: [{ index: 1, id: "call_b", function: { arguments: "2}" } }] } }] },  // id now
  ]) n2.ingest(ev(o));
  const calls2 = n2.finish();
  const b2 = calls2.find((e) => e.type === "tool_call" && e.callId === "call_b") as Extract<Event, { type: "tool_call" }> | undefined;
  if (b2 && JSON.stringify(b2.args) === '{"y":2}')
    pass("F2", "late-arriving id re-keys the banked fragments (call whole)");
  else
    finding("F2", "P2", "a late-arriving id splits the call: early fragments stay under the synthetic idx:N id",
      `call_b args=${JSON.stringify(b2?.args)} — the '{"y":' fragment banked under idx:1 is never re-keyed when call_b's id arrives, so the call assembles from a fragment suffix (or splits into markers). Proxies do reorder id fields. Fix: re-key the accumulator's idx:N entry to the real id when the id arrives.`);

  // F3: anthropic text (index 0) and tool (index 1) blocks interleaved — text
  // events are emitted at ingest; the tool call assembles at finish.
  const n3 = new StreamNormalizer("anthropic");
  const ing: Event[] = [];
  for (const o of [
    { type: "content_block_start", index: 0, content_block: { type: "text" } },
    { type: "content_block_start", index: 1, content_block: { type: "tool_use", id: "toolu_A", name: "a" } },
    { type: "content_block_delta", index: 0, delta: { type: "text_delta", text: "hi" } },
    { type: "content_block_delta", index: 1, delta: { type: "input_json_delta", partial_json: '{"x":1}' } },
    { type: "content_block_delta", index: 0, delta: { type: "text_delta", text: "!" } },
  ]) ing.push(...n3.ingest(ev(o)));
  const text = ing.filter((e) => e.type === "text_delta").map((e) => (e as { text: string }).text).join("");
  const t3 = toolCalls(n3)[0];
  if (text === "hi!" && t3 && JSON.stringify(t3.args) === '{"x":1}')
    pass("F3", "interleaved anthropic text+tool blocks stay on their own indexes");
  else finding("F3", "P2", "interleaved anthropic text+tool blocks cross-wired", `text=${JSON.stringify(text)} args=${JSON.stringify(t3?.args)}`);

  // F4: gemini — two calls to the SAME function in one parts array (parallel calls)
  const n4 = new StreamNormalizer("gemini");
  n4.ingest(ev({ candidates: [{ content: { parts: [
    { functionCall: { name: "get_weather", args: { city: "sf" } } },
    { functionCall: { name: "get_weather", args: { city: "nyc" } } },
  ] } }] }));
  const g = toolCalls(n4).filter((c) => c.name === "get_weather");
  if (g.length === 2 && (g[0].args as { city: string }).city === "sf" && (g[1].args as { city: string }).city === "nyc")
    pass("F4", "parallel same-name gemini calls assemble as two calls");
  else
    finding("F4", "P2", "parallel same-name gemini calls collapse into one unparseable marker — both calls lost",
      `assembled ${g.length} call(s) for two delivered functionCall parts. The synthetic key step:<name> cannot tell a second call from more fragments of the first, so '{"city":"sf"}' + '{"city":"nyc"}' join into one string and fail JSON.parse at finish. Gemini's grammar delivers each functionCall part complete; same-name parallel calls are legal. Fix: sequence the synthetic id per name (step:<name>, step:<name>#1, …).`);

  // F5: same shape across two chunks
  const n5 = new StreamNormalizer("gemini");
  n5.ingest(ev({ candidates: [{ content: { parts: [{ functionCall: { name: "f", args: { a: 1 } } }] } }] }));
  n5.ingest(ev({ candidates: [{ content: { parts: [{ functionCall: { name: "f", args: { a: 2 } } }] } }] }));
  const g5 = toolCalls(n5).filter((c) => c.name === "f");
  if (g5.length === 2) pass("F5", "same-name calls across chunks assemble as two");
  else finding("F5", "P2", "same-name calls across chunks merge", `assembled ${g5.length} of 2`);

  // F6: two normalizer instances interleaved (two sessions through one loop)
  const s1 = new StreamNormalizer("openai-chat"), s2 = new StreamNormalizer("anthropic");
  const r1 = s1.ingest('data:{"choices":[{"delta":{"content":"a"}}]}');
  const r2 = s2.ingest(ev({ type: "content_block_delta", index: 0, delta: { type: "text_delta", text: "b" } }));
  if (r1.length === 1 && r2.length === 1) pass("F6", "two interleaved instances keep independent state");
  else finding("F6", "P2", "interleaved instances interfere", `r1=${r1.length} r2=${r2.length}`);
}

// ===== G. Finish semantics: assemble once; the meter is never lossy ======
{
  const ev = (o: unknown) => `data: ${JSON.stringify(o)}`;
  // G1: finish() called twice (a harness retrying its close path)
  const n = new StreamNormalizer("openai-chat");
  n.ingest(ev({ choices: [{ delta: { tool_calls: [{ index: 0, id: "call_a", function: { name: "f", arguments: "{}" } }] } }] }));
  const first = toolCalls(n);
  n.ingest(ev({ choices: [{ delta: { tool_calls: [{ index: 0, function: { arguments: "{}" } }] } }] })); // late dup fragment
  const second = n.finish().filter((e) => e.type === "tool_call" || e.type === "incomplete_call");
  if (first.length === 1 && second.length === 0)
    pass("G1", "finish() assembles once — a second finish emits nothing");
  else
    finding("G1", "P2", "finish() is not idempotent: a second finish re-assembles late fragments",
      `first finish emitted ${first.length} call(s); after a duplicate late fragment the second finish emitted ${second.length} more event(s) for the same stream. The contract says parse exactly once, at the finish. Fix: the accumulator finishes once — later fragments and later finishes are artifacts of an ended stream.`);

  // G2: usage arriving AFTER the stop event (wrapper reordering) must still meter
  const n2 = new StreamNormalizer("openai-chat");
  n2.ingest(ev({ choices: [{ delta: { content: "x" }, finish_reason: "stop" }] }));
  const lateUsage = n2.ingest(ev({ usage: { prompt_tokens: 100, completion_tokens: 5 } }));
  if (lateUsage.some((e) => e.type === "usage"))
    pass("G2", "usage after the stop event still meters (never lossy)");
  else finding("G2", "P1", "usage arriving after the stop event is dropped", "the turn's money would never meter");

  // G3: usage after finish() — the meter still sees it (finish gates the tool
  // accumulator, not the metering path)
  const n3 = new StreamNormalizer("openai-chat");
  n3.finish();
  const u3 = n3.ingest(ev({ usage: { prompt_tokens: 7, completion_tokens: 1 } }));
  if (u3.some((e) => e.type === "usage")) pass("G3", "usage after finish() still meters");
  else finding("G3", "P2", "usage after finish() dropped", "a late usage chunk (proxy delivering the receipt last) is lost money");
}

// ===== H. Mid-flight / double reconcile ==================================
{
  // H1: reconcile fired twice for one reservation (timeout + late success).
  // Sharp probe: capacity 1000; reserve 600 (→400); reconcile final 100 (credit 500 → 900);
  // double reconcile (credit 500 again → clamped 1000 = 100 free tokens).
  const q = new QuotaLedger();
  q.configure({ provider: "bedrock", tpm: 1000, rpm: 100 }, 0);
  q.reserve("bedrock", { maxTokens: 600, estimatedPromptTokens: 0 }, 0);
  q.reconcile("bedrock", { input: 0, cacheWrite: 0, maxTokens: 600 }, { input: 0, output: 100 }, 1); // settles → 900
  q.reconcile("bedrock", { input: 0, cacheWrite: 0, maxTokens: 600 }, { input: 0, output: 100 }, 1); // double-fire
  if (q.reserve("bedrock", { maxTokens: 950, estimatedPromptTokens: 0 }, 1))
    finding("H1", "P2", "double reconcile manufactures quota (bounded by capacity)",
      "one reservation, reconcile fired twice (timeout + late success): first settles to 900/1000, the second credits another 500 and the bucket reads 1000 — 100 tokens nobody paid for. Fix: reconcile settles one outstanding reservation; with nothing outstanding it is a no-op.");
  else pass("H1", "double reconcile is a no-op (nothing outstanding to settle)");

  // H2: reconcile for a request that was NEVER reserved (harness reconciles a
  // rejected/never-sent request)
  const q3 = new QuotaLedger();
  q3.configure({ provider: "bedrock", tpm: 1000, rpm: 100 }, 0);
  q3.reserve("bedrock", { maxTokens: 600, estimatedPromptTokens: 0 }, 0);   // 400 left, outstanding [600]
  q3.reconcile("bedrock", { input: 0, cacheWrite: 0, maxTokens: 600 }, { input: 0, output: 100 }, 1); // settles it → 900, outstanding []
  q3.reconcile("bedrock", { input: 0, cacheWrite: 0, maxTokens: 300 }, { input: 0, output: 0 }, 1);   // rogue: never reserved
  if (q3.reserve("bedrock", { maxTokens: 950, estimatedPromptTokens: 0 }, 1))
    finding("H2", "P2", "reconcile with no outstanding reservation mints credit",
      "a reconcile for a request the ledger never booked applies its credit anyway. Fix: settle-one-outstanding discipline covers this case too.");
  else pass("H2", "reconcile without a reservation is a no-op");

  // H3: two interleaved reservations settle correctly (the fix must not break this).
  // All at one frozen `now` — continuous refill between timestamps would shift
  // the bucket by refillPerSecond × elapsed, muddying the settle arithmetic.
  const q4 = new QuotaLedger();
  const T = 1000;
  q4.configure({ provider: "bedrock", tpm: 1_000_000, rpm: 1000 }, T);
  q4.reserve("bedrock", { maxTokens: 36_000, estimatedPromptTokens: 0 }, T); // A
  q4.reserve("bedrock", { maxTokens: 20_000, estimatedPromptTokens: 0 }, T); // B → 944k
  q4.reconcile("bedrock", { input: 0, cacheWrite: 0, maxTokens: 36_000 }, { input: 0, output: 40_000 }, T); // A overran +4k → 940k
  q4.reconcile("bedrock", { input: 0, cacheWrite: 0, maxTokens: 20_000 }, { input: 0, output: 5_000 }, T);  // B under-ran −15k → 955k
  const okA = q4.reserve("bedrock", { maxTokens: 954_000, estimatedPromptTokens: 0 }, T); // true → 1k left
  const okB = q4.reserve("bedrock", { maxTokens: 2_000, estimatedPromptTokens: 0 }, T);   // false: 1k < 2k
  if (okA && !okB) pass("H3", "two interleaved reservations each settle once (FIFO)");
  else finding("H3", "P2", "interleaved settle arithmetic drifted", `okA=${okA} okB=${okB} — expected 955k after both settles: A debit 4k, B credit 15k`);

  // H4: reconcile for a non-bedrock provider stays a documented no-op
  const q5 = new QuotaLedger();
  q5.configure({ provider: "openai", tpm: 1000, rpm: 100 }, 0);
  q5.reserve("openai", { maxTokens: 600, estimatedPromptTokens: 0 }, 0); // 400
  q5.reconcile("openai", { input: 0, maxTokens: 600 }, { input: 0, output: 0, burndown: 10 }, 1);
  if (q5.reserve("openai", { maxTokens: 500, estimatedPromptTokens: 0 }, 1) === false)
    pass("H4", "non-bedrock reconcile is a no-op (only bedrock books up front)");
  else finding("H4", "P2", "non-bedrock reconcile changed the bucket", "");
}

// ===== I. Duplicate-id and corrupt baselines =============================
{
  // I1: duplicate task ids in the golden set
  const tasks = readJson<GoldenTask[]>("fixtures/attack2/golden-dup-tasks.json"); // t1, t1, t2
  const rows: GoldenRow[] = [{ task: "t1", ok: true }, { task: "t2", ok: true }];
  const r = scoreGolden(tasks, rows, { date: "d", floor: 0.9, failing: [] });
  if (r.ok && r.scored === 3)
    finding("I1", "P2", "duplicate task ids silently inflate the scored count",
      `two distinct tasks in the file, but scored=${r.scored} and the gate is green — a duplicated id (copy-paste in the task file) distorts the pass rate and nothing says so. Fix: dedupe by id and fail the gate loudly on duplicates.`);
  else if (!r.ok && r.reasons.some((s) => /duplicate/i.test(s)) && r.scored === 2)
    pass("I1", "duplicate task ids deduped + a loud reason");
  else finding("I1", "P2", "duplicate-id handling unexpected", JSON.stringify({ ok: r.ok, scored: r.scored, reasons: r.reasons }));

  // I2: corrupt baseline — failing is a string, not a list. A string spreads
  // into CHARACTERS inside `new Set(failing)`, so the gate neither crashes nor
  // complains: it silently diffs tasks against characters and can never match.
  const baseline = readJson<GoldenBaseline>("fixtures/attack2/golden-corrupt-baseline.json");
  let r2: ReturnType<typeof scoreGolden> | null = null;
  let crashed = false;
  try { r2 = scoreGolden([{ id: "t1" }], [{ task: "t1", ok: true }], baseline); }
  catch { crashed = true; }
  if (crashed)
    finding("I2", "P2", "corrupt baseline crashes the gate with a raw TypeError", "a baseline that parses as JSON but holds the wrong shape kills the nightly with a stack trace instead of a reason. Fix: shape-guard the baseline → DRIFT reason, exit 1, re-record with --update-baseline.");
  else if (r2 && (!r2.ok && r2.reasons.some((s) => /corrupt/i.test(s))))
    pass("I2", "corrupt baseline fails loudly with a reason");
  else if (r2)
    finding("I2", "P2", "corrupt baseline accepted silently — `failing` spreads into characters",
      `baseline.failing = ${JSON.stringify(baseline.failing)} (a string, not a list); new Set(string) spreads it into single characters, so the per-task diff compares task ids against characters. Tonight it ran green (ok=${r2.ok}); the night it matters, a real regression in a task whose id is not a single character would be reported as brand-new AND still-failing at once, or a baseline failure never matched. Fix: Array.isArray shape guard → loud DRIFT reason.`);
  else finding("I2", "P2", "corrupt baseline handling unexpected", "");

  // I3: non-finite floor already fails loudly (round-1 D2) — regression guard
  const r3 = scoreGolden([{ id: "t1" }], [{ task: "t1", ok: true }], { date: "d", floor: 0.9, failing: [] }, NaN);
  if (!r3.ok && r3.reasons.some((s) => s.includes("finite"))) pass("I3", "NaN floor still fails loudly");
  else finding("I3", "P2", "NaN floor regression", JSON.stringify(r3.reasons));

  // I4: result rows for tasks no longer in the set are ignored (retired-task noise)
  const r4 = scoreGolden([{ id: "t1" }], [{ task: "t1", ok: true }, { task: "gone", ok: false }], { date: "d", floor: 1, failing: [] });
  if (r4.ok) pass("I4", "rows for retired tasks do not fail the gate");
  else finding("I4", "P2", "retired-task rows leak into the gate", JSON.stringify(r4.reasons));
}

// ===== J. Floor boundaries ===============================================
{
  // J1: pass rate exactly at the floor is within (inclusive boundary).
  // The known failure lives in the baseline so the ONLY condition under test
  // is the floor comparison.
  const r = scoreGolden([{ id: "t1" }, { id: "t2" }], [{ task: "t1", ok: true }, { task: "t2", ok: false }], { date: "d", floor: 0.5, failing: ["t2"] });
  if (r.ok) pass("J1", "pass rate exactly at the floor is within");
  else finding("J1", "P2", "floor boundary exclusive", JSON.stringify(r.reasons));

  // J2: floor above 1 fails safe (nothing can clear it)
  const r2 = scoreGolden([{ id: "t1" }], [{ task: "t1", ok: true }], { date: "d", floor: 0.9, failing: [] }, 1.2);
  if (!r2.ok) pass("J2", "floor > 1 fails safe (library); the CLI rejects the range (verified live)");
  else finding("J2", "P2", "floor > 1 passes", "");

  // J3: cache-hit-gate with a NaN floor — the round-1 D2 class in the OTHER gate
  const rows: UsageRow[] = [{ model: "m", freshIn: 1000, cachedIn: 0, cacheWriteIn: 0, out: 1 }];
  const g = gateHits(rows, NaN, 1);
  if (g.ok)
    finding("J3", "P1", "cache-hit-gate: a non-finite floor silently disables the SEV gate",
      "gateHits(rows, NaN) reports ok=true with a 0% hit rate — `hitRate < NaN` is always false, so a typo'd --floor o.6 turns chapter 14's first-class metric into a no-op. Round 1 fixed this exact shape in golden-set (D2); cache-hit-gate never got the guard. Fix: non-finite floor → reason + not-ok; CLI exits 2.");
  else if (g.reasons.some((s) => s.includes("finite"))) pass("J3", "NaN floor fails the hit gate loudly");
  else finding("J3", "P1", "NaN floor flagged wrong", JSON.stringify(g.reasons));

  // J4: --min-rows typo (NaN) — same silent-disable family
  const g2 = gateHits(rows, 0.6, NaN);
  if (g2.ok)
    finding("J4", "P2", "cache-hit-gate: NaN --min-rows silently un-gates every model and skips the overall check",
      "`rows >= NaN` is false: no model is gated and the overall rate is never compared. Fix: guard min-rows too (CLI exits 2).");
  else if (g2.reasons.some((s) => s.includes("min-rows") || s.includes("finite"))) pass("J4", "NaN min-rows fails loudly");
  else finding("J4", "P2", "NaN min-rows flagged wrong", JSON.stringify(g2.reasons));

  // J5: hit rate exactly at the floor is within
  const g3 = gateHits([{ model: "m", freshIn: 100, cachedIn: 100, cacheWriteIn: 0, out: 0 }], 0.5, 1);
  if (g3.ok) pass("J5", "hit rate exactly at the floor is within");
  else finding("J5", "P2", "hit floor boundary exclusive", JSON.stringify(g3.reasons));

  // J6: negative tolerance fails loud, never silent-pass
  const tol = reconcile([{ model: "m", freshIn: 1, cacheWriteIn: 0, cachedIn: 0, out: 1, costUsd: 5 }],
    [{ model: "m", inputTokens: 1, outputTokens: 1, cachedTokens: 0, amountUsd: 5 }], -0.02);
  if (!tol.ok) pass("J6", "nonsense tolerance fails loud (every line outside)");
  else finding("J6", "P2", "negative tolerance passed", "");
}

// ===== K. CSV shapes: CRLF, BOM, quoted, negative ========================
{
  // K1: CRLF line endings parse clean; negative amounts net (refunds)
  const rows = invoiceFromCsv(readCsv("fixtures/attack2/invoice-crlf-quoted.csv"));
  const m1 = rows.filter((r) => r.model === "m1");
  if (m1.length === 2 && Math.abs(m1[0].amountUsd - 5) < 1e-9 && Math.abs(m1[1].amountUsd + 1) < 1e-9)
    pass("K1", "CRLF rows parse; the refund line keeps its negative sign (netting is money-correct)");
  else finding("K1", "P2", "CRLF/negative rows mis-parsed", JSON.stringify(m1));

  // K1b: the netting actually reconciles — meter $4.00 vs invoice 5.00 + (−1.00)
  const rec = reconcile([{ model: "m1", freshIn: 1000, cacheWriteIn: 0, cachedIn: 0, out: 1000, costUsd: 4 }],
    invoiceFromCsv(readCsv("fixtures/attack2/invoice-crlf-quoted.csv")).filter((r) => r.model === "m1"), 0.02);
  if (rec.lines[0]?.withinTolerance) pass("K1b", "duplicate+refund invoice rows net to the metered total");
  else finding("K1b", "P2", "netting wrong", JSON.stringify(rec.lines));

  // K2: quoted commas — the documented no-quote limitation must fail LOUD, not silent
  const q = reconcile([{ model: "m2", freshIn: 1200, cacheWriteIn: 0, cachedIn: 0, out: 300, costUsd: 4.5 }],
    invoiceFromCsv(readCsv("fixtures/attack2/invoice-crlf-quoted.csv")).filter((r) => r.model === "m2"), 0.02);
  if (!q.ok) pass("K2", "quoted-comma row fails loud (documented: map quoted exports at your cron layer)");
  else finding("K2", "P2", "quoted-comma row silently passed", JSON.stringify(q.lines));

  // K3: UTF-8 BOM — CSV headers are cell-trimmed (trim() includes the BOM),
  // but readJson/readJsonl hand the BOM straight to JSON.parse, which throws.
  const bom = invoiceFromCsv(readCsv("fixtures/attack2/invoice-bom.csv"));
  if (bom[0]?.model !== "m1")
    finding("K3a", "P2", "a UTF-8 BOM corrupts the CSV header", `model reads ${JSON.stringify(bom[0]?.model)}`);
  else pass("K3a", "BOM'd CSV parses (header cells are trimmed; trim() includes the BOM)");
  let bomJson = "no-crash";
  try { readJson<{ date: string }>("fixtures/attack2/golden-bom.json"); } catch { bomJson = "crash"; }
  if (bomJson === "crash")
    finding("K3b", "P2", "a UTF-8 BOM crashes readJson with a raw SyntaxError",
      "JSON.parse rejects a leading BOM — an Excel-class tool saving the nightly config with a BOM kills the gate at read time with a stack trace. Fix: strip the BOM at the read edge (readJson + readJsonl).");
  else pass("K3b", "BOM'd JSON reads clean");

  // K4: CRLF inside JSONL — a trailing \r must not break per-line JSON.parse
  const rows4 = readJsonl<UsageRow>("fixtures/attack2/usage-crlf.jsonl");
  if (rows4.length === 2 && rows4[0].cachedIn === 600)
    pass("K4", "CRLF-terminated JSONL rows parse (trailing \\r tolerated)");
  else finding("K4", "P2", "CRLF JSONL mis-parsed", `rows=${rows4.length}`);
}

// ===== L. Two-scheduler interleavings ====================================
{
  // L1: two ledgers, same provider — each admits against its own bucket; the
  // combined 2× draw exceeds the provider's real quota. Client-side scheduling
  // is one client's view by design (the provider's meter is the boundary);
  // the check is that the limitation is the documented one, not a silent one.
  const a = new QuotaLedger(), b = new QuotaLedger();
  a.configure({ provider: "anthropic", rpm: 60, tpm: 60_000 }, 0);
  b.configure({ provider: "anthropic", rpm: 60, tpm: 60_000 }, 0);
  const a1 = a.reserve("anthropic", { maxTokens: 0, estimatedPromptTokens: 50_000 }, 0);
  const b1 = b.reserve("anthropic", { maxTokens: 0, estimatedPromptTokens: 50_000 }, 0);
  if (a1 && b1)
    pass("L1", "two schedulers each admit 50k against a 60k quota — the documented per-client boundary (provider meter enforces); one shared scheduler or halved budgets is the fix an operator owns");
  else finding("L1", "P2", "two-scheduler behavior changed unexpectedly", "");

  // L2: two ledgers, one TokenBucket shared? Not a shipped shape — instead:
  // one ledger draining while another reconciles must be independent (no shared state)
  const c = new QuotaLedger();
  c.configure({ provider: "bedrock", tpm: 1000, rpm: 100 }, 0);
  const d = new QuotaLedger();
  d.configure({ provider: "bedrock", tpm: 1_000_000, rpm: 100 }, 0);
  c.reserve("bedrock", { maxTokens: 800, estimatedPromptTokens: 0 }, 0);
  d.reserve("bedrock", { maxTokens: 900_000, estimatedPromptTokens: 0 }, 1);
  d.reconcile("bedrock", { input: 0, cacheWrite: 0, maxTokens: 900_000 }, { input: 0, output: 1_000_000 }, 1); // overrun debit
  if (c.reserve("bedrock", { maxTokens: 300, estimatedPromptTokens: 0 }, 1) === false)
    pass("L2", "ledger c's bucket unaffected by ledger d's overrun debit");
  else finding("L2", "P2", "cross-ledger state leak", "");
}

// ===== M. Unknown model mid-meter: the caller-routing P1 =================
{
  const prices = { m1: { date: "2026-08-27", in: 3, out: 15 } };
  const led = new CacheLedger(prices);
  const turns: Array<[string, { freshIn: number; cachedIn: number; cacheWriteIn: number; out: number }, string]> = [
    ["s", { freshIn: 1_000, cachedIn: 0, cacheWriteIn: 0, out: 10 }, "m1"],
    ["s", { freshIn: 1_000, cachedIn: 0, cacheWriteIn: 0, out: 10 }, "renamed-alias"], // ch16's suspect
    ["s", { freshIn: 1_000, cachedIn: 0, cacheWriteIn: 0, out: 10 }, "m1"],
  ];
  // The shipped continue-path: recordSafe routes the named error to a loud
  // mispriced event (price 0). Probed duck-typed so this suite compiles and
  // records the finding against the UNFIXED tree, then asserts post-fix.
  type SafeLedger = { recordSafe?: (s: string, u: { freshIn: number; cachedIn: number; cacheWriteIn: number; out: number }, m: string) => number };
  const safe = led as unknown as SafeLedger;
  let survived = true; let cost = 0; let mispricedNotes = 0;
  if (typeof safe.recordSafe === "function") {
    try { for (const [s, u, m] of turns) cost += safe.recordSafe(s, u, m); } catch { survived = false; }
    mispricedNotes = led.events.filter((e) => (e as { kind?: string }).kind === "mispriced").length;
  } else survived = false;
  if (survived && mispricedNotes === 1 && cost > 0)
    pass("M1", "the meter loop survives a renamed alias: mispriced event, price 0, loop continues");
  else
    finding("M1", "P1", "no shipped continue-path: an unknown model mid-loop still kills the meter or silently drops the turn",
      `record() throws a named UnknownModelError (iteration-58 fix) but the companion ships no routing surface — the caller must improvise a catch that either kills the loop or drops the turn with no event. ch16's renamed-alias suspect must price 0 + emit a loud mispriced event and let the loop continue. Fix: recordSafe() on CacheLedger (record() keeps the fail-fast contract for callers that want it). Measured: survived=${survived}, mispriced events=${mispricedNotes}.`);

  // M2: record() keeps the fail-fast named-error contract (regression guard)
  let named = false;
  try { led.record("s", { freshIn: 1, cachedIn: 0, cacheWriteIn: 0, out: 0 }, "another-alias"); }
  catch (e) { named = e instanceof UnknownModelError; }
  if (named) pass("M2", "record() still throws the named error for fail-fast callers");
  else finding("M2", "P1", "record() lost its named error", "");
}

console.log(`\nattack2-gate6: ${findings} finding(s)`);
exit(findings > 0 ? 1 : 0);
