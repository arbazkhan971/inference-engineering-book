# Pedagogy audit — ch05 "Batches: the engine's trick"

audited: 2026-08-28 · auditor: glm-5.3-flash (worker, beginner-simulation protocol)
Persona: smart 25-year-old non-engineer (uses AI tools daily; no code, no stats beyond school).

## What landed (keep)

The charter → shuttle → city-bus ladder is the chapter's spine and it teaches cleanly; the ASCII static-vs-continuous comparison is followable without any math; the restaurant ELI5 for goodput is the chapter's best single paragraph ("true and useless"); the field note is concrete, honest, and re-teaches the whole trade; `Where the picture stops` bills the bus analogy honestly (luggage growth, invisible strangers, the free region, scheduler-vs-bus); every illustrative number is labeled illustrative.

## Findings

1. **[CONFUSING]** Opening: "At 6 pm, TPOT (time per output token) on one product leg roughly doubled while TTFT (time to first token) stayed flat, and the fix was cutting concurrency."
   *Why:* "product leg" is internal jargon; "concurrency" is load-bearing here but defined only implicitly in 5.7.
   *Fix:* "…on one of our products roughly doubled … and the fix was cutting concurrency — running fewer of our requests at the same time."

2. **[CONFUSING]** "arithmetic intensity rises with batch size. That was physics."
   *Why:* bare chapter-3 term; a cold reader cannot attach meaning, and it justifies everything that follows.
   *Fix:* gloss at use: "arithmetic intensity (how much useful math each byte of model-reading buys)".

3. **[CONFUSING]** "The expensive resource — the weight streaming of chapter 3 — is being paid in full on every step"
   *Why:* "weight streaming" arrives unglossed; second bare ch-3 dependency in two pages.
   *Fix:* "the expensive resource — reading the model's whole memory every step, chapter 3's cost — is being paid in full…"

4. **[CONFUSING]** 5.2: "**pads** them to the same length so their tensors stack"
   *Why:* "tensors" is never defined in the chapter or the Words-before-machinery table; the only truly unsupported technical noun for this persona.
   *Fix:* "…so they stack into one uniform block of numbers" (or add a tensor row to the 5.1 table).

5. **[CONFUSING]** 5.4: "naively stacking ragged sequences into one tensor is awkward … attention runs per-sequence over each rider's own cache"
   *Why:* "attention" is undefined in-chapter (ch2/4 territory); the sentence still conveys the shape, but the reader is asked to trust an unnamed mechanism at the chapter's one mechanical wrinkle.
   *Fix:* "…the lookup step that consults each rider's own conversation history (attention, chapter 2) runs per-sequence…"

6. **[LOST]** 5.5: "Classical queueing theory (the M/G/1 model …) gives the mean wait as E[W] = λ·E[S²] ÷ (2·(1−ρ)), where ρ (utilization) is offered load divided by capacity."
   *Why:* this is the climax mechanism — the "why 6 pm happens" promise — and it is the chapter's least accessible moment: λ is never glossed, E[S²] is explained only a page later, and the symbols arrive before any plain-words reading. The excellent cliff table and E[S²] story come *after* the freeze point; many lay readers skip the subsection and lose the mechanism the chapter exists to deliver.
   *Fix:* insert one plain-words sentence immediately under the formula: "Read it as: your wait grows with how fast requests arrive (λ), with the *square* of how uneven request lengths are — a few very long jobs hurt more than many short ones (E[S²]) — and it explodes as utilization approaches 100%." Then keep the table.

7. **[CONFUSING]** Table header: "Mean system time multiplier 1/(1−ρ), M/M/1 form"
   *Why:* "M/M/1" appears with no gloss one paragraph after M/G/1 was named; and "system time" silently switches from the prose's "queue delay" (system time = wait + your own service).
   *Fix:* header → "Mean wait multiplier (the same math, simplified arrival assumptions)"; add a half-line: "system time = your wait plus your own service."

8. **[CONFUSING]** The ITL/TPOT naming dance inside the dated box: "'ITL' — inter-token latency, the clock chapter 2 defined as TPOT's twin … in this book's vocabulary the dashboard's ITL is your TPOT."
   *Why:* the reader is holding two clocks (TTFT, TPOT); mid-analysis a third name appears for the second clock, at the exact moment they're also parsing benchmark numbers. Naming whiplash at the evidence.
   *Fix:* bold mini-equation on its own line: "ITL = TPOT — same clock; the dashboard's name vs yours." (The later lever table can repeat it.)

9. **[POLISH]** "a queue in front of a stage whose internal granularity is too coarse"
   *Why:* abstract systems phrasing in an otherwise analogical chapter.
   *Fix:* "a coat check that only moves all coats at once — a faster door, the same lockstep inside."

10. **[POLISH]** 5.5 switches vehicle from city bus to carpool without a bridge; carpools carry acquaintances, the chapter's riders are strangers.
    *Fix:* one clause: "The city bus again — or if you like, a carpool of strangers."

11. **[POLISH]** "shed load *multiplicatively*"
    *Why:* ops jargon; the one word a beginner cannot act on.
    *Fix:* "cut your in-flight requests by half or more each time attainment drops."

12. **[POLISH]** ASCII block: "A finishes at t=4... but the batch runs until t=32: A's answer is held ~28 idle steps"
    *Why:* the mid-block "..." reads like a typo, and the t= axis (engine iterations) is only implied.
    *Fix:* move the note below the block as a full sentence: "A finishes at iteration 4, but the batch runs until iteration 32."

13. **[POLISH]** "Here is the promissory note chapter 3 left you, come due."
    *Why:* finance metaphor; slight speed bump for a non-finance reader. Series voice though — acceptable.
    *Fix (optional):* "Here is the promise chapter 3 left you — now due."

## Section grades (1–5; 5 = a beginner could teach it back)

| Section | Grade |
|---|---|
| 5.1 Words before machinery | 5 |
| 5.2 Static batching | 4 |
| 5.3 Dynamic batching | 5 |
| 5.4 The trick: replan every iteration | 4 |
| 5.5 The trade / saturation | 3 |
| 5.6 Goodput | 5 |
| 5.7 What you control from the harness | 4 |
| Where the picture stops | 5 |
| Checkpoint | 4 |
| Build it / Break it / Prove it / See it | 4 |

**Average: 4.3 / 5.**

## Three worst teaching gaps

1. **The queueing formula wall (finding 6).** The chapter's promise — *why* the 6 pm slowdown happens — peaks at its least teachable moment. The plain-words reading must precede the symbols, and λ needs a gloss like ρ got. With that one sentence, 5.5 goes from the chapter's weakest section to its payoff.
2. **Unglossed chapter-3 dependencies (findings 2, 3).** "Arithmetic intensity", "weight streaming", and the bare "roofline" reference assume the previous chapter is fresh. A one-clause gloss at each point of use preserves the cold-reader through-line — "why batching pays" is the license for everything after.
3. **Provider-clock vocabulary whiplash (finding 8).** TTFT/TPOT/ITL swap mid-evidence. One bolded "ITL = TPOT" line at first mention removes the only moment a beginner must track a third name for a clock they already hold.
