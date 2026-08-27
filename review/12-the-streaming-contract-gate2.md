All audits complete. No write-capable tool is available in this session, so per runtime policy the complete review artifact is returned below for persistence to `review/12-the-streaming-contract-gate2.md`.

**Chapter:** 12 — The streaming contract · **Counts:** P0 = 0 · P1 = 2 · P2 = 5 · **Verdict:** MINOR
**Worst finding:** the Field note's "hang 40 minutes … ten-minute line — three times over" contradicts the chapter's own derived ~30-minute SDK arithmetic (3 × 10 min) taught in the same section and checkpoint 5.

````markdown
# Gate 2 — Technical editor review: Chapter 12 (The streaming contract)

Reviewer: Gate 2 (technical editor) subagent · Review date: 2026-08-27
Inputs: manuscript/12-the-streaming-contract.md against STYLE.md,
EDITORIAL_SYSTEM.md, GOAL.md, CHAPTER_MAP.md, and research/ digests
(streaming-transports-normalization, tool-call-delta-streaming,
cancellation-timeout-semantics, provider-api-anatomy,
provider-latency-snapshot-2026, latency-vocabulary, tokenizer-fundamentals,
token-pricing-anatomy, cost-metering-attribution,
serving-observability-metrics, same-model-different-providers; sibling
chapters 1, 2, 5, 6, 8, 11 for cross-reference checks).
Read-only review; manuscript and research untouched.

## Checks performed (evidence)

