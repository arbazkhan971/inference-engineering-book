# tinyengine — the Inference Engineering companion

Roughly seven hundred lines of TypeScript that sit between your agent loop and
every model endpoint it calls. Every module was designed in the chapter that
needed it; this directory is the delivery of every "Build it" in the book.

| Module | Chapter | Shipped lines | Owns |
|---|---|---|---|
| `tracer.ts` | 1–2 | 20 | TTFT, inter-token latency, the identity e2e ≈ TTFT + (N−1) × ITL |
| `stream-normalizer.ts` | 12 | 162 | one event grammar for four provider grammars; tool-call assembly; usage extraction |
| `cache-ledger.ts` | 14 | 125 | the money meter: four-term cost, hit rate, TTL clock, keep-alive gate, deploy hook |
| `rate-scheduler.ts` | 15 | 120 | quota ledger per provider meter, token bucket, jittered retries, wave pacer |
| `router.ts` | 16 | 133 | weighted routing with session pinning, error-class breakers, classified-error fallback |
| `session-store.ts` | 17 | 114 | five-layer byte-exact renderer, append-only log, TTL policy, staggered spawn |

No dependencies. No network in tests. Policy lives in config, not code —
prices and quotas are passed in as dated data, never hardcoded
(see `PriceRow.date` and `QuotaMeters`).

## The tester cadence (Appendix D.8)

Three operator CLIs beyond the instruments — the nightly role the chapters
kept insisting on, shipped with fixtures:

| Script | Chapter | Shipped lines | Owns |
|---|---|---|---|
| `cadence-io.ts` | — | 44 | argv flags, JSON/JSONL/CSV reads (shared plumbing) |
| `golden-set.ts` | 9, 13 | 102 | drift canary: per-task diff vs dated baseline + pass-rate floor |
| `cache-hit-gate.ts` | 14 | 84 | hit-rate floor over the day's usage rows; thin models not gated |
| `invoice-reconcile.ts` | 16 | 124 | meter vs invoice within tolerance; duplicates summed; the four drift suspects named |

```bash
npm run cadence   # all three gates over the fixtures, reports printed in
                  # sequence; golden-set reports the fixture's deliberate
                  # new failure (ex-011) — that DRIFT line is the demo
```

Your cron supplies the two things the scripts never do: it replays the tasks
against the pinned variant and appends result rows, and it exports the
provider invoice. Every gate compares two artifacts you already have.

## Run the tests

```bash
npm test        # tsc -p tsconfig.json && both suites: smoke + cadence
```

The smoke suite is every Break-it / Prove-it item from the chapters,
replayed from fixture strings: the Portland three-fragment tool-call split
mid-escape-sequence, the meta-only SSE event, the unknown finish reason,
the $0.645-vs-$3.00 cache worked example, the zombie-fleet 429 classifier,
full-jitter bounds with `Retry-After` as a floor, the garbage-200 rule
(fallbacks do not fire), and the byte-exact session render hash. The
cadence suite replays the nightly instruments over `fixtures/` — the golden
set's per-task drift diff, the hit-rate floor with thin-data exemption, and
invoice reconciliation against all four drift suspects.

`env.d.ts` holds minimal type shims for the two `node:` modules used, so the
project type-checks with a bare `tsc`. Delete it if you install `@types/node`.

## What it is not

Not a framework, not an SDK, not production-hardened. It is a teaching
instrument: every dial has exactly one instrument that can see it, every
crossing is metered, and every policy value arrives from dated config so you
can watch it age. Read the chapters first; the code is the punctuation.
