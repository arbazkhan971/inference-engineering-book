# Numcheck — Appendix A (plain words) + Appendix B (arithmetic cheat-sheet)

checked: 2026-08-28 · checker: glm-5.3-flash (worker) · method: full read of both appendices, every numeric claim extracted, traced to research/ digests, derived arithmetic recomputed independently.

## Verdict

**P0 = 0 · P1 = 0 · P2 = 2** — every numeric claim in both appendices is TRACED to a dated digest or DERIVED-OK on recomputation. The two P2s are presentational notes, not errors.

## Appendix A — claim table (5 claims)

| # | Claim (location) | Digest evidence | Verdict |
|---|---|---|---|
| A-1 | vLLM default block = 16 tokens ("Block (page)", A.2) | paged-attention-block-tables.md L10: "Default block size in vLLM is 16 tokens (`DEFAULT_BLOCK_SIZE` … vllm/config/cache.py`; fetched 2026-08-27)" | **TRACED** |
| A-2 | Vocabulary "tens to hundreds of thousands of entries" ("Vocabulary", A.1) | tokenizer-fundamentals.md L17: "published vocabularies cluster between ~50k and ~256k entries across vendors" | **TRACED** |
| A-3 | Batch API "half price at all three majors, served within 24 hours (mid-2026 snapshot)" ("Batch API", A.3) | batch-api-economics.md L5–L8: OpenAI/Anthropic/Google all 50% off, 24-hour window, each with primary docs retrieved 2026-08-27 | **TRACED** |
| A-4 | INT4 = "sixteen levels per number" ("INT4", A.2) | 2⁴ = 16; definitional arithmetic | **DERIVED-OK** |
| A-5 | FP16/BF16 two bytes; FP8/INT8 one byte ("FP16 / BF16", "FP8 / INT8", A.2) | Definitional; consistent with quantization-menu.md byte math | **DERIVED-OK** |

## Appendix B — claim table (36 claims)

### B.1 How long will it take?

| # | Claim | Digest evidence / recomputation | Verdict |
|---|---|---|---|
| B-1 | 400 ms TTFT + 25 ms ITL × 199 → ≈ 5.4 s | 0.4 + 199×0.025 = 5.375 s ✓ | **DERIVED-OK** |
| B-2 | tokens/s = 1000 / TPOT_ms | Definitional identity ✓ | **DERIVED-OK** |
| B-3 | H100 bandwidth side at batch 64 ≈ 214 TFLOP/s; ~3.35 at batch 1 | arithmetic-intensity-roofline.md L6 (3.35 TB/s H100 SXM, NVIDIA page) + L16 ("At batch 64, AI ≈ 64 → ~214 TFLOP/s"); 3.35e12×64 = 214.4e12 ✓ | **TRACED** |
| B-4 | Ridge point = peak ÷ bandwidth; real kernels 60–80% of datasheet | roofline.md L7 (≈295 FLOP/byte BF16 dense); decode-bandwidth-wall.md L6 ("60–80% of peak HBM") | **TRACED** |
| B-5 | 70B FP8 (~70 GB) on B200 8.0 TB/s → ~115 theoretical / ~80 effective; H100 floors ≈ 48 | decode-bandwidth-wall.md L7 verbatim (B200 8.0 TB/s, 70B FP8 ~70 GB, ~115 tok/s); 0.7×114.3 = 80.0 ✓; H100: 3.35e12÷70e9 = 47.9 ≈ 48 ✓ | **TRACED** |
| B-6 | c·(N² + N·M + M²/2); 1M vs 128K: dense 8×, attention ~61–64× | attention-cost-scaling.md L21 ("attention part is 64× before the ~2PN dense term, which is only 8×"); exact (1M/128K)² = 7.8125² = 61.0 — card's "~61–64×" spans exact and rounded ✓ | **TRACED** |

### B.2 How much memory?

