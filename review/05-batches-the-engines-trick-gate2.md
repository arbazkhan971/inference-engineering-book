# Gate 2 (Technical editor) review — `manuscript/05-batches-the-engines-trick.md`

## Correct (verified with evidence)

**Numbers audit — every material numeric claim traced to a dated digest** (≥8 required; 17 checked, all traceable):

| # | Claim in chapter | Traced to |
|---|---|---|
| 1 | Orca "up to **36.9×** higher throughput than NVIDIA's FasterTransformer… GPT-3 175B" | `research/continuous-batching.md` (fetched 2026-08-27) |
| 2 | vLLM V1 `max_num_seqs` default **128** | `research/preemption-recompute-swap.md` (`DEFAULT_MAX_NUM_SEQS = 128`, scheduler source, fetched 2026-08-27) |
| 3 | Budget example **8,192 / 64 / 8,128** | `research/continuous-batching.md` (verbatim worked example) |
| 4 | TRT-LLM sweep **1,944 → 2,467 → 2,044 tok/s**; ITL **14.65 / 14.66 / 14.45 ms** | `research/batching-size-latency-tradeoffs.md` (NVIDIA tuning guide, fetched 2026-08-27) |
| 5 | Default **1,564 tok/s @ 31.3 ms** → tuned **2,474 @ 14.7 ms**; **58.2% / 53.1%** | same digest (recomputed: 910/1564 = 58.2% ✓; 53.1% consistent with unrounded source values) |
| 6 | 1/(1−ρ) table (2×/5×/10×/20×/100×); 0.8→0.95 ≈ **4×** (0.2 ÷ 0.05) | `research/ttft-queueing-under-load.md`, `research/goodput-and-slos.md` (recomputed: all five table values exact) |
| 7 | M/G/1 mean wait **E[W] = λ·E[S²] ÷ (2·(1−ρ))** | same digest (Pollaczek–Khinchine formula stated correctly) |
| 8 | **49** concurrent requests @ 1,280-token sequences, Llama-2-7B-chat, one A100 | `research/ttft-queueing-under-load.md` (arXiv:2407.05347) |
| 9 | Prefill time linear in batch size (A100 measurement) | same digest |
| 10 | Sarathi-Serve **2.6×** / up to **5.6×** capacity under tail-latency constraints | `research/goodput-and-slos.md` (arXiv:2403.02310) |
| 11 | DistServe goodput **10 vs 3 req/s**; `Goodput(P90 TTFT < 200 ms and P90 TPOT < 50 ms)`; per-GPU goodput definition | `research/goodput-and-slos.md` (Hao AI Lab blog, fetched 2026-08-27) |
| 12 | vLLM benchmark CLI `--goodput` over `ttft`/`tpot`/`e2el` ms pairs | same digest |
| 13 | `batch_wait_max_tokens_ratio` hold-until-fraction semantics | `research/continuous-batching.md` (TRT-LLM API reference) |
| 14 | Chunked prefill on-by-default in V1, decodes first | `research/continuous-batching.md` |
| 15 | Decrease `max_num_seqs`/`max_num_batched_tokens` on KV pressure; preemption → RECOMPUTE | `research/preemption-recompute-swap.md` |
| 16 | `vllm:request_queue_time_seconds` TTFT split instrumentation | `research/ttft-queueing-under-load.md` (vLLM metrics design docs) |
| 17 | Red Hat 2026-03-03 plateau guidance; OpenAI backoff-with-jitter | `research/batching-size-latency-tradeoffs.md`, `research/ttft-queueing-under-load.md` |

Untraceable items: none requiring flags. The Field note (32→64 concurrency, ~15% throughput, ~3× p95 TPOT) is an operator observation in a `> **Field note.**` box — permitted by STYLE.md; the `--goodput ttft:2000,tpot:100` values are an illustrative CLI invocation over documented syntax.

