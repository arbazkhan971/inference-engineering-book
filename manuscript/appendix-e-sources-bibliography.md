# Appendix E. Source notes and bibliography

> **Appendices — the reference shelf.** How this book knows what it claims: the research method, the trust ladder every source climbed, and the bibliography behind the numbers. The chapters own the mechanisms; this page owns the receipts.

## E.1 How this book was researched

Every number in this book comes from one of two places: a **dated research digest** in the author's research corpus — a one-page brief, written per topic, whose every figure carries its retrieval date — or arithmetic the book performs in front of you and labels as derived. Nothing else. The corpus was assembled on a single day — every digest carries `researched: 2026-08-27` — so the book's commercial facts (prices, rate limits, provider API surfaces) are honestly described as a **mid-2026 snapshot**, not as facts about the universe. When you read "retrieved 2026-08-27" in a dated box, that date is the whole warranty.

The corpus: 71 digests, each 600–1,200 words, each written to the same frame — key facts with every number dated, the mechanism in plain words, one harness decision it changes, and 5–10 primary source URLs. Across those digests the source lists carry more than 570 distinct URLs and 65 distinct arXiv papers. The bibliography below curates that pile rather than reprinting it: **every source that underpins a number in a dated box, a worked example, or a checkpoint answer is included; background reading that shaped tone but carried no load-bearing number is not.** That is the curation rule, stated so you can audit it.

Three source-discipline rules ran through drafting, and you will see their fingerprints everywhere:

1. **Never invent a number the digests don't contain.** Where the corpus lacked a figure, the text hedges in place ("community reports," "directionally known, not quantified") or states that no primary source exists — the book says "no provider publishes this" rather than filling the hole.
2. **Derived arithmetic is labeled.** When the book multiplies, divides, or extrapolates from a sourced constant — the 4.8 ms/token floor, the 1,342 GB expert residency, the $39.75 batch worksheet — the result is marked derived (or illustrative) in the text, and the inputs trace to a digest.
3. **Authors' own benchmarks are flagged as such.** Papers comparing their system against baselines they configured are cited for their *mechanisms* as fact and their *speedups* as the authors' own comparisons — the phrase "authors' own comparison" in this book is doing real work.

## E.2 How to read these sources — the trust ladder

Not all sources deserve equal trust, and the book's hedge vocabulary maps directly onto six tiers. When a chapter says "approximate" or "vendor-reported," this is what it means:

| Tier | Class | What it is authoritative for | How fast it ages |
|---|---|---|---|
| 1 | Peer-reviewed systems papers (OSDI, SOSP, FAST, NeurIPS, ICML, MLSys, EMNLP, COLM) | Mechanisms and formulas; measured effects *as the authors configured them* | Mechanism: years. Numbers: setup-specific forever |
| 2 | Preprints (arXiv) | Same, minus review | Mechanism: usually holds. Numbers: treat as single-lab results |
| 3 | Official provider documentation, model cards, configs | The contract itself — semantics, defaults, limits. A pricing page *is* the price | Weeks to quarters |
| 4 | Engine documentation, source code, issues and pull requests | What serving engines *actually do*, including defaults the marketing never states | Quarters |
| 5 | Engineering blogs, vendor posts | Direction and war stories; vendor posts carry an incentive gradient | Months |
| 6 | Community benchmarks and calculators | Orders of magnitude only | Continuous drift |

Two habits follow. Provider documentation is simultaneously the most authoritative and the most perishable tier — authoritative because it *is* the contract, perishable because the contract changes — which is why commercial constants live in dated boxes (and in Appendix C, which exists to be re-dated), never in the durable prose spine. And GitHub issues and pull requests are treated here as primary sources: the vLLM issue that documents a streaming abort at step granularity, or the Claude Code issue that documents cache re-write costs after resume, are cited the way a paper cites a measurement.

## E.3 Bibliography

Organized by the book's four parts, then the reference shelf. Papers are listed by the name the chapters use; provider pages by their role. Chapter pointers show where each source did load-bearing work. All URLs were retrieved 2026-08-27 unless the entry says otherwise; provider pages should be presumed to have moved since.

