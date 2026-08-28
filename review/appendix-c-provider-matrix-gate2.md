## Review — Gate 2 (Technical editor): `manuscript/appendix-c-provider-matrix.md`

Scope: full read of the appendix; STYLE.md, EDITORIAL_SYSTEM.md, GOAL.md; every pricing multiplier, rate-limit figure, and cache constant checked line-by-line against the dated digests in `research/`; chapter cross-references verified against actual chapter files; terminology/style scan (tokens/s, US spelling, closers, acronym policy).

### Correct (verified with digest evidence)

- **C.2 OpenAI table** — all 20+ figures trace verbatim to `research/token-pricing-anatomy.md`: "gpt-5.6-sol $4.00 in / $20.00 out (short context), $8.00/$30.00 long; gpt-5.6-terra $2.00/$12.00, long $4.00/$18.00; gpt-5.6-luna $0.20/$1.20, long $0.40/$1.80; gpt-5.5 $5.00/$30.00 (<272K), $10.00/$45.00 long … gpt-5.1 and gpt-5 $1.25/$10.00 … Legacy: gpt-4.1 $2.00/$8.00, gpt-4o $2.50/$10.00, gpt-4o-mini $0.15/$0.60." Internal math consistent: all long-context cells are exactly 2× in / 1.5× out, matching the digest's stated rule.
- **C.2 Anthropic** — "Opus 5 / 4.8 / 4.7 / 4.6 / 4.5: $5/$25; Sonnet 5: $2/$10 … the increase was cancelled and $2/$10 is now standard"; "Fast mode … = exactly 2× ($10/$50). `inference_geo: "us"` = 1.1× on Claude 4.6+ … Claude 4.6+ ships the full 1M-token window at standard pricing … Claude 4.7+ uses a newer tokenizer producing ~30% more tokens" — all verbatim-supported; "both stack with cache multipliers" matches "cache multipliers stack with Batch and residency; Fast mode stacks with caching and residency."
- **C.2 Gemini** — 2.5 Pro/Flash/Flash-Lite prices, storage "$1.00/1M/hr", 3.x flagship "$2.00/$12.00", "output price explicitly includes thinking tokens", priority 1.8× all traced to `token-pricing-anatomy.md`; 3.x >200K "$4.00/$18.00" and cached $0.20 traced to `context-window-claims.md` and `prompt-caching-provider-semantics.md`.
- **C.2 DeepSeek** — miss/output prices, "Off-peak … exactly half price", caps "2,500 (flash) / 500 (pro)" traced to `token-pricing-anatomy.md`. The hit-price snapshot conflict is honestly surfaced: "$0.0028" traces to `prompt-caching-provider-semantics.md` ("2026 V4-Flash $0.0028 vs $0.14") and "$0.007" to `token-pricing-anatomy.md` ("cache-hit $0.007/$0.014") — the appendix's "two snapshots disagree … treat hit pricing as '~a tenth or better'" is exactly the right handling.
- **C.2 prose** — cost formula, "3× to 8× the input price," "Fast = roughly 1.7–2.5× … (gpt-5.5 2.5×; gpt-5 2×; gpt-4o ≈1.7×)," "10% uplift for models released on or after 2026-03-05" — all traced.
- **C.3** — every cell traces to `prompt-caching-provider-semantics.md`: min prefixes "512 tokens (Opus 5/Fable 5/Mythos 5), 1,024 (Opus 4.8, Sonnet 4.5–5) … 4,096 (Haiku 4.5)"; write 1.25×/2×; read 0.1×; "4 cache breakpoints … 20 blocks"; "1-hour entries must precede 5-minute entries"; "lifetime measured from the *start* of the request"; OpenAI "1,024 visible tokens for GPT-5.6+ … 2,048 for older"; "at least 30 minutes"; ">~15 requests/minute … overflow-route"; Gemini "2,048 … 4,096," "no cost-saving guarantee," "$4.50/1M tokens/hour … $1.00 for 2.5 Flash, $0.50 for 3 Flash-tier"; break-even "after one cache read … after two" quoted in digest verbatim.
- **C.4** — all figures trace to `rate-limit-quota-architectures.md` (tier example "500 RPM / 500,000 TPM," shared "3.5M shared TPM," `max(max_tokens, …)`, unsuccessful requests count, "1,000 RPM, 2,000,000 ITPM, 400,000 OTPM," "60 RPM 'might be enforced as 1 request per second'," cache-read ITPM exemption "Haiku 3.5 is the documented exception," burndown "Claude 4.8 = 15x; Sonnet 5/Opus 5 = 10x; Claude 4.7 and below = 5x; GPT-5.6 … 10x," "36,000 … final 9,000," midnight-Pacific reset, free "2.5 Pro ≈ 5 RPM / 100 RPD," paid "150–300 RPM (third-party … approximate)") and to `429-529-retry-behavior.md` (monthly limits "2026-07-22," `insufficient_quota`, spend caps "$500/$1,000/$200,000," spend-cap 429 "carries **no `retry-after` header**").
- **C.5** — all traced to `provider-structured-output-apis.md`: 100%/<40% "vendor's own 2024 eval," "5,000 object properties, 10 levels, ≤120,000 … ≤1,000 enum values," null-union optionals, "first property … must also be first in `required` … folklore … hedged," `output_config.format` "previously the `structured-outputs-2025-11-13` beta," Gemini "ignores unsupported properties," DeepSeek "unending stream of whitespace."
- **C.6** — traced to `streaming-transports-normalization.md` + `tool-call-delta-streaming.md`: `[DONE]` sentinel, `tool_calls[].index`, `item_id`, `toolu_` ids, `step.start`, "Arguments are strings at OpenAI and Anthropic, objects at Gemini," `?alt=sse` "the query parameter is what makes the stream SSE-framed," "input raw 16-bit PCM at 16 kHz … output raw PCM at 24 kHz … resets roughly every 10 minutes," WebRTC, GLM `network_error`. "Pings legal anywhere" is chapter-consistent (ch12 line 66: "`ping`/`error` anywhere," sourced to Anthropic streaming docs).
- **C.7** — traced to `batch-api-economics.md` (50%/24 h ×3, "50,000 requests … 200 MB," "100,000 requests or 256 MB," "most batches finish in under 1 hour," "results retained 29 days," Google "Flex = 50% discount / 1–15 min target but best-effort (sheddable)") and `token-pricing-anatomy.md` (Flex/Fast lanes, Fast barred from Batch, Priority 1.8×).
- **C.8** — traced to `context-window-claims.md`: "400,000-token context window … max *input* is 272,000 because 128K is reserved for output," Claude 4.6+ 1M, "1,048,576 … output 65,536 … $2/$12 … $4/$18 above 200K," "Tiering is per-prompt," Scout 10M, Qwen "997,952 … 65,536," RULER "GPT-4 … 128K vs effective 32K … Yi-34B claimed 200K vs effective 16K," "4× to 100×+," lost-in-the-middle. No conflict with the digest's Sonnet-4.5 tiered note (4.5 is not "4.6+").
- **C.9** — traced to `same-model-different-providers.md` (8.3×, 446.7/53.5/172.0/152.8, 2.7×, $0.12–$0.33, 0.57 s vs 0.75 s, 6.1× ×2, $0.56/$3.40, FP8 500K+ evals, 18%/23%, INT4 2.7×/~8 points), `provider-latency-snapshot-2026.md` ("~3000 tokens/s on Cerebras … 500 tokens/s on Groq … 6×"; "could not be extracted through automated fetch (JS-rendered site)"), and `local-edge-inference.md` ("H100 ≈ $2.39–2.49/hr … A100 ≈ $1.49–2.49/hr … ~$1.49/hr … from ~$0.02 … up to ~$2.85 … $0.60 per 1M … 2026"). Arithmetic checks: 446.7/53.5 = 8.35 ≈ 8.3×; 154.8/25.6 = 6.05 ≈ 6.1×; 0.33/0.12 = 2.75 ≈ 2.7×; 3000/500 = 6×.
- **Cross-references** — all chapter pointers resolve to the right chapters (ch02 tokenizer, ch03 decode, ch06 KV/paging, ch11 context, ch12 streaming, ch13 structured output, ch14 cache economics, ch15 rate limits, ch16 routing/metering, ch18 own-vs-rent, Appendix B cards — `appendix-b-arithmetic-cheatsheet.md` back-links "full provider matrix in Appendix C").
- **Style/terminology** — `tokens/s` used uniformly (no tok/s or tokens/sec variants); US spellings clean (no British forms found); no vendor-marketing language; appendix framing (`> **Appendices — the reference shelf.**`) consistent with series conventions; RPM/ITPM/OTPM/SSE expanded at first use in chapters (ch01 SSE, ch15 meters) before the reference shelf reuses them — acceptable per the two-layer system.

