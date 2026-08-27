# Research: Free Alternatives to an Inference Engineering Book

Researched: 2026-08-27

## Key facts

1. **vLLM docs are deep but reference-shaped.** docs.vllm.ai ships a Design Documents section (V1 architecture overview, Model Runner V2, Fused MoE modular kernel, CUDA graphs, hybrid KV cache manager), a quantization feature matrix spanning FP8/MXFP4/NVFP4/INT8/GPTQ/AWQ/GGUF/compressed-tensors, an optimization-tuning guide with -O0…-O3 levels, and benchmark suites. It tells you *what knobs exist*; it does not narrate *why* a design won or walk through the arithmetic of a sizing decision. (https://docs.vllm.ai/en/latest/, https://docs.vllm.ai/en/stable/design/arch_overview/, accessed 2026-08-27)

2. **SGLang docs cover advanced serving well, with acknowledged gaps.** docs.sglang.io documents speculative decoding (EAGLE-2/3, MTP, DFLASH, draft-model, NGRAM variants) with full parameter tables, and the front page claims production scale ("trillions of tokens each day across more than 400,000 GPUs"). Deep technical content lives in the LMSYS blog (Aug 2026: sub-second engine recovery via Weight Cache Daemon, batch-1 speculative decode on Blackwell, DeepSeek-V4-Pro serving optimization). One third-party comparison (Aug 2026, anecdotal) says SGLang docs "still have gaps compared to vLLM's years of accumulated tutorials." (https://docs.sglang.io/, https://docs.sglang.io/docs/advanced_features/speculative_decoding.md, https://lmsys.org/blog/)

3. **inference.cafe does not exist.** As of 2026-08-27 the domain fails DNS resolution (apex and www) and the Wayback Machine has zero archived snapshots. Closest real entities: Baseten's "Inference Café" in-person events (NY Tech Week), and newsletters like Inference Radar (weekly digest across 175+ inference repos) and inference.report. Any series plan referencing "inference.cafe" should drop or rename it. (https://www.baseten.co/resources/event/baseten-inference-cafe-for-ai-engineers-founders-nytechweek/, https://www.inference-radar.com/)

4. **simonwillison.net = practitioner notes and curation, not a curriculum.** "Quantization matters" (2024-11-23) surfaces Paul Gauthier's Aider benchmark scores across Qwen2.5-32B quant levels (BF16 71.4% top score); "Quantization from the ground up" (2026-03-26) points to Sam Rose's interactive essay; recurring local-inference experiments (Qwen3.6-35B-A3B on a laptop, 2026-04-16; Qwen 397B via "LLM in a Flash" on a 48GB Mac, 2026-03-18). Strength: timely, hands-on, trusted filtering. It will never assemble a serving-stack narrative. (https://simonwillison.net/2024/Nov/23/quantization-matters/, https://simonwillison.net/2026/Mar/26/quantization-from-the-ground-up/)

5. **Provider engineering blogs are per-technique deep dives tied to vendor stacks.** Baseten: "How we built the fastest GLM-5 API" (186+ TPS via MTP speculative decoding, MoE kernels, DeepSeek Sparse Attention kernels) and GLM-5.2 at 280+ TPS on Blackwell (KV-aware routing, PD disaggregation, NVFP4). Fireworks: MiniMax M3 sparse-attention kernel optimization on Blackwell. Together AI: efficient-inference research roundup (2026-05-04). NVIDIA: multi-part TensorRT-LLM series on expert parallelism (Parts 1–3), chunked prefill, AutoDeploy. Individually excellent; collectively scattered, GPU/model-specific, and marketing-adjacent. (URLs in Sources)

6. **Free video courses exist and cover the fundamentals.** Stanford CS336 (Spring 2025) Lecture 10 "Inference" is free on YouTube with transcript and runnable lecture code, and the course explicitly teaches FLOPs/memory arithmetic intensity; DeepLearning.AI's "Fast & Efficient LLM Inference with vLLM" is a free ~1h38m short course; GPU MODE's community series has grown to 106 free lectures (slides/code in an Apache-2.0 repo) including FlashInfer, low-bit Triton kernels, and Unsloth sessions. (https://cs336.stanford.edu/, https://www.deeplearning.ai/courses/fast-and-efficient-llm-inference-with-vllm, https://github.com/gpu-mode/lectures)

7. **A free book already occupies this space.** Baseten Books' *Inference Engineering* by Philip Kiely (2026) is free online: 8 chapters from prerequisites through production deployment, organized around runtime/infrastructure/tooling layers; an unofficial interactive companion (inferenceengineering.tech) adds animated diagrams and calculators. A new book must differentiate against it. (https://www.baseten.co/inference-engineering/)

## Coverage map

- **Mechanics/how-to (strong free coverage):** vLLM + SGLang docs, Baseten book chapters, DeepLearning.AI course.
- **Design internals (partial):** vLLM design docs and TensorRT-LLM tech blog cover select internals; no free source walks one design decision end-to-end across engines.
- **Cutting-edge results (strong, fragmented):** provider blogs and LMSYS blog; numbers expire with each GPU/model generation.
- **Quantization & local inference (strong):** Simon Willison's links/experiments, Sam Rose's essay, Unsloth lecture.
- **Arithmetic & systems intuition (partial):** CS336 lectures; otherwise scattered through papers and blog asides.
- **Curated end-to-end path (the gap):** only the Baseten book, which is vendor-published.

## Series angle

What only a book still adds: (1) **a curated path** — the free corpus is excellent but scattered; the open-source *llm-inference-at-scale* handbook states it plainly: the knowledge "is scattered across research papers, blog posts, source code comments, and tribal knowledge. No single resource connected the full picture." (2) **worked arithmetic** — sizing KV cache, FLOPs, rooflines in one consistent voice, not one-off lecture slides. (3) **narrative and durability** — a stable, opinionated through-line that survives the docs' churn and blog benchmark treadmill. Differentiate from Baseten's free book via vendor neutrality and deeper kernel-level/benchmark-driven treatment.

## Sources

- vLLM docs hub — https://docs.vllm.ai/en/latest/
- vLLM architecture/design docs — https://docs.vllm.ai/en/stable/design/arch_overview/
- vLLM quantization matrix — https://docs.vllm.ai/en/stable/features/quantization/
- vLLM optimization & tuning — https://docs.vllm.ai/en/stable/configuration/optimization/
- SGLang docs — https://docs.sglang.io/
- SGLang speculative decoding — https://docs.sglang.io/docs/advanced_features/speculative_decoding.md
- LMSYS blog (SGLang deep dives) — https://lmsys.org/blog/
- Baseten *Inference Engineering* book — https://www.baseten.co/inference-engineering/
- Baseten blog, GLM-5 fastest API — https://www.baseten.co/blog/how-we-built-the-fastest-glm-5-api/
- Baseten blog, GLM-5.2 280+ TPS — https://www.baseten.co/blog/how-we-built-the-worlds-fastest-api-for-glm-52/
- Fireworks kernel optimization — https://fireworks.ai/blog/kernel-optimization-for-minimax-m3-on-nvidia-blackwell
- Together AI inference research — https://www.together.ai/blog/foundational-research-powering-efficient-inference-at-scale
- NVIDIA TensorRT-LLM EP series part 3 — https://nvidia.github.io/TensorRT-LLM/blogs/tech_blog/blog14_Scaling_Expert_Parallelism_in_TensorRT-LLM_part3.html
- Simon Willison, quantization matters — https://simonwillison.net/2024/Nov/23/quantization-matters/
- Simon Willison, quantization from the ground up — https://simonwillison.net/2026/Mar/26/quantization-from-the-ground-up/
- Simon Willison, LLM in a Flash — https://simonwillison.net/2026/Mar/18/llm-in-a-flash/
- Stanford CS336 — https://cs336.stanford.edu/ ; Lecture 10 — https://www.youtube.com/watch?v=fcgPYo3OtV0
- DeepLearning.AI vLLM short course — https://www.deeplearning.ai/courses/fast-and-efficient-llm-inference-with-vllm
- GPU MODE lectures repo — https://github.com/gpu-mode/lectures
- llm-inference-at-scale handbook — https://github.com/harshuljain13/llm-inference-at-scale
- Baseten Inference Café event — https://www.baseten.co/resources/event/baseten-inference-cafe-for-ai-engineers-founders-nytechweek/

Dropped: mayhemcode.com vLLM-vs-SGLang post (SEO-grade, anecdotal — used only as a labeled anecdote); kraghavan.ca / respan.ai / packet.ai intro posts (generic explainers, no unique evidence); onepagecode YouTube video (46 views, quality unverifiable); inferenceengineering.tech/free-pdf (unofficial SEO companion page).
