# QUALITY REPORT — Inference Engineering (Volume II)

Honest, checkable status of the book against the six-gate editorial system,
per AGENTS.md ("Record honest status in PROGRESS.md and QUALITY_REPORT.md").
Every claim below names its evidence; every gate names its re-verification
command where one exists. Last updated: 2026-08-28, after the appendix-D
technical-edit fix pass (iterations 49–52 of the writing driver; copyedit was
iteration 46).

## 1. Gate ledger

| Gate | Status | Evidence |
|---|---|---|
| Gate 1 — Writer (self-review) | **PASS, all 18 chapters + prologue + appendices A–F + back matter** | Per-chapter Gate-1 logs in PROGRESS.md (structure checklist, numbers audit, fix lists). Structural lint green manuscript-wide: `python3 tools/lint-manuscript.py` → MANUSCRIPT OK, 18/18 chapters, 27 files |
| Gate 2 — Technical editor | **PASS, all 18 chapters; appendix fix-pass in progress (A–E of A–F applied)** | Full review set in `review/` (verdicts: 17 MINOR, 1 MAJOR); every chapter P0/P1/P2 finding applied via driver fix-passes, iterations 28–44 + ch01 post-review polish; citations re-verified against `research/` before each application. Appendix reviews A–F complete 2026-08-28 (all MINOR, P0 = 0, 14 P1 + 27 P2 total); appendix A's 2 P1 + 3 P2, appendix B's 1 P1 + 6 P2, appendix C's 3 P1 + 2 P2, appendix D's 3 P1 + 6 P2, and appendix E's 4 P1 + 6 P2 applied 2026-08-28 (E's P2 Splitwise finding rejected as false positive with evidence: ch03:40 carries the quote) — F queued, last of the sweep |
| Gate 3 — Copyedit | **PASS (2026-08-27, this pass)** | Book-wide style/terminology scan + fixes; see §3 below. Structural conventions verified uniform: 18/18 `## Checkpoint`, `## Where the picture stops`, `## X.1 Words before machinery`; 92× `> **ELI5:**`; 20× `> **Field note.**` book-wide — prologue + every chapter, ch01 carrying two |
| Gate 4 — Visual/code proof | **PASS (machine-verified scope)** | 34/34 mermaid rendered, labels pixel-checked after the iteration-34 foreignObject fix; reflow: every reader-facing code line ≤66 cols, enforced at budget 0 inside `tools/build.sh` (`--check-mermaid` measures the 76 excluded mermaid-source lines). Human-eye typography/page-break sweep belongs to final proof |
| Gate 5 — Code test | **PASS** | `companion/tinyengine`: strict tsc 5.9.3 clean, zero npm deps; two offline suites green — the smoke suite replays the chapters' Break-it/Prove-it cases, and the cadence suite replays the tester role's three nightly gates (golden set, cache-hit gate, invoice reconciliation) over committed fixtures (`cd companion/tinyengine && npm test`); the three operator CLIs run the same gates over the fixtures via `npm run cadence` |
| Gate 6 — Publisher (build) | **PASS, one command** | `tools/build.sh` → EPUB OK 6.0M, validate-epub.py passes, spine/nav carry all 27 files (prologue through back matter). Retail upload additionally requires the Kindle Previewer pass (Appendix F runbook) — **owed, and the only open release item** |

## 2. Numbers discipline

- Every number traces to one of **71 dated digests** in `research/` (all
  retrieved 2026-08-27; 72 files, one undated index) or carries a visible
  hedge ("derived", "illustrative", "community", "approximate").
- Pricing, rate limits, and benchmark results live in dated boxes or
  dated-caption tables, never bare in the durable-prose spine. Spot-swept
  book-wide during copyedit: all sampled non-boxed `$` lines carry dated
  attribution or are labeled derived/illustrative arithmetic.
- Known research-corpus divergences (logged in PROGRESS, digests never
  edited per the repo rule; manuscript follows the primary source):
  - `cache-hit-math-agent-loops.md` internal loop-example arithmetic sums
    to 61,600 against its own claimed ≈55,000 — ch14 recomputes (90,450
    exact under the dated multipliers) and labels it derived.
  - `rate-limit-quota-architectures.md` formula line omits the cache-write
    term its own AWS worked example deducts — ch15/companion follow the
    example; a QuotaLedger smoke test replays it.
  - Medusa-2 lower bound: digests diverge (2.2× vs 2.3×); manuscript
    matches the primary source (2.3×–3.6×, arXiv:2401.10774 v3 abstract).

