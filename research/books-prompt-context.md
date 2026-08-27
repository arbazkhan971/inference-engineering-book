# Research: Prompt/Context Engineering Books — Overlap Risk & Serving-Physics Gap

researched: 2026-08-27

## Key facts

1. **Prompt engineering is a mature print category.** O'Reilly shipped at least three dedicated titles in 2024: *Prompt Engineering for Generative AI* (Phoenix & Taylor, May 2024), *Prompt Engineering for LLMs* (Berryman & Ziegler, Nov 4, 2024, 282 pp.), and *LLMs in Production* devotes Ch. 7 to prompt engineering (Jan 2025 listing). Chip Huyen's *AI Engineering* (O'Reilly, 2025) includes Ch. 5 "Prompt Engineering" (pp. 211–251). [O'Reilly listings; aie-book ToC]

2. **The dedicated prompt books stop at craft and evaluation.** Berryman & Ziegler's 11-chapter table of contents runs: Introduction, Understanding LLMs, Moving to Chat, Designing LLM Applications, Prompt Content, Assembling the Prompt, Taming the Model, Conversational Agency, LLM Workflows, Evaluating LLM Applications, Looking Ahead — no chapters on cost, caching, latency, or serving. [awesome-llm-books ToC transcription]

3. **"Context engineering" became a book category only after mid-2025.** Andrej Karpathy endorsed the term on Jun 25, 2025 ("the delicate art and science of filling the context window"), amplified by Simon Willison (Jun 27, 2025) and Shopify CEO Tobi Lütke; Anthropic published "Effective context engineering for AI agents" on Sep 29, 2025. [Willison; the-decoder; Anthropic]

4. **A 2025–2026 wave of context-engineering books is application-level.** Verified listings: R.C. Weston, *Context Engineering: The Definitive Guide for LLMs* (KDP, Sep 18, 2025, 386 pp.); Chandler Newman, *The Context Engineering Handbook* (KDP, Jul 22, 2025, 182 pp., RAG/LlamaIndex); *Context Engineering for Multi-Agent Systems* (Packt, Nov 2025); Boni García, *Context Engineering* (Manning, MEAP Jun 2026, est. Nov 2026) whose ToC covers instructions, retrieval, tools, memory, context management, evaluation, governance; Ken Imoto, *Context Engineering in Practice* (Feb 2026). A Leanpub title (ctrulove) does include "The Cost of Context: Tokens as a First-Class Resource" and context-window mechanics, but at concept level. [Google Books; Manning; bonigarcia GitHub; kenimoto.dev; leanpub]

5. **Only one mainstream print book reaches inference mechanics.** Huyen's *AI Engineering* Ch. 9 "Inference Optimization" (p. 405) covers TTFT/TPOT metrics, AI accelerators, model optimization, and "Inference Service Optimization" including KV cache management, batching/parallelism, prefilling/decoding decoupling, and prompt caching. The author's official chapter summary states: "KV caching is significantly more important for workloads with long contexts… Prompt caching, on the other hand, is crucial for workloads involving long, overlapping prompt segments or multi-turn conversations." Ch. 5 also has "Context Length and Context Efficiency" (p. 218); Ch. 10 lists "Step 4. Reduce Latency with Caches" (p. 460). [aie-book ToC + chapter-summaries]

6. **Other production books are model-centric, not serving/economics-centric.** Suhas Pai's *Designing Large Language Model Applications* (O'Reilly, 2024) Ch. 9 covers reducing compute, speeding decoding, and reducing storage (quantization-focused); Packt's *LLM Engineer's Handbook* Ch. 8 "Inference Optimization" frames the problem as computational/memory requirements for deployment. [piesauce.substack extended ToC; Medium review; Packt ToC]

7. **Prompt caching economics lives in vendor docs, not books.** Anthropic's docs describe prefix caching with `cache_control` and 5-minute or 1-hour TTLs; its pricing sheet carries separate "5m Cache Writes," "1h Cache Writes," and "Cache Hits & Refreshes" SKU columns. OpenAI launched prompt caching (automatic, default-enabled) with a 50% discount on cached input; its current docs describe cached-input rates "discounted up to 90%." No print book surveyed lists cache-write premiums, TTL pricing, or cache-hit discounts in its ToC/summaries. [Claude platform docs; Anthropic pricing PDF; openai.com; OpenAI dev docs]

8. **Context-window serving physics (KV memory math, PagedAttention, continuous batching) is covered by a paper and web-native books, not print.** The PagedAttention paper (Kwon et al., arXiv 2309.06180) is the canonical reference; recent web-only books cover it in depth, e.g. "Chapter 24: PagedAttention and vLLM as a virtual-memory system for KV cache" (kunwar.page), "Chapter 9: Inference Optimization & Efficient Serving" (llmbook.apartsin.com), and a web chapter computing dollars-per-million-token at scale ("~5B tokens/day, ~$15M/month") (socratopia.app, citing Anthropic 1.25× write / 0.1× read, batch 50%). [arXiv; kunwar.page; apartsin; socratopia]

## Coverage map

