# Chip Huyen "AI Engineering" (O'Reilly 2025) coverage map
researched: 2026-08-27 · researcher: glm-5.3-flash

## Key facts — bullets, every claim dated and sourced
- Full title: *AI Engineering: Building Applications with Foundation Models*, Chip Huyen, O'Reilly. Google Books and the official repo list print date Dec 4, 2024 (534 pp); O'Reilly/huyenchip.com market it as the 2025 edition — both dates appear in primary listings (books.google.com, accessed 2026-08-27; github.com/chiphuyen/aie-book, accessed 2026-08-27; huyenchip.com/books, accessed 2026-08-27).
- 10 chapters + preface + epilogue, ~500 pages. TOC verified against the author's official `ToC.md` in the aie-book repo (accessed 2026-08-27).
- Companion repo (github.com/chiphuyen/aie-book) publishes ToC, chapter summaries, and study notes — the chapter-summaries file contains the author's own per-chapter reflections (accessed 2026-08-27).
- Author frames the book as complementary to her *Designing Machine Learning Systems* (2022) (huyenchip.com/books; openlibrary.org, accessed 2026-08-27).
- Reviews are mixed on depth: praise for evaluation and frameworks (private-labs.com, 2025; tensorlabbet.com, 2025-06-21) vs. criticism that topics stay "too superficial" in places (gabrielecimato.com review, accessed 2026-08-27).

