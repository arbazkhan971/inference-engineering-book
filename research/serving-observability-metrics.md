# What an inference dashboard actually shows

researched: 2026-08-27 · researcher: glm-5.3-flash

## Key facts

- vLLM exposes its metric surface on the **`/metrics` endpoint of the OpenAI-compatible API server**, as Prometheus-format text (vLLM "Production Metrics" docs, page dated 2026-08-27).
- Gauges: `vllm:num_requests_running` ("Number of requests in model execution batches"), `vllm:num_requests_waiting` ("Number of requests waiting to be processed", with a `_by_reason` breakdown labeled `capacity` vs `deferred`), and `vllm:kv_cache_usage_perc` ("KV-cache usage. 1 means 100 percent usage") (vLLM docs, accessed 2026-08-27).
- Counters: `vllm:generation_tokens`, `vllm:prompt_tokens`, `vllm:prompt_tokens_cached`, `vllm:prefix_cache_hits` / `vllm:prefix_cache_queries` (counted in **tokens**, not requests), `vllm:request_success`, `vllm:num_preemptions`, and `vllm:corrupted_requests` (requests with **NaNs in logits**) (vLLM docs, accessed 2026-08-27).
- Histograms: `vllm:time_to_first_token_seconds`, `vllm:inter_token_latency_seconds`, `vllm:time_per_output_token_seconds` (per-request variant: `vllm:request_time_per_output_token_seconds`), `vllm:e2e_request_latency_seconds`, `vllm:request_queue_time_seconds` (time in WAITING phase), plus `request_prefill_time_seconds`, `request_decode_time_seconds`, `request_inference_time_seconds`, and `vllm:iteration_tokens_total` (tokens per engine step) (vLLM docs, accessed 2026-08-27).
- vLLM also has `vllm:external_prefix_cache_hits` / `_queries` for cross-instance KV-connector cache sharing, and optional Model Flops Utilization metrics behind `--enable-mfu-metrics` (vLLM docs, accessed 2026-08-27).
- Metric names are versioned goods: deprecated metrics are hidden in release X.Y+1 (escape hatch `--show-hidden-metrics-for-version=X.Y`) and removed in X.Y+2. Both the current stable and latest vLLM docs name the KV gauge `vllm:kv_cache_usage_perc`; earlier vLLM releases documented the same quantity as `vllm:gpu_cache_usage_perc` (vLLM docs, accessed 2026-08-27; no public date for the rename found as of 2026-08-27).
- SGLang exposes a parallel surface via `--enable-metrics`: `sglang:token_usage` and `sglang:cache_hit_rate` gauges, `sglang:time_to_first_token_seconds` histograms, `sglang:prompt_tokens_total` counters (SGLang production metrics docs, accessed 2026-08-27).
- Anthropic response headers: `retry-after` plus `anthropic-ratelimit-requests-*`, `anthropic-ratelimit-input-tokens-*`, `anthropic-ratelimit-output-tokens-*` (each with `limit` / `remaining` / `reset` variants, resets in RFC 3339), and Priority-Tier `anthropic-priority-*` variants; the generic `anthropic-ratelimit-tokens-*` headers show **the most restrictive limit currently in effect** (Claude API rate limits docs, accessed 2026-08-27).
- The Claude Console Usage page provides rate-limit charts: hourly maximum uncached input tokens per minute, the current ITPM limit, and **the cache rate** (percentage of input tokens read from cache) (Claude API rate limits docs, accessed 2026-08-27).
- OpenAI response headers: `Retry-After` (seconds, on temporary 429s) plus `x-ratelimit-limit-requests`, `x-ratelimit-limit-tokens`, `x-ratelimit-remaining-requests`, `x-ratelimit-remaining-tokens`, `x-ratelimit-reset-requests`, `x-ratelimit-reset-tokens`, and project-scoped variants like `x-ratelimit-remaining-project-tokens` (OpenAI rate limits guide, accessed 2026-08-27; example values in the docs table are illustrative, e.g. 149,984 remaining tokens).
- Every Anthropic API response includes a `request-id` header, echoed in error bodies, for correlating a single request with support (Claude API errors docs, accessed 2026-08-27).
- Queue depth, KV-cache occupancy, preemption counts, and TTFT/TPOT distributions are **not** part of any hosted provider's documented customer-facing surface (checked Anthropic and OpenAI docs, 2026-08-27); the closest public signal is the provider status page's coarse incident feed.

## How it works

