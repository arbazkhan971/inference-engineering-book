# Post-fix numbers re-verification — ch03 (The arithmetic of waiting) + ch04 (The memory that is not the model)

checked: 2026-08-28 · checker: glm-5.3-flash (worker, post-fix pass after reflow/copyedit/gate-6/pedagogy fixes)
Method: every numeric claim extracted from the current manuscript text; each traced to a dated digest in research/ (value + retrieval date match) or re-derived from traced constants; derived claims confirmed to be labeled as derived in the text.

## Verdict table

### ch03 — The arithmetic of waiting

| # | Claim (current text) | Digest / basis | Verdict |
|---|---|---|---|
| 1 | H100 ≈ 1 petaFLOP BF16 dense; 989.5 TFLOPS; 1,979 headline = 2:4 sparse (halve for dense) | arithmetic-intensity-roofline (NVIDIA page, 2026-08-27) | TRACED |
| 2 | PaLM 540B 46.2% MFU on 6,144 TPU v4 | inference-vs-training (arXiv:2204.02311) | TRACED |
| 3 | Llama 3 training 41–43% MFU | inference-vs-training (arXiv:2407.21783: 43% @8K, 41% @16K) | TRACED |
| 4 | Batch-1 decode ≈ 0.3% of peak compute | 3.35/989.5 = 0.34%; labeled derived | DERIVED-OK |
| 5 | H100 SXM 80 GB HBM3 @ 3.35 TB/s | roofline + decode-bandwidth-wall digests | TRACED |
| 6 | 8B BF16 ~16 GB; 70B ~140 GB BF16 / ~70 GB FP8 | Baseten rule (2 B/param) + decode-bandwidth-wall (~140 GB BF16) | TRACED |
| 7 | 16 GB ÷ 3.35 TB/s ≈ 4.8 ms → ~208 tok/s | 4.78 ms, 209.4 t/s; labeled derived | DERIVED-OK |
| 8 | 140 GB ÷ 3.35 TB/s ≈ 42 ms → ~24 tok/s | 41.8 ms, 23.9 t/s; labeled derived | DERIVED-OK |
| 9 | Pope et al.: 29 ms/token low-batch, 500B-class, TPUs | inference-vs-training (arXiv:2211.05102) | TRACED |
| 10 | NVIDIA 2023 blog: decode memory-bound, weight-transfer dominates | inference-vs-training (verbatim quote) | TRACED |
| 11 | AI ≈ 1 FLOP/byte at batch 1 (2·P ÷ 2·P) | roofline digest worked example; labeled derived | DERIVED-OK |
| 12 | Ridge H100 ≈ 295 FLOP/byte | roofline digest (989.5/3.35) | TRACED |
| 13 | 13B BF16 batch 1: 26 GB → ~129 tok/s; ~0.3–0.4% of peak | roofline digest worked example | TRACED |
| 14 | xychart: [0, 214, 429, 643, 857, 989, 989] at [0, 64, 128, 192, 256, 295, 384] | 3.35×AI capped at 989.5 | DERIVED-OK |
| 15 | Chip table: H200 989.5 / 4.8 TB/s / 141 GB / ≈206 | roofline digest (H200 datasheet; 989.5/4.8 = 206.4) | TRACED |
| 16 | B200 2,250 TFLOPS / 7.7 TB/s / 180 GB / ≈292; †192 GB & 8.0 TB/s variant → ≈281 | roofline digest (Lenovo LP2226) + decode-bandwidth-wall (sources-differ note); 2250/8.0 = 281.3 | TRACED |
| 17 | MI300X 1,300 / 5.3 TB/s / 192 GB / ≈245 | roofline digest (AMD datasheet) | TRACED |
| 18 | H200 prose: "ridge to ≈210" | digest says "roughly 210"; exact division gives 206 — see P2-1 | TRACED (wobble) |
| 19 | B200 "scales both axes ~2.3×" | 2250/989.5 = 2.28; 7.7/3.35 = 2.30 | DERIVED-OK |
| 20 | Kernels reach 60–80% of datasheet BW; 0.7 rule (Locara) | decode-bandwidth-wall (Locara docs) | TRACED |
| 21 | 70B FP8 on 8.0 TB/s B200: ~115 t/s theoretical; 5.6 TB/s ÷ 70 GB ≈ 80 t/s | decode-bandwidth-wall (ITK Research worked example) | TRACED |
| 22 | Same on H100: 3.35 ÷ 70 ≈ 48 t/s theoretical | decode-bandwidth-wall | TRACED |
| 23 | KV reads ride the same bus; grow with context (temperature2, 2026-07-14) | decode-bandwidth-wall | TRACED |
| 24 | Llama 3.1 70B 4-bit ≈ 35–40 GB; A100 community 100+ tok/s (Markaicode, hedged) | digest has the 100+ figure; 140/4 = 35 GB, labeled approximate | TRACED + DERIVED-OK |
| 25 | 35–40 GB ÷ 2.0 TB/s = 17.5–20 ms → 50–57 t/s single-stream; 140 GB floor ~14 t/s | 40/2.0 = 20 ms, 35/2.0 = 17.5 ms; 140/2.0 = 70 ms → 14.3 t/s; labeled as correction of the community figure | DERIVED-OK |
| 26 | Batch 64 → ~214 TFLOP/s useful; 64× vs batch 1 | roofline digest worked example | TRACED |
| 27 | Ridge crossed at "a batch of a few hundred" in BF16 | roofline digest | TRACED |
| 28 | vLLM Sep 2024: 70B on 4×H100, 1,500–2,500 output tok/s aggregate vs ~50–100 single-stream | decode-bandwidth-wall (vLLM v0.6.0 blog) | TRACED |
| 29 | MLPerf v6.0 vendor-quoted: B200 ~17,500 vs H100 ~3,000 tok/s | decode-bandwidth-wall (Spheron, hedged directional) | TRACED |
| 30 | Llama 3.1 70B: 320 KiB KV/token FP16; 1k ≈ 320 MiB; 32k ≈ 10 GiB; FP8 weights ~70 GB | kv-cache-bytes-formula (config-derived) | TRACED |
| 31 | Crossover B ≈ 210 @1k; B ≈ 7 @32k | 70/0.3355 = 208.7; 70/10.74 = 6.5–7 | DERIVED-OK |
| 32 | Prefill FLOPs: ~2·P·N dense; attention O(N²·d); total ≈ c·N² + c·(N·M + M²/2) | attention-cost-scaling (Dive into DL ch. 11.3; NVIDIA blog) | TRACED |
| 33 | 128k→1M: dense 8×; attention 64× (binary) / 61× (decimal); both quoted | attention-cost-scaling | TRACED |
| 34 | Qwen3 8B ~144 KiB/token BF16; 128k prompt ⇒ ~18 GiB KV | attention-cost-scaling (Raschka; 144 KiB × 131,072 = 18.4 GiB) | TRACED + DERIVED-OK |
| 35 | Gemini archived tier: $0.075/$0.15 input, $0.30/$0.60 output @128k boundary (archived 2025-06-21, verified 2026-08-27) | attention-cost-scaling | TRACED |
| 36 | Gemini 3.1 Pro: $2.00/$4.00 input @200k | attention-cost-scaling (Morph-hedged) | TRACED |
| 37 | Gemini 2.5 Flash cached reads "$0.03 vs $0.30 per 1M" + $1.00/1M/hr storage | storage TRACED (prompt-caching-provider-semantics: $1.00 for 2.5 Flash); read absolutes NOT in any digest — attention-cost-scaling says "$0.15 vs $1.50 (Flash-class)" | **MISMATCH — see P1-1** |
| 38 | L2 50–60 MB; ~1,300:1 capacity gap (H100 whitepaper; Chips and Cheese) | gpu-memory-hierarchy | TRACED |
| 39 | Pyramid: SRAM tens of MB/tens of TB/s; HBM 80–192 GB/3.35–8.0 TB/s; host RAM hundreds of GB–TB/tens of GB/s; NVMe ~7 GB/s | gpu-memory-hierarchy | TRACED |
| 40 | FlashAttention: exact, O(N²)→O(N) memory, O(N²·d²/M) traffic (Thm 2); ~15% BERT-large, ~3× GPT-2 | gpu-memory-hierarchy (arXiv:2205.14135) | TRACED |

