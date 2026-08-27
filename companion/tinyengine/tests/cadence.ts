// Cadence tests — the tester role's three nightly instruments (Appendix D.8):
// the golden set (ch. 9's drift canary), the cache-hit gate (ch. 14's
// first-class metric), and invoice reconciliation (ch. 16's daily rule).
// Offline like the rest: the fixture files are the happy paths; inline
// objects are the drift cases the gates exist to catch.
import assert from "node:assert/strict";
import { scoreGolden, makeBaseline, type GoldenTask, type GoldenRow, type GoldenBaseline } from "../golden-set.js";
import { gateHits, type UsageRow } from "../cache-hit-gate.js";
import { reconcile, invoiceFromCsv, type MeterRow, type InvoiceRow } from "../invoice-reconcile.js";
import { readJson, readJsonl, readCsv } from "../cadence-io.js";

// ---- The golden set: per-task drift the pass rate would average away -----------------
{
  const tasks = readJson<GoldenTask[]>("fixtures/golden-tasks.json");
  const rows = readJsonl<GoldenRow>("fixtures/golden-results.jsonl");
  const baseline = readJson<GoldenBaseline>("fixtures/golden-baseline.json");
  // ex-007 fails on both nights (known); ex-011 is new (drift); pass rate 83.3%
  // is still below the 0.9 floor — but the per-task diff is the finding either way.
  const r = scoreGolden(tasks, rows, baseline);
  assert.equal(r.scored, 12);
  assert.ok(Math.abs(r.passRate - 10 / 12) < 1e-9);
  assert.deepEqual(r.newFailures, ["ex-011"], "the new failure is the drift");
  assert.deepEqual(r.stillFailing, ["ex-007"]);
  assert.equal(r.ok, false, "new failure fails the gate even though it is one task");
  // Same night, ex-011 passing: 11/12 = 91.7% clears the 0.9 floor, and a
  // known failure is not a page — only new failures or floor breaches are.
  const known = scoreGolden(tasks, rows.filter((x) => x.task !== "ex-011").concat(
    [{ task: "ex-011", ok: true }]), baseline);
  assert.equal(known.ok, true);
  assert.equal(known.reasons.length, 0);
  // Floor breach without any new failure: both failures already in the baseline,
  // 10/12 = 83.3% under the 0.9 floor — the floor is the finding, not the diff.
  const floored = scoreGolden(tasks, rows, { ...baseline, failing: ["ex-007", "ex-011"] });
  assert.equal(floored.ok, false);
  assert.equal(floored.newFailures.length, 0);
  assert.equal(floored.reasons.length, 1);
  assert.ok(floored.reasons[0].includes("below the floor"));
  // Coverage gap: a night the set did not run is not a pass.
  const short = scoreGolden(tasks, rows.slice(0, 5), baseline, 0.5);
  assert.deepEqual(short.missing.length, 7);
  assert.equal(short.ok, false);
  // Updating the baseline records tonight's failures and the date, nothing else.
  const b2 = makeBaseline("2026-08-27", tasks, rows, 0.9, "pinned/sonnet-4.6@fp8-host-a");
  assert.equal(b2.date, "2026-08-27");
  assert.deepEqual(b2.failing, ["ex-007", "ex-011"]);
}

// ---- The cache-hit gate: ch. 14's metric, thin data not gated ------------------------
{
  const rows = readJsonl<UsageRow>("fixtures/usage-day.jsonl");
  const r = gateHits(rows, 0.6, 20);
  // sonnet: 242,000 cached / (242,000 + 85,000 fresh) — writes excluded per the formula.
  const sonnet = r.models.find((m) => m.model === "sonnet-4.6");
  assert.ok(sonnet && Math.abs(sonnet.hitRate - 242000 / 327000) < 1e-9);
  assert.equal(sonnet!.rows, 60);
  assert.equal(sonnet!.writes, 6 * 5500, "re-admissions reported, not rated");
  // haiku: 0% over 5 rows — thin, so reported but not gated.
  const haiku = r.models.find((m) => m.model === "haiku-4.5");
  assert.ok(haiku && haiku.hitRate === 0 && !haiku.gated);
  assert.equal(r.ok, true, "floors met where data is thick");
  assert.ok(Math.abs(r.overallHitRate - 352400 / 487000) < 1e-9);
  // Now the drift night: deploy invalidated the fleet's prefixes — sonnet sags.
  const badNight = rows.map((x) => x.model === "sonnet-4.6"
    ? { ...x, cachedIn: 0, freshIn: x.freshIn + x.cachedIn } : x);
  const bad = gateHits(badNight, 0.6, 20);
  assert.equal(bad.ok, false);
  assert.ok(bad.reasons.some((s) => s.startsWith("sonnet-4.6")), "per-model SEV named");
  assert.ok(bad.reasons.some((s) => s.startsWith("overall")), "overall floor also trips");
  // A thin model below floor stays ungated — noise is not signal.
  const thinOnly = gateHits(rows.filter((x) => x.model === "haiku-4.5"), 0.6, 20);
  assert.equal(thinOnly.ok, true);
}

// ---- Invoice reconciliation: daily, drift is a schema change -------------------------
{
  const meter = readJsonl<MeterRow>("fixtures/meter-day.jsonl");
  const invoice = invoiceFromCsv(readCsv("fixtures/invoice-day.csv"));
  const r = reconcile(meter, invoice, 0.02);
  assert.equal(r.ok, true, "all lines within ±2%");
  const sonnet = r.lines.find((l) => l.model === "sonnet-4.6");
  assert.ok(sonnet && Math.abs(sonnet.gapUsd - (1.3486 - 1.35135)) < 1e-9);
  const tie = r.lines.find((l) => l.model === "gpt-5.6-sol");
  assert.ok(tie && Math.abs(tie.gapUsd) < 1e-9, "an exact tie reports a zero gap");
  // The four suspects, by symptom (ch. 16's taxonomy):
  // 1. only on the meter — batch usage lands up to 24 h late.
  const late = reconcile(meter.concat([{ model: "gpt-5.6-batch", freshIn: 2_000_000,
    cacheWriteIn: 0, cachedIn: 0, out: 500_000, costUsd: 5.625 }]), invoice, 0.02);
  assert.equal(late.ok, false);
  assert.deepEqual(late.onlyMeter, ["gpt-5.6-batch"]);
  // 2. only on the invoice — a bucket the meter does not know.
  const unknown = reconcile(meter, invoice.concat([{ model: "glm-5.3-flash",
    inputTokens: 900_000, outputTokens: 10_000, cachedTokens: 0, amountUsd: 0.30 }]), 0.02);
  assert.equal(unknown.ok, false);
  assert.deepEqual(unknown.onlyInvoice, ["glm-5.3-flash"]);
  // 3./4. amount drift — stale price map or tokenizer mismatch, beyond tolerance.
  const stale = reconcile(meter, invoice.map((x) => x.model === "haiku-4.5"
    ? { ...x, amountUsd: x.amountUsd * 1.05 } : x), 0.02);
  assert.equal(stale.ok, false);
  const hk = stale.lines.find((l) => l.model === "haiku-4.5");
  assert.ok(hk && !hk.withinTolerance && hk.suspect !== undefined);
}

console.log("tinyengine: cadence tests green");
