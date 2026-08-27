# Context Compaction Tradeoffs: Mechanics, Information Loss, and the Hidden Cache Cost

researched: 2026-08-27 · researcher: glm-5.3-flash

## Key facts

- **Claude Code auto-compact trigger.** Auto-compact fires when the conversation's input tokens approach the model's effective context window; the threshold is computed as `effectiveContextWindow − autocompactBufferTokens` in Claude Code's own source (`src/services/compact/autoCompact.ts`, retrieved 2026-08-27), with a `CLAUDE_AUTOCOMPACT_PCT_OVERRIDE` env var to move the percentage. A third-party deep-dive of the client reports a **13K-token buffer below the effective window** as the trigger and token counting via a hybrid of API usage data plus a characters÷4 heuristic (Inside Claude Code deep-dive, retrieved 2026-08-27 — unofficial reverse-engineering, treat as indicative).
- **How the summary request is made.** The compaction call reuses the existing system prompt, tools, and history with a summarization instruction appended — a single extra request (`maxTurns=1`, no tools), so it reads the existing prompt cache rather than reprocessing history (Claude Code docs on prompt caching, retrieved 2026-08-27; Inside Claude Code, retrieved 2026-08-27).
- **Compaction is now a platform API.** Anthropic's Compaction endpoint ("Compaction," Claude Platform Docs, retrieved 2026-08-27): when enabled, the API detects when input tokens reach a configured threshold, generates a summary, returns a `compaction` block, and on subsequent requests **automatically drops all content blocks from before the compaction point**.
- **Cache invalidation is the undocumented cost.** Anthropic prompt caching matches an **exact prefix**; any mutation of history — including replacing it with a summary — is a hard semantic break that invalidates all prior cached prefixes, forcing a full re-prefill at full input price (Claude Code prompt-caching docs and Anthropic prompt-caching API reference, retrieved 2026-08-27). Claude cached input is billed at **0.10× the standard input rate (a 90% discount)** on unchanged prefixes within TTL (Anthropic pricing via dreaming.press analysis, retrieved 2026-08-27). **No provider publishes guidance pricing this re-prefill cost**; the tradeoff is documented only in third-party analyses.
- **TokenPilot (Zhejiang Univ., arXiv 2606.17016, June 2026)** names the tradeoff explicitly: existing pruning/eviction methods cause "prefix mismatches and cache invalidation," a "critical trade-off between text sparsity and prompt cache continuity." Their cache-aware dual-granularity management reduces inference cost **up to 87% in continuous task streams** while preserving task performance (arXiv abstract, retrieved 2026-08-27).
- **Information loss is severe and measurable.** The "lost-in-compaction" benchmark (profff/lost-in-compaction, Zenodo DOI 10.5281/zenodo.20273814, retrieved 2026-08-27) reports: baseline recall of injected facts at 190K tokens = **73%**; after 50% compaction = **40% (−33pp)**; after 98% compaction = **7% (−66pp)**.
- **Side constraints barely survive.** "Lost in Compaction: Evaluating Side-Constraint Loss under Context Compaction" (arXiv 2608.11242, retrieved 2026-08-27): across tested compactors, **only 17% of injected side constraints survive compaction on average**, and most compactors leave the model *less* compliant than no compaction at all; an SC-aware extractor module using a small model (reported as Qwen3.5-9B) recovers **>90% retention** without modifying the compactor.
- **MemGPT/Letta memory paging.** MemGPT (arXiv 2310.08560, 2023) borrows OS virtual-memory paging: a fixed main context plus external storage, with the LLM itself issuing function calls (`core_memory_replace`, `archival_memory_insert`, conversation search) to page data in and out. Letta docs recommend keeping **core (in-context) memory under 80% of the context window**, with archival memory in a searchable vector DB (Letta skill docs, retrieved 2026-08-27).
- **LangGraph session-memory practice.** Official LangGraph docs list four strategies for conversations exceeding the window: trim first/last N messages, delete messages from state, **summarize past messages and replace them with a summary**, and manage checkpoints; LangMem ships a prebuilt `summarize_messages` / `SummarizationNode` that triggers when a token limit is exceeded and threads a running summary forward (docs.langchain.com and LangMem guides, retrieved 2026-08-27). OpenAI's prompt caching is automatic above a token threshold and discounts cached input up to 90% (OpenAI prompt-caching guide, retrieved 2026-08-27), so the same rewrite-invalidates-cache trap applies to OpenAI Agents SDK sessions that prune history.

## How it works

Compaction replaces older turns with a model-generated summary. Claude Code's auto-compact triggers near the window limit, makes one cache-warm summarization request over the existing prefix, then builds the **next** request as [system prompt + tools + summary + recent turns] — a brand-new prefix. Because prompt caches match byte-exact prefixes, every token after the rewritten point must be re-prefilled at full price. The cost structure is asymmetric: you save on every future turn (fewer tokens, mostly cache-hits again) but pay a one-time re-prefill whose size equals the post-compaction context.

Worked example (mechanism-level, using the 0.10× cached rate cited above; no provider publishes a compaction-specific cost table, so figures below are derived, not sourced): a session with 150K cached tokens costs ~15K-token-equivalents per turn to re-read. After compaction to a 30K-token context (summary + recent turns), the next turn re-prefills 30K at full price (30K-equivalents — a 2× worse single turn), but each subsequent turn re-reads only 30K cached (3K-equivalents — 5× cheaper per turn than before). Compaction pays off when many turns remain; it wastes money if the session was about to end. Meanwhile the "lost-in-compaction" numbers say 50% compaction dropped recall from 73% to 40% — the summary is lossy exactly where agent correctness lives (parameters, paths, side constraints).

## Harness angle

Compact **at turn boundaries where a long future horizon justifies the re-prefill, not automatically at the buffer threshold** — and preserve verbatim critical artifacts (side constraints, IDs, file paths, plan state) outside the summary, e.g., in a Letta-style always-in-context core-memory block or structured state file, since compactors retain only ~17% of side constraints on their own (arXiv 2608.11242, retrieved 2026-08-27). If your harness compacts rarely but runs long, cache amortization wins; if it compacts often, consider cache-aware layout (append-only logs, TokenPilot-style alignment) instead of destructive rewrites.

## Sources

- https://platform.claude.com/docs/en/build-with-claude/compaction
- https://code.claude.com/docs/en/prompt-caching
- https://arxiv.org/abs/2310.08560 (MemGPT)
- https://docs.langchain.com/oss/python/langgraph/add-memory
- https://langchain-ai.github.io/langmem/guides/summarization/
- https://arxiv.org/html/2606.17016v1 (TokenPilot)
- https://arxiv.org/html/2608.11242v1 (Lost in Compaction: side constraints)
- https://github.com/profff/lost-in-compaction
- https://developers.openai.com/api/docs/guides/prompt-caching
- https://manavgup.github.io/shipai/deep-dives/claude-code/06-context-autocompact.html
