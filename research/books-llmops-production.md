# LLMOps / production-LLM books landscape 2025-2026
researched: 2026-08-27 · researcher: glm-5.3-flash

## Key facts — bullets, every claim dated and sourced
- **AI Engineering** (Chip Huyen, O'Reilly, 2025) — application-layer book: adapting foundation models, fine-tuning vs prompting decision framework, RAG, evaluation, deployment of AI apps; not inference internals. [huyenchip.com/books](https://huyenchip.com/books/), [ToC](https://github.com/chiphuyen/aie-book/blob/main/ToC.md)
- **LLMOps: Managing Large Language Models in Production** (O'Reilly, July 2025) — operations lifecycle: monitoring, security, agent ops, "API-first LLM deployment" chapter choosing managed vs open-source serving tools; pipeline glue, not engine internals. [O'Reilly](https://www.oreilly.com/library/view/llmops/9781098154196/), [ch06](https://www.oreilly.com/library/view/llmops/9781098154196/ch06.html)
- **LLMs in Production** (Brousseau & Sharp, Manning, Dec 2024/O'Reilly Jan 2025, 456 pp) — end-to-end LLM product engineering: how LLMs work, integration, pitfall avoidance; self-described as "an LLMOps book" focused on tying the process together. [Manning](https://www.manning.com/books/llms-in-production)
- **Essential Guide to LLMOps** (Packt, July 2024) — 13 chapters across lifecycle: data prep, pre-training/fine-tuning, governance, "Inference, Serving, and Scalability" (one strategy chapter), monitoring. [Packt ToC](https://www.packtpub.com/en-us/product/essential-guide-to-llmops-9781835887516)
- **Hands-On LLM Serving and Optimization: Hosting LLMs at Scale** (Chi Wang & Peiheng Hu, O'Reilly, April 2026) — the strongest inference-internals entry: transformer execution, KV cache, vLLM, serving system design, GPU/accelerator specs, arithmetic-intensity analysis of prefill. [O'Reilly](https://www.oreilly.com/library/view/hands-on-llm-serving/9798341621480/), [companion repo](https://github.com/orca3/llm-model-inference)
- **RAG cluster** — A Simple Guide to RAG (Manning, June 2025, 256 pp); Build an Advanced RAG Application From Scratch (Manning MEAP, est. early 2027); Retrieval Augmented Generation: The Foundational Ideas (Auffarth, Manning MEAP, est. Oct 2026); RAG-Driven Generative AI (Packt, Mar 2025). All pipeline/framework level, not inference-level. [Manning](https://www.manning.com/books/a-simple-guide-to-retrieval-augmented-generation), [Manning MEAP](https://www.manning.com/books/retrieval-augmented-generation-the-foundational-ideas)
- **Inference-adjacent self-publishing** — Practical LLM Inference (Leanpub, complete 2026-08-20: quantization, GGUF internals, GPU offload, benchmarking) and Building Low-Latency LLM Infrastructure (Leanpub, 2026-08-18) — signals demand but no major-publisher rigor. [Leanpub](https://leanpub.com/practicalllminference), [Leanpub](https://leanpub.com/buildinglow-latencyllminfrastructure)
- **Manning GPU Programming with Triton** (MEAP Aug 2026, est. Spring 2027) — CUDA-vs-Triton kernels for training and inference; closest to deep internals but kernel-level, not systems. [Manning](https://www.manning.com/books/gpu-programming-with-triton)

## Coverage map — what exists, how deep
- **Pipeline glue (well covered):** AI Engineering, LLMOps, LLMs in Production, Essential Guide to LLMOps — deployment choices, monitoring, evals, fine-tuning workflows, RAG integration.
- **RAG (saturated):** four-plus 2025-2026 titles across Manning/Packt; advanced/agentic RAG still being added (MEAPs into 2027).
- **Fine-tuning (covered as workflow, not systems):** chapters in AI Engineering and LLMOps books; no 2025-2026 standalone fine-tuning systems book surfaced.
- **Inference internals (thin):** essentially one O'Reilly entry (Hands-On LLM Serving, Apr 2026) plus self-published Leanpub titles; Manning has Triton kernels only. Quantization, KV-cache, scheduling, and serving-system internals are the least-served depth band from major publishers.

## Series angle — what this means for Inference Engineering Vol. II positioning
- Vol. II (inference internals) has exactly one major-publisher competitor (Hands-On LLM Serving) and several informal ones; differentiation should be on systems depth (scheduling, batching, distributed serving) vs that book's hands-on/tooling framing, and on publisher rigor vs Leanpub.
- LLMOps/RAG books explicitly hand off at the serving boundary ("choose vLLM or a managed API") — Vol. II can position as the layer below, referencing rather than duplicating pipeline content.

## Sources — primary URLs
- https://huyenchip.com/books/ and https://github.com/chiphuyen/aie-book/blob/main/ToC.md
- https://www.oreilly.com/library/view/llmops/9781098154196/
- https://www.manning.com/books/llms-in-production
- https://www.packtpub.com/en-us/product/essential-guide-to-llmops-9781835887516
- https://www.oreilly.com/library/view/hands-on-llm-serving/9798341621480/ + https://github.com/orca3/llm-model-inference
- https://www.manning.com/books/a-simple-guide-to-retrieval-augmented-generation
- https://www.manning.com/books/build-an-advanced-rag-application-from-scratch
- https://www.manning.com/books/retrieval-augmented-generation-the-foundational-ideas
- https://www.manning.com/books/gpu-programming-with-triton
- https://leanpub.com/practicalllminference ; https://leanpub.com/buildinglow-latencyllminfrastructure

## Gaps
- Amazon bestseller rankings/reviews not directly inspected (search-provider limits); claims rest on publisher pages and companion repos.
- Some 2026 MEAP dates are publisher estimates and may slip; hedged above.
- Possible Japanese/Chinese-language inference books and academic texts (e.g., SGLang/vLLM docs-adjacent) were out of scope.