# Pedagogy audit — 06-paging-the-brain

audited: 2026-08-28 · auditor: glm-5.3-flash (worker, beginner-simulation protocol)
Reader simulated: smart 25-year-old non-engineer (university-educated, daily AI
user, never programmed, never heard "kernel" or "KV" before this book).

## Verdict up front

The chapter is genuinely teachable end to end. The hotel ELI5 (6.2), the
translator ELI5 (6.4), the worked 14-token/10-token example, the two-waiter
exact-vs-semantic distinction, and the `request_id` field note are
outstanding — a beginner retains those for life. No point in the chapter made
the simulated reader abandon it. The friction that remains is concentrated in
(a) a small cluster of un-glossed machinery words in the two "how it really
works" paragraphs, (b) one unlabeled math symbol pair, and (c) one arithmetic
leap. All twelve [CONFUSING] findings have one-sentence fixes.

## Findings

### [CONFUSING] — reader recovers with effort

1. **[CONFUSING] Fragmentation used before it is defined.**
   Quote (chapter intro): "fragmentation, the disease, becomes rounding error, the symptom."
   Why: the term is introduced here but only defined in 6.2 ("internal/external
   fragmentation"). A cold reader meets the disease before the symptom list.
   Fix: parenthetical at first use — "fragmentation (memory broken into pieces
   too broken up to reuse), the disease, becomes rounding error".

2. **[CONFUSING] "Goodput" unexplained.**
   Quote (intro): "lower arithmetic intensity, and worse goodput for everyone."
   Why: chapter-5 coinage; nothing in this chapter lets a beginner decode it.
   Fix: gloss once — "worse goodput for everyone (goodput — chapter 5's count
   of requests that actually meet their speed promise)" — or cut to "slower
   service for everyone".

3. **[CONFUSING] Mid-sentence metaphor switch, bus → desk.**
   Quote (intro): "you saw a measured deployment cap at 49 concurrent requests
   because the KV desk, not the arithmetic units, set the ceiling".
   Why: the chapter's own cast is hotel/front desk; "the KV desk" is chapter
   4's furniture and is never set up here. The bus (ch 5) and the desk collide
   inside one sentence.
   Fix: "because the KV memory, not the arithmetic units, set the ceiling".

4. **[CONFUSING] "Attention kernel" never glossed — the chapter's one
   recurring trip-wire.**
   Quote (6.2): "the attention kernel wants to sweep a sequence's keys and
   values as fast, contiguous memory" (reused in 6.3 step 4 and in
   Where-the-picture-stops: "every attention pass in every decode step walks
   the block table").
   Why: "kernel" is the only load-bearing machinery word that never gets a
   plain-words gloss anywhere in the chapter; a non-engineer cannot tell
   kernel from model from engine.
   Fix: one-time gloss at first use — "the attention kernel (the chip's
   read-the-notes routine, the part that actually walks the memory)".

5. **[CONFUSING] vLLM arrives un-introduced.**
   Quote (intro): "the vLLM authors instrumented real serving workloads in 2023".
   Why: a cold reader cannot tell whether vLLM is a company, a paper, or a
   chip; the chapter never says "engine".
   Fix: "the authors of vLLM — the open-source serving engine this chapter
   keeps using as its example — instrumented real serving workloads in 2023".

6. **[CONFUSING] Dataset names used as if familiar.**
   Quote (6.3): "peak KV memory fell 37.6–55.2% on Alpaca and 44.3–66.3% on
   ShareGPT workloads".
   Why: "on Alpaca" reads like a place; no hint these are public benchmark
   workload collections.
   Fix: "on two public workload collections (Alpaca and ShareGPT)".

7. **[CONFUSING] "Mamba-style caches" is a deep-cut with no on-ramp.**
   Quote (6.3): "requires multiples of 8 for mamba-style caches".
   Why: mamba is never explained and is irrelevant to the chapter's argument;
   it is the single most skippable jargon atom in the file.
   Fix: drop the clause, or gloss — "for the different cache layout some
   newer architectures use (mamba-style)".

8. **[CONFUSING] The hash-chain formula's symbols are unlabeled.**
   Quote (6.4):
   ```
   h0 = H( ∅ ,          tokens[ 0:16] )
   ```
   Why: H (the hashing function) and ∅ (empty set = "nothing came before
   block 0") are the only unexplained math notation in the chapter, and they
   sit in the chapter's core mechanism.
   Fix: one caption line under the block — "H is the hashing function; ∅ means
   'nothing before block 0'; the blank padding is only for alignment."

9. **[CONFUSING] "Embed" used without a plain-words landing.**
   Quote (6.4): "embed the incoming prompt, find a *similar* previous prompt".
   Why: the ELI5 rule bans jargon inside analogies; "embed" is the one
   technical verb inside the semantic-caching contrast.
   Fix: "embed the incoming prompt (turn its words into numbers that score
   similarity), find a *similar* previous prompt".

