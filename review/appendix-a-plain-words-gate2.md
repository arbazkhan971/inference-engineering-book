# Gate 2 Technical Editor Review — `manuscript/appendix-a-plain-words.md`

Scope read in full: STYLE.md, EDITORIAL_SYSTEM.md, GOAL.md, CHAPTER_MAP.md, all 431 lines of Appendix A, and the relevant dated digests in `research/`. Every entry's chapter attribution was verified against the cited chapter file; every numeric/magnitude claim was traced to a digest.

## Numbers audit — all traced, none untraceable

| Claim (Appendix A) | Line | Traced to |
|---|---|---|
| "16 tokens by default in vLLM" | 117 | `research/paged-attention-block-tables.md` (vLLM `DEFAULT_BLOCK_SIZE = 16`, fetched 2026-08-27); matches ch06 §6.2 with dated citation |
| "half price, served within 24 hours" | 371 | `research/batch-api-economics.md` (OpenAI/Anthropic/Google all 50% + ≤24 h, retrieved 2026-08-27); identical to ch16 vocab row |
| "tens to hundreds of thousands of entries" | 33 | `research/tokenizer-fundamentals.md` (~50k–256k cluster); ch02 "~50k–256k entries" |
| "GB-scale, TB/s-speed" (HBM) | 61 | ch03 dated chip table (80–192 GB, 3.35–8.0 TB/s); verbatim match to ch03 vocab |
| "sixteen levels per number" (INT4) | 195 | arithmetic (2⁴); verbatim match to ch09 vocab row |
| "a few hundred real inputs" (Calibration) | 203 | AWQ ~512 samples (`quantization-menu.md`); hedged wording matches ch09 ELI5 |
| "e2e ≈ TTFT + N × TPOT" | 51 | matches ch02's stated inequality (ch02 line 131 explicitly reconciles N vs N−1 against the identity in §2.5); digest `latency-vocabulary.md` supports |
| "429 / 529 … quota vs overloaded" | 27 | `research/429-529-retry-behavior.md`; matches ch01 vocab verbatim |
| "from F16 to 1-bit experiments" | 417 | verbatim from ch18 vocab; traced to llama.cpp GGUF docs (ch18 dated citation) |
| "Completions per second… met your latency bounds" | 115 | `research/goodput-and-slos.md` (DistServe); verbatim from ch05 vocab |

No invented or untraceable numbers. ✓

## Cross-checks — verified clean

