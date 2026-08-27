All checks complete. I have no file-writing tool in this session, so per runtime policy I return the complete review artifact below for persistence to `review/04-the-memory-that-is-not-the-model-gate2.md`.

**Artifact for `/Users/arbaz/Projects/personal/inference-engineering-book/review/04-the-memory-that-is-not-the-model-gate2.md`:**

```markdown
# Gate 2 — Technical editor review: 04-the-memory-that-is-not-the-model

Reviewed against STYLE.md, EDITORIAL_SYSTEM.md, GOAL.md, CHAPTER_MAP.md, the full chapter,
and dated digests in research/. Manuscript and research files untouched; no git commands run.

## Numbers audit (18 claims traced; contract minimum 8)

Traced and matching (source digest, all dated):
1. Llama 3.1 8B 128 KiB/token (2×32×8×128×2 = 131,072 B) — research/kv-cache-bytes-formula.md, 2026-08-27
2. Llama 3.1 70B 320 KiB/token; "2.5× the 8B despite ~9× parameters" (320/128 = 2.5; 70/8 = 8.75) — same digest
3. Qwen3-8B 144 KiB/token; native max 40,960 positions footnote — same digest
4. gpt-oss-120b 72 KiB/token (36×8×64); alternating 128-token sliding-window upper-bound note — same digest
5. DeepSeek-V3 MLA ≈68.6 KiB/token (61 × 576 × 2 = 70,272 B); 0.54/2.1/8.6 GiB at 8k/32k/128k — same digest
6. Capacity example: 16 GB weights + 4 GiB workspace → 60 GiB → 15 sessions; FP8 → 30; 128k → 3; gpt-oss 61 GB MXFP4 → ~dozen — same digest
7. OPT-13B 800 KB/token (2×5120×40×2), 1.6 GB @ 2,048 tokens — research/paged-attention-block-tables.md (arXiv:2309.06180, 2023)
8. GPT-5 400,000 window / 128,000 output / 272,000 max input — research/context-window-claims.md, 2026-08-27
9. Claude 1M; Sonnet 4.5 ≤200K $3/$15 per MTok; Gemini 3.1 Pro 1,048,576/65,536, $2→$4 and $12→$18 above 200K; Llama 4 Scout 10M claim; Qwen 1M / 997,952 / 65,536 — same digest
10. RULER: GPT-4 128K→32K, Command-R 35B 128K→64K, Yi-34B 200K→16K, LWM 1M→<4K; ~half of 17 models ≥32K held at 32K — same digest (arXiv:2404.06654, 2024)
11. H100 3.35 TB/s; 4.8 ms → ≈208 tok/s; 20.3 GB → 6.1 ms → ≈165; ~33 GB → 9.9 ms → ≈101 — research/decode-bandwidth-wall.md + chapter 3; recomputed (3350/16 = 209, 3350/20.3 = 165.0, 3350/33.2 = 100.9)
12. Llama-2-70B MHA 2.6 MB/token (2×80×64×128×2 = 2,621,440 B), ~21 GB @ 8k — research/attention-variants-kv.md
13. MLA 576 = 512+64; 32,768 vs 576 ≈ 57×; ~60× bytes; Gemma 3 5:1, W = 1024; gpt-oss half-layer windows — same digest + kv-cache digest
14. FP8 KV +14.9% output tok/s at concurrency 8; 54% of BF16 decode cost beyond ~7k break-even; NIAH 91%→13%→89% — research/quantization-quality-benchmarks.md (vLLM blog, 2026-04-22)
15. vLLM RECOMPUTE preemption, `vllm:preemption_requests` counter, SGLang "retract" — research/preemption-recompute-swap.md, 2026-08-27
16. Opening 33 GB / ~17 GB — derived from traced constants (16 GB weights + 16 GiB = 17.2 GB KV = 33.2 GB)
17. GQA family adoption list (Llama, Mistral, Qwen, Gemma, Phi) — attention-variants digest adoption snapshot, 2026-08-27
18. B ≈ 7 crossover — chapter 3's derivation (70 GB FP8 ÷ 10 GiB), but chapter 4 drops the FP8 qualifier (Finding 5)

Untraceable or contradicted: Findings 2, 3, 7 below.

## Findings

1. [P1] `manuscript/04-the-memory-that-is-not-the-model.md:9` — fabricated quotation attributed to chapter 3.
   Current: `the single-stream ceiling treated per-token traffic as weights alone, with a parenthetical "plus KV bytes at context."`
   Replacement: `the floor arithmetic divided bandwidth by weight bytes alone, and the summary formula carried only an undifferentiated "(weight bytes + KV bytes)" term.`
   Why: the quoted phrase appears nowhere in the manuscript (grep across `manuscript/`); chapter 3's actual text is "active KV bytes at your p95 context (chapter 4 refines the KV term)" — quoting words the sibling chapter never wrote is a misquote in durable prose.

2. [P1] `:184` and `:223` — the 20–38% figure is inverted: it is the *useful* fraction; waste is 62–80%.
   Current (a): `(chapter 6's 20–38% waste finding)`
   Replacement (a): `(chapter 6's finding that only 20–38% of allocated KV memory held useful state)`
   Current (b): `find the 20–38% waste number chapter 6 will turn into a whole chapter`
   Replacement (b): `find the 20–38% utilization measurement (62–80% waste) chapter 6 will turn into a whole chapter`
   Why: research/paged-attention-block-tables.md states "only 20.4%–38.2% of allocated KV cache memory actually stores useful token states", and chapter 6's own body says the same ("only 20.4% to 38.2% ... actually stored token states"; "the rest — sixty to eighty percent ... was waste") — chapter 4's label contradicts both by ~3×.

3. [P1] `:91` — false size claim in the OPT-13B aside.
   Current: `six times today's Llama 8B figure, on a model half the size —`
   Replacement: `six times today's Llama 8B figure, on a model only 60% larger —`
   Why: OPT-13B (13B params) is larger than Llama 3.1 8B (8B), not half its size; the false aside discredits an otherwise correctly traced number.

4. [P2] `:91` — article error.
   Current: `why the change was a memory decision, not a intelligence decision.`
   Replacement: `why the change was a memory decision, not an intelligence decision.`
   Why: grammar ("a" before vowel sound).

5. [P2] `:159` — B ≈ 7 loses chapter 3's FP8-weights condition.
   Current: `past B × KV ≈ weights, batching stops paying (Llama 70B at 32k hit that at B ≈ 7).`
   Replacement: `past B × KV ≈ weights, batching stops paying (Llama 70B at 32k hit that at B ≈ 7 — chapter 3's arithmetic, at ~70 GB FP8 weights; BF16's 140 GB puts it near 13).`
   Why: chapter 3 derives 7 from 70 GB ÷ 10 GiB; against this chapter's own 10 GiB table row, a BF16 reader computes ~13 — the unqualified number is off by 2× for the chapter's default precision.

6. [P2] `:190` — "FlashAttention-3" adds a version the dated digest does not attest.
   Current: `one FlashAttention-3 accumulation bug briefly dropped 128k needle-in-a-haystack accuracy from 91% to 13%`
   Replacement: `one FlashAttention accumulation bug briefly dropped 128k needle-in-a-haystack accuracy from 91% to 13%`
   Why: research/quantization-quality-benchmarks.md (vLLM blog, 2026-04-22) says "pre-fix Flash Attention accumulation" with no version; either drop "-3" or verify it against the blog before keeping it.

7. [P2] `:137` — "hypothetical ~40+ GiB" traces to nothing and contradicts the adjacent ~57× figure.
   Current: `a 128K session costs 8.6 GiB instead of a hypothetical ~40+ GiB.`
   Replacement: `a 128K session costs 8.6 GiB instead of the ~32 GiB a GQA-8 redesign would charge, or the ~490 GiB full multi-head caching would.`
   Why: 8.6 GiB × ~57 ≈ 490 GiB (the digest's own counterfactual: 2×61×128×128×2 ≈ 4 MB/token), and a GQA-8 rewrite (2×61×8×128×2 = 244 KiB/token) gives 32 GiB; "40+" matches neither.

8. [P2] `:121` and `:202` — RULER's evaluated snapshot is gpt-4-1106-preview.
   Current: `GPT-4 (gpt-4-1106) claimed 128K, effective 32K;` / `GPT-4 (gpt-4-1106) claimed 128K context; RULER measured effective ~32K.`
   Replacement: `GPT-4 (gpt-4-1106-preview)` in both.
   Why: research/context-window-claims.md cites RULER's model as gpt-4-1106-preview; exact model ids are what let readers reproduce the benchmark.

9. [P2] Whole file — chapter likely exceeds STYLE.md's 5,500-word concept-chapter ceiling.
   Current: n/a (length property; my estimate ≈ 5,700–6,300 words).
   Replacement: run `wc -w manuscript/04-the-memory-that-is-not-the-model.md`; if over 5,500, trim — best candidates are the duplicated "memory decision, not an intelligence decision" clause (:91 vs :128 region) and the 4.7 lever row deferring disaggregation to chapter 7.
   Why: STYLE.md caps concept chapters at 5,500 words; no shell available to this reviewer, so the count must be confirmed before Gate 3.

## Frame audit — pass

- ELI5 blocks open every major concept section (4.2 stenographer, 4.3 hotel blueprint, 4.4 restaurant seats, 4.5 rack sharing, 4.6 airline bumping); no jargon inside the blocks.
- Numbered H2s 4.1–4.7; unnumbered frame H2s (Where the picture stops / Checkpoint / closers) match chapter 3's established house pattern.
- `Where the picture stops` present with five concrete, checkable limits.
- `### Build it / Break it / Prove it / See it in the wild` closers present.
- Dated snapshot discipline: 4.3 config table headed "(config.json read 2026-08-27)" with per-row footer; 4.4 "Mid-2026 snapshot" market box; volatile inline numbers carry dates (vLLM 2026-04-22, Gemma 2025, DeepSeek 2024, Meta 2024, OpenAI 2025).
- No vendor marketing language found; skeptical framing of the Scout 10M claim is exactly right.
- Acronyms expanded at first use: BF16, GPU, HBM, GQA, MQA, MLA, MHA, TPOT, MTok, FP16/FP8/INT8, RULER, Prometheus, RECOMPUTE (explained), MXFP4 (idea explained); "API" unexpanded, consistent with book-level convention fixed in chapter 1.
- Scope matches the CHAPTER_MAP beat (KV cache: what it stores, the memory formula, per-model numbers; windows as memory products). No stolen material: quantization menu → ch9, compaction/position → ch11, paging/radix → ch6, prompt caching → ch14/17, disaggregation → ch7, sharding → ch10, batching → ch5/ch3 — all deferred by pointer.

## Mechanics audit — pass

- Recomputed derivations (12, minimum 3): formula product; 128 KiB × 32,768 = 4 GiB; 60/4 = 15, 60/2 = 30, 60/16 = 3.75 → 3 sessions; 16 + 4.295 = 20.3 GB → 165 tok/s, 16 + 17.2 = 33.2 → 101 tok/s; MLA 70,272 B = 68.6 KiB and 32,768/576 = 56.9 ≈ 57×; MHA 2.6 MB → 21 GB @ 8k; OPT-13B 800 KB → 1.6 GB; checkpoint Q2 (160 KiB/token, 10 GiB); Qwen/gpt-oss row GiBs; "a fifth"/"half" slowdown ratios (208→165 = −21%, 208→101 = −51%). All correct.
- Mermaid `xychart-beta` block: valid syntax (quoted title/labels, categorical x-axis, `0 --> 40` range, two named lines); plotted points match arithmetic (64k → 8 and 20 GiB); meaning is not color-only.
- Tables well-formed: 4.3 per-model (6 cols × 5 rows, footnote asterisk explained), 4.4 snapshot (3 × 5), 4.5 ladder (4 × 5), 4.7 levers (3 × 6); no ragged rows.

Counts: P0 = 0 · P1 = 3 · P2 = 6
Verdict: MAJOR
```

---

## Review summary

- **Chapter:** 04-the-memory-that-is-not-the-model
- **Counts:** P0 = 0 · P1 = 3 · P2 = 6
- **Verdict:** MAJOR (three localized factual corrections needed; no structural rework — one writer fix-pass before Gate 3)
- **Worst finding:** `:184`/`:223` — "20–38% waste" inverts the vLLM measurement (20–38% is the *useful* fraction; waste is 62–80%), contradicting both the dated digest `research/paged-attention-block-tables.md` and chapter 6's own body text; the other two P1s are a quotation attributed to chapter 3 that exists nowhere in chapter 3 (`:9`) and the false "model half the size" claim about OPT-13B vs the 8B (`:91`).