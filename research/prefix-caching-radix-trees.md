# Prefix caching in serving engines: radix trees, block hashes, and what actually hits
researched: 2026-08-27 · researcher: glm-5.3-flash

## Key facts
- Prefill is deterministic given the same tokens and weights: the KV entries computed for a prompt prefix depend only on that prefix, so they can be stored and reused with *identical* model outputs. vLLM's design doc states prefix caching "won't change model outputs" and re-sending the same request "will produce exactly the same outputs" (vLLM docs, fetched 2026-08-27).
- SGLang's RadixAttention organizes the KV cache as an LRU radix tree of shared prefixes; every finished request's KV cache is inserted, and new requests are matched against the longest cached prefix (arXiv:2312.07104, 2023; NeurIPS 2024).
- vLLM's Automatic Prefix Caching (APC) identifies cached blocks by a hash chain: each block's hash = hash(parent-block hash, block tokens, LoRA ID, multimodal-input hash, optional `cache_salt`). Default hash algorithm is SHA-256 since v0.11, with `sha256_cbor` and `xxhash` variants selectable via `--prefix-caching-hash-algo` (vLLM docs, fetched 2026-08-27).
- vLLM default KV block size is 16 tokens (4 tokens in the doc's worked examples); only *full* matching blocks count as hits, so a request sharing 10 of 14 example tokens hits only the first 2 blocks (8 tokens) (vLLM docs, fetched 2026-08-27).
- vLLM v1 implements the cache as a pre-allocated Block Pool of `KVCacheBlock` objects with a doubly-linked-list free queue for O(1) LRU eviction; freed blocks are re-queued in reverse order so the longest/highest-coverage blocks are evicted last (vLLM docs, fetched 2026-08-27).
- OpenAI API prompt caching is automatic with a 50% discount on cached input tokens, best-effort, no code changes (OpenAI announcement, fetched 2026-08-27).
- Anthropic prompt caching is explicit (`cache_control` breakpoints): 5-minute cache write costs 1.25× base input price, 1-hour write 2×, cache reads 0.1× (90% discount); max 4 breakpoints; minimum cacheable prefix is 512–4,096 tokens depending on model (1,024 for Sonnet-class, 4,096 for Opus 4.6/4.5 and Haiku 4.5) (Claude Platform docs, fetched 2026-08-27).
- Provider-side TTLs are short: Anthropic's default is 5 minutes measured from request *start*, and streamed generation time counts against it — a 4-minute stream leaves ~1 minute to issue the next cache-hitting request (Claude Platform docs, fetched 2026-08-27).
- Cache-sensitivity of workloads is real: one operator reported tenant TTFT dropping from 480 ms to 110 ms after enabling prefix caching for tenants with stable system prompts, and no change for tenants with per-request-varying prefixes (DEV community post by Nexus Labs, fetched 2026-08-27 — anecdotal, single-cluster).

## How it works
Two mechanisms dominate:

**Radix tree (SGLang RadixAttention).** A radix tree compresses shared prefixes: each edge is a token sequence, each node holds pointers to KV-cache pages covering the tokens on the path from the root. On a new request, the engine walks the tree matching the prompt token-by-token against edges; the deepest matched node is the reusable prefix, and prefill re-starts after it. When a request finishes, its KV cache is inserted (splitting an edge if it partially matches). Eviction is LRU over leaves: when memory is needed, leaf subtrees (the least recently used, most specific branches) are evicted first, preserving the hot shared trunk — usually the system prompt. Matching cost is O(prompt length) in the worst case but tree-structured comparisons in practice.

**Block-hash chain (vLLM APC).** The KV cache is a pool of fixed-size blocks (default 16 tokens). Each full block gets a hash of (parent block hash, block tokens, extras like LoRA ID and multimodal hashes). Because the parent hash is in the input, the chain encodes the whole prefix — hash equality implies identical prefix. On a new request, `get_computed_blocks()` hashes the prompt block by block until the first miss; matched blocks get their reference count bumped (protecting them from eviction) and only the remaining suffix is prefilled. Eviction pops the head of the LRU free queue. `cache_salt` salts the first block's hash to isolate tenants.

**Worked example (vLLM doc constants, block size 4).** Prompt A = 14 tokens → 3 full blocks + 2 remainder tokens; all 3 full blocks cached. Prompt B shares the first 10 tokens: blocks 0–1 (8 tokens) hash-match exactly; block 2 matches only 2 of 4 tokens so the hash differs → miss. Hit = 8 tokens of prefill skipped, 6+ tokens still computed. This is why hit rate depends on block alignment: prefixes sharing a system prompt of 1,000 tokens hit almost perfectly; a varying first token kills everything after it.

**Explicit provider caching vs engine APC.** Self-hosted engines do it automatically (and free). Hosted APIs split: OpenAI caches automatically but best-effort (50% discount on hits); Anthropic requires `cache_control` markers (you pay a 25% write premium to create the entry, then 10× cheaper reads), giving deterministic hits you can budget against.

**Semantic caching is a different thing.** Prefix caching is exact-match on token sequences and therefore output-preserving. Semantic caches (e.g., GPTCache-style) embed the incoming prompt and return a stored answer for a *similar* previous prompt. Hit quality depends on the similarity threshold: too loose and you return wrong answers; nothing guarantees output equivalence. It is an application-layer optimization with correctness risk, not a serving-engine feature — treat it as a risk control problem, not a latency problem.

## Harness angle
Order your agent's prompt as: frozen system prompt + frozen tool definitions + stable context, and put the varying payload (user turn, retrieved docs, timestamps) **last** — and strip nondeterministic fields (timestamps, request IDs, shuffled tool lists) from the prefix, or your hit rate collapses to zero blocks. For hosted APIs, decide per provider: with Anthropic, place `cache_control` at the end of the stable prefix and keep loop iterations within the 5-minute TTL (issue the next call promptly after streaming finishes).

## Sources
- SGLang paper: https://arxiv.org/abs/2312.07104 (RadixAttention, LRU radix tree)
- SGLang NeurIPS 2024 version: https://proceedings.neurips.cc/paper_files/paper/2024/file/724be4472168f31ba1c9ac630f15dec8-Paper-Conference.pdf
- SGLang RadixAttention blog: https://lmsys.org/blog/2024-01-17-sglang/
- vLLM APC design doc (hash chain, blocks, LRU): https://docs.vllm.ai/en/stable/design/prefix_caching/
- vLLM APC feature page (enablement): https://docs.vllm.ai/en/stable/features/automatic_prefix_caching/
- OpenAI Prompt Caching announcement: https://openai.com/index/api-prompt-caching/
- Anthropic prompt caching docs (pricing, TTL, breakpoints): https://platform.claude.com/docs/en/build-with-claude/prompt-caching
- AWS Neuron tutorial: benchmarking prefix caching on vLLM: https://awsdocs-neuron.readthedocs-hosted.com/en/v2.32.0/vllm-neuron/docs/tutorials/tutorial-prefix-caching-gpt-oss-benchmarking.html