### ch04 — The memory that is not the model

| # | Claim (current text) | Digest / basis | Verdict |
|---|---|---|---|
| 41 | Llama 3.1 8B BF16 ~16 GB (Meta model card) | kv-cache-bytes-formula | TRACED |
| 42 | 128k session → process ~33 GB (16 + ~17 GB) | 16 GB + 16 GiB(=17.18 GB) = 33.2 GB; labeled rough | DERIVED-OK |
| 43 | Formula: KV bytes/token = 2 × layers × KV heads × head dim × bytes | kv-cache-bytes-formula | TRACED |
| 44 | 2×32×8×128×2 = 131,072 B = 128 KiB; 32k → 4 GiB; 128k → 16 GiB | arithmetic exact | DERIVED-OK |
| 45 | Table rows: Qwen3-8B 36×8×128 → 144 KiB (1.1/4.5/18 GiB); 70B 80×8×128 → 320 KiB (2.5/10/40); gpt-oss-120b 36×8×64 → 72 KiB (0.56/2.25/9.0); DeepSeek-V3 61×(512+64) → ≈68.6 KiB (0.54/2.1/8.6) | kv-cache-bytes-formula table (configs fetched 2026-08-27) — all five rows match | TRACED |
| 46 | Qwen3-8B native max 40,960 positions (128k cell = arithmetic, not supported config) | kv-cache-bytes-formula | TRACED |
| 47 | gpt-oss rows are upper bounds (alternating 128-token sliding window, ~half) | kv-cache-bytes-formula + attention-variants-kv | TRACED |
| 48 | OPT-13B 800 KB/token; 1.6 GB @2,048; 6× the 8B figure on a model 60% larger | paged-attention-block-tables (arXiv:2309.06180); 800/128 = 6.25×; 13/8 = 1.625 | TRACED + DERIVED-OK |
| 49 | GPT-5: 400,000 window; 128,000 output; 272,000 max input; 400k-vs-272k errors (forum) | context-window-claims | TRACED |
| 50 | Capacity: 80 − 16 − 4 ≈ 60 GiB; 15 sessions @32k; 30 @FP8; 3 @128k | kv-cache-bytes-formula worked case (15/30 verbatim; 60/16 = 3.75 → "3" as floor) | TRACED + DERIVED-OK |
| 51 | gpt-oss-120b MXFP4 weights ≈ 61 GB → ~15 GiB left; ~dozen sessions @32k FP8 | kv-cache-bytes-formula (OpenAI model card 2025; 15/1.125 ≈ 13) | TRACED |
| 52 | Provider table: Claude 1M; Sonnet 4.5 ≤200K $3/$15; Gemini 3.1 Pro 1,048,576/65,536, $2→$4, $12→$18; Scout 10M; Qwen 1M/997,952 | context-window-claims — all match | TRACED |
| 53 | Qwen row: "output capped 65,536" without coder-tier qualifier | digest: 65,536 is coder-tier; API models list 128K max output — see P2-2 | TRACED (scope-narrowed) |
| 54 | Claude 4.6+ no long-context surcharge; older sheets tiered | token-pricing-anatomy ("Claude 4.6+ ships the full 1M window at standard pricing — no long-context surcharge") + context-window-claims | TRACED |
| 55 | OpenAI "long-context rates at ≥272K" | token-pricing-anatomy ("'Long context' for 5.5/5.4 is defined as ≥272K"; $5/$30 vs $10/$45) | TRACED |
| 56 | RULER: GPT-4 128K→32K; Command-R 35B 128K→64K; Yi-34B 200K→16K; LWM 1M→<4K; ~half of 17 models ≥32K held at 32K; NIAH blind spot; Lost-in-the-Middle | context-window-claims (arXiv:2404.06654; arXiv:2307.03172) | TRACED |
| 57 | Llama-2-70B MHA: 64 KV heads → ~2.6 MB/token; ~21 GB @8k | attention-variants-kv (~2.6 MB; ~21.3 GB) | TRACED |
| 58 | MQA (Shazeer, arXiv:1911.02150, 2019); GQA (Ainslie, arXiv:2305.13245, 2023); 8× compression, ≈MHA quality | attention-variants-kv | TRACED |
| 59 | MLA: 576 latent elements (512+64); vs 32,768 for 128-head design; ~57× elements / ~60× bytes | attention-variants-kv (~57×) + kv-cache-bytes-formula (~59×) | TRACED |
| 60 | 128k session: 8.6 GiB vs ~30 GiB GQA-8 (244 KiB/token) vs ~512 GiB full MHA (4 MiB/token) | 244 KiB = 2×61×8×128×2; 4 MiB row in digest; ×131,072 → 30.5/512 GiB | DERIVED-OK |
| 61 | Gemma 3: five windowed (W=1024) per one global; adopted for 128K KV growth (arXiv:2503.19786) | attention-variants-kv | TRACED |
| 62 | Variant ladder: GQA ~8×, MQA ~64×, MLA ~60× smaller | attention-variants-kv (architecture arithmetic) | TRACED |
| 63 | Droop: 208 → ≈165 t/s @32k (20.3 GB → ~6.1 ms) → ≈101 @128k (~33 GB → ~9.9 ms); −fifth / −half | 20.3/3.35 = 6.06 ms → 165.2; 33/3.35 = 9.85 → 101.5; −21%/−51% | DERIVED-OK |
| 64 | Crossover: 70B @32k B≈7 FP8 (~70 GB); BF16 near 13 (~140 GB) | 70/10.74 = 6.5; 140/10.74 = 13.0 | DERIVED-OK |
| 65 | vLLM preemption: RECOMPUTE default (V1), generated tokens appended, re-prefill; `vllm:preemption_requests` counter; multi-second stall; SGLang "retract"; preemption@N ≈ prefill(N) again (derived, no published constant) | preemption-recompute-swap (all five elements verbatim/derived) | TRACED |
| 66 | FP8 KV: +14.9% output throughput @8-way; 54% of BF16 decode-cost slope; net-negative below ~7k; FA3 bug 91%→13%→89% | quantization-menu + quantization-quality-benchmarks (vLLM blog 2026-04-22) | TRACED |
| 67 | FP8 KV halves every row exactly; vLLM `kv_cache_dtype="fp8"` | kv-cache-bytes-formula + quantization-menu | TRACED |
| 68 | "Only 20–38% of allocated KV memory held useful state — 62–80% waste" (Where-the-picture-stops) | paged-attention-block-tables (measured 20.4–38.2%, arXiv:2309.06180) | TRACED |
| 69 | Llama 3.1 8B has 32 layers; head_dim 128; 8 KV heads (config 2026-08-27) | kv-cache-bytes-formula | TRACED |
| 70 | 4k MiB full-MHA hypothetical = digest's 4 MiB/token row | kv-cache-bytes-formula (2×61×128×128×2 = 4 MiB) | TRACED |

