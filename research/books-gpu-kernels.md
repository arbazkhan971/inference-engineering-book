# Research: GPU Computing & Kernel Books — Deep-End Canon, Harness-Engineer Scope, Inference Chapter Map

researched: 2026-08-27

## Key facts

- **PMPP is the spine — and a 5th edition just landed.** *Programming Massively Parallel Processors: A Hands-on Approach* (Hwu, Kirk, El Hajj), Morgan Kaufmann/Elsevier, 2026, ~680 pp (Elsevier shop: print date Feb 27, 2026; Amazon: Jun 17, 2026). Publisher TOC: 25 chapters in four parts. Part I "Fundamental Concepts" = Ch2 heterogeneous data-parallel computing, Ch3 multidimensional grids, **Ch4 compute architecture and scheduling, Ch5 memory architecture and data locality, Ch6 performance considerations** — the memory-hierarchy/occupancy core. Part III/IV include Ch10 reduction, Ch15 sparse matrix computation, Ch18 deep learning, and chapters marked "(new)" on the 5e TOC: Filtering (Ch14), Wavefront Algorithms (Ch16), Multi-GPU API (Ch19), and **Ch23 Advanced Optimizations for Matrix Multiplication** — the GEMM chapter inference engineers care about. [Elsevier shop; Amazon]
- The 4th edition (2022) used the same Part I numbering — Ch4 compute architecture and scheduling, Ch5 memory architecture and data locality, Ch6 performance considerations, Ch7 "Convolution: An introduction to constant memory and caching" — per its O'Reilly TOC, so Ch5–6 references hold across editions. [O'Reilly]
- **Professional CUDA C Programming** (Cheng, Grossman, McKercher), Wiley/Wrox, Sept 2014, 528 pp, 10 chapters. Verified TOC: Ch3 CUDA execution model has explicit sections "Latency Hiding" (p. 90) and "Occupancy" (p. 93); Ch4 global memory (coalesced access, unified memory); Ch5 shared/constant memory (banks, warp shuffle); Ch6 streams and concurrency; Ch9 multi-GPU incl. GPUDirect RDMA. Fermi/Kepler-era examples, but still the best mid-depth optimization workflow. [Wiley-VCH TOC]
- **The CUDA Handbook v2.0** (Nicholas Wilt) is free online. TOC: Ch5 Memory, Ch6 Streams/Events/Graphs, Ch7 Kernel Execution, **Ch8 Streaming Multiprocessors**, Ch10 Texturing, **Ch17 Matrix Multiplication**, Appendix B "Converting float to half" — reference-grade depth, plus the only dedicated FP16 appendix in the canon. [cudahandbook.com]
- **Programming in Parallel with CUDA** (Ansorge), Cambridge UP, 2022 — most inference-relevant per-page coverage: §1.12 Occupancy (p. 20), §2.4 Latency Hiding and Occupancy, §2.8–2.9 matrix multiplication and tiled matmul, Ch7 streams/events with §7.7 CUDA Graphs, Ch10 profiling with Nsight Compute (occupancy + roofline figures), **Ch11 Tensor Cores and FP16**. [Cambridge/pageplace TOC]
- **General-Purpose Graphics Processor Architectures** (Aamodt, Fung, Rogers), Morgan & Claypool Synthesis Lecture, 2018: chapters on the SIMT core (instruction/register data flow) and memory system — the "why occupancy works" deep end. [doi.org; SIGARCH]
- **Legacy tier:** *CUDA by Example* (Sanders & Kandrot, Addison-Wesley, July 2010) — 12 chapters, texture memory (Ch7), graphics interop (Ch8), streams/multi-GPU (Ch10–11); no modern occupancy/profiling tooling. *CUDA Programming* (Cook, Morgan Kaufmann, 2nd ed. 2016) — Ch6 memory, Ch9 optimization; predates Volta-era tensor cores. [InformIT; Elsevier]

## Coverage map (verified chapters → inference topics)

