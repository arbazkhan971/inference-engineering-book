# Appendix B. The arithmetic cheat-sheet

> **Appendices — the reference shelf.** Every formula the book taught, collected with its smallest worked example. The formulas outlive the prices; re-date the constants, keep the arithmetic.

This is the operator's card deck. Each card carries four things: the formula, what its symbols mean, the smallest worked example from the chapter that owns it, and — the part most cheat-sheets omit — *when it lies*. Worked examples reuse numbers already sourced and dated in their chapters (August 2026 retrievals); Appendix C carries the full provider snapshot, Appendix E the sources. Provider prices and multipliers are defined once in the dated box at the end; the cards quote the multipliers and derive their dollars from it.

## B.1 How long will it take?

**The decode-time identity.**

> e2e ≈ TTFT + (N − 1) × mean ITL, and equivalently TPOT = (e2e − TTFT) / (N − 1)

e2e is end-to-end latency, N the output-token count. Worked: TTFT (time to first token) 400 ms, mean ITL (inter-token latency) 25 ms, 200 tokens → 0.4 s + 199 × 0.025 s ≈ **5.4 s** (Ch. 2). The handy conversion used throughout: tokens/s = 1000 / TPOT_ms (TPOT, time per output token, in milliseconds). *When it lies:* it is an identity over measured terms, not a predictor — queueing and jitter live in the residual. Short replies are TTFT-dominated; long replies are TPOT-dominated; know which regime you're in before optimizing either clock. *(Ch. 2)*

**The roofline.**

> attainable speed = min( peak compute (FLOP/s), memory bandwidth (bytes/s) × arithmetic intensity (FLOP/byte) )
> ridge point = peak FLOP/s ÷ peak bytes/s

Arithmetic intensity is FLOPs (floating-point operations) per byte moved; the ridge point is one datasheet division that tells you how much reuse per byte a chip needs before compute — not bandwidth — binds. Worked: an H100's bandwidth-side attainable at batch 64 (intensity ≈ 64) is ≈ 3.35 TB/s × 64 ≈ **214 TFLOP/s** from the same weight traffic that yields ~3.35 at batch 1 (Ch. 3). *When it lies:* real kernels hit roughly 60–80% of datasheet bandwidth, and the constants are per-chip-generation — the division survives, the answers age. *(Ch. 3)*

**The single-stream floor.**

> tokens/s ≈ (bandwidth × 0.7) ÷ active bytes

The ceiling on one request's decode: each token step must read the active weights (plus its KV — key–value — cache). Worked: a 70B model in FP8 (~70 GB) on a B200-class GPU at 8.0 TB/s → theoretical ~115 tokens/s, effective (0.7 rule) near **80**; the same model on an H100 floors at ≈ 48 theoretical (Ch. 3). *When it lies:* it is a floor for *batch-of-one* decode — batching raises reuse per byte, and no prompt engineering moves this number at all. *(Ch. 3)*

**The prefill decomposition.**

> attention work ≈ c · (N² + N·M + M²/2), N = prompt tokens, M = generated tokens

Entering is quadratic; generating is linear in what you're holding. A 1M-token prompt is not 8× a 128K prompt: the dense part is 8×, the attention part ~61–64× (Ch. 3, 11). *When it lies:* c absorbs kernel efficiencies, and decode's linear KV walk still dominates steady-state generation cost on long sessions. This is why TTFT balloons on giant prompts. *(Ch. 3, 7, 11)*

## B.2 How much memory?

**KV bytes per token.**

> KV/token = 2 × layers × KV heads × head dim × bytes per number

Parameter count appears nowhere; the note-taking architecture — GQA (grouped-query attention), MLA (multi-head latent attention), sliding window — sets the bill. Worked: Qwen3 8B ≈ **144 KiB per token** in BF16 → one 128K-token prompt parks ≈ **18 GB** before its first output token exists (Ch. 4). FP8 KV halves it exactly — Llama 3.1 8B drops 128 → 64 KiB per token, doubling concurrent sessions on the same card (Ch. 9). *When it lies:* nowhere, on the bytes; but bytes-per-number changes with the quant menu, so pin the card per served variant. *(Ch. 4, 9)*

**Sessions per accelerator.**

> sessions = (usable memory − weights − workspace) ÷ (KV/token × context)

Worked shape from chapter 4: an 80 GB card holding a 61 GB MXFP4 model has ~15 GiB left — weights, not KV, bind. *When it lies:* workspace overhead is an estimate; leave slack. Which resource binds is a deployment property this division reveals before you sign an invoice. *(Ch. 4)*

**The decode payload.**

> bytes read per step = active weights + KV(context)

The refinement chapter 3 owed: weights are the flat tax, KV the per-session tax that grows with every token. MoE models read only *active* weights per step — total parameters set memory, active parameters set the floor. *(Ch. 3, 4, 10)*

**Quantization byte math.**

> weight bytes = parameters × bytes per number (FP16 2 · FP8/INT8 1 · INT4 0.5)

