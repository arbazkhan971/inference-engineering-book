# How attention cost scales with context length — and why a 1M-token prompt is not 1M× one token
researched: 2026-08-27 · researcher: glm-5.3-flash

## Key facts
- Self-attention's time and memory complexity is quadratic in sequence length; this is the motivating claim of the FlashAttention paper (arXiv:2205.14135, 2022). FlashAttention removes the quadratic *memory* blow-up for the attention matrix (by never materializing the full N×N score matrix) but does not change the quadratic *FLOP* count — it is exact attention, made IO-aware.
- FlashAttention reported training BERT-large 15% faster than the existing MLPerf 1.1 speed record, and memory savings growing linearly with sequence length (up to ~20× for GPT-2 at seq 1K) (arXiv:2205.14135, 2022).
- Prefill latency scales quadratically with input sequence length (ISL), while decode latency scales linearly with KV-cache sequence length (KVSL) (NVIDIA Technical Blog, "Co-Designing AI Model Attention for Fast, Interactive Long-Context Inference," fetched 2026-08-27).
- The KV cache grows linearly per token: bytes = 2 (K and V) × L (layers) × H_kv (KV heads) × d_head × bytes_per_element × sequence length. Example measured figure: Qwen3 8B adds ~144 KiB of KV cache per token per sequence in bf16 (Sebastian Raschka, LLM Architecture Gallery, fetched 2026-08-27). A 128k-token prompt on that model therefore implies on the order of ~18 GB of KV cache before a single output token is produced (derived from that per-token figure, 2026-08-27).
- Providers price long contexts at a surcharge, which is direct market evidence that cost is not flat in context length. Gemini 1.5/2.5-style tiering: input $0.075 per 1M tokens for prompts ≤128k vs $0.15 per 1M for prompts >128k; output $0.30 vs $0.60 per 1M — exactly a 2× step at the 128k boundary (Google AI Gemini API pricing page, archived snapshot fetched 2025-06-21; verified still tiered on ai.google.dev, fetched 2026-08-27).
- Gemini 3.1 Pro (mid-2026 snapshot): $2.00 per 1M input tokens up to 200k context, doubling to $4.00 per 1M above 200k (ai.google.dev pricing, via Morph summary fetched 2026-08-27 — hedge: exact rates change; the *tiered structure* is the durable fact).
- Context-cache *reads* are billed separately and cheaper than fresh input: Gemini charges $0.15 per 1M cached-token reads for Flash-class models vs $1.50 per 1M fresh input (a 10× ratio), plus $1.00 per 1M tokens per hour of cache storage (Gemini Developer API pricing, fetched 2026-08-27). This exists precisely because re-reading cached KV is far cheaper than recomputing the prefill.

## How it works
- **Prefill is quadratic in N.** When the engine ingests a prompt of N tokens in one batched forward pass, every token attends to every other token: the attention score matrix has N² entries, and computing Q·Kᵀ plus the weighted sum costs ~O(N²·d) FLOPs per layer. On top of that, every parameter participates once per token, so a model with P parameters needs ~2·P·N FLOPs total for the prompt (Dive into Deep Learning, ch. 11.3, fetched 2026-08-27). Doubling the prompt roughly doubles the dense-matmul part but quadruples the attention-score part; the quadratic term dominates at long context.
- **Decode is linear per step, but the total grows.** Each generated token runs one forward pass over just the new token, which attends over all cached keys/values — that step costs O(N_t·d) attention FLOPs, linear in the tokens seen so far (NVIDIA Technical Blog, fetched 2026-08-27). Generating M tokens after a prompt of N tokens therefore costs, per layer, approximately:

  total attention FLOPs ≈ c·N²  (prefill)  +  c·Σ_{t=N}^{N+M} t  ≈  c·(N² + N·M + M²/2)

  where c bundles head-count and head-dimension constants. Two terms with different shapes: a quadratic *prompt* term you pay once at TTFT, and a growing *decode* term you pay per output token.
- **KV bytes are linear but huge.** The KV cache stores, per layer, the key and value vectors of every token seen: bytes/token = 2·L·H_kv·d_head·precision. FlashAttention and paged KV managers change the constant factors, not the linear growth; GQA (small H_kv) is the main architectural lever shrinking bytes per token.
- **Why TTFT explodes.** TTFT is dominated by prefill compute. Since prefill FLOPs scale ~N², a 1M-token prompt is not 8× a 128k prompt — the attention part is 64× (before the ~2·P·N dense term, which is only 8×). That quadratic term, plus KV-cache allocation before the first token, is why TTFT balloons on giant prompts and why providers split batching into a prefill phase distinct from decode (vLLM/SGLang/TensorRT-LLM all restructure the loop this way; kunwar.page ch. 21, fetched 2026-08-27).
- **Worked example (sourced constants).** Qwen3 8B, bf16, 144 KiB KV per token (Raschka, fetched 2026-08-27): a 128k-token prompt ⇒ 144 KiB × 131,072 ≈ 18 GB of KV cache held for the whole generation. That is why a single very-long-context request can evict many normal requests from a GPU's KV budget — batching capacity shrinks linearly with the longest resident context.

## Harness angle
- Cache the prompt, and budget the cache lifetime. Because prefill is the expensive quadratic term and re-reading cached KV is billed at ~1/10 of fresh input (Gemini: $0.15 vs $1.50 per 1M tokens, fetched 2026-08-27), a harness whose agent re-sends the same large system prompt/tool-manifest every turn should use provider context caching (or an implicit-cache engine) and compare the storage fee ($1.00 per 1M tokens/hour) against the number of turns the session will live. Concretely: re-sending 128k fresh tokens each turn at the >128k tier costs ~$0.02/turn extra vs a one-time cached write — an agent doing 100 turns on a big static prompt pays for itself immediately.

## Sources
- FlashAttention: Fast and Memory-Efficient Exact Attention with IO-Awareness — https://arxiv.org/abs/2205.14135
- FlashAttention (NeurIPS 2022 proceedings) — https://papers.nips.cc/paper_files/paper/2022/hash/67d57c32e20fd0a7a302cb81d36e40d5-Abstract-Conference.html
- Dao-AILab/flash-attention repo (benchmark/speedup claims) — https://github.com/dao-ailab/flash-attention
- NVIDIA Technical Blog: Co-Designing AI Model Attention for Fast, Interactive Long-Context Inference — https://developer.nvidia.com/blog/co-designing-ai-model-attention-for-fast-interactive-long-context-inference/
- Gemini Developer API pricing — https://ai.google.dev/gemini-api/docs/pricing
- Gemini API pricing, archived tiered table — https://web.archive.org/web/20250621161929/https:/ai.google.dev/gemini-api/docs/pricing
- Gemini long-context docs — https://ai.google.dev/gemini-api/docs/long-context
- Dive into Deep Learning, 11.3 Generation and the KV Cache — https://d2l.smola.org/chapter_transformers/kv-cache.html
- Sebastian Raschka, KV cache per-token calculations — https://sebastianraschka.com/llm-architecture-gallery/kv-cache-calculations/
- Prefill vs decode two-phase structure — https://www.kunwar.page/chapter/021-prefill-vs-decode-the-two-phase-nature-of-llm-inference
