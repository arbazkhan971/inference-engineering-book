# Study Kit — Chapter 12: The streaming contract

## FLASHCARDS

- Why is streaming the default mode for agents, not a UI nicety? :: Agent turns are short and first-token-dominated, a non-streaming request gives no progress signal to hang a deadline on, and cancellation barely works without it.
- What is Server-Sent Events (SSE)? :: A plain HTTP response that never ends until the server closes it, pushing labeled data blocks — a fax machine that keeps printing pages.
- What is the difference between a delta and a chunk? :: A delta is an incremental fragment of content (a slice of the loaf); a chunk is the provider-encoded event that carries one or more deltas (the bag the postcard ships in).
- Why can a naive SSE parser crash on a perfectly legal event? :: The spec allows events with only meta-fields (`id:` or `retry:`) and no `data:` at all, so decoding "nothing" as JSON throws — skip payload-less events.
- How do the four grammars end a stream? :: OpenAI Chat uses a `finish_reason` plus the literal sentinel `data: [DONE]`; the Responses API uses a typed `response.completed`; Anthropic uses `stop_reason` in `message_delta`; Gemini puts `finishReason` on the last chunk — no sentinel.
- Why must your finish-reason table have an unknown-value fallback? :: Providers emit values you have not seen — GLM once sent `finish_reason: "network_error"` mid-stream and crashed a proxy's own assembler — so map unknowns to an internal value and log, never throw.
- How do streamed tool-call arguments arrive? :: As string fragments you buffer per call slot and parse exactly once — at the finish event (`finish_reason: "tool_calls"`, `content_block_stop`, or the `done` event).
- Why is per-chunk parsing forbidden? :: Fragment boundaries can split keys, values, escape sequences, even the bytes of one multi-byte character — the only safe object boundary is the finish.
- A tool call finishes with `arguments: ""`. What do you do? :: Coerce the empty string to `{}` (no parameters) and execute the call — throwing here is a design error, not a bug.
- What do you do with malformed JSON at the finish line? :: Treat it as an expected failure and feed the parse error back to the model as a retry-with-error tool result — never an exception that kills the loop mid-turn.
- What are the two timeout clocks a harness needs? :: A tight first-chunk budget (p99 TTFT plus one backoff's margin) for queue/prefill trouble, and a long decode budget (tokens remaining ÷ observed p50 tokens/s × safety factor) for the generation itself.
- Why does a byte-idle stall detector never fire on a reasoning model that has stopped producing text? :: Providers bridge thinking silence with keep-alive `ping` events, so bytes keep flowing while content doesn't — only content deltas should reset the stall clock.
- How granular is cancellation? :: Step-granular, not token-granular: an engine aborts a running request only after the current forward pass, and non-streaming servers may barely notice your disconnect at all.
- Who pays when a stream is aborted? :: Billing follows generation, not delivery — tokens the server produced are tokens you used, so cap `max_tokens` and your own deadline rather than trusting the abort.
- What is the stream normalizer? :: The mailroom: one component that swallows all four provider grammars and emits four events (`text_delta`, `tool_call_delta`, `usage`, `stop_reason`) plus two finish-time markers, so nothing provider-shaped reaches your agent loop.
- Why is the usage event called the billing interface? :: It carries the provider's own token accounting per turn — where a cache-hit collapse or a compaction cliff shows up as a spike in fresh input — and it is where you assert invariants like total = prompt + completion.
- What is the TTFT trap on reasoning models? :: Time to first token can mean time to first *reasoning* token — your dashboard may report excellent TTFT while users stared at a spinner — so pick which delta starts your clock and name the metric explicitly.

## QUIZ

1. The chapter gives three reasons streaming is the default for agents. Which is NOT one of them?
   - a) Agent turns are short and TTFT-dominated
   - b) Non-streaming requests are timeout traps with no progress signal
   - c) Streaming reduces total token cost (✓)
   - d) Cancellation barely works without it

2. The OpenAI Python SDK's streaming layer once crashed with a JSON decode error. What spec-legal event caused it?
   - a) A `ping` event
   - b) A meta-only event carrying `id:`/`retry:` with no `data:` payload (✓)
   - c) An out-of-order content delta
   - d) The `data: [DONE]` sentinel

3. *(arithmetic)* A logical request hangs ~30 minutes despite a "10-minute timeout." Reconstruct why.
   - a) The server queued it behind three other requests
   - b) 10-minute default × 3 attempts (initial + two automatic retries of the 408) = ~30 minutes (✓)
   - c) A proxy multiplied the timeout by three
   - d) Retries doubled each time: 10 + 20 minutes

   *Worked:* Mid-2026 OpenAI SDK defaults: 10-minute request timeout, with a `408 Request Timeout` automatically retried twice — one logical request can span 3 × 10 min ≈ 30 minutes before your code sees an error.

4. Your accumulator receives `{"ci` / `ty": "Por` / `tland"}` across three chunks. When are you allowed to call the JSON parser?
   - a) After the first chunk, to validate early
   - b) After each chunk, keeping the best parse
   - c) Exactly once, at the finish event — yielding `{"city": "Portland"}` (✓)
   - d) Never; tool arguments must go to the model unparsed

5. A no-argument tool call streams `arguments: ""`. The correct behavior is:
   - a) Throw a validation error to the agent loop
   - b) Retry the request with a fresh call id
   - c) Coerce `""` to `{}` and execute the call (✓)
   - d) Treat it as a malformed call and feed back an error

6. Nightly agents hang ~30 minutes and die at the "stalled stream" line, though pings arrive every few seconds. What was the fix?
   - a) Increase the byte-idle timeout to 40 minutes
   - b) Reset the stall timer only on content deltas, letting a long content gap abort (✓)
   - c) Disable keep-alives at the provider
   - d) Switch to non-streaming requests

7. Where should the provider's token accounting (usage) be consumed, and why?
   - a) In the agent loop, parsing each provider's format directly for maximum fidelity
   - b) In the normalizer's usage event, reduced to one internal ledger — because cache collapse and compaction cliffs surface in those fields, and field drift should break CI, not your invoice (✓)
   - c) Nowhere; client-side token estimates are authoritative
   - d) Only on the dashboard, once per session

8. *(arithmetic)* With TTFT 0.4 s and TPOT 25 ms, when does the user have something to read for a 200-token output — streaming vs not?
   - a) 0.4 s vs 0.4 s — streaming changes nothing for the user
   - b) 0.4 s vs 5.4 s — streaming holds perceived wait at TTFT while non-streaming pays TTFT + N × TPOT (✓)
   - c) 5.4 s vs 0.4 s — streaming is slower because of per-chunk overhead
   - d) 0.4 s vs 2.9 s — non-streaming pays only half the decode time

   *Worked:* Streaming: user has text at TTFT = 0.4 s, then reading pace. Not streaming: 0.4 s + (200 − 1) × 0.025 s ≈ 0.4 + 5.0 = 5.4 s before the first character. Same end-to-end time; different starting line.

## TEACH-BACK (Feynman)

1. **Sell the anchor swap.** Explain to a product manager, with your own analogy, why streaming does not make the request any faster end-to-end yet changes what users experience — and why TTFT is therefore the product metric.
2. **The bookshelf rule.** Teach why you never open a parcel early, using your own example of something delivered in pieces — and walk through the three edge cases the accumulator must survive: the empty box, several orders arriving together, and one damaged box at the door.
3. **Listen to the right channel.** Explain to a new teammate why the stall detector counts content deltas instead of bytes, what the two timeout clocks are for, and what each clock firing tells you about the engine.
