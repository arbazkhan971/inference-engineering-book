# Gate 2 Technical Review — `manuscript/appendix-f-kdp-release-checklist.md`

Scope: numbers audit against `research/`, cross-reference and terminology audit against chapters, appendices, ledgers (PROGRESS.md, QUALITY_REPORT.md, EDITORIAL_SYSTEM.md), and build tooling (`tools/build.sh`).

## Review

### Correct (verified with evidence)

**Numbers audit — every external market number traces to a dated digest:**
- Category node IDs **491300 / 271581011 / 211759007011**, top-20 bestseller-mix claim, **$59.99** Manning/Packt anchors, **~$79.99** O'Reilly flagships, **$47.99–$54.99** eBook band, **20–30%** street discount, **$9.99** self-pub cluster, **368–534** page range, **~500** cap — all trace verbatim (with hedges preserved) to `research/books-kdp-market-data.md` (researched 2026-08-27).
- Sales-expectation block (**3–15 Kindle-equivalent sales/day**, curve-fit caveat, "Amazon publishes no sales data", hourly BSR updates, lower-velocity print curve, order-of-magnitude snapshot) — traces to the same digest's "Rank vs sales estimates" section, including its own caveats faithfully carried over.
- Launch-timeline numbers — **~nine months** announcement-to-print (Apr 23 2024 → Jan 2025), companion-repo/lead-capture precedents, **~five months** to audiobook, translations inside a year, "no public pre-order or unit-sales figures" — all trace to `research/books-launch-playbooks.md`.
- F.1 architecture row's "no dedicated inference/serving title appeared in the AI or NLP bestseller nodes reviewed 2026-08-27" — verbatim from `books-kdp-market-data.md` Coverage map, correctly scoped to *bestseller nodes* (see Finding 1 for the adjacent omission).

