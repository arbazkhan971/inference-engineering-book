All audits are complete. All checks are done — every numeric claim traced, derivations recomputed, frame and mechanics verified. Since no write-capable tool is available in this session, the complete review artifact is returned below for persistence to `review/13-structured-output-is-not-a-prompt-trick-gate2.md`.

**Chapter:** 13 — Structured output is not a prompt trick
**Counts:** P0 = 0 · P1 = 1 · P2 = 4
**Verdict:** MINOR
**Worst finding:** Dangling cross-reference — "chapter-5 sampler knobs" points to sampler-knob content that exists nowhere in chapter 5 (or chapters 2/5 in the Lever table); "top-p" appears only in chapter 13 across the whole manuscript.

````markdown
# Gate 2 — Technical editor review: Chapter 13 (Structured output is not a prompt trick)

Reviewer: Gate 2 (technical editor) · Review date: 2026-08-27
Inputs: manuscript/13-structured-output-is-not-a-prompt-trick.md against STYLE.md,
EDITORIAL_SYSTEM.md, GOAL.md, CHAPTER_MAP.md, and research/ digests.
Read-only review; manuscript and research untouched.

## Checks performed (evidence)

### 1. Numbers audit — 27 claims traced; all match their dated digests (all digests researched/retrieved 2026-08-27)

