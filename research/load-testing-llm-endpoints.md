# Load-Testing LLM Endpoints Without Lying to Yourself
researched: 2026-08-27 · researcher: glm-5.3-flash

## Key facts

- vLLM's serving benchmark (`vllm bench serve`) sends requests over an OpenAI-compatible HTTP API (`--backend openai-chat`, default endpoint `/v1/completions`), so the same tool works against any OpenAI-compatible provider endpoint, not just vLLM (vLLM CLI docs, fetched 2026-08-27).
- Arrival process matters: `--request-rate inf` (the default) fires everything at t=0, which is an offline batch, not a load test. A finite rate synthesizes arrival times via a Poisson process; `--burstiness` interpolates between bursty (<1), Poisson (=1), and near-uniform (>1) gamma-distributed arrivals (vLLM CLI docs, fetched 2026-08-27).
- Synthetic lengths are configurable distributions, not constants: `--random-input-len` (default 1024 tokens), `--random-output-len` (default 128), `--random-range-ratio` (default 0.0) samples each length uniformly in `[len*(1-r), len*(1+r)]`, and `--random-prefix-len` adds a fixed shared prefix to exercise prefix caching (vLLM CLI docs, fetched 2026-08-27).
- Percentile metrics are first-class: `--percentile-metrics ttft,tpot,itl,e2el` with `--metric-percentiles` (default "99") — a 1000-prompt run reporting only means is a red flag (vLLM CLI docs, fetched 2026-08-27).
- Goodput is the metric that ties load to user experience: requests/second that complete *within* an SLO, e.g. "Goodput (P90 TTFT < 200 ms and P90 TPOT < 50 ms)". vLLM computes it directly via `--goodput ttft:500,tpot:20` (ms values), citing the DistServe paper (vLLM CLI docs, fetched 2026-08-27; arXiv:2401.09670, 2024).
- Throughput and goodput diverge fast: a toy example in the DistServe blog shows a system at 10 req/s throughput where only 3 req/s meet the SLO — goodput 3 req/s (derived from the blog's worked example, arXiv:2401.09670 blog, 2024).
- Different applications need different SLO profiles — chatbot (tight TTFT, medium TPOT), code completion (tight/tight), summarization (loose TTFT, medium TPOT) — so one benchmark's "win" may be another's loss (DistServe paper, Table 8, arXiv:2401.09670, 2024).
- Prefill and decode interfere under colocation: a single-prefill, 512-in/64-out Poisson workload on one A100-80GB with a 13B model showed colocated vLLM-style serving sustaining ~1.6 req/s goodput at P90 TTFT < 0.4 s / P90 TPOT < 0.04 s, versus ~3.3 req/s per GPU after prefill/decode disaggregation (DistServe blog, 2024) — the point for load testing: arrival bursts expose this interference; constant-rate tests hide it.
- Warmup exists as a flag, not a default: `--num-warmups` defaults to 0, meaning a naive run includes cold-start compilation, CUDA-graph capture, and page faults in its percentile stats (vLLM CLI docs, fetched 2026-08-27).
- Prefix-cache state changes TTFT dramatically: vLLM automatic prefix caching reuses KV cache for shared prefixes (long-document re-queries, multi-turn chat history), accelerating prefill only — decoding is untouched. A benchmark whose prompts accidentally share prefixes measures a warm cache you may not have in production (vLLM APC docs, fetched 2026-08-27).
- `--ignore-eos` forces generation to a fixed output length; that's occasionally useful for isolating engine throughput, but it is a synthetic upper bound — real outputs stop when the model says so, so request occupancy and queueing behavior differ (vLLM CLI docs, fetched 2026-08-27).
- Datasets beyond random are supported: `sharegpt`, `sonnet` (defaults 550 in / 150 out / 200 prefix tokens), `burstgpt` (bursty arrivals), `prefix_repetition` (prefix-cache stress), and `timed_trace` (replay real traces with original timestamps, e.g. Moonshot traces with 512-token hash granularity) (vLLM CLI docs, fetched 2026-08-27).
- `--max-concurrency` caps in-flight requests, modeling a client-side semaphore; actual request rate drops below `--request-rate` if the server can't keep up — that gap is itself a load-test finding (vLLM CLI docs, fetched 2026-08-27).
- `--save-result --save-detailed` writes per-request TTFT/TPOT/error data to JSON; `--plot-timeline` renders an HTML execution timeline with ITL color thresholds (default 25/50 ms) for spotting decode stalls (vLLM CLI docs, fetched 2026-08-27).

## How it works

A correct LLM load test drives the streaming HTTP API with a *controlled arrival process* and a *realistic joint distribution* of input length, output length, and prefix sharing, then reports per-request latency decomposed into TTFT (dominated by prefill and queueing) and TPOT/ITL (dominated by decode-batch interference). The generator matters as much as the server: sending all requests at once (`request-rate inf`) measures offline batch throughput; a Poisson process measures steady-state serving; a bursty gamma process stresses the scheduler exactly where continuous batching hurts — incoming prefills stalling in-flight decodes.

The failure modes of naive tests all trace back to this. Fixed `max_tokens` with `ignore_eos` makes every request hold a decode slot for the same time, smoothing over the queueing dynamics that real variable-length outputs produce. Unique random prompts (or accidentally identical ones!) put the prefix cache in an unrepresentative state: benchmark TTFT with a cold cache and you overestimate production latency for multi-turn agents that replay system prompts and tool schemas every call; benchmark with a fully warm cache and you underestimate it for first-touch traffic. Skipping warmup means P99 TTFT includes one-time engine startup. Testing at a single offered load, once, tells you a point, not a curve — you want a sweep of request rates until the SLO attainment breaks, because that knee is your capacity number (goodput), and it appears at a different rate for TTFT than for TPOT.

A representative command against a self-hosted vLLM (or any OpenAI-compatible endpoint):

```
vllm bench serve --backend openai-chat --base-url http://localhost:8000 \
  --model meta-llama/Llama-3.1-8B-Instruct \
  --dataset-name sharegpt --num-prompts 1000 \
  --request-rate 4 --burstiness 1.0 --num-warmups 20 \
  --percentile-metrics ttft,tpot,itl --metric-percentiles 50,90,99 \
  --goodput ttft:500,tpot:20 --save-result --save-detailed
```

Reading the output: check `Successful requests` vs `Benchmark duration` for errors/timeouts, the request throughput line, then the per-metric mean/p50/p99 blocks. If p99 TTFT is many multiples of p50 while TPOT p99 stays tame, you're queue-bound in prefill; if ITL p99 spikes, decode is being interrupted (prefill interference, chunked-prefill effects, or KV-cache pressure). The goodput line answers "how many of those req/s actually met my SLO." Soak testing (hours, not minutes) additionally surfaces KV-cache fragmentation, memory growth, and leak-driven degradation that single runs never show. For generic HTTP-level behavior — 429/5xx handling, retry storms, connection limits — pair the LLM-native tool with a k6-class load generator driving the same endpoint.

## Harness angle

Before your client library picks a concurrency semaphore and a retry/backoff policy, load-test the real endpoint with your *actual* prompt mix (system prompt + tools + history replay), and size `max_concurrency` and timeout budgets to the measured goodput knee and p99 TTFT — not to a synthetic single-request latency number. If the harness retries on 429 with jittered backoff, verify under bursty arrivals that retries don't push the system past the knee you just measured.

## Sources

- https://docs.vllm.ai/en/latest/cli/bench/serve.html
- https://docs.vllm.ai/en/latest/features/automatic_prefix_caching.html
- https://github.com/vllm-project/vllm/tree/main/benchmarks
- https://hao-ai-lab.github.io/blogs/distserve/
- https://arxiv.org/abs/2401.09670
