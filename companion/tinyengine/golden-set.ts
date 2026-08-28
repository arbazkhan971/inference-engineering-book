// tinyengine/golden-set.ts — the nightly drift canary.
// Chapter 9's field note: 200 golden extraction tasks run nightly against the
// *pinned variant*, not the router's flavor of the day — the canary that
// "has caught the same drift twice." Chapter 13's rule: quality canaries and
// TTFT canaries, because nothing else sees a quiet quant-tier swap.
//
// This script never calls a model. Your cron replays the tasks and appends
// one JSON row per task to the results file; the gate diffs tonight against
// a dated baseline. A task that passed yesterday and failed tonight is
// DRIFT — a routing change, an undisclosed precision tier, a schema flip —
// and fails loudly even when the overall pass rate still clears its floor,
// because per-task diffs catch the drift that averages away.
//
//   node dist/golden-set.js --tasks fixtures/golden-tasks.json \
//     --results fixtures/golden-results.jsonl \
//     --baseline fixtures/golden-baseline.json
//   node dist/golden-set.js ... --update-baseline   # only after a deliberate
//                                                   # change you have reviewed
import { readJson, readJsonl, flag, has } from "./cadence-io.js";
import { writeFileSync } from "node:fs";
import { argv, exit } from "node:process";

export interface GoldenTask { id: string; tag?: string }
export interface GoldenRow { task: string; ok: boolean; variant?: string; at?: string }
export interface GoldenBaseline {
  date: string;          // the night this reference was recorded
  variant?: string;      // the pinned variant it was recorded against
  floor: number;         // minimum acceptable pass rate
  failing: string[];     // tasks already failing on the baseline night (known)
}

export interface GoldenReport {
  total: number; scored: number; passRate: number; floor: number;
  newFailures: string[]; stillFailing: string[]; fixed: string[]; missing: string[];
  ok: boolean; reasons: string[];
}

export function scoreGolden(
  tasks: GoldenTask[], rows: GoldenRow[], baseline: GoldenBaseline,
  floor = baseline.floor,
): GoldenReport {
  const reasons: string[] = [];
  // A corrupt baseline must be a DRIFT reason, never a silent shape change (attack2 I2):
  // `failing` as a string would spread into characters inside a Set — the gate would run
  // green while diffing task ids against characters. Re-record with --update-baseline.
  if (typeof baseline !== "object" || baseline === null || !Array.isArray(baseline.failing)) {
    reasons.push(`baseline is corrupt (failing is ${typeof baseline?.failing}, expected a list) — re-record with --update-baseline`);
    return { total: tasks.length, scored: 0, passRate: 0, floor,
      newFailures: [], stillFailing: [], fixed: [], missing: [], ok: false, reasons };
  }
  // Duplicate task ids are a config error, not a bigger set (attack2 I1): dedupe and say so —
  // a copy-paste in the task file must never quietly inflate the scored count.
  const seen = new Set<string>(); const dupes = new Set<string>();
  const taskList: GoldenTask[] = [];
  for (const t of tasks) {
    if (seen.has(t.id)) { dupes.add(t.id); continue; }
    seen.add(t.id); taskList.push(t);
  }
  if (dupes.size > 0) reasons.push(`duplicate task id(s) in the set (deduped): ${[...dupes].sort().join(", ")} — fix the task file`);
  const latest = new Map<string, GoldenRow>();       // last row per task wins
  for (const r of rows) latest.set(r.task, r);
  const missing = taskList.filter((t) => !latest.has(t.id)).map((t) => t.id);
  const failed = new Set(
    taskList.filter((t) => latest.get(t.id)?.ok === false).map((t) => t.id));
  const scored = taskList.length - missing.length;
  const passRate = scored === 0 ? 0 : (scored - failed.size) / scored;
  const baseFailing = new Set(baseline.failing);
  const taskIds = new Set(taskList.map((t) => t.id));
  const newFailures = [...failed].filter((id) => !baseFailing.has(id)).sort();
  const stillFailing = [...failed].filter((id) => baseFailing.has(id)).sort();
  // Only a task still in the set can be "fixed" (gate-6 D1): a retired task greeting the
  // operator as a victory every night is the canary lying in the other direction.
  const fixed = [...baseFailing].filter((id) => !failed.has(id) && taskIds.has(id)).sort();
  if (!Number.isFinite(floor))
    reasons.push(`floor is not a finite number (${floor}) — misconfigured gate, refusing to pass silently (gate-6 D2)`);
  if (missing.length > 0)
    reasons.push(`${missing.length} task(s) scored no row — the set did not run: ${missing.join(", ")}`);
  if (newFailures.length > 0)
    reasons.push(`new failure(s) vs baseline ${baseline.date}: ${newFailures.join(", ")}`);
  if (passRate < floor)
    reasons.push(`pass rate ${(passRate * 100).toFixed(1)}% is below the floor ${(floor * 100).toFixed(1)}%`);
  return { total: tasks.length, scored, passRate, floor,
    newFailures, stillFailing, fixed, missing,
    ok: reasons.length === 0, reasons };
}

