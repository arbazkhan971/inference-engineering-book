# Pedagogy audit — ch08 "Guessing at the speed of light" (beginner simulation)

audited: 2026-08-28 · auditor: glm-5.3-flash (worker)
method: cold-read simulation, smart 25-year-old non-engineer; frame rules from STYLE.md (ELI5 ladder, terms at first need, picture-stops, closers)

## Verdict in one line

A strong chapter whose five ELI5s, four-force epistemic grading (8.4), and
picture-stops section are best-in-book — but it has one genuine LOST point:
the correction-rule formula (the chapter's one theorem) is the only major
concept with no plain-words ladder beneath it, and three load-bearing terms
(logits, n-gram, hidden state) are assumed rather than glossed.

## Findings

1. **[LOST] The correction formula is a wall exactly where the theorem lives.**
   8.2, step 3: "sample a replacement from the corrected distribution
   `norm(max(0, p − q))`, where p is the target's distribution and q the
   drafter's."
   A lay reader has no model of what a "distribution" *is* here, and
   `norm(max(0, p − q))` is function notation on top of two of them. The
   sentence after ("The checker does not merely veto; it rewrites the
   sentence itself") rescues the *consequence* but not the *mechanism*, and
   the mechanism is the theorem the chapter keeps promising.
   Minimal fix (one parenthetical): "…corrected distribution — think of each
   model as holding a ranked preference list over the next word; subtract the
   intern's preference from the expert's, throw away anything that drops
   below zero, rescale what remains so it sums to one — `norm(max(0, p − q))`."

2. **[CONFUSING] "logits" used once, never defined.**
   8.5, structured output: "masks every token the grammar forbids — logits
   the schema cannot accept are set to −∞ before sampling."
   First use in the book's reading path may be chapter 13 (later); in-chapter
   it is bare. "Set to −∞" reads as physics magic to a non-engineer.
   Minimal fix: "— logits (each word's raw preference score) that the schema
   cannot accept are pushed to an impossible score before sampling."

3. **[CONFUSING] "n-gram" is used as a name throughout, literal meaning never given.**
   Appears in 8.1's table, 8.3's species section, 8.6, the lever table, and
   the closers — but "a run of n consecutive pieces" is never said.
   Minimal fix at first prose use (8.3): "Prompt lookup — n-gram speculation
   — (an n-gram is simply a run of n consecutive word-pieces: a 3-gram is
   three in a row)…".

4. **[CONFUSING] EAGLE passage slides into vendor-paper vocabulary.**
   8.3: "draft at the **feature level** — predicting the second-to-top hidden
   state of the target rather than output tokens."
   "Hidden state" (and the table's "hidden layers") is incantation to a lay
   reader; the intuition that follows ("sees the target's internal 'intent'")
   is the actual teaching moment but arrives after the jargon.
   Minimal fix: insert "— the model's private intermediate notes, computed
   before it commits to any word —" after "hidden state".

5. **[CONFUSING] "near-greedy, the mode of its distribution" — two undefined terms in one clause.**
   8.4, temperature force: "The drafter proposes its best guess — near-greedy,
   the mode of its distribution."
   Minimal fix: "— its single most-favored next word (the mode: the top item
   of its preference list), picked without any randomness (that is what
   'greedy' means here)".

6. **[CONFUSING] "tree attention" parenthetical dropped without a gloss.**
   8.3: "the verify pass checks the whole tree at once (tree attention)".
   The tree idea itself was taught one clause earlier; the parenthetical adds
   a second unexplained term.
   Minimal fix: "(tree attention: scoring every branch of the draft tree in
   the same pass)" — or delete the parenthetical.

7. **[CONFUSING] Roofline constants inherit chapter 3 without a one-clause scale.**
   8.2: "batch-1 decode runs at an arithmetic intensity near 1 … while an
   H100's balance point sits near 295 (chapter 3's figures)."
   The *sign* (compute under-provisioned) is restated well; the 295 carries
   no meaning for a cold reader.
   Minimal fix: append "(the chip would need ~295 arithmetic operations per
   byte moved to stay busy; decode hands it ~1)".

8. **[POLISH] "70B" opening — the B is never glossed in-chapter.**
   Prologue-of-chapter symptom story: "streams a 70B model at 20 tokens per
   second". Minimal fix: "70-billion-parameter model" at first use.

9. **[POLISH] "sub-token amortized draft cost" (8.4).**
   "Amortized" undefined. Minimal fix: "a draft cost spread so thin across
   the tokens it helps produce that it rounds below one token's worth".

10. **[POLISH] "GQA (grouped-query attention)" (8.5, MagicDec passage).**
    Acronym expanded, concept not; one pointer clause would seal it:
    "(chapter 4's cache-sharing ladder)". As-is the sentence survives on the
    surrounding bandwidth story.

11. **[POLISH] "E[progress]" notation.**
    The prose unpacking ("the guaranteed first token, plus α's chance of a
    second…") is genuinely good; only the bracket notation itself is bare.
    Minimal fix: "E[progress] — expected, i.e. long-run average, progress".

12. **[POLISH] "(8×H100, sparse-KV drafters)" provenance aside.**
    Benchmark provenance is fine to keep; a lay reader may parse "8×H100" as
    a model name. Optional: "(on eight H100 chips)".

## Section grades (1–5, teachability for the simulated reader)

| Section | Grade | Note |
|---|---|---|
| Opening (promissory note + symptom story) | 4.5 | symptom story is a strong hook; 70B bare |
| 8.1 Words before machinery | 5 | 11 rows, every one earns its place |
| 8.2 The serial tax, and the checker's discount | 4 | Sudoku ELI5 lands; correction-formula wall (finding 1) |
| 8.3 Who does the guessing | 3.5 | intern/photocopy ELI5 great; EAGLE vocabulary drift (4, 6) |
| 8.4 Acceptance: the exchange rate | 4 | epistemic four-force grading is best-in-book; mode/greedy (5) |
| 8.5 When guessing hurts | 4.5 | three ELI5s all land; logits (2) is the blemish |
| 8.6 What you control from the harness | 5 | clean split, honest field note, usable lever table |
| Where the picture stops | 5 | exemplary — five sharp, non-overlapping breaks |
| Checkpoint + closers | 5 | all six questions answerable in-chapter; closers concrete |

**Average: 4.4 / 5** (9 sections). LOST: 1 · CONFUSING: 6 · POLISH: 5.

## Three worst teaching gaps

1. **The theorem itself is the least-taught idea in the chapter.** Every
   other major concept gets the ELI5 ladder; the distribution-corrective
   sampler gets raw notation. One parenthetical (finding 1) closes it.
2. **The species section (8.3) trades intuition for paper vocabulary at the
   exact moment lay readers most want the intuition** — hidden state, heads,
   tree attention arrive together (findings 4, 6). The intern/partner frame
   is strong enough to carry all three with one gloss each.
3. **Three terms are borrowed from "owning chapters" the beginner may have
   skimmed** (logits, mode, n-gram). The book's self-containment promise —
   follow it at a dinner table — costs three inline glosses here.

## What the editor should NOT touch

- The four-force "measured precisely / approximately / directionally / not at
  all" scaffolding in 8.4 — best epistemic device in the book; keep verbatim.
- "The engine pays for guesses the way you pay for lottery tickets: per
  ticket, not per win" — the chapter's most quotable teaching line.
- The MagicDec exception structure (folk wisdom → exception → S\*) — models
  exactly the both-sides discipline STYLE.md demands.
- The field note's honest hedge ("treat it as a direction").
