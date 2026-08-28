# Gate 2 Technical Editor Review — Appendix B (arithmetic cheat-sheet)

**File reviewed:** `manuscript/appendix-b-arithmetic-cheatsheet.md` (full read)
**Reference contracts:** STYLE.md, EDITORIAL_SYSTEM.md, GOAL.md
**Cross-checked against:** ch 02, 03, 04, 05, 08, 09, 10, 11, 12, 14, 15, 16, 17, 18 (targeted source reads)

---

## A. Arithmetic audit — every formula recomputed from first principles

**B.1 Decode-time identity.** e2e = TTFT + (N−1)·mean ITL = 0.4 s + 199 × 0.025 s = 0.4 + 4.975 = 5.375 ≈ **5.4 s** ✓. TPOT = (5,375−400)/199 = 25 ms ✓. tokens/s = 1000/25 = 40 ✓. Matches ch 2 §2.5 verbatim (ch 2 says "TPOT 25 ms"; "mean ITL 25 ms" is equivalent since TPOT is the mean of ITL samples, ch 2 line 104).

**B.1 Roofline.** 3.35 TB/s × 64 FLOP/byte = 214.4 ≈ **214 TFLOP/s** ✓; batch-1 yield 3.35 × 1 = **~3.35 TFLOP/s** ✓; ridge 989.5 ÷ 3.35 ≈ 295 ✓ (ch 3 lines 77–110). 60–80% real-kernel bandwidth claim ✓ (ch 3 line 190).

**B.1 Single-stream floor.** 70B FP8 = 70 GB. B200: 8,000 GB/s ÷ 70 GB = 114.3 ≈ **~115** theoretical; × 0.7 (5.6 TB/s ÷ 70) = **80.0** ✓; H100: 3,350 ÷ 70 = 47.9 ≈ **48** ✓ (ch 3 line 102 verbatim).

**B.1 Prefill decomposition.** Linear ratio 1M/128K = 7.8–8 ("8×") ✓; quadratic (10⁶ ÷ 1.28×10⁵)² = 61.0, or 8² = 64 → "~61–64×" ✓ (ch 3: "8² = 64×, exactly 61× with real token counts"; ch 11: 64×). Formula c·(N²+N·M+M²/2) ✓ matches ch 3 line 134 and ch 11 line 39.

**B.2 KV bytes.** 2 × layers × KV heads × head dim × bytes: Qwen3-8B = 2×36×8×128×2 = 147,456 B = **144 KiB** ✓; × 131,072 tokens = 19.33 GB = **18.0 GiB** ("≈ 18 GB") ✓ (ch 4 table). Llama 3.1 8B: 2×32×8×128×2 = 131,072 B = 128 KiB → FP8 **64 KiB** ✓ (ch 9 line 88: "drops from 128 KiB per token to 64"; sessions 15→30 = doubling ✓).

**B.2 Sessions.** 80 GB − 61 GB (gpt-oss-120b MXFP4) − ~4 GiB workspace ≈ **~15 GiB** ✓ (ch 4 line 107). Formula shape ✓.

**B.2 Sharding / expert capacity.** per-shard = total ÷ (t·p·e) ✓ (ch 10 line 48 verbatim); expert capacity = (tokens ÷ experts) × top-k × capacity factor ✓ (ch 10 line 130 verbatim); silent-drop framing ✓.