## Counts

**70 claims checked: 66 TRACED, 4 DERIVED-OK-plus (24, 34, 42, 50 partly traced/derived), 0 clean DERIVED-only failures, 1 MISMATCH (P1-1), 2 P2s.**

## Findings

**P1-1 — ch03 §3.6 dated box: Gemini 2.5 Flash cache-read absolutes ($0.03 vs $0.30) exist in no digest; the one digest that addresses Flash-class cached reads gives different absolutes.**
Current: "cached context reads are billed at a tenth of fresh input ($0.03 vs $0.30 per 1M tokens on Gemini 2.5 Flash, plus $1.00 per 1M tokens per hour of storage…)"
research/attention-cost-scaling.md L11 says: "Gemini charges $0.15 per 1M cached-token reads for Flash-class models vs $1.50 per 1M fresh input (a 10× ratio), plus $1.00 per 1M tokens per hour". research/prompt-caching-provider-semantics.md confirms the $1.00/1M/hr storage for 2.5 Flash but states no read rates. So: storage TRACED; the 10× ratio structure appears in the digest; the manuscript's exact read absolutes ($0.03/$0.30) appear nowhere. One of the two rate sets is wrong, and the book's numbers rule say an untraceable number must hedge or go. Fix: either (a) re-verify against ai.google.dev and correct both chapter and a divergence note (do NOT edit the digest), or (b) hedge to structure-only: "cached reads are billed at roughly a tenth of fresh input on Flash-class models, plus $1.00 per 1M tokens per hour of storage (rates vary by model; mid-2026 snapshot)". Note ch14's provider sheet does not carry these absolutes, so no cross-chapter conflict exists today.

**P2-1 — ch03 §3.4 internal wobble: H200 ridge ≈206 in the chip table vs "≈210" in the paragraph below it.**
Both appear on the same page; a reader who divides 989.5 ÷ 4.8 gets 206.4. The digest itself says "roughly 210." Fix: pick one (table's ≈206 is the honest division; prose could say "≈206 — 'roughly 210' in vendor-adjacent rounding").

**P2-2 — ch04 §4.4 provider table, Qwen row: "output capped 65,536" generalizes a coder-tier figure.**
Digest (context-window-claims): API models (qwen3.8-max/flash) claim 1M context with **128K max output**; the 997,952-input / 65,536-output pair is from Alibaba model-studio **coder tiers**. Fix: either add "(coder tiers; API models list 128K max output)" or change the cell to "output up to 128K (65,536 on coder tiers)".

No P0s. Both chapters' load-bearing arithmetic — floors, ridges, KV table, capacity equations, droop series, crossover batches, MLA ratios — recomputes exactly from traced constants, and every dated-box structure claim (tiers, surcharges, windows) now traces to a digest after the gate-6/pedagogy fix passes.
