# Appendix C. The provider matrix

> **Appendices — the reference shelf.** One dated snapshot of the four major providers' commercial surfaces. The chapters taught the mechanisms; this page holds the constants. Every number here will age; the mechanisms will not.

## C.1 How to read this matrix

Everything below was retrieved on **2026-08-27** — mostly from official provider pages, with third-party or off-date sources labeled wherever they appear — and is a snapshot, not a fact about the universe. The chapters own the teaching (each table names its chapter); this appendix owns the lookup. The one discipline that matters: **re-date the matrix every pricing cycle** — quarterly at most, immediately after any provider announcement you act on — and never let a constant from this page survive into your config unaccompanied by its date.

## C.2 Prices (USD per 1M tokens)

Representative rows, not full catalogs; each provider's pricing page is the source of truth.

| OpenAI | Input | Output | Long-context | Notes |
|---|---|---|---|---|
| gpt-5.6-sol | $4.00 | $20.00 | $8.00/$30.00 | Promo price holds at least through 2026-11-21 |
| gpt-5.6-terra | $2.00 | $12.00 | $4.00/$18.00 | |
| gpt-5.6-luna | $0.20 | $1.20 | $0.40/$1.80 | |
| gpt-5.5 | $5.00 | $30.00 | $10.00/$45.00 | "Long" = requests ≥272K tokens |
| gpt-5.1 / gpt-5 | $1.25 | $10.00 | — | Cached input $0.125 (10%) |
| gpt-5-mini / nano | $0.25 / $0.05 | $2.00 / $0.40 | — | |
| Legacy: gpt-4.1 / 4o / 4o-mini | $2.00 / $2.50 / $0.15 | $8.00 / $10.00 / $0.60 | — | Older cached rates: 25% (4.1), 50% (4o) |

| Anthropic | Input | Output | Notes |
|---|---|---|---|
| Opus 5 (and 4.5–4.8) | $5 | $25 | |
| Sonnet 5 | $2 | $10 | Intro price made standard; the scheduled 2026-09-01 rise was cancelled |
| Sonnet 4.6 / 4.5 | $3 | $15 | |
| Haiku 4.5 | $1 | $5 | |
| Fable 5 / Mythos 5 | $10 | $50 | |

Claude 4.6+ ships the full 1M-token window at standard price — positioning, not physics (chapter 11). Fast mode (Opus 5/4.8 preview) is exactly 2×; `inference_geo: "us"` is 1.1× on Claude 4.6+; both stack with cache multipliers. Claude 4.7+ uses a newer tokenizer emitting ~30% more tokens for the same text — a hidden price lever (chapters 2, 12).

| Gemini | Input | Output | Cached input | Notes |
|---|---|---|---|---|
| 2.5 Pro | $1.25 | $10.00 | $0.125 | >200K prompts: $2.50/$15.00; cached $0.25 above 200K |
| 2.5 Flash | $0.30 | $2.50 | $0.03 | Storage $1.00/1M/hr |
| Flash-Lite | $0.10 | $0.40 | — | |
| 3.x flagship tier | $2.00 | $12.00 | $0.20 | >200K: $4.00/$18.00; output price includes thinking tokens |

| DeepSeek | Input (miss) | Input (hit) | Output | Notes |
|---|---|---|---|---|
| v4-flash | $0.22 off-peak / $0.44 peak | ≈2–3% of miss | $0.66 / $1.32 | Off-peak exactly half price |
| v4-pro | $0.66 / $1.32 | ≈3% of miss | $1.98 / $3.96 | Concurrency caps: 2,500 / 500 |

Two 2026-08-27 snapshots disagree slightly on DeepSeek hit prices ($0.0028 vs $0.007 per million on v4-flash); treat hit pricing as "~a tenth or better of the miss price" until your own invoice reconciles it.