Memory halves by arithmetic, never by benchmark. *When it lies:* only about *speed and quality* — speedups are hardware-, batch-, and stack-bound; quality is a property of (model, method, calibration, workload) with no predictive formula. The savings are arithmetic; the safety is empirical. *(Ch. 9)*

**The sharding product.**

> deployment = TP × PP × EP × CP × DP, across t·p·e·c·d chips
> per-shard memory = total bytes ÷ (t · p · e)

Every axis except DP buys capacity *and* communication together; DP is the clean one — more replicas, zero per-token collectives. Hence the rule: shard as little as the memory math allows, scale out with DP, keep TP inside one node's fast interconnect. Worked in chapter 10's worksheet. *When it lies:* collectives' cost depends on interconnect (NVLink-class vs network) and on sequence length for CP. *(Ch. 10)*

**Expert capacity (MoE — mixture-of-experts).**

> expert capacity = (tokens per batch ÷ number of experts) × top-k × capacity factor

A token routed to a full expert is *dropped* — silently, with no error, no retry signal, no log line. From inside the harness, a capacity-driven drop is indistinguishable from a model that got worse that hour. *(Ch. 10)*

## B.3 What does a turn cost?

**Cost per request.**

> cost = Σ (bucket tokens × price × modifier), with the modifier set recorded

Normalize *before* multiplying: OpenAI and Gemini report inclusive totals (cache reads a subset of input); Anthropic and Bedrock report exclusive buckets that add. Chapter 12 owns the four-bucket identities — the Anthropic ledger one is `total input = cache reads + cache writes + fresh input`. Reasoning tokens are billed as output and invisible in text. *When it lies:* price maps drift silently; reconcile daily against the invoice. *(Ch. 2, 12, 16)*

**The cache loop, in base-input units.**

> the first request writes, the rest read: w + (N − 1)·r, versus N uncached
> break-even reuses: N ≥ (w − 1) / (1 − r)

Worked at the box multipliers (w = 1.25, r = 0.1): N ≥ 0.28 — one reuse pays the premium; the 1-hour write (w = 2) needs N ≥ 1.11, two uses total. In dollars: a $3/M model, a 100K-token stable prefix, ten turns → write $0.375 + nine reads $0.270 = **$0.645** versus $3.00 uncached, ≈ **79% saved** (Ch. 14). The only losing case is enrolling and never returning: a flat 25% surcharge. *When it lies:* the formula assumes the prefix *stays* byte-exact — one changed byte converts reads back to full price (the cliff below). *(Ch. 14)*

**The expiry penalty.**

> a dead TTL (time to live) on the next turn pays a fresh write: 1.25 ÷ 0.1 = 12.5× the warm read
> 1-hour write crossover: 2.0 ÷ 1.25 = 1.6 re-writes per hour