**Mechanics recomputed (5 derivations):** (a) 8192 − 64 = 8128 ✓; (b) 58.2% gain ✓; (c) table 1/(1−ρ) values ✓; (d) 0.2/0.05 = 4× ✓; (e) static-waste example: 2,400 useful of 16×900 = 14,400 slot-steps → 83.3% waste ≈ "roughly 80%" ✓ (hedged, shape traced to Orca). **Cross-chapter seams verified:** ch03 field note (6 pm, TPOT doubled, TTFT flat, cut concurrency — `03-the-arithmetic-of-waiting.md:166`), ch02 ITL/TPOT definitions and the explicit "Chapter 5 returns to this" DistServe promise (`02-the-shape-of-a-token.md:106`), ch04 RECOMPUTE/preemption counter (`04-the-memory-that-is-not-the-model.md:161`). **Frame:** ELI5 blocks on all five concept sections (jargon-free); numbered H2s 5.1–5.7 + unnumbered `Where the picture stops` / `Checkpoint` / closers (matches ch04 house norm); all four `### Build it / Break it / Prove it / See it in the wild` present; `Words before machinery` table present (chapter opens vocabulary); one dated snapshot box, dated inline citations elsewhere; no vendor marketing language; acronyms expanded (TPOT, TTFT, GPU, EOS, KV-via-ch4 gloss, ITL, SLO, IFB, TGI, CLI, M/G/1) — OSDI/HTTP unexpanded matches manuscript-wide norm; scope exactly matches CHAPTER_MAP ch5 with chunked prefill/PD-separation properly deferred to ch7. **Both mermaid blocks are syntactically valid** (graph TD with `<br/>` and edge labels; xychart-beta with equal 11-point series, labeled illustrative). Appendix E carries ch5's sources (Orca, Sarathi-Serve, DistServe, arXiv:2407.05347 — `appendix-e-sources-bibliography.md:58–66`). Length ≈4k words, inside the 3,000–5,500 band.

## Findings

1. **[P1] Arithmetic/labeling error in the static-batching ASCII figure** — `manuscript/05-batches-the-engines-trick.md:75`. Exact text: `B pads ~24 wasted steps.` Bar counts (verified by regex): A = 4 filled, B = **32 filled / 0 empty**, C = 6 filled + 26 empty, D = 18 filled + 14 empty. B is the straggler whose length sets t=32 — it pads nothing — and no slot's waste equals 24 (A held 28 ✓, C 26, D 14). The label inverts the exact mechanism the figure teaches (straggler ≠ padding victim). **Replacement:** `C and D pad ~26 and ~14 wasted steps.` **Why:** this figure is the chapter's core waste demonstration; a reader who recounts the bars finds the annotation self-contradictory, and the mislabel teaches the wrong ownership of the two wastes named in §5.2.

2. **[P2] Derived percentage doesn't support "either extreme"** — line ~109 (dated snapshot box). Exact text: `Batch 512 was the sweet spot — ~20% more throughput than either extreme (derived: 2,466.79 ÷ 2,044.26 ≈ 1.21) at no latency cost.` The quoted division covers only the 2048 side; versus 64 the ratio is 2,466.79 ÷ 1,944.26 ≈ 1.27 (+27%). **Replacement:** `Batch 512 was the sweet spot — ~20% more throughput than 2048 and ~27% more than 64 (derived: 2,466.79 ÷ 2,044.26 ≈ 1.21; 2,466.79 ÷ 1,944.26 ≈ 1.27) at no latency cost.` **Why:** numbers discipline — the displayed arithmetic must support the stated claim (error inherited from `research/batching-size-latency-tradeoffs.md`, which derives only the 2048 side while asserting both).

3. **[P2] Budget example's arithmetic doesn't force the stated outcome** — line ~91. Exact text: `a 4,000-token prompt can be admitted across two iterations without stalling a single decode step (constants illustrative; the budget mechanism is per vLLM docs).` With 8,128 leftover budget, a 4,000-token prompt fits in a single iteration; nothing forces "two." **Replacement:** `a 12,000-token prompt can be admitted across two iterations without stalling a single decode step` (8,128 + 3,872 genuinely spans two iterations). **Why:** a reader who does the subtraction sees the example contradict the chunking mechanism it demonstrates; the sibling digest (`research/continuous-batching.md`) has the same soft spot.

4. **[P2] Queueing table is M/M/1 arithmetic presented under an M/G/1 framing** — line ~129. Exact text (header): `| Utilization ρ | Mean system time multiplier 1/(1−ρ) |`. Mean *system* time = E[S]/(1−ρ) is the M/M/1 (exponential service) result; in the M/G/1 model the chapter invokes two sentences earlier, only the queue-wait term carries the 1/(1−ρ) factor with E[S²] fixed (which §5.5 does correctly cover separately). The digest itself attributes the sojourn scaling to "classical M/M/1 arithmetic" (`research/goodput-and-slos.md`). **Replacement header:** `| Utilization ρ | Mean system time multiplier 1/(1−ρ), M/M/1 form |` (or add "exponential service times" to the existing "classical queueing math" hedge). **Why:** technical precision for the expert reader; smallest fix is one table header.

Counts: P0 = 0 · P1 = 1 · P2 = 3
Verdict: MINOR