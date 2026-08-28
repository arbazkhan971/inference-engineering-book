# Pedagogy audit — Chapter 9: Smaller numbers, faster engines

audited: 2026-08-28 · auditor: glm-5.3-flash (worker, beginner-simulation protocol)
Method: full cold read as a smart 25-year-old non-engineer who has followed
chapters 1–8; every section walked; every formula, number, and analogy checked
for where that reader stalls, recovers, or teaches it back.

## Findings

### [CONFUSING] 1 — The promissory-note sentence buries the chapter's contract (intro)

> "Chapter 4 left you a second promissory note — FP8 KV (key-value) caching halves every row of its table exactly, with measured quality caveats that are workload-dependent, and chapter 9 owns the full menu. Here it is."

Four ideas (the debt, the exact halving, the caveat, the ownership) in one
sentence with two dashes. The beginner recovers, but this is the chapter's
opening handshake and it costs a re-read. Minimal fix — split and de-dash:
"Chapter 4 left you a second promissory note: FP8 KV caching halves every row
of its table exactly, but the quality caveats are measured and
workload-dependent. This chapter owns the full menu. Here it is."

### [CONFUSING] 2 — `z` (the zero-point) appears once and is never explained (9.2)

> "Formally, `q = round(w / s) + z` with a zero-point `z`, and for b-bit integers the scale is `s = (max(w) − min(w)) / (2^b − 1)` per channel"

A non-engineer meets the formula, meets `z`, finds no definition in the table
or prose, and — worse — the worked example two sentences later silently
ignores `z`, so they wonder what they missed. The chapter's own rule (STYLE:
code identifiers explained before use) applies to math identifiers too.
Minimal fix — one parenthetical: "with a zero-point `z` (a small offset so
that zero lands on a grid point; it changes nothing in the arithmetic below,
and you may ignore it)".

### [CONFUSING] 3 — "15 levels" is the wrong noun (9.2)

> "quantized to INT4 (b = 4, so 15 levels between min and max), gets a scale of 0.16 / 15 ≈ **0.0107**"

