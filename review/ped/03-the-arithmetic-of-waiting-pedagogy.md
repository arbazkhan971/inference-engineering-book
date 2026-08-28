# Pedagogy audit — Chapter 3: The arithmetic of waiting

audited: 2026-08-28 · lens: beginner simulation (smart 25-year-old non-engineer, cold read) · auditor: glm-5.3-flash worker

Method: read STYLE.md, then walked the chapter as a non-engineer, section by
section, logging every point of departure from comprehension. Tags: **[LOST]**
beginner abandons the chapter here; **[CONFUSING]** beginner recovers with
effort or by rereading; **[POLISH]** smooth once noticed.

## Findings

1. **[LOST] The opening spends the jargon budget before the entrance ramp exists.**
   Quote: *"performs roughly one petaFLOP of arithmetic per second — a quadrillion floating-point operations in BF16 (bfloat16, the 2-byte number format) dense mode: 989.5 TFLOPS, trillion operations per second"*
   A non-engineer meets petaFLOP, quadrillion, BF16, dense mode, and TFLOPS in one sentence — before section 3.1's table, which exists precisely for this reader. The number 989.5 has no anchor (is that a lot? compared to what?). Fix: open the mysteries in plain words ("the chip can do about a thousand trillion tiny calculations per second — far more than any reply ever uses") and push the BF16/TFLOPS/dense-mode stack into 3.2 where the table has already armed the reader. At minimum, move the parentheticals out of sentence one.

2. **[LOST] The FlashAttention mechanics sentence is unbroken CS symbolism.**
   Quote: *"tiles the queries, keys, and values into blocks sized to fit on-chip SRAM and maintains a running softmax normalization as blocks stream through — the online-softmax trick"*
   Queries, keys, values, and softmax are never defined anywhere in this chapter; "tiles" is carpentry jargon repurposed without gloss. The chapter's own Feynman rule (plain words first, term second) is inverted here: the analogy ("the answer is accumulated on the counter") arrives after the formalism. Fix: one bridge sentence before this one — "attention's working notes (called queries, keys, and values) are chopped into batches small enough to fit on the counter" — and delete or gloss "softmax normalization" ("a running re-balancing of scores"). The paragraph's excellent takeaway needs the reader to arrive at it.

3. **[CONFUSING] "2:4 sparsity" parenthetical assumes datasheet literacy.**
   Quote: *"(the 1,979 TFLOPS headline includes 2:4 sparsity — halve it for dense work)"*
   "2:4 sparsity" is never explained; the beginner must trust that halving is right. Fix: "(the 1,979 TFLOPS headline counts a shortcut that throws away half the numbers — real dense math is about half that)" or drop the parenthetical entirely; the dense number is the only one used.

4. **[CONFUSING] The chapter's most load-bearing noun — "weights" — is missing from the Words-before-machinery table.**
   Quote (3.2): *"each decode step must consult essentially every weight the model owns. Llama-3-class 8B models ship ~16 GB of weights in BF16 (2 bytes per parameter…)"*
   "Weights" appears dozens of times and anchors every division in the chapter ("weight bytes", "weight pass", "weight traffic"); "parameter" and the "8B = 8 billion parameters" convention are likewise never plain-defined. The 3.1 table covers the roofline's vocabulary but not the model's. Fix: add two rows — *Weights / the model's learned knowledge stored as numbers / the recipe book the chef memorized* and *Parameter / one of those learned numbers / one memorized recipe-step* — and gloss "8B" at first use ("8 billion parameters").

5. **[CONFUSING] The 0.3% derivation is compressed below the reader's tracking ability.**
   Quote: *"Two FLOPs of useful work per 2-byte weight, against a machine that can sustain ~295 FLOPs per byte at peak (derived next section): batch-1 decode runs at about 0.3% of peak compute."*
   The reader must hold "1 FLOP per byte vs 295" and do 1/295 ≈ 0.34% themselves, before the ratio has been taught. Fix: "(1 FLOP per byte ÷ 295 FLOPs per byte ≈ 0.3%)" — show the division; it is the chapter's own signature move and takes one line.

