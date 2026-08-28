# Pedagogy audit — ch17 Cache-aware harness design (beginner simulation)

audited: 2026-08-28 · auditor: glm-5.3-flash (worker, cold-reader protocol)
Protocol: smart 25-year-old non-engineer, chapter read in isolation; every H2 walked slowly; ELI5 blocks tested for jargon leaks; all arithmetic re-checked by hand.

## Verdict up front

This is one of the most teachable chapters in Part IV: five ELI5 blocks that mostly land, arithmetic that is shown rather than asserted, checkpoints with visible answers, and an honest picture-stops section. No reader is *lost* anywhere. The gaps are all the same species: **the hash mechanics under the whole chapter are never glossed locally**, and two chapter-11 number clusters arrive before the reader knows what is being measured.

## Findings

1. **[CONFUSING]** — Intro, second line: *"Every request your harness sends is a cache key before it is a conversation."* "Cache key" appears before the 17.1 table, and the table defines only `prompt_cache_key` (the routing hint), not the underlying "the bytes ARE the key" idea. Cold fix (minimal): *"…is a cache key before it is a conversation — the bytes themselves are what the provider files it under."*

2. **[CONFUSING]** — 17.2, mechanics paragraph: *"The provider hashes your rendered prompt from position zero"* and deploy playbook: *"Prediction needs no measurement, only the hash chain."* Neither "hashes" nor "hash chain" is glossed in this chapter (chapter 6 pointer is implied, not stated). For the cold reader the chapter's core mechanism — identical bytes produce the same fingerprint, the first differing byte kills everything after — is taught only by consequence. Minimal fix: one clause at first use, *"hashes your rendered prompt from position zero (computes a running fingerprint of the bytes; chapter 6's chain)"*.

3. **[CONFUSING]** — 17.3, opening stats: *"(73% baseline recall at 190K tokens dropping to 40% at 50% compaction, 7% at 98%; only 17% of side constraints surviving on average)"*. Number-dense recall of chapter 11's benchmark arrives before the reader knows what "recall" measures here. Minimal fix: *"…compaction's quality costs — how much of the original conversation a compacted model can still answer questions about (73% baseline recall at 190K tokens dropping…)"*.

4. **[CONFUSING]** — 17.2, deploy playbook step 2: *"The herd event becomes a staggered roll."* "Herd event" is a coinage with no 17.1 table row and no local gloss (it means: every session's cache invalidating together, like a herd spooking). Inferable but unanchored. Minimal fix: *"the herd event — every live session going cold at once — becomes a staggered roll."* (Or add a table row: *Herd event | A change that invalidates every session's cache simultaneously | A fire alarm emptying the whole building*.)

5. **[CONFUSING]** — 17.2, Layer 1: *"Tool churn goes through deferred loading — stubs plus tool search."* "Stubs" is unexplained jargon (chapter 13 pointer only). Minimal fix: *"deferred loading — placeholder entries plus on-demand tool search"*.

6. **[CONFUSING]** — Unit discipline arrives one section late: "token-equivalents" first appears in the 17.3 chart title and prose, but the gloss — *"in uncached-equivalent units with write 1.25× and read 0.1×"* — is in 17.5. A cold reader meets `15K token-equivalents` in the breakeven before knowing the unit means "expressed in fresh-input-token prices." Minimal fix: add the parenthetical at 17.3's first use: *"(15K token-equivalents — priced as if fresh)"*.

7. **[CONFUSING]** — 17.4, replay-rule paragraph: *"Reads walk backward at most 20 blocks per breakpoint."* Block magnitude is never anchored (chapter 6 owns it). The *consequence* is taught well (silent miss), but "20 blocks" carries no intuitive size. Minimal fix: *"(a block is the provider's cache unit — a small, fixed span of tokens)"*.

8. **[CONFUSING]** — 17.2, layered contract intro: *"Recall the render order — `tools` → `system` → `messages` — and its blast radii (chapter 14)."* "Blast radii" is vivid but unglossed; the three radii are then given correctly one sentence later, so this is a half-step fix: *"— and how far each change's damage spreads (chapter 14's blast radii)."*

9. **[POLISH]** — 17.4 ELI5 opens: *"Your season ticket works like a hotel keycard."* Two pictures fused in one breath; both table rows (cold resume = season ticket; keep-alive = keycard swipe) are being served at once. It works, but the fusion makes a slow reader re-read. Minimal fix: keep the fusion, flag it — *"...a season ticket that behaves like a hotel keycard: every use pushes its expiry back…"* (one word class of change).

