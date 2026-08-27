## Review

All frame checks pass: 5 ELI5 blocks (jargon-free), `Where the picture stops` present (5 concrete breaks), all four closers (`### Build it` / `### Break it` / `### Prove it` / `### See it in the wild`), H2s numbered 1.1–1.8 with frame H2s unnumbered exactly as in ch2–ch12, `Words before machinery` table with 13 rows, title + Part I context quote, grayscale-safe mermaid, no vendor marketing ("state-of-the-art" appears only inside the quoted Fireworks job ad in a dated box), and scope matches CHAPTER_MAP ch1 (three layers ✓, ownership test ✓, request lifecycle ✓, vocabulary map ✓).

Numbers: I traced 28 claims across 8 dated digests (all `researched/retrieved 2026-08-27`), including the Telnyx definition quote, Anyscale/Together/Fireworks job postings, PaLM 46.2%/6,144 TPU v4, Llama 3 41–43%/8,192–16,384 GPUs, Pope 29 ms/token, H100 3.35 TB/s, the derived 16 GB → 4.8 ms → ~208 tok/s box (correctly labeled "derived, not a benchmark"), vLLM 2–4×, the Artificial Analysis tables (8.3×, TTFT inversion, 2.7×, 6.1× — ratios recompute correctly from the quoted values), FP8/INT4 findings, both Anthropic incidents and the OpenAI model-scoped incident, SRE retry math (just under 3× / 1.1×), spend-cap 429 semantics, SDK retry defaults, TLS round trips, the Anthropic SSE event sequence, Orca OSDI 2022, Sarathi-Serve 2024, "Lost in the Middle," and context rot. All verbatim quotes match their digests character-for-character.

Three P1s and two P2s survive; all are surgical fixes. No write-capable tool is available in this session, so the complete `review/ch01-gate2.md` artifact is returned below for persistence (the `review/` directory does not yet exist in the repo root).

````markdown
# Gate 2 — Technical editor review: Chapter 1 (What inference engineering is)

Reviewer: Gate 2 (technical editor) subagent · Review date: 2026-08-27
Inputs: manuscript/01-what-inference-engineering-is.md against STYLE.md,
EDITORIAL_SYSTEM.md, GOAL.md, CHAPTER_MAP.md, and research/ digests.
Read-only review; manuscript and research untouched.

## Checks performed (evidence)

