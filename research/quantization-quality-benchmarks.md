# Quantization Quality Benchmarks: Measured Accuracy Deltas by Method
researched: 2026-08-27 · researcher: glm-5.3-flash

## Key facts
- The most systematic study of quantized reasoning models (COLM 2025; DeepSeek-R1-Distilled 1.5B–70B + QwQ-32B; benchmarks AIME, MATH-500, GPQA-Diamond, LiveCodeBench) finds W8A8 and 4-bit weight-only (W4A16) "can achieve near-lossless performance, while lower bit-widths introduce significant accuracy risks" (arXiv:2504.04823, 2025).
- Same study, 8-bit results (arXiv:2504.04823, 2025): best W8A8 method (FlatQuant/QuaRot) is within ±1 point of BF16 at every size — 1.5B −0.41 avg, 7B +0.88, 32B +0.05, 70B +0.36 — supporting the "FP8/8-bit is near-lossless" rule. But W8A8 is not automatically safe: SmoothQuant on the 1.5B model loses −4.43 avg points (AIME 21.67→17.50) — method choice matters more than bit-width at 8 bits.
- Same study, 4-bit weight-only results (AWQ/GPTQ, arXiv:2504.04823, 2025): avg drops of −0.82 to −3.27 points, with losses concentrated in AIME (hardest reasoning): 70B LLaMA AWQ AIME 59.17→52.50 (−6.67), GPTQ 59.17→47.50 (−11.67); MATH-500 and LiveCodeBench drop ≤2 points; GSM8K drops 0.00 in one 32B W4A4 case. Math/code degrade most.
- Community/aggregator data on Llama-2-era models agrees 4-bit is close to lossless on easy tasks but calibration-sensitive: GSM8K 7B FP16 13.87 vs GPTQ 12.13 vs AWQ 13.57; 70B FP16 56.41, GPTQ 56.03, AWQ 56.40; under out-of-distribution calibration AWQ loses 0.5–0.6 perplexity points vs GPTQ's 2.3–4.9 (ChatOET summary of AWQ paper data, 2026 — community source, approximate).
- The original GPTQ paper claims 3–4-bit quantization of 175B-parameter models "with negligible accuracy degradation," plus ~3.25x speedup on A100 (arXiv:2210.17323, 2022) — "negligible" is the authors' qualitative claim; no per-benchmark numbers in the abstract.
- FP8 in production: Baseten quantized Mistral-7B to FP8 (TensorRT-LLM, H100) and validated quality via perplexity ("comparable" to FP16) before shipping, gaining 8.5% lower TTFT, 33% faster output tok/s, 31% higher throughput, 24% lower cost per million tokens (Baseten blog, fetched 2026-08-27).
- FP8 KV-cache: vLLM's April 2026 validation measured FP8 KV-cache + FP8 attention on Qwen3-30B-A3B-Thinking-2507 losing "at most 1–2 points" on AIME25/GPQA-Diamond/MATH500/LiveCodeBench-v6 (lowest recovery 97%); Qwen3.5-27B lost ≤0.7 points (recovery ≥99% on AIME25) — near-lossless when scales are handled correctly (vLLM blog, 2026-04-22).
- FP8 KV-cache failure mode found in the same vLLM validation: pre-fix Flash Attention accumulation caused a 128k-context needle-in-a-haystack collapse from 91% (BF16) to 13%; the two-level accumulation fix restored 89% (vLLM blog, 2026-04-22). Uncalibrated per-tensor scales (scale=1.0) caused consistent downward shifts on Kimi-K2.5; vLLM recommends calibrated scales via LLM Compressor (vLLM docs, fetched 2026-08-27).
- FP8 KV-cache payoff (vLLM v0.19.1 vs BF16, 2026-04-22): KV memory halved; Llama-3.1-8B per-token decode cost to 54% of BF16; +14.9% output tok/s (450.3→517.5) and −13% runtime at concurrency 8, ~20k in/~2k out; break-even at ~7k cached tokens (was ~25k in v0.10.2).
- Per-model variance is the recurring finding: 4-bit hurt the 1.5B and 70B-Llama distills more (−1.4 to −3.3 avg) than the 7B/32B Qwen distills (−0.8 to −1.8 avg) in arXiv:2504.04823 (2025); the LLaMA-3 quantization survey likewise reports "non-negligible degradation" for low-bit LLaMA3 (arXiv:2404.14047, 2024).
- Aggregators label quantized variants explicitly: OpenRouter's provider routing exposes a `quantizations` filter with levels `int4`, `int8`, `fp4`/`mxfp4`/`nvfp4`, `fp6`, `fp8`/`mxfp8`, `fp16`, `bf16`, `fp32`, `unknown`; default routing orders by price, so a quantized tier can win the bid unless filtered (OpenRouter docs, fetched 2026-08-27).
- vLLM supports W8A8 FP8, INT8 W8A8/W4A8, INT4 W4A16 (LLM Compressor), AutoAWQ, GPTQ, GGUF, and FP8 KV cache, with FP8 W8A8 requiring Ada/Hopper-class or AMD GPUs (vLLM docs, fetched 2026-08-27) — engine support is now table stakes; quality is the differentiator.
- GGUF Q4-class local quants: no primary benchmark tables surfaced in this pass; treat "Q4_K_M loses a few points vs Q8/FP16, more on math/code" as a community approximation (hedged), consistent with the W4A16 academic numbers above.

