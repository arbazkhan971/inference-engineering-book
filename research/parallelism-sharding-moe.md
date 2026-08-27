# One model, many chips: the five sharding axes and why MoE can beat dense on speed
researched: 2026-08-27 · researcher: glm-5.3-flash

## Key facts
- DeepSeek-V3 is a MoE with 671B total parameters but only 37B activated per token (DeepSeek-V3 Technical Report, arXiv:2412.19437, 2024, fetched 2026-08-27).
- Mixtral 8x7B has 46.7B total parameters, ~12.9B active per token; each layer routes every token to top-2 of 8 experts (Mixtral of Experts, arXiv:2401.04088, 2024, fetched 2026-08-27).
- Mistral reports Mixtral 8x7B matches or beats Llama 2 70B on most benchmarks with ~6x faster inference (Mistral AI announcement, fetched 2026-08-27).
- DeepSeek-V3 uses 256 routed experts per MoE layer plus 1 shared expert, with 8 routed experts activated per token, plus a shared expert — Multi-head Latent Attention and DeepSeekMoE architecture (arXiv:2412.19437, 2024, fetched 2026-08-27).
- Megatron Core classifies four dense-model axes by what they split: Data Parallelism splits the batch, Tensor Parallelism (TP) splits individual layers' weights, Pipeline Parallelism (PP) splits model depth, Context Parallelism (CP) splits the sequence (NVIDIA Megatron Core docs, fetched 2026-08-27).
- Megatron guidance: for large MoE models, TP can often stay at 1–2 because only the active shard matters; Expert Parallelism (EP) is the primary scaling dimension, with PP=8–16 across nodes typical; expert tensor parallelism is rarely used (NVIDIA Megatron Bridge parallelism-strategy skill, fetched 2026-08-27).
- DeepEP is DeepSeek's open library of expert-parallel all-to-all GPU kernels (MoE dispatch/combine) with FP8 support and low SM occupation (github.com/deepseek-ai/DeepEP, fetched 2026-08-27).
- DeepSeek's DualPipe is a bidirectional pipeline algorithm that overlaps forward/backward compute with communication and shrinks pipeline bubbles (github.com/deepseek-ai/dualpipe, fetched 2026-08-27).
- Megatron-LM's context parallelism implements sequence sharding with all-gather/reduce-scatter pairs around attention and TP all-reduces around the other blocks (NVIDIA/Megatron-LM context_parallel.md, fetched 2026-08-27).

## How it works
**Tensor parallelism (TP).** Cut each layer's weight matrices into `t` column/row slices, one per GPU. Attention splits naturally by head: each GPU holds a subset of heads and its slice of the projection weights. Each layer needs two collective ops per forward pass (all-reduce in the plain MLP formulation; all-gather + reduce-scatter in the sequence-parallel variant) so the partial results are summed. Because those collectives fire on every layer and every token, TP lives or dies by interconnect: it is sized to stay within one node on NVLink and becomes expensive across nodes where it rides the network.

**Pipeline parallelism (PP).** Split layers into `p` contiguous stages, one per GPU or node group. Requests flow stage to stage; the whole GPU count only pays off when many microbatches are in flight, because a lone request leaves most stages idle ("bubble"). Interleaved (virtual) stages and bidirectional schedules like DualPipe cut that bubble by overlapping compute in one stage with communication in another.

**Data parallelism (DP).** Replicate the whole sharded model `d` times; each replica takes a different slice of the batch. For inference this is the cheap axis — no per-layer communication at all — so you scale it once memory and per-replica latency are acceptable.

**Context parallelism (CP).** Shard the long sequence itself across GPUs; each rank holds a slice of the tokens. Attention needs cross-rank key/value exchange, implemented as all-gather / reduce-scatter pairs around the attention block. This is the axis for very long contexts where KV cache size, not weight size, is the bottleneck.

**Expert parallelism (EP, MoE).** The router picks a small set of experts per token; EP spreads the many expert FFN blocks across GPUs and shuffles hidden states to wherever the chosen experts live, using all-to-all dispatch before the experts and all-to-all combine after. DeepEP provides exactly those two kernels.

**Why MoE can be faster per token than a smaller dense model.** Decode time is dominated by streaming weights from HBM: per token you read roughly (active params × bytes/param). MoE cuts active params while keeping total capacity: DeepSeek-V3 activates 37B of 671B (arXiv:2412.19437, 2024), Mixtral activates ~13B of ~47B (arXiv:2401.04088, 2024). Worked memory comparison at BF16 (2 bytes/param): a 70B dense model streams ~140 GB per token; DeepSeek-V3 streams ~74 GB per token despite ~10x the total capacity — fewer active bytes read, so higher arithmetic intensity relative to memory traffic. The price: ALL experts must sit resident in memory, so MoE trades bandwidth savings for capacity and for all-to-all communication cost. Poor routing balance concentrates tokens on a few GPUs and destroys throughput, which is why DeepSeek-V3 uses an auxiliary-loss-free balancing strategy (arXiv:2412.19437, 2024).

**The shared vocabulary:** a deployment is TP=t × PP=p × EP=e × CP=c × DP=d across t×p×e×c×d GPUs. Capacity per shard = total bytes / (t·p·e). Communication grows with t (per layer), p (per stage boundary), c (per attention block), e (all-to-all); only DP adds capacity without collective traffic.

## Harness angle
Don't treat "671B parameters" as a proxy for cost or latency — a huge MoE with low active parameters can have lower per-token latency than a mid-size dense model, so model selection in the harness should compare on measured TTFT/TPOT and price, not total parameter count. Second, EP means a MoE provider is throughput-fragile under routing imbalance: harness retries and client-side load spreading should target the provider's MoE fleet behavior, and self-hosters should size EP ranks (with kernels like DeepEP) before assuming more GPUs linearly raises tokens/s.

## Sources
- DeepSeek-V3 Technical Report — https://arxiv.org/abs/2412.19437 (671B/37B, 256 routed + shared experts, auxiliary-loss-free balancing)
- Mixtral of Experts — https://arxiv.org/abs/2401.04088 (46.7B total / ~12.9B active, top-2 of 8)
- Mistral AI: Mixtral of Experts announcement — https://mistral.ai/news/mixtral-of-experts/ (6x faster inference vs Llama 2 70B claim)
- NVIDIA Megatron Core Parallelism Strategies Guide — https://docs.nvidia.com/megatron-core/developer-guide/latest/user-guide/parallelism-guide.html (DP/TP/PP/CP definitions)
- Megatron Bridge parallelism strategy selection — https://docs.nvidia.com/nemo/megatron-bridge/nightly/skills/perf-parallelism-strategies/SKILL.html (MoE: EP primary, TP 1–2, PP 8–16)
- Megatron-LM context parallelism docs — https://github.com/NVIDIA/Megatron-LM/blob/main/docs/user-guide/features/context_parallel.md (AG/RS communication pattern)
- DeepEP — https://github.com/deepseek-ai/DeepEP (EP all-to-all dispatch/combine kernels, FP8)
- DualPipe — https://github.com/deepseek-ai/dualpipe (bidirectional PP compute-communication overlap)
- HF Transformers Mixtral docs — https://huggingface.co/docs/transformers/en/model_doc/mixtral (45B total / 14B-compute framing)
