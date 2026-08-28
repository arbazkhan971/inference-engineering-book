# Appendix B pedagogy audit — beginner simulation

audited: 2026-08-28 · auditor: glm-5.3-flash (worker, cold-read protocol)
Persona: smart 25-year-old non-engineer, has used ChatGPT, never read the chapters. Protocol: read STYLE.md pedagogy rules, then read `manuscript/appendix-b-arithmetic-cheatsheet.md` cold, walk every card, recompute every number by hand, log every stumble.

**Headline:** the arithmetic is impeccable — I recomputed all 16 worked examples by hand and every one checks (decode identity 5.4 s; roofline ≈214 TFLOP/s; single-stream ~80 tok/s; 18 GiB KV; cache loop $0.645 vs $3.00 = 79%; expiry 12.5×; fleet 2.15× vs 10×; batch $120/$60/$39.75; failure $0.006/$3.00; 30 rps; knee 2×/10×/100×; Little 96; tail 63%; E[progress] 3.36 → 2.8×; crossover $1,073 / 1,790M / 35%). The teaching losses are all in **undefined symbols and unglossed vocabulary at the exact moment a formula needs them** — the deck assumes chapter context precisely where cheat-sheets get used standalone.

## Numbered findings

### [LOST]

1. **[LOST] B.2 "The sharding product" — five unexpanded acronyms in one formula.**
   Quote: `deployment = TP × PP × EP × CP × DP, across t·p·e·c·d chips`
   A cold reader stops dead: five two-letter tokens, none expanded anywhere in the appendix (they live in Ch. 10). This is the only card a motivated beginner genuinely cannot use.
   Minimal fix: `deployment = TP (tensor) × PP (pipeline) × EP (expert) × CP (context) × DP (data) parallelism` — one parenthetical per axis; costs one line.

2. **[LOST] B.1 "The roofline" — "real kernels" is misreadable as the operating-system kernel.**
   Quote: `real kernels hit roughly 60–80% of datasheet bandwidth`
   A non-engineer's only prior for "kernel" is popcorn or Linux; both readings are wrong here (it means the low-level GPU programs doing the math).
   Minimal fix: `real GPU programs (kernels) hit roughly 60–80% of datasheet bandwidth`.

### [CONFUSING]

3. **[CONFUSING] B.3 "The cache loop" — `w` and `r` are used before the constants box defines them.**
   Quote: `the first request writes, the N re-reads read: w + N·r, versus N + 1 uncached (N = reuses)`
   The multipliers live only in the end-of-appendix box; a cold reader hits `w + N·r` with two undefined symbols. The card is the one readers will use first.
   Minimal fix: `(w = the write premium, r = the read discount — both in the constants box at the end; 1.25 and 0.1 mid-2026)`.

4. **[CONFUSING] B.1 "The prefill decomposition" — `c` is never defined.**
   Quote: `attention work ≈ c · (N² + N·M + M²/2)` … `c absorbs kernel efficiencies`
   The reader meets `c` in the formula, and its definition-by-implication only arrives inside the *when-it-lies* paragraph.
   Minimal fix: add `c = a proportionality constant` to the symbol line.

5. **[CONFUSING] B.1/B.2 recurring — "binds" as a verb, never glossed.**
   Quotes: `before compute — not bandwidth — binds` (B.1); `weights, not KV, bind` (B.2); `Which resource binds` (B.2).
   Engineering idiom ("becomes the limiting resource"). Used three times; a cold reader guesses.
   Minimal fix: first use → `binds (becomes the bottleneck)`; the other two can stay.

6. **[CONFUSING] B.2 order — MoE is used before it is expanded.**
   Quote: decode-payload card: `MoE models read only *active* weights per step` — expansion arrives only in the *later* "Expert capacity (MoE — mixture-of-experts)" card.
   Minimal fix: expand at first use in the decode-payload card `(MoE — mixture-of-experts models)` and let the later card keep its title expansion.

7. **[CONFUSING] B.2 "Sessions per accelerator" — the arithmetic gap 80 − 61 ≠ 15.**
   Quote: `an 80 GB card holding a 61 GB MXFP4 model has ~15 GiB left`
   A reader who checks the subtraction gets 19, not 15; the missing ~4 GiB is the workspace term from the formula above, but the example never shows it being subtracted.
   Minimal fix: `has ~15 GiB left after a ~4 GiB workspace reserve`.

8. **[CONFUSING] B.3 "The compaction breakeven" — equation terms are unlabeled.**
   Quote: `worked: 30K + 3K·t = 15K·t → t = 2.5 turns`
   To follow it, the reader must reverse-engineer that 15K = r × 150K (old per-turn re-read) and 3K = r × 30K (new per-turn re-read). Neither is stated.
   Minimal fix: `worked: re-prefill 30K once + re-reads 0.1 × 30K = 3K/turn, versus old re-reads 0.1 × 150K = 15K/turn → 30K + 3K·t = 15K·t → t = 2.5`.

9. **[CONFUSING] B.3 "The expiry penalty" — the example price is not in the constants box.**
   Quote: `pays $1.25 instead of $0.10 to re-enter (Opus-5-class list prices; Ch. 17's resume box)`
   The box quotes Sonnet $3/$15 only; the $1.25/$0.10 pair implies an Opus-5 input price (~$5/M) the sheet never states, so the reader cannot verify the sheet's own example.
   Minimal fix: add Opus-5 input to the constants box, or append `(≈$5/M input)` at the example.

