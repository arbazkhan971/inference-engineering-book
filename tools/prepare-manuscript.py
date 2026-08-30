#!/usr/bin/env python3
"""Stage manuscript for pandoc: replace ```mermaid fences with image refs.

Writes build/staging-manuscript/*.md. A fence whose rendered PNG exists in
figures/png/mermaid/<file>-m<N>.png becomes an image reference; otherwise the
fence degrades to a ```text block so nothing renders as literal mermaid DSL
in the EPUB.
"""

from pathlib import Path
import json
import re
import sys

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "manuscript"
DST = ROOT / "build" / "staging-manuscript"
PNG = ROOT / "figures" / "png" / "mermaid"
ALT_TEXT = ROOT / "figures" / "alt-text.json"
MERMAID_RE = re.compile(r"```mermaid\n(.*?)```", flags=re.DOTALL)


def load_alt_text(expected: set[str]) -> dict[str, str]:
    """Load one meaningful description for every Mermaid figure, exactly."""
    if not ALT_TEXT.is_file():
        raise SystemExit(f"missing Mermaid alt-text manifest: {ALT_TEXT}")
    try:
        values = json.loads(ALT_TEXT.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as exc:
        raise SystemExit(f"cannot read Mermaid alt-text manifest: {exc}") from exc
    if not isinstance(values, dict):
        raise SystemExit("Mermaid alt-text manifest must be a JSON object")

    invalid: list[str] = []
    cleaned: dict[str, str] = {}
    for name, value in values.items():
        if not isinstance(name, str) or not isinstance(value, str):
            invalid.append(str(name))
            continue
        description = " ".join(value.split())
        generic = description.lower().startswith(("diagram:", "figure:"))
        unsafe_markdown = any(character in description for character in "[]")
        if len(description) < 40 or generic or unsafe_markdown:
            invalid.append(name)
            continue
        cleaned[name] = description

    missing = sorted(expected - cleaned.keys())
    stale = sorted(cleaned.keys() - expected)
    if invalid or missing or stale:
        parts = []
        if invalid:
            parts.append(f"invalid/generic: {', '.join(sorted(invalid))}")
        if missing:
            parts.append(f"missing: {', '.join(missing)}")
        if stale:
            parts.append(f"stale: {', '.join(stale)}")
        raise SystemExit("Mermaid alt-text coverage failed — " + "; ".join(parts))
    return cleaned


manuscripts = sorted(SRC.glob("*.md"))
expected_alt_names: set[str] = set()
for manuscript in manuscripts:
    block_count = len(MERMAID_RE.findall(manuscript.read_text(encoding="utf-8")))
    expected_alt_names.update(
        f"{manuscript.stem}-m{number}" for number in range(1, block_count + 1)
    )
alt_text = load_alt_text(expected_alt_names)

DST.mkdir(parents=True, exist_ok=True)

counts = {"replaced": 0, "kept": 0}
for md in manuscripts:
    text = md.read_text(encoding="utf-8")
    base = md.stem
    counter = {"n": 0}

    def swap(match):
        counter["n"] += 1
        name = f"{base}-m{counter['n']}"
        png = PNG / f"{name}.png"
        if png.exists():
            counts["replaced"] += 1
            alt = alt_text[name]
            return f"![{alt}](figures/png/mermaid/{name}.png)"
        counts["kept"] += 1
        body = match.group(1)
        return f"```text{body}```"

    out = MERMAID_RE.sub(swap, text)
    (DST / md.name).write_text(out, encoding="utf-8")

print(
    f"staged {len(list(DST.glob('*.md')))} files: "
    f"{counts['replaced']} mermaid -> images with semantic alt text, "
    f"{counts['kept']} degraded to text"
)
if counts["kept"]:
    print(f"warning: {counts["kept"]} diagram(s) lack renders; run tools/render-mermaid.sh", file=sys.stderr)
