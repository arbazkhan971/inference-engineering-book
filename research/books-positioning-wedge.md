# Book positioning & white space: Inference Engineering (Vol. II)

researched: 2026-08-27 · researcher: books-positioning-wedge (retry run; fresh web evidence; note: no `research/books-*.md` sibling digests found under that prefix — see Gaps)

## Key facts (dated + sourced)

- **Topic white space: closed. Audience white space: open.** Two book-length serving-layer titles shipped in 2026: *Inference Engineering* by Philip Kiely (Baseten Books, 2026; free online, 8 chapters; print via Shroff, ISBN 9789368089827) and *Hands-On LLM Serving and Optimization* by Chi Wang & Peiheng Hu (O'Reilly, April 2026, ISBN 9798341621480). Both are written from the engine side: Kiely frames inference engineers as working "across the stack from CUDA to Kubernetes," with learning tracks for infrastructure architects and performance optimizers; Wang & Hu target engineers "designing robust infrastructures" and "hosting LLMs at scale" (all retrieved 2026-08-27).
- **Direct competitor verdict: none found** on the full triple — book-length + serving-layer + agent/harness engineer as primary reader. No surveyed title teaches TTFT/TPOT arithmetic, KV-cache bytes math, provider cache semantics, 429/backoff, or routing budgets from the API-consuming harness side. Harness-side books (below) treat serving as an opaque external API (retrieved 2026-08-27).
- **Title collision is real and must be planned for.** Baseten's 2026 book uses the exact title "Inference Engineering," backed by a free interactive companion site (inferenceengineering.tech) — it will dominate search for the phrase (retrieved 2026-08-27).
- **Baseten TOC (ch0–7):** Prerequisites (latency/cost budgeting), Models & bottlenecks, Hardware (GPU generations), Software (CUDA→vLLM/SGLang/TRT-LLM, NVIDIA Dynamo), Techniques (quantization, spec decode, KV re-use, parallelism, disaggregation), Modalities (VLM/ASR/TTS/image/video), Production (containers, autoscaling, observability, some "client code") — engine-operator scope throughout (retrieved 2026-08-27).
- **Huyen's *AI Engineering*** (O'Reilly, Dec 2024, 534 pp.) gives inference one chapter: ch9 "Inference Optimization," pp. 405–447 (~9% of the book), plus router/gateway/caching sections in ch10 — chapter depth, not book depth (aie-book ToC.md, retrieved 2026-08-27).
- **"Harness engineering" is now industry vocabulary** — Martin Fowler article, OpenAI's "Harness Engineering" writeup, Anthropic's "effective harnesses" post, LangChain's "Agent = Model + Harness" — but no serving-layer book speaks to that reader (retrieved 2026-08-27).
- **Harness-side book-length competition exists for Vol. I's territory, not Vol. II's:** Ian Johnson's *Harness Engineering* (Leanpub, $20–30, 62 chapters) covers charters, gates, loop engineering, model routing (ch39) and cost/rate-limits/backpressure (ch40) — but zero serving internals: no KV cache, batching, prefill/decode, or latency arithmetic. *Building Agentic Systems* (Leanpub, 26 chapters) and *Agentic Engineering* (agenticfrontier.dev, v2026.07, 414 pp.) likewise stay app/operator-side (retrieved 2026-08-27).

**The verified wedge (3 sentences):** Serving-layer depth now exists in print — Kiely/Baseten and Wang & Hu/O'Reilly both shipped in 2026 — but both are written for engineers who run engines (CUDA-to-Kubernetes operators, hosting teams), not for harness engineers who consume inference through provider APIs. No book-length title takes the harness/agent engineer as its primary reader and teaches the engine room from the client side of the contract: latency and cost arithmetic, cache-friendly loop design, rate limits as physics, routing and budgets. That seam — Vol. I's "Agent = Model + Harness" continued downward through the API boundary — is the wedge, though the bare title "Inference Engineering" now collides with Baseten and must be differentiated by subtitle and framing.

