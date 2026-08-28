# Study Kit — Chapter 7: Prefill, Decode, and the Great Divorce

*Pairs with `manuscript/07-prefill-decode-great-divorce.md`. Cover the answer, say it aloud, check yourself. Quiz at the end.*

## Flashcards

- Why can someone else's huge prompt make your stream stutter? :: Because every request is secretly two workloads — a big parallel "read the prompt" pass and a slow serial "write the answer" loop — and when they share one engine, the reading pass freezes everyone mid-stream.
- What is prefill, in plain words? :: The up-front pass that reads your whole prompt in one go and fills the memory cache the answer will be built on.
- What is decode, in plain words? :: The loop that writes your answer one token at a time, each step re-reading the model's knowledge.
- Why is prefill called "compute-bound"? :: Reading the prompt is one big parallel math pass where every fetched weight is reused across all prompt tokens, so its limit is arithmetic throughput, not memory speed.
- Why is decode called "bandwidth-bound"? :: Producing each single token means streaming nearly the whole model's weights through the chip, so memory speed — not math power — sets the pace.
- What is the prefill bubble? :: The stall every running stream suffers while one long prompt's prefill occupies the shared engine iteration — a gap spike tied to someone's arrival, not your request.
- What is chunked prefill? :: Slicing a long prompt's reading into fixed-size chunks that run between the answer-writing steps, never instead of them, so streams keep moving while the big prompt finishes across several iterations.
- Who pays the price of chunking? :: The request that brought the long prompt — its first token waits longer — while everyone else's stream stays smooth.
- If a 16,384-token prompt meets a 2,048-token chunk budget, how many iterations does its prefill span? :: About eight — prompt tokens divided by chunk size (16,384 ÷ 2,048 = 8).
- What is disaggregation (P/D separation)? :: Splitting the engine into two hardware pools — one built for reading prompts, one for writing answers — with the finished prompt memory shipped between them.
- What is the "colocation tax"? :: The goodput you lose when reading and writing share one kitchen and degrade each other.
- Why does the chapter call the KV-transfer hop a real cost of the divorce? :: Because the courier isn't free — the shipped cache adds a fixed delay to every request and competes for the same wires the pools use.
- What did DistServe's re-architecture achieve without new silicon? :: Roughly double the good requests per GPU versus the shared kitchen — about 3.3 versus 1.6 requests/s/GPU — by giving each phase its own pool.
- What is early rejection? :: An admission policy that refuses requests predicted to miss their promised time bounds up front — trading "slow success" for "fast failure."
- If a provider's streams hitch exactly when your own nightly big-context job runs, what is the likely cause? :: Interference — your long prompt's prefill is freezing co-located streams; plot the gap spikes against arrivals to confirm.
- What single lever makes repeated prefill absent instead of merely cheaper? :: Prefix caching — if the same prompt pieces keep returning, the engine skips the reading pass altogether.
- Why does queue wait blow up near full utilization? :: Because the waiting-time multiplier behaves like one over one-minus-utilization — moving from 0.8 to 0.95 utilization multiplies queue wait about fourfold.
- What does Mooncake add on top of the two-pool split? :: A cheap shared cache tier on spare memory and drives, so repeat prompts skip prefill entirely instead of being re-read.

## Quiz

**1. Your stream hitches with a giant gap exactly when another request carrying 20,000 tokens arrives. In a colocated engine, what happened?**
- A) Your request grew and needed more memory
- B) The long prompt's prefill iteration stalled every co-batched decode (✓)
- C) The model switched to a slower mode for big prompts
- D) The network dropped tokens and resent them

**2. Why does one long prompt slow everyone else down in a shared engine?**
- A) The engine restarts all streams when a prompt exceeds 10,000 tokens
- B) A batch iteration takes as long as its longest member, and the prefill's pass is hundreds of milliseconds (✓)
- C) Long prompts force lower-quality answers that take longer to write
- D) Every stream must re-read the new prompt too

**3. Chunked prefill protects which metric, at whose expense?**
- A) TTFT of the newcomer, at the expense of all streams' pace
- B) The stream pace (per-token time) of in-flight requests, at the expense of the chunked request's first-token time (✓)
- C) Total throughput only, with no per-user effect
- D) Memory usage, at the expense of answer quality

**4. *Arithmetic.* A 16,384-token prompt is served with a 2,048-token chunk budget. Roughly how many engine iterations does its prefill span?**
- A) 2
- B) 8 (✓)
- C) 16
- D) 41

**5. What is the core argument for splitting prefill and decode onto separate hardware?**
- A) The two phases have opposite physical shapes, so each pool can be sized and tuned for its own bottleneck and time bound (✓)
- B) Two pools always cost less than one
- C) Models produce better answers on dedicated prefill chips
- D) Providers require it for safety compliance

**6. Which is NOT listed as a real cost of disaggregation?**
- A) The KV-cache transfer adds a fixed hop to every request
- B) Two pools duplicate plumbing and control planes
- C) Pool imbalance becomes a new failure mode
- D) Answers become approximate instead of exact (✓)

**7. *Arithmetic.* Colocated baseline ≈ 1.6 good requests/s/GPU; a 2:1 prefill-to-decode split serves ≈ 10 requests/s total on three GPUs. What is the per-GPU gain?**
- A) ≈ 1.3×
- B) ≈ 2.1× (✓)
- C) ≈ 4.5×
- D) ≈ 6.3×

**8. Your hosted provider's TTFT inflates during peak load while stream pace stays clean. Which fingerprint is this?**
- A) Interference
- B) Queueing (✓)
- C) Admission control
- D) Speculation failure

**Worked answers (arithmetic):**
- **Q4:** Iterations ≈ prompt_tokens ÷ chunk_size = 16,384 ÷ 2,048 = **8**. The prefill finishes across about eight engine iterations instead of one giant stall.
- **Q7:** 10 requests/s on three GPUs = 10 ÷ 3 ≈ **3.3 requests/s/GPU**. Gain = 3.3 ÷ 1.6 ≈ **2.1×** — from re-architecture alone, no new silicon.

## Teach-back prompts

1. **The kitchen split.** Explain to a friend why a restaurant that serves both walk-up tacos and 400-taco catering orders gets jammed by its best customer — and what changes when the catering moves to its own building. Use your own everyday example, then name the real terms (prefill, decode, disaggregation) when your friend has the picture.
2. **Whose latency is it anyway?** Your teammate says "the model got slow at 6 pm again." Walk them through the three fingerprints — interference, queueing, admission control — and what instrument separates them, using only words a non-engineer knows.
3. **The rationing trade.** You are offered a dial: smaller chunks make streams smoother but newcomers wait longer. Explain who wins and who pays, why an engine might default this dial on, and when an operator would still reach for the full split instead.

---

*All facts from chapter 7 of Inference Engineering (Harness Engineering Series, Vol. II). Numbers as dated in the chapter.*
