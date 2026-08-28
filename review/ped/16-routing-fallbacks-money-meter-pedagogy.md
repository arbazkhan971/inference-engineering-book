# Pedagogy audit — Chapter 16: Routing, fallbacks, and the money meter

audited: 2026-08-28 · auditor: glm-5.3-flash (worker) · method: cold beginner simulation (smart 25-year-old non-engineer), STYLE.md ladder applied section by section.

**Structure check (STYLE.md contract):** ELI5 blocks ×5 (switchboard, triage nurse, overnight train, fuse box, submeter — all land, none contain jargon) ✓ · Words before machinery ×12 rows, all with everyday pictures ✓ · `Where the picture stops` present, breaks all five analogies honestly ✓ · Checkpoint ×6 with answer keys ✓ · closers normalized `### Build it`/`Break it`/`Prove it`/`See it` ✓ · dated snapshots boxed (batch sheet, worksheet rates) with derived-math labeled ✓ · Field note (the breaker that never tripped) — the single best teaching moment in the chapter ✓ · mermaid ×2 (breaker FSM, cost-vs-hit-rate xychart) ✓.

## Findings

1. **[CONFUSING] 16.7 — the worksheet's key parameter is an undefined variable.**
   Current: "no provider documents intra-batch cache behavior (section 16.4), so **h is measured, not assumed**."
   The symbol `h` is never introduced; a cold reader asks *"what is h?"* at the exact moment the section's most important operational lesson lands. It recurs in Prove it ("measure the actual intra-batch hit rate h for a week") — so the gap compounds.
   Minimal fix: "**so the hit rate, h, is measured, not assumed**." (first use only; later bare `h` reads fine after that).

2. **[CONFUSING] 16.6 — math jargon leaks into the spine.**
   Current: "cost ≈ input_tokens × input_price + N × output_price — **affine**, one term you control, one you rent."
   "Affine" is not an everyday word; STYLE.md bans unexplained jargon in durable prose. The sentence's real payload ("one term you control, one you rent") doesn't need it.
   Minimal fix: "— a straight-line formula: one term you control, one you rent." (or keep the word inside a parenthetical: "a straight-line (affine) formula").

3. **[CONFUSING] 16.6 — inclusive vs. exclusive arrives field-first.**
   Current: "OpenAI reports `prompt_tokens` **inclusive** of cached tokens (`prompt_tokens_details.cached_tokens` is a sub-detail…); Anthropic and AWS Bedrock report **exclusive, additive** buckets…"
   The concept is the section's teaching floor, but the plain-words version only emerges after swimming through field names. One bridge sentence in front costs nothing and front-loads the idea.
   Minimal fix, insert before "OpenAI reports…": "**Some providers fold the discounted part into the grand total; others list it as separate line items.** Read the receipt's shape before you multiply."

4. **[CONFUSING] 16.2 — config-name wall.**
   Current: "Strategies range from `simple-shuffle` (recommended; weighted random) to `least-busy`, `latency-based-routing`, and `usage-based-routing` (by cost or by tokens/requests-per-minute usage)."
   Only the first strategy gets a plain-words gloss; the other three are bare product strings. A beginner cannot attach meaning to any of them.
   Minimal fix: gloss each in 2–4 words — "`least-busy` (pick the idlest wire), `latency-based-routing` (pick the fastest), `usage-based-routing` (by cost or by tokens/requests-per-minute usage)".

5. **[CONFUSING] 16.3 — benchmark acronym wall at first meeting.**
   Current: "…cutting cost versus GPT-4-only routing by **more than 85% on MT Bench, 45% on MMLU, and 35% on GSM8K**".
   The rescue sentence arrives immediately after ("85% on chat, 45% on multiple-choice knowledge, 35% on grade-school math"), but the first encounter is three opaque uppercase tokens doing load-bearing work.
   Minimal fix: inline tags at first use — "85% on MT Bench (chat), 45% on MMLU (multiple-choice knowledge), 35% on GSM8K (grade-school math)"; the existing follow-up sentence then becomes emphasis rather than the only scaffold.

