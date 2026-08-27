# Context Parallelism and Long-Context Serving (1M–10M tokens)

researched: 2026-08-27 · researcher: glm-5.3-flash

## Key facts

- Ring Attention (Liu, Zaharia, Abbeel, UC Berkeley, arXiv:2310.01889, Oct 2023) enables training/inference on sequences up to *number of devices* times longer than single-device blockwise parallel transformers (BPT), without approximating attention — it is exact. (arXiv:2310.01889, retrieved 2026-08-27)
- "Context Parallelism for Scalable Million-Token Inference" (arXiv:2411.01783, MLSys 2025): 1M-token context prefill with Llama 3 405B on 128 H100 GPUs across 16 nodes completes in 77 seconds at 93% parallelization efficiency and 63% FLOPS utilization; 128K-token prefill in 3.8 s. Two lossless ring-attention variants: pass-KV and pass-Q. (arXiv:2411.01783, retrieved 2026-08-27)
- The same MLSys 2025 paper states the scaling asymmetry plainly: dense transformer FLOPs are ~2·W per token for weight matmuls, but attention adds cost *quadratic in context length*, dominating long prefill; decode instead reads the KV cache linearly per generated token. (MLSys 2025 paper, retrieved 2026-08-27)
- Megatron-LM Context Parallelism (CP): partitions network inputs and *all* activations along the sequence dimension; only attention needs modification because its query must attend to keys/values on all ranks. NVIDIA's guide positions CP for "long sequences (8K+ tokens)". Dynamic-CP (NVIDIA blog) selects CP size per packed microbatch to fix imbalance on variable-length sequences. (NVIDIA Megatron docs & blog, retrieved 2026-08-27)
- USP (Unified Sequence Parallelism, arXiv:2405.07719) unifies DeepSpeed-Ulysses (all-to-all KV head scatter) and Ring Attention (send/recv KV chunks), picking the cheaper communication pattern per layer/topology; released as the `long-context-attention` library used by DeepSpeed and HF for long-context training and inference. (arXiv:2405.07719, GitHub feifeibear/long-context-attention, retrieved 2026-08-27)
- Mooncake (Moonshot AI, FAST '25 + arXiv:2407.00079) is Kimi's serving platform: a KVCache-centric disaggregated architecture separating prefill and decode clusters, with a global KV cache pool built from cluster CPU/DRAM/SSD/NIC resources. Under real workloads it let Kimi handle **75% more requests** within latency SLOs; scheduler uses global cache replication and prediction-based early rejection under overload; FastSearch reuses cached prefixes. Mooncake also powered the Kimi K2 deployment (project update dated Jul 20, 2025). (FAST '25 paper; kvcache-ai/Mooncake GitHub, retrieved 2026-08-27)
- Meta Llama 4 Scout (Apr 2025): 17B active parameters, 16 experts, ~109B total; advertised **10M-token context window**; fits on a single NVIDIA H100. Meta's blog attributes long-context capability to "mid-training" with long sequences plus **iRoPE** (interleaved RoPE: alternating layers with and without positional encoding, plus attention temperature scaling by sequence length). (ai.meta.com Llama 4 blog; HF transformers docs; meta-llama model card, retrieved 2026-08-27)
- Independent checks on Llama 4 Scout's claimed window are sobering: third-party Fiction.LiveBench testing reports ~15.6% accuracy at 128K tokens, well below frontier peers, with recall collapsing past ~1M tokens (blog-grade evidence, hedge accordingly). (TokenMix blog, 2026, retrieved 2026-08-27)
- vLLM supports >128K-token serving via RoPE-scaling/YaRN context extension (`--hf-overrides` with `rope_parameters`; the old `--rope-scaling` flag is removed), bucketed scheduling for long contexts (`VLLM_BUCKETING_STRATEGY=exp` on Gaudi), and day-0 recipes for million-token models (e.g., MiniMax M3 with sparse attention, June 2026 vLLM blog). (docs.vllm.ai; vllm-project blog 2026-06-12, retrieved 2026-08-27)

## How it works

Long context breaks serving in two different places. During **prefill**, every new token attends to every other token, so attention FLOPs grow ~quadratically with sequence length: doubling context from 128K to 256K roughly quadruples attention work (a 2·W-per-token dense baseline is swamped by attention beyond a few hundred K tokens — MLSys 2025). During **decode**, each generated token only computes one query row, so cost is linear in context length — but it must *read* the entire KV cache for that request, so decode is memory-bandwidth-bound and the KV cache itself can exceed model weights at 1M+ tokens.

**Context/sequence parallelism** splits the sequence dimension across GPUs instead of (or in addition to) the batch or hidden dimensions. Non-attention layers need no change (no inter-token ops). Attention is the problem, and the two main solutions differ in what they move:

- **Ring Attention**: each GPU holds one block of queries; KV blocks circulate around a ring via send/recv overlapped with blockwise matmuls. After N−1 hops every query block has seen every KV block. Exact attention, communication overlappable with compute; inefficient when the number of attention heads is small.
- **DeepSpeed-Ulysses**: all-to-all scatters KV by attention head, so each GPU computes full attention for a few heads; efficient when heads are plentiful. **USP** picks per layer, and hybrid (2D) forms combine both. Megatron CP implements ring-style attention (all-gather / pass-KV variants) inside its parallelism stack.

**Data-parallel attention** (as in the Million-Token Inference paper's naming) replicates KV across ranks while sharding queries — pass-Q vs pass-KV ring variants trade which tensor circulates, covering cases the other handles poorly (pass-KV favors long prefill; pass-Q favors the small-batch decode regime).

**Worked example** (numbers from arXiv:2411.01783, retrieved 2026-08-27): Llama 3 405B, 1M-token prompt, 128 H100s across 16 nodes with pass-KV ring attention → prefill finishes in 77 s at 93% parallelization efficiency and 63% FLOPS utilization. The same machinery does 128K tokens in 3.8 s. On the serving side, Mooncake avoids recomputing that quadratic prefill at all when a prefix is shared: cached KV (DRAM/SSD pool) is transferred to the prefill node, trading storage for compute — yielding the measured 75% more in-SLO requests at Kimi. Meta's Scout attacks the *architectural* side instead: chunked (noam-style, i.e. non-interleaved-local + global-noPE) attention layers plus iRoPE temperature scaling make 10M-token windows trainable, though verified recall at that range remains contested (independent tests show strong degradation well below the claimed window).

## Harness angle

If your agent harness stuffs a 1M-token transcript into the context, you are buying quadratic prefill (tens of seconds to minutes on a 100+-GPU cluster per the MLSys 2025 numbers) and a per-token linear KV read at decode. Concrete decision: **cache and reuse prefixes** (structure agent prompts so shared system/tool history is a stable prefix, served by a KV-cache-centric system like Mooncake or vLLM prefix caching) and budget context — treat advertised windows (e.g. Llama 4 Scout's 10M) as ceilings, not usable recall, and validate with RULER-style probes before routing long-context tasks to a model.

## Sources

- https://arxiv.org/abs/2310.01889 — Ring Attention (Liu et al., Oct 2023)
- https://arxiv.org/abs/2411.01783 — Context Parallelism for Scalable Million-Token Inference (MLSys 2025; 77 s / 1M / 405B / 128 H100)
- https://arxiv.org/abs/2405.07719 — USP: Unified Sequence Parallelism
- https://github.com/NVIDIA/Megatron-LM/blob/main/docs/user-guide/features/context_parallel.md — Megatron CP docs
- https://developer.nvidia.com/blog/speeding-up-variable-length-training-with-dynamic-context-parallelism-and-nvidia-megatron-core/ — Dynamic-CP
- https://www.usenix.org/system/files/fast25-qin.pdf — Mooncake (FAST '25)
- https://github.com/kvcache-ai/Mooncake — Mooncake repo (75% more requests; K2 deployment Jul 2025)
- https://ai.meta.com/blog/llama-4-multimodal-intelligence/ — Llama 4 Scout 10M context, iRoPE
- https://docs.vllm.ai/en/stable/features/context_extension/ — vLLM context extension
- https://tokenmix.ai/blog/llama-4-scout-10m-context-reality-check-2026 — independent Scout recall check (secondary/blog, hedged)
