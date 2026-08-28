# Study Kit — Chapter 5: Batches: the engine's trick

*Flashcards, quiz, and teach-backs for "Batches: the engine's trick."
Every fact comes from the chapter itself. Cover the answer, say it out loud, then check.*

## Flashcards

- Why can your AI reply slow down at the same time every evening even though your request never changed? :: Your reply is computed together with strangers' requests in one shared batch, and when the engine gets busy, the shared step takes longer — your pace belongs to the batch you ride in.
- What is a batch? :: Requests computed together in one pass over the model's memory — like riders sharing one bus trip.
- What was wrong with static batching? :: The batch ran until its *longest* member finished, so finished requests kept occupying seats — a charter bus that waits for the slowest shopper to leave the mall.
- What two wastes did static batching create? :: Padding (every request padded out to the longest length) and stragglers (finished requests holding seats until the whole batch ended).
- What did dynamic batching fix, and what did it leave broken? :: It fixed admission — buses leave fuller or after a timeout — but inside the bus nothing changed: the batch was still lockstep once launched.
- What is continuous batching, in one sentence? :: The batch is re-planned every single token: finished riders hop off, waiting riders hop on, and nobody's trip is hostage to anyone else's.
- What is an "iteration" in a serving engine? :: One engine step that produces one new token for every request currently aboard — the bus completing one stop.
- What is selective batching? :: The big linear layers run batched across all riders (the expensive part), while attention runs per-sequence over each rider's own history, because histories differ.
- What are the scheduler's two main knobs? :: A cap on how many sequences run at once, and a cap on total tokens per iteration — together they bound the scheduler's greed.
- Why is chunked prefill kind to riders already aboard? :: Long prompts are admitted in pieces across iterations, and pending decodes are served first — so people already on the bus keep their pace.
- In the TensorRT-LLM tuning case, what happened as batch size was swept 64 → 512 → 2048? :: Throughput rose then fell (1,944 → 2,467 → 2,044 tokens/s) while per-token latency stayed flat — the sweet spot was interior, at 512, not at the maximum.
- What sets your reply's token pace? :: The length of the shared iteration: tokens per second per request is roughly one divided by iteration time — not your prompt, not the marketing page.
- Why does queueing get suddenly terrible as an engine approaches full utilization? :: Mean queue delay grows like one over (one minus utilization): at 80% it is 5× service time, at 90% it is 10×, at 99% it is 100× — a cliff, not a slope.
- Why does one giant prompt in the queue hurt more than several medium ones? :: Queue wait depends on *variability*, not just average — one outlier stretches the wait of everyone behind it disproportionately.
- What is goodput? :: Completions per second that actually met your stated latency bounds (with a percentile attached) — meals served hot and on time, not just served.
- If you don't own the engine, what three client-side dials still matter? :: Cap your concurrency at the measured knee, set stream timeouts against degraded-tail token pace (not the healthy median), and clip output lengths to shrink queue variability.

## Quiz

**1. In a static batch, a request that finishes early still waits because…**
- A) the engine must verify its output before returning it
- B) the batch runs until its longest member finishes, so finished requests hold their slots ✓
- C) the API buffers all replies for batching efficiency
- D) shorter requests are deprioritized by the scheduler

**2. What is the key difference between dynamic batching and continuous batching?**
- A) Dynamic batching uses timeouts; continuous batching uses priorities
- B) Dynamic batching only improves admission; continuous batching re-plans the batch every iteration ✓
- C) Continuous batching requires special GPU hardware
- D) Dynamic batching is for training; continuous batching is for serving

**3. Why does "selective batching" exist?**
- A) Some requests are more important and get selected first
- B) Linear layers can be batched across riders, but attention needs each sequence's own history, so it runs per-sequence ✓
- C) The GPU refuses batches larger than a set size
- D) It selects the fastest model for each request

**4. (Arithmetic) An engine iteration budget is 8,192 tokens and 64 requests are running their decode steps. How much budget is left for prefill chunks this iteration?**
- A) 8,192 tokens
- B) 8,128 tokens ✓
- C) 64 tokens
- D) 4,096 tokens

*Worked: decode consumes one token per rider — 64 tokens. 8,192 − 64 = 8,128 tokens of budget left, which the scheduler spends on prefill chunks for waiting requests.*

**5. (Arithmetic) Using the queue-delay multiplier table, roughly how much longer is mean system time at 95% utilization than at 50%?**
- A) About twice as long
- B) About ten times as long ✓
- C) About forty-five times as long
- D) Identical — only arrival rate matters

*Worked: the multiplier is 1/(1−ρ). At 50%: 1/0.5 = 2×. At 95%: 1/0.05 = 20×. 20 ÷ 2 = 10 — ten times longer.*

**6. In the tuning case study, why was batch 2048 worse than batch 512?**
- A) The per-token latency doubled
- B) Past saturation, extra riders cost more (scheduling, cache pressure) than they contribute — the sweet spot was interior ✓
- C) The model quality degraded at large batches
- D) 2048 exceeded the memory of four GPUs

**7. A system serves 10 requests/s raw, but only 3 requests/s stay within latency bounds. Its goodput is…**
- A) 10 requests/s — throughput is what counts
- B) 6.5 requests/s — the average of the two
- C) 3 requests/s, stated with its bounds and percentile ✓
- D) undefined without knowing the model

**8. What second job does the `max_tokens` setting do, besides capping cost?**
- A) It raises the model's quality ceiling
- B) It shrinks service-time variance, which reduces queue delay for everyone — including your other requests ✓
- C) It resets the provider's rate-limit window
- D) It marks the end of the shared prefix for caching

## Teach-back prompts

1. Explain continuous batching to a friend using an analogy that is *not* a bus — a kitchen, a highway, a barbershop, anything you like. Your analogy must show: people finishing at their own pace, new people starting immediately, and nobody waiting for the slowest.
2. A dashboard shows healthy aggregate throughput while users complain the product got slow. Explain, in your own words, why both can be true at once — and which number you would put on the wall instead.
3. Tell the field-note story (doubling concurrency 32 → 64 made wall-clock *worse*) as if briefing your team: what rose, what tripled, what fed the fire, and what you would plot from day one.