## Coverage map — what exists, how deep
From the official TOC (github.com/chiphuyen/aie-book ToC.md):
1. **Introduction to Building AI Applications** (pp. 1–47): rise of AI engineering, use-case taxonomy (coding, writing, education, chatbots, workflow automation), planning, the three-layer AI stack, AI-vs-ML engineering. Survey depth.
2. **Understanding Foundation Models** (pp. 49–111): training data, transformer architecture, scaling laws (params/tokens/FLOPs), post-training (SFT, preference finetuning), sampling/decoding fundamentals, test-time compute, structured outputs, probabilistic nature. Conceptual, deliberately skips "nitty-gritty training details" (author's chapter summary).
3. **Evaluation Methodology** (pp. 113–156): entropy/cross-entropy/perplexity, functional correctness, similarity metrics, embeddings, AI-as-a-judge (limits, judge selection), comparative evaluation/leaderboards. Two full chapters on eval — widely cited as the book's strongest area (private-labs.com, 2025).
4. **Evaluate AI Systems** (pp. 159–208): criteria (domain capability, factuality, safety, cost/latency), model selection, build-vs-buy (host vs. API) on seven axes, benchmark navigation, evaluation pipeline design.
5. **Prompt Engineering** (pp. 211–251): in-context learning, prompt anatomy, best practices, defensive prompting (injection, jailbreaking, defenses).
6. **RAG and Agents** (pp. 253–305): RAG architecture, retrieval algorithms (term-based, embedding/vector search), retrieval optimization; agents (tools, planning, reflection, failure modes and evaluation); short memory section (~5 pp). Agents get ~30 pp inside a combined chapter.
7. **Finetuning** (pp. 307–361): when to finetune vs. RAG, memory math, quantization, PEFT (LoRA deep dive), model merging, tactics.
8. **Dataset Engineering** (pp. 363–403): curation (quality/coverage/quantity), annotation, synthesis, AI-powered synthesis, distillation, dedup/formatting.
9. **Inference Optimization** (pp. 405–447): metrics (TTFT, TPOT, throughput, utilization), AI accelerators overview; model-level (quantization, distillation, attention/KV-cache efficiency, decoding); service-level (batching, parallelism, prefill/decode decoupling, prompt caching). One chapter, ~42 pp.
10. **AI Engineering Architecture and User Feedback** (pp. 449–492): reference architecture (context enhancement, guardrails, router/gateway, caching, agent patterns), monitoring/observability, orchestration, feedback loops.

**Inference/serving depth:** Ch. 9 is a strong survey — the author's own summary states most app developers "will use these APIs with their built-in optimization instead of implementing these techniques themselves," so techniques are explained at the conceptual/mechanism level, not as engineering of serving systems (no deep dives into specific engines like vLLM/TensorRT-LLM internals in the TOC; third-party chapter-9 notes, e.g. alexstrick.com 2025-02-07 and jameshu.io, confirm survey framing). Compute-vs-memory-bound analysis, batching/parallelism, KV cache, and prompt caching are covered; multi-cluster serving, scaling ops, GPU fleet management, and cost modeling at production scale are not visibly in the TOC.

**Agents assumptions:** Agents are treated as one pattern among many — defined by environment + tools, with AI as planner, augmented by reflection and memory (ch. 6 summary). RAG is framed as "a special case of agent where the retriever is a tool." Coverage predates the 2025 agent-framework wave: no MCP, no agent-to-agent protocols, no multi-agent orchestration patterns appear in the TOC; ch. 10's "Add Agent Patterns" step is one architecture step (~3 pp in TOC). Evaluation of agents gets a section within ch. 6, not a dedicated chapter.

## Series angle — what this means for Inference Engineering Vol. II positioning
- **Clear whitespace in serving depth.** Huyen spends ~42 pages on inference as one chapter of a generalist book, explicitly aimed at API consumers. A dedicated inference-engineering volume can go orders of magnitude deeper: serving engine internals (paged/slab KV allocators, continuous batching implementations, CUDA-graph capture, speculative decoding variants), multi-node/tensor+expert parallelism in production, autoscaling, GPU cost engineering — none of which are more than surveyed in ch. 9.
- **Agents: breadth here, depth for us.** Her ~30-page agent treatment (tools, planning, memory, failure modes) defines the standard baseline vocabulary. Vol. II can differentiate on agent serving/inference: long-running session state, context/memory serving costs, agent-traffic latency SLOs, multi-agent orchestration infrastructure — topics absent from her TOC (verified 2026-08-27).
- **Avoid re-treading her moats.** Her two evaluation chapters are considered the definitive practitioner treatment; Vol. II should reference, not duplicate, and focus its eval coverage on performance/serving benchmarking (TTFT/TPOT methodology, load testing) rather than quality evaluation.
- **Framing precedent.** Her "understand the technique even if you use APIs" stance (ch. 9 summary) validates our positioning: a book for engineers who operate or build the serving layer, not just call it.
- Hedges: Vol. II differentiation above is based on her published TOC; her sections' actual internal depth beyond headings is partly unverified (we did not read the full text), so claims of "shallower than Vol. II" should be softened to "narrower scope per the TOC."

## Sources — primary URLs
- Official TOC: https://github.com/chiphuyen/aie-book/blob/main/ToC.md (raw: https://raw.githubusercontent.com/chiphuyen/aie-book/main/ToC.md)
- Author's chapter summaries: https://github.com/chiphuyen/aie-book/blob/main/chapter-summaries.md
- Author's book page: https://huyenchip.com/books/
- Google Books listing (534 pp, Dec 4, 2024): https://books.google.com/books/about/AI_Engineering.html?id=S7M1EQAAQBAJ
- O'Reilly catalog entry: https://www.oreilly.com/library/view/ai-engineering/9781098166298/ (403 on direct fetch; ISBN 9781098166298 confirmed via search snippets, 2026-08-27)
- Open Library: https://openlibrary.org/books/OL54058212M/AI_Engineering
- Reviews: https://tensorlabbet.com/2025/06/21/review-ai-engineering/ · https://private-labs.com/ai-engineering-by-chip-huyen-the-best-technical-book-on-building-llm-applications-in-2025/ · https://gabrielecimato.com/reviews/ai-engineering · https://alexstrick.com/posts/2025-02-07-ai-engineering-chapter-9.html · https://jameshu.io/books/ai-engineering/ch09-llm-deployment-infrastructure/index.html
