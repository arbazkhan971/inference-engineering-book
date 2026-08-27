#!/usr/bin/env python3
"""Report fenced code lines that are too wide to survive a phone-sized reader.

The EPUB stylesheet sets `pre { font-size: 0.78em; white-space: pre-wrap; }`, so
an over-wide code line does not get a horizontal scrollbar -- it silently wraps
mid-expression, which is exactly where this book's aligned trailing `// (n)`
markers stop pointing at the thing they annotate. A Kindle phone shows roughly
40 columns at that size; 66 is the widest line that still degrades gracefully
when it does wrap.

Usage:
    tools/reflow-check.py                       # manuscript/*.md at width 66
    tools/reflow-check.py --width 72            # a looser budget
    tools/reflow-check.py --budget 281          # ratchet: fail only if it grows
    tools/reflow-check.py --skip-lang text      # ignore terminal transcripts
    tools/reflow-check.py --summary             # per-file counts only
    tools/reflow-check.py manuscript/ch13-*.md  # explicit paths

Exit status is 0 when the number of over-wide lines is within --budget and 1
when it is not, so this can join tools/verify.sh either at budget 0 (once the
blocks are reflowed) or at today's count as a ratchet that forbids regressions.

Only fenced blocks are inspected. Indented (four-space) code blocks are not
used in this manuscript; if that ever changes, they will need handling here.
"""

from __future__ import annotations

import argparse
import sys
import unicodedata
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
DEFAULT_GLOB = "manuscript/*.md"
FENCE_CHARS = ("`", "~")
ZERO_WIDTH_CATEGORIES = frozenset({"Mn", "Me", "Cf"})


def display_width(text: str, tabsize: int = 4) -> int:
    """Columns this line occupies in a monospaced reader.

    Combining marks and format characters take no column; East Asian wide and
    fullwidth characters take two. `Ambiguous` (which is where the box-drawing
    characters live) counts as one, matching every terminal font in practice.
    """
    columns = 0
    for char in text:
        if char == "\t":
            columns += tabsize - (columns % tabsize)
        elif unicodedata.category(char) in ZERO_WIDTH_CATEGORIES:
            continue
        elif unicodedata.east_asian_width(char) in ("W", "F"):
            columns += 2
        else:
            columns += 1
    return columns


def _fence_marker(stripped: str) -> tuple[str, int, str] | None:
    """Split a fence line into (char, run length, info string), or None."""
    if not stripped or stripped[0] not in FENCE_CHARS:
        return None
    char = stripped[0]
    run = len(stripped) - len(stripped.lstrip(char))
    if run < 3:
        return None
    return char, run, stripped[run:].strip()


def code_lines(path: Path):
    """Yield (lineno, text, language, block_start) for lines inside a fence.

    `block_start` is the line number of the opening fence, so findings can be
    grouped by the block that has to be reflowed rather than by bare line.

    The opening fence's own indentation is stripped from its body lines, which
    is what a Markdown renderer does, so an indented block is not reported as
    wide purely because of the indent that will not be rendered.
    """
    fence: tuple[str, int, str, int, int] | None = None
    lines = path.read_text(encoding="utf-8").splitlines()
    for lineno, raw in enumerate(lines, 1):
        stripped = raw.lstrip(" ")
        indent = len(raw) - len(stripped)
        marker = _fence_marker(stripped)
        if fence is None:
            if marker and indent <= 3:
                char, run, info = marker
                fence = (char, run, info.split()[0] if info else "text", indent, lineno)
            continue
        char_open, run_open, language, indent_open, start = fence
        if marker and marker[0] == char_open and marker[1] >= run_open and not marker[2]:
            fence = None
            continue
        body = raw
        for _ in range(indent_open):
            if body.startswith(" "):
                body = body[1:]
        yield lineno, body, language, start
    if fence is not None:
        print(f"warning: {path}: unterminated code fence opened before EOF", file=sys.stderr)


def scan(paths, width, skip_langs, only_langs):
    """Return (findings, scanned_lines, scanned_blocks).

    findings maps a file to an ordered {block_start: (language, [hits])} map,
    where a hit is (lineno, cols, text).
    """
    findings: dict[Path, dict[int, tuple[str, list]]] = {}
    scanned_lines = 0
    scanned_blocks: set[tuple[Path, int]] = set()
    for path in paths:
        blocks: dict[int, tuple[str, list]] = {}
        for lineno, text, language, start in code_lines(path):
            if language in skip_langs:
                continue
            if only_langs and language not in only_langs:
                continue
            scanned_lines += 1
            scanned_blocks.add((path, start))
            cols = display_width(text)
            if cols > width:
                blocks.setdefault(start, (language, []))[1].append((lineno, cols, text))
        if blocks:
            findings[path] = blocks
    return findings, scanned_lines, len(scanned_blocks)


