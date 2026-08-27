# Rate Limit and Quota Architectures Across Inference Providers (dated snapshot)
researched: 2026-08-27 · researcher: glm-5.3-flash

## Key facts

- OpenAI rate limits are measured in RPM (requests/minute), TPM (tokens/minute), RPD, TPD, IPM (images/minute), and audio minutes/minute for some streaming audio models; you are throttled by whichever limit you hit first. (OpenAI Rate Limits guide, retrieved 2026-08-27)
- OpenAI usage tiers are org-level and auto-scale with cumulative spend: Free ($100/month usage cap), Tier 1 ($5 paid), Tier 2 ($50 paid), Tier 3 ($100 paid), Tier 4 ($250 paid), Tier 5 ($1,000 paid, $200,000/month cap). (OpenAI Rate Limits guide, retrieved 2026-08-27)
- Example OpenAI per-model limits (GPT-5.4/5.6-family model pages, retrieved 2026-08-27): Tier 1 = 500 RPM / 500,000 TPM; Tier 2 = 5,000 RPM / 1,000,000–2,000,000 TPM (varies by model); Tier 3 = 5,000 RPM / ≥2,000,000 TPM; Tier 4 = 10,000 RPM / higher TPM; tier ceilings differ per model even within the same tier.
- OpenAI per-request TPM charge = max(`max_tokens`, estimated tokens from character count of the request) — i.e., the reserve is driven by your `max_tokens` setting, and OpenAI recommends setting `max_tokens` as close as possible to expected response size. Unsuccessful requests still count toward per-minute limits. (OpenAI Rate Limits guide, retrieved 2026-08-27)
- OpenAI limits are enforced at organization and project level, **not** per API key; some model families share one TPM pool (a documented shared-family example shows 3.5M shared TPM). (OpenAI Rate Limits guide, retrieved 2026-08-27)
- OpenAI prompt caching requires a minimum cacheable prefix of 1,024 tokens for GPT-5.6-and-later models and 2,048 tokens for older models. (OpenAI Prompt Caching guide, retrieved 2026-08-27)
- Anthropic measures limits in three metrics: RPM, input tokens per minute (ITPM), and output tokens per minute (OTPM), set per model class; exceeding any one returns a 429 with a `retry-after` header. (Anthropic rate limits docs, retrieved 2026-08-27)
- Current Anthropic direct-API model limits (snapshot, retrieved 2026-08-27): Claude Opus 5 / Sonnet 5 / Sonnet 4.x / Haiku 4.5 = 1,000 RPM, 2,000,000 ITPM, 400,000 OTPM; limits are combined across minor versions within a family (e.g., Sonnet 4.5+4.6 share one pool); Haiku 3.5 (retired except on Bedrock/Vertex) = 1,000 RPM / 100,000 ITPM / 20,000 OTPM.
- Anthropic enforcement uses a token bucket, not a fixed-window reset: capacity replenishes continuously, and 60 RPM "might be enforced as 1 request per second," so short bursts can 429 even under the nominal limit. (Anthropic rate limits docs, retrieved 2026-08-27)
- Anthropic tiers upgrade automatically based on usage history and account standing; new orgs may start in a lower "Evaluation" tier; separate "acceleration limits" can 429 sharp usage increases. Spend caps: Start $500/month, Build $1,000/month, Scale $200,000/month, Custom uncapped. (Anthropic rate limits + help center, retrieved 2026-08-27)
- Anthropic cache reads: `cache_read_input_tokens` do **not** count toward ITPM for most models (billed at 10% of base input price) — with an 80% cache hit rate, 2,000,000 ITPM supports roughly 10,000,000 effective input tokens/minute; Haiku 3.5 is the documented exception where cache reads do count. OTPM is measured on actual output tokens, not `max_tokens`. (Anthropic rate limits docs, retrieved 2026-08-27)
- Google Gemini limits are measured in RPM, input TPM, and RPD; limits apply per **project**, not per API key, and daily quotas reset at midnight Pacific Time. Gemini also enforces spend-based rate limits on top of RPM/TPM. (Google AI rate limits docs, retrieved 2026-08-27)
- Gemini free-tier snapshot (December 2025 quota cuts of 50–80%, per Google docs and third-party trackers, retrieved 2026-08-27): Gemini 2.5 Pro ≈ 5 RPM / 100 RPD; Gemini 2.5 Flash ≈ 10 RPM / 250 RPD; Flash-Lite ≈ 15 RPM / 1,000 RPD; shared input TPM around 250,000 on free tier. Paid Tier 1 runs roughly 150–300 RPM (third-party 2026 trackers; treat exact paid figures as approximate).
- AWS Bedrock inference quotas are per-model token quotas viewed/raised via Service Quotas; quota consumption = `InputTokenCount + CacheWriteInputTokens + (OutputTokenCount × model burndown rate)`. `CacheReadInputTokens` are not counted at all. (AWS Bedrock docs, retrieved 2026-08-27)
- Bedrock burndown multipliers for output tokens (retrieved 2026-08-27): Claude 4.8 = 15x; Claude Sonnet 5 / Opus 5 = 10x; Claude 4.7 and below = 5x; GPT-5.6 Sol/Terra/Luna on bedrock-runtime = 10x; most other models 1:1.
- Bedrock deducts `input + max_tokens` from quota at request start and replenishes unused tokens at the end — over-large `max_tokens` can throttle you before a single token is generated. (AWS Bedrock quotas-token-burndown, retrieved 2026-08-27)