| Inference topic | PMPP 5e (2026) | Other canon |
|---|---|---|
| Memory hierarchy / locality | Ch5; Ch7 convolution (4e subtitle: constant memory & caching) | Cheng Ch4–5; Handbook Ch5; Cook Ch6 |
| Occupancy / scheduling / latency hiding | Ch4, Ch6 | Cheng Ch3 (pp. 90–93); Ansorge §1.12, §2.4; Handbook Ch7–8; Aamodt SIMT core |
| Coalescing / divergence | Ch6, Ch10 reduction | Cheng Ch3–4; Ansorge Ch3 |
| GEMM / matmul kernels | Ch23 (new), Ch18 deep learning | Handbook Ch17; Ansorge §2.8–2.9, Ch11 tensor cores |
| Precision (FP16) | Ch18 (depth unverified) | Ansorge Ch11; Handbook App. B |
| Streams / events / CUDA graphs | — | Ansorge Ch7 (§7.7); Handbook Ch6; Cheng Ch6 |
| Sparsity | Ch15 sparse matrix | Cheng Ch8 (cuSPARSE) |
| Profiling | Ch6 (optimization checklist) | Ansorge Ch10 (Nsight Compute); Cheng Ch10 |
| Multi-GPU / scaling | Ch19 (new), Ch22 cluster | Cheng Ch9; Ansorge Ch9 |

## What a harness engineer does NOT need (skip-first, per publisher TOCs)

Texture memory and graphics interop (CUDA by Example Ch7–8; Ansorge Ch5; Handbook Ch10); domain case studies — PET scanners (Ansorge Ch8), Monte Carlo/Ising (Ansorge Ch6), electrostatic potential maps (PMPP Ch20), N-body and image correlation (Handbook Ch14–15); pattern-chapter depth beyond the core lesson (PMPP Ch8 stencil, Ch13 sorting, Ch14 filtering, Ch16 wavefront); MPI/GPUDirect cluster material unless the harness is distributed (PMPP Ch22, Cheng Ch9 tail, Ansorge Ch9.6); OpenACC and cuFFT/cuRAND detail (Cheng Ch8); and the legacy tier wholesale — CUDA by Example and Cook predate tensor cores, CUDA graphs, and Nsight-era tooling. Minimal core: **PMPP Ch2–6 + Cheng Ch3–6, plus Ansorge Ch7/10/11** — enough to read Nsight profiles, judge bandwidth-bound vs occupancy-bound kernels, and reason about batching/streams/graphs in serving.

## Series angle

Treat PMPP 5e Part I (Ch2–6) as assigned reading; cross-reference the series' own memory-hierarchy and occupancy chapters to PMPP Ch5–6 instead of duplicating them. Position the free-online CUDA Handbook as lookup reference and Aamodt et al. as "only if you write kernels." The series' whitespace: none of these books covers serving concerns — CUDA graphs for decode latency (Ansorge §7.7 is closest), KV-cache memory behavior, tensor-parallel execution, or benchmark-harness methodology — so cite them for fundamentals, not for inference practice.

## Sources

Kept:
- PMPP 5e TOC (fetched) — https://shop.elsevier.com/books/programming-massively-parallel-processors/hwu/978-0-443-43900-1
- PMPP 4e TOC — https://www.oreilly.com/library/view/programming-massively-parallel/9780323984638/xhtml/Contents.xhtml
- PMPP 5e listing (pages/date) — https://www.amazon.com/Programming-Massively-Parallel-Processors-Hands/dp/0443439001
- Professional CUDA C Programming full TOC (fetched) — https://www.wiley-vch.de/en/areas-interest/computing-computer-sciences/professional-cuda-c-programming-978-1-118-73932-7
- The CUDA Handbook chapters (fetched) — https://www.cudahandbook.com/book/
- Ansorge TOC (fetched PDF) — https://api.pageplace.de/preview/DT0400.9781108858885_A45556082/preview-9781108858885_A45556082.pdf ; https://www.cambridge.org/core/books/programming-in-parallel-with-cuda/C43652A69033C25AD6933368CDBE084C
- CUDA by Example TOC (fetched) — https://www.informit.com/store/cuda-by-example-an-introduction-to-general-purpose-9780131387683
- Cook CUDA Programming 2e TOC — https://shop.elsevier.com/books/cuda-programming/cook/978-0-12-802879-7
- Aamodt et al. — https://doi.org/10.2200/s00848ed1v01y201804cac044 ; https://www.sigarch.org/other-announcements/book-release-general-purpose-graphics-processor-architectures/

Dropped: ebook-mirror TOCs (zoboko, usermanual.wiki — unauthorized/stale); retailer blurbs (VitalSource, Skillsoft — derivative); LinkedIn GTC post (social; only confirms 5e availability).

## Gaps

PMPP 5e's changes beyond the four "(new)" chapter titles are unconfirmed (no primary changelog); Ch18 deep-learning depth unverified. Section-level confirmation that "occupancy" appears by name in PMPP Ch6 pending access to the e-text. No canonical print book yet covers modern LLM-inference kernels (FlashAttention/PagedAttention era) — next digest candidate: *Machine Learning Systems* (Reddi) and current preprint/paper literature.