**B.3 Cost per request.** Bucket identity `total input = cache reads + cache writes + fresh input` ✓ (ch 12 line 125); inclusive (OpenAI/Gemini) vs exclusive (Anthropic/Bedrock) ✓ (ch 12 lines 123–126; ch 15 line 194's Bedrock additive ledger).

**B.3 Cache loop.** Break-even (w−1)/(1−r) = 0.25/0.9 = **0.28** ✓; 1-hour (2−1)/0.9 = **1.11** ✓ (ch 14 line 71 verbatim). Dollars: write 100K × $3/M × 1.25 = **$0.375**; nine reads 9 × 100K × $0.3/M = **$0.270**; total **$0.645** vs 10 × $0.30 = **$3.00**; saving 2.355/3.00 = 78.5% ≈ **79%** ✓ (ch 14 line 64 verbatim). **However, the cost identity line is off by one — see Finding 1.**

**B.3 Expiry penalty.** 1.25 ÷ 0.1 = **12.5×** ✓; 2.0 ÷ 1.25 = **1.6** ✓ (ch 14 line 95). 200K × $5/M × 1.25 = **$1.25**; × 0.1 = **$0.10** ✓ (ch 17 resume box, Opus-5-class $5/M). Inequality: 2 + 0.1N < 1.25N ⟺ 2 < 1.15N ⟺ N > 1.74 → **N ≥ 2** ✓ (ch 17 line 118 verbatim); gap framing "two long idle gaps per hour" ✓ (ch 17 checkpoint 2: 2.5 > 2.2).

**B.3 Compaction breakeven.** 30K + 3K·t = 15K·t → 30K = 12K·t → **t = 2.5**, "ahead from the third turn" ✓ (ch 17 line 74 verbatim; before-cost 0.1 × 150K = 15K/turn ✓). Formula line carries a stray "per-turn growth" term the worked arithmetic doesn't use — Finding 4.

**B.3 Fleet spawn.** 1.25 + 0.1×(10−1) = 1.25 + 0.9 = **2.15×** vs 10×; 10 ÷ 2.15 = 4.65 ≈ **4.7×** ✓ (ch 17 line 199 verbatim).

**B.4 Batch lane.** Interactive: 10k × (1,500×$3/M + 500×$3/M + 400×$15/M) = 45 + 15 + 60 = **$120.00** ✓. Batch (50%): **$60.00** ✓. Batch + prefix: 7.50 + (write ≈ $0.003 + 9,999 reads × 1,500 × $0.15/M ≈ $2.25) + 30 = **≈ $39.75** ✓. Interactive perfect hits: 15 + (≈$0.006 + $4.50) + 60 = **$79.50** ✓. Punchline 79.50 > 60.00 ✓. All match ch 16 §16.7 table and chart endpoints exactly.

**B.4 Failure lines.** Re-send at batch rates: 2,000 × $1.50/M + 400 × $7.50/M = $0.003 + $0.003 = **≈ $0.006** ✓; 5% × 10,000 × $0.006 = **$3.00** ✓; full re-run = **$60.00** ✓ (ch 16 line 156 verbatim; "unbilled" errored requests ✓ ch 16 line 75).

**B.5 rps ceiling.** 900,000 ÷ 60 ÷ 500 = **30 rps** ✓; 70–80% → **21–24** ✓ (ch 15 line 145 verbatim).

**B.5 Queueing knee.** 1/(1−ρ): 50% → 2×, 90% → 10×, 99% → 100× ✓ (ch 5 table lines 136–140).

**B.5 Little's Law.** 24 rps × 4 s = **96** in flight ✓ (ch 15 line 149 verbatim).

**B.5 Tail law.** 1 − 0.99¹⁰⁰ = 1 − 0.366 = **63.4% ≈ 63%** ✓; 1 − 0.99¹⁰⁰⁰⁰ = 1 − e^(−100.5) ≈ 1 − 2.4×10⁻⁴⁴ ≥ **99.99999%** ✓ (ch 16 line 132 verbatim for the latter).

**B.5 Full jitter / adaptive throttling.** `random(0, min(cap, base·2^attempt))` ✓ (ch 15 line 117); 3-attempt cap → 3× amplification ✓ (ch 15 line 171); ~10% retry budget ✓. Throttling: 1 − K·successes/requests ≡ (requests − K·accepts)/requests, algebraically equivalent to ch 15 line 127's form (drops only the +1 smoother); K ≈ 1.1 ✓.

**B.6 Speculation.** E = (1 − 0.8⁵)/(1 − 0.8) = 0.67232/0.2 = **3.3616 ≈ 3.36** ✓; net = 3.36 ÷ 1.2 = **2.80×** ✓ (ch 8 line 63 and table line 130 verbatim). "No header says 'speculated'" ✓ (ch 8 line 161). EAGLE-3 temperature range — see Finding 6.

**B.7 Crossover.** $1.49 × 720 h = **$1,072.8 ≈ $1,073**/month ✓; 1,073 ÷ $0.60/M = **1,788M ≈ 1,790M** tokens ✓; utilization = 1,788M ÷ (2,000 tok/s × 2.592M s) = 1,788/5,184 = **34.5% ≈ 35%** ✓; 10M × $0.60 = **$6** ✓. All match ch 18 §18.4 and checkpoint 4 verbatim — but see Finding 5.

**Constants box.** 1.25×/0.1×/2×, TTL 5 min/1 h, batch 50%/24 h "all three major providers" ✓ (ch 14 §14.2, ch 16 lines 74–76: OpenAI/Anthropic/Google all 50%/24 h); Sonnet 4.6 $3/$15, $1.50/$7.50 (exactly 50%) ✓; H100 $2.39–2.49/hr, A100 ~$1.49/hr, $0.60/M ✓ (ch 18 lines 111–114). Box is dated (2026-08-27) per the numbers-discipline contract ✓.

**Every formula and worked number in the sheet recomputes correctly except the one identity in Finding 1.**

## B. Cross-check audit

- **Citations:** all referenced chapters (2, 3, 4, 5, 7, 8, 9, 10, 11, 12, 14, 15, 16, 17, 18) exist and own the content claimed; every worked number traced to its chapter (verified above). Ch 6/13 correctly absent (no formula cards own them).
- **tokens/s unified:** clean — no "tokens per second"/"tok/s"/"tokens/sec" variants in the file.
- **`fanouts`** (not fan-outs) ✓; spaced em-dashes ✓; no tilde fences ✓; no British spellings (scan clean) ✓; closer-format rules N/A for appendices ✓.
- **Acronyms:** TTFT, ITL, TPOT, KV, MoE, TTL, FLOPs, 429, e2e all expanded at first use in-file ✓ — except Finding 7.

## C. Findings

**1. [P1] Cache-loop cost identity is off by one and contradicts its own card, its break-even formula, chapter 14, and the sibling fleet card.**
- Location: `appendix-b-arithmetic-cheatsheet.md`, B.3 "The cache loop" (line 56).
- Exact text: `> N requests sharing a written prefix cost w + N·r, versus N uncached`
- Why: (a) The card's own worked dollars count ten turns as **one write + nine reads** (w + (N−1)·r), not w + N·r; (b) ch 14 uses the same (N−1) convention ("one write plus 9,999 reads" for 10,000 requests, line 97); (c) the appendix's own fleet-spawn card states `1.25 + 0.1·(N − 1)` for N children; (d) under the literal comparison "w + N·r vs N", the break-even is N ≥ w/(1−r) = 1.25/0.9 ≈ 1.39 — contradicting the (w−1)/(1−r) = 0.28 threshold quoted two lines later, which is the write-premium payback form where N counts *reuses*. The conclusions printed (0.28, 1.11, "one reuse pays") are all correct; only the stated cost identity is wrong, and a reader who derives break-even from it gets the wrong answer (2 reads instead of 1 at the 5-minute price).
- Replacement: `> the first request writes, the rest read: w + (N − 1)·r, versus N uncached`

**2. [P2] Opening framing sentence is contradicted by the cards themselves.**
- Location: intro paragraph (line 4).
- Exact text: `Provider prices and multipliers below live in the one dated box at the end, not in the cards' spines.`
- Why: multipliers (1.25×, 0.1×, 2×, 50%) and derived dollars ($0.375, $0.645, $1.25/$0.10, $120/$60/$39.75/$79.50, $0.006) appear throughout card spines. The values are all consistent with the box, but the "not in the cards' spines" claim is literally false.
- Replacement: `Provider prices and multipliers are defined once in the dated box at the end; the cards quote the multipliers and derive their dollars from it.`

**3. [P2] Card title collides with a different formula in the owning chapter.**
- Location: B.1 first card (line 8).
- Exact text: `**The decode-time inequality.**` followed by `e2e ≈ TTFT + (N − 1) × mean ITL`
- Why: ch 2 reserves the name "decode-time inequality" for `e2e ≈ TTFT + N × TPOT` (§2.6) and explicitly distinguishes it from "the exact identity from 2.5" that uses (N−1) gaps. Two different formulas now share one name across the book — and the appendix's closing rule says the chapter wins.
- Replacement: `**The decode-time identity.**`

**4. [P2] Compaction formula line contains a term its worked equation and ch 17 don't use.**
- Location: B.3 "The compaction breakeven" (line 72).
- Exact text: `> after: one full-price re-prefill, then r × (prefix′ + per-turn growth)`
- Why: the worked line `30K + 3K·t = 15K·t` and ch 17 ("then 3K per turn") both model each turn as a flat read of r × prefix′ = 0.1 × 30K = 3K, with no growth term; adding growth would make the after-cost superlinear and change t.
- Replacement: `> after: one full-price re-prefill, then r × prefix′ per turn (3K here)`

**5. [P2] Crossover card drops chapter 18's explicit hedge that 2,000 tokens/s is optimistic for an A100.**
- Location: B.7 (line 156).
- Exact text: `about **35% of every hour** at a sustained ~2,000 tokens/s aggregate`
- Why: ch 18's own derivation states "The 2,000 figure is H100-class and optimistic for an A100 — a slower real GPU pushes the breakeven share higher" (checkpoint 4). The appendix attributes 2,000 tokens/s to the A100 crossover unqualified, flattering the own-vs-rent case — a numbers-discipline miss against the chapter's hedge.
- Replacement: `about **35% of every hour** at a sustained ~2,000 tokens/s aggregate (H100-class; optimistic for an A100 — a slower card pushes the share higher)`

**6. [P2] Speculation card restates EAGLE-3's temperature loss without the chapter's stated exception.**
- Location: B.6 (line 166).
- Exact text: `(roughly 15–25% speedup loss from temperature 0 → 1 in EAGLE-3's own table)`
- Why: ch 8 line 108 qualifies the range — "roughly a 15–25% speedup loss **on three of the four models — the 70B drops only ~4%** (derived from the paper's table)". The unqualified card range overstates the worst-case for the largest model.
- Replacement: `(roughly 15–25% speedup loss from temperature 0 → 1 on three of EAGLE-3's four models; the 70B lost only ~4%)`

**7. [P2] Two acronym sets unexpanded in a file that otherwise expands everything at first use.**
- Location: B.2 line 40 and B.5 line 127.
- Exact text: `(GQA, MLA, sliding window)` and `rps ≈ TPM ÷ 60 ÷ average tokens per request`
- Why: the appendix self-consistently expands TTFT, ITL, TPOT, KV, MoE, TTL, FLOPs, 429, e2e — GQA/MLA and TPM are the lone exceptions (expansions live only in ch 4/ch 15), which breaks the file's own convention and the style contract's first-use rule for a standalone reference shelf.
- Replacement: `(GQA (grouped-query attention), MLA (multi-head latent attention), sliding window)` and `rps ≈ TPM (tokens per minute) ÷ 60 ÷ average tokens per request`

## D. Verified correct (no action)

All 30+ worked numbers recomputed and matched to their owning chapters (audit in §A): decode identity 5.4 s; roofline 214 TFLOP/s / ~3.35 at batch 1 / ridge 295; floors 115/80/48; 61–64×; 144 KiB & 18 GiB KV; 128→64 KiB FP8; ~15 GiB; break-evens 0.28/1.11; $0.645 vs $3.00 (79%); 12.5×/1.6×; $1.25 vs $0.10; t = 2.5; 2.15×/4.7×; $120/$60/$39.75/$79.50; $0.006/$3.00/$60.00; 30 rps & 21–24; 2×/10×/100× knee; 96 in flight; 63% & ≥99.99999%; 3.36 & 2.8×; $1,073/1,790M/35%/$6. Cross-references, tokens/s unification, US spelling, fanout spelling, dated constants box all clean.

---

Counts: P0 = 0 · P1 = 1 · P2 = 6
Verdict: MINOR