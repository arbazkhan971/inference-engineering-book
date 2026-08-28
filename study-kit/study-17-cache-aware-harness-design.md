# Study Kit — Chapter 17: Cache-aware harness design

*Pair with manuscript/17-cache-aware-harness-design.md. Facts below come from that chapter only.*

## Flashcards

- What is a session, in cache terms? :: A byte-exact asset — a growing sequence of bytes whose frozen head is cheap to re-read and expensive to rebuild.
- Why does a well-designed session get cheaper as it grows? :: Because its transcript only ever grows by appending at the end, which is the one change that costs nothing extra to the cached prefix.
- What are the five layers of the layered prompt contract, head to tail? :: Model/engine, then tools, then system prompt, then static context, then the transcript, with a volatile tail behind the last breakpoint.
- What happens to every cached block in every active session when a template deploy changes layer 1 or 2 bytes? :: They all die at once — a herd event that reverts the whole fleet to full prefill in one window.
- What is the one-sentence discipline for session-scale caching? :: Freeze the head, append the tail, and never let a serializer make decisions for you.
- How can code that never touches your prompt still break your cache? :: A serializer that walks a hash map can emit tool keys in a different order each run, changing the bytes and turning every request into a fresh write.
- What are the three timings of compaction, and which is the trap? :: Warm (while the cache lives), cold (at resume, on expired cache), and pre-idle (before the gap) — compacting cold at resume is the trap because the summary call re-reads the whole history at full price.
- Why does pre-idle compaction beat resuming cold on the full transcript? :: You run the summary while the history still reads at the discounted rate, so the gap costs you a summary-sized rebuild instead of a full one.
- When does a cache entry expire, and what restarts the clock? :: Five minutes after the last request starts by default (an hour on the premium tier), and every hit refreshes the clock for free.
- What does a cold resume cost compared to a warm read? :: A 25-percent premium over full price to rebuild — 12.5 times the warm read — plus a time-to-first-token spike while the whole transcript re-prefills.
- What is the replay rule, in four words? :: Bytes, not meaning — resume with the identical bytes you left with, never re-formatted.
- What is the fingerprint of a broken replay pipeline? :: Cache-read share collapses in the usage fields exactly on resume events and nowhere else, with no error in any log.
- What is the 20-block lookback trap? :: Reads walk backward at most 20 blocks per breakpoint, so a transcript grown past that window misses silently — leapfrog new breakpoints before the tail escapes.
- In cache terms, what does spawning a subagent do to the parent? :: It appends one tool call to the parent's transcript — the parent's cache stays intact — while the child starts its own fresh prefix.
- Why should a child return a compact summary, not its raw tool debris? :: Appended bytes get re-read at the discounted rate every turn forever, so garbage in the transcript is a permanent cost; the archive on disk costs nothing per turn.

## Quiz

1. The core thesis of cache-aware harness design is that a session is:
   - (a) a conversation whose meaning the provider remembers
   - (b) a byte-exact asset whose frozen head is cheap to re-read and costly to rebuild (✓)
   - (c) a memory that the model keeps between requests
   - (d) a billing abstraction with no physical reality

2. A JSON serializer emits tool keys in hash-map order, which can differ run to run. The chapter calls this:
   - (a) a harmless style choice
   - (b) a named cache-breaker that rewrites your frozen layer on every request (✓)
   - (c) a provider-side bug you cannot fix
   - (d) acceptable because hashes still match on average

3. Ten subagents of one type share a spawn template. In uncached-equivalent units with write at 1.25× and read at 0.1×, the fleet costs:
   - (a) 10× the uncached fleet
   - (b) 1.25 + 0.1·(N−1), about 2.15× for ten children (✓)
   - (c) 0.1·N, about 1× total
   - (d) 1.25·N, about 12.5×

4. A 200K-token session idles past the 5-minute TTL, then takes one more turn. The gap costs roughly:
   - (a) nothing — the transcript is yours forever
   - (b) a 0.1× warm read
   - (c) a 1.25× full-prefix write plus a re-prefill latency spike (✓)
   - (d) a new session fee charged by the provider

5. On the 5-minute plan, how many idle gaps longer than five minutes already justify paying the 1-hour premium write?
   - (a) One
   - (b) Two (✓)
   - (c) Ten
   - (d) Never — the premium is always worse

6. A fork that wants to inherit the parent's cached prefix must:
   - (a) use a different model for safety
   - (b) replay the parent transcript byte-for-byte, then diverge (✓)
   - (c) re-serialize the parent's messages in its own format first
   - (d) summarize the parent transcript before branching

7. Compacting 150K cached tokens down to a 30K summary breaks even after how many turns?
   - (a) Immediately — compaction is always cheaper
   - (b) About 2.5 turns, so ahead from the third turn after the rewrite (✓)
   - (c) About 15 turns
   - (d) Never — the summary write dominates forever

8. The provider-side caveat that bites parallel same-type children on Anthropic is:
   - (a) children cannot share tool schemas
   - (b) a cache entry only becomes available once the first response begins, so stagger the fleet behind the first child's write (✓)
   - (c) subagents are limited to five-minute TTLs on all providers
   - (d) the parent's cache dies the moment a child spawns

### Worked arithmetic answers

**Q3:** Cost of the shared-preamble fleet = first child writes at 1.25×, the other N−1 children read at 0.1×: 1.25 + 0.1·(10−1) = 1.25 + 0.9 = **2.15×**, versus 10× uncached — the 4.7× gap the chapter derives from the published multipliers.

**Q7:** Before compaction each turn re-reads the 150K prefix at 0.1× = 15K token-equivalents per turn. After compacting to 30K you pay one 30K full-price re-prefill, then 30K × 0.1× = 3K per turn. Break-even when 30K + 3K·t = 15K·t → 30K = 12K·t → **t = 2.5 turns** — ahead from the third turn, and widening.

## Teach-back prompts

1. Explain to a colleague why "the session is a byte-exact asset, not a conversation" — using the courier-office photostat picture, and saying exactly what happens when one comma changes on page 3.
2. Your team's bill runs hot every Monday. Walk someone through the resume-hygiene field note: what the meter showed, why no log caught it, and the one-line fix.
3. Teach the three compaction timings (warm, cold, pre-idle) with the lunch-break story: when to compact relative to a gap, and why compacting at resume is the trap.
