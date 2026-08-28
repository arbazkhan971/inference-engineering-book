# Numbers re-verification — ch01 What inference engineering is + ch02 The shape of a token

verified: 2026-08-28 · verifier: glm-5.3-flash (worker, post-fix pass; manuscript HEAD past reflow/copyedit/gate-6/pedagogy fixes)

Method: every numeric/quote-level claim extracted from the CURRENT text of both
chapters; each traced to its digest in `research/` (value + date match), or
recomputed where the chapter labels it derived. Rounding conventions followed
the digest's own.

## Chapter 1 — claim table (34 claims)

| # | Claim (current text) | Digest | Verdict |
|---|---|---|---|
| 1 | "discipline of making AI models run fast, reliably, and cheaply in production" (Telnyx) | inference-engineering-discipline L5 (verbatim, retrieved 2026-08-27) | TRACED |
| 2 | Pragmatic Engineer Feb 12, 2026; 2026 breakout year | inference-engineering-discipline L6/L14 | TRACED |
| 3 | Anyscale role May 2026, $170k–$245k/yr, SF | inference-engineering-discipline L8 | TRACED |
| 4 | Together AI July 2026 + "optimize inference frameworks, algorithms, and infrastructure" quote | inference-engineering-discipline L9 | TRACED |
| 5 | Fireworks "hundreds of state-of-the-art open models" | inference-engineering-discipline L10 | TRACED |
| 6 | Huyen AI Engineering (2025) lever list | inference-engineering-discipline | TRACED |
| 7 | vLLM/PagedAttention Kwon et al. SOSP 2023; 2–4× throughput at equal latency | inference-vs-training L29 (arXiv:2309.06180) | TRACED |
| 8 | PaLM 540B 46.2% MFU, 6,144 TPU v4 | inference-vs-training L7/L27 (arXiv:2204.02311) | TRACED |
| 9 | Llama 3 41–43% BF16 MFU, 8,192–16,384 GPUs | inference-vs-training L7 (43% @8K, 41% @16K; arXiv:2407.21783) | TRACED |
| 10 | Pope et al. 2022: 29 ms/token low batch, TPU v4, 500B+ class | inference-vs-training L28 (arXiv:2211.05102) | TRACED |
| 11 | NVIDIA decode "memory-bound" quote, 2023 | inference-vs-training L10 | TRACED |
| 12 | 8B ≈ 16 GB BF16; H100 SXM 3.35 TB/s; 16÷3.35 ≈ 4.8 ms → ~208 t/s | inference-vs-training L10+derived; 16/3.35=4.776 ms, 1000/4.776=209 | DERIVED-OK |
| 13 | Orca iteration-level scheduling, OSDI 2022 | lifecycle L110 (usenix osdi22) | TRACED |
| 14 | Context rot "emerges across all models", Anthropic 2025-09-29 | failure-ownership L16-17/L46 | TRACED |
| 15 | Limits "maximum allowed usage, not guaranteed minimums" | failure-ownership L11 (Anthropic docs) | TRACED |
| 16 | Errors after HTTP 200 as SSE events | failure-ownership L13 | TRACED |
| 17 | TLS 1.3 = 1 RT; TLS 1.2 = 2; resumption ≈ 0 | lifecycle L7-8/L55 (Cloudflare) | TRACED |
| 18 | TCP handshake one round trip by protocol | lifecycle L55 | TRACED |
| 19 | Spend-cap 429s carry no retry-after, keep failing | 429-529-retry-behavior L6 | TRACED |
| 20 | No provider publishes queue-time distributions | lifecycle L67 ("no stable public figure") | TRACED |
| 21 | Sarathi-Serve chunked prefill (2024) | chunked-prefill-pd-split | TRACED |
| 22 | Anthropic SSE event sequence message_start→…→message_stop + ping | lifecycle L13-15/L82-84 | TRACED |
| 23 | Critical ~36-min 2026-08-16 21:58–22:34 UTC, claude.ai+API+Claude Code | failure-ownership L13-14 | TRACED |
| 24 | Major ~26-min 2026-08-20 elevated errors | failure-ownership L14 (19:16–19:42 UTC) | TRACED |
| 25 | OpenAI elevated latency gpt 5.1 mini + gpt 4.1 mini, resolved 2026-07-27 | failure-ownership L14 | TRACED |
| 26 | SRE ch.21: 3-attempt → just under 3×; 10% retry ratio → 1.1× | failure-ownership L17/L29 | TRACED |
| 27 | SDKs retry transient failures twice by default | failure-ownership L11 + 429-529 L10-11 (DEFAULT_MAX_RETRIES=2 both SDKs) | TRACED |
| 28 | Scout speeds Groq 446.7 / Bedrock 172.0 / Vertex 152.8 / DeepInfra 53.5; 8.3× spread | same-model-different-providers L6; 446.7/53.5=8.35 | TRACED + DERIVED-OK |
| 29 | TTFT DeepInfra 0.57 / Vertex 0.72 / Groq 0.75 / Bedrock 0.80; inversion | same-model-different-providers L8 | TRACED |
| 30 | Blended 7:2:1 DeepInfra $0.12 vs Cloudflare $0.33 → 2.7× | same-model L7; 0.33/0.12=2.75 | TRACED + DERIVED-OK |
| 31 | R1 0528: 6.1× speed (154.8 vs 25.6); 6.1× price ($0.56 vs $3.40) | same-model L9; 154.8/25.6=6.05, 3.40/0.56=6.07 | TRACED + DERIVED-OK |
| 32 | FP8 "effectively lossless", 500,000+ evals, arXiv 2411.02355 | same-model L12 | TRACED |
| 33 | SemiAnalysis FP8 ~18% faster/cheaper | same-model L13 (B200 18%; B300 23%) | TRACED |
| 34 | INT4 2.7× faster, ~8 points HumanEval drop (AIMultiple) | same-model L14 | TRACED |

