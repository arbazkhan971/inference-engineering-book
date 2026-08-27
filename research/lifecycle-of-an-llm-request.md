# The end-to-end life of one LLM API request

researched: 2026-08-27 · researcher: glm-5.3-flash

## Key facts

- A TLS 1.2 connection consumes two round-trips between client and server
  before any HTTP request bytes can be transferred; TLS 1.3 needs one, and
  session resumption (0-RTT) lets the client send the request in its very
  first flight (Cloudflare TLS 1.3 overview blog, published 2017; retrieved
  2026-08-27).
- Streaming is negotiated with `"stream": true` and rides server-sent events
  (SSE). Anthropic's documented event sequence is `message_start` →
  `content_block_start` → `content_block_delta` (repeated) → `message_delta`
  → `message_stop`, with `ping` keepalives; deltas carry text, tool-use, and
  extended-thinking content (Anthropic streaming docs, retrieved
  2026-08-27).
- Iteration-level scheduling — the scheduler runs one model iteration on the
  batch, admitting and retiring requests between iterations — was proposed in
  Orca (OSDI 2022) and reported 36.9× throughput improvement over NVIDIA
  FasterTransformer at the same latency (the USENIX abstract page renders
  this as "36:9×"; USENIX OSDI'22 page, retrieved 2026-08-27).
- Prefill iterations saturate GPU compute because the whole prompt is
  processed in parallel; decode iterations have low compute utilization
  because each processes a single token per request. Sarathi-Serve's chunked
  prefills split a long prefill into near-equal chunks so new requests join
  the batch "without pausing ongoing decodes" (arXiv 2403.02310, published
  March 2024).
- Colocating prefill and decode in one engine pool causes "strong
  prefill-decoding interference"; applications emphasize per-phase latency —
  TTFT for prefill, TPOT for decode — which is why DistServe disaggregates
  the phases onto different GPUs (arXiv 2401.09670, published January 2024).
- The KV cache "grows and shrinks dynamically" per request and, when managed
  naively, loses large amounts of memory to fragmentation; PagedAttention's
  OS-style paging cut that waste to near zero and let vLLM improve throughput
  2–4× over FasterTransformer and Orca at equal latency (arXiv 2309.06180,
  published September 2023).
- vLLM's current documented feature set confirms this stack is now standard:
  continuous batching of incoming requests, chunked prefill, prefix caching
  (vLLM docs, retrieved 2026-08-27).
- Median queueing share of end-to-end latency at major providers: (no public
  number found as of 2026-08-27). Queue wait is load-dependent and
  provider-internal; papers above characterize the mechanism, not a stable
  ratio.

## How it works

Follow one `POST /v1/messages`-style chat completion from click to last
token:

1. **Serialize.** The SDK encodes model id, messages, tools, and
   `stream: true` as JSON. Any client-side token count is an estimate; the
   canonical count comes back in the response usage at the end.
2. **Network setup.** DNS, then a TCP three-way handshake (one round-trip by
   protocol definition), then TLS: one round-trip on TLS 1.3, two on TLS
   1.2, zero extra on resumption (Cloudflare, retrieved 2026-08-27). This is
   pure geography and protocol — nothing about the model yet. Absolute RTT
   milliseconds vary by route; no stable public figure exists.
3. **Edge and admission.** The provider terminates TLS at an edge, checks
   the API key, validates the request, and runs the rate-limit admission
   test. A rejected request never reaches an engine: it dies here with a 429
   before any GPU is involved.
4. **Routing.** A gateway maps the requested model id to a cluster that
   holds those weights, and forwards the request into that cluster's
   internal queue.
5. **Queue wait.** The request sits until the engine's scheduler admits it.
   How long depends entirely on load; providers do not publish queue-time
   distributions (hedge above). This is the hop most often mistaken for "the
   model is slow."
6. **Admission and prefill.** Under continuous batching (Orca's
   iteration-level scheduling, adopted by vLLM and documented in its current
   docs), the request joins the running batch between iterations. The engine
   then processes the whole prompt in one parallel pass — compute-bound —
   producing the first output token and filling the KV cache. Long prompts
   mean long first-token waits, which is why chunked prefill exists
   (Sarathi-Serve, 2024).
7. **Decode loop.** One forward pass per token, batched across all running
   requests. Each pass is memory-bandwidth-bound and emits one token per
   request; the KV cache grows by one entry per token, which is exactly the
   dynamic memory PagedAttention was built to manage (2023).
8. **Streaming back.** Each decoded token becomes an SSE event on the same
   TLS connection: Anthropic's documented sequence runs `message_start` at
   admission-ish time, repeated `content_block_delta` events as tokens
   arrive, `ping` keepalives during quiet stretches, and closing
   `message_delta`/`message_stop` events with final metadata (Anthropic
   docs, retrieved 2026-08-27).
9. **Completion.** The final events carry stop metadata; usage and billing
   are settled on the provider side. From the client's timestamps: TTFT =
   first delta minus request send; TPOT = inter-delta gaps; end-to-end =
   last delta minus send.

Failure paths split by layer: rejection (429) happens before the engine;
queueing pain happens before prefill; mid-stream stalls and disconnects
happen during decode. The client-visible symptom of all three is "slow" —
which is exactly why the hop map matters.

## Harness angle

Measure per-hop, not per-request. Reuse pooled TLS connections so you pay
the handshake once (a TLS 1.2 cold connection can burn two round-trips
before your prompt even leaves), always stream so TTFT is visible, and
timestamp first-chunk vs inter-chunk arrivals so you can tell queue wait
(first-chunk late) from decode slowness (gaps wide). Treat 429 as admission
control telling you the queue is full — schedule with client-side backoff
and jitter instead of hammering. When an agent's loop feels slow, the hop
map is the debugging checklist: network, admission, queue, prefill, decode.

## Sources

- https://blog.cloudflare.com/tls-1-3-overview-and-q-and-a/ — TLS 1.3 handshake round-trips
- https://www.usenix.org/conference/osdi22/presentation/yu — Orca iteration-level scheduling, 36.9×
- https://arxiv.org/abs/2403.02310 — Sarathi-Serve chunked prefill mechanics
- https://arxiv.org/abs/2401.09670 — DistServe TTFT/TPOT, prefill-decode interference
- https://arxiv.org/abs/2309.06180 — PagedAttention, KV cache fragmentation, 2–4× throughput
- https://docs.anthropic.com/en/docs/build-with-claude/streaming — SSE event sequence
- https://docs.vllm.ai/en/latest/ — continuous batching, chunked prefill, prefix caching in current docs