1. **Numbers audit — 21 numeric claims traced; 19 exact matches with dates,
   2 scope-overreaches (P2 #4, #5), 1 internal arithmetic contradiction
   (P1 #1).** All digests researched/retrieved 2026-08-27 except the Gemini
   troubleshooting guide (updated 2026-07-27), which the chapter cites with
   its own correct date.
   - OpenAI SDK 10-min default + 408 auto-retried twice → "~30 minutes
     (3 × 10 min, derived)" — cancellation-timeout-semantics.md ✓.
   - Anthropic SDK 10-min overall / 5-s connect / 2 retries / 0.5 s → 8 s cap,
     `_constants.py` — same digest ✓.
   - Gemini SDKs 4 retries, ~1 s → 60 s backoff, guide "updated 2026-07-27" —
     same digest ✓ (date carried correctly).
   - Gemini Live API: WebSocket-only, 16-bit PCM 16 kHz in / 24 kHz out,
     ~10-min socket reset — streaming-transports-normalization.md ✓.
   - openai-python issue #2722 (JSONDecodeError on meta-only events) — same
     digest ✓. LiteLLM PR #22673 / GLM `finish_reason: "network_error"`
     mid-stream / Pydantic error — same digest ✓. vLLM issue #10087
     (middleware disconnects unnoticed until output) — cancellation digest ✓.
   - gpt-oss-120b ~3,000 t/s (Cerebras) vs ~500 t/s (Groq), "six-fold"
     (3000/500 = 6, recomputed) — provider-latency-snapshot-2026.md ✓
     (placement flagged as P1 #2).
   - GLM-5.3 ≈1.6 s input / ≈30.1 s reasoning / ≈7.5 s answer —
     latency-vocabulary.md ✓ (boxing flagged as P2 #3).
   - Claude 4.7+ tokenizer ~30% more tokens — tokenizer-fundamentals.md,
     provider-api-anatomy.md, token-pricing-anatomy.md ✓.
   - Anthropic usage identity "total input = cache reads + cache writes +
     fresh input (rate-limits docs)" — serving-observability-metrics.md
     ("per the rate limits docs, accessed 2026-08-27") + cost-metering-
     attribution.md ✓.
   - Anthropic quote "has no effect on output token generation" — exact
     match, provider-latency-snapshot-2026.md ✓.
   - DeepSeek dual OpenAI-format / Anthropic-format endpoints —
     provider-api-anatomy.md ✓.
   - All four providers' usage-field names (incl. `cache_write_tokens`,
     `prompt_tokens_details`, ephemeral 5-min/1-hour split, Gemini
     `usageMetadata.*` with cache-inclusive `promptTokenCount`) —
     provider-api-anatomy.md ✓.
   - Portland 3-fragment example, `""`→`{}` coercion, ~1 key/value pair per
     delta, parse-only-after-`content_block_stop`, `MALFORMED_FUNCTION_CALL`,
     vLLM tool-parser warning quote — tool-call-delta-streaming.md ✓.
   - Capture-and-resume (Claude ≤4.5 assistant / ≥4.6 user-message
     continuation), "require streaming … to avoid HTTP timeouts" quote,
     billed-before-abort hedge — cancellation-timeout-semantics.md ✓.
   - vLLM `/metrics` `time_to_first_token_seconds` histogram; Anthropic
     console cache-rate chart — serving-observability-metrics.md ✓.
   - Untraced/untraceable: none. Field-note numbers (40 min, 120-s gap,
   "once or twice a week") are operator observations permitted by STYLE.md;
   the 40-minute figure is internally inconsistent (P1 #1).

2. **Mechanics — 6 derivations recomputed by hand.**
   - 3 × 10 min = 30 min ✓ (box :101 and checkpoint answer :166 agree;
     Field note :107 says 40 — contradiction, P1 #1).
   - 3000/500 = 6 ✓ "six-fold".
   - Portland: `{"ci` + `ty": "Por` + `tland"}` → `{"city": "Portland"}`
     ✓ valid JSON, exact concatenation; escape-split `\"Portla`/`nd\"` ✓.
   - xychart values [0.4, 1.65, 2.9, 4.15, 5.4] reproduce exactly under
     e2e = TTFT + N × TPOT (0.4 + N×0.025) — the decode-time-inequality
     form ch2 explicitly blesses for charts ("the inequality's N absorbs
     that minus-one"); ch2's own chart uses the same convention. Exact
     identity (N−1) would give 1.63 at N=50; chart is labeled illustrative.
   - GLM split: 1.6 + 30.1 = 31.7 s before first visible answer token →
     "stared at a spinner for half a minute" ✓.
   - Mermaid: graph LR block parses (no parens/braces/quotes in labels;
     `<br/>` fine); xychart-beta block matches the syntax already used in
     ch2/ch5 charts (named lines need mermaid ≥10.9 — already required by
     the book). 12.1 table is well-formed (3 columns × 12 term rows).

3. **Frame audit — passes.** Title `# 12. …` + Part III context quote ✓;
   H2s numbered 12.1–12.6 with frame H2s (`Where the picture stops`,
   `Checkpoint`, closers) unnumbered, matching the ch1–ch11 house
   convention ✓; 5 ELI5 blocks (§§12.2–12.6), jargon-free, everyday
   analogies ✓; `Words before machinery` table with 12 rows ✓; `Where the
   picture stops` with 3 concrete breaks ✓; all four closers present as
   `###` H3s ✓; two `Dated snapshot` boxes ✓ (one gap → P1 #2/P2 #3); no
   vendor marketing language ✓; scope matches CHAPTER_MAP ch12 beat exactly
   (SSE/WebSocket, event shapes, tool-call deltas, provider differences,
   normalizer, TTFT-as-product-metric) with no ch13–16 material stolen ✓.
   Cross-references verified against the actual sibling chapters: ch2's two
   regimes and worked example (02:110–117), ch5's goodput discipline and
   timeout-shape prescription (05:145–168, handoff row "12, 15"), ch6's
   promissory note "chapter 12 covers parsing them" (06:158), ch11's
   "chapter 12's usage parsing" (11:140), ch1's serialize hop (01:96),
   ch8's serial-decode escape (08:3–5). Both promissory notes are cashed
   in §12.5 as claimed.

## Findings

1. **[P1] Field-note arithmetic contradicts the chapter's own derived
   ~30-minute figure — manuscript/12-the-streaming-contract.md:107.**
   Current: "Once or twice a week a job would hang 40 minutes and then die
   at the SDK's ten-minute line — three times over, with retries."
   Replacement: "Once or twice a week a job would hang ~30 minutes and then
   die at the SDK's ten-minute line — three times over, with retries." (Or,
   if 40 was truly observed: "…hang ~40 minutes — the SDK's ten-minute line
   three times over, plus our own scheduler's one retry —".)
   Why: the dated box at :101 derives "~30 minutes (3 × 10 min, derived)"
   and checkpoint 5 + its answer reconstruct exactly that; three ten-minute
   SDK deaths cannot total 40 minutes, so the anecdote breaks the numbers
   discipline the chapter itself just taught.

2. **[P1] Benchmark numbers in the durable-prose spine —
   manuscript/12-the-streaming-contract.md:149.**
   Current: "**Provider choice is a latency knob** — same weights served
   six-fold apart in output speed on different stacks (gpt-oss-120b at
   ~3,000 vs ~500 tokens/s, Cerebras vs. Groq, 2026-08-27 snapshot), which
   is a serving-stack property that extends to first-token responsiveness;
   benchmark the endpoint, not the model (chapter 1)."
   Replacement: keep the sentence as "same weights served six-fold apart in
   output speed on different stacks (see the snapshot below), which is a
   serving-stack property…" and add a dated box: "> **Dated snapshot — same
   weights, different stacks (2026-08-27).** gpt-oss-120b streams at ~3,000
   tokens/s on Cerebras vs ~500 tokens/s on Groq — a 6× spread on identical
   weights (Cerebras docs, Groq catalog, retrieved 2026-08-27). Rankings
   drift with infrastructure; benchmark the endpoint, not the model."
   Why: STYLE.md hard rule — "benchmark results live in dated
   boxes/sidebars, never in the durable-prose spine"; identical to the P1
   the ch1 gate-2 review issued for the same pattern.

3. **[P2] GLM-5.3 split also sits in prose —
   manuscript/12-the-streaming-contract.md:151.**
   Current: "GLM-5.3 spent ≈1.6 s on input, ≈30.1 s emitting reasoning,
   then ≈7.5 s on the answer (chapter 2's Artificial-Analysis split,
   retrieved 2026-08-27)."
   Replacement: "GLM-5.3 spent ≈1.6 s on input, ≈30.1 s emitting reasoning,
   then ≈7.5 s on the answer (mid-2026 Artificial-Analysis snapshot, quoted
   in full in chapter 2)."
   Why: same STYLE.md boxing rule, but left at P2 because ch2 carries the
   identical numbers in prose and this is a dated callback — decide the
   boxing convention book-wide rather than diverging between chapters.

4. **[P2] Unqualified negative claim outruns its digest —
   manuscript/12-the-streaming-contract.md:134.**
   Current: "because no provider exposes TTFT distributions to customers
   (their queue depth, KV occupancy, and latency histograms are engine
   internals, checked 2026-08-27)"
   Replacement: "because hosted providers expose no TTFT distributions to
   customers (queue depth, KV occupancy, and latency histograms are engine
   internals; checked Anthropic and OpenAI docs, 2026-08-27)".
   Why: serving-observability-metrics.md verifies the negative only for
   Anthropic and OpenAI; "no provider … checked 2026-08-27" implies all
   three were checked.

5. **[P2] Same overreach, second instance —
   manuscript/12-the-streaming-contract.md:149.**
   Current: "no provider publishes a milliseconds-per-hit figure, the
   saving scales with cached-prefix length"
   Replacement: "neither OpenAI nor Anthropic publishes a
   milliseconds-per-hit figure (checked 2026-08-27), and the saving scales
   with cached-prefix length".
   Why: provider-latency-snapshot-2026.md supports the negative for OpenAI
   and Anthropic only; the unqualified "no provider" is unverified for
   Gemini.

6. **[P2] Acronyms not expanded at first use —
   manuscript/12-the-streaming-contract.md:7, :26, :184.**
   Current: "agent turns are short and TTFT-dominated (chapter 2's two
   regimes)" (:7; expansion only arrives in §12.1); "reassembles fragmented
   tool arguments into one JSON object" (:26, table; expansion arrives in
   §12.2); "all three major LLM providers" (:184).
   Replacement: "TTFT (time to first token)-dominated" at :7; "one JSON
   (JavaScript object notation) object" at :26; "all three major LLM
   (large language model) providers" at :184.
   Why: STYLE.md hard rule ("acronyms expanded at first use"); every other
   acronym in the chapter (KV, HTTP, API, SDK, SSE, PCM, WebRTC, CI) is
   expanded correctly at first use.

7. **[P2] Unverifiable vendor-motive claim stated as fact —
   manuscript/12-the-streaming-contract.md:7.**
   Current: "the SDK (software development kit) defaults are ten minutes
   long precisely because a request that returns nothing until it returns
   *everything* gives you no progress signal to hang a deadline on."
   Replacement: "OpenAI's and Anthropic's SDK (software development kit)
   defaults are ten minutes long largely because a request that returns
   nothing until it returns *everything* gives you no progress signal to
   hang a deadline on."
   Why: no digest supports the vendors' motive ("precisely because"), and
   the blanket "the SDK defaults" silently includes Google, whose timeout
   defaults the digests do not give (its 10-min figure belongs to OpenAI
   and Anthropic only); EDITORIAL_SYSTEM requires unverified facts to be
   hedged or removed.

## Notes / residual risks (not findings)

- Word count: by inspection the chapter sits at or slightly above the
  5,500-word concept-chapter ceiling (STYLE.md target 3,000–5,500); run
  `tools/lint-manuscript.py` at the next gate for the exact figure before
  deciding whether to trim.
- The xychart uses the decode-time-inequality form (TTFT + N × TPOT),
  consistent with ch2's own chart; at N=50 the exact (N−1) identity would
  read 1.63 rather than 1.65 — chart is explicitly labeled illustrative,
  no action needed.
- "408 Request Timeout" retry behavior and Anthropic retry delays mean the
  true worst-case hang is ~30.2 min, not exactly 30; the chapter's "~" and
  "derived" labels already cover this.
- xychart-beta named lines require mermaid ≥ 10.9; the manuscript already
  depends on this via ch2/ch5 charts, so no new build risk.

Counts: P0 = 0 · P1 = 2 · P2 = 5
Verdict: MINOR
````