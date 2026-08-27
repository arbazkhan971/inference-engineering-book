# Model vs serving vs harness: who owns which failure

researched: 2026-08-27 · researcher: glm-5.3-flash

## Key facts

- Anthropic documents **529 `overloaded_error`** as "The API is temporarily overloaded," occurring "when the API experiences high traffic across all users" — a serving-layer signal by definition (Claude API errors docs, accessed 2026-08-27).
- Anthropic also returns **429 `rate_limit_error`** from *acceleration limits* when an organization's usage ramps up sharply, advising gradual traffic ramp-up (Claude API rate limits docs, accessed 2026-08-27).
- A spend-cap 429 carries **no `retry-after` header** and "keeps failing until access resumes" — retrying it is pure harness waste (Claude API rate limits docs, accessed 2026-08-27).
- Anthropic states limits "represent maximum allowed usage, **not guaranteed minimums**" — quota is an admission-control contract, not a capacity SLA (Claude API rate limits docs, accessed 2026-08-27).
- Official Anthropic SDKs auto-retry transient failures (connection errors, rate limits, 5xx) with exponential backoff, **twice by default**, honoring `retry-after` (Claude API errors docs, accessed 2026-08-27).
- On streaming responses, an error can arrive **after HTTP 200** as an SSE error event, outside normal status-code handling (Claude API errors docs, accessed 2026-08-27).
- Dated serving incidents: Anthropic logged a **critical "Service disruption on Claude services" on 2026-08-16 (21:58–22:34 UTC, ~36 min)** spanning claude.ai, the API, Claude Code, and Claude Cowork, and a **major "Elevated errors on requests to multiple models" on 2026-08-20 (19:16–19:42 UTC, ~26 min)**; August 2026 also shows repeated "Degraded performance for multiple models" entries (Aug 3–19) (status.anthropic.com incident API, retrieved 2026-08-27).
- OpenAI logged "elevated latency, timeouts, and interrupted streaming across gpt 5.1 mini model and gpt 4.1 mini," resolved 2026-07-27 — degradation scoped to **specific models on one provider**, not the model being "dumber" (status.openai.com incident API, retrieved 2026-08-27).
- "Lost in the Middle": model performance on retrieval tasks "is often highest when relevant information occurs at the beginning or end of the input context, and significantly degrades" for information buried in the middle, "even for explicitly long-context models" (Liu et al., arXiv:2307.03172, TACL 2023, v3 2023-11-20).
- "Context rot": as tokens in the context window increase, the model's ability to accurately recall information from that context decreases — "this characteristic emerges across all models" (Anthropic engineering blog, published 2025-09-29).
- Retry amplification: with a 3-attempt budget, retried request volume can grow to "just below 3X"; adding a per-client cap of 10% retry ratio reduces worst-case growth to **1.1x** (Google SRE Book, ch. 21 "Handling Overload," accessed 2026-08-27).
- Cache-hostile prefix mechanics: Anthropic prompt caching stores the full prefix — **tools, system, then messages in that order** — up to a cache breakpoint, with **4 available breakpoint slots**, a **5-minute default TTL** refreshed on use, and a 1-hour option at additional cost; any change before the breakpoint forfeits the stored prefix (Claude prompt caching docs, accessed 2026-08-27).
- OpenAI guidance: treat `Retry-After` "as a minimum," add a small random delay "so multiple clients don't retry at the same time," never retry quota/billing errors, and account for SDK-level retries when adding application-level retries (OpenAI rate limits guide, accessed 2026-08-27).

## How it works

Every agent failure lands in exactly one of three layers, and each layer has a monopoly on its own fix.

**Model layer.** The weights and their trained behavior. Failures here are wrong-but-confident answers, refusals, stale knowledge past the training cutoff, and position-dependent retrieval: the model literally reads a long prompt but under-uses its middle (Liu et al., TACL 2023; Anthropic "context rot," 2025-09-29). No amount of retries, capacity, or routing changes these outputs, because the computation is deterministic given the prompt. Only a different model, a different checkpoint, or a different prompt/context construction changes the result — and the last one is the harness borrowing model-layer authority.

