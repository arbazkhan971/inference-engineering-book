All audits complete (16 numeric claims traced, 3+ derivations recomputed, frame/mechanics verified against STYLE.md, EDITORIAL_SYSTEM.md, GOAL.md, CHAPTER_MAP.md). No write-capable tool is available in this session, so the complete `review/08-guessing-at-the-speed-of-light-gate2.md` artifact is returned below for persistence.

**Chapter:** 08 — Guessing at the speed of light
**Counts:** P0 = 0 · P1 = 3 · P2 = 5 · **Verdict: MINOR**
**Worst finding:** the mermaid loop diagram states "forward progress is τ + 1 tokens," which double-counts the guaranteed token and contradicts the chapter's own formula (E[progress] = 3.36 = τ), glossary, and the EAGLE-3 τ figures quoted in 8.4.

````markdown
# Gate 2 — Technical editor review: Chapter 8 (Guessing at the speed of light)

Reviewer: Gate 2 (technical editor) subagent · Review date: 2026-08-27
Inputs: manuscript/08-guessing-at-the-speed-of-light.md against STYLE.md,
EDITORIAL_SYSTEM.md, GOAL.md, CHAPTER_MAP.md, and research/ digests.
Read-only review; manuscript and research untouched.

## Checks performed (evidence)

1. **Number tracing — 16 numeric claims traced to dated digests (all
   `researched/retrieved 2026-08-27`); none untraceable except the two
   flagged as findings.**
   - E[progress] = (1 − α^(γ+1))/(1 − α), α=0.8, γ=4 → ≈3.36, the c-ratio
     framing, and `norm(max(0, p − q))` → research/speculative-decoding-engines.md
     (Leviathan §2). Recomputed: 3.3616 ✓.
   - Leviathan 2×–3× on T5-XXL (11B); Chen et al. 2–3× on Chinchilla 70B;
     EAGLE 2.7×–3.5× on LLaMA2-Chat 70B with ~2× throughput; EAGLE-2
     3.05×–4.26× and 20%–40% over EAGLE-1; EAGLE-3 4.1×–6.5× with means
     5.51/4.44/4.12/4.16 and τ 5.84–6.62 → speculative-decoding-engines.md
     and spec-decode-acceptance-data.md ✓.
   - Medusa-1 >2.2×; Medusa-2 2.2×–3.6× → engines digest ✓ (but the
     acceptance digest says 2.3×–3.6× — finding 7).
   - Temperature table (5.51→4.65 τ 6.62→5.67; 4.44→3.45 τ 6.23→4.92;
     4.12→3.95; 4.16→3.52) → spec-decode-acceptance-data.md, verbatim ✓.
   - MagicDec: 2.51× at batch 32–256 (8×H100, sparse-KV), ~4,000-token
     crossover, S* set by compute-to-bandwidth ratio and GQA (H100 crosses
     earlier than A100/L40; GQA raises S*), ~90% self-speculation acceptance
     over 4,000–100,000-token contexts at batch 1 on 70B → same digest ✓.
   - EAGLE-3 batch tables: SGLang 1.38× at batch 64, EAGLE-1 negative at
     batch 24, vLLM peaks 24/56 → same digest ✓.
   - n-gram acceptance 1–2.5 tokens on general chat — digest ✓ and the
     manuscript carries the digest's own hedge ("approximate; mid-2026
     snapshot — no primary number is published") ✓.
   - Prompt lookup 2×–4× on input-grounded tasks (apoorvumang README,
     retrieved 2026-08-27) → both digests ✓.
   - Roofline: batch-1 decode AI ≈ 1 FLOP/byte; H100 balance point ≈ 295 →
     research/arithmetic-intensity-roofline.md (989.5 TFLOPS ÷ 3.35 TB/s
     ≈ 295) and chapter 3's manuscript figures ✓.
   - Engine contracts: vLLM flag menu (EAGLE/MTP/draft-model/PARD/MLP +
     n-gram/suffix via `speculative_config`), SGLang EAGLE-3 recommendation,
     TensorRT-LLM "low batch sizes" quote, fixed `max_draft_len` with no
     per-request disable, vLLM QPS table grades, and the "do not usually
     yield inter-token latency reductions" caveat + issue #9565 →
     speculative-decoding-engines.md ✓.
   - TensorRT-LLM guided-decoding overlap workflow →
     research/constrained-decoding-grammars.md ("CPU grammar check overlapped
     with GPU draft/verify", retrieved 2026-08-27) ✓.
2. **Mechanics — recomputed derivations.**
   - Full convex-bet curve (8 points): (1−α⁵)/(1−α) at α = 0.2…0.9 gives
     1.2496, 1.4251, 1.6496, 1.9375, 2.3056, 2.7731, 3.3616, 4.0951 → the
     chapter's 1.25, 1.43, 1.65, 1.94, 2.31, 2.77, 3.36, 4.10 all correct
     to two decimals ✓ (xychart series matches the 8.5 table exactly).
   - Net-multiplier column (÷1.2): 1.0417→1.04, 1.1917→1.19, 1.6146→1.61,
     2.3109→2.31, 2.8013→2.80, 3.4176→3.41 ✓; 3.36/1.2 ≈ 2.8 ✓.
   - Temperature losses recomputed: 15.6%, 22.3%, 15.4% — but 70B is 4.1%,
     outside the chapter's "15–25%" (finding 3).
   - Mermaid: `graph TD` block parses (parentheses only inside the quoted
     F label; commas/colons in unquoted labels are legal); `xychart-beta`
     parses with 8 x-values vs 8 y-values; grayscale-safe ✓.
   - All four tables well-formed (3/4/3/3 columns, consistent pipe counts) ✓.
3. **Frame.** 5 jargon-free ELI5 blocks (8.2 Sudoku, 8.3 intern/photocopy,
   8.4 exchange rate, 8.5 form-with-boxes, 8.5 checker's desk);
   `Words before machinery` table (11 rows, every term used in-chapter);
   H2s numbered 8.1–8.6 with `Where the picture stops` / `Checkpoint` /
   closers unnumbered — identical to the convention in all 18 chapters; all
   four closers present; dated snapshot box ("Measured speedups — published
   figures, retrieved August 2026") around the volatile numbers; no vendor
   marketing language (vendor quotes are used against interest); true
   operator Field note in 8.6; ~5.3k words, inside the 3,000–5,500 target.
   Scope matches CHAPTER_MAP ch8 exactly (draft-and-verify ✓, Eagle/Medusa ✓,
   acceptance rates ✓, structured-output hurt ✓, cold-prefix hurt via 8.4
   "Prefix temperature" ✓); ch9/10/11/13/14 appear only as lever-table
   pointers with explicit handoffs ("Chapter 11 owns the long-context half").
   Cross-references verified: ch2's "the only mainstream escape from the
   serial tax" exists verbatim; ch1's tracer and ch5's p95 TPOT probe exist
   as described; ch3's 1 FLOP/byte and 295 ridge figures match.

## Findings

1. **[P1] Diagram arithmetic contradicts the chapter's own formula — manuscript/08-guessing-at-the-speed-of-light.md:55 (8.2 mermaid).**
   Current text: `H --> I[Loop: forward progress is τ + 1 tokens, not 1]`
   Replacement: `H --> I[Loop: forward progress is τ tokens, not 1]`
   Why: the chapter defines E[progress] = (1−α^(γ+1))/(1−α) = 3.36 as
   *including* "the guaranteed first token," and the glossary (line 23)
   defines τ as "Mean tokens of forward progress per verify pass" — so
   progress is τ, not τ+1; the node double-counts the bonus token and
   breaks the formula the chapter just taught.

2. **[P1] τ defined two contradictory ways — manuscript/08-guessing-at-the-speed-of-light.md:104 (8.4) vs :23 (8.1).**
   Current text: "the **acceptance length τ** — mean accepted tokens per verify step"
   Replacement: "the **acceptance length τ** — mean tokens of forward progress per verify step (accepted guesses plus the guaranteed token)"
   Why: the 8.1 glossary says "Mean tokens of forward progress per verify
   pass," and the EAGLE-3 figures quoted in the same sentence (τ 5.84–6.62 →
   speedups 4.1–5.5×) only work under that reading (digest: "speedup ≈ τ ÷
   (1 + draft overhead)"); "accepted" alone undercounts by the bonus token
   and makes the τ/speedup pairing on the page un-derivable.

3. **[P1] Derived range falsified by one of the four numbers in the same sentence — manuscript/08-guessing-at-the-speed-of-light.md:108 (8.4).**
   Current text: "roughly a **15–25% speedup loss** (derived from the paper's table)"
   Replacement: "roughly a **15–25% speedup loss on three of the four models — the 70B drops only ~4%** (derived from the paper's table)"
   Why: recomputing the sentence's own pairs gives 15.6%, 22.3%, 15.4%, and
   4.1% (4.12→3.95 on 70B); a book whose spine is "recompute the numbers"
   cannot print a range its own sentence contradicts. (The digest carries
   the same overreach; the manuscript should not.)

4. **[P2] Unsourced scenario number without hedge — manuscript/08-guessing-at-the-speed-of-light.md:9 (intro).**
   Current text: "A self-hosted endpoint streams a 70B model at 20 tokens per second"
   Replacement: "A self-hosted endpoint streams a 70B model at 20 tokens per second (illustrative — chapter 3's ceiling arithmetic for 70B lands near 24)"
   Why: no digest carries this figure and it carries no hedge, which brushes
   STYLE.md's "no invented benchmark numbers… hedge" rule; it is consistent
   with chapter 3's derived ~24 tok/s ceiling, so the hedge makes it a
   feature instead of a loose end.

5. **[P2] Untraced historical τ range — manuscript/08-guessing-at-the-speed-of-light.md:104 (8.4).**
   Current text: "Two to four accepted tokens per step was a good day for the 2023 methods"
   Replacement: "Two to four accepted tokens per step was a good day for the draft-model era (EAGLE-1's measured τ ran ≈ 3.5–4.5)"
   Why: the digests carry no τ for the 2023 speculative-sampling papers;
   the nearest dated figure is EAGLE-1's τ ≈ 3.5–4.5 (spec-decode-acceptance-data.md),
   so anchor the sentence to a traced number instead of an untraced era claim.

6. **[P2] Method-name typo — manuscript/08-guessing-at-the-speed-of-light.md:41 (8.2 step 3).**
   Current text: "the two simultaneous papers call it speculative decoding and speculative samples"
   Replacement: "the two simultaneous papers call it speculative decoding and speculative sampling"
   Why: Chen et al.'s (DeepMind) term is *speculative sampling*, not
   "speculative samples"; the engines digest uses the correct name.

7. **[P2] Medusa-2 lower bound disagrees between the two digests — manuscript/08-guessing-at-the-speed-of-light.md:81 and :94.**
   Current text: "Medusa-2 (joint training) reported 2.2×–3.6× across a range of models" (and table row ">2.2× / 2.2×–3.6×")
   Replacement: keep as-is only after reconciling the digests — check the
   arXiv:2401.10774 abstract and align speculative-decoding-engines.md
   ("2.2x–3.6x") with spec-decode-acceptance-data.md ("2.3x–3.6x"), then
   update manuscript and Appendix E together.
   Why: the manuscript traces cleanly to one dated digest, so this is not a
   tracing violation, but a reader who cross-checks research/ finds the two
   digests contradicting each other on the same figure.

8. **[P2] Acronyms unexpanded at first use — manuscript/08-guessing-at-the-speed-of-light.md:87 (8.3).**
   Current text: "vLLM selects among EAGLE, MTP, draft-model, PARD, and MLP drafters"
   Replacement: "vLLM selects among EAGLE, MTP (multi-token prediction), draft-model, PARD, and MLP (multi-layer perceptron) drafters"
   Why: STYLE.md hard rule; MTP and MLP appear as bare acronyms at first
   use (the prose names "multi-token-prediction heads" one clause earlier,
   but the acronym link is never made). PARD, like EAGLE, is a proper
   method name and can stand. All other acronyms in the chapter
   (GPU, API, JSON, RAG, FLOPs, QPS, TTFT, TPOT, KV, GQA, CLI) are
   correctly expanded.

## Notes (not findings)

- "EAGLE-1 goes negative at batch 24" is a fair rendering of the digest's
  "EAGLE-1 *reduces* throughput at batch 24."
- The manuscript's "fixes `max_draft_len` per deployment" correctly untangles
  the digest's garbled "per-request max_draft_len… no way to disable per
  request" phrasing.
- The unnumbered `## Where the picture stops` / `## Checkpoint` / closers
  match the all-chapters convention (verified across 18 files); not a
  numbering violation of STYLE.md's X.n rule.
- Word count ~5.3k (PROGRESS.md, iteration 12) is inside the concept-chapter
  3,000–5,500 band.

Counts: P0 = 0 · P1 = 3 · P2 = 5
Verdict: MINOR
````