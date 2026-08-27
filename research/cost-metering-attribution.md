# Token and Cost Metering & Attribution for LLM Applications
researched: 2026-08-27 · researcher: glm-5.3-flash

## Key facts
- OpenAI chat completions return a `usage` object with `prompt_tokens`, `completion_tokens`, and nested detail objects (`prompt_tokens_details.cached_tokens`, `completion_tokens_details.reasoning_tokens`); OpenAI's `prompt_tokens` is **inclusive** of cached tokens. (OpenAI API reference / AWS Bedrock field mapping, fetched 2026-08-27)
- OpenAI discounts cached input tokens "up to 90%" — the cache-read charge is 0.1× the uncached input rate for GPT-5.6-and-later models. (OpenAI prompt-caching guide, fetched 2026-08-27)
- Anthropic's usage object splits input into three **exclusive** buckets: `cache_creation_input_tokens` (5-min write at 1.25× base), `cache_read_input_tokens` (0.1× base), and uncached `input_tokens` (1× base). 1-hour cache writes cost 2× base. Derived: total input = read + write + uncached. (Anthropic prompt-caching docs, fetched 2026-08-27)
- Concrete Anthropic multipliers (per MTok, docs as of 2026-08-27): Claude Opus 5 $5 base input → $6.25 (5m write) / $10 (1h write) / $0.50 (read); Sonnet 4.6 $3 → $3.75 / $6 / $0.30; Haiku 4.5 $1 → $1.25 / $2 / $0.10.
- Anthropic's cache multipliers **stack** with other modifiers (Batch discount, data residency). (Anthropic docs, fetched 2026-08-27)
- Anthropic Batch API charges 50% of standard prices; results are available when all requests complete or after 24 hours, whichever comes first; batches expire (unbilled) at 24 h; errored/canceled/expired requests are not billed. Each result line carries its own `usage` object. (Anthropic batch-processing docs, fetched 2026-08-27)
- Gemini's `usageMetadata` fields: `promptTokenCount` (still the **total** effective prompt including cached content when `cachedContent` is set), `cachedContentTokenCount`, `candidatesTokenCount`, `thoughtsTokenCount` (reasoning tokens, output-only), `totalTokenCount` = prompt + thoughts + candidates. (Gemini generate-content API reference, fetched 2026-08-27)
- AWS Bedrock `TokenUsage` mirrors the pattern: `inputTokens`, `outputTokens`, `totalTokens`, plus `cacheReadInputTokens` / `cacheWriteInputTokens` under cache details. (AWS Bedrock API reference, fetched 2026-08-27)
- LiteLLM returns `response_cost` on every call via `response._hidden_params["response_cost"]`; `cost_per_token(model, prompt_tokens, completion_tokens)` uses the community-maintained `model_prices_and_context_window.json` (e.g. gpt-3.5-turbo at 1.5e-06 input / 2e-06 output USD per token); `register_model` overrides pricing, and `LITTELM_LOCAL_MODEL_COST_MAP`/`LITELLM_LOCAL_MODEL_COST_MAP` pins a local copy for reproducibility. (LiteLLM token-usage docs, fetched 2026-08-27)
- Langfuse computes cost only for `generation`/`embedding` observations at ingestion time: ingested `cost_details` beat inferred costs; inference multiplies exclusive usage buckets by model-definition prices (regex `match_pattern`); OpenAI-style inclusive counts are normalized to exclusive buckets **only** if the payload contains only OpenAI-schema fields. (Langfuse model-usage-and-cost docs, fetched 2026-08-27)
- Langfuse warns reasoning models cannot get inferred cost without ingested token counts, because reasoning tokens aren't visible to it. (Langfuse docs, fetched 2026-08-27)
- OpenMeter's model: idempotent usage **events** keyed by a `subject`, aggregated over time by **meters** (SUM/COUNT-style aggregation), mapped to billable **customers** — designed for AI token metering with deduplication and attribution. (OpenMeter metering overview, fetched 2026-08-27)

## How it works
Every provider reports tokens in the response, but the schemas disagree on one crucial axis: whether input-token buckets are **inclusive or exclusive**. OpenAI counts `prompt_tokens` as one number with cached tokens as a sub-detail; Gemini likewise reports the total prompt including cached content, with `cachedContentTokenCount` as a subset; Anthropic and Bedrock split cache writes and reads into separate additive buckets. Any meter that assumes one convention and meets the other will silently over- or under-count. The safe normalization is to derive four exclusive buckets per request — uncached input, cache-read input, cache-write input, output — and treat reasoning tokens (`completion_tokens_details.reasoning_tokens`, `thoughtsTokenCount`) as part of output but visible separately, since they are billed at output rates yet invisible in the message text.

Per-request cost is then a bucketed multiplication, not a single rate × token count. With Anthropic, the same prompt token can be priced at 1×, 0.1×, or 1.25×/2× depending on whether it was uncached, read from cache, or freshly written; OpenAI charges cached reads at 0.1× for current models; both apply additional multipliers for batch (Anthropic: 50% of standard, explicitly stacked with cache multipliers) or regional/data-residency variants. The correct formula is `Σ bucket_tokens × bucket_rate × modifier`, with the modifier set recorded alongside the meter event so the arithmetic is auditable.

Meters drift from invoices for structural reasons, not just bugs. Batch jobs report usage only when the job completes (up to 24 h later), so a same-day meter undercounts batch spend. Cached-token discounts require the response's cache fields — if your client strips the usage object or your framework doesn't propagate it, you estimate at full rate. Providers bill by *their* tokenizer while harness-side counters (tiktoken guesses, character heuristics) approximate it, so pre-flight estimates diverge from actuals. Price maps go stale between provider updates — LiteLLM mitigates with a hosted live map (and a local pin for reproducibility), Langfuse with a daily automated price audit that only applies to new generations.

Attribution is a metering-schema problem: attach stable identifiers — trace/observation IDs, task/subagent labels, feature or customer keys — to each usage event at emission time (Langfuse traces, OpenMeter subjects), because retrofitting attribution after the fact requires re-deriving it from logs that may no longer carry the usage object.

## Harness angle
Your harness should record the **raw usage object plus the pricing version used**, and normalize to exclusive buckets at the edge (client SDK), never trust a single `total_tokens` field for billing, and reconcile meter totals against provider invoices daily — treating unexplained drift as a schema change (new cache field, new reasoning model, batch job landing) rather than noise.

## Sources
- https://docs.anthropic.com/en/docs/build-with-claude/prompt-caching
- https://docs.anthropic.com/en/docs/build-with-claude/batch-processing
- https://platform.openai.com/docs/guides/prompt-caching
- https://ai.google.dev/api/generate-content
- https://docs.aws.amazon.com/bedrock/latest/APIReference/API_runtime_TokenUsage.html
- https://docs.litellm.ai/docs/completion/token_usage
- https://langfuse.com/docs/model-usage-and-cost
- https://openmeter.io/docs/metering/overview