| # | Claim | Digest evidence / recomputation | Verdict |
|---|---|---|---|
| B-7 | KV/token = 2 × layers × KV heads × head dim × bytes | kv-cache-bytes-formula.md L8–L13 (five configs worked) | **TRACED** |
| B-8 | Qwen3 8B ≈ 144 KiB/token BF16; 128K prompt ≈ 18 GiB | kv-cache-bytes-formula.md L10 (147,456 B = 144 KiB, Qwen config fetched 2026-08-27); 144 KiB × 131,072 = 18.0 GiB exactly ✓ | **TRACED** |
| B-9 | Llama 3.1 8B KV 128 → 64 KiB at FP8 | kv-cache-bytes-formula.md L8 (128 KiB FP16) + halving is exact arithmetic ✓ | **TRACED** |
| B-10 | 80 GB card, 61 GB MXFP4 model, ~15 GiB left; weights bind | kv-cache-bytes-formula.md L35 verbatim ("MXFP4 weights ≈ 61 GB per OpenAI model card, 2025 … leaves only ~15 GiB") | **TRACED** |
| B-11 | weight bytes = params × {2, 1, 0.5} | Definitional; quantization-menu.md consistent | **DERIVED-OK** |
| B-12 | deployment = TP×PP×EP×CP×DP; per-shard = total ÷ (t·p·e); DP clean | parallelism-sharding-moe.md L28 verbatim ("Capacity per shard = total bytes / (t·p·e) … only DP adds capacity without collective traffic") | **TRACED** |
| B-13 | expert capacity = (batch ÷ experts) × top-k × capacity factor; drops are silent | moe-routing-serving-detail.md L13 (formula verbatim, GShard/Switch citations) | **TRACED** |

### B.3 What does a turn cost?

| # | Claim | Digest evidence / recomputation | Verdict |
|---|---|---|---|
| B-14 | Four-bucket identities; Anthropic total = reads + writes + fresh | ch12 digest (stream usage semantics); OpenAI/Gemini inclusive vs Anthropic exclusive — prompt-caching-provider-semantics.md L7–L22 | **TRACED** |
| B-15 | Break-even N ≥ (w−1)/(1−r); 0.28 at w=1.25, r=0.1; 1.11 at w=2 | 0.25/0.9 = 0.278 ✓; 1.0/0.9 = 1.111 ✓; inequality w + N·r < N+1 solves to N > (w−1)/(1−r) ✓ | **DERIVED-OK** |
| B-16 | $3/M, 100K prefix, ten turns → $0.375 + 9×$0.03 = $0.645 vs $3.00, ≈79% saved | write 1.25×$3/M×100K = $0.375 ✓; reads 9×0.1×$3/M×100K = $0.270 ✓; 1 − 0.645/3.00 = 78.5% ≈ 79% ✓; "flat 25% surcharge" if never reusing ✓ | **DERIVED-OK** |
| B-17 | Dead TTL pays 1.25÷0.1 = 12.5×; 2.0÷1.25 = 1.6; 200K pays $1.25 vs $0.10 (Opus-5-class) | 12.5 ✓; 1.6 ✓; Opus 5 base input $5/MTok (cost-metering-attribution.md L8) → 200K = $1.00 base → write 1.25× = $1.25 ✓, read 0.1× = $0.10 ✓; (2 + 0.1N < 1.25N ⇒ N ≥ 2) ✓ | **TRACED** |
| B-18 | Compaction: 30K + 3K·t = 15K·t → t = 2.5 turns | 30K = 12K·t → t = 2.5 ✓; before-turn cost 0.1×150K = 15K ✓; ahead from third turn ✓ | **DERIVED-OK** |

### B.4 What does the fleet cost?

| # | Claim | Digest evidence / recomputation | Verdict |
|---|---|---|---|
| B-19 | Batch = 50%, 24h, all three majors | batch-api-economics.md L5–L8 | **TRACED** |
| B-20 | 10,000 × (2,000 in + 400 out) Sonnet 4.6: interactive $120.00, batch $60.00; perfect-hit interactive $79.50 > batch $60.00 | Sonnet 4.6 $3/$15, batch $1.50/$7.50 (batch-api-economics.md L10); 20M×$3/M + 4M×$15/M = $120 ✓; ×0.5 = $60 ✓; $79.50 recomputed and verified in gate-2 ch16 fix pass (commit 80dc0aa derivation) | **TRACED** |
| B-21 | Failed re-send ≈ $0.006; 5% adds ≈ $3.00; full re-run $60.00 | Input-only re-send 2,000×$3/M = $0.006 ✓; 500×$0.006 = $3.00 ✓; re-run = batch $60 ✓ | **DERIVED-OK** |

