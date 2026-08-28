# Pedagogy audit — Chapter 18: Your own engine room

audited: 2026-08-28 · auditor: glm-5.3-flash (worker, beginner-simulation protocol)
Standard: smart 25-year-old non-engineer reading cold; findings judged against the book-consistent reader where the chapter is explicitly a finale that recalls prior chapters.

## Findings

1. **[CONFUSING] — 18.2, the "adversarial pass" process leak.** Quote: *"the shipped companion, itemized in Appendix D, lands within a rounding of the sum — the robustness guards added after the adversarial pass pushed a few modules a hair over their tildes"*. A reader has no referent for "the adversarial pass" (it is this book's internal review machinery, not book content) and "over their tildes" decodes only if you notice the table's "~150" estimates. Minimal fix: *"— hardening guards added during the companion's attack testing pushed a few modules slightly over their estimates."* Keeps the honesty, removes the build-log voice from the durable spine.

2. **[CONFUSING] — 18.3, "perplexity" used unglossed.** Quote (dated box): *"Q4_0: ≈ 4.34 GB, +0.4685 perplexity over F16"*. This is the only quality metric in the whole local-stack section and the cold reader cannot interpret it — bigger? smaller? good? Chapter 9 owns the full definition, but the number lands here. Minimal fix, one clause at first use in the intro sentence above the box: *"...put numbers on the trade — size in gigabytes against perplexity, the model's confusion score, where lower is better (chapter 9's full treatment):"*.

3. **[CONFUSING] — 18.1, the "unpurchased" metaphor.** Quote: *"Old friends ride along, unpurchased again: the four-bucket usage events…"*. The purchase metaphor for vocabulary is not established in this chapter (or in the book's teaching-frame vocabulary — the frame says "words before machinery", not "buying words"). A reader stalls on "unpurchased" for a beat before decoding "not re-defined". Minimal fix: *"Old friends ride along without re-introduction:"*.

4. **[CONFUSING] — 18.3, "importance sampling" as unexplained jargon.** Quote: *"I-Quants (IQ1_S through IQ4_NL) that push importance sampling to the lowest bit-widths"*. Statistics jargon with no picture; the neighbouring K-Quants clause gets "mix block sizes to claw back accuracy" (plain), this one gets nothing. Minimal fix: *"...that spend extra effort deciding which weights matter most, to reach the lowest bit-widths"*.

5. **[POLISH] — 18.4, analogy frame switch mid-section.** The section's ELI5 is taxi-vs-van, but its first punchline borrows 18.3's kitchen: *"Renting the GPU for a $6 problem is buying the restaurant because you wanted one dinner."* The restaurant-as-engine mapping survives (rent the kitchen per dish vs buy the kitchen), but within a van section the switch costs a flicker of re-mapping. Minimal fix: *"…is buying the delivery van for one trip to the store."*

6. **[POLISH] — 18.2, the request-path walkthrough is one sentence.** Quote: *"The **prompt assembler** (the session store's renderer) lays the turn out… The loop closes."* — one paragraph, ~100 words, ~15 chapter-callback terms (guarantee tier, lane, split meters, burndown, breaker states…). For the book-consistent reader it is a victory lap; for anyone half-attentive it is a wall. The mermaid diagram right above it has labelled nodes — minimal fix: number the walkthrough steps (1–6) matching the diagram's node order, same prose, broken at node boundaries.

7. **[POLISH] — 18.2 table, ITL abbreviation linkage.** The row spells "inter-token latency" but the formula in the same cell jumps to *"≈ TTFT + (N − 1) × ITL"* without linking the words to the acronym, and N is unbound for a cold reader. Minimal fix: *"the identity e2e (end-to-end) ≈ TTFT + (N−1) × ITL, where N is the reply's token count"* — or expand ITL at first use in the row.

8. **[POLISH] — 18.6, the "sixteen of eighteen" claim wobbles on inspection.** Quote: *"Sixteen of these eighteen chapters were about the third term."* The third term is what the harness wastes — but chapters 2–11 are engine mechanics (batching, KV, paging, quantization), i.e. the *engine-extracts* term as much as the waste term. The claim reads as rhetorical overreach to a sharp reader who starts counting. Minimal fix: *"Most of these eighteen chapters live where the third term is decided."*

9. **[POLISH] — 18.5, checklist callbacks reduce standalone runnability.** The checklist is sold as "what you can actually run", but lines carry unglossed callbacks: *"inject a 429 storm"*, *"p50/p95 TTFT"*, *"K-of-N contract"*, *"the all-open bypass"*. A book-consistent reader has all of these; an operator photocopying the checklist for a colleague does not. Minimal fix: two-word micro-glosses inline — *"429 storm (over-quota rejections)"*, *"p50/p95 (median and 95th-percentile)"*, *"K-of-N contract (succeed if K of N complete)"*.

10. **[CONFUSING] — 18.4, "No SLA but physics."** Verified book-wide: "SLA" appears exactly once in the entire manuscript (this line) and "service-level agreement" is never expanded anywhere, while its cousin SLO is expanded at 18.5 ("SLO (service-level objective)"). So the acronym's only use in the book is unexpanded. Minimal fix: *"No service-level agreement (SLA) but physics."*

11. **[POLISH] — 18.3, quant-ladder name cascade.** F32/F16/BF16/Q4_0–Q8_0/Q2_K–Q8_K/IQ1_S–IQ4_NL/TQ1_0/TQ2_0/MXFP4 in three sentences is the densest name-storm in the chapter. The anchor ("modern default is Q4_K_M") rescues it. Minimal fix: one signpost clause — *"you do not need the names, only the shape of the menu:"* before the list.

## Section grades

| Section | Grade (1–5) | Note |
|---|---|---|
| 18.1 Words before machinery | 4 | Strong table; "unpurchased" stumble |
| 18.2 The assembly | 4 | Best ELI5 in the chapter (bridge/telegraph); walkthrough density + process leak |
| 18.3 Local and edge | 4 | Honest hedged numbers, bandwidth law re-derived; perplexity and name-storm |
| 18.4 Crossover arithmetic | 5 | Exemplary: every step shown, assumptions dated, napkin-method teaching |
| 18.5 Ship checklist | 4 | Genuinely runnable; callback jargon |
| 18.6 Closing manifesto | 5 | Elevator ELI5 lands; the wobble is one clause; strongest close in the book |
| Where the picture stops | 5 | Four specific breaks, "eval farm is the walls" extension earns its keep |
| Checkpoint | 5 | Six questions, all answers derived inline, hedges intact |
| Build/Break/Prove/See | 5 | Distinctive, cadence-tied, "the only new line this chapter adds" is honest |

**Average: 4.44 / 5**

## Three worst teaching gaps

1. **The one metric that prices the local ladder is unintelligible on the page** (finding 2): perplexity carries the whole size-vs-quality trade in 18.3 and gets no gloss — the cold reader meets a wall exactly where the section needs them to make a decision (which rung to download).
2. **The assembly walkthrough doesn't teach composition, it tests recall** (finding 6): the chapter's stated skill is composition — "which is also the skill your day job actually requires" — and then demonstrates it as a single unbroken sentence instead of the numbered walk the diagram already scaffolds.
3. **Editorial machinery is visible in the durable prose** (findings 1 and, mildly, the tilde phrasing): "after the adversarial pass" tells the reader about the book's manufacture, not the engine room; it breaks the contract the front matter set ("check our work" lives in the repo, not the spine).

## Verdict

Teachability: strong. A cold reader is never dead-ended (0 LOST); the five CONFUSING findings are one-clause fixes, and none touches the chapter's arithmetic, which is fully scaffolded and independently re-derivable. The finale's recall-load is a feature executed mostly well; the gaps are polish-depth, not structural.
