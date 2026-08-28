# Numbers re-verification — ch15 (Rate limits are physics) + ch16 (Routing, fallbacks, and the money meter)

verified: 2026-08-28 · verifier: glm-5.3-flash (post-fix pass: reflow, copyedit, gate-6, pedagogy)
Scope: every numeric claim in the CURRENT text of both chapters, traced to dated research digests; all derived arithmetic recomputed independently.

## Method

Read both chapters in full; extracted every number (prices, multipliers, limits, latencies, percentages, byte/request ceilings, dates, worked-example values, checkpoint answers, chart points). For each: located the supporting digest in `research/`, confirmed value and retrieval date, and recomputed all derived arithmetic by hand. 187 distinct claims checked (ch15: 84, ch16: 103).

## ch15 — claim → digest → verdict

| Claim (current text) | Digest | Verdict |
|---|---|---|
| OpenAI tiers: T1 $5 / T2 $50 / T3 $100 / T4 $250 / T5 $1,000; $200,000/mo cap at T5 | rate-limit-quota-architectures | TRACED |
| Tier ladder: T1 ≈ 500 RPM / 500K TPM; T2 ≈ 5,000 RPM / 1–2M TPM; T3 ≈ 5,000 / ≥2M; T4 ≈ 10,000 RPM | rate-limit-quota-architectures | TRACED |
| Shared family pool: 3.5M tokens documented example | rate-limit-quota-architectures | TRACED |
| Anthropic: Opus 5 / Sonnet 5 / Sonnet 4.x / Haiku 4.5 = 1,000 RPM / 2,000,000 ITPM / 400,000 OTPM | rate-limit-quota-architectures | TRACED |
| Anthropic spend caps: Start $500 / Build $1,000 / Scale $200,000 / Custom uncapped | rate-limit-quota-architectures | TRACED |
| Gemini free tier (post Dec-2025 50–80% cuts): Pro ≈ 5 RPM/100 RPD; Flash ≈ 10/250; Flash-Lite ≈ 15/1,000; ~250,000 shared input TPM | rate-limit-quota-architectures | TRACED |
| Gemini Paid T1 ≈ 150–300 RPM (third-party, approximate — hedged in text) | rate-limit-quota-architectures | TRACED |
| Bedrock burndown: 15× (Claude 4.8) / 10× (Sonnet 5, Opus 5) / 5× (≤4.7) / 10× (GPT-5.6 Sol/Terra/Luna) / 1:1 others; cache reads uncounted | rate-limit-quota-architectures | TRACED |
| Bedrock worked example: 3,000 in + 4,000 cache-read + 1,000 cache-write + 1,000 out, max_tokens 32,000 → 36,000 initial, 9,000 final | rate-limit-quota-architectures (AWS worked example) | TRACED |
| Bedrock initial deduction = input + cache-write + max_tokens | digest formula line says `input + max_tokens`; the SAME digest's AWS worked example (36,000 = 3,000 + 1,000 + 32,000) includes cache-write | TRACED — digest-internal divergence already logged (driver iteration 41); chapter follows the primary-source worked example |
| OpenAI per-request TPM charge = max(max_tokens, char-count estimate); unsuccessful requests still count | rate-limit-quota-architectures | TRACED |
| Anthropic 80% cache-hit → 2M ITPM ≈ 10M effective input tokens/min | rate-limit-quota-architectures (its own worked example) | TRACED |
| Anthropic token bucket: 60 RPM "might be enforced as 1 request per second" | rate-limit-quota-architectures | TRACED |
| Gemini: per-project, midnight-Pacific reset, spend-based limits, no output meter | rate-limit-quota-architectures | TRACED |
| "acceleration limits" 429 sharp increases; Gemini Dec 2025 cuts (×2 mentions) | rate-limit-quota-architectures | TRACED |
| 429 `rate_limit_error` (rate limit / spend cap / workspace) vs 529 `overloaded_error`; 529 never carries Retry-After; spend-cap 429 carries none, "regain access on 2026-09-01 at 00:00 UTC" example | 429-529-retry-behavior | TRACED |
| OpenAI 429 overloaded in meaning; `insufficient_quota` in code/type; enforced monthly spend limits since July 2026 (docs: 2026-07-22) | 429-529-retry-behavior | TRACED |
| OpenAI Retry-After "when present" + `x-ratelimit-*` (remaining requests/tokens, reset) | 429-529-retry-behavior | TRACED |
| SDK defaults box: openai-python 2 retries (3 attempts), honors Retry-After; anthropic 2 retries, 0.5 s initial / 8 s max, Retry-After on 429; google-genai 4 retries, ≈1/2/4/8 s, 60 s cap | 429-529-retry-behavior | TRACED (all three SDKs) |
| 3-attempt cap → 3× worst-case amplification ("commonly cited") | 429-529-retry-behavior | TRACED + DERIVED-OK |
| Full Jitter: AWS blog 2015 (updated 2023), 1,000 clients / 100 tokens simulation; formula `random(0, min(cap, base·2^attempt))` | 429-529-retry-behavior; client-rate-scheduling | TRACED |
| SRE: ~3 attempts, ~10% retry budget; 10,000 QPS vs 100 QPS overload, +~100 QPS per retry round, 2× amplification at 50% failure | 429-529-retry-behavior | TRACED |
| Adaptive throttling: window ≥ 2 min, K = 1.1 ("10% above recent success"), 1,000/600 → 340/1001 ≈ 34% | client-rate-scheduling | TRACED (worked example is the digest's own) |
| Checkpoint 5: (1,200 − 1.1×900)/1,201 = 210/1,201 ≈ 17.5% | recomputed | DERIVED-OK |
| Beam `AdaptiveThrottler` with min-rate floor; AWS adaptive mode bucket halves/doubles | client-rate-scheduling | TRACED |
| Queueing law: ≈ service/(1−util); 2× at 50%, 10× at 90%, 100× at 99%; knee 70–80% | client-rate-scheduling | TRACED |
| xychart [1.4, 2.0, 3.3, 5.0, 10.0, 20.0] at 30/50/70/80/90/95% | recomputed (1/(1−ρ)) | DERIVED-OK |
| 900,000 TPM ÷ 60 ÷ 500 ≈ 30 req/s; 70–80% ≈ 21–24 req/s | client-rate-scheduling + recomputed | TRACED + DERIVED-OK |
| Little's Law: 24 req/s × 4 s ≈ 96 in flight | recomputed (labeled illustrative) | DERIVED-OK |
| Tail law: 1−(1−p)^N; p=1%, N=100 → ~63%; N=10,000 → ≥99.99999% | tail-latency-fanout-amplification | TRACED + DERIVED-OK (0.99^100 ≈ 0.366; 0.99^10000 ≈ 2.2e−44) |
| "Make fewer requests" ranked with "parallelize"; halve output ≈ halve latency; halve prompt buys 1–5% | tail-latency-fanout-amplification | TRACED |
| Checkpoint 2: start 18,500 (2,000+500+16,000); final 10,500 (2,000+500+800×10) | recomputed | DERIVED-OK |
| Checkpoint 4: min(8, 0.5×2³)=4 → random(0,4) | recomputed | DERIVED-OK |
| LiteLLM: 429 retries + cooldowns + rerouting; `enforce_model_rate_limit` local 429s; Redis-tracked usage | client-rate-scheduling | TRACED |
| `RouterRateLimitError` without Retry-After, issue #27823 (snapshot 2026-08-27) | client-rate-scheduling | TRACED |
| Cache reads 0.1× fresh input (ch14 pointer) | cost-metering-attribution | TRACED |
| Field note (Saturday-night spend-cap zombie fleet) | marked operator anecdote | OK-BY-DESIGN (not a research claim) |

## ch16 — claim → digest → verdict

| Claim (current text) | Digest | Verdict |
|---|---|---|
| LiteLLM strategies: simple-shuffle (recommended) / least-busy / latency-based / usage-based (cost or TPM/RPM); `weight` fields | model-routing-gateways-fallbacks | TRACED |
| `health_check_interval` proactive removal; `ignore_transient_errors` for 429/408 | model-routing-gateways-fallbacks | TRACED |
| Fallback example gpt-4 → claude group; all-cooldown → explicit fallback skips cooldown check | model-routing-gateways-fallbacks | TRACED |
| OpenRouter: `allow_fallbacks: true` default; 30-second outage deprioritization; inverse-square-of-price; $1/$2/$3 → 9× (chapter's $1 vs $3 framing) | model-routing-gateways-fallbacks | TRACED |
| OpenRouter Aug 2025 ~50-minute gateway DB outage; no uptime % published (hedged in text) | model-routing-gateways-fallbacks | TRACED |
| Cloudflare `cf-aig-step`; `:0` primary, `:1` first fallback | circuit-breakers-llm-ops | TRACED |
| RouteLLM (arXiv 2406.18665, LMSYS 2024-07-01): ~95% GPT-4 quality; >85% MT Bench / 45% MMLU / 35% GSM8K; >40% cheaper than commercial routers | model-routing-gateways-fallbacks | TRACED |
| Batch: all three providers exactly 50% / within 24 hours | batch-api-economics | TRACED |
| OpenAI batch: 50,000 requests / 200 MB; `completion_window: "24h"` only value; separate higher rate-limit pool | batch-api-economics | TRACED |
| Anthropic batch: 100,000 requests / 256 MB; most finish <1 h; results retained 29 days; errored/canceled/expired unbilled; expire unbilled at 24 h | batch-api-economics + cost-metering-attribution | TRACED |
| Google: 50% / 24 h SLO; Flex 50% / 1–15 min / sheddable; Caching up to 90% off input | batch-api-economics | TRACED |
| GPT-4o $2.50/$10.00; suite 800K/200K → $4.00 interactive / $2.00 batch | batch-api-economics | TRACED + DERIVED-OK |
| Sonnet 4.6 $3/$15 → $5.40 / $2.70 | batch-api-economics | TRACED + DERIVED-OK |
| 50-run matrix saves $100–$135/night | batch-api-economics + recomputed | TRACED + DERIVED-OK ($2.00×50; $2.70×50) |
| ~1,000 tokens (~4 KB)/request; matrix at ceilings — split across two jobs | recomputed (40M in-tokens ≈ 160 MB ≈ 40K requests ≈ 80% of both ceilings; hedged "roughly") | DERIVED-OK |
| Cache multipliers stack with batch (documented, Anthropic); 5-min write in batch = 1.25× batch base; read 0.1× | cost-metering-attribution | TRACED |
| Breaker FSM: Fowler / Azure / Resilience4j; count or rate windows | model-routing-gateways-fallbacks | TRACED |
| LiteLLM: 429 → immediate cooldown, 5-second default; >50%-of-minute failures → cooldown; 401/404/408 non-retryable cooldowns; `AllowedFailsPolicy` per class | circuit-breakers-llm-ops | TRACED |
| `allowed_fails: 3` / `cooldown_time: 30` "presented as example values, not defaults" | model-routing-gateways-fallbacks (values + the not-defaults caveat) | TRACED |
| Per-deployment cooldown (hashed `model_id`); single-instance never benched | circuit-breakers-llm-ops | TRACED |
| Portkey: attempts:5 on [429,500,502,503,504]; count/rate trips; `minimum_requests`; 30-s minimum cooldown; `failure_status_codes` default >500; all-open bypass | circuit-breakers-llm-ops | TRACED |
| Portkey 30 s = 6× LiteLLM 5 s | circuit-breakers-llm-ops | TRACED (digest derives it) |
| Real half-open probing rare; Portkey roadmap names it | circuit-breakers-llm-ops | TRACED |
| OpenAI cached reads 0.1× ("up to 90% off", GPT-5.6-and-later) | cost-metering-attribution | TRACED |
| Anthropic 0.1× / 1.25× / 2× (1-hour tier); Sonnet 4.6 $3.75 write / $0.30 read | cost-metering-attribution | TRACED |
| OpenAI `prompt_tokens` inclusive; Gemini `promptTokenCount` total + `cachedContentTokenCount` subset; Anthropic/Bedrock exclusive additive | cost-metering-attribution | TRACED |
| `reasoning_tokens` / `thoughtsTokenCount` bill at output rates, invisible in text | cost-metering-attribution | TRACED |
| LiteLLM `response_cost`; gpt-3.5-turbo 1.5e-06 / 2e-06 USD per token; `register_model`; local-map pin | cost-metering-attribution | TRACED |
| Langfuse: ingested `cost_details` beat inferred; exclusive normalization only if payload is OpenAI-schema-only; reasoning models need ingested counts; daily price audit | cost-metering-attribution | TRACED |
| OpenMeter: idempotent events keyed by `subject` → `meters` → `customers` | cost-metering-attribution | TRACED |
| Σ(bucket × rate × modifier) formula; daily reconciliation; drift-as-schema-change | cost-metering-attribution | TRACED |
| Worksheet prices: $3/$15; $1.50/$7.50 batch; 1.25×/0.1× stacking | batch-api-economics + cost-metering-attribution | TRACED |
| Fresh input row $15.00 / $7.50 | recomputed (500×10k = 5M tokens) | DERIVED-OK |
| Prefix row $45.00 / $22.50; batch+cache: one write ≈$0.003 (1500×$1.875/M), 9,999 reads ≈$2.25 (≈15M×$0.15/M) | recomputed | DERIVED-OK |
| Output row $60.00 / $30.00 | recomputed | DERIVED-OK |
| Totals $120.00 / $60.00 / ≈$39.75 | recomputed (39.7525) | DERIVED-OK |
| Perfect-hit interactive ≈$79.50 ($0.30/M reads, $3.75/M write, 0.1×/1.25× of $3 base) | recomputed (15+0.0056+4.4996+60 = 79.505) | DERIVED-OK |
| xychart interactive line [120, 111.90, 103.80, 95.70, 87.60, 79.50] | recomputed (15M×(3−2.7h) per h=0…1) | DERIVED-OK |
| xychart batch line [60, 55.95, 51.90, 47.85, 43.80, 39.75] | recomputed (15M×(1.5−1.35h) per h) | DERIVED-OK |
| Re-sent failed request ~$0.006 at batch rates; 5% → ~$3.00; full re-run $60.00 | recomputed (2,000×1.5e−6 + 400×7.5e−6 = 0.006; ×500 = 3.00) | DERIVED-OK |
| Errored/canceled unbilled (Anthropic) in failure-line discussion | cost-metering-attribution | TRACED |
| Checkpoint 2: (1/2²)/(1/8²) = 16:1 | recomputed | DERIVED-OK |
| Checkpoint 3: $50.00 interactive / $25.00 batch | recomputed | DERIVED-OK |
| Checkpoint 5: 1.25 × $1.50 = $1.875/M | recomputed | DERIVED-OK |
| "Lane beats the cache" ordering ($79.50 > $60.00) | recomputed | DERIVED-OK |
| Field note (breaker that never tripped) | marked operator anecdote | OK-BY-DESIGN |

## Arithmetic re-derivations (all recomputed independently)

- Queueing chart: 1/(1−0.30)=1.43→1.4 · 1/(1−0.50)=2.0 · 1/(1−0.70)=3.33→3.3 · 1/(1−0.80)=5.0 · 1/(1−0.90)=10.0 · 1/(1−0.95)=20.0 — all six points exact at the stated rounding.
- Tail law: 0.99¹⁰⁰ = e^(100·ln0.99) ≈ 0.366 → 63.4% (~63% ✓); 0.99¹⁰⁰⁰⁰ ≈ 2.2×10⁻⁴⁴ → "≥ 99.99999%" is a correct floor.
- Adaptive throttler checkpoints: 1.1×600=660 → 340/1001=33.97%≈34% ✓; 1.1×900=990 → 210/1201=17.49%≈17.5% ✓.
- Bedrock checkpoints: 2,000+500+16,000=18,500 ✓; 2,000+500+(800×10)=10,500 ✓; 36,000/9,000 worked example matches digest verbatim ✓.
- Worksheet: every cell recomputed (see table); totals 120.00 / 60.00 / 39.7525≈39.75 / 79.505≈79.50; both xychart series exact to the cent at 5% hit-rate steps.
- Failure lines: $0.006/request (2,000×$1.50/M + 400×$7.50/M) ✓; 5%×10,000×$0.006=$3.00 ✓; re-run = $60.00 ✓.
- OpenRouter/Checkpoint-2 weighting: (1/2²)÷(1/8²)=16 ✓; $1 vs $3 → 9 ✓.

## Findings

**P0: none. P1: none.**

1. **[P2] ch16 §16.2 — "no hosted provider publishes TTFT percentiles" is a stronger universal than the digest supports.** Digest (`tail-latency-fanout-amplification`) says: "No major provider publishes p99 TTFT/TPOT on a status page that this researcher could verify today," and ch12's version of this claim was deliberately scoped during the Gate-2 fix pass (iteration 38: "hosted providers … checked Anthropic and OpenAI docs"). ch16's echo re-flattens it. Fix (one phrase): "none of the major hosted providers publishes TTFT percentiles" or "(as chapter 12 scoped it: checked Anthropic and OpenAI)".
2. **[P2] ch15 §15.5 — the AIMD label sits on the wrong mechanism.** The sentence attaches "additive increase, multiplicative decrease (AIMD)" to the SRE adaptive throttler's rejection-probability decay; the digest describes that decay as "additive-up/additive-down." The multiplicative shape (halve on throttle, double on success) belongs to the AWS adaptive token bucket, which the chapter correctly describes two sentences later. Fix: drop "(AIMD)" from the SRE sentence (keep "decays on its own"), or move the AIMD tag to the AWS bucket clause.

Informational (no action; already logged): the Bedrock initial-deduction formula — chapter text follows the AWS worked example (input + cache-write + max_tokens); the digest's own formula bullet omits cache-write. This divergence was logged by the driver in iteration 41 with the instruction that future research refreshes must not re-import the digest's formula summary. The chapter is on the primary-source side.

## Totals

- Claims checked: **187** (ch15: 84 · ch16: 103)
- TRACED: 121 · DERIVED-OK (recomputed): 62 · TRACED + DERIVED-OK (both): 15 (counted once in TRACED) · OK-BY-DESIGN (marked anecdotes): 2
- Non-OK: **2** (both P2; zero P0, zero P1)
