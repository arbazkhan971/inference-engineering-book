#!/usr/bin/env python3
"""Stage manuscript for pandoc: replace ```mermaid fences with image refs.

Writes build/staging-manuscript/*.md. A fence whose rendered PNG exists in
figures/png/mermaid/<file>-m<N>.png becomes an image reference; otherwise the
fence degrades to a ```text block so nothing renders as literal mermaid DSL
in the EPUB.
"""

from pathlib import Path
import re
import sys

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "manuscript"
DST = ROOT / "build" / "staging-manuscript"
PNG = ROOT / "figures" / "png" / "mermaid"

DST.mkdir(parents=True, exist_ok=True)

counts = {"replaced": 0, "kept": 0}
for md in sorted(SRC.glob("*.md")):
    text = md.read_text(encoding="utf-8")
    base = md.stem
    counter = {"n": 0}

    def swap(match):
        counter["n"] += 1
        name = f"{base}-m{counter['n']}"
        png = PNG / f"{name}.png"
        if png.exists():
            counts["replaced"] += 1
            alt = f"Diagram: {name}"
            return f"![{alt}](figures/png/mermaid/{name}.png)"
        counts["kept"] += 1
        body = match.group(1)
        return f"```text{body}```"

    out = re.sub(r"```mermaid\n(.*?)```", swap, text, flags=re.DOTALL)
    (DST / md.name).write_text(out, encoding="utf-8")

print(f"staged {len(list(DST.glob('*.md')))} files: {counts["replaced"]} mermaid -> images, {counts["kept"]} degraded to text")
if counts["kept"]:
    print(f"warning: {counts["kept"]} diagram(s) lack renders; run tools/render-mermaid.sh", file=sys.stderr)