6. **[CONFUSING] Scientific notation and an unexplained model size appear together in one derivation.**
   Quote: *"a 13B BF16 model at batch 1 needs 26 GB per token at intensity 1, so its ceiling is bandwidth ÷ bytes = 3.35e12 ÷ 26e9 ≈ 129 tokens/s"*
   Three stumbles in one line: `3.35e12`/`26e9` is the chapter's first e-notation (everywhere else writes TB/s and GB), the 13B model appears nowhere else (8B and 70B were the running examples), and the 26 GB is given, not derived (13 billion × 2 bytes is never shown). Fix: "(a 13-billion-parameter model in 2-byte precision owns 26 GB: 13 × 2 = 26)" and write the division in the chapter's established units: "3.35 TB/s ÷ 26 GB ≈ 129 tokens/s".

7. **[CONFUSING] "Kernel" is used repeatedly and never defined.**
   Quote (first use): *"real kernels achieve roughly 60–80% of datasheet bandwidth"*
   Also "however clever the kernel", "The roofline models a kernel, not a request", "eager-mode". A non-engineer has no picture for kernel at all. Fix: one inline gloss at first use — "the small programs (kernels) the engine runs on the chip" — or a Words-table row (*Kernel / one small program the engine runs on the chip / one recipe executed start to finish*).

8. **[CONFUSING] The attention-cost formula introduces three unexplained symbols.**
   Quote: *"an N×N grid of relationships per layer, costing O(N²·d) where d is the head dimension"* and *"c · N² + c · (N·M + M²/2)"*
   "Layer" (of a model), "head dimension", and big-O notation are all new here; "c bundles head-count constants" tells the reader what they may ignore but not what d means. The party ELI5 beautifully carries the *idea*; the formalism then outruns it. Fix: gloss inline — "(N×N across each of the model's dozens of stacked processing layers, each doing the same scoring)" and either drop "·d" from the inline formula or add "where d, the width of one attention lane, is a constant you can ignore here." State plainly: "O(N²) just means: grows with the square."

9. **[CONFUSING] 128k becomes 131,072 without a word.**
   Quote: *"a single 128k-token prompt parks ~144 KiB × 131,072 ≈ 18 GB"*
   The switch from "128k" to "131,072" is the binary-k convention, never stated. Fix: "128k really means 131,072 (k = 1,024 in this business)" — one parenthetical, once, and the beginner stops suspecting a typo.

10. **[CONFUSING] The Gemini pricing box nests archival corrections inside parentheticals.**
    Quote: *"the tiered table was archived 2025-06-21 and verified still in place 2026-08-27 … the $0.075/$0.15 input rates at the top of this box are the archived 2025 tier"*
    A parenthetical correcting another parenthetical inside a dated box — the beginner rereads three times to learn which rates are current. Fix: restructure the box as two short paragraphs — "The structure (durable): a 2× step at the context boundary. The rates (decaying): archived 2025 tier …, mid-2026 tier …" — and delete the self-referencing parenthetical.

11. **[CONFUSING] TTFT and TPOT are load-bearing here but absent from this chapter's table.**
    Quote (3.8 Field note): *"TPOT on one product leg roughly doubled while TTFT stayed flat"*
    Chapter 2 defines them; a standalone or skim-reading beginner hitting the field note has no gloss. The field note's diagnostic power depends on knowing which clock is which. Fix: two Words-table rows (*TTFT / wait until the first piece of the reply / time from ordering until the first plate lands*; *TPOT / the rhythm between pieces / gap between plates*) — or one parenthetical at the field note ("TPOT, the per-token rhythm; TTFT, the wait for the first token").

12. **[POLISH] "tensor cores busy" — named hardware, no gloss.** Fix: "the chip's specialized matrix-math units stay busy" or delete; the sentence works without it.

13. **[POLISH] Unit-family mix: KiB/MiB/GiB vs KB/MB/GB.** The KV math uses binary units while weights use decimal (320 KiB vs 70 GB); a careful reader wonders if the crossover arithmetic is apples-to-apples (it is — both binary in the actual division, but the table text mixes). Fix: one footnote — "memory sizes here are binary units (1 KiB = 1,024 bytes); we write GB loosely for both" — or normalize to one family in this chapter.

14. **[POLISH] "service-level objective" used before its expansion.** Quote: *"until per-token latency crosses your service-level objective"*. First use in the chapter; SLO is a Part III staple but is bare here. Fix: "your service-level objective — the worst latency you promised users".

