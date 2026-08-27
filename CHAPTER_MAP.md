# Chapter map — Inference Engineering (Vol. II of the Harness Engineering series)

Every chapter: reader outcome, ELI5 on-ramp, precise model, tinyengine
increment or arithmetic artifact, failure modes, `Where the picture stops`,
checkpoint. Chapter closers: **Build it / Break it / Prove it / See it in the wild**.

## Prologue — The invisible engine

A brilliant agent slows to a crawl at 6pm. Nothing in the harness changed.
Hook: most "model problems" are serving problems. The operator story:
200B tokens taught the author where the latency actually lives.

## Part I — The layer beneath the prompt

1. **What inference engineering is**
   Model vs serving vs harness; who owns which failure; the request lifecycle
   end to end; vocabulary map of the whole book.
2. **The shape of a token**
   Tokenization, autoregressive decode, why generation is serial; latency
   vocabulary (TTFT, TPOT, ITL, end-to-end); the decode-time inequality.
3. **The arithmetic of waiting**
   Compute-bound vs bandwidth-bound; arithmetic intensity; roofline intuition
   without tensors; why 1 token is cheap and 1M tokens is not linear.
4. **The memory that is not the model**
   KV cache: what it stores, the memory formula, per-model numbers; why
   context windows are memory products, not model gifts.

## Part II — Inside the engine

5. **Batches: the engine's trick**
   Static → dynamic → continuous batching; iteration-level scheduling;
   what batching does to your latency (and when it helps you).
6. **Paging the brain**
   PagedAttention and block tables; fragmentation; prefix caching and
   radix trees; why the same prompt twice is not the same price twice.
7. **Prefill, decode, and the great divorce**
   Two phases, two bottlenecks; chunked prefill; disaggregated inference;
   what "PD separation" means for TTFT under load.
8. **Guessing at the speed of light**
   Speculative decoding: draft-and-verify, Eagle/Medusa; acceptance rates;
   when speculation hurts (structured output, cold prefixes).
9. **Smaller numbers, faster engines**
   Quantization (FP8/INT8/INT4, KV quant); quality/throughput tradeoffs;
   how to read a provider's model-variant list as a quant menu.
10. **One model, many chips**
    TP/PP/DP/EP/CP in plain words; MoE serving and expert routing;
    why bigger models can be faster per token than small dense ones.
11. **Long context is a memory product**
    Context parallelism; cost curves vs context length; cache-aware context
    design; the compaction tradeoff no provider documents for you.

## Part III — The API contract

12. **The streaming contract**
    SSE/WebSocket, event shapes, tool-call deltas, provider differences;
    normalizing streams in the harness; TTFT as a product metric.
13. **Structured output is not a prompt trick**
    Constrained decoding, grammars, xgrammar/outlines; JSON mode; the token
    overhead of schemas; when the grammar fights the model.
14. **The cache that pays your bill**
    Prompt caching per provider: semantics, pricing multipliers, TTLs,
    breakpoints; cache-hit math for agent loops; designing prefixes that hit.
15. **Rate limits are physics**
    Quota architectures (TPM/RPM, concurrency caps), 429/529 behavior,
    queues, jitter, backoff; client-side scheduling that respects the limit.
16. **Routing, fallbacks, and the money meter**
    Gateways, model routing per task, batch APIs, circuit breakers,
    cost attribution; the 10k-fanout cost worksheet.

## Part IV — Harness meets engine

17. **Cache-aware harness design**
    Stable prefixes; compaction vs cache invalidation; session resumption and
    cache rehydration; subagent context isolation as cache design.
18. **Your own engine room**
    tinyengine assembled: normalized streaming, token/cost metering,
    rate-limit scheduler, routing with fallbacks, cache-friendly prompt
    assembly; local/edge inference (llama.cpp/MLX) and when to own the engine;
    ship checklist; closing manifesto.

## Appendices

A. Inference engineering in plain words (glossary)
B. The arithmetic cheat-sheet (KV bytes, TTFT bounds, cost per task, cache-hit savings)
C. Provider matrix (pricing, cache, limits — dated snapshot table)
D. tinyengine companion guide
E. Source notes and bibliography
F. KDP and release checklist
