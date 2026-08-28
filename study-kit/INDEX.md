# Study Kit — Master Index & Final Exam

*The study kit for "Inference Engineering: Inside the Engine Room of AI Agents"
(Harness Engineering Series, Vol. II). One kit per chapter
(`kit-ch01.md` … `kit-ch18.md`), each with flashcards, a chapter quiz, and a
teach-back prompt. This file is the map, the final exam, and the ruler.*

---

## How to use the kits

The book teaches three things per chapter: a picture, a mechanism, and the
arithmetic the mechanism implies. The kit trains all three. For each chapter:

1. **Cards first.** Read the chapter, then run the flashcards. Say the answer
   out loud before flipping. A card you miss twice goes into a "hard pile"
   you replay before the next chapter's cards.
2. **Quiz second, closed-book.** Take the chapter quiz without the book. The
   quiz is checking your mental model, not your memory of sentences — a
   wrong answer means reread that section, not the whole chapter.
3. **Teach-back last.** Take the teach-back prompt (one per kit) and explain
   the chapter out loud, to a person, a rubber duck, or a voice memo, using
   your own everyday picture. Where you stumble is the section you have not
   actually learned yet. This is the Feynman step the whole book is built on.

**Spaced repetition schedule** (the whole kit is ~2 weeks at 30 min/day):

| Day | Do |
|---|---|
| 1 | Chapter N: cards + quiz + teach-back |
| 2 | Hard pile from Day 1 + next chapter |
| 3 | New chapter + hard piles from Days 1–2 |
| 7 | Replay ALL cards so far (they should feel easy — if not, that chapter is your weak floor) |
| 14 | Final exam (below), closed-book, one sitting, ≤ 60 minutes |

Order is Part I → IV straight through: the chapters are a ladder, and
chapter 14 assumes chapter 4 the way division assumes multiplication.

---

## Final exam — 25 questions, closed book

Conceptual exam drawn from the whole book. Unlike the chapter quizzes (which
test one chapter at a time), these questions cross chapters, because the
real world does. Mix: recall (R), arithmetic (A — all numbers you need are
given in the question), scenario (S). Write your answers on paper first.

**Part I — The layer beneath the prompt**

1. (R) Name the three machines behind every agent reply, and give one
   failure each of them owns that the other two cannot cause.
2. (A) A reply arrives with TTFT = 2.0 s and 499 more tokens at a steady
   50 ms per token. What is the end-to-end time, and which of the two
   terms dominates it?
3. (S) Your agent's answers are perfect but arrive 40 s late; a colleague
   proposes switching to a "smarter" model. Using the book's failure
   ownership test, what do you diagnose first, and what measurement settles
   it in ten lines of code?
4. (R) In one sentence each: why is reading a prompt fast while writing a
   reply is slow?
5. (A) A model weighs 8 billion numbers stored at 2 bytes each and must be
   fully read from memory to produce each token. The memory door moves
   3,350 GB/s. Roughly what ceiling does this set on single-stream
   tokens/s, and which resource is the bottleneck?

**Part II — Inside the engine**

6. (R) Static batching pads and wastes; continuous batching does not.
   Explain the difference in one sentence, and name what continuous
   batching schedules per *iteration* rather than per *request*.
7. (S) Same prompt, sent twice, second reply starts much faster than the
   first. Explain the mechanism in plain words, and name the tree structure
   that keeps the reused part alive.
8. (R) Prefill and decode have different bottlenecks. Name each bottleneck
   and say why chunked prefill protects the decode rhythm.
9. (A) A speculative setup drafts 4 tokens, the big model verifies all four
   in one pass, and 3 of the 4 guesses are accepted on average (α = 0.75,
   ignore overhead). Roughly how many tokens per verify pass does the
   system advance, and is that more or less than the 1 token of plain
   decoding?
10. (S) Your JSON-schema agent loses speed when speculation is enabled.
    Name the mechanism and one workload where speculation still shines.
11. (R) Why can a much larger mixture-of-experts model be *faster* per token
    than a small dense model? Answer with the "recipe" metaphor: what does
    each token actually read?

**Part III — The API contract**

12. (R) Your tool-call arrives as a stream of deltas rather than one block.
    Why do providers stream it that way, and what must your harness build
    to reassemble it safely?
13. (A) Cache rules: writes cost 1.25× fresh price, reads cost 0.1×. An
    agent loop resends a 10,000-token frozen prefix 20 times in an hour
    (fresh price would pay 10,000 each time). Roughly what does the cached
    hour cost as a multiple of ONE fresh send — and about how many times
    cheaper than 20 uncached sends?
14. (S) A 429 storm hits at 14:00 daily. Your SDK retries three times,
    instantly. Why does this make the storm worse, and what two client-side
    changes tame it?
