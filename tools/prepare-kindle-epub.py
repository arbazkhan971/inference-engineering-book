#!/usr/bin/env python3
"""Apply Kindle-specific EPUB packaging adjustments after Pandoc builds it."""

from pathlib import Path
from tempfile import NamedTemporaryFile
from zipfile import ZipFile
import os


ROOT = Path(__file__).resolve().parents[1]
EPUB = ROOT / "build" / "inference-engineering.epub"
OPF = "EPUB/content.opf"
NEEDLE = b'<itemref idref="cover_xhtml" />'
REPLACEMENT = b'<itemref idref="cover_xhtml" linear="no" />'
SUMMARY = (
    b'<meta property="schema:accessibilitySummary">'
    b'This EPUB is primarily textual and includes structured headings, a navigable '
    b'table of contents, alternative text for informative images, and text-based '
    b'code examples. It contains no audio, video, or timed interaction.'
    b'</meta>'
)
SUMMARY_MARKER = b'property="schema:accessibilitySummary"'


def main() -> None:
    if not EPUB.exists():
        raise SystemExit(f"missing {EPUB}")

    with ZipFile(EPUB, "r") as source:
        entries = [(info, source.read(info.filename)) for info in source.infolist()]

    adjusted = False
    rewritten: list[tuple[object, bytes]] = []
    for info, data in entries:
        if info.filename == OPF:
            if NEEDLE not in data:
                if b'idref="cover_xhtml" linear="no"' not in data:
                    raise SystemExit("could not find the Pandoc cover spine entry")
            else:
                data = data.replace(NEEDLE, REPLACEMENT, 1)
                adjusted = True
            if SUMMARY_MARKER not in data:
                marker = b'    <meta property="schema:accessibilityHazard">none</meta>'
                if marker not in data:
                    # Older Pandoc (e.g. 3.1.3) emits no accessibility block
                    # at all; inject one before </metadata> so the EPUB validates
                    # regardless of the Pandoc version on the build machine.
                    close = b'</metadata>'
                    if close not in data:
                        raise SystemExit("could not find OPF </metadata> to inject the accessibility block")
                    block = (
                        b'    <meta property="schema:accessibilityHazard">none</meta>\n    '
                        + SUMMARY + b'\n  '
                    )
                    data = data.replace(close, block + close, 1)
                    adjusted = True
                else:
                    data = data.replace(marker, marker + b"\n    " + SUMMARY, 1)
                    adjusted = True
        rewritten.append((info, data))

    if not adjusted:
        print("KINDLE EPUB OK: cover spine already non-linear")
        return

    temporary: str | None = None
    try:
        with NamedTemporaryFile(
            dir=EPUB.parent, prefix="harness-engineering-", suffix=".epub", delete=False
        ) as handle:
            temporary = handle.name
        with ZipFile(temporary, "w") as target:
            for info, data in rewritten:
                target.writestr(info, data)
        os.replace(temporary, EPUB)
    finally:
        if temporary and os.path.exists(temporary):
            os.unlink(temporary)
    print("KINDLE EPUB OK: cover spine marked linear=no")


if __name__ == "__main__":
    main()
