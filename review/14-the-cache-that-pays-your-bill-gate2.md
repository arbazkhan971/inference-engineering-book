All verification complete. No write-capable tool is available in this session, so per runtime policy the complete `review/14-the-cache-that-pays-your-bill-gate2.md` artifact is returned below for persistence (same pattern as the prior `review/ch01-gate2.md`).

**Chapter:** 14 — The cache that pays your bill
**Counts:** P0 = 0 · P1 = 2 · P2 = 2
**Verdict:** MINOR
**Worst finding:** the headline incremental-caching result "≈ 55,000 units — about 90% cheaper" (manuscript line 77) cannot be reproduced under the chapter's own multipliers — correct arithmetic gives ≈ 90,500 units (~83% cheaper); even the source digest's own printed terms sum to 61,600, not 55,000.

````markdown
# Gate 2 — Technical editor review: Chapter 14 (The cache that pays your bill)

Reviewer: Gate 2 (technical editor) subagent · Review date: 2026-08-27
Inputs: manuscript/14-the-cache-that-pays-your-bill.md against STYLE.md,
EDITORIAL_SYSTEM.md, GOAL.md, CHAPTER_MAP.md, and research/ digests.
Read-only review; manuscript and research untouched.

## Checks performed (evidence)

1. **Numbers audit — 22 traced claims across 7 dated digests (all retrieved
   2026-08-27); every volatile number traces or is visibly hedged.**
   - 0.1× read discount "every major provider (mid-2026 snapshot)";
     Anthropic 1.25×/2× write, 0.1× read; 4 breakpoints with 5th → 400;
     20-block lookback; per-model minimums 512/1,024/up-to-4,096; TTL clock
     from request start (4-min stream → ~1 min left); hit refresh; 1-hour
     entries before 5-minute → `research/prompt-caching-provider-semantics.md`
     (multipliers independently corroborated by the Opus-row dollar prices in
     `research/token-pricing-anatomy.md`: $15/$18.75/$30 = 1.25×/2×).
   - OpenAI: 1,024 visible tokens (GPT-5.6+) / 2,048 older, hidden tokens
     excluded; ≥30-min TTL refreshed by reuse; ~15 req/min per org overflow
     routing; `prompt_cache_key`; "up to 90% off" / GPT-4o flat 50% Oct 2024;
     explicit breakpoints only on newest generation → same digest plus
     `research/cache-hit-math-agent-loops.md` ($2.50→$1.25) and
     `research/subagent-context-isolation-cache.md`.
   - Gemini: implicit thresholds 2,048 (2.5 Pro/Flash) / 4,096 (3.x); 10% of
     input; "no cost-saving guarantee"; explicit $4.50/1M tokens/hour
     (Pro-class), default TTL 1 h updatable; "three additional requests"
     correctly demoted to folklore (matches digest's could-not-confirm) →
     `research/prompt-caching-provider-semantics.md`.
   - DeepSeek: exactly 0.1× on deepseek-chat ($0.014 vs $0.14); newest rows
     "roughly 2–3%" (archive $0.0028/$0.14 = 2.0%; pricing page
     $0.007/$0.22 = 3.2%) → `research/cache-hit-math-agent-loops.md`,
     `research/tokenizer-fundamentals.md` — hedged, traces.
   - Sonnet-class $3/M (hedged "mid-2026 pricing snapshot") →
     `research/batch-api-economics.md` (Sonnet 4.6 $3) and
     `research/token-pricing-anatomy.md`.
   - Anthropic break-even stated verbatim ("after one cache read" /
     "after two cache reads") → `research/token-pricing-anatomy.md:42–44`.
   - OpenAI TTFT "up to 80%" (vendor-reported) →
     `research/cache-breakpoint-design.md:12`.
   - Claude Code SEV culture + exact quote "a few percentage points of cache
     miss rate can dramatically affect cost and latency" with "no published
     percentages" → `research/cache-breakpoint-design.md:17`.
   - Claude Code four-layer stack + `<system-reminder>` pattern; named
     cache-breakers list; render order tools → system → messages;
     20-block leapfrog; checkpoint-on-change; deferred tool loading →
     `research/cache-breakpoint-design.md:6,9,10,14`.
   - Usage-field names (`cache_read_input_tokens`,
     `cache_creation_input_tokens`, `cached_tokens`, `cache_write_tokens`,
     `cachedContentTokenCount`) and the identity total input = reads +
     writes + fresh → `research/cost-metering-attribution.md`,
     `research/provider-api-anatomy.md`, and ch12:123–126 (the "chapter 12
     pinned down" attribution is accurate).
   - Cross-references verified in-manuscript: ch1:184 ("chapter 14 shows why
     a timestamp…"), ch6's semantic-caching verdict (ch6:120–122), ch12's
     identity (ch12:125), ch13's opener role in the Part III quote.

2. **Mechanics audit — 7 derivations recomputed by hand.**
   - Worked example: 100,000 × $3 × 1.25 = $0.375; 9 × 100,000 × $3 × 0.1 =
     $0.270; total $0.645 vs $3.00 uncached = 78.5% ≈ 79% ✓.
   - Break-even: (1.25−1)/(1−0.1) ≈ 0.28; (2−1)/0.9 ≈ 1.11 ✓.
   - 25-turn loop totals: Σ(8,000+1,000k) = 525,000 token-visits ✓;
     prefix-only 10,000 + 24×800 + 325,000 = 354,200 units = 32.5% ✓.
   - Incremental total: **✗ — see Finding 1** (correct: 90,450 units ≈ 83%;
     floor without any write premium: 82,200 units ≈ 84%).
   - Expiry penalty 10,000/800 = 12.5×; 1-hour write 16,000; crossover
     2.0/1.25 = 1.6 ✓. Fanout 6,250 + 9,999×500 = 5,005,750 ≈ 5.01M =
     89.99% ≈ 90% ✓ (this 90% is legitimate; the loop's 90% is not).
   - Chart: no-cache line exact ✓; prefix-only line correct except turn 1;
     incremental line ~100 units/turn low and incoherent with any 25-turn
     total — see Finding 3.
   - Mermaid: `xychart-beta` block (title/x-axis array/y-axis range/three
     `line` arrays) and `graph TD` block (edge labels, bracket node text)
     both syntactically valid; grayscale-safe. All three tables well-formed
     with consistent column counts.

3. **Frame audit — all checks pass.** Five ELI5 blocks (14.2 warehouse
   clubs, 14.3 punch card, 14.3 TTL renewal, 14.4 letterhead, 14.5 fuel
   gauge), jargon-free; numbered H2s 14.1–14.5 with frame H2s unnumbered
   exactly matching the house convention in ch1–ch18; `Where the picture
   stops` present with five concrete, honest breaks; all four closers
   present (`### Build it` / `### Break it` / `### Prove it` / `### See it
   in the wild`); `Words before machinery` table (13 terms, all used later
   in-chapter); provider pricing boxed with "mid-2026 snapshot — prices
   verified 2026-08-27" plus three inline "(mid-2026 snapshot)" hedges and
   one "(vendor-reported, retrieved 2026-08-27)"; no vendor marketing
   language; acronyms expanded at first use (KV, TTL, API, JSON, SEV);
   scope matches CHAPTER_MAP ch14 exactly (semantics ✓ multipliers ✓ TTLs ✓
   breakpoints ✓ cache-hit math ✓ prefix design ✓), with rate-limit
   scheduling, routing, and session-level design correctly handed off to
   ch15/ch16/ch17 — no stolen next-chapter material.

## Findings

1. **[P1] Arithmetically impossible headline number — manuscript/14-the-cache-that-pays-your-bill.md:77 (§14.3).**
   Current text: "Total ≈ **55,000 units — about 90% cheaper**."
   Replacement: "Total ≈ **90,500 units — about 83% cheaper** (prefix: 10,000
   write + 19,200 reads; history: 25 blocks × 1,250 written once + 30,000 in
   reads — and even a provider charging no write premium at all floors at
   ≈ 82,200 units, ~84%)."
   Why: no accounting under the chapter's own multipliers reaches 55,000 —
   each history block must be paid at ≥1.0× once, giving a floor of 82,200
   and a 1.25×-premium total of 90,450 (= 82.8% saving); the source digest's
   own printed terms (10,000 + 19,200 + 32,400) sum to 61,600, not 55,000,
   and omit history first-pass cost entirely. The error originates in
   `research/cache-hit-math-agent-loops.md` §(a) — fix the digest too, or
   the next research refresh will re-poison the chapter.

2. **[P1] Downstream repetition of the wrong 90% — manuscript/14-the-cache-that-pays-your-bill.md:91 (§14.3).**
   Current text: "The gap between 32% and 90% is the most commonly misread
   number in cache economics. Marketing quotes the 90%; you will first
   measure something near a third of that, because the growing transcript
   only caches if *every earlier byte stays identical* — …"
   Replacement: "The gap between 32% and 83% is the most commonly misread
   number in cache economics. Marketing quotes the ~90% that fanout-shaped
   traffic can genuinely reach (the example above); you will first measure
   something near a third of that, because the growing transcript only
   caches if *every earlier byte stays identical* — …"
   Why: must track Finding 1's correction; as written the chapter's own
   worked example claims a 90% its arithmetic cannot produce, in the very
   sentence that lectures readers about misreading cache numbers.

3. **[P2] Chart points inconsistent with the model's own accounting — manuscript/14-the-cache-that-pays-your-bill.md:84–86 (§14.3 mermaid).**
   Current text:
   `line [10000, 5800, 10800, 15800, 20800, 25800]` and
   `line [10000, 2350, 2850, 3350, 3850, 4350]`
   Replacement: `line [11000, 5800, 10800, 15800, 20800, 25800]` and
   `line [11250, 2450, 2950, 3450, 3950, 4450]`
   Why: the prefix-only turn-1 point omits the 1,000 fresh tokens that the
   no-cache line's 9,000 includes (write 10,000 + fresh 1,000 = 11,000);
   the incremental line currently fits 1,850+100k — ~100 units/turn below
   the 1.25×-write arithmetic (800 + 100(k−1) reads + 1,250 write) and its
   25-turn sum (~78,750) matches neither the old 55,000 nor the corrected
   90,450. y-axis 0→34000 still fits.

4. **[P2] Cost formula term ambiguous for inclusive-counting providers — manuscript/14-the-cache-that-pays-your-bill.md:104–106 (§14.3).**
   Current text: "cost = (input_tokens × P_in + cached_tokens × P_cached +
   cache_write_tokens × P_write + output_tokens × P_out) / 1,000,000" …
   "Four terms, four provider-reported fields, no estimates."
   Replacement: mark the first term "input_tokens (fresh)" and append after
   the formula: "(on inclusive-counting providers — OpenAI and Gemini —
   fresh input is total prompt minus cached, chapter 12's normalizer
   output, not a raw field)."
   Why: OpenAI `prompt_tokens` and Gemini `promptTokenCount` include cached
   tokens (ch12:126 teaches exactly this), so plugging the raw reported
   field into term 1 double-counts every cached token; Anthropic's
   exclusive buckets are the only convention where all four values are
   literally "provider-reported fields."

## Notes (not findings)

- Checkpoint answer 2's "the blog posts promised ~90%" may stand: it
  attributes the figure to marketing, and the fanout shape legitimately
  reaches ~90%; optionally add "for fanout traffic" for precision.
- DeepSeek "roughly 2–3% of miss price" blends an archive-snapshot row (2%)
  and the current pricing-page row (3.2%); hedged with "roughly" and
  "rows", so it traces — no action.
- Word count inside the 3,000–5,500 concept-chapter target by inspection;
  run `tools/lint-manuscript.py` at the next gate for the exact figure
  (this reviewer may not execute commands).

Counts: P0 = 0 · P1 = 2 · P2 = 2
Verdict: MINOR
````