15. (R) A provider reserves quota up front per request. Which three token
    counts must you budget for (the reservation formula), and which one do
    beginners forget?
16. (S) Interactive agent loops and overnight eval batches are routed to
    the same model. Give the routing split the book argues for, with the
    one-line reason for each.

**Part IV — Harness meets engine**

17. (R) Name the two design rules for a cache-friendly agent prompt, and the
    one word for what breaks them.
18. (S) Compaction shrinks your context but your bill goes UP that hour.
    Give the mechanism (what did compaction do to the cached prefix?).
19. (A) Ten subagents each need the same 20,000-token shared preamble;
    writes 1.25×, reads 0.1×, and each subagent also sends 6,000 fresh
    tokens at 1×. Total cost in "units" for the shared part + fresh parts,
    versus ten naive full sends of 26,000 at 1×?
20. (R) In tinyengine, name the five instruments the money meter and
    scheduler are built from (one line each).
21. (S) You can rent from a big provider or run the open model yourself on
    one GPU. Give the book's two questions that decide it, and one honest
    reason most teams should still rent.

**Synthesis — across the whole book**

22. (S) "The 6pm slowdown": a team-wide agent product goes sluggish every
    evening; nothing in the code changed. Walk the diagnosis the book
    teaches — which three suspects, in what order, and which measurement
    fingerprints each?
23. (S) A founder wants "the cheapest AI" for a product that fans out
    10,000 subagent calls nightly. Using chapters 14–16, name the three
    levers that matter most at that scale, in priority order.
24. (A) An interactive deadline is 4 s; p95 TTFT on the current lane is
   1.5 s and p95 rhythm is 40 ms/token. What is the largest reply length
   (in tokens) that fits the deadline, using the book's decode-time
   inequality?
25. (R) Teach it back: in five sentences or fewer, explain "inference
    engineering" to a smart friend who has never read the book — one
    sentence for what it is, one for why it decides cost and speed, one for
    the engine's core trick, one for the customer's biggest lever, one for
    what you would measure first on a slow day.

---

## Answers

1. Model (wrong/silly answers — a knowledge failure), serving/kitchen (right
   answers, late or interrupted), harness/waiter (request never properly
   sent, or sent five times in a panic). Blame flows one direction: the
   harness can jam the kitchen; the kitchen cannot make the brain forget.
2. e2e ≈ TTFT + (N−1) × ITL = 2.0 + 499 × 0.05 = 2.0 + 24.95 ≈ **27 s**. The
   rhythm term dominates (~25 s of 27): this is a TPOT problem, not a
   TTFT problem.
3. Diagnose the kitchen (serving layer), not the brain. Ten lines: wrap one
   real streaming call with three timestamps (sent / first delta / last
   delta), compute TTFT and mean inter-token gap, check the identity. A
   TTFT blow-up or rhythm blow-up localizes the wait; a smarter model fixes
   neither.
4. Reading is parallel (all prompt tokens exist at once); writing is serial
   (each new token needs every token before it, including its own
   predecessors — a relay race with one runner).
5. Weights ≈ 8 B × 2 B = 16 GB read per token; 16 GB ÷ 3,350 GB/s ≈ 4.8 ms
   → ≈ **~210 tokens/s ceiling**. Bottleneck: memory bandwidth (the
   staircase), not compute.
6. Static batching waits to fill a fixed group and pads everyone to the
   longest request; continuous batching admits and retires requests every
   iteration (iteration-level scheduling), so no padding and no straggler
   wait. It schedules *decode iterations*, not whole requests.
7. The engine kept a copy of the prompt's computed state (the KV cache) and
   the second send hit the **prefix cache**; a **radix tree** holds shared
   prefixes so the reused part survives other traffic.
8. Prefill is compute-bound (reading is big parallel math); decode is
   bandwidth-bound (fetch the weights for one token, repeat). Chunked
   prefill splits big reads into bounded chunks so a huge prompt cannot
   freeze everyone else's decode rhythm.
9. Accepted ≈ 1 + α + α² + α³ + α⁴ = 1 + 0.75 + 0.5625 + 0.42 + 0.32 ≈
   **~3 tokens per pass** — about 3× plain decoding (assuming verification
   costs roughly one decode pass).
10. The grammar mask fights the drafter: accepted guesses that the schema
    would reject starve speculation (engines degrade or disable it).
    Workloads that still shine: free-form or code completion with repeated
    patterns and warm prefixes.
11. Each token only "reads" its routed experts' recipes (a fraction of the
    book), not all of it — active parameters are what matter for speed, so
    a big MoE can beat a small dense model per token.
