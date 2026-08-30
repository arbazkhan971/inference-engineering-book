# tinyengine — the assembled Inference Engineering companion

This directory delivers the executable path behind the book's **Build it**
sections. It is deliberately compact, but it is no longer a bag of unrelated
snippets: `TinyEngine.call()` composes session rendering, admission, routing,
wire-send timing, stream normalization, quota reconciliation, cost metering,
tracing, and an attributed receipt.

| Module | Chapter | Owns |
|---|---|---|
| `engine.ts` | 18 | assembled request path, per-session turn serialization, final receipt |
| `tracer.ts` | 1–2 | TTFT, inter-token latency, and the end-to-end identity |
| `stream-normalizer.ts` | 12 | one event grammar for four provider grammars, tool assembly, usage |
| `cache-ledger.ts` | 14 | four-term cost, hit rate, TTL, deploy events, mispricing path |
| `rate-scheduler.ts` | 15 | quota reservations, OTPM debt, token buckets, permits, retry and waves |
| `router.ts` | 16 | weighted/pinned choice, breakers, classified fallback, route receipts |
| `session-store.ts` | 17 | deterministic prompts, append-only event store, replay, compaction |
| `demo.ts` | 18 | credential-free executable proof of the complete path |
| cadence CLIs | 9, 13–16 | golden-set, cache-hit, and invoice gates over offline fixtures |

There are no runtime npm dependencies and no network calls in tests. Policy
lives in dated config (`PriceRow`, `QuotaMeters`, and routing rules), not in
hardcoded commercial constants. TypeScript is the pinned development
dependency.

## Run it from a clean checkout

```bash
npm install
npm test       # compile; four scripted regressions; all named node:test files
npm run demo   # assembled offline request -> "engine ready" + full receipt
npm run cadence
```

The four scripted programs preserve the original smoke, nightly cadence, and
two adversarial attack rounds. Thirty named contracts then target the seams
that a broad script can miss: exact one-use wire-send timing, tool-only TTFT,
same-session concurrency, per-request quota settlement, OTPM overruns,
half-open leases, permanent-breaker behavior, pin isolation, safe
validator/logger failures, and disk-backed session replay/corruption.

The three cadence CLIs consume fixtures here but are intended for ordinary
cron inputs: fresh golden-task results, a day's usage rows, and a provider
invoice export. They compare artifacts; they do not call models or providers.

## Boundaries

This is a teaching engine, not a production SDK. `JsonlSessionEventStore` is a
single-writer append log and does not coordinate multiple processes. A stream
iterator failure after response headers bubbles to the caller; it is not fed
back into Router breaker/fallback state. Real integrations also own transport
authentication, retry idempotency, telemetry export, and provider-specific
schema validation.
