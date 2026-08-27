## Review

All four gate inputs read; chapter read in full; 24 numeric claims traced to dated digests (all matched, dates included — none untraceable); 8 derivations recomputed by hand (all correct); both mermaid blocks hand-validated for syntax; frame inventory complete. No write-capable tool is available in this session, so the complete review artifact for `review/02-the-shape-of-a-token-gate2.md` is returned below for the runtime to persist (no manuscript/research files touched; no git or shell commands run).

- **Correct:** Every checked number (vocab sizes, Claude ~30%, 4-chars/75-words, DeepSeek ~31×, digit chunking, 27-token CJK sample, 24.5% code-tax, strawberry 19-task study, 16 GB ÷ 3.35 TB/s ≈ 4.8 ms ≈ 208 t/s, Pope 29 ms, vLLM 25/50 ms bands, AA speed medians and the GLM-5.3 1.6/30.1/7.5 s split, MLPerf 450/40 and 6 s/175 ms, deadline math) matches its dated digest; all recomputed arithmetic is right; scope matches the CHAPTER_MAP beat with clean deferrals; "five of the nine hops" and the ch1-tracer cross-references check out against ch01.
- **Finding:** P1 — ch02:183 says TTFT hides "four hops" while ch02:98 correctly says "five of the nine hops" (routing is dropped in the Stops list).
- **Finding:** P1 — STYLE hard rule "pricing/benchmark results live in dated boxes" violated at ch02:46 (DeepSeek prices) and ch02:145 (MLPerf SLOs), despite the gate-1 record claiming MLPerf was boxed.
- **Finding:** P2 ×3 — peak/off-peak asymmetry on the DeepSeek miss price; book-first p99/SLO/NIM used unexpanded; provenance hedge owed on the AA speed snapshot (sibling digest says the leaderboard was unextractable the same day).
- **Merge verdict:** OK with notes (fix two P1s before release; nothing structural).

### Artifact for `review/02-the-shape-of-a-token-gate2.md`

