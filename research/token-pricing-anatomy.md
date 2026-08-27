# How per-token pricing is actually structured

researched: 2026-08-27 · researcher: glm-5.3-flash

## Key facts

All prices are USD per 1M tokens, from official pricing pages, retrieved
2026-08-27 — a dated snapshot, not a durable fact.

- OpenAI (developers.openai.com pricing page): gpt-5.6-sol $4.00 in /
  $20.00 out (short context), $8.00/$30.00 long; gpt-5.6-terra
  $2.00/$12.00, long $4.00/$18.00; gpt-5.6-luna $0.20/$1.20, long
  $0.40/$1.80; gpt-5.5 $5.00/$30.00 (<272K), $10.00/$45.00 long; gpt-5.4
  $2.50/$15.00, long $5.00/$22.50; gpt-5.1 and gpt-5 $1.25/$10.00;
  gpt-5-mini $0.25/$2.00; gpt-5-nano $0.05/$0.40; gpt-5-pro $15.00/$120.
  Legacy: gpt-4.1 $2.00/$8.00, gpt-4o $2.50/$10.00, gpt-4o-mini
  $0.15/$0.60. "Long context" for 5.5/5.4 is defined as ≥272K-token
  requests; long-context input is 2× short-context, output 1.5×.
- OpenAI cached input: 10% of input price on gpt-5.x/5.6 (gpt-5 cached
  $0.125 vs $1.25). Older models differ: gpt-4.1 cached $0.50 (25%),
  gpt-4o cached $1.25 (50%). The 5.6 family adds cache *write* pricing
  at 1.25× input (e.g. sol $5.00 writes vs $4.00 base) — older rows
  show no write charge.
- OpenAI lanes: Batch API = 50% discount, 24-hour turnaround, separate
  higher rate-limit pool (Batch guide); Flex = 50% discount,
  latency-tolerant synchronous (pricing page); Fast mode = premium lane
  at roughly 1.7–2.5× standard depending on model (gpt-5.5 $5.00→$12.50
  in = 2.5×; gpt-5 $1.25→$2.50 = 2×; gpt-4o $2.50→$4.25 ≈ 1.7×;
  computed from standard vs Fast tables), claiming up to 2.5× faster
  speeds (Fast mode guide, retrieved 2026-08-27). Regional
  data-residency endpoints carry a 10% uplift for models released on or
  after 2026-03-05. GPT-5.6 Sol promotional pricing holds at least
  through 2026-11-21.
- Anthropic (platform.claude.com pricing docs): Opus 5 / 4.8 / 4.7 /
  4.6 / 4.5: $5/$25; Sonnet 5: $2/$10; Sonnet 4.6/4.5: $3/$15; Haiku
  4.5: $1/$5; Fable 5 / Mythos 5: $10/$50. Sonnet 5's launch price was
  labeled introductory through 2026-08-31 with a scheduled rise to
  $3/$15 on 2026-09-01; the increase was cancelled and $2/$10 is now
  standard (pricing docs, retrieved 2026-08-27).
- Anthropic prompt-cache multipliers (official cache-pricing table):
  5-minute cache write = 1.25× base input; 1-hour cache write = 2×
  input; cache read (hit) = 0.1× input. Docs state the break-even
  directly: "caching pays off after one cache read for the 5-minute
  duration (1.25x write), or after two cache reads for the 1-hour
  duration (2x write)." Batch API = 50% off both directions. Fast mode
  (research preview, `speed: "fast"`, Opus 5/4.8 only, first-party API
  only) = exactly 2× ($10/$50). `inference_geo: "us"` = 1.1× on Claude
  4.6+. Claude 4.6+ ships the full 1M-token window at standard pricing —
  no long-context surcharge. Claude 4.7+ uses a newer tokenizer
  producing ~30% more tokens for the same text.
- Google Gemini (ai.google.dev pricing): Gemini 2.5 Pro $1.25 in/$10.00
  out; >200k-token prompts $2.50/$15.00 (2× input, 1.5× output);
  context caching $0.125 cached input (<200k; $0.25 above) plus
  $4.50/1M tokens/hour storage. Gemini 2.5 Flash $0.30/$2.50 (cache
  read $0.03, storage $1.00/1M/hr); Flash-Lite $0.10/$0.40. Output
  price explicitly includes thinking tokens. Batch = 50% ($0.625/$5.00
  on 2.5 Pro). Priority lane = 1.8× standard ($2.25/$18.00 on 2.5 Pro).
  Gemini 3.x models list higher (a flagship tier at $2.00/$12.00 with
  images-out at $120/1M tokens) with the same half-price Batch lane.
