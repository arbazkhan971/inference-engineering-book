# Plain-English Guide — beginner-simulation + teaching audit

audited: 2026-08-28 · auditor: glm-5.3-flash (worker, cold-reader simulation per STYLE.md Feynman rules)
Subject: PLAIN-ENGLISH-GUIDE.md (8,401 words). Reader simulated: smart 25-year-old non-engineer, never coded, uses ChatGPT casually, reading cold with no book context.

## Method

Walked every section in order as the simulated reader; flagged every stumble
(LOST = abandons or badly misunderstands; CONFUSING = stops, rereads, or forms
a wrong belief; POLISH = friction or contract slip). Checked term-before-
definition order, number scaffolding, and analogy collisions across all four
parts. Graded every H2 section 1–5 for teachability.

## Findings

### CONFUSING

**C1. Part II §2 — "AI helpers" used ~15 minutes before the concept exists.**
Quote: "when one hundred of your AI helpers all start their orders with the
same instruction page, the kitchen writes that shared page once"
The helper/handbook economy is the guide's biggest money idea and its home is
Part IV §4 ("Send helpers who carry the handbook"). A cold reader here has no
helpers and no swarm — the sentence presumes architecture the reader hasn't
been given yet, at the exact moment the "beautiful part" is being sold.
Minimal fix: "…when many requests start with the same instruction page — say,
many copies of an assistant, or the helper swarms you'll meet in Part IV —
the kitchen writes that shared page once". (Same ripple, smaller: Part II §4
"If you run your own kitchen" previews the home-kitchen idea four sections
before Part IV §6 introduces it; add "(more on home kitchens in Part IV)".)

**C2. Part III §1 — opener overclaims where the waiting lives.**
Quote: "almost all of your waiting happens before the very first plate."
For long replies this is false, and the section itself contradicts it two
paragraphs later ("a reply that feels snappy but 'types' slowly has a rhythm
problem") — the book's own arithmetic (wait for first piece + one step per
piece) says rhythm dominates long replies. A beginner will internalize the
wrong rule from the topic sentence.
Minimal fix: "for short replies, almost all of your waiting happens before the
very first plate; for long ones, the rhythm between plates quietly adds up."

**C3. Part II §6 — "jump-the-line fee" mislabels a price jump as a priority fee.**
Quote: "some charge a jump-the-line fee the moment you cross a size boundary."
Jumping the line means priority service; the actual phenomenon (book ch.11) is
a higher per-piece price above a context-size threshold. The label teaches the
opposite mechanism.
Minimal fix: "some raise the per-piece price the moment you cross a size
boundary."

### POLISH

**P1. Kitchen ↔ engine-room never shake hands.** The guide is all restaurant;
the book title, series, and cover are all "engine room." A reader graduating
from guide to book stumbles on page one of the real book. Fix in "Start here":
"The book calls this the engine room; this guide calls it a kitchen — same
machine, friendlier door."

**P2. "this flag alone" (Part II §4) is an engineer-speak leak** in an
otherwise jargon-free guide. Fix: "this one switch alone."

**P3. "a strict relay race with one runner" (Part I §3)** is a deliberate
paradox that reads like an error on first pass. Fix: "a relay where the same
runner must run every leg, in order."

**P4. "on real measurements only about a quarter to a third of it held
anything useful" (Part II §2)** is the guide's only unsourced number. Fix:
"(the book's sources measure this)" or drop "on real measurements".

**P5. "charity to the railway" (Part III §5)** — no railway appears in the
overnight-delivery analogy. Fix: "charity to the delivery service."

**P6. Part II §6's split-strategy sentence carries three strategies in one
breath** ("split the recipes, split the guests, or open identical branches") —
the densest sentence in the guide. Optional: split into two sentences.

**P7. "And it sets up the last idea of this part." (Part I §5)** — dangling
fragment. Merge into the previous sentence.

### Checked and clean

- Term order: word-piece (I.2) → running copy (I.5) → shared pages (II.2) →
  first-plate/rhythm (III.1) → door policy (III.4) → enrollment/rebuild fee
  (III.3→IV.6) → the squeeze (IV.2) → home kitchen (IV.6): all defined before
  reuse except the two forward references in C1/P2-ripple.
- Number scaffolding: ten-times-less, ninety-percent-off, half-digits-twice-
  speed, bills-roughly-in-half — all carried by their analogy; only P4 is bare.
- Analogy collisions: none hard. Wedding (II.6) vs venue (I.6) cover different
  facets of long context (cost scaling vs capacity) without contradicting.
- The 14 napkin rules each trace to a section and use consistent vocabulary
  with the body. The closer's teach-it-back framing matches the series'
  Feynman contract.

## Section grades (teachability, 1–5)

| Section | Grade |
|---|---|
| Start here: the one idea | 5.0 |
| I.1 Three workers | 5.0 |
| I.2 Word-pieces | 5.0 |
| I.3 One piece at a time | 4.5 |
| I.4 Thinking vs fetching | 5.0 |
| I.5 Running copy | 5.0 |
| I.6 Seating chart | 5.0 |
| II.1 Shared kitchen | 5.0 |
| II.2 Notebook scraps + appetizers | 4.0 |
| II.3 Read vs plate | 5.0 |
| II.4 Guess ahead, check in bulk | 4.5 |
| II.5 Writing smaller | 5.0 |
| II.6 One giant order | 4.0 |
| II closer: The part in one breath | 5.0 |
| III.1 Dishes one by one | 4.5 |
| III.2 Form vs essay | 5.0 |
| III.3 Kitchen remembers your usual | 5.0 |
| III.4 Door policy | 5.0 |
| III.5 Choosing kitchens | 5.0 |
| III.6 When your favorite closes | 5.0 |
| IV.1 Same opening words | 5.0 |
| IV.2 Don't rewrite mid-meal | 5.0 |
| IV.3 Forgets if you go quiet | 5.0 |
| IV.4 Helpers carry the handbook | 5.0 |
| IV.5 Read your receipts | 5.0 |
| IV.6 Slammed kitchen + spare + home | 5.0 |
| The whole book on one napkin | 5.0 |

**Average: 4.87 / 5.0 across 27 graded sections.**

## Three worst teaching gaps

1. **The helper economy's split timeline (C1).** The guide's strongest cost
   idea — shared frozen handbooks across helpers — leaks into Part II before
   it exists, then lands properly in Part IV. One parenthetical fixes the
   cold read; without it the "beautiful part" confuses exactly when it should
   delight.
2. **The waiting-arithmetic overclaim (C2).** III.1's topic sentence teaches a
   wrong rule for long replies in the one section dedicated to teaching the
   two-waits rule. Cheapest high-value fix in the file.
3. **The missing engine-room bridge (P1).** The guide and the book use
   different master metaphors and never say they're the same machine — the
   guide's whole purpose (on-ramp to the book) wobbles at the handoff.

## Verdict

**PUBLISHABLE WITH POLISH — 0 LOST · 3 CONFUSING · 7 POLISH · avg 4.87/5.**
No structural rework; all fixes are one-sentence. The guide delivers the
zero-jargon promise everywhere except two jargon leaks ("flag", "AI helpers")
and one mislabeled mechanism ("jump-the-line").
