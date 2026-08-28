# Inference Engineering — Inside the Engine Room of AI Agents

**Harness Engineering Series, Volume II** · Arbaz Khan

The companion volume to *Harness Engineering: How to Build AI Agents That
Actually Work*. Vol. I built the system around the model. Vol. II opens the
engine: batching, KV caches, speculative decoding, quantization, caching
economics, rate limits, routing, and budgets — the serving layer that
decides whether a brilliant agent loop ships or stalls.

## Status

| Stage | State |
|---|---|
| Architecture | done — GOAL.md, CHAPTER_MAP.md, STYLE.md |
| Research corpus | sealed — 72 files, 71 dated digests (research/) |
| Manuscript | sealed release candidate — prologue + 18 chapters + appendices A–F + back matter (~115k words), all six gates green |
| Build | tools/build.sh → EPUB 3 (pandoc); clean-checkout build verified (review/gate6-clean-build.md) |

## Layout

- `GOAL.md` — reader promise, ladder, gates, definition of done
- `CHAPTER_MAP.md` — prologue + 4 parts + 18 chapters + appendices
- `STYLE.md` — hard style contract for every writing agent
- `EDITORIAL_SYSTEM.md` — six gates (inherited from Vol. I)
- `research/` — dated, sourced evidence digests; the fact base
- `manuscript/` — the book
- `tools/` — build + verify pipeline
- `PROGRESS.md` — append-only driver ledger

## Plain-English guide

`PLAIN-ENGLISH-GUIDE.md` — the whole book taught with zero jargon (Feynman
four-step: one sentence, everyday picture, what really happens, why you care).
Start there if any chapter runs ahead of you.

## Build

```bash
tools/build.sh    # → build/inference-engineering.epub
tools/verify.sh   # structural checks
```

## Editorial stance

Every number traces to a dated research digest or carries a visible hedge.
The physics and the arithmetic are the lesson; product facts are evidence.
