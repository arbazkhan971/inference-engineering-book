# Pedagogy audit — ch02 The shape of a token

audited: 2026-08-28 · auditor: glm-5.3-flash (worker, beginner-simulation protocol)
Reader simulated: smart 25-year-old non-engineer (no code, no ML background; has used ChatGPT).

## Findings

### [LOST] 1 — BPE mechanism never bridges from its own picture

- Quote: "Most modern tokenizers are built with byte-pair encoding: training starts from raw bytes and repeatedly merges the most frequently adjacent pair into a new entry until the vocabulary reaches its target size."
- Why lost: The Words-before-machinery table promises "Inventing shorthand for your most-used phrases," but the mechanism sentence never connects to that picture. "Adjacent pair" — pair of what, characters? letters? "Merges ... into a new entry" — into what, the vocabulary? A beginner loses the referents exactly here, and 2.3's digit/CJK/code shapes all depend on holding this mechanism. This is the one place in the chapter where the simulated reader put the book down.
- Minimal fix: one bridging sentence before the formal one — "In plain words: start with single characters, glue together the pairs that show up most often (`t`+`h`, then `th`+`e`, then ` the`), and add every glued chunk to the catalog — that is the shorthand being invented." Then the formal sentence lands as the precise version of what they just pictured.

### [CONFUSING] 2 — "bytes" used as if the reader knows what a byte is

