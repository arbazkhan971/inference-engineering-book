# Study Kit — Chapter 6: Paging the brain

*Flashcards, quiz, and teach-backs for "Paging the brain."
Every fact comes from the chapter itself. Cover the answer, say it out loud, then check.*

## Flashcards

- When serving engines were first measured carefully (2023), what fraction of the model's conversation memory was actually useful? :: Only about 20–38% — the rest was waste of one kind or another.
- Why is wasted memory a *throughput* problem and not just an accounting problem? :: Fewer requests fit in memory, so the batch shrinks and the engine serves fewer people — you pay for waste as missing concurrency.
- What are the three wastes of the old contiguous allocation policy? :: Reserved-but-empty tails inside each request (internal fragmentation), holes too scattered to reassemble (external fragmentation), and duplicate copies of identical shared prompts.
- In the chapter's worked example, how much memory did one request to the old 13B-class model reserve? :: About 1.6 GB — 2,048 possible tokens at roughly 800 KB each — reserved up front at admission, mostly never touched.
- What is PagedAttention's trick, in one sentence? :: Cut each conversation's memory into fixed-size blocks, keep a ledger mapping each conversation position to its physical slot, and let the pieces live anywhere in memory.
- What is a block table? :: The per-request ledger mapping "my Nth chunk" to its physical memory slot — structurally the same idea as a hotel front desk's list of room numbers.
- After paging arrives, what waste is left? :: At most one partially-filled block per request — every other block is instantly reusable because all slots are the same size.
- Why can two requests literally share memory blocks? :: If their leading tokens are identical, the stored attention state is byte-identical down to the bit — sharing is exact, not an approximation.
- What is copy-on-write for? :: Shared blocks stay shared until one owner diverges, at which point the engine copies first and writes into the copy — beam-search candidates share their whole trunk this way.
- The paged attention kernel got slower per call — so why did the engine get faster? :: The kernel was 20–26% slower per call, but near-zero waste let far more riders fit, and the engine served 2–4× more throughput: memory, not math, was the binding constraint.
- What is prefix caching? :: Reusing the stored attention state for a leading run of tokens seen before — like a translator keeping her notes on the same contract, so the second visit reads only what is new.
- Why is a reply served from cache guaranteed identical to a cold one? :: The stored state depends only on the prefix and the model's weights — prefill is deterministic, so reuse changes nothing about the output.
- What breaks a prefix-cache hit, exactly? :: A one-token difference at position k invalidates every block from k onward (and nothing before it), and only *full* blocks count — the cache is brutally positional.
- In the mid-2026 snapshot, how does the explicit provider-style cache price reads and writes? :: Reads at about 0.1× the input price; writes at a premium — 1.25× for a five-minute lifetime, 2× for an hour.
- What is the one rule of prompt assembly if you want cache hits? :: Frozen content first (system prompt, tool schemas), varying content last (user turn, timestamps) — because a change only invalidates the tail.
- What is semantic caching, and why does this chapter treat it differently? :: Matching *similar* rather than identical prompts to stored answers — it can return confidently wrong answers, so it is an application-layer risk decision, not an engine guarantee.

## Quiz

**1. Why did the old allocator reserve one long contiguous block per request?**
- A) GPUs cannot address memory above 2 GB
- B) The attention kernel wants to sweep a sequence's memory as fast, contiguous chunks, and GPU memory cannot grow a buffer in place ✓
- C) It made billing simpler for providers
- D) Requests arrived with known output lengths

**2. Under the old policy, a request reserves memory sized for…**
- A) its actual output length, checked at admission
- B) its *maximum possible* length — the worst case ✓
- C) the average of the batch's lengths
- D) one fixed block of 16 tokens

**3. (Arithmetic) A 13B-class request with a 2,048-token cap actually generates 512 tokens. Roughly what fraction of its ~1.6 GB reservation was never touched?**
- A) About one quarter
- B) About one half
- C) About three quarters ✓
- D) None — the reservation matched the output

*Worked: 512 of 2,048 possible tokens were used — one quarter. The untouched part is 2,048 − 512 = 1,536 of 2,048, which is three quarters.*

**4. (Arithmetic) With 16-token blocks at about 800 KB per token, roughly how big is one block — and what is that next to a 1.6 GB reservation?**
- A) About 12.5 MB — under 1% of the reservation ✓
- B) About 125 MB — about 8% of the reservation
- C) About 1.6 MB — one thousandth of the reservation
- D) About 800 KB — the same as one token

*Worked: 16 tokens × 800 KB = 12,800 KB ≈ 12.5 MB. Against ~1,600 MB, that is about 0.8% — so paging shrinks the worst-case waste from three quarters of the reservation to under 1%.*

**5. In the worked cache example (block size 4), request A is 14 tokens and request B shares A's first 10 tokens. How many of B's first 10 tokens skip prefill?**
- A) All 10 — the shared run matches
- B) 8 — the two full blocks hit; the partially-matching block misses ✓
- C) 4 — only the first block can ever hit
- D) 0 — partial matches are no matches

*Worked: blocks 0–1 cover tokens 0–7 and are full and identical — hit (8 tokens). Block 2 covers tokens 8–11 but only 2 of its 4 tokens match, so its hash differs — miss. Skipped: 8 of 10.*

**6. Two requests share a system prompt. When does the engine actually copy the shared block instead of continuing to share it?**
- A) When the second request arrives
- B) When one owner diverges — the engine copies first, then writes into the copy (copy-on-write) ✓
- C) Every iteration, to stay safe
- D) Never — sharing is permanent

**7. A well-meaning engineer puts a fresh request ID at the top of the system prompt. What happens to the cache?**
- A) Nothing — the ID is too short to matter
- B) Every request becomes unique at the first block, so every block after it misses — total cache death ✓
- C) Only the last block misses
- D) The cache stores both versions automatically

**8. What is the difference between exact-match caching and semantic caching?**
- A) Exact-match uses hashes; semantic uses timestamps
- B) Exact-match reuses state for identical tokens and guarantees identical outputs; semantic matches similar prompts and can return wrong answers ✓
- C) Semantic caching is faster because it skips the ledger
- D) They are two names for the same engine feature

## Teach-back prompts

1. Explain the block-table idea with your own everyday analogy (a library, a coat check, a warehouse) — it must carry all four parts: fixed-size pieces, a per-person ledger, pieces living anywhere, and instant reuse when someone leaves.
2. Explain to a colleague why moving an eleven-token request ID from the top of the system prompt to the end of the user turn can change first-token speed (or cost) by an order of magnitude — without changing anything about the model.
3. The chapter says the kernel got slower and the engine got faster. Teach that reconciliation out loud, connecting it to what limits a busy engine: memory, not math.
