All verification complete. Here is the Gate 6 audit.

## Review — Gate 6: book-wide cross-reference + consistency audit

### Verification performed (all 27 manuscript files + companion + tools)

**Structural integrity — verified correct:**
- **Chapter number ↔ filename ↔ title: 18/18 exact match** against `CHAPTER_MAP.md` (e.g., `# 16. Routing, fallbacks, and the money meter` ↔ `16-routing-fallbacks-money-meter.md` ↔ map entry). Appendices A–F letters ↔ filenames ↔ titles 6/6.
- **Part header quotes: 18/18 present**; part assignments (I: 1–4, II: 5–11, III: 12–16, IV: 17–18) match the map and front-matter description.
- **Section numbering contiguous everywhere**: ch1 .1–.8, ch2 .1–.6, ch3 .1–.8, ch4 .1–.7, ch5 .1–.7, ch6 .1–.6, ch7 .1–.6, ch8 .1–.6, ch9 .1–.7, ch10 .1–.6, ch11 .1–.6, ch12 .1–.6, ch13 .1–.6, ch14 .1–.5, ch15 .1–.7, ch16 .1–.8, ch17 .1–.6, ch18 .1–.6; A.1–A.4, B.1–B.7, C.1–C.10, D.1–D.8, E.1–E.4, F.1–F.6. **Every numbered cross-reference resolves** (checked: 1.2, 3.2–3.5, 4.3/4.5/4.6, 5.2/5.5, 6.5, 10.1–10.4, 11.2–11.6, 12.3/12.5, 13.2 (incl. §13.2), 15.3/15.5, 16.2–16.7, 17.2–17.6, 18.4, D.8, F.3 item 5, B/C card pointers).
- **Closers 18/18**: `Where the picture stops`, `Checkpoint`, `Build it / Break it / Prove it / See it in the wild` in every chapter. **No numbered "checkpoint N" cross-refs exist** (other "checkpoint" uses are model-checkpoint terminology — consistent).
- **Semantic pointer spot-checks all resolve**: ch11's "chapter 5's 49-request example" → 05:146; ch11's "208 → 165 → 101 tokens/s" droop → 04:159 exact; ch11's "c·(N² + N·M + M²/2)" → 03:132; "the table in 10.1" / "taxonomy from 10.2" / "Megatron box in 10.3" / "10.4's snapshot box" → all present at cited sections; ch10's verbatim quote of ch4's "chapter 10 divides KV too" → 04:184 exact; ch12's "quoted in full in chapter 2" (GLM-5.3 1.6/30.1/7.5 s) → 02:121 exact; "mall-shopper of section 5.2" → 05:28; `tools/build.sh`, `--check-mermaid`, `SKIP_FIGURES=1` → exist in tools/; `QUALITY_REPORT.md §3` → exists.
- **Units**: `tokens/s` unified book-wide (zero `tok/s`, zero `t/s`); ms vs s convention consistent (ms for per-token clocks, s for totals, conversions shown explicitly); no `sec`/`msec` variants. MB/GB used only for external constants (provider file caps, EPUB size, historical paper figures); KiB/MiB/GiB for KV-derived arithmetic — with one drift (P2 below).
- **Terminology**: `tinyengine` lowercase 100% consistent (no TinyEngine/Tiny Engine variants); `Words before machinery` present as X.1 in all 18 chapters and referenced consistently (appendix-a:429); ELI5 format uniform.

### Findings

**P1-1 — `SchemaGuard` promised as a tinyengine component; absent from the companion.**
- `manuscript/13-structured-output-is-not-a-prompt-trick.md:170` — "Build tinyengine's `SchemaGuard`."
- `manuscript/16-routing-fallbacks-money-meter.md:203` — Router's routing table includes "task tags from chapter 13's SchemaGuard."
- Evidence: zero matches for `SchemaGuard` anywhere in `companion/`; `router.ts` `RouteRule = { alias, deployments, pinSessions }` — no task tags. Contradicts `appendix-d:16` ("every interface this table's chapters named exists in the code, under the name the chapter used"), `appendix-d:5` ("Every 'Build it' in the book, assembled in one place"), and `STYLE.md` Forbidden ("Promising code that never appears in the companion").
- Smallest fix: drop the tinyengine attribution in prose — ch13:170 "Build a `SchemaGuard` validator in your harness"; ch16:203 "guarantee tier, lane, and task tags" (remove the SchemaGuard attribution) — or ship a `schema-guard.ts`.

