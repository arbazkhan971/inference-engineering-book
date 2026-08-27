All evidence is gathered. I have no file-writing tool in this session, so per the runtime contract I'm returning the complete review artifact inline for persistence to `review/03-the-arithmetic-of-waiting-gate2.md`.

---

**Chapter:** 03-the-arithmetic-of-waiting · **Counts:** P0 = 0 · P1 = 2 · P2 = 7 · **Verdict:** MINOR
**Worst finding:** the B200 footnote's own division is wrong — it claims the ridge "lands near 292 either way," but 2,250 ÷ 8.0 TB/s ≈ 281, and this is the chapter whose entire lesson is that division.

---

## Review artifact (for `review/03-the-arithmetic-of-waiting-gate2.md`)

# Gate 2 (Technical editor) — chapter 03, "The arithmetic of waiting"

## Numbers audit (20 claims traced to dated digests; all matches verified unless flagged)

| # | Chapter claim | Digest | Date | Match |
|---|---|---|---|---|
| 1 | H100 989.5 TFLOPS dense BF16; 1,979 sparse; 80 GB HBM3 @ 3.35 TB/s | `research/arithmetic-intensity-roofline.md:6` | NVIDIA H100 page, fetched 2026-08-27 | ✓ |
| 2 | Ridge ≈ 295 FLOP/byte | same :7 | 2026-08-27 | ✓ |
| 3 | PaLM 540B 46.2% MFU on 6,144 TPU v4 | `research/inference-vs-training.md:7` | arXiv:2204.02311, Apr 2022 | ✓ |
| 4 | Llama 3 41–43% MFU | same :7 | arXiv:2407.21783, Jul 2024 | ✓ |
| 5 | 29 ms/token low batch, 500B-class on TPU v4 (Pope et al.) | same :8 | arXiv:2211.05102, Nov 2022 | ✓ |
| 6 | NVIDIA "decode is memory-bound" quote | same :9 | 2023 blog, fetched 2026-08-27 | ✓ (verbatim) |
| 7 | 8B ≈ 16 GB → 4.8 ms → ≈208 tokens/s | same :13; `01-...is.md:88` previews it | Meta 2024 | ✓ (cross-ref "chapter 1 previewed" verified true) |
| 8 | 70B 140 GB → 42 ms → ≈24 tokens/s | `research/gpu-memory-hierarchy.md:16` | 2026-08-27 | ✓ |
| 9 | 13B → ≈129 tokens/s; batch 64 → ≈214 TFLOP/s | `research/arithmetic-intensity-roofline.md:16` | 2026-08-27 | ✓ |
| 10 | 0.7 rule; kernels at 60–80% of datasheet bandwidth | `research/decode-bandwidth-wall.md:6` | Locara, fetched 2026-08-27 | ✓ |
| 11 | 70B FP8 on B200 ≈115 theoretical / ≈80 effective; H100 ≈48 | same :7,:9,:21 | ITK/Locara, fetched 2026-08-27 | ✓ |
| 12 | vLLM Sep 2024: 1,500–2,500 tok/s on 4×H100 vs ~50–100 single-stream | same :10 | vLLM v0.6.0 blog 2024 | ✓ |
| 13 | MLPerf v6.0 vendor-quoted: B200 ~17,500 vs H100 ~3,000 | same :11 | Spheron, fetched 2026-08-27 | ✓ (hedged "directional" in chapter) |
| 14 | H200 4.8 TB/s / 141 GB / ridge ≈210 | `arithmetic-intensity-roofline.md:8` | NVIDIA datasheet, fetched 2026-08-27 | ✓ |
| 15 | B200 2,250 dense / 7.7 TB/s / 180 GB / ridge 292 | same :9 | Lenovo LP2226 citing NVIDIA, fetched 2026-08-27 | ✓ (but see finding 2 for the † footnote) |
| 16 | MI300X 1,300 / 5.3 / 192 GB / ridge ≈245 | same :10 | AMD datasheet, fetched 2026-08-27 | ✓ |
| 17 | Llama 3.1 70B 320 KiB/token FP16 → 320 MiB @1k, 10 GiB @32k; crossover ≈220 / 7 | `research/kv-cache-bytes-formula.md:9,:26` | config mirrors, fetched 2026-08-27 | ✓ |
| 18 | Qwen3 8B 144 KiB/token; 128k → ≈18 GB | `research/attention-cost-scaling.md:8,:22`; `kv-cache-bytes-formula.md:10` | Raschka, fetched 2026-08-27 | ✓ |
| 19 | Gemini $0.075/$0.15 in, $0.30/$0.60 out (archived 2025-06-21, verified 2026-08-27); 3.1 Pro $2/$4 @200k; cached $0.15 vs $1.50 + $1.00/1M/hr | `attention-cost-scaling.md:9–11` | Google pricing | ✓ (but see finding 4) |
| 20 | A100 2.0 TB/s → ~14 tok/s floor; 70B int4 ≈100+ tok/s on one A100 | `decode-bandwidth-wall.md:8,:12` | fetched 2026-08-27; Markaicode community | ✓ ("35–40 GB" is chapter-derived, visibly hedged) |

