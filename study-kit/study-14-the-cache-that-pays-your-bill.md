# Study Kit — Chapter 14: The Cache That Pays Your Bill

*Companion to "Inference Engineering," Part III — The API contract. Use the flashcards first, take the quiz closed-book, then teach it back.*

## FLASHCARDS

- What does a prompt cache store and reuse? :: The engine's computed state for a prompt's opening tokens, so a later request whose opening bytes match exactly skips that prefill compute.
- What is a cache write versus a cache read? :: The first request computes and stores a prefix's state — paying a premium — while later requests reuse it at a steep discount.
- What ends cache reuse? :: The first differing byte — one changed word re-inks the rest of the page; matching is byte-exact or nothing.
- What is a breakpoint? :: An explicit marker saying "cache up to here" — Anthropic allows up to four per request, and a fifth returns an error.
- What is a TTL's strangest quirk? :: The clock starts at request start — generation time burns it — and every hit resets it for free.
- Implicit versus explicit caching? :: Implicit means the provider caches automatically and you change nothing; explicit means you mark boundaries and pay listed prices.
- How does Anthropic price its cache? :: Writes at 1.25× base input for a 5-minute entry or 2× for 1-hour, reads at 0.1×, with per-model minimum cacheable prefixes.
- What is OpenAI's honesty clause? :: Caching is best-effort — traffic above roughly 15 requests per minute per organization can overflow-route to machines without your state, a silent miss.
- What is Gemini's fourth model of cache ownership? :: An explicit cache object you rent by the token-hour plus discounted reads — storage and reads, a durable thing you pay to keep.
- What is the break-even formula for a written prefix? :: Reuses N ≥ (write price − 1) ÷ (1 − read price) — at 1.25/0.1 that is about 0.28, so one reuse already pays the premium.
- What separates the two loop-cache strategies? :: Prefix-only caching saves about a third in a 25-turn loop, while incremental caching — history blocks written once, read ever after — saves about 83%.
- Name the documented cache-breakers. :: Timestamps in the static system prompt, nondeterministic tool ordering, toggling features mid-session, adding or removing images, changing thinking parameters, switching models.
- Why is render order the invalidation order? :: Providers assemble tools, then system, then messages — editing a tool invalidates everything after it, while appending a message extends the cache.
- What is the system-reminder pattern? :: Keep the system prompt byte-frozen and deliver dates, file state, and session facts as appended message content near the end of the request.
- How should tool-heavy agents avoid re-engraving? :: Ship tool stubs plus a tool-search mechanism so the tool list stays byte-stable while the model pulls full schemas on demand — stub, don't churn.
- What is a keep-alive? :: A minimal cache-reading request whose only job is refreshing the TTL — it costs one cheap read, far less than any re-write.
- What is a cache salt and why is it a money decision? :: A value mixed into the cache key to keep tenants apart — shared prefixes maximize hit rate, but co-residency may fail a privacy review.
- What number belongs on the dashboard? :: The hit rate — cached tokens divided by cached plus fresh input — which catches cache-herd events in minutes while the invoice takes a month.

## QUIZ

1. When does cache reuse end for a request?
   - (a) After the TTL expires, whenever that happens
   - (b) At the first differing byte from the stored prefix — everything after it is recomputed
   - (c) When output tokens exceed max_tokens
   - (d) When the provider's scheduler rotates machines nightly

2. Your OpenAI org's cached share sags during a 40-request-per-minute fanout over one shared prefix. What happened?
   - (a) The schema grammar fought the model
   - (b) Overflow routing past the ~15-requests-per-minute line sent requests to machines without your state
   - (c) The prefix fell under the minimum cacheable length
   - (d) The TTL reset on every hit

3. Which single edit invalidates the most cache?
   - (a) Appending a new message
   - (b) Editing a tool definition
   - (c) Delivering today's date through a tail message
   - (d) Reading the cache with a keep-alive

4. Where should per-turn state (current time, file status) live?
   - (a) In the static system prompt, for consistency
   - (b) In the tool list, next to the schema it affects
   - (c) As appended message content near the end of the request
   - (d) In the model's temperature setting

5. A 100,000-token prefix at $3 per million input, write 1.25×, read 0.1×, ten turns in a session. What is the total prefix cost with caching, versus without?
   - (a) $0.645 cached versus $3.00 uncached — about 79% saved
   - (b) $0.375 cached versus $3.00 uncached — about 88% saved
   - (c) $2.70 cached versus $3.00 uncached — about 10% saved
   - (d) $0.270 cached versus $3.00 uncached — about 91% saved

6. At write 1.25× and read 0.1×, how many reuses before the write premium pays for itself?
   - (a) Ten reuses
   - (b) One reuse — N ≥ 0.25 ÷ 0.9 ≈ 0.28
   - (c) Two reuses — the 1-hour rule applies to all writes
   - (d) Never — the premium is sunk cost

7. Why does the 5-minute TTL endanger a 4-minute streamed response?
   - (a) Streams bypass the cache entirely
   - (b) The clock starts at request start, so generation time burns it — about one minute of life remains
   - (c) Streaming rewrites the prefix every token
   - (d) The TTL only applies to output tokens

8. In the 25-turn chart, why does prefix-only caching run nearly parallel to the no-cache line?
   - (a) The write premium recurs every turn
   - (b) The growing history still pays full input price — only the frozen head is read at 0.1×
   - (c) The hit rate decays linearly with turns
   - (d) The TTL expires once per five turns

**Worked answers (arithmetic):**

- **Q5:** Write: 100,000 × $3/M × 1.25 = $0.375. Reads: 9 × 100,000 × $3/M × 0.1 = $0.270. Total **$0.645** versus 10 × 100,000 × $3/M = **$3.00** — about **79% saved** (the chapter's worked example at the 2026-08-27 multipliers).
- **Q6:** N ≥ (w − 1)/(1 − r) = (1.25 − 1)/(1 − 0.1) = 0.25/0.9 ≈ **0.28** — one reuse already pays; the provider's own docs state it as paying off "after one cache read" at the 5-minute price.

## TEACH-BACK

1. Explain the punch-card analogy — enrollment fee, member pricing, and the expiry twist — then say honestly where the picture stops (member pricing still charges 10%, and the warehouse can silently lose your pallet).
2. Teach "render order is the invalidation order" with the form-letter picture: what lives on the frozen letterhead, what lives in the typed body, and exactly where a re-fetched document must be inserted so you lose only the tail's cache.
3. Explain the gap between ~32% and ~83% savings in a 25-turn loop: why the growing transcript only caches when every earlier byte stays identical, and name the three habits that quietly break it.
