# Circuit Breakers for LLM Provider Calls: Trip Conditions, Cooldowns, and Fallback Coordination
researched: 2026-08-27 · researcher: glm-5.3-flash

## Key facts
- LiteLLM Router cools down a deployment immediately on a 429 rate-limit response, with a 5-second default cooldown window (LiteLLM docs, fetched 2026-08-27).
- LiteLLM also trips a 5-second (default) cooldown when >50% of calls in the current minute fail, and on non-retryable errors 401/404/408 (LiteLLM docs, fetched 2026-08-27).
- LiteLLM's classic allowed-fails knob: `allowed_fails=1` means the model is cooled down if it fails more than 1 call in a minute, for `cooldown_time` seconds (docs example uses `cooldown_time=100`); Terraform registry docs list `allowed_fails` default 3 (LiteLLM docs + Terraform provider registry, fetched 2026-08-27).
- LiteLLM cooldowns apply per *deployment* (one entry in the model list, identified by a hashed `model_id`), not per model group — the healthy peers keep serving while one is benched (LiteLLM docs, fetched 2026-08-27).
- LiteLLM supports per-error-type breaker budgets via `AllowedFailsPolicy` (e.g. separate allowances for `RateLimitError`, `ServiceUnavailableError`, `BadGatewayError`, `ContentPolicyViolationError`), with deployment-level policies overriding router-level ones (LiteLLM docs, fetched 2026-08-27).
- Portkey AI Gateway circuit breaker opens (OPEN) when failure *count* exceeds `failure_threshold` OR failure *rate* exceeds `failure_threshold_percentage`; evaluation of the rate waits until `minimum_requests` is reached; both thresholds are user-set (Portkey docs, fetched 2026-08-27).
- Portkey `cooldown_interval` (ms) closes the circuit automatically after it passes; documented minimum is 30 seconds (Portkey docs, fetched 2026-08-27).
- Portkey treats HTTP status codes as failures — `failure_status_codes` optional, default >500 — and removes open targets from routing; if ALL targets in a strategy path are OPEN, Portkey bypasses the breaker rather than dead-ending (Portkey docs, fetched 2026-08-27).
- Portkey's retry default: up to `attempts: 5` on status codes [429, 500, 502, 503, 504] (Portkey gateway cookbook, GitHub, fetched 2026-08-27) — i.e. retries and breakers are layered, not alternatives.
- Cloudflare AI Gateway fallbacks are an ordered array at the Universal endpoint: on error or a predetermined timeout the next provider handles the request; the `cf-aig-step` response header reports which step served it (`cf-aig-step:0` = primary, `:1` = first fallback) (Cloudflare docs, fetched 2026-08-27).
- Portkey's own MCP gateway roadmap explicitly frames breakers as failure-rate + latency monitoring, fast-fail against unhealthy servers, periodic recovery checks, and closed/half-open/open states visible in a dashboard (Portkey MCP docs, fetched 2026-08-27) — confirming half-open probing as the recognized design in this ecosystem.
- Derived: Portkey's 30s minimum cooldown is 6x LiteLLM's 5s default 429 cooldown — provider-vs-provider defaults differ enough that a harness should not assume one number.

## How it works
A circuit breaker is a per-target failure memory. The closed state behaves normally: calls flow to the provider and the breaker counts successes and failures against a window or threshold. When a trip condition fires — N consecutive/cumulative failures, a failure *rate* over a percentage once a minimum sample exists, or a specific status class like 429/5xx — the breaker opens. An open breaker fails fast: instead of sending the request (and waiting out a timeout or a 429 storm), the caller immediately routes elsewhere. After a cooldown interval the target is retried tentatively (half-open / probe): a small amount of traffic tests the provider; success closes the breaker, failure re-opens it for another cooldown. LiteLLM's implementation is per-deployment and time-boxed (a failing deployment is benched for seconds and gradually reintroduced with counters reset), while Portkey's is threshold-based per routing strategy path, with an escape hatch: if every target is open, the breaker is bypassed so traffic still flows.

The breaker's job is to sit *under* retries and *beside* fallbacks. Retries handle transient blips — a single 502 or a brief 429 — and Portkey shows the layering plainly: retry on [429, 500, 502, 503, 504] up to `attempts`, but if failures keep accumulating, the breaker opens and retries to that target stop entirely. Fallback chains then absorb the traffic: Cloudflare's ordered array and LiteLLM's model-group fallbacks shift requests to the next provider the moment the primary is benched. Without a breaker, naive retry during a sustained provider incident multiplies load — every client hammers a down provider with exponential backoff and then surges back simultaneously on recovery (the thundering herd). With a breaker, the failed provider sees near-zero traffic during the incident, fallback capacity absorbs the work, and probes rather than full traffic determine when to come back.

Granularity matters. A breaker per *provider* is too coarse (one model's content-policy failures shouldn't bench a whole vendor); per-*model* or per-*deployment* is what LiteLLM does, and per-*strategy path* is what Portkey does. Trip conditions should also distinguish error classes: a 429 means "back off briefly," a 401/404 means "this deployment is misconfigured and no retry will help," which is why LiteLLM lets you set separate fail budgets per exception type.

## Harness angle
Default your harness's provider pool to per-model breakers with error-class-aware trips: 429s get a short cooldown (LiteLLM's 5s default is a sane anchor), auth/config errors (401/404) get a long or permanent bench, and the fallback chain — not retry — becomes the primary path once a breaker opens. Concretely: stop retrying into an open breaker, and make "which breaker state are we in" an observable in your routing logs so you can tell a fallback-shifting incident from a latency regression.

## Sources
- https://docs.litellm.ai/docs/routing
- https://docs.portkey.ai/docs/product/ai-gateway/circuit-breaker
- https://docs.portkey.ai/docs/product/mcp-gateway/circuit-breakers
- https://github.com/Portkey-AI/gateway/blob/main/cookbook/getting-started/automatic-retries-on-failures.md
- https://developers.cloudflare.com/ai-gateway/configuration/fallbacks/
- https://registry.terraform.io/providers/gzamboni/litellm/latest/docs/resources/router_settings
