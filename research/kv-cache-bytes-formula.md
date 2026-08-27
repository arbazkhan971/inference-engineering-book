# KV cache bytes per token: the formula and what it costs you at 8k, 32k, and 128k
researched: 2026-08-27 · researcher: glm-5.3-flash

## Key facts
- The base formula for standard (multi-head or grouped-query) attention:
  **KV bytes per token = 2 × num_hidden_layers × num_key_value_heads × head_dim × bytes_per_element**
  The leading 2 is K and V; the trailing factor is dtype width (2 for FP16/BF16, 1 for FP8/INT8). (vLLM / HF transformers semantics, config.json fields, fetched 2026-08-27)
- Llama 3.1 8B: 32 layers, 8 KV heads, head_dim 128 (unsloth mirror of meta-llama config.json, fetched 2026-08-27) → 2×32×8×128×2 = **131,072 B = 128 KiB per token** at FP16.
- Llama 3.1 70B: 80 layers, 8 KV heads, head_dim 128 (NousResearch mirror of meta config.json, fetched 2026-08-27) → 2×80×8×128×2 = **327,680 B = 320 KiB per token** at FP16.
- Qwen3-8B: 36 layers, 8 KV heads, head_dim 128 (Qwen/Qwen3-8B config.json, fetched 2026-08-27) → 2×36×8×128×2 = **147,456 B = 144 KiB per token** at FP16.
- gpt-oss-20b: 24 layers, 8 KV heads, head_dim 64 (openai/gpt-oss-20b config.json, fetched 2026-08-27) → 2×24×8×64×2 = **49,152 B = 48 KiB per token**. Half its layers use a 128-token sliding window (alternating "sliding_attention"/"full_attention" in layer_types), so effective footprint is roughly half the naive figure at long contexts.
- gpt-oss-120b: 36 layers, 8 KV heads, head_dim 64 (openai/gpt-oss-120b config.json, fetched 2026-08-27) → 2×36×8×64×2 = **73,728 B = 72 KiB per token**, again with alternating sliding-window layers.
- DeepSeek-V3 uses MLA, which breaks the formula: it stores one compressed latent vector per layer of size kv_lora_rank + qk_rope_head_dim = 512 + 64 = 576 elements, not per-head K/V (deepseek-ai/DeepSeek-V3 config.json, fetched 2026-08-27) → 61 × 576 × 2 = **70,272 B ≈ 68.6 KiB per token** at FP16. A hypothetical standard-attention model with its 128 KV heads × 128 head_dim would need 2×61×128×128×2 = 4 MiB per token — MLA cuts that by ~59×.
- All config numbers above were read directly from HuggingFace `config.json` on 2026-08-27.

## How it works
During generation, every token's attention keys and values are cached so later tokens attend without recomputing them. Each layer writes one K vector and one V vector per KV head (grouped-query attention shares 8 KV heads across many query heads, which is why kv_heads is 8 while query heads are 32–128 in every model above). Multiply out layers × heads × head_dim × dtype bytes, and double for K+V: that is what one token permanently occupies in HBM until it is evicted.

Cache at a context is then linear: **total KV = bytes_per_token × context_length × concurrent_sessions**.

Worked table, FP16 KV, full-context cache per session:

| Model | B/token | 8k ctx | 32k ctx | 128k ctx |
|---|---|---|---|---|
| Llama 3.1 8B | 128 KiB | 1.0 GiB | 4.0 GiB | 16.0 GiB |
| Llama 3.1 70B | 320 KiB | 2.5 GiB | 10.0 GiB | 40.0 GiB |
| Qwen3-8B | 144 KiB | 1.125 GiB | 4.5 GiB | 18.0 GiB (native max 40,960 positions; 128k would need external scaling) |
| gpt-oss-120b | 72 KiB | 0.5625 GiB | 2.25 GiB | 9.0 GiB |
| DeepSeek-V3 (MLA) | 68.6 KiB | 0.54 GiB | 2.14 GiB | 8.57 GiB |

(128 KiB × 32,768 = 4 GiB etc.; gpt-oss figures are upper bounds — sliding_window=128 in its config means sliding layers cap at ~128 tokens of cache, not full context.)

FP8 KV halves every row exactly (bytes_per_element 2 → 1), which is why vLLM/SGLang expose `kv_cache_dtype="fp8"`: Llama 3.1 8B drops from 128 to 64 KiB per token (vLLM FP8 KV cache docs, fetched 2026-08-27).

Capacity math, one concrete case: serve Llama 3.1 8B FP16 on one 80 GiB GPU (H100). Weights ≈ 16 GB (8.03B params × 2 B, Meta model card, 2024). Reserve ~4 GiB for activations/workspace; ~60 GiB remains for KV. At 32k context each session needs 4 GiB → **~15 concurrent 32k sessions**; with FP8 KV, 2 GiB each → **~30 sessions**. Same GPU with gpt-oss-120b (MXFP4 weights ≈ 61 GB per OpenAI model card, 2025) leaves only ~15 GiB → at 32k FP8 context (1.125 GiB/session) roughly a dozen sessions — weights, not KV, become the binding constraint.

## Harness angle
Session-limit math is an application-layer decision, not an ops detail: if your agent harness lets one user's session grow to 32k tokens, you are spending ~4 GiB (Llama 8B FP16) of a shared GPU on them, and your concurrency ceiling is (usable_HBM − weights − workspace) ÷ KV_per_session. Concretely: cap context, evict idle sessions, and batch-prefix cache reuse before you blame "slow GPUs" — and when choosing between models of similar quality, pick the one with fewer layers × kv_heads × head_dim (or MLA/sliding-window designs like DeepSeek-V3 and gpt-oss), because that product sets your throughput floor.

## Sources
- Llama 3.1 8B config.json (unsloth mirror): https://huggingface.co/unsloth/Llama-3.1-8B-Instruct/raw/main/config.json
- Llama 3.1 70B config.json (NousResearch mirror): https://huggingface.co/NousResearch/Meta-Llama-3.1-70B/raw/main/config.json
- Qwen3-8B config.json: https://huggingface.co/Qwen/Qwen3-8B/raw/main/config.json
- DeepSeek-V3 config.json: https://huggingface.co/deepseek-ai/DeepSeek-V3/raw/main/config.json
- gpt-oss-20b config.json: https://huggingface.co/openai/gpt-oss-20b/raw/main/config.json
- gpt-oss-120b config.json: https://huggingface.co/openai/gpt-oss-120b/raw/main/config.json
- vLLM FP8 KV cache docs: https://docs.vllm.ai/en/latest/features/quantization/fp8.html
- DeepSeek-V2 paper (MLA mechanism): https://arxiv.org/abs/2405.04434
