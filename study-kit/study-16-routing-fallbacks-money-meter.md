# Study Kit — Chapter 16: Routing, Fallbacks, and the Money Meter

*Companion to "Inference Engineering," Part III — The API contract. Flashcards first, quiz closed-book, then teach it back.*

## FLASHCARDS

- Why should no model name ever appear in application code? :: Code calls a stable alias that the gateway resolves to concrete deployments, so providers can be swapped without touching agent code.
- What is a deployment? :: One concrete servable copy of a model at one provider, with its own credentials and health.
- What is a fallback chain? :: An ordered list of model groups — if the first exhausts its retries, the call fails over to the next group entirely.
- What is a cooldown? :: A timed bench for a misbehaving deployment that keeps it out of rotation while it recovers.
- What is a circuit breaker? :: A per-target failure memory that fails fast instead of timing out into a corpse, cycling closed, open, and half-open.
- Why can't a status-code breaker see a brownout? :: A provider returning healthy-but-slow 200s never trips error counts — only client-side cost- or latency-per-completed-task telemetry catches the dimming lights.
- How does OpenRouter weight same-model providers for selection? :: By the inverse square of price — cheapness is treated as a prior for reliability, an assumption you inherit.
- Same model at $2 and $8 per million tokens: how do first-try odds compare under the inverse-square rule? :: Sixteen to one — (1/2²) divided by (1/8²) = 16.
- Why do routing and caching fight, and what is the resolution? :: Every fallback hop lands on a different cache shelf and pays fresh write premiums — so route at session start and pin the model within the session.
- What is a complexity router? :: A classifier that sends easy prompts to a cheap model and hard ones to a strong model, like a triage nurse matching cost to need.
- What quality did RouteLLM retain, and how did the savings behave? :: About 95% of GPT-4-level quality, with savings shrinking as workloads harden — roughly 85% on chat, 45% on multiple-choice knowledge, 35% on grade-school math.
- What is the batch lane? :: Submitting N requests as one asynchronous job for exactly 50% of the interactive price, served within 24 hours.
- Which workloads can batch? :: Anything the harness would retry rather than time out — work whose consumer is a morning dashboard rather than a waiting user.
- What are the money meter's four buckets? :: Uncached input, cache-read input, cache-write input, and output — exclusive buckets computed at the edge, never a bare total.
- Why do OpenAI and Anthropic usage fields need different meter handling? :: OpenAI reports cached tokens inside an inclusive prompt total while Anthropic reports exclusive additive buckets — assuming one convention silently miscounts the other.
- Why does "the lane beats the cache" in the worksheet? :: Interactive with a perfect cache hit rate (~$79.50) still costs more than batch with no cache at all ($60.00) — mode choice is the bigger multiplier, so pick the lane first.
- What is the one rule for meter drift? :: Reconcile meter totals against provider invoices daily and treat unexplained drift as a schema change, not noise.
- Why is attribution an emission-time decision? :: Labels attached when the usage event is emitted survive; retrofitting them from logs may be impossible because logs may no longer carry the usage object at all.

## QUIZ

**1. The switchboard's core rule: the string your agent code holds is…**
- a) A model name
- b) An alias resolved to deployments by the gateway (✓)
- c) A provider credential
- d) A model version hash

**2. Every deployment of a model group enters cooldown. Per LiteLLM, what happens?**
- a) All traffic fails permanently
- b) The explicit fallback chain receives traffic, skipping the cooldown check (✓)
- c) The router waits for the cooldown to expire
- d) The gateway returns a 529

**3. Providers at $2, $4, and $8 per million tokens — under the inverse-square rule, how do first-try odds compare for the $2 vs. $8 provider?**
- a) 4:1
- b) 8:1
- c) 16:1 (✓)
- d) 2:1

**4. Nightly suite: 5,000 requests × 3,000 input / 500 output tokens on a $2/$8 per-million model. Interactive cost?**
- a) $12.50
- b) $25.00
- c) $50.00 (✓)
- d) $100.00

**5. Why do complexity-routing savings collapse as the workload hardens?**
- a) The classifier gets worse
- b) Harder prompts force more traffic to the strong model (✓)
- c) Cheap models refuse hard prompts
- d) The router's cache goes cold

**6. A batch job's usage shows 2M tokens, but your same-day meter shows zero for it. Bug?**
- a) Yes — the meter lost events
- b) No — batch usage reports at job completion, up to 24 hours late; the meter needs a pending-jobs column (✓)
- c) Yes — the provider under-billed
- d) No — batch is free

**7. A mock returns a healthy 200 whose body violates the schema. What does the router do?**
- a) Falls back to the next model group
- b) Does not fall back — it was not a classified error; the validator path catches it (✓)
- c) Retries the same deployment
- d) Opens the circuit breaker

**8. The worksheet's 10,000-request fanout (2,000 in / 400 out, frozen 1,500-token prefix) at $3/$15 interactive — total?**
- a) $60.00
- b) $79.50
- c) $120.00 (✓)
- d) $39.75

### Worked answers (arithmetic)

- **Q3:** Weight ratio = (1/2²) ÷ (1/8²) = (1/4) ÷ (1/64) = 64/4 = **16:1** — the cheapest stable provider is sixteen times more likely to be tried first.
- **Q4:** Per request: 3,000 × $2/M = $0.006 input; 500 × $8/M = $0.004 output; $0.006 + $0.004 = $0.010. Total: 5,000 × $0.010 = **$50.00** interactive (batch would be $25.00, in a separate quota pool).
- **Q8:** Fresh input 500 × $3/M × 10,000 = $15.00; shared prefix 1,500 × $3/M × 10,000 = $45.00; output 400 × $15/M × 10,000 = $60.00. Total = $15 + $45 + $60 = **$120.00** (batch no-cache halves to $60.00; batch with full prefix hits lands near $39.75).

## TEACH-BACK

1. Someone asks whether the eval suite "has to run interactively." Using the worksheet skeleton — one row per bucket, one column per lane, a hit-rate parameter, a failure line — teach back how arithmetic, not preference, answers them.
2. Teach the fuse-box picture of circuit breakers to a new hire: closed, open, half-open, why 429s deserve a short bench and 401s a long one — and why the fuse has nothing to say about the lights dimming.
3. Explain the submeter upgrade to a manager staring at "$9,000 on LLMs": how four buckets plus emission-time attribution turns a total into an explanation, and why the submeter still can't measure value.
