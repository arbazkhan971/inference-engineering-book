# Gate-6 companion attack — findings

attacked: 2026-08-28 · attacker: glm-5.3-flash worker (Gate-6 adversarial pass)
target: `companion/tinyengine` @ HEAD (dist compiled from source; sources unmodified)
artifacts added: `tests/attack-gate6.ts` (compiled + run as `node dist/tests/attack-gate6.js`), `fixtures/attack/` (CLI probes)
determinism: `npm test` ×2 — both green, identical output.

## Counts

**P0 = 0 · P1 = 7 · P2 = 11 · HELD = 14 attacks**

No P0: nothing destroys data, hangs, or breaches the book's security boundary.
The seven P1s are real correctness holes in the money and admission paths —
exactly the paths the book teaches operators to trust.

---

## P1 findings

### P1-1 · stream-normalizer: `data:null` crashes ingest (A1)
- **Repro:** `n.ingest('data:null')` → `TypeError: Cannot read properties of null (reading 'usage')` at `chat()` line 75.
- **Expected:** null/array/string JSON payloads skipped like unparseable lines (the file's own contract: "meta-only … never crash").
- **Actual:** raw crash — one bad keep-alive payload kills the whole stream loop.
- **Fix:** after `JSON.parse`, guard `typeof chunk !== "object" || chunk === null → return []` (arrays too: `data:[1,2]` reaches `c.usage` as `undefined.usage` on an array — non-crash but garbage-shaped).

### P1-2 · stream-normalizer: string-typed usage poisons the meter with NaN (A2)
- **Repro:** `data:{"usage":"unavailable","choices":[]}` → usage event with `freshIn: NaN` (`Math.max(0, NaN) === NaN`).
- **Expected:** non-numeric usage fields emit 0 or drop the event loudly.
- **Actual:** NaN flows into `CacheLedger.record` → `s.fresh` becomes NaN → `hitRate` NaN forever for that session. A wrapper that renames usage fields (ch16's suspect #1) silently corrupts instead of flagging.
- **Fix:** numeric guard in `usageEvt` (`Number.isFinite` each field, else 0 + incomplete/flag event).

### P1-3 · rate-scheduler: failed TPM reservation leaks an RPM slot (B1)
- **Repro:** `QuotaLedger`, `rpm:2, tpm:100`; `reserve(100)` → true; `reserve(1)` → false (TPM empty, **RPM already debited**); `reserve(0)` → false — the second RPM slot is gone with no request sent.
- **Expected:** atomic reservation — a rejected TPM leaves RPM untouched.
- **Actual:** under tight RPM, TPM misses convert into phantom 429s a request never caused.
- **Fix:** check TPM first, or credit the RPM token back on TPM failure.

### P1-4 · rate-scheduler: bedrock overrun never debited (B2)
- **Repro:** book 36k (3k input + 1k write + 32k max); actual final = 3k + 1k + 32k×10 burndown = **324k**; `reconcile` credits `max(0, 36k−324k)=0` and debits nothing; a following `reserve(900_000)` **still succeeds** against a 1M bucket.
- **Expected:** overrun (final > booked) debits the difference or raises an overrun alarm.
- **Actual:** a fleet of high-burndown overrunners sails past TPM with the ledger green.
- **Fix:** in `reconcile`, when `final > booked`, debit the delta (via a bucket debit) or emit an overrun event; ch15's text ("re-credits the unused reservation") is silent on the overrun direction — worth one sentence in the book too.

### P1-5 · cache-ledger: unknown model throws raw TypeError mid-meter (C1)
- **Repro:** `record("s1", {...}, "m2-unknown")` → `TypeError: Cannot read properties of undefined (reading 'cacheWriteMultiplier')`.
- **Expected:** a renamed alias (ch16's named suspect: "a bucket the meter does not know") prices 0 + emits a loud mispriced event, or throws a NAMED error the caller routes.
- **Actual:** raw TypeError kills the whole ledger loop — the exact failure mode the book tells operators to design against.
- **Fix:** explicit `prices[model]` check with named `UnknownModelError` or a `mispriced` event.

### P1-6 · cache-ledger vs cache-hit-gate: two shipped hit-rate formulas disagree (C2b)
- **Repro:** fresh 1k, cached 1k, writes 4k → `CacheLedger.hitRate()` = **16.7%** (denominator fresh+cached+writes); `cache-hit-gate` = **50.0%** (denominator cached+fresh, "matching the book's formula").
- **Expected:** one formula, one place. ch14 teaches cached ÷ (cached + fresh) (writes reported, excluded) — the gate matches the book; `CacheLedger.hitRate` is the outlier.
- **Actual:** an operator gating nightly on cache-hit-gate while their dashboard reads CacheLedger sees two different truths from the same rows.
- **Fix:** align `CacheLedger.hitRate` to the book's formula (or route both through one function).

### P1-7 · invoice-reconcile: duplicate invoice rows silently dropped — and the gap inverts (E1)
- **Repro (CLI, `fixtures/attack/invoice-dups.csv`):** invoice rows $5.00 + $4.50 for `m1` (true billed $9.50), meter $5.00 → report: `meter $5.00 vs invoice $4.50 (gap −0.50, −11.11%)`.
- **Expected:** duplicates summed ($9.50 → gap **+$4.50, +90%**, invoice-only money — ch16's suspect #2) or flagged as DRIFT.
- **Actual:** Map last-wins keeps only $4.50; the reported gap is not just smaller — it has the **wrong sign** (claims provider billed less than metered when it billed nearly double). Provider CSV retries/partial exports do produce duplicates.
- **Fix:** aggregate duplicate model rows on both sides (or list them under onlyInvoice-style DRIFT).

---

## P2 findings

1. **A7** — duplicate `finish_reason` chunks double-emit `stop_reason`; ch12 doesn't assign the dedup. First-stop-wins suggested.
2. **A8** — anthropic `input_json_delta` before any `content_block_start` accumulates under `callId ""` (orphan fragments silently merge). Ignore-or-flag suggested.
3. **A9** — anthropic interleaved tool blocks misattributed: `content_block_delta.index` ignored, keyed on `lastToolId`; interleaved A/B streams cross-wire args (measured: A={} B=undefined vs expected {x:1}/{y:2}). Map index→id at start.
4. **A10** — gemini `functionCall.args` as a string survives as non-object `tool_call.args`, violating the Event type. Reject/wrap.
5. **B3** — negative `cacheWriteTokens` zeroes the bedrock TPM charge (charge clamped ≥0 → free ride). Clamp inputs.
6. **B4** — `TokenBucket` backwards clock (NTP step, VM resume) drives tokens negative → admission frozen ~refill-time. `now = max(now, last)`.
7. **C3** — negative usage yields negative cost (−$0.015) and shrinks session totals; the meter should be the trust boundary — clamp/reject.
8. **C4** — usage event with both `cachedIn` and `cacheWriteIn` logs only a `write` event; cost correct, replayable event stream understates reads.
9. **D1** — a task removed from the golden set reports as "fixed since baseline" every night (baseline.failing not intersected with current tasks).
10. **D2** — non-numeric `--floor` (typo `o.9`) disables the floor gate: `passRate < NaN` is false; CLI banner shows "floor NaN%" but a no-new-failures 83% night exits 0. `Number.isFinite` guard + exit 2.
11. **E2** — duplicate meter rows collapse last-wins ($5.00 metered → $2.50 checked; cron overlap halves itself into tolerance).

## Attacks that HELD (14)

A3 cached>prompt clamps to 0 · A4 id-less tool fragments assemble under synthetic `idx:N` · A5 torn JSON line drops (documented) · A6 empty text delta no-op · B5 Semaphore double-release did **not** over-admit (active stays ≥0 — release with empty queue decrements but `acquire` re-checks; measured active=1) · B6 classify/backoff with malformed/negative Retry-After · C5 `breakEvenReads` at r=1 = Infinity (correct) · C2 zero-cached rows agree vacuously · D3 duplicate golden rows last-wins (documented) · D4 empty task set = DRIFT · D5 `makeBaseline` records only scored failures · E3 NaN invoice amount flags, no crash · E4 gap exactly at tolerance = within (documented ±) · E5 $0 invoice vs metered $5 flags as Infinity gap.

## Determinism

`npm test` run twice back-to-back: both green, identical output (`tinyengine: all smoke tests green / cadence tests green`).

## Verdict

**MINOR-to-MAJOR boundary: 7 P1s in the money/admission paths, 0 P0s.** The
teaching code is honest about being teaching code, but Appendix D presents
these modules as the patterns to copy; the P1s above are the exact shapes
(boundary guards, atomic reservations, duplicate rows, unknown aliases) an
operator copies into production at their peril. Recommend: fix P1-1..P1-3 and
P1-5..P1-7 in the companion (all small, local fixes), add one book sentence
each for the burndown-overrun direction (P1-4) and the hit-rate formula
unification (P1-6), and keep `tests/attack-gate6.js` in the suite as the
regression gate for this report.
