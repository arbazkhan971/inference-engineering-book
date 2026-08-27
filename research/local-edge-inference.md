# Local and Edge Inference Stacks: llama.cpp/GGUF, Ollama, MLX, and When Owning the Engine Wins
researched: 2026-08-27 · researcher: glm-5.3-flash

## Key facts
- GGUF (llama.cpp's model container) supports a defined ladder of tensor quantization formats: floats (F32, F16, BF16), legacy quants (Q4_0, Q4_1, Q5_0, Q5_1, Q8_0), K-Quants (Q2_K–Q8_K), I-Quants (IQ1_S–IQ4_NL), and experimental TQ1_0/TQ2_0/MXFP4 (llama.cpp GGUF docs, retrieved 2026-08-27).
- llama.cpp's own quantizer tables quantify the loss per format on Llama-3-8B: Q4_0 ≈ 4.34 GB with +0.4685 perplexity, Q4_1 ≈ 4.78 GB with +0.4511 ppl, Q5_0 ≈ 5.21 GB with +0.1316 ppl (llama.cpp `tools/quantize/quantize.cpp`, retrieved 2026-08-27). The modern default for most users is Q4_K_M, applied via `llama-quantize in.gguf out.gguf Q4_K_M` (llama.cpp quantize README, retrieved 2026-08-27).
- Ollama on Apple Silicon is now built on Apple's MLX framework (in preview) instead of only llama.cpp, "to take advantage of its unified memory architecture," with speedups on M-series chips and Neural-Accelerator use on M5-family chips (Ollama blog, retrieved 2026-08-27).
- An arXiv study (arXiv:2511.05502) systematically compared MLX, MLC-LLM, Ollama, llama.cpp, and PyTorch MPS on a Mac Studio M2 Ultra with 192 GB unified memory across Qwen-2.5 models, measuring TTFT, steady-state throughput, latency percentiles, caching, and batching — the first peer-quality head-to-head of the local runtimes (retrieved 2026-08-27).
- Community benchmarks (approximate, treat as order-of-magnitude): a 70B Q4_K_M model runs at roughly 20–28 tok/s on M4 Max 128 GB — the first consumer chip described as running 70B at "real-time" speeds — dropping to ~10–12 tok/s at Q8, with Q4_K_M 70B consuming ~43 GB of RAM (currentaffair.today M4 Max benchmark guide, retrieved 2026-08-27).
- Community-aggregate tables report Llama 3.3 70B Q4_K_M at approximately 12 tok/s (Ollama) to 21 tok/s (MLX, M4 Ultra 192 GB) on 2025–2026 Max/Ultra chips; figures are community-estimated, not vendor-verified (llmcheck.net benchmark table, retrieved 2026-08-27). Mistral 7B Q4_K_M on a base M3 16 GB is estimated around 20 tok/s (llmcheck.net, retrieved 2026-08-27).
- The 70B ceiling on Apple Silicon is memory *bandwidth*, not capacity: decode speed is bounded by how fast weights can stream from unified memory (currentaffair.today; internalsdecoded.com, retrieved 2026-08-27).
- Community comparison claims MLX is roughly 15–30% faster than llama.cpp at the same quantization on Apple Silicon with ~10% less memory overhead; hedge as approximate, community-measured (willitrunai.com, retrieved 2026-08-27).
- Dated GPU rental rates (on-demand, checked 2026-08-02 by costperprompt.com; corroborated by gpuinsights.net verified April 2026): H100 ≈ $2.39–2.49/hr (RunPod, Lambda); marketplace A100 ≈ $1.49–2.49/hr range across Vast.ai/Spheron/RunPod/Lambda; a 4090-class marketplace card starts near ~$1.49/hr (costperprompt.com GPU Rental Pricing, retrieved 2026-08-27).
- Disaggregated API pricing for comparison: DeepInfra lists per-token rates from ~$0.02 per 1M input tokens (Llama 3.1 8B) up to ~$2.85 per 1M (frontier open-weight models) in 2026 (Spheron blog on DeepInfra pricing, retrieved 2026-08-27).

## How it works
A quantized local stack replaces "model as a service" with a computation bound to your own silicon. GGUF stores each tensor in a chosen numeric format: Q4_0 means each group of 32 weights shares a single fp16 scale, with weights stored as 4-bit integers (≈4.5 bits-per-weight effective); Q8_0 uses 8-bit integers with the same block-scaling scheme — near-lossless but roughly double the memory and bandwidth demand. K-Quants and I-Quants refine this with mixed block sizes and importance sampling to claw back accuracy at low bit-widths.

Why bandwidth dominates decode: at each generated token the runtime must read essentially the whole model once from memory. A 70B model at Q4_K_M is ~40 GB of weights, so a chip streaming 400 GB/s of unified memory can at best emit ~400/40 ≈ 10 tok/s — which matches the community ~12 tok/s figures above for mid-band Max chips; Ultra chips with ~800 GB/s double that. Prefill, by contrast, is compute-bound and benefits from GPU Neural Accelerators, which is why Ollama's MLX backend targets both TTFT and decode.

Worked crossover arithmetic (assumptions stated explicitly):
- Assumptions: agent workload of 10M tokens/month, average blended cost $0.60 per 1M tokens via API (typical mid-tier open-weight model on DeepInfra-style pricing, 2026); dedicated H100 at $2.49/hr serving ~2,000 tok/s aggregate for a 70B-class model (community-typical sustained throughput; hedge: varies with batch size).
- API cost: 10 × $0.60 = **$6/month** — renting a GPU makes no sense.
- At 1,000M tokens/month (a busy multi-agent deployment): API = $600/month; a dedicated H100 running 24/7 = 720 × $2.49 ≈ **$1,793/month**, but a spot/marketplace A100 at ~$1.49/hr ≈ **$1,073/month** — still above API until you also count privacy/compliance value or need sustained near-peak utilization. Crossover lands roughly where monthly token volume makes 24/7 GPU cost per token fall below API per-token price, i.e., only when the GPU is kept busy a large fraction of every hour. All rates dated as above; the crossover point moves with utilization, model size, and provider.

## Harness angle
Route by policy, not by vibes: an agent harness should treat "local engine vs hosted API" as a first-class routing decision keyed to prompt sensitivity and volume — sensitive/PII-bearing or offline-capable tasks pin to the local Ollama/MLX endpoint, while bursty high-volume generation goes to the API — and the crossover arithmetic above (dated rates + your measured utilization) is what the routing threshold should be computed from, revisited quarterly as GPU rental and per-token prices move.

## Sources
- llama.cpp GGUF format docs: https://ggml-org-llama-cpp.mintlify.app/concepts/gguf-format
- llama.cpp quantize tool README: https://github.com/ggml-org/llama.cpp/blob/master/tools/quantize/README.md
- llama.cpp quantize.cpp (per-format size/ppl table): https://github.com/ggml-org/llama.cpp/blob/master/tools/quantize/quantize.cpp
- Ollama blog — powered by MLX on Apple Silicon: https://ollama.com/blog/mlx
- Comparative study of local runtimes on M2 Ultra: https://arxiv.org/pdf/2511.05502
- Mac M4 Max 70B benchmark guide: https://www.currentaffair.today/blog/technology-13/mac-m4-max-local-llm-70b-benchmark-493
- llmcheck community Apple Silicon benchmark table: https://llmcheck.net/benchmarks
- costperprompt GPU rental pricing index (checked 2026-08-02): https://costperprompt.com/gpu-rental-pricing
- gpuinsights GPU cloud pricing comparison (verified April 2026): https://gpuinsights.net/gpu-cloud-pricing-comparison-2026/
- Spheron — DeepInfra per-token pricing 2026: https://www.spheron.network/blog/deepinfra-pricing-2026-inference-api-cost-vs-gpu-rental/
