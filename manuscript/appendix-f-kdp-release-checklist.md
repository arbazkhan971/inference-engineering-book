# Appendix F. KDP and release checklist

> **Appendices — the reference shelf.** The last gate between this manuscript and readers: what release-ready means, what the machines can prove, and what still requires human eyes. Snapshot: 2026-08-30.

## F.1 What release-ready means

The editorial system behind this book defines gates, not vibes. The detailed evidence belongs in the public `QUALITY_REPORT.md` and append-only `PROGRESS.md`; a retail appendix should tell you the result, not make you read the factory log.

| Gate | Status at this edition | Evidence boundary |
|---|---|---|
| Architecture and positioning | Pass | Four-part capability ladder; the serving-layer wedge checked against the dated books corpus |
| Writer and pedagogy | Pass | Prologue, 18 chapters, appendices A–F, and back matter; every chapter carries the required teaching frame; a beginner-simulation pass covered all 25 reading surfaces |
| Technical edit | Pass | Chapter and appendix reviews closed; claims and cross-references were independently re-derived; every material finding was fixed or rejected with written evidence |
| Companion code | Pass at the committed revision | Strict TypeScript build; chapter smoke tests, nightly-cadence tests, adversarial suites, named contract tests, and the assembled offline request-path demo run without network access |
| Build and accessibility | Pass at the committed revision | One-command EPUB build; structural validator; EPUBCheck; DAISY Ace; semantic alternative text for every diagram; no Mermaid source reaches the reader |
| Automated Kindle conversion | Pass at the committed revision | Kindle Previewer reports successful conversion, Enhanced Typesetting support, zero errors, and zero quality issues |
| Human final proof | Owner sign-off required | Page through the exact retail EPUB in phone and e-reader profiles, then inspect it in one independent reader. Automation cannot certify taste, pacing, or every reflow choice |

The distinction in the last two rows is deliberate. A successful converter proves that Amazon can ingest the file. It does not prove that a person has looked at every chapter opener, table, code block, diagram, and awkward page boundary. Do not collapse those claims into one green badge.

## F.2 Lock the product before proving it

The release title is **Inference Engineering**, with the subtitle **Inside the Engine Room of AI Agents**, by **Arbaz Khan**, in the **Harness Engineering Series, Volume II**. The canonical metadata used by the build is the source of truth. Changing the title, subtitle, edition date, cover, or reading order after proof invalidates the proof.

The market snapshot behind this edition places practitioner AI books primarily in Artificial Intelligence and Natural Language Processing. Category nodes, royalty bands, delivery fees, and prices are retailer-controlled data, so verify them inside Kindle Direct Publishing (KDP) on upload day. The durable positioning is simpler: Volume I built the system around the model; Volume II opens the engine underneath it.

The dated pricing research supports a premium practitioner position rather than the low-cost prompt-book shelf. That is a positioning input, not permission to trust an old price. Re-run the current KDP calculator after the final file size and print extent are known.

## F.3 Files and machine checks

Before upload, all of these must be true on the same commit:

1. `tools/build.sh` produces `build/inference-engineering.epub` from a clean checkout with figures enabled.
2. `tools/verify.sh` passes the manuscript linter, code-width gate, companion suites, EPUB build, and structural validator.
3. `STRICT_EXTERNAL=1 tools/verify.sh` runs rather than skips EPUBCheck, DAISY Ace, and Kindle Previewer. A missing external validator is a failed release run.
4. All 34 Mermaid diagrams are replaced by images with semantic alternative text. A missing render or generic filename description fails closed.
5. Every reader-facing fenced code line fits 66 columns. Mermaid source is excluded because it is replaced by an image; `--check-mermaid` remains available for source inspection.
6. The cover is opaque RGB, legible at thumbnail size, and still understandable in grayscale.
7. The navigation, spine, title page, appendices, back matter, internal links, and external source links are present in the built EPUB.
8. The companion installs from a clean checkout, runs every enforced suite, and completes its offline assembled-path demo.

Different Pandoc versions may package semantically equivalent EPUB content under different internal filenames. The release build therefore records its tool versions and checksum and treats one environment as the canonical artifact builder. A second environment is a clean-room semantic check unless it uses the identical pinned toolchain. “Same source” and “same bytes” are separate claims.

## F.4 The visual proof

Use the exact EPUB produced by the release run. In Kindle Previewer, check both a phone-sized profile and an e-reader profile:

- cover, title page, copyright, and table of contents;
- prologue and all 18 chapter openings;
- every Words-before-machinery table and dated snapshot box;
- every diagram at normal reading size and after zoom;
- all code blocks, especially wrapped comments and long identifiers;
- appendix tables, source links, companion commands, and back matter;
- the free-sample path, which should reach the prologue rather than spend itself on administration.

Then open the EPUB in one independent reading engine. Test font enlargement, dark mode where available, table navigation, image descriptions with a screen reader or accessibility inspector, and links without a mouse. Record defects against the artifact checksum; rebuild after every fix and restart the proof on the new checksum.

## F.5 Release-day runbook

Run these steps in order on one calendar day:

1. Pull the release commit into a clean checkout and confirm the working tree is clean.
2. Install the companion's pinned development toolchain and run its complete test command plus offline demo.
3. Build with figures enabled; run the structural validator.
4. Run the strict external gate: EPUBCheck, DAISY Ace, and Kindle Previewer must all execute and pass.
5. Record the commit, tool versions, artifact size, and SHA-256 checksum.
6. Complete the visual proof in F.4 and record the owner sign-off against that checksum.
7. Re-verify title, subtitle, author, series, edition date, description, categories, territories, and current pricing inside KDP.
8. Upload the proved EPUB and the cover that belongs to the same revision.
9. Inspect KDP's post-upload preview; do not assume it is identical to the desktop conversion.
10. Publish only after the rights, artificial-intelligence disclosure, territories, tax, banking, and final Publish controls are completed by the account owner.
11. Make the companion repository public, publish an append-only errata page, and schedule the maintenance checks below.

## F.6 After release

A dated book is not a sin; an undated drift is. Maintain the volatile surfaces without rewriting the durable arithmetic:

| Cadence | Recheck | Primary location |
|---|---|---|
| On every provider change you adopt | Prices, cache multipliers, rate limits, streaming and schema contracts | Appendix C and the relevant dated box |
| Quarterly at most | Provider matrix and price-map fixtures | Appendix C and `tinyengine` config examples |
| On each major serving-engine upgrade | Scheduler defaults, cache behavior, speculative decoding, and quantization flags | Chapters 5–9 and Appendix E |
| Annually | Claimed-versus-effective context windows and same-weights provider spreads | Chapters 4 and 11 |
| On any reader-visible defect | Dated erratum, source fix, rebuilt artifact, and renewed checksum-bound proof | Public errata and release evidence |

The rule underneath the calendar is the book's oldest one: formulas teach; dated constants illustrate. When they disagree in the future, re-date the constant and keep the derivation visible. The engine room keeps logs. So does the engine room's book.
