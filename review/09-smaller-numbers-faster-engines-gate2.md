All audits complete. No write-capable tool is available in this session, so the complete review artifact is returned inline below for persistence to `review/09-smaller-numbers-faster-engines-gate2.md` (same pattern as `review/ch01-gate2.md`).

**Chapter:** 09-smaller-numbers-faster-engines · **Counts:** P0 = 0 · P1 = 2 · P2 = 5 · **Verdict:** MINOR
**Worst finding (P1):** `manuscript/09:56` — FP8 formats mislabeled "(e4m3/e5m2 — 4-or-5-bit mantissa variants)": the 4/5 are *exponent* bits (mantissas are 3 and 2), a factual error in the durable spine.

````markdown
# Gate 2 — Technical editor review: Chapter 9 (Smaller numbers, faster engines)

Reviewer: Gate 2 (technical editor) subagent · Review date: 2026-08-27
Inputs: manuscript/09-smaller-numbers-faster-engines.md against STYLE.md,
EDITORIAL_SYSTEM.md, GOAL.md, CHAPTER_MAP.md, and research/ digests.
Read-only review; manuscript and research untouched.

## Checks performed (evidence)

1. **Number tracing — 23 claims traced to 4 dated digests; all match with
   dates. None untraceable.**
   - INT4 worked example s = 0.16/15 ≈ 0.0107, error s/2 ≈ 0.0053 →
     `research/quantization-menu.md` (researched 2026-08-27), verbatim.
   - Decode floors 16 GB ÷ 3.35 TB/s ≈ 4.8 ms → ~208; FP8 ~415; INT4 ~830;
     ×0.7 ≈ 580 → `research/decode-bandwidth-wall.md` (H100 SXM 3.35 TB/s,
     0.7 rule) + `research/kv-cache-bytes-formula.md` (8.03B × 2 B ≈ 16 GB);
     correctly hedged "theoretical, not measured."
   - SmoothQuant 1.56×/2× on OPT-175B-class (arXiv:2211.10438, 2023); GPTQ
     3–4 bits "negligible" (authors' claim, flagged as such), ~3.25× A100 /
     ~4.5× A6000 (arXiv:2210.17323, 2022); AWQ ~512 samples / ~1% salient /
     >3× vs FP16 HF incl. Llama-2-70B on Jetson Orin (arXiv:2306.00978;
     hanlab.mit.edu, retrieved 2026-08-27) → `quantization-menu.md`.
   - gpt-oss: 120B (117B total) fits one 80 GB H100/MI300X; 20B ~16 GB;
     MXFP4 applied during post-training (arXiv:2508.10925, 2025) →
     `quantization-menu.md`.
   - COLM 2025: W8A8 deltas −0.41/+0.88/+0.05/+0.36; SmoothQuant 1.5B
     −4.43 (AIME 21.67→17.50); W4A16 −0.82 to −3.27; AIME 70B AWQ
     59.17→52.50, GPTQ →47.50; variance −0.8..−1.8 vs −1.4..−3.3;
     survey "non-negligible" (arXiv:2404.14047, 2024); calibration AWQ
     0.5–0.6 vs GPTQ 2.3–4.9 ppl (ChatOET, 2026, hedged as community) →
     `research/quantization-quality-benchmarks.md`.
   - Databricks 500,000+-eval "effectively lossless" (arXiv:2411.02355) →
     `same-model-different-providers.md`.
   - KV: 128→64 KiB/token, 32k 4→2 GiB, 15→30 sessions →
     `kv-cache-bytes-formula.md` + manuscript ch4 line 105 (worked example
     confirmed verbatim).
   - vLLM 2026-04-22: +14.9% (450.3→517.5), −13% runtime, gpt-oss-20b +4.8%
     (831.6→871.8), 54% slope, ~7k break-even (was ~25k in v0.10.2),
     haystack 91→13→89%, MRCR 93–98% to 256k, Qwen3-30B lowest recovery 97%,
     Kimi-K2.5 scale=1.0 shifts, KV dtype menu (`fp8`, `*_per_token_head`,
     `nvfp4`, `turboquant_*`) → both quantization digests.
   - Baseten 8.5/33/31/24% (retrieved 2026-08-27) → `quantization-quality-benchmarks.md`.
   - Scout 53.5–446.7 tok/s (8.3×), SemiAnalysis 18%/18% (B200) 23% (B300),
     AIMultiple 2.7×/~−8 HumanEval, OpenRouter `quantizations` levels +
     price-ordered default, rankings-drift warning →
     `same-model-different-providers.md` / `quantization-quality-benchmarks.md`
     (all retrieved 2026-08-27).
   - Field-note numbers (40% drop, 200 golden tasks, "twice since") are
     operator observations permitted by STYLE.md — no research trace required.
2. **Derivations recomputed (6) — all correct.**
   a. 0.16/15 = 0.01067 → 0.0107; s/2 = 0.00533 → 0.0053; 3.3% of span
      ("about 3%" ✓).
   b. 16/3.35 = 4.78 ms → 209 tok/s (chapter: 4.8/208 ✓); halvings 2.39 ms/
      419 and 1.19 ms/838 (chapter: ≈415/≈830, within its own ≈ rounding);
      830×0.7 = 581 ≈ "near 580" ✓; 830/208 = 3.99 ≈ "roughly four times" ✓.
   c. xychart model: BF16 slope 0.248/16k = 0.0155/1k; FP8 slope
      0.134/16k = 0.008375/1k; ratio exactly 0.54 ✓; intersection
      0.05/0.007125 = 7.02k ✓ — both lines read 1.109 at x = 7 ✓; all 20
      plotted points match the two line equations to 3 decimals.
   d. KV: 32,768 × 131,072 B = 4 GiB exactly; halves to 2 GiB; 60 GiB ÷ 4
      = 15 → ÷ 2 = 30 sessions ✓.
   e. 450.3→517.5 = +14.93% ✓; 831.6→871.8 = +4.83% ✓.
   f. 446.7/53.5 = 8.35 → "8.3×" ✓.
3. **Frame.** ELI5 blocks on §§9.2–9.6 (5, jargon-free, kitchen/bakery/
   meeting/sandwich analogies with technical landings) — matches the house
   pattern (ch8 has none on its 8.1 vocabulary ramp or 8.6 harness section,
   verified). H2s numbered 9.1–9.7 with `Where the picture stops`,
   `Checkpoint`, and the closer H2 unnumbered — identical to ch8. `Words
   before machinery` table: 14 well-formed rows, only chapter-needed terms.
   `Where the picture stops`: 5 concrete breaks. All four closers present
   (`### Build it` / `### Break it` / `### Prove it` / `### See it in the
   wild`). One dated snapshot box ("Published speedup figures (dated
   snapshot, mid-2026)") with per-line dates. No vendor marketing language.
   Acronyms expanded at first use: API, FP8, KV, FLOP, RTN, GPU, TTFT, AIME,
   GSM8K, COLM, TPOT, BF16 (exceptions → findings 6, 7). Scope matches
   CHAPTER_MAP ch9 exactly (quant methods, KV quant, quality/throughput,
   variant list as quant menu); ch10 parallelism/MoE, ch11 long-context,
   ch16 routing, ch17 cache design, ch18 GGUF appear only as pointers in
   the levers table — nothing stolen.
4. **Mechanics.** Both mermaid blocks parse (xychart-beta: title/x-axis
   bracket list/y-axis range/two line statements, 10 values each, within
   y-range 0.95–1.30; graph TD: valid node/edge-label syntax, `<br/>` line
   breaks only). Both tables well-formed (consistent pipe counts, no
   unescaped pipes in cells).
5. **Cross-references verified in manuscript.** Ch3 line 103 ("single-stream
   levers are exactly two… chapter 9 / chapter 10") ✓; ch3 line 58 ("Batch-1
   decode AI ≈ 1 FLOP per byte") ✓; ch4 line 163 (FP8 KV promissory note,
   14.9%/54%/7k figures consistent with ch9's) ✓; ch4 line 105 (15→30
   sessions) ✓; "chapter 4's crossover" backed by ch4 line 159 and ch3
   lines 113–117 ✓.

## Findings

1. **[P1] FP8 format names mislabeled — manuscript/09-smaller-numbers-faster-engines.md:56 (§9.3).**
   Current text: "where the 8-bit format is a float (e4m3/e5m2 — 4-or-5-bit mantissa variants) instead of an integer"
   Replacement: "where the 8-bit format is a float (e4m3/e5m2 — 4-or-5-bit exponent, 3-or-2-bit mantissa variants) instead of an integer"
   Why: in E4M3/E5M2 the first digit counts exponent bits and the second mantissa bits, so the current wording credits exponent bits to the mantissa — a factual error in the durable spine (the digest's "keeps enough mantissa (E4M3)" confirms the reading).

2. **[P1] Volatile provider benchmark numbers in the durable-prose spine — manuscript/09:115 (§9.6).**
   Current text: "Llama 4 Scout served by different providers ranged from 53.5 to 446.7 tokens/s output — an 8.3× spread on identical weights (Artificial Analysis, retrieved 2026-08-27). … SemiAnalysis measured FP8 at 18% cheaper per token and 18% faster per chip than BF16 (B200; 23% on B300; retrieved 2026-08-27), and an independent single-H100 test of Qwen3-32B found FP8 "loses no measurable accuracy" while INT4 ran 2.7× faster than BF16 but dropped ~8 points on HumanEval code generation (AIMultiple, retrieved 2026-08-27)."
   Replacement: keep only the durable claims in prose ("identical weights span an ~8× output-speed spread across hosts; part of it is precision"), and move the figures into a dated box directly after the paragraph, same pattern as the §9.3 box — e.g. `> **Provider snapshot (retrieved 2026-08-27).** Llama 4 Scout output speed by host: 53.5–446.7 tokens/s — 8.3× (Artificial Analysis). Qwen3-32B, single H100: FP8 no measurable accuracy loss; INT4 2.7× faster than BF16, ~−8 HumanEval points (AIMultiple). Qwen 3.5 397B FP8 vs BF16: 18% cheaper / 18% faster per chip on B200, 23% on B300 (SemiAnalysis — see the 9.3 box).`
   Why: STYLE.md hard rule — benchmark results "live in dated boxes/sidebars, never in the durable-prose spine"; provider speed spreads are the most volatile class in the chapter (Artificial Analysis itself warns rankings drift, and §9.6 cites that warning), and the identical pattern was P1 in review/ch01-gate2.md finding 2.

3. **[P2] MRCR expanded with the wrong noun — manuscript/09:103 (§9.5).**
   Current text: "long-context MRCR (a multi-round coreference retrieval benchmark)"
   Replacement: "long-context MRCR (a multi-round co-reference resolution benchmark)"
   Why: MRCR's standard expansion (from the Gemini long-context reports where the benchmark originates) is multi-round co-reference *resolution*; neither digest expands it, so verify against the vLLM blog's source before print.

4. **[P2] GSM8K 0.00 datum attributed to the wrong regime — manuscript/09:76 (§9.4).**
   Current text: "MATH-500 and LiveCodeBench dropped ≤2 points, one GSM8K (grade-school math) case moved 0.00"
   Replacement: "MATH-500 and LiveCodeBench dropped ≤2 points, one GSM8K (grade-school math) case — a W4A4 run, weights and activations both quantized — moved 0.00"
   Why: the digest records the 0.00 GSM8K case as W4A4, not the W4A16 (weight-only) regime the paragraph is describing; as written it quietly overstates weight-only 4-bit's cleanliness.

5. **[P2] Chapter-4 "quotation" is not verbatim — manuscript/09:5 (intro).**
   Current text: "Chapter 4 left you a second promissory note — FP8 KV (key-value) caching "halves every row of the table exactly, with measured quality caveats that are workload-dependent — chapter 9 owns the full menu.""
   Replacement: drop the inner quotation marks and paraphrase ("Chapter 4 left you a second promissory note: FP8 KV caching halves every row of its table exactly, with workload-dependent quality caveats — and chapter 9 owns the full menu"), or quote chapter 4 verbatim ("halves every row of the 4.3 table exactly…").
   Why: ch4's actual text reads "halves every row of the **4.3** table exactly, with measured quality caveats that are workload-dependent," with "chapter 9 owns the full menu" sitting inside a later citation parenthetical — the current quote drops "the 4.3" and stitches two non-adjacent fragments.

6. **[P2] GGUF never expanded at first use — manuscript/09:66 (§9.3; also 80, 157, 194).**
   Current text: "The GGUF files chapter 18 will hand you"
   Replacement: "The GGUF (llama.cpp's model-file format) files chapter 18 will hand you"
   Why: STYLE.md requires acronyms expanded at first use; GGUF appears four times and its letters are never expanded anywhere in the chapter.

7. **[P2] "Hopper" used unglossed at its first occurrence in the book — manuscript/09:56 (again 103).**
   Current text: "today's default FP8 serving on Hopper-class hardware"
   Replacement: "today's default FP8 serving on Hopper-class hardware (NVIDIA's H100-generation GPUs)"
   Why: no chapter 1–8 text introduces the architecture codename (verified by search), so the complete-beginner rung of the reader ladder meets it here unexplained.

## Notes (not findings)

- "18% cheaper per token" matches the digest verbatim, but recomputed from
  the digest's quoted prices ($0.40 → $0.34 per 1M) it is 15% cheaper; 18%
  is the per-chip speed ratio (1429/1216). Same residual noted (not flagged)
  in review/ch01-gate2.md — reconcile only if the prices are quoted beside
  the percentage.
- Chapter writes "W8A8-FP8"; the Databricks paper's term is "W8A8-FP."
  Cosmetic; consider matching the source term.
- xychart's two lines are distinguished by legend/label rather than line
  style; fine for Gate 2, confirm grayscale contrast at the visual-proof gate.
- Word count ≈4,900–5,400 by inspection — inside but near the top of the
  3,000–5,500 concept-chapter band; exact figure at the lint gate (this
  reviewer may not execute commands).
- §9.4/§9.5 academic and vLLM-versioned figures carry inline dates
  (arXiv 2025; vLLM blog 2026-04-22) and are treated as durable-citable
  measurements, consistent with sibling chapters; only the §9.6 market
  numbers (finding 2) violate the box rule.

Counts: P0 = 0 · P1 = 2 · P2 = 5
Verdict: MINOR
````