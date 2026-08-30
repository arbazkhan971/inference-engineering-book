import test from "node:test";
import assert from "node:assert/strict";
import { QuotaLedger, Semaphore, TokenBucket } from "../rate-scheduler.js";

test("request ids settle out of order and duplicate completion is idempotent", () => {
  const quota = new QuotaLedger();
  quota.configure({ provider: "bedrock", tpm: 1_000, rpm: 100 }, 0);
  assert.equal(quota.reserve("bedrock", { requestId: "A", maxTokens: 600,
    estimatedPromptTokens: 0 }, 0), true);
  assert.equal(quota.reserve("bedrock", { requestId: "B", maxTokens: 300,
    estimatedPromptTokens: 0 }, 0), true);
  quota.reconcile("bedrock", { requestId: "B", input: 0, maxTokens: 300 },
    { input: 0, output: 300 }, 0);
  quota.reconcile("bedrock", { requestId: "A", input: 0, maxTokens: 600 },
    { input: 0, output: 100 }, 0);
  quota.reconcile("bedrock", { requestId: "A", input: 0, maxTokens: 600 },
    { input: 0, output: 0 }, 0); // duplicate A cannot consume B or mint credit
  assert.equal(quota.reserve("bedrock", { requestId: "C", maxTokens: 600,
    estimatedPromptTokens: 0 }, 0), true);
  assert.equal(quota.reserve("bedrock", { requestId: "D", maxTokens: 1,
    estimatedPromptTokens: 0 }, 0), false);
});

test("settlement trusts the stored reservation, not caller-supplied booked math", () => {
  const quota = new QuotaLedger();
  quota.configure({ provider: "bedrock", tpm: 1_000, rpm: 100 }, 0);
  quota.reserve("bedrock", { requestId: "A", maxTokens: 600,
    estimatedPromptTokens: 0 }, 0);
  quota.reconcile("bedrock", { requestId: "A", input: 0, maxTokens: 900 },
    { input: 0, output: 100 }, 0);
  assert.equal(quota.reserve("bedrock", { maxTokens: 950,
    estimatedPromptTokens: 0 }, 0), false);
  assert.equal(quota.reserve("bedrock", { maxTokens: 900,
    estimatedPromptTokens: 0 }, 0), true);
});

test("Anthropic output has its own actual-token bucket", () => {
  const quota = new QuotaLedger();
  quota.configure({ provider: "anthropic", itpm: 100, otpm: 10, rpm: 10 }, 0);
  assert.equal(quota.recordOutput("anthropic", 8, 0), true);
  assert.equal(quota.recordOutput("anthropic", 3, 0), false);
  assert.equal(quota.reserve("anthropic", { maxTokens: 1,
    estimatedPromptTokens: 0 }, 0), false,
  "the 1-token overrun is debt, not a green untouched bucket");
  assert.equal(quota.reserve("anthropic", { maxTokens: 1,
    estimatedPromptTokens: 0 }, 7), true,
  "continuous refill eventually repays output debt");
});

test("configured Bedrock burndown is used when completion omits it", () => {
  const quota = new QuotaLedger();
  quota.configure({ provider: "bedrock", tpm: 1_000, rpm: 100,
    bedrockBurndown: 5 }, 0);
  quota.reserve("bedrock", { requestId: "A", maxTokens: 100,
    estimatedPromptTokens: 0 }, 0);
  quota.reconcile("bedrock", { requestId: "A", input: 0, maxTokens: 100 },
    { input: 0, output: 30 }, 0); // final 150, debit 50: 850 remains
  assert.equal(quota.reserve("bedrock", { maxTokens: 851,
    estimatedPromptTokens: 0 }, 0), false);
});

test("one-use permits survive double release without over-admission", async () => {
  const semaphore = new Semaphore(1);
  const first = await semaphore.acquirePermit();
  let entered = false;
  const secondPromise = semaphore.acquirePermit().then((permit) => {
    entered = true; return permit;
  });
  await Promise.resolve();
  assert.equal(entered, false);
  first.release(); first.release();
  const second = await secondPromise;
  assert.equal(entered, true);
  second.release(); second.release();
  assert.equal(semaphore.active, 0);
});

test("invalid token bucket configuration fails closed", () => {
  assert.throws(() => new TokenBucket(NaN, 1));
  assert.throws(() => new TokenBucket(1, -1));
});

test("public token-bucket operations reject negative and non-finite amounts", () => {
  const bucket = new TokenBucket(10, 0, 0);
  assert.equal(bucket.tryAcquire(5, 0), true);
  assert.equal(bucket.tryAcquire(-10, 0), false);
  assert.equal(bucket.tryAcquire(6, 0), false, "negative acquire did not mint tokens");
  assert.throws(() => bucket.credit(-1, 0));
  assert.throws(() => bucket.debit(NaN, 0));
  assert.throws(() => bucket.charge(Infinity, 0));
});

test("malformed Bedrock completion usage cannot mint reconciliation credit", () => {
  const quota = new QuotaLedger();
  quota.configure({ provider: "bedrock", tpm: 1_000, rpm: 100 }, 0);
  assert.equal(quota.reserve("bedrock", { requestId: "A", maxTokens: 600,
    estimatedPromptTokens: 0 }, 0), true);
  quota.reconcile("bedrock", { requestId: "A", input: 0, maxTokens: 600 },
    { input: 0, output: -100 }, 0);
  assert.equal(quota.reserve("bedrock", { maxTokens: 401,
    estimatedPromptTokens: 0 }, 0), false,
  "invalid actual usage leaves the conservative up-front charge in place");
});