### Part I — The engine room from the street (chapters 1–4)

- **GPT-3: Language Models are Few-Shot Learners** — Brown et al., arXiv:2005.14165 (2020). The autoregressive next-token definition the whole book stands on. (ch 3)
- **PaLM: Scaling Language Modeling with Pathways** — Chowdhery et al., arXiv:2204.02311 (2022). Training-scale MFU anchor: 46.2% on 6,144 TPU v4 chips. (ch 3)
- **Efficiently Scaling Transformer Inference** — Pope et al., arXiv:2211.05102 (2022). The 29 ms/token decode figure; the bandwidth-bound decode argument at scale. (ch 1–3)
- **FlashAttention** — Dao et al., arXiv:2205.14135; NeurIPS 2022. Exact attention with the quadratic *memory* term removed — the fusion argument of chapter 3, including the BERT-large 15% and GPT-2 3× numbers. (ch 3)
- **Cross-lingual token costs** — arXiv:2305.13707 / EMNLP 2023. Same information, widely different token counts across 22 languages. (ch 2)
- **Strawberry / character-level token blindness** — arXiv:2505.14172 / EMNLP 2025. Tokens carry low mutual information with characters. (ch 2)
- **Code formatting token overhead** — arXiv:2508.13666 (2025). The measured 24.5% input reduction from formatting removal. (ch 2)
- **Token fertility and downstream accuracy** — arXiv:2509.05486 (2025). Fertility as a cost-and-quality predictor. (ch 2)
- **Lost in the Middle** — Liu et al., arXiv:2307.03172 (2023). Position, not presence, determines attention quality. (ch 11)
- **RULER: What's the Real Context Size of Your Long-Context Language Models?** — Hsieh et al., arXiv:2404.06654 (2024). Claimed-vs-effective window gaps. (ch 4, 11)
- **Fast Transformer Decoding: One Write-Head is All You Need (MQA)** — Shazeer, arXiv:1911.02150 (2019). Single shared KV head. (ch 4)
- **GQA: Training Generalized Multi-Query Transformer Models** — Ainslie et al., arXiv:2305.13245 (2023). Grouped-query interpolation. (ch 4)
- **Llama 3 model family** — arXiv:2407.21783 (2024). The 8 KV heads / 64 query heads config behind the book's worked KV arithmetic. (ch 4)
- **DeepSeek-V2 (MLA mechanism)** — arXiv:2405.04434 (2024). Latent-cache attention. (ch 4)
- **DeepSeek-V3 Technical Report** — arXiv:2412.19437 (2024). The 576-element latent cache, aux-loss-free routing, production topologies. (ch 4, 10)
- **Gemma 3 Technical Report** — arXiv:2503.19786 (2025); **Gemma 4** — arXiv:2607.02770 (2026). 5:1 local:global sliding windows to tame KV at 128K. (ch 4)
- **Attention-variant survey** — arXiv:2502.07864 (2025) and MLA-on-accelerators hardware analysis, arXiv:2506.02523 (2025). The cache-compression ladder as a measured tradeoff. (ch 4)

### Part II — Inside the engine (chapters 5–11)

