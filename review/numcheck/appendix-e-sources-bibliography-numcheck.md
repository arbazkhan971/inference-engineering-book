# Numcheck — Appendix E (source notes and bibliography) + zz-back-matter

checked: 2026-08-28 · checker: glm-5.3-flash (worker, post-fix re-verification)

**Method.** Both files read in full; every numeric claim extracted; each traced
to its dated digest in research/ by content search; derived arithmetic
recomputed. Corpus-level claims verified by direct measurement of research/
(72 files, word counts, URL/arXiv-ID extraction across all digests).

## Corpus-level claims (Appendix E §E.1)

| Claim | Measured / source | Verdict |
|---|---|---|
| "71 digests" | research/ holds 72 files; 71 carry the digest stamp | TRACED |
| "every digest carries `researched: 2026-08-27`" | 71/72 stamped; `books-free-alternatives.md` lacks the stamp (artifact-recovery stripped its header) | MISMATCH (P2) |
| "each 600–1,200 words" | outliers: kdp-market-data 577, llmops-production 567, positioning-wedge 1201, session-resumption-cache-rehydration 1207 (wc-style split) | MISMATCH (P2, boundary) |
| "more than 570 distinct URLs" | 595 distinct URLs across all digests | TRACED |
| "65 distinct arXiv papers" | exactly 65 distinct arXiv IDs across URL and bare-text forms | TRACED |
| "retrieved 2026-08-27" warranty | matches digest stamps | TRACED |

## Part I/II paper anchors (§E.3)

| Claim | Digest evidence | Verdict |
|---|---|---|
| PaLM 46.2% MFU on 6,144 TPU v4 | inference-vs-training.md: "6144 TPU v4 chips reached 46.2%" | TRACED |
| Pope 29 ms/token, TPU v4 | inference-vs-training.md | TRACED |
| FlashAttention BERT-large 15%, GPT-2 3× | gpu-memory-hierarchy.md ("15%", "3x speedup") | TRACED |
| 22 languages token tax (2305.13707) | tokenizer-numbers-edge-cases.md: "across 22 typologically diverse languages" | TRACED |
| 24.5% formatting input reduction (2508.13666) | tokenizer-numbers-edge-cases.md | TRACED |
| Llama 3: 8 KV / 64 query heads (2407.21783) | kv-cache-bytes-formula.md | TRACED |
| DeepSeek-V3 576-element latent (2412.19437) | kv-cache-bytes-formula.md: "512 dims + 64 RoPE = 576" | TRACED |
| Gemma 5:1 local:global | kv-cache / attention-variant digests | TRACED |
| vLLM useful-KV 20.4–38.2% | paged-attention-block-tables.md: "only 20.4%–38.2% of allocated KV cache" | TRACED |
| DistServe "1.6-vs-5.6/10 islands" | chunked-prefill-pd-split.md: "1.6 req/s/GPU; islands ≈5.6 (prefill), ≈10 (decode)" | TRACED |
| Mooncake 525% / 75% | chunked-prefill-pd-split.md | TRACED |
| EAGLE τ series 5.84–6.62 (temp 0) | spec-decode-acceptance-data.md: Vicuna-13B 6.62 … distill-8B 5.84 | TRACED |
| AWQ ~512 calibration samples | quantization-menu.md | TRACED |
| BF16/FP8 "500k+ evaluations" (2411.02355) | quantization-quality-benchmarks.md ("500k") | TRACED |
| gpt-oss 128-expert / top-4 / MXFP4 (2508.10925) | quantization-menu.md | TRACED |
| Context parallelism 77 s / 1M tokens / 128 H100 (2411.01783) | long-context-serving digests ("77 s", "128 H100") | TRACED |
| TokenPilot up-to-87% cost cut (2606.17016) | subagent-context-isolation-cache.md / compaction digest ("87%") | TRACED |
| Lost in Compaction ~17% survive; 73%→40%→7% decay; Zenodo 10.5281/zenodo.20273814 | compaction digests: "73%; after 50% = 40% (−33pp); after 98% = 7%"; zenodo.20273814 present | TRACED |
| All 63 bibliography arXiv IDs present in corpus | set-difference: NONE missing | TRACED |

## Part III/IV contract anchors (§E.3)

