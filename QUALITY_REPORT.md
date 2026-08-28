# QUALITY REPORT — Inference Engineering (Volume II)

Honest, checkable status of the book against the six-gate editorial system,
per AGENTS.md ("Record honest status in PROGRESS.md and QUALITY_REPORT.md").
Every claim below names its evidence; every gate names its re-verification
command where one exists. Last updated: 2026-08-28, after the pedagogy
wave opened (beginner-simulation audits in review/ped/); this pass
(iteration 62) applied all 12 ch01 findings — zero [LOST], 4 [CONFUSING]
(Token defined in the 1.1 table, the KV-caching gloss de-jargoned,
"Pareto frontier" replaced with the plain trade-off, throughput glossed
at true first use) and 8 [POLISH] (HTTP 200 anchor, venue glosses,
citation walls moved to Appendix E, forward pointer, Build-it on-ramp
for the no-codebase reader, scope sentence broken into three beats,
analogy bridges) — ch02+ remain queued in chapter order. Previously:
the gate-6 clean-checkout-build P2 pass (iteration 61 of the writing driver) applied
the three hygiene findings that iteration 60's seal had left unqueued
(review/gate6-clean-build.md — cover-render mtime guard so a stranger's
first build keeps a clean tree, stale README status table refreshed to the
sealed state, Volume-I temp-file prefix fixed) and re-sealed the release
candidate; full history below. Previously: the gate-6 companion-attack P2
pass (iteration 60) closed the companion queue; full history below.
Previously: the appendix-E and appendix-F technical-edit fix passes
(iterations 49–54, closing Gate 2 across chapters and appendices;
copyedit was iteration 46), and
re-verified post-seal in iteration 55: first figures-on retail build from
the exact final text (EPUB 6,282,581 bytes, 34/34 mermaid, 0 degraded),
fresh strict tsc recompile + both companion suites green, `tools/verify.sh`
ALL OFFLINE CHECKS PASSED, and a full rebuild left the working tree
byte-clean — zero drift against the sealed commit. Re-verified again at
iteration 56 (driver re-invoked, queue empty): `tools/verify.sh` ALL
OFFLINE CHECKS PASSED end-to-end, the EPUB rebuilt byte-identical
(6,282,581 bytes) with the tree clean apart from two ledger-accuracy
fixes made that pass (EDITORIAL_SYSTEM's final-proof row had kept
calling copyedit a pending gate though it passed 2026-08-27; §4's "closed
this iteration" was undated) — no manuscript, figure, or companion file
changed; the seal stands. Iteration 57 then re-opened the seal under the
architect's gate-6 queue: the adversarial claims + xref wave (committed
2026-08-28) found 0 P0 / 5 P1 / 11 P2; all five P1s were applied with
recompute discipline (see the Gate 2 row and Appendix F.1), validation
green afterwards (lint OK 113,707 words, reflow budget 0, 34/34 figures,
EPUB 6,282,454 bytes, validator passes, both companion suites green from
the unchanged dist), and the eleven P2s remain queued — the candidate
re-seals when that pass lands. Iteration 58 then applied the gate-6
companion attack's seven P1s (review/gate6-companion-attack.md): the
stream loop survives non-object payloads, non-numeric usage flags
`incomplete` instead of NaN, reservations are atomic, Bedrock overruns
are debited (ch15 Build-it + Appendix D updated to the both-ways
reconcile), unknown models throw a named `UnknownModelError`, the
ledger's hitRate now equals the gate's formula by construction, and
duplicate money rows sum on both sides — key repros wired into both
companion suites, strict tsc clean, suites green across repeated runs;
ten companion P2s stay queued — the last queue before re-seal, the
wave-1 P2s having landed in iteration 59 (twelve applied, two false
positives rejected with evidence — the OPT-13B figure is exactly the
book's own formula under the paper's real config, and vLLM's V1
max_num_seqs default is 128 per the dated digest and a live-source
check — one already fixed, one no-fix by judgment; details in the
Gate 2 row and Appendix F.1), validation green afterwards: lint OK
114,506 words, reflow budget 0, 34/34 mermaid staged 0 degraded, EPUB
6,284,622 bytes, validator passes, verify.sh ALL OFFLINE CHECKS PASSED
with both companion suites green from the unchanged dist. Iteration 60 then
applied the companion attack's ten P2s (the last open queue): stream-
normalizer — first-stop-wins dedup on repeated finish chunks, Anthropic
deltas keyed by block index with orphan deltas skipped, non-object tool
arguments rejected via an object guard at the accumulator (JSON-text
string args still parse leniently); scheduler/ledger — reservation fields
clamped at the door, the token bucket ignores a backwards clock, usage
clamps non-negative at the meter's edge with a noted event, read+write
turns log both events with costs that sum to the turn; golden-set — a
retired task is never reported fixed and a non-finite --floor fails the
invocation (exit 2). All ten attacks now HELD at the fixed tree (the
fourteen previously-held attacks still hold; C1's by-construction print
is the documented exception whose gate lives in smoke), key repros wired
into both suites, Appendix D/ch12/ch18/README updated to the shipped
behavior (six modules now 728 lines vs the 720 estimate sum, both
stated), strict tsc clean, suites green across repeated runs, and the
full validation chain green — the gate-6 queue is closed and the
release candidate re-seals with this pass. Remaining gate: final proof
(Kindle Previewer) — human, at upload time.

