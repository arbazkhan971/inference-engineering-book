# Release and Volume-I parity report

Current as of 2026-08-30. This is the short, authoritative release record;
older iteration detail remains in `QUALITY_REPORT.md` and `PROGRESS.md`.

## Verdict

*Inference Engineering* meets the editorial and retail-engineering floor set
by *Harness Engineering* and is stronger at the failure boundaries that matter
for this volume: an assembled executable companion path, dated claim receipts,
semantic diagram descriptions, accessibility validation, canonical metadata,
and retained release evidence.

This is not a claim that every raw count is larger. Volume I's companion has
more TypeScript and more individual tests. Volume II's companion is deliberately
smaller, but its routing, quota, streaming, metering, receipts, and durable
session replay now execute together through one offline path and are covered by
adversarial contract tests. The remaining release actions are human and
platform-bound: an independent reader/screen-reader pass and the checksum-bound
KDP post-upload preview.

## Measurable comparison

| Boundary | Harness Engineering, Volume I | Inference Engineering, Volume II | Assessment |
|---|---:|---:|---|
| Editorial system | Six gates | Same six inherited gates | Parity |
| Main chapters | 20 | 18, plus prologue, appendices A-F, and back matter | Different architecture, complete scope |
| Linted manuscript words | 81,862 | 120,128 | Volume II exceeds the depth floor |
| Figures | 27 numbered figures (28 SVGs including the cover) | 34 instructional figures, all with semantic descriptions | Volume II exceeds and adds enforced accessibility |
| Reader-checkable sources | 55 unique HTTP(S) Markdown links | 126 unique linked external sources, backed by 71 dated digests | Volume II exceeds |
| Companion TypeScript | 6,280 lines | 3,943 lines including tests | Volume II is intentionally more compact |
| Companion proof | 129 named tests | Four regression programs, 30 named tests, and one assembled offline demo | Both substantial; test counts are not directly comparable |
| Retail proof | Clean EPUB and external checks | EPUBCheck, DAISY Ace, Kindle conversion, semantic fingerprint, and retained manifest/logs | Volume II exceeds the recorded evidence boundary |

The comparison uses Harness commit `de98ae352d70`. Word counts come from each
repository's canonical manuscript-word regex, not raw `wc -w`; link counts are
reader-visible HTTP(S) Markdown targets. Figure and code categories are stated
explicitly because the repositories package them differently. These counts are
snapshots, not quality scores. The verdict rests on enforced contracts and the
observed artifact, not on page count or line count alone.

## Material gaps found and closed

- Replaced the oversized historical Appendix F ledger with a reader-facing KDP
  release checklist.
- Expanded Appendix E into a reader-checkable linked bibliography while keeping
  the 71 dated research digests as the full fact ledger.
- Added semantic descriptions for every Mermaid figure and made missing, stale,
  generic, or underspecified descriptions a build failure.
- Added DAISY Ace to the strict verifier and parse its report so a zero process
  exit cannot hide accessibility failures.
- Added one canonical retail metadata source and a release audit that checks the
  source files and generated EPUB.
- Added an assembled `TinyEngine.call()` path, exact one-use transport timing,
  durable replay, serialized same-session turns, explicit quota settlement,
  safer routing and breaker behavior, receipts, and adversarial tests.
- Added pinned release-tool declarations, clean-tree release verification,
  retained external-validator evidence, and a reader-visible EPUB semantic
  fingerprint for cross-machine comparison.

## Local canonical evidence

The full strict pre-commit run completed on 2026-08-30:

- manuscript lint: 18/18 chapters, 27 manuscript files, 120,128 words;
- code reflow: 58 reader-facing lines in 10 fenced blocks, all at or below the
  66-character budget;
- companion: four regression programs green, both attack suites at zero
  findings, 30/30 named tests green, and the assembled demo emitted an
  attributed receipt;
- release audit: 18 chapters, 34/34 semantic figure descriptions, 71 dated
  digests, and 126 unique linked external sources;
- EPUB: 6,300,284 bytes, 30 spine documents, 356 headings, 35 image
  descriptions, 132 external links, and 35 raster images;
- EPUBCheck 5.3.0: zero errors and zero warnings;
- DAISY Ace 1.4.6: zero failures;
- Kindle Previewer 3.106: conversion success, Enhanced Typesetting supported,
  zero conversion errors, and zero quality issues;
- semantic fingerprint:
  `f48d0803c1cd0baaeebe935f6c338d3d46238949f00392c70658879393c573e8`.

The clean-commit release run and its retained evidence directory are recorded
below after the repository is sealed.

## Human visual evidence

The exact generated EPUB was inspected in Kindle Previewer 3 on 2026-08-30.
The cover, title page, and table of contents rendered cleanly. Representative
checks passed on tablet and phone profiles, at the largest phone font setting,
and on the grayscale Kindle e-reader profile. The sample included a complex
chapter 5 diagram, the Appendix C pricing table, the Appendix D opening, and a
code-heavy page. Text reflowed, code stayed within the viewport, tables split
readably, images were not clipped, and Enhanced Typesetting was active.

This is a representative agent visual pass, not the owner's final KDP proof.
An Apple Books import was attempted but not certified; it is deliberately not
counted as an independent-reader pass.

## Independent `ldp` reproduction

Pending the pushed clean commit. The acceptance condition is a clean `ldp`
checkout that installs the pinned companion dependencies, runs the full verifier,
and reproduces the local reader-visible semantic fingerprint. Different EPUB
container bytes are allowed when the installed Pandoc versions differ.

## Honest residual boundaries

- The final KDP upload, checksum match, preview, and publish action require the
  owner's authenticated account and remain open.
- A separate human reader or screen-reader pass remains advisable before
  publication; automated accessibility checks are necessary, not sufficient.
- The JSONL session store is a documented single-writer design and does not
  provide cross-process locking.
- A stream iterator failure after response headers propagates to the caller; it
  does not currently feed back into router breaker or fallback state.
