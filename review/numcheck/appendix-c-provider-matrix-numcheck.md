# Numcheck — appendix-c-provider-matrix + appendix-d-tinyengine-companion (post-fix)

checked: 2026-08-28 · checker: glm-5.3-flash (worker, sequential numcheck chain)
Method: every numeric claim extracted from both appendices, traced to its dated
digest in research/, derived arithmetic recomputed. Appendix D claims verified
against the shipped companion code (wc -l + reading) and the test suite, since
its ground truth is the code, not the corpus.

## Appendix C — claim → digest → verdict

| Claim (site) | Digest | Verdict |
|---|---|---|
| OpenAI prices: sol $4/$20, $8/$30 long; terra $2/$12, $4/$18; luna $0.20/$1.20, $0.40/$1.80; 5.5 $5/$30, $10/$45 long; 5.1/5 $1.25/$10; mini/nano $0.25/$0.05, $2/$0.40; legacy 4.1/4o/4o-mini in/out | token-pricing-anatomy L10-18 | TRACED |
| Promo holds ≥2026-11-21 (sol) | token-pricing-anatomy L33 | TRACED |
| gpt-5 cached $0.125 = 10%; 4.1 25%, 4o 50% | token-pricing-anatomy L19-21 | TRACED |
| Opus 5 (and 4.5–4.8) $5/$25; Sonnet 5 $2/$10 (rise to $3/$15 on 2026-09-01 cancelled); Sonnet 4.6/4.5 $3/$15; Haiku 4.5 $1/$5; Fable/Mythos $10/$50 | token-pricing-anatomy L34-38 | TRACED |
| Claude 4.6+ 1M at standard price; Fast 2×; inference_geo 1.1×; 4.7+ tokenizer ~30% more tokens | token-pricing-anatomy L44-49 | TRACED |
| Gemini 2.5 Pro $1.25/$10, cached $0.125, >200K $2.50/$15, cached $0.25 above; 2.5 Flash $0.30/$2.50, read $0.03, storage $1.00/1M/hr; Flash-Lite $0.10/$0.40; 3.x flagship $2/$12, cached $0.20, >200K $4/$18; output includes thinking | token-pricing-anatomy L51-59, prompt-caching-provider-semantics L12 | TRACED |
| DeepSeek v4-flash miss $0.22/$0.44, out $0.66/$1.32; v4-pro $0.66/$1.32, out $1.98/$3.96; off-peak exactly half; caps 2,500/500 | token-pricing-anatomy L60-65 | TRACED |
| DeepSeek hit ≈2–3% of miss; snapshots disagree $0.0028 vs $0.007 | token-pricing L61 (hit $0.007/miss $0.22 = 3.2%); cache-hit-math L8 + prompt-caching L14 ($0.0028 vs $0.14 = 2.0%) | TRACED (both endpoints documented; 3.2% rounds to the "3" end of the range) |
| Output priced 3–8× input | token-pricing L77-79 | TRACED |
| Fast/priority lanes: OpenAI 1.7–2.5×, Gemini priority 1.8×, Anthropic fast 2× barred from Batch; Flex 50%; regional +10% models ≥2026-03-05 | token-pricing L23-33 | TRACED |
| Cache: min prefixes 512 (Opus 5) / 1,024 (Sonnet 4.5+/5) / 4,096 (Haiku 4.5) | prompt-caching-provider-semantics L6 | TRACED |
| OpenAI min 1,024 visible (5.6+) / 2,048 older; write 1.25× via `cache_write_tokens`; read 0.1× (older 25–50%); TTL ≥30m; >~15 req/min overflow-routes; `prompt_cache_key` | prompt-caching L9-11, token-pricing L19-21 | TRACED |
| Anthropic write 1.25× (5m) / 2× (1h), read 0.1×; TTL refreshed free on read, clock from request start; 4 breakpoints max; 20-block lookback; 1h must precede 5m | token-pricing L40-43; prompt-caching L5, L8 | TRACED |
| Gemini min 2,048 (2.5) / 4,096 (3.x); implicit no-guarantee; explicit default 1h; storage $4.50 Pro / $1.00 2.5 Flash / $0.50 3 Flash-tier | prompt-caching L12-13 | TRACED |
| Break-even: one read repays 1.25×, two repay 2× | token-pricing L41-42 (docs' own words) | TRACED |
| OpenAI metrics RPM/TPM/RPD/IPM; org+project; 3.5M shared family pool; reservation max(max_tokens, char-estimate); unsuccessful count; tier 1 500 RPM/500K TPM (5.4/5.6 family) | rate-limit-quota-architectures L8-10, L27 | TRACED |
| Anthropic ITPM = input + writes; cache reads exempt (Haiku 3.5 exception); OTPM actual output; 1,000 RPM / 2M ITPM / 400K OTPM (Opus 5/Sonnet 5/Haiku 4.5); token bucket, 60 RPM ≈ 1 rps | rate-limit L12-14, L28, L14 | TRACED |
| Bedrock: input + cache-write + max_tokens up front, re-credited; burndown 15× Claude 4.8, 10× Sonnet 5/Opus 5/GPT-5.6, 5× Claude ≤4.7, 1:1 most; cache reads never counted; worked example 36,000 booked → 9,000 final | rate-limit L19-21, L32 | TRACED (worked example is the anchor; initial reservation formula matches it exactly) |
| Gemini per-project, midnight Pacific reset, spend-based limits; free 2.5 Pro ≈5 RPM/100 RPD; paid ~150–300 RPM third-party (hedged) | rate-limit L17-18 | TRACED |
| Anthropic spend caps Start $500 / Build $1,000 / Scale $200,000; spend-cap 429s carry no Retry-After; OpenAI insufficient_quota | rate-limit L15; 429-529-retry-behavior L5-7 | TRACED |
| OpenAI monthly limits "(July 2026)" | — | **UNTRACEABLE** (see P2-1) |
| Structured output: 5,000 properties, 10 nesting levels, 120K schema chars, 1,000 enums; unsupported keywords error; all fields required (null unions); key order = emission order, first-in-required = folklore hedged; 100% vs <40% (vendor 2024 eval) | provider-structured-output-apis L5-8, L13 | TRACED (100%/40% correctly labeled vendor's own eval) |
| Streaming: SSE/`data: [DONE]`/finish_reason per choice; Responses typed events + item_id; Anthropic ordered event log, toolu_ ids; Gemini alt=sse, step.start; Live PCM 16 kHz in / 24 kHz out, ~10-min resets; network_error mid-stream exists | streaming-transports-normalization L11-12; tool-call-delta-streaming L6-14 | TRACED |
| Batch: 50% ×3; OpenAI 24h-only, 50,000 req / 200 MB; Anthropic 100,000 / 256 MB, most <1 h, results 29 days; Google 24h SLO; Flex 1–15 min sheddable | batch-api-economics L5-9 | TRACED |
| Context: GPT-5 400K / 272K in / 128K out; 5.5/5.4 ≥272K = 2× in / 1.5× out; Claude 4.6+ 1M standard; Gemini 3.1 Pro 1,048,576 / 65,536; >200K 2×/1.5×; Scout 10M claim; Qwen 1M ≈ 998K in / 65.5K out | context-window-claims L10-13 | TRACED (997,952 → "~998K"; 65,536 → "65.5K") |
| RULER: 4×–beyond-100× gaps; Yi-34B 200K vs 16K; GPT-4-1106 128K vs 32K | context-window-claims L6-7, L23 | TRACED |
| Scout spread 8.3× (Groq 446.7 / DeepInfra 53.5; Bedrock 172.0; Vertex 152.8); price 2.7× $0.12–$0.33; fastest ≠ lowest-TTFT (0.57 s vs 0.75 s) | same-model-different-providers L6-8 | TRACED |
| R1 0528: 6.1× speed (Vertex 154.8 / DeepInfra 25.6); 6.1× price ($0.56–$3.40) | same-model L9 | TRACED |
| gpt-oss-120b ~3,000 Cerebras vs 500 Groq = 6× | provider-latency-snapshot-2026 L6 | TRACED |
| FP8 near-lossless across Llama-3.1 family (500K+ evaluations); 18–23% faster/cheaper on B200/B300 | same-model L12 (arXiv 2411.02355), L13+L24 (SemiAnalysis) | TRACED |
| INT4 2.7× faster than BF16, ~8 points HumanEval, single-H100 Qwen3-32B | same-model L14 (AIMultiple) | TRACED |
| H100 ≈ $2.39–2.49/hr (checked 2026-08-02, RunPod/Lambda, corroborated Apr 2026); A100 $1.49–2.49; 4090 ~$1.49; disaggregated APIs $0.02–$2.85/1M; mid-tier $0.60/1M | local-edge-inference L13-14, L22 | TRACED |

## Appendix D — claim → code/corpus → verdict

| Claim | Ground truth | Verdict |
|---|---|---|
| Module table: 20/193/141/127/133/114 = 728 shipped vs ~720 tilded sum | `wc -l` of the six modules = 20+193+141+127+133+114 = 728; estimates 10+150+130+120+150+160 = 720 | TRACED (exact) |
| D.2 tracer listing = shipped tracer.ts | tracer.ts read side-by-side: listing is the shipped function byte-identical (type block summarized above it) | TRACED |
| $0.645 vs $3.00 worked example (100K prefix, $3/M, ten turns) | tests/smoke.ts:151-158 asserts 0.645 to 1e-9 | TRACED |
| `breakEvenReads` implements N ≥ (w−1)/(1−r); 1.25×/0.1× → 1 read; 2× → 2 | cache-ledger.ts:101-102 | TRACED |
| Burst trap: 60/min bucket refuses the 61st token of a second-one burst, 59 admitted instantly | tests/smoke.ts:230 (`tryAcquire(59, 0)` true; suite covers the 61st refusal) | TRACED |
| LiteLLM 5-second breaker default | circuit-breakers-llm-ops L5-6 | TRACED |
| 3-attempt cap bounds amplification at 3×; ~10% retry budget | 429-529-retry-behavior L26 (attempt cap 2–4, budget ~10%) + rate-scheduler.ts shipped code | TRACED |
| Four `node:` built-ins; zero npm deps | env.d.ts shims crypto/assert/fs/process; package.json has no runtime deps (typescript devDep only) | TRACED |
| ex-011 deliberate failure in fixtures | fixtures/golden-results.jsonl carries ex-011 (1 hit) | TRACED |
| Three CLIs "about 370 lines with shared plumbing, fixtures included" | Actual CLI code: 114+84+124+44 = 366 ≈ 370 ✓; but fixtures add 130 further lines | **DERIVED-OK with wording nit** (P2-2) |

## Findings (non-OK)

- **[P2-1] C.4, Spend caps paragraph — untraceable date.** Current text: "OpenAI enforces monthly limits (July 2026) with `insufficient_quota` 429s". The corpus documents OpenAI spend/usage limits and the `insufficient_quota` 429 (429-529-retry-behavior L7, retrieved 2026-08-27) but contains no "(July 2026)" dating anywhere. Fix: drop the parenthetical or re-date to "(retrieved 2026-08-27)" — a snapshot appendix cannot carry a date no digest supports. One-line fix; no downstream references.
- **[P2-2] D.8 — "fixtures included" misleads the line count.** Current text: "(about 370 lines with shared plumbing, fixtures included)". Actual: 366 CLI lines (matches ~370) with fixtures adding 130 more — so "fixtures included" is false under either reading. Fix: "(about 370 lines including the shared plumbing; fixtures live beside them)" or state 366. Cosmetic, but Appendix D's contract is exact counts (its own table is exact), so the phrase should not blur them.

No P0s. No P1s. Both P2s are one-phrase mechanical fixes.

## Verdict

**PASS with 2 P2 nits** — every load-bearing constant in both appendices traces to a dated digest or to the shipped code itself; all derived arithmetic (break-evens, spreads, worked examples, line counts) recomputes exactly. The provider matrix is honest about its own two snapshot disagreements (DeepSeek hit pricing) and hedges where its digests hedge (paid-Gemini RPM, first-in-required folklore, vendor-eval labeling).
