# Pedagogy audit — ch13 Structured output is not a prompt trick

audited: 2026-08-28 · auditor: glm-5.3-flash (worker) · method: cold-read simulation, smart 25-year-old non-engineer

**Verdict:** taught at a consistently high level; zero abandonment points. The
provider-menu section (13.3) is the chapter's teaching peak (the four-couriers
ELI5 plus the loud-vs-silent failure contrast). The stumbles cluster in two
places: one triple-duty paragraph in 13.2 (schema→mask compilation) and the
academic armor in 13.5 (TC⁰, pass@3, percentage-point chains). All fixes are
one-sentence scaffolds; none requires restructuring.

## Findings

### [CONFUSING] 1 — §13.2 sampler knobs name-dropped, not glossed
> "Temperature, top-p, top-k, min-p — the usual sampler knobs still apply, but only to the survivors"

Four undefined terms in a sentence whose point is "they still apply." A
non-engineer stops to wonder whether they were supposed to know these.
**Minimal fix:** append a parenthetical: "(the dials that control how
adventurous each word choice is — chapter 2's tour)". The mermaid diagram
below helps, but the prose should not assume the knob names.

### [CONFUSING] 2 — §13.2 "context-free" used as a term of art
> "JSON nests, so its grammar is context-free, and the machine becomes a pushdown automaton"

The cafeteria plate stack carries the *stack*, but "context-free" itself never
gets a plain gloss; a beginner reads it as decoration. **Minimal fix:** "…its
grammar is context-free — the kind whose rules can nest brackets to any depth,
which is exactly why the machine needs a stack — and the machine becomes a
pushdown automaton".

### [CONFUSING] 3 — §13.2 the compile paragraph does three jobs in one sentence
> "So the engine compiles the grammar over characters, then intersects it with the tokenizer's entire vocabulary — using a token trie, a prefix tree over the vocabulary — to get, for each rule-machine state, the exact set of legal token ids"

This is the single hardest sentence for a cold reader: compile, intersect,
and per-state lookup nested inside one clause chain. The chapter itself
signals difficulty ("Step 1 hides the genuinely clever engineering") — good —
but the sentence still asks a beginner to hold three operations at once.
**Minimal fix (split, no content change):** "So the engine first compiles the
grammar over characters. Then it intersects that rule set with the
tokenizer's entire vocabulary, using a token trie — a prefix tree over the
vocabulary. The result is, for each rule-machine state, the exact set of
legal token ids."

### [CONFUSING] 4 — §13.3 `additionalProperties: false` unglossed
> "every object needs `additionalProperties: false`"

Beginner trusts context; one parenthetical buys full comprehension.
**Minimal fix:** "`additionalProperties: false` (no fields beyond the ones
you declared)".

### [CONFUSING] 5 — §13.4 "CFG" acronym rides inside a quotation
> "current context-free-grammar engines have 'intractably high overhead for more complex CFGs — precisely the situation where CFG engines are most useful'"

The spelled-out form appears earlier in the sentence, so the acronym is
recoverable — but the reader has to do the mapping while parsing quoted
academic prose. **Minimal fix:** after the quote, add "(CFG — the
bracket-nesting grammar kind from 13.2)".

### [CONFUSING] 6 — §13.5 `pass@3` used without an in-chapter key
> "unconstrained chain-of-thought matched CRANE's accuracy only at pass@3 with ~4× more generated tokens"

If chapter 8 defined pass@k, a series reader has it; a cold reader does not,
and the number is load-bearing (it is the both-sides twist).
**Minimal fix:** "only at pass@3 (allowed three attempts)".

### [CONFUSING] 7 — §13.5 TC⁰ leads with the class name, picture second
> "constant-depth LLMs under restrictive grammars are limited to the complexity class TC⁰ — circuits too shallow for some reasoning problems, making certain correct outputs unreachable in principle"

The gloss exists but arrives after the symbol; beginners read "TC⁰", lose
footing, then recover. **Minimal fix (invert the order):** "…are limited to
circuits too shallow for some reasoning problems (the complexity class TC⁰),
making certain correct outputs unreachable in principle".

### [POLISH] 8 — opening leans on "sampler" before any picture exists
> "constrained decoding, which reaches into the sampler at every step and crosses out every token the schema cannot accept"

Rescued two paragraphs later by the vocab table and 13.2's ELI5; the chapter
survives its own opening. Optional: "…reaches into the engine's word-choosing
machinery at every step…". Low priority.

### [POLISH] 9 — §13.5 double-number density at the key finding
> "a 38.15-percentage-point performance gap under JSON format with a 0.148% parse-error rate"

Handled well — the very next clause does the work ("the degradation is
behavioral, not a parsing artifact"). No change needed; noted because this is
the sentence a skimming reader most needs to slow down for. Consider bolding
"behavioral, not a parsing artifact".

### [POLISH] 10 — checkpoint answers are inline
Answers under the Checkpoint (rather than an appendix) match this book's
self-contained-chapter pattern and serve a cold reader well. Keep.

## Section grades

| Section | Grade | Note |
|---|---|---|
| 13.1 Words before machinery | 5 | exemplary — 12 rows, every picture earns its row; logit defined in prose |
| 13.2 The mask | 4 | ELI5 lands; findings 1–3 live here |
| 13.3 The provider menu | 5 | four-couriers ELI5 + loud-vs-silent contrast = chapter peak; one worked example down the whole gradient |
| 13.4 The bill | 4.5 | three-tax ELI5 maps 1:1; tax-two's quoted prose dips |
| 13.5 When the grammar fights | 4 | best-taught hard content in the book; findings 6–7 are its toll |
| 13.6 Harness rules | 5 | eight rules, every one paid off by earlier evidence; pin-worthy summary |
| Where the picture stops | 5 | four precise breaks |
| Closers (Build/Break/Prove/See) | 5 | adversarial-schema Break-it and the "wishes" closer are series-best |

**Average: 4.69 / 5** · LOST: 0 · CONFUSING: 7 · POLISH: 3

## Three worst teaching gaps

1. **The compile paragraph (finding 3)** — the only place a beginner risks a
   full stall. Splitting one sentence into three is the cheapest high-value
   fix in this audit.
2. **Sampler-knob assumption (finding 1)** — mid-ladder reliance on external
   vocabulary; one parenthetical restores the ladder.
3. **§13.5's academic armor (findings 6–7)** — the section that must scare
   the reader also has the highest jargon per square inch; two parentheticals
   (pass@3, TC⁰ inversion) keep the non-engineer aboard without diluting the
   evidence.
