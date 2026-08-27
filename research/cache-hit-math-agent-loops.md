# The Arithmetic of Prompt-Cache Savings for Agent Loops
researched: 2026-08-27 · researcher: glm-5.3-flash

## Key facts
- Anthropic prompt caching prices as multipliers of base input price: 5-minute cache write = 1.25x, 1-hour cache write = 2x, cache read = 0.1x (Anthropic "Prompt caching" docs, retrieved 2026-08-27).
- Anthropic caches up to 4 explicit `cache_control: {type: "ephemeral"}` breakpoints per request; the 5-minute TTL refreshes on every hit within the window (Anthropic docs, retrieved 2026-08-27).
- OpenAI: cached input is discounted up to 90% (0.1x) on newest models; for GPT-5.6 and later, cache writes cost 1.25x the uncached input rate while reads cost 0.1x (OpenAI "Prompt caching" guide and Pricing page, retrieved 2026-08-27). Historically caching was free-of-write-charge at a flat 50% discount on GPT-4o ($2.50 → $1.25 per 1M input, OpenAI Prompt Caching 201 cookbook, retrieved 2026-08-27) — the write premium is a recent alignment with Anthropic's model.
- DeepSeek: context caching on disk is on by default; cache-hit input is $0.014/M vs cache-miss $0.14/M for deepseek-chat — exactly 0.1x — with no separate write premium (DeepSeek pricing page and KV-cache guide, retrieved 2026-08-27; current V4-Flash generation lists $0.0028 hit vs $0.14 miss per archive snapshot, retrieved 2026-08-27).
- Gemini: explicit context caching charges both a storage fee (e.g. $4.50/M tokens/hour, Gemini 1.5 Pro era) and a lower per-request read rate (e.g. $0.31/M vs $1.25/M standard ≈ 0.25x) — the only one of the four that prices cache residency by time rather than per write (Google AI docs + Google Developers forum pricing discussion, retrieved 2026-08-27). Implicit caching on Gemini 2.5+ passes savings automatically when hits occur, minimum-cacheable prefix length applies per model (Google AI "Context caching" docs, retrieved 2026-08-27).
- Rule of thumb (derived from the above multipliers): each cache read of a token saves 0.9x its base price; each cache write costs an extra 0.25x (Anthropic 5-min, OpenAI), so a written prefix breaks even once it is read ≥ 0.25/0.9 ≈ 0.28 token-reads — i.e. one reuse already pays for itself. (Arithmetic derived by this digest, 2026-08-27.)

## How it works
Mechanism: the provider hashes the token prefix of your request. If an identical prefix's KV state is resident (within TTL or explicitly pinned), the model skips recomputing it; you pay the read rate instead of the full input rate, plus (Anthropic/OpenAI) a premium when your request first *creates* the cache entry. Agent loops are the best-case workload: the system prompt + tool definitions are byte-stable across turns, so every turn after the first reads the same prefix.

**All numbers below are derived arithmetic (2026-08-27) using the multipliers above; the multipliers themselves are the dated sourced facts.**

(a) **Agent loop, 25 turns.** Assume a stable prefix (system + tools) of 8,000 tokens, each turn appends ~1,000 new tokens of history/output, and full-history resend (plain chat completion style). Use Anthropic 5-min multipliers (write 1.25x, read 0.1x) and normalize price in "base-input units" (1 unit = price of 1 token at full rate).
- Total input tokens over 25 turns: turn k resends 8,000 + 1,000·k tokens, so Σ = 25·8,000 + 1,000·(1+2+…+25) = 200,000 + 325,000 = 525,000 tokens.
- No caching: 525,000 units.
- With caching (prefix stable, history grows so only the 8k prefix caches): turn 1 writes 8,000 at 1.25x = 10,000 units; turns 2–25 read 8,000 at 0.1x = 800 units each = 19,200; the growing history is uncached: 325,000 units. Total ≈ 10,000 + 19,200 + 325,000 = 354,200 units — about **32.5% cheaper** overall. If you also cache the growing conversation (chat-style increment caching, as API providers do automatically), every incremental 1,000-token block is written once (1.25x) and read on later turns (0.1x): cost ≈ 8,000·1.25 + Σ(history reads at 0.1x) ≈ 10,000 + 800·24 + 0.1·324,000 ≈ 55,000 units — roughly **90% cheaper** than no caching. Same 0.1x math applies to OpenAI's newest models and DeepSeek (write premium only on OpenAI ≥ GPT-5.6; none on DeepSeek).