12. Providers stream so the interface feels alive and tokens surface as
    generated; a tool call arrives as deltas split across chunks, so the
    harness needs an incremental **stream normalizer/reducer** that
    reassembles the call and can survive out-of-order or split fragments.
13. One write (10,000 × 1.25) + 19 reads (10,000 × 0.1 × 19) = 12,500 +
    19,000 = 31,500 units ≈ **~3.2× one fresh send**, versus 200,000 for 20
    uncached sends — **~6× cheaper** than uncached.
14. Instant synchronized retries re-peak the queue exactly when it is
    fullest (a thundering herd). Tame it: honor the retry-after /
    backoff-with-jitter, and schedule locally under the documented limit
    (client-side rate limiter) instead of discovering the ceiling by
    collision.
15. input tokens + **cache-write tokens** + max_tokens (the forgotten one
    is the cache-write premium — and over-estimating max_tokens wastes
    reserved headroom).
16. Fast lane (low TTFT, low TPOT) for interactive loops — latency is the
    product; cheap batch API lane for overnight evals — 24h latency
    tolerance buys ~50% off, throughput over latency.
17. Freeze the shared prefix (same opening words every time) and put
    volatile content last; the breaker is *compaction* (or any mid-prefix
    edit) — rewriting history invalidates everything cached after the cut.
18. Compaction rewrote the conversation summary, so the stable prefix
    changed → cache miss → the whole cache re-paid write prices that hour
    (invalidation is why "smaller context" can cost more).
19. Shared: one write 20,000 × 1.25 = 25,000 + nine reads 20,000 × 0.1 × 9
    = 18,000 → 43,000. Fresh: 10 × 6,000 = 60,000. Total ≈ **103,000
    units** vs naive 10 × 26,000 = 260,000 → ~2.5× cheaper.
20. Stream normalizer (one event truth), tracer (timestamps → TTFT/ITL),
    cache ledger (four money buckets), rate scheduler (reservation +
    reconcile), router (fallbacks + model choice).
21. Two questions: (1) Is your workload steady enough to keep one engine
    warm (utilization), and (2) do you need the price/latency control more
    than you fear the ops? Most teams should still rent because the
    kitchen's full-time staff (batching, paging, routing, updates) is the
    hidden cost of ownership.
22. Suspects in order: (1) serving-layer saturation — queue wait blowing
    up TTFT while rhythm stays flat (provider status / your timestamps);
    (2) rate limiting — 429s with retry storms (response codes + SDK
    behavior); (3) your own fanout — concurrency growth or cache
    invalidation (compare cache-hit rate evening vs morning). Evidence
    first, blame never.
23. (1) Prefix/cache discipline (the 0.1× read lever dominates at scale),
    (2) routing the bulk to the cheap/batch lane, (3) budget metering +
    per-fanout attribution so cost is visible before the invoice. (Rate
    limit choreography is the guardrail, not the lever.)
24. Deadline 4,000 ms − TTFT 1,500 ms = 2,500 ms of rhythm budget; 2,500 ÷
    40 = 62.5 → **~62 tokens** max reply length fits (63 pushes you over
    at the tail).
25. Graded against the plain-English guide's 14 napkin rules: three
    workers; billed in word-pieces; one-piece-at-a-time chain; fetching
    not thinking sets pace; grouping/shrinking are the kitchen's tricks;
    your lever is asking the same opening words and reading your receipts.
    (Any five faithful sentences pass; jargon without pictures does not.)

---

## Self-scoring rubric

Score 1 point per question (25 max; Q25 is all-or-nothing on the spirit).

| Score | Verdict | What it means |
|---|---|---|
| **22–25** | **Engineer of the engine room.** | You can diagnose, budget, and argue inference like a practitioner. You are ready to build tinyengine and to be believed in a design review. |
| **17–21** | **Dangerous customer.** | You understand the book; the misses mark the chapters to reread before you bet money or uptime on them. Rebuild hard-pile cards for missed chapters, retake in 3 days. |
| **12–16** | **Kitchen tourist.** | The pictures landed, the mechanisms are fuzzy. Work Part II and Part III kits again — most of your misses will be arithmetic (chapters 3, 14, 16). |
| **< 12** | **Still outside the kitchen.** | Start over with PLAIN-ENGLISH-GUIDE.md, then re-run kits for the chapters behind your weakest five answers. The book's promise: anyone can follow it — at their own pace. |

**What the score certifies:** 22+ means you can (a) explain every term on an
inference dashboard without jargon, (b) compute what a token costs and why,
(c) make an agent cheaper without changing the model, and (d) know which
lever belongs to the harness and which to the engine — the book's four
promises, checked.

---

*Kit files: `kit-ch01.md` … `kit-ch18.md` (cards / quiz / teach-back per
chapter). Book: github.com/arbazkhan971/inference-engineering-book*