**Five nearest neighbors and how we differ:**
1. ***Inference Engineering*** (Philip Kiely, Baseten Books, 2026) — same term, same serving topics (quantization, spec decode, KV re-use, disaggregation); differs: vendor-authored for engine operators, GPU/hardware and multimodal chapters, no harness reader, no cache-aware-loop or API-contract through-line.
2. ***Hands-On LLM Serving and Optimization*** (Wang & Hu, O'Reilly, April 2026) — serving performance and hosting at scale; differs: self-host/infrastructure build-out for ML-platform engineers vs our provider-API-first harness reader.
3. ***AI Engineering*** (Chip Huyen, O'Reilly, Dec 2024) — the application-layer standard; differs: inference optimization is ~1 of 10 chapters (~40 of 500 pages), survey breadth vs engine-room depth.
4. ***Harness Engineering*** (Ian Johnson, Leanpub, 2026) — nearest in audience; differs: repo/charters/gates discipline for coding-agent workflows (adjacent to our Vol. I), with cost/routing treated as policy checklists, never serving mechanics.
5. ***Building Agentic Systems*** (Leanpub, 2026) — production agent engineering (contracts, orchestration, reliability, cost); differs: operator practice with serving as a black-box API; no latency arithmetic, cache math, or engine internals.

## Coverage map

Topic × nearest neighbor (● dedicated treatment, ◐ partial, — absent):

| Topic (our chapter) | Kiely 2026 | Wang/Hu 2026 | Huyen 2024 | Johnson 2026 | Bldg Agentic Sys |
|---|---|---|---|---|---|
| Latency arithmetic TTFT/TPOT (ch2–3) | ◐ | ◐ | ◐ | — | — |
| KV cache bytes/variants (ch4, 10–11) | ● | ◐ | ◐ | — | — |
| Batching/PagedAttention (ch5–6) | ● | ● | ◐ | — | — |
| PD split/chunked prefill (ch7) | ● | ◐ | — | — | — |
| Spec decode/quantization (ch8–9) | ● | ● | ◐ | — | — |
| Streaming contract/tool-call deltas (ch12) | — | — | — | ◐ | ◐ |
| Structured output mechanics (ch13) | — | ◐ | ◐ | ◐ | ◐ |
| Provider cache economics (ch14) | ◐ | — | ◐ | ◐ | ◐ |
| Rate limits/429 as physics (ch15) | — | — | — | ◐ | ◐ |
| Routing/gateways/budgets (ch16) | ◐ | ◐ | ● | ● | ● |
| Harness↔serving seam as through-line | — | — | — | ◐ | ◐ |
| Reader: harness engineer (API consumer) | — | — | ◐ | ● | ● |

Everything engine-side is now covered by somebody; the empty cells are the seam rows — engine physics connected to harness design for API-side agent engineers.

## Series angle

- **Own the seam, not the topic.** The subtitle already carries it ("Inside the Engine Room of AI Agents"); every chapter keeps a harness-controls close — no serving competitor has this. Position vs Kiely explicitly in the preface: his book is for people who run engines; ours is for people whose loops live on those engines — complementary, citable, not substitutable.
- **Differentiate the title in metadata.** Exact-title collision with Baseten means "Inference Engineering" alone will lose search; lean on the subtitle/series keywords (harness, agents, TTFT, provider APIs).
- **tinyengine + dated-snapshot boxes are moats:** a buildable companion artifact and traced numbers, versus free corporate content (Baseten) and self-published living books (Leanpub/agenticfrontier). Vol. I's identity makes Vol. II the only series spanning both sides of the API.

## Sources (URLs)

- Baseten book TOC: https://www.baseten.co/inference-engineering/
- Interactive companion: https://inferenceengineering.tech/
- Shroff print edition: https://www.shroffpublishers.com/books/9789368089827/
- O'Reilly serving book: https://www.oreilly.com/library/view/hands-on-llm-serving/9798341621480/ · blurb: https://forthcomingbooks.com/books/chi-wang-peiheng-hu-hands-on-llm-serving-and-optimization-hosting-llms-at-scale
- Huyen ToC: https://github.com/chiphuyen/aie-book/blob/main/ToC.md · pub data: https://books.google.com/books/about/AI_Engineering.html?id=S7M1EQAAQBAJ
- Johnson, Harness Engineering: https://leanpub.com/harness-engineering
- Building Agentic Systems: https://leanpub.com/building-agentic-systems
- Agentic Engineering: https://www.agenticfrontier.dev/book
- Fowler, harness engineering: https://martinfowler.com/articles/harness-engineering.html
- Serving-adjacent (context): https://mlsysbook.ai/vol2/contents/vol2/inference/inference.html · https://github.com/jax-ml/scaling-book/blob/main/inference.md · https://leanpub.com/buildinglow-latencyllminfrastructure · https://leanpub.com/practicalllminference

## Gaps

- Kiely book's exact publication month/page count unconfirmed ("Baseten, 2026"); O'Reilly TOC returned HTTP 403 — Wang & Hu audience inferred from publisher/blurb text.
- No `research/books-*.md` sibling digests exist under ~12 probed names (books-competition, books-landscape, books-positioning, etc.); the 60+ digests in the PROGRESS ledger (read 2026-08-27) contain none under that prefix. Findings rest on GOAL.md/README/CHAPTER_MAP.md plus fresh primary-source web checks; a named-sibling re-check is recommended if the intended digest files live elsewhere.
