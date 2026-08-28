# Front matter pedagogy audit — beginner simulation (00a-prologue.md + 00b-front-matter.md)

audited: 2026-08-28 · auditor: glm-5.3-flash (worker, cold-reader protocol)
Method: simulated a smart 25-year-old non-engineer reading both files cold, section by section, flagging every stumble; graded each H2 section 1–5 for teachability.

## Findings

Numbered, severity-tagged, exact quote + minimal fix. [LOST] = comprehension
of the surrounding point degrades; [CONFUSING] = recoverable stumble; [POLISH] = optional improvement.

1. **[LOST] "token" — the book's currency — is used cold in both files, never glossed.**
   Quote: "now each token arrives like drip coffee" (00a ¶1); "I pushed more than **200 billion tokens**" (00a ¶4).
   The drip-coffee metaphor still carries, but the credential number is unanchored for a lay reader (is 200B a lot?), and tokens are the unit every later promise ("compute what a token costs") is priced in. No gloss exists in front matter; ch02 defines it, too late for the hook.
   Fix (minimal, first use in 00a ¶1): "now each token — the word-piece chunks every AI bill is counted in — arrives like drip coffee."

2. **[CONFUSING] "POST request" is pure jargon to a non-engineer.**
   Quote: "Somewhere between your POST request and the first token" (00a ¶2).
   "Request" alone is recoverable; "POST" gives a lay reader nothing to picture.
   Fix: "Somewhere between the moment you press send and the first token" — keeps the rhythm, loses the acronym. (If the technical flavor is wanted: "…between your send button (a 'POST request') and the first token".)

3. **[CONFUSING] Foreshadow-list #1 reads as assumed knowledge.**
   Quote: "a queue got longer, a batch got fuller, a cache entry expired, a rate limiter woke up." (00a ¶2).
   Four undefined terms in one breath, structured as if the reader already knows them.
   Fix — add the promise signal: "…a rate limiter woke up — four things this book will make as familiar as traffic lights."

4. **[CONFUSING] Foreshadow-list #2, same pattern, colder terms.**
   Quote: "Cache hits, batch luck, queue position, prefix discipline, rate-limit choreography." (00a ¶4).
   "Prefix discipline" is the coldest item; the list is a deliberate teaser but repeats the assumed-knowledge cadence.
   Fix: "Cache hits, batch luck, queue position, prefix discipline, rate-limit choreography — the vocabulary of the engine room, all of it yours by the last chapter."

5. **[CONFUSING] "latency doubles after a compaction" stacks two unknowns in one clause.**
   Quote: "knowing why your latency doubles after a compaction" (00a, "The book this should have been").
   Written for reader rung 3; a beginner meets "latency" and "compaction" simultaneously.
   Fix: "why your agent suddenly slows down after a context cleanup — 'compaction', chapter 11's word".

6. **[CONFUSING] The tinyengine promise sentence is the densest stack in the front matter.**
   Quote: "a provider-normalizing, cost-metering, cache-friendly inference shim we call **tinyengine**." (00a, "What you will be able to do").
   Three hyphenated modifiers + "shim" + "inference" in one breath.
   Fix: "a small working piece of the machinery yourself — a mini-engine called **tinyengine** that hides the differences between AI companies, meters what you spend, and plays nicely with their caches."

7. **[CONFUSING] "harness" — the series' core noun — is never explicitly glossed in front matter.**
   Quotes: "The harness is the driver." (00a ¶4); "The harness/agent engineer — you own routing…" (00b rung 3); "a brilliant harness ships or stalls" (00b series note).
   Used ~6×; the metaphorical definition ("the driver") is implicit only if the reader catches the mapping. ch01 defines it properly (the waiter), but front matter leans on it cold.
   Fix (00b rung 3, first 00b use): "The harness/agent engineer — the harness is your code around the model, the driver in this book's engine picture — owns routing, caching, compaction, and budgets".