| # | Claim in chapter | Digest | Match |
|---|---|---|---|
| 1 | Prompt-only JSON fails ~1 in 10 requests (hedged single-source, Tanmay Bohra blog) | structured-output-costs-tension.md | ✓ |
| 2 | 100% correct rate, both grammar backends (vLLM PR #10785) | constrained-decoding-grammars.md | ✓ |
| 3 | Outlines backend: 0.22 req/s, 113 output tok/s, mean TTFT ≈38.5 s | constrained-decoding-grammars.md (113.31; 38.5 s) | ✓ |
| 4 | XGrammar backend: 0.94 req/s, 480 tok/s, TTFT ≈4.55 s | constrained-decoding-grammars.md (480.27; 4552 ms) | ✓ |
| 5 | XGrammar up to 100× per-token latency reduction, 80× e2e speedup (Llama-3.1, H100) | constrained-decoding-grammars.md | ✓ |
| 6 | llguidance ~50 µs/token for 128k vocab; negligible startup; Chromium residency | constrained-decoding-grammars.md | ✓ |
| 7 | vLLM blog 2025-01-14: up to 5× TPOT-under-load; scheduler-level mask compute | constrained-decoding-grammars.md | ✓ |
| 8 | Sampler order: penalties → grammar mask → temperature → truncation | sampling-params-provider-defaults.md ("The sampler pipeline is fixed in order…") | ✓ |
| 9 | `StructuredOutputsParams` (json/regex/choice/grammar, mutually exclusive); `guided_*` removed v0.12.0 | sampling-params-provider-defaults.md + constrained-decoding-grammars.md | ✓ |
| 10 | OpenAI 100% vs <40% prompting alone, labeled vendor's own 2024 eval | provider-structured-output-apis.md | ✓ |
| 11 | Strict limits: 5,000 properties / 10 nesting / ≤120,000 chars / ≤1,000 enums / >250 → ≤15,000 enum chars | provider-structured-output-apis.md | ✓ |
| 12 | Fine-tuned-model keyword rejections (minLength/maxLength/pattern/format, bounds, patternProperties, item counts) | provider-structured-output-apis.md | ✓ |
| 13 | Key-order quote "in the same order as the ordering of keys in the schema"; folklore corollary hedged | provider-structured-output-apis.md | ✓ |
| 14 | Anthropic: no json_mode; strict tool quote; `output_config.format`; `structured-outputs-2025-11-13` beta; tool_choice 4 values + disable_parallel_tool_use | provider-structured-output-apis.md | ✓ |
| 15 | Gemini subset types + "ignores unsupported properties"; propertyOrdering required in 2.0 era, not 2.5+; Firebase enum mode | provider-structured-output-apis.md | ✓ |
| 16 | DeepSeek quotes: "valid JSON", "unending stream of whitespace", "json" in prompt, third-party Responses-style API hedged | provider-structured-output-apis.md | ✓ |
| 17 | 38.15-pt gap at 0.148% parse-error rate (LLaMA 3 8B, Last Letter) | structured-output-costs-tension.md | ✓ |
| 18 | 100% of GPT-3.5 Turbo JSON-mode responses answer-before-reason | structured-output-costs-tension.md | ✓ |
| 19 | Ordering: JSON-mode < format-restricted < NL-to-format < free text | structured-output-costs-tension.md | ✓ |
| 20 | GPT-4o-mini: NL beat JSON-schema on 2 of 3 datasets; generic-JSON improvement on GSM8K (3 models) | structured-output-costs-tension.md | ✓ |
| 21 | CRANE 29% vs 38% GSM-Symbolic; ~5–9-pt tax; pass@3 at ~4× tokens | structured-output-costs-tension.md | ✓ |
| 22 | Hidden Cost of Structure (RANLP 2025, 11 models; base benefit / instruct lose) | structured-output-costs-tension.md | ✓ |
| 23 | Capacity Not Format (arXiv:2606.09410, 4 models, 5 benchmarks, spare capacity) | structured-output-costs-tension.md | ✓ |
| 24 | 43.7% vs 75.5% regex-vs-LLM-parser gap (paper appendix) | structured-output-costs-tension.md | ✓ |
| 25 | ≈389 tokens per tool schema (Dr Pranay Jha; Instructor docs, verified April 2026) | structured-output-costs-tension.md | ✓ |
| 26 | PSC arXiv:2608.03065 "main throughput limiter"; TSC arXiv:2605.29986 "intractably high overhead" quote (verbatim) | structured-output-costs-tension.md | ✓ |
| 27 | Outlines arXiv:2307.09702 + integrations; toktrie; XGrammar Nov 2024 / merged Dec 2024; TensorRT-LLM backends + spec workflow; JSON structural-token inflation (hedged) | constrained-decoding-grammars.md + structured-output-costs-tension.md | ✓ |

No untraceable numbers. The two volatile clusters (backend landscape, OpenAI schema limits) are in dated snapshot boxes; historical benchmarks carry inline dated citations per house practice.

### 2. Mechanics — 6 derivations recomputed
- 0.94 ÷ 0.22 = 4.27 → "≈4.3×" ✓
- 480.27 ÷ 113.31 = 4.24 → "≈4.2×" ✓
- 38.5 ÷ 4.552 = 8.46 → chapter says "≈8×" (finding 2)
- 75.5 − 43.7 = 31.8 ✓
- 40 × 389 = 15,560 ✓ (labeled derived/illustrative)
- 38 − 29 = 9, inside "5–9 points" ✓
- Mermaid §13.2: parseable (graph LR, quoted labels, `<br/>`, labeled edge `G -->| next step | A`), grayscale-safe.
- Tables: Words-before-machinery (13 rows × 3 cols), provider (4×4), lever (7×2) — all well-formed.

### 3. Frame
- 5 ELI5 blocks (§§13.2–13.6), analogy-first with term landing at the end — matches house pattern (cf. ch14); jargon-free bodies.
- H2s numbered 13.1–13.6; frame H2s unnumbered — matches convention in all 18 chapters.
- `Where the picture stops` present (4 concrete breaks); `### Build it / Break it / Prove it / See it in the wild` all present.
- Dated snapshot boxes ✓; vendor claims explicitly labeled as vendor's own evals; no marketing language.
- Acronyms expanded at first use: JSON, EBNF, FSM, TTFT, CPU, GPU, API, TGI, CoT. (TPOT pre-owned by ch2, which defines it.)
- Scope matches CHAPTER_MAP ch13 beat (constrained decoding, grammars, xgrammar/outlines, JSON mode, token overhead, grammar-vs-model). Defers ch14 pricing, ch15 retry machinery, ch17 prefix assembly — nothing stolen. Ch8 promissory note discharged in one paragraph, correctly bounded.
- Verified cross-refs: ch5 retries-and-queue ✓ (ch5: "immediate retries re-arrive as the exact burst that deepened the queue"); ch2 decode loop ✓; ch12/ch14/ch15/ch16/ch17 pointers ✓ — except the sampler-knob references (finding 1).

## Findings

1. [P1] "Temperature, top-p, top-k, min-p — all the chapter-5 sampler knobs still apply, but only to the survivors" (§13.2, step 3) and "| Sampler knobs the mask composes with (temperature, top-p, min-p) | Chapter 2, chapter 5 |" (§13.6 lever table).
   Replacement: "Temperature, top-p, top-k, min-p — the usual sampler knobs still apply, but only to the survivors"; and "| Sampler knobs the mask composes with (temperature, top-p, min-p) | Not owned elsewhere — glossed in §13.2 |".
   Why: neither chapter 2 nor chapter 5 introduces any sampler knob ("top-p"/"min-p" appear nowhere else in the manuscript), so both pointers send readers to background that does not exist.
2. [P2] "(derived: ≈4.3× throughput, ≈4.2× decode speed, ≈8× faster first token)" (§13.2).
   Replacement: "(derived: ≈4.3× throughput, ≈4.2× decode speed, ≈8.5× faster first token)".
   Why: 38.5 s ÷ 4.552 s = 8.46, and the sibling ratios round to two significant figures, so "≈8×" understates the derived value it sits beside.
3. [P2] "a mean time-to-first-token (TTFT) of ≈38.5 seconds — half a minute building a per-request FSM over the vocabulary" (§13.2).
   Replacement: "— over half a minute building a per-request FSM over the vocabulary".
   Why: 38.5 s exceeds "half a minute" (30 s) by ~28%; the understatement softens the compile-tax argument the exact figure is making.
4. [P2] "for reasoning-augmented constrained decoding on GSM-Symbolic (Qwen2.5-Math-7B)" (§13.5).
   Replacement: "on GSM-Symbolic (Qwen2.5-Math-7B-Instruct)".
   Why: the digest attributes the 29%/38% numbers to the -Instruct variant; the base 7B is a different model, so the citation names the wrong variant.
5. [P2] "graded identical GPT-3.5 Turbo GSM8K outputs with a strict regex and a tolerant parser: 43.7% versus 75.5%" (§13.5).
   Replacement: "with a strict regex and an LLM-based parser: 43.7% versus 75.5%".
   Why: the digest attributes 75.5% specifically to an LLM parser; "tolerant parser" is the chapter's generalization, not the instrument that produced the measured number.

Counts: P0 = 0 · P1 = 1 · P2 = 4
Verdict: MINOR
````