**Serving layer.** The machinery that turns a request into tokens: admission control, queueing, batching, KV-cache management, decode loops. Failures here are queueing collapse, saturation, 529 overload, 429 quota enforcement, degraded throughput, and mid-stream aborts. The model inside is unchanged; the *service* around it is failing. The provider's status pages are effectively a public ledger of this layer: a ~36-minute full-service disruption (2026-08-16) and model-scoped "elevated latency, timeouts, and interrupted streaming" (OpenAI, 2026-07-27) are serving events, not intelligence events. Providers also decline to guarantee performance: published limits are ceilings, not floors (Anthropic rate limits docs, accessed 2026-08-27), so latency under load is not contractually owned by the client.

**Harness layer.** The client architecture: retry policy, concurrency, prompt assembly, context curation, caching discipline. Failures here are manufactured by the caller. Retry storms: when a backend rejects requests, naive clients multiply load — up to ~3X with a 3-attempt budget — turning a partial outage into a total one; Google SRE's answer is per-client retry budgets (10% ratio → 1.1x worst case) and "overloaded; don't retry" propagation (Google SRE Book, ch. 21). Context bloat: stuffing histories and oversized tool catalogs degrades recall on all models ("context rot," Anthropic, 2025-09-29). Cache-hostile prefixes: mutating anything before a cache breakpoint — a timestamp in the system prompt, reordered tool definitions — silently resets the stored prefix to a 5-minute-lived write that never gets reused (Anthropic prompt caching docs, accessed 2026-08-27).

The layers also interact in one direction: harness choices *induce* model and serving failures. An 800k-token context (harness) triggers position-dependent retrieval loss (model); a timestamp-prefixed prompt (harness) forces full-price reprocessing (serving); a retry loop without jitter (harness) amplifies an overload (serving). The reverse is not true — the serving layer cannot cause the model to hallucinate, and the model cannot cause a 529.

**The ownership test:** ask "which single change makes this failure impossible?" A better model or checkpoint → model layer. More capacity, better scheduling, admission control → serving layer. A change to *your* client code — backoff, jitter, budget, prefix stability, context pruning → harness layer. Escalate to the owner; misrouted fixes are wasted iterations (fixing a 529 by swapping model names, "fixing" a refusal by retrying identically).

## Harness angle

Instrument every failure with a layer attribution tag before alerting or escalating: 429/529 plus `retry-after` → serving/quota (react with client-side scheduling, never with retries against spend-cap 429s, which carry no `retry-after`); TTFT/throughput degradation → serving (route or shed load); quality failure correlated with deep-context position or bloated tool sets → harness-owned context curation, with model swap as the last resort. This single decision stops the most common production mistake: paying for serving incidents by "upgrading" models, and paying for model limitations with retry loops.

## Sources

- https://docs.anthropic.com/en/api/errors — Claude API error codes, 529/429 semantics, SDK retry defaults
- https://docs.anthropic.com/en/api/rate-limits — token-bucket quotas, acceleration limits, spend-cap 429 behavior
- https://status.anthropic.com/api/v2/incidents.json — dated Claude incident list (retrieved 2026-08-27)
- https://status.openai.com/api/v2/incidents.json — dated OpenAI incident list (retrieved 2026-08-27)
- https://arxiv.org/abs/2307.03172 — "Lost in the Middle," Liu et al., TACL 2023
- https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents — context rot, attention budget (2025-09-29)
- https://sre.google/sre-book/handling-overload/ — retry amplification and retry budgets (Google SRE Book ch. 21)
- https://docs.anthropic.com/en/docs/build-with-claude/prompt-caching — prefix caching, breakpoints, TTLs
- https://platform.openai.com/docs/guides/rate-limits — Retry-After discipline, jitter, non-retryable errors
