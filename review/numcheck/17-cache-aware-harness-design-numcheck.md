# Numcheck — 17-cache-aware-harness-design + 18-your-own-engine-room

checked: 2026-08-28 · checker: glm-5.3-flash (worker, post-fix re-verification)
Method: every numeric claim extracted from the post-Gate-6/pedagogy-fix text, traced to its dated digest in research/, arithmetic recomputed. Verdicts: TRACED (digest states it), DERIVED-OK (arithmetic correct from traced inputs), UNTRACEABLE, MISMATCH.

## Chapter 17 — cache-aware harness design

| # | Claim (location) | Digest / arithmetic | Verdict |
|---|---|---|---|
| 1 | Write 1.25× (5-min), 2× (1-hour), read 0.1× (17.1, 17.2, 17.4, 17.6) | prompt-caching-provider-semantics L7: 1.25× / 2× / 0.1×, Anthropic docs 2026-08-27 | TRACED |
| 2 | TTL 5-min default, 1-h premium; clock from request start; 4-min streamed reply leaves ~1 min (17.4) | same digest L8, verbatim incl. the 4-minute example | TRACED |
| 3 | Reads walk back at most 20 blocks per breakpoint; silent miss past it (17.4, Checkpoint 5) | same digest L5 ("look back up to 20 blocks"); session-resumption L31 | TRACED |
| 4 | Gemini implicit-cache minimum 2,048 tok (2.5-gen) / 4,096 (3.x) (17.5) | same digest L12 | TRACED |
| 5 | OpenAI per-machine cache; >~15 req/min/org can overflow-route; `prompt_cache_key` groups (17.5) | same digest L11; subagent-context-isolation L17 | TRACED |
| 6 | Anthropic entry available only once first response begins; stagger children (17.5) | subagent digest L19 | TRACED |
| 7 | Opus-5-class $5/M base, $6.25 5m write, $10 1h write; Sonnet-5-class $2/$2.50/$4 (17.4 box) | session-resumption L7 (per-MTok price ladder) | TRACED |
| 8 | Warm read 200K: $0.10 Opus / $0.04 Sonnet | 0.2M × ($5×0.1)/M = $0.10; × ($2×0.1)/M = $0.04 | DERIVED-OK |
| 9 | Cold 5-min rebuild: $1.25 / $0.50; 1-hour: $2.00 / $0.80 | 0.2M × $6.25 = $1.25; × $2.50 = $0.50; × $10 = $2.00; × $4 = $0.80 | DERIVED-OK |
| 10 | "12.5× the warm read" (box, 17.6 ledger row, Checkpoint 1) | 1.25 ÷ 0.1 = 12.5 | DERIVED-OK |
| 11 | ~$1.25 per cold resume on 200K Opus; idle ≥5 min adds 30–60% to a day's cost (vendor blog, March 2026, hedged) | session-resumption L14, incl. hedge | TRACED |
| 12 | Issues #42338 (~500K session, 400–500K write per re-entry) and #71659 (Pro 5-hour window exhausted in ~1 hour) | session-resumption L13 | TRACED |
| 13 | 100K on 70B ≈ 8–10 s prefill (vendor estimate); vLLM 78% TTFT drop 4.3→0.97 s, Qwen3-32B; prefill 85–95% of per-request compute 8K–128K (hedged) | session-resumption L15–L16 | TRACED |
| 14 | `promptCacheTtl` v2.1.242+; main conv 1-h on subscription, 5-min on API/cloud; subagents/workflows/forks/compaction 5-min | session-resumption L12 | TRACED |
| 15 | Compaction call = one extra request, no tools, reads the warm cache (17.3) | context-compaction-tradeoffs L8 ("maxTurns=1, no tools… reads the existing prompt cache") | TRACED |
| 16 | 150K→30K example: 15K-eq/turn before; 30K re-prefill once; 3K-eq/turn after (17.3) | context-compaction L21, same derived example | TRACED |
| 17 | Break-even t = 2.5 turns; "ahead from the third turn" | 30K + 3K·t = 15K·t ⇒ t = 2.5 | DERIVED-OK |
| 18 | Chart series [0,30,60,90,120,150] and [30,36,42,48,54,60] | 15K/turn and 30K + 3K/turn at turns 0,2,4,6,8,10 | DERIVED-OK |
| 19 | 40K→10K compact: break-even < 4 turns; saves 3K-eq/turn | 10K + 1K·t = 4K·t ⇒ t = 3.33; 4K−1K = 3K | DERIVED-OK |
| 20 | 2× writes are 60% dearer than 1.25× | 2.00 ÷ 1.25 = 1.60 | DERIVED-OK |
| 21 | Two gaps justify the 1-hour premium: 2 + 0.1·N < 1.25·N for N ≥ 2 | N=2: 2.2 < 2.5 (Checkpoint 2 uses same numbers) | DERIVED-OK |
| 22 | First hit repays the write: one 0.9× discount vs 0.25× surcharge | 1.0 − 0.1 = 0.9 > 0.25 | DERIVED-OK |
| 23 | Subagent runs in own context, own system prompt/tool subset, never parent transcript (17.5) | subagent digest L11 | TRACED |
| 24 | N children shared preamble: 1.25 + 0.1·(N−1); 10 children 2.15× vs 10×; 4.7× (17.5, 17.6) | subagent digest L18 (OpenAI-docs-framed formula) | TRACED |
| 25 | 2.15 vs 10 ⇒ 4.7× | 10 ÷ 2.15 = 4.65 ≈ 4.7 | DERIVED-OK |
| 26 | OpenAI fork guidance: stable-first, breakpoints after each tool result, stable `prompt_cache_key`; >90% hit-rate figure illustrative/flagged | subagent digest L16 ("hypothetical figure flagged as such by OpenAI") | TRACED |
| 27 | Checkpoint 4: shared 25K + 6K + 9×8K = 103K-units vs isolated 10×1.25×26K = 325K; ~3.2× | 31K + 72K = 103K; 325K; 325 ÷ 103 = 3.16 ≈ 3.2 | DERIVED-OK |
| 28 | Claude Code system prompt embeds working directory, platform, git snapshot (17.2) | subagent digest L13 | TRACED |
| 29 | Fork: 0.1× read of parent prefix + branch at full; different directory/model ⇒ different hash (17.5) | session-resumption L31 | TRACED |
| 30 | ch11 loss numbers recited: 73% recall at 190K → 40% at 50% compaction, 7% at 98%; 17% side constraints survive (17.3) | context-compaction L12–L13 | TRACED |
| 31 | Checkpoint 1: rebuild $0.50 vs warm $0.04 (Sonnet-5-class $2/M) | 0.2M × $2.50 = $0.50; × $0.20 = $0.04 | DERIVED-OK |