| Topic | Where covered today |
|---|---|
| Prompt craft/optimization | Phoenix & Taylor; Berryman & Ziegler; Huyen Ch. 5; LLMs in Production Ch. 7 |
| Context curation (RAG, memory, compaction) | Weston; Newman; Packt multi-agent; García (MEAP); Imoto; Anthropic engineering blog |
| Inference mechanics (survey level) | Huyen Ch. 9 only print book with KV cache + prompt caching + batching |
| Model-level optimization | Pai Ch. 9; LLM Engineer's Handbook Ch. 8 |
| **Prompt caching economics (TTL pricing, write/read multipliers)** | **No print book found** — vendor docs (Anthropic, OpenAI) and web books (socratopia Ch. 18) |
| **Context-window serving physics (KV memory math, PagedAttention, scheduling)** | **No print book found** — arXiv PagedAttention; web-native books |

## Series angle

The white space is the connective tissue: no print book links prompt/context token decisions to serving physics and cache economics. Prompt books (2024) stop at craft + evaluation; the 2025–26 context-engineering wave treats context as information (retrieval, memory, compaction), not as a serving cost driver; Huyen Ch. 9 is ~40 survey pages inside a general AI-engineering book; cache pricing changes quarterly and therefore lives in vendor docs. An inference-engineering series can own: (1) token-cost arithmetic — cache-write premium vs. cache-read discount, TTL tradeoffs, batch discounts, with dated provider anchors; (2) context-window physics — prefill compute, KV-cache memory math, batching/scheduling; (3) prompt/context decisions (truncate vs. compact vs. cache) framed as serving-economics choices. Overlap risk to manage: Huyen Ch. 9/10 — differentiate on depth and economics, not topic; differentiation from prompt and context-engineering titles is structural.

## Sources

Kept:
- aie-book ToC — https://github.com/chiphuyen/aie-book/blob/main/ToC.md
- aie-book chapter summaries — https://github.com/chiphuyen/aie-book/blob/main/chapter-summaries.md
- Prompt Engineering for LLMs (O'Reilly listing) — https://www.oreilly.com/library/view/prompt-engineering-for/9781098156145/
- Prompt Engineering for LLMs ToC transcription — https://github.com/Jason2Brownlee/awesome-llm-books/blob/main/books/prompt-engineering-for-llms.md
- Prompt Engineering for Generative AI (O'Reilly) — https://www.oreilly.com/library/view/prompt-engineering-for/9781098153427/
- LLMs in Production Ch. 7 — https://www.oreilly.com/library/view/llms-in-production/9781633437203/Text/chapter-7.html
- Weston, Context Engineering (Google Books) — https://books.google.com/books/about/Context_Engineering.html?id=JIya0QEACAAJ
- Newman, Context Engineering Handbook (Google Books) — https://books.google.com/books/about/The_Context_Engineering_Handbook.html?id=apx70QEACAAJ
- Packt, Context Engineering for Multi-Agent Systems — https://www.oreilly.com/library/view/context-engineering-for/9781806690053/
- García, Context Engineering (Manning) — https://www.manning.com/books/context-engineering ; ToC — https://github.com/bonigarcia/context-engineering/
- Imoto — https://kenimoto.dev/books/context-engineering/ ; Leanpub/ctrulove — https://leanpub.com/contextengineering ; https://github.com/ctrulove/context-engineering-book
- Karpathy/Willison/Lütke — https://simonwillison.net/2025/jun/27/context-engineering/ ; https://the-decoder.com/shopify-ceo-and-ex-openai-researcher-agree-that-context-engineering-beats-prompt-engineering/
- Anthropic context engineering — https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents
- Anthropic prompt caching doc — https://platform.claude.com/docs/en/build-with-claude/prompt-caching ; pricing PDF — https://www-cdn.anthropic.com/files/4zrzovbb/website/5678bc2f5978e5bcd4f1fe7c14b2c72284dcf9f8.pdf
- OpenAI prompt caching — https://openai.com/index/api-prompt-caching/ ; https://developers.openai.com/api/docs/guides/prompt-caching
- Pai book ToC — https://piesauce.substack.com/p/book-update-designing-large-language ; https://medium.com/devreads/designing-large-language-model-applications-a-comprehensive-review-650bcbb92eba
- LLM Engineer's Handbook — https://www.packtpub.com/en-be/product/llm-engineers-handbook-9781836200062
- PagedAttention — https://arxiv.org/html/2309.06180
- Web-native serving books — https://www.kunwar.page/chapter/024-pagedattention-and-vllm-as-a-virtual-memory-system-for-kv-cache ; https://llmbook.apartsin.com/part-2-understanding-llms/module-09-inference-optimization/index.html ; https://www.socratopia.app/library/computer-architecture-en/chapter-24 ; https://www.socratopia.app/library/ai-engineering-en/chapter-18

Dropped:
- LinkedIn review of two prompting books — redundant with primary ToCs
- Goodreads/VitalSource listings — retailer noise, no ToC depth
- pirated PDF mirror (ucem.edu.ni) — excluded on principle
