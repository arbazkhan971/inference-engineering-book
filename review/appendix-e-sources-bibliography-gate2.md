## Gate 2 (Technical editor) review — `manuscript/appendix-e-sources-bibliography.md`

Scope: full read of Appendix E; STYLE.md / EDITORIAL_SYSTEM.md / GOAL.md; numbers audit against `research/` digests (all 63 arXiv IDs in the bibliography exhaustively grep-verified across the corpus); chapter-pointer cross-checks against ch01–ch18 and appendices B/C; style scan of the appendix file.

### Correct (verified, no action)
- Every arXiv ID cited in E.3 (63 distinct) appears in `research/` digests — no orphan citations.
- Numeric annotations traced to digests: PaLM 46.2%/6,144 TPU v4 (`inference-vs-training.md:7`); Pope 29 ms/token (:8); FlashAttention BERT-large 15% / GPT-2 3× (`attention-cost-scaling.md:6`, `gpu-memory-hierarchy.md:11`); 22 languages, 24.5% (`tokenizer-numbers-edge-cases.md:11,13`); 8 KV/64 query heads, 576-element MLA, Gemma 5:1@128K (`attention-variants-kv.md:8,11,13`); 20.4–38.2% (`paged-attention-block-tables.md:6`); Mooncake 525%/75% (`chunked-prefill-pd-split.md:12`); DistServe 1.6-vs-5.6/10 (`goodput-and-slos.md:11`); EAGLE τ 5.84–6.62 (`spec-decode-acceptance-data.md:8`); AWQ ~512 samples (`quantization-menu.md:17`); 500k+ evals (`same-model-different-providers.md:12`); gpt-oss 128-expert/top-4/MXFP4; 77 s/1M/128-H100; 100×/80× (`constrained-decoding-grammars.md:9`); 0.22 req/s + 38.5 s TTFT (`constrained-decoding-grammars.md:8`); 1.25+0.1·(N−1) (`subagent-context-isolation-cache.md:18`); K=1.1 (`client-rate-scheduling.md:7`); issues #2722, #42338/#71659, #9565, #10087, PR #10785, #27823; H100 $2.39–2.49/hr checked 2026-08-02+08-27 (`local-edge-inference.md:13,37`); Q4_K_M default; Scout 8.3×/R1 6.1×; batch 50%/24h and "most under an hour" (`batch-api-economics.md:2–4`); 1,024-token min, ≥30-min TTL, 20-block lookback (`prompt-caching-provider-semantics.md:5–11`); Amazon nodes 491300/271581011/211759007011 (`books-kdp-market-data.md:7–8`); DeepSeek off-peak halves + two-snapshot hit divergence (`token-pricing-anatomy.md:61`, `appendix-c:45`).
- E.1's derived-arithmetic exemplars (4.8 ms/token, 1,342 GB, $39.75) all exist in chapters and are marked derived (ch01:88, ch03:42, ch10:114, ch16:139, appendix-b:115).
- "71 digests" is consistent with the project ledger (PROGRESS.md: "72 files / 71 dated digests").
- Pointers verified correct for RULER (4, 11), Artificial Analysis (1, 2, 9, C), Tail at Scale (15, 16), Mooncake (7, 11), Orca (5), DistServe (5, 7), Claude Code issues (11, 17), subagent formula (17).
- Style: US spelling, no smart quotes/double spaces, no stray token-rate units ("req/s" is requests/s; "tokens/s" convention intact — the appendix uses none), "Fanout" unified, MFU/KVSL/PSC expanded at first use in chapters/Appendix A.

### Findings

1. **[P1] Part I header uses a title the book does not have.** `appendix-e-sources-bibliography.md:36`
   - Exact: `### Part I — The engine room from the street (chapters 1–4)`
   - Replacement: `### Part I — The layer beneath the prompt (chapters 1–4)`
   - Why: The book's Part I is titled "The layer beneath the prompt" everywhere reader-facing — `00b-front-matter.md:25` and the part banners of ch01–ch04 (`01:3`, `02:3`, `03:3`, `04:3`) — and CHAPTER_MAP.md agrees. Parts II–IV headers in this appendix match the map; only Part I is wrong. A navigation error in the book's own reference shelf.

