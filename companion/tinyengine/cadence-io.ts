// tinyengine/cadence-io.ts — shared plumbing for the three tester-cadence CLIs
// (Appendix D.8): argv flags plus JSON/JSONL/CSV reads. Deliberately tiny and
// deliberately not a CSV library — no quoted commas, no embedded newlines.
// Provider invoice exports vary their columns by the month; map yours to the
// shapes these scripts expect at your cron layer, where the mapping is visible.
import { readFileSync } from "node:fs";
import { argv } from "node:process";

/** Value of --name (the next argv entry), or undefined when absent. */
export function flag(name: string): string | undefined {
  const i = argv.indexOf(`--${name}`);
  return i >= 0 ? argv[i + 1] : undefined;
}

/** True when the bare flag --name is present (value-less switches). */
export function has(name: string): boolean {
  return argv.includes(`--${name}`);
}

/** Strip a UTF-8 BOM if present — JSON.parse rejects it outright (attack2 K3b),
 *  and a BOM'd first cell would silently mis-key a CSV header. */
const deBom = (s: string): string => (s.charCodeAt(0) === 0xfeff ? s.slice(1) : s);

export function readJson<T>(path: string): T {
  return JSON.parse(deBom(readFileSync(path, "utf-8"))) as T;
}

/** One JSON object per non-empty line — the append-only nightly format. */
export function readJsonl<T>(path: string): T[] {
  return deBom(readFileSync(path, "utf-8"))
    .split("\n")
    .filter((line) => line.trim() !== "")
    .map((line) => JSON.parse(line) as T);
}

/** Simple CSV with a header row: [{col: "value", ...}, ...]. */
export function readCsv(path: string): Record<string, string>[] {
  const lines = readFileSync(path, "utf-8")
    .split(/\r?\n/)
    .filter((line) => line.trim() !== "");
  const header = lines[0].split(",").map((h) => h.trim());
  return lines.slice(1).map((line) => {
    const cells = line.split(",").map((c) => c.trim());
    const row: Record<string, string> = {};
    header.forEach((h, i) => (row[h] = cells[i] ?? ""));
    return row;
  });
}
