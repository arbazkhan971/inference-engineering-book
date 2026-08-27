# Prologue — The invisible engine

> **Part O — Before the book proper**

It is six in the evening and your agent has become stupid.

Nothing changed on your side. Same model, same prompt, same tools. At nine
in the morning it answered in four seconds; now each token arrives like
drip coffee. You restart the harness. You simplify the prompt. You blame
the model — *the model is having a bad evening* — and you are wrong, and so
is everybody who has ever said that in a Slack channel.

The model did not change. The **engine** changed. Somewhere between your
POST request and the first token, a queue got longer, a batch got fuller, a
cache entry expired, a rate limiter woke up. The intelligence you are
talking to is a model. The thing that decides how that intelligence reaches
you — how fast, how expensive, how reliable — is a serving system most
developers never see and nobody's API docs fully explain.

I learned this the expensive way. Over roughly four months I pushed more
than **200 billion tokens** through coding agents — on the order of 1.6
billion tokens a day — and I ran the meter publicly, because I wanted the
number to be checkable rather than impressive-sounding
(ccrank.dev/user/arbaz-khan). At that volume you stop believing in magic.
You learn that the difference between a fast agent and a slow one is rarely
the model; it is what the serving layer is doing with your request, and
what your harness is doing to the serving layer. Cache hits, batch luck,
queue position, prefix discipline, rate-limit choreography. The harness is
the driver. This book is about the engine.

## The book this should have been, and isn't

There are books about models — how they're trained, what they know. There
are books about harnesses — mine, *Harness Engineering: How to Build AI
Agents That Actually Work*, is one; it teaches the system around the model.
And there are books about GPU kernels, written for the people who build
engines from scratch.

What was missing, when I went looking, was the book for the person in the
middle: **the engineer who builds agents and needs to understand the engine
they're driving** — not to rebuild it, but to drive it well. You don't need
to write CUDA to profit from knowing why your latency doubles after a
compaction, why the same prompt costs different amounts on different days,
or why 500 parallel subagents will melt a rate limit you didn't know you
were sharing. That engineer is you, and this book is for you.

## What you will be able to do

By the last page, the invisible machinery below the API will be visible:
batching, KV caches, prefill and decode, speculative decoding, quantization,
caching economics, rate limits, routing. You will be able to compute, on
paper, what a token costs and why; predict which changes to your agent loop
will save money and which will quietly invalidate a cache and cost more;
and read an inference dashboard — or a provider's pricing page — without
flinching. You will build a small piece of the machinery yourself: a
provider-normalizing, cost-metering, cache-friendly inference shim we call
**tinyengine**.

One promise, same as Volume I: no jargon without a plain-words explanation,
no number without a source or a visible hedge, and no chapter that ends
without making you build, break, or measure something.

The engine room is loud, hot, and mostly undocumented. Let's go in.

---

*Field note.* The 6pm slowdown in the opening really happened, more than
once, at more than one provider. When you finish Chapter 5, you'll be able
to name three plausible causes and — more usefully — rank them by
likelihood before you blame the model.
