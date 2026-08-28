All derivations are complete and cross-checked. I have no write-capable tools, so per the read-only constraint I'm returning the complete findings artifact inline for the parent to persist.

## Review

**Scope:** Independent re-derivation of every formula and worked number in ch03, ch04, ch05 (bandwidth floors, roofline ridge points, KV bytes per model, sessions-per-GPU, crossover batches, queue multipliers), plus contradiction hunt against ch02, ch07, ch09, Appendix B, Appendix C (and ch11, which surfaced on its own).

### Verified correct (evidence of the core math holding)

- **Ch03 floors:** 16 GB ÷ 3.35 TB/s = 4.78 ms → 209 ≈ 208 t/s (L42); 140 ÷ 3.35 = 41.8 ms → 23.9 ≈ 24 t/s (L43); 13B: 3.35e12 ÷ 26e9 = 128.8 ≈ 129 t/s (L89); 70B-FP8: B200 8.0 → 114.3 ≈ 115, ×0.7 = 5.6 TB/s ÷ 70 GB = 80 t/s; H100 3.35 ÷ 70 = 47.9 ≈ 48 (L102).
- **Ch03 ridge points:** H100 989.5/3.35 = 295.4 ✓ (L79); B200 2250/7.7 = 292.2, /8.0 = 281.3 ✓; MI300X 1300/5.3 = 245.3 ✓; roofline chart ordinates (3.35×64 = 214.4, ×128 = 428.8, ×192 = 643.2, ×256 = 857.6, ×295 = 988) ✓; batch-1 utilization 3.35/989.5 = 0.34% ≈ 0.3% ✓; batch-64 crossover of ridge at "a few hundred" ✓.
- **Ch04 KV table is exact:** Llama-8B 2×32×8×128×2 = 131,072 B = 128 KiB ✓; Qwen3-8B 144 KiB ✓; Llama-70B 80×8×128 → 320 KiB ✓; gpt-oss 36×8×64 → 72 KiB ✓; DeepSeek MLA 61×576×2 B = 68.625 ≈ 68.6 KiB ✓ (no leading 2 — latent is shared, column notes it); every GiB cell (1.0/4/16, 1.125/4.5/18, 2.5/10/40, 0.5625/2.25/9.0, 0.54/2.1/8.6) re-derives ✓. Opening 16 GB + 16 GiB = ~33 GB ✓. Llama-2-70B MHA 2.5 MiB/token → 20 GiB/8k ✓; MLA 32,768/576 = 56.9× ✓; GQA-8 redesign 244 KiB → 30.5 GiB ✓.
- **Ch04 capacity:** 80 − 16 − 4 = 60 GiB → 15 / 30 / 3 sessions (60/4, /2, /16, floor 3.75→3) ✓; gpt-oss: 80 − 61 = 19 − 4 = 15 GiB ÷ 1.125 GiB = 13.3 ≈ "a dozen" ✓; decode droop 20.3 GB → 6.06 ms → 165 t/s; 33.18 GB → 9.90 ms → 101 t/s ✓ (L159); crossover B ≈ 7 (70/10.74 = 6.5), BF16 ≈ 13 (140/10.74 = 13.04) ✓ consistent with ch03:122.
- **Ch05:** static-batch waste (16 reqs: 12,000/14,400 = 83% ≈ "roughly 80%") ✓; ASCII step counts 28/26/14 ✓; budget 8,192 − 64 = 8,128; 12,000-token prompt = 2 iterations ✓; TRT-LLM 2466.79/2044.26 = 1.207, /1944.26 = 1.269; 2474/1564 = 1.582 (+58.2%); 1 − 14.65/31.3 = 53.2% ✓; Pollaczek–Khinchine E[W] = λE[S²]/(2(1−ρ)) ✓; multipliers 2×/5×/10×/20×/100× and 0.8→0.95 = 4× ✓; 4k-vs-4×1k E[S²] = 16 vs 4 ✓; Orca 36.9× (L48) as cited; ch07 DistServe 2×5.6 = 11.2 ≥ decode 10 → 10 total/3 GPUs = 3.33 = 2.1× ✓; 20,000/2,048 ≈ 10 iterations ✓.
- **Ch09 mirrors ch03 exactly:** 4.78/2.39/1.19 ms → 209/419/837; ×0.7 → 581 ≈ 580 ✓; INT4 scale 0.16/15 = 0.0107, s/2 = 0.0053 = 3.3% of span ✓; 450.3→517.5 = +14.9% ✓; schematic curves engineered to intersect at 7k ✓.
- **Cross-chapter constants consistent everywhere:** 3.35 TB/s, 989.5 TFLOPS, 208 t/s, 4.8 ms, 128/144/320 KiB, 15→30 sessions, ~7 crossover, 14.9%/54%/7k break-even, 91→13→89 haystack, Sarathi 2.6×/5.6×, 49-concurrent A100, M/G/1 knee — identical in ch02, ch03, ch04, ch05, ch07, ch09, App B, App C.

### Findings

