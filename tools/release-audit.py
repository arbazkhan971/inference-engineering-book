#!/usr/bin/env python3
"""Fail closed when retail metadata or measurable release claims drift."""

from __future__ import annotations

import ast
import argparse
import json
import re
import sys
import zipfile
from pathlib import Path
from xml.etree import ElementTree


ROOT = Path(__file__).resolve().parents[1]
MANUSCRIPT = ROOT / "manuscript"
RESEARCH = ROOT / "research"
METADATA = ROOT / "PUBLISHING" / "book-metadata.yaml"

CANONICAL = {
    "title": "Inference Engineering",
    "subtitle": "Inside the Engine Room of AI Agents",
    "author": "Arbaz Khan",
    "lang": "en",
}
EXPECTED_CHAPTERS = set(range(1, 19))
EXPECTED_MERMAID = 34
MIN_DATED_DIGESTS = 60
VOLUME_I_EXTERNAL_SOURCE_COUNT = 55
MIN_EXTERNAL_SOURCE_LINKS = 59

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument(
    "--epub",
    type=Path,
    help="also verify the generated EPUB package and visible title page",
)
parser.add_argument("--quiet", action="store_true", help="print only failures")
args = parser.parse_args()

errors: list[str] = []


def fail(message: str) -> None:
    errors.append(message)


def read(path: Path) -> str:
    try:
        return path.read_text(encoding="utf-8")
    except OSError as exc:
        fail(f"cannot read {path.relative_to(ROOT)}: {exc}")
        return ""


def parse_flat_yaml(path: Path) -> dict[str, str]:
    """Parse the deliberately flat scalar metadata file without a YAML dependency."""
    values: dict[str, str] = {}
    for line_number, raw_line in enumerate(read(path).splitlines(), start=1):
        line = raw_line.strip()
        if not line or line.startswith("#") or line in {"---", "..."}:
            continue
        match = re.fullmatch(r"([A-Za-z][A-Za-z0-9_-]*):\s*(.+)", line)
        if not match:
            fail(f"{path.relative_to(ROOT)}:{line_number}: unsupported YAML shape")
            continue
        key, raw_value = match.groups()
        if key in values:
            fail(f"{path.relative_to(ROOT)}:{line_number}: duplicate key {key!r}")
            continue
        try:
            value = ast.literal_eval(raw_value) if raw_value[:1] in {'\"', "'"} else raw_value
        except (SyntaxError, ValueError):
            fail(f"{path.relative_to(ROOT)}:{line_number}: invalid scalar for {key!r}")
            continue
        if not isinstance(value, str):
            fail(f"{path.relative_to(ROOT)}:{line_number}: {key!r} must be a string")
            continue
        values[key] = value
    return values


metadata = parse_flat_yaml(METADATA)
for field, expected in CANONICAL.items():
    actual = metadata.get(field)
    if actual != expected:
        fail(f"canonical {field!r} is {actual!r}; expected {expected!r}")

goal = read(ROOT / "GOAL.md")
for label, field in (("Title", "title"), ("Subtitle", "subtitle"), ("Author", "author")):
    match = re.search(rf"^\*\*{label}:\*\*\s*(.+?)\s*$", goal, flags=re.MULTILINE)
    if not match:
        fail(f"GOAL.md has no {label} field")
        continue
    actual = match.group(1).strip().strip("*_` ")
    if field == "author":
        actual = re.sub(r"\s+\([^)]*\)\s*$", "", actual)
    if actual != CANONICAL[field]:
        fail(f"GOAL.md {label.lower()} is {actual!r}; expected {CANONICAL[field]!r}")

style = read(ROOT / "STYLE.md")
full_title = f"{CANONICAL['title']}: {CANONICAL['subtitle']}"
if f"**Title:** *{full_title}*" not in style:
    fail("STYLE.md does not carry the canonical title and subtitle")

kdp = read(ROOT / "PUBLISHING" / "kdp-metadata.md")
kdp_normalized = " ".join(kdp.split())
locked_tokens = (
    "**Locked retail metadata:**",
    f"Title **{CANONICAL['title']}**",
    f"Subtitle *{CANONICAL['subtitle']}*",
    f"Author **{CANONICAL['author']}**",
    f"Language **English (`{CANONICAL['lang']}`)**",
    "**Recommendation:** Variant **A** is locked for this edition.",
)
for token in locked_tokens:
    if token not in kdp_normalized:
        fail(f"PUBLISHING/kdp-metadata.md is missing canonical lock token: {token}")
if re.search(r"\*\*Recommendation:\*\*\s+Variant\s+\*\*[BC]\*\*", kdp):
    fail("PUBLISHING/kdp-metadata.md still recommends an archived title variant")

launch = read(ROOT / "PUBLISHING" / "launch-copy.md")
if not launch.startswith(f"# Launch copy — *{full_title}*"):
    fail("PUBLISHING/launch-copy.md heading does not use the canonical title")
if "`PUBLISHING/book-metadata.yaml`" not in launch:
    fail("PUBLISHING/launch-copy.md does not name the canonical metadata source")

build = read(ROOT / "tools" / "build.sh")
if "--metadata-file PUBLISHING/book-metadata.yaml" not in build:
    fail("tools/build.sh does not consume PUBLISHING/book-metadata.yaml")
for field in ("title", "subtitle", "author", "lang", "language"):
    if re.search(rf"--metadata(?:=|\s+){field}=", build):
        fail(f"tools/build.sh overrides canonical {field!r} metadata")