## Chapter 2 — claim table (42 claims)

| # | Claim (current text) | Digest | Verdict |
|---|---|---|---|
| 1 | Vocab GPT-2 50,257 | tokenizer-fundamentals L7 | TRACED |
| 2 | cl100k_base 100,256 | tokenizer-fundamentals L7 | TRACED |
| 3 | o200k_base 199,998 | tokenizer-fundamentals L7 | TRACED |
| 4 | Llama 3 128,256 | tokenizer-fundamentals L7/L33 | TRACED |
| 5 | Qwen3 151,936 | tokenizer-fundamentals L7/L34 | TRACED |
| 6 | DeepSeek-V3 129,280 | tokenizer-fundamentals L7/L35 | TRACED |
| 7 | Gemma 2 256,000 | tokenizer-fundamentals L7 | TRACED |
| 8 | GLM-4.5 151,552 | tokenizer-fundamentals L7 | TRACED |
| 9 | Mistral Nemo Tekken 131,072 | tokenizer-fundamentals L7 | TRACED |
| 10 | gpt-oss-20b 201,088 | tokenizer-fundamentals L7 | TRACED |
| 11 | "5× spread in catalog size" | 256,000/50,257 = 5.09 | DERIVED-OK |
| 12 | Claude vocab unpublished; count-tokens endpoint exists | tokenizer-fundamentals L9 | TRACED |
| 13 | Claude 4.7+ ~30% more tokens quote | tokenizer-fundamentals L9 (verbatim, platform.claude.com) | TRACED |
| 14 | 1 token ≈ 4 chars; 100 tokens ≈ 75 words (OpenAI) | tokenizer-fundamentals L8 | TRACED |
| 15 | RPM/ITPM/OTPM token bucket; uncached-only counts vs ITPM | tokenizer-fundamentals L10 | TRACED |
| 16 | DeepSeek cache-hit $0.007 vs miss $0.22 off-peak; ~31×; peak doubles | token-pricing-anatomy L61 ($0.007/$0.014, $0.22/$0.44); 0.22/0.007=31.4 | TRACED + DERIVED-OK |
| 17 | tiktoken digit runs ≤3 chunks L→R; 1234567→3 tokens; 234567→2 | tokenizer-numbers-edge-cases L6 | TRACED |
| 18 | Llama 2/Gemma/DeepSeek single digits; 12-digit → 12 vs 4; 2–3× | tokenizer-numbers-edge-cases L7 | TRACED |
| 19 | Comma = hard boundary; 1,234,567 → 1|,|234|,|567; place alignment | tokenizer-numbers-edge-cases L8 | TRACED |
| 20 | Chinese 2–3 tokens/char; 27-token example sentence | tokenizer-numbers-edge-cases L12 | TRACED |
| 21 | 22 languages, Petrov EMNLP 2023, arXiv:2305.13707 | tokenizer-numbers-edge-cases L13 | TRACED |
| 22 | Fertility predicts accuracy; token doubling → ~4× cost/time; arXiv:2509.05486 | tokenizer-numbers-edge-cases L13-14/L35 | TRACED |
| 23 | Code formatting 24.5% avg input reduction, pass@1 held, 10 LLMs, 4 langs, arXiv:2508.13666 | tokenizer-numbers-edge-cases L11 | TRACED |
| 24 | Strawberry: low mutual information, 19 synthetic tasks, EMNLP 2025, arXiv:2505.14172 | tokenizer-numbers-edge-cases L14 | TRACED |
| 25 | K output tokens = K serial runs (Leviathan arXiv:2211.17192) | tokenizer-fundamentals L19; speculative-decoding L5 | TRACED |
| 26 | 8B ~16 GB BF16; H100 3.35 TB/s; 4.8 ms; 208 t/s (ch2 restatement) | inference-vs-training; recomputed 4.776 ms / 209 t/s | DERIVED-OK |
| 27 | Pope 29 ms/token 500B TPU v4 (ch2 restatement) | inference-vs-training L28 | TRACED |
| 28 | TTFT definition (Anthropic quote) | latency-vocabulary L7 | TRACED |
| 29 | AA counts first reasoning token as first | latency-vocabulary L7 | TRACED |
| 30 | 200-token reply → 199 ITL samples | arithmetic (N−1 gaps) | DERIVED-OK |
| 31 | vLLM ITL coloring 25 ms / 50 ms defaults; four metrics p99 | latency-vocabulary L13 | TRACED |
| 32 | TPOT definition (DistServe, arXiv:2401.09670) | latency-vocabulary L9 | TRACED |
| 33 | e2e definition (AA quote) | latency-vocabulary L11 | TRACED |
| 34 | Identity worked: 0.4 s + 199×0.025 s ≈ 5.4 s | latency-vocabulary L26; 0.4+4.975=5.375 | TRACED + DERIVED-OK |
| 35 | Speed table 365/330/131/119/67/55/39; ITLs 2.7/3.0/7.6/8.4/14.9/18.2/25.6 ms; ~9× spread | latency-vocabulary L15; 1000/N recomputes all; 365/39=9.36 | TRACED + DERIVED-OK |
| 36 | DistServe chatbot <0.2 s initial; 250 wpm reading | latency-vocabulary L17 | TRACED |
| 37 | UX thresholds 5–8 / 20–30 / 50 t/s; GMI ~10 t/s | decode-time-budget L13 | TRACED |
| 38 | AA Intelligence Index: GLM-5.3 1.6/30.1/7.5 s; Flash-Lite 8.8/1.4 s | latency-vocabulary L16 | TRACED |
| 39 | MLPerf v5.0: 70B p99 TTFT ≤450 ms, TPOT ≤40 ms (25 t/s), from 2 s/200 ms v4.0; 20–50 t/s p50 basis; 405B ≤6 s/≤175 ms (~5.7 t/s) | decode-time-budget L7-8; 1000/40=25, 1000/175=5.71 | TRACED + DERIVED-OK |
| 40 | Budget worked: (3−0.5)×8 ≈ 20 tokens ≈ 15 words; 10 s → ~76 ≈ 57 words; voice 3–5 t/s; 8 t/s reading | decode-time-budget L12/L14 | TRACED + DERIVED-OK |
| 41 | max_tokens = floor((deadline − p95_TTFT)/p95_TPOT) | decode-time-budget L25 | TRACED |
| 42 | 5×500×40 ms = 100 s chain; conversions 20 ms→50, 40 ms→25, 80 ms→12.5 t/s; xychart values | decode-time-budget L6/L15; all chart points recompute | DERIVED-OK |

