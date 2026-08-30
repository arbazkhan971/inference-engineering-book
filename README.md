# Inference Engineering — Inside the Engine Room of AI Agents

**Harness Engineering Series, Volume II** · Arbaz Khan

The companion volume to *Harness Engineering: The systems that turn a
language model into work you can trust*. Vol. I built the system around the
model. Vol. II opens the engine: batching, KV caches, speculative decoding,
quantization, caching economics, rate limits, routing, and budgets — the
serving layer that decides whether a brilliant agent loop ships or stalls.

## Status

| Stage | State |
|---|---|
| Architecture | done — including the explicit Volume-I parity/superiority bar in GOAL.md |
| Research corpus | sealed — 72 files, 71 dated digests (research/) |
| Manuscript | release candidate — prologue + 18 chapters + appendices A–F + back matter (120k+ linted words) |
| Companion | assembled request path; four scripted regression programs + 30 named contracts + offline demo |
| Release proof | reproducible canonical builder, retained EPUBCheck/Ace/Kindle evidence, and independent `ldp` semantic fingerprint; owner KDP post-upload proof remains separate |

## Layout

- `GOAL.md` — reader promise, ladder, gates, definition of done
- `CHAPTER_MAP.md` — prologue + 4 parts + 18 chapters + appendices
- `STYLE.md` — hard style contract for every writing agent
- `EDITORIAL_SYSTEM.md` — six gates (inherited from Vol. I)
- `research/` — dated, sourced evidence digests; the fact base
- `manuscript/` — the book
- `tools/` — build + verify pipeline
- `PUBLISHING/book-metadata.yaml` — canonical retail identity
- `RELEASE_REPORT.md` — current evidence and Volume-I comparison
- `PROGRESS.md` — append-only driver ledger

## Plain-English guide

`PLAIN-ENGLISH-GUIDE.md` — the whole book taught with zero jargon (Feynman
four-step: one sentence, everyday picture, what really happens, why you care).
Start there if any chapter runs ahead of you.

## Build

```bash
tools/build.sh    # → build/inference-engineering.epub
tools/verify.sh   # structural checks
tools/release-verify.sh  # clean-tree canonical run + retained external evidence

# Fresh clone, full verification: the companion's pinned TypeScript installs
# once. Its test command compiles, runs the scripted regressions, and discovers
# every named node:test contract file; verify.sh invokes that command.
(cd companion/tinyengine && npm install) && tools/verify.sh
```

`tools/epub-semantic-fingerprint.py` compares reader-visible text, headings,
links, image descriptions, and image payloads across builders without
pretending that different Pandoc versions must package identical bytes.

## Editorial stance

Every number traces to a dated research digest or carries a visible hedge.
The physics and the arithmetic are the lesson; product facts are evidence.
