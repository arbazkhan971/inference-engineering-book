import test from "node:test";
import assert from "node:assert/strict";
import { Breaker, Router, type RouteRule } from "../router.js";

test("rolling failure fraction trips at more than half", () => {
  const breaker = new Breaker({ minSamples: 5, failFracPerMinute: 0.5,
    cooldownSeconds: 30 });
  breaker.success(0); breaker.success(1);
  breaker.report({ cls: "timeout" }, 2);
  breaker.report({ cls: "timeout" }, 3);
  breaker.report({ cls: "timeout" }, 4);
  assert.equal(breaker.state(4), "open");
});

test("half-open grants exactly one concurrent probe", () => {
  const breaker = new Breaker({ rateBenchSeconds: 1 });
  breaker.report({ cls: "rate_limit" }, 0);
  assert.equal(breaker.state(2), "half_open");
  assert.equal(breaker.admit(true, 2), true);
  assert.equal(breaker.admit(true, 2), false);
  breaker.success(2, true);
  assert.equal(breaker.state(2), "closed");
});

test("a failed half-open probe starts a new cooldown instead of wedging its lease", () => {
  const breaker = new Breaker({ rateBenchSeconds: 1, cooldownSeconds: 30 });
  breaker.report({ cls: "rate_limit" }, 0);
  assert.equal(breaker.admit(true, 2), true);
  breaker.report({ cls: "network" }, 2, true);
  assert.equal(breaker.state(2), "open");
  assert.equal(breaker.state(32), "half_open");
  assert.equal(breaker.admit(true, 32), true);
});

test("execute honors weighted selection and the resulting session pin", async () => {
  const calls: string[] = [];
  const rules: RouteRule[] = [{ alias: "a", pinSessions: true, deployments: [
    { id: "primary", model: "m", provider: "p", weight: 1 },
    { id: "weighted", model: "m", provider: "p", weight: 99 },
  ] }];
  const router = new Router(rules, { random: () => 0.99, log: () => undefined,
    fetchDeployment: async (deployment) => {
      calls.push(deployment.id); return { status: 200, body: { ok: true } };
    } }, "prices-v7");
  const first = await router.execute("a", {}, "s");
  const second = await router.execute("a", {}, "s");
  assert.deepEqual(calls, ["weighted", "weighted"]);
  assert.equal(first?.receipt.selectedBy, "weighted");
  assert.equal(second?.receipt.selectedBy, "pin");
  assert.equal(second?.receipt.priceTableVersion, "prices-v7");
});

test("classified failure falls back and emits an attributed receipt", async () => {
  const calls: string[] = [];
  const router = new Router([{ alias: "a", deployments: [
    { id: "primary", model: "m1", provider: "p", weight: 1 },
    { id: "backup", model: "m2", provider: "q", weight: 1 },
  ] }], { random: () => 0, log: () => undefined,
    fetchDeployment: async (deployment) => {
      calls.push(deployment.id);
      return deployment.id === "primary" ? { status: 529, body: "busy" }
        : { status: 200, body: "ok" };
    } }, "prices-v8");
  const result = await router.execute("a", {});
  assert.deepEqual(calls, ["primary", "backup"]);
  assert.equal(result?.receipt.selectedBy, "fallback");
  assert.equal(result?.receipt.attempt, 2);
  assert.equal(result?.receipt.priceTableVersion, "prices-v8");
});

test("a local quota rejection falls back without poisoning endpoint health", async () => {
  const calls: string[] = [];
  const router = new Router([{ alias: "a", deployments: [
    { id: "primary", model: "m1", provider: "p" },
    { id: "backup", model: "m2", provider: "q" },
  ] }], { random: () => 0, log: () => undefined,
    fetchDeployment: async (deployment) => {
      calls.push(deployment.id);
      return deployment.id === "primary"
        ? { status: 429, body: "local", localFailure: "quota" as const }
        : { status: 200, body: "ok" };
    } });
  assert.equal((await router.execute("a", {}))?.deployment.id, "backup");
  assert.equal((await router.execute("a", {}))?.deployment.id, "backup");
  assert.deepEqual(calls, ["primary", "backup", "primary", "backup"],
    "the primary remains eligible because local admission is not endpoint failure");
});

