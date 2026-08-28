#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."

# Preflight: fail fast on missing tooling with an actionable message instead
# of crashing partway through the build.
missing=""
for bin in python3 node pandoc; do
  command -v "$bin" >/dev/null 2>&1 || missing="$missing $bin"
done
if [[ -n "$missing" ]]; then
  echo "error: missing required binaries:$missing" >&2
  exit 1
fi
if [[ "${SKIP_FIGURES:-0}" != "1" ]]; then
  figure_missing=""
  python3 -c "import PIL" >/dev/null 2>&1 \
    || command -v convert >/dev/null 2>&1 \
    || figure_missing="$figure_missing Pillow (pip install pillow) or ImageMagick"
  if ! command -v rsvg-convert >/dev/null 2>&1 \
    && ! command -v inkscape >/dev/null 2>&1 \
    && ! command -v convert >/dev/null 2>&1; then
    figure_missing="$figure_missing rsvg-convert or inkscape (SVG renderer)"
  fi
  if [[ -n "$figure_missing" ]]; then
    echo "error: missing figure tooling:$figure_missing" >&2
    echo "hint: SKIP_FIGURES=1 tools/verify.sh reuses the committed figures/png renders" >&2
    exit 1
  fi
fi

python3 tools/lint-manuscript.py
# Reader-facing code width at budget 0 — the recorded reflow decision: every
# reader-facing fenced line fits 66 columns (fixed, not ratcheted, 2026-08-27);
# mermaid sources are skipped because the build replaces those fences with
# images, and --check-mermaid still measures them on demand. tools/build.sh
# enforces the same budget, so verify and build cannot drift apart.
python3 tools/reflow-check.py
# The companion's own gate parses each source file as the module it is (tsc
# runs inside `npm test` before anything executes) and then runs all four
# suites: the smoke suite (the chapters' Break-it/Prove-it list), the cadence
# suite (the tester role's nightly instruments), and the two adversarial
# attack suites (gate-6 rounds 1 and 2) — regression evidence, enforced.
# `node --check` is not used on purpose: on Node 24 it exits 0 for a module
# holding a syntax error, so it reports clean on exactly the broken file this
# step exists to catch. tsc resolution: PATH first, then the companion's own
# pinned devDependency (node_modules/.bin/tsc, present after the documented
# fresh-clone step `npm install` in companion/tinyengine). Either way
# `npm test` type-checks before anything executes.
if command -v tsc >/dev/null 2>&1 \
   || [[ -x companion/tinyengine/node_modules/.bin/tsc ]]; then
  (cd companion/tinyengine && npm test --silent)
elif [[ -f companion/tinyengine/dist/tests/smoke.js ]]; then
  # Stale-dist guard: the fallback must never present old code as the
  # checked-out code. If any source, test, or config file is newer than the
  # compiled marker, refuse instead of reporting a false green. Sources are
  # flat (top-level *.ts plus tests/*.ts); the check uses bash's -nt builtin —
  # a find(1) -new pipeline failed OPEN on this host (unsupported predicate
  # errored into a passing condition), and a guard must fail closed.
  marker=companion/tinyengine/dist/tests/smoke.js
  stale=""
  for f in companion/tinyengine/*.ts companion/tinyengine/tests/*.ts \
           companion/tinyengine/package.json companion/tinyengine/tsconfig.json; do
    [[ "$f" -nt "$marker" ]] && { stale="$f"; break; }
  done
  if [[ -n "$stale" ]]; then
    echo "error: companion/tinyengine/dist is older than its sources —" \
         "$stale changed after the last compile. Recompile" \
         "(cd companion/tinyengine && npm install && npm test)" \
         "before trusting a suite run" >&2
    exit 1
  fi
  echo "note: tsc not on PATH — running the previously compiled dist" \
       "(verified current against sources)" >&2
  (cd companion/tinyengine && node dist/tests/smoke.js && node dist/tests/cadence.js \
    && node dist/tests/attack-gate6.js && node dist/tests/attack2-gate6.js)
else
  echo "error: tsc not on PATH and companion/tinyengine/dist is absent —" \
       "install TypeScript (npm install in companion/tinyengine pulls the" \
       "pinned devDependency) so sources are type-checked" >&2
  exit 1
fi
tools/build.sh
python3 tools/validate-epub.py

echo "ALL OFFLINE CHECKS PASSED"

# ---------------------------------------------------------------------------
# External validators
#
# Neither of these ships with the repo, and one of them is macOS/Windows only,
# so a missing validator is announced and skipped rather than failing a build
# on a machine that cannot run it. Set STRICT_EXTERNAL=1 -- which the release
# build should -- to turn a skip into an error, so "it passed" can never quietly
# mean "it did not run".
# ---------------------------------------------------------------------------
external_skipped=""

# EPUBCheck is the W3C/DAISY conformance checker: it decides whether the file
# is a legal EPUB 3 at all. --failonwarnings is deliberate. A warning here is a
# thing a reading system is allowed to render however it likes, which is the
# same as not knowing what the reader will see.
if command -v epubcheck >/dev/null 2>&1; then
  echo "--- epubcheck ---"
  epubcheck --failonwarnings build/inference-engineering.epub
else
  external_skipped="$external_skipped epubcheck"
  echo "skip: epubcheck not installed (brew install epubcheck)" >&2
fi

# Kindle Previewer is Amazon's own converter, and the only thing that can
# answer the question that decides how the book reads on a phone: whether
# Enhanced Typesetting is supported. It exits 0 even on a book Amazon would
# reject, so tools/check-kindle-log.py reads the logs it wrote and gates on
# those instead of on the exit status. This is the automated half of the
# final-proof gate; the eyes-on page-through (Appendix F) is still human.
KINDLE_PREVIEWER="${KINDLE_PREVIEWER:-/Applications/Kindle Previewer 3.app/Contents/MacOS/Kindle Previewer 3}"
if [[ -x "$KINDLE_PREVIEWER" ]]; then
  echo "--- Kindle Previewer ---"
  kindle_out="$(mktemp -d "${TMPDIR:-/tmp}/inference-engineering-kindle.XXXXXX")"
  trap 'rm -rf "$kindle_out"' EXIT
  "$KINDLE_PREVIEWER" "$PWD/build/inference-engineering.epub" \
    -convert -output "$kindle_out" >/dev/null
  python3 tools/check-kindle-log.py "$kindle_out"
else
  external_skipped="$external_skipped 'Kindle Previewer 3'"
  echo "skip: Kindle Previewer 3 not found (macOS/Windows only; set" \
    "KINDLE_PREVIEWER to its binary if it is installed elsewhere)" >&2
fi

if [[ -n "$external_skipped" ]]; then
  if [[ "${STRICT_EXTERNAL:-0}" == "1" ]]; then
    echo "error: STRICT_EXTERNAL=1 and these validators did not run:$external_skipped" >&2
    exit 1
  fi
  echo "EXTERNAL VALIDATORS SKIPPED:$external_skipped"
else
  echo "ALL EXTERNAL VALIDATORS PASSED"
fi
