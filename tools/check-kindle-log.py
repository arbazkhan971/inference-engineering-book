#!/usr/bin/env python3
"""Read a Kindle Previewer conversion output directory and pass or fail on it.

Kindle Previewer 3 writes `Summary_Log.csv` beside a `Logs/` directory when it
is run with `-convert -output <dir>`. The summary carries the two facts a
publisher actually has to know -- did the book convert, and will Enhanced
Typesetting be supported on the device -- and the per-book log carries every
error and quality notice with the source file and line that caused it.

The converter exits 0 even when it produced a book Amazon would reject, so the
exit status alone is not a gate. This script is the gate.

Usage:
    tools/check-kindle-log.py <output-dir>

Exit status is 0 when the conversion succeeded, Enhanced Typesetting is
supported, there are no errors, and the number of quality issues is within
KINDLE_QUALITY_BUDGET (default 0). Otherwise it prints every offending row
with its source file and line, and exits 1.
"""

from __future__ import annotations

import csv
import os
import sys
from pathlib import Path


def read_csv(path: Path) -> list[dict[str, str]]:
    """Read one of Previewer's CSVs. They are UTF-8 with a BOM."""
    with path.open(encoding="utf-8-sig", newline="") as handle:
        return list(csv.DictReader(handle))


def detail_rows(logs_dir: Path) -> list[dict[str, str]]:
    """Every row of every per-book log.

    The per-book log opens with two unquoted legend lines explaining what
    `Error` and `Notice` mean, and only then the real header. csv.DictReader
    would take the first legend line as the header, so the header row is found
    by name and the file is parsed from there.
    """
    rows: list[dict[str, str]] = []
    for path in sorted(logs_dir.glob("*.csv")):
        lines = path.read_text(encoding="utf-8-sig").splitlines()
        start = next(
            (i for i, line in enumerate(lines) if line.startswith('"Type"')),
            None,
        )
        if start is None:
            continue
        reader = csv.DictReader(lines[start:])
        for row in reader:
            row["_log"] = path.name
            rows.append(row)
    return rows


def describe(row: dict[str, str]) -> str:
    source = row.get("Source File") or "(no source file)"
    line = row.get("Line Number") or "?"
    kind = (row.get("Type") or "?").strip()
    text = (row.get("Description") or "").strip()
    fix = (row.get("Recommended Fix") or "").strip()
    out = f"  [{kind}] {source}:{line} — {text}"
    if fix:
        out += f"\n         fix: {fix}"
    return out


def main(argv: list[str]) -> int:
    if len(argv) != 2:
        print("usage: check-kindle-log.py <output-dir>", file=sys.stderr)
        return 2
    out_dir = Path(argv[1])
    summary_path = out_dir / "Summary_Log.csv"
    if not summary_path.is_file():
        print(f"error: no Summary_Log.csv in {out_dir}", file=sys.stderr)
        return 2

    budget = int(os.environ.get("KINDLE_QUALITY_BUDGET", "0"))
    books = read_csv(summary_path)
    if not books:
        print(f"error: {summary_path} lists no books", file=sys.stderr)
        return 2

    rows = detail_rows(out_dir / "Logs")
    failed = False
    for book in books:
        name = book.get("Book Name", "?")
        status = (book.get("Conversion Status") or "").strip()
        typesetting = (book.get("Enhanced Typesetting Status") or "").strip()
        errors = int(book.get("Error Count") or 0)
        issues = int(book.get("Quality Issue Count") or 0)
        print(f"{name}: conversion {status}, "
              f"Enhanced Typesetting {typesetting}, "
              f"{errors} error(s), {issues} quality issue(s)")
        if status != "Success":
            print(f"  FAIL: conversion status is {status!r}, not 'Success'")
            failed = True
        if typesetting != "Supported":
            print(f"  FAIL: Enhanced Typesetting is {typesetting!r}, "
                  "not 'Supported'")
            failed = True
        if errors > 0:
            print(f"  FAIL: {errors} error(s) would block publishing")
            failed = True
        if issues > budget:
            print(f"  FAIL: {issues} quality issue(s) exceeds "
                  f"KINDLE_QUALITY_BUDGET={budget}")
            failed = True

    # Print every logged row, whether or not the counts already failed: the
    # source file and line are the only actionable part, and they live here.
    if rows:
        print(f"{len(rows)} logged row(s):")
        for row in rows:
            print(describe(row))
        if any((row.get("Type") or "").strip().lower().startswith("error")
               for row in rows):
            failed = True

    if failed:
        print("KINDLE PREVIEWER FAILED")
        return 1
    print("KINDLE PREVIEWER OK: Success, Enhanced Typesetting Supported, "
          "no errors, no quality issues")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))
