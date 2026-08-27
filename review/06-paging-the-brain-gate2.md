All checks complete. I traced 15 numeric claims (well over the 8 required), recomputed 6 derivations, and audited frame/mechanics. One write-capable tool is not available in this session, so per the runtime bridge I return the complete review artifact below for persistence at `review/06-paging-the-brain-gate2.md`.

````markdown
# Gate 2 (Technical editor) — 06-paging-the-brain

Chapter: manuscript/06-paging-the-brain.md · Audited against: STYLE.md, EDITORIAL_SYSTEM.md, GOAL.md, CHAPTER_MAP.md · Digests: research/paged-attention-block-tables.md, research/prefix-caching-radix-trees.md, research/prompt-caching-provider-semantics.md, research/kv-cache-bytes-formula.md, research/ttft-queueing-under-load.md (all dated 2026-08-27)

## Numbers audit — traced claims (15 of 15 located; 1 mismatch found)
1. 20.4%–38.2% useful KV (arXiv:2309.06180, 2023) → paged-attention-block-tables.md ✓
2. 49-concurrent cap, LLaMA-2-7b-chat @1280 seq, 1×A100 (arXiv:2407.05347, 2024) → ttft-queueing-under-load.md ✓ (also stated in ch5:139, continuity intact)
3. OPT-13B 800 KB/token → 1.6 GB @2,048 tokens (paper worked example; 2×5120×40×2 B = 819,200 B) → paged-attention-block-tables.md ✓, matches ch4:91
4. LLaMA-13B up to 1.7 GB/sequence (vLLM blog, 2023) → paged-attention-block-tables.md ✓
5. Copy-on-write beam-search savings 37.6–55.2% Alpaca / 44.3–66.3% ShareGPT → paged-attention-block-tables.md ✓
6. Paged kernel 20–26% slower than FasterTransformer → paged-attention-block-tables.md ✓
7. 2–4× throughput vs FasterTransformer/Orca; up to 22× request rate before failure → paged-attention-block-tables.md ✓
8. Block-size sweep 16–128 (ShareGPT) / 16–32 (Alpaca); DEFAULT_BLOCK_SIZE = 16 → paged-attention-block-tables.md ✓
9. vLLM V1 alpha 2025-01-27, "zero-overhead" prefix caching default-on → paged-attention-block-tables.md ✓
10. TTFT 480 ms → 110 ms, Nexus Labs via DEV, anecdote → prefix-caching-radix-trees.md ✓ (hedge present in chapter)
11. Anthropic 4 breakpoints; 1.25× (5-min) / 2× (1-hr) writes; 0.1× reads; min prefix 512–4,096 (1,024 Sonnet-class; 4,096 Opus 4.5/4.6 + Haiku 4.5); 5-min TTL from request start → prompt-caching-provider-semantics.md ✓
12. OpenAI cached-input discount → **mismatch, Finding 1 below**
13. SHA-256 default since v0.11; `cache_salt` → prefix-caching-radix-trees.md ✓
14. Llama 3.1 8B = 128 KiB/token (2×32×8×128×2 B) → kv-cache-bytes-formula.md ✓, matches ch4
15. SGLang arXiv:2312.07104 (NeurIPS 2024); LMSYS blog 2024-01-17 → prefix-caching-radix-trees.md sources ✓

## Findings

