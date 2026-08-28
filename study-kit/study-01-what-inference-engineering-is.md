# Study Kit — Chapter 1: What inference engineering is

*Flashcards, quiz, and teach-back prompts for Part I, Chapter 1. Every fact comes from the chapter; nothing new is claimed.*

## Flashcards

- What three machines work together every time you send a prompt to an AI? :: The model (the trained knowledge), the serving layer (the machinery that delivers it), and your harness (your code that decides what to send and how to handle replies).
- In the restaurant picture, what is the kitchen? :: The serving layer — everything between your request and the model's math: ovens, staff, and the order-ticket rail.
- In the restaurant picture, who is the waiter? :: Your harness — the code that writes the ticket, sends it in, and deals with what comes back.
- What does "inference" mean in plain words? :: Running a trained model to produce output, token by token — a chef cooking from a recipe they already know.
- What is a token, in everyday terms? :: The chopped-up word-piece the model reads and writes — like arcade coins: the machine only takes tokens, never dollars.
- What is the KV cache in the kitchen picture? :: The kitchen's running copy of your order ticket so far — the per-request memory of everything already read and written.
- What does TTFT stand for, in plain words? :: Time to first token — how long from ordering until the first plate lands.
- What does a 429 rejection mean? :: "You're over quota" — you've ordered too fast for the door policy.
- How is a 529 different from a 429? :: 529 means "we're overloaded" — the kitchen is slammed, not you specifically.
- What is the ownership test? :: Ask "which single change makes this failure impossible?" — a better model fixes the model layer, more capacity fixes serving, a change to your own code fixes the harness.
- Which way can failures flow between the layers? :: Only one way: harness choices can induce serving and model failures, but the serving layer cannot change what the weights know.
- What did the vLLM/PagedAttention paper show about fixing memory waste? :: Fixing KV-cache fragmentation and duplication lifted throughput 2–4× at equal latency, with no change to the model or the prompt.
- What is prefill, in plain words? :: Reading your whole order back to the kitchen before cooking starts — the prompt is processed in one parallel pass.
- Why is "the model is slow, let's swap models" usually the wrong first move? :: It is the most disruptive lever you own and the least likely to fix a serving problem — teams churn through migrations while their retry loop quadruples the load.
- What does Google's SRE book say unbounded retries do during overload? :: With a 3-attempt budget, retried volume can grow to just under 3× the original load, turning a partial outage into a total one.
- Why can two providers serve the exact same weights at very different speeds? :: They are different kitchens: hardware, precision, batching policy, and margin decide speed and cost — not the recipe.
- What is the book's durable equation? :: Agent economics = what the model knows × what the engine extracts × what the harness wastes.
- What does the `usage` object in an API response give you, and why does it matter? :: The provider's exact server-side token counts — the billing truth that your client-side estimates can never replace.

## Quiz

**1. Which failure belongs to the model layer?**
- a) 529 overloaded errors
- b) Wrong-but-confident answers (✓)
- c) Retry storms during an incident
- d) Cache never hitting despite repeated prompts

**2. Your request fails instantly with a 429 that carries no `retry-after`. Where did it die?**
- a) At admission — before any GPU was consulted (✓)
- b) Mid-decode, between tokens
- c) In the scheduler's queue
- d) Inside the model's math

**3. An 8B-parameter model ships roughly 16 GB of weights in BF16, and an H100 offers 3.35 TB/s of memory bandwidth. What single-stream decode ceiling follows?**
- a) About 2,080 tokens/s
- b) About 208 tokens/s (✓)
- c) About 20.8 tokens/s
- d) About 46 tokens/s

**4. With a 3-attempt retry budget and no retry-ratio cap, roughly how large can retried volume grow during an overload?**
- a) 1.1× the original load
- b) Exactly 2× the original load
- c) Just under 3× the original load (✓)
- d) 10× the original load

**5. The first token arrives late, but the stream afterwards is smooth. Where does the delay most likely live?**
- a) In decode
- b) In network, admission, queue, or prefill (✓)
- c) In the model's knowledge
- d) In billing settlement

**6. Two providers serve the same open weights; one is 3× faster and 2× more expensive. Which should serve your overnight evaluation batch?**
- a) The faster one — batches need speed
- b) The faster one — quality is higher
- c) The cheaper, slower one (✓)
- d) Neither — the weights are secretly different

**7. What can the serving layer never do?**
- a) Queue your request
- b) Change what the weights know (✓)
- c) Abort your stream mid-reply
- d) Enforce your quota

**8. Why is a per-hop tracer the first instrument tinyengine builds?**
- a) Because prompts need templates
- b) Because "slow" is one client-side symptom with at least five different owners (✓)
- c) Because providers require it
- d) Because token counts drift

### Worked answers (arithmetic questions)

**Q3.** One decode step must stream the whole model once: 16 GB ÷ 3.35 TB/s = 16 ÷ 3,350 s ≈ 0.0048 s ≈ 4.8 ms per token. Inverting: 1,000 ms ÷ 4.8 ms ≈ **208 tokens/s**. The memory bus set the number; FLOPs never entered the calculation. (b)

**Q4.** Three attempts means the original call plus up to two retries: just under 3× total load. The same source caps the damage: hold each client to a 10% retry ratio and worst-case growth drops to 1.1×. (c)

## Teach-back prompts

1. Explain the three layers to a friend using your **own** everyday picture — not the restaurant — and say which layer owns a "the reply arrived but it's nonsense" failure, and why no number of retries can fix it.
2. Teach the ownership test — "which single change makes this failure impossible?" — by walking one real failure from your own work past all three layers before naming its owner and its fix.
3. Explain why "the model" is not a controlled variable across providers: what actually differs between two vendors serving identical weights, and what must you re-do when you switch?