- DeepSeek (api-docs.deepseek.com): deepseek-v4-flash input
  cache-miss $0.22 off-peak / $0.44 peak; cache-hit $0.007/$0.014;
  output $0.66/$1.32. v4-pro: miss $0.66/$1.32, hit $0.022/$0.044,
  output $1.98/$3.96. Off-peak (all hours except 01:00–04:00 and
  06:00–10:00 UTC Mon–Fri) is exactly half price. Cache hit ≈ 3.2% of
  miss price. Concurrency caps: 2,500 (flash) / 500 (pro).

## How it works

Every provider reduces price to one unit: the token, billed per million,
separately for input and output. The reusable arithmetic:

```
cost = (input_tokens × P_in + cached_tokens × P_cached
      + cache_write_tokens × P_write + output_tokens × P_out) / 1,000,000
```

Output costs more than input everywhere — 3× to 8× the input price in
the 2026-08-27 snapshot (gpt-5: 8×; gpt-5.6-sol: 5×; Claude Opus 5: 5×;
Gemini 2.5 Flash: ~8.3×; DeepSeek v4-flash off-peak: 3×). The mechanism:
prefill processes all prompt tokens in parallel (high arithmetic
intensity, efficient batching), while decode emits one token per serial
step, re-reading model weights and the KV cache from memory for each
token — bandwidth-bound work that is far more expensive per token.
Thinking/reasoning tokens are billable output on every provider that
exposes them (Gemini says so explicitly; OpenAI counts
`reasoning_tokens` in `completion_tokens`; Anthropic prices thinking as
output).

Long-context tiers price the KV cache: a 2× input multiplier above
200k (Gemini 2.5 Pro) or ≥272K (OpenAI 5.5/5.4 long columns) reflects
memory held per request. Anthropic's opposite move — full 1M context at
standard price on Claude 4.6+ — is positioning, not physics.

Cache pricing is a write/read asymmetry. A write charges a premium
(1.25× Anthropic and OpenAI-5.6; 2× for 1-hour TTL on Anthropic); a
read charges ~10% (Anthropic, OpenAI gpt-5.x) or ~3% (DeepSeek hit vs
miss). The premium is a one-time amortization: at 1.25×/0.1×, one
repeated request breaks even; at 2×/0.1×, two do (Anthropic's docs
state this arithmetic verbatim).

Modifiers stack multiplicatively: Anthropic's cache multipliers stack
with Batch and residency; Fast mode stacks with caching and residency
but is barred from Batch. So a cached batch call can cost ~12.5% of
standard (0.5 × 0.25 write-adjusted effective rates vary by exact
split), while a fast, resident, uncached call can exceed 2–3× the
sticker price. Finally, tokenizers are a hidden price lever: Anthropic's
Claude 4.7+ tokenizer emits ~30% more tokens for the same text, raising
effective cost and latency at unchanged per-token prices.

## Harness angle

Meter cost per request from the provider's `usage` object using the
four-term formula above — never estimates — and tag each request with
its lane (standard/batch/flex/fast, peak/off-peak, residency). Route by
latency tolerance: anything that can wait 24h goes to Batch (−50%),
flexible-sync goes to Flex (−50%), latency-critical goes Fast (+1.7–2.5×)
only when TTFT/TPOT actually pays. Design stable prompt prefixes so
repeated turns pay 0.1× cache reads instead of 1.0× inputs — at agent
loop shapes (long shared prefix, short per-turn suffix), cache-hit math
dominates the bill, and DeepSeek-style hit prices (≈3% of input) reward
prefix discipline more than any model swap.

## Sources

- https://developers.openai.com/api/docs/pricing.md — full OpenAI price tables (Standard/Batch/Flex/Fast)
- https://developers.openai.com/api/docs/guides/batch.md — Batch API 50%, 24h turnaround
- https://developers.openai.com/api/docs/guides/fast-mode.md — Fast mode speed claim
- https://platform.claude.com/docs/en/about-claude/pricing.md — Anthropic model/cache/batch/fast tables
- https://platform.claude.com/docs/en/build-with-claude/prompt-caching.md — cache multipliers, TTLs
- https://ai.google.dev/gemini-api/docs/pricing — Gemini tiers, caching storage, batch/priority lanes
- https://api-docs.deepseek.com/quick_start/pricing — DeepSeek peak/off-peak and cache-hit prices
- https://openrouter.ai/api/v1/models — third-party cross-check of listed prices (retrieved 2026-08-27)
