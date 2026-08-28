# Pedagogy audit — ch04 The memory that is not the model

audited: 2026-08-28 · auditor: glm-5.3-flash (worker, beginner-simulation protocol)
Protocol: smart 25-year-old non-engineer reads the chapter cold; every section walked; each stumble logged with tag, quote, and minimal fix. Grades 1–5 per H2 section (5 = a beginner could teach it back).

## Findings

1. **[CONFUSING] 4.2 — "vector" used bare at its only load-bearing moment.**
   Quote: "each layer's job is **attention**: when token number N+1 is being generated, it queries every earlier token — 'how relevant are you to me?' — and blends their information by relevance. To be queryable, every token, in every layer, files two vectors"
   Why the beginner stumbles: "vectors" is the one word in the mechanism paragraph with no gloss; the claim-ticket/bag parentheticals rescue *what* they are for, but not *what a vector is*. The rest of the book's audience ladder asks for the plain-words rung here.
   Fix: "files two vectors (a vector is just a list of numbers — the claim ticket and the bag are each one)".

2. **[CONFUSING] 4.2 — the cache-vs-text magnitude is understated by three orders of magnitude.**
   Quote: "the raw tokens sit in ordinary RAM; the cache holds the *derived per-layer notes*, dozens of times larger than the text itself"
   Why it matters: a beginner who checks the arithmetic (raw text ≈ 4 bytes per token; this chapter's own 128 KiB = 131,072 bytes per token) computes a ratio near 32,000×, not "dozens". Either the comparison intended something else (token ids? embeddings?) or the honest magnitude is "tens of thousands of times". As written it teaches the wrong size intuition — and this book's credibility rests on checkable arithmetic.
   Fix: name the comparison and correct it, e.g. "…derived per-layer notes, tens of thousands of times larger than the raw text (≈4 bytes per token versus 128 KiB per token in this chapter's running example)". (If the intended baseline was embeddings, say "embeddings" explicitly.)

3. **[CONFUSING] 4.2 — "transformer" appears unprimed.**
   Quote: "A transformer is built from **layers** (stacked blocks — Llama 3.1 8B has 32 of them)"
   Fix: one clause — "A transformer (the network design behind every modern language model) is built from…".

4. **[CONFUSING] Opening — one parenthetical triple-defines H100, GPU, and HBM mid-sentence.**
   Quote: "Load it onto an 80 GB H100 (NVIDIA's flagship GPU — graphics processing unit; HBM means high-bandwidth memory, the memory stacked on the GPU package)"
   Why: three definitions inside one parenthesis forces a re-read of the chapter's first paragraph — the worst place for friction. HBM is not needed again until 4.2.
   Fix: keep "GPU — the special fast chip" inline; move the HBM gloss to 4.2's "it lives in HBM…" where it is first *used*.

5. **[CONFUSING] 4.4 — "needle-in-a-haystack" idiom used before any gloss.**
   Quote: "Headline: despite near-perfect needle-in-a-haystack scores, only about half of seventeen models…"
   Fix: "despite near-perfect scores on find-one-fact-in-a-wall-of-text tests (needle-in-a-haystack)…".

6. **[CONFUSING] 4.4 — "multi-hop tasks" undefined.**
   Quote: "Simple retrieval looks great while aggregation and multi-hop tasks have already collapsed"
   Fix: "multi-hop (answers that need several chained lookups)".

7. **[CONFUSING] 4.6 — batch notation `B` reused from chapter 3 without a local gloss.**
   Quote: "past B × KV ≈ weights, batching stops paying (Llama 70B at 32k hit that at B ≈ 7…"
   Why: this is the chapter's only unexplained symbol; a cold reader meets `B` and stalls at the exact sentence the chapter flags as recall.
   Fix: "(B — batch size, requests computed together)" at first use in 4.6.

8. **[CONFUSING] Opening — "model card" (and later "config.json") never glossed.**
   Quote: "the model card arithmetic you expect"
   Why: a non-engineer does not know labs publish a spec sheet with each model; the phrase recurs at every table source line.
   Fix: "the model card (the spec sheet published with a model)" at first use; one-time gloss for `config.json` in Build it ("the model's settings file").

9. **[POLISH] 4.5 ELI5 compresses four mechanisms into one breath.**
   Quote: "Share racks: sixty-four assistants, eight racks… Share one rack: maximum savings… Or check photographs… Or give most floors a whiteboard…"
   Fix: number the four fixes inside the ELI5 ("Fix one… fix two…") so the section bodies have visible anchors to land on.

10. **[POLISH] 4.3/4.5 — MB/KiB/KB units mix across the comparison set.**
    Quotes: "cached 800 KB per token" / "2.6 MB per token" / "320 KiB" / "144 KiB".
    Fix: normalize the historical comparisons to KiB (800 KB → ~780 KiB; 2.6 MB → 2,560 KiB) or add "(≈ KiB)" conversions, so the "six times" and "eight-fold" ratios are one-step checks.

11. **[POLISH] Opening — "point your monitoring at the process" assumes operator tooling.**
    Fix: "point your memory dashboard at the process" or drop the clause; the surprise number does the work alone.

12. **[POLISH] 4.4 — insider framing of the 400k/272k gap.**
    Quote: "a documented-in-practice gap that surfaces as confusing 400k-versus-272k errors"
    Fix: "a gap developers meet as a surprise: 400k advertised, input rejected above 272k".

## Section grades

| Section | Grade | Note |
|---|---|---|
| Opening (prologue of chapter) | 4 | Strong 16→33 GB mystery; dense parenthetical (finding 4) |
| 4.1 Words before machinery | 5 | Table earns its 12 rows; internally consistent |
| 4.2 The note-taker's desk | 4 | Best-in-book ELI5; vector/magnitude gaps (findings 1–3) |
| 4.3 One formula, five models | 5 | Formula walkthrough + "read the table twice" is exemplary |
| 4.4 Context windows are memory products | 4 | Restaurant ELI5 + 15/30/3 worked example excellent; RULER paragraph dips (findings 5–6) |
| 4.5 Five ways to shrink the coat | 3 | Densest section; four variants + citation load; ladder table rescues |
| 4.6 When the desk overflows | 4 | Airline bumping ELI5 lands; B-notation recall trip (finding 7) |
| 4.7 What this chapter buys you | 5 | Clean formula recap; lever table with chapter pointers |
| Where the picture stops | 5 | Six specific, checkable breaks — exemplary |
| Checkpoint | 5 | Six questions, each answerable from the chapter, one with one multiplication |
| Build/Break/Prove/See closers | 5 | KV budget card is a durable artifact; every closer is runnable |

Average: **4.5 / 5** (50/11)

## The 3 worst teaching gaps

1. **MLA density in 4.5.** The "~57× element reduction, roughly 60× in bytes… (derived: 244 KiB and 4 MiB per token)" cluster asks a beginner to hold four numbers and two formats to understand one idea. A reader finishes unable to say what a "latent" is beyond "compressed notes". One worked micro-example (576 numbers vs 32,768, then bytes) would fix it.
2. **Bare notation at recall moments.** `B ≈ 7`, `ms/token floors`, and the 0.7-efficiency convention all lean on chapter 3 without local re-gloss; stumbles cluster exactly where the chapter says "remember chapter 3's…". A one-line local gloss at each recall would keep cold readers moving.
3. **The magnitude error in finding 2.** "Dozens of times larger" understates a 32,000× ratio — the single spot where a checking beginner catches the book being wrong, which taxes trust everywhere else. Highest-priority fix of the audit.

## Verdict

Teachable as-is; zero abandonment points. The chapter's ELI5 ladder (stenographer → hotel → restaurant → airline) is coherent and cumulative, and the 15/30/3 capacity walk is the book's best single teaching sequence so far. All twelve findings are sentence-level fixes; finding 2 is the only one with numeric-honesty stakes.
