# Study Kit — Chapter 10: One model, many chips

*Flashcards first (cover the answer side), then the quiz, then teach it back.
Every fact below comes from the chapter itself.*

---

## Flashcards

- Why does sharding begin as a storage problem, not a speed problem? :: Because past a certain size the weights physically cannot be resident on one chip at all — capacity bites before any throughput discussion starts.

- What do TP, PP, DP, CP, and EP name? :: The five ways to spread one model across many chips — splitting weights, depth, whole copies, the sequence, or the specialists — each with its own communication bill.

- What does splitting a 70B model's weights across TP=2 chips do to the single-stream floor? :: Each chip streams half the bytes, so the floor halves: about 42 ms → 21 ms per token, roughly 24 → 48 tokens/s, on the same kind of chip.

- Why is tensor parallelism sized to stay inside a single node? :: Its collectives fire every layer, every token — fast over a node's chip-to-chip link, punishing across the network between nodes.

- What is the pipeline bubble? :: The idle stage time while a lone request crawls the stages one by one — fought by keeping many microbatches in flight so every station stays busy.

- How does DeepSeek-V3's per-token byte stream compare with a 70B dense model's, and why? :: About 74 GB versus about 140 GB at BF16 — roughly half the traffic from a model with about ten times the total capacity, because each token touches only its routed experts.

- What does the router in a mixture-of-experts layer do? :: It scores each token against every expert, sends it to the top-k winners, and blends their outputs — with an always-on shared expert along for the ride in DeepSeek-style designs.

- What do "total" versus "active" parameters each tell you? :: Total is what the operator must house (the payroll); active is what each token actually runs (who is in the building today) — the pair that prices a modern model.

- What is gpt-oss-120b's two-line spec, and what fraction of itself does each token touch? :: 117B total parameters, 5.1B active — about 4.4% — with 128 experts and top-4 routing.

- What is the capacity factor's silent drop? :: An overflow token routed to a full expert simply skips that expert's processing and continues — no error, no retry signal, no log line you will ever see from an API.

- What is all-to-all communication, and why does it decide an MoE fleet's speed? :: Every token's state flying to wherever its experts live and back, twice per layer — the fleet's clock waits on the slowest expert exchange, so jams slow everyone.

- Using the chapter's formula, what is each expert's seat count for 4,096 tokens, 64 experts, top-8, capacity factor 1.25? :: Capacity = (4096 ÷ 64) × 8 × 1.25 = 640 slots per expert, against an average demand of 512 — skew pushes some experts past 640 and the difference is dropped.

- How should you read "671B" in a model listing? :: As a storage statement, not a latency statement — per-token cost tracks active parameters, so compare measured TTFT, TPOT, and price per million tokens, never parameter counts.

- What did the field note's flat-median-but-doubled-p99 peak pattern indicate? :: Hot-expert stragglers under skewed traffic (plus possible capacity drops) — on a sparse fleet, your p99 is a function of everyone else's routing; move hard-deadline work off peak.

- How much storage does DeepSeek-V3's sparsity demand before the first token is served? :: Over a terabyte at BF16 — about 1,342 GB derived from 671B parameters × 2 bytes — versus 140 GB for the 70B dense model.

- What two knobs can hide inside a family's fast/mini/lite ladder? :: A precision knob (quantization, chapter 9) and a sparsity knob (this chapter) wearing one name — the first bills quality, the second bills fleet variance and silent drops.

## Quiz

**1. Why does one chip stop being enough for a 70B model before speed even enters the conversation?**
- a) One chip lacks the FLOPs for 70B of arithmetic
- b) The weights cannot be resident — capacity bites first (✓)
- c) GPUs refuse models above 64B parameters
- d) Attention requires at least two chips by design

**2. Which parallelism axis communicates *never* for inference?**
- a) Tensor parallelism
- b) Pipeline parallelism
- c) Data parallelism (✓)
- d) Context parallelism

**3. Why does a single request not get faster when a provider "adds capacity" via more DP replicas?**
- a) Replicas only serve other customers' traffic — DP adds aggregate throughput and nothing else (✓)
- b) DP replicates the KV cache, which slows decode
- c) The router refuses new replicas at peak
- d) It does get faster, but only at 4-bit precision

**4. ARITHMETIC. A 70B dense model at BF16 (~140 GB) on one 3.35 TB/s H100 has a single-stream ceiling of about:**
- a) 12 tokens/s
- b) 24 tokens/s (✓)
- c) 48 tokens/s
- d) 96 tokens/s

**5. ARITHMETIC. For 4,096 tokens through a 64-expert layer with top-8 routing and capacity factor 1.25, per-expert capacity and average demand are:**
- a) 640 and 512 (✓)
- b) 512 and 640
- c) 640 and 4096
- d) 80 and 64

**6. The mechanism behind a 671B model decoding briskly is:**
- a) Tensor parallelism across hundreds of chips
- b) Sparsity — each token touches only its active parameters, so the byte stream is small (✓)
- c) Its weights are stored on faster disks
- d) Its experts are quantized to 2 bits

**7. Which pairing correctly splits the bills of the fast/mini/lite ladder's two hidden knobs?**
- a) Sparsity bills quality; quantization bills fleet variance
- b) Quantization bills quality; sparsity bills fleet variance and silent drops (✓)
- c) Both bill only memory
- d) Neither bills anything measurable

**8. Your MoE endpoint shows flat median TPOT but doubled p99 at daily peaks, with unchanged token counts. The best-fitting engine-side explanation is:**
- a) Your prompts got longer
- b) Hot-expert stragglers under skewed traffic (✓)
- c) The provider enabled FP8 KV
- d) Your client's rate limiter

### Worked answers (arithmetic questions)

**Q4.** Single-stream decode floor = weight bytes ÷ bandwidth: 140 GB ÷ 3.35 TB/s ≈ 42 ms per token → ≈ **24 tokens/s** ceiling. Split across TP=2 chips, each streams ~70 GB in parallel: 70 ÷ 3.35 ≈ 21 ms → ≈ 48 tokens/s — the two bandwidths add, which is the entire promise of tensor parallelism.

**Q5.** Capacity = (tokens per batch ÷ number of experts) × top-k × capacity factor = (4096 ÷ 64) × 8 × 1.25 = 64 × 8 × 1.25 = **640** seats per expert. Average demand: every token claims 8 expert slots, so 4096 × 8 = 32,768 slots ÷ 64 experts = **512** average. Under balanced routing, 640 seats cover 512 demand comfortably; when routing skews, hot experts blow past 640 and the overflow is silently dropped.

## Teach it back

1. Explain the specialist hospital to a friend: the building is enormous but every visit is short. What does each half of that sentence cost, and who pays it?
2. Why can a 64-GPU fleet and a 2-GPU deployment serve *you* at the same speed? Name which of the five axes buy fleet throughput and which (if any) buy your single token's speed.
3. Teach the capacity-factor drop as a "silent seat limit" at the parcel warehouse: why will no dashboard ever show it directly, and what two habits replace the missing signal?
