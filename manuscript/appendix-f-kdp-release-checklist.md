# Appendix F. KDP and release checklist

> **Appendices — the reference shelf.** The last gate between this manuscript and readers: what "release-ready" means, how the book meets the market, and the calendar that keeps it honest after launch. Written 2026-08-27; like every dated page in this book, it describes a snapshot — including a snapshot of what is not yet done.

## F.1 What release-ready means — the gate ledger

The editorial system behind this book defines gates, not vibes. Here is the honest ledger as of the day this appendix was written:

| Gate | Status | Evidence and what remains |
|---|---|---|
| Architecture | Pass | Chapter map, four parts, capability ladder locked at scaffold; positioning verified against the books corpus — no dedicated inference/serving title appeared in the AI or NLP bestseller nodes reviewed 2026-08-27 |
| Writer (Gate 1) | Pass, per chapter | 18/18 chapters + prologue carry logged self-reviews (structure, numbers traceability, fixes) in the project progress ledger |
| Technical edit (Gate 2) | Pass | All 18 chapters reviewed (findings in review/); every P0/P1/P2 finding applied through the driver fix-passes (final chapter, ch18, closed 2026-08-27); verdicts were 17 MINOR and 1 MAJOR (ch04, resolved) |
| Code test | Pass | Companion tinyengine type-checks clean under TypeScript 5.9.3; two offline suites green across repeated runs — the smoke suite (chapter Break-it/Prove-it cases replayed as code) and the cadence suite (the tester role's three nightly gates over fixtures: golden set, cache-hit gate, invoice reconciliation) |
| Build test | Pass | One command produces a validated EPUB (6.2 MB at last build); 34/34 mermaid diagrams render with labels; structural validator passes |
| Copyedit | Pass (2026-08-27) | Book-wide style/terminology scan + fixes: closer format normalized (ch15–18 bolded paragraphs → H3 subsections, matching ch01–14); token-rate units unified to `tokens/s`; terminology/spelling stragglers fixed; structural conventions verified uniform; full record in QUALITY_REPORT.md §3. The reflow decision is closed (see F.3 item 5): reader-facing code lines all fit 66 columns and the checker runs at budget 0 inside the build |
| Final proof | Owed | Conditional by design: commercial upload requires a Kindle Previewer pass on the retail file, which no build script can perform |

The copyedit pass closed 2026-08-27; final proof (Kindle Previewer) is the one remaining gate before upload.

## F.2 The book as a product — categories, price, position

**The one-line tether.** This book is Volume II of a series, and the comparables say the series tether is the single most shareable sentence you will write. Announce it early and in one line, the way the AI Engineering announcement did ("builds upon [Volume I], but with a focus on [the new scope]") — for this book: *Harness Engineering taught the system around the model; Inference Engineering opens the hood.*

**Categories.** Practitioner AI titles dual-list in Amazon's "Artificial Intelligence" node (491300) and "Natural Language Processing" node (271581011); the cheaper "Generative AI" node (211759007011) is dominated by low-cost self-published titles and is not this book's shelf. Bestseller-list reality from the 2026-08-27 snapshot: trade and business AI books plus practitioner project guides dominate the top-20; technical deep-dives are the minority — which is the point of the wedge, not a defect.

**Price.** The practitioner anchors: $59.99 print list is the established level (Manning and Packt comparables), O'Reilly pushed flagships to ~$79.99, and eBook editions list $47.99–$54.99 with street prices typically 20–30% below list. Self-published AI eBooks cluster at $9.99 or below; that shelf sells volume and reviews, not depth, and pricing this series next to it would mis-signal the content. Kindle royalty mechanics and price bands are not part of this book's research corpus — verify current KDP terms in the pricing calculator at upload time rather than trusting this page.

**Length.** Comparable practitioner successes run 368 to 534 pages; the corpus conclusion was that this volume need not exceed ~500. The manuscript weighs in north of 110,000 words; the 2026-08-27 copyedit normalized style and terminology but did not mass-trim — chapter overages against the style bands were reviewed and logged as content-bearing (mechanism and both-sides framing were the casualty of cutting), per the progress ledger.

**Sales expectations.** Niche technical books typically sustain ranks in the tens of thousands, which third-party calculators map to roughly 3–15 Kindle-equivalent sales a day — steady backlist, not spike bestsellers. Every such figure is a curve-fit; Amazon publishes no sales data, BSR updates hourly, print ranks follow a lower-velocity curve, and any single snapshot is an order-of-magnitude guide. Budget expectations accordingly: this book wins by being the only one in its lane, not by charting against celebrity titles.

## F.3 Files, cover, and the machine check

What exists and must stay true at upload:

1. **The build is one command.** `tools/build.sh` from a clean tree lints, stages, renders figures, and emits the EPUB; the structural validator must pass on the retail artifact, not a stale one. Rebuild from scratch on release day.
2. **Edition metadata is deliberate.** The build pins the identifier, the ISO publication date, and the title-page edition line; a new edition means bumping those deliberately, not inheriting them.
3. **Cover.** The retail cover ships as `figures/png/cover.jpg`; it was produced through an SVG→PNG pipeline with an ffmpeg fallback and verified opaque RGB. Inspect it once more at full size in grayscale — e-ink is this book's native habitat, and every figure in the interior was held to a no-color-only-meaning rule.
4. **Figures.** All mermaid diagrams (34 at last count) must appear as images in the EPUB with none degraded to source code. The validator checks this; do not upload on a skipped-figures build (`SKIP_FIGURES=1` is a smoke-test convenience, not a release mode).
5. **Reflow — decided 2026-08-27, fixed not ratcheted.** Every reader-facing fenced code line now fits 66 columns (the ch05 and ch07 iteration timelines were redrawn, the ch14 cost formula and the Appendix D tracer excerpt re-set, and the tracer reflowed identically in the companion so book and code still match byte-for-byte). Mermaid sources are excluded from the budget on principle, not convenience: the build replaces those fences with images, so their width never reaches a reader, and the DSL cannot wrap without changing the figure — `--check-mermaid` still measures them (76 lines, widest 158, in the source only). `tools/build.sh` runs the checker at budget 0, so a regression fails the build. Do not upload on a build that had to raise the budget.
6. **Kindle Previewer.** The one check no script performs: open the final EPUB in Kindle Previewer (phone and e-reader profiles) and page through front matter, every chapter opener, the dated boxes, the appendices, and the back matter. This is the final-proof gate the editorial system deliberately leaves conditional.
7. **The sample.** The prologue opens the book by design so the store's free sample lands on the story, not the table of contents. Read the sample exactly as a shopper receives it before setting the book live.
8. **Back matter and copyright page.** The book closes, after the appendices, with the author note, the evidence note, and the copyright page (`zz-back-matter.md`, added 2026-08-27); the copyright page dates the research snapshot and carries the numbers disclaimer. The bio lives at the back by design — the sample should spend itself on story and orientation, not on the author. On a new edition, bump the copyright year and the edition line deliberately.

## F.4 The launch sequence — what the comparables actually did

Six moves, each traced to a documented launch, none requiring luck:

1. **Announce with the tether, early.** The strongest comparable announced roughly nine months before print with nothing but the one-line series definition. The announcement is a promise, not a promotion.
2. **Ship the companion repo at launch.** Both successful O'Reilly comparables have public companion repositories that double as chapter summaries and resource hubs — one also serves as a lead-capture page with endorsement blurbs. This book's companion (the ~700-line tinyengine of Appendix D, with its offline test suite) already exists in private; making it public on launch day is a flip, not a project.
3. **Syndicate one chapter.** Pick the chapter a stranger would finish in one sitting — the arithmetic of waiting and the cache-bill chapter are the natural candidates — and place an excerpt with an established newsletter in release week.
4. **Time the tour to print week.** The comparable launch media (podcasts, newsletter interviews) clustered within weeks of the publication date; the lesson is sequencing, not volume.
5. **Respect Volume I owners.** A proven move in the corpus: the free second-edition extract for first-edition owners. The series equivalent: a clearly-scoped delta note — what Volume II assumes, what it re-teaches, where Volume I readers can skip — priced at zero.
6. **Plan the long tail.** Audiobook roughly five months post-print, translations inside a year, and a place where reader discussion is curated. None of these are launch-day work; all of them are launch-day *decisions*.

One honesty note the corpus enforces: no public pre-order or unit-sales figures exist for any comparable book. "Bestseller" claims in launch marketing are qualitative, and this book's own marketing should not reach for numbers nobody has.

## F.5 Release-day runbook

In order, on one calendar day:

1. Confirm the gate ledger (F.1) is green: Gate-2 sweep closed, copyedit closed, zero open P1s.
2. Clean-tree build; structural validator passes on the retail EPUB.
3. Kindle Previewer pass (F.3 item 6) — phone and e-reader profiles, front to back matter.
4. Reflow decision recorded (F.3 item 5).
5. Metadata: title, subtitle, author, edition line, publication date, description led by the one-line tether.
6. Categories: AI (491300) primary, NLP (271581011) secondary; stay off the self-pub Generative AI shelf.
7. Price set per F.2 after checking current KDP royalty bands.
8. Companion repository made public; README states what the code is (Appendix D's guide) and where it is referenced chapter by chapter.
9. Announcement post published with the tether sentence and one syndication target booked.
10. Errata policy posted: a public errata page, append-only, matching the project's internal discipline — every fix dated, no silent history rewrites.
11. Calendar reminders created for F.6.

## F.6 After release — the re-dating calendar

A dated book is not a sin; an undated drift is. The maintenance calendar:

| Cadence | Task | Target |
|---|---|---|
| Every pricing cycle (quarterly at most) | Re-date prices, cache multipliers, rate limits | Appendix C |
| Quarterly | Re-verify engine defaults after each major vLLM/SGLang/TRT-LLM upgrade | Chapters 5–9 knob values via Appendix E's engine-doc tier |
| On any provider announcement you act on | Re-date the affected matrix row immediately, not at quarter's end | Appendix C |
| Annually | Re-check claimed-vs-effective context windows (RULER-style) and same-weights provider spreads | Chapters 4, 11, Appendix C |
| On any reader-visible error | Errata entry, dated; fix in source; new edition only when accumulated change justifies a new ISBN-scale event | Errata page + progress ledger |

The rule underneath the calendar is the book's oldest one, inherited from the research method in Appendix E: every number carries the date it was true, no number outlives its date unmarked, and the honest ledger — progress, corrections, and all — is part of the product, not an embarrassment attached to it. The engine room keeps logs. So does the engine room's book.
