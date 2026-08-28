// tinyengine/invoice-reconcile.ts — daily meter-vs-invoice reconciliation.
// Chapter 16's metering rule: reconcile daily, and treat unexplained drift as
// a schema change, not noise. The four usual suspects, by symptom:
//   only on the meter   — batch usage landing up to 24 h late (check the
//                         pending-jobs column before paging), or a retry
//                         wrapper stripping usage so the meter estimated
//   only on the invoice — a bucket the meter does not know: new model,
//                         renamed alias, traffic routing around the meter
//   amount drift        — stale price map after a provider update, or the
//                         provider billing by its tokenizer while your
//                         estimate used a heuristic
// Provider billing wins ties (chapter 1's rule): the gap is reported signed
// as invoice − meter, never silently trusted to either side. A gap that
// grows across days is field drift announcing itself. Duplicate rows —
// retries/partial exports on the invoice side, a cron overlap writing the
// meter twice — are summed before comparison; money is never dropped.
//
//   node dist/invoice-reconcile.js --meter fixtures/meter-day.jsonl \
//     --invoice fixtures/invoice-day.csv --tolerance 0.02
import { readJsonl, readCsv, flag } from "./cadence-io.js";
import { argv, exit } from "node:process";

export interface MeterRow {   // the day's CacheLedger four-term totals per model
  model: string; freshIn: number; cacheWriteIn: number; cachedIn: number;
  out: number; costUsd: number;
}
export interface InvoiceRow { // one line of the provider's CSV export
  model: string; inputTokens: number; outputTokens: number;
  cachedTokens: number; amountUsd: number;
}

export interface ReconcileLine {
  model: string; meterUsd: number; invoiceUsd: number;
  gapUsd: number; gapPct: number; withinTolerance: boolean;
  suspect?: string;
}

export interface ReconcileReport {
  lines: ReconcileLine[]; onlyMeter: string[]; onlyInvoice: string[];
  tolerance: number; ok: boolean;
}

const pct = (gap: number, invoice: number) =>
  invoice === 0 ? (gap === 0 ? 0 : Infinity) : gap / invoice;

/** Parse the CSV shape the fixtures use; map your export's columns first. */
export function invoiceFromCsv(rows: Record<string, string>[]): InvoiceRow[] {
  return rows.map((r) => ({
    model: r.model,
    inputTokens: Number(r.input_tokens),
    outputTokens: Number(r.output_tokens),
    cachedTokens: Number(r.cached_tokens),
    amountUsd: Number(r.amount_usd),
  }));
}

export function reconcile(
  meter: MeterRow[], invoice: InvoiceRow[], tolerance: number,
): ReconcileReport {
  // Duplicate rows SUM on both sides, never last-win (gate-6 E1/E2): provider CSV exports
  // carry retry/partial duplicates, and a cron overlap writes the meter JSONL twice. A
  // last-wins map made $5.00 of real spend invisible — and flipped the gap's sign.
  const meterBy = new Map<string, MeterRow>();
  for (const m of meter) {
    const a = meterBy.get(m.model);
    if (a) { a.freshIn += m.freshIn; a.cacheWriteIn += m.cacheWriteIn; a.cachedIn += m.cachedIn; a.out += m.out; a.costUsd += m.costUsd; }
    else meterBy.set(m.model, { ...m });
  }
  const invoiceBy = new Map<string, InvoiceRow>();
  for (const i of invoice) {
    const a = invoiceBy.get(i.model);
    if (a) { a.inputTokens += i.inputTokens; a.outputTokens += i.outputTokens; a.cachedTokens += i.cachedTokens; a.amountUsd += i.amountUsd; }
    else invoiceBy.set(i.model, { ...i });
  }
  const onlyMeter = [...meterBy.keys()]
    .filter((m) => !invoiceBy.has(m)).sort();
  const onlyInvoice = [...invoiceBy.keys()]
    .filter((m) => !meterBy.has(m)).sort();
  const lines: ReconcileLine[] = [];
  for (const [model, m] of meterBy) {
    const inv = invoiceBy.get(model);
    if (inv === undefined) continue;
    const gapUsd = inv.amountUsd - m.costUsd;
    const gap = pct(gapUsd, inv.amountUsd);
    lines.push({
      model, meterUsd: m.costUsd, invoiceUsd: inv.amountUsd,
      gapUsd, gapPct: gap, withinTolerance: Math.abs(gap) <= tolerance,
      suspect: Math.abs(gap) > tolerance
        ? "stale price map, or provider tokenizer vs your estimate"
        : undefined,
    });
  }
  lines.sort((a, b) => Math.abs(b.gapPct) - Math.abs(a.gapPct));
  const ok = onlyMeter.length === 0 && onlyInvoice.length === 0
    && lines.every((l) => l.withinTolerance);
  return { lines, onlyMeter, onlyInvoice, tolerance, ok };
}

export function main(): void {
  const meterPath = flag("meter"), invoicePath = flag("invoice");
  if (!meterPath || !invoicePath) {
    console.error("usage: invoice-reconcile.js --meter F --invoice F [--tolerance 0.02]");
    exit(2);
  }
  const tolerance = flag("tolerance") !== undefined ? Number(flag("tolerance")) : 0.02;
  const r = reconcile(readJsonl<MeterRow>(meterPath),
    invoiceFromCsv(readCsv(invoicePath)), tolerance);
  console.log(`invoice reconciliation: tolerance ±${(tolerance * 100).toFixed(1)}%` +
    ` — provider billing wins ties; gaps are invoice − meter`);
  for (const l of r.lines)
    console.log(`  ${l.model}: meter $${l.meterUsd.toFixed(2)} vs invoice ` +
      `$${l.invoiceUsd.toFixed(2)} (gap ${l.gapUsd >= 0 ? "+" : ""}` +
      `${l.gapUsd.toFixed(2)}, ${(l.gapPct * 100).toFixed(2)}%)` +
      `${l.withinTolerance ? "" : ` — ${l.suspect}`}`);
  for (const m of r.onlyMeter)
    console.error(`  DRIFT: ${m} on the meter only — batch usage up to 24 h late ` +
      `(check pending jobs), or usage stripped so the meter estimated`);
  for (const m of r.onlyInvoice)
    console.error(`  DRIFT: ${m} on the invoice only — a bucket the meter does not ` +
      `know: new model, renamed alias, or traffic routing around the meter`);
  exit(r.ok ? 0 : 1);
}

if (argv[1] !== undefined && argv[1].endsWith("invoice-reconcile.js")) main();
