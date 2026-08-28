# Pedagogy audit — Appendix A (Inference engineering in plain words)

audited: 2026-08-28 · auditor: glm-5.3-flash (beginner simulation, cold read)

## Method

STYLE.md skimmed for the pedagogy rules (ELI5 ladder, plain-words discipline,
acronyms at first use). Appendix A read cold, as a smart 25-year-old
non-engineer who has used ChatGPT but never written code. Every entry walked;
each place the simulated reader stalls, loses the picture, or meets a word
the glossary itself never defines was logged with the exact quote.

## Findings

### LOST — reader stalls

1. **[LOST] A.1 "BPE (byte-pair encoding)" — "The recipe that builds a vocabulary by merging frequent byte pairs."**
   "Byte" is never defined anywhere in the glossary. A non-engineer does not
   know what a byte is, so "byte pairs" is two undefined words doing the
   load-bearing work. Fix: "…by merging frequent pairs of text characters
   (a *byte* is one character as computers store it)."

2. **[LOST] A.3 "Logit mask" — "Setting forbidden tokens' scores to −∞ before the draw."**
   The entry's own name contains an undefined term — "logit" — and "the draw"
   is opaque to anyone who did not read chapter 13's sampler prose. The reader
   cannot even parse what object is being masked. Fix: "Setting forbidden
   tokens' preference scores (the model's per-candidate vote tallies, its
   *logits*) to negative infinity before the next token is chosen."

### CONFUSING — picture drops, reader rereads

3. **[CONFUSING] A.1 "GEMM / GEMV" — "Big matrix multiply (many rows at once) versus matrix-times-one-vector (the batch-of-one case)."**
   "Matrix" and "vector" have no glossary entries and no inline gloss; the
   acronym is expanded but the expansion is the jargon. Fix: "Big grid-times-
   grid multiply (many requests' rows at once) versus grid-times-one-column
   (the single-request case); *matrices* are the number grids the model
   multiplies."

4. **[CONFUSING] A.1 "Arithmetic intensity" / "Compute-bound" / "Bandwidth-bound" cluster — "…the ratio that decides which bound binds."**
   "Which bound binds" is wordplay, not plain words; the entry never says
   "bottleneck" — the one word a layman owns. Fix: "Arithmetic operations per
   byte moved; the ratio that decides which bottleneck is yours — the
   thinking or the fetching."

5. **[CONFUSING] A.1 "Decode-time inequality" — "e2e ≈ TTFT + N × TPOT".**
   "e2e" and "N" appear unexpanded at the point of use (the End-to-end
   latency entry spells e2e elsewhere; N is never glossed). Fix: "(e2e =
   end-to-end time, N = tokens in the reply)".

6. **[CONFUSING] A.3 "Token trie" — "A prefix tree over the vocabulary mapping grammar rules to legal token ids."**
   Three stacked unexplained primitives: prefix tree, token ids, and (from the
   Grammar entry) EBNF's "extended Backus–Naur form" — an expansion that
   explains nothing to a non-engineer. Fix: "A lookup tree (branches per word
   piece) mapping grammar rules to the vocabulary's internal numbering
   (*token ids*)."

7. **[CONFUSING] A.1 "Ridge point" — "…peak arithmetic divided by peak bytes per second."**
   Units soup for a cold reader; the division is taught well in chapter 3 but
   the glossary entry gives no picture. Fix: append "; the tipping point where
   fetching stops being the limit and thinking becomes it."

### POLISH — small, mechanical

8. **[POLISH] "GPU" has no entry and is never expanded**, though it appears in
   dozens of entries ("the GPU's pantry"). Add one: "GPU (graphics processing
   unit) — the specialist chip AI runs on; thousands of tiny calculators
   working at once."

9. **[POLISH] "Throughput" has no entry**, yet the Goodput entry is defined by
   contrast with it ("served *on time*, not just served"). Add: "Throughput —
   Completions per second however late they arrive; the number goodput
   exists to correct."

10. **[POLISH] A.3 "Cache salt" — "…to keep tenants apart."** Multi-tenant is
    datacenter jargon. Fix: "to keep different customers' cache entries
    apart."

11. **[POLISH] A.3 "Batch API" — "…half price at all three majors…"** Fix:
    "at the three largest providers."

12. **[POLISH] Section walls of bold entries** (45–55 consecutive term lines
    in A.1–A.3) invite skimming but drown the linear beginner reader. Three
    or four H3 mini-heads per section ("Tokens and time", "The memory that
    is not the model", "The cache that pays your bill") would give the
    reference shelf browsing depth it already claims in its intro.

13. **[POLISH] Intro expectation-setting** — the title promises "plain words"
    for anyone, but several entries assume HTTP/byte/matrix literacy. One
    added sentence in the how-to-use paragraph fixes the contract honestly:
    "A handful of entries lean on chapter pictures; when one does, the
    chapter named beside it is the shortcut."

### What already works (do not touch)

- Cross-chapter ownership pointers make it a working reverse index.
- The overloaded-word disambiguations are excellent and kept their promise
  from the intro: "Chunk" carries its two senses with chapter pointers
  (A.2/A.3), "Gateway" its loose and precise senses (Ch. 1/16), "Prefix
  caching" its engine-side vs. provider-billed senses (Ch. 6/14).
- The claim-ticket/bag picture for K/V, the pantry for HBM, the timed bench
  for cooldown, the seating limit for capacity factor — the pictures that
  exist are the book's voice at its best.
- Numbers discipline holds: the only price claim (Batch API) carries its
  "(mid-2026 snapshot)" hedge.

## Section grades (1–5, teachability for the cold beginner)

| Section | Grade | One-line why |
|---|---|---|
| How to use (intro) | 4.5 | Sets grouping, reverse-index use, disambiguation promise |
| A.1 The layer beneath the prompt | 3.5 | Densest abstract cluster; byte/matrix/HTTP primitives unexplained |
| A.2 Inside the engine | 4.0 | Best picture density (seats, riders, benches); two-sense chunk note |
| A.3 The API contract | 3.5 | Strong cache economics; logit/trie/EBNF friction |
| A.4 Harness meets engine | 4.5 | Cleanest, shortest, most self-sufficient entries |

**Average: 4.0 / 5**

## Three worst teaching gaps

1. **Undefined primitives below the glossary's own floor** (byte, matrix,
   vector, HTTP, GPU, logit) — findings 1, 2, 3, 8. The glossary's plainest
   promise is broken cheapest here.
2. **The arithmetic-intensity cluster has no everyday picture in the entries
   themselves** — findings 4, 7; chapter 3 owns the staircase picture but the
   shelf reader is left with "which bound binds."
3. **Formula abbreviations at point of use** — finding 5 ("e2e", "N") — the
   one-line inequality is the appendix's most-quoted artifact and it is the
   least self-contained.
