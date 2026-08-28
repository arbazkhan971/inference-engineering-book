# Study Kit — Chapter 3: The Arithmetic of Waiting

*Flashcards, quiz, and teach-backs for "The arithmetic of waiting." Every
fact below comes from the chapter text. Cover the answer side and go.*

## Flashcards

- Two ways a chip can be slow :: Not enough math units (compute-bound) or not enough data delivery (bandwidth-bound) — two problems with opposite cures.
- Which regime batch-1 decoding lives in :: Bandwidth-bound — each token waits for the model's bytes to be hauled, not for math to finish.
- What arithmetic intensity is :: Work done per byte carried — like dishes cooked per trip down to the storeroom.
- What the roofline chart shows :: A workload's top speed is whichever is worse: the chip's peak math, or its bandwidth times the workload's intensity.
- The single-stream floor for an 8B BF16 model on an H100 :: 16 GB of weights ÷ 3.35 TB/s ≈ 4.8 ms per token, about 208 tokens/s at best.
- Why ten GPUs barely speed up one stream :: Ten GPUs are ten kitchens — your one token still walks one kitchen's staircase.
- GEMM versus GEMV in kitchen terms :: A GEMM cooks a hundred steaks on one trip (prefill); a GEMV cooks one steak per trip (batch-1 decode).
- What batching buys the engine :: More reuse per weight byte — the same staircase trip serves many riders at once.
- The H100's ridge point :: 989.5 TFLOPS ÷ 3.35 TB/s ≈ 295 FLOPs per byte.
- What the ridge point means when buying chips :: The intensity where a chip flips from bandwidth-limited to compute-limited — a lower ridge forgives smaller batches.
- Why a 1M-token prompt is not just "eight 128k prompts" :: Attention scores every token against every other, so its work grows with the square — about 64×, not 8×.
- What FlashAttention actually changed :: It tiles attention into on-chip chunks with a running normalization, so the giant score matrix never round-trips through slow memory — exact same math, far fewer trips.
- The operator's rule-of-thumb ceiling :: tokens/s ≈ bandwidth × 0.7 ÷ active bytes — a ceiling, never an expectation.
- Every named speedup, sorted :: More reuse per byte (batching, caching), fewer bytes (quantization, smaller KV), or shorter trips (fusion, paging) — there is no fourth kind.
- What the KV crossover tells you :: Past the batch size where cache traffic overtakes weight traffic, extra riders inflate latency while buying almost no throughput.

## Quiz

1. A model generates one token for one user. The chip's math units are nearly idle. What is the bottleneck?
   a) Compute — the math is enormous
   b) Bandwidth — the weights must be fetched, and fetching dominates (✓)
   c) The queue in front of the GPU
   d) The tokenizer

2. Which shape of matrix work is prefill?
   a) GEMV — one row at a time
   b) GEMM — many rows at once, each weight byte reused across the block (✓)
   c) Neither — prefill skips matrix math
   d) GEMM only when the batch is size 1

3. A 70B model in BF16 runs single-stream on an H100 (3.35 TB/s). Its weights are ~140 GB. What is the single-stream floor?
   a) ~208 tokens/s
   b) ~24 tokens/s (✓)
   c) ~115 tokens/s
   d) ~48 tokens/s

4. A hypothetical chip offers 2,000 TFLOPS dense BF16 and 4.0 TB/s of HBM bandwidth. What is its ridge point?
   a) ~295 FLOPs per byte
   b) ~2 FLOPs per byte
   c) 500 FLOPs per byte (✓)
   d) 50 FLOPs per byte

5. FlashAttention sped up long-context attention. What did it change?
   a) It removed the quadratic attention math
   b) It moved the score-matrix work on-chip so it never round-trips through HBM (✓)
   c) It quantized the attention scores to 4 bits
   d) It skipped attention for distant tokens

6. A prompt grows 8× longer (128k → 1M tokens). How do the two cost terms grow?
   a) Both grow 8×
   b) Dense work grows 8×; attention grows about 64× (✓)
   c) Both grow about 64×
   d) Costs are flat in context length

7. You add more FLOPS to a chip but keep the same memory bandwidth. What happens to single-stream decode speed?
   a) It doubles
   b) Nothing — decode lives on the bandwidth side of the roofline (✓)
   c) It improves by exactly the FLOPS ratio
   d) It gets worse

8. Which is NOT one of the three families of inference speedups named in the chapter?
   a) More reuse per byte (batching)
   b) Fewer bytes (quantization)
   c) Shorter trips (fusion, paging)
   d) Faster clocks on the math units (✓)

### Worked answers (arithmetic questions)

- **Q3:** floor = weight bytes ÷ bandwidth = 140 GB ÷ 3.35 TB/s ≈ 42 ms per token → 1 ÷ 0.042 ≈ **24 tokens/s**. (208 tokens/s is the 8B answer — 16 GB ÷ 3.35 TB/s ≈ 4.8 ms.)
- **Q4:** ridge = peak FLOP/s ÷ peak bytes/s = 2,000 ÷ 4.0 = **500 FLOPs per byte**. Workloads below that intensity stay bandwidth-bound no matter the peak math.

## Teach it back (Feynman checkpoints)

1. Explain compute-bound versus bandwidth-bound to someone using only the kitchen — then say, in one sentence with numbers, which regime batch-1 decoding is in and why.
2. Draw the roofline from memory: axes, the two ceilings, the ridge point — then place batch-1 decode and prefill on it and say what moves a workload from the left side to the right.
3. A friend asks why their million-token prompt costs so much more than eight 128k prompts. Teach them the party-introduction picture and name the two cost terms it hides.