- **Orca: A Distributed Serving System for Transformer-Based Generative Models** — Yu et al., OSDI 2022. Iteration-level scheduling; continuous batching; the padded-batch waste measurement. (ch 5)
- **Efficient Memory Management for LLM Serving with PagedAttention (vLLM)** — Kwon et al., arXiv:2309.06180; SOSP 2023. Block tables, copy-on-write, the 20.4–38.2% useful-KV measurement. (ch 5, 6)
- **SGLang / RadixAttention** — Zheng et al., arXiv:2312.07104; NeurIPS 2024. The LRU radix tree; leaf-first eviction. (ch 6)
- **Sarathi (chunked prefill)** — arXiv:2308.16369 (2023) and arXiv:2401.08671 (2024). Piggybacked decoding. (ch 7)
- **Sarathi-Serve** — Agrawal et al., arXiv:2403.02310; OSDI 2024. The token-budget scheduler and its capacity claims. (ch 5, 7)
- **DistServe** — Zhong et al., arXiv:2401.09670; OSDI 2024. Per-phase goodput; disaggregation economics (the 1.6-vs-5.6/10 island measurements). (ch 5, 7)
- **Splitwise** — Patel et al., arXiv:2311.18677 (2023). The two-phase prompt/decode economics quote. (ch 3, 7)
- **Mooncake** — Qin et al., arXiv:2407.00079; FAST 2025. Disaggregated KV tier; 525% simulated and 75% Kimi-production capacity gains. (ch 7, 11)
- **TTFT-under-load queueing analysis** — arXiv:2407.05347 (2024). Queue-delay divergence as utilization climbs. (ch 5, 7)
- **Fast Inference from Transformers via Speculative Decoding** — Leviathan et al., arXiv:2211.17192, ICML 2023; **Accelerating LLM Decoding with Speculative Sampling** — Chen et al., arXiv:2302.01318 (2023). Draft-and-verify with distribution-identical rejection sampling. (ch 8)
- **Medusa** — Cai et al., arXiv:2401.10774 (2024). Multi-head drafting. (ch 8)
- **EAGLE-1/-2/-3** — arXiv:2401.15077 (2024); arXiv:2406.16858 (2024); arXiv:2503.01840 (2025). Feature-level drafting through dynamic trees; the acceptance-length series τ 5.84–6.62. (ch 8)
- **MagicDec** — arXiv:2408.11049 (2024). Speculation pays at high batch when KVSL is long. (ch 8, 11)
- **SmoothQuant** — Xiao et al., arXiv:2211.10438 (2023). W8A8 with activation migration. (ch 9)
- **GPTQ** — Frantar et al., arXiv:2210.17323; ICLR 2023. Hessian-compensated weight quantization. (ch 9)
- **AWQ** — Lin et al., arXiv:2306.00978; MLSys 2024. Salient-channel protection via ~512 calibration samples. (ch 9)
- **LLaMA-3 quantization survey** — arXiv:2404.14047 (2024); **COLM 2025 quantization benchmark study** — arXiv:2504.04823 (2025). The 8-bit-near-lossless / 4-bit-risky quality map. (ch 9)
- **Give Me BF16 or Give Me Death** — arXiv:2411.02355 (2024). FP8 serving near-losslessness across 500k+ evaluations. (ch 9, Appendix C)
- **GShard / Switch Transformer** — arXiv:2006.16668 (2020); arXiv:2101.03961 (2021). Expert capacity factors and token dropping.
- **Mixtral of Experts** — arXiv:2401.04088 (2024). Top-2-of-8 sparsity in the open. (ch 10)
- **gpt-oss model card** — arXiv:2508.10925 (2025). 128-expert, top-4, MXFP4 configuration. (ch 9, 10)
- **Ring Attention** — Liu et al., arXiv:2310.01889 (2023). Sequence sharding across devices; exact attention. (ch 10, 11)
- **Unified Sequence Parallelism (USP)** — arXiv:2405.07719 (2024). Head-vs-sequence parallel composition. (ch 10, 11)
- **Context Parallelism for Scalable Million-Token Inference** — arXiv:2411.01783; MLSys 2025. The 77 s / 1M-token / 128-H100 measurement. (ch 10, 11)
- **MemGPT** — Packer et al., arXiv:2310.08560 (2023). OS-style memory paging for context. (ch 11)
- **TokenPilot** — arXiv:2606.17016 (2026). Agent-loop cost telemetry; cache-invalidation losses up to 87%. (ch 11, 14)
- **Lost in Compaction** — arXiv:2608.11242 (2026). Side-constraint survival under compaction (73%→40%→7%). (ch 11, 17)
- **Goodput research line** — TurboSpec, arXiv:2406.14066 (2024); aggregation-vs-disaggregation tradeoffs, arXiv:2508.01989 (2025); SLO-budget fair serving, arXiv:2608.06557 (2026). Where the goodput definition is heading. (ch 5, 18)

