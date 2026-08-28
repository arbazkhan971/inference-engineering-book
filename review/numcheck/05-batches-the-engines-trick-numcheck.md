# Numbers re-verification — ch05 (Batches) + ch06 (Paging the brain)

numchecked: 2026-08-28 · verifier: glm-5.3-flash (worker, post-fix sweep)
Scope: every numeric claim in the CURRENT text of `05-batches-the-engines-trick.md` and `06-paging-the-brain.md`, re-traced to dated research digests after the reflow/copyedit/gate-6/pedagogy fix waves.

## Verdict table

| # | Claim (surface · location) | Supporting digest | Verdict |
|---|---|---|---|
| 1 | ch05 §5.2 — static batch waste "roughly 80%… one wants 900, fifteen want 100" (labeled illustrative) | continuous-batching.md (same worked shape) | DERIVED-OK (1,600 of 16×900 ≈ 83%) |
| 2 | ch05 §5.2 — Orca eval "large fractions of iterations on padded/finished slots" | continuous-batching.md | TRACED |
| 3 | ch05 §5.4 — Orca "up to 36.9×" vs FasterTransformer, GPT-3 175B, OSDI 2022 | continuous-batching.md | TRACED |
| 4 | ch05 §5.4 — TRT-LLM calls it in-flight batching (IFB) | continuous-batching.md | TRACED |
| 5 | ch05 §5.4 — vLLM/TGI/SGLang/TRT-LLM all ship the loop | continuous-batching.md + serving-engines-overview.md (L22 TGI continuous batching) | TRACED |
| 6 | ch05 §5.4 — `max_num_seqs` V1 default 128 | preemption-recompute-swap.md (`DEFAULT_MAX_NUM_SEQS = 128`) | TRACED |
| 7 | ch05 §5.4 — budget example 8,192/64 decode/8,128 prefill; 12,000-token prompt over two iterations (labeled illustrative) | continuous-batching.md (mechanism + 8,192/64/8,128 constants; digest's example used a 4,000-token prompt) | DERIVED-OK (2 × 8,128 = 16,256 ≥ 12,000; chapter labels constants illustrative) |
| 8 | ch05 §5.4 — chunked prefill on by default in V1, decodes first | continuous-batching.md | TRACED |
| 9 | ch05 §5.4 — `batch_wait_max_tokens_ratio` prototype flag, queue-latency-for-utilization trade | continuous-batching.md | TRACED |
| 10 | ch05 §5.5 — tokens/s/request ≈ 1 ÷ iteration time | continuous-batching.md | TRACED |
| 11 | ch05 §5.5 — TRT-LLM Llama-3.3-70B 4× H100 sweep: 1,944 → 2,467 → 2,044 tok/s; ITL 14.65/14.66/14.45 ms | batching-size-latency-tradeoffs.md | TRACED |
| 12 | ch05 §5.5 — sweet spot ~20% over 2048 (1.21) and ~27% over 64 (1.27), derived | batching-size-latency-tradeoffs.md (1.21 stated; 1.27 recomputes: 2,466.79/1,944.26 = 1.269) | DERIVED-OK |
| 13 | ch05 §5.5 — untuned 1,564 tok/s @ 31.3 ms → tuned 2,474 @ 14.7 ms; 58.2% gain, 53.1% reduction | batching-size-latency-tradeoffs.md | TRACED |
| 14 | ch05 §5.5 — M/G/1 E[W] = λE[S²]/2(1−ρ) | ttft-queueing-under-load.md | TRACED |
| 15 | ch05 §5.5 — 0.8→0.95 ≈ 4× mean queue delay (derived 0.2/0.05) | ttft-queueing-under-load.md | TRACED |
| 16 | ch05 §5.5 — 1/(1−ρ) table 2×/5×/10×/20×/100× at 50/80/90/95/99% (labeled M/M/1 form, classical) | goodput-and-slos.md (0.9→~10×, 0.99→~100×) | DERIVED-OK |
| 17 | ch05 §5.5 — prefill linear in batch, Llama-2-7B A100 (arXiv:2407.05347) | ttft-queueing-under-load.md | TRACED |
| 18 | ch05 §5.5 — 4,000-vs-4×1,000 prompt E[S²] point (labeled illustrative) | ttft-queueing-under-load.md (mechanism) | DERIVED-OK |
| 19 | ch05 §5.5 — max_tokens clipping reduces mean queue delay | ttft-queueing-under-load.md | TRACED |
| 20 | ch05 §5.5 — 49 concurrent requests @ 1,280 tok, Llama-2-7b-chat, one A100 | ttft-queueing-under-load.md | TRACED |
| 21 | ch05 §5.6 — goodput definition, per-GPU max rate at 90% attainment, DistServe OSDI 2024 | goodput-and-slos.md | TRACED |
| 22 | ch05 §5.6 — Goodput(P90 TTFT<200 ms ∧ P90 TPOT<50 ms) form | goodput-and-slos.md | TRACED |
| 23 | ch05 §5.6 — 10 req/s raw → 3 req/s within SLO illustration | goodput-and-slos.md | TRACED |
| 24 | ch05 §5.6 — "almost all popular LLM serving engines use throughput…" quote | goodput-and-slos.md | TRACED |
| 25 | ch05 §5.6 — Sarathi-Serve 2.6× capacity, up to 5.6× e2e (arXiv:2403.02310) | goodput-and-slos.md (2.6× Mistral-7B/1×A100; 5.6× Falcon-180B) | TRACED |
| 26 | ch05 §5.6 — xychart labeled "illustrative shape, not measured data" | n/a (self-labeled) | TRACED (hedge intact) |
| 27 | ch05 §5.6 — vLLM `--goodput` CLI, ms SLO pairs, ttft/tpot/e2el | goodput-and-slos.md | TRACED |
| 28 | ch05 §5.7 — Red Hat 2026-03-03 plateau-concurrency guidance | batching-size-latency-tradeoffs.md | TRACED |
| 29 | ch05 §5.7 — OpenAI backoff/backoff-with-jitter guidance | ttft-queueing-under-load.md | TRACED |
| 30 | ch05 §5.7 — field note 32→64 concurrency, +15% aggregate, p95 TPOT ~3× | author field note (anecdotal, styled as such) | TRACED (allowed class) |
| 31 | ch05 ASCII — t=32 axis, ~28/~26/~14 idle/padded steps | self-labeled illustrative; bars 4/32/6/18 → 28/26/14 recompute | DERIVED-OK |
| 32 | ch06 intro — 20.4–38.2% useful KV memory (arXiv:2309.06180) | paged-attention-block-tables.md | TRACED |
| 33 | ch06 intro — 49-request cap cross-ref | ttft-queueing-under-load.md | TRACED (consistent with #20) |
| 34 | ch06 §6.2 — OPT-13B 800 KB/token; 2,048 × 800 KB ≈ 1.6 GB; LLaMA-13B up to 1.7 GB | paged-attention-block-tables.md | TRACED |
| 35 | ch06 §6.3 — DEFAULT_BLOCK_SIZE = 16 | paged-attention-block-tables.md | TRACED |
| 36 | ch06 §6.3 — 16 tokens × 800 KB ≈ 12.5 MB, under 1% of 1.6 GB (derived) | paged-attention-block-tables.md (≤16 tok ≈ 12.5 MB, <1%) | DERIVED-OK |
| 37 | ch06 §6.3 — CoW beam search −37.6–55.2% Alpaca / −44.3–66.3% ShareGPT | paged-attention-block-tables.md | TRACED |
| 38 | ch06 §6.3 — paged kernel 20–26% slower than FT fused kernel (2023 comparison, hedged) | paged-attention-block-tables.md | TRACED |
| 39 | ch06 §6.3 — 2–4× throughput vs FT and Orca; up to 22× before failure (authors' own, hedged) | paged-attention-block-tables.md | TRACED |
| 40 | ch06 §6.3 — block-size sweep 16–128 ShareGPT / 16–32 Alpaca; ships 16; multiple of 8 mamba | paged-attention-block-tables.md | TRACED |
| 41 | ch06 §6.3 — V1 alpha Jan 2025, prefix caching default, blog 2025-01-27 | paged-attention-block-tables.md | TRACED |
| 42 | ch06 §6.4 — prefill determinism / "won't change model outputs" | prefix-caching-radix-trees.md | TRACED |
| 43 | ch06 §6.4 — hash chain (parent hash, tokens, LoRA ID, mm hashes); SHA-256 since v0.11; `cache_salt` | prefix-caching-radix-trees.md | TRACED |
| 44 | ch06 §6.4 — RadixAttention LRU-over-leaves (arXiv:2312.07104, NeurIPS 2024) | prefix-caching-radix-trees.md | TRACED |
| 45 | ch06 §6.4 — V1 O(1) doubly-linked free queue, reverse-order requeue | prefix-caching-radix-trees.md | TRACED |
| 46 | ch06 §6.4 — worked example: block size 4, 14-token request, 10 shared → 8 tokens skipped | prefix-caching-radix-trees.md (identical example) | TRACED |
| 47 | ch06 §6.4 — TTFT 480→110 ms, stable-prefix tenants, Nexus Labs via DEV community, directional | prefix-caching-radix-trees.md | TRACED (hedge intact) |
| 48 | ch06 §6.5 — OpenAI: GPT-5.6-class reads 0.1× / writes 1.25×; older "up to 90%", 50% launch-era, no hit guarantee | prompt-caching-provider-semantics.md | TRACED |
| 49 | ch06 §6.5 — Anthropic: 4 breakpoints; 1.25× (5-min) / 2× (1-hour) writes; 0.1× reads; 512–4,096 min (1,024 Sonnet-class, 4,096 Opus 4.6/4.5 + Haiku 4.5); 5-min TTL from request start, 4-min stream ≈ 1 min left | prompt-caching-provider-semantics.md + prefix-caching-radix-trees.md | TRACED (model-level minima match exactly) |
| 50 | ch06 §6.5 — "62 full blocks out of 62.5" for a 1,000-token prefix (derived) | derived from block size 16 | DERIVED-OK |
| 51 | ch06 §6.5 — "differ 10× in cost" for same-length prompts (derived from 0.1× reads) | derived | DERIVED-OK |
| 52 | ch06 §6.5 / picture-stops — Llama 3.1 8B caches 128 KiB/token | kv-cache-bytes-formula.md (2×32×8×128×2 = 131,072 B) | TRACED |
| 53 | ch06 §6.5 — field note: 11-token `request_id` prefix kill, TTFT halved after fix | author field note (anecdotal, styled as such) | TRACED (allowed class) |
| 54 | ch06 §6.4 — "4× first-token improvement" from 480→110 ms | derived: 480/110 = 4.36 | DERIVED-OK (see P2-1) |
| 55 | ch06 See-it — SGLang RadixAttention blog LMSYS 2024-01-17 | prefix-caching-radix-trees.md sources | TRACED |

## Findings

**[P2-1]** `06-paging-the-brain.md` §6.4: "Same engine, same hardware, 4× first-token improvement" — 480 ÷ 110 = 4.36×, so "4×" understates the digest's own numbers. Optional precision fix: "over 4×". Not release-blocking; the direction and order of magnitude are correct.

No P0 or P1 findings. All 55 checked claims are TRACED or DERIVED-OK; every illustrative/anecdotal claim carries its hedge; all dated snapshots retain their 2026-08-27 retrieval dates; the fix waves (reflow, copyedit, gate-6, pedagogy) introduced no numeric drift in either chapter.
