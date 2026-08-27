# Timeout and cancellation semantics across LLM APIs and engines

researched: 2026-08-27 · researcher: glm-5.3-flash

## Key facts

- OpenAI SDKs default to a **10-minute** request timeout; the docs recommend raising it (e.g. to 15 min / `timeout=900.0`) for flex-tier or long-prompt requests, and OpenAI SDKs **automatically retry a `408 Request Timeout` twice** before raising. (OpenAI Flex processing guide, fetched 2026-08-27)
- The Anthropic Python SDK's `DEFAULT_TIMEOUT` is `httpx2.Timeout(timeout=10 * 60, connect=5.0)` — a **10-minute overall timeout with a 5-second connect timeout** — plus `DEFAULT_MAX_RETRIES = 2`, retry delay 0.5s growing to a cap of 8.0s. (anthropic-sdk-python `src/anthropic/_constants.py`, fetched 2026-08-27)
- Anthropic's docs state the SDKs **require streaming for large `max_tokens` values "to avoid HTTP timeouts"** — i.e. non-streaming requests on long generations can hit gateway/SDK timeouts even under the 10-minute default. (Anthropic streaming docs, fetched 2026-08-27)
- Anthropic SSE streams emit **`ping` events** interleaved with content deltas; these keep-alives keep idle proxies/clients from closing the connection while the model "thinks" between visible tokens. (Anthropic streaming docs, fetched 2026-08-27)
- Anthropic documents **capture-and-resume recovery** for streams interrupted by network issues or timeouts: save the partial response, then continue in a new request (assistant-continuation for Claude ≤4.5, user-message continuation for Claude ≥4.6). (Anthropic streaming docs, fetched 2026-08-27)
- vLLM aborts a request when it detects an HTTP client disconnect: **queued requests are cancelled before execution; running requests are interrupted, but abort takes effect only after the current engine step (forward pass) completes** — cancellation is step-granular, not token-granular. (vLLM forum/docs, fetched 2026-08-27)
- vLLM issue #10087 documents that with certain middleware configurations, **disconnects were not detected until output was produced** — disconnect detection depends on the engine actively polling `request.is_disconnected` while iterating output streams. (github.com/vllm-project/vllm issue 10087)
- Google's Gemini SDKs retry transient errors (429/5xx, timeouts) by default: the Python SDK retries **up to 4 times with ~1s initial and 60s max backoff delay**. (Gemini troubleshooting guide, updated 2026-07-27, fetched 2026-08-27)
- Neither OpenAI nor Anthropic publishes an explicit "you are/aren't billed for tokens generated before an abort" clause in current API docs (mid-2026 snapshot). OpenAI community threads report being **charged for backend-completed generations after an AbortController cancel** — community report, unverified, treat as approximate. (community.openai.com threads 720603, 719556)
- **Derived:** with a 10-minute SDK default and automatic retries of 408s, a naive client can hold a single logical request open up to ~30 minutes (3 attempts × 10 min) without noticing — a real budget and deadline hazard in agent loops.
- Provider-side hard request-duration limits for chat endpoints are not published as single numbers; they surface indirectly as 408/504/529 errors, so the only timeout you fully control is your own. (OpenAI/Anthropic error docs, mid-2026 snapshot)

## How it works

Cancellation in an LLM API is two conversations over one TCP connection: your client stops reading (or aborts), and the server has to *notice* the closed connection. With SSE streaming, the server notices quickly because it is constantly writing events; when a write fails or the framework's disconnect callback fires, engines like vLLM mark the request disconnected and stop scheduling it — but only at the next engine step boundary, so you keep paying GPU time for the remainder of one forward pass, and any tokens already computed are gone. Without streaming, the server has nothing to write until the end, so disconnect detection is much weaker and the backend may generate the full `max_tokens` anyway.

Billing follows generation, not delivery, in practice. A server that keeps generating after your abort produces tokens that show up in your usage; the safe mental model is: **aborting the client stops the bleeding only if the server honors the disconnect**, and the only guaranteed way to bound spend is to cap `max_tokens` and set your own deadline. That's why the 10-minute SDK defaults matter: they are generous enough that a wedged request sits there for minutes before the SDK gives up — and then possibly retries it.

Keep-alive is the other half of the story. Thinking models can go tens of seconds between visible deltas; providers bridge that with SSE `ping` events (Anthropic documents them explicitly) so intermediaries don't kill the stream as idle. But pings also mean "no data for a while" is *normal*, so a naive read-idle timeout on your side will false-trigger on exactly the long-thinking requests you care about — the timeout must be event-aware, not byte-idle-aware.

## Harness angle

Make harness timeouts phase-aware and percentile-sized: a short, tight budget on time-to-first-token (queue/preflight problems) and a long, throughput-derived budget on decode (tokens remaining ÷ observed p50 tokens/s × safety factor), with a wall-clock deadline propagated to every tool call and retried request — never a single flat "10 minutes" inherited from the SDK default. On user interrupt, close the SSE stream and let the engine's disconnect detection stop generation, and assume tokens generated up to the abort were billed.

## Sources

- https://developers.openai.com/api/docs/guides/flex-processing
- https://github.com/anthropics/anthropic-sdk-python/blob/main/src/anthropic/_constants.py
- https://platform.claude.com/docs/en/build-with-claude/streaming
- https://github.com/vllm-project/vllm/issues/10087
- https://github.com/vllm-project/vllm/issues/4240
- https://discuss.vllm.ai/t/how-is-vllm-handling-internal-queue-requests/2615
- https://ai.google.dev/gemini-api/docs/troubleshooting
- https://community.openai.com/t/cancel-the-openai-api-request-without-deducting-the-cost-from-the-balance/719556