10. **[POLISH]** — The 17.1 table's rehydration picture (*"Refilling the darkroom's trays before printing again"*) is never called back in 17.4, which uses keycard/season-ticket language throughout. Either 17.4's replay-rule paragraph gets one darkroom clause (*"rehydration is refilling the trays before you can print — with the same chemistry, byte for byte"*) or the table row swaps to the keycard frame. Currently one promised picture never ships.

11. **[POLISH]** — "Where the picture stops" opens *"The courier office, the keycard, the handbook — each earns its keep"* but omits 17.6's fifth frame (the shipping company / accountant). One closing break exists implicitly ("the ledger prices the trade, it does not abolish it") but the frame is never named. Minimal fix: add the accountant to the list with its one-line break (*"The accountant counts events, not meaning — a ledger row cannot tell you the summary was wrong"*).

12. **[POLISH]** — 17.2 ELI5 contains *"Premium members' photostats survive an hour"* — a soft jargon leak inside an ELI5 block (a membership tier is real-world enough that most readers will pass it, but it is the only non-everyday term inside any of the five ELI5 blocks).

13. **[POLISH]** — Intro: *"chapter 16 gave you a fleet and a meter; this chapter parks the fleet in a garage with a memory."* The garage picture is fresh and unused afterward; the fleet/meter inheritance is fine for series readers but the sentence does double duty. Acceptable as-is; if touched, drop the garage and keep fleet+meter.

## Arithmetic re-checks (all verified by hand)

- Breakeven: 30K + 3K·t = 15K·t → t = 2.5 turns ✓; "40K→10K breaks even in under four turns": 10 + 3·t... context-dependent, stated as same-arithmetic ✓ directionally sound.
- Resume box: 200K × 0.1× × $2/M = $0.04 ✓; 200K × 1.25× × $2.50/M = $0.50 ✓; 12.5× = 1.25/0.1 ✓.
- 1-hour plan: 2 + 0.1N < 1.25N ⇔ N > 1.74 ⇒ N ≥ 2 ✓; 2× vs 1.25× = 60% dearer ✓.
- Fleet: 1.25 + 0.1·9 = 2.15 ✓; 10/2.15 ≈ 4.7× ✓.
- Checkpoint Q1/Q2/Q4/Q6 all recompute exactly ✓ (Q4: 25K+6K+9×8K = 103K vs 325K ⇒ 3.2× ✓).

## Section grades (1–5, cold non-engineer teachability)

| Section | Grade | One-line why |
|---|---|---|
| Intro (pre-17.1) | 3.5 | Thesis lands; "cache key" + fleet/meter cross-deps wobble the cold start |
| 17.1 Words before machinery | 4.5 | 14 tight rows; strongest on-ramp in Part IV so far |
| 17.2 Session as byte-exact asset | 4.0 | Rich ELI5 + clean layering; hash mechanics unglossed (findings 2/4/5/8) |
| 17.3 Rewrite decisions | 4.25 | Warm/cold/pre-idle trichotomy is superb; ch11 stat dump + late unit gloss |
| 17.4 Resumption & rehydration | 4.5 | Best-scaffolded arithmetic in the chapter; TTL clock example is concrete |
| 17.5 Subagents & forks | 4.5 | Cleanest section; math fully shown; caveats dated and specific |
| 17.6 Session ledger | 4.0 | Dense but appropriate capstone; table earns its density |
| Where the picture stops | 5 | Specific, honest, per-frame breaks |
| Checkpoint | 5 | Self-contained, answers visible, arithmetic checkable |
| Build/Break/Prove/See | 4.5 | Concrete injections; byte-hash CI test is the memorable artifact |

**Average: 4.3 / 5**

## Three worst teaching gaps

1. **The fingerprint is never shown.** Findings 1–2: the entire chapter's mental model — bytes in, fingerprint out, first difference kills the tail — is taught only through prices and consequences. A cold reader can follow every dollar figure and still not know *what a hash is*. One glossed clause at 17.2's first use fixes it.
2. **The chapter-11 stat dump.** Finding 3: four percentages in one parenthetical before the reader knows the quantity being measured. One clause of "what recall means here" converts the dump into evidence.
3. **Unit gloss one section late.** Finding 6: "token-equivalents" is the chapter's currency and its explanation lives two sections after first use.

## What to keep exactly as is

The warm/cold/pre-idle compaction trichotomy; the field note (byte-exactness as invariant); the 17.5 ELI5 and its "return the finding, not the browsing" framing; the checkpoint's trap-spotting questions (Q1's "compacting at resume would have been the worst response" teaches judgment, not formula); the picture-stops section's candor about isolation's blindness cost.