15. **[POLISH] "4-bit quantization" forward-used before chapter 9 defines it.** The context ("shrunk to roughly 35–40 GB") carries the idea; one word would seal it: "shrunk by 4-bit packing — fewer bytes per weight (chapter 9)".

16. **[POLISH] "eager-mode overheads" in Where-the-picture-stops is unglossed jargon.** Fix: "step-by-step execution overheads" or delete — the sentence's point survives without it.

17. **[POLISH] "PaLM 540B" and "Llama 3" named with no one-word context.** A non-engineer doesn't know these are famously large models. Fix: "Google's PaLM (a 540-billion-parameter model)" and "Meta's Llama 3" already say it; add "(billion-parameter scale)" once where 540B first appears.

18. **[POLISH] The 61× is asserted, not divided.** Quote: *"8² = 64×, exactly 61× with real token counts (derived)"*. Fix: show it once — "(1,000,000 ÷ 128,000)² ≈ 61" — matching the chapter's show-the-division habit.

19. **[POLISH] GEMM's "rows" lacks an antecedent.** Quote: *"processes many rows at once"*. Rows of what? Fix: "processes many tokens' rows at once" — one word ties it to the reader's mental model.

20. **[POLISH] "BERT-large" and "GPT-2" appear in the FlashAttention results with no context.** Named-entity tolerance applies, but one clause helps: "on two well-known models of the era". Lowest priority.

## Section grades (1–5; 5 = a beginner could teach it back)

| Section | Grade | One-line reason |
|---|---|---|
| Opening (pre-3.1) | 2 | Jargon stack before the ramp; mysteries themselves are well chosen |
| 3.1 Words before machinery | 4 | Strong ramp; missing weights/parameter/kernel/TTFT/TPOT rows |
| 3.2 Two ways to be slow | 4 | Kitchen ELI5 lands; divisions shown; 0.3% compressed |
| 3.3 One ratio | 5 | Best-laddered section: 2P/2P shown, GEMM/GEMV bracketed by pictures |
| 3.4 The roofline | 3 | Shower ELI5 + formula excellent; e-notation, 13B-from-nowhere, "kernel" |
| 3.5 The batch dial | 4 | Bus ELI5 + crossover arithmetic genuinely followable |
| 3.6 Non-linear cost | 3 | Party ELI5 is the chapter's best; formula outruns it; dense pricing box |
| 3.7 The pyramid | 3 | Tiers land cleanly; FlashAttention mechanics is the jargon peak |
| 3.8 What it buys you | 4 | Compresses honestly; the 6pm field note is the best teaching artifact |
| Where the picture stops | 5 | Model of the form: honest, specific, glossed |
| Checkpoint | 4 | Answerable from the chapter; Q2/Q3/Q5 well calibrated |
| Build/Break/Prove/See | 4 | Concrete and doable; "roofline card" is a keeper |

**Average: 3.75 / 5.**

## The three worst teaching gaps

1. **The entrance ramp doesn't cover this chapter's actual machinery vocabulary.** "Weights," "parameter," "kernel," TTFT, and TPOT are used dozens of times — the divisions the chapter teaches literally divide *weight bytes* — yet none is in the 3.1 table, which covers only the roofline's nouns. The reader is armed for section 3.4 and unarmed for 3.2.
2. **The chapter opens by spending its jargon budget before the ramp exists** (petaFLOP/BF16/dense-mode/TFLOPS in sentence one; 2:4 sparsity shortly after). The exact reader the ramp was built for bounces at paragraph one and may never reach it.
3. **Two formalism peaks invert the Feynman ladder**: the O(N²·d)/c·N² formula (3.6) and the FlashAttention sentence (3.7) deliver raw symbolism before their (excellent, already-written) plain-words pictures. Reordering — picture sentence first, symbols after, with the suggested one-line bridges — converts both from [LOST]/[CONFUSING] to teachable.

Overall: the analogy system (chefs/stairs, bus, party, shower, pyramid) is genuinely strong and consistent; the derivations that ARE shown (2P/2P, 16 GB ÷ 3.35 TB/s, 70 ÷ 10 ≈ 7) prove the method works. The gaps are all fixable with one-line glosses and two reorders; none requires restructuring.
