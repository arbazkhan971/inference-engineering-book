## Review

- **Correct:** All frame elements present and conformant (5 jargon-free ELI5 blocks, `Words before machinery` 14 rows, numbered H2s 15.1–15.7, `Where the picture stops` with 4 breaks, all four closers in the linter-sanctioned `**Build it.**` form, two dated snapshot boxes, no vendor marketing); scope exactly matches the CHAPTER_MAP ch15 beat (routing/gateway detail is explicitly handed to ch16, whose opening consumes the handoff); ~20 numeric claims traced to four digests all dated 2026-08-27, zero untraceable numbers; 8 derivations recomputed by hand — all correct; both mermaid blocks syntactically valid; both tables well-formed; all cross-chapter pointers verified against sibling manuscripts (ch2, 5, 7, 10, 12, 13, 14, 16, 18) except one (finding 2).
- **Finding:** 1×P1 (Bedrock up-front reservation formula omits cache-write tokens at lines 62/151/202, contradicting the chapter's own worked example and Checkpoint 2), 6×P2 (ch5→ch4 pointer, "computable" vs "when present", "~3×" vs 2–4 cap, undated #27823 claim, unexpanded AWS/UTC, pricing ratio in durable prose).
- **Merge verdict:** OK with notes — no write-capable tool in this session, so the complete `review/15-rate-limits-are-physics-gate2.md` artifact is returned below for persistence.

**Chapter:** 15-rate-limits-are-physics · **Counts:** P0 = 0 · P1 = 1 · P2 = 6 · **Verdict:** MINOR · **Worst finding:** the Bedrock up-front deduction is taught as `input + max_tokens` in three places (L62, L151, L202) while the chapter's own documented example deducts 36,000 = 3,000 input + 1,000 *cache-write* + 32,000 reservation — the taught formula under-counts the very quota ledger the chapter builds.

````markdown
# Gate 2 — Technical editor review: Chapter 15 (Rate limits are physics)

Reviewer: Gate 2 (technical editor) subagent · Review date: 2026-08-27
Inputs: manuscript/15-rate-limits-are-physics.md against STYLE.md,
EDITORIAL_SYSTEM.md, GOAL.md, CHAPTER_MAP.md, and research/ digests.
Read-only review; manuscript and research untouched.

## Checks performed (evidence)

### 1. Numbers audit — 20 claims traced to 4 dated digests; all match; 0 untraceable

All four supporting digests are dated 2026-08-27; the chapter's two snapshot
boxes carry the same retrieval date, so box ↔ digest ↔ date align throughout.

From `research/rate-limit-quota-architectures.md` (2026-08-27):
1. OpenAI tiers $5/$50/$100/$250/$1,000, Tier 5 cap $200,000/month — matches.
2. Tier ladder 500 RPM/500k TPM → 5,000 RPM/1–2M TPM → ≥2M → 10,000 RPM — matches.
3. 3.5M shared-family TPM pool — matches.
4. OpenAI reserve = max(`max_tokens`, character estimate); unsuccessful requests
   still count — matches.
5. Anthropic 1,000 RPM / 2,000,000 ITPM / 400,000 OTPM (Opus 5 / Sonnet 5 /
   4.x / Haiku 4.5, pooled across minor versions) — matches.
6. Spend caps Start $500 / Build $1,000 / Scale $200,000 / Custom uncapped — matches.
7. Gemini free tier 5 RPM/100 RPD, 10/250, 15/1,000, ~250k input TPM, paid
   ≈150–300 RPM (hedged "third-party trackers, approximate"), Dec 2025 cuts
   50–80% — all match, including the hedges.
8. Bedrock burndown 15×/10×/5×/10×/1:1 and cache reads uncounted — matches.
9. Bedrock worked example 36,000 → 9,000 — matches digest arithmetic.
10. Anthropic 60 RPM "might be enforced as 1 request per second" — matches.
11. 80% cache-hit → 2M ITPM ≈ 10M effective input tokens/min — matches.

From `research/429-529-retry-behavior.md` (2026-08-27):
12. SDK defaults: openai-python 2 retries/3 attempts; anthropic 2 retries,
    0.5 s→8 s; google-genai 4 retries ≈1/2/4/8 s, 60 s cap — all match.
13. 429/529 semantics, spend-cap 429 with no `Retry-After` + "regain access on
    2026-09-01 at 00:00 UTC" example, OpenAI `insufficient_quota`, July 2026
    (digest: 2026-07-22) enforced spend limits — all match.
14. AWS blog 2015 (updated 2023), 1,000 clients / 100 tokens, full jitter wins —
    matches.
15. SRE 10,000 QPS vs 100 QPS overload, ~2× amplification at 50% failure,
    3-attempt cap → 3 wire requests, 10% retry budget — all match.

From `research/client-rate-scheduling.md` (2026-08-27):
16. Adaptive throttling K = 1.1, two-minute window, worked 1,000/600 → 34%;
    Beam floor; AWS adaptive mode halve-on-throttle/double-on-success;
    LiteLLM router defaults, `enforce_model_rate_limit`, Redis tracking,
    issue #27823 missing `Retry-After`; 900k TPM ÷ 500-token calls ⇒ ~30 req/s;
    1/(1−ρ) 50%→2×, 90%→10×, 99%→100×; 70–80% knee — all match.

From `research/tail-latency-fanout-amplification.md` (2026-08-27):
17. Tail law p = 1%: N = 100 → ~63%, N = 10,000 → 99.99999% (derived) — matches.
18. OpenAI latency guidance: halve output ≈ halve latency; halve prompt buys
    only 1–5%; "make fewer requests" ranked with "parallelize" — matches.
19. Dean & Barroso, CACM 2013 — matches.
20. Ch18's "~120 lines" for `RateScheduler` — matches ch18's component table.

### 2. Mechanics audit — 8 derivations recomputed; all correct
- Bedrock example: 3,000 + 1,000 + 32,000 = 36,000 initial; 3,000 + 1,000 +
  1,000×5 = 9,000 final. ✔
- Checkpoint 2: 2,000 + 500 + 16,000 = 18,500; 2,000 + 500 + 800×10 = 10,500. ✔
- Adaptive throttling: (1,000 − 1.1×600)/1,001 = 340/1,001 ≈ 34%;
  checkpoint (1,200 − 990)/1,201 = 210/1,201 ≈ 17.5%. ✔
- Tail law: 1 − 0.99¹⁰⁰ = 0.634 ≈ 63%; 1 − 0.99¹⁰⁰⁰⁰ ≈ 1 − 2×10⁻⁴⁴. ✔
- Pacing: 900,000 ÷ 60 ÷ 500 = 30 req/s; 70–80% ⇒ 21–24 req/s; Little's Law
  24 × 4 = 96 in flight (labeled illustrative). ✔
- xychart values vs 1/(1−ρ): 1.43/2.0/3.33/5.0/10/20 → plotted
  [1.4, 2.0, 3.3, 5.0, 10.0, 20.0], y-axis 0→22 fits max 20. ✔
- Full jitter: min(8, 0.5 × 2³) = 4. ✔
- Anthropic cache effective: 2,000,000 ÷ 0.2 = 10,000,000. ✔
- Mermaid: flowchart (pipe edge labels, `<br/>` line breaks, no unescaped
  parens/quotes in node text) and `xychart-beta` (quoted title, categorical
  x-axis, `y-axis … 0 --> 22`, single `line` series) both parseable; fences
  balanced (3 blocks). Tables: both 3-column, consistent pipes, 14 and 11 rows.

### 3. Frame audit — pass
ELI5 blocks open 15.2–15.6 (water pipe, gyms, restaurant, red light, airport);
H2s numbered 15.1–15.7 with frame H2s unnumbered, matching ch14/ch16;
`Where the picture stops` (4 concrete breaks); closers present in the
`**Build it.**` bold form that `tools/lint-manuscript.py` CLOSING_MOVES
explicitly sanctions (ch14's `###` form is the sibling outlier, not this
chapter); volatile numbers boxed with visible dates/hedges; no vendor
marketing language; acronyms expanded at first use (GPU, API, HTTP, SDK, SRE,
QPS, AIMD, IPM; RPM/TPM/RPD/ITPM/OTPM via the vocabulary table) — AWS/UTC are
the two exceptions (finding 6). Scope matches CHAPTER_MAP ch15 exactly:
quota architectures, 429/529, jitter/backoff/budgets, client-side scheduling,
concurrency caps; gateway material is explicitly deferred to ch16, whose
opening ("Chapter 15 ended on a handoff…") consumes this chapter's handoff
verbatim; the 10k-fanout stays scheduling-side, leaving ch16's cost worksheet
alone. Cross-references verified against ch2 (tail/percentile lesson),
ch5 (queueing curve, concurrency sweep, "admission controller"),
ch7 (early rejection, "chapter 15 owns the response"), ch10 (retry-budget
fleet rule, expert imbalance), ch12 (usage fields), ch13 (max_tokens ceiling),
ch14 (keep-alive scheduler, 60-way fanout field note), ch18 (RateScheduler).
One pointer is off (finding 2).

## Findings

1. [P1] "the service initially deducts `input + max_tokens` at request start and
   replenishes the difference when the request finishes" (L62); same omission at
   "Bedrock books `input + max_tokens` up front" (L151) and "Bedrock books
   `input + max_tokens` then reconciles with burndown" (L202) →
   replacement (all three): "initially deducts `input + cache-write tokens +
   max_tokens`" / "Bedrock books `input + cache-write + max_tokens`" —
   why: the chapter's own documented example two sentences later deducts
   36,000 = 3,000 + **1,000 (cache-write)** + 32,000, Checkpoint 2's answer
   books input + cache-write + reservation, and the taught formula under-counts
   the `RateScheduler` ledger by every cache-write token.

2. [P2] "chapter 5's memory arithmetic caps sessions per GPU, so the provider
   caps streams per customer" (L66) → "chapter 4's memory arithmetic caps
   sessions per GPU…" — why: ch5 itself attributes the sessions-per-GPU
   capacity arithmetic to chapter 4 ("Chapter 4's capacity arithmetic, showing
   up as a scheduling constraint", ch5 L139; the KV budget card with
   "sessions per GPU from the capacity formula" is ch4's).

3. [P2] "OpenAI's responses include a `Retry-After` header when one is
   computable" (L76) → "…include a `Retry-After` header when present" —
   why: the digest quotes the docs as "when present"; "computable" invents a
   condition the source does not state.

4. [P2] "| Attempt cap 2–4 + ~10% retry budget | Bounds amplification at ~3× |"
   (L171) → "| Attempt cap 2–4 + ~10% retry budget | Bounds worst-case wire
   requests at the cap (3× at three attempts) |" — why: with a 4-attempt cap
   the bound is 4×; "~3×" holds only for the 3-attempt case the chapter names
   as standard.

5. [P2] "and as of issue #27823 it does so without a `Retry-After` header"
   (L129) → "and per LiteLLM issue #27823 (snapshot 2026-08-27) it does so
   without a `Retry-After` header" — why: gateway bug behavior is volatile
   (the digest hedges "historically lacked"), and numbers discipline wants
   volatile facts visibly dated; "as of issue #27823" is also not a date.

6. [P2] "**AWS Bedrock** — per-model token quotas" (L46, first use) →
   "**AWS (Amazon Web Services) Bedrock** — per-model token quotas" (and
   optionally gloss UTC once near the quoted "00:00 UTC" example at L74) —
   why: the style contract expands acronyms at first use, and this chapter
   expands even API/HTTP/SDK/SRE, yet AWS (and UTC) are never expanded
   anywhere in the manuscript.

7. [P2] "(they bypass the meter and cost a tenth of fresh input)" (L64) →
   "(they bypass the meter; chapter 14's dated sheet prices reads at 0.1×
   fresh input)" — why: pricing multipliers belong in dated boxes per the
   numbers discipline; the 10% figure traces to the 2026-08-27 digest but
   sits in the durable-prose spine.

Counts: P0 = 0 · P1 = 1 · P2 = 6
Verdict: MINOR
````