# Batch Size vs Throughput and Latency: The Measured Tradeoff Curve
researched: 2026-08-27 · researcher: glm-5.3-flash

## Key facts

- **Orca (iteration-level scheduling) reported up to 36.9× throughput improvement over NVIDIA FasterTransformer at the same latency level** for GPT-3 175B serving (Orca, OSDI '22, 2022). This is the canonical demonstration that batching granularity, not raw hardware, dominates serving efficiency.
- **vLLM (PagedAttention) improved throughput of popular LLMs by 2–4× at the same latency** versus FasterTransformer and Orca, by eliminating KV-cache fragmentation so more sequences fit per batch (arXiv:2309.06180, SOSP 2023, 2023).
- **TensorRT-LLM tuning case study (Llama-3.3-70B, 4× H100, docs fetched 2026-08-27):** sweeping `max_batch_size` 64 → 512 → 2048 gave token throughput 1944 → 2467 → 2044 tok/s, with average inter-token latency essentially flat (14.65 / 14.66 / 14.45 ms). Batch size 512 was the sweet spot: ~+20% throughput over 64 and over 2048 (derived: 2466.79/2044.26 ≈ 1.21) with no latency penalty.
- **The same case study's default (untuned) baseline: 1564 tok/s, 31.3 ms average inter-token latency.** After build flags plus tuning max batch size and max num tokens: 2474 tok/s and 14.7 ms ITL — a 58.2% throughput gain and 53.1% ITL reduction versus baseline (NVIDIA TensorRT-LLM tuning guide, fetched 2026-08-27). Note the baseline's high ITL at 2048 max batch size shows oversize batches *can* hurt per-token latency; the tuned config fixed it.
- **TensorRT-LLM default `max_batch_size` is 2048 and default `max_num_tokens` is 8192**; NVIDIA recommends sweeping powers of 2 and grid-searching both together (docs, fetched 2026-08-27).
- **vLLM's `--max-num-seqs` caps concurrently decoding requests; excess requests queue.** Red Hat's tuning guide (2026) states it "keeps throughput near optimal levels for most requests, though it increases TTFT and end-to-end latency for the queued requests" — the direct statement of the throughput/latency tradeoff knob.
- **vLLM preemption link between batch size and latency:** when KV cache is insufficient for the in-flight batch, vLLM preempts requests and recomputes them later, which "can adversely affect end-to-end performance"; the documented fixes include *decreasing* `max_num_seqs` or `max_num_batched_tokens` (vLLM docs, fetched 2026-08-27). Bigger batch ⇒ more KV-cache pressure ⇒ preemption ⇒ latency spikes for the preempted requests.
- **Chunked prefill default in vLLM V1:** decode is memory-bound and prefill is compute-bound; the scheduler prioritizes decodes and `max_num_batched_tokens` smaller (e.g. 2048) improves inter-token latency while larger values improve TTFT and throughput (>8192 recommended for small models on large GPUs) (vLLM docs, fetched 2026-08-27). This is a tunable point on the same throughput-vs-ITL curve.
- **Concurrency saturation behavior (engine-independent):** as request concurrency rises, throughput rises, then plateaus, while latency degrades — "a natural result of GPU saturation and scheduling contention" (Red Hat Developer, 2026-03-03). The recommended practice is to set `max-num-seqs` at the measured plateau point.
- **Diminishing returns mechanism:** single-sequence decode is memory-bandwidth-bound (weights read once per token regardless of batch size), so tokens/sec/GPU climbs steeply with batch until weight-loading cost is amortized; once total tokens per forward pass saturate compute (FLOPs/s), throughput flattens and each added sequence raises time-per-token for everyone. No single public number pins this crossover — it is model/hardware-specific (mechanism per Orca §discussion and roofline reasoning; treat any specific crossover batch size as workload-dependent).
- **Why a lone request is expensive:** with batch size 1, the GPU reads all model weights from HBM to produce one token; tokens/sec is bounded by weight bytes ÷ bandwidth (derived arithmetic-intensity argument, not a measured figure). Sharing the engine spreads that same weight read over N sequences — near-free throughput for the batch, but each sequence's decode step now also attends to N-1 neighbors' compute.

## How it works

Decode for a single sequence is one token per forward pass. Each forward pass must stream the entire model weight matrix through the GPU's memory system, so a batch-of-one is limited by memory bandwidth, not by the GPU's arithmetic units — the math units mostly idle. When the engine batches N sequences into the same forward pass, the weights are read once and used N times: total tokens/sec climbs almost linearly at first, because the extra sequences consume idle compute rather than extra bandwidth. That is why throughput-per-GPU improves dramatically with batching while the marginal cost per additional sequence stays near zero at first.

But the per-request experience changes in the other direction. Each decode step now computes tokens for all N sequences together; if the step takes even slightly longer (larger GEMMs, longer effective kernels, more KV cache traffic), every request's time-per-output-token (TPOT) rises by that same factor. So the curve is: aggregate tokens/sec up, per-request tokens/sec slowly down. Past the point where the added tokens saturate the GPU's compute (or KV-cache capacity forces preemption/eviction), throughput plateaus or falls while TPOT keeps degrading — the knee of the curve that tuning guides tell you to find empirically.

The engine knobs sit exactly on this curve. vLLM's `max_num_seqs` caps the running batch (excess requests queue, trading their TTFT for stable throughput); `max_num_batched_tokens` bounds tokens per iteration (with chunked prefill, smaller values protect decode ITL, larger values favor prefill throughput and TTFT). TensorRT-LLM's `max_batch_size` and `max_num_tokens` jointly gate its in-flight scheduler, with the same shape: too small starves throughput, too large invites KV-cache pressure and latency regression. TGI exposes the analogous `--max-batch-size` for its continuous batching router. Static batching sits at the worst point of the curve: the batch runs until its *longest* member finishes, so short requests are held hostage; Orca's 36.9× result is mostly the elimination of that straggler waste, and continuous/dynamic batching keeps the engine near the throughput knee while bounding added TPOT.

## Harness angle

Because every extra concurrent request slightly taxes TPOT for all requests in the batch, a harness builder cannot treat provider "tokens/sec" specs as independent per-stream: firing 20 parallel agent sub-calls against one deployment pushes the engine up the latency curve even though total throughput looks fine. Measure your own knee (concurrency sweep with GuideLLM or equivalent), encode the plateau concurrency into the harness's client-side concurrency limit, and set client-side stream timeouts against the *degraded* TPOT at that concurrency, not single-request TPOT.

## Sources

- https://arxiv.org/abs/2309.06180
- https://www.usenix.org/conference/osdi22/presentation/yu
- https://docs.vllm.ai/en/latest/configuration/optimization/
- https://nvidia.github.io/TensorRT-LLM/performance/performance-tuning-guide/tuning-max-batch-size-and-max-num-tokens.html
- https://nvidia.github.io/TensorRT-LLM/performance/performance-tuning-guide/useful-runtime-flags.html
- https://developers.redhat.com/articles/2026/03/03/practical-strategies-vllm-performance-tuning
- https://huggingface.co/docs/text-generation-inference/en/architecture
