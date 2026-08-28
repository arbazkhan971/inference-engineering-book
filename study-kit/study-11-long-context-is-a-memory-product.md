# Study Kit — Chapter 11: Long context is a memory product

## FLASHCARDS

- What is the difference between a claimed and an effective context window? :: Claimed is what the door admits; effective is what the model still works with — the stadium's seat count versus the rows from which you can actually hear the stage.
- What are ISL and KVSL? :: ISL (input sequence length) is the token count of what you send; KVSL (KV-cache sequence length) is everything the model has seen so far this request — the case file plus every note taken since.
- Why does entering a very long context cost so much? :: Prefill is quadratic — every token must be cross-referenced with every other token, like a million handshakes per page before the lawyer says a word.
- Why is *staying* in a long context expensive too? :: Every new token the model writes must be checked against the entire running memory, so the per-token work grows with everything seen so far.
- What is context parallelism? :: Sharding one long sequence across many chips, each holding a slice of tokens, with attention solved by passing data between them — like a case file split among clerks.
- How do Ring Attention and DeepSpeed-Ulysses differ? :: Ring Attention circulates the KV blocks chip to chip until every query has seen them; Ulysses instead scatters by attention head so each chip computes whole attention for a few heads.
- What are Pass-KV and Pass-Q? :: Two ways to route the moving parts: send the cached keys/values to the queries (favors long prefill), or send the small set of new queries to where the cache lives (favors small-batch decode).
- What does context parallelism NOT divide? :: The work — it divides only the wait: sharding spread a 1M-token prefill of Llama 3 405B across 128 H100s and still took 77 seconds, because the total bill is unchanged.
- What is tiered long-context pricing? :: The input price jumps when the prompt crosses a length boundary, and the *whole request* reprices — like the meter jumping when you cross the county line.
- What is "lost in the middle"? :: Facts placed mid-context are retrieved worse than facts at the beginning or end — primacy and recency, like recalling a speech's opening and close but not its middle.
- What is the hot–cold–hot layout? :: Put the stable system head first, the bulk of retrieved documents in the cold middle, and live instructions plus latest facts at the tail — never critical material in the middle.
- What is compaction? :: Replacing older turns with a model-written summary — one page of minutes instead of forty of transcript; a different document, not a smaller transcript.
- Why does compaction break the prompt cache? :: Caches match an exact token prefix, and rewriting history — even with a faithful summary — is a hard break that forces a full re-prefill at full input price.
- What dies first when you compact? :: Exact artifacts — IDs, paths, parameters, side constraints — with only about 17% of injected constraints surviving a typical compaction, while an explicit extractor preserves over 90%.
- What is core memory? :: A small always-in-context block kept verbatim and never summarized — your wristband of room numbers; the summary may lie about the room number, the state file cannot.
- What should your working context cap come from? :: The smallest of three ceilings — your measured effective context, the price-tier boundary, and (if self-hosting) KV admission arithmetic — never the claimed window.

## QUIZ

1. A model card advertises a 10M-token context window. What does that number actually guarantee?
   - a) The model can accurately use all 10M tokens
   - b) The serving stack will admit inputs up to that length — accuracy at that length is a separate question (✓)
   - c) The provider will cache the full window for free
   - d) Output can also be 10M tokens

2. Which pairing correctly matches cost to scaling?
   - a) Prefill linear in ISL; decode quadratic in KVSL
   - b) Prefill quadratic in ISL; decode linear in KVSL (✓)
   - c) Both linear
   - d) Both quadratic

3. *(arithmetic)* On mid-2026 Gemini 3.1 Pro rates ($2/MTok input ≤200K, $4/MTok above), how do a 250K-input request and a 199K-input request compare on input cost, and what does that ratio illustrate?
   - a) $1.00 vs $0.40 — about 2.5× cheaper trimmed, because the whole prompt reprices at the boundary (✓)
   - b) $0.50 vs $0.40 — nearly the same, only the extra tokens cost more
   - c) $1.00 vs $0.80 — the tier only applies to tokens beyond 200K
   - d) $2.00 vs $0.40 — the big request costs five times more

   *Worked:* 250,000/1,000,000 × $4 = $1.00; 199,000/1,000,000 × $2 = $0.398. Ratio ≈ $1.00/$0.398 ≈ 2.5×. Tiering is per-prompt, not per-marginal-token — cross the line and everything reprices.

4. A colleague says "just shard across more GPUs with CP to make long context cheap." What does the chapter's own receipt say?
   - a) CP divides the quadratic work by the number of chips
   - b) CP divides the wall-clock wait, not the work — the invoice (seconds, GPUs, surcharge tier) remains (✓)
   - c) CP reduces effective attention quality, lowering price
   - d) CP eliminates the KV cache

5. Where should the user's current instruction go in a retrieval-augmented prompt with two 50K-token document dumps?
   - a) Between the dumps, for balance
   - b) At the head or the tail — never the middle — per lost-in-the-middle (✓)
   - c) Inside the first dump so it's cached
   - d) In a separate follow-up request

6. *(arithmetic)* Baseline recall of injected facts at 190K tokens is 73%. What happens after 50% compaction and after 98% compaction?
   - a) 65% then 50% — recall declines gently
   - b) 40% then 7% — the curve collapses, and it is only visible if you probe (✓)
   - c) 73% unchanged — summaries preserve facts verbatim
   - d) 90% then 40% — compaction improves mid-context recall

   *Worked:* The benchmark's measured curve: 73% → 40% (50% compacted) → 7% (98% compacted). The summary is a different document; it transforms rather than preserves exact tokens.

7. Why does compaction invalidate the prompt cache even though the summary is "of" the same conversation?
   - a) The provider detects summaries and disables caching as policy
   - b) Caches match an exact token prefix, and any history rewrite — including summarization — is a semantic break that forces a full re-prefill (✓)
   - c) Summaries are too short to cache
   - d) The cache key includes output tokens, which compaction changes

8. What survives compaction best?
   - a) The model's summary of the conversation
   - b) A verbatim externalized block — core memory or a structured state file — with constraint extractors preserving over 90% where plain compactors keep ~17% (✓)
   - c) The oldest turns, because they were cached longest
   - d) Retrieval documents, because they sit mid-context

## TEACH-BACK (Feynman)

1. **The three numbers behind one billboard.** Using your own everyday example (not the stadium), explain to a friend what a "10M context" announcement really contains: what the door admits, what the mind holds, and what the invoice says — and why the ticket site prints only the first number.
2. **Pack the truck.** Teach the moving-truck picture of context design: what gets strapped in first and never repacked, where new boxes go, why you never rearrange at a red light, what rides in the cab, and when — on what test — you unload into storage.
3. **Sell the trim to a CFO.** Explain why cutting a prompt from 250K to 199K tokens can cut the input bill about 2.5× *and* raise per-token attention quality at the same time — and why the same trim past the wrong boundary stops paying.
