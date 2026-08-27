# PagedAttention: block tables and the end of KV fragmentation
researched: 2026-08-27 · researcher: glm-5.3-flash

## Key facts
- The KV cache is huge relative to weights: for a single sequence, LLaMA-13B needs up to 1.7 GB of KV cache (vLLM blog, 2023; arXiv:2309.06180, 2023). The paper's worked example is OPT-13B: 800 KB per token (2 × 5120 hidden × 40 layers × 2 bytes for K and V), i.e. up to 1.6 GB per 2048-token request (arXiv:2309.06180, 2023).
- Pre-vLLM systems waste most KV memory: measured on real workloads, only 20.4%–38.2% of allocated KV cache memory actually stores useful token states; the rest is fragmentation (internal, from over-reservation for max length, and external, from allocator holes) and redundant duplication of shared prefixes (arXiv:2309.06180, 2023).
- vLLM with PagedAttention achieves 2–4× higher throughput than FasterTransformer and Orca at the same latency level, and in one experiment sustained up to 22× higher request rates before failure (arXiv:2309.06180, 2023).
- Beam search with copy-on-write sharing of common prefixes cuts peak KV memory by 37.6%–55.2% on Alpaca and 44.3%–66.3% on ShareGPT workloads (arXiv:2309.06180, 2023).
- The paged attention kernel itself is 20–26% slower than FasterTransformer's fused kernel per call — the win is memory efficiency enabling bigger batches, not kernel speed (arXiv:2309.06180, 2023).
- Default block size in vLLM is 16 tokens (`DEFAULT_BLOCK_SIZE: ClassVar[int] = 16` in `vllm/config/cache.py`; vLLM docs, fetched 2026-08-27). Paper sweep found 16–128 tokens near-optimal on ShareGPT, 16–32 on Alpaca (arXiv:2309.06180, 2023).
- vLLM V1 (alpha announced Jan 2025) keeps paged KV management but re-architects around it: a unified scheduler treating prompt and generated tokens uniformly, and "zero-overhead" prefix caching enabled by default (vLLM V1 blog, 2025-01-27; vLLM docs, fetched 2026-08-27).

## How it works
- **The problem**: a KV cache entry must grow every decode step, but naive allocators reserve one contiguous buffer sized to the *maximum* sequence length up front. Because request lengths vary and are unpredictable, contiguous reservation yields internal waste (never-filled tail), external waste (holes freed by finished sequences that are too small to reuse), and duplication (identical system prompts cached once per request).
- **The virtual-memory trick**: PagedAttention splits each logical sequence's KV cache into fixed-size blocks (default 16 tokens). Physical GPU memory is carved into block-sized slots; a per-sequence **block table** maps logical block index → physical slot, exactly like an OS page table maps virtual pages to physical frames. Blocks need not be contiguous in GPU memory; the attention kernel gathers K/V via the block table. Waste drops to at most one partially-filled block per sequence (the paper reports near-zero waste in practice; arXiv:2309.06180, 2023).
- **Copy-on-write**: when two sequences (e.g. beam-search candidates) share a prefix, their block tables point at the *same* physical blocks. A physical slot is reference-counted; only when a sequence writes to a shared block (the beams diverge) is it copied to a fresh slot. This is why beam search memory falls by roughly half or more.
- **Prefix caching**: block hashes make shared prefixes reusable across *requests*, not just within a beam family — the KV for the first N tokens of an identical prompt is computed once and reused. vLLM's hash is over (previous block's hash, current block's token IDs) — a chained hash, so a one-token difference invalidates all subsequent blocks (vLLM prefix-caching design doc, fetched 2026-08-27).
- **Block size tradeoff**: too small → block tables get long and the gather kernel does more bookkeeping/indirection; too large → internal waste in the last block grows and prefix-cache hits become coarser (a shared prefix of 20 tokens shares only one block at size 16 but wastes 12 tokens at size 32). 16 is the default sweet spot; must be a multiple of 8 for mamba-style caches in current vLLM (vLLM CLI docs, fetched 2026-08-27).
- **Worked example (OPT-13B, from the paper)**: per-token KV = 2 (K and V) × 5120 (hidden dim) × 40 (layers) × 2 bytes (fp16) = 800 KB/token. A 2048-token sequence ⇒ ~1.6 GB. If the allocator reserves max-length 2048 slots but the request ends at 512 tokens, 75% of that 1.6 GB is pure waste — multiplied across a batch. Paging caps waste at one block: ≤ 16 tokens ≈ 12.5 MB, i.e. < 1% of the sequence's cache (constants from arXiv:2309.06180, 2023).

## Harness angle
- Put stable, byte-identical content at the *front* of every prompt (system prompt, tool schemas, few-shot examples) and keep dynamic content last — with prefix caching (default-on in vLLM V1), the stable prefix's KV is computed once and reused, cutting prefill cost and TTFT for every subsequent request. Conversely, one token of drift anywhere in the prefix invalidates the entire tail, so per-user tokens injected before the tool schema silently kill cache hits. Monitor your provider's or engine's cache-hit metrics; if your harness's prompt template changes per request, you are paying full prefill every time.

## Sources
- vLLM paper: Efficient Memory Management for LLM Serving with PagedAttention — https://arxiv.org/abs/2309.06180
- vLLM launch blog (waste figures, 1.7 GB LLaMA-13B) — https://vllm.ai/blog/2023-06-20-vllm
- vLLM Automatic Prefix Caching design doc (block hashing, block size example) — https://docs.vllm.ai/en/stable/design/prefix_caching/
- vLLM prefix caching feature page — https://docs.vllm.ai/en/latest/features/automatic_prefix_caching/
- vLLM CacheConfig source (DEFAULT_BLOCK_SIZE = 16) — https://github.com/vllm-project/vllm/blob/main/vllm/config/cache.py
- vLLM V1 alpha announcement (zero-overhead prefix caching, unified scheduler) — https://vllm.ai/blog/2025-01-27-v1-alpha-release
- vLLM V1 guide — https://docs.vllm.ai/en/latest/usage/v1_guide/
- vLLM CLI serve docs (block-size flags) — https://docs.vllm.ai/en/stable/cli/serve/
