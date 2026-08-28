# Study Kit — Chapter 15: Rate Limits Are Physics

*Companion to "Inference Engineering," Part III — The API contract. Use the flashcards first, take the quiz closed-book, then teach it back.*

## FLASHCARDS

- Why does every provider you call throttle you? :: The throttle is a measurement of the provider's engine-room capacity — the same queueing and admission physics as an engine's queue curves — exported to you as a number.
- Why don't five extra API keys buy five quotas on OpenAI? :: Limits are enforced at the organization and project level, so a credential is a name tag, not a bucket.
- What does a 429 mean on Anthropic, versus a 529? :: A 429 means you are going too fast (or hit a spend cap); a 529 means the provider itself is overloaded — their problem, not yours.
- Which rejection must you never retry? :: A billing-class 429 — a spend cap or exhausted quota — because it fails identically every time until the clock runs out or a human acts.
- What is Retry-After and how must the harness treat it? :: A response header giving the minimum seconds to wait — treat it as a floor and never wake before it.
- Why do providers count "tokens" against quota differently? :: Each provider has its own reservation and metering model — which tokens count, when they count, and whether reserved-but-never-generated tokens are charged.
- How does OpenAI debit your tokens-per-minute limit for a request? :: It reserves the larger of your max_tokens setting and a character-count estimate of the request, so an oversized setting spends quota you never use.
- A Bedrock request has 3,000 input tokens, 1,000 cache-write tokens, and max_tokens 32,000 — what is deducted at request start? :: 36,000 tokens — input plus cache-write plus the reservation (3,000 + 1,000 + 32,000).
- What is a burndown rate? :: A multiplier a provider applies to one kind of token when counting quota — like Bedrock counting some models' output tokens at five to fifteen times face value.
- Why do Anthropic cache reads help your quota, not just your bill? :: Cache reads mostly do not count toward the input-token meter, so caching is a quota lever on Anthropic and Bedrock, not only a price lever.
- What is a token bucket? :: A credit tank that refills continuously and that each request spends from — so a burst inside one second can be rejected even while under the per-minute ceiling.
- What is full jitter? :: Sleeping a uniformly random time between zero and the exponential cap, so a fleet's retries do not wake in synchronized waves.
- Why are retries most dangerous exactly when errors rise? :: Retries add load on top of an already saturated service — up to roughly two-times amplification at a fifty-percent failure rate.
- What does a retry budget cap? :: Retries as a share of all request volume — surplus retries are rejected locally and never reach the wire.
- What is adaptive throttling? :: Rejecting a share of new calls locally, based on recent requests versus accepts, before they ever leave your process.
- With 1,200 requests sent, 900 accepted, and K = 1.1, what fraction of new calls do you reject locally? :: About 17.5 percent — (1,200 − 1.1 × 900) / 1,201 = 210/1,201.
- Why does a paced fanout at 70–80% of quota finish sooner than one fired at 100%? :: Near saturation the queueing knee explodes wait times, so the paced fleet avoids burning its head start in 429s, backoff sleeps, and retry amplification.
- What law makes a fanout step wait on its slowest child? :: The tail law — the step exceeds a latency L with probability 1 − (1 − p)^N, so one slow or 429-and-backoff child defines the whole step.

## QUIZ

**1. A request fails mid-fanout. What is the correct first move?**
- a) Retry immediately — the default SDK behavior is always right
- b) Classify the rejection — read the status code and error type before any retry logic runs (✓)
- c) Switch to a different provider
- d) Raise `max_tokens` and resend

**2. Bedrock request: 2,000 input tokens, 500 cache-write tokens, 800 output tokens, `max_tokens` 16,000, on a 10×-burndown model. Final quota consumption?**
- a) 18,500
- b) 19,300
- c) 10,500 (✓)
- d) 8,000

**3. Your Anthropic traffic stayed under 60 requests-per-minute all minute, yet a burst of requests took 429s. Why?**
- a) The per-minute ceiling was wrong
- b) Enforcement is a token bucket with continuous refill — "60 RPM might be enforced as 1 request per second" (✓)
- c) The cache was cold
- d) The requests were too large

**4. How does a 529 differ from a 429 on Anthropic?**
- a) 529 means you exceeded a spend cap
- b) 529 is a server-side "we are overloaded" rejection and never carries Retry-After (✓)
- c) 529 is retried with a longer backoff
- d) There is no difference in practice

**5. Full jitter with base 0.5 s, cap 8 s, on the third attempt — what do you sleep?**
- a) Exactly 4 seconds
- b) A uniformly random time between 0 and 4 seconds (✓)
- c) A uniformly random time between 0 and 8 seconds
- d) A uniformly random time between 4 and 8 seconds

**6. Adaptive throttler window: 1,000 requests sent, 600 accepted, K = 1.1. What share of new calls fail locally?**
- a) 40%
- b) 34% (✓)
- c) 17.5%
- d) 60%

**7. What does a client token bucket actually buy you?**
- a) Higher provider quotas
- b) Most of your 429s never leave your process (✓)
- c) Cheaper cache writes
- d) Protection from 529s

**8. A 100-wide fanout where each child exceeds latency L with probability 1%. How often does the step exceed L?**
- a) 1%
- b) About 63% (✓)
- c) 100%
- d) About 50%

### Worked answers (arithmetic)

- **Q2:** Final consumption = input + cache-write + (output × burndown) = 2,000 + 500 + (800 × 10) = 2,000 + 500 + 8,000 = **10,500**. (At request start it was 18,500 — the reservation deducts `max_tokens`; quota and billing diverge.)
- **Q5:** Cap = min(8, base × 2^attempt) = min(8, 0.5 × 2³) = min(8, 4) = 4, so sleep = random between 0 and 4 seconds — the exponential cap sets the range, randomness picks the moment.
- **Q6:** Probability = max(0, (1,000 − 1.1 × 600) / (1,000 + 1)) = (1,000 − 660)/1,001 = 340/1,001 ≈ **34%**.
- **Q8:** 1 − (1 − 0.01)^100 = 1 − 0.99^100 ≈ 1 − 0.366 ≈ **63%**.

## TEACH-BACK

1. A teammate's nightly job "ran" all weekend retrying the same 429. Explain to them, using the doorman's three sentences, why every retry was faithful and futile — and what ten-line fix parks the fleet instead.
2. Teach the water-pipe picture of rate limits to a non-engineer: the shared main, the per-apartment restrictor, the tiers. Then explain where the picture leaks — the marketing department, the invisible fleet, the non-portable codes.
3. Your manager wants the fanout "faster, so just fire everything and let retries soak it up." Using the queueing knee, amplification, and the tail law, teach back why pacing at 70–80% finishes sooner than firing at 100%.