10. **[CONFUSING] B.2 "The sharding product" — "collectives" unglossed.**
    Quote: `zero per-token collectives`
    Minimal fix: `collectives (the cross-chip sync messages)`.

11. **[CONFUSING] B.1 — chip names used as common nouns, never glossed.**
    Quotes: `an H100's bandwidth-side attainable`, `a B200-class GPU`, `an A100 at ~$1.49/hr`.
    Three accelerator model names; the appendix never says these are AI accelerator chips.
    Minimal fix: at first use, `an H100 (an AI accelerator chip)`; afterwards bare names are fine.

12. **[CONFUSING] B.1 "The roofline" — the ridge-point sentence is double-compressed.**
    Quote: `the ridge point is one datasheet division that tells you how much reuse per byte a chip needs before compute — not bandwidth — binds`
    Three ideas (division, reuse-per-byte threshold, which resource limits) in one clause, plus the unglossed "binds" (finding 5) and "datasheet division" (a division you can do from the chip's spec sheet).
    Minimal fix: `the ridge point — one division using numbers from the chip's spec sheet — tells you how much reuse per byte a chip needs before compute, not bandwidth, becomes the bottleneck`.

### [POLISH]

13. **[POLISH] Intro — "token" itself is assumed.** A cold reader needs `token (the word-piece units you are billed in — Appendix A)` once, at the first "output-token count" (B.1).
14. **[POLISH] Number-format names.** FP8/INT4/FP16/MXFP4 carry byte values in B.2 but the names themselves never get `(8-bit, 4-bit… number formats)`. One parenthetical at first use covers all.
15. **[POLISH] B.1 "When it lies" — `it is an identity over measured terms, not a predictor — queueing and jitter live in the residual`.** "Identity" (math sense) and "residual" (stats) are both quietly technical. Suggested: `it rearranges things you already measured — it does not predict; queueing and jitter hide in the leftover difference`.
16. **[POLISH] B.5 — "burndown multipliers" and "K-of-N reduction" arrive unglossed.** One clause each: `(quota that shrinks as you spend it)` and `(accept the first K results of N children and cancel the rest)`.
17. **[POLISH] B.1 "The single-stream floor" — link the 0.7 rule to its source.** `effective (0.7 rule)` silently reuses the roofline card's 60–80% reality; add `(the 60–80% real-world efficiency from the roofline card)`.
18. **[POLISH] B.1 — formula says `active bytes`, explanation says `active weights (plus its KV)`.** One connecting clause: `active bytes = active weights + the KV held for this context`.
19. **[POLISH] Intro — add a three-line "how to read a card" orientation.** The card anatomy (formula / symbols / smallest worked example / when it lies) is described in prose but a literal 4-bullet map at the top would orient cold readers faster. This is the policy-consistent substitute for ELI5 blocks in a reference appendix (appendices are frame-exempt by the book's own linter policy — no ELI5 violation exists here).
20. **[POLISH] B.1 "The prefill decomposition" — `Entering is quadratic; generating is linear in what you're holding`.** Poetic but unnamed: say `Entering (prefill — reading your prompt) is quadratic; generating (decode) is linear in the context you're holding`.

## Section grades

| Section | Grade | Note |
|---|---|---|
| Intro (card-deck orientation) | 4.0 | Purpose crystal clear; forward-references the constants box |
| B.1 How long will it take? | 3.5 | Decode identity excellent; roofline/prefill cards lose the reader |
| B.2 How much memory? | 3.0 | KV card good; sharding card is the appendix's wall |
| B.3 What does a turn cost? | 4.5 | Best arithmetic in the book; w/r forward-ref is the one real fix |
| B.4 What does the fleet cost? | 4.5 | Batch lane + failure lines: clearest cards, punchlines land |
| B.5 When do I trip the limits? | 4.5 | Five cards, all recomputed clean; two micro-jargon terms |
| B.6 When does guessing pay? | 4.0 | Formula explained in words; E[…] notation is the only friction |
| B.7 When does owning beat renting? | 5.0 | The best card in the deck — every number verifiable, two unforgettable analogies |
| Constants box | 4.0 | Well-hedged; missing the Opus-5 price its own B.3 example uses |

**Average: 4.3 / 5.**

## Three worst teaching gaps

1. **The sharding card is unreadable cold** (finding 1): five unexpanded acronyms make B.2's second half a wall for exactly the reader a cheat-sheet should serve. One line of parentheticals fixes it.
2. **B.3 is not self-contained** (findings 3, 8, 9): the section readers will actually use depends on symbols defined later (w, r) and a price the constants box omits — breaking the "operator's card deck" promise of standalone usability.
3. **Micro-undefined symbols and idioms at the moment of use** (findings 2, 4, 5, 10): `c`, `kernels`, `binds`, `collectives` — each is one clause of gloss away from a deck a non-engineer can genuinely follow, which is the appendix's stated ambition.

**Analogy collisions: none found.** The restaurant/kitchen spine (B.7's "buying the restaurant for one dinner") reinforces the book's motif rather than fighting it; the card-deck metaphor is used consistently from intro to closing note.