### Part III — The API contract (chapters 12–16)

- **Outlines: A Generator for Constrained Sampling** — Willard & Louf, arXiv:2307.09702 (2023). FSM-based masking; the compile-cost problem (0.22 req/s, 38.5 s TTFT). (ch 13)
- **XGrammar** — Dong et al., arXiv:2411.15100 (2024). Adaptive token masks; context-independent precompute; the 100×/80× claims. (ch 13)
- **Grammar-Aligned Decoding** — NeurIPS 2024. Off-distribution corrections; the expensive reweighting fix. (ch 13)
- **Let Me Speak Freely?** — arXiv:2408.02442 (2024). The format-restriction quality ordering. (ch 13)
- **CRANE** — arXiv:2502.09061 (2025). Reasoning-before-answer under strict schemas. (ch 13)
- **Capacity, Not Format** — arXiv:2606.09410 (2026). The 11-model base-vs-instruct tax split. (ch 13)
- **Token Space Compression** — arXiv:2605.29986 (2026). Vocabulary-linear per-step grammar overhead. (ch 13)
- **PSC (per-step constrained-decoding cost)** — arXiv:2608.03065 (2026). The throughput limiter for large-vocab constrained decoding. (ch 13)
- **Provider streaming and tool-delta documentation** — OpenAI streaming/chunk-shape docs incl. the `[DONE]` sentinel and Responses event types; Anthropic Messages streaming reference (ordered event log, `message_delta` stop reasons, ping events); Gemini `streamGenerateContent` reference (`alt=sse` as the stream switch) and Live API (WebSocket, PCM 16 kHz in / 24 kHz out). The four grammars chapter 12 normalizes. (ch 12)
- **openai-python issue #2722** — the JSONDecodeError on non-JSON SSE lines that motivated meta-event tolerance. (ch 12)
- **Provider prompt-caching documentation** — Anthropic prompt caching (breakpoints, multipliers, TTL, 20-block lookback); OpenAI prompt caching guide (1,024-token minimums, ≥30-min TTL, `prompt_cache_key`) and the prompt-caching cookbook; Gemini implicit/explicit caching docs. The contracts chapter 14 prices. (ch 6, 14, Appendix C)
- **Provider rate-limit documentation** — OpenAI rate limits (RPM/TPM/RPD/IPM, `max(max_tokens, estimate)` reservation, cached tokens not carved out); Anthropic rate limits (ITPM/OTPM split, read exemption, continuous refill); Gemini quotas (per-project meters, midnight-Pacific reset); AWS Bedrock quotas (burndown multipliers, up-front deduction). (ch 15, Appendix C)
- **Google SRE Book, "Handling Overload"** — adaptive client throttling (K=1.1). (ch 15)
- **AWS Architecture Blog, "Exponential Backoff and Jitter" (2015)** — full jitter beats equal jitter under contention (simulation). (ch 15)
- **The Tail at Scale** — Dean & Barroso, CACM 2013. Fanout amplifies the percentile, not the mean. (ch 15, 16)
- **SREcon 2024, "Queues and You"** — latency-vs-utilization doubling curves. (ch 15)
- **RouteLLM** — Ong et al., arXiv:2406.18665 (2024). Router quality/cost frontier; savings collapse as workloads harden. (ch 16)
- **LiteLLM documentation** — routing strategies, cooldowns, `enforce_model_rate_limit`, the `RouterRateLimitError` no-Retry-After hazard (issue #27823). (ch 15, 16)
- **OpenRouter documentation** — two-layer failover, inverse-square-of-price weighting, classified-errors-only fallback. (ch 16)
- **Provider batch APIs** — OpenAI Batch (50%/24 h), Anthropic Batch (50%, most jobs under an hour), Google Batch + Flex mode. (ch 16, Appendix C)

### Part IV — Harness meets engine (chapters 17–18)

- **Claude Code documentation and issues** — context compaction trigger arithmetic; cache re-write costs after resume (issues #42338, #71659); TTL buckets and `promptCacheTtl`. The session-lifecycle economics chapter 17 prices. (ch 11, 17)
- **OpenAI subagent/cache documentation** — the spawn cost formula `1.25 + 0.1·(N−1)` behind chapter 17's fleet arithmetic; fork guidance. (ch 17)
- **Anthropic capture-and-resume / message continuation semantics** — the ≤4.5 / ≥4.6 version boundary. (ch 12, 17)
- **llama.cpp GGUF quantization table** — Q4_0/Q4_1/Q5_0 sizes and perplexity deltas; Q4_K_M default. (ch 18)
- **Ollama MLX backend announcement** — the unified-memory rationale. (ch 18)
- **MLX vs llama.cpp head-to-head** — arXiv:2511.05502 (2025). First peer-quality Apple-Silicon comparison. (ch 18)
- **vLLM documentation and issues** — FP8 KV-cache measurements (2026-04-22: 14.9%/54%/~7k break-even); speculative-decoding caveats (issue #9565); cancellation at step granularity (issue #10087); guided-decoding correctness (PR #10785); `--goodput` CLI; scheduler knobs (`max_num_seqs`, `max_num_batched_tokens`, batch-wait ratio). The engine's actual defaults, straight from the engine. (ch 5–9, 12, 13, 18)
- **GPU rental market snapshots** — H100 $2.39–2.49/hr and A100 marketplace rates, checked 2026-08-02 and 2026-08-27. (ch 18, Appendix C)

### The reference shelf (appendices and positioning)

- **Provider pricing pages** — OpenAI, Anthropic, Gemini, DeepSeek price tables (the DeepSeek off-peak halves and the two-snapshot hit-price divergence). Appendix C's source of truth. (Appendix C)
- **Artificial Analysis** — same-weights provider spreads (Scout 8.3×, R1 6.1×) and latency medians; flagged JS-rendered and third-party throughout. (ch 1, 2, 9, Appendix C)
- **Comparables shelf** — Raschka, *Build a Large Language Model (From Scratch)* (Manning); Alammar & Grootendorst, *Hands-On Large Language Models* (O'Reilly); Iusztin & Labagne, *LLM Engineer's Handbook* (Packt); Huyen, *AI Engineering* (O'Reilly); Ousterhout, *A Philosophy of Software Design*. Price/length anchors and launch precedents for Appendix F. (Appendix F)
- **Amazon category and BSR data** — bestseller nodes (Artificial Intelligence 491300, NLP 271581011, Generative AI 211759007011) and third-party BSR-to-sales calculators — curve-fits only, flagged as such. (Appendix F)
- **Launch playbooks** — Huyen's AI Engineering launch sequence (announcement-to-print timeline, companion repo, podcast tour); Ousterhout's second-edition free-extract precedent. (Appendix F)

## E.4 The volatility map — what ages, and how fast

The bibliography decays at six different speeds, and a reader holding this book in a year should know which parts to distrust first:

| Source class | Expected life | In this book | Your response |
|---|---|---|---|
| Arithmetic laws (queueing, roofline, KV bytes, cost identities) | Years | The worked formulas | None — re-derive inputs only |
| Systems-paper mechanisms | Years | Chapters 5–11 mechanics | None until architectures change |
| Paper benchmark numbers | Setup-specific on arrival | Dated boxes marked "authors' own comparison" | Treat as direction |
| Engine defaults and flags | Quarters | vLLM/SGLang knob values | Re-check each engine upgrade |
| Provider contracts (semantics, meters, caches) | Quarters | Appendix C matrices | Re-date each pricing cycle |
| Prices and rate limits | Weeks | Every dollar figure | Assume stale; verify before acting |

This is why the book's durable prose teaches formulas while its dated boxes hold constants, why Appendix C exists as a single re-datable page, and why Appendix F ends with a re-dating calendar rather than a congratulations. The mechanisms will outlive the numbers; the honest book keeps the two visibly separate.
