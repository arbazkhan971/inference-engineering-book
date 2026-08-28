# Pedagogy audit — 12. The streaming contract

audited: 2026-08-28 · auditor: glm-5.3-flash (worker lane) · method: beginner simulation, cold read

**Reader simulated:** smart 25-year-old non-engineer (uses ChatGPT, has never
written code against an API). Reads top to bottom, no skipping, flags every
point where they would stop, re-read, or quietly give up.

**Headline verdict:** the chapter teaches. The ELI5 ladder (postal companies →
bookshelf parcels → restaurant walkout → mailroom → elevator button) is
consistent and load-bearing; the three-chunk Portland worked example is the
single best teaching artifact in the chapter; the field-note wedge story and
the SDK-defaults box give the scary facts handles. **Zero true abandonment
points.** The losses are concentrated in reference walls (provider field
enumerations) and a handful of unglossed terms at exact moments where the
beginner needs them.

## Findings

1. **[CONFUSING] 12.1 — Event / Delta / Chunk overlap is never disambiguated in one place.**
   Quote: `| Chunk | One provider-encoded event carrying one or more deltas | A bag the postcard ships in |`
   The table gives three rows that feel 90% identical (Event, Delta, Chunk);
   each picture is good, the *distinction between them* is not taught. The
   beginner rereads the three rows twice and moves on with a blur.
   Fix (one sentence after the "Two terms from chapter 2" paragraph):
   "Keep the three straight: the *event* is the envelope, the *delta* is the
   slice inside it, and *chunk* is simply OpenAI's name for an event that
   carries deltas — two things, three words, because providers named them
   separately."

2. **[CONFUSING] 12.2 — "Pydantic" used as an unexplained proper noun.**
   Quote: `which once raised a Pydantic validation error inside LiteLLM's own stream assembler before unknown values were mapped to a fallback`
   The lesson (unmapped value → crash) lands, but the beginner trips on the
   noun. Fix: `a Pydantic (a widely used Python library that checks data
   shapes) validation error`.

3. **[CONFUSING] 12.2 — "enum" used without gloss.**
   Quote: `an unmapped enum value in a final event crashed an agent-loop library`
   Fix: `an unmapped enum value (enum: a fixed list of allowed values —
   "stop", "length", and friends) in a final event crashed an agent-loop
   library`.

4. **[CONFUSING] 12.3 — the parallel-calls sentence reads as self-contradictory.**
   Quote: `Fragments of different calls do not interleave *within* one index, but indices arrive back-to-back and can mix with text deltas.`
   "Do not interleave… but… can mix" forces a re-read; the beginner cannot
   tell whether fragments arrive separated or jumbled. Fix: "Fragments
   belonging to the *same* call always arrive in order with nothing else in
   between; fragments of *different* calls, and plain text, can appear
   between calls — which is why you buffer per call slot, never in one
   global buffer."

5. **[CONFUSING] 12.4 — p99 / p50 used twice with no gloss, at the chapter's most actionable paragraph.**
   Quote: `a **tight first-chunk budget** (p99 TTFT plus one backoff's worth of margin…` and `tokens remaining ÷ observed p50 tokens/s × a safety factor`
   The two-clocks advice is the harness takeaway a beginner most wants to
   keep, and its formula is gated on unexplained notation. Fix on first use:
   `p99 TTFT (the 99th-percentile first-token time — the slow end of normal)
   plus one backoff's worth of margin`, and `observed p50 tokens/s (the
   median — typical throughput)`.

6. **[CONFUSING] 12.5 — the cache-lifetime parenthetical points at nothing for a cold reader.**
   Quote: `cache_creation_input_tokens` (with a 5-minute/1-hour breakdown)
   Why two numbers? The TTL concept lives in chapter 14; here it dangles.
   Fix: `(with a 5-minute/1-hour breakdown — the two cache lifetimes
   chapter 14 prices)`.