8. **[CONFUSING] "MoE" is an unexpanded acronym at first use — a hard STYLE rule breach.**
   Quote: "speculative decoding, quantization, parallelism, MoE, long context" (00b, "How the book is organized", Part II preview).
   STYLE.md: "Acronyms expanded at first use." ch10 expands it, but front matter comes first in reading order.
   Fix: "parallelism, mixture-of-experts (MoE), long context".

9. **[POLISH] The 200B-token credential lacks a lay scale anchor.**
   Quote: "more than **200 billion tokens** … 1.6 billion tokens a day" (00a ¶4).
   The checkable link is given (good), but intuition isn't. Optional clause: "(roughly a hundred million pages of text — I stopped counting)" — or leave; the point is checkability, not scale.

10. **[POLISH] "GPU kernels" / "write CUDA" name-drop the deep end.**
    Quote: "books about GPU kernels" / "You don't need to write CUDA" (00a).
    Acceptable as "that's not you" gestures; optional gloss "(the engine-builders' own deep end)".

11. **[POLISH] "500 parallel subagents" — "subagents" cold.**
    Quote: "why 500 parallel subagents will melt a rate limit" (00a).
    The image (500 helpers melting a limit) lands emotionally even undefined; optional "500 AI helpers working at once".

12. **[POLISH] "inference dashboard" / "provider" light jargon in the promise paragraph.**
    Quote: "read an inference dashboard — or a provider's pricing page — without flinching" (00a).
    "Provider" is semi-known by 2026; fine to leave.

13. **[POLISH] Reader-ladder rung 3 carries a jargon stack.**
    Quote: "you own routing, caching, compaction, and budgets" (00b).
    Describes another reader, so teaching isn't required; finding 7's gloss doubles as the fix if applied there.

14. **[POLISH] "serving system" (00a) vs "serving layer" (00b) — one concept, two spellings.**
    Quotes: "is a serving system most developers never see" (00a ¶2); "the serving layer that decides" (00b series note).
    Pick one for front matter (either is fine; "serving layer" matches later chapter usage).

15. **[POLISH] Kitchen metaphor meets engine metaphor two pages apart, unlinked.**
    Quotes: "This book is the hood, opened." + "explaining the kitchen to a food critic" (00b) vs "The harness is the driver. This book is about the engine." (00a).
    Both work at their own layers, but a careful beginner asks "is the engine a kitchen?" One clause resolves it: "…the machinery, explained the way this book explains everything — as a kitchen you can walk around in" or add to the Part II line "(the kitchen is the engine of the title, seen from inside)".

16. **[POLISH] Meta-irony: the no-jargon promise sits above unexpanded jargon.**
    Quote: "no jargon without a plain-words explanation" (00a, "What you will be able to do").
    Findings 1–2 fix the instances; the promise then stands clean. No separate action.

## Section grades (1–5 teachability, cold reader)

| File | Section | Grade |
|---|---|---|
| 00a | Opening — the 6pm story (unheaded) | 4 |
| 00a | The book this should have been, and isn't | 4 |
| 00a | What you will be able to do | 3.5 |
| 00a | Field note (closing) | 5 |
| 00b | Who this book is for | 4.5 |
| 00b | How the book is organized | 4 |
| 00b | The rule about numbers | 5 |
| 00b | Series note | 4 |

**Average: 4.25 / 5.** The two 5s (field note, numbers rule) are the best-taught surfaces; the 3.5 (promise paragraph) is where the jargon stacks live.

## Three worst teaching gaps

1. **"token" unglossed** — the book's billing currency and the credential's unit, used cold in the very first paragraph; every cost promise later rests on a word the beginner met only as a metaphor.
2. **"harness" unglossed** — the series' defining noun, leaned on ~6× across the front matter with only an implicit "driver" mapping.
3. **Foreshadow-lists read as assumed knowledge** (findings 3–4) — one promise-signal clause each converts the prologue's only genuine barriers into its best hooks.

## Verdict

Front matter teachability is strong (4.25/5) and the hooks land, but it
breathes the same jargon it promises to banish in six places. All fixes are
one-clause insertions; none require restructuring.
