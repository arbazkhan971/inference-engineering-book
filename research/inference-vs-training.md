# Why inference is not just training run backwards

researched: 2026-08-27 · researcher: glm-5.3-flash

## Key facts

- Training runs at a stable ~40–46% Model FLOPs Utilization at scale: PaLM 540B trained on 6144 TPU v4 chips reached 46.2% model FLOPs utilization and 57.8% hardware FLOPs utilization (Chowdhery et al., *PaLM*, arXiv:2204.02311, Apr 2022); Llama 3 training reported BF16 MFU of 43% on 8K GPUs (DP=64) dropping to 41% on 16K GPUs (DP=128) (Meta, *The Llama 3 Herd of Models*, arXiv:2407.21783, Jul 2024).
- Serving sits far from that ceiling: Google's inference-efficiency study built its analysis around a latency-versus-MFU Pareto frontier for 500B+ parameter models and reported a low-batch-size latency of 29 ms per token during generation on TPU v4 (Pope et al., *Efficiently Scaling Transformer Inference*, arXiv:2211.05102, Nov 2022).
- The decode phase "generates output tokens autoregressively and is memory-bound" — "the speed at which the data (the model weights) is transferred to the GPU from memory dominates the latency" (NVIDIA, *Mastering LLM Techniques: Inference Optimization* blog, 2023, fetched 2026-08-27).
- NVIDIA lists 3.35 TB/s of HBM3 memory bandwidth for the H100 SXM GPU (NVIDIA H100 product page, fetched 2026-08-27).
- Batching is the serving-side correction: vLLM's PagedAttention improved serving throughput of popular LLMs "by 2-4×" at the same latency versus state-of-the-art systems (FasterTransformer, Orca) by achieving near-zero waste in KV cache memory (Kwon et al., arXiv:2309.06180, Sep 2023).
- Prefill and decode have different bottlenecks: colocating them causes "strong prefill-decoding interference" and couples the resource plans, so latency-critical deployments must prioritize one SLO or overprovision (Zhong et al., *DistServe*, arXiv:2401.09670, Jan 2024). LLM applications emphasize TTFT for prefill and TPOT for decode as separate SLOs (same paper).
- Derived arithmetic from the two dated sources above: the 8B-parameter Llama 3 (Meta, 2024) ships ~16 GB of weights in bf16 (2 bytes/param); a batch-1 decode step must stream them through 3.35 TB/s, so the per-step floor is ≈4.8 ms/token (16 GB / 3.35 TB/s) and the single-stream ceiling ≈208 tokens/s per GPU. Bandwidth, not FLOPs, sets that number.

## How it works

Training and serving share a model but not a workload shape. Training walks a fixed dataset in enormous, schedule-stable batches: every step does the same amount of math, so utilization is a matter of keeping the feed full, and teams report efficiency in MFU — 46.2% (PaLM) and 41–43% (Llama 3) count as excellent. Memory holds weights plus gradients plus optimizer state; the KV cache appears only transiently, inside one forward/backward pass, and dies with the step.

Serving flips every one of those properties. Requests arrive stochastically, each with its own context length and output plan. During decode the batch emits one token per stream per step: the arithmetic per step grows only with batch size, but the memory traffic starts at one full pass over the weights, plus the per-request KV cache, which grows token by token for as long as the request lives. PagedAttention exists precisely because that cache fragments HBM and throttles batch size (arXiv:2309.06180). At batch 1 the arithmetic intensity is roughly two FLOPs per byte of weight traffic, while an accelerator reaches peak FLOPs only at peak-FLOPS ÷ bandwidth — a ratio computable from any GPU datasheet and roughly two orders of magnitude higher. That gap is why decode is memory-bound (NVIDIA, 2023), why Pope et al. measured a 29 ms/token regime at low batch, and why vLLM's 2–4× win came from packing more streams into each weight pass. Prefill is the opposite regime: it runs the prompt tokens in parallel and is compute-bound — the interference when the two share a GPU is what motivated DistServe to disaggregate them. A training cluster is not a serving cluster: one optimizes steady throughput, the other plans memory bandwidth, KV capacity, and arrival-rate SLOs.

## Harness angle

Plan inference capacity in bytes-per-second, not FLOPs. When sizing self-hosted serving, divide weights (plus the KV budget) by memory bandwidth to get the single-stream token floor, then decide how much TPOT degradation you will accept from batching to reach target throughput — that tradeoff, not the model's training-time efficiency, is what your users feel. On provider APIs the same lever appears as an explicit choice: interactive calls pay the standard per-token price for low TTFT/TPOT, while batch-style endpoints sell the same tokens at roughly half price when latency tolerance allows (Anthropic's pricing page lists a second table with Sonnet 5 at $1/$5 per 1M tokens versus the standard $2/$10, fetched 2026-08-27). A harness that can defer non-urgent work converts latency tolerance directly into throughput and money.

## Sources

- https://arxiv.org/abs/2204.02311 — PaLM 540B: 6144 TPU v4, 46.2% MFU
- https://arxiv.org/abs/2407.21783 — Llama 3: BF16 MFU 41–43%, 405B dense
- https://arxiv.org/abs/2211.05102 — inference latency/MFU Pareto; 29 ms/token low batch
- https://arxiv.org/abs/2309.06180 — PagedAttention: 2–4× throughput, near-zero KV waste
- https://arxiv.org/abs/2401.09670 — DistServe: TTFT/TPOT SLOs, prefill-decode interference
- https://developer.nvidia.com/blog/mastering-llm-techniques-inference-optimization/ — decode is memory-bound
- https://www.nvidia.com/en-us/data-center/h100/ — H100 SXM HBM3 3.35 TB/s
- https://huggingface.co/NousResearch/Meta-Llama-3-8B/raw/main/config.json — Llama 3 8B config (vocab 128,256)
- https://docs.claude.com/en/docs/about-claude/pricing — standard vs second-table Sonnet 5 pricing
- https://arxiv.org/abs/2005.14165 — GPT-3: autoregressive 175B lineage