A 200K-token session that idles past the 5-minute window pays $1.25 instead of $0.10 to re-enter (Opus-5-class list prices; Ch. 17's resume box) — plus a multi-second re-prefill TTFT spike. Roughly two long idle gaps per hour justify the 2× 1-hour write (2 + 0.1·N < 1.25·N once N ≥ 2). *When it lies:* gap distributions are yours to measure; TTL clocks can run from *request start*, not request end. *(Ch. 14, 17)*

**The compaction breakeven.**

> before: each turn re-reads the prefix (r × prefix per turn)
> after: one full-price re-prefill, then r × prefix′ per turn (3K here)
> worked: 30K + 3K·t = 15K·t → t = 2.5 turns

Compacting a 150K prefix to a 30K summary is ahead from the third turn after the rewrite — and the stakes shrink as the session grows (Ch. 17). *When it lies:* it prices cache units, not quality — what the summary *drops* is chapter 11's lost-in-compaction cliff, unbudgeted here. *(Ch. 11, 17)*

**The fleet spawn arithmetic.**

> N children sharing a versioned preamble cost 1.25 + 0.1·(N − 1), versus N uncached

Ten same-type subagents: 2.15× versus 10× — a 4.7× difference derived straight from the published multipliers (Ch. 17). *When it lies:* children must render the shared head byte-identically, and fanouts must respect the routing hint's limits or overflow to cache-cold machines. *(Ch. 17)*

## B.4 What does the fleet cost?

**The batch lane.**

> batch price = 50% of interactive, delivered within 24 hours (all three major providers)

Worked from chapter 16's worksheet: 10,000 requests × (2,000 in + 400 out) at dated Sonnet 4.6 rates → interactive $120.00, batch $60.00, batch with prefix hits ≈ $39.75 (derived). The punchline that outranks prefix engineering: interactive *with a perfect hit rate* ($79.50) still loses to batch *with no cache at all* ($60.00) — choose the lane first. *When it lies:* results arrive late and expire at 24 hours; a job that dies at hour 25 is not billed but also not run. Intra-batch cache behavior is measured, not designed. *(Ch. 16)*

**The failure lines.**

> a worksheet without failure costs is a budget, not a forecast

At the same rates, each re-sent failed request costs ≈ $0.006; a 5% failure rate adds ≈ $3.00 to the 10,000-request night; a full re-run adds $60.00. Errored requests may be *unbilled* by the provider — your re-run accounting is not so generous. Cost per *completed* task is the honest denominator. *(Ch. 16)*

## B.5 When do I trip the limits?

**The requests-per-second ceiling.**

> rps ≈ TPM (tokens per minute) ÷ 60 ÷ average tokens per request

Worked: 900,000 TPM at ~500 tokens per call → ~30 rps; pace at 70–80% (~21–24 rps) and large fanouts finish *sooner* than at 100%, because the difference is spent in 429s (too-many-requests rejections), backoff sleeps, and retry amplification. *When it lies:* meters differ — some providers count output-only, some apply burndown multipliers, some count unsuccessful requests; build the per-provider ledger from its own docs. *(Ch. 15)*

**The queueing knee.**

> average residence ≈ service time ÷ (1 − utilization)

At 50% utilization residence is already ~2× service time; ~10× at 90%; ~100× at 99% (a law, not a measurement). Practice keeps load off the knee at 70–80% of capacity. *When it lies:* it is a classical approximation — real systems wobble around it — but the knee's *existence* is the operational truth. *(Ch. 5, 15)*

**Little's Law.**

> concurrency = throughput × latency

Sizes your semaphore directly: 24 rps at 4 s average → hold ≈ 96 in flight; enqueue the rest where you can see and reorder them. *When it lies:* the law is exact; your *latency estimate* is the input that drifts. *(Ch. 15)*

**The tail law.**

> P(step exceeds L) = 1 − (1 − p)^N, p = per-child probability, N = fanout width

At p = 1% and N = 100, ~63%; at N = 10,000, ≥ 99.99999% (derived). A wide fanout of perfectly median calls behaves, at the step level, like a 99th-percentile call. Budget the step, not the call: child deadlines, K-of-N reduction. *(Ch. 15, 16)*

**Full jitter.**

> sleep = random(0, min(cap, base · 2^attempt))

The AWS-tested variant of exponential backoff: randomize across the whole range so a fleet doesn't re-collide. Honor `Retry-After` as a floor when present. *When it lies:* jitter spreads retries; it does not *reduce* them — cap attempts (a 3-attempt cap bounds amplification at 3×) and keep retries under a ~10% budget. *(Ch. 15)*

**Adaptive throttling.**

> throttling fraction = max(0, 1 − K · successes/recent requests), K ≈ 1.1

Reject some of *your own* calls locally when recent success is poor, so a struggling dependency gets room to recover. *When it lies:* K is a tuning constant with a floor — pair it with a minimum rate so throttling can't reach 100% and starve the very probe traffic that would prove recovery. *(Ch. 15)*

## B.6 When does guessing pay?

**Expected progress under speculation.**

> E[progress] = (1 − α^(γ+1)) / (1 − α), α = per-token acceptance, γ = draft length

The geometric sum: the guaranteed first token, plus α's chance of a second, and so on. Worked: α = 0.8, γ = 4 → ≈ **3.36 tokens per verify pass**; net speedup = E[progress] ÷ overhead ratio (a 20% overhead → ≈ 2.8×). *When it lies:* the multiplier must beat the overhead ratio, acceptance falls with temperature (roughly 15–25% speedup loss from temperature 0 → 1 on three of EAGLE-3's four models; the 70B lost only ~4%), and structured output or cold prefixes can gut α. Calling a hosted API: no header says "speculated" — budget on un-speculated numbers and treat speculation as upside. *(Ch. 8)*

## B.7 When does owning beat renting?

**The crossover.**

> tokens to tie = GPU-month cost ÷ blended price per token
> utilization to tie = tokens to tie ÷ (sustained rate × hours in the month)

Worked from 2026 rental and per-token rates: an A100 at ~$1.49/hr ≈ $1,073/month ties a $0.60-per-million blended API at ≈ 1,790M tokens — about **35% of every hour** at a sustained ~2,000 tokens/s aggregate (H100-class; optimistic for an A100 — a slower card pushes the share higher). Ten million tokens a month is a $6 problem; renting a GPU for it is buying the restaurant for one dinner. *When it lies:* both ends move — rentals fall, API prices drop — so recompute quarterly, not once; and utilization is the whole game: an engine idling two-thirds of the time is a taxi bought at taxi prices. *(Ch. 18)*

---

> **Constants box — mid-2026 snapshot (retrieved 2026-08-27; full provider matrix in Appendix C).** Cache write 1.25× / read 0.1× of base input; 1-hour write 2×; default TTL 5 minutes, explicit 1 hour (Anthropic-style). Batch: 50% off, 24-hour window, all three major providers. Worked-example prices: Claude Sonnet 4.6 $3/$15 interactive, $1.50/$7.50 batch per million input/output. H100 rental $2.39–2.49/hr; A100 marketplace ~$1.49/hr; blended open-weight mid-tier ~$0.60 per million. Every one of these will age; the formulas above will not. Re-date the constants, rerun the cards, and treat any answer older than a pricing cycle as historical.

*Every card here is taught in full — ELI5 on-ramp, mechanism, dated sourcing, failure modes — in the chapter it names. If a card and a chapter ever disagree, the chapter wins, and this sheet needs the fix.*
