# Pedagogy audit — Chapter 15: Rate limits are physics

audited: 2026-08-28 · auditor: glm-5.3-flash (worker) · method: cold beginner simulation (smart 25-year-old non-engineer), section-by-section walk, per STYLE.md pedagogy contract.

**Overall:** a strong teaching chapter — no point where the simulated beginner abandons the text. The vocab table, the three core ELI5s (water supply, gym memberships, restaurant doorman), and the zombie-fleet field note carry the load. The hazards below are concentrated where the chapter is densest by necessity (15.3) and in small unglossed terms elsewhere.

## Findings

1. **[CONFUSING]** — Opening paragraph uses `429` before any definition lands.
   > "Chapter 7 ended on a promise: when the serving system would rather reject than queue — the 429-class response — this chapter owns what your harness does about it."
   The number arrives as a bare noun before the 15.1 table and before 15.4 explains it. A cold reader survives only because the em-dash clause glosses the *idea*.
   *Minimal fix:* add four words at first use — "the 429-class response (`too many requests`, section 15.4)" — or move one sentence of the doorman picture up into the opening.

2. **[CONFUSING]** — Cache writes/reads are load-bearing in the 15.2 quota box and all of 15.3's meter arithmetic, but have no row in the Words-before-machinery table.
   > "| Burndown rate | A multiplier a provider applies to one kind of token when counting quota | Prime-time minutes count double on your phone plan |"
   The table stops at burndown; `cache-write`/`cache-read` then appear unexplained in the Bedrock quota formula and the Anthropic 10M-effective calculation. This is the single biggest vocab gap for a non-engineer.
   *Minimal fix:* add one row: `| Cache write / read | First-time send of text (counted) vs re-send of text the provider already holds (often free) | The first photocopy of a document vs the second |`

3. **[CONFUSING]** — 15.4 leans on the word "overloaded" in two opposite senses one screen apart.
   > "OpenAI's 429 is deliberately overloaded in meaning" … "**529** (`overloaded_error`) means *they* are saturated"
   A beginner just learned 529 = "overloaded" (the kitchen is on fire); the next paragraph says 429 is "overloaded in meaning." The pun is real but collides with the fresh picture.
   *Minimal fix:* "deliberately ambiguous in meaning" — keeps the lesson, frees the word for 529.

4. **[CONFUSING]** — Utilization appears as a fraction in 15.2 and as percentages in 15.6.
   > "latency explodes as utilization nears one" … "At 50% utilization residence is already ~2× service time … at 90% it is ~10×"
   Same quantity, two notations; "nears one" reads as "nears one what?" on first pass.
   *Minimal fix:* 15.2: "as utilization nears 100% (a fraction of one, chapter 5's ρ)".

5. **[CONFUSING]** — The Anthropic cache-discount multiplication states the result without showing the division.
   > "at an 80% cache-hit rate, the provider's own worked arithmetic puts a 2,000,000 ITPM limit at roughly 10,000,000 effective input tokens per minute"
   The chapter's discipline elsewhere is "show the arithmetic" (Bedrock's 36,000→9,000 is shown step by step). This one hides it.
   *Minimal fix:* append "— only a fifth of input is fresh, so the meter sees 2,000,000 ÷ 0.2."

6. **[CONFUSING]** — K-of-N appears as unglossed notation in the fanout recipe.
   > "design the reduce side to accept K-of-N results rather than requiring all of them"
   *Minimal fix:* "accept the first K of your N results (any 700 of 1,000, say) rather than requiring all of them."

