# Tokenizers at the Edges: Digits, Whitespace, Code, and the Strawberry Problem
researched: 2026-08-27 · researcher: glm-5.3-flash

## Key facts
- **Rule of thumb (English):** 1 token ≈ 4 characters ≈ 0.75 words, i.e. 100 tokens ≈ 75 words, per OpenAI's official docs; other languages diverge sharply from this ratio (OpenAI Help Center / tokenizer page, fetched 2026-08-27).
- **Digit grouping, tiktoken lineage (GPT-4/cl100k, GPT-4o/o200k):** digit runs split left-to-right in chunks of up to 3 (`\p{N}{1,3}`), so a 7-digit number is 3 tokens (`123|456|7`), a 6-digit number 2 (`234|567`). Chunk boundaries depend on total length, not place value — `1234567` and `234567` share no boundaries (dev.to analysis of tiktoken regex, 2025; artfish.ai digit experiment on pi digits, 2024).
- **Single-digit tokenizers:** Llama 2, Gemma, and DeepSeek-family tokenizers split every digit individually — a 12-digit number is 12 tokens vs 4 under 3-digit grouping, roughly 2–3x cost on numeric-heavy text (derived from the same analysis; approximate, 2025). GPT-2 had no digit clause at all, so multi-digit merges were arbitrary frequency artifacts.
- **Thousands separators change tokenization:** a comma is a hard token boundary, so `1,234,567` becomes `1`, `,`, `234`, `,`, `567` — right-to-left, power-of-1000-aligned chunks where `234,567` means the same thing in every number that contains it. This is a documented factor in arithmetic reliability (dev.to, 2025).
- **Claude's tokenizer is not published:** you cannot inspect Claude splits directly; the `messages.count_tokens` API is the only preflight source (Anthropic docs + anthropic-tokenizer-typescript README, fetched 2026-08-27).
- **Whitespace is not free:** modern byte-level BPE tokenizers preserve whitespace structure (unlike WordPiece, which normalizes tabs/spaces); GPT-4-era tokenizers group runs of Python indentation into single tokens where the vocabulary allows (community analysis, hundredblocks.github.io, 2024–2025; approximate).
- **Code formatting costs ~25% of input tokens:** removing indentation/newlines/formatting from source yields a **24.5% average input token reduction** with pass@1 maintained across 10 LLMs and Java, Python, C++, C#; output shrinks negligibly from format removal alone but up to 36.1% with prompting/fine-tuning (arXiv:2508.13666, 2025).
- **CJK costs:** Chinese commonly costs **2–3 tokens per character** on OpenAI tokenizers, while Korean hanja-free hangul words are often 1–3 tokens (OpenAI community thread + StackOverflow example where 我说你倒是快点啊!!! tokenizes to 27 tokens, cl100k era, 2023–2024; community figures, approximate). Common characters like 三 can be a single token, but full sentences are typically far more expensive per semantic unit than English (tonybaloney.github.io CJK guide, 2024).
- **Token tax is systematic:** across 22 typologically diverse languages the same information costs widely different token counts on commercial tokenizers, so non-English users pay more and get worse effective context for identical content (arXiv:2305.13707 / EMNLP 2023). A later study frames fertility (tokens/word) as predicting downstream accuracy, with token doubling implying roughly quadrupled training cost and time (arXiv:2509.05486, 2025).
- **Strawberry-class failures are a tokenization effect:** LLMs "consistently fail" at character-level tasks like counting letters in *strawberry*; the paper frames it as low mutual information between tokens and character-level concepts, using 19 synthetic tasks (arXiv:2505.14172, EMNLP 2025).
- **max_tokens sizing follows token families, not words:** because digits, CJK, and indentation each carry different token density, an output budget set from English-prose intuition underestimates numeric or non-English or code-heavy generations by 2–3x (derived from the ratios above).

## How it works
Byte-level BPE tokenizers apply a **pre-tokenizer regex** before merging, and that regex — not the merge table — decides most edge behavior. Tiktoken-family regexes contain a `\p{N}{1,3}` clause that greedily grabs up to three digits at a time, which is why digits group in threes; tokenizers without that clause (Llama 2, Gemma, DeepSeek lineage) leave digits as single tokens. Commas interrupt the regex match, resetting the grouping so every comma-delimited group is right-aligned to a power of 1000 — which is why `1,234,567` gives every group the same place-value meaning regardless of magnitude, while ungrouped digits depend on leading length.

Whitespace behavior likewise comes from the pre-tokenizer. Byte-level tokenizers keep leading spaces, tabs, and newlines as distinct bytes that can merge into multi-space or indentation tokens if the vocabulary learned them; WordPiece-style tokenizers collapse whitespace first. Code is where this bites: Python's significant indentation means every level of nesting adds whitespace tokens per line, and the 24.5% input reduction from stripping formatting (arXiv:2508.13666) is a direct measure of how much of a code prompt is readability scaffolding the model does not need.

The strawberry problem is the downstream face of the same mechanism: if "strawberry" is one or two tokens, the model never sees the letters r, a, w individually — it must have memorized, during training, that token's spelling. Character-level questions therefore probe a side channel (arXiv:2505.14172), and accuracy on them is a function of which spellings happened to appear in training data, not of model intelligence.

## Harness angle
Do not budget `max_tokens` or estimate cost from word counts. Count with the target model's actual tokenizer (tiktoken/`count_tokens`/`countTokens`) per language and payload type, and when routing numeric-heavy or non-English workloads, apply the 2–3x token multiplier (or measure it) — otherwise the harness will truncate mid-answer on exactly the requests whose outputs cost the most. When exact arithmetic matters, instruct the model to emit comma-grouped numbers; when cost matters on code, consider stripped or minified code payloads (~25% input savings per arXiv:2508.13666).

## Sources
- https://help.openai.com/en/articles/4936856-understanding-and-counting-tokens
- https://platform.openai.com/tokenizer
- https://dev.to/ji_ai/digit-tokenization-why-commas-fix-llm-arithmetic-e05
- https://www.artfish.ai/p/how-would-you-tokenize-or-break-down
- https://arxiv.org/abs/2508.13666
- https://arxiv.org/abs/2505.14172
- https://arxiv.org/abs/2305.13707
- https://arxiv.org/abs/2509.05486
- https://platform.claude.com/docs/en/build-with-claude/token-counting
- https://community.openai.com/t/all-languages-are-not-created-tokenized-equal/216407
