#!/usr/bin/env bash
# Render every ```mermaid fence in manuscript/ to PNG via mermaid-cli.
# Commits-ready outputs land in figures/png/mermaid/ and figures/svg-mermaid/.
# Run on a machine with npx + rsvg-convert (rendered PNGs are committed, so
# the EPUB build itself never needs a browser).
set -euo pipefail
cd "$(dirname "$0")/.."
mkdir -p figures/svg-mermaid figures/png/mermaid build/mermaid-src

count=0
for md in manuscript/*.md; do
  base="$(basename "$md" .md)"
  # split on fences; mermaid blocks are odd-indexed after ^```mermaid opener
  python3 - "$md" "$base" <<'EOF'
import sys, pathlib
text = pathlib.Path(sys.argv[1]).read_text(encoding="utf-8")
base = sys.argv[2]
lines = text.split("\n")
out, inside, idx = [], False, 0
for line in lines:
    if not inside and line.strip() == "```mermaid":
        inside, idx = True, idx + 1
        continue
    if inside and line.strip() == "```":
        inside = False
        continue
    if inside:
        out.append(line)
    if out and not inside or (out and line is lines[-1]):
        pass
    if not inside and out:
        dst = pathlib.Path(f"build/mermaid-src/{base}-m{idx}.mmd")
        dst.write_text("\n".join(out) + "\n", encoding="utf-8")
        out = []
if out:
    dst = pathlib.Path(f"build/mermaid-src/{base}-m{idx}.mmd")
    dst.write_text("\n".join(out) + "\n", encoding="utf-8")
EOF
done

for mmd in build/mermaid-src/*.mmd; do
  name="$(basename "$mmd" .mmd)"
  [ -s "$mmd" ] || continue
  if [ ! -f "figures/svg-mermaid/$name.svg" ] || [ "$mmd" -nt "figures/svg-mermaid/$name.svg" ]; then
    npx -y @mermaid-js/mermaid-cli -i "$mmd" -o "figures/svg-mermaid/$name.svg" \
      -b transparent --quiet 2>/dev/null || npx -y @mermaid-js/mermaid-cli -i "$mmd" -o "figures/svg-mermaid/$name.svg" -b transparent
    rsvg-convert -w 2400 "figures/svg-mermaid/$name.svg" -o "figures/png/mermaid/$name.png"
    echo "rendered $name"
  fi
done
echo "mermaid renders up to date: $(ls figures/png/mermaid/*.png 2>/dev/null | wc -l) diagrams"
