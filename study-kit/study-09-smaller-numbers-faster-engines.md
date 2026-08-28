# Study Kit — Chapter 9: Smaller numbers, faster engines

*Flashcards first (cover the answer side), then the quiz, then teach it back.
Every fact below comes from the chapter itself.*

---

## Flashcards

- What is quantization, in one breath? :: Storing a model's numbers with fewer bits than it was trained with — like rounding $3.8473 to $3.85.

- Why does a smaller pile of numbers make a model faster? :: Because single-stream decode is bound by how fast the chip can stream the weights through memory, so fewer bytes means a proportionally higher speed floor.

- At INT4, what is the worst-case rounding error for a weight channel spanning [−0.08, +0.08]? :: The scale is 0.16 ÷ 15 ≈ 0.0107, so each rounded weight can be off by at most half that, about 0.0053 — roughly 3% of the channel's span.

- What are the three separate dials quantization can turn? :: The weights (stored once, offline), the activations (computed fresh every pass), and the KV cache (per-session state) — three separate bills.

- What does the shorthand W4A16 mean? :: 4-bit weights with 16-bit activations — "weight-only" quant, where the pantry is pre-portioned but the mixing stays full-precision.

- Roughly what happens to an 8B model's single-stream ceiling going from BF16 to FP8 to INT4 weights? :: About 208 tokens/s at BF16, 415 at FP8, and 830 at INT4 on the same chip — four times fewer bytes, roughly four times the floor, before real-kernel haircuts.

- What is calibration, and why does it exist? :: Studying a few hundred real inputs before deciding how to round, because watching real traffic tells you which numbers matter — like a tailor measuring before cutting.

- What do SmoothQuant, GPTQ, and AWQ share as a goal that plain round-to-nearest misses? :: They all protect the small set of important values from rounding damage — by migrating difficulty, compensating errors, or scaling salient channels — instead of rounding everything blindly.

- What did the COLM 2025 study find about 8-bit quantization at every model size? :: The best W8A8 methods land within about ±1 point of full precision — but a poor method at the same 8 bits lost 4.43 points, so the method matters as much as the bits.

- What is the delivery order of quantization's quality bill? :: Knowledge and retrieval absorb rounding first, structured short outputs next, and long-chain reasoning (math, code, multi-step plans) pays full freight.

- How should you treat a provider's unlabeled "fast," "mini," or "lite" tier? :: As undisclosed bits until proven otherwise — a quantization choice (possibly plus sparsity) wearing a friendlier name, with the quality bill arriving whether or not it is disclosed.

- How badly can 4-bit hurt the hardest reasoning set? :: On AIME at 70B, AWQ fell about 6.7 points and GPTQ about 11.7 points from the full-precision score.

- What exactly does FP8 KV quantization halve, and is the saving guaranteed? :: The KV cache bytes per token — exactly, by arithmetic rather than benchmark — doubling how many sessions fit per GPU; everything beyond the memory win is measured.

- Why is FP8 KV net-negative for short contexts? :: Dequantizing adds a constant per-step toll while the byte savings grow with cached length, so below the measured break-even you pay the toll without collecting the savings.

- What was the FlashAttention-3 cautionary tale? :: An accumulation bug dropped 128k-context needle-in-a-haystack accuracy from 91% (BF16) to 13% (FP8), fixed back to 89% — nothing wrong with the bit-width itself; the implementation was wrong.

- What is the safety rail against price-ordered routing quietly buying int4 for you? :: Pin the variant in your routing manifest and run a nightly eval canary against the pinned variant — a fixed golden task set replayed and diffed — to catch drift that averages hide.

## Quiz

**1. The core reason quantization speeds up single-stream decode is:**
- a) Fewer bits make each arithmetic operation logically simpler
- b) Decode is bandwidth-bound, so fewer weight bytes per token means a proportionally higher speed floor (✓)
- c) Quantized models skip attention layers entirely
- d) The GPU clock runs faster on integers

**2. Which statement about the three quantization dials is correct?**
- a) Weights, activations, and KV cache must always be quantized together
- b) Quantizing weights automatically halves the KV cache
- c) Weights, activations, and KV cache are three separate dials that bill separately (✓)
- d) Activations are stored offline once and never change

**3. Calibration exists because:**
- a) Model weights drift during serving and need re-tuning
- b) A few hundred real inputs reveal which channels carry disproportionate signal, so rounding spares them (✓)
- c) Providers require it for billing purposes
- d) It converts floats to integers without any error

**4. ARITHMETIC. A weight channel spans [−0.08, +0.08] and is quantized to INT4. What is the scale?**
- a) 0.16 ÷ 15 ≈ 0.0107 (✓)
- b) 0.08 ÷ 4 = 0.02
- c) 0.16 ÷ 2 = 0.08
- d) 0.16 × 15 = 2.4

**5. ARITHMETIC. An 8B-class model at INT4 weights (~4 GB) on a 3.35 TB/s chip has a single-stream ceiling of about:**
- a) 208 tokens/s
- b) 415 tokens/s
- c) 830 tokens/s (✓)
- d) 1,660 tokens/s

**6. According to the COLM 2025 evidence, the quality bill of 4-bit quantization lands hardest on:**
- a) Knowledge and retrieval questions
- b) Short structured outputs
- c) Long-chain reasoning like AIME math (✓)
- d) None — 4 bits is lossless everywhere

**7. Your agent runs short-context, high-churn tool calls (well under the break-even in cached tokens). What should you do with FP8 KV quantization?**
- a) Enable it fleet-wide for uniformity
- b) Leave it off — below the ~7k-cached-token break-even it is net-negative (✓)
- c) Enable it only for the classifier step
- d) It cannot be disabled once shipped

**8. A marketplace's default routing orders hosts by price. Why is that a quality risk?**
- a) Cheap hosts are always offline at peak
- b) Price-ordered routing can silently hand your traffic to an int4 host whose multi-step reasoning losses arrive undisclosed (✓)
- c) Cheap hosts bill in different currencies
- d) The marketplace bans quantized models

### Worked answers (arithmetic questions)

**Q4.** INT4 gives 15 levels between min and max, so scale = (max − min) ÷ (2^4 − 1) = (0.08 − (−0.08)) ÷ 15 = 0.16 ÷ 15 ≈ **0.0107**. Worst-case per-weight error is half the scale ≈ 0.0053 — about 3% of the channel's span. Finer grouping (halving the span) or more bits shrinks the error without adding bits.

**Q5.** The decode floor is weight bytes ÷ bandwidth, chapter 3's method: 4 GB ÷ 3.35 TB/s ≈ 1.2 ms per token → ≈ **830 tokens/s** theoretical, before the ~0.7 real-kernel haircut (≈ 580 plausible). For comparison: ~16 GB (BF16) gives ≈ 4.8 ms → 208 t/s; ~8 GB (FP8) gives ≈ 2.4 ms → 415 t/s. Four times fewer bytes, roughly four times the floor.

## Teach it back

1. Explain to a friend who bakes why "rounding the recipe" sometimes ruins macarons but never pancakes — and connect that to why a quantized model can nail trivia questions while failing twelve-step math.
2. You control neither the weights nor the kernels of a hosted model. Walk through the only two things you *do* control from the harness, and how each one catches a different silent failure from this chapter.
3. Teach the KV break-even with the toll-road picture: why does the driver who exits after 100 meters lose money on a toll road that saves everyone else time?