```markdown
# Gate 2 — Technical editor review: chapter 02 "The shape of a token"

Reviewed against STYLE.md, EDITORIAL_SYSTEM.md, GOAL.md, CHAPTER_MAP.md and the
research/ corpus. Review-only pass: no manuscript or research files edited.

## Audit evidence

**Numbers audit — 24 claims traced, 0 untraceable.** (digest · date)

1. Vocab snapshot 50,257 / 100,256 / 199,998 / 128,256 / 151,936 / 129,280 / 256,000 / 151,552 / 131,072 / 201,088, "5× spread" — tokenizer-fundamentals.md:7 · 2026-08-27 ✓
2. Claude 4.7+ "approximately 30 percent more tokens"; vocab unpublished; count-tokens endpoint — tokenizer-fundamentals.md:9 · 2026-08-27 ✓
3. 1 token ≈ 4 chars; 100 tokens ≈ 75 words — tokenizer-fundamentals.md:8, tokenizer-numbers-edge-cases.md · 2026-08-27 ✓
4. RPM/ITPM/OTPM, token bucket, uncached-input ITPM — tokenizer-fundamentals.md:10 · 2026-08-27 ✓
5. DeepSeek $0.007 off-peak cache-hit vs $0.22 cache-miss, ~31× — tokenizer-fundamentals.md:11 · 2026-08-27 ✓ (see Finding 3)
6. Digits: `1234567`→3, `234567`→2, 12-digit→12 vs 4, 2–3× multiplier (approx.) — tokenizer-numbers-edge-cases.md · 2025 ✓
7. Comma boundary `1|,|234|,|567`, power-of-1000 alignment — tokenizer-numbers-edge-cases.md · 2025 ✓
8. Chinese 2–3 tokens/char; 我说你倒是快点啊!!! = 27 tokens (community, approx.) — tokenizer-numbers-edge-cases.md · 2023–2024 ✓
9. 22 languages, arXiv:2305.13707 — tokenizer-numbers-edge-cases.md · EMNLP 2023 ✓
10. Fertility: doubling → ~4× training cost, arXiv:2509.05486 — tokenizer-numbers-edge-cases.md · 2025 ✓
11. Code formatting −24.5% input tokens, 10 LLMs, Java/Python/C++/C#, pass@1 held, arXiv:2508.13666 — tokenizer-numbers-edge-cases.md · 2025 ✓
12. Strawberry: 19 synthetic tasks, low mutual information, arXiv:2505.14172 — tokenizer-numbers-edge-cases.md · EMNLP 2025 ✓
13. "K serial runs," arXiv:2211.17192 — tokenizer-fundamentals.md:15 · Nov 2022 ✓
14. 8B ≈ 16 GB BF16; H100 SXM 3.35 TB/s; ≈4.8 ms ≈ 208 t/s; NVIDIA inference-optimization blog 2023 — inference-vs-training.md (derived ¶ + sources), cross-checked decode-bandwidth-wall.md · fetched 2026-08-27 ✓
15. Pope et al. 29 ms/token, low batch, 500B-class, TPU v4, arXiv:2211.05102 — inference-vs-training.md · Nov 2022 ✓
16. TTFT/TPOT/e2e definitions; reasoning-first-token caveat; four vLLM metrics at p99; 25/50 ms ITL bands — latency-vocabulary.md · 2026-08-27 ✓
17. Identity e2e ≈ TTFT + (N−1)×mean ITL; worked 400 ms / 25 ms / 200 → 5.4 s — latency-vocabulary.md ✓
18. Speed medians 365/330/131/119/67/55/39 t/s + derived ITLs — latency-vocabulary.md:AA models page · 2026-08-27 ✓ (see Finding 5)
19. GLM-5.3 1.6/30.1/7.5 s; Gemini 3.5 Flash-Lite 8.8/1.4 s — latency-vocabulary.md · 2026-08-27 ✓
20. DistServe <0.2 s TTFT; 250 wpm, arXiv:2401.09670 — latency-vocabulary.md · 2024 ✓
21. MLPerf v5.0 450 ms/40 ms (25 t/s) from 2 s/200 ms; 405B 6 s/175 ms ≈ 5.7 t/s — decode-time-budget-arithmetic.md · 2025-04 ✓
22. Reading ≈250 wpm ≈ 5–8 t/s; speech 3–5 t/s; UX bands 5–8/20–30/50+ (approx.); GMI ~10 t/s — decode-time-budget-arithmetic.md · 2026-08-27 ✓
23. Deadline math 20 tok/15 words and 76 tok/57 words; max_tokens = floor((deadline − p95 TTFT)/p95 TPOT); 5×500×40 ms = 100 s — decode-time-budget-arithmetic.md ✓
24. "Five of the nine hops"; ownership test; ch1 tracer — manuscript/01-what-inference-engineering-is.md (9-hop lifecycle serialize→connect→admit→route→queue→prefill→decode→stream→settle) ✓

**Mechanics audit — recomputed.** 199×0.025+0.4 = 5.375 ≈ 5.4 s ✓; 16 GB ÷ 3.35 TB/s = 4.78 ms ≈ 4.8 ms → 1000/4.8 ≈ 208 t/s ✓; (3−0.5)×8 = 20 tok ≈ 15 words; 9.5×8 = 76 ≈ 57 words ✓; 5×500×0.04 = 100 s ✓; 1000/175 ≈ 5.7 t/s ✓; $0.22/$0.007 = 31.4 ≈ 31× ✓; 1000/{20,40,80} = {50,25,12.5} t/s ✓; all 18 xychart points = 0.4 + N×TPOT ✓; 365→2.74 ms … 39→25.64 ms ✓; 256,000/50,257 ≈ 5.1× ✓; 12-digit → 4 three-digit chunks ✓. Mermaid `graph LR`: valid quoted labels/edges, `<br/>` safe; `xychart-beta`: valid title/x-axis categories/y-axis range/three 6-point line arrays (EPUB render still owed at build — standing PROGRESS residual); grayscale-safe via labels, not color. Tables: both 3-column well-formed; 12 vocab rows with the claimed 5/7 split ✓.

**Frame audit.** 5 ELI5 blocks (2.2–2.6) ✓; numbered H2s 2.1–2.6, unnumbered back matter per book convention (matches ch01; lint-enforced) ✓; `Where the picture stops` ✓; `### Build it / Break it / Prove it / See it in the wild` closers ✓ (all match lint's `^### <move>$` patterns); dated snapshot boxes for the two most volatile sets (vocabulary sizes; speed medians) ✓; no vendor marketing language ✓; scope = CHAPTER_MAP beat (tokenization, serial decode, latency vocabulary, decode-time inequality) with explicit deferrals to ch3/5/6/7/8/10/14/15/16 — no stolen material ✓; 5,424 words per PROGRESS.md, inside the 3,000–5,500 concept band ✓.

## Findings

