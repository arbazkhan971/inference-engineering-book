#!/usr/bin/env bash
# Render every SVG figure to 2x PNG for Kindle crispness.
# SVGs render into a staging directory first; committed figures/png outputs
# are only replaced after every render and the cover composite succeed, so a
# missing dependency can never clobber the composited cover.
set -euo pipefail
cd "$(dirname "$0")/.."
# Dependency checks come first, before any committed PNG can be touched.
if ! command -v rsvg-convert >/dev/null 2>&1 \
  && ! command -v inkscape >/dev/null 2>&1 \
  && ! command -v convert >/dev/null 2>&1; then
  echo "error: install librsvg, Inkscape, or ImageMagick to render figures" >&2
  exit 1
fi
# The cover composite needs either ImageMagick or Python + Pillow. Pillow is
# preferred because librsvg already covers rasterisation, so a normal checkout
# needs no ImageMagick install at all.
COMPOSITOR=""
if python3 -c "import PIL" >/dev/null 2>&1; then
  COMPOSITOR="pillow"
elif command -v convert >/dev/null 2>&1; then
  COMPOSITOR="imagemagick"
else
  echo "error: install Pillow (pip install pillow) or ImageMagick to composite the cover" >&2
  exit 1
fi
mkdir -p figures/png
RENDER_CONFIG_DIR="${TMPDIR:-/tmp}/harness-engineering-render"
mkdir -p "$RENDER_CONFIG_DIR/config" "$RENDER_CONFIG_DIR/cache/fontconfig"
export XDG_CONFIG_HOME="$RENDER_CONFIG_DIR/config"
export XDG_CACHE_HOME="$RENDER_CONFIG_DIR/cache"
STAGE_DIR="$(mktemp -d "${TMPDIR:-/tmp}/harness-engineering-figures.XXXXXX")"
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
  elif command -v convert >/dev/null 2>&1; then
    convert -background none -density 192 "$svg" -resize "${render_width}x" \
      "$STAGE_DIR/${name}.png"
  else
    echo "error: install librsvg, Inkscape, or ImageMagick to render figures" >&2
    exit 1
  fi
  echo "rendered ${name}.png"
done
# Publish the plain figures only now that every render has succeeded.
for png in "$STAGE_DIR"/*.png; do
  name="$(basename "$png")"
  if [[ "$name" != "cover.png" ]]; then
    mv "$png" "figures/png/$name"
  fi
done
# The cover composite runs last. figures/png/cover.png is replaced by an
# atomic same-directory rename, and only after the composite succeeds.
if [[ "$COMPOSITOR" == "pillow" ]]; then
  python3 tools/composite-cover.py figures/art/cover-iceberg-v3.png \
    "$STAGE_DIR/cover.png" "$COVER_TMP" 1600x2560
else
  convert figures/art/cover-iceberg-v3.png \
    -resize '1600x2560^' -gravity center -extent 1600x2560 \
    "$STAGE_DIR/cover.png" -composite "$COVER_TMP"
fi
mv "$COVER_TMP" figures/png/cover.png
echo "composited cover artwork and exact typography"
if command -v sips >/dev/null 2>&1; then
  sips -s format jpeg figures/png/cover.png --out figures/png/cover.jpg >/dev/null
elif command -v convert >/dev/null 2>&1; then
  convert figures/png/cover.png -background white -alpha remove \
    -quality 92 figures/png/cover.jpg
else
  echo "error: install ImageMagick or use macOS sips for cover JPEG" >&2
  exit 1
fi
echo "rendered cover.jpg"

# Shrink the diagram PNGs before they are embedded. Figures are flat vector
# art, so a 256-colour palette is invisible to the eye and roughly a third of
# the bytes -- and Kindle bills the author per megabyte delivered.
python3 tools/optimize-figures.py