**Finding P1 — ch03:104 — "100+ tokens/s" 4-bit 70B on one A100 contradicts the chapter's own roofline.**
Claim: Llama 3.1 70B "serves at 100+ tokens/s on a single A100 once shrunk to roughly 35–40 GB by 4-bit quantization, comfortably above the ~14 tokens/s floor those 140 GB would impose through the A100's 2.0 TB/s." Derivation (the book's own method, §3.2/§3.4): 35–40 GB ÷ 2.0 TB/s = 17.5–20.0 ms/token → **50–57 t/s theoretical ceiling**; with the 0.7 rule, 35–40 t/s. The quoted "100+" exceeds even the zero-overhead ceiling by ~2×, so it must be aggregate/batched throughput or different hardware; and the honest comparison floor for the 4-bit model is ~50 t/s, not BF16's 14. Smallest fix: relabel the community number as batched aggregate throughput (or re-quote ~50 t/s theoretical).

**Finding P1 — ch04:114, ch04:119 vs appendix-c:31 vs ch11:167 — Anthropic long-context pricing stated three ways.**
Ch04 box: Anthropic "Priced in tiers: e.g. Sonnet 4.5 ≤200K at $3/$15 … separate >200K tier" and prose: "Anthropic scopes pricing the same way" (as Gemini's doubling tier). Appendix C: "Claude 4.6+ ships the full 1M-token window at **standard price** — positioning, not physics." Ch11:167: "two of the three major providers price a long-context tier … while Anthropic's current generation ships 1M at standard price." Ch04's "argument three: the market agrees" uses the Anthropic tier as evidence, directly contradicting App C and ch11. Smallest fix: correct the ch04 box row and prose to the App C/ch11 fact (or date-and-qualify the 4.5-era tier if it existed).

**Finding P2 — ch03:45 — "each weight byte fetched buys about two operations" implies AI = 2, breaking the 0.3% derivation it sits in.** Two FLOPs per **2-byte** weight = 1 FLOP/byte (as §3.3 derives and the very next clause states); with AI = 2 the utilization would be 2/295 ≈ 0.7%, not the printed 0.3%. Fix wording to "each 2-byte weight buys two operations."

**Finding P2 — ch03:136 — "8² = 64×, exactly 61× with real token counts" is unit-inconsistent with the same chapter.** At ch03:138 "128k" is computed as 131,072 (and 1M as 1,048,576 = exactly 8×131,072 → exactly 64×). The 61× holds only under decimal 128,000/1,000,000 (7.8125² = 61.04). "Exactly" is wrong for one of the two conventions; App B already hedges "~61–64×". Fix: drop "exactly," state the convention.

**Finding P2 — ch03:96 — H200 ridge "≈ 210 FLOP/byte" is loosely rounded: 989.5 ÷ 4.8 = 206.1.** Every other cell in the table rounds within 1 (295.4→295, 292.2→292, 245.3→245). Same drift class at ch03:122: "70 GB ÷ 320 MiB ≈ 220 streams" is 208.6 in decimal units (220 only if 70 "GB" is read as GiB). Fix: ≈206 (and ≈210 streams or state units).

**Finding P2 — ch03:142 vs appendix-c:35 — cached-read example "$0.15 vs $1.50 per 1M" matches no row in Appendix C's Gemini table.** App C 2.5 Pro: input $1.25, cached $0.125; 3.x: $2.00/$0.20; 2.5 Flash: $0.30/$0.03. Both snapshots are dated 2026-08-27; the 10× ratio is right, the absolute pair is 1.2× App C's 2.5 Pro row. Fix: align to an App C row.

**Finding P2 — ch04:91 (echoed ch06:40, ch06:195) — OPT-13B "800 KB per token … 1.6 GB for 2,048 tokens" is 2× the book's own §4.3 formula.** OPT-13B config (MHA, fp16): 2 × 40 layers × 40 heads × 64 dim × 2 B = 409,600 B = **400 KiB/token** → 0.8 GiB per 2,048-token request. The quoted vLLM-paper figure (likely fp32 KV accounting) is reproduced unflagged, and the "six times today's Llama 8B figure" claim (800/128 = 6.25) would be ~3.1× under the book's formula — notable because the formula card claims "when it lies: nowhere." Fix: footnote the 2× (fp32-cache explanation) or recompute.

**Finding P2 — ch05:96 — "max_num_seqs … (V1 default: 128)" contradicts vLLM's V1 scheduler config (default 1024; V0 was 256).** The 8,192 max_num_batched_tokens default cited alongside is the genuine V1 value. Flagged for verification against the cited "scheduler configuration source" — not re-derivable inside this repo. Fix: correct to 1024 or cite the exact tag where 128 holds.

### Counts

- **P0: 0** — no core formula falsified; roofline, KV-bytes, capacity, crossover, and queueing math all re-derive exactly.
- **P1: 2**
- **P2: 6**

**Merge verdict: OK with notes** — the load-bearing arithmetic is sound; the two P1s are a falsifiable single datapoint (ch03:104) and a three-way pricing contradiction (ch04 vs App C/ch11), both small, localized fixes.

### Intended artifact (could not be written — read-only/no write tool; return for persistence)

Target path: `/Users/arbaz/Projects/personal/inference-engineering-book/review/gate6-claims-1.md` — content is the Findings section above (8 entries, each with severity, chapter:line, derivation, and smallest fix).