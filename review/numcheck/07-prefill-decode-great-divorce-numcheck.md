# Numbers re-verification — ch07 (Prefill, decode, and the great divorce) + ch08 (Guessing at the speed of light)

verified: 2026-08-28 · verifier: glm-5.3-flash (post-fix numcheck wave)
Method: full read of both chapters; every numeric/citation claim traced to a dated digest in research/ (all digests dated 2026-08-27); derived arithmetic recomputed independently. Verdicts: TRACED (digest states it), DERIVED-OK (recomputed, correct, and the text marks/derives it honestly), UNTRACEABLE (no digest support), MISMATCH (digest contradicts).

## Chapter 07 — claims table

| # | Claim (location) | Evidence | Verdict |
|---|---|---|---|
| 1 | Sarathi-Serve 2.6× vs vLLM, Mistral-7B, one A100 (intro; 7.3 box) | goodput-and-slos.md: "2.6× higher serving capacity vs vLLM for Mistral-7B on one A100" | TRACED |
| 2 | up to 3.7× Yi-34B on two A100s; 5.6× end-to-end Falcon-180B w/ pipeline parallelism (intro; box) | goodput-and-slos.md: same series verbatim | TRACED |
| 3 | 2–4× capacity under strict SLOs, ~6× relaxed, ShareGPT-style traces on A100 (7.3 box) | chunked-prefill-pd-split.md: "roughly 2–4x higher capacity under strict latency SLOs (and up to about 6x under relaxed)… ShareGPT4 traces on A100" | TRACED |
| 4 | Sarathi-Serve OSDI 2024; arXiv:2403.02310 (throughout) | both digests | TRACED |
| 5 | Splitwise quote: "a compute-intensive prompt computation, and a memory-intensive token generation…power characteristics"; arXiv:2311.18677, 2023 (7.2) | goodput-and-slos.md + chunked digest: exact quote + id | TRACED |
| 6 | 8B BF16 decode streams ~16 GB per token (7.2) | decode-bandwidth-wall.md: "model size ≈ 2× params in BF16" (Baseten); 2×8B bytes = 16 GB | DERIVED-OK |
| 7 | 512-token prompt ≈ 512× decode math, AI toward ≈512 (7.2) | arithmetic-intensity-roofline.md batching rule; marked "derived" in text | DERIVED-OK |
| 8 | decode ~15 ms iterations; 20k prompt; "hundreds of ms" prefill pass (7.2 timeline) | text marks "constants illustrative; the mechanism is per Sarathi-Serve" | TRACED (hedged illustrative) |
| 9 | Iterations per prefill ≈ prompt ÷ chunk; 20,000 @ 2,048 ≈ ten iterations (7.3) | 20,000/2,048 = 9.77 ≈ 10; formula in chunked digest; marked "derived" | DERIVED-OK |
| 10 | Iteration time ≈ time(chunk + all decodes) (7.3) | chunked digest formula | TRACED |
| 11 | vLLM V1: chunked prefill default "whenever possible", decodes prioritized (7.3) | chunked digest verbatim ("scheduler prioritizing decode requests and batching all pending decodes before scheduling prefill chunks") | TRACED |
| 12 | smaller budgets (~2,048) improve ITL; >8,192 for small models on large GPUs (7.3) | batching-size-latency-tradeoffs.md: "smaller (e.g. 2048) improves inter-token latency… >8192 recommended for small models on large GPUs" | TRACED |
| 13 | DistServe: chunked prefill insufficient for simultaneous TTFT+TPOT SLOs (7.3; 7.4) | chunked digest: "argues chunked prefill is throughput-friendly but insufficient when you must hit both" | TRACED |
| 14 | DistServe box: 13B on one A100, 90% attainment; colocated ≈1.6 req/s/GPU goodput; prefill-only ≈5.6; decode-only ≈10 (7.4 box) | goodput-and-slos.md: every figure verbatim | TRACED |
| 15 | 2:1 allocation ≈10 req/s total ≈3.3 req/s/GPU ≈ 2.1× baseline, "derived from the paper's per-GPU figures" (7.4 box) | digest states the series; recompute: min(2×5.6, 10)=10 over 3 GPUs = 3.33; 3.33/1.6 = 2.08 ≈ 2.1× | DERIVED-OK |
| 16 | up to 7.4× more requests or 12.6× tighter SLO, >90% attainment (7.4 box; 7.5) | ttft-queueing-under-load.md: "7.4× more requests or… 12.6× tighter SLO while keeping >90%" | TRACED |
| 17 | lab summary: up to 4.48× goodput chatbot; up to 41× code completion (7.4 box) | chunked digest + goodput digest: both figures | TRACED |
| 18 | Mooncake: 525% throughput (simulated long-context), 75% more requests within SLOs (Kimi production), arXiv:2407.00079 (7.4 box) | chunked digest: both figures + id | TRACED |
| 19 | Chat SLOs: initial response <~0.2 s; decode ~250 words/min (7.4 box) | goodput digest: "initial response under 0.2 s… 250 words/min" | TRACED |
| 20 | Mooncake KV tier on CPU/DRAM/SSD; prediction-based early rejection (7.4) | chunked digest | TRACED |
| 21 | KV transfer over NVLink intra-node, RDMA/IB inter-node (7.4) | chunked digest ("over NVLink within a node, RDMA/IB across nodes") | TRACED |
| 22 | no universal KV-transfer crossover number; model/hardware/network-specific hedge (7.4 costs) | decode-bandwidth-wall.md crossover hedge ("workload-dependent"); consistent | TRACED (hedge) |
| 23 | vLLM experimental disaggregated prefilling; per-phase parallelism; TTFT/ITL tuned independently (7.4) | chunked digest | TRACED |
| 24 | TTFT = queue wait + prefill; vllm:request_queue_time_seconds (queued→scheduled), vllm:request_prefill_time_seconds, TTFT from arrival (7.5) | ttft-queueing digest: exact metric names + semantics | TRACED |
| 25 | first-token time rises linearly with prefill batch size, LLaMA-2-7B on A100, arXiv:2407.05347 (7.5) | ttft digest: verbatim | TRACED |
| 26 | 49 concurrent requests at 1,280-token sequences, same measured deployment, "chapter 5's number" (7.5) | ttft digest: "maximum batch of 49 requests at 1280 sequence length for LLaMA-2-7b-chat on one A100"; intra-book cross-ref consistent | TRACED |
| 27 | preemption restarts prefill from scratch (recompute) (7.5) | ttft digest ("restarting their prefill and adding directly to TTFT") + vLLM docs | TRACED |
| 28 | 0.8 → 0.95 utilization = "under a fifth more load" multiplies queue wait ~4× (7.5) | recompute: (1−0.8)/(1−0.95) = 4.0×; load +18.75% < 20%; digest derives same ~4× | DERIVED-OK |
| 29 | M/G/1: mean wait ∝ 1/(1−ρ); p99 diverges faster than mean (7.5) | ttft digest E[W] = λE[S²]/2(1−ρ) | TRACED |
| 30 | goodput knee, past the knee added load destroys goodput (7.5) | goodput digest ("past the knee, extra offered load destroys acceptable completions") | TRACED |
| 31 | Field note: 40 docs, ~90k tokens, 6:05/6:07 hitching (7.5) | operator anecdote — book's Field-note convention (intentionally non-encyclopedic, per STYLE) | TRACED (convention) |
| 32 | 429/529-class responses = rejection not queueing → chapter 15 (7.5) | 429-529-retry-behavior.md exists (chapter-15 evidence base) | TRACED |
| 33 | Checkpoint Q3: 16,384 @ 2,048 budget (question) | computable: 8 iterations; answer not asserted in prose | OK (question) |
| 34 | Build it: "no universal spike size is documented — pick one and count" (7.5) | honest hedge; digests contain no universal spike multiplier | TRACED (hedge) |
| 35 | Prove it: --goodput ttft:2000,tpot:100 (CLI form) | goodput digest: KEY:VALUE ms pairs confirmed | TRACED |
| 36 | "20,000-token prompt full of attached documents", "twenty long prompts" (narrative counts) | narrative illustrations, no factual assertion | OK (narrative) |
| 37 | xychart TPOT 420 ms spike vs 15/22 ms (7.3) | text marks "schematic… illustrative, not measured" | OK (hedged schematic) |
| 38 | Splitwise parenthetical carries BOTH arXiv:2401.09670 and arXiv:2311.18677 under the Splitwise clause (7.4) | 2401.09670 is DistServe's id (cited correctly elsewhere); 2311.18677 is Splitwise | MISMATCH-lite → [P2-1] |