## How it works

All four providers throttle on "tokens per minute," but they count very differently — this is the core mechanism to internalize:

- **OpenAI** reserves, per request, `max(max_tokens, character-estimate of request)` against your org/project TPM. Cached input tokens still appear in the request and are subject to prompt-caching minimums (1,024/2,048 tokens); OpenAI's docs don't carve cached tokens out of TPM the way Anthropic does.
- **Anthropic** splits the budget: ITPM counts `input_tokens + cache_creation_input_tokens` (cache reads free for most models), OTPM counts actual output tokens only. Enforcement is a token bucket with continuous refill, so sustained pacing matters more than fixed-window bursts.
- **Gemini** measures only input TPM plus RPM and RPD per project, with an additional spend cap dimension.
- **Bedrock** applies a model-specific "burndown rate" multiplier to output tokens and initially deducts `input + max_tokens`.

Worked example (Bedrock, from AWS docs, retrieved 2026-08-27): a Claude Sonnet 4 request (5x burndown) with InputTokenCount 3,000, CacheRead 4,000, CacheWrite 1,000, Output 1,000 and `max_tokens` 32,000 initially deducts 3,000 + 1,000 + 32,000 = 36,000 tokens from TPM, then is adjusted down to a final 9,000 (3,000 + 1,000 + 1,000×5; the 4,000 cache-read tokens excluded). You are billed only for the real 1,000+1,000+output usage — quota and billing diverge.

Worked example (Anthropic, retrieved 2026-08-27): at 2,000,000 ITPM with an 80% cache hit rate, effective throughput approaches ~10,000,000 input tokens/minute because cache reads bypass the ITPM meter for most models.

## Harness angle

A harness that assumes "TPM = input tokens in" will mispredict throttling on every provider except Gemini. Concrete decision: set `max_tokens` per-request to a realistic ceiling (both OpenAI and Bedrock reserve against it up front), route Anthropic-heavy workloads to maximize prompt-cache reads (they bypass ITPM and cost 10% of input price), and size Bedrock capacity using the burndown multiplier (e.g., a 5x model's effective TPM is far lower than its nominal quota suggests) — so build the router's budget ledger per provider, not from one shared token counter.

## Sources

- OpenAI — Rate limits guide: https://developers.openai.com/api/docs/guides/rate-limits
- OpenAI — Prompt caching guide: https://developers.openai.com/api/docs/guides/prompt-caching
- OpenAI — model page with per-tier RPM/TPM table (example): https://developers.openai.com/api/docs/models/gpt-5.4-mini
- Anthropic — Rate limits: https://platform.claude.com/docs/en/api/rate-limits
- Anthropic — Help Center, approach to rate limits: https://support.claude.com/en/articles/8243635-our-approach-to-rate-limits-for-the-claude-api
- Google — Gemini API rate limits: https://ai.google.dev/gemini-api/docs/rate-limits
- AWS — How tokens are counted in Amazon Bedrock: https://docs.aws.amazon.com/bedrock/latest/userguide/quotas-token-burndown.html
- AWS — Quotas for the bedrock-runtime endpoint: https://docs.aws.amazon.com/bedrock/latest/userguide/quotas-runtime.html
- AWS — Amazon Bedrock endpoints and quotas (General Reference): https://docs.aws.amazon.com/general/latest/gr/bedrock.html
