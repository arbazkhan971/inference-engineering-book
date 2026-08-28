#!/usr/bin/env python3
"""Fail on structural/editorial defects that should never reach the EPUB.

Vol. II adaptation of the Harness Engineering manuscript linter.

Policy (inherited from Vol. I, see EDITORIAL_SYSTEM.md):
- Universal per numbered chapter: at least one ELI5 block, one
  `Where the picture stops` section, and >= 2 of the 4 closing moves.
- The Words before machinery table is REQUIRED in Part I vocabulary chapters
  (01-04) and checked for row count wherever it appears.
- Prologue/front matter/appendices are exempt from the frame but still
  checked for forbidden text and broken images.
- In-flight tolerant: validates whatever chapters exist, demands a
  contiguous 1..N numbering, and only advises on total length until the
  manuscript is complete.
"""

from pathlib import Path
import re
import sys

ROOT = Path(__file__).resolve().parents[1]
MANUSCRIPT = ROOT / "manuscript"

UNIVERSAL_MARKERS = ("ELI5:", "Where the picture stops")
CLOSING_MOVES = ("Build it.", "Break it.", "Prove it.", "See it in the wild.")
MIN_CLOSING_MOVES = 2
MIN_TERM_ROWS = 5
VOCABULARY_REQUIRED = {"01", "02", "03", "04"}  # Part I vocabulary on-ramps
FORBIDDEN = (
    "TODO", "TBD", "FIXME", "PLACEHOLDER",
    "Build Your Own Coding Agent CLI",  # wrong book
)
EXPECTED_CHAPTERS = 18

errors: list[str] = []
warnings: list[str] = []

files = sorted(MANUSCRIPT.glob("*.md"))
numbered = [p for p in files if re.match(r"^\d\d-", p.name)]
prefixes = [p.name[:2] for p in numbered]

# contiguous numbering 01..N with no gaps
expected_prefixes = [f"{i:02d}" for i in range(1, len(numbered) + 1)]
if prefixes != expected_prefixes:
    errors.append(
        f"chapter files are {prefixes}, expected contiguous {expected_prefixes}"
    )

total_words = 0
for path in files:
    text = path.read_text(encoding="utf-8")
    total_words += len(re.findall(r"\b[\w’'-]+\b", text))

    for forbidden in FORBIDDEN:
        if forbidden in text:
            errors.append(f"{path.name}: forbidden text {forbidden!r}")
    for target in re.findall(r"!\[[^\]]*\]\(([^)]+)\)", text):
        if "://" in target:
            continue
        if not (ROOT / target).resolve().exists():
            errors.append(f"{path.name}: missing image {target}")

    if not re.match(r"^\d\d-", path.name):
        continue  # prologue / front matter / appendices exempt from the frame

    prefix = path.name[:2]
    match = re.search(r"^# (\d+)\. ", text, re.MULTILINE)
    if not match:
        errors.append(f"{path.name}: missing '# N. Title' heading")
    elif int(match.group(1)) != int(prefix):
        errors.append(
            f"{path.name}: heading says chapter {match.group(1)}, "
            f"filename says {prefix}"
        )

    for marker in UNIVERSAL_MARKERS:
        if marker not in text:
            errors.append(f"{path.name}: missing teaching marker {marker!r}")
    landed = [
        m for m in CLOSING_MOVES
        if re.search(rf"^### {re.escape(m.rstrip('.'))}\s*$", text, re.MULTILINE)
        or f"**{m}**" in text
    ]
    if len(landed) < MIN_CLOSING_MOVES:
        errors.append(
            f"{path.name}: only {len(landed)} closing move(s); need "
            f">= {MIN_CLOSING_MOVES}"
        )

    if "Words before machinery" in text:
        rows = re.findall(r"^\| [^|]+ \| [^|]+ \| [^|]+ \|$", text, re.MULTILINE)
        term_rows = max(0, len(rows) - 2)  # drop header + separator
        if term_rows < MIN_TERM_ROWS:
            errors.append(
                f"{path.name}: Words before machinery table has only "
                f"{term_rows} term rows (need >= {MIN_TERM_ROWS})"
            )
    elif prefix in VOCABULARY_REQUIRED:
        errors.append(
            f"{path.name}: Part I vocabulary chapter missing "
            f"'Words before machinery' table"
        )

    if "researched" not in text and "Dated snapshot" not in text and "snapshot" not in text:
        warnings.append(f"{path.name}: no dated-snapshot hedging detected")

# appendix letters strictly increasing where present
appendix_letters = re.findall(
    r"^# Appendix ([A-Z])\.", "\n".join(p.read_text(encoding="utf-8") for p in files),
    re.MULTILINE,
)
if appendix_letters != sorted(set(appendix_letters)):
    errors.append(f"appendix letters out of order or duplicated: {appendix_letters}")

if len(numbered) >= EXPECTED_CHAPTERS and total_words < 40_000:
    errors.append(f"complete manuscript unexpectedly short: {total_words:,} words")

# pipe-table integrity: every row must carry no more UNESCAPED pipes than its
# header declares. A raw `|` inside a cell (e.g. quoted table prose in a
# ledger row) silently splits the row; pandoc discards the overflow columns,
# so the EPUB ships a truncated cell with no warning. Found in the F.1 ledger
# (fuzz-round-2 and pedagogy rows, iteration 89); this guard makes it
# impossible to reintroduce.
table_header_pipes = None
for path in files:
    for lineno, ln in enumerate(
        path.read_text(encoding="utf-8").split("\n"), start=1
    ):
        s = ln.strip()
        if s.startswith("|") and s.endswith("|"):
            unescaped = len(re.findall(r"(?<!\\)\|", ln))
            if table_header_pipes is None:
                table_header_pipes = unescaped
            elif unescaped > table_header_pipes:
                errors.append(
                    f"{path.name}:{lineno}: table row has {unescaped} unescaped "
                    f"pipes vs header {table_header_pipes} — escape in-cell pipes "
                    f"as \\| or the cell is silently truncated in the EPUB"
                )
        elif not s:
            table_header_pipes = None

if errors:
    print("MANUSCRIPT VALIDATION FAILED")
    for error in errors:
        print(f"- {error}")
    for warning in warnings:
        print(f"  warning: {warning}")
    sys.exit(1)

print(
    f"MANUSCRIPT OK: {len(numbered)}/{EXPECTED_CHAPTERS} chapters, "
    f"{len(files)} files, {total_words:,} words"
)
for warning in warnings:
    print(f"warning: {warning}")
