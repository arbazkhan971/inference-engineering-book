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
# Code width. The EPUB stylesheet wraps `pre` rather than scrolling it, so an
# over-wide listing breaks mid-expression on a phone, exactly where the aligned
# trailing `// (n)` markers stop pointing at what they annotate. Budget 3: the
# only lines still over 66 columns are the three 64-hex SHA-256 digests printed
# as comments in ch19's approval-key transcript, where `// ` plus a full digest
# is 67 columns and shortening either would mean truncating a real value.
python3 tools/reflow-check.py --budget 3
# Parse-gate every source and test file before anything runs them, so a file
# that no longer parses is named here rather than inside a runner's output.
# `node --check` is deliberately not used: on Node 24 it exits 0 for a module
# holding a syntax error -- it parses the file as CommonJS, fails, retries it
# as ESM, and swallows the second error -- so it reports clean on exactly the
# broken test file this step exists to catch. The companion's own gate parses
# each file as the module it is and exits non-zero.
(cd companion/tinyharness && npm run --silent check)
# Run the companion through its own `npm test`, from its own directory. The
# suite writes fixture workspaces under $PWD/.test-workspaces and the package's
# posttest script is what removes them, so invoking `node --test` from the repo
# root instead would litter the root on every verify.
(cd companion/tinyharness && npm test --silent)
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
# those instead of on the exit status.
KINDLE_PREVIEWER="${KINDLE_PREVIEWER:-/Applications/Kindle Previewer 3.app/Contents/MacOS/Kindle Previewer 3}"
if [[ -x "$KINDLE_PREVIEWER" ]]; then
  echo "--- Kindle Previewer ---"
  kindle_out="$(mktemp -d "${TMPDIR:-/tmp}/harness-engineering-kindle.XXXXXX")"
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
