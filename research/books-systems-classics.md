# Classic systems books as companion reading (DDIA, System Performance/Brendan Gregg, Understanding Distributed Systems)
researched: 2026-08-27 · researcher: glm-5.3-flash

## Key facts — bullets, every claim dated and sourced

- **DDIA, 2nd edition** (Kleppmann & Riccomini, O'Reilly, March 2026; 670 pages; ISBN 9781098119065 pbk / 9781098119027 ebook) is a full revision with a new co-author and new technologies/trends integrated. (Kleppmann blog, 2026-03-24: https://martin.kleppmann.com/2026/03/24/designing-data-intensive-applications-2e.html)
- **DDIA 2e structure** — three parts, 13 chapters: Foundations of Data Systems (1 Trade-Offs, 2 Nonfunctional Requirements, 3 Data Models, 4 Storage and Retrieval, 5 Encoding and Evolution); Distributed Data (6 Replication, 7 Sharding, 8 Transactions, 9 The Trouble with Distributed Systems, 10 Consistency and Consensus); Derived Data (11 Batch Processing, 12 Stream Processing, 13 A Philosophy of Streaming Systems). Chapter list per the ddia-companion study guide for the 2nd edition (accessed 2026-08-27: https://arunav-bhattacharya.github.io/ddia-companion/); publisher full TOC behind O'Reilly paywall (https://www.oreilly.com/library/view/designing-data-intensive-applications/9781098119058/).
- **DDIA chapters most relevant to an inference-curious engineer**: Ch. 4 (storage/indexing — KV stores, log-structured vs. B-tree, transferable to weight/KV-cache storage), Ch. 6–7 (replication/sharding — model serving sharding and replica placement), Ch. 11 (batch processing — throughput-oriented thinking, maps to offline batch inference), Ch. 12–13 (stream processing, event logs — token streaming, request/event pipelines). Note: 1st-edition numbering differed (batch=ch. 10, stream=ch. 11); use 2e numbering. (ddia-companion, accessed 2026-08-27; ddia-notes ch. summaries on GitHub, 2025)
- **DDIA on the transferable trio**: caching is treated via derived data and materialized views/read-through patterns in Parts I and III; batching is the core of Ch. 11 (bounded datasets, throughput vs. latency, minutes-to-hours latency vs. seconds for stream systems — per engineermaxxing.com DDIA ch. 11 summary, 2025); queueing appears as event logs/brokers (Kafka-style) in Ch. 12 (stream processing chapter summaries: pedro-muller.com, 2025; ddia-companion, 2026-08-27).
- **Systems Performance, 2nd ed.** (Brendan Gregg, Addison-Wesley/Pearson) TOC: 1 Intro, 2 Methodologies, 3 Operating Systems, 4 Observability Tools, 5 Applications, 6 CPUs, 7 Memory, 8 File Systems, 9 Disks, 10 Network, 11 Cloud Computing, 12 Benchmarking, 13 perf, 14 Ftrace, 15 BPF, 16 Case Study (+ appendices, glossary). (brendangregg.com 2nd-edition book page, accessed 2026-08-27: https://www.brendangregg.com/systems-performance-2nd-edition-book.html; Pearson listing; O'Reilly TOC)
- **Systems Performance chapters for inference engineers**: Ch. 5 Applications, Ch. 6 CPUs, Ch. 7 Memory (host-level resource analysis for GPU/CPU serving hosts), Ch. 10 Network, Ch. 12 Benchmarking (methodology for LLM benchmarks), Ch. 1–2 (USE method, "Linux Perf Analysis in 60 seconds" — a reusable triage workflow). (brendangregg.com TOC and O'Reilly section listings, accessed 2026-08-27)
- **Systems Performance on the trio**: it covers caching (CPU/memory/file-system cache hierarchies, chs. 6–8), batching (via queueing/throughput analysis in Applications and Benchmarking chapters), and queueing theory in its methodology chapters — hedge: exact section titles for queueing theory were not directly verified in this pass; Gregg's book is known to include queueing theory in Ch. 2 (Methodologies) per the O'Reilly TOC preview, but section-level confirmation is pending.
- **Understanding Distributed Systems, 2nd ed.** (Roberto Vitillo, self-published; complete rewrite of 1st ed.) — five parts, 33 chapters: I Communication (chs. 2–5: TCP, TLS, DNS, HTTP/REST); II Coordination (chs. 6–13: system models, failure detection, clocks, Raft/leader election, replication, consistency, transactions, sagas/outbox); III Scalability (chs. 14–23: caching, CDNs, partitioning, load balancing, data stores, microservices, messaging); IV Resiliency (chs. 24–28: redundancy, bulkheads/cells, timeouts/retries/circuit breakers, load shedding/rate limiting); V Maintainability (chs. 29–33: testing, CD, monitoring/observability). (synchronium source wiki, accessed 2026-08-27: https://synchronium.github.io/software-architecture-wiki/sources/understanding-distributed-systems.html; corroborated by publisher site https://understandingdistributed.systems/ and Amazon listing ISBN 9781838430214)
- **UDS on the trio**: caching — Ch. 14 (HTTP caching, Cache-Control/ETag, reverse proxies) and Ch. 20 (local vs. external caches, hit ratio, thundering herd); queueing — Ch. 23 Messaging (one-way vs. request-response vs. pub-sub, Kafka/SQS, dead-letter channels, backlogs) and Ch. 28 (load leveling via message channels); explicit batching coverage not confirmed in this pass. (synchronium wiki, 2026-08-27)
- **UDS chapter for inference engineers**: Part III (Scalability) plus Ch. 28 load shedding/rate limiting — directly maps to inference-gateway concerns (rate limiting, load shedding, queue-based load leveling).

## Coverage map — what exists, how deep

| Topic | DDIA 2e | Systems Performance 2e | UDS 2e |
|---|---|---|---|
| Caching | Indirect (derived data, materialized views, read patterns) | Deep at hardware/OS level (CPU, memory, FS caches) | Practical/app-level (HTTP caching, hit ratio, thundering herd) |
| Batching | Ch. 11 (first-class, theory + practice) | Via throughput/benchmarking analysis | Thin/unconfirmed |
| Queueing | Ch. 12 event logs/brokers | Queueing theory in methodology (section unverified) | Ch. 23 messaging, Ch. 28 load leveling |
| Distributed consistency | Chs. 6–10 (deepest of the three) | Not covered | Chs. 6–13 (practical Raft/consistency) |
| Observability/perf analysis | Minimal | Definitive (chs. 4–16) | Chs. 31–32 monitoring/observability (app level) |

Complementarity: DDIA = data-system internals and trade-off reasoning; Systems Performance = host/hardware measurement; UDS = breadth-first service-level patterns. The three stack cleanly with no major overlap.

## Series angle — what this means for Inference Engineering Vol. II positioning

- Vol. II can position itself as the layer **above** these classics: none of the three covers GPU scheduling, KV-cache management, or model-serving specifics; DDIA's replication/sharding and UDS's load-shedding chapters give the vocabulary Vol. II can extend to inference gateways and multi-model serving.
- The most citable companion chapters for Vol. II: DDIA chs. 6–7, 11–12; Systems Performance chs. 2, 5–7, 10, 12; UDS chs. 20, 23, 28. Each maps to an inference-specific chapter (replication→model replicas, batching→dynamic batching, load shedding→gateway backpressure).
- Timeliness: DDIA 2e (March 2026) is current and should be referenced instead of 1e chapter numbers to avoid confusion (batch/stream are chs. 11–12 in 2e, not 10–11).

## Sources — primary URLs

- https://martin.kleppmann.com/2026/03/24/designing-data-intensive-applications-2e.html (author announcement, edition metadata)
- https://dataintensive.net/ (official book site)
- https://www.oreilly.com/library/view/designing-data-intensive-applications/9781098119058/ (publisher listing)
- https://arunav-bhattacharya.github.io/ddia-companion/ (2e chapter list)
- https://www.brendangregg.com/systems-performance-2nd-edition-book.html (author's official 2e TOC)
- https://www.oreilly.com/library/view/systems-performance-2nd/9780136821694/toc.xhtml (publisher TOC)
- https://www.pearson.com/en-gb/subject-catalog/p/systems-performance/P200000000297/9780136821656 (publisher listing)
- https://understandingdistributed.systems/ (publisher/author site)
- https://synchronium.github.io/software-architecture-wiki/sources/understanding-distributed-systems.html (2e part/chapter structure)
- https://www.amazon.com/-/es/Understanding-Distributed-Systems-Second-applications/dp/1838430210 (Amazon 2e listing)

```acceptance-report
{
  "criteriaSatisfied": [
    {
      "id": "criterion-1",
      "status": "satisfied",
      "evidence": "Digest written to /Users/arbaz/.pi/agent/sessions/--Users-arbaz-Projects-personal--/subagent-artifacts/outputs/3f7a68d9-7df1-4d6a-bc2d-f1f7e553711d/books-systems-classics.md with sourced key facts, coverage map, series angle, and primary-source URL list"
    }
  ],
  "changedFiles": [
    "/Users/arbaz/.pi/agent/sessions/--Users-arbaz-Projects-personal--/subagent-artifacts/outputs/3f7a68d9-7df1-4d6a-bc2d-f1f7e553711d/books-systems-classics.md"
  ],
  "testsAddedOrUpdated": [],
  "commandsRun": [],
  "validationOutput": [
    "TOCs verified against author sites (brendangregg.com, martin.kleppmann.com) and publisher/companion sources; DDIA 2e chapter list cross-checked with ddia-companion"
  ],
  "residualRisks": [
    "DDIA 2e full publisher TOC behind O'Reilly paywall; chapter list taken from a third-party study companion",
    "Systems Performance queueing-theory section placement and UDS batching coverage not directly verified in primary text"
  ],
  "noStagedFiles": true,
  "diffSummary": "New research digest file created (~850 words)",
  "reviewFindings": [
    "no blockers"
  ],
  "manualNotes": "Exa rate-limited; used DuckDuckGo provider fallback. Project-path write was overridden by runtime output path per instructions.",
  "notes": ""
}
```

Summary:
1. Digest completed for all three classics with dated, sourced facts: DDIA 2e (March 2026, 13 chapters), Systems Performance 2e (16 chapters), UDS 2e (5 parts/33 chapters).
2. Recommended companion chapters for inference engineers identified — DDIA 6–7/11–12, Systems Performance 2/5–7/10/12, UDS 20/23/28 — with a caching/batching/queueing coverage map.
3. File written to the runtime output path; residual risk: DDIA 2e TOC verified via third-party companion, and some section-level details remain unverified in primary text.