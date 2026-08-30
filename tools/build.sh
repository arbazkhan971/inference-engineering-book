#!/usr/bin/env bash
# Build the Kindle-ready EPUB from manuscript markdown.
# Usage: tools/build.sh
set -euo pipefail
cd "$(dirname "$0")/.."
BOOK_IDENTIFIER="${BOOK_IDENTIFIER:-urn:harness-engineering:vol2-inference}"
# BOOK_DATE is the machine-readable dc:date in the package document and must
# stay ISO 8601. BOOK_EDITION_LINE is the human line printed on the title page;
# Pandoc renders the `date` template variable there, so the two are set apart.
BOOK_DATE="${BOOK_DATE:-2026-08-27}"
BOOK_EDITION_LINE="${BOOK_EDITION_LINE:-Volume II · Inference Engineering}"
# Keep Pandoc's OPF modification timestamp stable across builds. Override this
# when publishing a new dated edition.
BOOK_SOURCE_DATE_EPOCH="${BOOK_SOURCE_DATE_EPOCH:-1787702400}"
export SOURCE_DATE_EPOCH="${SOURCE_DATE_EPOCH:-$BOOK_SOURCE_DATE_EPOCH}"

# Fail before rendering if the release identity or the measurable book claims
# have drifted. PUBLISHING/book-metadata.yaml is the only title-page/OPF source
# for title, subtitle, author, and language.
python3 tools/release-audit.py
if [[ "${SKIP_FIGURES:-0}" != "1" ]]; then
  tools/render-figures.sh
fi
mkdir -p build

# Lint the true manuscript, then stage it (mermaid fences -> images).
python3 tools/lint-manuscript.py
# Reader-facing code width at budget 0: mermaid sources are skipped (the
# staging step below replaces them with images) and every other fenced
# line fits 66 columns. --check-mermaid exists for curiosity, not release.
python3 tools/reflow-check.py
python3 tools/prepare-manuscript.py

# The argument list below is reading order, not filename order. The dedication
# and the Prologue open the book (00a-prologue.md) so a sample lands on the
# story; "Start here" orients the reader afterwards (00-front-matter.md); the
# bio, evidence note and copyright page close it (zz-back-matter.md).
pandoc \
  build/staging-manuscript/*.md \
  --from markdown+smart+fenced_code_blocks+pipe_tables \
  --to epub3 \
  --css assets/style.css \
  --embed-resources \
  --resource-path .:figures/png:. \
  --epub-cover-image figures/png/cover.jpg \
  --toc --toc-depth=2 \
  --metadata-file PUBLISHING/book-metadata.yaml \
  --metadata identifier="$BOOK_IDENTIFIER" \
  --metadata date="$BOOK_DATE" \
  --variable date="$BOOK_EDITION_LINE" \
  -o build/inference-engineering.epub

python3 tools/prepare-kindle-epub.py
python3 tools/release-audit.py --epub build/inference-engineering.epub --quiet

echo "OK build/inference-engineering.epub ($(du -h build/inference-engineering.epub | cut -f1))"
