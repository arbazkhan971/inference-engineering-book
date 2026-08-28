# Gate-6 clean-checkout build attack

attacked: 2026-08-28 · attacker: glm-5.3-flash (worker, clean-clone protocol)

Protocol: fresh `git clone` to /tmp (commit 8999da3), full `tools/build.sh`
twice, companion `rm -rf node_modules dist && npm install && npm test`,
`tools/verify.sh` from the clean tree, artifact-hygiene greps, idempotency
rebuild, then `rm -rf` of the clone.

## Results

- `tools/build.sh` (stranger's build, figures on): **PASS** — lint
  `MANUSCRIPT OK: 18/18 chapters, 27 files, 113,439 words`, reflow budget-0
  OK, 34/34 mermaid staged (0 degraded — committed PNGs fresh against the
  committed manuscript), EPUB `OK build/inference-engineering.epub (6.0M)`,
  Kindle prep OK.
- Companion from scratch: **PASS** — clean install (typescript devDep +
  committed package-lock.json), strict `tsc` clean, smoke + cadence suites
  green.
- `tools/verify.sh` from the clean tree: **ALL EXTERNAL VALIDATORS PASSED**
  including Kindle Previewer (0 errors, 0 quality issues).
- Second build run: idempotent — same OK output, no new dirt beyond finding 1.
- Hygiene greps: no node_modules/dist/build/.DS_Store committed; no
  Vol.-I chapter filenames; skip-figures/previewer fallbacks documented.

## Findings

1. **[P2] Build dirties two committed artifacts.** First clean build leaves
   `figures/png/cover.png` + `cover.jpg` modified — `tools/render-figures.sh`
   regenerates the cover on every build and rsvg bytes differ from the
   committed pair. A stranger's first build produces a dirty tree.
   Fix: mtime-guard the cover render (skip when cover.svg is older than the
   committed outputs — same pattern `tools/render-mermaid.sh` already uses),
   or render the cover into `build/` and stop committing PNG+JPG pairs.
2. **[P2] README status table is stale.** Still says research "fanout in
   progress" and manuscript "autonomous driver" — the repo is a sealed
   release candidate (113k words, 72 digests, all gates green). A stranger
   reads the wrong project state. Fix: one-table refresh (research: 72
   dated digests; manuscript: sealed RC; build: verified clean-checkout).
3. **[P2] Vol. I leftover string.** `tools/prepare-kindle-epub.py:69` uses
   temp-file prefix `harness-engineering-`. Cosmetic; wrong-book name in
   strangers' /tmp. Fix: prefix `inference-engineering-`.

## Verdict

Zero P0, zero P1, three P2. No step depends on uncommitted local state; no
order dependence beyond the documented lint→stage→pandoc pipeline; committed
diagram renders are in sync; the lockfile makes the companion reproducible.

**BUILD-FROM-CLEAN: PASS**
