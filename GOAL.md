# Goal: publish the definitive book on Inference Engineering

## Series identity

**Harness Engineering Series — Volume II**

**Title:** Inference Engineering
**Subtitle:** Inside the Engine Room of AI Agents
**Cover hook:** The harness is the driver. This is the engine.
**Author:** Arbaz Khan (Harness Engineering, System Design Mastery)

## One-sentence outcome

A harness engineer who has never touched a GPU can reason about the serving
layer like an insider: predict latency and cost from first principles, design
cache-friendly agent loops, read a provider's rate-limit and pricing docs
without flinching, and talk to inference teams as a peer.

## Reader promise

By the last page you can (1) explain every term on an inference dashboard —
TTFT, TPOT, goodput, KV cache, batch, prefill, decode — without jargon;
(2) compute what a token actually costs and why; (3) make an agent faster and
cheaper without changing the model; and (4) know exactly which levers belong
to the harness and which belong to the serving layer.

## Working thesis

> An agent's apparent intelligence is bounded by the model.
> Its apparent speed, cost, and reliability are bounded by inference.

Harness Engineering (Vol. I) taught the system around the model. This volume
opens the hood: batching, KV caches, speculative decoding, quantization,
caching economics, rate limits, routing, and budgets — the engine room that
decides whether a brilliant loop ships or stalls.

## Reader ladder

1. **Complete beginner:** follows analogies and plain-words boxes.
2. **Application developer:** uses provider APIs daily, wants the layer below explained.
3. **Harness/agent engineer:** makes architectural choices — routing, caching, compaction, budgets — that interact with serving internals.
4. **Founder/platform lead:** buys or builds inference; needs cost, latency, and reliability mental models to make build-vs-buy calls.

## Explanation ladder (same as Vol. I)

Picture → plain words → precise term → why it matters → tiny example →
where the analogy breaks → checkpoint. Every chapter carries a
`Where the picture stops` section. Vocabulary-opening chapters carry a
`Words before machinery` table (Term / Simple meaning / Everyday picture).

## Durable equation

> Agent economics = what the model knows × what the engine extracts
> × what the harness wastes

All product-specific facts (pricing, limits, benchmarks) are dated snapshots
in clearly marked boxes. The physics and the arithmetic are the lesson.

## Structure

- Prologue + 4 parts + 18 chapters (see CHAPTER_MAP.md)
- Progressive build: `tinyengine` — a TypeScript inference shim that
  normalizes streaming across providers, meters tokens and cost, implements
  cache-friendly prefixing, routing with fallbacks, and a client-side
  rate-limit scheduler. Companion code must install and test offline.
- Architecture diagrams (SVG), plain-language glossary, inference
  cheat-sheets (latency math, cost math, cache hit math), source notes.

## Acceptance gates

Inherit Vol. I's six gates verbatim (see EDITORIAL_SYSTEM.md):
Writer → Technical editor → Code tester → Book builder → Proofreader →
Final adversarial review. Every number in the book must trace to a dated
research digest in research/ or carry a visible hedge.

## Volume-I parity and superiority bar

Volume I is the floor, not a halo. Volume II is ready only when it preserves
the same six-gate editorial discipline and improves the evidence at the
boundaries where a serving-layer book can fail:

1. The companion must execute one assembled offline request path, not merely
   present individually plausible modules. Routing, admission, streaming,
   metering, receipts, and session replay must meet in that path.
2. Reader-checkable source links must meet or exceed Volume I's bibliography
   floor, while the dated research digests remain the full claim ledger.
3. Every diagram must have a semantic description, and the retail EPUB must
   pass both EPUB conformance and automated accessibility validation.
4. Retail metadata must have one machine-audited source of truth. A release
   run must retain the commit, tool versions, artifact checksum, converter
   output, and validator reports.
5. The canonical local builder must produce the byte-addressed retail file;
   an independent `ldp` checkout must reproduce its reader-visible semantic
   fingerprint even when its packaging tool version differs.
6. Machine proof and human proof stay separate. No ledger may call the book
   fully proved while the checksum-bound device page-through or KDP
   post-upload preview is still awaiting its owner.

## Definition of done

A reader can: explain continuous batching at a dinner table; compute KV
cache bytes for any model from its config; decide cache-breakpoint placement
for an agent loop; estimate a 10k-agent fanout's cost before running it;
and build the tinyengine companion from a clean checkout.
