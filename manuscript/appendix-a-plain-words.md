# Appendix A. Inference engineering in plain words

> **Appendices — the reference shelf.** The chapters taught each term where it earns its keep; this shelf holds them all in one place, still in plain words.

How to use this glossary: terms are grouped the way the book introduced them — the layer beneath the prompt, the engine's interior, the API contract, and the harness that meets the engine. Each entry names the chapter that owns the term's full treatment, so this works as a reverse index too. Within each section, entries sit under the chapter title that coined them. Acronyms are expanded in the entry itself. A handful of entries lean on chapter pictures; when one does, the chapter named beside it is the shortcut. When two chapters use one word differently (they do: "gateway," "prefix cache"), the entries say so plainly.

## A.1 The layer beneath the prompt (chapters 1–4)

### What inference engineering is

**Inference** — Running a trained model to produce output, token by token. *(Ch. 1)*

**Weights** — The trained model artifact itself: billions of fixed numbers, shared by every user. *(Ch. 1, 3, 4)*

**Serving** — Everything between your HTTP request and the model's math. *(Ch. 1)*

**Serving engine** — The software managing batching, memory, and decode loops; the machinery this book is about. *(Ch. 1)*

**Harness** — Your code around the model: prompts, loops, retries, context, tools. The thing Volume I taught you to build; the thing this book teaches to drive well. *(Ch. 1)*

**Gateway** — A front door that owns auth, quotas, and routing. Used loosely in chapter 1 for the provider's door; used precisely in chapter 16 for the proxy *you* put in front of every provider. *(Ch. 1, 16)*

**Prefill** — Processing your prompt into memory before answering. *(Ch. 1, 7)*

**Decode** — Generating the answer, one token per step. *(Ch. 1, 7)*

**Batch** — Multiple requests computed together in one pass. *(Ch. 1, 5)*

**429 / 529** — The provider's two rejections: "you're over quota" versus "we're overloaded." *(Ch. 1, 15)*

### The shape of a token

**Token** — The chunk of text the model reads or writes in one step. *(Ch. 1, 2)*

**Tokenizer** — The table that converts your text into those chunks. *(Ch. 2)*

**Vocabulary** — The learned list of legal chunks, tens to hundreds of thousands of entries. *(Ch. 2)*

**BPE (byte-pair encoding)** — The recipe that builds a vocabulary by merging frequent pairs of text characters (a *byte* is one of the raw digital characters a computer stores). *(Ch. 2)*

**Pre-tokenizer** — The pattern pass that decides chunk boundaries before merging. *(Ch. 2)*

**Autoregressive** — Each token is generated from all tokens before it; generation is serial by construction. *(Ch. 2)*

**Decode step** — One pass of the model that emits exactly one token. *(Ch. 2)*

**TTFT (time to first token)** — How long until output starts. *(Ch. 1–3)*

**ITL (inter-token latency)** — One gap between two streamed tokens. *(Ch. 2)*

**TPOT (time per output token)** — The average gap for a whole reply. *(Ch. 2, 3)*

**End-to-end latency** — Wall clock from send to last token. *(Ch. 2)*

