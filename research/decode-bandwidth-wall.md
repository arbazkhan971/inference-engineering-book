# The memory-bandwidth wall of autoregressive decode: why single-stream tokens/sec tracks HBM GB/s, not FLOPS
researched: 2026-08-27 · researcher: glm-5.3-flash

## Key facts
- Autoregressive decode generates one token at a time; each decode step reads every weight matrix from HBM again, so batch-1 decode is memory-bandwidth-bound, not compute-bound (Locara docs, fetched 2026-08-27; Baseten inference guide, fetched 2026-08-27).
- Single-stream ceiling formula: `tokens_per_second ≈ memory_bandwidth ÷ active_bytes_per_token`, with a practical rule of thumb `tok/s ≈ (bandwidth_GBps × 0.7) ÷ weight_GB` because real kernels achieve roughly 60–80% of peak HBM bandwidth (Locara docs, fetched 2026-08-27).
- Worked example: B200 at ~8.0 TB/s HBM3e bandwidth running a 70B model in FP8 (~70 GB resident) caps at ~115 tokens/sec per GPU stream; FP4 roughly doubles the ceiling (ITK Research, fetched 2026-08-27; B200 spec 8.0 TB/s, 192 GB HBM3e per NVIDIA B200 data sheet as quoted by Spheron, fetched 2026-08-27).
- Vendor HBM bandwidth specs: A100 80GB = 2.0 TB/s HBM2e; H100 SXM = 3.35 TB/s HBM3 (80 GB); H200 SXM = 4.8 TB/s HBM3e (141 GB); B200 = 7.7–8.0 TB/s HBM3e (180–192 GB, sources differ on 180 vs 192 GB) (GMI Cloud comparison, fetched 2026-08-27; Spheron H200/B200 guide, fetched 2026-08-27).
- Same-formula check on H100: 70B model in FP8 (~70 GB) over 3.35 TB/s → ~48 tok/s theoretical ceiling; the observed batch-1 reality is lower, which is why 8-bit/4-bit quantization is the cheapest single-stream speedup — it shrinks bytes moved per token (ITK Research, fetched 2026-08-27; Locara docs, fetched 2026-08-27).
- vLLM benchmark (Sep 2024): Llama 3.1 70B on 4×H100 reached roughly 1,500–2,500 output tok/s aggregate at high concurrency, versus the ~50–100 tok/s single-stream ceiling — batching is the throughput lever (vLLM v0.6.0 perf blog, 2024; Llama 3.1 post on vllm-project.github.io, 2024-07-23).
- MLPerf v6.0 as quoted by vendor pages: B200 ~17,500 tok/s vs H100 ~3,000 tok/s on Llama 70B — a large-batch throughput figure, not single-stream (Spheron B200 guide, fetched 2026-08-27).
- A community tutorial reports Llama 3.1 70B served with vLLM 0.20 on a single A100 80GB at 100+ tok/s — consistent with AWQ/int4 quantization shrinking the ~140 GB BF16 weights to fit one GPU's 80 GB and 2.0 TB/s (Markaicode vLLM tutorial, fetched 2026-08-27).
- KV cache reads ride the same bus: for a 70B model at 32K context the KV cache alone reaches roughly 20 GB per active sequence, so at long context and large batch, KV reads overtake weight reads as the dominant traffic (temperature2.com KV cache analysis, 2026-07-14).
- KV cache bytes per token = `2 × num_layers × num_kv_heads × head_dim × dtype_bytes` (tensormux kernel-skills repo, fetched 2026-08-27); GQA shrinks `num_kv_heads`, DeepSeek's MLA compresses the cache by ~93% (temperature2.com, 2026-07-14).