## Chapter 08 — claims table

| # | Claim (location) | Evidence | Verdict |
|---|---|---|---|
| 1 | K tokens require K serial runs (Leviathan, arXiv:2211.17192, 2022) (intro) | both spec digests; arXiv year 2022 correct (2211), ICML 2023 cited separately in 8.2 | TRACED |
| 2 | "3–6 tokens for the price of one decode step" when guesses good (intro) | τ ranges in digests (2–6.5× speedups; τ 3.5–7.5); narrative summary | DERIVED-OK |
| 3 | 70B at 20 tok/s "illustrative — chapter 3's ceiling arithmetic lands near 24" (intro) | recompute: 140 GB ÷ 3.35 TB/s = 41.8 ms → 23.9 ≈ 24 t/s (ch03 derivation; H100 3.35 TB/s in decode-bandwidth-wall.md) | DERIVED-OK |
| 4 | 2×–3× published range for the flag flip (intro) | speedup table + digests | TRACED |
| 5 | AI ≈ 1 FLOP/byte at batch-1 decode; H100 balance ≈295; "hundreds of times under-provisioned" (8.2) | arithmetic-intensity-roofline.md: "≈ 295 FLOP/byte"; AI ~1–2 | TRACED + DERIVED-OK |
| 6 | E[progress] = (1 − α^(γ+1))/(1 − α); = geometric sum (8.2) | both spec digests | TRACED |
| 7 | α=0.8, γ=4 → ≈3.36 tokens/pass (8.2) | recompute: (1−0.32768)/0.2 = 3.3616 ≈ 3.36; digest same | DERIVED-OK |
| 8 | 20% overhead → net 3.36/1.2 ≈ 2.8× (8.2) | 3.3616/1.2 = 2.80; marked "illustrative constant" | DERIVED-OK |
| 9 | xychart values 1.25/1.43/1.65/1.94/2.31/2.77/3.36/4.10 (8.2) | recomputed all eight: 1.2496/1.4251/1.6496/1.9375/2.3056/2.7731/3.3616/4.0951 — every rounded value correct | DERIVED-OK |
| 10 | 3.36→4.10 and 1.25→1.43 framing (convex bet) (8.2) | matches computed pairs | DERIVED-OK |
| 11 | Rejection rule norm(max(0, p − q)); distribution-identical theorem; Leviathan ICML 2023 + Chen 2023 (8.2) | both digests | TRACED |
| 12 | Bonus token after last accepted draft (8.2 step 4) | both digests | TRACED |
| 13 | Draft model "a few percent of the target's size" (8.3) | digests say only "a small drafter"; no size fraction published in corpus | UNTRACEABLE → [P2-2] |
| 14 | Google 2×–3× on T5-XXL (11B) (8.3 + table) | both digests | TRACED |
| 15 | DeepMind 2–3× on Chinchilla 70B (8.3 + table) | both digests | TRACED |
| 16 | Medusa-1 >2.2×; Medusa-2 2.3×–3.6×; ICML 2024 (8.3 + table) | spec-decode-acceptance-data.md: ">2.2x" / "2.3x–3.6x" | TRACED |
| 17 | EAGLE: 2.7×–3.5× LLaMA2-Chat 70B, ~2× throughput; feature level; ICML 2024 (8.3) | both digests | TRACED |
| 18 | EAGLE-2: dynamic draft trees, tree attention; 3.05×–4.26×; 20%–40% over EAGLE-1; EMNLP 2024 (8.3) | both digests | TRACED |
| 19 | EAGLE-3: "training-time test" fusing low/mid/high features; 4.1×–6.5× temp 0; NeurIPS 2025 (8.3) | both digests | TRACED |
| 20 | EAGLE-3 temp-0 means: Vicuna-13B 5.51×, Llama-3.1-8B 4.44×, Llama-3.3-70B 4.12×, R1-distill 4.16× (table) | acceptance digest: exact four values | TRACED |
| 21 | n-gram: 2×–4× on input-grounded; no model changes (8.3 + table) | both digests | TRACED |
| 22 | vLLM menu: EAGLE, MTP, draft-model, PARD, MLP (model-based, best latency) + n-gram/suffix (modest gains); speculative_config (8.3) | speculative-decoding-engines.md verbatim | TRACED |
| 23 | SGLang recommends EAGLE-3 best speed/quality (8.3) | engines digest | TRACED |
| 24 | TRT-LLM: DTM, Medusa-style, EAGLE, lookahead (8.3) | engines digest | TRACED |
| 25 | τ 5.84–6.62 across the four EAGLE-3 models; speedups "land at 4×–5.5×" (8.4) | acceptance digest τ: 6.62/6.23/5.88/5.84; means 4.12–5.51 → 4×–5.5× | TRACED + DERIVED-OK |
| 26 | draft-model era τ ≈ 3.5–4.5 (EAGLE-1); "two to four accepted tokens" (8.4) | acceptance digest: "EAGLE-1 acceptance length τ ≈ 3.5–4.5" | TRACED |
| 27 | "five to seven is the current EAGLE-family baseline" (8.4) | 5.84–6.62 rounds to five-to-seven | DERIVED-OK |
| 28 | Temp 0→1: 5.51→4.65 (τ 6.62→5.67); 4.44→3.45 (τ 6.23→4.92); 4.12→3.95; 4.16→3.52 (8.4) | acceptance digest: all eight values exact | TRACED |
| 29 | "roughly a 15–25% speedup loss on three of the four models — the 70B drops only ~4%" (8.4) | recompute: Vicuna 15.6%, Llama-3.1-8B 22.3%, distill 15.4% (three in 15–25%); 70B 4.1% | DERIVED-OK |
| 30 | n-gram acceptance ~1–2.5 tokens general chat, ~full draft length high-copy, "approximate; mid-2026 snapshot — no primary number" (8.4) | acceptance digest: identical claim + identical hedge | TRACED (hedged) |
| 31 | acceptance rises with draft-training data (NeurIPS 2025) (8.4) | acceptance digest: "benefits scale with draft training data" | TRACED |
| 32 | Cold-prefix: sign known, magnitude not measured (8.4) | acceptance digest: "no primary paper with a clean number… directionally known, not quantified" | TRACED (hedge) |
| 33 | 8.5 table: 1.25→1.04×, 1.43→1.19×, 1.94→1.61×, 2.77→2.31×, 3.36→2.80×, 4.10→3.41× (÷1.2) | recomputed: 1.0417/1.1876/1.6146/2.3109/2.8013/3.4126 — all correct | DERIVED-OK |
| 34 | Below α≈0.5 marginal; first-miss discards all later guesses (8.5) | mechanism + table math | DERIVED-OK |
| 35 | Grammar masks set forbidden logits to −∞; engines disable/degrade under guided decoding; TRT-LLM overlap workflow; "no published acceptance number" (8.5) | engines digest + constrained-decoding-grammars.md (chapter-13 base); hedge honest | TRACED (hedged) |
| 36 | TRT-LLM: "a technique for accelerating LLM inference at low batch sizes"; fixed max_draft_len, no per-request disable (8.5; 8.6) | engines digest: both verbatim | TRACED |
| 37 | vLLM grades EAGLE "high gain" low QPS, "medium to high" high QPS (8.5) | engines digest | TRACED |
| 38 | verify width multiplies FLOPs per request by up to γ+1 (8.5) | γ draft + 1 bonus position | DERIVED-OK |
| 39 | MagicDec: bandwidth-bound again ≥ ~4,000 tokens; 2.51× Llama-3.1-8B at batch 32–256; 8×H100; sparse-KV; arXiv:2408.11049 (8.5) | acceptance digest: all verbatim | TRACED |
| 40 | S* depends on compute-to-bandwidth ratio; H100 crosses earlier than A100/L40; GQA raises S* (8.5) | acceptance digest: "H100 has lower S* than A100/L40; GQA raises S*" | TRACED |
| 41 | ~90% acceptance self-speculation, 4,000–100,000-token contexts, batch 1, 70B (8.5) | acceptance digest: verbatim | TRACED |
| 42 | EAGLE-3 SGLang H100 1.38× at batch 64; EAGLE-1 negative at batch 24; vLLM peaks 24 vs 56 (8.5) | acceptance digest: exact | TRACED |
| 43 | "speculation does nothing for TTFT" (8.5) | mechanism; consistent with ch07 | TRACED (mechanism) |
| 44 | Field note: ITL halved on quote-heavy, evaporated under schema (8.6) | flagged single-deployment directional per convention | TRACED (convention) |
| 45 | vLLM caveat quote "do not usually yield inter-token latency reductions for all prompt datasets or sampling parameters"; gains below reference; issue #9565 (8.6) | both digests | TRACED |
| 46 | Lossless validated by greedy-equality tests (Where-the-picture-stops) | acceptance digest: "validated by greedy-equality tests" | TRACED |
| 47 | Checkpoint Q1: α=0.7, γ=4, 25% overhead (question) | computable: 2.77 tokens; 2.77/1.25 = 2.2× net; answers not asserted in prose | OK (question) |
| 48 | Break it/Prove it: temperature 0 vs 1, summarization set (lab instructions) | no factual assertion | OK (instruction) |