## 3. Copyedit pass record (2026-08-27)

Scope: book-wide style/terminology scan over all 26 manuscript files,
focused human read of the two never-Gate-2-reviewed surfaces (prologue,
front matter), and normalization fixes:

1. **Closer format normalized** — ch15–18's bolded-paragraph closers
   converted to `### Build it` / `### Break it` / `### Prove it` /
   `### See it in the wild` H3 subsections, matching the ch01–14 majority
   (16 conversions; EPUB verified: 18 `<h3>` closers, 0 bold remnants).
2. **Token-rate unit unified to `tokens/s`** — was mixed 73/14/6 across
   `tokens/s` / `tok/s` (ch18) / `t/s` (ch02 conversion line, Appendix C
   spreads); meaning unchanged, no numeral touched.
3. **`fan-outs` → `fanouts`** (ch07, sole straggler vs 43 uses).
4. **Prologue Field note** converted to the series blockquote form
   (`> **Field note.**`), matching the 19 chapter Field notes.
5. **Front matter freshness**: "sixty-plus … digests" → "seventy-plus"
   (actual: 71 dated); `optimiser` → `optimizer` (sole British spelling;
   book is US: "behavioral", "analyses" as noun only).
6. Formula double-space (ch03 attention-cost display) removed.
7. Scans run clean, no action needed: repeated words (0), double spaces in
   prose (0 post-fix), trailing whitespace (0), smart quotes (0 — straight
   quotes throughout), unspaced em-dashes (0), "in order to" (0), British
   spellings (0 post-fix), `tinyengine` casing (25× lowercase, 0 variants),
   TTL phrasing (numeric "5-minute"/"1-hour" uniform), closers/vocab/
   checkpoint/ELI5/Field-note formats (uniform per §1 Gate 3 row).
   Fluff-word hits reviewed and retained as authorial voice (hedges like
   "essentially all of the model's weights"; the scanner over-triggers on
   book titles such as *Agents That Actually Work*).

## 4. Known residuals (honest list)

1. **Final proof owed**: Kindle Previewer pass on the retail EPUB
   (phone + e-reader profiles) — the only open release item; runbook in
   Appendix F.
2. **Word-count overages**, logged per chapter in PROGRESS rather than
   cut: ch02–ch05 and ch09–ch18 sit 0.4–11% over their STYLE bands, each
   judged content-bearing at draft/Gate-2 time (mechanism + both-sides
   framing would have been the casualty).
3. **76 mermaid-source lines exceed 66 columns by design** — the build
   replaces those fences with images; measurable on demand via
   `python3 tools/reflow-check.py --check-mermaid`.
4. **Field notes are qualitative operator anecdotes** where no
   digest-backed incident exists (ch05, ch15, ch16, ch17, ch18) — each
   mirrors documented mechanics, and says so.
5. **Companion line-count estimates** in ch12–17 Build-its ("roughly N
   lines") vs shipped counts differ −16% to +100% per module; Appendix D
   publishes the honest estimated-vs-shipped table (640 instrument lines
   shipped, plus the 339-line tester cadence beyond the instruments).
6. **Appendix E bibliography is curated, not exhaustive** (~60 of >570
   corpus URLs; the curation rule is published in E.1).

Closed this iteration (were residuals 6 and 7): the tester-cadence scripts
now ship (`golden-set.ts`, `cache-hit-gate.ts`, `invoice-reconcile.ts` +
shared plumbing + fixtures + a second offline test suite), and `tools/verify.sh`
no longer references the Volume I companion — it runs this repo's two suites,
the budget-0 reflow gate, the build, and the validator end-to-end (exit 0 on
this host; external validators skip-announced, STRICT_EXTERNAL=1 escalates
a skip to an error, verified exit 1).

## 5. How to re-verify

```
python3 tools/lint-manuscript.py          # structural lint
python3 tools/reflow-check.py --budget 0  # reader-facing reflow gate
bash tools/verify.sh                      # lint + suites + build + validator
tools/build.sh                            # one-command EPUB (6.0M)
python3 tools/validate-epub.py            # structural validator
cd companion/tinyengine && npm test       # both offline suites (smoke + cadence)
cd companion/tinyengine && npm run cadence  # the three nightly gates over fixtures
ls research/*.md | wc -l                  # 72 files / 71 dated digests
```
