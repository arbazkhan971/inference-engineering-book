// tinyengine/tracer.ts — the seed instrument (Chapter 1: "ten lines of code").
// Three timestamps per call; the identity e2e ≈ TTFT + (N−1) × ITL does the audit.
export type Trace = {
  ttftSeconds: number;                    // sent → first content delta
  e2eSeconds: number;                     // sent → last delta
  itlSamples: number[];                   // gaps between consecutive deltas (s)
  tokens: number;                         // N, from the usage field
  identityGapSeconds: number;             // e2e − (TTFT + (N−1) × mean ITL): queueing + jitter live here
};

export function traceCall(sentAt: number, deltasAt: number[], tokens: number): Trace {
  const first = deltasAt[0], last = deltasAt[deltasAt.length - 1];
  const itl = deltasAt.slice(1).map((t, i) => t - deltasAt[i]);
  const mean = itl.length ? itl.reduce((a, b) => a + b, 0) / itl.length : 0;
  return {
    ttftSeconds: first - sentAt, e2eSeconds: last - sentAt,
    itlSamples: itl, tokens,
    identityGapSeconds: (last - sentAt) - (first - sentAt + (tokens - 1) * mean),
  };
}
