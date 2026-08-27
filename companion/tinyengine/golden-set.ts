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
  const latest = new Map<string, GoldenRow>();       // last row per task wins
  for (const r of rows) latest.set(r.task, r);
  const missing = tasks.filter((t) => !latest.has(t.id)).map((t) => t.id);
  const failed = new Set(
    tasks.filter((t) => latest.get(t.id)?.ok === false).map((t) => t.id));
  const scored = tasks.length - missing.length;
  const passRate = scored === 0 ? 0 : (scored - failed.size) / scored;
  const baseFailing = new Set(baseline.failing);
  const newFailures = [...failed].filter((id) => !baseFailing.has(id)).sort();
  const stillFailing = [...failed].filter((id) => baseFailing.has(id)).sort();
  const fixed = [...baseFailing].filter((id) => !failed.has(id)).sort();
  const reasons: string[] = [];
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
  const floor = flag("floor") !== undefined ? Number(flag("floor")) : baseline.floor;
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
