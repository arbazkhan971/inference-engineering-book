# Goodput and SLOs: why raw throughput lies for LLM serving

researched: 2026-08-27 · researcher: glm-5.3-flash

## Key facts

- **Goodput** = "the number of completed requests per second adhering to the Service Level Objectives (SLOs)" (DistServe blog, Hao AI Lab, fetched 2026-08-27). The paper defines per-GPU goodput as "the maximum request rate that can be served adhering to the SLO attainment goal (say, 90%)" (DistServe, arXiv:2401.09670v3, Jun 2024).
- The two "most widely used SLOs in LLM services" are TTFT and TPOT (DistServe blog, fetched 2026-08-27). The same post writes the metric with its bounds attached: Goodput(P90 TTFT < 200 ms and P90 TPOT < 50 ms) = the maximum request rate at which at least 90% of requests meet both.
- The blog's illustration: a system with 10 requests/s of throughput where only 3 requests/s stay within SLO has goodput of 3 requests/s — "High throughput ≠ High goodput" (fetched 2026-08-27).
- "Almost all popular LLM serving engines like vLLM and TensorRT-LLM use throughput as the primary metric to compare performance" (DistServe blog, fetched 2026-08-27) — the metric the industry optimizes is not the one users experience.
- Colocation tax, measured (13B model on one A100, 90% SLO attainment; arXiv:2401.09670v3, 2024): colocated baseline ≈ 1.6 requests/s/GPU of goodput; phase-split islands reach ≈ 5.6 requests/s (prefill) and ≈ 10 requests/s (decode) per GPU; a 2:1 allocation serves ≈ 10 requests/s total ≈ 3.3 requests/s/GPU — 2.1× the baseline.
- Headlines: up to 7.4× more requests within constraints or 12.6× tighter SLO while staying within latency constraints for > 90% of requests (paper v3, Jun 2024); the blog states up to 4.48× goodput or 10.2× tighter SLO (fetched 2026-08-27).
- Chat SLO example: initial response under 0.2 s, decoding "only needs to match human reading speed" — 250 words/min in the paper (blog fetched 2026-08-27; arXiv:2401.09670v3, 2024).
- vLLM ships goodput in its benchmark CLI: `--goodput` takes KEY:VALUE SLO pairs in milliseconds over request-level metrics `ttft`, `tpot`, `e2el`, and its help text cites the DistServe paper (vLLM docs, fetched 2026-08-27).
- Under tail-latency constraints, scheduling recovers capacity: Sarathi-Serve reports 2.6× higher serving capacity vs vLLM for Mistral-7B on one A100, up to 3.7× for Yi-34B on two A100s, and up to 5.6× end-to-end with pipeline parallelism on Falcon-180B (arXiv:2403.02310, 2024).
- The two phases have distinct economics: "a compute-intensive prompt computation, and a memory-intensive token generation, each with distinct latency, throughput, memory, and power characteristics" (Splitwise, arXiv:2311.18677, 2023, v2 2024).

## How it works

Throughput counts completions; goodput counts *acceptable* completions. A request that returns but blows its TTFT or TPOT bound is, from the user's seat, a failure — it just failed slowly instead of erroring.

The collapse is a queueing effect. As offered load λ approaches capacity μ, latency does not degrade gracefully; classical M/M/1 arithmetic says mean sojourn time scales like 1/(1 − ρ) with utilization ρ = λ/μ: at ρ = 0.9 each unit of work spends ~10× its service time in the system, at ρ = 0.99 ~100× (classical queueing arithmetic, not a measurement). Queued requests then batch together, so tail latency — p99 TTFT — violates long before mean throughput peaks. Empirically, DistServe plots P90 TTFT and TPOT climbing with request rate until the SLO attainment target (90% in the main evaluation, 99% in the appendix) is breached (arXiv:2401.09670v3, 2024).

So the goodput curve rises with load, knees over, and falls as attainment craters: past the knee, extra offered load *destroys* acceptable completions rather than adding them. Anything that stalls the pipeline moves the knee left — prefill-decode interference (a long prefill delays every decode sharing the batch; DistServe's core interference argument, 2024), arrival bursts, oversized batches chasing throughput. Anything that removes stalls moves it right: chunked prefill and stall-free scheduling (Sarathi-Serve, 2024) and phase separation (DistServe; Splitwise).

Two properties matter downstream. First, goodput is request-level: vLLM's CLI keys it on per-request `ttft`/`tpot`/`e2el`, not token counts (fetched 2026-08-27). Second, it is attainment-relative: "goodput" without a percentile and bounds is meaningless — which is why the blog writes the bounds into the name itself.

## Harness angle

Treat client concurrency as an admission controller and keep it below the goodput knee of each provider+workload pair, not at the throughput max. Pick the in-flight cap by measuring p99 TTFT and TPOT against explicit bounds (e.g., TTFT < 2 s and TPOT < 50 ms for agent turns), and when attainment drops, shed load multiplicatively before the provider's queue sheds it for you. When comparing providers or sizing capacity, demand goodput-style numbers — rate + percentile + bounds — because tokens/s is the metric everyone optimizes and nobody experiences.

## Sources

- https://hao-ai-lab.github.io/blogs/distserve/ — DistServe blog: goodput definition, examples
- https://arxiv.org/abs/2401.09670 — DistServe paper: per-GPU goodput
- https://arxiv.org/abs/2403.02310 — Sarathi-Serve: tail-latency capacity gains
- https://arxiv.org/abs/2311.18677 — Splitwise: phase characteristics split
- https://docs.vllm.ai/en/latest/cli/bench/serve.html — vLLM --goodput CLI reference
