#!/usr/bin/env bash
# Render every SVG figure to 2x PNG for Kindle crispness.
# Vol. II: the cover is a self-contained SVG (no artwork composite).
set -euo pipefail
cd "$(dirname "$0")/.."
if ! command -v rsvg-convert >/dev/null 2>&1 \
  && ! command -v inkscape >/dev/null 2>&1 \
  && ! command -v convert >/dev/null 2>&1; then
  echo "error: install librsvg, Inkscape, or ImageMagick to render figures" >&2
  exit 1
fi
mkdir -p figures/png
RENDER_CONFIG_DIR="${TMPDIR:-/tmp}/infbook-render"
mkdir -p "$RENDER_CONFIG_DIR/config" "$RENDER_CONFIG_DIR/cache/fontconfig"
export XDG_CONFIG_HOME="$RENDER_CONFIG_DIR/config"
export XDG_CACHE_HOME="$RENDER_CONFIG_DIR/cache"
STAGE_DIR="$(mktemp -d "${TMPDIR:-/tmp}/infbook-figures.XXXXXX")"
COVER_TMP="figures/png/.cover.tmp.png"
trap 'rm -rf "$STAGE_DIR"; rm -f "$COVER_TMP"' EXIT

for svg in figures/svg/*.svg; do
  name="$(basename "$svg" .svg)"
  render_width=3200
  if [[ "$name" == "cover" ]]; then
    render_width=1600
  fi
  if command -v rsvg-convert >/dev/null 2>&1; then
    rsvg-convert -w "$render_width" "$svg" -o "$STAGE_DIR/${name}.png"
  elif command -v inkscape >/dev/null 2>&1; then
    inkscape "$svg" --export-type=png --export-width="$render_width" \
      --export-filename="$STAGE_DIR/${name}.png" >/dev/null
  else
    convert -background none -density 192 "$svg" -resize "${render_width}x" \
      "$STAGE_DIR/${name}.png"
  fi
  echo "rendered ${name}.png"
done

for png in "$STAGE_DIR"/*.png; do
  name="$(basename "$png")"
  mv "$png" "figures/png/$name"
done

# KDP wants a JPEG cover.
if command -v sips >/dev/null 2>&1; then
  sips -s format jpeg figures/png/cover.png --out figures/png/cover.jpg >/dev/null
else
  convert figures/png/cover.png -background white -alpha remove \
    -quality 92 figures/png/cover.jpg
fi
echo "rendered cover.jpg"

if [[ -f tools/optimize-figures.py ]]; then
  python3 tools/optimize-figures.py
fi
