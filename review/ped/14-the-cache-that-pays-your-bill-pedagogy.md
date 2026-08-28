# Chapter 14 pedagogy audit — beginner simulation

audited: 2026-08-28 · auditor: glm-5.3-flash (worker, beginner-simulation protocol)
Reader simulated: smart 25-year-old non-engineer, chapters 1–13 behind them, reading this chapter cold.
Method: walk every section as that reader; flag every stumble, undefined-on-arrival term, number without scaffolding, and analogy collision; grade each H2 section 1–5 for teachability. Arithmetic spot-checked independently (punch-card example, 525,000 loop, 354,200 / 90,450 totals, fanout 5.01M, all six chart points per line) — all correct; findings below are teaching-only.

## Findings

### LOST — reader stops or builds a wrong model

1. **[LOST] Three meanings of "block" in one chapter, and the load-bearing one is never sized.** Ch06 defines a block as a fixed 16-token KV page (`DEFAULT_BLOCK_SIZE = 16`, ch06 L52) — and ch14's own recap invokes "chapter 6's hash chain and block tables" (L7) before immediately using *different* blocks: Anthropic's "look back up to **20 blocks**" (L37) and the leapfrog rule's "grows more than 20 blocks past the older checkpoint" (L128) are **content blocks** (messages, tool results — variable size), while L77's "every 1,000-token block" is the worked example's turn-block. A reader who internalized ch06 will try to compute 20 × 16 tokens and be confidently wrong; the leapfrog procedure is unexecutable without knowing which unit and roughly how big. *Minimal fix:* one parenthetical at L37 — "blocks here are Anthropic's *content* blocks (a message or tool result), not chapter 6's 16-token pages" — and label L77's "the turn's 1,000-token block."

2. **[LOST] The leapfrog rule never states why lookback forces the motion.** "each time the conversation tail grows more than 20 blocks past the older checkpoint, move the free one onto the newest message, because a breakpoint's lookback reaches at most 20 blocks" (L128) — the "because" clause names the constraint but not the failure it prevents, so the procedure reads as superstition. *Minimal fix:* one sentence after it — "a checkpoint left more than 20 blocks behind can no longer see any cache entry near the tail, so its write premium buys nothing; leapfrogging keeps one checkpoint always inside the window the provider will actually match."

3. **[LOST] The mechanism sentence is the chapter's densest prose and its only physics.** "The provider hashes the token prefix of your request from position zero. If an identical prefix's KV state is resident — within its time-to-live, or explicitly pinned — the engine skips prefill" (14.2, L29-ish). Three jargon terms in one breath — *hashes*, *resident*, *pinned* — none glossed in this chapter's table, and the warehouse ELI5 above it covers membership plans, not this mechanism. *Minimal fix:* gloss inline — "fingerprints the opening tokens (the hash), checks whether a stored copy is still live (resident) or marked to outlive its clock (pinned)."

### CONFUSING — reader wobbles but recovers

4. **[CONFUSING] The 30,000 history-read total arrives finished.** Every other number in the 25-turn example is derived on the page (525,000 shown, 354,200 itemized, 90,450 decomposed) — but "history: 25 blocks × 1,250 written once + 30,000 read" (L77) skips the triangular count entirely. In the chapter whose thesis is "the formula is the lesson," this is the one place the reader must take a number on faith. *Minimal fix:* "(blocks are re-read 0, 1, …, 24 times — 300 block-visits × 1,000 tokens × 0.1 = 30,000)."

5. **[CONFUSING] The ≈1.74 crossover is fully formed, twice.** "crossover 2.0/1.25 = 1.6 rewrites ignoring the 0.1× reads you still pay, ≈1.74 counting them" (14.3) has no derivation, and Checkpoint answer 5 reuses "~1.7 times per hour." A reader cannot reproduce either. *Minimal fix:* two-line derivation at first use, or a pointer to the Appendix B card that should own it.

6. **[CONFUSING] Model-class names carry a pricing row without introduction.** "512 tokens on the newest Opus-class models, 1,024 on Sonnet-class, up to 4,096 on Haiku 4.5" (L39) — the non-engineer has no idea Opus/Sonnet/Haiku are Anthropic's large/mid/small tiers, so the row's shape (smaller models demand bigger minimums) is invisible. *Minimal fix:* "on Anthropic's tiers (Haiku small, Sonnet mid, Opus large)."

7. **[CONFUSING] "hidden system tokens not counted" (OpenAI minimums, L45) — hidden tokens are never explained anywhere in the chapter.** The reader cannot tell whether hidden tokens are a provider accounting quirk or something they control. *Minimal fix:* parenthetical — "(tokens the provider injects on your behalf — tool schemas and the like)."

