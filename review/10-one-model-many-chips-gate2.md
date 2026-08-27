All audits are complete: 16 numeric claim groups traced to dated digests (all match), 5 derivations recomputed (all correct), frame/mechanics checks done, and cross-chapter seams verified against chapters 2, 3, 4, 7, 9, and 11. No write-capable tool is available in this session, so the complete review artifact is returned below for persistence to `review/10-one-model-many-chips-gate2.md`.

**Chapter:** 10 — One model, many chips
**Counts:** P0 = 0 · P1 = 1 · P2 = 3
**Verdict:** MINOR
**Worst finding:** 10.3 credits "chapter 2's promissory note" for a quote that lives in chapter 3's lever list (manuscript/03:103,177), contradicting the chapter's own intro — one-word fix.

````markdown
# Gate 2 — Technical editor review: Chapter 10 (One model, many chips)

Reviewer: Gate 2 (technical editor) subagent · Review date: 2026-08-27
Inputs: manuscript/10-one-model-many-chips.md against STYLE.md,
EDITORIAL_SYSTEM.md, GOAL.md, CHAPTER_MAP.md, and research/ digests.
Read-only review; manuscript and research untouched.

## Checks performed (evidence)

1. **Number tracing — 16 claim groups across 4 dated digests (all
   `researched/fetched 2026-08-27`); every number traces, none flagged.**
   - DeepSeek-V3 671B total / 37B active; 256 routed + 1 shared expert; 8
     activated; first three layers dense — `research/moe-routing-serving-detail.md`.
   - Mixtral 8x7B 46.7B / ~12.9B active, 8 experts, top-2; HF's ~45B / ~14B
     "compute" framing; Mistral's "matches or beats Llama 2 70B with ~6×
     faster inference" — `research/parallelism-sharding-moe.md` (the chapter
     correctly hedges the 6× as the vendor's own comparison).
   - gpt-oss-120b 117B / 5.1B active, 128 experts, top-4, MXFP4, one 80 GB
     GPU; gpt-oss-20b 21B / 3.6B active, 32 experts, 16 GB —
     `research/moe-routing-serving-detail.md` + `research/quantization-menu.md`.
   - H100 SXM 3.35 TB/s, 80 GB — `research/decode-bandwidth-wall.md`
     (identical to chapter 3's own figure at 03:101).
   - Megatron MoE sizing (TP 1–2 "only the active shard matters", EP primary,
     PP=8–16, expert TP rarely used); capacity per shard = total ÷ (t·p·e);
     TP's two collectives per layer; TP-stays-in-node rule —
     `research/parallelism-sharding-moe.md`.
   - MLSys 2025 CP receipts (Llama 3 405B, 1M tokens, 128 H100s, 77 s, 93%
     parallelization efficiency, 128K in 3.8 s); Megatron CP for 8K+ tokens;
     Ring Attention exact (arXiv:2310.01889, 2023) —
     `research/context-parallelism-long-context.md`.
   - DeepSeek deployment: prefill 4-node / 32-GPU EP with ~40 experts per GPU
     (32 redundant); decode 40 nodes / 160 GPUs; 20 SMs (10 comm + 10
     compute); node-limited routing M = 4; ~3.2 experts per node → ~13-expert
     ceiling correctly labeled "the authors' derived ceiling, not a shipped
     config" — `research/moe-routing-serving-detail.md`.
   - Aux-loss-free balancing: bias on routing scores only; γ = 0.001 for
     14.3T tokens then 0.0 for 500B; sequence-wise loss α = 0.0001; Switch
     capacity factors 1.0–1.25; capacity formula — `research/moe-routing-serving-detail.md`.
   - Derived in-chapter numbers 74 GB, 5.5%, 4.4% appear verbatim as derived
     in the digest; nothing untraceable found.
2. **Arithmetic recomputed (5 derivations, all correct).**
   - 140 GB ÷ 3.35 TB/s = 41.8 ms ≈ 42 ms → 23.9 ≈ ~24 tok/s; TP=2: 70 GB ÷
     3.35 TB/s = 20.9 ms ≈ 21 ms → 47.9 ≈ ~48 tok/s (10.2). Consistent with
     chapter 3's own "3.35 ÷ 70 ≈ 48" check at 03:101.
   - 37B × 2 B = 74 GB; 74/140 = 52.9% ≈ "half"; 671/70 = 9.6 ≈ "~10×";
     671 × 2 B = 1,342 GB > 1 TB (10.4).
   - 37/671 = 5.51%; 5.1/117 = 4.36% ≈ 4.4% (10.4).
   - Checkpoint Q4: (4,096 ÷ 64) × 8 × 1.25 = 640 slots vs demand
     4,096 × 8 ÷ 64 = 512 — well-posed, consistent with the stated formula.
   - 4 × 3.2 = 12.8 ≈ 13 (10.5).
3. **Frame:** ELI5 blocks on 10.2 (library), 10.3 (kitchen), 10.4 (hospital),
   10.5 (parcel network) + nested capacity ELI5; `Where the picture stops`
   present with 5 concrete breaks; all four closers (`### Build it` /
   `### Break it` / `### Prove it` / `### See it in the wild`); `Checkpoint`
   present (6 questions); H2s numbered 10.1–10.6 with frame H2s unnumbered —
   identical to the book-wide convention (verified in ch1, 6, 8, 11, 14–18);
   `Words before machinery` table with 14 term rows (lint floor ≥5); title +
   Part II context quote per STYLE.md; no vendor marketing language ("6×
     faster" appears only as an attributed, hedged vendor quote); two dated
     snapshot boxes (Megatron sizing guidance; "mid-2026 spec-sheet view");
     volatile marketplace reference hedged inline ("OpenRouter as of
     mid-2026"); acronyms expanded at first use (GPU, KV, BF16, MXFP4, FP8,
     GEMM, TTFT, TPOT, API, SLO, FLOPs, VRAM, NVLink).
4. **Mechanics:** mermaid block parses (nested subgraphs with quoted titles,
   all `end`s closed, node→subgraph edges and labeled edges are valid
   syntax) and is grayscale-safe; both tables well-formed (3-col vocab table,
   2-col lever table with correct chapter pointers 11/13/14/15/16/18).
5. **Scope vs CHAPTER_MAP ch10:** TP/PP/DP/EP/CP in plain words ✓; MoE
   serving and expert routing ✓; why bigger models can be faster per token ✓.
   Quantization composition correctly credited to ch9; cost curves deferred
   to ch11 — with one overlap exception (finding 2).

## Findings

1. **[P1] Wrong cross-chapter attribution: "chapter 2's promissory note" — manuscript/10-one-model-many-chips.md:54 (§10.3, TP paragraph).**
   Current text: "This is the axis that discharges chapter 2's promissory
   note — "tensor parallelism splits the weight stream across GPUs so the
   bandwidths add" — and the worked 2× floor in 10.2 is exactly that
   mechanism."
   Replacement: "This is the axis that discharges chapter 3's promissory
   note — "Splits the weight stream; bandwidths add" (3.6's lever table) —
   and the worked 2× floor in 10.2 is exactly that mechanism."
   Why: the promise demonstrably lives in chapter 3 (03:103 "splitting the
   weight stream across chips so bandwidths add — chapter 10"; 03:177 lever
   table), chapter 2 mentions tensor parallelism only as a bare lever-table
   cell (02:166), and this chapter's own intro (:7) already credits chapter
   3 — the sentence contradicts itself two sections later and sends readers
   to a chapter that never made the promise.

2. **[P2] Benchmark receipt duplicated with chapter 11 — manuscript/10-one-model-many-chips.md:60 (§10.3, CP paragraph).**
   Current text: "Megatron positions it for sequences of 8K+ tokens, and the
   scaling numbers are impressive: a 1M-token prefill of Llama 3 405B across
   128 H100s in 77 seconds at 93% parallelization efficiency, and 128K
   tokens in 3.8 seconds (arXiv:2411.01783, MLSys 2025)."
   Replacement: "Megatron positions it for sequences of 8K+ tokens; the
   published scaling receipts (a 1M-token Llama 3 405B prefill across 128
   H100s in 77 seconds) are chapter 11's headline, not repeated here."
   Why: chapter 11 (11:72) presents the identical 77 s / 93% / 3.8 s numbers
   as "The published headline" plus the same "Megatron positions CP for 8K+
   tokens" sentence, and this chapter's own hand-off two sentences later
   says "here you only need the axis's name and its communication shape" —
   per CHAPTER_MAP, context parallelism's cost story is chapter 11's beat.

3. **[P2] Quotation marks around spliced, non-verbatim sibling-chapter phrasings — manuscript/10-one-model-many-chips.md:130 and :60.**
   Current text (a): "chapter 7's "each phase gets its own hardware, replica
   count, and parallelism plan" made concrete"; (b) "That is chapter 4's
   promise — "real engines divide KV too" — made mechanical."
   Replacement (a): "chapter 7's "each phase gets its own plan" — hardware,
   replica count, and parallelism per pool — made concrete"; (b): "That is
   chapter 4's promise — "Real engines shard across GPUs (chapter 10 divides
   KV too)" — made mechanical."
   Why: chapter 7's verbatim text is "Each pool gets hardware, replica
   count, and a parallelism plan…" with its internal quote "each phase gets
   its own plan" (07:101), and chapter 4's verbatim text is "Real engines
   shard across GPUs (chapter 10 divides KV too)" (04:184); quoted strings
   that don't exist in the cited chapter fail the book's own cross-reference
   discipline.

4. **[P2] Bare acronym tags inside an ELI5 block — manuscript/10-one-model-many-chips.md:52 (§10.3 ELI5).**
   Current text: "Give every cook a vertical slice of every recipe book (TP).
   Line cooks up in a row, each doing one step and passing the plate (PP).
   Open identical branches in different neighborhoods (DP). … (CP) … (EP)."
   Replacement: drop the parenthetical tags from the block and append after
   it: "(Those five ways, in order: TP, PP, DP, CP, EP — the table in 10.1.)"
   Why: STYLE.md hard rule — "No jargon inside the ELI5 block" — and chapter
   10 is the only chapter in the manuscript putting acronym tags inside an
   ELI5 (checked ch11 and others: all pure plain language); the mapping
   belongs one line below the analogy, not inside it.

## Notes (not findings)

- The Mistral "~6× faster inference" vendor benchmark sits in prose rather
  than a dated box, but it is a 2024 launch claim with a dated fetch, an
  explicit "vendor's own comparison" hedge, and a mechanism derivation
  beside it — consistent with the book's treatment of dated historical
  citations (e.g., Pope 29 ms/token in ch1, not flagged at Gate 2).
- Word count is inside the 3,000–5,500 concept-chapter target by inspection;
  run `tools/lint-manuscript.py` at the next gate for the exact figure (this
  reviewer may not execute commands).
- The mermaid diagram is anatomy-only and its caption disclaims
  recommendation status; node→subgraph edges (`Req --> DP1`) are valid
  Mermaid flowchart syntax.

**Counts: P0 = 0 · P1 = 1 · P2 = 3**
**Verdict: MINOR**
````