# Launch copy — *Inference Engineering: Inside the Engine Room of AI Agents*

> **Publishing kit 2 · launch copy.** Canonical retail metadata comes from
> `PUBLISHING/book-metadata.yaml`; this copy may describe that identity but may not
> override it.
>
> **Brand voice:** Agent spawner by day, loop optimiser by night. Factual/verifiable
> claims only — every number below traces to the manuscript, the public repo, or the
> public meter. No hype adjectives.
>
> **Inputs used:** `manuscript/00a-prologue.md`, `manuscript/00b-front-matter.md`,
> `manuscript/zz-back-matter.md`, `GOAL.md`, `research/books-launch-playbooks.md`.
> Volume I series facts are bound to its published identity; Volume II author facts
> are bound to `manuscript/zz-back-matter.md`.

## Claims ledger (what copy may assert, and where it verifies)

| Claim | Bound version used in copy | Verification |
|---|---|---|
| Token volume | "more than 200 billion tokens through coding agents in ~4 months (on the order of 1.6B/day)" | Public meter: ccrank.dev/user/arbaz-khan; stated in prologue + back matter |
| Series | Volume II of the Harness Engineering series; Vol. I = *Harness Engineering: How to Build AI Agents That Actually Work* | front matter "Series note"; back matter |
| Independence | "Each volume stands alone; built to be read in order" | front matter, verbatim sense |
| Production method | 100+ GLM-5.3 instances, six editorial gates, 70+ dated sourced digests, public repo | back matter "How this book was written"; github.com/arbazkhan971/inference-engineering-book |
| Numbers rule | Prices/rate limits/benchmarks are dated snapshots; formulas are forever | front matter "The rule about numbers" |
| 6pm slowdown | "Really happened, more than once, at more than one provider" | prologue field note |

**Banned in all copy (unverifiable/hype):** best-seller claims, "definitive,"
"must-read," reader-count claims, revenue claims, "the only book," superlatives on
quality. Credential set allowed: 200B tokens + the meter URL + public repo.

---

## 1. Back-cover blurb — 149 words (hook first)

It is six in the evening and your agent has become stupid.

Same model, same prompt, same tools. This morning it answered in four seconds; now every token arrives like drip coffee. The model didn't change. The engine did: a queue got longer, a batch got fuller, a cache entry expired, a rate limiter woke up.

*Inference Engineering* opens that engine room — batching, KV caches, prefill and decode, speculative decoding, quantization, caching economics, rate limits, routing — for engineers who build agents and need to drive the serving layer, not rebuild it. You will compute what a token costs and why, predict which loop changes save money and which quietly break a cache, and build a small inference shim of your own.

Arbaz Khan metered 200 billion tokens through coding agents — publicly, at ccrank.dev/user/arbaz-khan. Volume II of the Harness Engineering series. The harness is the driver. This is the engine.

*Word count: 149 (limit 150). Em dashes and the URL count as non-words/punctuation.*

---

## 2. Amazon / KDP description — HTML, opens with the 6pm hook

KDP rules applied: 4,000-character limit; supported tags only (`h4`–`h6`, `b`, `i`, `em`,
`strong`, `p`, `br`, `ul`, `ol`, `li`); anchor `<a>` links are stripped — URLs appear as
plain text only. Source: kdp.amazon.com/help/topic/G201189630. Paste the block between
the markers into the KDP description field (HTML view).

<!-- BEGIN KDP DESCRIPTION — approx. 3.4k characters incl. tags; verify in KDP's counter before saving -->