**Decode-time inequality** — e2e ≈ TTFT + N × TPOT (e2e = end-to-end time; N = the reply's token count): the whole latency budget in one line. *(Ch. 2)*

### The arithmetic of waiting

**FLOP / FLOPS** — One arithmetic operation / operations per second. *(Ch. 3)*

**Compute-bound** — The math units are the bottleneck. *(Ch. 3)*

**Bandwidth-bound** — The delivery of data is the bottleneck; single-stream decoding lives here. *(Ch. 3)*

**Memory bandwidth** — Bytes per second the chip can fetch. *(Ch. 3)*

**GPU (graphics processing unit)** — The specialist chip AI runs on: thousands of tiny calculators working in parallel. *(Ch. 1, 3)*

**HBM (high-bandwidth memory)** — The GPU's pantry: GB-scale, TB/s-speed. *(Ch. 3)*

**Arithmetic intensity** — Arithmetic operations per byte moved; the ratio that decides which bottleneck is yours — the thinking or the fetching. *(Ch. 3)*

**Roofline** — The chart of "how fast can this kernel go": a rising bandwidth line meeting a flat compute ceiling. *(Ch. 3)*

**Ridge point** — The intensity where those two ceilings meet; peak arithmetic divided by peak bytes per second — the tipping point where fetching stops being the limit and thinking becomes it. *(Ch. 3)*

**GEMM (general matrix-matrix multiply) / GEMV (general matrix-vector multiply)** — Big matrix multiply (many tokens' rows at once) versus matrix-times-one-vector (the single-request case); a *matrix* is a grid of numbers, a *vector* one column of them. *(Ch. 3)*

**Batch size** — How many requests share one pass over the weights; the dial that moves decode along the roofline. *(Ch. 3, 5)*

**Memory hierarchy** — Registers → SRAM → HBM → RAM → disk, each tier slower but bigger. *(Ch. 3)*

### The memory that is not the model

**KV (key–value) cache** — The per-conversation memory of every token seen so far; the memory that is not the model. *(Ch. 1, 4)*

**Attention** — The model's lookup step: each new token queries earlier tokens. *(Ch. 4)*

**Key (K) / Value (V)** — The two vectors a token files for later lookups: the claim ticket and the bag itself. *(Ch. 4)*

**Layer** — One stacked block of the model; each files its own K/V notes. *(Ch. 4)*

**KV head** — One of the parallel note-takers per layer. *(Ch. 4)*

**Head dimension** — Width of each note a head files. *(Ch. 4)*

**GQA (grouped-query attention)** — Heads share note-takers; the standard cache-shrinking trick. *(Ch. 4)*

**MLA (multi-head latent attention)** — File compressed summaries instead of full notes. *(Ch. 4)*

**Sliding window** — Layers that only remember the most recent W tokens. *(Ch. 4)*

**Context window** — The maximum tokens a request may carry; a memory product, not a model gift. *(Ch. 4, 11)*

**Claimed vs. effective context** — What the provider advertises versus where quality still holds. *(Ch. 4, 11)*

## A.2 Inside the engine (chapters 5–11)

### Batches: the engine's trick

**Iteration** — One engine step: one decode token for every running request. *(Ch. 5)*

**Scheduler** — The code that decides who is in the batch each iteration. *(Ch. 5)*

**Slot** — A request's seat in the current batch. *(Ch. 5)*

**Static batching** — Form a batch, run it until everyone finishes; the wasteful default. *(Ch. 5)*

**Dynamic batching** — Wait to form a batch until enough riders arrive. *(Ch. 5)*

**Continuous batching** — Re-plan the batch every iteration; riders hop on and off. *(Ch. 5)*

**Straggler** — The request that keeps generating after everyone else finished. *(Ch. 5)*

**EOS (end of sequence)** — The model's "I'm done" token. *(Ch. 5)*

**Throughput** — Total completions per second, however late they arrive; the number goodput exists to correct. *(Ch. 1, 5)*

**Goodput** — Completions per second that actually met your latency bounds; served *on time*, not just served. *(Ch. 5)*

### Paging the brain

**Block (page)** — The fixed-size chunk the KV cache is cut into — 16 tokens by default in vLLM. *(Ch. 6)*

**Block table** — The per-request list mapping "my Nth chunk" to a physical slot. *(Ch. 6)*

**Logical vs. physical** — Where a chunk sits in the conversation versus where it sits in memory. *(Ch. 6)*

**Internal fragmentation** — Space reserved inside a chunk but never filled. *(Ch. 6)*

**External fragmentation** — Free memory broken into pieces too small to use. *(Ch. 6)*

**Duplication** — Identical prompt prefixes cached once per request; the waste paging fixes. *(Ch. 6)*

**Copy-on-write** — Shared chunks stay shared until one owner diverges. *(Ch. 6)*

**Prefix** — The leading run of tokens a request starts with. *(Ch. 6)*

**Prefix caching (engine-side)** — Reusing stored KV for a prefix seen before: an index lookup inside the serving engine (hash chain in vLLM, radix tree in SGLang). Distinct from the *provider-billed* prompt caching of chapter 14, though both exploit the same reuse. *(Ch. 6, 14)*

**Radix tree** — A tree that stores shared prefixes once. *(Ch. 6)*

**Hash chain** — Block identity built on the previous block's identity; one changed block invalidates every descendant. *(Ch. 6)*

**Cache hit / miss** — A prefix found versus not found in the cache. *(Ch. 6)*

**Eviction (LRU)** — Freeing the least recently used blocks under memory pressure. *(Ch. 6)*

**Block size** — Tokens per block; the dial that sizes all of the above. *(Ch. 6)*

### Prefill, decode, and the great divorce

**Prefill bubble** — The stall every running decode suffers while a long prefill occupies the batch. *(Ch. 7)*

**Interference** — Prefill and decode degrading each other by sharing one queue. *(Ch. 7)*

**Chunk** — A fixed-size slice of a long prompt's prefill (not chapter 12's stream chunk — a different sense of the word). *(Ch. 7)*

**Chunk budget** — Tokens of prefill allowed per engine iteration. *(Ch. 7)*

**Piggybacking** — Running prefill chunks alongside, never instead of, decodes. *(Ch. 7)*

**Colocation** — Prefill and decode on the same chips, one scheduler. *(Ch. 7)*

**Colocation tax** — The goodput you lose to interference. *(Ch. 7)*

**Disaggregation (P/D separation)** — Prefill pool and decode pool on separate hardware. *(Ch. 7)*

**KV transfer** — Shipping a finished prompt's cache from the prefill pool to the decode pool. *(Ch. 7)*

**Early rejection** — Admission control that refuses requests predicted to miss their SLO (service level objective). *(Ch. 7)*

### Guessing at the speed of light

**Speculative decoding** — Guess several tokens cheaply, have the real model check them in one pass. *(Ch. 8)*

**Drafter** — The cheap thing that guesses: small model, extra heads, or string matching. *(Ch. 8)*

**Target model** — The real model whose outputs you actually want. *(Ch. 8)*

**Draft length γ** — How many tokens the drafter guesses per round. *(Ch. 8)*

**Verify pass** — One target forward pass that scores all guesses at once. *(Ch. 8)*

**Acceptance rate α** — The probability a guessed token survives verification. *(Ch. 8)*

**Acceptance length τ** — Mean tokens of forward progress per verify pass. *(Ch. 8)*

**Rejection sampling** — The correction rule that makes guessing distribution-safe: the output is always a legal sample from the target. *(Ch. 8)*

**Draft tree** — Verifying many candidate continuations in a single pass. *(Ch. 8)*

**Prompt lookup (n-gram)** — A drafter that copies phrases found in the prompt itself. *(Ch. 8)*

**Self-speculation** — The model (or its own hidden layers) drafting for itself. *(Ch. 8)*

### Smaller numbers, faster engines

**Quantization** — Store each number with fewer bits than it was trained with. *(Ch. 9)*

**Precision / bit-width** — How many distinct values one number can take. *(Ch. 9)*

**FP16 / BF16** — The two-byte formats models are trained and shipped in. *(Ch. 9)*

**FP8 / INT8** — One byte per number, float or integer. *(Ch. 9)*

**INT4** — Half a byte: sixteen levels per number. *(Ch. 9)*

**Weights vs. activations** — The model's stored parameters versus the numbers flowing through during a pass. *(Ch. 9)*

**Weight-only quant (W4A16)** — Shrink the stored parameters; keep the arithmetic at full precision. *(Ch. 9)*

**W8A8** — Shrink parameters and arithmetic both to one byte. *(Ch. 9)*

**Calibration** — Study a few hundred real inputs before deciding how to round. *(Ch. 9)*

**Salient channels** — The small minority of numbers that carry disproportionate signal; protected during quantization. *(Ch. 9)*

**KV quantization** — Shrink the attention cache, not the model. *(Ch. 9)*

**Recovery** — Quantized benchmark score as a fraction of the original. *(Ch. 9)*

**Perplexity** — How surprised a model is by held-out text; lower is better. *(Ch. 9)*

**Variant / tier** — Same model name, different serving recipe underneath. *(Ch. 9)*

### One model, many chips

**Sharding / parallelism** — Spreading one model's work across many chips. *(Ch. 10)*

**TP (tensor parallelism)** — Split each layer's learned numbers (its weight matrices) into slices, one slice per chip. *(Ch. 10)*

**PP (pipeline parallelism)** — Split the layers into consecutive stages, one stage per chip group. *(Ch. 10)*

**Stage / microbatch** — One PP chunk of layers / one small batch fed to keep all stages busy. *(Ch. 10)*

**Bubble** — Idle stage time while a lone request crawls the pipeline. *(Ch. 10)*

**DP (data parallelism)** — Copy the whole sharded model; each copy serves a different slice of traffic. *(Ch. 10)*

**CP (context parallelism)** — Split one long sequence across chips; introduced as a sharding axis here, owned as a long-context product in chapter 11. *(Ch. 10, 11)*

**EP (expert parallelism)** — Spread the model's many experts across chips; each token travels to its experts. *(Ch. 10)*

**MoE (mixture-of-experts)** — Many expert sub-networks; each token uses a few. *(Ch. 10)*

**Expert / router** — One expert feed-forward block / the tiny network picking which experts. *(Ch. 10)*

**Total vs. active parameters** — Capacity you must store versus parameters each token actually runs. *(Ch. 10)*

**Shared expert** — The always-on expert every token uses alongside its routed picks. *(Ch. 10)*

**All-to-all** — Every chip exchanging slices with every other chip; MoE's dispatch and return traffic. *(Ch. 10)*

**Capacity factor / token drop** — Per-expert seating limit; overflow tokens silently skip the expert. *(Ch. 10)*

**Grouped GEMM** — One combined math job per expert, covering every token sent to it. *(Ch. 10)*

### Long context is a memory product

**ISL (input sequence length)** — Token count of what you send in. *(Ch. 11)*

**KVSL (KV-cache sequence length)** — Token count of everything the model has seen so far this request: your prompt plus every generated token. *(Ch. 11)*

**Tiered pricing** — Input price jumps when the prompt crosses a length boundary. *(Ch. 11)*

**Ring Attention** — KV blocks circulate chip to chip so every query sees all of them. *(Ch. 11)*

**Pass-KV / pass-Q** — Which cargo circulates in context parallelism: the stored notes (keys and values), or the new questions (queries). *(Ch. 11)*

**Lost in the middle** — Facts mid-context are retrieved worse than facts at the ends. *(Ch. 11)*

**Compaction** — Replacing old turns with a model-written summary; the tradeoff chapter 11 prices and chapter 17 times. *(Ch. 11, 17)*

**Cache invalidation** — Any change to history breaks the provider's cached-prefix match from the first differing byte. *(Ch. 11, 14)*

**Core memory** — A small always-in-context block kept verbatim, never summarized. *(Ch. 11, 17)*

**Append-only layout** — History grows by additions, never rewrites. *(Ch. 11, 17)*

## A.3 The API contract (chapters 12–16)

### The streaming contract

**Streaming** — The server sends output as it is produced, on a connection held open. *(Ch. 12)*

**SSE (server-sent events)** — A standard way for a server to push text events over one HTTP response; the default transport for completions. *(Ch. 12)*

**Event** — One labeled block of the stream, separated by a blank line. *(Ch. 12)*

**Delta** — An incremental fragment: a few characters or tokens, not the whole text. *(Ch. 12)*

**Chunk** — One provider-encoded event carrying one or more deltas (not chapter 7's prefill chunk — a different sense of the word). *(Ch. 12)*

**Sentinel** — A literal end-of-stream marker, like `data: [DONE]`. *(Ch. 12)*

**Finish reason / stop reason** — The provider's exit code for why generation ended. *(Ch. 12)*

**Keep-alive (ping)** — A tiny event sent during silence so intermediaries don't kill the connection; also a cheap request whose only job is to refresh a cache TTL (chapter 14). *(Ch. 12, 14)*

**WebSocket** — A two-way persistent connection, unlike SSE's one-way stream; the realtime-API transport. *(Ch. 12)*

**Normalizer** — One harness component that translates every provider's stream into one internal shape. *(Ch. 12, 18)*

**Usage** — The provider's own token accounting, delivered on the stream. *(Ch. 12)*

**Tool-call accumulator** — The buffer that reassembles fragmented tool arguments into one JSON (JavaScript Object Notation) object. *(Ch. 12)*

### Structured output is not a prompt trick

**Structured output** — Output whose *shape* is guaranteed to match a declared schema. *(Ch. 13)*

**Schema (JSON Schema)** — A machine-readable description of allowed shapes: fields, types, nesting. *(Ch. 13)*

**Grammar** — Any formal rule set the output must satisfy: schema, regex, or EBNF (extended Backus–Naur form). *(Ch. 13)*

**Constrained / guided decoding** — Engine-side enforcement of a grammar during generation. *(Ch. 13)*

**Logit mask** — Setting forbidden tokens' raw preference scores (their *logits* — the score a model gives a vocabulary token at one decoding step) to negative infinity before the next token is chosen. *(Ch. 13)*

**FSM (finite-state machine)** — The rule computer for simple grammars; remembers only its current state. *(Ch. 13)*

**Pushdown automaton** — An FSM plus a stack; needed once brackets nest. *(Ch. 13)*

**Compilation** — Turning your schema into mask tables once, before serving. *(Ch. 13)*

**Token trie** — A prefix tree (a lookup tree branching once per word piece) mapping grammar rules to the vocabulary's internal numbering (*token ids*). *(Ch. 13)*

**JSON mode** — Provider mode guaranteeing parseable JSON, any shape. *(Ch. 13)*

**Strict mode** — Provider mode enforcing *your* schema at generation time. *(Ch. 13)*

**Guarantee tier** — How strong a given provider's structured-output promise actually is. *(Ch. 13, 16)*

**Chain of thought (CoT)** — The model's visible reasoning tokens before an answer; what tight schemas can suppress. *(Ch. 13)*

### The cache that pays your bill

**Prompt prefix** — Everything from the request's first token up to some boundary. *(Ch. 14)*

**Cache write** — The first request that computes and stores a prefix's state; at the quota meter it counts as fresh input. *(Ch. 14, 15)*

**Cache read (hit)** — A later request that reuses stored state instead of recomputing; often uncounted at the quota meter. *(Ch. 14, 15)*

**Cache miss / invalidation** — The first differing byte ends reuse for everything after it. *(Ch. 14)*

**Breakpoint** — An explicit marker saying "cache up to here." *(Ch. 14)*

**TTL (time to live)** — How long a stored prefix survives, and when that clock resets. *(Ch. 14, 17)*

**Write premium / read discount** — The extra price to create a cache entry; the reduced price to reuse it. *(Ch. 14)*

**Implicit caching** — The provider caches automatically; you change nothing. *(Ch. 14)*

**Explicit caching** — You mark the boundaries and pay listed prices. *(Ch. 14)*

**Minimum cacheable length** — Prefixes shorter than this never enter the cache. *(Ch. 14)*

**Hit rate** — The share of input tokens served from cache. *(Ch. 14)*

**Cache salt** — A value mixed into the identity the provider fingerprints your prefix into, to keep different customers' cached entries apart. *(Ch. 6, 14)*

### Rate limits are physics

**Rate limit / quota** — A ceiling on how much you may send, per time window. *(Ch. 15)*

**RPM / TPM / RPD** — Requests per minute, tokens per minute, or requests per day: the quota ceilings. *(Ch. 15)*

**ITPM / OTPM** — Input / output tokens per minute, metered separately. *(Ch. 15)*

**Token bucket** — A tank that refills continuously; each request drains it. *(Ch. 15)*

**Burndown rate** — A multiplier a provider applies to one kind of token when counting quota. *(Ch. 15)*

**Retry-After** — A response header telling you the minimum seconds to wait. *(Ch. 15)*

**Backoff** — Waiting longer after each failed attempt. *(Ch. 15)*

**Jitter** — Randomizing your wait so a fleet doesn't move in lockstep. *(Ch. 15)*

**Retry budget** — A cap on retries as a share of all requests. *(Ch. 15)*

**Adaptive throttling** — Rejecting some calls locally, based on recent successes. *(Ch. 15)*

### Routing, fallbacks, and the money meter

**Deployment** — One concrete servable copy of a model at one provider. *(Ch. 16)*

**Alias** — A stable name your code calls, mapped to one or more real deployments. *(Ch. 16)*

**Fallback chain** — An ordered list: if the first model group exhausts its retries, try the next. *(Ch. 16)*

**Cooldown** — A timed bench for a misbehaving deployment. *(Ch. 16)*

**Circuit breaker** — A per-target failure memory: fail fast instead of timing out into a corpse. *(Ch. 16)*

**Complexity router** — A classifier that sends easy prompts to cheap models, hard ones to strong models. *(Ch. 16)*

**Batch API** — Submit N requests as one job; half price at the three largest providers, served within 24 hours (mid-2026 snapshot). *(Ch. 16)*

**Usage object** — The token accounting a provider attaches to each response; the meter's raw material. *(Ch. 12, 16)*

**Price map** — A table of per-model token prices your meter multiplies against. *(Ch. 16)*

**Cost attribution** — Labeling every request with task, agent, and feature so the bill explains itself. *(Ch. 16)*

**Fanout** — One step that fires N model calls in parallel and reduces the results. *(Ch. 15, 16)*

## A.4 Harness meets engine (chapters 17–18)

**Stable prefix** — The bytes at the head of every request that never change. *(Ch. 17)*

**Layered prompt** — The fixed render order: tools, then system, then context, then transcript, then volatile tail. *(Ch. 17)*

**Append-only transcript** — History that only ever grows at the end. *(Ch. 17)*

**Cold resume** — Re-entering a session whose cached state has expired. *(Ch. 17)*

**Cache rehydration** — Rebuilding cached state after a gap, usually by replaying the transcript verbatim. *(Ch. 17)*

**Byte-exact replay** — Resuming with the identical bytes you left with, never re-formatted. *(Ch. 17)*

**Core memory / state file** — Small always-in-context block holding what must survive verbatim. *(Ch. 17)*

**Spawn template** — A frozen, versioned preamble shared by every subagent of a type. *(Ch. 17)*

**Shared preamble** — The byte-identical head of a subagent fleet's prompts, cache-breakpointed. *(Ch. 17)*

**Fork** — A branch that replays the parent transcript, then diverges. *(Ch. 17)*

**`prompt_cache_key`** — A routing hint that keeps related requests on cache-holding machines. *(Ch. 14, 17)*

**Inference shim** — A thin client-side layer between your agent and every model endpoint; tinyengine's formal name. *(Ch. 18)*

**Meter** — The component that turns usage fields into priced, attributed events. *(Ch. 18)*

**Rate scheduler** — The component that holds work locally until quota and pacing allow. *(Ch. 18)*

**Router** — The component that picks an endpoint, watches breakers, and walks fallback chains. *(Ch. 18)*

**Session store** — The component that renders each turn's prompt from a byte-exact session archive. *(Ch. 18)*

**GGUF (GPT-Generated Unified Format)** — The single-file model container llama.cpp reads: weights, tokenizer, metadata. *(Ch. 18)*

**Quant ladder** — The menu of numeric formats a GGUF can hold, from F16 to 1-bit experiments. *(Ch. 18)*

**Unified memory** — Apple Silicon's one pool shared by CPU and GPU. *(Ch. 18)*

**Local endpoint** — An inference server on hardware you control, speaking an API. *(Ch. 18)*

**Utilization** — The fraction of time your own engine is actually serving. *(Ch. 18)*

**Crossover point** — The workload size where owning beats renting. *(Ch. 18)*

---

*Every term above is defined in prose at first use in the chapter that owns it; the chapter's own "Words before machinery" table adds the everyday picture. Appendix E collects the primary sources behind the chapters' numbers.*
