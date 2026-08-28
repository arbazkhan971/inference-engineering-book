# Study Kit — Chapter 2: The shape of a token

*Flashcards, quiz, and teach-back prompts for Part I, Chapter 2. Every fact comes from the chapter; nothing new is claimed.*

## Flashcards

- What is a token in plain words? :: A chunk of text from a fixed catalog that the model reads or writes one at a time — a puzzle piece with a fixed shape.
- What is a tokenizer? :: The machine that chops your text into catalog chunks — like a kitchen's chopping style: dice, julienne, or whole.
- Why is a token called a "private currency"? :: Every vendor mints its own — the same paragraph is a different token count on every model, and there is no global exchange rate.
- What is byte-pair encoding (BPE)? :: The recipe that builds a vocabulary by repeatedly merging the most frequent adjacent byte pairs — inventing shorthand for your most-used phrases.
- What is the picnic-planning rule of thumb for English? :: About 4 characters per token, and 100 tokens ≈ 75 words — fine for planning, useless for billing.
- Why did Claude token budgets silently inflate about 30% one day? :: Claude 4.7 and later switched to a newer tokenizer that produces ~30% more tokens for the same text — model versions are tokenizer versions.
- Why do models fail at "how many r's are in strawberry"? :: The word is one or two tokens, so the model never sees the individual letters — the question probes memorized spellings, not the model's real input.
- What is prefill? :: The phase that reads your whole prompt in parallel, because all of it exists at once.
- Why is decode serial? :: Each token is generated from all the tokens before it — like autocorrect, you cannot ask for the fourth word without accepting the first three.
- What are the four clocks of latency? :: TTFT (time to first token), ITL (one gap between tokens), TPOT (the average gap), and end-to-end (send to last token).
- What is the difference between ITL and TPOT? :: ITL is one sample — a single gap; TPOT is the mean over the whole reply — a summary that hides the stutter.
- What is the decode-time inequality? :: e2e ≈ TTFT + N × TPOT — a taxi meter: flag drop plus per-mile rate, where N is the output length you chose.
- Why do ten more GPUs barely speed up one user's stream? :: Each decode step streams the whole model through memory — bandwidth, not compute, sets the pace; extra chips mostly serve other people's streams.
- What is the reasoning-model TTFT trap? :: Benchmarks may count the first reasoning token, so TTFT looks excellent while the user stares at nothing — your harness should measure time to first visible token.
- What streaming speeds feel how? :: Below roughly 5–8 tokens/s feels like crawling; 20–30 feels fluid; above ~50, extra speed is imperceptible for reading.
- How do commas help arithmetic reliability? :: Comma-delimited groups tokenize right-aligned to powers of 1000, so the "234" in different numbers means the same units — a documented factor in arithmetic reliability.
- What is the budget-inversion formula? :: max N ≤ (D − TTFT) × P — the deadline minus the flag drop, times the pace you require.
- What should you do whenever the model version changes? :: Re-baseline token estimates from live `usage` counts — a tokenizer shift silently breaks every cap, forecast, and context budget.

## Quiz

**1. Why is the 4-characters-per-token rule dangerous for billing?**
- a) It is wrong even for English
- b) It describes English prose on English-trained vocabularies — and digits, other languages, and code run 2–3× denser (✓)
- c) Providers actually bill in characters
- d) It was withdrawn in 2025

**2. Which tokenizer behavior helps arithmetic reliability?**
- a) Splitting every digit into its own token
- b) Comma-grouping that right-aligns number groups to powers of 1000 (✓)
- c) Greedy longest-match merging
- d) Treating spaces as part of the training stream

**3. TTFT is 300 ms, mean ITL is 22 ms, and `usage` reports 250 output tokens. What is e2e?**
- a) About 2.5 s
- b) About 5.78 s (✓)
- c) About 7.6 s
- d) About 5.4 s

**4. A call site has a 6-second perceived deadline, measured p95 TTFT of 800 ms, and p95 pace of 30 tokens/s. What `max_tokens` follows?**
- a) About 240
- b) About 156 (✓)
- c) About 180
- d) About 45

**5. A 12-digit number costs 12 tokens on one tokenizer family and 4 on another. What differs?**
- a) The vocabulary size only
- b) The digit-splitting style: every-digit splitting versus 3-digit chunk grouping (✓)
- c) The numerical precision
- d) The batching policy

**6. In e2e ≈ TTFT + N × TPOT, which term is 100% yours?**
- a) TTFT — the intercept
- b) TPOT — the slope
- c) N — the output length (✓)
- d) None of them

**7. In one 2025 study, stripping indentation and formatting from code cut input tokens by ~24.5% while pass@1 held. Why?**
- a) Code tokenizes like English
- b) Byte-level tokenizers charge for the whitespace and indentation that models turned out not to need (✓)
- c) The models ignored the code entirely
- d) The cache absorbed it

**8. A five-step agent chain emits 500 tokens per step at 40 ms TPOT. How much time does decode alone burn?**
- a) 20 s
- b) 100 s (✓)
- c) 2 s
- d) 40 s

### Worked answers (arithmetic questions)

**Q3.** Use the identity e2e ≈ TTFT + (N − 1) × mean ITL: 0.3 s + 249 × 0.022 s = 0.3 + 5.478 ≈ **5.78 s**. The decode term dominates by more than 18×. (b)

**Q4.** From the budget-inversion formula, max N ≤ (D − TTFT) × P: (6.0 − 0.8) s = 5.2 s; 5.2 × 30 tokens/s = **156 tokens**. The arithmetic owns the truncation decision instead of folklore. (b)

**Q8.** Serial hops multiply: 5 steps × 500 tokens × 0.040 s/token = **100 s** of decode alone, before any tool latency. (b)

## Teach-back prompts

1. Explain to a colleague why "estimate the cost in words" is a category error — use the foreign-currency picture plus one real edge case (digits, non-English text, or code formatting).
2. Teach the decode-time inequality with the taxi meter: which part is the flag drop, which is the per-mile rate, and which term do you fully own? Then work a budget for a 5-second deadline at a 25 tokens/s pace.
3. Explain to a product manager why a reasoning model can post an excellent TTFT while users still call it slow — and name the one measurement your harness must own because of it.
