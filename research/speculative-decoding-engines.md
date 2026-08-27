# Speculative decoding in production engines: draft, verify, and when guessing backfires
researched: 2026-08-27 · researcher: glm-5.3-flash

## Key facts
- Speculative decoding samples from a target LLM **unchanged** — a cheap drafter proposes γ tokens, the target verifies them all in one forward pass, and a modified rejection sampler corrects any divergence, so the output distribution is provably identical to ordinary sampling (Leviathan et al., arXiv:2211.17192, 2023; Chen et al., arXiv:2302.01318, 2023).
- Google reported **2x–3x wall-clock speedups** on T5-XXL (11B) translation with a small drafter (Leviathan et al., arXiv:2211.17192, 2023). DeepMind's simultaneous work reported similar 2–3x range on Chinchilla 70B (Chen et al., arXiv:2302.01318, 2023).
- EAGLE drafts at the **feature level** (second-to-top-layer hidden states) instead of the token level; on LLaMA2-Chat 70B it achieved **2.7x–3.5x latency speedup and roughly doubled throughput** (EAGLE, arXiv:2401.15077, ICML 2024).
- EAGLE-2 adds **context-dependent dynamic draft trees** built from the draft model's own confidence, improving token acceptance per verify step over EAGLE's static tree (EAGLE-2, EMNLP 2024, arXiv:2406.16858).
- EAGLE-3 drops feature prediction and trains with "training-time test," fusing low-, mid-, and high-layer features; it reports **4.1x–6.5x speedup** at temperature 0 across Vicuna-13B, Llama-3.1-8B, Llama-3.3-70B (arXiv:2503.01840, NeurIPS 2025), and claims ~5.6x vs vanilla and ~1.8x vs EAGLE-1 on 13B models (SafeAILab/EAGLE GitHub README, fetched 2026-08-27).
- Medusa attaches **multiple extra decoding heads** to the target model, avoiding a separate draft model; the Medusa-2 recipe reports **2.2x–3.6x speedup** across a range of LLMs (arXiv:2401.10774, 2024; FasterDecoding/Medusa README, fetched 2026-08-27).
- Prompt lookup / n-gram speculation replaces the drafter with **string matching against the prompt itself**; the original repo reports **2x–4x speedups on input-grounded tasks** (summarization, code editing, RAG-style copy) with no model changes (apoorvumang/prompt-lookup-decoding README, fetched 2026-08-27).
- vLLM ships EAGLE, MTP, draft-model, PARD, MLP (model-based, best latency gains) plus n-gram and suffix decoding ("modest speedups without increasing workload during peak traffic"), selected via `speculative_config` flags like `method="eagle"`, `num_speculative_tokens`, and n-gram's `prompt_lookup_min/max` window (vLLM docs, fetched 2026-08-27).
- SGLang recommends EAGLE-3 via `--speculative-algorithm EAGLE3` ("best speed/quality") and also offers EAGLE-2, MTP, DFLASH, draft-model, and n-gram variants (SGLang docs, fetched 2026-08-27).
- TensorRT-LLM supports draft-target-model (DTM), Medusa-style, EAGLE, and lookahead-style drafters; its docs frame speculation explicitly as **"a technique for accelerating LLM inference at low batch sizes"** and fix a per-request `max_draft_len` with **no way to dynamically disable** it per request (TensorRT-LLM docs, fetched 2026-08-27).

## How it works
The core loop is draft-and-verify. Autoregressive decoding is memory-bandwidth-bound: each of K tokens requires a full serial forward pass that streams all weights through the GPU. Speculation exploits the fact that a verify pass costs almost the same as a normal pass but checks γ draft tokens at once (one forward pass over the γ-token suffix, γ logit rows out).

1. Drafter proposes γ tokens cheaply (a small LM, Medusa heads, EAGLE feature head, or prompt n-gram match).
2. Target runs **one** forward pass over the γ proposed tokens and produces the target distribution at every position.
3. Rejection sampling: for each position i, accept draft token x_i if it's plausibly sampled from target distribution p; otherwise resample from the corrected distribution norm(max(0, p − q)) where q is the drafter's distribution. This correction is what makes the output **distribution-identical** to sampling the target alone (Leviathan et al., 2023; Chen et al., 2023).
4. On the first rejection, all later drafts are discarded; a bonus token after the last accepted draft often comes free from the verify pass.

Speedup math (Leviathan et al. §2): expected accepted tokens per step is E[accepted] = (1 − α^(γ+1))/(1 − α), where α is per-token acceptance rate (draft token ∈ target's plausible set). With α = 0.8 and γ = 4: (1 − 0.8^5)/(1 − 0.8) ≈ 3.36 tokens per verify pass. You win only if that multiplier beats the combined cost ratio c = (draft cost + verify cost)/verify cost — with EAGLE-3's reported α around 0.8+ (arXiv:2503.01840, 2025) on in-domain text, verification is ~free, hence the large speedups. Tree-based variants (EAGLE-2, Medusa's tree attention) verify a *tree* of candidates in one pass, raising effective acceptance per step.

**When it hurts:** (a) low acceptance — cold/out-of-domain tasks drop α toward coin-flip, and you pay draft cost plus wasted verify width; (b) structured output — grammar-constrained decoding (JSON schemas, tool-call grammars) shrinks the legal token set so draft tokens that the grammar would reject get thrown away, and some engines disable or degrade speculation under guided decoding; (c) high-batch throughput regimes — at large batch the GPU is compute-bound, verify width multiplies FLOPs per request, and both vLLM's own docs table (EAGLE: "high gain" at low QPS, "medium to high" at high QPS) and TensorRT-LLM's "low batch sizes" framing say speculation is a latency tool, not a throughput tool (vendor docs fetched 2026-08-27).

## Harness angle
Speculation is a **per-workload toggle, not a fleet-wide default**. A harness serving conversational agents (long prompts echoed back in tool outputs → high n-gram acceptance) should enable n-gram/EAGLE speculation on latency-sensitive endpoints but disable it for batch/eval jobs and for requests using structured output grammars, and should monitor per-request acceptance rate (vLLM exposes this in its spec-decode offline example) as a canary for domain drift — falling acceptance means the engine is burning compute on rejected drafts.

## Sources
- Leviathan, Kalman, Matias — Fast Inference from Transformers via Speculative Decoding: https://arxiv.org/abs/2211.17192 (ICML 2023)
- Chen et al. — Accelerating LLM Decoding with Speculative Sampling: https://arxiv.org/abs/2302.01318 (2023)
- EAGLE (Li et al.): https://arxiv.org/abs/2401.15077 (ICML 2024)
- EAGLE-2 (Li et al.): https://aclanthology.org/2024.emnlp-main.422/ (EMNLP 2024)
- EAGLE-3 (Li et al.): https://arxiv.org/abs/2503.01840 (NeurIPS 2025)
- Medusa (Cai et al.): https://arxiv.org/abs/2401.10774 (ICML 2024)
- Prompt lookup decoding: https://github.com/apoorvumang/prompt-lookup-decoding
- vLLM Speculative Decoding docs: https://docs.vllm.ai/en/latest/features/speculative_decoding/
- SGLang Speculative Decoding docs: https://docs.sglang.ai/advanced_features/speculative_decoding.html
- TensorRT-LLM speculative decoding docs: https://nvidia.github.io/TensorRT-LLM/advanced/speculative-decoding.html