2. **[P1] TokenPilot entry inverts the 87% finding and points to the wrong chapter.** `appendix-e-sources-bibliography.md:83`
   - Exact: `**TokenPilot** — arXiv:2606.17016 (2026). Agent-loop cost telemetry; cache-invalidation losses up to 87%. (ch 11, 14)`
   - Replacement: `**TokenPilot** — arXiv:2606.17016 (2026). Agent-loop cost telemetry; its cache-aware layout cuts continuous-task-stream inference cost by up to 87%. (ch 11, 17)`
   - Why: The 87% is a *cost reduction achieved* by TokenPilot's cache-aware method, not "losses": digest `context-compaction-tradeoffs.md:11` ("reduces inference cost up to 87% in continuous task streams") and ch11 ("cuts continuous-task-stream inference cost by up to 87% while preserving task performance"). As written, the annotation tells the reader the opposite of the source. Also ch14 contains zero TokenPilot mentions; the second load-bearing use is ch17:66.

3. **[P1] Lost in Compaction entry attaches another benchmark's numbers to this paper.** `appendix-e-sources-bibliography.md:84`
   - Exact: `**Lost in Compaction** — arXiv:2608.11242 (2026). Side-constraint survival under compaction (73%→40%→7%). (ch 11, 17)`
   - Replacement: `**Lost in Compaction** — arXiv:2608.11242 (2026). Side-constraint survival under compaction (only ~17% survive on average); the recall decay 73%→40%→7% is from the separate lost-in-compaction Zenodo benchmark (10.5281/zenodo.20273814). (ch 11, 17)`
   - Why: The 73/40/7 recall curve belongs to the Zenodo "lost-in-compaction" benchmark (github.com/profff/lost-in-compaction), not to arXiv:2608.11242, whose number is 17% average side-constraint survival (`context-compaction-tradeoffs.md`: two adjacent, distinct bullets). Ch11:102 and ch17:66 attribute them correctly and separately; the appendix conflates two sources — precisely the failure E.1 promises cannot happen.

4. **[P1] Capacity, Not Format entry misattributes the 11-model split, and the actual 11-model source is missing.** `appendix-e-sources-bibliography.md:94`
   - Exact: `**Capacity, Not Format** — arXiv:2606.09410 (2026). The 11-model base-vs-instruct tax split. (ch 13)`
   - Replacement: `**Capacity, Not Format** — arXiv:2606.09410 (2026). Format cost tracks model spare capacity (4 models, 5 benchmarks). (ch 13)` plus a new entry: `- **The Hidden Cost of Structure** — RANLP 2025. The 11-model base-vs-instruct tax split. (ch 13)`
   - Why: The 11-model base-benefits/instruct-loses finding is "The Hidden Cost of Structure" (RANLP 2025); Capacity, Not Format is the 4-model/5-benchmark spare-capacity study (`structured-output-costs-tension.md`, two distinct bullets; ch13:118 cites both correctly). As written, the annotation credits the wrong paper, and Hidden Cost of Structure — which underpins a load-bearing ch13 claim — is absent from the bibliography, violating E.1's stated curation rule ("every source that underpins a number … is included").

5. **[P2] Splitwise chapter pointer includes a chapter that never cites it.** `appendix-e-sources-bibliography.md:64`
   - Exact: `**Splitwise** — Patel et al., arXiv:2311.18677 (2023). The two-phase prompt/decode economics quote. (ch 3, 7)`
   - Replacement: `… economics quote. (ch 7)`
   - Why: grep of ch03 for `Splitwise|2311.18677|compute-intensive|memory-intensive` returns nothing; the only in-book citation is ch07:90.

6. **[P2] GShard/Switch is the only bibliography entry with no chapter pointer.** `appendix-e-sources-bibliography.md:76`
   - Exact: `**GShard / Switch Transformer** — arXiv:2006.16668 (2020); arXiv:2101.03961 (2021). Expert capacity factors and token dropping.`
   - Replacement: append ` (ch 10)` before the final period.
   - Why: E.3 states "Chapter pointers show where each source did load-bearing work"; the capacity-factor formula, the 1.0–1.25 factors, and the silent-drop failure mode are load-bearing in ch10 (`10-one-model-many-chips.md:124,126,130,169`). Every other entry carries a pointer.

