# Study Kit — Chapter 18: Your own engine room

*Pair with manuscript/18-your-own-engine-room.md. Facts below come from that chapter only.*

## Flashcards

- What is tinyengine, in one sentence? :: Roughly seven hundred lines of TypeScript — tracer, normalizer, ledger, scheduler, router, session store — sitting between your agent loop and every model endpoint it calls.
- What is the skill this chapter teaches, according to its own warning? :: Composition — nobody pays you to implement PagedAttention; they pay you to make six vendor APIs, two schedulers, and a billing spreadsheet behave like one engine.
- Why does each instrument own exactly one dial? :: So the machine is debuggable at 3 a.m. — latency degrades, you read the tracer; the bill jumps, you read the ledger; every failure has exactly one instrument that can see it.
- Where does policy live in the assembly, and why? :: In dated configuration files, never hard-coded — so a repricing shows up as a config-diff event your meter can see instead of a quiet bill surprise.
- What are the three names of the local stack, and what does each mean? :: llama.cpp is the runtime, GGUF is the single-file model container it reads, and Ollama is the packaging that gives you an OpenAI-compatible local endpoint.
- What is the modern default rung of the quant ladder, and why? :: Q4_K_M — it sits near the knee of the size/quality curve, per the llama.cpp project's own tables.
- What law sets your single-stream decode ceiling at home, and how do you apply it? :: Decode is bandwidth-bound — every token re-reads essentially the whole model — so divide your chip's memory bandwidth by the model's size in bytes.
- What contracts change in your favor with a local engine? :: Prefix caching is yours with no TTL, no shredder, and no write premium, and no quota exists — the rate limit is the machine itself.
- What does the routing table call the local-vs-hosted decision? :: Exactly what it is — the first routing decision, not a different religion: route by sensitivity and volume, computed from dated arithmetic.
- Name the four reasons owning an engine survives the arithmetic. :: Sustained utilization, privacy and compliance, offline and edge operation, and data gravity.
- What do you take on when you own the engine? :: You become the provider — your pager, capacity, deploys, quant re-evaluations, and goodput management; you gain the right to break the engine yourself.
- What does the ship checklist's cadence look like? :: Run the whole list before every launch, lines 5/10/12/13 nightly, and lines 1/2/7/11 quarterly — ship, night, quarter, three speeds.
- What is the manifesto's claim about the three layers? :: You own the contract, not the engine — the model is rented, the engine is the provider's craft, and the waste term is entirely yours.
- Why does the chapter end by telling you to instrument everything? :: The book's failure modes are all quiet — silent cache misses, silent variant swaps, breakers that never trip — and quiet failures need loud instruments.
- What is the Monday-morning assignment the book closes with? :: Wrap one real call with three timestamps, read one bill against the usage fields, and hash one prompt template with a breakpoint — the whole book in an afternoon.

## Quiz

1. The request path through tinyengine, in order, is:
   - (a) router → scheduler → assembler → endpoint → normalizer → ledger → session store (✓)
   - (b) scheduler → normalizer → router → ledger → endpoint → assembler
   - (c) ledger → router → endpoint → assembler → session store → tracer
   - (d) assembler → router → endpoint → tracer → scheduler → ledger

2. The chapter insists the assembly is:
   - (a) a framework you install and configure
   - (b) a pattern you implement, with no algorithm fancier than a token bucket and a table lookup (✓)
   - (c) a provider-side product you rent
   - (d) a replacement for the engine's own batching and paging

3. A 70B model at Q4_K_M is roughly 40 GB of weights. On a chip streaming 400 GB/s of unified memory, the single-stream ceiling is about:
   - (a) 40 tokens/s
   - (b) 400 tokens/s
   - (c) 10 tokens/s (✓)
   - (d) 4 tokens/s

4. Your agent does 100M tokens a month at a blended $0.60 per million via API. A dedicated A100 at $1.49/hr would cost:
   - (a) about the same — the crossover is near 100M tokens
   - (b) about $60/month, matching the API
   - (c) about $1,073/month — roughly 18× the API bill for the same traffic (✓)
   - (d) about $179/month with steady discounts

5. Why does a local machine's bandwidth floor also act as its ceiling?
   - (a) Local machines cannot batch, so the single stream is all there is (✓)
   - (b) Local machines have no KV cache
   - (c) GGUF files cap generation speed by format
   - (d) Ollama throttles free users

6. The field note about the H100 that idled teaches:
   - (a) privacy workloads should never own hardware
   - (b) a correct lane can still lose money at 4% utilization — an owned engine must be fed traffic past the breakeven line (✓)
   - (c) cost-per-completed-task cannot be measured
   - (d) dedicated nodes always beat APIs

7. A regulated workload that may not leave the building, at 2M tokens a month, routes:
   - (a) to the cheapest hosted API with encryption
   - (b) locally — the constraint is sensitivity, not price, so the crossover arithmetic is irrelevant (✓)
   - (c) to a batch API overnight
   - (d) through a gateway in another region

8. The closing manifesto's equation is:
   - (a) agent economics = what the model knows × what the engine extracts × what the harness wastes (✓)
   - (b) agent economics = model quality minus provider price
   - (c) agent economics = throughput × utilization
   - (d) agent economics = context × tools × loop

### Worked arithmetic answers

**Q3:** The bandwidth law: every generated token re-reads essentially the whole model from memory, so ceiling ≈ bandwidth ÷ model size = 400 GB/s ÷ 40 GB = **10 tokens/s** — which is exactly where community measurements land for this configuration.

**Q4:** API: 100M tokens × $0.60 per 1M = 100 × $0.60 = **$60/month**. GPU: 720 hours × $1.49/hr ≈ **$1,073/month** — about 18× the API bill for the same traffic. The engine only wins if other lanes (batch, evals, summarization) push utilization past the roughly 35%-of-every-hour breakeven the chapter derives.

## Teach-back prompts

1. Walk a friend through one request crossing tinyengine from agent loop to endpoint and back, naming each duty officer and the single gauge it watches.
2. Explain the taxi-versus-van crossover to a manager deciding whether to buy a GPU — including the four reasons owning can still win even when the raw math says rent.
3. Teach the closing manifesto's three lines — own the contract, every dial has a price, instrument everything — and give one example failure each from the book that proves the line.