## 1. Gate ledger

| Gate | Status | Evidence |
|---|---|---|
| Gate 1 — Writer (self-review) | **PASS, all 18 chapters + prologue + appendices A–F + back matter** | Per-chapter Gate-1 logs in PROGRESS.md (structure checklist, numbers audit, fix lists). Structural lint green manuscript-wide: `python3 tools/lint-manuscript.py` → MANUSCRIPT OK, 18/18 chapters, 27 files |
| Gate 2 — Technical editor | **PASS, all 18 chapters + appendices A–F** | Full review set in `review/` (verdicts: 17 MINOR, 1 MAJOR); every chapter P0/P1/P2 finding applied via driver fix-passes, iterations 28–44 + ch01 post-review polish; citations re-verified against `research/` before each application. Appendix reviews A–F complete 2026-08-28 (all MINOR, P0 = 0, 14 P1 + 27 P2 total); every appendix finding applied via the appendix fix-pass, iterations 49–54, one appendix per iteration: A 2 P1 + 3 P2, B 1 P1 + 6 P2, C 3 P1 + 2 P2, D 3 P1 + 6 P2, E 4 P1 + 6 P2 (one P2 rejected as false positive with evidence: ch03:40 carries the quote), F 1 P1 + 3 P2 — sweep complete, Gate 2 closed. Post-seal, the architect's gate-6 adversarial wave (claims falsifiers + book-wide xref audit, 2026-08-28: 0 P0 / 5 P1 / 11 P2) was applied under the same discipline: all 5 P1s recomputed against digests/code and applied 2026-08-28 with ripple-greps (details in Appendix F.1); the P2
pass landed 2026-08-28 (iteration 59) under the same discipline — twelve
of the sixteen outstanding P2s applied with recompute-and-ripple, two
rejected as false positives with evidence, one already fixed by the
companion pass, one no-fix by judgment — and the wave is closed. The
gate-6 companion attack (0 P0 / 7 P1 / 11 P2) is fully settled too:
all 7 P1s applied 2026-08-28 (iteration 58) and all 10 surviving P2s
applied 2026-08-28 (iteration 60) with repros wired into the suites
and the attack file held as regression evidence. The gate-6
clean-checkout build attack (0 P0 / 0 P1 / 3 P2) — committed before the
seal but left out of iteration 60's queue accounting — is settled at
iteration 61: the cover render gained render-mermaid's mtime guard (a
stranger's first build no longer dirties the committed cover pair), the
README status table refreshed to the sealed state, and the Volume-I
temp-file prefix fixed; both guard paths verified live and the full
build/verify chain green — the gate-6 queue is now closed in full
(details in Appendix F.1's three gate-6 rows) |
| Gate 3 — Copyedit | **PASS (2026-08-27, this pass)** | Book-wide style/terminology scan + fixes; see §3 below. Structural conventions verified uniform: 18/18 `## Checkpoint`, `## Where the picture stops`, `## X.1 Words before machinery`; 92× `> **ELI5:**`; 20× `> **Field note.**` book-wide — prologue + every chapter, ch01 carrying two |
| Gate 4 — Visual/code proof | **PASS (machine-verified scope)** | 34/34 mermaid rendered, labels pixel-checked after the iteration-34 foreignObject fix; reflow: every reader-facing code line ≤66 cols, enforced at budget 0 inside `tools/build.sh` (`--check-mermaid` measures the 76 excluded mermaid-source lines). Human-eye typography/page-break sweep belongs to final proof |
| Gate 5 — Code test | **PASS** | `companion/tinyengine`: strict tsc 5.9.3 clean, zero npm deps; two offline suites green — the smoke suite replays the chapters' Break-it/Prove-it cases plus the gate-6 attack repros as regressions (P1 set from iteration 58, P2 set from iteration 60), and the cadence suite replays the tester role's three nightly gates (golden set, cache-hit gate, invoice reconciliation, duplicate-row, formula-agreement, retired-task and non-finite-floor regressions) over committed fixtures (`cd companion/tinyengine && npm test`); the three operator CLIs run the same gates over the fixtures via `npm run cadence`; the gate-6 companion attack fully applied (7 P1s + 10 P2s, 2026-08-28) with `tests/attack-gate6.ts` kept as regression evidence — 10/10 P2 attacks HELD at the fixed tree, all 14 previously-held attacks still hold, C1 reports by construction on any throw (documented; its gate lives in smoke's `assert.throws(UnknownModelError)`) |
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

Closed at iteration 47 (were residuals 6 and 7): the tester-cadence scripts
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