Also traced: FlashAttention 15% BERT-large / ~3× GPT-2 / O(N²)→O(N) / Theorem 2 (`gpu-memory-hierarchy.md:11,:17`; `attention-cost-scaling.md:5–6`, arXiv:2205.14135 NeurIPS 2022); 64×/61× attention growth (`attention-cost-scaling.md:21`, 61× chapter-derived: (1,000,000/128,000)² = 61.04 ✓); hierarchy tiers and 50–60 MB L2 / 1,300:1 (`gpu-memory-hierarchy.md:4,:9`). **No untraceable benchmark numbers.** One arithmetic defect found (finding 2).

## Frame audit
✓ ELI5 blocks open §§3.2–3.7 (all major concepts; §3.1 is itself the on-ramp, §3.8 is synthesis). ✓ H2s numbered 3.1–3.8. ✓ `Where the picture stops` present (line 181). ✓ `### Build it / Break it / Prove it / See it in the wild` (line 208+; linter pattern `^### Build it$` satisfied). ✓ One `Dated snapshot` box for pricing; unnumbered trailing H2s match all 18 sibling chapters. ✓ No vendor marketing language. ✓ Scope matches the CHAPTER_MAP beat (compute- vs bandwidth-bound, intensity, roofline, 1-token-vs-1M); KV formula, batching machinery, prefill/decode split all explicitly deferred to ch4/5/7 — no stolen material. Deviations: findings 3, 8, 9.

## Mechanics audit
Recomputed derivations (all correct): 16/3.35 GB÷(TB/s) = 4.78 ms → ≈208/s ✓; 140/3.35 = 41.8 ms → ≈24/s ✓; 989.5/3.35 = 295 ✓; 989.5/4.8 = 206 (≈210 per digest) ✓; 1300/5.3 = 245 ✓; 3.35e12/26e9 = 129 ✓; 3.35×64 = 214 ✓; 8000/70 = 114≈115, 0.7×8.0/70 GB = 80, 3350/70 = 48 ✓; 320 KiB×1024 = 320 MiB, ×32k = 10 GiB, 70÷10 = 7 ✓; 144 KiB×131,072 ≈ 18 GiB ✓ (digest-consistent); Σ(N+i) = NM+M²/2 ✓. **One error: 2,250/8.0 = 281 ≠ "near 292 either way" (finding 2).** Mermaid `xychart-beta` block: syntax valid (title/x-axis categories/y-axis range/line array); chart data matches 3.35×intensity capped at 989; grayscale-safe. Tables (3.1, chip, hierarchy, levers): all well-formed with separator rows. Repo linter (`tools/lint-manuscript.py`) would pass this chapter's structural markers; it does **not** check blank lines before headings, so finding 1 would only surface at the pandoc build.

## Findings

