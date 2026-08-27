# Speculative Decoding: Measured Acceptance Rates and Speedups (Data Digest)
researched: 2026-08-27 · researcher: glm-5.3-flash

## Key facts

- **EAGLE-1** (arXiv:2401.15077, Jan 2024): 2.7x–3.5x latency speedup on LLaMA2-Chat 70B across dialogue, code, math, and instruction tasks at batch size 1, with ~2x throughput gain; lossless w.r.t. output distribution. Typical EAGLE-1 acceptance length τ ≈ 3.5–4.5 tokens on the same setups (per EAGLE-2/3 comparison tables, 2024–2025).
- **EAGLE-2** (arXiv:2406.16858, Jun 2024): 3.05x–4.26x speedup, 20%–40% faster than EAGLE-1; mean τ (temp=0, per EAGLE-3 Table 1 comparison): Vicuna-13B 4.83, LLaMA-3.1-8B-Instruct 4.11, LLaMA-3.3-70B-Instruct 3.78, DeepSeek-R1-Distill-LLaMA-8B 3.92.
- **EAGLE-3** (arXiv:2503.01840, Mar 2025): speedups up to 6.5x (best case: 6.47x on HumanEval with Vicuna-13B, τ 7.54). Mean temp=0 speedup/τ: Vicuna-13B 5.51x/6.62; LLaMA-3.1-8B 4.44x/6.23; LLaMA-3.3-70B 4.12x/5.88; DeepSeek-R1-distill-8B 4.16x/5.84. ~1.4x over EAGLE-2; benefits scale with draft training data.
- **Temperature hurts acceptance** (EAGLE-3, temp=1 vs temp=0, same models): mean speedup drops — Vicuna-13B 5.51x→4.65x (τ 6.62→5.67); LLaMA-3.1-8B 4.44x→3.45x (τ 6.23→4.92); 70B 4.12x→3.95x (τ 5.88→5.66); distill-8B 4.16x→3.52x (τ 5.84→4.89). Derived: roughly 15–25% speedup loss at temp=1.
- **Medusa** (arXiv:2401.10774, Jan 2024): Medusa-1 (frozen backbone, lossless) >2.2x speedup; Medusa-2 (joint training) 2.3x–3.6x. Typical acceptance was later exceeded by EAGLE-family methods; Medusa remains notable as the multi-head baseline.
- **Batch-size dependency** (arXiv:2408.11049 "MagicDec", Aug 2024, v5 Apr 2025): for LLaMA-3.1-8B, speculative-decoding speedup **decreases** with batch size for sequences < ~4,000 tokens but **increases** with batch size for sequences ≥ ~4,000 tokens — the critical/inflexion length S* depends on hardware FLOPS-to-bandwidth ratio and GQA (H100 has lower S* than A100/L40; GQA raises S*).
- **MagicDec headline** (same paper): up to **2.51x speedup for LLaMA-3.1-8B at batch sizes 32–256** on moderate-to-long sequences (Ruler and PG-19 tasks, 8xH100, sparse-KV draft), contradicting the "speculation only helps at batch 1" folk wisdom — but only because long-context decode is still bandwidth-bound.
- **Draft acceptance, 70B, very long context** (MagicDec): self-speculation with Top-K KV sparsification holds ~90% token acceptance over 4,000–100,000-token contexts at batch 1 (LLaMA-3.1-70B draft).
- **EAGLE-3 at large batch** (arXiv:2503.01840): in SGLang on H100 with LLaMA-3.1-8B, EAGLE-3 still gives 1.38x throughput at batch 64, whereas EAGLE-1 *reduces* throughput at batch 24; in vLLM (RTX 3090/A100), EAGLE-1 peaks at batch 24 and EAGLE-3 at batch 56 (Table 5). Gains clearly shrink as batch grows and the GPU becomes compute-bound.
- **vLLM docs** (docs.vllm.ai, fetched 2026-08-27): vLLM warns speculative decoding "does not usually yield inter-token latency reductions for all prompt datasets or sampling parameters" and that observed EAGLE speedups in vLLM are lower than the reference implementation (Issue #9565). vLLM supports draft-model, n-gram/lookahead, MLP speculator, and EAGLE variants; losslessness is validated by greedy-equality tests. No official end-to-end speedup number is published in the docs — treat engine-vendor claims as workload-dependent.
- **N-gram/lookahead**: vLLM ships an n-gram proposer (prompt lookup, e.g. `prompt_lookup_max=4`, 5 speculative tokens) but publishes no acceptance-rate number in docs. Its gain is concentrated in copy/extract workloads where output repeats prompt text (summarization, RAG quoting, code editing); community benchmarks put typical acceptance length near 1–2.5 tokens on general chat and near the full draft length on high-copy tasks (approximate, mid-2026 snapshot — no primary number found).
- **Cold/uncached prefixes and structured output**: no primary paper with a clean number was located by 2026-08-27. Mechanism-level expectation (hedged): n-gram drafting needs prompt content to match; constrained/grammar decoding masks tokens the target must emit, so drafts that violate the mask get rejected wholesale — both reduce effective τ. Treat as "directionally known, not quantified here."

## How it works

Speculation converts serial decoding into batched verification: a cheap drafter proposes k tokens, the target verifies all k in one forward pass, and accepted prefixes advance generation by the acceptance length τ instead of 1. End-to-end speedup ≈ τ divided by (1 + draft overhead), so the numbers above — 2–6.5x — are τ ~4–7.5 with sub-token amortized draft cost. Lossless variants (EAGLE, Medusa-1, speculative sampling) preserve the output distribution by construction.

The batch-size story is a memory-bandwidth story. At batch 1, decode is bandwidth-bound on weights: one forward pass costs the same whether it verifies 1 token or 5, so acceptance converts almost linearly into speedup. As batch grows, the GPU fills compute and verification of large batches becomes compute-bound; speculative gain decays toward (or below) 1. MagicDec's contribution is showing the crossover isn't fixed: for long sequences the KV-cache read dominates, decode stays bandwidth-bound, and speculation can pay off even at batch 256 — with drafts using sparse KV to avoid their own KV bottleneck.

Things that fight the drafter all show up as lower τ: temperature widens the target distribution so drafts miss more (EAGLE-3 temp=1 numbers above); n-gram drafting starves on cold, non-repeating prefixes; structured-output masks reject grammatically invalid drafts wholesale. The published data covers temperature precisely and the rest only mechanistically.

## Harness angle

Don't count speculative speedup in your latency budget for high-temperature or structured-output (JSON-schema) generation paths: budget on un-speculated numbers and treat speculation as upside. When you self-host, enable n-gram/EAGLE-style speculation for the copy-heavy, low-temperature agent steps (extraction, quoting, code edits) and leave it off for creative/high-batch paths; when calling a provider API, assume speculation is already applied server-side and unmeasurable from the client.

## Sources

- https://arxiv.org/abs/2503.01840
- https://arxiv.org/abs/2408.11049
- https://arxiv.org/abs/2401.10774
- https://arxiv.org/abs/2401.15077
- https://arxiv.org/abs/2406.16858
- https://docs.vllm.ai/en/latest/features/spec_decode.html
- https://github.com/SafeAILab/EAGLE
