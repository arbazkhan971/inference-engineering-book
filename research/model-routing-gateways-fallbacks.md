# Routing and Fallbacks: LLM Gateways, Complexity Routers, and Circuit Breakers
researched: 2026-08-27 · researcher: glm-5.3-flash
## Key facts
- LiteLLM's proxy router supports per-model-group **fallbacks**: if a call fails after `num_retries` retries, traffic fails over to a different model group (e.g. `gpt-4` → `claude-3-opus`). Example config values shown in docs: `num_retries: 3`, `request_timeout: 10` seconds, `allowed_fails: 3`, `cooldown_time: 30` seconds (LiteLLM Proxy Reliability docs, retrieved 2026-08-27). These are presented as example config values, not stated defaults.
- LiteLLM **cooldown mechanism**: a deployment enters cooldown when its failures-per-minute exceed `allowed_fails`, and stays there for `cooldown_time` seconds; a deployment with only one instance is never put in cooldown (LiteLLM docs, retrieved 2026-08-27). If every deployment in a group is cooling down, an explicit fallback model receives traffic, skipping the cooldown check.
- LiteLLM load-balancing strategies include `simple-shuffle` (recommended, weighted-random), `least-busy`, `latency-based-routing`, and `usage-based-routing` (by cost or TPM/RPM usage); weights are set per-deployment via a `weight` field (LiteLLM Proxy Load Balancing docs, retrieved 2026-08-27).
- LiteLLM health-check-driven routing removes failing deployments from the pool **proactively** on a configurable `health_check_interval`, instead of waiting for user requests to fail; 429/408 can be ignored as transient via `ignore_transient_errors` (LiteLLM Health Check Driven Routing docs, retrieved 2026-08-27).
- OpenRouter's reliability model has two layers: **provider failover** (on by default, `allow_fallbacks: true`) and **model fallbacks** (opt-in via a `models` array in priority order). The provider routing rule: deprioritize providers with an outage in the last **30 seconds**, pick the lowest-cost stable candidate weighted by the **inverse square of price**, keep the rest as fallbacks (OpenRouter reliability blog, retrieved 2026-08-27).
- OpenRouter documents a real incident: a **~50-minute gateway database outage in August 2025** (status.openrouter.ai), which the two-layer design is meant to ride around; no specific uptime percentage is published — hedged claim (OpenRouter blog, retrieved 2026-08-27).
- OpenRouter model fallbacks fire only on classified errors (provider failures, rate limits, context-length errors, moderation refusals); a malformed 400 or a "garbage" 200 response does **not** trigger fallback (OpenRouter Model Fallbacks docs, retrieved 2026-08-27).
- Cloudflare AI Gateway supports fallbacks via the Universal Endpoint (deprecated for new integrations) and via **Dynamic Routing**: a versioned JSON flow of elements where each element has `success` and optional `fallback` outputs, with fallback triggered on errors or configured timeouts; the `cf-aig-step` response header records which step served the request (Cloudflare AI Gateway docs, retrieved 2026-08-27).
- RouteLLM (LMSYS, arXiv 2406.18665): routers trained on Chatbot Arena preference data cut costs vs. GPT-4-only by **over 85% on MT Bench, 45% on MMLU, and 35% on GSM8K** while retaining **95% of GPT-4 performance**; commercial-router comparisons were **>40% cheaper** at similar quality (LMSYS blog + arXiv paper, retrieved 2026-08-27).
- Circuit-breaker canonical mechanics: CLOSED → OPEN after N consecutive failures (or a failure-rate threshold over a sliding window) → HALF_OPEN after a timeout window, where a limited number of probe requests test recovery; success closes the breaker, failure re-opens it (Martin Fowler's CircuitBreaker bliki; Azure Architecture Center; Resilience4j docs — count-based vs time-based sliding windows — retrieved 2026-08-27).
- Resilience4j implements the breaker as a finite state machine with three normal states (CLOSED, OPEN, HALF_OPEN) plus special states (DISABLED, FORCED_OPEN, METRICS_ONLY); detection uses either a count-based window (last N calls) or time-based window (Resilience4j docs, retrieved 2026-08-27).

## How it works
A gateway router sits between your agent and the model providers. Model aliasing maps a stable name your code calls (e.g. `primary-llm`) to concrete deployments; weighted routing splits traffic across deployments of the same model; fallback chains define what to try next when a model *group* exhausts its retries; cooldowns are the gateway's circuit-breaker-ish memory of which deployments are unhealthy.

Worked example (LiteLLM, using doc example values, retrieved 2026-08-27): you configure `gpt-4o` with three deployments at weights 2/1/1, `num_retries: 3`, `allowed_fails: 3`, `cooldown_time: 30`. Suppose deployment A starts timing out. Requests to A retry up to 3 times; once A accumulates more than 3 failures within a minute, it enters a 30-second cooldown and is removed from the weighted pool, so traffic lands on B and C without users seeing errors. If B and C also cool down, an explicit fallback (e.g. a `claude` group) takes over, skipping the cooldown check.

Worked example (OpenRouter pricing-weighted routing, retrieved 2026-08-27): providers A/B/C cost $1/$2/$3 per M tokens for the same model. Selection weight is 1/price², so A is 1/(⅓)² = **9× more likely** to be tried before C; a provider with an outage in the last 30 seconds is deprioritized entirely. If all providers for the model fail, the opt-in `models` array walks to the next model — and you pay only for the successful completion.

Complexity routing (RouteLLM) is orthogonal: instead of reacting to failures, a classifier scores each prompt's difficulty and sends easy prompts to a cheap model (e.g. Mixtral-8x7B class) and hard ones to a strong model (GPT-4 class). Per the paper, on MT Bench the router matched ~95% of GPT-4 quality at under ~15% of the cost (an >85% reduction); on MMLU and GSM8K the savings shrink to 45% and 35% — the harder the benchmark, the more traffic must go to the strong model.

Circuit breakers (SRE canonical, Fowler/Azure): in CLOSED state calls flow and failures are counted over a sliding window; when failures cross the threshold the breaker OPENS and calls fail fast (no wasted timeout budget); after a cooldown window it goes HALF_OPEN and admits a few probe requests — success closes it, failure re-opens it. LiteLLM's `allowed_fails` + `cooldown_time` is exactly this shape, minus an explicit half-open probe.

## Harness angle
Don't hardcode one model per task in agent code. Put a gateway alias (LiteLLM group or OpenRouter model with a `models` fallback array) behind every LLM call, configure retries → cooldown → fallback-chain explicitly with dated, reviewed numbers, and validate the chain with synthetic-failure tests (LiteLLM's mock-testing hooks) rather than waiting for a real provider outage. For cost, add complexity routing only where the traffic mix is dominated by easy prompts — RouteLLM's own numbers show the saving collapses on hard benchmarks.

## Sources
- https://docs.litellm.ai/docs/proxy/reliability
- https://docs.litellm.ai/docs/proxy/load_balancing
- https://docs.litellm.ai/docs/proxy/health_check_routing
- https://openrouter.ai/blog/insights/reliability-failover/
- https://openrouter.ai/docs/guides/routing/model-fallbacks
- https://developers.cloudflare.com/ai-gateway/features/dynamic-routing/
- https://developers.cloudflare.com/ai-gateway/configuration/fallbacks/
- https://arxiv.org/abs/2406.18665 (RouteLLM)
- https://www.lmsys.org/blog/2024-07-01-routellm/
- https://martinfowler.com/bliki/CircuitBreaker.html
