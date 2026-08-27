All checks are complete. Both mermaid blocks parse (rendered SVGs exist: `-m1.svg` is the xychart, `-m2.svg` is the graph-LR with all five labeled edges), and OSDI is unexpanded book-wide as a venue-citation convention, so it is not a ch07-specific acronym miss. No write-capable tool is available in this session, so the complete `review/07-prefill-decode-great-divorce-gate2.md` artifact is returned below for persistence.

## Review — Gate 2 (technical editor), Chapter 07

````markdown
# Gate 2 — Technical editor review: Chapter 7 (Prefill, decode, and the great divorce)

Reviewer: Gate 2 (technical editor) subagent · Review date: 2026-08-27
Inputs: manuscript/07-prefill-decode-great-divorce.md against STYLE.md,
EDITORIAL_SYSTEM.md, GOAL.md, CHAPTER_MAP.md, and research/ digests.
Read-only review; manuscript and research untouched. No git commands run.

## Checks performed (evidence)

1. **Number tracing — 15 claims across 6 dated digests (all `researched/fetched
   2026-08-27`); 14 trace exactly, 1 mismatch (Finding 4).**
   - Sarathi-Serve per-model series 2.6× Mistral-7B (1×A100) / 3.7× Yi-34B
     (2×A100) / 5.6× Falcon-180B end-to-end with PP, all under tail-latency
     constraints → `research/goodput-and-slos.md` (arXiv:2403.02310, 2024).
   - Sarathi-Serve 2–4× strict / "up to about 6×" relaxed vs vLLM and Orca on
     ShareGPT-style traces → `research/chunked-prefill-pd-split.md`.
   - vLLM V1 chunked-prefill default "whenever possible"; ~2,048 budgets
     improve ITL, >8,192 improves TTFT/throughput for small models on large
     GPUs → `research/batching-size-latency-tradeoffs.md` (vLLM docs,
     fetched 2026-08-27); same pattern ch05:91 uses.
   - DistServe box: 1.6 / 5.6 / 10 / ≈10 total ≈ 3.3 req/s/GPU / 2.1× →
     `research/goodput-and-slos.md` (arXiv:2401.09670v3, 2024); ratios
     recompute (10/3 ≈ 3.3; 3.3/1.6 ≈ 2.06 ≈ 2.1×) — but the allocation's
     direction label is wrong (Finding 1).
   - DistServe headlines 7.4× / 12.6× / >90% → `goodput-and-slos.md` +
     `ttft-queueing-under-load.md`. Lab-summary 4.48× chatbot / 41× code →
     `chunked-prefill-pd-split.md` + `goodput-and-slos.md`.
   - Mooncake 525% long-context / 75% more in-SLO requests →
     `chunked-prefill-pd-split.md` (arXiv:2407.00079, fetched 2026-08-27).
   - Chat SLO calibration ~0.2 s and ~250 words/min → `goodput-and-slos.md`,
     `latency-vocabulary.md`, `decode-time-budget-arithmetic.md`.
   - 8B BF16 ≈ 16 GB weights read per batch-1 decode token →
     `research/inference-vs-training.md` (Meta, 2024) +
     `decode-time-budget-arithmetic.md` (Llama-3-8B ~16 GB).
   - Decode arithmetic intensity ≈ 1 op/byte at batch 1 →
     `research/arithmetic-intensity-roofline.md` (GEMV, 2 FLOP ÷ 2 bytes).
   - Prefill ≈ 2 × parameters × prompt-length ops (chapter marks it
     "derived; standard transformer accounting") → consistent with the
     digest's GEMM ~2·M·N·K accounting; the 512× ratio recomputes.
   - TTFT decomposition metrics (`vllm:request_queue_time_seconds`,
     `vllm:request_prefill_time_seconds`, arrival-based TTFT) →
     `ttft-queueing-under-load.md`. Preemption-restarts-prefill behavior ✓.
   - 49 concurrent requests at 1,280-token sequences → `ttft-queueing-under-load.md`
     and chapter 5 line 139 (identical figure, cross-chapter consistent).
   - `--goodput ttft:...,tpot:...` ms KEY:VALUE pairs → `goodput-and-slos.md`
     (vLLM docs, fetched 2026-08-27); the specific 2000/100 values are the
     reader's experiment parameters, correctly framed.
   - M/G/1 wait ∝ 1/(1−ρ) ✓ matches ch05:123–127 and the digest — but the
     chapter's "15% load increase" does not match the digest's 10% example
     (Finding 4).
   - vLLM CLI flag names, ShareGPT/OSDI attributions, Splitwise verbatim
     quote ("a compute-intensive prompt computation, and a memory-intensive
     token generation, each with distinct latency, throughput, memory, and
     power characteristics") — all character-for-character vs
     `goodput-and-slos.md`.
2. **Arithmetic recomputed (6 derivations, all pass):** 20,000 ÷ 2,048 =
   9.77 ≈ "about ten iterations" ✓; Checkpoint Q3 16,384 ÷ 2,048 = 8 exactly ✓;
   512× prefill/decode math ratio = 2·P·512 / 2·P·1 ✓; 8B × 2 bytes = 16 GB ✓;
   10 ÷ 3 GPUs = 3.3 and 3.3 ÷ 1.6 = 2.06 ≈ 2.1× ✓; xychart data: 7 points per
   line = 7 x-categories, spike 420 < y-max 500 ✓.
3. **Diagrams:** both mermaid blocks parse — rendered SVGs exist at
   `figures/svg-mermaid/07-prefill-decode-great-divorce-m1.svg` (xychart,
   title/axes/legend correct) and `-m2.svg` (graph LR, 5 labeled edges,
   cylinder tier node). Grayscale-safe: meaning never color-only (legend
   labels name both lines). Non-finding note for the visual-proof pass: the
   renderer's default near-white first series stroke (#ECECFF) is a book-wide
   theme concern, not ch07-specific.
4. **Tables:** §7.1 Words-before-machinery table 12 rows × 3 columns,
   well-formed; §7.6 lever table 8 rows × 3 columns, well-formed; ASCII
   iteration timeline clean.
5. **Frame:** 5 ELI5 blocks (§§7.2, 7.3, 7.4 ×2, 7.5), all jargon-free;
   `Where the picture stops` present with 5 concrete breaks; all four closers
   (`### Build it` / `### Break it` / `### Prove it` / `### See it in the
   wild`); H2s numbered 7.1–7.6 with frame H2s unnumbered per the ch1–ch12
   convention; file opens `# 7. …` + Part II context quote; Words-before-
   machinery present (ch7 opens vocabulary — appropriate). Acronyms expanded
   at first chapter use: LLM, KV, TTFT, TPOT, ITL, BF16, GB, GEMM, SLO, GPU,
   RDMA, CPU, DRAM, SSD, RAG, p99, API, CLI, P/D. OSDI is unexpanded
   book-wide as a venue-citation convention (verified: no expansion anywhere
   in manuscript/) — not a ch07 miss. No vendor marketing language. The
   DistServe numbers sit in a dated snapshot box; the Sarathi-Serve numbers
   do not (Finding 2).
6. **Scope vs CHAPTER_MAP ch7** ("Two phases, two bottlenecks; chunked
   prefill; disaggregated inference; what 'PD separation' means for TTFT
   under load"): all four beats covered in order (§§7.2–7.5) plus the harness
   wrap §7.6. No stolen material: chapter 8 (speculative decoding) and
   chapter 14 (prefix caching) appear only as one-line pointers/transition
   seams. Word count ~4,958 per PROGRESS.md, inside 3,000–5,500.

## Findings

1. **[P1] Wrong allocation direction in the DistServe snapshot box — manuscript/07-prefill-decode-great-divorce.md (§7.4, dated box).**
   Current text: "Reassemble as a 2:1 decode-heavy allocation and the system serves ≈ 10 requests/s total ≈ 3.3 requests/s/GPU — **2.1× the colocated baseline** (derived from the paper's per-GPU figures) out of pure re-architecture, no new silicon."
   Replacement: "Reassemble as a 2:1 prefill-to-decode allocation — two prefill GPUs feeding one decode GPU — and the system serves ≈ 10 requests/s total ≈ 3.3 requests/s/GPU — **2.1× the colocated baseline** (derived from the paper's per-GPU figures) out of pure re-architecture, no new silicon."
   Why: the box's own per-GPU figures make the direction derivable — the prefill island is the *slower* one (≈5.6 < ≈10 req/s), so only 2 prefill + 1 decode reaches ≈10 req/s total; "decode-heavy" (2 decode : 1 prefill) caps at ≈5.6 req/s ≈ 1.9/GPU, contradicting the box, the digest, and Checkpoint Q5, which asks the reader to explain the impossible allocation.

2. **[P1] Sarathi-Serve benchmark results live in the durable-prose spine — manuscript/07-prefill-decode-great-divorce.md (§7.3).**
   Current text: "What does rationing buy? On ShareGPT-style traces on A100 GPUs (graphics processing units), Sarathi-Serve reported roughly 2–4× higher serving capacity under strict latency SLOs — up to about 6× under relaxed ones — versus prior systems including vLLM and Orca (arXiv:2403.02310, 2024; those are the authors' own comparisons, so treat the magnitudes as their workload's, not yours). Chapter 5's series is the same story at finer grain: 2.6× capacity versus vLLM for Mistral-7B on one A100, up to 3.7× for Yi-34B on two, up to 5.6× end-to-end on Falcon-180B with pipeline parallelism — all measured *under tail-latency constraints*, which is the point: the gains come precisely from protecting everyone's stream, not from raw throughput."
   Replacement: keep the first sentence up to "Sarathi-Serve reported" as the prose hook, then move the measured figures (2–4×/≈6× and the 2.6×/3.7×/5.6× series) into a dated box mirroring §7.4's: "> **Dated snapshot (Sarathi-Serve capacity vs prior systems — ShareGPT-style traces on A100s; arXiv:2403.02310, OSDI 2024).** …" with the "authors' own comparisons" hedge inside the box.
   Why: STYLE.md hard rule — "Pricing, rate limits, benchmark results live in dated boxes/sidebars, never in the durable-prose spine"; the chapter models the correct pattern one section later, and the ch01 gate-2 pass flagged the identical pattern as P1.

3. **[P2] Sentence points to a Words-table row that does not exist — manuscript/07-prefill-decode-great-divorce.md (§7.1, after the table).**
   Current text: "Goodput — completions per second that honor your SLO bounds, the metric chapter 5 defined — returns throughout; treat that table row as read."
   Replacement: "Goodput — completions per second that honor your SLO bounds, the metric chapter 5 defined — returns throughout; it needs no second entrance ramp."
   Why: the §7.1 table has 12 rows and no Goodput row, so "that table row" sends the reader hunting for something that is not there.

4. **[P2] "15% load increase" does not match the digest or chapter 5's own example — manuscript/07-prefill-decode-great-divorce.md (§7.5, item 3).**
   Current text: "Chapter 5's M/G/1 arithmetic — mean wait ∝ 1/(1−ρ), with ρ the utilization — means a 15% load increase near saturation can multiply queue wait several-fold, and the p99 (99th percentile) diverges faster than the mean."
   Replacement: "Chapter 5's M/G/1 arithmetic — mean wait ∝ 1/(1−ρ), with ρ the utilization — means moving from 0.8 to 0.95 utilization — under a fifth more load — can multiply queue wait about 4×, and the p99 (99th percentile) diverges faster than the mean."
   Why: the digest (`ttft-queueing-under-load.md`) and chapter 5 both state 0.8→0.95 → ~4× (an ≈18.75% load increase); the untraced 15% is a weaker, mismatched version of the book's own tabulated example.

5. **[P2] Box header under-describes its contents — manuscript/07-prefill-decode-great-divorce.md (§7.4, dated box title).**
   Current text: "> **Dated snapshot (DistServe evaluation — 13B model on one A100, 90% SLO attainment; arXiv:2401.09670, 2024).**"
   Replacement: "> **Dated snapshot (disaggregation results, 2024 — DistServe: 13B model on one A100, 90% SLO attainment, arXiv:2401.09670; Mooncake: arXiv:2407.00079).**"
   Why: the box also carries Mooncake's 525%/75% production figures and the reading-speed calibration, so the "DistServe evaluation" header invites misattribution of Mooncake's numbers to the DistServe experiment.

## Notes (not findings)

- All other volatile numbers are either boxed (DistServe), visibly dated
  inline with retrieval dates (vLLM doc facts), marked illustrative (~15 ms
  iterations, 20,000-token opener, xychart "illustrative, not measured"),
  marked derived (chunk-iteration count, prefill FLOPs), or author Field-note
  anecdote (~90k-token digest job), per STYLE.md.
- Residual for a later gate: run `tools/lint-manuscript.py` for the exact
  word count and heading lint (this reviewer may not execute commands), and
  re-render the two mermaid SVGs if Finding 1/2 edits touch nearby prose
  (they do not touch the diagrams).
- The reviewer has no write-capable tool in this session; this artifact is
  returned in full for persistence to
  `review/07-prefill-decode-great-divorce-gate2.md`.

**Verdict: MINOR** — two P1s are one-phrase/one-box mechanical fixes; all
numbers trace to 2026-08-27 digests except the mismatched 15% (Finding 4).
````

**Counts: P0 = 0 · P1 = 2 · P2 = 3**
**Verdict: MINOR**
**Worst finding:** the dated DistServe box says "2:1 **decode-heavy** allocation," but the box's own figures (prefill island 5.6 < decode island 10 req/s/GPU) prove only a 2-prefill : 1-decode split reaches ≈10 req/s ≈ 3.3/GPU — a one-phrase factual error that Checkpoint Q5 then teaches back.