<h4>It is six in the evening and your agent has become stupid.</h4>
<p>Same model. Same prompt. Same tools. At nine this morning it answered in four seconds; now each token arrives like drip coffee. You restart the harness. You simplify the prompt. You blame the model — and you are wrong.</p>
<p><b>The model didn't change. The engine did.</b> Somewhere between your request and the first token, a queue got longer, a batch got fuller, a cache entry expired, a rate limiter woke up. The thing that decides how fast, how expensive, and how reliable your agent's intelligence reaches you is a serving system most developers never see — and no API doc fully explains.</p>
<p><i>Inference Engineering: Inside the Engine Room of AI Agents</i> makes that machinery visible — for the engineer who builds agents and needs to drive the engine well, not rebuild it. No CUDA required.</p>
<h5>Who this book is for</h5>
<ul>
<li><b>Application developers</b> who call model APIs all day and want to know what their calls land on — and which habits cost money.</li>
<li><b>Harness/agent engineers</b> who own routing, caching, compaction, and budgets.</li>
<li><b>Founders and platform leads</b> making build-vs-buy calls, who need to price engines, not vibes.</li>
<li><b>Curious beginners</b> — plain-words boxes and analogies carry you; skip nothing.</li>
</ul>
<h5>What's inside</h5>
<ul>
<li><b>Part I — The layer beneath the prompt:</b> where the time goes, and the two pieces of arithmetic that explain half of everything.</li>
<li><b>Part II — Inside the engine:</b> batching, paging, prefill and decode, speculative decoding, quantization, parallelism, MoE, long context.</li>
<li><b>Part III — The API contract:</b> streaming, structured output, prompt-caching economics, rate limits, routing and budgets.</li>
<li><b>Part IV — Harness meets engine:</b> cache-aware agent design, compaction trade-offs, fanout cost worksheets, and <b>tinyengine</b> — a provider-normalizing, cost-metering, cache-friendly TypeScript inference shim you build yourself.</li>
</ul>
<h5>By the last page you will be able to</h5>
<ul>
<li>Explain every term on an inference dashboard — TTFT, TPOT, goodput, KV cache, batch, prefill, decode — without jargon.</li>
<li>Compute, on paper, what a token costs and why.</li>
<li>Predict which agent-loop changes save money — and which quietly invalidate a cache and cost more.</li>
<li>Read a provider's pricing or rate-limit page without flinching.</li>
</ul>
<h5>Volume II of the Harness Engineering series</h5>
<p>Volume I, <i>Harness Engineering: How to Build AI Agents That Actually Work</i>, built the system around the model: tools, loops, sessions, safety, memory, evals. Volume II goes underneath: the serving layer that decides whether a brilliant harness ships or stalls. Each volume stands alone; they are built to be read in order.</p>
<h5>About the author</h5>
<p>Arbaz Khan is a backend and harness engineer who has spent his career in high-volume messaging systems and, lately, industrial-scale AI agent operations: more than 200 billion tokens driven through coding agents in roughly four months — metered publicly, because a claim you can't check is just a boast (ccrank.dev/user/arbaz-khan). He writes from the operator's chair, not the vendor's podium.</p>
<p><b>House rules, same as Volume I:</b> no jargon without a plain-words explanation, no number without a source or a visible hedge, no chapter that ends without making you build, break, or measure something. Prices and rate limits are clearly marked dated snapshots; the formulas are forever.</p>
<p>The manuscript, the 70+ dated sourced research digests behind it, and the build pipeline are public: github.com/arbazkhan971/inference-engineering-book. Check our work; that's the point.</p>

<!-- END KDP DESCRIPTION -->

---

## 3. Series-page copy (links Vol. I)

### The Harness Engineering series

Volume I built the system around the model. Volume II goes underneath it.

**Volume I — *Harness Engineering: How to Build AI Agents That Actually Work.***
The system around the model: tools, loops, sessions, safety, memory, evals. How to
build the driver's seat.

**Volume II — *Inference Engineering: Inside the Engine Room of AI Agents.***
The serving layer the driver sits on: batching, KV caches, prefill and decode,
speculative decoding, quantization, caching economics, rate limits, routing, budgets.
Why a brilliant harness ships or stalls.

The volumes are independent — each stands alone — but they are built to be read in
order, because the same failures look different from the driver's seat and the engine
room. Both are written under one contract: no jargon without plain words, no number
without a source or a visible hedge, and no chapter that ends without making you
build, break, or measure something. The research corpus and manuscripts are public at
github.com/arbazkhan971 (harness-engineering · inference-engineering-book).

