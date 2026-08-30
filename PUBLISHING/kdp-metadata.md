# KDP Metadata Kit — *Inference Engineering* (Harness Engineering, Vol. II)

Prepared 2026-08-27 · Publishing kit 1 of the launch sequence.

**Digest citation keys** (every recommendation below cites at least one):
- **[MD]** = `research/books-kdp-market-data.md` (categories, price bands, BSR→sales curves, coverage thinness)
- **[PW]** = `research/books-positioning-wedge.md` (title collision, verified wedge, coverage map, series angle)
- **[LP]** = `research/books-launch-playbooks.md` (series tether, launch patterns)
- **[FM]** = `manuscript/00b-front-matter.md` (reader ladder, book structure, series note, tinyengine)
- **[KDP]** = Amazon KDP official help pages, verified 2026-08-27 (royalty tiers, delivery fee, keyword rules, print royalties)

---

## 1. Locked retail identity

**Locked retail metadata:** Title **Inference Engineering** · Subtitle *Inside the
Engine Room of AI Agents* · Author **Arbaz Khan** · Language **English (`en`)**.
The machine-readable source of truth is `PUBLISHING/book-metadata.yaml`; the build,
KDP form, cover, and launch copy must use it without improvisation. Variants B and C
below are retained only as positioning research, not as upload options for this
edition.

| # | Title | Subtitle | Digest basis |
|---|-------|----------|--------------|
| **A (locked)** | **Inference Engineering** | *Inside the Engine Room of AI Agents* | **[PW]** warns of an exact-title collision with Kiely/Baseten's 2026 *Inference Engineering* and prescribes differentiation by subtitle and framing. The agent-specific engine-room subtitle, Volume II series identity, cover hook, and canonical identifier now provide that differentiation as one consistent retail package. |
| **B (archived exploration)** | **Inference Engineering for AI Agents** | *The Harness Engineer's Guide to LLM Serving, Latency, and Cost* | **[PW]:** the verified wedge is "the harness/agent engineer as primary reader… from the client side of the contract," and "harness engineering is now industry vocabulary" (Fowler, OpenAI, Anthropic, LangChain) yet unowned by any serving book. This direction informed the positioning, but it is not the title of this edition. |
| **C (archived exploration)** | **The LLM Engine Room** | *What Happens to Your Agent's Tokens After the API Call — Inference Engineering, Volume II* | **[MD]** identifies a thin inference/serving category and **[FM]** establishes the engine-room metaphor. This direction informed the cover language, but it is not the title of this edition. |

**Recommendation:** Variant **A** is locked for this edition. It keeps the category
term while the subtitle, series identity, cover hook, and launch copy carry the
client-side AI-agent wedge. A title change now would split the OPF metadata, cover,
public repository, and retail listing; revisit the archived alternatives only for a
future edition with a new identifier.

---

## 2. Seven KDP keywords (high-traffic, low-competition)

KDP gives exactly 7 backend keyword slots, ≤50 characters each, best as 2–3-word phrases; avoid words already in title/subtitle/categories **[KDP: G201298500, G201743260]**. All seven below avoid repeating the locked Variant-A title and subtitle.

