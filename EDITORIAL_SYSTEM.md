# Editorial system

This project uses explicit roles in sequence. A later role may return work to an
earlier role; no role may silently waive a gate.

## 1. Architect

Owns the reader promise, chapter dependency graph, running-project milestones,
timeless-versus-current separation, and definition of done.

Artifacts:

- GOAL.md
- chapter map
- capability ladder
- claim ledger

## 2. Writer

Writes for two layers at once:

- **surface layer:** analogy, story, plain words, visible outcome;
- **depth layer:** contracts, algorithms, failure modes, code, trade-offs.

The writer must not invent facts to improve a story. Unverified facts receive a
dated hedge or are removed.

### Feynman/ELI5 rule

For every chapter, the writer follows this sequence:

1. show a familiar picture;
2. explain the mechanism to a bright ten-year-old;
3. name and define the exact technical term;
4. demonstrate it with the smallest useful example;
5. say where the analogy breaks;
6. make the reader teach it back through a checkpoint.

Step 5 is universal: every chapter contains a `Where the picture stops`
section, and tools/lint-manuscript.py enforces it. The rest of the frame is
opt-in per chapter, declared in that file, because applying all of it to all
twenty chapters turned roughly a fifth of the manuscript into scaffold. A
chapter that opens by building vocabulary carries a `Words before machinery`
section; its three-column table is an entrance ramp, not a glossary dump, and
only the terms needed for that chapter belong there. A chapter that does not
carry one still owes the reader step 3: the body must define each term in
prose at first use, wherever it first appears.

An explanation fails this rule if it replaces one unexplained term with
another, expands an acronym without explaining the idea, uses a metaphor with
no technical landing, or presents code before naming what its identifiers do.

## 3. Technical editor

Challenges correctness and architecture:

- Does the code do what the prose says?
- Is the model being credited for harness behavior, or vice versa?
- Is a prompt warning presented as if it were an enforcement boundary?
- Can an interrupted action be replayed safely?
- Is a current product detail likely to decay?
- Does the chapter explain the negative case?

The editor records material corrections in QUALITY_REPORT.md.

## 4. Tester

Treats the manuscript as executable:

- extracts or mirrors code into the companion project;
- runs type checking and unit tests;
- runs build scripts from a clean state;
- validates the EPUB archive, metadata, links, images, and TOC;
- runs source and cross-reference audits;
- records command, result, and residual risk.

## 5. Proofreader

Reads the rendered output, not only Markdown. Checks every page or reflowed
section for:

- typography and hierarchy;
- code overflow;
- figure legibility;
- awkward page or section breaks;
- grammar and repeated phrasing;
- inconsistent terminology;
- stale metadata.

## 6. Publisher

Creates the final reproducible package, release notes, description, source
archive, and reader-facing files. The publisher ships only outputs produced
after the final proofread.

## Required pass log

| Pass | Required evidence |
|---|---|
| Architecture | chapter map and capability dependency check |
| Developmental edit | word count, missing-depth list, chapter outcomes |
| Technical edit | primary-source ledger and correction list |
| Code test | clean install, check, test, offline smoke run |
| Build test | clean EPUB build and structural validator |
| Visual proof | figure montage and EPUB/PDF page inspection |
| Copyedit | style and terminology scan |
| Final proof | zero blocker report |

## First-edition pass record

| Pass | Status | Evidence |
|---|---|---|
| Architecture | pass | 20-chapter map, four parts, capability ladder |
| Developmental edit | re-passed 2026-08-27 after fixes | Part-4 voice restored (Field notes in ch14–20); chapter-transition seams added in the fix pass |
| Technical edit | re-passed 2026-08-27 after fixes | market numbers dated or removed; ch17 budget prose aligned to the code's configured-only enforcement; Appendix E gaps filled (Chroma, RULER, Liu et al.) |
| Code test | re-passed 2026-08-27 after fixes | 27/27 offline checks green; Gate 6 attack probes (.test-workspaces/adv-gate6/) all HELD on re-run |
| Build test | pass | reproducible Pandoc EPUB; structural validator |
| Visual proof | pass for assets | replacement cover, author portrait, and nine-figure reduced-size proof inspected |
| Copyedit | re-passed 2026-08-27 after fixes | ch20 “high-risk” correction; hyphen-line breaks rejoined; part labels normalized; Appendix B tilde fences converted |
| Final proof | conditional | commercial upload still requires Kindle Previewer per Appendix F |