1. [P1] The pricing box's OpenAI bullet contradicts the book's own provider digest. Current text: "- **OpenAI:** caching automatic, best-effort, no code changes; cached input tokens billed at a **50% discount**. No hit guarantee — "best-effort" is doing load-bearing work in that sentence (OpenAI prompt-caching announcement, retrieved 2026-08-27)." Replacement: "- **OpenAI:** caching automatic, best-effort, no code changes. Pricing splits by generation: GPT-5.6-class models bill cache reads at **0.1×** input and charge **1.25× to write** entries; older models discount cached inputs model-dependently ("up to 90%"; **50%** was the launch-era rate). No hit guarantee — "best-effort" is doing load-bearing work in that sentence (OpenAI prompt-caching docs + launch announcement, retrieved 2026-08-27)." Also amend the Prove-it closer "reads at 0.1× or 50%-off inputs, writes at 1.25× where explicit" → "reads at 0.1× on current models (older: model-dependent discount), writes at 1.25× where charged". Why: research/prompt-caching-provider-semantics.md (retrieved 2026-08-27, the dedicated pricing digest) states GPT-5.6+ = 0.1× read / 1.25× write and older = "up to 90%", historically 50% at launch — the flat 50% is stale against the corpus and understates write charges a budget would miss.
2. [P2] Acronym TTL unexpanded at first use (hard STYLE rule; the chapter expands even GPU/API). Current text: "Writes cost **1.25×** base input price (5-minute TTL) or **2×** (1-hour); cache **reads cost 0.1×** — a 90% discount." Replacement: "Writes cost **1.25×** base input price (5-minute TTL — time to live) or **2×** (1-hour); cache **reads cost 0.1×** — a 90% discount." Why: first chapter use of TTL lands on the newest reader exactly where the clock matters.
3. [P2] Unexplained jargon "O(1)" in durable prose. Current text: "a doubly-linked free queue gives O(1) eviction, and freed blocks rejoin the queue in an order that keeps the highest-coverage blocks alive longest" Replacement: "a doubly-linked free queue gives constant-time eviction (O(1) — one queue pop however full the pool), and freed blocks rejoin the queue in an order that keeps the highest-coverage blocks alive longest" Why: EDITORIAL_SYSTEM fails an explanation that swaps one unexplained term in; the ELI5-ladder reader has no notation background yet.
4. [P2] RAM and HTTP unexpanded while the same chapter expands GPU, KV, API, LLM, HBM. Current texts: "while physically scattering its pages anywhere in RAM" and "The fix moved the ID into the HTTP headers where it belonged" Replacements: "while physically scattering its pages anywhere in RAM (random-access memory)" and "The fix moved the ID into the HTTP (hypertext transfer protocol) headers where it belonged" Why: one-line compliance with "acronyms expanded at first use" by the chapter's own standard.
5. [P2] Bundled citation wrongly implicates the 2023 paper for the mamba block-size constraint, which the digest attributes to vLLM docs only. Current text: "The paper's sweep found 16–128 tokens near-optimal on ShareGPT and 16–32 on Alpaca; vLLM ships 16, and requires multiples of 8 for mamba-style caches (arXiv:2309.06180; vLLM docs, 2026-08-27)." Replacement: "The paper's sweep found 16–128 tokens near-optimal on ShareGPT and 16–32 on Alpaca; vLLM ships 16, and requires multiples of 8 for mamba-style caches (sweep: arXiv:2309.06180; shipped default and mamba constraint: vLLM docs, 2026-08-27)." Why: the paper predates mamba support; per-source attribution keeps the claim ledger clean.

## Frame audit (pass)
ELI5 blocks present for all major concepts (6.2, 6.3, 6.4 ×2, 6.5); numbered H2s 6.1–6.6 with unnumbered mandatory sections per house convention (matches ch4/ch5); `Where the picture stops` present with six honest breaks; ### Build it / Break it / Prove it / See it in the wild all present; pricing in a dated "mid-2026 snapshot" box with ch14 deferral; no vendor marketing language ("zero-overhead" is quoted and attributed); acronyms expanded except Findings 2–4; scope matches the CHAPTER_MAP beat exactly — paging, block tables, fragmentation, prefix caching/radix trees, same-prompt pricing — with explicit handoffs to ch7 (prefill/decode), ch11 (compaction), ch14 (worksheet), ch17 (harness playbook); no stolen material. Continuity verified: ch4:223 forwards the 20–38% promise, ch4:91 carries the OPT-13B contrast, ch4:105 the 3-session/128k floor, ch5:139 the 49-request cap, bus/straggler/dial metaphors all sourced from ch5.

## Mechanics audit (pass)
Recomputed: 2,048 × 800 KiB = 1,600 MiB ≈ 1.6 GB ✓; 16 × 800 KiB = 12.5 MiB, 12.8/1,600 MB = 0.8% < 1% ✓; 75% untouched at 512/2,048 ✓; Checkpoint Q2 solvable (1.6 GB / ≈1.2 GB / 15×800 KiB ≈ 12 MB) ✓; 14-token worked example (3 full + 2 remainder; 8-of-10 skip) ✓; 1,000/16 = 62.5 → 62 full blocks ✓; 480→110 ms ≈ 4× ✓; 0.1× = 90% discount, 1.25× = 25% premium ✓; 5-min TTL minus 4-min stream ≈ 1 min ✓. Mermaid block parses (valid graph LR, quoted labels, no color-only meaning); hash-chain pseudo-code and both tables well-formed; Words-before-machinery table has exactly the claimed 14 rows (8 + 6, verified by count).

Counts: P0 = 0 · P1 = 1 · P2 = 4
Verdict: MINOR
````

---

**Chapter:** 06-paging-the-brain
**Counts:** P0 = 0 · P1 = 1 · P2 = 4
**Verdict:** MINOR
**Worst finding:** The dated OpenAI pricing bullet says a flat **50% discount**, contradicting the book's own 2026-08-27 provider digest (GPT-5.6-class: 0.1× reads + 1.25× writes; older models "up to 90%", 50% only at launch).