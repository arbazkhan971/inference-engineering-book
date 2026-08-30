#!/usr/bin/env python3
"""Fingerprint reader-visible EPUB content independently of package filenames.

Pandoc versions can choose different internal XHTML names and serialization.
This fingerprint follows the OPF spine and hashes normalized body text,
heading structure, image descriptions, external links, and embedded image
payloads. EPUB-head metadata and converter-generated CSS are deliberately
excluded because they are not reading text. Equal output is evidence of
semantic parity, not byte identity.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import posixpath
import re
import zipfile
from pathlib import PurePosixPath
from xml.etree import ElementTree


parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument("epub", help="EPUB file to inspect")
args = parser.parse_args()


def local_name(tag: str) -> str:
    return tag.rsplit("}", 1)[-1]


def normalized_text(element: ElementTree.Element) -> str:
    return re.sub(r"\s+", " ", " ".join(element.itertext())).strip()


def sha256(payload: bytes) -> str:
    return hashlib.sha256(payload).hexdigest()


with zipfile.ZipFile(args.epub) as archive:
    container = ElementTree.fromstring(archive.read("META-INF/container.xml"))
    rootfile = next(
        element.attrib["full-path"]
        for element in container.iter()
        if local_name(element.tag) == "rootfile"
    )
    package = ElementTree.fromstring(archive.read(rootfile))
    package_dir = posixpath.dirname(rootfile)
    manifest = {
        element.attrib["id"]: (
            element.attrib["href"], element.attrib.get("media-type", "")
        )
        for element in package.iter()
        if local_name(element.tag) == "item"
    }
    spine = [
        element.attrib["idref"]
        for element in package.iter()
        if local_name(element.tag) == "itemref"
    ]

    documents: list[dict[str, object]] = []
    for item_id in spine:
        href, media_type = manifest[item_id]
        if media_type != "application/xhtml+xml":
            continue
        path = posixpath.normpath(posixpath.join(package_dir, href))
        root = ElementTree.fromstring(archive.read(path))
        body = next(
            (element for element in root.iter() if local_name(element.tag) == "body"),
            None,
        )
        if body is None:
            raise ValueError(f"spine document has no body: {path}")
        headings: list[list[str]] = []
        image_alts: list[str] = []
        external_links: list[str] = []
        for element in body.iter():
            name = local_name(element.tag)
            if re.fullmatch(r"h[1-6]", name):
                headings.append([name, normalized_text(element)])
            elif name in {"img", "image"}:
                image_alts.append(
                    element.attrib.get("alt")
                    or element.attrib.get("aria-label")
                    or ""
                )
            elif name == "a":
                href_value = element.attrib.get("href", "")
                if href_value.startswith(("http://", "https://")):
                    external_links.append(href_value)
        documents.append(
            {
                "text": normalized_text(body),
                "headings": headings,
                "image_alts": image_alts,
                "external_links": external_links,
            }
        )

    image_hashes = sorted(
        sha256(archive.read(posixpath.normpath(posixpath.join(package_dir, href))))
        for href, media_type in manifest.values()
        if media_type.startswith("image/")
        and PurePosixPath(href).suffix.lower() not in {".svg"}
    )

payload = {
    "documents": documents,
    "image_hashes": image_hashes,
}
encoded = json.dumps(payload, ensure_ascii=False, separators=(",", ":")).encode()
summary = {
    "semantic_sha256": sha256(encoded),
    "spine_documents": len(documents),
    "text_characters": sum(len(str(document["text"])) for document in documents),
    "headings": sum(len(document["headings"]) for document in documents),
    "image_descriptions": sum(len(document["image_alts"]) for document in documents),
    "external_links": sum(len(document["external_links"]) for document in documents),
    "raster_images": len(image_hashes),
}
print(json.dumps(summary, sort_keys=True))
