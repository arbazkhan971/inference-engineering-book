# Instrumenting inference SLOs: engine /metrics, goodput dashboards, and burn-rate alerts
researched: 2026-08-27 · researcher: glm-5.3-flash

## Key facts
- vLLM exposes a Prometheus `/metrics` endpoint on the API server's port (default 8000; `curl http://0.0.0.0:8000/metrics`) with per-request latency histograms: `vllm:time_to_first_token_seconds`, `vllm:time_per_output_token_seconds`, `vllm:e2e_request_latency_seconds`, and `vllm:request_queue_time_seconds` (time in WAITING phase) (vLLM docs v0.6.6, fetched 2026-08-27).
- KV-cache pressure is a gauge: `vllm:gpu_cache_usage_perc` (1.0 = 100% of GPU blocks allocated); preemption pressure is a counter: `vllm:num_preemptions_total`. Rising cache usage plus a climbing preemption counter is the classic signature that the admission/scheduler is thrashing (vLLM docs v0.6.6, fetched 2026-08-27).
- Prefix-cache effectiveness is surfaced as gauges `vllm:cpu_prefix_cache_hit_rate` and `vllm:gpu_prefix_cache_hit_rate` (in the v0.6.6 docs snapshot; later releases moved toward cumulative hit/miss counters — verify against your installed version) (vLLM docs, fetched 2026-08-27).
- vLLM also exposes `vllm:request_success_total` labeled by `finished_reason` (stop/length/abort), so you can compute completion-vs-abort ratios directly from the metrics endpoint (vLLM docs v0.6.6, fetched 2026-08-27).
- SGLang mirrors the same shape: `sglang:time_to_first_token_seconds` and `sglang:time_per_output_token_seconds` histograms, `sglang:cache_hit_rate` (prefix cache gauge), `sglang:token_usage`, and running/waiting queue-depth gauges `sglang:num_running_reqs` / `sglang:num_queue_reqs`, on `/metrics` (default server port 30000). Enabled with `--enable-metrics` (SGLang docs, fetched 2026-08-27).
- SGLang adds request-trace tooling the client team can reuse: `--log-requests` / `--log-request-level` (off by default — no request contents logged), a request-dump/replay path that writes one pickle file per 100 requests, and crash-dump replay for post-mortems (SGLang docs, fetched 2026-08-27).
- Google's SRE Workbook gives the canonical multi-window multi-burn-rate alert table for a 99.9% availability SLO: **Page** at burn rate 14.4 over 1h long / 5m short windows (2% of error budget consumed); **Page** at burn rate 6 over 6h / 30m (5% consumed); **Ticket** at burn rate 1 over 3d / 6h (10% consumed). Short window = 1/12 of the long window (SRE Workbook, "Alerting on SLOs", fetched 2026-08-27).
- Example page expression from the same chapter: fire if 1h error rate > 14.4 × 0.001 AND 5m rate > 14.4 × 0.001 (SRE Workbook, fetched 2026-08-27). This converts directly to a goodput alert: replace the request error rate with the fraction of tokens/requests outside your latency SLO.
- OpenAI rate-limit responses are first-class telemetry: HTTP 429 with `Retry-After` (seconds, "treat this value as a minimum"), plus `x-ratelimit-remaining-requests` / `-tokens` and `x-ratelimit-reset-requests` / `-tokens` headers on every response; unsuccessful retries still count against per-minute limits (OpenAI docs, fetched 2026-08-27).
- Anthropic exposes the equivalent via `anthropic-ratelimit-requests-remaining`, `anthropic-ratelimit-tokens-remaining` (rounded to nearest thousand), and a `retry-after` header sent with 429s (except spend-cap 429s) (Anthropic docs, fetched 2026-08-27).
- Goodput-optimized serving is an active research line: e.g. TurboSpec, closed-loop speculation control targeting goodput (arXiv:2406.14066, 2024), prefill/decode aggregation-vs-disaggregation tradeoffs (arXiv:2508.01989, 2025-08), and SLO-latency-budget fair serving (arXiv:2608.06557, 2026-08) — all define goodput as throughput of requests/tokens meeting latency SLOs (arXiv API, fetched 2026-08-27).
- OpenAI/Anthropic-style provider endpoints publish no public TTFT percentiles; per-endpoint TTFT p50/p95/p99 and cache hit rate must be measured client-side from streamed responses. Community dashboards for provider TTFT exist but are approximate; treat them as direction, not SLO evidence (no primary source found; hedged).

## How it works
Engine metrics are emitted from inside the scheduler loop, which is what makes them cheap and authoritative. When a request finishes, vLLM/SGLang observe the timestamps for arrival, first token, and completion, and record them into Prometheus histograms (`*_seconds`). Histograms — not gauges — matter here: Prometheus can compute p50/p95/p99 from the cumulative buckets with `histogram_quantile()`, so a Grafana panel like `histogram_quantile(0.95, sum(rate(vllm:time_to_first_token_seconds_bucket[5m])) by (le, model))` gives you a TTFT p95 per model with no client-side instrumentation at all. Queue-time and preemption counters turn a latency regression into a diagnosis: if TTFT p95 jumps and `request_queue_time_seconds` jumps with it, you're admission-bound (too many concurrent requests, waiting queue); if preemptions climb, you're KV-cache-bound (batch too large for the cache, requests being evicted mid-flight and recomputed).

A goodput dashboard is one PromQL join on top of these histograms. Define the SLO per workload — e.g. "TTFT under X s" and "inter-token gap under Y s" — and graph the fraction of requests whose histogram buckets fall inside the budget as an attainment ratio, alongside raw p50/p95/p99 panels. Attainment is the burn-rate input: the "error rate" for the SRE-Workbook alert pattern is `1 - attainment`. Multi-window burn-rate alerts then give you fast detection without pager noise, because the short window (1/12 of the long) filters spikes and the long window filters flukes.

For hosted providers (OpenAI, Anthropic, Google), the engine metrics disappear — you only see the edge. The client harness must generate the same telemetry itself: record wall-clock TTFT and inter-token gaps from the SSE stream, tag them with endpoint/model, and scrape the rate-limit headers off every response. The `x-ratelimit-remaining-*` / `anthropic-ratelimit-*-remaining` headers are the earliest signal of an approaching 429 wall, minutes before the 429 rate itself spikes, and `Retry-After` tells you whether your backoff should be seconds (transient) or whether you've hit a quota that retrying cannot fix.

## Harness angle
Instrument the harness itself, not just the fleet: a client-side metric layer that timestamps first-token and per-token arrival for every provider call, plus a gauge per endpoint derived from the rate-limit-remaining headers, means 429 storms show up as a leading indicator (remaining tokens draining) instead of a trailing one (retry queue exploding) — and it lets you route agents to whichever provider endpoint still has headroom, which no server-side dashboard can tell you.

## Sources
- https://docs.vllm.ai/en/v0.6.6/serving/metrics.html
- https://docs.sglang.ai/references/production_metrics.html
- https://docs.sglang.ai/advanced_features/observability.html
- https://sre.google/workbook/alerting-on-slos/
- https://platform.openai.com/docs/guides/rate-limits
- https://docs.anthropic.com/en/api/rate-limits
- https://arxiv.org/abs/2406.14066
- https://arxiv.org/abs/2508.01989
- https://arxiv.org/abs/2608.06557
