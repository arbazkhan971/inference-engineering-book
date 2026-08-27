# Same Weights, Different Engines: How Provider Serving Decides Speed and Price
researched: 2026-08-27 · researcher: glm-5.3-flash

## Key facts

- Identical open weights served by different API providers differ in output speed by up to **8.3x** for Llama 4 Scout: Groq 446.7 tokens/s vs DeepInfra 53.5 tokens/s, with Amazon Bedrock at 172.0 t/s and Google Vertex at 152.8 t/s (Artificial Analysis, retrieved 2026-08-27).
- Blended price (7:2:1 cache-hit/input/output ratio) for the same Llama 4 Scout varied up to **2.7x** across providers: DeepInfra $0.12/1M tokens vs Cloudflare $0.33/1M tokens; Groq $0.13, Amazon Bedrock $0.22 (Artificial Analysis, retrieved 2026-08-27).
- Time-to-first-token (TTFT) also varies per host for the same Scout weights: DeepInfra 0.57 s, Google Vertex 0.72 s, Groq 0.75 s, Amazon Bedrock 0.80 s — i.e., the fastest-decoding host (Groq) was *not* the lowest-TTFT host (Artificial Analysis, retrieved 2026-08-27).
- For DeepSeek R1 0528, provider spread was even wider: output speed **6.1x** (Google Vertex 154.8 t/s vs DeepInfra 25.6 t/s; Novita 25.9 t/s) and price **6.1x** (DeepInfra $0.56/1M blended vs Together AI $3.40/1M) (Artificial Analysis, retrieved 2026-08-27).
- DeepSeek R1 0528 per-token prices by host: DeepInfra $0.50 in / $2.15 out per 1M tokens; Novita $0.70 in / $2.50 out; Google Vertex $1.35 in; Hyperbolic $3.00 out — same weights, same API shape, wildly different economics (Artificial Analysis, retrieved 2026-08-27).
- Third-party comparison of DeepSeek R1 across two hosts reported Groq at $0.75 in / $0.99 out per 1M tokens vs Together at $3.00 in / $7.00 out — a ~7x output-price gap for the same model name (LLMversus, retrieved 2026-08-27).
- FP8 quantization (W8A8-FP) is "effectively lossless" across academic benchmarks and real-world tasks on the entire Llama-3.1 family, per 500,000+ evaluations — meaning hosts serving FP8 variants of the same model trade essentially no quality for speed (arXiv 2411.02355, "Give Me BF16 or Give Me Death?", Databricks, retrieved 2026-08-27).
- SemiAnalysis InferenceX precision comparison on Qwen 3.5 397B-A17B (B200): FP8 delivers 1429 tok/s/chip at $0.34/1M tokens vs BF16 at 1216 tok/s/chip and $0.40 — FP8 is **18% cheaper per token and 18% faster per chip** with the same weights; on B300 the gap is **23%** (1815 vs 1475 tok/s/chip; $0.35 vs $0.43/1M) (InferenceX by SemiAnalysis, retrieved 2026-08-27).
- Independent single-H100 benchmark of Qwen3-32B found FP8 "loses no measurable accuracy" while INT4 is 2.7x faster than BF16 but drops ~8 points on HumanEval code generation — so the *quantization choice a host makes* silently changes both speed and quality of the "same" model (AIMultiple, retrieved 2026-08-27).
- Artificial Analysis explicitly notes provider performance shifts over time with infrastructure changes, load balancing, and updates — provider rankings are a snapshot, not a constant (Artificial Analysis, retrieved 2026-08-27).

## How it works

An open model's weights are a recipe; a serving provider is the kitchen. The same checkpoint can be compiled to different hardware (GPUs vs LPUs vs wafers), quantized to different precisions (BF16 vs FP8 vs INT4), batched with different policies, and priced with different margins — all without changing the model card.

Mechanism of the spread:

1. **Hardware and kernels.** Groq's LPU-based serving hits 446.7 t/s on Llama 4 Scout where commodity-GPU hosts hit ~54–172 t/s — an 8.3x gap purely from serving stack, since the weights are identical (Artificial Analysis, 2026-08-27).
2. **Quantization.** A host may serve the FP8 variant while another serves BF16. FP8 is near-lossless (arXiv 2411.02355) but ~18–23% faster and cheaper per token (SemiAnalysis InferenceX, 2026-08-27). Two providers "serving Llama" may literally serve different bit-widths, and marketplaces like Artificial Analysis tag variants (e.g., "DeepInfra (FP8)") to keep comparisons honest.
3. **Batching and TTFT/throughput trade-offs.** Providers optimizing for throughput batch more requests, raising tokens/s but also queueing; TTFT rankings (DeepInfra 0.57 s) can invert speed rankings (Groq 447 t/s).
4. **Margin and scale.** DeepSeek R1 0528 blended price ranged $0.56 (DeepInfra) to $3.40 (Together) per 1M tokens — a 6.1x markup difference on identical weights (Artificial Analysis, 2026-08-27).

Worked example (Llama 4 Scout, a 1,000-output-token agent step, prices and speeds from Artificial Analysis, retrieved 2026-08-27):

- **Groq:** 1,000 tokens ÷ 446.7 t/s ≈ **2.2 s** decode; output cost ≈ 1,000 × $0.34/1M ≈ **$0.00034**.
- **DeepInfra:** 1,000 ÷ 53.5 t/s ≈ **18.7 s** decode; output cost ≈ 1,000 × $0.30/1M ≈ **$0.00030**.
- Same weights, same prompt, ~1 cent of difference per 30 such steps — but Groq finishes ~8x sooner. For a 20-step agent loop, DeepInfra adds roughly 5–6 minutes of wall-clock time while saving about $0.002. Speed, not price, dominates interactive agent economics; price dominates batch workloads.

## Harness angle

Never hard-code a single provider for an open model. Route by workload class: latency-bound agent steps (tool-use loops where the user waits) go to the highest-tokens/s host (e.g., Groq-class serving); throughput-bound jobs (batch evaluation, summarization backfills) go to the cheapest blended-price host (e.g., DeepInfra-class). Pin the quantization variant explicitly (FP8 vs BF16) in the deployment manifest and re-benchmark quarterly, since Artificial Analysis shows provider rankings drift with infrastructure changes.

## Sources

- https://artificialanalysis.ai/models/llama-4-scout/providers — Artificial Analysis provider benchmark for Llama 4 Scout (speed, TTFT, price per provider)
- https://artificialanalysis.ai/models/deepseek-r1/providers — Artificial Analysis provider benchmark for DeepSeek R1 0528
- https://arxiv.org/html/2411.02355v4 — "Give Me BF16 or Give Me Death?" arXiv/Databricks empirical study of FP8/INT8/INT4 across Llama-3.1
- https://inferencex.semianalysis.com/compare-precision/qwen-3-5-b200-fp8-vs-bf16 — SemiAnalysis InferenceX: Qwen 3.5 397B FP8 vs BF16 on B200
- https://inferencex.semianalysis.com/compare-precision/qwen-3-5-b300-fp8-vs-bf16 — SemiAnalysis InferenceX: same comparison on B300
- https://aimultiple.com/llm-quantization — AIMultiple single-H100 quantization benchmark (Qwen3-32B, BF16/FP8/INT8/INT4)
- https://llmversus.com/llm/compare/groq-deepseek-r1-vs-together-deepseek-r1 — LLMversus cross-provider DeepSeek R1 price comparison
- https://artificialanalysis.ai/models/llama-4-maverick/providers — Artificial Analysis provider benchmark noting FP8 variant tagging
