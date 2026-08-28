# Study Kit — Chapter 13: Structured Output Is Not a Prompt Trick

*Companion to "Inference Engineering," Part III — The API contract. Use the flashcards first, take the quiz closed-book, then teach it back.*

## FLASHCARDS

- What problem does constrained decoding solve? :: Machines must read a model's answer, and merely asking for valid JSON fails often enough that retries become expensive — grammar machinery makes structural validity a guarantee by construction instead of a statistical hope.
- What is a logit? :: The raw score a model gives each vocabulary token at one decoding step, before the sampler turns it into a probability.
- What does the grammar mask actually do? :: It sets the score of every token the schema cannot accept to minus infinity before the draw, so an illegal token can never be sampled.
- Does the mask guarantee true content? :: No — it guarantees shape only; schema-valid nonsense is still nonsense, because spelling was never truth.
- Finite-state machine versus pushdown automaton? :: A finite-state machine remembers only its current state and handles simple rule sets, while JSON nests brackets and therefore needs an FSM plus a stack.
- What is compilation in this context? :: Turning your schema into mask tables once, before serving — building the guest list before the party, not at the door.
- Why did Outlines struggle at serving scale? :: Per-request compilation over a huge vocabulary made first tokens brutally late — the same workload waited about 38.5 seconds on average for its first token.
- How did XGrammar and llguidance fix the cost? :: They precompute which tokens are always or never legal, keep state on a persistent stack, and run grammar bookkeeping on the CPU overlapped with the GPU — bringing that same workload's first token to roughly 4.5 seconds.
- Why is "100% correct" not the whole benchmark story? :: Both the slow and fast backends were 100% correct — the difference was cost and latency, which is why correctness alone never settles an engine choice.
- What do the four providers' "structured outputs" actually promise? :: Four different contracts: full schema enforcement at generation time (OpenAI strict), a strict tool envelope (Anthropic), a silently-forgiving subset (Gemini), and box-only JSON mode (DeepSeek and OpenAI's json_object).
- What is Gemini's quiet failure mode? :: It silently ignores schema properties outside its supported subset — no error, no enforcement — so your local validator is the only component that will ever notice.
- What can no provider guarantee past a truncation cutoff? :: Content — max_tokens can stop generation mid-object, and the unclosed brace is a stopped generation, not a schema violation.
- Name the three taxes every schema pays. :: The compile toll at admission, the per-token masking toll at every decode step, and the luggage-and-punctuation toll — schema bytes in the prompt plus structural tokens in the output.
- What does a verbose schema cost on the invoice? :: One measured tool schema added about 389 input tokens to every request — descriptions are per-request freight the model largely ignores.
- Why is your schema the most cacheable content you own? :: It is byte-identical on every call by nature, so frozen-schema discipline turns fresh-input pricing into cached-read pricing after the first request.
- Where does the grammar tax concentrate? :: Reasoning-heavy steps are measurably taxed, while extraction and classification steps mostly are not — which is the whole design rule.
- Why does key order matter in schemas? :: Output keys arrive in schema order (emission order), so an answer field before a reasoning field forces the model to commit before it thinks.
- What is the repetition trap? :: When every legal continuation is one the model heavily disfavors, generation can loop valid tokens forever — the fix is loosening the grammar, not fighting the sampler.

## QUIZ

1. What makes grammar-constrained output valid "by construction" rather than statistical?
   - (a) The model was fine-tuned on JSON
   - (b) Illegal tokens are masked to −∞ before sampling, so a violating token can never be drawn
   - (c) A validator retries until the output parses
   - (d) The prompt includes a format example

2. Which provider silently ignores schema keywords outside its supported subset?
   - (a) OpenAI strict mode
   - (b) Anthropic strict tool use
   - (c) Gemini responseSchema
   - (d) None — all providers error loudly

3. Your guided endpoint shows flat 100% correctness but time-to-first-token is spiking. What is the signature?
   - (a) The model is degrading
   - (b) The compile toll — schema compilation or a cold grammar cache at admission
   - (c) Output truncation at max_tokens
   - (d) A too-strict local validator

4. Which failure can the grammar mask never prevent?
   - (a) Markdown fences around the payload
   - (b) A chatty preamble before the first brace
   - (c) Well-typed but wrong content
   - (d) Trailing commas

5. A 40-step agent task carries one 389-token tool schema on every request. How many input tokens does the schema alone cost before any content moves?
   - (a) 389
   - (b) 3,890
   - (c) 15,560
   - (d) 1,556

6. Identical GPT-3.5 Turbo outputs were graded 43.7% by a strict regex and 75.5% by an LLM-based parser. What was the gap and what created it?
   - (a) 31.8 points, created by validation strictness alone
   - (b) 21.8 points, created by JSON-mode truncation
   - (c) 43.7 points, created by the grammar mask
   - (d) 75.5 points, created by sampling temperature

7. Which habit keeps both the engine's grammar cache and the provider's prefix cache warm?
   - (a) Rich Field descriptions for every schema property
   - (b) A timestamp in the schema so each request is fresh
   - (c) Identical schema bytes, frozen at the top of the prompt, every call
   - (d) Reordering fields between calls to explore emission order

8. The chapter's design rule for agents is:
   - (a) Constrain everything, always
   - (b) Constrain the edges (extraction, classification), free the middle (reasoning)
   - (c) Free the edges, constrain the middle
   - (d) Never use grammars on instruction-tuned models

**Worked answers (arithmetic):**

- **Q5:** 40 steps × 389 tokens = **15,560 input tokens** before any content moves (the chapter's derived, illustrative loop arithmetic).
- **Q6:** 75.5 − 43.7 = **31.8 points** — a gap created purely by validation strictness, your-side grammar enforcement you didn't know you were running.

## TEACH-BACK

1. Explain the proctor-with-covered-keys picture to a friend who has never seen a language model — then tell them two ways the picture breaks (the cost of the proctor is invisible, and a perfectly filled form can still be wrong).
2. Walk a backend teammate through the four-couriers analogy and why "structured outputs" is one name hiding four legal contracts — including which courier quietly skips address lines and what that obliges your code to do.
3. Teach the "constrain the edges, free the middle" rule using the garden-irrigation picture, and defend it with the answer-before-reason evidence (100% of JSON-mode responses put answer first; the 38.15-point gap at a near-zero parse-error rate).