The record was reopened on 27 August 2026 after a 160-agent end-to-end review
(findings under review/) confirmed five blockers and overstated attestations,
then re-closed after the remediation pass. The first-edition pass record is
reopened whenever a reader identifies a
visible comprehension or design failure. The current revision requires a new
Feynman/ELI5 pass and a new visual proof before it may return to release status.

## Volume II pass record (Inference Engineering)

Manuscript complete 2026-08-27: 18/18 chapters + prologue + appendices A–F,
111k+ words, all numbers traced to 71 dated digests. Status by pass:

| Pass | Status | Evidence |
|---|---|---|
| Architecture | pass | CHAPTER_MAP locked at scaffold; books-positioning wedge verified against the 12-digest books corpus (no dedicated inference/serving title in the reviewed bestseller nodes) |
| Developmental edit | pass (writer gate) | Gate-1 self-review logged per chapter in PROGRESS.md (structure, number tracing, fix lists); structural lint green manuscript-wide, 27 files |
| Technical edit | pass | Gate-2 reviews complete for all 18 chapters (review/); every P0/P1/P2 finding applied via driver fix-passes (ch01–ch04 iterations 28–29 + post-review polish; ch02–ch18 iterations 29–44, one chapter per iteration, citations re-verified against research/ before applying). Verdicts: 17 MINOR, 1 MAJOR (ch04, resolved iteration 28). Appendices A–F reviewed 2026-08-28 (all MINOR, P0 = 0, 14 P1 + 27 P2 total); every finding applied via the appendix fix-pass, iterations 49–54, one appendix per iteration (one E P2 rejected as false positive with evidence: ch03:40 carries the quote); citations re-verified against research/, the chapters, and the shipped companion before applying |
| Code test | pass | companion/tinyengine: tsc 5.9.3 clean, zero npm deps; offline smoke suite green across repeated runs (chapters' Break-it/Prove-it cases) |
| Build test | pass | tools/build.sh one command: EPUB OK 6.2M, 34/34 mermaid rendered (flowchart labels re-rasterized via mermaid-cli after the iteration-34 foreignObject fix), validate-epub.py passes, spine/nav carry all appendices |
| Visual proof | pass (machine-verified scope) | figure renders verified in SVG/PNG (labels pixel-checked); reflow decision closed 2026-08-27 — every reader-facing fenced code line fits 66 columns (fixed, not ratcheted), mermaid sources excluded as image-replaced at build (--check-mermaid measures them), checker wired into build.sh at budget 0; the human-eye typography/page-break sweep stays under copyedit and final proof |
| Copyedit | pass (2026-08-27) | book-wide style/terminology scan + fixes: closer format normalized to `### Build it`-style H3 subsections in ch15–18 (matching the ch01–14 majority; 16 conversions, EPUB re-verified 18 `<h3>` closers, 0 bold remnants); token-rate unit unified to `tokens/s` (was 73/14/6 across three forms); `fan-outs`→`fanouts`; prologue Field note converted to the series blockquote form; front-matter freshness (seventy-plus digests, `optimizer` spelling); structural conventions verified uniform (Checkpoints, picture-stops, vocab tables, ELI5/Field-note formats, `tinyengine` casing, TTL phrasing); scans clean for repeated words, double spaces, smart quotes, unspaced em-dashes, British spellings. Full record in QUALITY_REPORT.md §3 |
| Final proof | not started | Kindle Previewer pass on the retail file owed; its copyedit prerequisite passed 2026-08-27, so the gate is unlocked and now awaits only the human operator at upload time (runbook in Appendix F) |