(b) **Write-overhead amortization crossover.** Write premium = 0.25x extra per token; read saving = 0.9x per token per reuse. Break-even after N reuses: 0.25 ≤ 0.9·N → N ≥ 0.28. So one cache read (a second request within TTL) already recovers the write premium; every further read is pure 0.9x/token savings. The 1-hour write (2x, premium 1.0x) needs 1.0/0.9 ≈ 1.11 reuses — still two uses total. Caching a prefix that is never re-read is the only losing case: 25% surcharge (Anthropic 5-min / OpenAI GPT-5.6+).

(c) **TTL expiry mid-session (re-write cost).** If Anthropic's 5-minute TTL lapses before the next turn (user idle, long tool execution, human-in-the-loop pause), the next request re-writes the prefix at 1.25x instead of reading at 0.1x: an 8,000-token prefix costs 10,000 units instead of 800 — a **12.5x penalty on that turn**, i.e. roughly the read cost of ~11 cache hits is forfeit. For a long idle stretch, the 1-hour write at 2x (16,000 units once) beats repeatedly re-writing at 1.25x if the prefix would otherwise expire more than ~2 times per hour (crossover: 2.0/1.25 = 1.6 rewrites). DeepSeek's disk cache has no explicit TTL charge; Gemini's explicit cache instead bills storage ($4.50/M tokens/hour for 1.5 Pro-era pricing — a 5k-token pinned context costs ≈ $0.0225/hour regardless of traffic).

(d) **10k-request fanout sharing one 5k-token prefix.** Fan-out pattern: one large shared document/toolset (5,000 tokens) + a small per-request suffix. Without caching: 10,000 × 5,000 = 50M units. With caching (Anthropic 5-min TTL, keep-alive hits refresh it): one write 5,000×1.25 = 6,250 units + 9,999 reads × 5,000×0.1 = 4,999,500 units → ≈ 5.01M units, **~90% cheaper**. DeepSeek identical shape at 0.1x with no write premium (5,000,000 units). Practical caveat: providers route requests across cache-aware serving tiers, so not every concurrent request hits — OpenAI's docs note caching is best-effort and hit rates drop at high fan-out concurrency (OpenAI prompt-caching guide, retrieved 2026-08-27).

## Harness angle
Put the stable prefix (system prompt + full tool schemas + few-shot block) at the *front* of every request, byte-identical, and never reorder tools between turns — any change invalidates the cached prefix and silently converts the whole agent loop to full-price input. Concretely: budget the write premium (1.25x) as a one-time cost per session, keep inter-turn gaps inside the 5-minute TTL (heartbeat or switch to the 1-hour/2x write for tool calls that can run long), and monitor `cache_read_input_tokens` vs `cache_creation_input_tokens` in the provider usage fields as a first-class agent metric.

## Sources
- Anthropic — Prompt caching (docs): https://platform.claude.com/docs/en/build-with-claude/prompt-caching
- OpenAI — Prompt caching guide: https://developers.openai.com/api/docs/guides/prompt-caching
- OpenAI — Pricing: https://developers.openai.com/api/docs/pricing
- OpenAI — Prompt Caching 201 cookbook: https://developers.openai.com/cookbook/examples/prompt_caching_201
- OpenAI — Prompt Caching announcement (50% discount launch): https://openai.com/index/api-prompt-caching/
- DeepSeek — Context Caching guide: https://api-docs.deepseek.com/guides/kv_cache/
- DeepSeek — Context Caching on Disk news ($0.014/M hit): https://api-docs.deepseek.com/news/news0802/
- Google — Gemini context caching docs: https://ai.google.dev/gemini-api/docs/caching
- Google Developers forum — Gemini cache pricing analysis ($4.50/M/hr, $0.31/M reads): https://discuss.google.dev/t/peculiar-pricing-of-context-caching-and-potential-plans-for-prefix-caching-support/194137/1