**Internal numbers traced and independently verified:**
- **34 mermaid diagrams** — I counted 34 ` ```mermaid ` fences in `manuscript/` myself. ✓
- **6.2 MB EPUB** — last recorded build in PROGRESS.md iteration 47: 6,226,018 bytes. ✓
- **66-column budget, 76 excluded mermaid lines, widest 158** — PROGRESS.md iteration 45 records exactly this decision, `tools/build.sh:23–26` runs `reflow-check.py` at budget 0. ✓
- **17 MINOR / 1 MAJOR (ch04), all 18 chapters reviewed** — `review/` contains 18 gate-2 files (ch01-gate2 + ch02–ch18); EDITORIAL_SYSTEM.md Vol II pass record agrees. ✓
- **TypeScript 5.9.3, two offline suites (smoke + cadence with golden set / cache-hit gate / invoice reconciliation)** — QUALITY_REPORT.md Gate 5 and PROGRESS iterations 44–47. ✓
- **~700-line tinyengine** — cross-consistent across `appendix-d:5`, `ch18:34`, `companion/tinyengine/README.md:3`, and PROGRESS's per-module itemization. ✓
- **"north of 110,000 words"** — 112,786 at iteration 47. ✓
- **F.3 item 2 (build pins identifier / ISO date / edition line)** — verified in `tools/build.sh:6–8,42–44`; **SKIP_FIGURES smoke mode** — `build.sh:16`. ✓
- **F.3 item 8 (back matter: author note, evidence note, copyright page dating the snapshot)** — verified in `manuscript/zz-back-matter.md`. ✓

**Cross-checks clean:**
- F.6 re-dating targets map to real anchors: prices/cache/rate limits → Appendix C.2/C.3/C.4; context windows → C.8; "same-weights provider spreads" → C.9 "Same weights, different engines"; "engine-doc tier" → Appendix E.2 Tier 4 ("Engine documentation, source code, issues and pull requests"); RULER expanded at first use in ch04:121; "arithmetic of waiting" = ch03, "cache-bill chapter" = ch14. ✓
- Appendix E carries matching "(Appendix F)" source pointers (E.3 lines 125–127). ✓
- Terminology/style: straight quotes throughout (matches copyedit scan), US spellings, spaced em-dashes, lowercase `tinyengine`, no token-rate mentions (so no `tokens/s` violations; Appendix C uses the unified form). ✓

### Findings

1. **[P1]** `manuscript/appendix-f-kdp-release-checklist.md:60` (F.5 item 5) — the release runbook's metadata step omits the exact-title collision the project's own positioning research flags as "must be planned for."
   - Quoted text: `Metadata: title, subtitle, author, edition line, publication date, description led by the one-line tether.`
   - Replacement: `Metadata: title, subtitle, author, edition line, publication date, description led by the one-line tether — and let the subtitle and series keywords (harness, agents, provider APIs) carry search: a 2026 Baseten book shares this exact title and its free companion site dominates the phrase (positioning digest, 2026-08-27).`
   - Why: `research/books-positioning-wedge.md` (researched 2026-08-27, same date this appendix claims the snapshot) records that two dedicated serving-layer titles shipped in 2026 and that Baseten's *Inference Engineering* (Kiely) with its free interactive companion "will dominate search for the phrase," recommending the book lean on subtitle/series keywords. No manuscript file mentions this (grep for "Kiely"/"Baseten"/"title collision" hits only ch09's unrelated FP8 benchmark). F.2's "the only one in its lane" is defensible (the wedge is the harness-reader seam), but a release checklist that walks the operator through the upload metadata without the one researched, dated market fact that directly governs title/keyword decisions is an omission with commercial consequence — and F.1's bestseller-node sentence, while accurate and sourced, will read to a release-day operator as "the title is un-collided."

2. **[P2]** `manuscript/appendix-f-kdp-release-checklist.md:31` (and first use at `manuscript/appendix-e-sources-bibliography.md:126`) — "BSR" never expanded.
   - Quoted text: `Amazon publishes no sales data, BSR updates hourly, print ranks follow a lower-velocity curve`
   - Replacement: `Amazon publishes no sales data, its Best Sellers Rank (BSR) updates hourly, print ranks follow a lower-velocity curve` (and at Appendix E line 126: `Amazon category and Amazon Best Sellers Rank (BSR) data`)
   - Why: STYLE.md requires acronyms expanded at first use. "BSR" appears only in Appendix E and Appendix F and is never spelled out anywhere in the book; the strictly first use is in Appendix E, so the expansion belongs there, with Appendix F consistent thereafter.

3. **[P2]** `manuscript/appendix-f-kdp-release-checklist.md:27` — "KDP" never expanded.
   - Quoted text: `Kindle royalty mechanics and price bands are not part of this book's research corpus — verify current KDP terms in the pricing calculator at upload time rather than trusting this page.`
   - Replacement: `Kindle royalty mechanics and price bands are not part of this book's research corpus — verify current Kindle Direct Publishing (KDP) terms in the pricing calculator at upload time rather than trusting this page.`
   - Why: "Kindle Direct Publishing" appears nowhere in the manuscript (grep: zero matches); KDP's first occurrence is this appendix's own title, and the first body use is this line. One-word fix satisfies the acronym rule at the point where the term becomes load-bearing.

4. **[P2]** `manuscript/appendix-f-kdp-release-checklist.md:82` (F.6) — one-off "TRT-LLM" abbreviation.
   - Quoted text: `Re-verify engine defaults after each major vLLM/SGLang/TRT-LLM upgrade`
   - Replacement: `Re-verify engine defaults after each major vLLM/SGLang/TensorRT-LLM upgrade`
   - Why: this is the only "TRT-LLM" in the entire manuscript; every other occurrence spells "TensorRT-LLM" (introduced as "NVIDIA TensorRT-LLM" at ch05:114). An unintroduced abbreviation that appears exactly once is both a first-use violation and an internal-consistency straggler.

### Numbers audit result
No untraceable numeric claims. Every market number traces to a dated digest (books-kdp-market-data.md, books-launch-playbooks.md, books-positioning-wedge.md); every build/gate number traces to the progress ledger, QUALITY_REPORT.md, or the build scripts, and the three independently checkable ones (34 mermaid fences, SKIP_FIGURES guard, metadata pins) verified directly. Product-decay exposure is correctly hedged ("at last build", "verify current KDP terms", dated snapshot framing in the header note).

### Residual risks
- Kindle royalty bands deliberately outside the corpus — correctly hedged in F.2/F.5 item 7; operator must verify at upload (as instructed).
- "6.2 MB at last build" and "34 at last count" will drift on any rebuild; both are self-hedged phrasings, and the validator/counters re-derive them.
- Finding 1's fix should land before upload day; findings 2–4 are copyedit-grade.

Counts: P0 = 0 · P1 = 1 · P2 = 3

Verdict: MINOR