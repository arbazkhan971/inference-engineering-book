# Existing LLM inference/serving books as of 2026
researched: 2026-08-27 · researcher: glm-5.3-flash

## Key facts — bullets, every claim dated and sourced

**Major-publisher books**
- **Hands-On LLM Serving and Optimization: Hosting LLMs at Scale** — Chi Wang & Peiheng Hu, O'Reilly, ~April–June 2026 (O'Reilly online dates Apr–May 2026; Target street date June 2, 2026), 371–374 pages (sources differ). Full-length, engineering-focused guide to deploying and optimizing LLMs; authors from Salesforce Einstein. (O'Reilly; Target)
- **AI Systems Performance Engineering** — Chris Fregly, O'Reilly, November 2025. Covers training *and* inference optimization (GPUs, CUDA, PyTorch); broader than inference alone. Public GitHub companion repo. (O'Reilly; Google Books; GitHub)
- **LLMs in Production: From Language Models to Successful Products** — Christopher Brousseau & Matthew Sharp, Manning, Dec 2024/print Feb 2025, 456 pages. Production deployment focus; earlier-generation coverage (prefaces application layer more than serving internals). (Manning; Google Books)
- **Rearchitecting LLMs** — Pere Martra, Manning, MEAP Jan 2026, est. publication early 2027, ~380 pages est. Efficiency via pruning/distillation/fine-tuning — adjacent, not a serving book. (Manning)
- **Generative AI on Kubernetes** — Roland Huß & Daniele Zonca, O'Reilly, Feb 2026. K8s deployment of GenAI workloads; adjacent ops coverage. (O'Reilly)

**Self-published / Leanpub / Amazon KDP (inference-specific)**
- **Practical LLM Inference: Quantization, GGUF and Local Models** — Leanpub, 100% complete as of 2026-08-20, $29 suggested price ($19 minimum). Local inference, GGUF internals, GPU offload. (Leanpub)
- **Building Low-Latency LLM Infrastructure** — Leanpub, 100% complete as of 2026-08-18, $29 suggested. Kernels → engines → clusters; latency/throughput/reliability. (Leanpub)
- **Build an LLM Inference Engine in C++** — Leanpub, $24. Challenge-driven CPU-first C++20 inference engine build. (Leanpub)
- **Rust for LLM Inference** — Leanpub, $89 suggested (in LLM bundle $75). Transformer math → KV cache, quantization, batching, distributed serving in Rust. (Leanpub)
- **Inside llama.cpp** — Leanpub, price not confirmed. Build/run/optimize llama.cpp and GGUF. (Leanpub)
- **Optimisation and Acceleration** (Hatem M.) — Leanpub, $90–144 suggested, aligned to NVIDIA/AWS cert blueprints checked Aug 2026; inference optimization is one of its covers. (Leanpub)
- **LLM Inference Engineering** — Sriram Penumatcha, Amazon KDP, 24 chapters, covers KV caching, continuous batching, H100/B200/GH200, vLLM, TensorRT-LLM. Page count/review count not verified. (Amazon)
- **LLM Inference Engineering: Quantization, KV-Cache Optimization, and High-Throughput Serving** (Production AI Engineering Series) — "ChatVariety Team", Amazon KDP, $2.99 ebook; listing claims "definitive production guide." Review data unverifiable; brand suggests content-mill provenance. (Amazon)
- **LLM Inference Engineering Handbook** — Amazon KDP, $29.99, 4.7 stars from 14 reviews (as shown in listing). Cost/latency reduction focus with benchmarks. (Amazon)
- **Building and Customizing Inference Engines for LLMs** — Amazon KDP ebook; from tokenization to "batched, quantized, multi-GPU inference server." Reviews unverifiable. (Amazon)
- **Building LLM Inference Engines with C++23** — Amazon KDP, $30, edge/consumer-hardware optimization. (Amazon)
- **Enhancing LLM Performance** — Springer (Apress line), ~2025; includes inference acceleration chapters but is broader (fine-tuning, efficacy). (Springer)
- **Advanced Large Language Model Operations** — Springer, 2026 per listing; LLMOps incl. cost/latency economics — adjacent. (Springer)

