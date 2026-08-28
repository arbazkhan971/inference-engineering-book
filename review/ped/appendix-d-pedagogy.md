# Appendix D pedagogy audit — beginner simulation

audited: 2026-08-28 · auditor: glm-5.3-flash (worker) · method: cold-read simulation (smart 25-year-old non-engineer) + STYLE.md contract check
Scope: `manuscript/appendix-d-tinyengine-companion.md` only. Reference-appendix context honored: the reader-promise here is *delivery* of the chapters' code, not first teaching — Appendix A and the Plain-English Guide carry the beginner. Findings are judged against that promise plus STYLE's hard rules (acronyms expanded at first use; code identifiers explained before use; no unexplained jargon).

## Findings

1. **[CONFUSING] The 200-word parenthetical after the module table is one sentence.**
   Quote: "(The estimates were tildes, not contracts. The first draft ran a little under them — TypeScript type declarations compress what the chapters described in prose — and the gate-6 adversarial pass then added the boundary guards an operator copies into production (input clamps, the orphan-delta skip, dual read+write events, the backwards-clock guard), which pushed three modules over their tildes — ...)"
   Why: five nested clauses; four guard names arrive with no gloss; the reader loses the thread (tildes → draft → guards → growth → total) before the reassuring landing ("within a rounding").
   Minimal fix: split into three sentences; replace the guard list with "the four boundary guards described in their sections below" (each guard IS explained where it appears — D.3/D.4/D.5 — so the catalog is redundant here).

2. **[CONFUSING] "the gate-6 adversarial pass" — editorial machinery leaks into reader prose.**
   Quote: "...and the gate-6 adversarial pass then added the boundary guards..."
   Why: readers do not know the book had internal review gates; this reads like a reference to an external standard they missed.
   Minimal fix: "a late adversarial code review". (Same class as finding 3 — unique to this appendix; no other surface reviewed so far leaks gate vocabulary.)

3. **[CONFUSING] "the tester role's three nightly instruments" — same leak.**
   Quote (D.8): "The cadence suite replays the tester role's three nightly instruments over fixture files — the same gates, offline."
   Why: "tester role" is EDITORIAL_SYSTEM vocabulary (the Gate-3 tester), not reader vocabulary.
   Minimal fix: "replays the three nightly operator instruments".

4. **[LOST] D.3 rule 2 opens on the mechanism with no plain-words floor — the appendix's one true wall.**
   Quote: "The `ToolCallAccumulator` keys fragments by provider-agnostic call id (Chat `index` → id once it arrives, Responses `item_id`, Anthropic block index → `toolu_` id from `content_block_start`, Gemini function name), concatenates blindly, and parses once when the stream ends — ..."
   Why: a non-engineer meets "keys fragments by provider-agnostic call id", "concatenates blindly", "escape-sequence", "coerce", "non-object" inside two sentences with no picture of what problem is being solved. The Portland split-string example that would anchor it is deferred to the test list in D.8.
   Minimal fix: one plain-words sentence before the mechanism: "A tool call's arguments arrive chopped into pieces spread across many stream events; the accumulator's whole job is to glue the pieces back together in the right order and read the reassembled whole exactly once." Then split the mega-sentence at "— keying Anthropic deltas...".

5. **[CONFUSING] "OTPM" never expanded — STYLE hard-rule violation (verified).**
   Quote (D.5): "(the output meter's OTPM cap is declared in `QuotaMeters` but not yet debited — add an output bucket before relying on it)"
   Why: `otpm` is real in `rate-scheduler.ts` (`tpm?/itpm?/otpm?/rpm?` in `QuotaMeters`), but the acronym appears nowhere else in reader text with an expansion. TPM/RPM at least have chapter-15 grounding; OTPM is cold on the page.
   Minimal fix: "the output meter's OTPM (output-tokens-per-minute) cap". Same paragraph could carry "(TPM/RPM: tokens/requests per minute)" for the cold appendix reader, cheaply.

