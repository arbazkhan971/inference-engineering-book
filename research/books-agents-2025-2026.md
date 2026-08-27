# AI agent-building books 2025-2026

researched: 2026-08-27 · researcher: glm-5.3-flash

## Key facts — bullets, every claim dated and sourced

- **AI Engineering** (Chip Huyen, O'Reilly, Dec 2024/2025 print) — includes Ch. 9 "Inference Optimization" (pp. 405-447): inference performance metrics, AI accelerators, model optimization, and inference *service* optimization (ToC verified via author's GitHub ToC.md, accessed 2026-08-27).
- **AI Agents in Action, 2nd ed.** (Micheal Lanham, Manning, June 2026, 392 pp.) — Ch. 8 "Deploying agents and agentic systems" covers Dockerizing agent systems, "advanced deployment strategies," security/governance (liveBook TOC, accessed 2026-08-27). This is app-level deployment, not model-serving internals.
- **AI Agents and Applications** (Roberto Infante, Manning, Feb 2026, 448 pp.) — LangChain/LangGraph/MCP-focused; no serving-layer chapters in the announced structure (Manning product page, accessed 2026-08-27).
- **Build a Multi-Agent System (from Scratch)** (Val Andrei Fajardo, Manning, MEAP Oct 2025, est. pub Nov 2026, ~325 pp.) — MCP/A2A coordination; infrastructure not in scope (Manning page, accessed 2026-08-27).
- **Building Applications with AI Agents** (O'Reilly, Sept 2025) — pattern/orchestration oriented; "sequencing multiple model inferences" is mentioned as a concept, not a serving-systems treatment (O'Reilly listing, accessed 2026-08-27).
- **Agentic AI for Engineers: Architecting Goal-Driven Systems** (O'Reilly, March 2026, 460 pp.) — bridge/architecture framing for engineers; listing shows no inference-serving depth (O'Reilly listing, accessed 2026-08-27).
- **Building Agentic AI Systems** (Biswas et al., Packt, 2025, 17 chapters) — TOC runs fundamentals → reflection/planning/orchestration → trust/safety/ethics → use cases. A companion "Deployment" module covers containerizing agentic apps, CI/CD, autoscaling, graceful degradation — but at the *application service* layer, not GPU/model serving (Packt TOC + LegacyForward library page, accessed 2026-08-27).
- **A Common-Sense Guide to AI Engineering** (Jay Wengrow, Pragmatic, May 2026, 300 pp.) — production-readiness of LLM apps; Pragmatic's AI catalog (2025-2026) has no agent-infrastructure title (pragprog.com, accessed 2026-08-27).
- **Serving-layer books do exist but are agent-agnostic and mostly self-published**: *vLLM in Practice* (Amazon Kindle, Mar 2026), *vLLM in Production* (Denning), *vLLM Systems Engineering* (independently published, May 2026, 131 pp.), *vLLM Deployment Engineering* (Feb 2026, "Intelligent Systems Infrastructure Series"). None are from Manning/Pragmatic/O'Reilly; none are framed around agent workloads (Amazon/ThriftBooks listings, accessed 2026-08-27).
- *Building Language AI* and *Building Scalable AI* (apartsin.com web books) do cover Containers/Kubernetes/KServe/GPU operators and "Distributed LLM Serving" (tensor/pipeline parallelism, paged KV cache, dis-aggregated prefill/decode) — evidence the serving topic is treated seriously, but these are online book projects, not established-publisher agent titles (accessed 2026-08-27).

## Coverage map — what exists, how deep

| Layer | Books covering it | Depth |
|---|---|---|
| Agent patterns/orchestration (tools, memory, MCP, A2A) | Nearly all titles above | Deep — the entire market |
| App deployment of agents (Docker, CI/CD, autoscaling of agent services) | AI Agents in Action 2e Ch.8; Building Agentic AI Systems | Moderate — one chapter each, app-server framing |
| Inference optimization (metrics, quantization, batching) | AI Engineering Ch.9 (2025) | Substantive but framework-agnostic, ~40 pp., pre-agentic-era framing |
| Model serving layer (vLLM-class engines, KV cache, parallelism, GPU scheduling, agent-aware serving) | Self-published vLLM titles only | Narrow, uneven quality, no major-publisher treatment |

## Series angle — what this means for Inference Engineering Vol. II positioning

- **The wedge is confirmed.** No 2025-2026 agent-building title from O'Reilly, Manning, Pragmatic, or Packt covers the serving layer *beneath* agents beyond roughly a chapter or less; the deepest treatment (AI Engineering Ch.9) predates agent-first workloads.
- **Agent-aware serving is unclaimed territory.** Existing serving books treat generic chat workloads; none address agentic traffic patterns (long multi-turn contexts, bursty tool-call interleaving, KV-cache reuse across agent steps) as a first-class concern.
- **Positioning:** Vol. II can sit exactly between the crowded "build agents" shelf and the thin self-published vLLM shelf — the only title connecting agentic workload characteristics to serving-engine engineering, with major-publisher credibility none of the vLLM books have.

## Sources — primary URLs

- https://github.com/chiphuyen/aie-book/blob/main/ToC.md (AI Engineering TOC)
- https://www.oreilly.com/library/view/ai-engineering/9781098166298/
- https://livebook.manning.com/book/ai-agents-in-action-second-edition/chapter-8
- https://www.manning.com/books/ai-agents-in-action-second-edition
- https://www.manning.com/books/ai-agents-and-applications
- https://www.manning.com/books/build-a-multi-agent-system-from-scratch
- https://www.oreilly.com/library/view/building-applications-with/9781098176495/
- https://www.oreilly.com/library/view/agentic-ai-for/9798868823619/
- https://www.packtpub.com/en-si/product/building-agentic-ai-systems-9781801079273
- https://www.legacyforward.ai/library/books/building-agentic-ai-systems/deployment
- https://pragprog.com/titles/jwpaieng/a-common-sense-guide-to-ai-engineering/
- https://pragprog.com/categories/ai-and-machine-learning/
- https://www.amazon.com/vLLM-Practice-Developers-High-Performance-Deployment-ebook/dp/B0GV3LLQH6
- https://www.amazon.com/dp/B0H2LDMQ3M
- https://www.amazon.com/VLLM-Deployment-Engineering-Optimization-Infrastructure-ebook/dp/B0GMKWDGMS
- https://scalablebook.apartsin.com/part-5-distributed-inference/module-24-distributed-llm-serving/index.html