| # | Keyword (chars) | Why — digest basis |
|---|-----------------|--------------------|
| 1 | `llm serving in production` (26) | **[MD]** flags "inference/serving engineering specifically" as thin — no dedicated bestseller-node title. **[PW]:** Wang/Hu (O'Reilly) own the infrastructure phrasing; the client-side angle is uncontested. |
| 2 | `kv cache and gpu memory` (24) | **[MD]** thin-coverage list names KV-cache explicitly. **[PW]** coverage map: KV cache is covered engine-side only — a searcher lands on operator books; ours is the only harness-side answer. |
| 3 | `ttft latency and throughput` (28) | **[MD]** thin list includes latency/throughput. **[PW]:** "No surveyed title teaches TTFT/TPOT arithmetic" — and **[PW]** series-angle explicitly directs leaning on "TTFT" as a differentiating search term. |
| 4 | `prompt caching and api cost` (27) | **[PW]:** no title teaches provider cache semantics from the consumer side; coverage map shows "Provider cache economics" as an empty cell vs every engine-side neighbor. **[FM]** Part III, ch14. |
| 5 | `rate limits and backoff` (23) | **[PW]:** "429/backoff" named as uncovered by any surveyed title; coverage map row "Rate limits/429 as physics" is empty across all five neighbors. **[FM]** Part III, ch15. |
| 6 | `model routing and budgets` (25) | **[MD]** thin list includes GPU economics; **[PW]** ch16 seam (routing/budgets from the API-consuming side vs Johnson's policy checklists). **[FM]** Part III. |
| 7 | `quantization speculative decoding` (33) | **[MD]** thin-coverage list names quantization. **[PW]:** engine books cover it, but none connects it to harness design — the differentiator is our harness-controls close per chapter. **[FM]** Part II, ch8–9. |

**Series-keyword option:** if the live KDP keyword report shows that the Series field
does not surface the Harness Engineering connection, test `building ai harnesses`
(21) in place of #3 or #5. That is a backend discoverability experiment, not a title
change.

**Compliance note:** no brand names (vLLM, CUDA, etc.) used, per KDP keyword guidelines **[KDP: G201298500]**; all seven are accurate content descriptors, which KDP requires.

---

## 3. Three KDP category picks

| # | Category (node) | Rationale |
|---|-----------------|-----------|
| 1 | **Computers & Technology → Artificial Intelligence** (node 491300) | **[MD]:** "AI book bestseller lists live under" this node; its top-20 already includes practitioner titles ("30 Agents Every AI Engineer Must Build") — proof practitioner depth can chart here. Primary authority node. |
| 2 | **Computers & Technology → Natural Language Processing** (node 271581011) | **[MD]:** "professional titles dual-list in 'AI & ML' + 'NLP'" — the established pattern for every comparable success (Raschka, Alammar/Grootendorst, Huyen). Matching the comparables' shelving is the lowest-risk metadata move. |
| 3 | **Computers & Technology → Generative AI** (node 211759007011) | **[MD]:** newer node "dominated by KDP/self-pub titles" — competition here is $9.99-and-under self-pub books, not O'Reilly/Manning flagships, making a bestseller badge achievable at modest velocity (**[MD]:** niche technical books sustain tens-of-thousands BSR ≈ 3–15 sales/day). Caveat: this is a visibility play, not a positioning play — our $12.99 price deliberately sits above this node's crowd **[MD]**. |

**Anti-recommendation:** do *not* rely solely on node 3 despite its winnability — **[MD]** shows the professional dual-list pattern (AI + NLP) is what serious practitioner titles do, and GenAI-node-only shelving would signal self-pub beginner tier, contradicting the premium-pricing strategy in §4.

---

## 4. Price recommendation with math

### Ebook — launch at **$12.99**, 70% tier

**Mechanics (verified [KDP: G200634560, G200644210], 2026-08-27):** effective 2026-07-07 the 70% royalty band widened from $2.99–$9.99 to **$2.99–$12.99**; 70% royalty = (list − delivery fee) × 0.70, delivery fee **$0.15/MB** on Amazon.com; the 35% tier has no delivery fee.

**Delivery fee at 6 MB:** 6 × $0.15 = **$0.90 per sale** (70% tier only).

| List price | Tier | Delivery fee | Royalty/sale |
|-----------|------|--------------|--------------|
| $6.99 (promo) | 70% | $0.90 | **$4.26** |
| $9.99 | 70% | $0.90 | **$6.36** |
| $11.99 | 70% | $0.90 | **$7.76** |
| **$12.99 (rec.)** | **70%** | **$0.90** | **$8.46** |
| $14.99 | 35% (above band) | $0.00 | $5.25 |
| $24.99 | 35% | $0.00 | $8.75 |

**Why $12.99 wins on the digest's own numbers:**
1. **Band headroom is new.** Before 2026-07-07, $12.99 would have earned 35% ($4.55); today it earns $8.46 — an 86% raise for zero change to the book **[KDP]**.
2. **+33% per sale over $9.99** ($8.46 vs $6.36). Break-even elasticity: we can lose up to **24.8%** of unit sales at $12.99 and still out-earn $9.99 (6.36 ÷ 8.46 = 75.2%).
3. **Price-anchor separation.** **[MD]:** "KDP/self-pub AI eBooks typically list at $9.99 or below" — $12.99 visibly lifts us out of the GenAI-node noise while staying a bargain beside publisher ebooks ($47.99 Packt, $54.99 Manning, $79.99 O'Reilly hardcover) **[MD]**. Premium signal, self-pub price.
4. **Above-band pricing is strictly worse** until ~$24.99 at 35% — which would need flagship-publisher brand equity we don't have **[MD]** (O'Reilly only reaches $79.99 as an established house).

**Monthly royalty scenarios at $12.99 ($8.46/sale), using [MD] BSR→sales curves:**

| BSR (Kindle) | Est. sales/day [MD] | Est. royalty/month |
|-------------|--------------------:|-------------------:|
| ~#100,000 | 1–2 | $254 – $508 |
| ~#50,000 | 3–15 | $761 – $3,807 |
| ~#25,000 | (digest benchmark: ~$965/mo at ~$9.99 pricing) | ≈ $1,269 at our price |
| ~#10,000 | 13–25 | $3,299 – $6,345 |

Cross-check: **[MD]** cites BSR #25,000 → ~$965/mo Kindle royalty, implying ~5 sales/day — internally consistent with the #50,000 band (3–15/day). These are curve-fit estimates only; Amazon publishes no sales data **[MD]**.

**Promo plan:** launch week $6.99 ($4.26/sale) for rank velocity, then settle at $12.99; revisit $9.99 only if velocity at $12.99 falls below the 75%-of-$9.99-units break-even line above.

### Print — list at **$59.99** paperback

- **[MD]:** "$59.99 is the established practitioner list price (Manning/Packt)"; "$55–70 list is in-market"; comp page counts run 368–534 pp.
- **Royalty math [KDP: G201834330, royalty-calculator]:** 60% of list minus print cost (60% tier applies at list ≥ $9.99). At an assumed ~450 pp B&W (mid-comps): print cost ≈ $0.85 + 450 × $0.012 ≈ **$6.25** (one calculator uses $1.00 base → $6.40; range noted).
  - $59.99 → 0.60 × 59.99 − $6.25 = **$29.74/copy**
  - $54.99 → $26.74/copy (the $5 list cut costs $3.00/copy in royalty — not worth it)
- **Flag:** the manuscript is complete, but print page count remains unknown until a
  trim-size-specific print interior is generated. Re-run KDP's calculator against
  that final interior before locking the paperback price. If the extent exceeds 500
  pages, revisit both print cost and list price rather than carrying the estimate
  forward silently.

---

## 5. A+ content headline candidates

| # | Headline | Body-support line | Digest basis |
|---|----------|-------------------|--------------|
| 1 | **The engine room, from the driver's seat.** | "You use model APIs the way a driver uses a car. This book is the hood, opened." | **[FM]** — verbatim framing from front matter; instantly signals the client-side angle. |
| 2 | **The serving layer, written for the engineer on the API side of the contract.** | "Latency and cost arithmetic, cache-friendly loop design, rate limits as physics, routing and budgets." | **[PW]** — the verified wedge, quoted nearly verbatim; hedged to the digest's actual claim ("no book-length title takes the harness/agent engineer as its primary reader"). |
| 3 | **Volume I built your harness. Volume II shows you what it's standing on.** | "The volumes are independent — each stands alone — but built to be read in order." | **[LP]** — Huyen's one-line series-tether pattern + **[FM]** series note; converts Vol. I owners (respect-the-series lesson from Ousterhout's free-extract move **[LP]**). |
| 4 | **Formulas are forever. Numbers are dated snapshots — and marked as such.** | "When a number and a formula disagree in the future, trust the formula." | **[FM]** — the book's honesty contract; **[PW]** names dated-snapshot boxes as a moat vs free corporate content. |
| 5 | **Every engine mechanism ends with the harness control.** | "Batching, KV caches, speculative decoding, quantization — and what each means for your loops, caches, and budgets." | **[PW]** — "every chapter keeps a harness-controls close — no serving competitor has this." |
| 6 | **Build tinyengine as you read.** | "A small TypeScript inference shim you build across the book's final chapters." | **[FM]** Part IV + **[PW]** — "a buildable companion artifact… versus free corporate content"; mirrors Huyen's companion-repo launch lever **[LP]**. |

**Usage:** #1 or #2 as the hero banner; #3 for the series/comparison module; #4–6 as module headers down the page. A+ comparison chart should contrast against the five nearest neighbors exactly as tabulated in **[PW]** (engine-side vs harness-side), never naming competitor titles in keywords.

---

## Gaps & verification flags

- **6 MB file size is an assumption** given in the task. If the EPUB lands at ~3 MB, the delivery fee halves to $0.45 (+$0.315/sale at $12.99) — re-run math at build time. Delivery fee exists only on the 70% tier **[KDP]**.
- **Page count for print pricing is provisional** (~450 pp assumed from **[MD]** comp range 368–534); final extent changes the $6.25 print-cost figure but not the $59.99 list recommendation.
- **[MD]** BSR→sales figures are third-party curve fits, not Amazon data — treat scenario table as order-of-magnitude **[MD]**.
- Print-cost base fee varies by source ($0.85 vs $1.00) across calculators citing 2026 rates **[KDP-adjacent]**; use KDP's own calculator at setup.
- Category nodes were verified 2026-08-27 **[MD]**; Amazon reorganizes nodes periodically — re-verify at upload.
- KDP's post-setup category expansion (beyond initial picks) was not verified in this run; if available at upload time, mirror the dual-list pattern with additional nodes per **[MD]**.
