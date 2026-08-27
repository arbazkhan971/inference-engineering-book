# Anatomy of a provider completion API

researched: 2026-08-27 · researcher: glm-5.3-flash

## Key facts

- Every major provider ships a token-level HTTP contract: you send a message
  list and parameters, you get back (a) generated content, (b) a `usage`
  object with exact token counts, and (c) a stop/finish reason. The three
  dominant surface contracts as of 2026-08-27: OpenAI Chat Completions and
  the newer Responses API, Anthropic Messages API, Google Gemini
  `generateContent` (all verified against official docs and SDK types,
  retrieved 2026-08-27).
- OpenAI Chat Completions streams over Server-Sent Events (SSE): `data:`
  lines each carrying one JSON chunk, terminated by a literal `data: [DONE]`
  sentinel (openai-python `_streaming.py`, retrieved 2026-08-27). Each
  chunk's `choices[].delta` carries a fragment of `content` or
  `tool_calls` entries keyed by `index` with partial `function.arguments`
  strings; `finish_reason` is one of `stop`, `length`, `tool_calls`,
  `content_filter`, `function_call`
  (`chat_completion_chunk.py`, retrieved 2026-08-27).
- OpenAI `usage` (Chat Completions): `prompt_tokens`,
  `completion_tokens`, `total_tokens`, plus `prompt_tokens_details`
  (`cached_tokens`, and a newer `cache_write_tokens` field,
  `audio_tokens`, `image_tokens`, `text_tokens`) and
  `completion_tokens_details` (`reasoning_tokens`, `text_tokens`,
  `audio_tokens`) (`completion_usage.py`, retrieved 2026-08-27). The
  Responses API renames these to `input_tokens`/`output_tokens` with the
  same detail objects (`response_usage.py`, retrieved 2026-08-27).
- OpenAI request `service_tier` selects a pricing/speed lane: standard,
  Flex (50% cheaper, latency-tolerant), Batch (50% cheaper, 24-hour
  turnaround, separate rate-limit pool — Batch API guide, retrieved
  2026-08-27), and Fast mode, renamed from Priority processing on
  2026-07-30; both `"priority"` and `"fast"` are accepted (pricing page,
  retrieved 2026-08-27).
- Anthropic Messages streams a strict event sequence over SSE:
  `message_start` (carries message id, model, initial `usage` with
  `input_tokens`) → `content_block_start` → repeated `content_block_delta`
  (`text_delta` for text, `input_json_delta` for tool arguments) →
  `content_block_stop` → `message_delta` (final `stop_reason` plus
  cumulative `usage.output_tokens`) → `message_stop`, with `ping` and
  `error` events possible at any point (streaming docs, retrieved
  2026-08-27).
- Anthropic `stop_reason` values: `end_turn`, `max_tokens`,
  `stop_sequence`, `tool_use`, `pause_turn`, `refusal`,
  `model_context_window_exceeded`. `pause_turn` means the provider paused
  a long-running turn and you may send the partial response back as-is to
  continue (Messages API reference, retrieved 2026-08-27). In streaming,
  `stop_reason` is null in `message_start` and non-null afterwards.
- Anthropic `usage` carries the cache ledger directly:
  `input_tokens`, `output_tokens`, `cache_creation_input_tokens`,
  `cache_read_input_tokens`, and a `cache_creation` breakdown into
  `ephemeral_5m_input_tokens` / `ephemeral_1h_input_tokens`; the response
  reports `service_tier` as `standard`, `priority`, or `batch` (Messages
  API reference, retrieved 2026-08-27).
- Gemini streams via `models.streamGenerateContent` with `?alt=sse`,
  emitting `GenerateContentResponse` chunks (Gemini API reference,
  retrieved 2026-08-27). `usageMetadata` fields: `promptTokenCount`,
  `candidatesTokenCount`, `totalTokenCount`, `cachedContentTokenCount`,
  `thoughtsTokenCount`, `toolUsePromptTokenCount`;
  `promptTokenCount` includes tokens served from cache. `finishReason`
  enum: `STOP`, `MAX_TOKENS`, `SAFETY`, `RECITATION`, `LANGUAGE`,
  `OTHER`, `BLOCKLIST` (same reference, retrieved 2026-08-27).
