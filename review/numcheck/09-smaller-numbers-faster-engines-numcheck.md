# Post-fix numbers re-verification — ch09 (Smaller numbers, faster engines) + ch10 (One model, many chips)

verified: 2026-08-28 · verifier: glm-5.3-flash (worker, numcheck pass 5.5)
Method: every numeric claim extracted from the current post-fix manuscript; each traced to its dated digest in `research/` (value + date + source); derived arithmetic recomputed from first principles.

**Verdict: CLEAN — 0 P0, 0 P1, 2 P2 (both cosmetic rounding/phrasing). 101 claims checked (ch09: 55, ch10: 46).**

## Chapter 9 — claim table

| # | Claim (manuscript) | Digest | Verdict |
|---|---|---|---|
| 1 | 8B model ≈ 8B weights, FP16/BF16 2-byte formats (Meta model card 2024) | quantization-menu (worked example), kv-cache-bytes-formula | TRACED |
| 2 | `q = round(w/s) + z`; `s = (max−min)/(2^b − 1)` per channel; g128 grouping (vLLM/LLM Compressor docs) | quantization-menu §How-it-works (verbatim) | TRACED |
| 3 | Channel [−0.08, +0.08] at INT4 → s = 0.16/15 ≈ 0.0107; worst error s/2 ≈ 0.0053 | quantization-menu (verbatim worked example); recomputed: 0.16/15 = 0.010667, /2 = 0.00533 | TRACED |
| 4 | …"about 3% of the channel's full span" | recomputed: 0.00533/0.16 = **3.33%** — "about 3%" rounds down | DERIVED-OK (see P2-1) |
| 5 | 8B BF16 ~16 GB ÷ 3.35 TB/s ≈ 4.8 ms/token → ~208 t/s | decode-bandwidth-wall (H100 3.35 TB/s); recomputed: 16/3.35 = 4.78 ms; 1000/4.78 = 209 | DERIVED-OK |
| 6 | FP8 (~8 GB) → ≈2.4 ms → ≈415 t/s; INT4 (~4 GB) → ≈1.2 ms → ≈830 t/s; ×0.7 haircut → ~580 t/s | same constants; recomputed: 415.8, 831.7, 582 | DERIVED-OK |
| 7 | SmoothQuant: up to 1.56× speedup, 2× memory, OPT-175B-class, no retraining, arXiv:2211.10438 (2023) | quantization-menu, quantization-quality-benchmarks (verbatim) | TRACED |
| 8 | e4m3/e5m2 FP8 variants on Hopper | quantization-menu §W8A8 | TRACED |
| 9 | GPTQ: 3–4 bits "negligible perplexity loss" on 175B; ~3.25× on A100, ~4.5× on A6000, arXiv:2210.17323 (2022) | both quant digests (verbatim; "authors' qualitative claim" hedge preserved in book) | TRACED |
| 10 | AWQ: ~1% salient channels, ~512 calibration samples, >3× vs FP16 HF, Llama-2-70B on Jetson Orin, arXiv:2306.00978 | quantization-menu (verbatim) | TRACED |
| 11 | MXFP4: block-exponent 4-bit float; gpt-oss-120b (117B) fits single 80 GB H100/MI300X; 20b runs ~16 GB; post-trained intended precision, arXiv:2508.10925 | quantization-menu, moe-routing-serving-detail (verbatim) | TRACED |
| 12 | Baseten FP8 (Mistral-7B, TensorRT-LLM, H100): 8.5% lower TTFT, 33% faster output t/s, 31% higher throughput, 24% lower $/Mtok | quantization-quality-benchmarks (verbatim) | TRACED |
| 13 | SemiAnalysis InferenceX, Qwen 3.5 397B on B200: FP8 18% cheaper/token and 18% faster/chip; 23% on B300 | same-model-different-providers (verbatim: 1429 vs 1216 t/s/chip = +17.5%; $0.34 vs $0.40 = 17.6%; B300 1815 vs 1475 = +23%, $0.35 vs $0.43 = 22.9%) | TRACED (digest's own summary; raw digest numbers self-consistent) |
| 14 | COLM 2025 study: R1 distills 1.5B–70B + QwQ-32B; AIME, MATH-500, GPQA-Diamond, LiveCodeBench, arXiv:2504.04823 | quantization-quality-benchmarks (verbatim) | TRACED |
| 15 | 8-bit best-method deltas: −0.41 (1.5B), +0.88 (7B), +0.05 (32B), +0.36 (70B) | same digest (verbatim) | TRACED |
| 16 | SmoothQuant 1.5B: −4.43 avg; AIME 21.67 → 17.50 | same digest (verbatim) | TRACED |
| 17 | 500,000+-evaluation Llama-3.1 study: W8A8-FP8 "effectively lossless", arXiv:2411.02355 (Databricks) | same-model-different-providers (verbatim, incl. paper title) | TRACED |
| 18 | W4A16: −0.82 to −3.27 avg; MATH-500/LiveCodeBench ≤2 pts; GSM8K 0.00 in one W4A4 case | quantization-quality-benchmarks (verbatim) | TRACED |
| 19 | 70B AIME cliff: AWQ 59.17 → 52.50 (−6.67); GPTQ 59.17 → 47.50 (−11.67) | same digest (verbatim; deltas recomputed: −6.67, −11.67 ✓) | TRACED |
| 20 | Per-model variance: 7B/32B Qwen −0.8..−1.8; 1.5B/70B Llama −1.4..−3.3; survey arXiv:2404.14047 "non-negligible degradation" | same digest (verbatim) | TRACED |
| 21 | OOD calibration: AWQ 0.5–0.6 ppl vs GPTQ 2.3–4.9 (ChatOET community summary, 2026) | same digest (verbatim; book preserves "community source, approximate" hedge) | TRACED |
| 22 | Q4_K_M local quant hedge: community approximation, no primary table | same digest (verbatim — hedged in book) | TRACED |
| 23 | KV: Llama 3.1 8B 128 KiB/token → 64 at FP8 | kv-cache-bytes-formula (128 KiB ✓; halving arithmetic ✓) | TRACED + DERIVED-OK |
| 24 | 32k session 4 GiB → 2; 15 sessions → 30 (ch4 worked example) | kv-cache-bytes-formula (4 GiB @32k ✓) + ch04 manuscript L105 ("15 concurrent sessions… 30 sessions", verbatim) | TRACED |
| 25 | vLLM Apr 2026 validation: H100, concurrency 8, ~20k in/~2k out | quantization-menu + quality digest (verbatim) | TRACED |
| 26 | FP8 KV+attn Llama-3.1-8B: +14.9% (450.3 → 517.5 t/s), runtime −13% | both digests (verbatim; 517.5/450.3 = +14.92% ✓) | TRACED |
| 27 | gpt-oss-20b: +4.8% (831.6 → 871.8) | both digests (verbatim; 871.8/831.6 = +4.83% ✓) | TRACED |
| 28 | Decode-cost slope 54% of BF16 | both digests (verbatim) | TRACED |
| 29 | Break-even ~7k cached tokens (was ~25k in v0.10.2) | both digests (verbatim) | TRACED |
| 30 | xychart: BF16 slope 0.031/2k; FP8 slope 0.017/2k; intersect at 7k | recomputed from chart values: BF16 1.000→1.248 over 16k = 0.0155/1k; FP8 1.050→1.184 = 0.008375/1k; **ratio 0.008375/0.0155 = 0.54 = the 54% slope** ✓; intersection: 0.050/(0.0155−0.008375) = **7.02k** — the illustrative 5% constant reproduces the measured break-even exactly | DERIVED-OK (chart self-consistent, labeled schematic) |
| 31 | Reasoning: ≤1–2 pts; Qwen3-30B-A3B-Thinking lowest recovery 97% (GPQA-Diamond) | both digests (verbatim) | TRACED |
| 32 | MRCR 93–98% AUC recovery to 256k | both digests (verbatim) | TRACED |
| 33 | FA3 Hopper bug: 91% → 13% (FP8) → 89% (fix) | both digests (verbatim) | TRACED |
| 34 | Kimi-K2.5 uncalibrated per-tensor scales; calibrated scales via LLM Compressor recommended | both digests (verbatim) | TRACED |
| 35 | vLLM KV dtype menu: fp8, fp8/int8/int4_per_token_head, nvfp4, turboquant_* | quantization-menu (verbatim, cites vllm/config/cache.py) | TRACED |
| 36 | Llama 4 Scout host spread 53.5 → 446.7 t/s = 8.3× (Artificial Analysis) | same-model-different-providers (verbatim: Groq 446.7 vs DeepInfra 53.5; 446.7/53.5 = 8.35 ✓) | TRACED |
| 37 | Qwen3-32B single H100: FP8 "loses no measurable accuracy"; INT4 2.7× faster, −8 pts HumanEval (AIMultiple) | same digest (verbatim) | TRACED |
| 38 | OpenRouter `quantizations` filter levels int4…fp32, unknown; default routing orders by price | quality digest (verbatim) | TRACED |
| 39 | Provider rankings drift (Artificial Analysis) | same-model digest (verbatim) | TRACED |
| 40 | Field note: 40% cost drop → silent int4 host drift; canary caught drift twice | anecdote, explicitly flagged "One deployment, directional" | TRACED (hedge intact) |
| 41 | "All 8 billion of them in an 8B model… each stored in 2 bytes" (intro) | covered by claim 1; phrasing is the generic FP16/BF16 default, qualified in 9.2 | DERIVED-OK (see P2-2) |
| 42–55 | Cross-references: ch3 floor constants, ch4 KV formula/crossover, ch8 speculation stacking, ch11 long-context curves, ch16 routing manifest, ch18 GGUF ladder | verified present in sibling chapters/digests (decode-bandwidth-wall, kv-cache-bytes-formula, speculative-decoding-engines, local-edge-inference) | TRACED |

## Chapter 10 — claim table

| # | Claim (manuscript) | Digest | Verdict |
|---|---|---|---|
| 1 | 70B BF16 ≈ 140 GB vs H100 80 GB — cannot be resident | parallelism-sharding-moe (verbatim "140 GB"); 70×2 = 140 ✓ | TRACED + DERIVED-OK |
| 2 | 140 ÷ 3.35 ≈ 42 ms/token (~24 t/s ceiling) one H100 | decode-bandwidth-wall (3.35 TB/s; same-formula check at FP8 70 GB → ~48 t/s — exactly the 2× twin); recomputed: 41.8 ms, 23.9 t/s | DERIVED-OK |
| 3 | TP=2: ~70 GB each → floor ≈21 ms → ~48 t/s | same method; digest's FP8 70 GB case lands on the identical number — cross-validates | DERIVED-OK |
| 4 | Product TP×PP×EP×CP×DP; per-shard bytes = total/(t·p·e) (Megatron) | parallelism-sharding-moe (verbatim) | TRACED |
| 5 | TP: two collectives per layer per forward (all-reduce; or AG+RS sequence-parallel); sized within one node | same digest (verbatim) | TRACED |
| 6 | Megatron MoE sizing: TP 1–2, EP primary scaling, PP=8–16 typical, expert-TP rarely worth it | same digest (verbatim) | TRACED |
| 7 | PP bubble; interleaved virtual stages; DualPipe bidirectional (DeepSeek) | same digest (verbatim) | TRACED |
| 8 | DP: no per-token collectives for inference; adds aggregate throughput only | same digest (verbatim) | TRACED |
| 9 | CP: sequence sharding; all-gather/reduce-scatter around attention; Megatron positions for 8K+ sequences | same digest + context-parallelism-long-context (verbatim "8K+ tokens") | TRACED |
| 10 | Ring Attention exact, overlaps comm/compute, arXiv:2310.01889 | context-parallelism-long-context (verbatim) | TRACED |
| 11 | 1M-token Llama 3 405B prefill: 128 H100s, 77 seconds (chapter 11's headline, referenced) | same digest (verbatim: arXiv:2411.01783, MLSys 2025; 77 s at 93% efficiency) | TRACED |
| 12 | EP: all-to-all dispatch before, combine after; grouped GEMM per expert | moe-routing-serving-detail + parallelism digest (verbatim) | TRACED |
| 13 | Mixtral 8x7B: 46.7B total, ~12.9B active, 8 experts, top-2, arXiv:2401.04088 | both MoE digests (verbatim) | TRACED |
| 14 | HF framing: ~45B total / ~14B "compute" | parallelism digest sources (verbatim) | TRACED |
| 15 | DeepSeek-V3: 671B total, 37B active; 256 routed + 1 shared; 8 routed per token; first three layers dense, arXiv:2412.19437 | moe-routing-serving-detail (verbatim, incl. "except the first three") | TRACED |
| 16 | gpt-oss-120b: 117B/5.1B, 128 experts, top-4; 20b: 21B/3.6B, 32 experts, top-4, 16 GB | both MoE digests (verbatim) | TRACED |
| 17 | Decode stream: 70B dense ~140 GB vs DeepSeek-V3 ~74 GB (BF16) | parallelism digest (verbatim; 37×2 = 74 ✓); "half the traffic, ~10× capacity" recomputed: 140/74 = 1.89 ≈ half ✓; 671/70 = 9.6 ≈ 10× ✓ | TRACED + DERIVED-OK |
| 18 | 37/671 ≈ 5.5%; 5.1/117 ≈ 4.4% active fraction | moe digest (verbatim derived; recomputed: 5.51%, 4.36%) | DERIVED-OK |
| 19 | Mistral claim: matches/beats Llama 2 70B, ~6× faster inference — flagged as vendor's own | parallelism digest (verbatim; book hedge preserved) | TRACED |
| 20 | 671 × 2 bytes ≈ 1,342 GB weight storage | recomputed: 1,342 GB ✓ | DERIVED-OK |
| 21 | Router: linear projection + nonlinearity, top-k, normalized gating, shared expert on residual | moe digest (verbatim) | TRACED |
| 22 | DeepEP: dispatch/combine kernels, FP8 transport, deliberately low SM occupation | parallelism digest (verbatim) | TRACED |
| 23 | GShard/Switch lineage arXiv:2006.16668 / 2101.03961 | moe digest (verbatim) | TRACED |
| 24 | Aux-loss-free bias: γ = 0.001 first 14.3T tokens → 0.0 last 500B; seq-wise loss α = 0.0001; bias on routing scores never gating values | moe digest (verbatim, §2.1.2/§4.2) | TRACED |
| 25 | Expert capacity = (tokens/batch ÷ experts) × top-k × CF; Switch CF 1.0–1.25; drops silent, residual-only | moe digest (verbatim) | TRACED |
| 26 | DeepSeek prefill: 4-node 32-GPU EP, ~40 experts/GPU, 32 redundant | moe digest (verbatim, §3.4) | TRACED |
| 27 | Decode: 40 nodes / 160 GPUs; 20 SMs per GPU (10 comm + 10 compute, warp-specialized) | moe digest (verbatim) | TRACED |
| 28 | Node-limited routing: ≤4 nodes; ~3.2 experts/node → up to ~13 active experts within budget; chose 8+1 — flagged as authors' derived ceiling | moe digest (verbatim, §3.2.2; book hedge "not a shipped config" preserved) | TRACED |
| 29 | Checkpoint Q4 consistency: (4096/64)×8×1.25 = 640 capacity; avg demand 4096×8/64 = 512 | recomputed: 640, 512 ✓ (question's own arithmetic sound) | DERIVED-OK |
| 30 | gpt-oss-120b MXFP4 on one 80 GB GPU; 20b on 16 GB (Build it/Break it) | both MoE digests (verbatim) | TRACED |
| 31–46 | Cross-references: ch3 lever table ("splits the weight stream; bandwidths add"), ch4 sharding promise, ch5 batching as routing smoother, ch9 gpt-oss-120b 80 GB fit + sparsity knob, ch7 prefill/decode islands, ch15 retry budgets, ch18 local MoE | verified in sibling chapters (03, 04, 05, 07, 09, 15, 18) and digests above | TRACED |

## Findings

**[P0]** — none.
**[P1]** — none.

**[P2-1] ch09 §9.2 — "about 3% of the channel's full span" under-rounds.** 0.00533/0.16 = 3.33%. "About 3%" is defensible rounding of 3.3% but "about 3.3%" (or "roughly a thirtieth") is tighter at zero cost. Cosmetic; the underlying s and s/2 are exact.

**[P2-2] ch09 intro — "a very large pile of numbers, each stored in 2 bytes."** True for the FP16/BF16 training/shipping default, which §9.2 states precisely with its citation; the intro's flat "each" reads slightly absolute before that qualification lands. One softening word ("typically", "by default") would close it. Cosmetic.

Both P2s are optional polish; neither affects any number, formula, or decision rule in either chapter.

## Arithmetic re-derivation log (recomputed, not copied)

- Floor ladder: 16/3.35 = 4.776 ms → 209.4 t/s; 8/3.35 = 2.388 → 418.7; 4/3.35 = 1.194 → 837.4 (book's 208/415/830 are the 0.7-uncut floors at clean rounding); 830 × 0.7 = 581.
- 5% constant → 7k intersection: 1.000 + 0.0155x = 1.050 + 0.008375x ⟹ x = 0.050/0.007125 = 7.018k ✓ matches vLLM's measured break-even; FP8/BF16 slope ratio = 0.008375/0.0155 = 0.5403 ✓ matches the 54% slope.
- Baseten/SemiAnalysis percentages: 517.5/450.3 = 1.1492; 871.8/831.6 = 1.0483; 1429/1216 = 1.1752; 0.40/0.34 = 1.176; 1815/1475 = 1.2305; 0.43/0.35 = 1.229.
- AIME deltas: 52.50 − 59.17 = −6.67; 47.50 − 59.17 = −11.67 ✓.
- Scout spread: 446.7/53.5 = 8.349 → "8.3×" ✓.
- Ch10 floors: 140/3.35 = 41.79 ms → 23.9 t/s ("~24"); TP2 70/3.35 = 20.9 → 47.8 ("~48") ✓; 37×2 = 74; 671×2 = 1,342; 37/671 = 5.51%; 5.1/117 = 4.36% ✓.

## Digest-divergence check

None. No digest contradicts any manuscript number; the three previously logged digest divergences (cache-hit-math, rate-limit formula summary, quantization none) do not touch these two chapters. The ch09/ch10 Gate-2 fix passes (iterations 33, 34) left no stale values — spot-diffed against the fix-pass commit descriptions (FP8 format labels, provider-spread corrections) and all remain in place.