6. **[CONFUSING] D.5 burst-trap arithmetic reads self-inconsistent to a careful reader (verified against the test).**
   Quote: "a 60-per-minute bucket refuses the 61st token of a second-one burst (59 admitted instantly, the next reservation refused until the refill readmits it)"
   Why: `tests/smoke.ts:229-232` acquires **59**, then refuses a **2-token** request — the actual lesson is reservation atomicity (a 2-token request is refused *whole*, so token #60 is also refused at that instant; never half-admitted). "Refuses the 61st" invites the reader to compute "60-per-minute should admit 60" and stall on 59.
   Minimal fix: "(59 admitted instantly; the next request — two more tokens, 61 in all — is refused whole, not half: reservations are all-or-nothing; the refill readmits it)". This also strengthens the point the sentence is making.

7. **[CONFUSING] D.7's cache economics compressed to cipher.**
   Quote: "staggered behind the first child's write so siblings land on reads."
   Why: "land on reads" = hit the prompt cache at read price — the whole payoff of chapter 17, packed into four words that only a reader with ch14/17 fully loaded can decode.
   Minimal fix: "...so the first child pays the full write premium and its siblings pay the tenth-price read."

8. **[CONFUSING] D.4's break-even formula uses unglossed variables.**
   Quote: "`breakEvenReads` implements the docs' own arithmetic — N ≥ (w−1)/(1−r) — so 1.25×/0.1× pricing answers "one read"..."
   Why: N, w, r carry chapter-14 meanings only; the appendix never restates them.
   Minimal fix: "(N = reads to break even, w = the write premium, r = the read discount — chapter 14's notation)". The surrounding "answers 'one read' / 'two'" landing is excellent and should stay.

9. **[POLISH] D.2 uses N before glossing it.**
   Quote: "the **identity gap**: `e2e − (TTFT + (N−1) × mean ITL)`"
   Fix: "where N is the reply's token count" (the code's `tokens` parameter).

10. **[POLISH] D.4's "/1e6" divides silently.**
    Quote: `... + out × P.out) / 1e6;`
    Fix: gloss in prose after the block: "prices are per million tokens, hence the divide-by-a-million."

11. **[POLISH] D.7 `stableStringify` rationale assumes hash-map literacy.**
    Quote: "object keys sorted recursively (`stableStringify`), because hash-map key order is a named cache-breaker."
    Fix: "because the same data can come back in a different internal order; sorting before hashing makes identical content produce identical bytes — and identical cache hits."

12. **[POLISH] D.8 "fixture" first use unexpanded.**
    Quote: "Every stream is a fixture string; every price is a test constant."
    Fix: "a saved, fake input the tests replay" — one parenthetical.

13. **[POLISH] D.8 "cron" unexpanded.**
    Quote: "your cron replays the tasks and appends one result row per task"
    Fix: "your cron (a scheduled job)".

14. **[POLISH] "the canary's purpose" — canary metaphor never established in this appendix.**
    Quote: "a typo (`--floor o.9`) must fail the invocation, not the canary's purpose."
    Fix: "not the check's purpose" (or establish the canary one sentence earlier where golden-set is introduced).

15. **[POLISH] Module table's "Owns" column: bare "the identity".**
    Quote: "| `tracer.ts` | Chapter 1 | ~10 | 20 | TTFT (time to first token), inter-token latency (ITL), the identity |"
    Fix: "the decode-time identity (chapter 2's e2e law)".

16. **[POLISH] D.1 leans on type names as prose.**
    Quote: "prices arrive as dated `PriceRow` objects, quotas as `QuotaMeters`"
    Fix: "prices and quotas arrive as dated, typed config rows (`PriceRow`, `QuotaMeters`)" — keeps the identifiers, adds the category.

**Strengths to preserve (do not flatten while fixing):** "The money meter."; "expiry is an event (`ttl_expired`) before it is a surprise"; "dropped money is invisible money"; "park the fleet"; "first stop wins"; "the failure fallbacks cannot see"; the closing manifesto. The voice is the best in the book's reference layer — every fix above is surgical, not stylistic.

## Section grades (1–5 teachability for the intended reference reader)

| Section | Grade | One-line reason |
|---|---|---|
| Opening + module table | 3.0 | orients well, then the mega-parenthetical stalls the reader |
| D.1 The wiring order | 3.5 | diagram carries it; type-name prose and unexplained composition rules coast on ch18 |
| D.2 The tracer | 4.5 | shortest, code-plus-landing done right; N gloss is the only nit |
| D.3 The stream normalizer | 3.0 | rules 1 and 3 land; rule 2 is the appendix's one true wall |
| D.4 The cache ledger | 3.5 | strong anchor + worked dollar example; formula variables ride on ch14 memory |
| D.5 The rate scheduler | 3.0 | densest acronym cluster; OTPM cold; burst arithmetic misreads |
| D.6 The router | 3.5 | best plain-rules section; dependency-speak ("renamed-alias suspect") is the tax |
| D.7 The session store | 3.0 | three compressed payoffs (stableStringify, leapfrog, siblings-on-reads) each need one clause |
| D.8 Running and proving it | 4.0 | commands + purposes mostly plain; fixture/cron/canary nits; outstanding closers |

**Average: 3.44 / 5**

## Three worst teaching gaps

1. **D.3 rule 2** — the only paragraph where the simulated reader fully detached; needs its one plain-words floor sentence and a sentence split (finding 4).
2. **Cold-start acronym/notation load** — OTPM (never expanded, STYLE violation), TPM/RPM unglossed in D.5, N/w/r unglossed in D.4: this appendix leans on chapter memory harder than any other surface, and every fix is a parenthetical (findings 5, 8, 9).
3. **Editorial-process leakage** — "gate-6 adversarial pass" and "tester role" break the fourth wall for a reader who never saw the book's internal gates; unique to this appendix (findings 2, 3).

All sixteen findings are one-clause-to-one-sentence fixes; none requires restructuring. Appendix D keeps its promise ("the chapters estimated the code; this guide delivers it") — the gaps are floor-lowering, not promise-breaking.