1. **Number tracing — 28 spot-checks across 8 dated digests; all trace.**
   - Telnyx definition quote, Pragmatic Engineer (Feb 12, 2026), Anyscale
     (May 2026, $170k–$245k, SF), Together AI (Jul 2026), Fireworks, Chip
     Huyen lever list, vLLM 2–4× → `research/inference-engineering-discipline.md`.
   - PaLM 46.2% MFU / 6,144 TPU v4; Llama 3 41–43% BF16 on 8,192–16,384
     GPUs; Pope et al. 29 ms/token; H100 SXM 3.35 TB/s; derived 16 GB ÷
     3.35 TB/s ≈ 4.8 ms → ~208 tok/s → `research/inference-vs-training.md`
     (the chapter's box is correctly labeled "derived, not a benchmark").
   - Artificial Analysis Llama 4 Scout 446.7/172.0/152.8/53.5 (8.3×), TTFT
     0.57/0.72/0.75/0.80 s, $0.12 vs $0.33 (2.7×), DeepSeek R1 0528 6.1×/6.1×
     ($0.56 vs $3.40; 154.8 vs 25.6), FP8 lossless (arXiv 2411.02355,
     500k+ evals), SemiAnalysis ~18%, AIMultiple INT4 2.7×/−8 pts →
     `research/same-model-different-providers.md`; all ratios recompute from
     the quoted values (8.35×, 2.75×, 6.05×, 6.07×, 4.78 ms).
   - Anthropic 2026-08-16 ~36 min (21:58–22:34 UTC) and 2026-08-20 ~26 min;
     OpenAI gpt 5.1 mini / gpt 4.1 mini resolved 2026-07-27; "maximum allowed
     usage, not guaranteed minimums"; spend-cap 429 with no `retry-after`;
     SDK default 2 retries; context rot (2025-09-29); Lost in the Middle
     (TACL 2023); SRE 3-attempt → just under 3×, 10% ratio → 1.1× →
     `research/failure-ownership-by-layer.md`, `research/429-529-retry-behavior.md`.
   - TLS 1.3 = 1 RTT / 1.2 = 2 RTT / ~0 resumption; Orca OSDI 2022;
     Sarathi-Serve 2024; Anthropic SSE sequence incl. `content_block_stop`;
     queue-time hedge "no public number found as of 2026-08-27";
     `usage`-as-billing-interface and stop-reason-as-exit-code; the three
     dominant API contracts → `research/lifecycle-of-an-llm-request.md`,
     `research/provider-api-anatomy.md`.
2. **Frame:** 5 ELI5 blocks (§§1.2, 1.3, 1.4, 1.5, 1.7), jargon-free;
   `Where the picture stops` present; all four closers present with
   lint-compatible exact headings; `Words before machinery` table has 13
   term rows (lint requires ≥5 for chapters 01–04).
3. **Structure:** H2s numbered 1.1–1.8; `Where the picture stops`,
   `Checkpoint`, and the closer H2s unnumbered — identical to the convention
   in ch2–ch12. File starts with `# 1. …` + Part I context quote per STYLE.md.
4. **Scope vs CHAPTER_MAP ch1:** model vs serving vs harness ✓; who owns
   which failure ✓; request lifecycle end to end ✓; vocabulary map of the
   book ✓ (§1.1 table + §1.8 route map, which matches the chapter map's
   part/chapter list). §1.2, §1.4, §1.7 are supportive extensions, no drift.
5. **Marketing language:** none. Cross-chapter consistency holds ("timestamp
   in a system prompt" matches ch6's field note; WtPS "8×/6×" are hedged
   roundings of the same 2026-08-27 snapshot).

## Findings

1. **[P1] False mechanism: "deterministic" — manuscript/01-what-inference-engineering-is.md:49 (§1.3, model layer).**
   Current text: "No quantity of retries, capacity, or routing changes these
   outputs, because the computation is deterministic given the same prompt."
   Replacement: "No quantity of retries, capacity, or routing fixes these
   outputs — a rerun only resamples the noise, and noise is not what the
   weights lack."
   Why: provider chat APIs default to temperature 1, so identical prompts
   sample different outputs. Chapter 8's own Where-the-picture-stops states
   "at temperature above 0, two runs of the *same* un-speculated engine
   already differ." The ownership conclusion stands, but the stated
   justification is false and contradicts a sibling chapter. One-sentence fix.

2. **[P1] Snapshot benchmark numbers in the durable-prose spine — manuscript/01-what-inference-engineering-is.md:166 (§1.7).**
   Current text: "in the precision they serve (one host's \"Llama\" is FP8
   while another's is BF16 — and FP8 is measurably near-lossless while being
   ~18% faster and cheaper per token on the same chip, per SemiAnalysis
   InferenceX and Databricks' half-million-evaluation study, retrieved
   2026-08-27; push all the way to 4-bit and quality can bend — one
   single-H100 benchmark measured INT4 running 2.7× faster than BF16 while
   dropping ~8 points on a code-generation benchmark, AIMultiple, retrieved
   2026-08-27), in batching policy …"
   Replacement: shorten the frame clause to "in the precision they serve
   (one host's \"Llama\" is FP8 while another's is BF16 — see the snapshot
   below), in batching policy (more batching raises throughput and queueing
   together), and in margin", and move the FP8/INT4 numbers into a dated box
   (the section already models the pattern two paragraphs up).
   Why: STYLE.md hard rule — "Pricing, rate limits, benchmark results live
   in dated boxes/sidebars, never in the durable-prose spine" (front matter
   repeats it: "dated snapshots — clearly marked"). These are current-market
   benchmark results buried in a triple-nested parenthetical, and the
   attribution blurs two sources: near-losslessness is the Databricks study
   (arXiv 2411.02355); the ~18% figure is SemiAnalysis InferenceX. Numbers
   stay identical; only their home and attribution change.