## Chapter 18 — your own engine room

| # | Claim (location) | Digest / arithmetic | Verdict |
|---|---|---|---|
| 32 | Instrument table tildes (tracer ~10, normalizer ~150, ledger ~130, scheduler ~120, router ~150, store ~160); "roughly seven hundred lines" | actual: 20/193/141/127/133/114, total 728; tilde sum 720; Appendix D reconciles exactly (guards pushed three modules over; "within a rounding" holds at 728 vs 720) | DERIVED-OK (see P2-1) |
| 33 | GGUF ladder: F32/F16/BF16; Q4_0–Q8_0 legacy; Q2_K–Q8_K; IQ1_S–IQ4_NL; TQ1_0/TQ2_0/MXFP4 | local-edge L5, exact list | TRACED |
| 34 | Q4_K_M recommended default; one-line `llama-quantize` | local-edge L6 | TRACED |
| 35 | Llama-3-8B: Q4_0 ≈4.34 GB +0.4685 ppl; Q4_1 ≈4.78 +0.4511; Q5_0 ≈5.21 +0.1316 (box) | local-edge L6, all three pairs verbatim | TRACED |
| 36 | 70B Q4_K_M ≈ 40 GB; 400 GB/s chip ⇒ ≈ 10 t/s; matches community | local-edge L19 | TRACED + DERIVED-OK |
| 37 | M4 Max claim 20–28 t/s; bandwidth law needs ~800–1,120 GB/s (derived); Max-class ~12; M4 Ultra ~21; Q8 ~10–12 t/s; ~43 GB RAM | local-edge L9–L10, L19; 20–28 × 40 GB = 800–1,120 GB/s | TRACED + DERIVED-OK |
| 38 | Llama 3.3 70B Q4_K_M: ~12 t/s (Ollama) to 21 (MLX, M4 Ultra 192 GB); Mistral 7B ~20 on base M3 16 GB | local-edge L10 | TRACED |
| 39 | MLX ~15–30% faster than llama.cpp; ~10% less memory (hedged order-of-magnitude) | local-edge L12 | TRACED |
| 40 | arXiv 2511.05502 head-to-head on Mac Studio M2 Ultra 192 GB (MLX/MLC-LLM/Ollama/llama.cpp/PyTorch MPS) | local-edge L8 | TRACED |
| 41 | Ollama on Apple Silicon built on MLX (preview), per Ollama blog | local-edge L7 | TRACED |
| 42 | H100 ≈ $2.39–2.49/hr (RunPod, Lambda); A100 ≈ $1.49–2.49/hr; 4090-class from ~$1.49/hr; DeepInfra $0.02–$2.85 per 1M | local-edge L13–L14 (rates checked 2026-08-02 / April 2026, dated in box) | TRACED |
| 43 | 10M tok/mo × $0.60/M = $6/month; H100 24/7 = 720 × $2.49 ≈ $1,793/month | local-edge L22–L23; 720 × 2.49 = 1,792.8 | TRACED + DERIVED-OK |
| 44 | 1B tok/mo: API $600; A100 $1.49 × 720 ≈ $1,073 | local-edge L24; 1,072.8 ≈ 1,073 | TRACED + DERIVED-OK |
| 45 | Breakeven ≈ 1,790M tok/mo; ~895,000 s at 2,000 t/s; ~35% of every hour; 2,000 t/s labeled H100-class, A100 less | 1,073 ÷ 0.6 = 1,788M; ÷ 2,000 t/s ≈ 894,150 s; ÷ 2,592,000 s (30 d) = 34.5% ≈ 35% | DERIVED-OK |
| 46 | Checkpoint 1: 70B Q4_K_M ~40 GB fits 64 GB; 12–21 t/s; Q8 doubles footprint, roughly halves speed (all community/hedged) | local-edge L9–L10; Q8 ≈ 8.5 bpw ⇒ ~2× Q4 footprint | DERIVED-OK |
| 47 | Checkpoint 2: 500 GB/s ÷ 4.5 GB ≈ 110 t/s ceiling for 8B Q4 | 111.1 ≈ 110 | DERIVED-OK |
| 48 | Checkpoint 3: 100M tok = $60/mo API vs $1,073 GPU = 18× | 1,073 ÷ 60 = 17.9 ≈ 18× | DERIVED-OK |
| 49 | Checkpoint 4: same breakeven math as #45, hedged | see #45 | DERIVED-OK |
| 50 | "Sixteen of these eighteen chapters were about the third term" | ch2–ch17 inclusive = 16 | DERIVED-OK |
| 51 | Manifesto dial prices (batch/quant/cache/speculate/own tradeoffs) — qualitative, no numbers | n/a | N/A |