1. **[P1]** Current text (lines 47–48): `"…one user's token still walks one kitchen's stairs.` ⏎ `## 3.3 One ratio to sort every workload"` — no blank line between paragraph and heading. **Replacement:** insert one blank line before `## 3.3` (every other heading in the file and all sibling chapters have one). **Why:** pandoc's default `blank_before_header` folds the heading into the preceding paragraph, silently dropping §3.3 from the EPUB body and TOC.
2. **[P1]** Current text (line 90): `"† some sources quote the B200 at 192 GB and 8.0 TB/s — sources differ, ridge lands near 292 either way"`. **Replacement:** `"…sources differ — ridge lands at ≈292 (7.7 TB/s) or ≈281 (8.0 TB/s)"`. **Why:** 2,250 ÷ 8.0 ≈ 281, not 292; the digest (`arithmetic-intensity-roofline.md:9`) supports 292 only at 7.7 TB/s, and a reader doing the chapter's taught division catches this.
3. **[P2]** Current text (line 111): `"vLLM's September 2024 benchmarks ran Llama 3.1 70B on four H100s at roughly **1,500–2,500 output tokens/s aggregate**…"`. **Replacement:** wrap the vLLM + MLPerf sentences in a `> **Dated snapshot (throughput benchmarks; decay with engine versions).**` blockquote, as ch05 does. **Why:** STYLE hard rule — benchmark results live in dated boxes, never the durable-prose spine; numbers are correct and dated, only placement deviates.
4. **[P2]** Current text (line 137): `"doubling to $0.15 above 128k… ($0.15 vs $1.50 per 1M tokens on Flash-class models…)"`. **Replacement:** add a clarifier, e.g. "on a 2026 Flash-class generation (the $0.075/$0.15 table above is the archived 2025 tier)". **Why:** as printed the same box seems to price Flash-class input at $0.15 and $1.50 at once; both trace to dated digests (`attention-cost-scaling.md:9,:11`) but juxtapose as a contradiction.
5. **[P2]** Current text (line 131): `"A million tokens is not eight eightk prompts; it is roughly sixty-four of them stitched into one grid."`. **Replacement:** "A million tokens is not eight 128k prompts; it is roughly sixty-four of those 128k attention problems stitched into one grid." **Why:** "eightk" parses as 8,000-token prompts (8 × 8k = 64k ≠ 1M), breaking the sentence's own 8×/64× comparison.
6. **[P2]** Current text (line 131): `"and why engines carve prefill into chunks with resources of its own (chapter 7)."` **Replacement:** "…chunks with resources of their own (chapter 7)." **Why:** plural "chunks" needs "their"; "its" has no clean antecedent.
7. **[P2]** Current text (line 166): `"context-trimmed the chattest sessions"`. **Replacement:** "context-trimmed the chattiest sessions". **Why:** nonstandard superlative reads as a typo in the field note.
8. **[P2]** Current text (lines 156, 119): `"(GPU-memory-hierarchy digest, 2026-08-27; SRAM = static random-access memory…)"` and `"(decode-bandwidth-wall analysis, 2026-08-27)"`. **Replacement:** "(GPU vendor datasheets and hardware teardowns, retrieved 2026-08-27; SRAM = static random-access memory…)" / "(decode bandwidth-wall analysis, retrieved 2026-08-27)". **Why:** internal research-corpus filenames leak into reader-facing citations; every neighboring citation names a real-world source.
9. **[P2]** Current text (lines 92, 28, 212): `"Dense BF16/FP16 peak"` / `"Registers → SRAM → HBM → RAM → disk"` / `"active KV bytes at your p95 context"`. **Replacement:** expand FP16 ("16-bit floating point") at first use, gloss SRAM in the 3.1 table row (expansion currently delayed to line 156), and write "p95 (95th-percentile) context". **Why:** STYLE requires acronyms/notation expanded at first use; FP16 is never expanded and p95 arrives unglossed after p99 is glossed.

**Counts:** P0 = 0 · P1 = 2 · P2 = 7
**Verdict:** MINOR

---

## Acceptance report