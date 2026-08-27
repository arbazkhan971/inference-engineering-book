# BOOK STYLE CONTRACT (every writing agent MUST follow this)

**Title:** *Inference Engineering: Inside the Engine Room of AI Agents*
**Series:** Harness Engineering, Volume II

## Voice & tone
- Second person ("you"), direct, expert-but-warm. Zero fluff, zero filler intros.
- A senior engineer who has run 200B tokens through these APIs explaining the machine underneath.
- Every tradeoff shows BOTH sides. "Latency, cost, quality — pick two" is a recurring spine.
- Original prose. Never copy any existing book. Real systems/papers may be named factually with dated sources.
- The author is an operator, not a vendor: first-person **Field notes** boxes are allowed, must be true operator observations, never product pitches.

## File conventions
- One chapter per file: `manuscript/<id>-<slug>.md` (IDs from CHAPTER_MAP.md).
- Start file with `# <Chapter number>. <Title>`, then `> **Part X — ...**` one-line context quote.
- H2 sections numbered `X.1`, `X.2`, ... H3 subsections unnumbered.
- Diagrams: mermaid code blocks preferred, ASCII fallback allowed.
- Target lengths: concept chapters 3,000–5,500 words; Part IV build chapters 3,500–6,500. Shorter is better than padded.

## FEYNMAN + ELI5 PEDAGOGY (mandatory, the series signature)
- **Every major concept opens with an ELI5 block**: `> **ELI5:** ...` — everyday analogies (kitchens, kitchens again, parking lots, water pipes, restaurants, airports). No jargon inside the ELI5 block.
- Ladder: ELI5 analogy → naive version → real mechanics with numbers → expert nuance/tradeoffs.
- Vocabulary-opening chapters carry a **Words before machinery** table: Term / Simple meaning / Everyday picture.
- **Every chapter has a `Where the picture stops` section** — where the main analogy breaks.
- Every chapter ends with **Build it / Break it / Prove it / See it in the wild**.
- Acronyms expanded at first use; code identifiers explained before use.

## Numbers discipline (hard rules)
- Every number traces to a dated digest in `research/` or carries a visible hedge like "(mid-2026 snapshot)".
- Pricing, rate limits, benchmark results live in dated boxes/sidebars, never in the durable-prose spine.
- Prefer teaching the formula over quoting the value: show KV-bytes math, cost math, cache-savings math as reusable arithmetic.
- No invented benchmark numbers. If research lacks a number, say so and hedge.

## Diagrams
- Mermaid `graph TD/LR` for flows; `xychart-beta` for cost/latency curves where helpful.
- Every diagram must be readable in grayscale e-ink: no color-only meaning.

## Forbidden
- Vendor marketing language ("blazing fast", "revolutionary").
- Unexplained jargon, acronym stacks, walls of citations inline (put them in Appendix E).
- Promising code that never appears in the companion.