- Convergence/drift: DeepSeek exposes BOTH an OpenAI-format base URL and
  an Anthropic-format one (`https://api.deepseek.com/anthropic`), and
  supports OpenAI's Responses API, tool calls, and JSON output — the
  OpenAI shapes have become de facto interchange formats (DeepSeek docs,
  retrieved 2026-08-27). Anthropic offers a fine-grained tool streaming
  beta that streams tool inputs "without server-side JSON buffering"
  (tool-use docs, retrieved 2026-08-27). Contracts drift silently:
  OpenAI added cache-write token fields alongside cached-token fields;
  Anthropic's Claude 4.7+ tokenizer produces ~30% more tokens for the
  same text, changing every usage number without any API change
  (pricing docs, retrieved 2026-08-27).

## How it works

A completion request is a POST with a JSON body: an ordered message array
(role + content), generation parameters (`max_tokens`, `temperature`,
`stop` sequences), a `stream` flag, and a `tools` array of JSON-schema'd
function definitions. The provider validates, bills the prompt tokens,
runs prefill, then streams decode output.

With `stream: true`, the HTTP response stays open and the body becomes an
SSE stream. The three grammars differ structurally. OpenAI sends only
`data:` lines; each line is a full JSON chunk whose `delta` is a fragment;
the client concatenates `content` fragments, and for tool calls assembles
argument-string fragments per `tool_calls[].index` until a chunk arrives
with `finish_reason: "tool_calls"`. The stream ends with `data: [DONE]`.

Anthropic's stream is a typed event log, not fragments of one object: the
`message_start` event carries the message shell and initial usage;
content arrives inside numbered content blocks (`content_block_start`
announces a block and its type — `text` or `tool_use` with an id and
function name); `content_block_delta` events then carry `text_delta` or
partial-JSON `input_json_delta` fragments; `content_block_stop` closes
each block. The final `message_delta` carries the terminal `stop_reason`
and cumulative output tokens. A client normalizer keys state on block
`index`.

Gemini's `streamGenerateContent?alt=sse` yields complete
`GenerateContentResponse` chunks, each containing candidate parts
(`text`, `functionCall`); a function call arrives as a whole
`functionCall` object within one chunk — no argument-delta format is
documented as of 2026-08-27 (hedged: verified absence in the API
reference, not an architectural guarantee).

In every contract the `usage` object is the billing interface: token
counts per category (input, cached input, cache writes, output including
reasoning/thinking tokens). Providers bill from their own server-side
counts; client-side token estimates are approximations for budgeting,
never for reconciliation.

Stop reasons are the provider's exit codes: normal completion vs
length cut vs tool handoff vs safety interruption vs (Anthropic-only)
`pause_turn` resumption. Mapping them to harness behavior is the
difference between a loop that resumes cleanly and one that drops or
duplicates turns.

## Harness angle

Write exactly one streaming normalizer per provider grammar, keyed on
these event names, and reduce all three to one internal event type
(`text_delta`, `tool_call_delta(index,id,args)`, `usage`,
`stop_reason`). Treat `usage` as the only source of truth for cost
metering, and build the stop-reason state machine now: `pause_turn` →
re-send partial turn as-is; `length`/`max_tokens` → flag truncation;
`tool_calls`/`tool_use` → flush assembled arguments into the executor.
Tokenizers and usage fields change without version bumps — subscribe to
provider changelogs and assert on usage invariants in tests.

## Sources

- https://platform.claude.com/docs/en/build-with-claude/streaming.md — Anthropic SSE event grammar
- https://platform.claude.com/docs/en/api/messages/create.md — Messages schema, stop_reason, usage fields
- https://platform.claude.com/docs/en/agents-and-tools/tool-use/fine-grained-tool-streaming.md — unbuffered tool-arg streaming
- https://raw.githubusercontent.com/openai/openai-python/main/src/openai/types/chat/chat_completion_chunk.py — chunk/delta/finish shapes
- https://raw.githubusercontent.com/openai/openai-python/main/src/openai/types/completion_usage.py — Chat Completions usage fields
- https://raw.githubusercontent.com/openai/openai-python/main/src/openai/types/responses/response_usage.py — Responses usage fields
- https://developers.openai.com/api/docs/guides/streaming-responses.md — Responses streaming events
- https://developers.openai.com/api/docs/guides/batch.md — Batch API semantics, 50% discount
- https://ai.google.dev/api/generate-content — Gemini generateContent/streamGenerateContent, usageMetadata, finishReason
- https://api-docs.deepseek.com/quick_start/pricing — dual OpenAI/Anthropic-format endpoints, feature matrix