/** Record tonight as the new dated baseline (what --update-baseline writes). */
export function makeBaseline(
  date: string, tasks: GoldenTask[], rows: GoldenRow[], floor: number, variant?: string,
): GoldenBaseline {
  const latest = new Map<string, GoldenRow>();
  for (const r of rows) latest.set(r.task, r);
  return { date, variant, floor,
    failing: tasks.filter((t) => latest.get(t.id)?.ok === false)
      .map((t) => t.id).sort() };
}

export function main(): void {
  const tasksPath = flag("tasks"), resultsPath = flag("results"), baselinePath = flag("baseline");
  if (!tasksPath || !resultsPath || !baselinePath) {
    console.error("usage: golden-set.js --tasks F --results F --baseline F [--floor 0.9] [--update-baseline]");
    exit(2);
  }
  const tasks = readJson<GoldenTask[]>(tasksPath);
  const rows = readJsonl<GoldenRow>(resultsPath);
  const baseline = readJson<GoldenBaseline>(baselinePath);
  // A typo'd --floor (o.9) must fail the invocation loudly (gate-6 D2): Number("o.9") is NaN,
  // and a NaN floor silently disables the pass-rate comparison. A floor outside [0, 1] is the
  // same misconfiguration one typo over (attack2 J2): 1.5 can never clear, 0 always does.
  // Exit 2 = your invocation is wrong.
  const floorRaw = flag("floor");
  if (floorRaw !== undefined && !Number.isFinite(Number(floorRaw))) {
    console.error(`--floor must be a finite number between 0 and 1 (got '${floorRaw}') — refusing to disable the floor gate by typo`);
    exit(2);
  }
  if (floorRaw !== undefined && (Number(floorRaw) < 0 || Number(floorRaw) > 1)) {
    console.error(`--floor must be between 0 and 1 (got '${floorRaw}') — a floor you can never clear or never fail is a misconfigured gate`);
    exit(2);
  }
  const floor = floorRaw !== undefined ? Number(floorRaw) : baseline.floor;
  const r = scoreGolden(tasks, rows, baseline, floor);
  console.log(`golden set: ${r.scored}/${r.total} scored, ` +
    `pass rate ${(r.passRate * 100).toFixed(1)}% ` +
    `(floor ${(floor * 100).toFixed(1)}%, baseline ${baseline.date})`);
  if (r.fixed.length > 0) console.log(`  fixed since baseline: ${r.fixed.join(", ")}`);
  if (r.stillFailing.length > 0)
    console.log(`  still failing (known, in baseline): ${r.stillFailing.join(", ")}`);
  for (const reason of r.reasons) console.error(`  DRIFT: ${reason}`);
  if (has("update-baseline") && r.missing.length === 0) {
    const b = makeBaseline(new Date().toISOString().slice(0, 10), tasks, rows, floor);
    writeFileSync(baselinePath, JSON.stringify(b, null, 2) + "\n");
    console.log(`baseline updated -> ${baselinePath} (tonight is the new dated reference)`);
  }
  exit(r.ok ? 0 : 1);
}

if (argv[1] !== undefined && argv[1].endsWith("golden-set.js")) main();