def relative(path: Path) -> str:
    try:
        return str(path.resolve().relative_to(REPO_ROOT))
    except ValueError:
        return str(path)


def clip(text: str, limit: int = 84) -> str:
    text = text.rstrip()
    return text if len(text) <= limit else text[: limit - 1] + "…"


def main(argv=None) -> int:
    parser = argparse.ArgumentParser(
        description="Report fenced code lines wider than a column budget.",
        formatter_class=argparse.RawDescriptionHelpFormatter,
    )
    parser.add_argument("paths", nargs="*", help=f"files to scan (default: {DEFAULT_GLOB})")
    parser.add_argument("--width", type=int, default=66, metavar="N",
                        help="widest acceptable code line, in columns (default: 66)")
    parser.add_argument("--budget", type=int, default=0, metavar="N",
                        help="over-wide lines tolerated before exiting non-zero (default: 0)")
    parser.add_argument("--skip-lang", action="append", default=[], metavar="LANG",
                        help="fence language to ignore, repeatable (e.g. text)")
    parser.add_argument("--only-lang", action="append", default=[], metavar="LANG",
                        help="fence language to restrict to, repeatable")
    parser.add_argument("--summary", action="store_true",
                        help="per-file counts only, no individual lines")
    parser.add_argument("--no-content", action="store_true",
                        help="omit the offending line's text")
    args = parser.parse_args(argv)

    if args.width < 1:
        parser.error("--width must be at least 1")
    if args.budget < 0:
        parser.error("--budget must not be negative")

    if args.paths:
        paths = [Path(p) for p in args.paths]
    else:
        paths = sorted(REPO_ROOT.glob(DEFAULT_GLOB))
    missing = [p for p in paths if not p.is_file()]
    if missing:
        for path in missing:
            print(f"error: no such file: {path}", file=sys.stderr)
        return 2
    if not paths:
        print(f"error: nothing to scan (no files matched {DEFAULT_GLOB})", file=sys.stderr)
        return 2

    findings, scanned_lines, scanned_blocks = scan(
        paths, args.width, set(args.skip_lang), set(args.only_lang))
    total = sum(len(hits) for blocks in findings.values()
                for _, hits in blocks.values())
    bad_blocks = sum(len(blocks) for blocks in findings.values())

    print(f"reflow-check: fenced code lines wider than {args.width} columns")
    print(f"  scanned {scanned_lines} code lines in {scanned_blocks} fenced "
          f"blocks across {len(paths)} file(s)")
    print()

    widest = (0, None, 0)  # cols, file, lineno
    for path in sorted(findings, key=relative):
        blocks = findings[path]
        file_hits = [hit for _, hits in blocks.values() for hit in hits]
        worst_hit = max(file_hits, key=lambda h: h[1])
        if worst_hit[1] > widest[0]:
            widest = (worst_hit[1], relative(path), worst_hit[0])
        print(f"{relative(path)} — {len(file_hits)} line(s) over in "
              f"{len(blocks)} block(s), widest {worst_hit[1]}")
        if args.summary:
            print()
            continue
        for start in sorted(blocks):
            language, hits = blocks[start]
            block_worst = max(hit[1] for hit in hits)
            print(f"  block at L{start} ({language}) — {len(hits)} over, "
                  f"widest {block_worst} (+{block_worst - args.width})")
            for lineno, cols, text in hits:
                over = f"(+{cols - args.width})"
                head = f"    L{lineno:<5} {cols:>3} cols  {over:<6}"
                print(head if args.no_content else f"{head}  {clip(text)}")
        print()

    if total == 0:
        print(f"OK — every fenced code line fits in {args.width} columns")
        return 0

    plural = "line" if total == 1 else "lines"
    print(f"{total} {plural} over {args.width} columns, in {bad_blocks} block(s) "
          f"across {len(findings)} file(s); "
          f"widest {widest[0]} ({widest[1]} L{widest[2]})")
    if total <= args.budget:
        print(f"within budget of {args.budget} — passing")
        return 0
    print(f"FAIL — budget is {args.budget}")
    print(f"hint: reflow the worst offenders, or ratchet with --budget {total} "
          f"to freeze the count and forbid regressions")
    return 1


if __name__ == "__main__":
    sys.exit(main())