7. **[P2] "batch-wait ratio" is not a vLLM knob.** `appendix-e-sources-bibliography.md:118`
   - Exact: `scheduler knobs (\`max_num_seqs\`, \`max_num_batched_tokens\`, batch-wait ratio)`
   - Replacement: `scheduler knobs (\`max_num_seqs\`, \`max_num_batched_tokens\`)`
   - Why: The digests attribute `batch_wait_max_tokens_ratio` to TensorRT-LLM (`continuous-batching.md:8,29`), not vLLM; no chapter uses the term. Listing it under "vLLM documentation and issues" misfiles a competitor engine's knob into the vLLM entry.

8. **[P2] "Attention-variant survey" mislabels the source.** `appendix-e-sources-bibliography.md:54`
   - Exact: `**Attention-variant survey** — arXiv:2502.07864 (2025) and MLA-on-accelerators hardware analysis, arXiv:2506.02523 (2025).`
   - Replacement: `**Attention-variant ladder (TransMLA, GQA→MLA migration)** — arXiv:2502.07864 (2025) and MLA-on-accelerators hardware analysis, arXiv:2506.02523 (2025).`
   - Why: The digest's own source list names arXiv:2502.07864 "TransMLA (GQA→MLA migration)" (`attention-variants-kv.md:40`), a method paper, not a survey; the ladder claim it supports (:25) survives the rename.

9. **[P2] Outlines entry implies the paper contains the compile-cost benchmarks.** `appendix-e-sources-bibliography.md:89`
   - Exact: `**Outlines: A Generator for Constrained Sampling** — Willard & Louf, arXiv:2307.09702 (2023). FSM-based masking; the compile-cost problem (0.22 req/s, 38.5 s TTFT). (ch 13)`
   - Replacement: `… FSM-based masking; the compile-cost problem (vLLM's Outlines backend: 0.22 req/s, 38.5 s mean TTFT, PR #10785). (ch 13)`
   - Why: Those figures are vLLM PR #10785's measurements of the Outlines *backend*, not results in Willard & Louf (`constrained-decoding-grammars.md:8`); the PR is already listed separately in the vLLM entry. The numbers trace; the attribution frame doesn't.

10. **[P2] Author name misspelled in the comparables shelf.** `appendix-e-sources-bibliography.md:125`
    - Exact: `Iusztin & Labagne, *LLM Engineer's Handbook* (Packt)`
    - Replacement: `Iusztin & Labonne, *LLM Engineer's Handbook* (Packt)`
    - Why: The digest and the real book credit "Iusztin & Labonne" (`books-kdp-market-data.md:15`); a bibliography should not misspell a named author.

11. **[P2] Two pointers understate where sources did load-bearing work (optional polish).** lines 39 and 46
    - Exact: `Training-scale MFU anchor: 46.2% on 6,144 TPU v4 chips. (ch 3)` and `**Lost in the Middle** — Liu et al., arXiv:2307.03172 (2023). Position, not presence, determines attention quality. (ch 11)`
    - Replacement: `(ch 1, 3)` and `(ch 1, 11)` respectively.
    - Why: PaLM's 46.2%/6,144-chip figure and the book's first MFU expansion are load-bearing in ch01:79, not only ch3; Lost in the Middle is cited by name in ch01:49 for the model-layer position-blindness claim.

Counts: P0 = 0 · P1 = 4 · P2 = 7

Verdict: MINOR

All four P1s are one-line fixes confined to Appendix E's annotations/labels; the underlying chapters and digests are correct, every bibliography arXiv ID and every spot-checked number traces to a dated digest, and no untraceable numeric claim was found. Residual risks: the "more than 570 distinct URLs / 65 distinct arXiv papers" corpus counts are attested in PROGRESS.md (iteration 25) but were not independently recomputed; the "each 600–1,200 words" digest length claim was spot-checked, not exhaustively measured; ~15 of ~75 chapter-pointer entries were spot-verified rather than all.