7. **[CONFUSING]** — `except` clause assumes code-reading the chapter has not asked for.
   > "both are errors, both arrive mid-fanout, both get caught by the same `except` clause"
   "mid-fanout" also gets its only picture implicitly (fanout is chapter 10's word; a cold reader has only the plain-English sense of a fan-shaped spread).
   *Minimal fix:* "both land in the same error handler (`except`, in most languages)".

8. **[POLISH]** — "The credential is a name tag, not a bucket" is the third metaphor family in three sentences (pipe, tiers, name tag) — worth keeping, but "keys"/"credentials" alternate terms.
   > "OpenAI meters limits at the organization and project level — five extra API (application programming interface) keys do not buy five quotas"
   *Minimal fix:* none required; optionally standardize on "key" after first introducing "credential (key)".

9. **[POLISH]** — Burndown is named in the 15.2 quota box but its concrete arithmetic arrives only in 15.3.
   > "Burndown multipliers: 15× (Claude 4.8), 10× …"
   *Minimal fix:* append to the box's Bedrock entry: "(burndown arithmetic worked in section 15.3)".

10. **[POLISH]** — QPS used unexpanded at the amplification scenario.
    > "10,000 queries per second (QPS) of client traffic against a backend overloaded by just 100 QPS"
    Expansion is present in spirit but the parenthetical comes after the words, not before — strictly fine; noting only because RPM/TPM got table rows and this one didn't.
    *Minimal fix:* none needed; optionally "(QPS — queries per second, the same idea as RPM)".

11. **[POLISH]** — "wire requests" used twice as shorthand.
    > "one logical request becomes at most 3 wire requests" … "never reaching the wire"
    *Minimal fix:* first use: "3 wire requests — actual HTTP calls that leave your machine".

12. **[POLISH]** — Adaptive-throttle denominator purpose unstated.
    > "`max(0, (requests − K·accepts) / (requests + 1))`"
    The `+1` (div-by-zero guard at startup) is invisible; a curious beginner stalls on it.
    *Minimal fix*: "…the `+ 1` only guards against dividing by zero on the first request".

13. **[POLISH]** — "vertical asymptote" is the one piece of math-speak without a nearby plain gloss.
    > "Riding that ceiling at 100% means living at utilization 1.0 — the vertical asymptote."
    *Minimal fix:* "— the point where the curve goes straight up" (the chart two paragraphs up already shows it).

14. **[POLISH]** — 15.3's OpenAI reservation says "a character-count estimate of the request itself" without saying why characters.
    > "charged against TPM as the larger of your `max_tokens` setting and a character-count estimate of the request itself"
    *Minimal fix:* "…an estimate made from your prompt's character count (the provider cannot know your token count before reading it)".

15. **[POLISH]** — Token-bucket table row mixes metaphor families ("credit tank" vs the water-tower picture).
    > "| Token bucket | A credit tank that refills continuously; each request spends credits | The water tower draining and refilling |"
    *Minimal fix:* "A tank that refills continuously; each request drains it" — let the picture column own the water.

## Section grades (1–5, "a beginner could teach it back")

| Section | Grade | Note |
|---|---|---|
| Opening (unnumbered) | 4 | Strong framing; 429-before-definition is the one stumble |
| 15.1 Words before machinery | 5 | Model of the form; one missing row (cache write/read) |
| 15.2 The limit is a capacity statement | 4 | Excellent backward-arithmetic logic; quota box dense but explicitly disposable |
| 15.3 Four providers, four meters | 3 | The payload and the slog; missing cache row bites hardest here; arithmetic mostly shown |
| 15.4 Read the rejection before you react | 5 | Best ELI5 in the chapter; unforgettable field note |
| 15.5 Backoff that works | 4 | Red-light ELI5 lands; adaptive-throttle formula is the steepest single climb |
| 15.6 Schedule so you never meet the limit | 4 | Three concrete mechanisms; tail-law intuition is a gem; scattered unglossed terms |
| 15.7 What you control from the harness | 4 | Recap table does its job |
| Where the picture stops | 5 | Four named leaks, each with the surviving principle |
| Checkpoint | 5 | Six questions with verifiable inline answers |
| Build/Break/Prove/See | 5 | All four moves present, concrete, adversarial |

**Average: 4.36 / 5**

## Three worst teaching gaps

1. **Cache write/read missing from the vocabulary table** (findings 2, 5): the chapter's most load-bearing distinction for two of four providers is never given an everyday picture before it is used in arithmetic. One table row + one shown division closes it.
2. **The 15.3 density wall**: four provider paragraphs back-to-back with no breathing picture between them (the gym ELI5 is the only one, up front). A beginner recovers, but this is the section where they work hardest — consider one-sentence recap bullets after each provider paragraph ("OpenAI: reserve first, no cache forgiveness").
3. **Early-jargon ordering**: 429 (finding 1) and "fanout"/`except` (finding 7) all appear before their support arrives; each is a one-clause fix, but together they define the chapter's first ninety seconds — the exact window where a beginner decides to keep reading.
