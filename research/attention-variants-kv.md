# How MHA, MQA, GQA, and MLA shrink the KV cache

researched: 2026-08-27 · researcher: glm-5.3-flash

## Key facts

- The baseline cost formula for a multi-head attention (MHA) KV cache is `bytes/token = 2 (K and V) × layers × kv_heads × head_dim × bytes_per_element`. For Llama-2-70B (80 layers, 64 heads, head_dim 128, FP16) that is ~2.6 MB per token, so an 8,192-token sequence needs ~21.3 GB of KV cache alone (unanswered.io formula guide, fetched 2026-08-27).
- Llama 3 70B uses grouped-query attention (GQA) with 64 query heads but only 8 KV heads, an 8× cache reduction versus MHA (Llama 3 model card / config, arXiv:2407.21783, 2024; machinelearningplus guide, fetched 2026-08-27).
- GQA was introduced by Ainslie et al., "GQA: Training Generalized Multi-Query Transformer Models from Multi-Head Checkpoints" (arXiv:2305.13245, 2023); it interpolates between MHA (group size 1) and MQA (group size = number of query heads), and quality stays within evaluation noise of MHA at 8× compression.
- Multi-query attention (MQA), Shazeer 2019 ("Fast Transformer Decoding: One Write-Head is All You Need", arXiv:1911.02150), shares a single KV head across all query heads — the maximum head-count compression, but with measurable quality degradation that motivated GQA (arXiv:2305.13245, 2023).
- DeepSeek-V3's multi-head latent attention (MLA) caches a joint latent vector of 512 dims plus a decoupled RoPE key of 64 dims per token per layer — 576 elements total — regardless of how many heads the model has (DeepSeek-V3 Technical Report, arXiv:2412.19437, 2024).
- With head_dim 128 and 128 heads, an equivalent-GQA DeepSeek-V3 layer would cache 2×128×128 = 32,768 elements per token per layer; MLA's 576 elements is a ~57× reduction in element count per layer (DeepSeek-V3 Technical Report, arXiv:2412.19437, 2024, worked example below).
- Gemma 3 interleaves 5 local sliding-window layers (window 1024) with 1 global layer per block, cutting KV growth for 5/6 of layers because windowed layers only keep ~1024 tokens of KV regardless of sequence length; this was adopted explicitly to tame KV-memory explosion at 128K context (Gemma 3 Technical Report, arXiv:2503.19786, 2025).
- Gemma 4 (mid-2026) keeps the same 5:1 local-to-global ratio (4:1 for the 2.3B model) with p-RoPE (Gemma 4 Technical Report, arXiv:2607.02770, fetched 2026-08-27).
- Hardware analysis of MLA on accelerators confirms the latent cache cuts both memory footprint and decode-phase bandwidth demand versus MHA, with a small matrix-absorption compute overhead (arXiv:2506.02523, 2025).
- Adoption snapshot (mid-2026, from configs/tech reports): Llama 2/3/3.x → GQA (8 KV heads on the 70B); Mistral/Mixtral → GQA (8 KV heads); Qwen 2/2.5 → GQA (4–8 KV heads by size); Gemma 2/3 → GQA; Phi-3/4 → GQA; DeepSeek-V2/V3/R1 → MLA; Gemma 3/4 additionally use sliding-window local attention for most layers (model configs summarized in kunwar.page compilation and per-model tech reports, fetched 2026-08-27).

## How it works

- **MHA baseline.** Every attention head has its own K and V projections. During autoregressive decoding, each generated token appends one K and one V vector per head per layer to the cache. Doubling heads or layers doubles the cache; cache size is independent of FLOPs, so at long context and small batch the cache — and the bandwidth to stream it every step — dominates.
- **GQA.** Keep all query heads but compute K/V only for `n_kv` heads; each group of `n_q / n_kv` query heads shares one KV head. Cache shrinks by exactly the group factor `n_q / n_kv`. Worked example: Llama 3 70B, FP16: `2 × 80 layers × 8 kv_heads × 128 × 2 bytes = 327,680 bytes ≈ 0.33 MB/token` — versus ~2.6 MB/token for MHA with 64 heads. An 8K-token request then needs ~2.6 GB instead of ~21 GB (config: Meta Llama 3; formula: KV-cache guide, fetched 2026-08-27).
- **MQA.** The degenerate GQA case: `n_kv = 1`. Every query head reads the same single cached K/V stream — a further 8× cut from GQA's 8 KV heads, but quality typically drops enough that most labs settled on GQA as the sweet spot (arXiv:2305.13245, 2023).
- **MLA (DeepSeek).** Instead of reducing head count, compress the *representation*. Keys and values are jointly projected into one shared latent `c_KV ∈ R^512` per token; at decode time only `c_KV` (512 dims) plus a separate RoPE-carrying key (64 dims) is cached — 576 elements per token per layer. Query-side and key/value up-projection matrices can be "absorbed" into the attention weights so the latent is used directly, never materializing full K/V (DeepSeek-V3 Technical Report, arXiv:2412.19437, 2024). The compression factor versus an MHA/GQA layer grows with head count, which is why it pays off most for wide models.
- **Sliding-window attention (Gemma).** Local layers attend only to the last `W` tokens (W = 1024 in Gemma 3), so their KV footprint is capped at ~W tokens per layer no matter how long the prompt is; only the 1-in-6 global layers keep the full history. Longest-context information flows through the stack via the interleaved global layers (Gemma 3 Technical Report, arXiv:2503.19786, 2025).
- **Quality-vs-memory ladder (roughly):** MHA = best quality, most memory; GQA ≈ MHA quality at 4–8× less memory; MQA = smallest cache among head-sharing schemes with a small quality tax; MLA ≈ MHA-quality with the largest compression, at the cost of a more complex kernel/stack (matrix absorption) that most serving engines originally built for GQA (arXiv:2502.07864, 2025).

## Harness angle

When you pick a model for an agent harness, attention variant sets your real per-conversation memory budget and therefore your max context, batch, and prefix-cache economics: a GQA model like Llama 3 70B burns ~0.33 MB/token (FP16) of KV, so a 128K-token agent session with big tool transcripts reserves ~40 GB of KV across the deployment — while an MLA model like DeepSeek-V3 cuts that by ~50×, making long-agent-context serving viable. Harness decision: budget context-window limits and prompt-caching strategies per model family based on its attention variant, not its parameter count.

## Sources

- DeepSeek-V3 Technical Report — https://arxiv.org/abs/2412.19437 (MLA mechanism, 512+64 latent dims)
- Shazeer 2019, Fast Transformer Decoding (MQA) — https://arxiv.org/abs/1911.02150
- Ainslie et al. 2023, GQA — https://arxiv.org/abs/2305.13245
- Gemma 3 Technical Report — https://arxiv.org/abs/2503.19786 (5:1 local:global, window 1024)
- Gemma 4 Technical Report — https://arxiv.org/html/2607.02770 (5:1 ratio, p-RoPE)
- Llama 3 Technical Report (GQA config) — https://arxiv.org/abs/2407.21783
- Hardware-Centric Analysis of MLA — https://arxiv.org/abs/2506.02523
- TransMLA (GQA→MLA migration) — https://arxiv.org/abs/2502.07864
- KV cache memory formula guide — https://unanswered.io/guide/kv-cache-memory-usage