## Findings

**[P2-1] ch02 §2.2 — unanchored cross-vendor "30% different" figure.**
Current: "The same paragraph is a different token count on every model —
sometimes nearly the same, sometimes 30% different."
The corpus's documented 30% figure is Anthropic's *model-generation* tokenizer
shift (claim 13), not a measured cross-vendor English-prose spread; no digest
anchors a 30% cross-vendor number (edge-case multipliers in the corpus are
2–3× for digits/CJK and ~24.5% for code). The sentence reads precise without
a source. Suggested fix: "sometimes nearly the same, sometimes tens of
percent different — Anthropic's own generation shift (below) is the
documented precedent." (Or cite the generation shift explicitly.) Severity
P2: hedged context, but the book's numbers-discipline treats
precise-sounding unsourced figures as findings.

**Informational (no action needed):**
- ch02 Kimi K3 derived ITL 25.6 ms vs digest's rounded "≈26 ms" — manuscript
  is the more precise form of the same derivation; correct.
- ch02 cites Leviathan as "arXiv:2211.17192, Nov 2022" while digests record
  the ICML 2023 venue year — the arXiv id itself encodes Nov 2022 (2211);
  both dates are defensible; no change required.

## Verdict

**76 claims checked · 75 TRACED/DERIVED-OK · 1 P2 · 0 P1 · 0 P0.**
Both chapters carry every load-bearing number to a dated digest or a
recomputing derivation; the single P2 is a one-phrase hedge tightening.
