# Appendix C — beginner-simulation + teaching audit

audited: 2026-08-28 · auditor: glm-5.3-flash (worker, beginner-simulation protocol)
Method: STYLE.md pedagogy rules applied to a cold read of `manuscript/appendix-c-provider-matrix.md`, simulating a smart 25-year-old non-engineer who jumps straight to the matrix for lookup. Scale: 1 (unusable alone) – 5 (self-teaching). ELI5/closer frame is N/A for appendices by design (lint exemption + banner says so); acronym-at-first-use and no-acronym-stack rules are in force and drive the top findings.

## Findings

### LOST — a cold reader stops here

1. **[LOST] C.4 meter-acronym wall.** The Metrics row opens with `RPM, TPM, RPD, IPM, audio-min` and `ITPM, OTPM` with no expansions anywhere in the appendix. Six+ stacked acronyms is exactly STYLE's forbidden "acronym stack," and a layman cannot even distinguish TPM from ITPM without chapter 15. *Fix:* one legend line above the table — "RPM requests/minute · TPM tokens/minute · the I/O prefix means input/output tokens · D per day" — three lines of print, converts the section from chapter-dependency to self-service.

2. **[LOST] C.4 "output × burndown (15× Claude 4.8; 10× Sonnet 5…)".** The word "burndown" and the mechanism (output tokens counted against quota at N× their number) are never explained at reference distance. A beginner reads "15×" as a price and is wrong. *Fix:* one plain clause — "providers count each output token against quota as if it were up to 15 tokens ('burndown'); the multiplier is per family" — or a pointer "(chapter 15's reservation arithmetic)".

3. **[LOST] C.5 "key order = emission order (first-in-`required` is community folklore, hedged)".** Insider sentence: three concepts (required-key ordering, emission order, hedged folklore) compressed into one parenthetical. A non-engineer cannot parse it; even a developer needs the folklore's referent. *Fix:* either expand — "fields seem to arrive in the order you list them in `required`; treat that as folklore, not contract" — or cut the parenthetical; the cell's contract point survives without it.

### CONFUSING — survives, but stumbles

4. **[CONFUSING] C.2 long-context cells "$8.00/$30.00".** The two-number convention (input/output above the tier threshold, $in/$out) is never stated; gpt-5.5's note defines the *threshold* but not the cell format. A beginner reads a range or a pair of alternatives. *Fix:* one sentence under the C.2 header: "Long-context cells show $input/$output once a request crosses the threshold."

5. **[CONFUSING] C.2 DeepSeek "Input (miss) / Input (hit)" columns.** Cache miss/hit is C.3's subject, used two sections early in a table built for jump-in lookups. *Fix:* parenthetical in the column head or a footnote — "miss = first send (fresh price); hit = re-send at the cached price — see C.3".

6. **[CONFUSING] C.2 "regional residency adds 10% on OpenAI models released 2026-03-05 or later".** "Regional residency" (data-stays-in-region option) is defined nowhere in the appendix; it reads like a location-based tax on the reader. *Fix:* "(the keep-data-in-region option)".

7. **[CONFUSING] C.3 "20-block lookback"** in the Traps row. Jargon with no gloss at any distance; only a chapter-14 reader knows blocks are counted back from the end when matching breakpoints. *Fix:* "(the server matches your breakpoints against only the last 20 content blocks)".

8. **[CONFUSING] C.3 ">~15 req/min can overflow-route to a miss".** "Overflow-route" is verb jargon; the failure (your cached request gets routed to a cold copy under load) is teachable in plain words. *Fix:* "above roughly 15 requests/minute, load balancing can send your request to a machine that lacks your cache — a surprise miss".

9. **[CONFUSING] C.4 "`max(max_tokens, char-estimate)`".** Code-shaped and unglossed; the plain idea (they reserve the larger of your declared maximum and a character-count guess) is one clause. *Fix:* gloss it inline in plain words.

10. **[CONFUSING] C.4 snapshot "36,000 booked → 9,000 final".** Booked/final maps to reservation-vs-re-credited only if you already know ch15's worked example. *Fix:* "(reserved up front → counted after re-credit)".

11. **[CONFUSING] C.8 "Size budgets from your own battery at min(quality, tier, KV)".** "Battery," the `min()` over three constraints, and "KV" (unexpanded here) make the closing advice unusable for exactly the reader who needs closing advice. *Fix:* "budget from your own test suite at the smallest of: the quality your tests show, the tier the provider prices, and the memory the KV cache allows (chapter 4)" — or delete the sentence and keep the RULER warning.