**P1-2 — Grammar-count and event-count contradictions between ch12, Appendix D, and the shipped code.**
- "Three grammars": `12:30` (§12.2 heading), `12:32` (ELI5), `12:60`, `12:66` (snapshot box header "the three SSE grammars" **which then enumerates four** — Chat, Responses, Anthropic, Gemini — and closes "All three verified"), `12:174` ("any of the three grammars") vs `appendix-d:59` ("any of the four grammars (`openai-chat`, `openai-responses`, `anthropic`, `gemini`)"), appendix D module table ("four provider grammars"), companion README, and `stream-normalizer.ts` `Provider` union (4 values).
- "Four internal events": `12:60`, `12:174`, `18:39`, `appendix-d:29` ("4 events" node), `appendix-d:59` vs the code's `Event` union = **six** types (`text_delta`, `tool_call_delta`, `tool_call`, `usage`, `stop_reason`, `incomplete_call`) — appendix D:61–63 itself names `incomplete_call`.
- Fix: adopt "four grammars / three providers" in ch12 (the snapshot box already lists all four); restate the event grammar as "four streaming events plus the terminal assembled `tool_call` and the `incomplete_call` failure marker."

**P1-3 — ch12's usage-event contract omits the cache-write bucket.**
- `12:128` ("one internal ledger — fresh input, cached input, output, reasoning") and `12:174` ("`usage(fresh_in, cached_in, out, reasoning)`") vs `18:28` ("**four-bucket usage events** … from chapter 12"), `appendix-b:79` ("Chapter 12 owns the four-bucket identities"), `14:108` (fresh input derived "chapter 12's normalizer output" minus cached **and cache-write** tokens), and the code's usage event `{freshIn, cachedIn, cacheWriteIn, out, reasoning}`. Internally contradictory within §12.5 itself (12:121 "the same four facts" lists write fields per provider; 12:128 drops them).
- Fix: add the write bucket to both sentences (fresh, cached, written, out, reasoning).

**P2-1 — Field-name casing drift, contradicting appendix-d:16's "under the name the chapter used":** `ttft_seconds` (12:174, D:59) vs code `ttftSeconds`; `tool_call_delta(call_id, fragment)` vs code `(callId, name?, fragment)`; snake_case field list in 12:174 vs camelCase exports. Fix: camelCase in prose or a one-clause note.

**P2-2 — Unit drift on the Qwen3-8B 128K KV figure:** "18 GB" at `11:40` and `appendix-b:40` vs "18 GiB" in ch4's table (the cited source; 144 KiB × 131,072 = 18 GiB exactly; ch4's own footnote defines 1 GiB ≈ 1.07 GB). Fix: "18 GiB" (or "≈19 GB") in both places.

**P2-3 — Stale `node:` builtin counts:** companion README ("the two `node:` modules used") and `appendix-d` D.8 ("Three `node:` built-ins … crypto, assert, fs") vs actual **four** (`crypto`, `assert/strict`, `fs`, `process` — `env.d.ts` declares all four; four CLI files import `node:process`). Fix: correct both counts.

**P2-4 — Field note format variance:** 18× `> **Field note.**` vs 2× titled `> **Field note: title.**` (`16:110`, `18:140`). No style rule mandates one form; normalize if desired.

**P2-5 — Line-count drift for `session-store.ts`:** Appendix D table says 114 shipped; companion README says 113 (actual ≈114). One-line doc drift; align README.

### Counts — total pointers checked ≈ 660

| Pointer class | Count checked | Result |
|---|---|---|
| Chapter refs (in-prose "chapter N"/ranges + `Ch. N` short forms) | ≈490 (≈150 Appendix A glossary attributions, ≈95 Appendix E source annotations, ≈40 Appendix B card pointers, ≈180 ch01–18/front/back prose, ≈25 Appendix C/F) | all targets exist (1–18); all semantic spot-checks resolve |
| Section refs (`X.Y`, `section X.Y`, `§X.Y`, appendix `X.Y`) | ≈90 | all resolve against full header map |
| Appendix refs (`Appendix A–F` + letter refs) | ≈30 | all resolve |
| tinyengine module/symbol refs | ≈25 (10 modules + 9 symbols) | 24 resolve; `SchemaGuard` does not (P1-1) |
| Checkpoint pointers | 18 anchors | present 18/18; 0 numbered cross-refs exist |
| Tool refs | 3 (`tools/build.sh`, `--check-mermaid`, `SKIP_FIGURES=1`) | all exist in tools/ |