### B.5 When do I trip the limits?

| # | Claim | Digest evidence / recomputation | Verdict |
|---|---|---|---|
| B-22 | rps ≈ TPM/60/tokens-per-call; 900k TPM @ ~500 tok → ~30 rps | client-rate-scheduling.md L27 verbatim ("900k-TPM tier with ~500-token calls ⇒ pace at ~30 requests/s") | **TRACED** |
| B-23 | Residence ≈ S/(1−ρ): 2× at 50%, 10× at 90%, 100× at 99% | 1/(1−ρ) classical; ttft-queueing-under-load.md (M/G/1) + client-rate-scheduling.md L27 ("50% → ~2×; 99% → ~100×") ✓ | **TRACED** |
| B-24 | Little's Law: 24 rps × 4 s → ≈ 96 in flight | 24×4 = 96 ✓ | **DERIVED-OK** |
| B-25 | Tail law: p=1%, N=100 → ~63%; N=10,000 → ≥ 99.99999% | 1−0.99¹⁰⁰ = 63.4% ✓; 1−0.99¹⁰⁰⁰⁰ ≈ 1−2.2e−44 → ≥ floor phrasing ✓ (ch16 gate-2 ripple fix already normalized "≈"→"≥") | **DERIVED-OK** |
| B-26 | Full jitter sleep = random(0, min(cap, base·2^attempt)); 3-attempt cap = 3× bound; ~10% budget | 429-529-retry-behavior.md L13 (AWS formula verbatim) + L14 ("3x amplification bound … retry budget … 10% of requests") | **TRACED** |
| B-27 | Adaptive throttling fraction = max(0, 1 − K·successes/requests), K ≈ 1.1 | client-rate-scheduling.md L7 verbatim ("Google found K = 1.1 … Google SRE Book, Handling Overload, retrieved 2026-08-27"); ch15's fuller (requests − K·accepts)/(requests+1) form same source ✓ | **TRACED** |

### B.6 When does guessing pay?

| # | Claim | Digest evidence / recomputation | Verdict |
|---|---|---|---|
| B-28 | E[progress] = (1−α^(γ+1))/(1−α); α=0.8, γ=4 → ≈3.36; 20% overhead → ≈2.8× | speculative-decoding-engines.md L24 verbatim (Leviathan §2, α=0.8/γ=4 → ≈3.36); 3.36/1.2 = 2.80 ✓ | **TRACED** |
| B-29 | Temp 0→1 loses 15–25% on three of EAGLE-3's four models; 70B only ~4% | spec-decode-acceptance-data.md L9: Vicuna 1−4.65/5.51 = 15.6% ✓; 8B 22.3% ✓; distill 15.4% ✓; 70B 1−3.95/4.12 = 4.1% ✓ — the "three of four / 70B exception" split is exactly right | **TRACED** |

### B.7 When does owning beat renting?

| # | Claim | Digest evidence / recomputation | Verdict |
|---|---|---|---|
| B-30 | A100 ~$1.49/hr ≈ $1,073/mo ties $0.60/M at ≈1,790M tokens ≈ 35% of every hour @ 2,000 tok/s (H100-class, optimistic for A100) | local-edge-inference.md L13 (A100 marketplace $1.49/hr) + L24 ("~$1,073/month") + L22 ($0.60/M blended, 2,000 tok/s H100); 1.49×720 = 1,072.8 ✓; 1073/0.6 = 1,788M ✓; 1,788/5,184 = 34.5% ✓; H100-class attribution = ch18 gate-2 P1 fix ✓ | **TRACED** |
| B-31 | 10M tokens/month is a $6 problem | local-edge-inference.md L23 verbatim ("10 × $0.60 = $6/month") | **TRACED** |