3. **[P1] Acronyms unexpanded at first use — manuscript/01-what-inference-engineering-is.md:5, 43, 96/100, 101, 148, 150.**
   Current text (first uses): "the fleet of GPUs" and "your HTTP request"
   (line 5); "you design the system *around* the API" (line 43); "serialize
   the JSON" (line 96) / "Your SDK encodes … as JSON" (line 100); "DNS, a
   TCP handshake" (line 101); "21:58–22:34 UTC" (line 148); "Google's SRE
   book" (line 150).
   Replacement: parenthetical expansions at first use, matching the series'
   own convention — "GPUs (graphics processing unit)", "HTTP (hypertext
   transfer protocol)", "API (application programming interface)", "SDK
   (software development kit)", "DNS (domain name system)", "TCP
   (transmission control protocol)", "SRE (site reliability engineering)",
   "JSON (JavaScript Object Notation)" (ch8 expands JSON exactly this way);
   for UTC, either expand or agree it is glossary-level, and apply the
   decision book-wide.
   Why: STYLE.md hard rule ("Acronyms expanded at first use") and a named
   item in this gate's checklist. Chapters 3–12 each expand GPU/BF16/JSON/
   HTTP/API at their own first use, so ch1 — the book's opening chapter,
   serving the "complete beginner" rung of the reader ladder — is currently
   the outlier. Related nit: SSE is expanded at line 107, but the 1.3
   mermaid label "HTTP + SSE" (line 68) appears first; either accept diagram
   labels as exempt or expand there too.

4. **[P2] One-directional causality claim vs §1.7's own evidence — manuscript/01-what-inference-engineering-is.md:73 and :192.**
   Current text: "the serving layer cannot make the model hallucinate" (line
   73); "Harness choices induce serving failures and model failures, never
   the reverse." (line 192).
   Replacement: "the serving layer cannot change what the weights know"
   (line 73); optionally add to line 192: "— a provider's stack can degrade
   how the weights express what they know (1.7), but it cannot change what
   they know."
   Why: §1.7 shows serving-layer precision choices bending quality (INT4,
   ~8 points), so the flat "cannot make the model hallucinate / never the
   reverse" is contradicted three sections later inside the same chapter.
   The sharpened wording preserves the ownership test, since "what the
   weights know" is precisely what routing/capacity cannot alter.

5. **[P2] §1.6 — the chapter's centerpiece concept — has no ELI5 on-ramp — manuscript/01-what-inference-engineering-is.md:135.**
   Current text: section opens directly with "Every agent failure lands in
   exactly one of the three layers, and each layer has a near-monopoly on
   its own fix."
   Replacement (optional, two sentences): "> **ELI5:** A package arrives
   late, damaged, or not at all. Check the label on the failure before you
   complain: never shipped (your mistake), stuck at the depot (carrier), or
   the wrong item entirely (factory) — and only one of the three can make
   the failure impossible."
   Why: EDITORIAL_SYSTEM makes the ELI5 frame opt-in beyond
   `Where the picture stops` (the linter requires only ≥1 per chapter, and
   ch1 has 5), so this is not a rule violation — but STYLE.md says every
   major concept opens with an ELI5 block, the ownership test is the concept
   the whole book is built on, and ch2–ch4 open nearly every numbered
   section with one. Cheap, low-risk addition.

## Notes (not findings)

- Residual: the "~18% cheaper" figure mirrors the digest's own rounding;
  recomputed from the digest's quoted prices ($0.40 → $0.34 per 1M) it is
  ~15%. Chapter-vs-digest tracing is satisfied; flag only if the writer
  wants the number self-consistent with the prices quoted beside it.
- Word count is inside the 3,000–5,500 concept-chapter target by inspection;
  run `tools/lint-manuscript.py` at the next gate for the exact figure (this
  reviewer may not execute commands).

**Verdict: MINOR** — three P1s are one-sentence/one-box mechanical fixes; no
structural, factual, or tracing problems.
````

**Counts: P0 = 0 · P1 = 3 · P2 = 2 · Verdict: MINOR**