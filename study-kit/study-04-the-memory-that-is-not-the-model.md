# Study Kit — Chapter 4: The Memory That Is Not the Model

*Flashcards, quiz, and teach-backs for "The memory that is not the model."
Every fact below comes from the chapter text. Cover the answer side and go.*

## Flashcards

- The two memories inside an engine room :: Weights — the fixed, shared recipe — and the KV cache — per-conversation scratch state that grows while you talk and dies with the session.
- Why decoding is cheap at all :: Each token's key and value are computed once and kept on the desk; without that cache, every generated token would reprocess the whole conversation from scratch.
- What one token files into the cache :: A key (the claim ticket) and a value (the bag) for every KV head on every layer — and they never change once written.
- Where the cache lives and why :: In HBM, the scarcest and fastest memory in the building, because every layer of every decode step reads it.
- Llama 3.1 8B's per-token KV cost :: 2 × 32 layers × 8 KV heads × 128 head dim × 2 bytes = 128 KiB per token.
- What the leading 2 in the formula is for :: Key and value — the ticket and the bag both get stored, so the count doubles.
- What FP8 KV quantization does to the per-model table :: Halves every row exactly, by arithmetic — the quality question is separate and must be measured.
- Why the 70B model caches only ~2.5× the 8B's bytes despite ~9× the parameters :: Cache size follows layers × KV heads × head dimension — the note-taking architecture, not the amount of learned knowledge.
- What one 128k-token session costs on Llama 3.1 8B :: 128 KiB × 131,072 tokens = 16 GiB — one user's notes now equal the entire model's weights, on top of them.
- What a context window really is :: An admission limit on a memory product — seats in the building, not a statement about the model's attention span.
- Claimed versus effective context :: Claimed is the admission limit; effective is the longest input where measured task quality still holds — often far shorter (GPT-4: 128K claimed, ~32K effective on RULER).
- What the capacity equation divides :: Usable memory minus weights and workspace, divided by KV-per-token times context — that quotient is your concurrent sessions.
- Sessions at 32k context on one 80 GB H100 serving Llama 3.1 8B in BF16 :: (80 − 16 − ~4) GiB ÷ 4 GiB ≈ 15 sessions; FP8 KV doubles it to ~30.
- What a preemption looks like from the client side :: An unexplained multi-second stall mid-stream — the engine dropped the request's cache and re-prefilled it from scratch once space freed.
- The architects' ladder in one breath :: MHA files every head's notes; GQA shares note-takers (~8× smaller); MQA over-shares with a quality tax; MLA files one compressed latent (~60× smaller); sliding-window layers keep only the last W tokens.

## Quiz

1. What does the KV cache hold?
   a) The model's learned knowledge
   b) The raw conversation text
   c) Per-layer keys and values — derived working state for this conversation (✓)
   d) A compressed copy of the weights

2. Why can the engine reuse cached keys and values instead of recomputing them?
   a) Because they are refreshed every token
   b) Because a token's key and value never change once written (✓)
   c) Because they are stored as text
   d) Because the model re-reads the whole prompt anyway

3. A model card lists 40 layers, 8 KV heads, head dimension 128, BF16. What is the KV cost per token?
   a) 80 KiB
   b) 160 KiB (✓)
   c) 320 KiB
   d) 640 KiB

4. One 80 GB GPU serves Llama 3.1 8B in BF16 (16 GB weights, ~4 GiB workspace). Product wants 64k sessions (128 KiB/token). About how many concurrent sessions fit?
   a) ~15
   b) ~3
   c) ~7 (✓)
   d) ~30

5. Llama 3.1 70B has ~9× the parameters of the 8B but caches only ~2.5× the KV bytes. Why?
   a) Bigger models compress their notes at runtime
   b) Cache size is set by layers × KV heads × head dimension — architecture, not parameter count (✓)
   c) The 70B uses FP8 by default
   d) The 8B model keeps a duplicate copy

6. GPT-5 advertises a 400,000-token window with 128,000 reserved for output. A request arrives with 273k input tokens. What happens?
   a) It runs, with the last 1k tokens silently dropped
   b) It is rejected at admission — max input is 272k, checked before any forward pass (✓)
   c) The engine truncates the prompt to fit
   d) The window quietly doubles for this request

7. An engine's KV blocks run out mid-generation. What does vLLM's default RECOMPUTE path do?
   a) Errors out the request
   b) Drops the victim's cache, appends its generated tokens to the prompt, and re-prefills from scratch (✓)
   c) Streams from host RAM with no visible change
   d) Halves the context window for all requests

8. DeepSeek-V3's per-token KV cost sits below Llama 3.1 8B's despite being far larger. Which design is responsible?
   a) Sliding-window attention
   b) Grouped-query attention
   c) Multi-head latent attention — one compressed 576-number latent per token per layer (✓)
   d) Multi-query attention

### Worked answers (arithmetic questions)

- **Q3:** 2 × 40 × 8 × 128 × 2 bytes = 163,840 bytes = **160 KiB per token**. (The leading 2 is K and V; the trailing 2 is bytes per BF16 number.)
- **Q4:** one 64k session = 128 KiB × 65,536 = 8 GiB; usable = 80 − 16 − ~4 = ~60 GiB; 60 ÷ 8 = **~7 sessions**. (At 32k it would be ~15; FP8 KV doubles any of these.)

## Teach it back (Feynman checkpoints)

1. Teach the stenographer's desk to a friend: what the notes are, why they never change, and what would happen to generation cost if she had to re-read the whole transcript every sentence instead.
2. Explain to a product manager why "raise sessions to 128k" is a five-fold capacity cut, using only the coat-check picture and one division.
3. Describe the architects' ladder (MHA → GQA → MQA → MLA → sliding window) as hotel coat-check designs, and say which one a long-context agent product should shop for and why.
