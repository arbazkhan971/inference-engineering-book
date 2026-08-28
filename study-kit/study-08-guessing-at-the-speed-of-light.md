# Study Kit — Chapter 8: Guessing at the Speed of Light

*Pairs with `manuscript/08-guessing-at-the-speed-of-light.md`. Cover the answer, say it aloud, check yourself. Quiz at the end.*

## Flashcards

- What is speculative decoding, in one sentence? :: Let something cheap guess several tokens ahead, then let the real model check all the guesses in one pass.
- Why is checking cheaper than writing? :: A decode step's cost is streaming the model's weights — the same weight-reading pass can score several guessed tokens almost for free, the way one skim checks a whole Sudoku row.
- What does the drafter do, and who is the target? :: The drafter (a small model, extra heads, or plain string matching) proposes the next few tokens; the target is the real model whose outputs you actually want.
- What happens at the first bad guess? :: That token and every later guess are discarded, and a replacement is sampled from a corrected distribution — the rule that provably keeps the output identical in distribution to the big model alone.
- What is the acceptance rate α? :: The probability that one guessed token survives verification — the exchange rate of the whole scheme.
- Why is speculation called a convex bet on the drafter? :: Good guessers compound — acceptance near 0.9 yields about 4.1 tokens per pass — while mediocre guessers barely clear their postage (about 1.25 tokens at 0.2).
- What is prompt lookup (n-gram) speculation, and why do agents love it? :: A drafter with no model at all — it copies phrases found in the prompt itself — perfect when the answer echoes the input, like quoting documents or echoing tool output.
- What is the draft length γ? :: How many tokens the drafter guesses per round before verification.
- What does temperature do to acceptance? :: At temperature 0 the target also wants the most-likely token, so agreement is near-certain; at temperature 1 the widened sampling diverges, costing roughly 15–25% of the speedup on three of four measured models.
- Why does a JSON schema starve the drafter? :: Grammar-constrained decoding masks every forbidden token before sampling, so freehand guesses keep dying at the door — the shapes fight.
- When does the checker's discount shrink even without schemas? :: At high batch the engine becomes compute-bound, so the wider verify pass charges real arithmetic instead of riding free.
- What is the MagicDec exception? :: For long sequences (roughly 4,000 tokens up), the pass is bandwidth-bound again because cache reads join the weights — so speculation can pay even at large batch, up to about 2.5×.
- What is the TTFT blind spot? :: Speculation only accelerates the loop after the first token — the prompt still gets fully read first, so first-token time does not move.
- Why watch acceptance rate over time? :: Falling acceptance is a drift canary — the engine is quietly paying for rejected drafts because the workload moved away from what the drafter was built for.
- What budgeting rule does the chapter give provider-API users? :: Budget on un-speculated numbers and treat speculation as upside — you cannot see or control the provider's engine anyway.
- What deployment quirk should you check before enabling speculation on shared hardware? :: Some engines fix the draft length per deployment with no per-request disable — the kind of detail that pages you at 3 a.m. during a traffic peak.
- What does "distribution-identical" promise, and not promise? :: It promises the outputs match the big model's sampling distribution — not that every string matches bit-for-bit across runs, especially above temperature 0.

## Quiz

**1. What makes the verify pass nearly free at batch size 1?**
- A) The target model skips layers for short drafts
- B) Decode is bandwidth-bound, so extra token positions ride along on a weight-reading pass that happens anyway (✓)
- C) GPUs have special guessing circuits
- D) The drafter compresses the prompt first

**2. What is the correction rule at the first rejected guess?**
- A) Restart the whole request from the first token
- B) Discard it and all later guesses, then sample from the corrected distribution (✓)
- C) Average the drafter's and target's choices
- D) Keep the token but flag it for re-check

**3. Which drafter species contains no model at all?**
- A) Medusa
- B) EAGLE
- C) Prompt lookup / n-gram (✓)
- D) Small draft model

**4. *Arithmetic.* With α = 0.7 and γ = 4, expected progress per verify pass is (1 − 0.7⁵)/(1 − 0.7). About how many tokens, and what survives a 25% overhead?**
- A) ≈ 2.77 tokens; ≈ 2.2× net (✓)
- B) ≈ 4.10 tokens; ≈ 3.3× net
- C) ≈ 1.94 tokens; ≈ 1.6× net
- D) ≈ 3.36 tokens; ≈ 2.8× net

**5. Your endpoint quotes retrieved documents at temperature 0. Which change kills its speculation gains?**
- A) Raising the context window
- B) Switching to schema-constrained JSON output (✓)
- C) Enabling streaming
- D) Shortening the answers

**6. Why does high batch hurt speculation?**
- A) Batches confuse the drafter's training
- B) At high batch the engine is compute-bound, so the wider verify pass costs real arithmetic instead of riding free (✓)
- C) Batches disable the rejection sampler
- D) High batch forces temperature to 1

**7. *Arithmetic.* A team expects the "published 3×" speculation speedup to cut their product's time-to-first-token in half. What does the chapter say?**
- A) Correct — speculation halves TTFT too
- B) Wrong — speculation does nothing for TTFT; it only accelerates the loop after the first token (✓)
- C) Correct only at temperature 1
- D) Wrong — speculation doubles TTFT

**8. What should a provider-API user do about speculation in their latency budgets?**
- A) Demand the provider publish acceptance rates
- B) Budget on un-speculated numbers and treat any engine speculation as upside (✓)
- C) Turn speculation off via a request header
- D) Multiply all budgets by three

**Worked answers (arithmetic):**
- **Q4:** E[progress] = (1 − α^(γ+1))/(1 − α) = (1 − 0.7⁵)/(0.3) = (1 − 0.16807)/0.3 ≈ **2.77 tokens per verify pass**. With 25% draft-and-verify overhead, net ≈ 2.77 ÷ 1.25 ≈ **2.2×**.
- **Q7:** No arithmetic needed beyond the structural fact: speculation accelerates decode only — the prompt must still be fully prefilled first, so TTFT (the first-token clock) does not move. (For calibration, the chapter's α = 0.8, γ = 4 case: 3.36 tokens per pass, ≈ 2.8× net at 20% overhead.)

## Teach-back prompts

1. **The Sudoku sell.** Convince a skeptical colleague that "check five guesses in one skim" can arrive at exactly the same words the expert would have written — and explain honestly what "distribution-identical" does and does not promise.
2. **The convex bet.** Draw the curve of tokens-per-pass versus acceptance rate from memory, and explain to a product manager why the same flag that triples one endpoint's speed can tax another's — naming the three workloads where it hurts.
3. **The wrong clock.** Your PM wants to budget a 3× speculative speedup against a product whose pain is long prompts and short answers. Teach them the TTFT blind spot, and point them at the chapters that own their actual lever.

---

*All facts from chapter 8 of Inference Engineering (Harness Engineering Series, Vol. II). Numbers as dated in the chapter.*
