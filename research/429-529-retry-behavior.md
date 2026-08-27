# Overload behavior and client retry practice: 429s vs 529s, Retry-After, SDK defaults, and retry budgets
researched: 2026-08-27 · researcher: glm-5.3-flash

## Key facts
- Anthropic distinguishes two transient overload codes: HTTP 429 `rate_limit_error` (org hit a rate limit, monthly spend cap, or workspace spend limit) and HTTP 529 `overloaded_error` (the API is temporarily saturated — server-side, not caller's fault). (Claude API errors docs, retrieved 2026-08-27)
- An Anthropic spend-cap 429 carries **no `retry-after` header** and keeps failing until access resumes (e.g., "regain access on 2026-09-01 at 00:00 UTC"); ordinary rate-limit 429s do include a `retry-after` header. 529s have no `retry-after`. (Claude rate-limits and errors docs, retrieved 2026-08-27)
- OpenAI's 429 is overloaded in meaning: a temporary rate limit, an exhausted prepaid balance, or a spend/usage limit all share HTTP 429. Docs instruct callers to read the error `code`/`type` — billing-related errors may use the broader `type` value `insufficient_quota` — before retrying. (OpenAI Help Center article 5955604 and API rate-limits guide, retrieved 2026-08-27)
- OpenAI rate-limit responses include a `Retry-After` header with the minimum seconds to wait, "when present," plus `x-ratelimit-*` headers (requests/tokens remaining and reset times) on responses. (OpenAI API rate-limits guide, retrieved 2026-08-27)
- OpenAI added enforced monthly spend limits on 2026-07-22: crossing the cap makes live API requests fail with 429 — a billing 429 that retrying cannot fix. (TheRouter.ai news, retrieved 2026-08-27)
- OpenAI Python SDK defaults: `max_retries = 2` (constant `DEFAULT_MAX_RETRIES = 2`); it honors `Retry-After` when present. (openai-python source `src/openai/_client.py` and SDK retry docs, retrieved 2026-08-27)
- Anthropic Python SDK defaults: `DEFAULT_MAX_RETRIES = 2`, `INITIAL_RETRY_DELAY = 0.5s`, `MAX_RETRY_DELAY = 8.0s`, with exponential backoff; `Retry-After` honored on 429s. (anthropic-sdk-python `src/anthropic/_constants.py`, retrieved 2026-08-27)
- Google Gen AI SDK defaults: retries transient errors (timeouts, 429, 5xx) **4 times** with delays of roughly 1.0, 2.0, 4.0, 8.0 seconds (initial 1.0s, multiplier 2, max 60s, jitter applied). (Vertex AI retry-strategy docs and `google/genai/_api_client.py`, retrieved 2026-08-27)
- Canonical backoff: "Full Jitter" — sleep `random_between(0, min(cap, base * 2^attempt))` — beat "Equal Jitter" and "Decorrelated Jitter" in AWS's simulation of 1,000 clients contending for 100 tokens. (AWS Architecture Blog, "Exponential Backoff and Jitter," 2015, updated May 2023; retrieved 2026-08-27)
- Google SRE retry guidance: per-request cap of ~3 attempts total; per-client **retry budget capping retries at 10% of requests**, plus adaptive client throttting. The SRE book's worked scenario: at 10,000 QPS client traffic with a backend overloaded by 100 QPS, unlimited retries can add 100 retry QPS every round, up to a 2x amplification at 50% failure rate — "retries can double the load" — and have caused real cascading failures. (sre.google, Handling Overload and Addressing Cascading Failures chapters, retrieved 2026-08-27). The commonly cited "3x amplification bound" (1 + 2 retries) follows from a 3-attempt cap: worst case a logical request becomes 3 wire requests.

## How it works
A 429 means "the *account* is going too fast (or spent too much)"; a 529 (Anthropic-specific) means "*we* are overloaded." Both are retried for rate-limit causes, but the client must first classify: read the error `type`/`code`. If it's a quota/billing/spend-cap 429 (Anthropic spend-cap message with no `retry-after`; OpenAI `insufficient_quota`/exhausted balance), retrying is pure waste — fail fast and surface to a human or billing workflow.

For retriable errors, the minimum correct behavior is honoring server advice: read `Retry-After` (seconds) and never retry sooner. If absent (e.g., 529s), fall back to exponential backoff with full jitter: `sleep = random(0, min(cap, base * 2^attempt))`.

Worked example (Anthropic SDK-shaped, base 0.5s, cap 8s, max 2 retries): attempt 1 fails with 529 → sleep `random(0, 1s)`; attempt 2 fails → sleep `random(0, 2s)`; attempt 3 fails → give up and escalate. With `Retry-After: 12` on a 429, skip the formula entirely and sleep ≥ 12s once, then retry.

Retries alone are dangerous: synchronized retries after an overload create a retry storm. Google's scenario shows 10,000 QPS of clients hitting a backend overloaded by 100 QPS can generate an extra 100 QPS of retries *per round*, feeding the failure. Cures: full jitter (spreads retry times), a per-request attempt cap (~3, bounding worst-case load amplification at 3x), and a per-client retry budget (retries ≤ 10% of requests — when the ratio is exceeded, further retries are rejected locally without hitting the wire).

## Harness angle
The harness should classify 429 subtypes before retrying: honor `Retry-After` as the floor when present, apply full-jitter exponential backoff with a small attempt cap (2–4) for rate-limit 429s and 529s, and never retry quota/spend-cap 429s — instead surface them as a distinct "billing blocked" failure. Wrap all retries in a global retry budget (~10% of request volume) so a fleet of agents cannot amplify an overload into a retry storm.

## Sources
- Claude API errors — https://platform.claude.com/docs/en/api/errors
- Anthropic rate limits (spend-cap 429 behavior) — https://platform.claude.com/docs/en/api/rate-limits
- OpenAI Help Center: solving 429 errors — https://help.openai.com/en/articles/5955604
- OpenAI API rate-limits guide (Retry-After, x-ratelimit headers) — https://developers.openai.com/api/docs/guides/rate-limits
- OpenAI Cookbook: how to handle rate limits — https://developers.openai.com/cookbook/examples/how_to_handle_rate_limits
- anthropic-sdk-python constants (DEFAULT_MAX_RETRIES=2, 0.5–8s backoff) — https://github.com/anthropics/anthropic-sdk-python/blob/main/src/anthropic/_constants.py
- openai-python client (max_retries default) — https://github.com/openai/openai-python/blob/main/src/openai/_client.py
- Google Gen AI retry strategy (4 retries, ~1/2/4/8s) — https://docs.cloud.google.com/vertex-ai/generative-ai/docs/retry-strategy
- AWS Architecture Blog: Exponential Backoff and Jitter — https://aws.amazon.com/blogs/architecture/exponential-backoff-and-jitter/
- Google SRE book: Handling Overload (3 attempts, 10% retry budget) — https://sre.google/sre-book/handling-overload/
- Google SRE book: Addressing Cascading Failures — https://sre.google/sre-book/addressing-cascading-failures/
