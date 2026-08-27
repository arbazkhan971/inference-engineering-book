# LLM serving engines: what sits between weights and API

researched: 2026-08-27 · researcher: glm-5.3-flash

## Key facts

- Three distinct layers: the **weights** (the model artifact), the **serving
  engine** (scheduler, KV-cache manager, batching, kernels), and the
  **API gateway** (auth, rate limits, routing, request/response shapes).
  Even local tools keep the split: llama.cpp ships a "Launch
  OpenAI-compatible API server" command (`llama serve -hf ...`) next to its
  inference core (llama.cpp README, retrieved 2026-08-27).
- **vLLM**: introduced PagedAttention, which manages the dynamically
  growing/shrinking KV cache in OS-style pages, cutting fragmentation waste
  to near zero and improving throughput 2–4× over FasterTransformer and
  Orca at equal latency (arXiv 2309.06180, published September 2023).
  Current docs list continuous batching, chunked prefill, prefix caching,
  CUDA/HIP graphs, and a quantization menu of FP8, MXFP8/MXFP4, NVFP4,
  INT8, INT4, GPTQ/AWQ, GGUF (vLLM docs, retrieved 2026-08-27). Status:
  90,228 stars, latest release v0.28.0 on 2026-08-26 (GitHub API, retrieved
  2026-08-27).
- **Hugging Face TGI**: documented features include continuous batching,
  Flash Attention and Paged Attention kernels, bitsandbytes quantization,
  Medusa/ngram speculative decoding, outlines-based guidance, and LoRA
  (TGI docs, retrieved 2026-08-27). Status: 10,889 stars; latest release
  v3.3.7 on 2025-12-19 and last repository push 2026-03-21 — visibly slower
  cadence than its peers in the mid-2026 snapshot (GitHub API, retrieved
  2026-08-27).
- **NVIDIA TensorRT-LLM**: compiles models into optimized TensorRT engines
  for NVIDIA hardware; README highlights FP8/FP4 support including
  nvidia-published DeepSeek FP4 checkpoints, speculative decoding, and
  disaggregated (prefill/decode-separated) serving, with NVIDIA Dynamo as
  the companion orchestration layer (TensorRT-LLM README, retrieved
  2026-08-27). Status: 14,484 stars, latest release v1.2.1 on 2026-04-20
  (GitHub API, retrieved 2026-08-27).
- **SGLang**: pairs a frontend for structured LLM programs with a runtime
  whose signature optimizations are RadixAttention (KV-cache reuse through
  a radix tree over prompts) and compressed finite-state machines for
  faster structured-output decoding; the paper reports up to 6.4× higher
  throughput than prior serving systems (arXiv 2312.07104, published
  December 2023). Status: 32,561 stars, latest release v0.5.18 on
  2026-08-22 (GitHub API, retrieved 2026-08-27).
- **llama.cpp**: C/C++ inference running on CPU (AVX/AVX2/AVX512/AMX,
  RISC-V) with Metal, CUDA (plus AMD via HIP), Vulkan, and SYCL backends;
  runs 1.5-bit through 8-bit integer-quantized GGUF models (llama.cpp
  README, retrieved 2026-08-27). Status: 125,928 stars, pushed 2026-08-27
  (GitHub API, retrieved 2026-08-27).
- **MLX**: Apple's array framework for Apple silicon; 28,189 stars, pushed
  2026-08-27 (GitHub API, retrieved 2026-08-27). Its LLM tooling
  (mlx-lm) is the local-first choice on Macs; per-version capability
  details: (no public number verified as of 2026-08-27 beyond the repo
  itself).
- Benchmarks quoted here (2–4×, 36.9×, 6.4×) are each paper authors' own
  comparisons against then-current baselines (2022–2023); they are not
  head-to-head rankings of the engines in 2026.

## How it works

The engine owns four jobs no API layer can do for it:

1. **Batching.** Orca (OSDI 2022) introduced iteration-level scheduling —
   the scheduler runs a single model iteration over the batch, then admits
   or retires requests, reporting 36.9× throughput over FasterTransformer
   at equal latency (USENIX page, retrieved 2026-08-27). Every engine above
   now ships some form of continuous batching.
2. **KV-cache management.** The cache grows by one entry per generated
   token and must be freed on completion or eviction. PagedAttention
   (vLLM, 2023) pages it like virtual memory; SGLang's RadixAttention goes
   further and keeps finished-request prefixes in a radix tree so a
   repeated prompt reuses cached attention state instead of recomputing
   (2023). TGI also lists Paged Attention among its kernels (docs,
   retrieved 2026-08-27).
3. **Scheduling around the two phases.** Prefill saturates compute; decode
   barely uses it. Chunked prefill (Sarathi-Serve, 2024; now in vLLM's
   documented feature list) splits long prefills so decodes keep flowing,
   and TensorRT-LLM's disaggregated serving takes the endpoint: separate
   GPU pools for each phase (README, retrieved 2026-08-27).
4. **Kernel and precision selection.** TensorRT-LLM compiles graphs per
   GPU; vLLM documents CUDA/HIP graphs and a quantization menu spanning
   FP8 to 4-bit weights; llama.cpp runs 1.5–8-bit integer quants on
   consumer hardware (all retrieved 2026-08-27).

The gateway is a different program with different concerns: it checks
keys, counts tokens against quotas, routes by model id to the right
engine cluster, and speaks the provider API shapes. The reason harness
authors can mostly ignore engines is that the OpenAI-compatible HTTP shape
became the de facto seam — llama.cpp, a single-binary desktop tool,
exposes the same style of API server as the hyperscale stacks (README,
retrieved 2026-08-27).

Choosing an engine is therefore choosing which of these mechanisms you
get: prefix reuse (SGLang's radix tree, vLLM's prefix caching), phase
separation (TensorRT-LLM disaggregation), or commodity local serving
(llama.cpp/MLX).

## Harness angle

Treat "engine" as a routing-table entry, not a code fork: keep your agent
harness speaking one OpenAI-compatible shape and let config pick the
engine behind it. But verify per deployment which mechanisms are actually
on — prefix caching, structured output, and chunked prefill are
engine-level features, and a cache-friendly agent prompt only pays off if
the engine behind the gateway implements prefix reuse. Before pinning a
minor engine, check its release cadence: TGI's stall (last release
December 2025, last push March 2026, versus vLLM shipping v0.28.0 the day
before this snapshot) is a real operational risk signal, not marketing.

## Sources

- https://arxiv.org/abs/2309.06180 — PagedAttention paper, 2–4× claim
- https://docs.vllm.ai/en/latest/ — vLLM current feature list
- https://github.com/vllm-project/vllm — vLLM stars/release status
- https://huggingface.co/docs/text-generation-inference/index — TGI features
- https://github.com/huggingface/text-generation-inference — TGI status
- https://github.com/NVIDIA/TensorRT-LLM — TensorRT-LLM README and status
- https://arxiv.org/abs/2312.07104 — SGLang/RadixAttention paper, 6.4× claim
- https://github.com/sgl-project/sglang — SGLang status
- https://github.com/ggml-org/llama.cpp — llama.cpp README and status
- https://github.com/ml-explore/mlx — MLX framework and status
