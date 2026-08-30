import assert from "node:assert/strict";
import { appendFileSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { CacheLedger } from "../cache-ledger.js";
import {
  JsonlSessionEventStore,
  SessionReplayError,
  SessionStore,
  type Template,
} from "../session-store.js";

const TEMPLATE: Template = {
  id: "triage",
  version: "3",
  tools: [
    { name: "b_tool", description: "later" },
    { schema: { b: 2, a: 1 }, name: "a_tool" },
  ],
  system: "You triage.",
  staticContext: "Runbook v2.",
};

const ledger = () => new CacheLedger({});

function withLog(name: string, run: (path: string) => void): void {
  const root = mkdtempSync(join(tmpdir(), `tinyengine-${name}-`));
  try { run(join(root, "sessions.jsonl")); }
  finally { rmSync(root, { recursive: true, force: true }); }
}

test("a second SessionStore rebuilds the byte-identical prompt from JSONL", () => {
  withLog("reload", (path) => {
    const first = new SessionStore(ledger(), undefined, new JsonlSessionEventStore(path));
    first.create(TEMPLATE, "s1", 100);
    first.append("s1", "user", "Ticket 4711", 101);
    first.append("s1", "assistant", "Checking auth logs.", 102);
    first.addBreakpoint("s1", "conversation:2", 103);
    const rendered = first.render("s1", "Continue.");

    assert.equal(rendered.prompt, [
      "# template=triage@3",
      "## tools",
      '[{"description":"later","name":"b_tool"},{"name":"a_tool","schema":{"a":1,"b":2}}]',
      "## system",
      "You triage.",
      "## static",
      "Runbook v2.",
      "## transcript",
      "user: Ticket 4711",
      "assistant: Checking auth logs.",
      "## tail",
      "Continue.",
    ].join("\n"), "the render is a golden byte contract, not only a same-process comparison");

    const resumed = new SessionStore(ledger(), undefined, new JsonlSessionEventStore(path));
    assert.equal(resumed.has("s1"), true);
    assert.deepEqual(resumed.render("s1", "Continue."), rendered);
    assert.equal(resumed.resumeHash("s1", "Continue."), rendered.hash);
    assert.deepEqual(resumed.history("s1").map(({ role, content }) => ({ role, content })), [
      { role: "user", content: "Ticket 4711" },
      { role: "assistant", content: "Checking auth logs." },
    ]);
    assert.deepEqual(resumed.getBreakpoints("s1"), ["triage:tools", "triage:system", "triage:static", "conversation:2"]);

    resumed.append("s1", "user", "One more turn", 104);
    const third = new SessionStore(ledger(), undefined, new JsonlSessionEventStore(path));
    assert.equal(third.history("s1").length, 3, "a resumed writer continues the global sequence");
  });
});

test("compaction changes only the active projection and preserves pre-compaction history", () => {
  withLog("compaction", (path) => {
    const store = new SessionStore(ledger(), undefined, new JsonlSessionEventStore(path));
    store.create(TEMPLATE, "s1", 1);
    store.append("s1", "user", "ORIGINAL QUESTION", 2);
    store.append("s1", "assistant", "ORIGINAL ANSWER", 3);
    store.compact("s1", "The durable summary", 4);
    store.append("s1", "user", "AFTER COMPACTION", 5);

    const prompt = store.render("s1", "tail").prompt;
    assert.ok(prompt.includes("assistant: [summary] The durable summary"));
    assert.ok(prompt.includes("user: AFTER COMPACTION"));
    assert.ok(!prompt.includes("ORIGINAL QUESTION"), "old messages leave the active prompt projection");
    assert.deepEqual(store.history("s1").map((message) => message.content), [
      "ORIGINAL QUESTION",
      "ORIGINAL ANSWER",
      "AFTER COMPACTION",
    ], "compaction never rewrites the append-only message archive");
    assert.ok(readFileSync(path, "utf-8").includes("ORIGINAL QUESTION"), "the durable log retains the original bytes");

    const resumed = new SessionStore(ledger(), undefined, new JsonlSessionEventStore(path));
    assert.deepEqual(resumed.render("s1", "tail"), store.render("s1", "tail"));
    assert.deepEqual(resumed.history("s1"), store.history("s1"));
  });
});

test("replay rejects middle corruption, wrong schemas, and sequence gaps", () => {
  withLog("corruption", (path) => {
    const store = new SessionStore(ledger(), undefined, new JsonlSessionEventStore(path));
    store.create(TEMPLATE, "s1", 1);
    store.append("s1", "user", "one", 2);
    store.append("s1", "assistant", "two", 3);
    const original = readFileSync(path, "utf-8").trimEnd().split("\n");

    writeFileSync(path, `${original[0]}\nnot-json\n${original[2]}\n`);
    assert.throws(
      () => new SessionStore(ledger(), undefined, new JsonlSessionEventStore(path)),
      (error: unknown) => error instanceof SessionReplayError && /line 2/.test(error.message),
    );

    const wrongSchema = JSON.parse(original[1]) as Record<string, unknown>;
    wrongSchema.role = 42;
    writeFileSync(path, `${original[0]}\n${JSON.stringify(wrongSchema)}\n${original[2]}\n`);
    assert.throws(
      () => new SessionStore(ledger(), undefined, new JsonlSessionEventStore(path)),
      (error: unknown) => error instanceof SessionReplayError && /line 2.*requires string role/.test(error.message),
    );

    const gap = JSON.parse(original[1]) as Record<string, unknown>;
    gap.sequence = 7;
    writeFileSync(path, `${original[0]}\n${JSON.stringify(gap)}\n${original[2]}\n`);
    assert.throws(
      () => new SessionStore(ledger(), undefined, new JsonlSessionEventStore(path)),
      (error: unknown) => error instanceof SessionReplayError && /line 2.*expected sequence 2, got 7/.test(error.message),
    );
  });
});

test("replay drops a torn final write but refuses to append behind it", () => {
  withLog("torn-tail", (path) => {
    const first = new SessionStore(ledger(), undefined, new JsonlSessionEventStore(path));
    first.create(TEMPLATE, "s1", 1);
    first.append("s1", "user", "survives", 2);
    const expected = first.render("s1", "tail");
    appendFileSync(path, '{"version":1,"sequence":3,"sessionId":"s1"', "utf-8");

    const resumed = new SessionStore(ledger(), undefined, new JsonlSessionEventStore(path));
    assert.deepEqual(resumed.render("s1", "tail"), expected);
    assert.deepEqual(resumed.history("s1").map((message) => message.content), ["survives"]);
    assert.throws(
      () => resumed.append("s1", "user", "must not hide behind damaged bytes", 3),
      (error: unknown) => error instanceof SessionReplayError && /torn final line/.test(error.message),
    );
    assert.deepEqual(resumed.history("s1").map((message) => message.content), ["survives"], "a failed durable append does not mutate memory");
  });
});

test("a valid JSON object without its newline is readable but not appendable", () => {
  withLog("valid-unterminated-tail", (path) => {
    const first = new SessionStore(ledger(), undefined, new JsonlSessionEventStore(path));
    first.create(TEMPLATE, "s1", 1);
    first.append("s1", "user", "complete bytes, missing commit newline", 2);
    writeFileSync(path, readFileSync(path, "utf-8").trimEnd());

    const resumed = new SessionStore(ledger(), undefined, new JsonlSessionEventStore(path));
    assert.equal(resumed.has("s1"), true);
    assert.deepEqual(resumed.history("s1").map((message) => message.content), [
      "complete bytes, missing commit newline",
    ]);
    assert.throws(
      () => resumed.append("s1", "assistant", "must not concatenate", 3),
      (error: unknown) => error instanceof SessionReplayError && /torn final line/.test(error.message),
    );
  });
});