### Findings

1. **[P1]** Untraceable API event name, inconsistent with chapter 12's contract.
   - Location: `manuscript/appendix-c-provider-matrix.md` line 98 (C.6, OpenAI Responses row).
   - Exact text: `` `response.completed` / `response.incomplete` ``
   - Replacement: `` `response.completed` ``
   - Why: `response.incomplete` appears nowhere in `research/streaming-transports-normalization.md` or `research/tool-call-delta-streaming.md` (both list only `response.output_item.added`, `response.function_call_arguments.delta/done`, `response.output_item.done`, `response.completed`), and chapter 12's dated snapshot (line 66) states termination is `response.completed` only. A whole-repo grep finds the string only in this appendix line — it violates the book's numbers/current-fact discipline and quietly amends ch12's streaming contract.

2. **[P1]** Gemini 2.5 Pro cached-input price omits the >200K tier — a 2× misprice trap in the lookup table.
   - Location: C.2 Gemini table, 2.5 Pro row.
   - Exact text: `| 2.5 Pro | $1.25 | $10.00 | $0.125 | >200K prompts: $2.50/$15.00 |`
   - Replacement: `| 2.5 Pro | $1.25 | $10.00 | $0.125 | >200K prompts: $2.50/$15.00; cached $0.25 above 200K |`
   - Why: `research/token-pricing-anatomy.md` states "context caching $0.125 cached input (<200k; $0.25 above)". The row flags the >200K tier for input/output but leaves the cached column flat at $0.125 — a reader caching a >200K prompt prices that line at half its true cost, exactly the config-copying failure C.1 warns against.

