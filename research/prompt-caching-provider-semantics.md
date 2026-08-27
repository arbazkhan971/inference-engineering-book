# Provider prompt-cache semantics: Anthropic, OpenAI, Gemini, DeepSeek (2026 snapshot)
researched: 2026-08-27 · researcher: glm-5.3-flash

## Key facts
- **Anthropic — opt-in breakpoints.** Caching requires `cache_control: {"type": "ephemeral"}` markers. Max **4 cache breakpoints** per request (an automatic breakpoint consumes one of the 4; exceeding returns a 400 error). Cache reads look back up to **20 blocks** before a breakpoint to find a matching cached prefix. (Anthropic docs, retrieved 2026-08-27)
- **Anthropic — minimum cacheable prefix varies by model:** 512 tokens (Opus 5 / Fable 5 / Mythos 5), 1,024 tokens (Opus 4.8, Sonnet 4.5–5), 2,048 tokens (Haiku 3.5, Opus 4.7), 4,096 tokens (Haiku 4.5, Opus 4.5/4.6). Shorter prefixes are processed uncached with no error. (Anthropic docs, retrieved 2026-08-27)
- **Anthropic — pricing multipliers:** 5-minute cache write = **1.25×** base input price; 1-hour cache write = **2×**; cache read = **0.1×**. These stack with Batch API discounts. (Anthropic docs, retrieved 2026-08-27)
- **Anthropic — TTL behavior:** default **5-minute TTL, refreshed for free on every cache read**; lifetime measured from the *start* of the request (a 4-minute streaming response leaves ~1 minute of life). Optional `ttl: "1h"` via cache_control; 1-hour entries must precede 5-minute entries. (Anthropic docs, retrieved 2026-08-27)
- **OpenAI — automatic by default.** Prompt caching is enabled by default; minimum cacheable prefix is **1,024 visible tokens for GPT-5.6+** and **2,048 for older models**; hidden system tokens don't count. (OpenAI docs, retrieved 2026-08-27)
- **OpenAI — pricing split by generation.** GPT-5.6+: cache reads at **0.1×** input rate, cache **writes charged at 1.25×** (reported as `cache_write_tokens`). Earlier models: model-dependent cached-input rate ("discounted up to 90%", historically 50% at launch Oct 2024) with **no write charge**. (OpenAI docs + launch post, retrieved 2026-08-27)
- **OpenAI — TTL and routing.** GPT-5.6+ entries last **at least 30 minutes** after last use (`prompt_cache_options.ttl`, only value `"30m"`); reuse refreshes lifetime with no extra write fee. Traffic above **~15 requests/minute** per org can overflow-route to machines without the cached state (miss). Optional `prompt_cache_key` groups routing. Explicit breakpoints exist on GPT-5.6+ only. (OpenAI docs, retrieved 2026-08-27)
- **Gemini — implicit caching.** Automatic on Gemini 2.5+; minimum thresholds per docs: **2,048 tokens** (2.5 Pro/Flash) and **4,096 tokens** (3.x Flash/Pro-family models). No cost-saving guarantee; cached tokens billed at **10% of input price** (e.g., 2.5 Pro cached $0.125 vs input $1.25 per 1M; 3 Pro $0.20 vs $2.00; 3 Flash-tier $0.075 vs $0.75 through 2026-12-31). (Google AI docs, retrieved 2026-08-27)
- **Gemini — explicit context caching API.** `client.caches.create` with `ttl` or `expire_time` (default TTL **1 hour**, no min/max bounds, updatable later). Storage billed per token-hour: **$4.50/1M tokens/hour** for Pro models, **$1.00** for 2.5 Flash, **$0.50** for 3 Flash-tier through 2026. (Google AI pricing/docs, retrieved 2026-08-27). A doc-mentioned guideline that a cache pays for itself only after roughly 3 additional requests could **not be confirmed** on the 2026-08-27 page — treat as hedged.
- **DeepSeek — automatic disk caching.** Context Caching on Disk is on by default; overlapping prefixes hit a persisted disk cache. Cache-hit input priced at roughly **0.1×** the cache-miss rate (e.g., V3-era $0.07 vs $0.27 per 1M; 2026 V4-Flash $0.0028 vs $0.14). (DeepSeek API docs + news post, retrieved 2026-08-27)

## How it works
All four providers cache the **KV state of an exact token prefix**; none do semantic matching. On a hit, the engine skips prefill for that prefix and bills it at the cached rate.

- **Anthropic:** you place up to 4 breakpoints. On the write request you pay 1.25× (or 2× for 1h TTL) on cached-prefix tokens; every read within the TTL costs 0.1× and resets the 5-minute clock for free.
- **OpenAI:** automatic; routing uses a hash of the leading tokens (after hidden system content incl. tools). Newer models (GPT-5.6+) mirror Anthropic's economics: 0.1× reads, 1.25× writes.
- **Gemini:** implicit hits are opportunistic (threshold-gated); explicit caches are durable objects you pay storage for by the hour.
- **DeepSeek:** fully transparent — prefixes persist to a distributed disk array and hits are billed automatically at ~0.1×.

**Worked example (Anthropic, $3/1M-input model, 100k-token stable system+tools prefix, 10 turns):**
- Turn 1 write: 100,000 × $3 × 1.25 = **$0.375**.
- Turns 2–10 reads: 9 × 100,000 × $3 × 0.1 = **$0.270**.
- Total cached: $0.645. Uncached would be 10 × 100,000 × $3 = $3.00. **~79% saving**, and break-even occurs on the second request (write premium 0.25× is repaid by the first 0.9× read discount).
- Same prefix on Gemini explicit cache (Pro, $4.50/1M/hr, 1h TTL): storage = 100k/1M × $4.50 = **$0.45/hour**, plus reads at 0.1× — profitable only with high request volume inside the hour.

## Harness angle
Prompt-layout order becomes a **billing decision**: put stable content (tools, system prompt, few-shot examples) at the *front* of the context, volatile content at the end, and on Anthropic place breakpoints at the boundary — one misplaced per-turn message in the middle of the prefix silently drops the hit rate to zero across all four providers, and on Anthropic/GPT-5.6+ every layout change re-pays the 1.25× write premium. Harnesses should also run a keep-alive tick under the 5-minute/30-minute TTL windows and watch provider-reported usage fields (`cache_read_input_tokens`, `cached_tokens`, `cache_write_tokens`) as a first-class metric.

## Sources
- Anthropic — Prompt caching (official docs): https://platform.claude.com/docs/en/build-with-claude/prompt-caching
- OpenAI — Prompt caching guide (official docs): https://developers.openai.com/api/docs/guides/prompt-caching
- OpenAI — Prompt Caching in the API (launch announcement): https://openai.com/index/api-prompt-caching/
- OpenAI — Prompt Caching 201 cookbook: https://developers.openai.com/cookbook/examples/prompt_caching_201
- Google — Context caching, generateContent API (official docs): https://ai.google.dev/gemini-api/docs/generate-content/caching
- Google — Gemini API pricing (official): https://ai.google.dev/gemini-api/docs/pricing
- Google — Context caching API reference: https://ai.google.dev/api/caching
- DeepSeek — Context Caching on Disk (official docs): https://api-docs.deepseek.com/guides/kv_cache/
- DeepSeek — Context Caching news post: https://api-docs.deepseek.com/news/news0802/
