# Chapter 11 pedagogy audit — beginner simulation

audited: 2026-08-28 · auditor: glm-5.3-flash (worker) · method: cold-read simulation, smart 25-year-old non-engineer, no code background

**Reader profile honored:** the simulation assumes comfort with percentages, prices, and everyday computing (phone keyboards, concert halls) but zero exposure to matrices, GPUs beyond "fast chip", or attention internals beyond what earlier chapters taught.

## Findings

### [CONFUSING] 1 — 11.1 vocabulary table leaks "tensor" into the Simple-meaning column

> "| Pass-KV / pass-Q | Which tensor circulates: cached keys/values, or the new queries | Send the file to the reader, or the reader to the file |"

"Tensor" is exactly the word a non-engineer does not have; it appears in the column whose job is plain meaning, before the body ever glosses it. The Everyday-picture cell does rescue the row, but the table is the ramp — a stumble here taxes trust in every later row.

**Minimal fix:** `| Pass-KV / pass-Q | Which cargo circulates: the stored notes (keys/values), or the new questions (queries) | Send the file to the reader, or the reader to the file |` — and let 11.3 introduce "tensor" once, at its true first prose use.

### [CONFUSING] 2 — 11.2 jumps three rungs in one sentence after a clean ELI5

> "Prefill — ingesting your prompt — is quadratic in the ISL: every token attends to every other token, so the attention-score matrix has N² entries per layer, while the dense matrix-multiply part of the model is only linear in N (roughly 2·W FLOPs — floating-point operations — per token for a model with W parameters; MLSys 2025, arXiv:2411.01783)."

One sentence carries: attention-score matrix, "per layer", dense matrix-multiply, 2·W FLOPs, and W — two of those are structures of the model the beginner has never been shown, and the ELI5 above did not build them. The recovery bullet ("A 1M-token prompt is not 8× a 128K prompt") is excellent and accessible — but it arrives *after* the reader has already skimmed past the machinery it explains. The ELI5-to-numbers ladder is missing its middle rung: *which two parts does a model have*.

**Minimal fix:** insert one plain sentence before the machinery: "Under the hood, every model has two moving parts: a library part that processes each token on its own — its work grows in step with length — and a cross-referencing part that compares every token with every other — its work grows with length times length." The N² / 2·W sentence then lands on the rung instead of dropping from the ceiling.

### [LOST] 3 — 11.2 tier-cliff example: ambiguous antecedent plus unreconciled "three times" vs "double"

> "trimmed to 199K it costs 199,000/1M × $2 ≈ $0.40 — three times cheaper *for a request with 100K more usable room left in the window* (arithmetic derived from the dated rates above). And per section 11.4, the tokens beyond the boundary are also the worst-attended ones. You pay double for the fog."

Two stacked traps for a numerate beginner. (a) "a request with 100K more usable room" grammatically attaches to the $0.40 request — but the *expensive* request is the one carrying ~101K more tokens; the cheap one has no "more" of anything. The reader computes both readings, finds neither clean, and stalls. (b) Two sentences later the chapter says "you pay double" — but the worked example just showed three-times. Both are true (the per-token *rate* doubles; the *total* triples because the big request also carries 1.5× the tokens), and the chapter never says so. This is the one spot in the chapter where a careful beginner actively builds a wrong model and may distrust the rest.

**Minimal fix:** rewrite the clause and reconcile in one breath: "…≈ $0.40. The big request carries 1.5× the tokens *and* pays double per token — 1.5 × 2 = 3× the bill. And per section 11.4, the tokens beyond the boundary are also the worst-attended ones. You pay double per token for the fog."

### [CONFUSING] 4 — 11.3 Ring Attention mechanics use query/key/value with no plain gloss

> "Each chip holds its query block; KV blocks circulate chip to chip via send/receive, overlapped with compute, until — after d−1 hops, with d chips in the ring — every query has seen every key and value."