- Quote: "A token is a sequence of bytes from a fixed list"
- Why confusing: "Byte" is never defined anywhere in the chapter (and the table's "merging frequent byte pairs" leans on it twice). A lay reader has only a vague "computer-y small thing" sense; "sequence of bytes from a fixed list" reads as circular.
- Minimal fix: gloss at first use — "a sequence of bytes (the raw digital characters a computer stores) from a fixed list."

### [CONFUSING] 3 — "token bucket" arrives with no gloss

- Quote: "enforced by a token bucket that lets short bursts exceed the average rate"
- Why confusing: Term of art with specific behavior; the literal picture (a bucket of tokens) is close enough to be actively misleading. Chapter 15 pointer exists but the sentence still stalls a lay reader mid-paragraph.
- Minimal fix: "(a bucket that refills over time — bursts drain it, and when it's empty you wait)" inserted before the chapter-15 pointer.

### [CONFUSING] 4 — cache vocabulary leaks four chapters early (three sites)

- Quotes: "only *uncached* input tokens count against your ITPM" · "DeepSeek bills cache-hit input at $0.007 per 1M tokens off-peak against $0.22 off-peak cache-miss" · "When your prompt cache hits or misses, it hits or misses in tokens."
- Why confusing: Caching is taught in chapter 6 (mechanism) and 14 (economics). "Uncached," "cache-hit," "cache-miss" arrive here with zero prior definition; the simulated reader flagged the DeepSeek box as "words about a thing I haven't been told about." The 31× number is the intended punch; it currently has no referent.
- Minimal fix: one 6-word gloss at the first site — "only uncached input tokens (text the provider hasn't seen recently — chapter 6) count" — and preface the DeepSeek box with "(when the provider recognizes text you sent before, it charges far less; chapter 6 explains why)". Alternatively move the box to chapter 14 where it has machinery.

### [CONFUSING] 5 — "low mutual information" at the strawberry payoff

- Quote: "a 2025 paper frames these failures as low mutual information between tokens and character-level concepts"
- Why confusing: The paragraph's plain explanation before this quote is excellent; then the citation's jargon label lands at the emotional peak and undercuts the beginner's just-won confidence. "Mutual information" is grad-level.
- Minimal fix: "frames these failures as tokens simply not carrying letter-level information (the paper's term: low 'mutual information')" — or drop the term and keep the plain clause with the citation.

### [CONFUSING] 6 — "affine" on the cost-twin close

- Quote: "also affine, also with a term you control (N) and terms you rent"
- Why confusing: The taxi picture already IS the affine idea; naming it in math-speak at the section close makes the beginner feel the ground shifted.
- Minimal fix: "also a flag-drop-plus-per-mile shape" (the word "affine" earns nothing here that the picture hasn't already taught).

### [CONFUSING] 7 — "call site" is programmer-only vocabulary

- Quote: "the harness should carry an explicit latency budget object per call site"
- Why confusing: "Call site" is IDE vocabulary; the reader ladder's rung 1–2 readers don't have it.
- Minimal fix: "per place your code talks to a model."

### [CONFUSING] 8 — "the BERT lineage" names a stranger

- Quote: "WordPiece (the BERT lineage) marks sub-word continuations"
- Why confusing: BERT is introduced as if known. The sentence's point is "sibling methods differ in details," which doesn't need the brand.
- Minimal fix: "WordPiece (another model family's variant) marks sub-word continuations" — Appendix E can keep the precise attribution.

### [CONFUSING] 9 — "training stream" / "language-agnostic" compress two ideas

- Quote: "SentencePiece treats raw text including spaces as the training stream, which makes it language-agnostic"
- Why confusing: Both halves are compressed: what a "training stream" is, and why including spaces makes something language-agnostic, are each doing silent work.
- Minimal fix: "SentencePiece learns from raw text with the spaces kept in, which lets one recipe serve any language."

### [POLISH] 10 — "greedy" adjective before its own explanation

- Quote: "Encoding new text is then a greedy longest-match against that learned merge table"
- Minimal fix: the dash-clause right after already explains it ("grabs the longest chunk it recognizes"); reorder to lead with the plain clause, or drop "greedy" — "a longest-match pass."

### [POLISH] 11 — "H100 SXM" form-factor jargon

- Quote: "an H100 SXM GPU offers 3.35 TB/s of memory bandwidth"
- Minimal fix: "an H100-class data-center GPU."

### [POLISH] 12 — "compression codebook"

- Quote: "a learned compression codebook, then greedy matching at serving time"
- Minimal fix: "a learned catalog of chunks, then longest-match at serving time" (the catalog picture already exists in the table).

### [POLISH] 13 — arXiv used before being expanded

- Quote: "(Petrov et al., EMNLP — the Empirical Methods in Natural Language Processing conference — 2023, arXiv:2305.13707)"
- Minimal fix: EMNLP is expanded inline (good); arXiv deserves the same once, book-wide: "(arXiv, the open research-paper site)".

### [POLISH] 14 — "right-aligned to a power of 1000"

- Quote: "every comma-delimited group is right-aligned to a power of 1000"
- Minimal fix: "each group after a comma starts fresh at the ones place" — the worked example already shows it; say it in counting words.

### [POLISH] 15 — odometer vs autocorrect picture mismatch for "decode step"

- Quote: table row "| Decode step | One pass of the model that emits exactly one token | One click of an odometer |" vs §2.4's ELI5 autocorrect.
- Minimal fix: align on one picture: "| ... | Autocorrect offering one more word |". An odometer click is passive; emission is a choice.

### [POLISH] 16 — "the two hops" before any hop imagery in this chapter

- Quote: "This chapter slows the film down on the two hops that produce everything you perceive as 'speed'"
- Minimal fix: "the two stages" or "the two legs" — hops belong to chapter 1's nine-hop lifecycle; a cold reader hasn't got the map open.

### [POLISH] 17 — "e2e" abbreviation appears in the vocabulary table unexpanded

- Quote: "| Decode-time inequality | e2e ≈ TTFT + N × TPOT | Taxi fare: flag-drop plus per-mile |"
- Minimal fix: "end-to-end ≈ TTFT + N × TPOT" in the table (the row above defines "End-to-end latency," but the symbol switch costs a re-read).

### [POLISH] 18 — source note is insider jargon

- Quote: "(Hugging Face model configs and OpenAI's public tiktoken blobs.)"
- Minimal fix: "(public model-configuration files and OpenAI's published tokenizer data)" — keep the precise names in Appendix E.

### [POLISH] 19 — "quadrupled training cost" floats without its why

- Quote: "with token doubling implying roughly quadrupled training cost"
- Minimal fix: either one clause of why (attention work grows faster than length) or cut to "with token doubling sharply multiplying training cost" — the specific 2×→4× claim currently asks trust the reader can't give.

## Section grades (1–5; 5 = a beginner could teach it back)

| Section | Grade | Note |
|---|---|---|
| Opening + part context | 4 | Stakes land; two forward references (decode-time inequality, hops) |
| 2.1 Words before machinery | 4 | Strong ramp; "byte pair" and symbol `e2e` friction |
| 2.2 The atom the engine counts | 3 | Currency ELI5 lands; BPE bridge missing; token-bucket + cache sidebar stack |
| 2.3 Same text, different shapes | 5 | Best section: concrete, hedged, strawberry payoff teaches the deep lesson |
| 2.4 Generation is a relay race | 4 | Autocorrect ELI5 excellent; bandwidth paragraph is the heaviest beat (scaffolded, but no picture for it — chapter 3 owns the stairs) |
| 2.5 The four clocks | 5 | Four-clocks ELI5 + identity + reasoning-model wrinkle all land |
| 2.6 The decode-time inequality | 4 | Taxi ELI5 + budget inversion strong; "affine"/"call site" friction |
| Where the picture stops | 5 | Specific, honest, does its own job |
| Checkpoint | 4 | Q4/Q6 demand arithmetic confidence a beginner is just building |
| Closers (Build/Break/Prove/See) | 5 | All four concretely runnable; "See it" ties to real artifacts |

**Average: 4.3 / 5.**

## Three worst teaching gaps

1. **The BPE bridge (Finding 1).** The single load-bearing mechanism of the chapter's first half has a picture (invented shorthand) and a formalism (merge adjacent byte pairs) with no sentence connecting them. Every 2.3 edge case inherits the confusion. One sentence fixes it.
2. **Cache vocabulary leaks (Finding 4).** Three cache-dependent beats (uncached ITPM, the DeepSeek 31× box, "hits or misses in tokens") fire four chapters before caching exists for this reader. Glosses or relocation — otherwise the chapter's own "no unexplained jargon" contract is broken at its most numeric moment.
3. **Jargon labels at emotional peaks (Findings 5, 6).** "Low mutual information" and "affine" both arrive immediately after a successful plain-words explanation, converting a win into a wobble. The plain versions already exist in the text; the labels can be parenthesized or dropped at zero content loss.

## Analogy-collision scan (book-level)

- Restaurant "whole meal" (2.5) vs taxi "whole ride" (2.6) both model e2e. Low risk (both are durations), but one bridge clause — "same dinner, now priced like a meter" — would weld them.
- Currency (2.2) and broccoli stores (2.3) are complementary (exchange rate vs chopping style); no collision found.
- Relay race (section title) and autocorrect (ELI5) co-model serial generation; reinforcing rather than conflicting.
