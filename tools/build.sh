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
if [[ "${SKIP_FIGURES:-0}" != "1" ]]; then
  tools/render-figures.sh
fi
mkdir -p build

# The argument list below is reading order, not filename order. The dedication
# and the Prologue open the book (00a-prologue.md) so a sample lands on the
# story; "Start here" orients the reader afterwards (00-front-matter.md); the
# bio, evidence note and copyright page close it (zz-back-matter.md).
pandoc \
  manuscript/*.md \
  --from markdown+smart+fenced_code_blocks+pipe_tables \
  --to epub3 \
  --css assets/style.css \
  --embed-resources \
  --resource-path .:figures/png \
  --epub-cover-image figures/png/cover.jpg \
  --toc --toc-depth=2 \
  --metadata identifier="$BOOK_IDENTIFIER" \
  --metadata date="$BOOK_DATE" \
  --variable date="$BOOK_EDITION_LINE" \
  --metadata title="Inference Engineering" \
  --metadata subtitle="Inside the Engine Room of AI Agents" \
  --metadata author="Arbaz Khan" \
  --metadata lang=en \
  -o build/inference-engineering.epub

python3 tools/prepare-kindle-epub.py

echo "OK build/inference-engineering.epub ($(du -h build/inference-engineering.epub | cut -f1))"
