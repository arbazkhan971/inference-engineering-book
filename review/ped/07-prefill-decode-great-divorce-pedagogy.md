# Pedagogy audit — 07-prefill-decode-great-divorce

audited: 2026-08-28 · auditor: glm-5.3-flash (worker, beginner-simulation protocol)
Reader simulated: smart 25-year-old non-engineer, read cold after chapters 1–6, no code background.

## Findings

**[CONFUSING-1] 7.2, prefill paragraph — "tensor-core-shaped" is unexplained hardware jargon in an otherwise perfectly scaffolded sentence.**
> Current: "Prefill is the catering order: GEMM (general matrix-matrix multiplication)-shaped, tensor-core-shaped, *compute-bound* — its problem is arithmetic throughput, not bytes."
The beginner has just been carried through an excellent 512×-the-math explanation, then hits a chip-part name never defined anywhere in the book's first seven chapters. GEMM is expanded inline; "tensor-core" is not.
> Minimal fix: drop the second epithet or gloss it — "GEMM (general matrix-matrix multiplication)-shaped — matrix-math-shaped, the chip's bulk-arithmetic units — *compute-bound*". One clause, no new machinery.

**[CONFUSING-2] 7.4, first mechanism paragraph — NVLink and InfiniBand are brand-names-as-jargon while RDMA gets an expansion.**
> Current: "The KV tensors are then shipped — over NVLink within a node, or RDMA (remote direct memory access) / InfiniBand across nodes — to a decode pool"
The sentence's *structure* teaches (within-a-node vs across-nodes), but two of the three link names are opaque to a lay reader, and the one that is expanded (RDMA) is the least load-bearing.
> Minimal fix: "over the fast chip-to-chip links within one machine (NVLink), or the network links between machines (RDMA, remote direct memory access, over InfiniBand-class networks)". The reader needs "fast short hop vs slower long hop", not the brands.

**[CONFUSING-3] Chapter opener — "under tail-latency constraints" used before tail latency is introduced.**
> Current: "Sarathi-Serve, you saw, reported 2.6× higher serving capacity under tail-latency constraints than vLLM on one workload"
The opener is a promissory-note callback to chapter 5 (where the reader met it), but the phrase does no work for a cold reader here and p99/tail-latency is only re-anchored in 7.5.
> Minimal fix: "under strict worst-case-wait limits" or simply "while holding stream smoothness" — the technical term can wait for 7.5 where it is properly used.

**[POLISH-1] 7.2, timeline caption — "its forward pass alone: hundreds of ms" uses "forward pass" without a gloss.**
If chapters 1–2 defined it, this is a safe callback; if not, it is the chapter's only unexpanded mechanism term.
> Minimal fix (if not defined earlier): "(its one full run over the prompt: hundreds of ms)". Verify against ch1/ch2 first-use before editing — the lint's true-first-use convention applies.

**[POLISH-2] Checkpoint Q2 asks the reader to "name the one formula that makes 'batch of P prompt tokens' the same lever as chapter 3's batch dial" — but 7.2 teaches the observation (512× the math, one weight read) without ever naming the connecting formula (arithmetic intensity / batch-dial equivalence).**
The answer is inferable; the naming is not taught.
> Minimal fix: either add one clause in 7.2 — "which is exactly chapter 3's batch dial, turned up by the prompt's length" — or soften Q2 to "explain the connection to chapter 3's batch dial".

**[POLISH-3] Opener symptom paragraph — "a 20,000-token prompt full of retrieved documents" quietly pre-shadows RAG two sections before its only expansion (7.4).**
Harmless on first read ("documents" carries it), but it is the one place the opener assumes knowledge the chapter later teaches.
> Minimal fix: "full of attached documents" in the opener; keep the RAG name where it is expanded.

**[OK] Everything else the simulation touched landed.** The food-truck → trays → commissary → freezer analogy chain is the book's most coherent extended system: every table row in 7.1 has a matching picture later, the two formulas in 7.3 are the chapter's whole mechanism and are computable, the xychart comes with reading instructions ("Read the spike"), the dated box attributes every multiplier and calibrates with silent-reading speed (~250 wpm — a lay reader's anchor), the field note teaches timestamp-correlation as a debugging habit, the three symptom fingerprints (interference / queueing / admission) are the section a beginner will actually use at work, and "Where the picture stops" contains five genuine breaks — including "the delivery van is also the road," which is the best single sentence in the chapter. Zero abandonment points; zero analogy collisions (the 7.5 airport analogy is scoped to lanes and waits only).

## Section grades (1–5 teachability for the simulated reader)

| Section | Grade | Note |
|---|---|---|
| Cold open (before 7.1) | 4.5 | gripping; tail-latency jargon pre-expansion |
| 7.1 Words before machinery | 5 | 12 rows, every one used again in-body |
| 7.2 Two phases, two bottlenecks | 4.5 | tensor-core-shaped + forward-pass nits |
| 7.3 Chunked prefill | 5 | trays ELI5 + two formulas + chart-with-instructions |
| 7.4 The great divorce | 4 | biggest payoff; link-brand jargon; densest box |
| 7.5 TTFT under load | 4.5 | clear feedback loop; leans on ch5 recall (flagged) |
| 7.6 What you control | 5 | scannable, honest, transitions cleanly to ch8 |
| Where the picture stops | 5 | five real breaks — model section |
| Checkpoint | 4.5 | computable Q3 (16,384 ÷ 2,048 = 8); Q2 naming gap |
| Build/Break/Prove/See | 5 | all four concrete; Prove-it is predict-then-measure |

**Average (all graded sections): 4.70 / 5** — **Average (core 7.1–7.6): 4.67**

Counts: **LOST = 0 · CONFUSING = 3 · POLISH = 3**

## Three worst teaching gaps

1. **The unexplained hardware names** (tensor core, NVLink, InfiniBand — CONFUSING-1/2) cluster exactly where the chapter is most physical; they are the only moments a lay reader is reminded the book is about machines they cannot see.
2. **Checkpoint Q2's unnamed formula** (POLISH-2): the chapter teaches the observation but grades the reader on vocabulary it never supplied — the one place the teach-back contract is slightly unfair.
3. **The opener's jargon-before-definition** (CONFUSING-3 + POLISH-3): two small pre-shadows in the first 90 words, in the chapter whose cold open is otherwise its best hook. First impressions do disproportionate work.
