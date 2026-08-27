# Continuous batching: why serving engines admit and retire requests every decode step
researched: 2026-08-27 · researcher: glm-5.3-flash
## Key facts
- ORCA (OSDI 2022) introduced iteration-level scheduling — "up to 36.9x" throughput improvement over NVIDIA FasterTransformer at the same latency level, evaluated on GPT-3 175B (ORCA paper, OSDI 2022, fetched 2026-08-27).
- TensorRT-LLM calls the same technique "in-flight batching (IFB), also known as continuous batching or iteration-level batching," letting context-phase (prefill) sequences run together with generation-phase (decode) sequences (TensorRT-LLM docs, fetched 2026-08-27).
- vLLM's scheduler is bounded by two flags: `max_num_seqs` (max concurrent sequences) and `max_num_batched_tokens` (max tokens — prefill chunks plus decode steps — per engine iteration); when KV cache runs out, the docs advise decreasing `max_num_seqs` or `max_num_batched_tokens` to shrink the running batch (vLLM docs, "Optimization and Tuning", fetched 2026-08-27).
- In vLLM V1, chunked prefill is on by default: the scheduler prioritizes all pending decode requests first, then spends leftover `max_num_batched_tokens` budget on prefill chunks (vLLM docs, fetched 2026-08-27).
- TensorRT-LLM exposes `max_num_tokens` and `max_batch_size`, plus a prototype `batch_wait_max_tokens_ratio`: if > 0, the scheduler accumulates requests locally until total tokens reach `batch_wait_max_tokens_ratio * max_num_tokens`, trading a little queueing latency for better GPU utilization (TensorRT-LLM API reference & tuning guide, fetched 2026-08-27).
- The vLLM launch blog claims "up to 24x" higher throughput than HuggingFace TGI at high concurrency, attributed to PagedAttention (continuous batching is a prerequisite that makes such concurrency tractable) (vLLM blog, 2023-06-20).
- With static batching, sequences finish at different times, so a batch's GPU time is bounded by its longest member; ORCA's evaluation shows large fractions of iterations executing on padded/finished slots (ORCA paper, OSDI 2022).

## How it works
- **Static batching** forms a batch of N requests, pads them to the longest sequence, and runs until every request emits its full output. GPU compute is proportional to `N × max_length`, so if one request wants 900 tokens and the rest want 100, roughly 80% of the batch's work is padding or idling. A batch slot frees only when its slowest member finishes.
- **Dynamic batching** (a Triton Inference Server-style term) improves admission only: requests queue, and the server launches a batch when either the queue fills `max_batch_size` requests or a timeout elapses. Once launched, the batch is still static internally — ragged-sequence waste remains, and short requests still wait for the longest.
- **Continuous (iteration-level) batching** re-plans the batch every model iteration. After each decode step: (1) requests that just emitted EOS are retired immediately and their KV cache freed; (2) queued requests are admitted into the freed slots. The batch composition changes step by step, so no slot idles waiting for a straggler. ORCA adds *selective batching* — some ops (attention, which has per-sequence KV state) run per-sequence while others (linear layers) run batched — because naive batching at iteration granularity is awkward with differing KV lengths.
- The scheduler has a token budget `max_num_batched_tokens` per iteration. Worked example: budget = 8192, 64 running sequences each decode one token per step → decode consumes 64 tokens, leaving 8128 for chunked prefill, so one 4,000-token prompt can be admitted across two iterations without stalling decodes (constants illustrative; the budget mechanism is per vLLM docs, fetched 2026-08-27).
- **Why overload raises TPOT**: as queue depth grows, the scheduler packs more sequences and/or larger prefill chunks into each iteration. Each iteration therefore takes longer (more FLOPs and more KV cache reads per step), and since decode emits exactly one token per iteration, tokens/sec/request ≈ 1/iteration_time. Bigger batches → higher aggregate throughput but higher per-request TPOT. Chunked prefill makes this explicit: a prefill chunk sharing an iteration with decodes stretches that iteration's wall time.
- Tail latency: continuous batching removes the straggler-lockstep effect (short requests no longer wait for the longest member of a static batch), so p50/p99 inter-token latency drops at moderate load — until the saturation regime, where queueing dominates and all percentiles climb.

## Harness angle
- Your harness's client-side timeout and retry budget should key off TPOT, not just total time: an engine near saturation reports healthy TTFT while TPOT climbs because iterations lengthen. Concretely, set agent streaming timeouts to `expected_output_tokens × p99_TPOT + margin`, and treat rising TPOT (visible in usage dashboards or inter-chunk gaps) as the signal to shed load or switch providers — before requests start failing outright.

## Sources
- ORCA: A Distributed Serving System for Transformer-Based Generative Models (OSDI 2022) — https://www.usenix.org/system/files/osdi22-yu.pdf
- ORCA USENIX page (36.9x figure in abstract) — https://www.usenix.org/conference/osdi22/presentation/yu
- vLLM docs, Optimization and Tuning (`max_num_seqs`, `max_num_batched_tokens`, chunked prefill policy) — https://docs.vllm.ai/en/stable/configuration/optimization/
- TensorRT-LLM, Paged Attention, IFB, and Request Scheduling — https://nvidia.github.io/TensorRT-LLM/features/paged-attention-ifb-scheduler.html
- TensorRT-LLM, Tuning Max Batch Size and Max Num Tokens — https://nvidia.github.io/TensorRT-LLM/performance/performance-tuning-guide/tuning-max-batch-size-and-max-num-tokens.html
- TensorRT-LLM API Reference (`batch_wait_max_tokens_ratio`) — https://nvidia.github.io/TensorRT-LLM/1.2.0rc0/llm-api/reference.html
- vLLM launch blog (up to 24x vs TGI) — https://vllm.ai/blog/2023-06-20-vllm