| Claim | Digest evidence | Verdict |
|---|---|---|
| Outlines backend 0.22 req/s, 38.5 s TTFT, PR #10785 | constrained-decoding-grammars.md | TRACED |
| XGrammar 100× / 80× | constrained-decoding-grammars.md | TRACED |
| Hidden Cost of Structure: 11-model split | structured-output-costs-tension.md ("11 models") | TRACED |
| Capacity, Not Format: 4 models, 5 benchmarks | structured-output digests ("4 models and 5 benchmarks") | TRACED |
| OpenAI caching: 1,024-token minimum, ≥30-min TTL | prompt-caching digests ("1024", "30 min") | TRACED |
| SRE Book K=1.1 adaptive throttling | rate-limit digests ("1.1") | TRACED |
| openai-python #2722; LiteLLM #27823; Claude Code #42338/#71659; vLLM #9565/#10087 | all IDs present in respective digests | TRACED |
| Batch: OpenAI 50%/24 h; Anthropic 50%, "most jobs under an hour" | batch-api-economics.md: "50% off… within 24 hours"; "most batches finish in under 1 hour" (Anthropic) | TRACED |
| Claude capture/resume ≤4.5 / ≥4.6 boundary | cancellation-timeout-semantics.md ("≤4.5") | TRACED |
| Spawn cost `1.25 + 0.1·(N−1)` | subagent-context-isolation-cache.md | TRACED |
| vLLM FP8 KV 2026-04-22: 14.9% / 54% / ~7k break-even | kv-cache/quantization digests ("14.9") | TRACED |
| H100 $2.39–2.49/hr; checked 2026-08-02 and 2026-08-27 | gpu-economics digest ("$2.39", "2.49", "2026-08-02") | TRACED |
| Artificial Analysis Scout 8.3×, R1 6.1× | provider-latency-snapshot-2026.md / same-model-different-providers.md | TRACED |
| BSR nodes 491300 / 271581011 / 211759007011 | books-kdp-market-data.md (all three present) | TRACED |
| Q4_K_M default (llama.cpp) | local-edge-inference.md | TRACED |

## zz-back-matter claims

| Claim | Evidence | Verdict |
|---|---|---|
| "200 billion tokens … in four months" | Author bio credential, identical in prologue and front-matter lineage; metered publicly (ccrank.dev/user/arbaz-khan). Not a digest number by design | AUTHOR-CLAIM (consistent across surfaces) |
| "on the order of 1.6 billion tokens a day" (prologue companion claim) | 200e9 ÷ ~125 days ≈ 1.6e9/day | DERIVED-OK |
| "well over one hundred GLM-5.3 model instances" | PROGRESS.md records 48+14 driver iterations and ~300+ fanout agent runs | TRACED (repo history) |
| "seventy-plus dated, sourced evidence digests" | 71 dated digests | TRACED |
| "six-gate editorial system" | GOAL.md lists the six inherited gates (Writer, Technical editor, Code tester, Book builder, Proofreader, Final adversarial review) | TRACED |
| "retrieved on 2026-08-27" | 71/72 digests stamped (see P2-1) | TRACED (with P2-1 caveat) |
| "© 2026 · First edition · Volume II of the Harness Engineering series" | Consistent with GOAL.md, cover, front matter; Vol. I published (harness-engineering repo) | TRACED |

## Counts

- **Claims checked: 47 claim groups (≈200 individual figures incl. the 63-ID arXiv set, 3 BSR nodes, 6 issue/PR numbers)**
- **P0 = 0 · P1 = 0 · P2 = 2**

## Findings

- **[P2-1] Appendix E §E.1 — "every digest carries `researched: 2026-08-27`"**
  Current text: "The corpus was assembled on a single day — every digest carries
  `researched: 2026-08-27`"
  Why: `books-free-alternatives.md` lacks the stamp (its header was stripped
  when recovered from a child artifact; the research itself was performed
  2026-08-27). 71 of 72 files carry it. Fix (parent's choice): restore the
  stamp line to that digest (research/ is normally never edited — this is a
  metadata repair, not a content edit), or soften to "every digest in the
  corpus carries its retrieval date; 71 of the 72 research files are stamped
  2026-08-27". One-line fix; the "71 digests" count itself is consistent.
- **[P2-2] Appendix E §E.1 — "each 600–1,200 words"**
  Current text: "The corpus: 71 digests, each 600–1,200 words"
  Why: four digests sit marginally outside the band by my count (577, 567,
  1201, 1207). Two of the four are book-landscape digests, not
  technical-corpus members — if the sentence's "corpus" means the 71 technical
  digests only, only session-resumption-cache-rehydration (1207) and, if
  counted, the landscape outliers violate it. Fix: "roughly 600–1,200 words"
  — one word, keeps the claim honest against any counting method.

No P0/P1. All load-bearing bibliography numbers trace to dated digests; all
63 bibliography arXiv IDs exist in the corpus; derived arithmetic (1.6B/day;
τ range endpoints) recomputes clean; back-matter meta-claims are consistent
with the repo's own recorded history.