12. **[CONFUSING] C.6 "SSE" unexpanded.** STYLE hard rule: acronyms expanded at first use; in appendix-first-use scope this is the violation that matters most in C.6. *Fix:* "SSE (server-sent events)" in the first Transport cell or a legend line.

13. **[CONFUSING] C.5 "<40% for prompting".** Percent of what — schema adherence when you merely ask for JSON in the prompt — is implied by contrast, not stated. *Fix:* "(prompting alone: under 40% adherence in the same eval)".

14. **[CONFUSING] C.9 "the mid-tier blended figure the crossover used, $0.60/1M".** "Crossover" is a chapter-18 analysis used as a noun without a pointer; same class as C.8's "battery". *Fix:* "(chapter 18's rent-vs-serve break-even)".

### POLISH — better with one word

15. **[POLISH] C.2 off-peak never defined.** "Off-peak exactly half price" is unusable without the UTC window (DeepSeek publishes it). Add the hours.
16. **[POLISH] C.3 legend line.** The four-contract table would read friendlier with "each Opt-in cell names the provider's configuration knob" — one line above.
17. **[POLISH] C.6 "pings legal anywhere"** → "(keep-alive events) legal anywhere".
18. **[POLISH] C.7 "sheddable"** → gloss "(dropped first under load)".
19. **[POLISH] C.9 "could not be auto-extracted on 2026-08-27 (JavaScript-rendered)".** Authoring-process talk, not reader-facing. Reword: "the leaderboard's numbers are only as current as its published version — treat rankings as a snapshot of a snapshot" (the second half already says this well; the tooling detail can go).
20. **[POLISH] C.8 RULER gloss** — "(the context-quality benchmark, chapter 11)" at first mention.
21. **[POLISH] C.5 `tool_choice: {type:"tool"}`** — gloss "force the model to answer by calling that tool".

## Section grades

| Section | Grade | One-line reason |
|---|---|---|
| C.1 How to read | 4.0 | Clear contract; "config" is the only stretch |
| C.2 Prices | 3.0 | Implicit conventions ($in/$out cells, miss/hit, off-peak) punish jump-in readers |
| C.3 Cache semantics | 3.0 | Great break-even line; trap cells carry unglossed jargon |
| C.4 Rate-limit meters | 2.5 | Acronym wall + burndown make it chapter-15-dependent — worst section alone |
| C.5 Structured-output tiers | 3.5 | Clear ladder + "silently ignored" teaches; one insider sentence lost |
| C.6 Streaming surfaces | 3.0 | Good plain rows; SSE + "per choice" + pings unexpanded |
| C.7 Batch/priority | 4.0 | Routing heuristic is genuinely self-teaching |
| C.8 Context windows | 3.0 | Strong opening aphorism; closing min() formula collapses it |
| C.9 Same weights | 4.0 | Concrete spreads scaffold well; two chapter-nouns unglossed |
| C.10 Re-dating | 5.0 | Four clocks + closing bug-contract is reference-writing at its best |

**Average: 3.5 / 5**

## Three worst teaching gaps

1. **C.4 is unusable alone** (acronym wall + burndown). It is the section a business reader is most likely to jump to (quotas = money), and today it requires chapter 15 first. A legend plus one plain sentence fixes 80% of the gap.
2. **C.2's unstated conventions.** Lookup tables must self-annotate; the two-number long-context cell, miss/hit columns before C.3, and undefined off-peak window each cost a cold reader a re-read or a wrong number.
3. **Chapter-nouns as shorthand.** "Crossover," "battery," "metering," "reservation" lean on chapter vocabulary without pointer-glosses; the banner promises "the chapters own the teaching, this page owns the lookup," but the lookup keeps borrowing un-glossed teaching vocabulary.

## What already teaches well (keep, do not polish away)

- The banner + C.1's re-dating contract; C.10's "the page wins / that is a bug in the book" closing.
- C.3's "one read repays the 1.25× write; two repay the 2×."
- C.5's "silently ignored — a constraint you think you have, you may not" and the none-guarantee footer.
- C.7's "if the harness would retry rather than time out, it can batch."
- C.8's "Claimed is admission; effective is quality."
- C.9's concrete spreads (8.3×, named hosts, prices with dates).