**Merge verdict: OK with notes** — no P0s, no broken chapter/section/appendix pointers; the three P1s are manuscript↔companion contract mismatches (ch12/ch13/ch16/Appendix D) that should be fixed before release.

### Deliverable artifact (read-only run; no write tool available — persist to `review/gate6-xref-audit.md`)

```markdown
# Gate 6 — Book-wide cross-reference + consistency audit (2026-08-27)

Scope: all 27 manuscript files, CHAPTER_MAP.md, STYLE.md, companion/tinyengine (10 modules + env.d.ts + README + package.json), tools/ (11 files), QUALITY_REPORT.md. Read-only.

## Verdict: OK with notes — 0 P0, 3 P1, 5 P2. ≈660 pointers checked; all structural pointers resolve.

## Verified correct
- Chapter↔filename↔title 18/18; appendix letter↔filename↔title 6/6 (vs CHAPTER_MAP.md).
- Part quotes 18/18, assignments match map (I:1–4, II:5–11, III:12–16, IV:17–18).
- All section numbering contiguous; every numbered cross-ref resolves (incl. D.8, F.3 item 5, §13.2).
- Closers 18/18 (Where the picture stops / Checkpoint / Build it–Break it–Prove it–See it in the wild). No numbered checkpoint cross-refs exist.
- Semantic spot-checks: ch5 "49 requests" (05:146); ch4 droop 208/165/101 (04:159); ch3 decomposition (03:132); ch10 10.1–10.4 targets; ch4:184 quote; ch2:121 GLM quote; 05:28 mall-shopper; tools/build.sh + flags; QUALITY_REPORT §3.
- Units: tokens/s unified (no tok/s, no t/s); ms/s convention consistent; MB/GB reserved for external constants, KiB/MiB/GiB for KV arithmetic (one drift → P2-2).
- Terminology: tinyengine lowercase 100%; "Words before machinery" as X.1 in all 18 chapters; ELI5 format uniform.

## Findings

- [P1] 13-structured-output-is-not-a-prompt-trick.md:170 + 16-routing-fallbacks-money-meter.md:203 — "tinyengine's SchemaGuard" / "task tags from chapter 13's SchemaGuard"; SchemaGuard exists nowhere in companion/ (router.ts RouteRule has no task tags). Violates appendix-d:16 "under the name the chapter used" and STYLE.md's no-unshipped-promises rule. Fix: drop tinyengine attribution in both lines (or ship schema-guard.ts).
- [P1] 12-the-streaming-contract.md:30,32,60,66,174 + 18:39 + appendix-d:29,59 — "three grammars" (ch12, incl. a snapshot box headed "the three SSE grammars" that enumerates four) vs "four grammars" (Appendix D, README, code Provider union); "four internal events" (ch12/ch18/D) vs six Event types in stream-normalizer.ts (D:61–63 itself names incomplete_call). Fix: standardize on four grammars; restate as "four streaming events + terminal tool_call + incomplete_call marker".
- [P1] 12-the-streaming-contract.md:128,174 — usage event/ledger lists omit the cache-write bucket, contradicting 18:28 ("four-bucket usage events … from chapter 12"), appendix-b:79, 14:108, and code {freshIn, cachedIn, cacheWriteIn, out, reasoning}. Fix: add write bucket to both lines.
- [P2] 12:174 + appendix-d:59 — `ttft_seconds`/snake_case field names vs code `ttftSeconds`/camelCase; contradicts appendix-d:16 claim. Fix: camelCase in prose.
- [P2] 11:40 + appendix-b:40 — "18 GB" vs ch4 table's "18 GiB" for the same Qwen3-8B 128K KV figure (144 KiB × 131,072 = 18 GiB). Fix: 18 GiB (or ≈19 GB).
- [P2] companion/tinyengine/README.md + appendix-d D.8 — node: builtin count stale ("two"/"three") vs actual four (crypto, assert/strict, fs, process; env.d.ts declares four). Fix: correct counts.
- [P2] 16:110, 18:140 — Field note format variance: titled variants vs the 18 plain "> **Field note.**" instances. Normalize if desired.
- [P2] companion/README.md module table — session-store.ts "113" vs Appendix D "114" (actual ≈114). Fix: align README.

## Counts
≈660 pointers: ≈490 chapter-level (incl. ~150 Appendix A glossary attributions, ~95 Appendix E annotations, ~40 Appendix B cards), ≈90 section-level, ≈30 appendix-level, ≈25 module/symbol (1 unresolved: SchemaGuard), 18 checkpoint anchors, 3 tool/flag refs.
```