10. **[CONFUSING] Radix-tree sentence carries three ideas in one breath.**
    Quote (6.4): "SGLang organizes the cache itself as a tree whose edges are
    token runs and whose nodes hold the KV pages covering the path from the
    root — a structure that stores every shared prefix exactly once".
    Why: recoverable (the family-tree picture from 6.1 rescues it), but it is
    the densest sentence in the chapter.
    Fix: split — "SGLang organizes the cache itself as a tree. Edges are runs
    of tokens; each node holds the KV pages for the path down to it. A shared
    prefix is stored exactly once, like a shared ancestor in a family tree."

11. **[CONFUSING] The 62-of-62.5 leap.**
    Quote (6.5): "a 1,000-token shared system prompt at the front hits almost
    fully — 62 full blocks out of 62.5".
    Why: the only number in the chapter a beginner cannot reproduce: the
    division (1,000 ÷ 16) is never shown, and "out of 62.5 blocks" presumes
    comfort with fractional block counts.
    Fix: "— 1,000 ÷ 16 = 62.5, so 62 whole blocks hit and the half-block tail
    doesn't count".

12. **[CONFUSING] The librarian who was never hired.**
    Quote (Where the picture stops): "The librarian always recognizes
    byte-identical chapters".
    Why: the chapter's cast is hotel/front desk, translator, two waiters, a
    print shop, a barista (vocab table), and a coat check. A librarian appears
    exactly once — in the consolidation section, where readers are forming
    their final picture.
    Fix: "The translator always recognizes byte-identical contracts" (she is
    the prefix-caching ELI5).

### [POLISH]

13. **[POLISH] OS expansion lands after first use.** "operating systems have
    used since the 1960s" (6.3 opening) precedes "an OS (operating system)
    page table" (6.3 step 3). Move the expansion to the first mention.

14. **[POLISH] "128k context" cold.** Intro: "the 3-user floor at 128k
    context" — chapter-4 shorthand; a cold reader infers "big conversations"
    but one gloss ("128,000-token conversations") would cost nothing.

15. **[POLISH] Citation stacking inside the worked number.** 6.2's 1.6 GB
    sentence carries two parenthetical citations (paper + blog) inside the
    arithmetic. Move one to the section end per the citation-wall rule.

16. **[POLISH] "refcounts" as a verb.** 6.5: "matches block after block,
    refcounts them" — after 6.4's noun form "reference counts". Keep the noun.

17. **[POLISH] Lever-table handoff uses an undefined term.** "Compaction vs
    cache invalidation" — compaction is chapter 11's subject and gets no
    gloss here; add "(session-summarizing)" to the lever's "What it moves".

18. **[POLISH] Build-it presumes a coder.** "Write a 20-line two-shot probe"
    is right for the junior-developer rung; the beginner rung has no no-code
    on-ramp in this chapter's closers (Break-it and See-it partially cover
    it). Optional: add one sentence pointing the non-coder at the usage-field
    observation in See-it.

19. **[POLISH] Three cache analogies, no explicit handoff.** Barista
    (vocab), translator (6.4), print shop (6.5) each carry a different facet
    (hit/miss, reuse, pricing) and never collide directly — but one connective
    sentence ("same kitchen, three jobs: noticing, reusing, pricing") would
    stop a reader from stacking them into one confused waiter-shop.

## Section grades (1–5; 5 = a beginner could teach it back)

| Section | Grade | Note |
|---|---|---|
| Intro (through the promise) | 4 | Strong hook; findings 1–5 live here |
| 6.1 Words before machinery | 5 | Fourteen rows, all with working pictures |
| 6.2 Three wastes | 4 | ELI5 excellent; kernel paragraph is the friction |
| 6.3 PagedAttention | 4 | Mechanism steps clear; datasets/mamba/beam friction |
| 6.4 Prefix caching | 5 | Translator ELI5 + worked example are the chapter's peak |
| 6.5 Same prompt, new price | 4 | Dated box disciplined; 62.5 leap |
| 6.6 Harness controls | 5 | Actionable, honest tradeoff close |
| Where the picture stops | 5 | Six real breaks (post-librarian fix) |
| Checkpoint | 4 | Q3 requires ch3+ch5 integration by design |
| Build/Break/Prove/See | 4 | Break-it is a star; Build-it is coder-only |

**Average: 4.4 / 5.**

## The three worst teaching gaps

1. **The un-glossed machinery cluster (findings 1–5).** Every [CONFUSING]
   hit outside the analogies traces to the same root: kernel, vLLM, goodput,
   desk, fragmentation — the "how it really works" layer's vocabulary is
   assumed from earlier chapters, but the analogies are written to stand
   alone. One gloss sentence each (≈25 words total) fixes the whole cluster.
2. **The hash-chain formula's unlabeled symbols (finding 8).** This block is
   the mechanism the whole chapter argues from, and it is the one place
   notation appears without a plain-words caption — the exact failure mode
   STYLE.md's Feynman ladder exists to prevent.
3. **The 62-of-62.5 arithmetic leap (finding 11).** The chapter's method is
   "show the division"; this is the only place a derived number appears
   without its derivation, in the section that teaches pricing intuition.

## What to keep forever

The request_id field note ("eleven tokens, position zero"), the two-waiter
exact-vs-semantic split, the 14-token worked example, and "providers price
position, not just tokens" are the chapter's teach-back anchors — the
simulated reader could re-teach all four unprompted after one pass.
