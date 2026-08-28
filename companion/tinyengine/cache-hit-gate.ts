// tinyengine/cache-hit-gate.ts — the nightly cache-hit gate.
// Chapter 14: the cache-hit rate is "a first-class production metric" —
// cached tokens ÷ (cached + fresh input) — and the usage identity from
// chapter 12 (total input = reads + writes + fresh) is what makes it exact.
// Claude Code treats hit-rate drops as SEVs; this gate is the cron-shaped
// version of that culture. A deploy that changes one template token shows up
// here in minutes; the invoice shows it a month later.
//
// Input: one JSON row per request — the usage object chapter 12's normalizer
// already emits, plus the model id. Write tokens are reported (re-admissions
// at 1.25× are the money event) but excluded from the rate, matching the
// book's formula. Models with fewer than --min-rows rows are reported but
// not gated: thin data is noise, not signal.
//
//   node dist/cache-hit-gate.js --usage fixtures/usage-day.jsonl --floor 0.6
import { readJsonl, flag } from "./cadence-io.js";
import { argv, exit } from "node:process";
import type { Usage } from "./cache-ledger.js";

export interface UsageRow extends Usage { model: string }

export interface ModelHits {
  model: string; rows: number; cached: number; fresh: number; writes: number;
  hitRate: number; gated: boolean; belowFloor: boolean;
}

export interface HitReport {
  models: ModelHits[]; overallHitRate: number; floor: number; minRows: number;
  ok: boolean; reasons: string[];
}

export function gateHits(rows: UsageRow[], floor: number, minRows: number): HitReport {
  const reasons: string[] = [];
  // A non-finite floor or min-rows silently disables the gate (attack2 J3/J4 — the
  // round-1 D2 class in this gate): `hitRate < NaN` is always false and `rows >= NaN`
  // never gates, so a typo'd flag turns chapter 14's first-class metric into a no-op.
  // Refuse loudly instead.
  if (!Number.isFinite(floor))
    reasons.push(`floor is not a finite number (${floor}) — misconfigured gate, refusing to pass silently`);
  if (!Number.isFinite(minRows))
    reasons.push(`min-rows is not a finite number (${minRows}) — misconfigured gate, refusing to pass silently`);
  const byModel = new Map<string, UsageRow[]>();
  for (const r of rows) {
    const list = byModel.get(r.model) ?? [];
    list.push(r);
    byModel.set(r.model, list);
  }
  const models: ModelHits[] = [...byModel.entries()].map(([model, list]) => {
    const cached = list.reduce((a, r) => a + r.cachedIn, 0);
    const fresh = list.reduce((a, r) => a + r.freshIn, 0);
    const writes = list.reduce((a, r) => a + r.cacheWriteIn, 0);
    const denom = cached + fresh;                    // the book's denominator —
    return {                                         // writes priced, not rated
      model, rows: list.length, cached, fresh, writes,
      hitRate: denom === 0 ? 1 : cached / denom,
      gated: list.length >= minRows, belowFloor: false,
    };
  }).sort((a, b) => b.rows - a.rows);
  for (const m of models) {
    m.belowFloor = m.hitRate < floor;
    if (m.gated && m.belowFloor)
      reasons.push(`${m.model}: hit rate ${(m.hitRate * 100).toFixed(1)}% ` +
        `is below the floor ${(floor * 100).toFixed(1)}% over ${m.rows} rows`);
  }
  const all = rows.reduce((a, r) => a + r.cachedIn + r.freshIn, 0);
  const overall = all === 0 ? 1 : rows.reduce((a, r) => a + r.cachedIn, 0) / all;
  if (rows.length >= minRows && overall < floor)
    reasons.push(`overall hit rate ${(overall * 100).toFixed(1)}% is below the floor ${(floor * 100).toFixed(1)}%`);
  return { models, overallHitRate: overall, floor, minRows,
    ok: reasons.length === 0, reasons };
}

export function main(): void {
  const usagePath = flag("usage");
  if (!usagePath || flag("floor") === undefined) {
    console.error("usage: cache-hit-gate.js --usage F --floor 0.6 [--min-rows 20]");
    exit(2);
  }
  const floor = Number(flag("floor"));
  const minRowsRaw = flag("min-rows");
  const minRows = minRowsRaw !== undefined ? Number(minRowsRaw) : 20;
  // Typo'd flags exit 2 instead of silently disabling the gate (attack2 J3/J4):
  // --floor o.6 or --min-rows twenty must fail the invocation, not the check's purpose.
  if (!Number.isFinite(floor) || floor < 0 || floor > 1) {
    console.error(`--floor must be a finite number between 0 and 1 (got '${flag("floor")}') — refusing to disable the gate by typo`);
    exit(2);
  }
  if (minRowsRaw !== undefined && !Number.isFinite(minRows)) {
    console.error(`--min-rows must be a finite number (got '${minRowsRaw}') — refusing to un-gate every model by typo`);
    exit(2);
  }
  const r = gateHits(readJsonl<UsageRow>(usagePath), floor, minRows);
  console.log(`cache-hit gate: overall ${(r.overallHitRate * 100).toFixed(1)}% ` +
    `(floor ${(floor * 100).toFixed(1)}%, min ${minRows} rows/model)`);
  for (const m of r.models)
    console.log(`  ${m.model}: ${(m.hitRate * 100).toFixed(1)}% over ${m.rows} rows` +
      `${m.gated ? "" : " (thin — reported, not gated)"}` +
      `, re-admissions ${(m.writes / 1e6).toFixed(2)}M tokens`);
  for (const reason of r.reasons) console.error(`  SEV: ${reason}`);
  exit(r.ok ? 0 : 1);
}

if (argv[1] !== undefined && argv[1].endsWith("cache-hit-gate.js")) main();