A careful beginner counts on their fingers: 4 bits = 16 possible values, so
why 15? The formula divides by the number of *steps between* grid points, not
the number of levels — the prose noun and the math disagree. This is exactly
the reader who works the arithmetic (the chapter's best teaching move) and
then doubts themselves. Minimal fix: "b = 4, so the span splits into 2^4 − 1
= 15 equal steps between 16 grid points".

### [CONFUSING] 4 — "matmul" is undefined jargon at first use (9.3)

> "Divide each activation channel by a per-channel smoothing factor before the matmul and multiply it back into the weights"

"matmul" is not in the 9.1 table and is not expanded anywhere before this.
"matrix-multiply kernel" appears only later (9.3's closing paragraph). A
non-engineer's first collision with SmoothQuant — the flagship method —
contains an unexplained contraction. Minimal fix: "before the matrix
multiply (the giant multiplication at the heart of every layer)" and keep
"matmul" out entirely, or expand at true first use.

### [CONFUSING] 5 — "(approximate Hessian)" is a wall for the lay reader (9.3)

> "nudge the *not-yet-quantized* weights to cancel it, using second-order (approximate Hessian) information about how errors propagate"

The sentence's plain core — nudge future weights to cancel past rounding
errors — is beautiful; the parenthesis names the tool in graduate math
vocabulary. The reader survives by skipping the parenthetical, but then
wonders why it is there at all. Minimal fix: "using a mathematical map of how
rounding errors ripple forward through the remaining weights (an approximate
Hessian, for the credential-checkers)".

### [CONFUSING] 6 — The most important empirical sentence is the least parseable (9.4)

> "The averages hide the story: MATH-500 and LiveCodeBench dropped ≤2 points, one GSM8K (grade-school math) case — a W4A4 run, weights and activations both quantized — moved 0.00 — but AIME, the hardest reasoning set, fell off a cliff at 70B"

Three dashes and one exception nested inside the sentence that carries the
chapter's headline finding (the 4-bit reasoning cliff). A beginner rereads
twice and still cannot say what moved and what did not. Minimal fix — split:
"The averages hide the story. MATH-500 and LiveCodeBench dropped ≤2 points.
One GSM8K case — a W4A4 run, with weights and activations both quantized —
did not move at all. But AIME, the hardest reasoning set, fell off a cliff at
70B."

### [POLISH] 7 — BF16 is expanded twice (9.1 table, then 9.2)

Table row "FP16 / BF16 | The 2-byte formats models are trained and shipped
in" is the true first use; 9.2 re-expands "(brain float 16; the two 2-byte
float formats; Meta model card, 2024)". Harmless redundancy, but the book's
true-first-use convention (enforced elsewhere in copyedit) prefers one site.
Minimal fix: keep the 9.2 inline citation, drop the re-expansion: "ships as
FP16 or BF16 (Meta model card, 2024)".

### [POLISH] 8 — "the 0.7 real-kernel haircut" compresses chapter 3 past recognition (9.2)

> "before the 0.7 real-kernel haircut, after which something near 580 tokens/s is plausible"

The 0.7 efficiency rule is chapter 3's; a reader who retained "floors divide
exactly" but not the haircut constant stumbles on the word and the number at
once. Minimal fix: "before applying chapter 3's 0.7 kernel-efficiency
discount".

### [POLISH] 9 — "coordinates whose magnitudes dwarf the rest" (9.3)

Plain-word alternative at no precision cost: "a few coordinates — single
positions in the list of numbers — that grow far larger than all the
others". The table's choir-singer row already carries the picture; the prose
can afford to be as plain as the table.

### [POLISH] 10 — the e4m3/e5m2 parenthetical goes two levels deeper than needed (9.3)

> "(e4m3/e5m2 — 4-or-5-bit exponent, 3-or-2-bit mantissa variants)"

Exponent/mantissa is binary-float vocabulary the book never teaches. It is
skimmable, but skimming past an unexplained parenthesis trains the reader
that some sentences are not for them. Minimal fix: append "— how a float
spends its 8 bits; skimmable" or cut to "(two 8-bit float layouts)".

### [POLISH] 11 — missing article twists the variance sentence (9.4)

> "The same recipes that cost 7B/32B Qwen distills −0.8 to −1.8 points cost the 1.5B and 70B Llama distills −1.4 to −3.3"

"cost 7B/32B Qwen distills" reads as a typo for "cost *the*". Minimal fix:
"The same recipes that cost *the* 7B/32B Qwen distills −0.8 to −1.8 points
cost *the* 1.5B and 70B Llama distills −1.4 to −3.3".

### [POLISH] 12 — "co-reference resolution" gets five words; the idea deserves eight (9.5)

> "long-context MRCR (a multi-round co-reference resolution benchmark)"

Minimal fix: "(a multi-round who-referred-to-what benchmark)". Same for the
"(area under the curve)" tag — "(the summary score under the whole curve)"
is one plainer word-set at equal length.

### [POLISH] 13 — Lever-table "Where" column mixes section numbers with chapter numbers (9.7)

Rows read "this chapter, 3" (meaning §9.3) next to "this chapter, 16"
(meaning chapter 16, the routing chapter). The beginner cannot tell which
kind of number they are looking at — and on this table, guessing wrong sends
them to the wrong chapter entirely. Minimal fix: "§9.3" / "§9.4" / "ch. 16"
/ "ch. 8" / "ch. 10" / "ch. 11" / "ch. 18".

### [POLISH] 14 — "the floor only binds what binds it" (9.2)

Cute, compact, and backwards-parseable only after you already understand it.
Minimal fix: "the floor only limits the traffic that actually flows through
it".

## Analogy-collision check — clean

Four food-and-work analogies rotate (recipe rounding → calibrated cooking →
wedding-catering arithmetic → club-sandwich pricing) plus meeting notes for
KV. No collisions found: each ELI5 is introduced before use, the 9.5 "Back
to the meeting" correctly recalls chapter 4's recipe-vs-notes pair, and the
pantry/bowl/spices pictures stay consistent with the 9.1 table. The rotation
is a feature, not a bug — each dial gets its own kitchen.

## Section grades (1–5; 5 = a beginner could teach it back)

| Section | Grade | Note |
|---|---|---|
| 9.1 Words before machinery | 5 | The 14-row table is the on-ramp the chapter promises |
| 9.2 Rounding the recipe | 3 | Formula-first paragraph (z, "15 levels") before the rescue of the worked example |
| 9.3 The methods behind the names | 3 | matmul / Hessian / e4m3 parentheticals assume an engineering floor |
| 9.4 The quality bill | 4 | Strong ELI5 and takeaway; one dash-tangled headline sentence |
| 9.5 The KV dial | 4 | Best mechanism explanation in the chapter (break-even + toll road) |
| 9.6 Reading a variant list | 5 | Club sandwich + decision graph + field note — fully teachable |
| 9.7 What you control | 4 | Actionable; lever-table location column ambiguous |
| Where the picture stops | 5 | Five precise, non-generic breaks; "menu price, not the meal" lands |
| Checkpoint | 4 | All six questions answerable from the chapter |
| Build/Break/Prove/See | 5 | Concrete, doable, no vague exercises |

**Average: 4.2 / 5.**

## The three worst teaching gaps

1. **The affine-math paragraph (9.2) is written formula-first for its only
   non-optional audience.** The zero-point, the grid metaphor, and the
   interval-vs-level distinction all arrive compressed before the worked
   example that actually teaches them. Findings 2 and 3 are symptoms; the
   disease is that this one paragraph serves the expert's memory instead of
   the beginner's first pass. The worked example is strong enough that most
   beginners will survive by skipping ahead — which means the paragraph is
   not teaching, only certifying.
2. **The method zoo (9.3) lets jargon parentheticals leak into the load-bearing
   path.** Matmul, Hessian, exponent/mantissa — each skippable, each a small
   "this sentence is not for you" signal, clustered exactly where the reader
   must form the mental map of what distinguishes the named methods. The
   one-line method summaries are excellent; the leaks undercut them.
3. **The chapter's single most important empirical claim rides its least
   parseable sentence (9.4).** "4-bit falls off a cliff on long-chain
   reasoning" is the fact a routing engineer must retain for life, and it is
   delivered inside a triple-dash construction with a nested exception.
   Finding 6's three-sentence split fixes it.

## Verdict

Teachable, structurally sound, zero abandonment points. The 4.2 average with
no section below 3 confirms the ladder works; the six CONFUSING findings are
all localized sentence-level repairs, none requiring restructuring. Apply
findings 1–6 before the next reader pass; 7–14 are copyedit-queue material.