- **~70 chapter attributions spot-verified against source chapters**, including the tricky dual ones: gateway (loose ch1 / precise ch16 ✓), prefix caching engine-vs-provider (ch6/14 ✓), CP (ch10/11 ✓), compaction (ch11/17 ✓), core memory (ch11/17 ✓), keep-alive (ch12/14 ✓), `prompt_cache_key` (ch14/17 ✓), fanout (ch15/16 ✓), usage object (ch12/16 ✓), normalizer (ch12/18 ✓), γ/α/τ symbols (ch08 ✓), shared expert / capacity factor / grouped GEMM / all-to-all (ch10 ✓), guarantee tier (ch13/16 ✓), burndown rate (ch15, Bedrock ✓), salt / breakpoint / TTL / write premium (ch14 ✓), all ch17 session terms (verbatim ✓), GGUF / quant ladder / unified memory / crossover (ch18 verbatim ✓).
- **Final-line claim** ("the chapter's own 'Words before machinery' table") verified: all 18 chapters carry the section. ✓
- **Terminology**: no `tokens/sec`/`tok/s`/`tokens per second` token-rate variants (goodput's "completions per second" is a different metric, correct); `Fanout` not `fan-outs`; `tinyengine` lowercase; zero British spellings; no double spaces, no smart quotes; em-dash spacing uniform. ✓
- A.1–A.4 section boundaries match Parts I–IV of CHAPTER_MAP.md. ✓

## Findings

1. **[P1] Acronym-expansion gaps violate the appendix's own contract** — `appendix-a-plain-words.md:341, 415, 69`
   - Exact text: "**RPM / TPM / RPD** — Requests, tokens, or requests-per-day ceilings. *(Ch. 15)*" / "**GGUF** — The single-file model container llama.cpp reads: weights, tokenizer, metadata. *(Ch. 18)*" / "**GEMM / GEMV** — Big matrix multiply (many rows at once) versus matrix-times-one-vector (the batch-of-one case). *(Ch. 3)*"
   - Why: The intro (line 5) promises "Acronyms are expanded in the entry itself," and STYLE.md makes expansion-at-first-use a hard rule. In these three entries the letters are never expanded: the M (per minute) is missing from RPM/TPM (the sibling entry ITPM/OTPM does it right); GGUF is left opaque although ch18 expands it ("GPT-Generated Unified Format"); GEMM/GEMV are described but not expanded although ch03 gives "general matrix-matrix multiply" / "general matrix-vector multiply." This is the book's reference shelf, where a reader looks up exactly these strings.
   - Replacement (line 341): "**RPM / TPM / RPD** — Requests per minute, tokens per minute, or requests per day: the quota ceilings. *(Ch. 15)*" · (line 415): "**GGUF (GPT-Generated Unified Format)** — The single-file model container llama.cpp reads: weights, tokenizer, metadata. *(Ch. 18)*" · (line 69): "**GEMM (general matrix-matrix multiply) / GEMV (general matrix-vector multiply)** — Big matrix multiply (many rows at once) versus matrix-times-one-vector (the batch-of-one case). *(Ch. 3)*"

2. **[P1] Undated pricing claim in durable reference prose** — `appendix-a-plain-words.md:371`
   - Exact text: "**Batch API** — Submit N requests as one job; half price, served within 24 hours. *(Ch. 16)*"
   - Why: STYLE.md's numbers discipline keeps pricing in dated boxes, "never in the durable-prose spine," and the technical-editor mandate (EDITORIAL_SYSTEM §3) explicitly asks "is a current product detail likely to decay?" — this one is. The claim traces to a dated digest (so the GOAL gate is met), but the glossary carries no snapshot marker; if a provider changes the 50%/24 h terms, Appendix C gets refreshed and this entry silently goes stale. Ch16 itself prints the same numbers only inside dated boxes.
   - Replacement: "**Batch API** — Submit N requests as one job; half price at all three majors, served within 24 hours (mid-2026 snapshot). *(Ch. 16)*"

3. **[P2] "Chunk" homonym not cross-flagged** — `appendix-a-plain-words.md:149` and `:273`
   - Exact text: "**Chunk** — A fixed-size slice of a long prompt's prefill. *(Ch. 7)*" and "**Chunk** — One provider-encoded event carrying one or more deltas. *(Ch. 12)*"
   - Why: The intro says that when one word is used differently across chapters "the entries say so plainly" — the gateway and prefix-caching entries do; the two unrelated Chunk senses (prefill chunk vs SSE chunk) don't reference each other, which stings in an artifact pitched as a reverse index.
   - Replacement: append "*(Not chapter 12's stream chunk — a different word entirely.)*" to line 149 and "*(Not chapter 7's prefill chunk.)*" to line 273, or an equivalent plain cross-note on each.

4. **[P2] Engine-side prefix caching defined by only one of the chapter's two indexes** — `appendix-a-plain-words.md:133`
   - Exact text: "**Prefix caching (engine-side)** — Reusing stored KV for a prefix seen before: a radix-tree lookup inside the serving engine."
   - Why: ch06 teaches two mechanisms — vLLM's hash chain and SGLang's radix tree (RadixAttention) — and the same appendix carries a separate "Hash chain (Ch. 6)" entry. Defining engine-side caching as "a radix-tree lookup" erases the mechanism the book's own vLLM-anchored entries (block size, block table) assume.
   - Replacement: "**Prefix caching (engine-side)** — Reusing stored KV for a prefix seen before: an index lookup inside the serving engine (hash chain in vLLM, radix tree in SGLang). Distinct from the *provider-billed* prompt caching of chapter 14, though both exploit the same reuse. *(Ch. 6, 14)*"

5. **[P2] Cache salt attribution omits chapter 6** — `appendix-a-plain-words.md:337`
   - Exact text: "**Cache salt** — A value mixed into the cache key to keep tenants apart. *(Ch. 14)*"
   - Why: The mechanism (`cache_salt` flag, first-block hash salting) is taught in ch06 (line 110), ch14 itself credits "chapter 6's engine-side hash chain" for it, and ch06's dependency table maps "cache_salt / tenant isolation" to "6; 14." The sibling prefix-caching entry carries the dual attribution; this one should too.
   - Replacement: "**Cache salt** — A value mixed into the cache key to keep tenants apart. *(Ch. 6, 14)*"

## Verdict summary

- **Correct:** every numeric claim traced to a dated digest; all cross-references and dual-sense entries verified against their chapters; terminology hygiene (tokens/s unification, fanout, US spelling, smart quotes, double spaces) clean; structure and section boundaries consistent with CHAPTER_MAP.md; the closing claim about `Words before machinery` tables is factually true for all 18 chapters.
- **Fixed:** none (review-only, no edits made).
- **Merge verdict:** OK with notes — apply the five one-line fixes above in a writer pass; none blocks correctness of what is taught.

Counts: P0 = 0 · P1 = 2 · P2 = 3
Verdict: MINOR