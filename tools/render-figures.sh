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
  # mtime guard (same pattern as tools/render-mermaid.sh): a committed PNG
  # that is not older than its SVG is current. Skipping keeps a stranger's
  # first build from dirtying the tree with this machine's rsvg/font bytes —
  # the committed renders are canonical; re-render by touching the SVG.
  if [ -f "figures/png/$name.png" ] && [ ! "$svg" -nt "figures/png/$name.png" ]; then
    echo "$name.png up to date (mtime guard)"
    continue
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
  [ -e "$png" ] || continue  # empty stage when every render was guarded out
  name="$(basename "$png")"
  mv "$png" "figures/png/$name"
done

# KDP wants a JPEG cover (same mtime guard: convert only when missing or
# older than the PNG it is made from).
if [ -f figures/png/cover.jpg ] && [ ! figures/png/cover.png -nt figures/png/cover.jpg ]; then
  echo "cover.jpg up to date (mtime guard)"
else
  if command -v sips >/dev/null 2>&1; then
    sips -s format jpeg figures/png/cover.png --out figures/png/cover.jpg >/dev/null
  elif command -v convert >/dev/null 2>&1; then
    convert figures/png/cover.png -background white -alpha remove \
      -quality 92 figures/png/cover.jpg
  elif command -v ffmpeg >/dev/null 2>&1; then
    # cover.png renders opaque RGB (rsvg-convert flattens the SVG background),
    # so a plain encode is safe; -q:v 2 ≈ ImageMagick quality 92.
    ffmpeg -y -loglevel error -i figures/png/cover.png -q:v 2 figures/png/cover.jpg
  else
    echo "error: install sips, ImageMagick, or ffmpeg to make the cover JPEG" >&2
    exit 1
  fi
  echo "rendered cover.jpg"
fi

if [[ -f tools/optimize-figures.py ]]; then
  python3 tools/optimize-figures.py
fi