## Findings

**P0 = 0 · P1 = 0 · P2 = 2**

- **[P2]** `18-your-own-engine-room.md` (18.2 table): the "Lines" column presents design-time tildes (~10…~160) as if current counts; shipped counts differ per module (tracer 20, store 114). The sum-level claim survives (728 vs 720, "within a rounding") and Appendix D owns exact counts, but the table header could say "Lines (design est.)" or carry a one-word pointer to Appendix D. Cosmetic-consistency only; no reader would derive a wrong engineering decision from it.
- **[P2]** `17-cache-aware-harness-design.md` (Build it): "Roughly 160 lines" for SessionStore vs shipped 114 — same class as above; the reconciliation lives only in Appendix D. A parenthetical "(Appendix D carries shipped counts)" would close the loop. No numeric error: the sentence is an estimate, flagged as rough, and the estimator's-disclosure convention is documented.

No UNTRACEABLE claims. No MISMATCHes. All derived arithmetic recomputed and correct, including the five checkpoint answers, the chart series, the fleet formula (1.25 + 0.1·(N−1) ⇒ 2.15×/4.7×/3.2×), the resume-cost ladder ($0.04/$0.10/$0.50/$0.80/$1.25/$2.00), the 12.5× premium, and the crossover worksheet ($6/$600/$1,073/$1,793, 1,790M tokens, 895,000 s, 35%).