"Keys and values" were met (as the kitchen's ticket) in chapter 4's cache picture; "query" is new here and is the reader's first attention-mechanics triple. The clerk ELI5 carries the *idea*, but the mechanics sentence then names parts the picture never labeled.

**Minimal fix:** one parenthetical at first use: "each chip holds its query block (the questions the current tokens are asking)" — and optionally "(keys and values — the indexed notes those questions search)".

### [CONFUSING] 5 — 11.3 DeepSpeed-Ulysses has no picture and leans on "attention heads"

> "Instead of moving the sequence, all-to-all scatter by attention head: every chip ends up computing full attention for a handful of heads over the whole sequence. Efficient when heads are plentiful."

Every other mechanism in the chapter has an everyday picture; this paragraph is the lone picture-less island, and "attention head" is never introduced in plain words anywhere in the chapter (the table's Ring Attention row gestures at clerks, not heads). A beginner reads "heads are plentiful" as hand-waving.

**Minimal fix:** extend the clerk ELI5 by one sentence instead of adding a new one: "The other family splits by *question type* rather than by page range: each clerk answers one category of question — all the dates, say — for the whole file. That divides well when the file has many question categories, poorly when it has few." Then map: "question categories are what engine docs call attention heads."

### [CONFUSING] 6 — 11.5 layer-one arithmetic multiplies against an unstated baseline

> "Compact to a 30K context — summary plus recent turns — and the next turn re-prefills 30K at full price — 2× that turn where writes are uncharged, up to 2.5× where the re-prefill books as a 1.25× write under the multipliers you just used — but every turn after reads 30K cached (~3K-equivalents, 5× cheaper than before)."

"2× that turn" — two times *what*? The 15K-equivalent baseline is three sentences up and inside a different bullet's rhythm; by this point the beginner is holding multipliers (1.25×, 0.1×), contexts (150K, 30K), and comparisons (5×) simultaneously. The Checkpoint 5 exercise re-derives all of it — good design — but the in-text version needs its baseline named to be followable on first read.

**Minimal fix:** "— 2× that turn (30K fresh versus the old 15K-equivalent read) where writes are uncharged —".

### [POLISH] 7 — 11.2 formula constant `c` is never glossed

> "total attention work ≈ c·(N² + N·M + M²/2)"

**Minimal fix:** append ", with c a per-model constant you never need to number".

### [POLISH] 8 — 11.2 MagicDec sentence carries six numbers in one breath

> "MagicDec reported up to 2.51× for Llama-3.1-8B at batch sizes 32–256 on long-sequence tasks, and ~90% token acceptance for self-speculation on a 70B drafter at batch 1 across 4,000–100,000-token contexts (arXiv:2408.11049, 2024)."

The rule ("speculation follows bandwidth") deserves its own sentence; the evidence can follow parenthetically.

**Minimal fix:** split: "…it is bandwidth-bound again, so speculative decoding gets its discount back — speculation follows bandwidth, and long context is the bandwidth regime that never ends. The measured version: up to 2.51× speedup on long-sequence tasks (Llama-3.1-8B, batches 32–256), ~90% draft acceptance for self-speculation at batch 1 across 4K–100K contexts (arXiv:2408.11049, 2024)."

### [POLISH] 9 — 11.3 "contract-layer view" is an idiom, not a term

**Minimal fix:** "this is what it looks like from the API's point of view".

### [POLISH] 10 — 11.5 "the trap composes with caching"

Math idiom ("composes") in the load-bearing transition.

**Minimal fix:** "the trap stacks with caching".

### [POLISH] 11 — 11.1 KVSL everyday picture quietly presupposes chapter 4's notes picture

> "| KVSL — KV-cache sequence length | Token count of everything the model has seen so far this request | The file plus every note taken since |"

Fine on reflection (the file metaphor is established two rows up in ISL), but "the whole binder: the file plus every note taken since" would make the containment self-evident without the ch4 recall.

## Section grades

| Section | Grade | One-line reason |
|---|---|---|
| Cold open | 4.0 | Strong hook; the roadmap sentence ("quadratic work… price step…") is dense poetry before its concepts exist |
| 11.1 Words before machinery | 4.0 | Load-bearing table; one jargon leak (finding 1) |
| 11.2 The cost curve | 3.0 | Heaviest lift: missing middle rung (finding 2) + the one genuine lost-spot (finding 3) |
| 11.3 Context parallelism | 3.5 | Core insight ("divides wall-clock, not work") lands hard; Ulysses is picture-less (finding 5) |
| 11.4 The window you can use | 4.5 | Best-taught section: mechanism → design rule → measurement protocol, all in plain reach |
| 11.5 The compaction tradeoff | 4.5 | Three-layer structure is superb; layer-one arithmetic runs one notch too fast (finding 6) |
| 11.6 What you control | 4.5 | Controls + lever table + field note click together |
| Where the picture stops | 5.0 | Exemplary — every analogy's failure mode named and priced |
| Checkpoint | 4.5 | Six questions, all answerable in-chapter, one forces the layer-one re-derivation |
| Closers (Build/Break/Prove/See) | 4.5 | The ten-facts injection exercise is a keeper |

**Average: 4.2 / 5**

## Three worst teaching gaps

1. **The 11.2 quadratic-decomposition paragraph** (finding 2): the ELI5-to-arithmetic ladder is missing its middle rung — the beginner is never shown that a model has "a library part and a cross-referencing part" before N² and 2·W are dropped on them. One inserted sentence fixes the whole section's floor.
2. **The tier-cliff money example** (finding 3): the only place in the chapter where a careful reader constructs an actively wrong model (three-times vs double, plus a dangling "100K more"). One reconciling clause ("1.5 × the tokens × double the rate = 3× the bill") closes it.
3. **DeepSpeed-Ulysses** (finding 5): the chapter's only picture-less mechanism, leaning on "attention heads" — a term never introduced plainly anywhere before use.

## Counts

- **LOST: 1** (finding 3)
- **CONFUSING: 5** (findings 1, 2, 4, 5, 6)
- **POLISH: 5** (findings 7–11)
- Abandonment risk overall: low — one recoverable stall, no section a motivated beginner cannot finish.