## How it works
Quantization replaces high-precision weights (and sometimes activations or the KV cache) with low-bit approximations, and the quality bill arrives in a predictable order. Eight-bit floating point (FP8, W8A8) keeps enough mantissa (E4M3) plus a per-tensor scaling factor that the rounding error stays small relative to the noise already in the model, so evaluation deltas land inside run-to-run variance — the reason providers ship FP8 tiers confidently. The catches are engineering, not bit-width: an accumulation bug in FP8 attention silently collapsed long-context retrieval until fixed, and uncalibrated scale factors produce small consistent drops.

Four-bit weight-only (AWQ, GPTQ, GGUF Q4) is where measurable loss starts. Rounding each weight to 16 levels injects error that the model absorbs on knowledge/retrieval tasks but amplifies on tasks where every token of a long chain has to be right — math and code. That is why average scores look fine while AIME-style items drop by multiple points: one degraded step kills the whole answer. Calibration data distribution matters too; AWQ's activation-aware scaling was designed specifically to avoid overfitting to calibration samples, which is why it degrades more gracefully than GPTQ under distribution shift.

KV-cache quantization is a separate axis: it leaves weights alone and stores attention keys/values in FP8, roughly halving the cache so longer contexts and bigger batches fit. Because errors in cached attention states propagate across every subsequent token, a scale or accumulation mistake shows up as long-context degradation first — hence the needle-in-a-haystack collapse — while short-context benchmark scores barely move.

Per-model variance is the practical complication. Small models (<2B) and some architectures have less redundancy to absorb rounding error, so the same AWQ recipe that costs 32B-Qwen less than a point can cost a 1.5B or a 70B-Llama 2–3 points. Deltas are a property of (model, method, calibration, benchmark), not of the bit-width alone.

## Harness angle
When you're picking between a provider's FP8 tier and a 4-bit tier (or setting OpenRouter's `quantizations` filter), treat fp8 as a safe default but pin routing away from `int4`/`fp4` for any agent step that does arithmetic, structured code generation, or multi-step reasoning — that's exactly where the 1–11 point losses live, and price-ordered default routing will happily pick them for you. If you serve yourself, budget an eval pass (GSM8K-class plus one hard-reasoning set) on your exact quantized artifact before trusting it: per-model variance means the vendor's benchmark is not your benchmark.

## Sources
- https://arxiv.org/abs/2504.04823 — Quantization Hurts Reasoning? empirical study, all W8A8/W4A16 reasoning numbers
- https://arxiv.org/html/2504.04823v1 — full tables for the above
- https://arxiv.org/abs/2404.14047 — How Good Are Low-bit Quantized LLaMA3?
- https://arxiv.org/abs/2210.17323 — GPTQ paper
- https://arxiv.org/abs/2306.00978 — AWQ paper
- https://vllm.ai/blog/2026-04-22-fp8-kvcache — FP8 KV-cache quality + throughput validation, v0.10.2 vs v0.19.1
- https://docs.vllm.ai/en/latest/features/quantization/quantized_kvcache/ — calibrated-scales guidance
- https://www.baseten.co/blog/33-faster-llm-inference-with-fp8-quantization/ — production FP8 validation and gains
- https://openrouter.ai/docs/features/provider-routing — quantization labels and `quantizations` filter
- https://chatoet.com/2026/07/22/gptq-vs-awq-4-bit-quantization-for-local-llms/ — community GSM8K/perplexity cross-check (secondary)