test("permanent auth breakers are never bypassed", async () => {
  let recover = false;
  const logs: string[] = [];
  const router = new Router([{ alias: "a", deployments: [
    { id: "p", model: "m1", provider: "p" },
    { id: "b", model: "m2", provider: "q" },
  ] }], { random: () => 0, log: (message) => logs.push(message),
    fetchDeployment: async () => recover ? { status: 200, body: "ok" }
      : { status: 401, body: "bad auth" } }, "prices-v9");
  assert.equal(await router.execute("a", {}), null); // both permanently open
  recover = true;
  const result = await router.execute("a", {});
  assert.equal(result, null);
  assert.ok(logs.includes("ALL DEPLOYMENTS REQUIRE HUMAN ACTION"));
});

test("finite cooldowns retain a loud all-open last resort", async () => {
  let recover = false;
  const logs: string[] = [];
  const router = new Router([{ alias: "a", deployments: [
    { id: "p", model: "m1", provider: "p" },
    { id: "b", model: "m2", provider: "q" },
  ] }], { random: () => 0, now: () => 0, log: (message) => logs.push(message),
    fetchDeployment: async () => recover ? { status: 200, body: "ok" }
      : { status: 529, body: "overloaded" } }, "prices-v9");
  for (let i = 0; i < 4; i++) assert.equal(await router.execute("a", {}), null);
  recover = true;
  const result = await router.execute("a", {});
  assert.equal(result?.receipt.selectedBy, "all_open_bypass");
  assert.ok(logs.includes("ALL DEPLOYMENTS OPEN"));
});

test("logger and validator failures cannot duplicate a successful endpoint call", async () => {
  const logCalls: string[] = [];
  const loggerRouter = new Router([{ alias: "a", deployments: [
    { id: "p", model: "m", provider: "p" },
    { id: "b", model: "m", provider: "p" },
  ] }], { random: () => 0, log: () => { throw new Error("sink down"); },
    fetchDeployment: async (deployment) => {
      logCalls.push(deployment.id); return { status: 200, body: "ok" };
    } });
  assert.equal((await loggerRouter.execute("a", {}))?.deployment.id, "p");
  assert.deepEqual(logCalls, ["p"]);

  const validatorCalls: string[] = [];
  const validatorRouter = new Router([{ alias: "a", deployments: [
    { id: "vp", model: "m", provider: "p" },
    { id: "vb", model: "m", provider: "p" },
  ] }], { random: () => 0, log: () => undefined,
    validate: () => { throw new Error("validator bug"); },
    fetchDeployment: async (deployment) => {
      validatorCalls.push(deployment.id); return { status: 200, body: "ok" };
    } });
  assert.equal(await validatorRouter.execute("a", {}), null);
  assert.deepEqual(validatorCalls, ["vp"]);
});

test("session pins are isolated per route alias", async () => {
  const calls: string[] = [];
  const router = new Router([
    { alias: "a", pinSessions: true, deployments: [
      { id: "a1", model: "m", provider: "p" }, { id: "a2", model: "m", provider: "p" },
    ] },
    { alias: "b", pinSessions: true, deployments: [
      { id: "b1", model: "m", provider: "p" }, { id: "b2", model: "m", provider: "p" },
    ] },
  ], { random: () => 0, log: () => undefined,
    fetchDeployment: async (deployment) => {
      calls.push(deployment.id); return { status: 200, body: "ok" };
    } });
  await router.execute("a", {}, "same-session");
  await router.execute("b", {}, "same-session");
  assert.equal((await router.execute("a", {}, "same-session"))?.receipt.selectedBy, "pin");
  assert.equal((await router.execute("b", {}, "same-session"))?.receipt.selectedBy, "pin");
  assert.deepEqual(calls, ["a1", "b1", "a1", "b1"]);
});

test("invalid all-zero routing tables fail at construction", () => {
  assert.throws(() => new Router([{ alias: "a", deployments: [
    { id: "p", model: "m", provider: "p", weight: 0 },
  ] }], { log: () => undefined,
    fetchDeployment: async () => ({ status: 200, body: "ok" }) }), /positive deployment weight/);
});
