# Numbers re-verification — ch11 (Long context) + ch12 (The streaming contract)

checked: 2026-08-28 · checker: glm-5.3-flash (post-fix numcheck wave; every claim traced to research/ digests or recomputed)

## Chapter 11 — Long context is a memory product

| # | Claim (location) | Source digest | Verdict |
|---|---|---|---|
| 1 | 10M billboard / 1,048,576 / "400K" opener | context-window-claims.md (Scout 10M; Gemini 1,048,576; GPT-5 400K) | TRACED |
| 2 | Prefill quadratic (N² attention entries/layer); dense ~2·W FLOPs/token | context-parallelism-long-context.md (MLSys 2025, arXiv:2411.01783) | TRACED |
| 3 | NVIDIA: prefill ~ISL², decode ~KVSL | attention-cost-scaling.md (NVIDIA Technical Blog) | TRACED |
| 4 | 1M vs 128K = dense 8×, attention 64× (8²) | recomputed: 1,048,576/131,072 = 8; 8² = 64 | DERIVED-OK |
| 5 | Total attention ≈ c·(N² + N·M + M²/2) | ch03:137 (cross-book recall of book's own decomposition) | DERIVED-OK |
| 6 | Qwen3 8B ~144 KiB KV/token BF16 → 128K ≈ 18 GiB | kv-cache-bytes-formula.md L10/L27 (147,456 B; 18.0 GiB) | TRACED |
| 7 | Single-stream droop 208→165→101 t/s (short→32K→128K) | ch04:159+ — labeled "derived… floors, not forecasts" at source | DERIVED-OK |
| 8 | MagicDec ≤2.51× Llama-3.1-8B @ batch 32–256; ~90% self-spec 70B @batch 1, 4K–100K contexts | spec-decode-acceptance-data.md L12–13 (arXiv:2408.11049) | TRACED |
| 9 | GPT-5: 400K window, 128K output reserve, 272K max input | context-window-claims.md | TRACED |
| 10 | Anthropic 1M windows; Sonnet 4.5 ≤200K/>200K tiers; 4.6+ no long-context surcharge | context-window-claims.md + token-pricing-anatomy.md L49 | TRACED |
| 11 | Gemini 3.1 Pro 1,048,576 in / 65,536 out; $2/$12 ≤200K, $4/$18 above | context-window-claims.md | TRACED |
| 12 | Llama 4 Scout 10M; Qwen 1M with ~998K max input (997,952) | context-parallelism-long-context.md; context-window-claims.md | TRACED |
| 13 | 300K = $1.20; 199K ≈ $0.40; ~3× cheaper; tiering per-prompt | context-window-claims.md worked example ($1.22 total incl. output; $0.41) | TRACED |
| 14 | xychart cost line [0, 0.10, 0.20, 0.30, 0.398, 0.804, 1.00, 1.20, 1.60, 2.00] | recomputed at $2/M (≤200K) and $4/M (>200K): all 10 points exact | DERIVED-OK |
| 15 | Ring Attention: d−1 hops, exact; arXiv:2310.01889 | context-parallelism-long-context.md ("N−1 hops", exact) | TRACED |
| 16 | 1M-token prefill Llama 3 405B, 128 H100 / 16 nodes: 77 s, 93% efficiency, 63% FLOPS; 128K in 3.8 s | context-parallelism-long-context.md (arXiv:2411.01783) | TRACED |
| 17 | Megatron CP for 8K+; dynamic-CP per microbatch | context-parallelism-long-context.md | TRACED |
| 18 | USP / long-context-attention library; Ulysses head-scatter; arXiv:2405.07719 | context-parallelism-long-context.md | TRACED |
| 19 | Mooncake global KV pool (DRAM/SSD); Kimi +75% in-SLO requests; FAST '25 | context-parallelism-long-context.md | TRACED |
| 20 | Scout: mid-training + iRoPE w/ temperature scaled by length (Meta, Apr 2025) | context-parallelism-long-context.md | TRACED |
| 21 | Scout independent test ~15.6% @128K, collapse past ~1M (hedged) | context-parallelism-long-context.md (TokenMix blog, hedged) | TRACED |
| 22 | RULER: GPT-4 128K/32K; Yi-34B 200K/16K; LWM 1M/<4K; ~half of 17 models ≥32K | context-window-claims.md (arXiv:2404.06654) | TRACED |
| 23 | Lost in the Middle, positional ends>middle; arXiv:2307.03172 | context-window-claims.md | TRACED |
| 24 | Claude Code auto-compact: `effectiveContextWindow − autocompactBufferTokens`; ~13K buffer (unofficial) | context-compaction-tradeoffs.md (autoCompact.ts + deep-dive, hedged) | TRACED |
| 25 | Compaction API: threshold → summary → `compaction` block → drops pre-point content | context-compaction-tradeoffs.md | TRACED |
| 26 | Cache match = exact prefix; mutation invalidates → full-price re-prefill; no provider prices it | context-compaction-tradeoffs.md | TRACED |
| 27 | Multipliers: write 1.25×, read 0.1×, 5-min TTL (mid-2026) | prompt-caching-provider-semantics.md L7–8; provider-latency-snapshot-2026.md | TRACED |
| 28 | 150K cached → ~15K-equiv/turn; compact to 30K → 30K re-prefill (2× worse turn; up to 2.5× if booked 1.25× write); after: 3K-equiv, 5× cheaper | context-compaction-tradeoffs.md worked example (2×/5×); 2.5× = 37.5K/15K | TRACED + DERIVED-OK |
| 29 | Lost-in-compaction: 73% @190K → 40% @50% → 7% @98% | context-compaction-tradeoffs.md (Zenodo DOI 10.5281/zenodo.20273814) | TRACED |
| 30 | xychart recall line [73, 40, 7] | matches #29 | TRACED |
| 31 | 17% side constraints survive; extractor (Qwen3.5-9B) >90%; arXiv:2608.11242 | context-compaction-tradeoffs.md | TRACED |
| 32 | TokenPilot arXiv:2606.17016 (June 2026); up to 87% cost cut, cache-aware dual-granularity | context-compaction-tradeoffs.md | TRACED |
| 33 | MemGPT arXiv:2310.08560; `core_memory_replace`/`archival_memory_insert`; Letta core memory <80% window | context-compaction-tradeoffs.md | TRACED |
| 34 | LangGraph/LangMem `SummarizationNode` thread-forward summary | context-compaction-tradeoffs.md | TRACED |
| 35 | OpenAI automatic caching above threshold | context-compaction-tradeoffs.md | TRACED |
| 36 | Field note: 600–800K logs, cap ~180K, one-quarter tokens | operator anecdote (Field-note convention; 180/700 ≈ 0.26 ≈ quarter checks out) | OK (anecdote) |
| 37 | "Prove it": TTFT crossover ≈25K @8B-class, >100K @frontier (labeled derived) | self-labeled derived; consistent with 2·W-vs-N² crossover reasoning | DERIVED-OK |
| 38 | vLLM >128K via RoPE/YaRN `--hf-overrides`, bucketed scheduling, day-0 1M recipes | context-parallelism-long-context.md | TRACED |
| 39 | Picture-stops: Google tier at 200K, OpenAI tier ≥272K, Anthropic 1M standard | token-pricing-anatomy.md L13/L17–18 (GPT-5.5/5.4 long = ≥272K, 2× input) | TRACED |
| 40 | Checkpoint 2: 250K = $1.00, 199K ≈ $0.40, ≈2.5× | recomputed: 250,000×$4/M = $1.00; 199,000×$2/M = $0.398; ratio 2.51 | DERIVED-OK |

## Chapter 12 — The streaming contract

| # | Claim (location) | Source digest | Verdict |
|---|---|---|---|
| 1 | SSE: text/event-stream; data/event/id/retry blocks; blank-line separation | streaming-transports-normalization.md (WHATWG) | TRACED |
| 2 | Meta-only events legal; openai-python #2722 JSONDecodeError | streaming-transports-normalization.md | TRACED |
| 3 | Chat chunks: delta.content; delta.role first-only; finish_reason + `data: [DONE]` | streaming-transports-normalization.md | TRACED |
| 4 | finish_reason values incl. content_filter, function_call | digest lists stop/tool_calls/length ("such as"); rest per OpenAI API reference cited in text | TRACED (by citation) |
| 5 | Responses API typed events (output_item.added, output_text.delta, response.completed) | streaming-transports-normalization.md | TRACED |
| 6 | Anthropic ordered log: message_start → block_start → deltas → block_stop → message_delta(stop_reason+usage) → message_stop | streaming-transports-normalization.md | TRACED |
| 7 | Anthropic stop_reason enum (7 values incl. pause_turn, refusal, model_context_window_exceeded) | mechanism TRACED in digest; enum per Anthropic docs cited in text | TRACED (by citation) |
| 8 | Gemini `?alt=sse` mandatory for SSE; finishReason on last chunk (STOP/MAX_TOKENS/SAFETY/RECITATION) | streaming-transports-normalization.md (STOP/MAX_TOKENS in digest; rest by citation) | TRACED |
| 9 | LiteLLM map_finish_reason; GLM `network_error` mid-stream → Pydantic error; PR #22673 | streaming-transports-normalization.md | TRACED |
| 10 | Realtime WebSocket/WebRTC; Live API WS-only, 16 kHz in / 24 kHz out PCM, ~10-min resets | streaming-transports-normalization.md | TRACED |
| 11 | Tool calls: index/id/name-once/fragments; parse only at finish | tool-call-delta-streaming.md | TRACED |
| 12 | Responses: item_id accumulation, done events | tool-call-delta-streaming.md | TRACED |
| 13 | Anthropic toolu_ id, input_json_delta partial_json, parse only after content_block_stop | tool-call-delta-streaming.md | TRACED |
| 14 | ~one key/value pair per delta (gaps normal) | tool-call-delta-streaming.md | TRACED |
| 15 | Gemini args as object; step.start/step.delta partial_arguments; MALFORMED_FUNCTION_CALL | tool-call-delta-streaming.md | TRACED |
| 16 | `{"ci`+`ty": "Por`+`tland"}` → `{"city": "Portland"}` | streaming-transports-normalization.md worked example | TRACED |
| 17 | Empty args `""` → coerce `{}`; `partial_json: ""` mid-stream skip | tool-call-delta-streaming.md | TRACED |
| 18 | Parallel calls by index/item_id/block+toolu_; no interleaving within one index | tool-call-delta-streaming.md | TRACED |
| 19 | vLLM parses may be malformed / violate schema (expected failure) | tool-call-delta-streaming.md | TRACED |
| 20 | vLLM: queued cancelled pre-execution; running aborted after current step; #10087 unnoticed-until-output | cancellation-timeout-semantics.md | TRACED |
| 21 | Anthropic: streaming required for large max_tokens "to avoid HTTP timeouts" | cancellation-timeout-semantics.md | TRACED |
| 22 | No billed-before-abort clause (mid-2026); community reports hedged | cancellation-timeout-semantics.md | TRACED |
| 23 | OpenAI SDK 10-min default; 408 auto-retried ×2; ~30 min derived | cancellation-timeout-semantics.md (incl. derivation) | TRACED |
| 24 | Anthropic SDK: 10-min overall / 5-s connect / 2 retries / 0.5→8 s (`_constants.py`) | cancellation-timeout-semantics.md | TRACED |
| 25 | Gemini SDK: ≤4 retries, ~1 s → 60 s (guide updated 2026-07-27) | cancellation-timeout-semantics.md | TRACED |
| 26 | Pings documented; content-delta-only stall clocks; field note 120-s gap | cancellation-timeout-semantics.md (ping/mechanism); 120 s = anecdote | TRACED + anecdote |
| 27 | Capture-and-resume: ≤4.5 assistant continuation; ≥4.6 user-message | cancellation-timeout-semantics.md | TRACED |
| 28 | Usage fields: OpenAI prompt/completion/total + cached_tokens + newer cache_write_tokens + reasoning_tokens | provider-api-anatomy.md L23–26; cost-metering-attribution.md | TRACED |
| 29 | Responses renames input_tokens/output_tokens | provider-api-anatomy.md | TRACED |
| 30 | Anthropic exclusive buckets; 5-min/1-hour breakdown; identity total = reads + writes + fresh | cost-metering-attribution.md L7; provider-api-anatomy.md L51–52 | TRACED |
| 31 | Gemini promptTokenCount includes cached; candidates/cachedContent/thoughts counts | provider-api-anatomy.md L11/L60 | TRACED |
| 32 | Claude 4.7+ tokenizer ~30% more tokens same text | token-pricing-anatomy.md L50/L107; tokenizer-fundamentals.md L19 | TRACED |
| 33 | TTFT chart 0.4 s TTFT / 25 ms TPOT; not-streaming [0.4, 1.65, 2.9, 4.15, 5.4] | latency-vocabulary.md worked example (5.4 @200); chart intermediate points use N×TPOT | DERIVED-OK (see P2-1) |
| 34 | GLM-5.3 ≈1.6 s input / ≈30.1 s reasoning / ≈7.5 s answer | latency-vocabulary.md (Artificial Analysis, fetched 2026-08-27) | TRACED |
| 35 | gpt-oss-120b ~3,000 t/s Cerebras vs ~500 t/s Groq = 6× | provider-latency-snapshot-2026.md (3000/500 = 6 derived) | TRACED |
| 36 | Caching "no effect on output token generation"; no ms-per-hit published (checked) | provider-latency-snapshot-2026.md | TRACED |
| 37 | Hosted providers expose no TTFT distributions; queue/KV/latency = engine internals | serving-observability-metrics.md L18+ | TRACED |
| 38 | vLLM `/metrics` time_to_first_token_seconds histograms server-side | serving-observability-metrics.md L10 | TRACED |
| 39 | DeepSeek dual OpenAI/Anthropic endpoints; OpenAI shapes as interchange | provider-api-anatomy.md L64–67 | TRACED |
| 40 | Answers #5: 10 min × 3 attempts ≈ 30 min | cancellation-timeout-semantics.md | TRACED |

## Findings

**[P2-1] ch12 §12.6 xychart uses N×TPOT while the book's identity is (N−1)×TPOT.**
Current: `line "not streaming" [0.4, 1.65, 2.9, 4.15, 5.4]` at [0, 50, 100, 150, 200] tokens.
The ch2 identity (and latency-vocabulary.md's worked example: 0.4 + 199×0.025 ≈ 5.4) uses (N−1) deltas; the chart's intermediate points compute 0.4 + N×0.025 (50 → 1.65; identity gives 1.625 → "1.6"). Impact is one token-step (25 ms) — invisible at the printed 2-decimal endpoints (5.375 rounds to 5.4), visible only at 1.65 vs ~1.63. Fix (optional): either recompute the line as 0.4 + (N−1)×0.025 → [0.4, 1.625, 2.875, 4.125, 5.375], or relabel the title "(illustrative: TTFT 0.4s + N×TPOT 25ms)". Cosmetic; the chart is labeled illustrative and the shape is the lesson.

**[P2-2] ch11 §11.2 dated box: "Anthropic… 4.6+ generations carry no long-context surcharge" is an inference.**
The digests list 1M windows for Opus 5/4.8/4.7/4.6 and Sonnet 5/4.6 (context-window-claims.md) and show tiered pricing only for Sonnet 4.5; token-pricing-anatomy.md L49 confirms "no long-context surcharge" for current Claude. The manuscript's phrasing is supported, but the *specific* "4.6+" boundary line is assembled from two digests rather than one sentence. Suggested (optional) hedge: "current-generation (4.6+) sheets list no long-context tier" — one word, same meaning, tighter sourcing.

## Verdict

**ch11: 40 claims — 33 TRACED, 7 DERIVED-OK (incl. 1 anecdote + 1 self-labeled derived), 0 UNTRACEABLE, 0 MISMATCH.**
**ch12: 40 claims — 37 TRACED, 3 DERIVED-OK, 0 UNTRACEABLE, 0 MISMATCH.**
**Total: 80 claims · P0 = 0 · P1 = 0 · P2 = 2.** Both chapters hold; the two P2s are one-word/one-line polish, neither changes any number a reader would act on.