## Coverage map — what exists, how deep
- **Deep serving/optimization, major publisher:** exactly one — Wang & Hu (O'Reilly, 2026, ~374 pp). Fregly (O'Reilly 2025) is the closest second but is training+inference breadth.
- **Engine internals (build-your-own):** well covered by hobby/self-pub tier — three Leanpub titles (C++, Rust, llama.cpp) and at least two Amazon KDP C++ engine books. Depth unknown/unevaluated; Leanpub titles claim "100% complete" with recent 2026 updates.
- **Ops/platform (K8s, Docker, LLMOps):** multiple major-publisher titles (Generative AI on Kubernetes, Operational AI with Docker, Advanced LLMOps) — crowded but adjacent.
- **Production app-layer:** LLMs in Production (Manning, 456 pp) is established but predates the 2025–26 serving-optimization wave.
- **Quality signal gap:** Amazon KDP titles show little/no verifiable review data; no inference-specific book has a large public review base found. No Springer monograph dedicated purely to LLM serving systems was found.

## Series angle — what this means for Inference Engineering Vol. II positioning
- The Wang & Hu O'Reilly book is the direct competitor benchmark; a Vol. II should differentiate on engine internals and measurable benchmarks rather than repeating its serving-framework survey scope (which it covers per its ch. 2 TOC).
- The build-your-own-engine niche is occupied only by self-published Leanpub/KDP titles without institutional credibility — a reviewed, rigorous Vol. II on engine internals has a clear quality gap to fill.
- Kubernetes/LLMOps space is saturated; avoid duplicating it beyond integration chapters.
- Cite-freshness advantage: most competitors predate mid-2026 hardware (B200/GH200) framing; only Wang & Hu and the Penumatcha listing claim current-GPU coverage.

## Sources — primary URLs
- https://www.oreilly.com/library/view/hands-on-llm-serving/9798341621480/
- https://www.target.com/p/hands-on-llm-serving-and-optimization-by-chi-wang-peiheng-hu-paperback/-/A-1007733810
- https://www.oreilly.com/library/view/ai-systems-performance/9798341627772/
- https://github.com/cfregly/ai-performance-engineering/
- https://www.manning.com/books/llms-in-production
- https://www.manning.com/books/rearchitecting-llms
- https://www.oreilly.com/library/view/generative-ai-on/9781098171919/
- https://www.oreilly.com/library/view/operational-ai-with/9781807301095/
- https://leanpub.com/practicalllminference · /buildinglow-latencyllminfrastructure · /buildanllminferenceengineinc · /rustforllminference · /insidellamacpp · /llm-inference-optimisation
- https://www.amazon.com/LLM-Inference-Engineering-Sriram-Penumatcha-ebook/dp/B0H5C2FX68
- https://www.amazon.com/LLM-Inference-Engineering-Quantization-High-Throughput-ebook/dp/B0H4RVMS1D
- https://www.amazon.com/LLM-Inference-Engineering-Handbook-Production-ebook/dp/B0H4B6783T
- https://www.amazon.com/Building-Customizing-Inference-Engines-LLMs-ebook/dp/B0H7H7TZ4Z
- https://www.amazon.com/Building-LLM-Inference-Engines-Optimization-ebook/dp/B0GDZJKSCD
- https://link.springer.com/book/9783032238290
- https://link.springer.com/book/10.1007/978-3-031-85747-8

## Gaps
Amazon review counts for most KDP titles were not retrievable (bot-blocked listings; review data only surfaced for one title). Page counts for Leanpub and most KDP books unlisted. Gumroad-specific LLM inference books: none surfaced in searches; existence unverified. Springer's catalog may have additional 2026 serving monographs not indexed yet. A content-depth verdict on KDP/Leanpub titles would require purchasing/inspecting them.

## Supervisor coordination
No decisions needed; task completed within scope.