6. **[CONFUSING] 16.5 — implementation detail with no teaching load.**
   Current: "LiteLLM benches per *deployment* (one entry in the model list, **identified by a hashed `model_id`**)".
   "Hashed model_id" adds nothing a beginner can use and interrupts the granularity argument, which is otherwise well-carried by "one model's content-policy failures would bench a whole vendor."
   Minimal fix: cut to "(one entry in the model list)"; the hash detail already lives where it belongs — LiteLLM's docs, cited in See it.

7. **[POLISH] 16.2 — headroom paragraph leans on ch. 15 vocabulary.**
   Current: "…can scrape `x-ratelimit-remaining-*` headers off every response (chapter 15)".
   "Headers" as a concept and the field syntax arrive together, cold. The book's ladder allows the dependency, but one clause makes it self-contained.
   Optional fix: "…can read the small notes providers staple to every response — the `x-ratelimit-remaining-*` headers (chapter 15) —".

8. **[POLISH] 16.6 — the Langfuse cliff-edge sentence is the densest in the chapter.**
   Current: "…OpenAI-style inclusive counts are normalized to exclusive 'only if the payload contains only OpenAI-schema fields' — a normalization rule with a cliff edge your ingestion must respect."
   Four abstractions in one breath. The cliff metaphor partially rescues it; splitting into two sentences ("…normalized to exclusive. That rule has a cliff edge: it applies only if the payload contains just OpenAI-schema fields.") would finish the job. Expert-basement depth is by design — lowest priority.

## Section grades (teachability for the target beginner, 1–5)

| Section | Grade | One-line why |
|---|---|---|
| 16.1 Words before machinery | 5.0 | 12 terms, every picture lands; "hotel switchboard" row does double duty for 16.2 |
| 16.2 The gateway | 4.0 | Switchboard ELI5 excellent; strategy-name wall + headroom paragraph cost it |
| 16.3 Routing per task | 4.5 | Triage nurse is superb; benchmark acronyms stumble before the gloss |
| 16.4 Batch | 5.0 | Best section: train ELI5, fully scaffolded arithmetic, and "if the harness would retry rather than time out, it can batch" — the chapter's teachable treasure |
| 16.5 Circuit breakers | 4.0 | Fuse ELI5 + field note outstanding; granularity paragraph is the densest prose |
| 16.6 The money meter | 3.5 | Teaching floor: "affine", field-first inclusive/exclusive, Langfuse cliff |
| 16.7 The worksheet | 4.0 | Arithmetic fully shown and derived-labeled; undefined `h` at the key moment |
| 16.8 What you control | 4.5 | Clean lever map; every row points home |
| Where the picture stops | 5.0 | All five analogies broken honestly; "the submeter measures spend, not value" is a keeper |
| Checkpoint | 4.5 | Six real questions with worked answers; Q2's exponent ratio stretches but is optional depth |
| Build it / Break it / Prove it / See it | 4.5 | Break-it's "garbage 200" injection teaches the failure class fallbacks can't see |

**Average: 4.41 / 5** · LOST: 0 · CONFUSING: 6 · POLISH: 2

## Three worst teaching gaps (ranked)

1. **16.6's receipt-shape concept arrives field-first** (finding 3) — the one place a persistent beginner genuinely considers skipping a section; the one-sentence bridge removes the risk entirely.
2. **The undefined hit-rate variable `h`** (finding 1) — tiny fix, but it sits on the worksheet's most-quoted lesson ("the lane beats the cache") and recurs in Prove it.
3. **Jargon leaks at the expert boundary** (findings 2, 4, 6) — "affine", bare strategy names, and the hashed `model_id`; each is one phrase of surgery, and this chapter otherwise keeps the plain-words discipline better than almost any Part III chapter.

## Verdict

Publishable teaching quality now; findings 1–4 are one-phrase fixes worth taking before release. Zero abandonment points. The analogy system (switchboard → nurse → train → fuse → submeter) is coherent, mutually reinforcing, and honestly broken in `Where the picture stops` — exactly what the series promises.