8. **[CONFUSING] The cache-salt row uses "cache key" before any key exists for the reader.** The table's salt row says "mixed into the cache key" (L24), but hashing/keys reach prose only in 14.2 — the table's own vocabulary is circular for a cold reader. *Minimal fix:* "the identity the provider fingerprints your prefix into."

9. **[CONFUSING] The hit-rate everyday picture doesn't map to reuse.** "Hit rate … The share of a quiz already graded" (L23) — a graded quiz is not *reused*, which is the entire point of a cache hit; the picture actively mis-points. *Minimal fix:* any reuse-flavored picture — "the share of a form letter already on the printing plate."

### POLISH — small teaching wins

10. **[POLISH] Thinnest recap in the chapter opens it.** "the engine stores the KV (key-value) state of a prompt's opening tokens" (L5) — one clause would re-anchor ch04's picture for a reader 10 chapters removed. *Fix:* "stores the KV state — its memory of having already read those tokens (chapter 4's per-request notebook)."

11. **[POLISH] "a Swift/Go serializer randomizing dictionary key order" (L126).** The plain-words version (shuffled tool list) correctly leads, but *serializer* itself is un-glossed. *Fix:* "(the code that packs your tool list into the bytes sent)."

12. **[POLISH] "Tool-heavy agents: stub, don't churn" + "ship tool stubs" (L130) — *stub* un-glossed.** *Fix:* "tool stubs (name-and-one-line placeholders the model can ask to expand)."

13. **[POLISH] "miss price" before miss is framed as a price.** DeepSeek paragraph: "hits are billed at roughly a tenth of the miss price" (L55) — the table defines a miss as an *event*, not a price tier. *Fix:* "the uncached (miss) price."

14. **[POLISH] "insurance with actuarial arithmetic: `hours-idle × expiries-per-hour` against the extra 0.75× premium" (14.3).** Formula-in-words dressed in actuarial vocabulary; the units don't visibly multiply to anything for a lay reader. *Fix:* "count the expiries you expect per idle hour and compare that cost against the 0.75× extra premium — that is the whole insurance decision."

## Section grades

| Section | Grade | One-line reason |
|---|---|---|
| Opening (unnumbered) | 4.0 | Strong stakes-and-hook; KV recap too thin |
| 14.1 Words before machinery | 5.0 | Exactly what the entrance ramp is for; two weak pictures (salt, hit rate) |
| 14.2 One mechanism, four contracts | 3.0 | Best ELI5 in the chapter wrapped around its least-teachable prose; un-introduced model tiers, hidden tokens, block collision |
| 14.3 The arithmetic of the hit | 4.0 | Punch-card ladder superb and mostly derived; two finished numbers (30,000; 1.74) |
| 14.4 Designing prefixes that hit | 3.5 | Letterhead ELI5 + cascade diagram excellent; leapfrog rule un-motivated, serializer/stub un-glossed |
| 14.5 What you control | 4.5 | Fuel gauge lands; lever table is a genuine study aid |
| Where the picture stops | 5.0 | Bills every analogy honestly, including the milk clock — best section in the chapter |
| Checkpoint | 4.5 | Six real questions with worked answers; Q5 is the chapter in miniature |
| Build it / Break it / Prove it / See it | 4.0 | Strong and specific; developer-facing by design |

**Average: 4.17 / 5**

## Three worst teaching gaps

1. **The block unit (Finding 1).** The chapter's most actionable discipline — breakpoint leapfrogging — runs on a unit the chapter never defines, in collision with chapter 6's same-named unit. This is the one fix that changes what a reader can *do*, not just how they feel.
2. **Un-derived arithmetic islands (Findings 4–5).** Two load-bearing numbers (30,000 history reads; ≈1.74 crossover) arrive finished, in the chapter that teaches "the formula outlives the price." One triangular count and one two-line derivation close both.
3. **The 14.2 mechanism sentence (Finding 3).** The single paragraph where the chapter explains physics rather than pricing is its densest; a cold reader exits 14.2 knowing four membership plans and not what a hash is for. Three inline glosses fix it.

## Summary

**Average 4.17/5 · LOST 3 · CONFUSING 6 · POLISH 5 · arithmetic verified correct.** The analogy system (warehouse → punch card → letterhead → fuel gauge) is coherent and honestly billed in *Where the picture stops*; the weaknesses concentrate where the chapter hands the reader provider documentation (model tiers, blocks, hidden tokens) and where derivations were trimmed for length. All 14 findings have minimal one-line fixes; none require restructuring.
