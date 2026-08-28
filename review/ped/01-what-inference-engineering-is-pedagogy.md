# Pedagogy audit — Chapter 1: What inference engineering is

audited: 2026-08-28 · auditor: glm-5.3-flash (worker, beginner-simulation protocol)
Reader simulated: smart 25-year-old non-engineer, first contact with the material, reading cold.

## Findings

Numbered in reading order. [LOST] = beginner abandons the chapter;
[CONFUSING] = beginner recovers with effort; [POLISH] = smooth for most readers, sand for some.

1. **[CONFUSING] "token" is never defined in plain words anywhere in chapter 1 — including the vocabulary table.**
   Quote: "You write a prompt. Two seconds later, tokens stream back." (intro, sentence 2); the 1.1 table defines Prefill, Decode, TTFT, TPOT, KV cache — but has no Token row; 1.2 then says "a stream of tokens" and 1.3 "turns requests into token streams".
   Why it bites: the book's entire currency (billing, speed, allowances) is measured in a unit the beginner never sees defined until chapter 2. They guess "word-ish thing" and move on with low confidence.
   Minimal fix: add one row to the 1.1 table — `Token | The chopped-up word-piece the model reads and writes; the unit everything is priced and measured in | Arcade coins: the machine only takes tokens, never dollars` — and the intro sentence can then lean on it.

2. **[CONFUSING] 1.2 defines KV caching with a term the chapter never teaches: "attention".**
   Quote: "KV caching (storing intermediate attention results instead of recomputing them)".
   Why it bites: the 1.1 table row for KV cache is perfect plain words ("The kitchen's copy of your ticket so far"); this parenthetical re-introduces jargon the beginner cannot attach to anything.
   Minimal fix: reuse the table's framing — "KV caching (keeping the kitchen's copy of the ticket instead of re-reading the whole order — chapter 4's subject)".

3. **[CONFUSING] "Pareto frontier" is graduate-school vocabulary doing one sentence's work.**
   Quote: "a latency-versus-MFU Pareto frontier, not a utilization victory" (1.4).
   Why it bites: the sentence's point (you trade speed for utilization at low batch) is fully teachable without the term; the term makes the reader feel unqualified.
   Minimal fix: "measured 29 ms per token at low batch size on TPU v4 — fast replies, but the chip nearly idle: you can buy speed or utilization at low batch, not both".

4. **[CONFUSING] "throughput" is used repeatedly and never glossed.**
   Quotes: "degraded throughput" (1.3), "2–4× throughput" (1.4), "more batching raises throughput" (1.7).
   Minimal fix: first-use gloss in 1.3 — "total work done per second across everyone sharing the kitchen".

5. **[POLISH] "HTTP 200" arrives without a plain-words anchor.**
   Quote: "errors can arrive *after* HTTP 200, as error events inside an otherwise healthy-looking stream" (1.3).
   Minimal fix: "after HTTP 200 — the web's 'all good, here comes your answer' signal". (HTTP itself is never expanded in the chapter; one expansion at first use covers both.)

6. **[POLISH] Conference acronyms used as authority without a word on what they are.**
   Quotes: "Kwon et al., SOSP 2023" (1.2), "Orca's iteration-level scheduling, OSDI 2022" (1.4), "TACL 2023" (1.3).
   Minimal fix: first-use expansion, e.g. "OSDI 2022 (a top systems-engineering conference)"; the others can then follow the established pattern.

7. **[POLISH] Inline arXiv identifier is a citation wall in the durable spine.**
   Quote: "per 500,000+ evaluations, Databricks, arXiv 2411.02355" (1.4).
   Minimal fix: "per 500,000+ evaluations (Databricks; full citation in Appendix E)" — keeps the claim's weight, moves the identifier out of the reading line.

8. **[POLISH] Hop 7 name-drops PagedAttention with no forward pointer.**
   Quote: "the dynamically growing memory that PagedAttention was built to manage (Kwon et al., 2023)" (1.5).
   Minimal fix: "...that PagedAttention — chapter 6's subject — was built to manage".