3. **[P1]** C.1 provenance claim is contradicted by self-labeled rows inside the same file.
   - Location: C.1, first body sentence.
   - Exact text: `Everything below was retrieved from official provider pages on **2026-08-27**`
   - Replacement: `Everything below was retrieved on **2026-08-27** — mostly from official provider pages, with third-party or off-date sources labeled wherever they appear`
   - Why: The matrix itself contains rows that are not official-provider-page retrievals: C.4 "paid ~150–300 RPM (third-party trackers — approximate)"; C.9 Artificial Analysis leaderboard figures; C.9 GPU rates "checked 2026-08-02, corroborated April 2026" (costperprompt.com/gpuinsights per `research/local-edge-inference.md`); C.8 RULER (arXiv). Row-level honesty is good; the blanket sentence overclaims and undercuts the provenance discipline the appendix exists to enforce.

4. **[P2]** Promo-date hedge weakened relative to the digest.
   - Location: C.2 OpenAI table, gpt-5.6-sol note.
   - Exact text: `Promo price held through 2026-11-21`
   - Replacement: `Promo price holds at least through 2026-11-21`
   - Why: `research/token-pricing-anatomy.md`: "GPT-5.6 Sol promotional pricing holds **at least** through 2026-11-21." As written, the appendix implies repricing on 11-22, which the digest does not support.

5. **[P2]** Legacy cached-rate note maps two percentages to three models.
   - Location: C.2 OpenAI table, legacy row note.
   - Exact text: `Older cached rates: 25% / 50%`
   - Replacement: `Older cached rates: 25% (4.1), 50% (4o)`
   - Why: The row covers three models; the digest supplies rates for only two — "gpt-4.1 cached $0.50 (25%), gpt-4o cached $1.25 (50%)" — and is silent on 4o-mini. The bare pair invites misassignment.

### Merge verdict

**OK with notes.** No blockers; 0 P0. The matrix is exceptionally well-traced — every pricing multiplier, rate limit, and cache figure I audited resolves to a dated digest line, the one genuine source conflict (DeepSeek hit pricing) is disclosed rather than papered over, and chapter cross-references are accurate. The three P1s are one-line fixes (drop an untraceable event name, add one tiered cached price, soften one provenance sentence) and should be applied before release.

Counts: P0 = 0 · P1 = 3 · P2 = 2
Verdict: MINOR