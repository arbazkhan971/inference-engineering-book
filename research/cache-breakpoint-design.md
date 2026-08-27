# Engineering cacheable prompts: invalidation rules, breakpoints, and prefix-stable harness design
researched: 2026-08-27 · researcher: glm-5.3-flash

## Key facts

- Anthropic prompt caching is a strict prefix match: the cache key is derived from the exact bytes of the rendered prompt from the start up to each `cache_control` breakpoint; one byte difference anywhere invalidates every breakpoint at or after that position. (Anthropic Prompt Caching docs, retrieved 2026-08-27)
- Render/invalidation order is `tools` → `system` → `messages`. Changing tool definitions (names, descriptions, parameters) invalidates the *entire* cache; changing the system prompt invalidates system + messages; changes inside messages invalidate only messages. (Anthropic Prompt Caching docs, retrieved 2026-08-27)
- Anthropic allows up to **4** explicit cache breakpoints per request (automatic caching consumes one of the four slots; a 5th returns a 400 error), with a **20-block lookback window** per breakpoint. (Anthropic Prompt Caching docs, retrieved 2026-08-27)
- Anthropic pricing: cache **write 1.25×** base input price (5-min TTL) or **2×** (1-hour TTL); cache **read 0.1×** base input price (a 90% discount on hits). TTL is measured from request start and generation time counts against it — a 4-minute streamed response leaves ~1 minute to start the follow-up before the 5-minute cache expires. (Anthropic Prompt Caching docs, retrieved 2026-08-27)
- Minimum cacheable prompt length on Anthropic is per-model: **512 tokens** for Opus 5, **1,024 tokens** for Opus 4.8 / Sonnet 5 / Sonnet 4.6 / 4.5, **4,096 tokens** for Opus 4.6/4.5 and Haiku 4.5. Shorter prompts are processed uncached with no error. (Anthropic Prompt Caching docs, retrieved 2026-08-27)
- OpenAI caching is automatic (no breakpoints, no opt-in) and applies to prompts longer than **1,024 tokens**, with cached input billed at a **50% discount**; reuse requires the entire rendered prefix to match byte-for-byte. (OpenAI "Prompt Caching in the API" + Prompt caching guide, retrieved 2026-08-27)
- OpenAI reports caching can cut time-to-first-token latency by up to **80%** and input cost by up to **90%** on long repetitive prefixes. (OpenAI Cookbook, Prompt Caching 101/201, retrieved 2026-08-27)
- Named cache-breakers per Anthropic: timestamps or a current date injected into the static system prompt; nondeterministic tool ordering (shuffled tool lists, or Swift/Go serializers randomizing `tool_use` key order); toggling web-search/citations/`tool_choice`; adding or removing images; changing thinking parameters; switching models mid-session (caches are per-model). (Anthropic docs + Claude Code blog, retrieved 2026-08-27)
- Claude Code's stable-first layering: (1) static system prompt + tools (globally cached), (2) CLAUDE.md project context, (3) session context, (4) growing conversation. Anthropic recommends `<system-reminder>` messages rather than system-prompt edits to convey dates or file-state changes. (Anthropic "Lessons from building Claude Code", retrieved 2026-08-27)
- Incremental-caching pattern: put `cache_control` on the last block that stays identical across requests; because each breakpoint looks back at most **20 blocks**, add a second checkpoint before the tail grows more than 20 blocks past the first; cache hits refresh the TTL for free. (Anthropic Prompt Caching docs, retrieved 2026-08-27)
- Tool-heavy agents should use `defer_loading` (tool stubs plus tool search) instead of adding/removing tools mid-session, preserving the cached prefix. (Anthropic Tool use with prompt caching docs, retrieved 2026-08-27)
- Claude Code monitors prompt cache hit rate as a production metric and declares SEVs when it drops; "a few percentage points of cache miss rate can dramatically affect cost and latency." (Anthropic Claude Code blog, retrieved 2026-08-27 — no specific hit-rate percentages published)

## How it works

The provider stores the model's internal compute state (KV cache) for a given byte-exact prompt prefix. On the next request it compares the rendered prompt, byte for byte, from position zero; at the first difference everything after that point is recomputed and re-written to cache. Because the render order is tools, then system, then messages, a one-character edit to a tool description throws away the whole cache, while appending a new user message costs nothing.

Worked example (Anthropic-style, Sonnet-class model with a 1,024-token minimum): a harness sends 8,000 tokens of tool definitions + system prompt, then conversation. Cache write on turn 1 costs 8,000 × 1.25 = 10,000 token-units; every later turn that only appends messages reads those 8,000 tokens at 0.1× = 800 token-units — a 92% saving versus 8,000 full-price units per turn. If instead the harness stamps `Current time: 14:03` into the system prompt, every turn is a fresh 1.25× write of the entire prefix (10,000 units/turn) plus full re-prefill latency.

Breakpoint allocation for a long conversation (4 available): breakpoint 1 on the last tool/system block; breakpoint 2 on the last stable context message (few-shot examples, documents that won't change); breakpoints 3 and 4 leapfrogged onto the newest message whenever the tail would grow more than 20 blocks past the older checkpoint. The "checkpoint-on-change" pattern: when you must mutate content (a re-fetched document), insert the mutated block *after* the furthest stable breakpoint so only the tail's cache is lost, never the head.

## Harness angle

Order every prompt as tools → system → few-shot/static context → volatile tail, and never inject timestamps, dates, or session IDs above the last shared breakpoint — deliver per-turn state via appended messages (or `<system-reminder>` blocks) instead. Additionally, track cache hit rate as a first-class production alert: Claude Code treats cache breaks as incidents, and single-digit miss-rate regressions materially change cost and latency.

## Sources

- Anthropic, Prompt Caching (docs): https://platform.claude.com/docs/en/build-with-claude/prompt-caching
- Anthropic, Tool use with prompt caching: https://platform.claude.com/docs/en/agents-and-tools/tool-use/tool-use-with-prompt-caching
- Anthropic, Lessons from building Claude Code: Prompt caching is everything: https://claude.com/blog/lessons-from-building-claude-code-prompt-caching-is-everything
- Claude Code docs, How Claude Code uses prompt caching: https://code.claude.com/docs/en/prompt-caching
- Anthropic Cookbook, Prompt caching: https://platform.claude.com/cookbook/misc-prompt-caching
- Anthropic skills repo, prompt-caching design notes: https://github.com/anthropics/skills/blob/main/skills/claude-api/shared/prompt-caching.md
- OpenAI, Prompt caching guide: https://developers.openai.com/api/docs/guides/prompt-caching
- OpenAI, Prompt Caching in the API (announcement): https://openai.com/index/api-prompt-caching/
- OpenAI Cookbook, Prompt Caching 201: https://developers.openai.com/cookbook/examples/prompt_caching_201