## Findings (non-OK verdicts)

- **[P2-1] ch07 §7.4 — citation bundling under Splitwise.** Current: "Splitwise supplied the phase-economics framing (arXiv:2401.09670, 2024; arXiv:2311.18677, 2023)." The parenthetical attaches DistServe's arXiv id (2401.09670) to the Splitwise clause; a reader scanning ids will mis-attribute DistServe's paper. Every number and name is correct and 2401.09670 is cited correctly elsewhere (§7.3, dated box) — this is citation hygiene, not a factual error. Suggested fix: move the id to the DistServe clause — "DistServe pioneered the argument and the co-optimization (OSDI 2024, arXiv:2401.09670); Splitwise supplied the phase-economics framing (arXiv:2311.18677, 2023)." One-line replacement, no ripples (grep: 2401.09670 appears 3× in ch07, correctly in the other two).
- **[P2-2] ch08 §8.3 — untraced draft-model size heuristic.** Current: "Train or pick a model a few percent of the target's size." The digests support only "a small drafter" (engines digest); no corpus source states a size fraction, and the original papers' draft/target ratios vary by an order of magnitude across setups. Low stakes (qualitative heuristic, no downstream arithmetic depends on it), but it is the only sentence in either chapter asserting a quantitative relation with no digest behind it. Suggested fix: "a small fraction of the target's size" (keeps the intuition, drops the implied single-digit-percent precision), or hedge as community practice.

No P0s. No P1s. Two P2s. All 48 dated-box figures, speedup tables, metric names, formulas, and cross-references verify against the 2026-08-27 digests; all 23 derived-arithmetic values recompute correctly (formulas, chart series, tables, percentages, queue multipliers, pool allocation).

## Summary

- ch07: 38 claims — 35 TRACED/OK/DERIVED-OK, 2 DERIVED-OK recomputed clean beyond verdict labels, 1 P2.
- ch08: 48 claims — 47 TRACED/OK/DERIVED-OK, 1 P2.
- **Total: 86 claims checked · 84 OK · 2 non-OK (both P2) · 0 P0 · 0 P1.**