### Constants box

| # | Claim | Digest evidence | Verdict |
|---|---|---|---|
| B-32 | Write 1.25× / read 0.1× / 1-hour write 2×; TTL 5 min default, 1 h explicit (Anthropic-style) | prompt-caching-provider-semantics.md L7–L8 verbatim | **TRACED** |
| B-33 | Batch 50% / 24h, all three majors | batch-api-economics.md L5–L8 | **TRACED** |
| B-34 | Sonnet 4.6 $3/$15, $1.50/$7.50 batch per M | batch-api-economics.md L10 (Anthropic pricing PDF, retrieved 2026-08-27) | **TRACED** |
| B-35 | H100 rental $2.39–2.49/hr; A100 marketplace ~$1.49/hr | local-edge-inference.md L13 verbatim | **TRACED** |
| B-36 | Blended open-weight mid-tier ~$0.60/M | local-edge-inference.md L22 | **TRACED** |

## Findings (non-OK)

**[P2-1] Appendix B, B.1 single-stream floor card — the worked number is weights-only, the formula is not.**
The card states `bytes read per step = active weights + KV(context)` in B.2's decode payload, but B.1's floor worked example (70 GB ÷ bandwidth) uses weights alone, matching the digest's own worked example (decode-bandwidth-wall.md L7). This is digest-consistent and the "when it lies" section covers batching, but a reader applying the card at 128K context would over-predict speed (ch04's own droop series shows KV adding ~30–50% to the payload at long context). Suggested one-clause fix: add "(weights only; add KV per B.2 for long contexts)" after "~70 GB". Not release-blocking.

**[P2-2] Appendix A, "Batch API" entry — "all three majors" is provider-count shorthand.**
Accurate (OpenAI, Anthropic, Google — batch-api-economics.md L5–L8 confirms all three), but Appendix C is the dated shelf for exactly this claim; the glossary entry carries its own "(mid-2026 snapshot)" hedge, so this is style-level redundancy rather than an error. Optional: point at Appendix C explicitly ("Appendix C carries the dated list"). Not release-blocking.

## Recomputed arithmetic log (spot detail)

- 199 × 0.025 = 4.975; + 0.4 = 5.375 → "≈ 5.4 s" ✓
- 3.35e12 × 64 = 2.144e14 → 214 TFLOP/s ✓
- 8.0e12 ÷ 70e9 = 114.3 → "~115"; ×0.7 = 80.0 ✓; 3.35e12 ÷ 70e9 = 47.86 → "≈ 48" ✓
- 144 KiB × 131,072 = 18,874,368 KiB = 18.0 GiB ✓
- (w−1)/(1−r): 0.25/0.9 = 0.2778 → "0.28"; 1.0/0.9 = 1.111 → "1.11" ✓
- $0.375 + $0.270 = $0.645; 1 − 0.645/3.00 = 78.5% → "≈ 79%" ✓
- 30K/12K = 2.5 ✓; 1,000 − 1.1×600 = 340; 340/1,001 = 34.0% ✓
- 1 − 0.99¹⁰⁰ = 0.634 → "~63%" ✓; 0.99¹⁰⁰⁰⁰ = e^(10000·ln0.99) = e^(−100.5) ≈ 2.2e−44 ✓
- (1 − 0.8⁵)/0.2 = 0.67232/0.2 = 3.3616 → "≈ 3.36"; ÷1.2 = 2.801 → "≈ 2.8×" ✓
- 1.49 × 720 = 1,072.8 → "≈ $1,073"; ÷ $0.0006/M = 1,788M → "≈ 1,790M"; ÷ (2,000 × 2,592,000 s) = 34.5% → "about 35%" ✓

**Bottom line: 41 claims checked (A: 5, B: 36) · 0 P0 · 0 P1 · 2 P2 (presentational). Both appendices are numerically clean against the dated research corpus.**
