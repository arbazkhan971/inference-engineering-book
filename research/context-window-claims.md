# Claimed vs effective context windows, and context as a memory product
researched: 2026-08-27 · researcher: glm-5.3-flash

## Key facts
- Claimed context is a serving/architecture limit; effective context is a quality limit. RULER defines "effective length" as the longest input where a model's 13-task average still beats a fixed threshold (Llama2-7B-chat at 4K, scoring 85.6%) (arXiv:2404.06654, 2024).
- RULER measured gaps between claimed and effective length: GPT-4 (gpt-4-1106-preview) claimed 128K vs effective 32K; Command-R 35B claimed 128K vs effective 64K; Yi-34B claimed 200K vs effective 16K; Mixtral-8x7B claimed 32K vs effective 16K; LWM claimed 1M vs effective <4K (arXiv:2404.06654, 2024).
- RULER headline: despite near-perfect scores on vanilla needle-in-a-haystack, only about half of 17 evaluated models claiming ≥32K context maintained satisfactory performance at 32K (arXiv:2404.06654, 2024).
- "Lost in the middle": performance is highest when relevant information sits at the beginning or end of the context and degrades significantly when it sits mid-context — on multi-document QA and key-value retrieval (arXiv:2307.03172, 2023). Position matters, not just length.
- Mid-2026 API context claims (official docs, fetched 2026-08-27):
  - OpenAI GPT-5 family: 400,000-token context window, 128,000 max output tokens (OpenAI model docs, fetched 2026-08-27). Caveat: max *input* is 272,000 because 128K is reserved for output — a documented-in-practice gap causing 400k-vs-272k input errors (OpenAI developer forum reports, fetched 2026-08-27).
  - Anthropic: Claude Opus 5/4.8/4.7/4.6, Sonnet 5/4.6 and others expose a 1M-token context window on the Claude API and cloud partners (Claude Platform docs, fetched 2026-08-27). Pricing tiers scope by context: e.g., Sonnet 4.5 standard tier "≤200K" at $3/MTok input, $15/MTok output, with separate >200K (1M) pricing tiers listed on the pricing PDF (Anthropic pricing docs, fetched 2026-08-27).
  - Google: gemini-3.1-pro-preview input limit 1,048,576 tokens, output 65,536; priced $2/$12 per MTok (in/out) for prompts ≤200K and $4/$18 above 200K (Gemini API docs, fetched 2026-08-27). Older Gemini 2.5 Pro showed the same pattern at $1.25/$10 (≤200K) vs $2.50/$15 (>200K) (Gemini pricing docs, archived 2025-06-21).
  - Open models: Meta Llama 4 Scout claims a 10M-token context window (17B active/109B total MoE) (Meta model card / AWS Bedrock docs, fetched 2026-08-27). Qwen's API models (e.g., qwen3.8-max, qwen3.8-flash) claim 1M context with 128K max output; Alibaba model-studio pages similarly show context window 1,000,000 with max input 997,952 and max output 65,536 for coder tiers (Qwen Cloud / Alibaba Cloud docs, fetched 2026-08-27).
- Long-context pricing is explicitly tiered, confirming providers treat >200K context as a distinct (costlier) product: Gemini input price doubles ($2→$4/MTok) and output rises 50% ($12→$18) above 200K tokens for Gemini 3.1 Pro (Gemini API docs, fetched 2026-08-27).

## How it works
- Claimed context length = what the model architecture and serving stack can accept: RoPE/YaRN-style position scaling, KV-cache memory, and chunked prefill make 1M+ token *inputs* mechanically possible. It is an admission limit, enforced per request as max_input + max_output ≤ context window (hence GPT-5's 272K practical input).
- Effective context length = the input length at which task quality stays above a chosen bar. Quality falls for structural reasons: attention entropy grows with sequence length (harder to sharpen on the right tokens), retrieved "needles" compete with distractors, and multi-hop/aggregation tasks fail before simple retrieval does. That is why NIAH looks perfect at lengths where RULER's aggregation and multi-hop tasks have already collapsed.
- The position effect ("lost in the middle") comes from relative-position bias in pretrained attention: models over-trust primacy (start) and recency (end) of the prompt, so facts buried mid-context are retrieved worse even when total length is small by modern standards.
- Worked example of the pricing formula: prompt of 300K input + 1K output on gemini-3.1-pro-preview. Tiering is per-prompt, so all 300K input lands in the >200K tier: input = 300,000/1,000,000 × $4 = $1.20; output = 1,000/1,000,000 × $18 = $0.018; total ≈ $1.22. The same request trimmed to 199K input would cost 199,000/1e6 × $2 + $0.012 ≈ $0.41 — roughly 3× cheaper for 100K *more* usable, better-attended context (constants: Gemini API pricing, fetched 2026-08-27).

## Harness angle
Size the agent's context budget from effective context (measured on your own retrieval/aggregation tasks), not the vendor's claimed window, and treat position as a design variable: keep instructions and critical facts near the top or bottom of the prompt, not the middle. Concretely: cap retrieved context at a budget (e.g., ≤200K on Gemini-tier models to stay in the cheap pricing tier and the well-attended region), and route overflow to external memory (files, a retrieval store) instead of trusting a 1M-token marketing number — RULER shows claimed windows can overstate effective ones by 4× to 100×+ (arXiv:2404.06654, 2024).

## Sources
- RULER: What's the Real Context Size of Your Long-Context Language Models? — https://arxiv.org/abs/2404.06654
- NVIDIA RULER repo (claimed vs effective tables) — https://github.com/NVIDIA/RULER
- Lost in the Middle: How Language Models Use Long Contexts — https://arxiv.org/abs/2307.03172
- OpenAI GPT-5 model docs — https://developers.openai.com/api/docs/models/gpt-5
- Claude Platform docs, context windows — https://platform.claude.com/docs/en/build-with-claude/context-windows
- Anthropic pricing (tier table, ≤200K vs 1M) — https://www-cdn.anthropic.com/files/4zrzovbb/website/5678bc2f5978e5bcd4f1fe7c14b2c72284dcf9f8.pdf
- Gemini API pricing (long-context tiers) — https://ai.google.dev/gemini-api/docs/pricing
- Gemini 3.1 Pro Preview model page (1,048,576 input limit) — https://ai.google.dev/gemini-api/docs/models/gemini-3.1-pro-preview
- Meta Llama 4 model card / Bedrock (Scout 10M context) — https://docs.aws.amazon.com/bedrock/latest/userguide/model-card-meta-llama-4-scout-17b-instruct.html
- Qwen Cloud text-generation models (1M context tiers) — https://docs.qwencloud.com/developer-guides/getting-started/text-generation-models