There are two observability worlds, separated by exactly one deployment choice: who operates the engine.

**Self-hosted: the engine's internal state, raw.** A serving engine like vLLM or SGLang publishes Prometheus metrics that describe the *inside* of the machine. Reading them in plain words:

- `num_requests_running` is how many requests are in the current model-execution batch — the batch is being formed and computed right now. `num_requests_waiting` is the queue behind it; the `_by_reason` split distinguishes "no scheduling capacity" from "deferred by transient constraints" (e.g., LoRA budget, blocked status).
- `kv_cache_usage_perc` is how full the KV-cache pool is (1.0 = 100%). Rising toward 1.0 predicts preemption and eviction; `num_preemptions` counts how often the engine has already evicted running work to make room.
- `prefix_cache_hits` / `prefix_cache_queries` count cached tokens vs queried tokens — divide them for a hit-rate time series. `prompt_tokens_cached` is the already-cached share of prefill work.
- The latency histograms are the TTFT/TPOT instruments: `time_to_first_token_seconds` (TTFT), `time_per_output_token_seconds` and `inter_token_latency_seconds` (TPOT/ITL), `e2e_request_latency_seconds` (end to end), and `request_queue_time_seconds` — how much of e2e was pure queue wait, i.e., the share your capacity plan controls.
- Phase splits (`request_prefill_time_seconds`, `request_decode_time_seconds`) and `iteration_tokens_total` (tokens per engine step) show the prefill/decode mix inside each scheduler step. `corrupted_requests` catches NaN-logit responses, and `request_success` denominates everything.

Because these are histograms and gauges, not averages, you can compute **goodput yourself**: the fraction of requests whose TTFT (and TPOT, and e2e) falls inside whatever SLO you declare. No one hands you goodput; the building blocks are all here.

**Hosted: a narrow contract, on purpose.** A hosted provider exposes three surfaces. (1) *Rate-limit headers on every response* — the quota telemetry above: remaining requests/tokens, reset times, `retry-after`, with Anthropic's headers showing the most restrictive active limit and OpenAI adding project-scoped variants. (2) *Usage dashboards* — post-hoc aggregates: spend, token volumes, per-model rate-limit headroom charts, and cache rate. (3) *A status page* — provider-wide incident truth, coarse and after the fact. What is absent is deliberate: queue depth, KV occupancy, preemption, and TTFT/TPOT distributions are engine internals the provider does not document as customer-visible (checked 2026-08-27). Your request's queue wait is invisible to you; you experience it only as TTFT drift. Cache hit rate is the one internal quantity providers *do* surface to customers — because it directly moves your bill.

**Bridging the gap.** Everything the self-hosted world gets, a hosted client can reconstruct approximately from its own traffic: sample the rate-limit headers into gauges; timestamp the first SSE chunk per request for a client-side TTFT histogram; divide stream time by output tokens for TPOT; compute cache hit rate from usage fields (Anthropic's identity: total input tokens = `cache_read_input_tokens` + `cache_creation_input_tokens` + `input_tokens`, per the rate limits docs, accessed 2026-08-27). The reconstruction lacks the engine's *why* (queueing vs preemption vs eviction) but preserves the *what* your harness experiences.

## Harness angle

Build the dashboard your provider won't give you: one client-side exporter that (1) turns every response's rate-limit headers into your own gauges for quota burn-down, (2) computes TTFT/TPOT/e2e histograms from SSE timestamps so you can alert on SLO-goodput, and (3) tracks cache hit rate per prefix family to catch silent prefix drift (a cache-hostile edit shows up as a hit-rate collapse before it shows up as a bill). When you own the engine, pin your alerting to the documented metric names but treat renames as expected maintenance — vLLM's deprecation policy makes metric-name drift a scheduled event, not a surprise.

## Sources

- https://docs.vllm.ai/en/latest/usage/metrics/ — vLLM production metrics table (page dated 2026-08-27)
- https://docs.sglang.io/docs/references/production_metrics — SGLang Prometheus metrics via --enable-metrics
- https://docs.anthropic.com/en/api/rate-limits — anthropic-ratelimit-* headers, Console Usage charts, cache-rate formula
- https://platform.openai.com/docs/guides/rate-limits — x-ratelimit-* headers, Retry-After, project-scoped limits
- https://docs.anthropic.com/en/api/errors — request-id correlation header
- https://status.anthropic.com/ — provider incident feed (retrieved 2026-08-27)
- https://status.openai.com/ — provider incident feed (retrieved 2026-08-27)