chapter_pattern = re.compile(r"^(\d{2})-[a-z0-9-]+\.md$")
chapter_files = [
    (path, int(match.group(1)))
    for path in MANUSCRIPT.glob("*.md")
    if (match := chapter_pattern.fullmatch(path.name))
]
chapter_numbers = {number for _, number in chapter_files}
if chapter_numbers != EXPECTED_CHAPTERS or len(chapter_files) != len(EXPECTED_CHAPTERS):
    missing = sorted(EXPECTED_CHAPTERS - chapter_numbers)
    extra = sorted(chapter_numbers - EXPECTED_CHAPTERS)
    fail(f"chapter sequence drifted; missing={missing}, extra={extra}")

mermaid_pattern = re.compile(r"^```mermaid[ \t]*$", flags=re.MULTILINE)
mermaid_by_file: dict[Path, int] = {}
for path in MANUSCRIPT.glob("*.md"):
    mermaid_by_file[path] = len(mermaid_pattern.findall(read(path)))
mermaid_count = sum(mermaid_by_file.values())
if mermaid_count != EXPECTED_MERMAID:
    fail(f"Mermaid figure count is {mermaid_count}; expected {EXPECTED_MERMAID}")

alt_path = ROOT / "figures" / "alt-text.json"
try:
    alt_text = json.loads(read(alt_path))
except json.JSONDecodeError as exc:
    fail(f"figures/alt-text.json is invalid JSON: {exc}")
    alt_text = {}
if not isinstance(alt_text, dict):
    fail("figures/alt-text.json must contain one JSON object")
    alt_text = {}
expected_alt = {
    f"{path.stem}-m{index}"
    for path, count in mermaid_by_file.items()
    for index in range(1, count + 1)
}
actual_alt = set(alt_text)
if actual_alt != expected_alt:
    fail(
        "semantic alt-text keys do not match Mermaid figures; "
        f"missing={sorted(expected_alt - actual_alt)}, stale={sorted(actual_alt - expected_alt)}"
    )
for key, value in alt_text.items():
    if not isinstance(value, str) or len(" ".join(value.split())) < 40:
        fail(f"semantic alt text {key!r} is missing or too short")

digest_pattern = re.compile(r"^researched:\s*\d{4}-\d{2}-\d{2}\b", flags=re.MULTILINE)
dated_digests = sum(
    bool(digest_pattern.search(read(path))) for path in RESEARCH.glob("*.md")
)
if dated_digests < MIN_DATED_DIGESTS:
    fail(f"dated research digests total {dated_digests}; need at least {MIN_DATED_DIGESTS}")

sources = read(MANUSCRIPT / "appendix-e-sources-bibliography.md")
linked_source_pattern = re.compile(r"\[[^\]]+\]\((https?://[^)\s]+)\)")
linked_sources = {match.group(1) for match in linked_source_pattern.finditer(sources)}
if len(linked_sources) < MIN_EXTERNAL_SOURCE_LINKS:
    fail(
        f"Appendix E has {len(linked_sources)} unique linked external sources; "
        f"release minimum is {MIN_EXTERNAL_SOURCE_LINKS}"
    )


def element_text(element: ElementTree.Element | None) -> str | None:
    if element is None:
        return None
    return "".join(element.itertext()).strip()


if args.epub:
    epub_path = args.epub if args.epub.is_absolute() else ROOT / args.epub
    try:
        with zipfile.ZipFile(epub_path) as archive:
            opf = ElementTree.fromstring(archive.read("EPUB/content.opf"))
            title_page = ElementTree.fromstring(
                archive.read("EPUB/text/title_page.xhtml")
            )
    except (OSError, KeyError, zipfile.BadZipFile, ElementTree.ParseError) as exc:
        fail(f"cannot inspect generated EPUB {epub_path}: {exc}")
    else:
        opf_fields = {
            "title": element_text(opf.find(".//{*}title")),
            "author": element_text(opf.find(".//{*}creator")),
            "lang": element_text(opf.find(".//{*}language")),
        }
        for field, actual in opf_fields.items():
            if actual != CANONICAL[field]:
                fail(
                    f"generated EPUB {field!r} is {actual!r}; "
                    f"expected {CANONICAL[field]!r}"
                )
        title_page_fields = {
            element.attrib.get("class"): element_text(element)
            for element in title_page.iter()
            if element.attrib.get("class") in {"title", "subtitle", "author"}
        }
        for field, expected in (
            ("title", CANONICAL["title"]),
            ("subtitle", CANONICAL["subtitle"]),
            ("author", CANONICAL["author"]),
        ):
            actual = title_page_fields.get(field)
            if actual != expected:
                fail(
                    f"generated EPUB title-page {field!r} is {actual!r}; "
                    f"expected {expected!r}"
                )

if errors:
    print("FAIL release claims audit", file=sys.stderr)
    for error in errors:
        print(f"  - {error}", file=sys.stderr)
    raise SystemExit(1)

if not args.quiet:
    print("OK release claims audit")
    print(
        f"  metadata: {full_title} — {CANONICAL['author']} ({CANONICAL['lang']})\n"
        f"  chapters: {len(chapter_numbers)}\n"
        f"  Mermaid figures / semantic alt entries: {mermaid_count} / {len(actual_alt)}\n"
        f"  dated research digests: {dated_digests}\n"
        f"  unique linked external sources: {len(linked_sources)} "
        f"(release minimum: {MIN_EXTERNAL_SOURCE_LINKS}; "
        f"current Volume I canonical count: {VOLUME_I_EXTERNAL_SOURCE_COUNT})"
    )
