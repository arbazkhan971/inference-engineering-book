# Start here

> **Front matter — how to read this book**

## Who this book is for

You build agents, or you pay for them, or you're about to. You use model
APIs the way a driver uses a car — competently, daily — and you've started
to suspect that knowing what's under the hood would make you better at your
job. It would. This book is the hood, opened.

Four readers, one ladder:

1. **The curious beginner** — follow the analogies and the plain-words
   boxes; skip nothing.
2. **The application developer** — you call APIs all day; this book shows
   you what your calls land on, and which of your habits cost money.
3. **The harness/agent engineer** — you own routing, caching, compaction,
   and budgets; Parts III and IV are your new cheat codes.
4. **The founder or platform lead** — you make build-vs-buy calls; the
   arithmetic chapters let you price engines, not vibes.

## How the book is organized

**Part I — The layer beneath the prompt.** What inference engineering is,
where the time goes, and the two pieces of arithmetic (compute vs.
bandwidth, and the KV cache memory formula) that explain half of everything
that follows.

**Part II — Inside the engine.** Batching, paging, prefill/decode,
speculative decoding, quantization, parallelism, MoE, long context — the
machinery, explained like a senior engineer explaining the kitchen to a
food critic who's about to open a restaurant.

**Part III — The API contract.** Streaming, structured output, prompt
caching economics, rate limits, routing and budgets — where the engine
touches your harness, and the provider behaviors that look like
personalities until you know their mechanics.

**Part IV — Harness meets engine.** Cache-aware agent design, compaction
trade-offs, fanout cost worksheets, and **tinyengine**, the small
TypeScript inference shim you build across the book's final chapters.

Chapters end with **Build it / Break it / Prove it / See it in the wild**.
Every analogy gets a **Where the picture stops** section, because every
analogy is wrong somewhere and you deserve to know where.

## The rule about numbers

Prices, rate limits, and benchmark results are **dated snapshots** —
clearly marked, honest about their shelf life. Formulas are forever. When
a number and a formula disagree in the future, trust the formula.

## How this book was written

This book was written the way it teaches engineers to work. The author
defined the architecture — reader promise, chapter map, style contract,
editorial gates, inherited from *Harness Engineering* — and an autonomous
fleet of well over one hundred GLM-5.3 model instances ran the research
(seventy-plus dated, sourced evidence digests, all committed to the public
repository) and drafted chapter by chapter on a headless writing driver,
against a six-gate editorial system. Every claim traces to a digest or
carries a visible hedge. The repo — manuscript, research corpus, and build
pipeline — is public: github.com/arbazkhan971/inference-engineering-book.
Check our work; that's the point.

## About the author

**Arbaz Khan** is a backend engineer and harness engineer who has spent his
career at the intersection of high-volume messaging systems and, lately,
industrial-scale AI agent operations — on the order of 200 billion tokens
driven through coding agents in four months, metered publicly because a
claim you can't check is just a boast. He is the author of *Harness
Engineering: How to Build AI Agents That Actually Work* and *System Design
Mastery*, and writes from the operator's chair, not the vendor's podium.

*Agent spawner by day, loop optimizer by night.*

- github.com/arbazkhan971 · github.com/arbazkhan971/harness-engineering
- ccrank.dev/user/arbaz-khan
- linkedin.com/in/arb5z · X: @arb5z

## Series note

This is **Volume II of the Harness Engineering series**. Volume I built the
system around the model: tools, loops, sessions, safety, memory, evals.
Volume II goes underneath: the serving layer that decides whether a
brilliant harness ships or stalls. The volumes are independent — each stands
alone — but they are built to be read in order, because the same failures
look different from the driver's seat and the engine room.
