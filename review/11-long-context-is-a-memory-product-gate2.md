All audits complete. I have no write-capable tool in this session, so per protocol I return the complete review artifact below for persistence at `review/11-long-context-is-a-memory-product-gate2.md`.

**Chapter:** 11-long-context-is-a-memory-product · **Counts:** P0 = 0 · P1 = 2 · P2 = 4 · **Verdict:** MINOR
**Worst finding (P1):** the mid-2026 snapshot box attributes context-tier pricing to current "Opus/Sonnet 5-tier" Claude models, directly contradicted by `research/token-pricing-anatomy.md` ("Claude 4.6+ ships the full 1M-token window at standard pricing — no long-context surcharge") and by ch4's correctly versioned table ("e.g. Sonnet 4.5 ≤200K").

````markdown
# Gate 2 — Technical editor review: Chapter 11 (Long context is a memory product)

Reviewer: Gate 2 (technical editor) subagent · Review date: 2026-08-27
Inputs: manuscript/11-long-context-is-a-memory-product.md against STYLE.md,
EDITORIAL_SYSTEM.md, GOAL.md, CHAPTER_MAP.md, and research/ digests.
Read-only review; manuscript and research untouched.

## Checks performed (evidence)

1. **Number tracing — 28 spot-checks across 7 dated digests; 26 trace exactly, 2
   findings below arise from a digest-vs-digest conflict.**
   - GPT-5 400,000 window / 128K output / 272,000 max input ("documented-in-practice
     gap; forum reports"); Gemini 3.1 Pro 1,048,576 input / 65,536 output;
     $2/$12 ≤200K vs $4/$18 above; Llama 4 Scout 10M claim; Qwen 1M with
     max input 997,952 ("~998K") → `research/context-window-claims.md` (retrieved
     2026-08-27), incl. its worked 300K → $1.20 / 199K → ≈$0.40 example.
   - Qwen3-8B 144 KiB KV/token → 18 GB at 128K (144 KiB = 147,456 B =
     2×36×8×128×2; digest table confirms "144 KiB … 18.0 GiB") →
     `research/kv-cache-bytes-formula.md:10,27` + `research/attention-cost-scaling.md:8,22`
     (Raschka attribution matches).
   - NVIDIA "prefill quadratic in ISL; decode linear in KVSL" quote and the
     ~2·W dense FLOPs per token figure → `research/attention-cost-scaling.md:7`,
     `research/context-parallelism-long-context.md` ("dense transformer FLOPs
     are ~2·W per token", MLSys 2025).
   - 1M-token prefill of Llama 3 405B: 128 H100s / 16 nodes / 77 s / 93%
     parallelization efficiency / 63% FLOPS utilization / 3.8 s at 128K;
     Ring Attention exact & N−1 hops; DeepSpeed-Ulysses head-scatter; USP
     `long-context-attention` library; Megatron "8K+ tokens" positioning and
     dynamic-CP; Mooncake global KV pool and 75% more in-SLO requests; iRoPE +
     mid-training (April 2025); Scout ~15.6% at 128K (hedged as blog-grade,
     as the digest instructs) → `research/context-parallelism-long-context.md`.
   - MagicDec 2.51× at batch 32–256 and ~90% acceptance over 4,000–100,000-token
     contexts → `research/spec-decode-acceptance-data.md:12-13` (attribution
     nit → finding 5).
   - RULER GPT-4 128K/32K, Yi-34B 200K/16K, LWM 1M/<4K, "about half of 17";
     13-task/threshold definition; Lost in the Middle position finding →
     `research/context-window-claims.md:5-7`.
   - Claude Code trigger `effectiveContextWindow − autocompactBufferTokens`,
     ~13K buffer (hedged unofficial), cache-warm summarization call; Anthropic
     Compaction API `compaction` block + auto-drop; LangGraph
     `SummarizationNode`; exact-prefix invalidation forcing full re-prefill at
     full price; "no provider publishes guidance pricing that re-prefill";
     write 1.25× / read 0.1× / 5-minute caches →
     `research/context-compaction-tradeoffs.md`, `research/prompt-caching-provider-semantics.md:7`,
     `research/token-pricing-anatomy.md:41-42`.
   - Lost-in-compaction 73% / 40% / 7% at 190K, 50%, 98%; 17% side-constraint
     survival; >90% extractor retention on Qwen3.5-9B; Zenodo DOI
     10.5281/zenodo.20273814; arXiv:2608.11242; TokenPilot 87% / arXiv:2606.17016
     and the "prefix mismatches and cache invalidation" quote; MemGPT
     `core_memory_replace` / `archival_memory_insert` (arXiv:2310.08560); Letta
     <80% core-memory rule → `research/context-compaction-tradeoffs.md`.
   - Cross-chapter numbers: "chapter 3 planted this thesis" (03:141 ✓), ch10's
     promise (10:150 ✓), ch4 RULER table (04:121 ✓), ch4 admission arithmetic ✓,
     ch5's 49-request example (05:139 ✓: "a maximum of 49 concurrent requests …
     Llama-2-7B-chat on one A100, arXiv:2407.05347"), ch3's c·N² + c·(N·M + M²/2)
     decomposition (03:127 ✓). Field-note 600–800K → ~180K ≈ one-quarter ✓.
2. **Mechanics — 6 derivations recomputed independently; all correct.**
   - 1M/128K = 8; 8² = 64 ✓. 144 KiB × 131,072 = 18,874,368 KiB = 18 GiB ≈ "18 GB" ✓.
   - Gemini cliff: 300,000/1M×$4 = $1.20; 199,000/1M×$2 = $0.398 ≈ $0.40;
     ratio 3.02× ✓. Checkpoint Q2: 250K → $1.00, 199K → $0.398, 2.51× cheaper,
     51K extra tokens ✓.
   - Compaction money: 150K×0.1 = 15K-equiv/turn; 30K full-price turn = 30K-equiv
     = 2× baseline; steady state 30K×0.1 = 3K-equiv = 5× cheaper ✓ (matches the
     digest's own worked example).
   - xychart #1: all ten points recomputed (0.10/0.20/0.30/0.398/0.804/1.00/1.20/
     1.60/2.00) ✓, y-range 0→2.1 covers max ✓. xychart #2: [73,40,7] vs
     [0,50,98], y-max 80 ≥ 73 ✓. Both blocks are valid `xychart-beta` syntax.
   - graph TD block: valid nodes/edges/labels; `<br/>` inside `[]` labels matches
     the convention already shipped in ch5/ch9/ch17 diagrams.
   - Tables well-formed: 13-row Words-before-machinery (3 cols), 7-row lever
     table (3 cols) ✓.
3. **Frame:** 5 ELI5 blocks (§§11.2–11.6), analogy-first; H2s numbered 11.1–11.6
   with frame H2s (`Where the picture stops`, `Checkpoint`, closers) unnumbered,
   identical to ch1–ch10 convention; title + Part II context quote ✓; all four
   closers present as `###` H3s ✓; `Where the picture stops` gives 5 concrete
   analogy breaks ✓; one dated snapshot box covers the volatile windows/tiers/
   pricing cluster, and every volatile number outside it carries an inline dated
   hedge ("mid-2026", "(Raschka, retrieved 2026-08-27)", "(MLSys 2025)",
   "(Zenodo, 2026)", "(community/blog-grade evidence, 2026 — hedged as
   directional)") — consistent with the post-remediation book convention.
   No vendor marketing language. Acronyms expanded at first use except YaRN
   (finding 6). Scope matches CHAPTER_MAP ch11 exactly (CP ✓ 11.3; cost curves
   ✓ 11.2; cache-aware context design ✓ 11.4/11.6; the compaction tradeoff ✓
   11.5); ch12/14/17 material is deferred by pointer, not stolen. Word count
   within the 3,000–5,500 concept target by inspection; exact figure via
   `tools/lint-manuscript.py` at the next gate.

## Findings

1. **[P1] Snapshot box attributes context-tier pricing to current-generation Claude models — manuscript/11-long-context-is-a-memory-product.md:47 (§11.2, dated box).**
   Current text: "Anthropic: 1M-token windows on Claude Opus/Sonnet 5-tier models, with pricing tiers scoped by context — e.g. Sonnet-class ≤200K standard vs. separate >200K rates (Anthropic pricing PDF, retrieved 2026-08-27)."
   Replacement: "Anthropic: 1M-token windows on Claude Opus/Sonnet 5-tier models at standard pricing — 4.6+ generations carry no long-context surcharge; older sheets tier by context (e.g. Sonnet 4.5: ≤200K standard vs. separate >200K rates; Anthropic pricing PDF, retrieved 2026-08-27)."
   Why: two same-date digests conflict and the chapter kept the wrong half — `research/token-pricing-anatomy.md` states "Claude 4.6+ ships the full 1M-token window at standard pricing — no long-context surcharge," and chapter 4's own table (04:114) versions the tier to Sonnet 4.5, so the unversioned compression prices a surcharge onto the models readers actually buy.

2. **[P1] "Two of the three … at 200K" market claim unsupported by the pricing digest — manuscript/11-long-context-is-a-memory-product.md:165 (Where the picture stops).**
   Current text: "Mid-2026, long-context price tiers sit at 200K tokens at two of the three major providers, and Gemini's tier reprices the whole prompt;"
   Replacement: "Mid-2026, two of the three major providers price a long-context tier — Google at 200K, OpenAI at ≥272K — while Anthropic's current generation ships 1M at standard price, and Gemini's tier reprices the whole prompt;"
   Why: per `research/token-pricing-anatomy.md`, OpenAI's long tier is "defined as ≥272K-token requests" (not 200K) and Anthropic 4.6+ has none, so at most one provider tiers at 200K — the durable takeaway survives, the count does not.

3. **[P2] Mislabels chapter 4's first droop point as "8K" — manuscript/11-long-context-is-a-memory-product.md:40 (§11.2).**
   Current text: "chapter 4's single-stream droop (208 → 165 → 101 tokens/s at 8K → 32K → 128K)"
   Replacement: "chapter 4's single-stream droop (208 → 165 → 101 tokens/s from short context → 32K → 128K)"
   Why: ch4 derives 208 tok/s at *short* context (16 GB weights-only payload); at 8K its own constants (128 KiB/token → +1 GiB) give ~197 tok/s, so the parenthetical misquotes the source series it cites.

4. **[P2] Undefined "N" collides with the prompt-length N from §11.2 — manuscript/11-long-context-is-a-memory-product.md:67 (§11.3).**
   Current text: "KV blocks circulate chip to chip via send/receive, overlapped with compute, until — after N−1 hops — every query has seen every key and value."
   Replacement: "KV blocks circulate chip to chip via send/receive, overlapped with compute, until — after d−1 hops, with d chips in the ring — every query has seen every key and value."
   Why: N is never defined as the device count here and was defined as prompt length two paragraphs earlier (§11.2's c·(N² + N·M + M²/2)); the digest's N means ring size.

5. **[P2] MagicDec acceptance figure compressed into the wrong setup — manuscript/11-long-context-is-a-memory-product.md:43 (§11.2).**
   Current text: "MagicDec reported up to 2.51× for Llama-3.1-8B at batch sizes 32–256 on long-sequence tasks, and ~90% token acceptance for self-speculation across 4,000–100,000-token contexts (arXiv:2408.11049, 2024)."
   Replacement: "MagicDec reported up to 2.51× for Llama-3.1-8B at batch sizes 32–256 on long-sequence tasks, and ~90% token acceptance for self-speculation on a 70B drafter at batch 1 across 4,000–100,000-token contexts (arXiv:2408.11049, 2024)."
   Why: `research/spec-decode-acceptance-data.md:13` attributes the ~90% to a LLaMA-3.1-70B self-draft at batch 1, not the 8B/batch-32–256 run the sentence implies.

6. **[P2] YaRN unexpanded at first (only) use — manuscript/11-long-context-is-a-memory-product.md:141 (§11.6, lever 8).**
   Current text: "vLLM serves >128K via RoPE (rotary position embedding)-scaling/YaRN context extension"
   Replacement: "vLLM serves >128K via RoPE (rotary position embedding)-scaling and YaRN (an interpolated RoPE-scaling method) for context extension"
   Why: STYLE.md hard rule "acronyms expanded at first use"; YaRN appears exactly once, unglossed.

**Counts: P0 = 0 · P1 = 2 · P2 = 4 · Verdict: MINOR**

Both P1s are one-sentence fixes to the same root cause (a digest-vs-digest
conflict on Anthropic long-context pricing that the chapter resolved without a
hedge); the P2s are label/attribution precision. Mechanics, tracing, frame, and
scope all pass; nothing structural blocks the chapter.
````