1. [P1] Internal contradiction on the TTFT hop count: §2.5 (line 98) says TTFT absorbs "five of the nine hops" (network/connect, admission, routing, queue, prefill — correct against ch01's lifecycle), but the Stops list drops routing and says four.
   - Current (line 183): "**TTFT is one number hiding four hops.** Network, admission, queue, prefill — the stopwatch flattens them."
   - Replacement: "**TTFT is one number hiding five hops.** Network, admission, routing, queue, prefill — the stopwatch flattens them."
   - Why: a countable self-contradiction in the chapter's core concept; any reader who trusted §2.5 now distrusts the breakdown.
2. [P1] STYLE.md hard rule — "Pricing, rate limits, benchmark results live in dated boxes/sidebars, never in the durable-prose spine" — violated twice: DeepSeek prices inline at line 46 and MLPerf SLO numbers inline at line 145 (both dated, but the box rule is explicit; PROGRESS.md's ch02 gate-1 note even claims "dated boxes for … MLPerf SLOs," which the current text does not show).
   - Current (line 145): "Even the benchmarking world concedes how steep this is. MLPerf Inference v5.0 (April 2025) tightened its interactive Llama-2-70B constraints to p99 TTFT ≤ 450 ms and p99 TPOT ≤ 40 ms (25 tokens/s) — from 2 s / 200 ms in v4.0 — based on a late-2024 analysis of ChatGPT and Perplexity targeting 20–50 tokens/s at the 50th percentile (MLCommons blog, 2025-04)."
   - Replacement: "> **Dated snapshot — MLPerf Inference v5.0 SLOs (MLCommons blog, 2025-04).** The release tightened its interactive Llama-2-70B constraints to p99 TTFT ≤ 450 ms and p99 TPOT ≤ 40 ms (25 tokens/s) — from 2 s / 200 ms in v4.0 — based on a late-2024 analysis of ChatGPT and Perplexity targeting 20–50 tokens/s at the 50th percentile. The same release added Llama-3.1-405B with p99 TTFT ≤ 6 s and p99 TPOT ≤ 175 ms — about 5.7 tokens/s." (keep the "standards body admitting…" sentence as prose after the box)
   - Same treatment (line 46): "> **Dated snapshot — DeepSeek cache pricing (fetched 2026-08-27).** DeepSeek bills cache-hit input at $0.007 per 1M tokens off-peak against $0.22 off-peak cache-miss — a ~31× gap derived from the published prices."
   - Why: two violations of a stated hard rule plus an overstated pass record — boxing matches the chapter's own two existing snapshot boxes and costs minutes.
3. [P2] Peak/off-peak asymmetry makes the DeepSeek miss price read as the standard price.
   - Current (line 46): "DeepSeek bills cache-hit input at $0.007 per 1M tokens off-peak against $0.22 cache-miss — a ~31× gap derived from the published prices"
   - Replacement: "DeepSeek bills cache-hit input at $0.007 per 1M tokens off-peak against $0.22 off-peak cache-miss — a ~31× gap derived from the published prices"
   - Why: the digest's miss price is $0.22 off-peak / $0.44 peak; as written the ~31× pairing looks cherry-picked against an unqualified rate.
4. [P2] Book-first acronyms/notation used unexpanded (STYLE: "Acronyms expanded at first use"; later chapters expand these, so ch02 is the expansion point).
   - Current (line 145): "p99 TTFT ≤ 450 ms" → Replacement: "p99 (99th-percentile) TTFT ≤ 450 ms"
   - Current (line 218): "find the 70B and 405B SLO rows" → Replacement: "find the 70B and 405B SLO (service-level objective) rows"
   - Current (line 129): "(NVIDIA NIM benchmarking docs, fetched 2026-08-27)" → Replacement: "(NVIDIA benchmarking docs, fetched 2026-08-27)"
   - Why: ch02 is the book's first occurrence of p99/p95 and SLO (ch03/ch05 expand them later), and NIM is never expanded anywhere; each fix is one word.
5. [P2] Provenance tension behind the headline speed snapshot: the sibling digest written the same day says AA's per-model medians could not be extracted.
   - Current (line 115): "> **Dated snapshot — median output speed, first-party APIs (Artificial Analysis models page, fetched 2026-08-27; derived mean-ITL equivalents in parentheses).**"
   - Replacement: "> **Dated snapshot — median output speed, first-party APIs (Artificial Analysis models page, fetched 2026-08-27; derived mean-ITL equivalents in parentheses; the AA site is JS-rendered — re-verify this table against the live page before each print run).**"
   - Why: research/provider-latency-snapshot-2026.md states those medians "could not be extracted through automated fetch (JS-rendered site)" while research/latency-vocabulary.md quotes the same seven numbers from the same site and date; the chapter matches its cited digest, but the evidence chain contradicts itself on the chapter's most volatile table.

## Commands owed at next gate (not runnable in this review session)

- `python3 tools/lint-manuscript.py` after fixes (last recorded green: PROGRESS.md iteration-14 postscript).
- EPUB build with mermaid render check for ch02's xychart-beta (standing residual since ch02).
- Re-fetch of artificialanalysis.ai/models to close Finding 5.

Counts: P0 = 0 · P1 = 2 · P2 = 3
Verdict: MINOR
```