*(~170 words. Series tether follows the one-line "builds upon" pattern from the
launch-playbook research: Chip Huyen's Apr 2024 AI Engineering announcement.)*

---

## 4. Launch announcement thread — 5 posts, operator voice

Per-post character counts shown raw; on X every URL counts as 23 characters
(t.co wrap), so effective counts are lower. All posts stay under 280 either way.

**Post 1/5 — the hook (~272 chars raw)**

New book: Inference Engineering — Inside the Engine Room of AI Agents.

6pm. Same model, same prompt. This morning: 4s answers. Now: tokens like drip coffee.

The model didn't change. The engine did — queues, batches, caches, rate limits.

This book is about that layer.

**Post 2/5 — why it exists (269 raw · 266 X-counted)**

Why: I ran agents at scale and the slowdowns weren't the model. 200B tokens through coding agents in ~4 months, metered at ccrank.dev/user/arbaz-khan

In a dated market scan, I found no book-length client-side guide to the layer between
harness and GPU. So I wrote one.

**Post 3/5 — what's inside (~269 raw)**

Inside:
I — where the time goes (two formulas explain half of it)
II — batching, KV cache, prefill/decode, spec decoding, quantization, MoE
III — the API contract: caching economics, rate limits, routing
IV — cache-aware agent design + tinyengine, a shim you build

**Post 4/5 — how it was written (~275 raw · ~246 X-counted)**

How it was written: a fleet of 100+ GLM-5.3 instances, six editorial gates, 70+ dated, sourced research digests. Every number traces to a digest or carries a visible hedge. Manuscript, corpus, and build pipeline are public: github.com/arbazkhan971/inference-engineering-book

**Post 5/5 — CTA + series + verify (~253 raw · ~250 X-counted; release-time
only, after the retail listing is live)**

Inference Engineering is out now. Volume II of the Harness Engineering series — Vol. I built the system around the model; this one goes underneath it. Read either alone; read both in order.

Check my numbers before you buy: ccrank.dev/user/arbaz-khan

*Thread notes: only two credentials used, both task-mandated and verifiable (200B
tokens; ccrank.dev/user/arbaz-khan) plus the public repo. No sales/ranking claims,
no "best," no exclamation marks.*

---

## 5. Interview / AMA seed answers (3)

**Seed Q1 — "What is inference engineering, and why does an agent builder need it? Not GPU kernels, surely?"**

It's the discipline of reasoning about the serving layer your agent drives — without
building that layer. My working thesis: an agent's apparent intelligence is bounded by
the model; its apparent speed, cost, and reliability are bounded by inference. So the
6pm slowdown that everybody blames on "the model having a bad evening" is almost never
the model: the same weights that answered in four seconds at 9am are still running at
6pm. What changed is the engine — queue length, batch fullness, cache expiry, rate
limits. Once you can name and rank those causes, you fix your harness instead of
restarting it. You don't need to write CUDA for that; you need batching, KV-cache
arithmetic, and caching economics. That's the book.

**Seed Q2 — "You lead with '200 billion tokens.' What does that number mean, and how can we check it?"**

Over roughly four months I pushed more than 200 billion tokens through coding agents —
on the order of 1.6 billion a day — and I ran the meter publicly at
ccrank.dev/user/arbaz-khan precisely so the number would be checkable rather than
impressive-sounding. A claim you can't verify is just a boast. What that volume buys
you isn't a badge; it's sample size. Slowdowns repeat, so you stop believing in magic:
you learn the difference between a cache miss and a rate limit, between batch luck and
queue position, and which harness habits quietly invalidate a provider's prompt cache.
Every war story in the book traces to that meter or to a dated, sourced digest in the
public repo.

**Seed Q3 — "Your book says a fleet of 100+ model instances wrote it. Why should readers trust it?"**

Because nothing is hidden. I defined the architecture — reader promise, chapter map,
style contract, and the six-gate editorial system inherited from Volume I — and the
fleet ran research and drafting against those gates. The output isn't vibes: seventy-plus
dated, sourced evidence digests are committed to the public repo, and the house rule is
that every claim traces to a digest or carries a visible hedge. Product facts — prices,
rate limits, benchmarks — are marked as dated snapshots, because they expire; the
formulas don't, and when a number and a formula disagree next year, the book tells you
to trust the formula. The whole pipeline — manuscript, research corpus, build — is at
github.com/arbazkhan971/inference-engineering-book. Check our work; that's the point.

---

## Production notes for kit assembly

- **Blurb** fits 150-word constraint at 149; verify count again after any edit (em
  dashes and the ccrank URL are not words).
- **KDP block** uses only tags Amazon supports and no anchor links (stripped). Exact
  character count must be read off KDP's own counter before saving — estimated ~3.4k
  of the 4,000 budget.
- **Playbook alignment** (from `research/books-launch-playbooks.md`): series tether in
  one shareable sentence (Huyen pattern), public companion repo as lead artifact
  (aie-book/dmls-book pattern), Vol. I owners respected via "stands alone, read in
  order" framing (Ousterhout pattern).
- **Author source of record:** if an external media kit differs from
  `manuscript/zz-back-matter.md`, reconcile it before launch; do not silently merge
  credentials from two versions.
