# Scheduler Preemption Under KV-Cache Pressure: RECOMPUTE vs SWAP
researched: 2026-08-27 · researcher: glm-5.3-flash

## Key facts
- vLLM preempts running requests when KV-cache space is insufficient to keep all batched requests going; preempted requests resume (with recomputation) once space frees up. The engine logs `Sequence group N is preempted by PreemptionMode.RECOMPUTE mode because there is not enough KV cache space... total_cumulative_preemption_cnt=1` (vLLM docs, fetched 2026-08-27).
- vLLM V1's default preemption mode is **RECOMPUTE**, not SWAP, because "recomputation has lower overhead in the V1 architecture" (vLLM docs, fetched 2026-08-27). In V0, the engine tried SWAP first (evicting KV blocks to pinned CPU memory) and fell back to RECOMPUTE if the swap (CPU) space was exhausted (vLLM v0 scheduler behavior, per codebase; qualitative, no numbers published).
- RECOMPUTE semantics: the request's KV blocks are freed and the sequence is restarted from its prompt once rescheduled — generated tokens so far are appended to the prompt and re-prefilled, so all decode work done before preemption is thrown away (vLLM docs; vLLM issue #24256, 2025).
- vLLM V1's `watermark` config is "fraction of total KV cache blocks to keep free ... when admitting waiting or preempted requests"; default is **0.0 (disabled)**, range `[0.0, 1.0)`; the headroom exists to avoid repeated preemption thrash (vLLM `vllm/config/scheduler.py`, main branch, fetched 2026-08-27). Legacy V0 used a watermark of 1% of GPU blocks as the free-block floor for admission (vLLM v0 scheduler; qualitative default, codebase history).
- `max_num_seqs` default in vLLM V1 is **128** (`DEFAULT_MAX_NUM_SEQS = 128`); it caps concurrent running sequences and thus caps worst-case KV demand (vLLM `vllm/config/scheduler.py`, fetched 2026-08-27).
- vLLM's official mitigation list for frequent preemption: increase `gpu_memory_utilization`, decrease `max_num_seqs` or `max_num_batched_tokens`, increase `tensor_parallel_size` (more KV space per GPU, at sync cost), or increase `pipeline_parallel_size` (frees weight memory, at latency cost) (vLLM docs, fetched 2026-08-27).
- Preemption is observable: Prometheus metrics count preempted requests, and `disable_log_stats=False` logs the cumulative preemption count — to the client it shows up as an unexplained multi-second latency spike or a stalled stream while the victim request is re-prefilled (vLLM docs, fetched 2026-08-27).
- SGLang implements the same idea as "retract": when the KV cache fills during decode, the scheduler retracts (preempts) running requests, appends their decoded tokens to the prompt, and requeues them for recomputation — i.e., SGLang's retract path is recompute-style preemption (SGLang issue #18214, 2025; SGLang `test_retract_decode.py`).
- SGLang's memory knob is `--mem-fraction-static`; the docs' rule of thumb is to reserve ~**5–8 GB** for activations when tuning it — too high a fraction leads directly to retracts (SGLang hyperparameter tuning docs, fetched 2026-08-27).
- Head-of-line blocking under FCFS scheduling and preemption is a recognized weakness in serving engines; the Sarathi/Sarathi-Serve line of work (arXiv:2308.16369, 2023) and chunked prefill (arXiv:2401.08671, 2024) attack it by piggybacking prefills with decodes instead of preempting; vLLM V1 enables chunked prefill by default and prioritizes decodes in each step (vLLM docs, fetched 2026-08-27).
- An independent reproduction lab (vllm-scheduling-lab, 2025–2026) measures vLLM V1 preemption under load sweeps (e.g., 10–26 concurrent 50–130-step requests) and attributes TTFT blowups by class; treat its numbers as single-machine community benchmarks, approximate, hardware-specific (GitHub, fetched 2026-08-27).
- Derived (no source number): recompute cost grows with context length — a preempted request re-prefills prompt + generated tokens, so a preemption at token N costs roughly the same compute as the original prefill of N tokens, plus queue wait. That is why one preemption on a long-context request can dominate its whole latency budget.

## How it works
Decode grows each request's KV cache one block at a time. The scheduler admits new requests while free blocks remain above its watermark, but every running sequence keeps consuming blocks each step. When allocation for a running request fails, the scheduler picks a victim — in vLLM it walks the running queue and preempts (V0: lowest-priority/newest-first with a `PREEMPTION_MODE`; V1: preempts from the tail of the running list) — frees its blocks, and requeues it ahead of the waiting queue.

What happens to the victim's KV state is the RECOMPUTE-vs-SWAP choice. **SWAP** copies the request's KV blocks from GPU HBM to pinned CPU memory; on reschedule they are copied back and decoding continues where it left off. You pay PCIe transfer time both ways and you hold CPU RAM hostage, but no GPU compute is wasted. **RECOMPUTE** simply drops the blocks; the already-generated output tokens are concatenated onto the prompt, and the request restarts as a prefill when it is readmitted. You pay GPU compute proportional to the full context length, and with prefix caching only the blocks that were evicted get recomputed — which is exactly why vLLM V1, where prefix caching is on by default, made RECOMPUTE the default: a recompute often hits the prefix cache and is cheap, while SWAP's transfer and CPU-side complexity became the worse trade.

The watermark is the anti-thrash valve. With `watermark=0` the scheduler admits work until literally zero blocks are free, which maximizes occupancy but invites admit→preempt→re-admit cycles where victims keep getting re-prefilled ("preemption storms"). A nonzero watermark keeps a fraction of blocks free so that running requests can grow without triggering preemption, at the cost of slightly lower average batch occupancy.

To the client, none of this is explicit. The HTTP/SSE stream just stalls: the victim's tokens stop arriving while its tokens are recomputed, so p99 inter-token latency and TTFT of *other* queued requests (whose prefills the recompute competes with) spike. The only signals are the server log line, the `vllm:preemption_requests` Prometheus counter, and KV-cache-usage gauges — none of which the client sees without server-side instrumentation.

## Harness angle
The harness should treat unexplained tail-latency spikes on streaming calls as possible scheduler preemption, and — if it controls the deployment — cap its own blast radius: set client-side token budgets / context trimming so a request's recompute cost stays bounded, and alert on the engine's preemption counter rather than guessing. When self-hosting, budget `max_num_seqs` × worst-case context against KV-cache size (derived rule of thumb, not a published number): if admitted concurrency × context can't fit, you have engineered preemption into steady state, and the fix is a lower `max_num_seqs`, higher `gpu-memory_utilization`/`mem-fraction-static`, or a nonzero watermark — chosen deliberately, not discovered in production.

## Sources
- https://docs.vllm.ai/en/stable/configuration/optimization/
- https://github.com/vllm-project/vllm/blob/main/docs/configuration/optimization.md
- https://github.com/vllm-project/vllm/blob/main/vllm/config/scheduler.py
- https://github.com/vllm-project/vllm/blob/main/vllm/v1/core/sched/scheduler.py
- https://github.com/vllm-project/vllm/issues/24256
- https://github.com/sgl-project/sglang/issues/18214
- https://docs.sglang.io/docs/advanced_features/hyperparameter_tuning
- https://arxiv.org/abs/2401.08671 (chunked prefill / stall-free serving, 2024)
- https://arxiv.org/abs/2308.16369 (Sarathi-Serve, 2023)
- https://github.com/DawnCalm/vllm-scheduling-lab