The reusable structure underneath every row (chapter 2 and 16's metering): **cost = (fresh×in + writes×write_mult×in + reads×read_mult×in + out×out) / 1M**, with output priced 3–8× input everywhere because decode is serial and bandwidth-bound while prefill is not (chapter 3). Fast/priority lanes multiply (OpenAI 1.7–2.5× by model; Gemini priority 1.8×); regional residency adds 10% on OpenAI models released 2026-03-05 or later.

## C.3 Prompt-cache semantics

One mechanism — byte-exact KV-prefix reuse (chapter 6) — under four contracts (chapter 14):

| | Anthropic | OpenAI | Gemini | DeepSeek |
|---|---|---|---|---|
| Opt-in? | Explicit breakpoints (`cache_control`) | Automatic (explicit on 5.6+) | Implicit + explicit `caches.create` | Automatic (disk) |
| Min prefix | 512–4,096 by model (512 Opus 5; 1,024 Sonnet 4.5+/5; 4,096 Haiku 4.5) | 1,024 visible tokens (5.6+); 2,048 older | 2,048 (2.5 Pro/Flash); 4,096 (3.x) | — |
| Write | 1.25× (5 m) / 2× (1 h) | 1.25× (5.6+, `cache_write_tokens`); none on older | — (implicit) | — |
| Read | 0.1× | 0.1× (older: 25–50%) | 10% of input | ≈0.1× or better |
| TTL | 5 m refreshed free on read; 1 h optional; clock from request start | ≥30 m (5.6+) | Implicit: undocumented; explicit: default 1 h, updatable | Persistent disk cache |
| Traps | 4 breakpoints max; 20-block lookback; 1 h must precede 5 m | >~15 req/min can overflow-route to a miss; `prompt_cache_key` groups routing | "No cost-saving guarantee"; explicit storage billed $4.50/1M/hr Pro-class ($1.00 2.5 Flash, $0.50 3 Flash-tier) | Newest rows show ~2–3% hit share spread across snapshots |

Break-even arithmetic the docs state themselves: one read repays the 1.25× write; two repay the 2× (chapter 14's worksheet).

## C.4 Rate-limit meters

The meters differ enough that one shared token counter mispredicts throttling on three of four providers (chapter 15):

| | OpenAI | Anthropic | Gemini | Bedrock |
|---|---|---|---|---|
| Metrics | RPM, TPM, RPD, IPM, audio-min | RPM, ITPM, OTPM | RPM, input TPM, RPD | Per-model token quota |
| Scope | Org + project (not per key); some families share pools (3.5M TPM documented) | Per model class; families share pools | Per project; resets midnight Pacific | Per model |
| Reservation | `max(max_tokens, char-estimate)`; unsuccessful requests count | ITPM = input + writes; **cache reads exempt** (Haiku 3.5 the exception); OTPM on actual output | Input only | `input + cache-write + max_tokens` up front, re-credited; output × burndown (15× Claude 4.8; 10× Sonnet 5/Opus 5 and GPT-5.6 on Bedrock; 5× Claude ≤4.7; 1:1 most others); cache reads never counted |
| Enforcement | Tiered by lifetime spend | Token bucket, continuous refill ("60 RPM might be 1 rps") | Plus spend-based limits | Service Quotas |
| Snapshot example | Tier 1: 500 RPM / 500K TPM (GPT-5.4/5.6 family) | Opus 5/Sonnet 5/Haiku 4.5: 1,000 RPM / 2M ITPM / 400K OTPM | Free 2.5 Pro ≈ 5 RPM / 100 RPD; paid ~150–300 RPM (third-party trackers — approximate) | Worked example in docs: 36,000 booked → 9,000 final |

Spend caps: OpenAI enforces monthly limits (July 2026) with `insufficient_quota` 429s; Anthropic Start $500 / Build $1,000 / Scale $200,000 per month, with spend-cap 429s carrying **no** `Retry-After` — classify before retrying (chapter 15).

## C.5 Structured-output guarantee tiers

Chapter 13's ladder, as configuration:

| Tier | Surface | Guarantee |
|---|---|---|
| Full schema | OpenAI `json_schema` + `strict: true` (Chat `response_format`; Responses `text.format`) | Constrained decoding: 100% schema adherence (vendor's 2024 eval; <40% for prompting). Limits: 5,000 properties, 10 nesting levels, 120K schema chars, 1,000 enums; unsupported keywords error; all fields `required` (optionals via `null` unions); key order = emission order (first-in-`required` is community folklore, hedged) |
| Strict tool | Anthropic `strict: true` tools; `output_config.format` (ex-`structured-outputs-2025-11-13` beta) | Tool names and inputs validate; force extraction via `tool_choice: {type:"tool"}` |
| Schema subset | Gemini `responseMimeType` + `responseSchema` (OpenAPI 3.0 subset) | Enforced at generation, but unsupported keywords are **silently ignored** — a constraint you think you have, you may not |
| Syntax only | DeepSeek `json_object` | Parses as JSON; shape is whatever the prompt example nudged; needs `"json"` in prompt, an example, and a sane `max_tokens` (else unending whitespace to the limit) |

What none of the four guarantee: semantic correctness, content past a truncation cutoff, or business rules inside values.

## C.6 Streaming surfaces

Chapter 12's grammar map, one row each:

| Surface | Transport | Termination | Tool-call keying |
|---|---|---|---|
| OpenAI Chat | SSE; `data:` JSON chunks | `data: [DONE]` sentinel; `finish_reason` per choice | `tool_calls[].index` → `id` |
| OpenAI Responses | SSE; typed events (`response.output_text.delta`, `response.completed`) | `response.completed` | `item_id` |
| Anthropic | SSE; strictly ordered event log (`message_start` → block lifecycle → `message_delta`); pings legal anywhere | `stop_reason` in `message_delta` | block index + `toolu_` id |
| Gemini | `streamGenerateContent?alt=sse` (the query param is the stream switch) | `finishReason` on the last chunk | `step.start` id; args arrive as objects |
| Realtime/Live | WebSocket (OpenAI also WebRTC); Gemini Live raw PCM 16 kHz in / 24 kHz out, socket resets ~every 10 minutes | Session events | — |

Provider finish-reason vocabularies diverge enough to break schemas (one provider emits `network_error` mid-stream); map to your own enum with an explicit `unknown` fallback, and never parse tool arguments per-chunk — once, at the finish.

## C.7 Batch and priority lanes

| | OpenAI | Anthropic | Google |
|---|---|---|---|
| Batch discount | 50% | 50% on all token usage | 50% |
| Window | 24 h (only value) | ≤24 h, most finish <1 h | 24 h SLO |
| Limits | 50,000 requests / 200 MB per file | 100,000 requests / 256 MB; results kept 29 days | — |
| Sibling lanes | Flex: 50%, latency-tolerant sync; Fast: ~1.7–2.5× premium | Fast mode 2× (Opus 5/4.8 preview; barred from Batch) | Flex: 50%, 1–15 min target, sheddable; Priority: 1.8× |

The heuristic that routes: if the harness would retry rather than time out, it can batch (chapter 16). Modifiers stack multiplicatively where allowed — a cached batch call can cost a small fraction of sticker; a fast, resident, uncached call can exceed 2–3× it.

## C.8 Context windows and long-context tiers

| Model family | Claimed window | Practical split | Long-context pricing |
|---|---|---|---|
| GPT-5 family | 400K | 272K max input (128K reserved for output) | 5.5/5.4: ≥272K = 2× in / 1.5× out |
| Claude 4.6+ | 1M | — | Standard price (no surcharge) |
| Gemini 3.1 Pro | 1,048,576 | 65,536 max output | >200K: 2× in / 1.5× out; tiering is per-prompt |
| Llama 4 Scout | 10M (claim) | — | — |
| Qwen API tiers | 1M | ~998K in / 65.5K out | — |

Claimed is admission; effective is quality — RULER measured claimed-vs-effective gaps from 4× to beyond 100× (Yi-34B 200K claimed vs 16K effective; GPT-4-1106 128K vs 32K), and "lost in the middle" makes position a design variable (chapter 11). Size budgets from your own battery at min(quality, tier, KV), not the marketing number.

## C.9 Same weights, different engines

For open-weight models, the provider *is* a performance dial (chapters 9, 16, 18):

- Llama 4 Scout, same weights: output speed spread **8.3×** (Groq 446.7 tokens/s vs DeepInfra 53.5; Bedrock 172.0, Vertex 152.8); blended price spread **2.7×** ($0.12–$0.33/1M); and the fastest decoder was *not* the lowest-TTFT host (DeepInfra 0.57 s vs Groq 0.75 s).
- DeepSeek R1 0528: **6.1×** speed spread (Vertex 154.8 vs DeepInfra 25.6 tokens/s) and **6.1×** blended price ($0.56 vs $3.40/1M).
- gpt-oss-120b: ~3,000 tokens/s on Cerebras vs 500 on Groq — a 6× spread on identical weights.
- Quantization is part of the spread: FP8 is near-lossless across the Llama-3.1 family (500K+ evaluations) and 18–23% faster and cheaper per token on B200/B300-class hardware; INT4 runs 2.7× faster than BF16 but lost ~8 points HumanEval in a single-H100 Qwen3-32B benchmark. Pin the variant; re-benchmark quarterly.

And the own-vs-rent constants (chapter 18's crossover, re-dated here): H100 rental ≈ **$2.39–2.49/hr** (RunPod/Lambda, checked 2026-08-02, corroborated April 2026), marketplace A100 ≈ **$1.49–2.49/hr**, 4090-class from ~$1.49/hr; disaggregated per-token APIs from ~$0.02 to ~$2.85 per 1M (open-weight tiers, 2026); the mid-tier blended figure the crossover used, **$0.60/1M**. Leaderboard figures move with infrastructure changes — Artificial Analysis itself versions its index and could not be auto-extracted on 2026-08-27 (JavaScript-rendered), so treat provider rankings as snapshots of a snapshot.

## C.10 Re-dating the matrix

The matrix ages on four clocks: **prices** (quarterly, or on announcement), **quota sheets** (with tier changes and enforcement stunts), **schemas and limits** (structured-output keyword support, batch caps), and **rankings** (provider infrastructure drift). The durable half — the four-term cost formula, the reservation meters, the guarantee ladder, the spread mechanism — lives in Appendix B's cards and the chapters this page points to. When a constant here disagrees with a provider's current page, the page wins, and this matrix needs the fix; when a *mechanism* here disagrees with a chapter, tell the authors — that is a bug in the book.

---

*Snapshot discipline, one last time: everything above is 2026-08-27. If you are reading this after a pricing cycle has turned, the honest numbers are one re-retrieval away — the dishonest ones are the ones you kept using.*
