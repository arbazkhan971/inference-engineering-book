# Decode-Time Budget Arithmetic: TTFT + N × TPOT and the Serial-Token Tax
researched: 2026-08-27 · researcher: glm-5.3-flash

## Key facts
- The decode-time inequality: end-to-end latency for a streamed reply ≈ TTFT + N × TPOT, where N is the number of output tokens; the approximation holds because TTFT absorbs queueing, prefill, and network, and TPOT is the steady-state inter-token gap (NVIDIA NIM benchmarking docs, docs.nvidia.com, fetched 2026-08-27).
- Derived worked budget, 500-token reply at 20 ms/token: 500 × 20 ms = 10.0 s of decode, plus TTFT. At 40 ms/token: 20.0 s. At 80 ms/token: 40.0 s. Doubling TPOT doubles the decode term — it is strictly linear in output length (derived arithmetic).
- MLPerf Inference v5.0 (April 2025) tightened the Llama 2 70B interactive constraints to p99 TTFT ≤ 450 ms and p99 TPOT ≤ 40 ms (25 tokens/s), from 2 s TTFT / 200 ms TPOT in v4.0, based on a late-2024 analysis of ChatGPT and Perplexity targeting 50th-percentile 20–50 tokens/s (MLCommons blog, 2025-04).
- MLPerf Inference v5.0 added Llama 3.1 405B Instruct with p99 TTFT ≤ 6 s and p99 TPOT ≤ 175 ms (~5.7 tokens/s) — an explicit admission that frontier-scale models can miss comfortable read-along speeds (MLCommons blog, 2025-04).
- Decode is memory-bandwidth-bound: each autoregressive step must stream essentially all model weights from GPU memory for a single useful token, so single-stream token rate ≈ effective_HBM_bandwidth / weight_bytes (kube-dojo memory-bandwidth math module, fetched 2026-08-27; also arXiv:2512.22066, 2025, on compute-bound prefill vs memory-bound decode).
- Worked bandwidth example (kube-dojo, fetched 2026-08-27, batch 1, FP16, 2048-token context): Llama-3-8B (~16 GB of weights) on RTX 4090 (1008 GB/s) → ~63 tokens/s peak, ~41 tokens/s at 65% effective bandwidth (TPOT ~24 ms); on H100 SXM (3350 GB/s) → ~209 tokens/s peak, ~136 tokens/s practical (TPOT ~7.4 ms).
- Why more chips don't speed one stream: TPOT is set by time-to-stream-weights, not FLOPs. Tensor parallelism across GPUs splits the weight stream so bandwidths add (Pipeline parallelism does not help a single stream at all — it only raises throughput). Adding GPUs raises aggregate tokens/s across concurrent users far faster than it raises per-stream tokens/s (kube-dojo module; Neel Mishra LLM-inference fundamentals, fetched 2026-08-27).
- Human anchors: adult silent reading of ordinary prose sits near 250 words/min (~4.2 words/s ≈ 5–8 tokens/s); conversational speech is slower, roughly 150 words/min (~2.5 words/s ≈ 3–5 tokens/s) (community/UX consensus figures — approximate, not primary-measured; e.g., sankar1535 Substack and abuz8ai speed guides, fetched 2026-08-27).
- UX thresholds (community benchmarks, approximate): below ~5–8 tokens/s streaming feels like crawling; 20–30 tokens/s feels fluid; above ~50 tokens/s extra speed is imperceptible for reading and only matters for agent chains and bulk consumption (abuz8ai / gmicloud UX write-ups, fetched 2026-08-27). GMI Cloud pegs the practical threshold at ~10 tokens/s (~450 words/min), above which perceived lag shifts to TTFT.
- Derived deadline math, reading-along chatbot (8 tokens/s budget, ~0.75 words/token, TTFT 0.5 s): a 3-second "user has the gist" deadline caps output at (3 − 0.5) × 8 ≈ 20 tokens ≈ 15 words; a 10-second deadline caps it at ~76 tokens ≈ 57 words. Voice agents (3–5 tokens/s speech pace) get even tighter caps (derived).
- Derived conversion used throughout: tokens/s = 1000 / TPOT_ms; e.g. TPOT 20 ms → 50 t/s, 40 ms → 25 t/s, 80 ms → 12.5 t/s (derived; matches the MLPerf 40 ms ≈ 25 tokens/s convention).

## How it works
Autoregressive decode is serial by construction: token k+1 is an input to producing token k+2, so the per-step dependency chain cannot be parallelized within one request. Each decode step is a forward pass over a batch of one token, which means the arithmetic intensity (FLOPs per byte moved) is tiny — you read tens of gigabytes of weights to emit one token. GPUs are starved for compute, not memory bandwidth, so TPOT is governed by how fast weights (plus the per-request KV cache stream) can cross the memory wall. That gives the clean prediction formula: single-stream tokens/s ≈ effective bandwidth ÷ weight bytes, validated to within a factor of ~1.5 by the kube-dojo worked examples above (fetched 2026-08-27).

The consequence for budgeting: total latency is an affine function of output length, latency(N) ≈ TTFT + N × TPOT, and the slope is the part you cannot buy your way out of. Prompt-length optimizations (chunked prefill, prefix caching) move the intercept — TTFT — and can be large. But the slope TPOT is pinned by bandwidth ÷ model size; TPOT of a 405B model at FP8 still means streaming ~200+ GB per token, which is why MLPerf gives it a 175 ms TPOT budget versus 40 ms for 70B (MLCommons, 2025-04). Quantization and tensor-parallel sharding shrink the slope; more replicas do not — they only add parallel streams.

Product budgets invert the inequality. Fix a UX deadline D (how long the user waits for the full useful answer) and a required perceived pace P (tokens/s ≥ reading or speaking speed), then max output N ≤ (D − TTFT) × P. If you need both a long answer and a short deadline, something must give: shorter output, smaller/quantized model (lower TPOT), speculative decoding (raises effective tokens/s at some cost), or a UI that restructures the deadline (progressive disclosure, citations streaming before prose).

## Harness angle
The harness should carry an explicit latency budget object per call site — {deadline_ms, max_output_tokens} — and derive `max_tokens` from measured TPOT for the deployed model rather than hardcoding it: max_tokens = floor((deadline − p95_TTFT) / p95_T POT). For agent chains where the consumer is another model, the budget can relax pace but not length, because serial tool-calls multiply the same inequality across hops; a five-step chain at 500 tokens each and 40 ms TPOT burns 100 s in decode alone before any tool latency (derived).

## Sources
- https://docs.nvidia.com/nim/benchmarking/llm/latest/metrics.html
- https://mlcommons.org/2025/04/llm-inference-v5/
- https://docs.mlcommons.org/inference/
- https://kube-dojo.github.io/ai-ml-engineering/ai-infrastructure/module-1.6-memory-bandwidth-math/
- https://arxiv.org/html/2512.22066v1
- https://neelmishra.github.io/blog/mlops/llm-inference/llm-inference-fundamentals.html
- https://www.gmicloud.ai/en/blog/ttft-llm-speed-metrics
- https://abuz8ai.com/blog/llm-inference-speed-guide