## How it works
- **Why decode is bandwidth-bound.** Prefill processes a whole prompt at once: many tokens share each weight read, arithmetic intensity is high, FLOPS dominate. Decode processes one token per step: to produce it, every layer's weight matrices (plus that sequence's KV cache entries) must stream from HBM into the compute units, only a couple of FLOPs per byte are performed, and the GPU's multi-petaFLOP tensor cores sit mostly idle waiting on memory. The roofline arithmetic intensity of a batch-1 GEMV is ~1–2 FLOP/byte against a machine balance of hundreds of FLOP/byte.
- **The formula.** For a single stream:
  `step_time ≈ (weight_bytes + KV_bytes) ÷ effective_bandwidth`
  `steps/sec ≈ effective_bandwidth ÷ (weight_bytes + KV_bytes)`
  with `effective_bandwidth ≈ 0.6–0.8 × peak`. Worked example: 70B params at FP8 = 70 GB; B200 peak 8.0 TB/s × ~0.7 efficiency ≈ 5.6 TB/s effective; 5,600 GB/s ÷ 70 GB ≈ 80 tok/s; the theoretical peak (no efficiency loss) is ~115 tok/s. Quantize to FP4 (35 GB) and the same formula doubles the ceiling.
- **Why batching amortizes weight reads.** With batch size B, one pass reads the weights once and applies them to B sequences' tokens simultaneously (weights are reused across the batch dimension), so weight traffic per token drops by ~B×. Throughput scales nearly linearly with B at first; each step takes slightly longer per token (bigger GEMMs, more KV to read), so per-request latency (TPOT) rises even as aggregate tok/s climbs.
- **Where weight reads stop dominating.** KV traffic scales with B (each sequence has its own cache), weight traffic does not. The crossover arrives when `B × KV_bytes ≈ weight_bytes`. Short contexts: B can grow to hundreds before KV traffic matters — this is where massive batch throughput figures (thousands of tok/s) come from. Long contexts: the KV cache per sequence is large (e.g., ~20 GB at 32K for a 70B model), so B stays small, weight reads amortize little, and decode stays near the bandwidth wall. Practical sweet spots are engine- and model-dependent; the structural rule is: batch until KV reads + longer kernels push TPOT past your SLO, not further.

## Harness angle
- When your agent does single-user streaming (one long reasoning trace), tokens/sec is fixed by bandwidth ÷ model bytes — no prompt tuning or engine flag fixes it; choosing a smaller or more aggressively quantized checkpoint is the only real lever. Conversely, if your harness fans out many parallel agent calls, instruct the serving layer (or choose an engine config) to batch them and accept modestly higher TPOT: throughput per GPU rises several-fold, directly cutting cost per token. Set your TPOT SLO to decide the batch ceiling, and prefer GQA/MLA-style or KV-quantized models when agents carry long contexts, because past the KV-vs-weight crossover extra batching buys nothing.

## Sources
- Locara docs — LLM Memory Math (bandwidth formula, 0.7 efficiency rule): https://locara.dev/docs/notes/llm-memory-math
- ITK Research — Token throughput and the memory wall: https://itkservices3.com/background/token_memory
- NVIDIA H100 datasheet (3.35 TB/s HBM3): https://www.nvidia.com/content/dam/en-zz/Solutions/Data-Center/h100/pdf/nvidia-h100-datasheet.pdf
- NVIDIA H200 datasheet (4.8 TB/s HBM3e): https://www.nvidia.com/en-us/data-center/h200/
- NVIDIA B200 data sheet / Spheron B200 guide (8.0 TB/s, MLPerf 17,500 vs 3,000 tok/s): https://www.spheron.network/blog/nvidia-b200-complete-guide/
- vLLM v0.6.0 performance blog (Sep 2024, Llama 3 8B/70B throughput on H100): https://vllm.ai/blog/2024-09-05-perf-update
- vLLM project — Llama 3.1 on H100/H200/MI300X post (2024-07-23): https://github.com/vllm-project/vllm-project.github.io/blob/main/_posts/2024-07-23-llama31.md
- Baseten — A guide to LLM inference and performance (model size ≈ 2× params in BF16): https://www.baseten.co/blog/llm-transformer-inference-guide/
- temperature2.com — Why the KV cache dominates your inference bill (2026-07-14): https://temperature2.com/p/2026-07-14-did-you-know-kv-cache/
- tensormux kernel-skills — prefill vs decode kernels (KV bytes/token formula): https://github.com/tensormux/kernel-skills/blob/master/skills/inference/optimize-prefill-vs-decode-kernels/SKILL.md
