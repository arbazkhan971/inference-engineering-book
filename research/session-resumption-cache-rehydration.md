# Agent Session Resume and Cache Rehydration
researched: 2026-08-27 · researcher: glm-5.3-flash

## Key facts

- Anthropic's prompt cache has a **5-minute default TTL**, and "the cache is refreshed for no additional cost each time the cached content is used"; the lifetime is measured **from the start of the request** that writes or reads the entry, not from response completion — a 4-minute streaming response leaves only ~1 minute to hit the cache again (Anthropic Prompt Caching docs, retrieved 2026-08-27).
- A **1-hour TTL** is available via `{"type": "ephemeral", "ttl": "1h"}`. Pricing multipliers: 5-minute cache writes are **1.25×** base input price, 1-hour writes are **2×**, and cache reads are **0.1×** (e.g., Claude Opus 5: $5/MTok base input, $6.25/MTok 5m write, $10/MTok 1h write, $0.50/MTok read; Claude Sonnet 5: $2 / $2.50 / $4 / $0.20 per MTok) (Anthropic Prompt Caching docs, retrieved 2026-08-27).
- Minimum cacheable prefix: **512 tokens** for Claude Opus 5, **1,024 tokens** for Claude Sonnet 5 / Opus 4.8, **4,096 tokens** for Opus 4.5/4.6 and Haiku 4.5; shorter prefixes are processed without caching and silently return no error (Anthropic Prompt Caching docs, retrieved 2026-08-27).
- Cache lookback is **20 blocks** per breakpoint, with at most **4 breakpoints** per request; writes happen only at breakpoints, and reads walk backward looking for prior writes — a conversation that grows more than 20 blocks past the last write misses the cache entirely (Anthropic Prompt Caching docs, retrieved 2026-08-27).
- Claude Code re-sends the **full context on every turn**: "the system prompt, your project context, every prior message and tool result, and your new message." The model has no memory between requests; caching is what avoids reprocessing the unchanged prefix (Claude Code "How Claude Code uses prompt caching" docs, retrieved 2026-08-27).
- Claude Code orders the request in three layers — **system prompt / project context / conversation** — and changes at a higher layer invalidate everything below it: switching models, changing effort level, toggling MCP servers whose tools load into the prefix, `/compact`, and Claude Code upgrades all force a full re-read (Claude Code docs, retrieved 2026-08-27).
- Claude Code picks the TTL per request bucket: the **main conversation gets the 1-hour TTL** on a Claude subscription within plan usage, but drops to **5 minutes** on API keys, usage credits, or cloud providers; subagents, workflows, forks, and compaction requests default to 5 minutes. Users can override with `promptCacheTtl` / `CLAUDE_CODE_PROMPT_CACHE_TTL` (`5m` or `1h`, requires Claude Code v2.1.242+) (Claude Code docs, retrieved 2026-08-27).
- Documented resume pain: a Claude Code GitHub issue (#42338) reports that `--continue`/`/resume` on a ~500k-token Opus 4.6 session forced a **full cache_creation of 400–500k tokens on each re-entry**, silently consuming rate limits (GitHub issue, retrieved 2026-08-27). Issue #71659 reports `--resume` reprocessing an entire prior session on launch, exhausting a Pro 5-hour window in ~1 hour of light work (GitHub issue, retrieved 2026-08-27).
- Third-party analysis (March 2026, Brandon Wie) estimated that on a 200K-token Opus session, a cold resume costs roughly **$1.25 per resume** (1.25× write on the whole prefix), and idle gaps ≥5 minutes can raise per-session cost 30–60% across a working day (vendor blog, retrieved 2026-08-27 — treat as an estimate, not an official figure).
- Re-prefill latency, hedged: a 100K-token prompt on a 70B model was estimated at **8–10 seconds of GPU prefill time** (vendor blog, retrieved 2026-08-27); vLLM automatic prefix caching tests on Qwen3-32B measured **TTFT dropping 78% (4.3 s → 0.97 s)** when the shared prefix hit cache (vendor benchmark, retrieved 2026-08-27). No provider-official re-prefill latency numbers at N tokens were found.
- Community systems-engineering writing (retrieved 2026-08-27, not vendor-official) estimates prefill consumes **85–95% of GPU compute per request** for 8K–128K-token agent prompts, motivating predictive cache warming/session prefetching.

## How it works

An LLM has no memory. Every turn, the harness serializes the *entire* session state — tool definitions, system prompt, project context, all prior messages and tool results — into one request. The provider hashes the prompt prefix and keeps the computed KV (attention key/value) tensors for that prefix. If the next request starts with the byte-identical prefix, the provider skips prefill for that portion and bills it at 0.1× the input rate.

When a session idles longer than the TTL (5 minutes by default), the KV tensors are evicted. On resume, nothing is salvageable: the provider re-runs prefill over the entire transcript and bills it as a **cache write at 1.25× base price** (5-minute TTL) — you pay a 25% *premium* to rebuild what you previously computed. The user-visible symptom is a TTFT spike proportional to transcript length, plus a one-turn jump in token spend.

Worked example (Opus 5 pricing, retrieved 2026-08-27): resume a session whose cached prefix is 200,000 tokens after a 10-minute break.
- Warm path (cache still alive): 200,000 × $0.50/MTok read = **$0.10**, TTFT ≈ decode-scale latency.
- Cold path (TTL expired, 5-minute TTL rebuild): 200,000 × $6.25/MTok write = **$1.25** — 12.5× the warm cost, plus a multi-second prefill of the full 200K tokens before the first token streams.
- With the 1-hour TTL the write is 200,000 × $10/MTok = **$2.00**, but a break of up to an hour still hits cache at $0.10.

This arithmetic is why Claude Code itself now requests the 1-hour TTL for main-conversation turns on subscription plans and offers "resume from a summary" (compaction) after long breaks: summarizing a cold session re-reads the full history once as uncached input, but every subsequent turn carries only the short summary.

Session forking exploits prefix sharing: a fork that replays the identical transcript bytes shares the parent's cached prefix, so the fork's first request is a cheap 0.1× cache read plus prefill of only the new branch content. But the match is exact and hash-cumulative — any edit to an early message, a different tool set, a different model, or even a different working directory embedded in Claude Code's system prompt produces a different hash and a full re-write. The 20-block lookback window means a harness that appends more than ~20 blocks between breakpoints will silently miss the older write.

## Harness angle

**Persist transcripts byte-exactly and replay them verbatim on resume; never rewrite history on the way back in.** A harness that "cleans up" or re-formats old messages on resume destroys the prefix hash match and converts a $0.10 cache read into a $1.25-per-200K-tokens cache write plus a full re-prefill. For sessions likely to idle past 5 minutes, pick the 1-hour TTL explicitly (or keep sub-5-minute keep-alive traffic), and treat session forking as free only when the fork replays the parent transcript byte-for-byte with the same model and tool set.

## Sources

- Anthropic — Prompt caching (official docs): https://platform.claude.com/docs/en/build-with-claude/prompt-caching
- Claude Code — How Claude Code uses prompt caching: https://code.claude.com/docs/en/prompt-caching
- Claude Code — Manage sessions (`--continue`, `--resume`, transcript storage): https://code.claude.com/docs/en/sessions
- GitHub — claude-code issue #42338, resume invalidates prompt cache, 400–500k token re-writes: https://github.com/anthropics/claude-code/issues/42338
- GitHub — claude-code issue #71659, `--resume` silent token drain: https://github.com/anthropics/claude-code/issues/71659
- AWS Bedrock — Prompt caching docs (per-model minimums): https://docs.aws.amazon.com/bedrock/latest/userguide/prompt-caching.html
- Brandon Wie — Anthropic Prompt Cache TTL + Cost Mechanics (cost estimate): https://brandonwie.dev/posts/anthropic-prompt-cache-ttl
- GingerLabs — vLLM KV cache reuse benchmark (TTFT 4.3s → 0.97s): https://gingerlabs.ai/blog/kv-cache-reuse-vllm
- llms.blog — Predictive KV cache warming / session prefetching (prefill share estimate): https://www.llms.blog/posts/predictive-kv-cache-warming-in-production-llm-serving-architecture-session-prefetching-and-ttft-latency-shaving
