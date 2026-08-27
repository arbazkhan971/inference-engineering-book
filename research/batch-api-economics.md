# Batch API Economics Across Providers: OpenAI, Anthropic, and Google (Dated Snapshot)
researched: 2026-08-27 · researcher: glm-5.3-flash

## Key facts
- All three major providers — OpenAI, Anthropic, and Google — offer asynchronous batch processing at exactly **50% off synchronous API prices**, with results promised **within 24 hours** (retrieved 2026-08-27). [OpenAI Batch API guide](https://developers.openai.com/api/docs/guides/batch); [Anthropic batch-processing docs](https://platform.claude.com/docs/en/build-with-claude/batch-processing); [Google Gemini Batch API docs](https://ai.google.dev/gemini-api/docs/batch-api)
- **OpenAI Batch API**: 50% cost discount, a separate pool of substantially higher rate limits, and a 24-hour completion window (`completion_window: "24h"` is currently the only supported value). Input is a JSONL file uploaded with purpose `batch`; the file can contain **up to 50,000 requests and be up to 200 MB** in size. (OpenAI API reference & docs, retrieved 2026-08-27) [Batches create reference](https://developers.openai.com/api/reference/resources/batches/methods/create)
- **Anthropic Message Batches API**: 50% discount on all token usage (input, output, and special tokens); batches limited to **100,000 requests or 256 MB**, whichever is reached first; maximum 24-hour processing window but **most batches finish in under 1 hour**; results retained 29 days after creation. Note: the task brief's "32 MB" figure is outdated — the current documented limit is 256 MB (Anthropic docs, retrieved 2026-08-27). [Batch processing docs](https://platform.claude.com/docs/en/build-with-claude/batch-processing)
- **Google Gemini Batch API**: 50% discount vs. the standard interactive API for the equivalent model; SLO of completion **within 24 hours**, "much quicker in the majority of cases" (Google AI docs, retrieved 2026-08-27). [Gemini Batch API](https://ai.google.dev/gemini-api/docs/batch-api); [Google Developers Blog announcement](https://developers.googleblog.com/scale-your-ai-workloads-batch-mode-gemini-api/)
- Google's own comparison table frames the tradeoff explicitly: Standard = full price / seconds latency; **Batch = 50% discount / up to 24 hours**; Flex = 50% discount / 1–15 min target but best-effort (sheddable); Caching = up to 90% discount on input (Google optimization docs, retrieved 2026-08-27). [Gemini optimization guide](https://ai.google.dev/gemini-api/docs/optimization)
- Dated model prices used for worked examples below: **GPT-4o** at $2.50/M input and $10.00/M output (batch price $1.25/M input shown on OpenAI's model page) (retrieved 2026-08-27) [OpenAI GPT-4o model page](https://developers.openai.com/api/docs/models/gpt-4o); **Claude Sonnet 4.6** at $3/M input and $15/M output standard, $1.50/M input and $7.50/M output batch (Anthropic pricing PDF & docs, retrieved 2026-08-27) [Anthropic pricing PDF](https://www-cdn.anthropic.com/files/4zrzovbb/website/5678bc2f5978e5bcd4f1fe7c14b2c72284dcf9f8.pdf)
- The discount applies per-token, not per-request: caching, tools, vision, and other Messages-API features are all supported inside batches at the same 50% rate (Anthropic docs, retrieved 2026-08-27).

## How it works
A batch API decouples *submitting* a request from *serving* it. Instead of holding a synchronous connection, your harness writes N requests to a JSONL file (OpenAI) or embeds them in a single POST payload (Anthropic, Google), and the provider schedules the work into idle capacity over the next hours. You poll or listen for job completion, then download the per-request results, each correlated by the custom ID you attached at submission. The provider wins because it can backfill cheap off-peak GPUs; you win a 50% discount and a separate, higher rate-limit pool. You pay with latency: a guaranteed answer in seconds becomes a promised answer within 24 hours.

**Worked example — a 1M-token eval suite (800K input, 200K output), interactive vs. batch:**

| Model (dated price) | Interactive | Batch (50%) | Savings |
|---|---|---|---|
| GPT-4o ($2.50/$10.00 per M) | 0.8×$2.50 + 0.2×$10.00 = **$4.00** | 0.8×$1.25 + 0.2×$5.00 = **$2.00** | $2.00 (50%) |
| Claude Sonnet 4.6 ($3/$15 per M) | 0.8×$3 + 0.2×$15 = **$5.40** | 0.8×$1.50 + 0.2×$7.50 = **$2.70** | $2.70 (50%) |

(Arithmetic derived from the dated list prices above; retrieved 2026-08-27.) Scale that to a nightly eval matrix of 50 runs and the harness saves $100–$135 per night for identical answers. If each eval request is small (~2 KB JSONL), 50,000 requests fit comfortably in OpenAI's 200 MB / 50,000-request batch limit, so a full eval matrix is often one batch job.

**When to use batch vs. interactive streaming:** batch fits evals and regression suites, dataset backfills, embedding regeneration, non-interactive summarization, and bulk classification — anywhere a 24-hour ceiling is acceptable. Interactive streaming stays mandatory for user-facing chat, agent loops that must read a tool result before deciding the next call, and any path with a human waiting. A useful heuristic: if the harness would retry rather than time out, it can batch.

## Harness angle
The harness's eval runner should default to the Batch API for nightly regression suites and backfills — wiring `run-evals --mode batch` into the CI schedule — while gating interactive streaming behind an explicit `--interactive` flag for debugging single failures. This one flag roughly halves the eval compute line item and moves large suites out of the interactive rate-limit pool that agents share.

## Sources
- OpenAI Batch API guide: https://developers.openai.com/api/docs/guides/batch
- OpenAI Batches API reference (50,000 requests / 200 MB / 24h): https://developers.openai.com/api/reference/resources/batches/methods/create
- OpenAI Batch API FAQ: https://help.openai.com/en/articles/9197833-batch-api-faq
- Anthropic batch-processing docs (100K requests / 256 MB / 50%): https://platform.claude.com/docs/en/build-with-claude/batch-processing
- Anthropic Message Batches announcement: https://claude.com/blog/message-batches-api
- Anthropic pricing PDF (Sonnet 4.6 standard vs. batch): https://www-cdn.anthropic.com/files/4zrzovbb/website/5678bc2f5978e5bcd4f1fe7c14b2c72284dcf9f8.pdf
- Google Gemini Batch API docs: https://ai.google.dev/gemini-api/docs/batch-api
- Google Gemini optimization/comparison table: https://ai.google.dev/gemini-api/docs/optimization
- Google Developers Blog — Batch Mode announcement: https://developers.googleblog.com/scale-your-ai-workloads-batch-mode-gemini-api/
- OpenAI GPT-4o model page (pricing): https://developers.openai.com/api/docs/models/gpt-4o
