# MoE Routing and Serving Mechanics: Routers, Expert Capacity, Expert Parallelism, and Batching Economics

researched: 2026-08-27 · researcher: glm-5.3-flash

## Key facts

- DeepSeek-V3 (and R1, same base): 671B total parameters, 37B activated per token (arXiv:2412.19437, 2024). Every MoE layer except the first three has 1 shared expert plus 256 routed experts; 8 routed experts are activated per token; each expert's intermediate hidden dimension is 2048 ("fine-grained segmentation" — many small experts instead of few big ones) (arXiv:2412.19437v2, §4.2, fetched 2026-08-27).
- DeepSeek-V3 routing scores use sigmoid affinities normalized over the top-K set, and node-limited routing sends each token to at most M = 4 nodes; during training, routed experts of each layer were spread over 64 GPUs in 8 nodes (arXiv:2412.19437v2, §4.2, fetched 2026-08-27). Derived: with ~3.2 experts reachable per node, the same communication budget would allow up to ~13 active experts (4 × 3.2) — the paper's own arithmetic (§3.2.2).
- DeepSeek-V3 load balancing is auxiliary-loss-free: a per-expert bias term is added only to routing scores (not gating values) and nudged each step by bias-update speed γ = 0.001 for the first 14.3T tokens, then 0.0 for the last 500B; a tiny sequence-wise balance loss (α = 0.0001) prevents per-sequence collapse (arXiv:2412.19437v2, §2.1.2 and §4.2, fetched 2026-08-27).
- Mixtral 8x7B: 8 experts per layer, router picks top-2 per token; 47B total, 13B active parameters; trained with 32k context (arXiv:2401.04088, 2024).
- gpt-oss-120b: 128 experts per MoE block, top-4 selected per token; 117B total parameters with 5.1B active; gpt-oss-20b has 32 experts, also top-4, with 21B total and 3.6B active (arXiv:2508.10925 model card, 2025; HF model card, fetched 2026-08-27).
- gpt-oss-120b ships post-trained with MXFP4 quantization of the MoE weights so the whole 117B-parameter model fits a single 80GB GPU (H100/MI300X); gpt-oss-20b fits in 16GB (OpenAI/HF model card, 2025, fetched 2026-08-27).
- Expert capacity = (tokens per batch / number of experts) × top-k × capacity factor; tokens routed to a full expert are dropped (residual path only). This mechanism and the capacity-factor knob come from GShard/Switch Transformer (arXiv:2006.16668, 2020; arXiv:2101.03961, 2021); the Switch paper reports its experiments with capacity factors around 1.0–1.25 and treats dropped tokens as an acceptable trade-off (arXiv:2101.03961, 2021).
- DeepSeek-V3 decouples prefill and decode deployments at inference: prefill uses 4-node, 32-GPU EP with redundant experts to mitigate load imbalance (the paper reports ~40 experts/GPU, 32 redundant), decode uses 40 nodes / 160 GPUs; with small expert batch sizes during decode, most DeepSeek-V3 GPU cores idle, so it confines computation to 20 SMs per GPU and overlaps communication with math using 10 communication kernels + 10 computation kernels via warp specialization (arXiv:2412.19437v2 §3.4, fetched 2026-08-27).
- Batching economics, derived: DeepSeek-V3 touches ~37/671 ≈ 5.5% of its parameters per token (derived from arXiv:2412.19437); gpt-oss-120b touches ~5.1/117 ≈ 4.4% (derived from arXiv:2508.10925). Memory cost scales with total parameters; FLOPs per token scale with active parameters.

## How it works

At each MoE layer a small router (a linear projection plus a nonlinearity) scores every token against every routed expert, takes the top-k scores, normalizes them into gating weights, and dispatches the token's hidden state to only those k experts. The FFN output is the weighted sum of expert outputs plus (in DeepSeek-style models) the always-on shared expert, added to the residual stream. Sparse activation is why an enormous model can have modest per-token compute: DeepSeek-V3 runs 8 of 256 experts per layer; Mixtral runs 2 of 8; gpt-oss runs 4 of 128 (or 4 of 32).

Load imbalance is the failure mode. If routing collapses onto a few hot experts, EP replicas of those experts become stragglers and the all-to-all sync waits on them. Training-side fixes include auxiliary balance losses (GShard, Switch, Mixtral) and DeepSeek's bias-nudge scheme; serving-side fixes are capacity limits (drop tokens past capacity), redundant hot experts (DeepSeek-V3 prefill), and larger batches so per-expert token counts average out. Dropped tokens are the tax: the token still passes through the layer via its residual connection but loses that expert's computation, silently degrading quality when capacity is tight.

Under expert parallelism, experts are sharded across GPUs/nodes. Each MoE layer's forward becomes: (1) compute router decisions locally; (2) all-to-all dispatch, sending each token (in practice its hidden state, potentially in a compressed form) to the GPUs owning its chosen experts; (3) grouped GEMM — one batched matrix multiply per expert over all tokens that landed on it, which is far more efficient than looping or padding; (4) all-to-all combine back, multiplying each expert output by its gating value and summing. The two all-to-all exchanges dominate the communication cost, which is why DeepSeek-V3 caps tokens at 4 nodes and overlaps IB and NVLink transfers with only 20 SMs dedicated to communication (arXiv:2412.19437v2 §3.2.2, §3.4).

For serving, this splits the economics. Decode is memory-bandwidth-bound, and the per-token working set is only the active experts' weights plus KV cache — so a 671B MoE can decode at speeds closer to a 37B dense model, and a gpt-oss-120b (5.1B active) can decode fast on one GPU, while outperforming much smaller dense models on quality. But you must hold all experts in memory (or re-shard them), so capacity per instance is spent on parameters almost every request's tokens rarely touch, and aggregate throughput depends on batching enough requests to keep all experts busy without tipping into imbalance or capacity-driven drops.

## Harness angle

When choosing a self-hosted engine for an agent harness, "total vs active parameters" should drive the sizing decision: budget VRAM for total parameters (e.g., gpt-oss-120b's 117B in MXFP4 on one 80GB GPU), but budget tokens/sec on active parameters — and prefer engines with explicit EP modes (vLLM/SGLang DeepSeek-style EP, DeepEP-based dispatch) when batching many concurrent agent sessions, because per-session decode speed comes from sparsity while per-node cost effectiveness comes from keeping every expert fed across the fleet.

## Sources

- https://arxiv.org/abs/2412.19437
- https://arxiv.org/html/2412.19437v2
- https://arxiv.org/abs/2401.04088
- https://arxiv.org/abs/2508.10925
- https://huggingface.co/openai/gpt-oss-120b
- https://arxiv.org/abs/2006.16668
- https://arxiv.org/abs/2101.03961
- https://docs.vllm.ai/en/latest/features/expert_parallelism.html
