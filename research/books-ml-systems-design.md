# ML Systems Design Books — Serving Coverage (Designing ML Systems + ML System Design Interview)

researched: 2026-08-27

## Key facts

1. **Designing Machine Learning Systems (Chip Huyen, O'Reilly, May 17 2022, 388 pp)** dedicates Chapter 7, "Model Deployment and Prediction Service," to serving. The chapter covers: deployment myths (e.g., "you only deploy one or two models"), four modes of prediction serving — batch prediction; online prediction with batch features; online/streaming prediction with streaming features; and a hybrid — model compression (low-rank factorization, knowledge distillation, pruning, quantization), cloud-vs-edge placement, and model compilation/optimization (intermediate representations, ML-powered optimizers, WebAssembly). [O'Reilly ch. 7](https://www.oreilly.com/library/view/designing-machine-learning/9781098107956/ch07.html); [chapter summary repo](https://github.com/serodriguez68/designing-ml-systems-summary/blob/main/07-model-deployment-and-prediction-service.md)

2. **Its batching treatment is pre-modern-LLM.** Batching appears only as grouping inferences to exploit GPU vectorization and as "time windows" for online batching; there is no iteration-level/continuous batching, no KV cache, and no LLM inference stack anywhere in the chapter or its summaries. [Ch. 7 summary](https://github.com/serodriguez68/designing-ml-systems-summary/blob/main/07-model-deployment-and-prediction-service.md)

3. **The timing explains the gap.** The book shipped May 2022 — before continuous batching appeared in Orca (USENIX OSDI, July 11–13, 2022) and before PagedAttention/vLLM (vLLM announcement June 20, 2023; SOSP paper published Oct 3, 2023) made KV-cache management a mainstream serving concern. [Google Books](https://books.google.com/books/about/Designing_Machine_Learning_Systems.html?id=EzhwEAAAQBAJ); [Orca paper](https://www.usenix.org/conference/osdi22/presentation/yu); [vLLM blog](https://blog.vllm.ai/2023/06/20/vllm.html); [PagedAttention, ACM DL](https://dl.acm.org/doi/10.1145/3600006.3613165)

4. **Still first edition as of 2026.** The only 2025 refresh is a July 2025 audiobook of the same content; the author's book page lists no revised edition. [huyenchip.com/books](https://huyenchip.com/books/); [O'Reilly audiobook](https://www.oreilly.com/videos/designing-machine-learning/9781663753076/)

5. **Level: production, not interview.** The subtitle is "An Iterative Process for Production-Ready Applications," Chapter 1 contrasts "ML in research versus production," and reviews frame it as the production-grounded counter-example to academic ML books; it is often *used* for interview prep but was not written for it. [O'Reilly page](https://www.oreilly.com/library/view/designing-machine-learning/9781098107956/); [review](https://dev.to/ii-x/designing-machine-learning-systems-the-only-book-that-doesnt-waste-your-time-and-why-the-rest-4llp)

6. **Machine Learning System Design Interview (Ali Aminian & Alex Xu, ByteByteGo, 2023, 284 pp) is explicitly interview-level.** Marketing copy: "ML system design interviews are the most difficult to tackle… if you need to prepare for an ML interview, this book is specifically written for you." It teaches a 7-step framework with 211 diagrams across 10 case-study chapters (Visual Search; Street View Blurring; YouTube Video Search; Harmful Content Detection; Video Recommendation; Event Recommendation; Ad Click Prediction; Similar Listings; Personalized News Feed; People You May Know). [Author site](https://www.aliaminian.com/books); [Google Books](https://books.google.com/books/about/Machine_Learning_System_Design_Interview.html?id=iYDHzwEACAAJ)

7. **Serving in MLSDI is a framework step, not engine internals.** Deployment appears inside each case study as a solution stage (infrastructure choices, accuracy-vs-latency-vs-cost trade-offs), with no serving-system depth; reviewers criticize that 8 of 10 chapters are search/recommendation variants, making the deployment discussion repetitive and shallow. [Review](https://www.luckybookshelf.com/machine-learning-system-design-interview-by-ali-aminian-and-alex-xu/); [framework review](https://medium.com/javarevisited/review-is-machine-learning-system-design-interview-worth-it-ad03d14903ae)

8. **Neither book covers modern LLM serving internals** — no continuous batching, KV cache, or speculative decoding appears in either TOC, the official chapter summaries, or community chapter notes. Absence is attested from TOCs and chapter-level notes (both books are paywalled full-text; noted as residual risk). [DMLS ToC/repo](https://github.com/chiphuyen/dmls-book); [MLSDI ToC](https://www.aliaminian.com/books)

9. **The gap is already being filled elsewhere by the same ecosystem:** Huyen's follow-up AI Engineering (O'Reilly, Dec 4 2024, 534 pp) dedicates Chapter 9 to inference optimization, explicitly covering batching, quantization, KV caching, and continuous batching. [Google Books](https://books.google.com/books/about/AI_Engineering.html?id=S7M1EQAAQBAJ); [ch. 9 notes](https://alexstrick.com/posts/2025-02-07-ai-engineering-chapter-9.html); [ch. 9 notes](https://jameshu.io/books/ai-engineering/ch09-llm-deployment-infrastructure/index.html)

## Coverage map

| Serving topic | DMLS (2022, production) | MLSDI (2023, interview) |
|---|---|---|
| Batch vs online prediction modes | Deep: 4 modes + trade-offs | Per-case-study choice only |
| Model compression / quantization | 4 techniques + fairness trade-offs | Mentioned as a latency lever |
| Hardware placement (cloud/edge), compilation | Yes (IRs, WASM, optimizers) | Light |
| LLM batching schedulers / continuous batching | Absent (predates Orca) | Absent (case studies are recsys/search) |
| KV cache / PagedAttention | Absent (predates vLLM) | Absent |
| Interview frameworks & diagrams | None | Core (7 steps, 211 diagrams) |
| Monitoring / drift | Dedicated chapters (8–10) | Framework step |

## Series angle

These two books define the "ML systems design" baseline readers already own: breadth over serving depth. DMLS treats serving as a deployment decision layer (mode selection, compression, placement); MLSDI compresses it into interview-sized steps. Both stop exactly where modern inference engineering begins — continuous batching and KV-cache management arrived July 2022–June 2023, after both texts, and neither author has revised them (DMLS remains 1st edition; MLSDI's LLM answer is the application-level GenAI System Design Interview companion, not serving internals). An inference-engineering series can be pitched as the missing third tier: pick up where DMLS ch. 7 ends, and give interview candidates the serving depth MLSDI lacks. Huyen's own AI Engineering ch. 9 validates that demand for dedicated inference-optimization coverage.

## Sources

- [O'Reilly — DMLS ch. 7, Model Deployment and Prediction Service](https://www.oreilly.com/library/view/designing-machine-learning/9781098107956/ch07.html) — primary serving-chapter scope
- [DMLS chapter summary repo (ch. 7)](https://github.com/serodriguez68/designing-ml-systems-summary/blob/main/07-model-deployment-and-prediction-service.md) — detailed serving topics, batching framing
- [chiphuyen/dmls-book (official repo, ToC + summaries)](https://github.com/chiphuyen/dmls-book) — official structure
- [Google Books — DMLS metadata (May 17 2022, 388 pp)](https://books.google.com/books/about/Designing_Machine_Learning_Systems.html?id=EzhwEAAAQBAJ) — pub date
- [huyenchip.com/books](https://huyenchip.com/books/) + [O'Reilly audiobook (July 2025)](https://www.oreilly.com/videos/designing-machine-learning/9781663753076/) — still 1st edition
- [aliaminian.com/books (official MLSDI + GenAI ToCs)](https://www.aliaminian.com/books) — official TOCs, 7-step framework, 211/280+ diagrams
- [Google Books — MLSDI (ByteByteGo 2023, 284 pp)](https://books.google.com/books/about/Machine_Learning_System_Design_Interview.html?id=iYDHzwEACAAJ) — pub metadata
- [Lucky Bookshelf — MLSDI review](https://www.luckybookshelf.com/machine-learning-system-design-interview-by-ali-aminian-and-alex-xu/) — repetition/shallowness critique
- [USENIX OSDI 2022 — Orca (continuous batching)](https://www.usenix.org/conference/osdi22/presentation/yu) + [vLLM blog (June 20 2023)](https://blog.vllm.ai/2023/06/20/vllm.html) + [PagedAttention SOSP '23](https://dl.acm.org/doi/10.1145/3600006.3613165) — timeline anchors for the gap
- [Google Books — AI Engineering (Dec 4 2024, 534 pp)](https://books.google.com/books/about/AI_Engineering.html?id=S7M1EQAAQBAJ) + [ch. 9 notes (KV cache, continuous batching)](https://alexstrick.com/posts/2025-02-07-ai-engineering-chapter-9.html) — where the gap is filled
- Dropped: dev.to and Medium long-form reviews (opinion-heavy, low evidentiary value); prachub.com interview pages (topic-adjacent, not about these books); jacksonms.gov mirrored PDF (unauthoritative scan).