7. **[POLISH] Chapter opening — double acronym expansion teaches nothing.**
   Quote: `the HTTP (hypertext transfer protocol) API (application programming interface)`
   Expansions without explanations. Fix: keep the expansions (series rule)
   but add the everyday handle once: `the HTTP API — the paper form your
   code mails to the provider and gets stamped back`.

8. **[POLISH] 12.1 — grammar slip.**
   Quote: `Two terms from chapter 2 ride along all chapter`
   Fix: `ride along for the whole chapter`.

9. **[POLISH] 12.2 — PCM expansion is jargon-in, jargon-out.**
   Quote: `accepts raw 16-bit PCM (pulse-code modulation) audio at 16 kHz`
   Fix: `raw 16-bit PCM audio (pulse-code modulation — uncompressed digital
   sound) at 16 kHz`.

10. **[POLISH] 12.4 — "middleware" used undefined.**
    Quote: `with certain middleware configurations, disconnects went unnoticed until the engine tried to produce output`
    Fix: `with certain middleware configurations (extra software layers
    sitting between client and engine)`.

11. **[POLISH] 12.5 → Build it — "first-stop-wins dedup" machinery appears only in the exercise.**
    Quote (Build it): `first-stop-wins dedup (a repeated finish chunk never re-fires the stop event)`
    The duplicate-finish-chunk behavior is never mentioned in the 12.5 body,
    so the exercise introduces new machinery at practice time. Fix: one
    clause in 12.5's stop-reason state-machine sentence: "…and finish chunks
    can arrive more than once — first one wins, the rest are ignored."

12. **[POLISH] 12.2 — the dated snapshot box near-duplicates the four-grammar prose.**
    Intentional redundancy (second pass) and it works, but a cold reader
    wonders if they missed new content. Fix: open the box with "Reference
    recap — the same four grammars, compressed:".

## Section grades (1–5, teachability for the simulated reader)

| Section | Grade | Note |
|---|---|---|
| Chapter opening | 4.0 | Strong hook; acronym stack at the door |
| 12.1 Words before machinery | 4.5 | Table excellent; event/delta/chunk blur (finding 1) |
| 12.2 Four grammars on one wire | 3.5 | Best ELI5 in the chapter, but field enumerations are walls; Pydantic/enum (findings 2–3); snapshot box rescues |
| 12.3 Tool calls arrive in pieces | 4.5 | Best-taught mechanism; Portland example anchors; one contradictory sentence (finding 4) |
| 12.4 The dying stream | 4.0 | Great ELI5 + field note; p99/p50 unglossed (finding 5) |
| 12.5 The mailroom | 4.0 | Mailroom lands; usage bullets are reference walls before the teaching sentence; TTL dangle (finding 6) |
| 12.6 TTFT is your product metric | 5.0 | Elevator + anchor swap; nothing missing |
| Where the picture stops | 5.0 | Three precise breaks; "a 2-second pause is normal" is beginner relief |
| Checkpoint | 4.5 | Six questions, answers inline, Q5 reconstructs the box arithmetic |
| Build/Break/Prove/See closers | 4.5 | Concrete, companion-matched; finding 11 |

**Average: 4.4 / 5** · LOST: **0** · CONFUSING: **6** · POLISH: **6**

## Three worst teaching gaps

1. **The event/delta/chunk triple is the chapter's front door and it's blurry** (finding 1). Everything downstream (fragments, accumulators, normalizer events) reuses these three words; one disambiguating sentence in 12.1 is the highest-leverage fix in the chapter.
2. **Reference walls arrive before their teaching sentences** (12.2 field enumerations; 12.5 usage bullets). The beginner survives on shape, not content, and knows it. One flag line before each wall — "you are not meant to memorize these; the normalizer exists so you never have to" — converts anxiety into permission to skim.
3. **Percentile notation gates the most actionable advice** (finding 5). The two-clocks budget is what a reader will actually implement first; p99/p50 must be glossed at first use, not assumed from chapter 5.

## Verdict

Merge-ready after findings 1–6 (all one-sentence fixes); 7–12 at copyedit
discretion. No structural rework, no missing scaffolding that a fix pass
cannot supply, and no point where the simulated reader abandoned the page.
