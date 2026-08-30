#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."

# A release run can retain the otherwise-temporary validator output. Relative
# paths are resolved from the repository root so the evidence location is
# stable even when this script is invoked elsewhere.
release_evidence_dir=""
if [[ -n "${RELEASE_EVIDENCE_DIR:-}" ]]; then
  if [[ "$RELEASE_EVIDENCE_DIR" = /* ]]; then
    release_evidence_dir="$RELEASE_EVIDENCE_DIR"
  else
    release_evidence_dir="$PWD/$RELEASE_EVIDENCE_DIR"
  fi
  mkdir -p "$release_evidence_dir"
fi

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
# runs inside `npm test` before anything executes) and then runs the four
# scripted regression suites plus every named node:test contract file. The
# assembled offline demo is a separate gate: unit tests are not proof that the
# pieces compose into a complete request path.
# `node --check` is not used on purpose: on Node 24 it exits 0 for a module
# holding a syntax error, so it reports clean on exactly the broken file this
# step exists to catch. tsc resolution: PATH first, then the companion's own
# pinned devDependency (node_modules/.bin/tsc, present after the documented
# fresh-clone step `npm install` in companion/tinyengine). Either way
# `npm test` type-checks before anything executes.
if command -v tsc >/dev/null 2>&1 \
   || [[ -x companion/tinyengine/node_modules/.bin/tsc ]]; then
  (cd companion/tinyengine && npm test --silent)
  (cd companion/tinyengine && npm run demo --silent >/dev/null)
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
    && node dist/tests/attack-gate6.js && node dist/tests/attack2-gate6.js \
    && node --test dist/tests/*.test.js && node dist/demo.js >/dev/null)
else
  echo "error: tsc not on PATH and companion/tinyengine/dist is absent —" \
       "install TypeScript (npm install in companion/tinyengine pulls the" \
       "pinned devDependency) so sources are type-checked" >&2
  exit 1
fi
tools/build.sh
python3 tools/validate-epub.py
python3 tools/epub-semantic-fingerprint.py build/inference-engineering.epub

echo "ALL OFFLINE CHECKS PASSED"

# ---------------------------------------------------------------------------
# External validators
#
# None of these ships with the repo, and Kindle Previewer is macOS/Windows only,
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
  if [[ -n "$release_evidence_dir" ]]; then
    epubcheck --failonwarnings build/inference-engineering.epub \
      2>&1 | tee "$release_evidence_dir/epubcheck.log"
  else
    epubcheck --failonwarnings build/inference-engineering.epub
  fi
else
  external_skipped="$external_skipped epubcheck"
  echo "skip: epubcheck not installed (brew install epubcheck)" >&2
fi

# DAISY Ace checks the accessibility semantics that EPUBCheck deliberately
# does not, including meaningful table headers. Ace currently exits zero even
# when its JSON report contains failed assertions, so parse the report and
# gate on its contents rather than trusting the process status alone.
ACE="${ACE:-ace}"
if command -v "$ACE" >/dev/null 2>&1; then
  echo "--- DAISY Ace ---"
  (
    if [[ -n "$release_evidence_dir" ]]; then
      ace_out="$(mktemp -d "$release_evidence_dir/ace.XXXXXX")"
    else
      ace_out="$(mktemp -d "${TMPDIR:-/tmp}/inference-engineering-ace.XXXXXX")"
      trap 'rm -rf "$ace_out"' EXIT
    fi
    "$ACE" -s -E -o "$ace_out" -f build/inference-engineering.epub
    python3 - "$ace_out/report.json" <<'PY'
import json
import sys
from pathlib import Path

report_path = Path(sys.argv[1])
try:
    report = json.loads(report_path.read_text(encoding="utf-8"))
except (OSError, json.JSONDecodeError) as exc:
    raise SystemExit(f"error: cannot read DAISY Ace report: {exc}") from exc

failed = False
details = []


def walk(assertion, inherited_subject=""):
    global failed
    subject = assertion.get("earl:testSubject", {}).get("url", inherited_subject)
    result = assertion.get("earl:result", {})
    if result.get("earl:outcome") == "fail":
        failed = True
        test = assertion.get("earl:test", {})
        if test or result.get("dct:description"):
            pointer = result.get("earl:pointer", {})
            locations = pointer.get("css") or pointer.get("cfi") or []
            location = locations[0] if locations else "(no pointer)"
            details.append(
                (
                    subject or "(unknown document)",
                    location,
                    test.get("dct:title", "accessibility failure"),
                    test.get("earl:impact", "unknown impact"),
                    result.get("dct:description", ""),
                )
            )
    for child in assertion.get("assertions", []):
        walk(child, subject)


for top_level in report.get("assertions", []):
    walk(top_level)

if failed:
    print(f"DAISY ACE FAILED: {len(details)} actionable finding(s)")
    for subject, location, title, impact, description in details:
        print(f"- {subject} {location}: {title} ({impact}) — {description}")
    raise SystemExit(1)

print("DAISY ACE OK: no automated accessibility failures")
PY
  )
else
  external_skipped="$external_skipped DAISY-Ace"
  echo "skip: DAISY Ace not installed (npm install -g @daisy/ace)" >&2
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
  if [[ -n "$release_evidence_dir" ]]; then
    kindle_out="$(mktemp -d "$release_evidence_dir/kindle.XXXXXX")"
  else
    kindle_out="$(mktemp -d "${TMPDIR:-/tmp}/inference-engineering-kindle.XXXXXX")"
    trap 'rm -rf "$kindle_out"' EXIT
  fi
  if [[ -n "$release_evidence_dir" ]]; then
    "$KINDLE_PREVIEWER" "$PWD/build/inference-engineering.epub" \
      -convert -output "$kindle_out" \
      >"$release_evidence_dir/kindle-previewer.stdout.log" 2>&1
  else
    "$KINDLE_PREVIEWER" "$PWD/build/inference-engineering.epub" \
      -convert -output "$kindle_out" >/dev/null
  fi
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

if [[ -n "$release_evidence_dir" ]]; then
  {
    echo "verified_at_utc=$(date -u +%Y-%m-%dT%H:%M:%SZ)"
    echo "git_commit=$(git rev-parse HEAD)"
    echo "git_worktree_clean=$([[ -z "$(git status --porcelain=v1)" ]] && echo yes || echo no)"
    echo "epub_sha256=$(shasum -a 256 build/inference-engineering.epub | awk '{print $1}')"
    echo "epub_bytes=$(wc -c < build/inference-engineering.epub | tr -d ' ')"
    echo "epub_semantics=$(python3 tools/epub-semantic-fingerprint.py build/inference-engineering.epub)"
    echo "pandoc=$(pandoc --version | sed -n '1p')"
    echo "node=$(node --version)"
    echo "python=$(python3 --version 2>&1)"
    command -v epubcheck >/dev/null 2>&1 && echo "epubcheck=$(epubcheck --version 2>&1 | sed -n '1p')"
    command -v "$ACE" >/dev/null 2>&1 && echo "ace=$($ACE --version 2>&1 | sed -n '1p')"
  } > "$release_evidence_dir/manifest.txt"
  echo "RELEASE EVIDENCE: $release_evidence_dir"
fi
