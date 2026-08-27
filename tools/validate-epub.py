#!/usr/bin/env python3
"""Structural EPUB 3 validation without external packages."""

from pathlib import PurePosixPath, Path
from zipfile import ZipFile, ZIP_STORED
import posixpath
import sys
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
EPUB = ROOT / "build" / "inference-engineering.epub"
errors: list[str] = []

if not EPUB.exists():
    print(f"missing {EPUB}")
    sys.exit(1)

with ZipFile(EPUB) as book:
    infos = book.infolist()
    names = set(book.namelist())
    if not infos or infos[0].filename != "mimetype":
        errors.append("mimetype is not the first archive member")
    elif infos[0].compress_type != ZIP_STORED:
        errors.append("mimetype must be stored without compression")
    elif book.read("mimetype") != b"application/epub+zip":
        errors.append("mimetype content is invalid")

    try:
        container = ET.fromstring(book.read("META-INF/container.xml"))
        rootfile = next(
            element.attrib["full-path"]
            for element in container.iter()
            if element.tag.endswith("rootfile")
        )
    except Exception as exc:
        errors.append(f"cannot resolve package document: {exc}")
        rootfile = ""

    if rootfile:
        try:
            package = ET.fromstring(book.read(rootfile))
            package_dir = posixpath.dirname(rootfile)
            manifest: dict[str, tuple[str, str]] = {}
            spine_ids: list[str] = []
            cover_spine_linear: str | None = None
            title = ""
            creator = ""
            accessibility_summary = False
            for element in package.iter():
                local = element.tag.rsplit("}", 1)[-1]
                if local == "title" and not title:
                    title = element.text or ""
                elif local == "creator" and not creator:
                    creator = element.text or ""
                elif local == "item":
                    manifest[element.attrib["id"]] = (
                        element.attrib["href"],
                        element.attrib.get("media-type", ""),
                    )
                elif local == "itemref":
                    spine_ids.append(element.attrib["idref"])
                    if element.attrib.get("idref") == "cover_xhtml":
                        cover_spine_linear = element.attrib.get("linear", "yes")
                elif local == "meta" and element.attrib.get("property") == "schema:accessibilitySummary":
                    accessibility_summary = bool((element.text or "").strip())
            if title != "Inference Engineering":
                errors.append(f"wrong EPUB title: {title!r}")
            if creator != "Arbaz Khan":
                errors.append(f"wrong EPUB author: {creator!r}")
            if len(spine_ids) < 20:
                errors.append(f"spine unexpectedly short: {len(spine_ids)} items")
            if cover_spine_linear != "no":
                errors.append("cover XHTML must be non-linear to avoid a duplicate Kindle cover")
            if not accessibility_summary:
                errors.append("EPUB accessibility summary is missing")

            xhtml_roots: dict[str, ET.Element] = {}
            nav_found = False
            for item_id, (href, media_type) in manifest.items():
                path = posixpath.normpath(posixpath.join(package_dir, href))
                if path not in names:
                    errors.append(f"manifest item missing: {item_id} -> {path}")
                    continue
                if media_type in {"application/xhtml+xml", "image/svg+xml"}:
                    try:
                        root = ET.fromstring(book.read(path))
                    except Exception as exc:
                        errors.append(f"invalid XML {path}: {exc}")
                        continue
                    if media_type == "application/xhtml+xml":
                        xhtml_roots[path] = root
                        if item_id == "nav":
                            nav_found = True
                        for element in root.iter():
                            local = element.tag.rsplit("}", 1)[-1]
                            if local not in {"img", "image"}:
                                continue
                            src = element.attrib.get("src") or element.attrib.get("href")
                            if not src or "://" in src or src.startswith("data:"):
                                continue
                            target = posixpath.normpath(
                                posixpath.join(posixpath.dirname(path), src.split("#", 1)[0])
                            )
                            if target not in names:
                                errors.append(f"{path}: missing image target {target}")
            if not nav_found:
                errors.append("navigation document is missing")

            anchors: dict[str, set[str]] = {
                path: {
                    element.attrib["id"]
                    for element in root.iter()
                    if "id" in element.attrib
                }
                for path, root in xhtml_roots.items()
            }
            for path, root in xhtml_roots.items():
                for element in root.iter():
                    if element.tag.rsplit("}", 1)[-1] != "a":
                        continue
                    href = element.attrib.get("href", "")
                    if not href or "://" in href or href.startswith(("mailto:", "data:")):
                        continue
                    raw_target, _, fragment = href.partition("#")
                    target = (
                        posixpath.normpath(
                            posixpath.join(posixpath.dirname(path), raw_target)
                        )
                        if raw_target
                        else path
                    )
                    if target not in names:
                        errors.append(f"{path}: broken link target {target}")
                    elif fragment and target in anchors and fragment not in anchors[target]:
                        errors.append(f"{path}: missing anchor {target}#{fragment}")
        except Exception as exc:
            errors.append(f"invalid package document {rootfile}: {exc}")

    stale = b"Build Your Own Coding Agent CLI"
    for name in names:
        if name.endswith((".xhtml", ".html", ".opf")) and stale in book.read(name):
            errors.append(f"stale title in {name}")

if errors:
    print("EPUB VALIDATION FAILED")
    for error in errors:
        print(f"- {error}")
    sys.exit(1)

print(f"EPUB OK: {EPUB.name} ({EPUB.stat().st_size:,} bytes)")
