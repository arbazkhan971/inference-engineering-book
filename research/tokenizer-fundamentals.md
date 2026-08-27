# Tokens before tokens: what tokenization does to latency and cost

researched: 2026-08-27 · researcher: glm-5.3-flash

## Key facts

- Every provider ships its own tokenizer, and published vocabularies differ by more than 5× (256,000 / 50,257): GPT-2's BPE vocab is 50,257 (HF `openai-community/gpt2` config, fetched 2026-08-27); the GPT-3.5/GPT-4-era `cl100k_base` merge table has 100,256 entries and `o200k_base` has 199,998 (OpenAI public tiktoken blobs, line counts, fetched 2026-08-27); Llama 3 uses 128,256 (HF config via NousResearch mirror, fetched 2026-08-27); Qwen3 151,936 (HF config, fetched 2026-08-27); DeepSeek-V3 129,280 (HF config, fetched 2026-08-27); Gemma 2 256,000 (HF config, fetched 2026-08-27); GLM-4.5 151,552 (HF config, fetched 2026-08-27); Mistral Nemo's Tekken tokenizer 131,072 (HF config, fetched 2026-08-27); OpenAI's gpt-oss-20b 201,088 (HF config, fetched 2026-08-27).
- OpenAI's rule of thumb: "1 token is approximately 4 characters" and "100 tokens are approximately 75 words" for common English (OpenAI Help Center, token counting article, fetched 2026-08-27).
- Anthropic documents that "Claude 4.7 and later models ... use a newer tokenizer. The same input text produces approximately 30 percent more tokens than on earlier models," and instructs developers to recount prompts against the model they plan to use rather than reuse counts from earlier models (platform.claude.com, token-counting guide, fetched 2026-08-27). Claude's exact vocabulary size is not published (no public number found as of 2026-08-27); Anthropic instead ships a count-tokens API endpoint (endpoint docs live, fetched 2026-08-27).
- Rate limits are token-denominated: Anthropic's Messages API limits are measured in requests per minute (RPM), input tokens per minute (ITPM), and output tokens per minute (OTPM) per model class, enforced with a token-bucket algorithm where short bursts can exceed the average rate; and "for most Claude models, only uncached input tokens count toward your ITPM rate limits" (Anthropic rate-limits doc, fetched 2026-08-27).
- Tokens are the billing unit. DeepSeek bills "per 1M tokens" with separate cache-hit vs cache-miss input prices and peak vs off-peak windows: DeepSeek-V4-Flash cache-hit input $0.007/1M off-peak and $0.014/1M peak; cache-miss input $0.22 off-peak and $0.44 peak; output $0.66/1M off-peak (DeepSeek API pricing page, fetched 2026-08-27). Derived from those prices: a cache hit is worth ~31× on input ($0.22/$0.007) and off-peak is worth 2× ($0.44/$0.22).
- Anthropic lists Claude Sonnet 5 at $2 per 1M input / $10 per 1M output tokens and notes the launch "introductory pricing through August 31, 2026" "is now the standard price" while the "previously scheduled increase to $3/$15 per million input/output tokens on September 1, 2026 will not occur" (Anthropic pricing page, fetched 2026-08-27). The same page shows Anthropic's cache multipliers in the Claude Opus 4 row: $15 input, $18.75 five-minute cache write (1.25×), $30 one-hour cache write (2×), $1.50 cache read (0.1×), $75 output (fetched 2026-08-27).
- Decode is serial by construction: "decoding K tokens takes K serial runs of the model" (Leviathan et al., *Fast Inference from Transformers via Speculative Decoding*, arXiv:2211.17192, Nov 2022); speculative decoding exploits easier subtasks to recover 2–3× on T5-XXL without changing outputs (same paper).

## How it works

Modern LLM tokenizers are learned compression over a fixed codebook. Byte-pair encoding (BPE) starts from raw bytes and repeatedly merges the statistically most frequent adjacent pair into a new token until the vocabulary reaches a target size — which is why published vocabularies cluster between ~50k and ~256k entries across vendors. Encoding new text is a greedy longest-match against the learned merge table. WordPiece (the BERT lineage) is the same idea with "continuation" markers on sub-word pieces; SentencePiece treats raw text, spaces included, as the training stream so it works language-agnostically. Because each vendor trains its own merge table on its own corpus, the same paragraph is a different token count on every model — there is no universal converter, only per-model tokenizers.

Two consequences dominate latency and cost. First, generation is sequential: an autoregressive model samples token t conditioned on tokens 1..t-1, so K output tokens require K serial model runs no matter how fast each run is (Leviathan et al., 2022). Tokenization sets the length of that serial chain: a tokenizer that splits your domain jargon into five tokens where another uses two makes generation proportionally slower and bills proportionally more on the same model class. Second, everything downstream is counted in the provider's tokens, not yours: per-1M input/output pricing, ITPM/OTPM rate limits, cache-hit vs cache-miss billing, and peak/off-peak windows all apply to the provider's count. Estimates drift — Anthropic's documented ~30% tokenizer increase for Claude 4.7+ would silently inflate a token budget by ~30% if you kept counts made against an older model.

## Harness angle

Budget with the target model's tokenizer, never a character heuristic. At design time, count representative prompts with the provider's tokenizer or count-tokens endpoint; at runtime, trust the usage counts returned by the API and reconcile the two. When a model version changes, recount before reusing stored estimates — Anthropic's own guidance after its ~30% tokenizer shift is to recount against the target model. Tokenizer efficiency is also a model-selection criterion for high-volume harnesses: fewer tokens per task means a shorter serial decode chain (lower latency), less ITPM/OTPM quota burn, and proportionally lower cost — and stable prefixes that tokenize identically across turns are what make provider prompt-cache discounts (e.g., DeepSeek's 31× input gap) actually fire.

## Sources

- https://help.openai.com/en/articles/4936856-what-are-tokens-and-how-to-count-them — tokens ≈ 4 chars; 100 tokens ≈ 75 words
- https://platform.claude.com/docs/en/build-with-claude/token-counting — Claude 4.7+ ~30% more tokens; recount guidance
- https://docs.claude.com/en/api/rate-limits — RPM/ITPM/OTPM, token bucket, cache-aware ITPM
- https://docs.claude.com/en/docs/about-claude/pricing — Sonnet 5 $2/$10 note; Opus 4 cache multipliers
- https://api-docs.deepseek.com/quick_start/pricing — per-1M billing; cache-hit/miss; peak/off-peak
- https://openaipublic.blob.core.windows.net/encodings/cl100k_base.tiktoken — cl100k merge table, 100,256 entries
- https://huggingface.co/NousResearch/Meta-Llama-3-8B/raw/main/config.json — Llama 3 vocab 128,256
- https://huggingface.co/Qwen/Qwen3-8B/raw/main/config.json — Qwen3 vocab 151,936
- https://huggingface.co/deepseek-ai/DeepSeek-V3/raw/main/config.json — DeepSeek-V3 vocab 129,280
- https://arxiv.org/abs/2211.17192 — "K serial runs"; speculative decoding 2–3×
