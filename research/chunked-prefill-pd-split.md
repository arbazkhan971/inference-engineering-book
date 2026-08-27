# Chunked prefill and prefill/decode disaggregation: why the two phases of inference want different machines
researched: 2026-08-27 · researcher: glm-5.3-flash

## Key facts
- Prefill is compute-bound (one large matrix-heavy pass over the whole prompt); decode is memory-bandwidth-bound (one token per request per step, weights re-read for tiny amounts of math). This asymmetry is the root cause of interference when both share one batch queue (Sarathi-Serve, OSDI 2024; arXiv:2403.02310, 2024).
- Colocating prefill and decode in one batch causes "prefill bubbles": a long prompt's prefill iteration stalls every co-batched decode, producing TPOT/ITL latency spikes exactly when new requests arrive (Sarathi-Serve, OSDI 2024, arXiv:2403.02310).
- Sarathi-Serve's chunked prefill splits each prefill into near-equal token chunks and "piggybacks" them onto decode batches, so decodes never stall; chunk size is the knob trading TTFT against decode latency (Sarathi-Serve, OSDI 2024, arXiv:2403.02310).
- Evaluated on ShareGPT4 traces on A100 GPUs, Sarathi-Serve achieved roughly 2–4x higher capacity under strict latency SLOs (and up to about 6x under relaxed SLOs) versus prior systems like vLLM and Orca (UW CSE599K course slides summarizing the paper, 2024; arXiv:2403.02310).
- DistServe (OSDI 2024) argues chunked prefill is throughput-friendly but insufficient when you must hit both TTFT and TPOT SLOs simultaneously; it separates prefill and decode onto different GPUs, transferring KV cache over the interconnect, and co-optimizes parallelism per phase (DistServe, OSDI 2024; arXiv:2401.09670).
- DistServe reports up to 4.48x higher goodput on chatbot workloads and up to 41x on code-completion workloads compared to state-of-the-art colocated baselines (DistServe paper/blog, arXiv:2401.09670, 2024; haoailab.com summary, fetched 2026-08-27). Chatbot SLOs used in the paper: TTFT under ~0.2 s as an example fast-response target (DistServe blog, fetched 2026-08-27).
- Mooncake (Kimi's platform at Moonshot AI) is KVCache-centric disaggregation: separate prefill and decode clusters plus a disaggregated KV cache tier on underused CPU/DRAM/SSD, with a scheduler that does prediction-based early rejection of requests that cannot meet SLOs (Mooncake, arXiv:2407.00079, 2024).
- Mooncake reports up to a 525% throughput increase in simulated long-context scenarios while meeting SLOs, and under real production workloads Kimi handles 75% more requests within SLOs after adopting the architecture (Mooncake paper arXiv:2407.00079 and kvcache-ai/Mooncake README, fetched 2026-08-27).
- vLLM's V1 engine enables chunked prefill by default "whenever possible," with the scheduler prioritizing decode requests and batching all pending decodes before scheduling prefill chunks (vLLM docs, Optimization and Tuning, fetched 2026-08-27).
- vLLM also ships experimental disaggregated prefilling: prefill and decode run in separate vLLM instances with KV transfer between them, allowing different TP/PP parallelism per phase so TTFT and ITL can be tuned independently (vLLM docs, Disaggregated Prefilling, fetched 2026-08-27).

## How it works
- The interference mechanism: a batch iteration runs whatever the scheduler put in it. If a 20k-token prefill is in the batch, that iteration takes as long as the prefill's forward pass — every decoding request waits that entire time for its next token. Token-by-token decode iterations, by contrast, are short and leave GPU compute idle (bandwidth-bound). Mixing them naively means either wasted compute (decode-only batches) or stalled decodes (prefill joins the batch).
- Chunked prefill (Sarathi-Serve): fix a chunk budget of, say, a few hundred to a few thousand tokens per iteration. A long prefill is sliced into chunks of that size; each iteration fills leftover compute with prefill chunks while running all active decodes. Decodes never pause, so TPOT stays smooth; TTFT rises a little because the prefill finishes over several iterations instead of one. Smaller chunks → smoother TPOT, slower TTFT; larger chunks → the reverse. The formula to internalize: iterations per prefill ≈ prompt_tokens / chunk_size, and each iteration's latency ≈ time(chunk + decodes in batch).
- Disaggregation (DistServe, Mooncake): run a prefill pool and a decode pool. Prefill computes the KV cache; the KV tensors are shipped to a decode worker (over NVLink within a node, RDMA/IB across nodes, or — in Mooncake — to/from a DRAM/SSD-backed cache tier) before that request's first decode step. Each pool gets its own parallelism plan and replica count, matched to its bottleneck: compute-shaped for prefill, bandwidth-shaped for decode. The cost is the KV transfer itself and duplicated GPU memory footprints; the payoff is that a prefill storm cannot stall in-flight decodes, so TTFT degrades gracefully under load instead of dragging TPOT down with it.
- When each wins: chunked prefill is a cheap single-cluster fix that trades a modest TTFT increase for much better throughput. Disaggregation wins when load is high and you must honor strict TTFT and TPOT SLOs at the same time — DistServe's 4.48x/41x goodput gains come precisely from decoupling the two SLOs' resource plans.

## Harness angle
- If your agent harness sends long prompts (big system prompts, tool transcripts, RAG context) and you are streaming tokens to a user, choose a provider or self-hosted config that separates prefill from decode (or at least runs chunked prefill) — otherwise every new request arrival causes visible token-stream hitches for everyone sharing the engine. Practically: on vLLM deployments, leave V1 chunked prefill on and size the chunk budget for your TPOT target; consider experimental disaggregated prefilling only if TTFT SLO misses at high load dominate your error budget. Remember prompt-prefix caching (as in Mooncake) is the bigger lever for repeated-context agent loops.

## Sources
- Sarathi-Serve (OSDI 2024 paper PDF): https://apanwariisc.github.io/publications/osdi-2024-sarathi-serve/osdi24-sarathiserve.pdf
- Sarathi-Serve arXiv: https://arxiv.org/abs/2403.02310
- USENIX OSDI '24 talk page: https://www.usenix.org/conference/osdi24/presentation/agrawal
- DistServe arXiv: https://arxiv.org/abs/2401.09670
- DistServe USENIX page: https://www.usenix.org/conference/osdi24/presentation/zhong-yinmin
- DistServe lab summary: https://haoailab.com/summary/distserve/
- Mooncake arXiv: https://arxiv.org/abs/2407.00079
- Mooncake repo: https://github.com/kvcache-ai/Mooncake
- vLLM optimization docs (chunked prefill): https://docs.vllm.ai/en/v0.25.0/configuration/optimization/
- vLLM disaggregated prefilling docs: https://docs.vllm.ai/en/stable/features/disagg_prefill/