9. **[POLISH] The closers assume a codebase; reader-ladder rung 1 has nothing to do.**
   Quote: "Take one real streaming call in your codebase" (Build it).
   Why it bites: the book's own reader ladder promises the complete beginner an on-ramp; every closer verb ("wrap", "run", "measure") targets rungs 2–3.
   Minimal fix: one sentence after the Build-it heading: "No codebase yet? Use any provider's five-line 'first API call' quickstart as your streaming call — the timestamps are the lesson, not the surrounding app."

10. **[POLISH] 1.2's definition sentence nests three layers inside one set of parentheses.**
    Quote: "spanning the runtime that serves a single model on a GPU, the serving infrastructure around it, and the fleet-and-scheduling layer above that (Telnyx, retrieved 2026-08-27)".
    Minimal fix: break into a three-beat list — the sentence teaches a scope triple that deserves three lines, not one breath.

11. **[POLISH] Four analogies rotate across four consecutive sections without a bridging word.**
    Restaurant (1.3) → freight train/taxi fleet (1.4) → airport (1.5) → package delivery (1.6). Each is strong alone; the beginner mid-blend needs one clause announcing the switch, e.g. at 1.4: "New question, same kitchen: what shape is the workday?" and at 1.5: "Zoom in on one order's journey."
    Minimal fix: two or three half-sentence bridges; zero new analogies needed.

12. **[POLISH] 1.3's model-layer paragraph stacks two citations in one sentence.**
    Quote: "(Liu et al., "Lost in the Middle," TACL 2023), and recall keeps degrading as context grows, a pattern Anthropic's engineers named "context rot" that "emerges across all models" (Anthropic engineering blog, 2025-09-29)".
    Minimal fix: keep one named finding in the prose, point the rest to Appendix E — the beginner needs "long middles get under-used" once, not twice-cited.

## Section grades (1–5; 5 = a beginner could teach it back)

| Section | Grade | One-line reason |
|---|---|---|
| Intro (three machines) | 5 | Instant hook; only the undefined "token" dents it |
| 1.1 Words before machinery | 5 | 13 rows, all plain; missing only the Token row itself |
| 1.2 A discipline with a birth certificate | 4 | Job-posting box lands; jargon leaks in the lever list and definition sentence |
| 1.3 Three layers, one request | 4 | Restaurant ELI5 is the chapter's spine; citation walls + HTTP 200 leak |
| 1.4 Inference is not training run backwards | 4 | Train/taxi ELI5 and the arithmetic box are superb; "Pareto" and arXiv id snag |
| 1.5 The life of one request | 5 | Airport ELI5 + hop list + diagnostic bullets — the best teaching sequence in the chapter |
| 1.6 Who owns which failure | 5 | Ownership test + table is immediately usable; retry arithmetic is followable |
| 1.7 Same weights, different engines | 4 | 8.3× spread is the chapter's proof; number-dense boxes need the throughput gloss |
| 1.8 The map of this book | 5 | Route + equation give the beginner a handrail for the whole book |
| Where the picture stops | 5 | Five sharp breaks, each earning its place |
| Checkpoint | 5 | Five questions graduated from recall to judgment |
| Build it / Break it / Prove it / See it | 4 | Strong for rungs 2–3; rung 1 has no verb to perform (finding 9) |

**Average: 4.58 / 5.**

## The three worst teaching gaps

1. **The book's unit of account is undefined in its own first chapter** (finding 1). One table row fixes the single most-used word in the entire book for its least-prepared reader.
2. **Survivor jargon — "attention", "throughput", "HTTP 200", "Pareto frontier"** (findings 2–5). These are the leaks the author can no longer see; they cluster exactly where the chapter is most authoritative. All four are one-clause fixes.
3. **The closer offers the no-code reader nothing to do** (finding 9). The reader ladder promises rung 1 an experience; the chapter ends by handing them a rung-2 verb and no ladder.

Overall: this chapter survives a cold beginner read with zero abandonment points — the ELI5 ladder and the Words-before-machinery table are doing real work, and 1.5/1.6 are teach-back ready as written. The gaps above are all last-mile vocabulary and on-ramp issues, not structural.
