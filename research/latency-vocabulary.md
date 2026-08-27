# TTFT, TPOT, ITL, end-to-end: the latency vocabulary of LLM serving

researched: 2026-08-27 · researcher: glm-5.3-flash

## Key facts

- **TTFT (time to first token)**: "the time it takes for the model to generate the first token of the response, from when the prompt was sent" (Anthropic "Reducing latency" docs, fetched 2026-08-27). Artificial Analysis measures TTFT as the seconds between sending a request and receiving the first token, and for reasoning models counts the first *reasoning* token (Artificial Analysis methodology, fetched 2026-08-27).
- **Baseline latency** (Anthropic's companion term): the time for the model to process the prompt and generate the response, not counting tokens-per-second effects (Anthropic docs, fetched 2026-08-27).
- **TPOT (time per output token)**: "the average latency between two subsequent generated tokens," measured per request (DistServe blog, Hao AI Lab, fetched 2026-08-27; DistServe paper, arXiv:2401.09670, Jun 2024).
- **ITL (inter-token latency)**: the gap between consecutive streamed tokens; LLMPerf measures inter-token latency per request and across concurrent requests (LLMPerf README, fetched 2026-08-27). TPOT summarizes ITL as a per-request mean; ITL percentiles expose the jitter the mean hides.
- **End-to-end (e2e) response time**: "the total time to receive a complete response, including input processing time, model reasoning time, and answer generation time" (Artificial Analysis methodology, fetched 2026-08-27).
- **Streaming**: "the mode in which the server returns the tokens one by one as the model generates them" (Hugging Face TGI docs, fetched 2026-08-27).
- The vLLM benchmark suite reports percentiles for exactly four latency metrics — `ttft`, `tpot`, `itl`, `e2el` — p99 by default (vLLM bench serve docs, fetched 2026-08-27); its timeline plot colors ITLs using default thresholds of 25 ms and 50 ms (same source).
- **Identity**: e2e ≈ TTFT + (N − 1) × mean ITL for an N-token output; rearranged, TPOT = (e2e − TTFT)/(N − 1). The terms are measured; the identity is arithmetic.
- **Dated magnitudes** — median output tokens/s across providers (Artificial Analysis models page, fetched 2026-08-27): Gemini 3.5 Flash-Lite ≈ 365; Gemini 3.7 Flash (high) ≈ 330; GPT-5.6 Luna ≈ 131; Claude 4.5 Haiku ≈ 119; GLM-5.3 ≈ 67; Claude Opus 5 ≈ 55; Kimi K3 ≈ 39. Derived mean ITL equivalents: 1000/365 ≈ 2.7 ms (fastest) down to 1000/39 ≈ 26 ms (slowest).
- On Artificial Analysis' Intelligence Index evaluation tasks (long, reasoning-heavy prompts; fetched 2026-08-27): GLM-5.3 (max) spent ≈ 1.6 s in input processing, ≈ 30.1 s emitting reasoning tokens before the first answer token, and ≈ 7.5 s generating the answer; Gemini 3.5 Flash-Lite (no visible reasoning) ≈ 8.8 s input + ≈ 1.4 s answer. These are hard-workload numbers, not simple-chat numbers.
- **Regimes**: "a chatbot may require a fast initial response (e.g., under 0.2 seconds) but moderate speed in decoding which only needs to match human reading speed" (DistServe blog, fetched 2026-08-27); the paper pegs human reading speed at 250 words/min and notes summarization instead emphasizes low TPOT (arXiv:2401.09670v3, Jun 2024).
- Phase character: prefill iterations have high latency and saturate GPU compute; decode iterations have low latency but low compute utilization, which is why batching lifts throughput mostly on decodes (Sarathi-Serve, arXiv:2403.02310, 2024).

## How it works

One streamed request produces the whole vocabulary. You send the prompt; the provider authorizes, routes, and queues it — queue wait sits inside TTFT but outside the model. Prefill then runs the prompt through the network in parallel and emits token one: the clock from "send" to that first token is TTFT, the metric Anthropic flags for streaming responsiveness (fetched 2026-08-27). From then on the model decodes one token at a time; each gap is an ITL sample; the per-request average is TPOT; total wall-clock to the last token is e2e.

Aggregate rates are different objects. Requests per second and tokens per second count a whole run or fleet; TTFT, TPOT, and ITL are per-request distributions. Harnesses report both — LLMPerf measures "generation throughput per request and across concurrent requests" (fetched 2026-08-27) — and the DistServe authors observed that engines like vLLM and TensorRT-LLM were traditionally compared on raw throughput (blog, fetched 2026-08-27), which is why two systems with equal tokens/s can feel nothing alike.

The identity makes planning possible. Worked arithmetic, not a benchmark: TTFT 400 ms, TPOT 25 ms, 200 output tokens → e2e ≈ 0.4 s + 199 × 0.025 s ≈ 5.4 s. It also explains the regimes. For short answers — agentic tool-call turns — e2e ≈ TTFT plus a handful of tokens, so first-token cost dominates. For long visible generations, (N − 1) × TPOT dominates and TTFT amortizes. Reasoning models bend this again: because the first token may be a reasoning token (Artificial Analysis definition, fetched 2026-08-27), a model can post excellent TTFT yet leave the user staring at nothing visible for tens of seconds — the GLM-5.3 evaluation split above (≈ 30.1 s reasoning vs ≈ 7.5 s answer) is a dated example.

## Harness angle

Budget and alarm on the metric your user actually experiences: cap perceived TTFT (first *visible* token, after deciding whether to surface the reasoning stream) for chat surfaces, but watch p99 TPOT/ITL for long generations — smoothness lives in the tail, and vLLM's default 25/50 ms ITL coloring bands are a workable "feels fine / feels chunky" reference (vLLM docs, fetched 2026-08-27). Make timeouts TTFT-aware for reasoning models: a first-token timeout tuned on non-reasoning models will kill healthy reasoning requests mid-flight.

## Sources

- https://platform.claude.com/docs/en/test-and-evaluate/strengthen-guardrails/reduce-latency — Anthropic latency guide, TTFT definition
- https://artificialanalysis.ai/methodology — Artificial Analysis metric definitions
- https://artificialanalysis.ai/models — mid-2026 median speed/latency tables
- https://docs.vllm.ai/en/latest/cli/bench/serve.html — vLLM bench metrics and percentiles
- https://github.com/ray-project/llmperf — LLMPerf load-test metric definitions
- https://huggingface.co/docs/text-generation-inference/conceptual/streaming — token streaming definition
- https://hao-ai-lab.github.io/blogs/distserve/ — DistServe blog, SLO examples
- https://arxiv.org/abs/2401.09670 — DistServe paper, TTFT/TPOT regimes
- https://arxiv.org/abs/2403.02310 — Sarathi-Serve, prefill/decode latency character
