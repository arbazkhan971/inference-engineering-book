#!/usr/bin/env python3
"""Palette-quantize the flat-colour diagram PNGs.

Every figure in this book is vector art rasterised from SVG: flat fills, one
typeface, no photography. That is exactly the case a 256-colour palette encodes
losslessly to the eye while cutting file size by roughly two thirds at full
resolution -- no downsampling, so the figures stay crisp on a Paperwhite.

This matters commercially, not just technically. Amazon charges a per-megabyte
delivery fee against the 70% royalty tier, so every megabyte of PNG overhead is
money off each sale, forever.

Deliberately NOT touched: cover.png / cover.jpg (photographic artwork with wide
gradients) and the author portrait. Quantizing those would band visibly.
"""
from pathlib import Path
from PIL import Image
import sys

ROOT = Path(__file__).resolve().parents[1]
PNG = ROOT / "figures" / "png"
MAX_DELTA = 64  # refuse anything that shifts a channel more than this

def main() -> int:
    before = after = 0
    for path in sorted(PNG.glob("fig-*.png")):
        original = Image.open(path).convert("RGB")
        size_before = path.stat().st_size
        quantized = original.quantize(colors=256, method=Image.MEDIANCUT, dither=Image.NONE)
        rgb = quantized.convert("RGB")

        # Guard: never ship a figure the palette actually damaged.
        delta = max(max(p) for p in Image.eval(
            __import__("PIL.ImageChops", fromlist=["difference"]).difference(original, rgb),
            lambda v: v).getdata())
        if delta > MAX_DELTA:
            print(f"  skipped {path.name}: palette shifted a channel by {delta}")
            continue

        quantized.save(path, "PNG", optimize=True)
        size_after = path.stat().st_size
        before += size_before
        after += size_after
    if before:
        print(f"optimized figures: {before/1048576:.1f} MB -> {after/1048576:.1f} MB "
              f"({100 * (before - after) / before:.0f}% smaller, no resolution lost)")
    return 0

if __name__ == "__main__":
    sys.exit(main())
