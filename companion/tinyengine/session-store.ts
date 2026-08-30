// tinyengine/session-store.ts — a session is a byte-exact, append-only asset (Chapter 17).
import { createHash } from "node:crypto";
import { appendFileSync, existsSync, readFileSync } from "node:fs";
import type { CacheLedger } from "./cache-ledger.js";

export type IdleClass = "interactive" | "think_time" | "overnight";
export interface Template {                      // frozen at session start; version + key order pinned
  id: string; version: string;
  tools: object[];                               // sorted by name at render — a lying serializer kills hits
  system: string; staticContext?: string;        // L1/L2/L3 of ch. 17's five layers
}

export interface SessionEvent { at: number; kind: "message" | "compaction" | "resume" | "spawn"; hash?: string }
export interface ArchivedMessage { at: number; role: string; content: string; hash: string }

interface StoredEventBase {
  version: 1;
  sequence: number;
  sessionId: string;
  at: number;
}

/** The durable facts from which SessionStore rebuilds its in-memory projection. */
export type StoredSessionEvent =
  | (StoredEventBase & { kind: "session.created"; template: Template })
  | (StoredEventBase & { kind: "message.appended"; role: string; content: string; hash: string })
  | (StoredEventBase & { kind: "session.compacted"; summary: string; hash: string })
  | (StoredEventBase & { kind: "breakpoint.added"; mark: string });

/**
 * The persistence seam is deliberately synchronous because SessionStore's public API predates
 * durability and is synchronous. Implementations must append one complete fact or throw.
 */
export interface SessionEventStore {
  load(): StoredSessionEvent[];
  append(event: StoredSessionEvent): void;
}

export class SessionReplayError extends Error {
  constructor(message: string) { super(message); this.name = "SessionReplayError"; }
}

/** An injectable append-only store for tests and embedders that do not need a file. */
export class MemorySessionEventStore implements SessionEventStore {
  private readonly records: StoredSessionEvent[];

  constructor(seed: readonly StoredSessionEvent[] = []) {
    this.records = seed.map(cloneStoredEvent);
  }

  load(): StoredSessionEvent[] {
    return validateSequence(this.records.map(cloneStoredEvent), "memory event store");
  }

  append(event: StoredSessionEvent): void {
    const checked = parseStoredEvent(cloneStoredEvent(event));
    const expected = this.records.length + 1;
    if (checked.sequence !== expected)
      throw new SessionReplayError(`memory event store: expected sequence ${expected}, got ${checked.sequence}`);
    this.records.push(checked);
  }
}

/**
 * One JSON object per line. Replay drops only an invalid, unterminated final physical line — the
 * write a crashed process may have torn. Invalid middle lines and sequence gaps fail loudly.
 * A store with a torn tail remains readable but refuses further appends: appending behind damaged
 * bytes would turn a tolerated tail into permanent middle corruption.
 */
export class JsonlSessionEventStore implements SessionEventStore {
  private tornTail = false;

  constructor(readonly path: string) {}

  load(): StoredSessionEvent[] {
    this.tornTail = false;
    if (!existsSync(this.path)) return [];
    const text = readFileSync(this.path, "utf-8");
    if (text === "") return [];
    const terminated = text.endsWith("\n");
    const lines = text.split("\n");
    if (terminated) lines.pop();
    const events: StoredSessionEvent[] = [];

    for (let index = 0; index < lines.length; index++) {
      const line = lines[index];
      try {
        if (line.trim() === "") throw new Error("blank event line");
        const event = parseStoredEvent(JSON.parse(line));
        const expected = events.length + 1;
        if (event.sequence !== expected)
          throw new Error(`expected sequence ${expected}, got ${event.sequence}`);
        events.push(event);
      } catch (error) {
        const finalUnterminatedLine = !terminated && index === lines.length - 1;
        if (finalUnterminatedLine) { this.tornTail = true; break; }
        throw new SessionReplayError(`corrupt session log at line ${index + 1}: ${errorMessage(error)}`);
      }
    }
    // A syntactically complete JSON object is not a committed JSONL record until
    // its newline lands. Keep it readable, but refuse to append behind it: doing
    // so would concatenate the next object onto the same physical line.
    if (!terminated && lines.length > 0) this.tornTail = true;
    return events;
  }

  append(event: StoredSessionEvent): void {
    const existing = this.load();
    if (this.tornTail)
      throw new SessionReplayError("cannot append: session log has a torn final line; preserve and repair the tail first");
    const checked = parseStoredEvent(cloneStoredEvent(event));
    const expected = existing.length + 1;
    if (checked.sequence !== expected)
      throw new SessionReplayError(`cannot append: expected sequence ${expected}, got ${checked.sequence}`);
    appendFileSync(this.path, `${JSON.stringify(checked)}\n`, "utf-8");
  }
}

// TTL policy (ch. 17): classify the idle pattern, request the entry class that matches the gap.
export function classifyIdle(idleMinutes: number): IdleClass {
  if (idleMinutes < 5) return "interactive";
  if (idleMinutes < 60) return "think_time";
  return "overnight";
}
export function ttlRequestFor(c: IdleClass): 300 | 3600 { return c === "interactive" ? 300 : 3600; }

export interface SchedulerGate { tryAcquire(n: number): boolean }   // ch. 15 keeps the tick inside the budget

interface SessionState {
  template: Template;
  events: SessionEvent[];
  archive: ArchivedMessage[];
  transcript: { role: string; content: string }[]; // active prompt projection; archive is never rewritten
  lastActivity: number;
  breakpoints: string[];
}

export class SessionStore {
  private sessions = new Map<string, SessionState>();
  private nextSequence = 1;
  private readonly eventStore: SessionEventStore;

  constructor(
    private ledger: CacheLedger,
    private scheduler?: SchedulerGate,
    eventStore: SessionEventStore = new MemorySessionEventStore(),
  ) {
    this.eventStore = eventStore;
    const stored = validateSequence(eventStore.load(), "session event store");
    for (const event of stored) this.apply(event, true);
    this.nextSequence = stored.length + 1;
  }

  has(sessionId: string): boolean { return this.sessions.has(sessionId); }

  create(template: Template, sessionId: string, now = Date.now() / 1000): void {
    if (this.sessions.has(sessionId)) throw new Error(`session already exists ${sessionId}`);
    const frozen = validateTemplate(cloneTemplate(template));
    this.commit({ ...this.base(sessionId, now), kind: "session.created", template: frozen });
    this.ledger.deploy(frozen.id, this.renderTemplate(frozen)); // template hash visible as a cache event
  }

  // Append-only: every message is one durable fact. Compaction changes the prompt projection,
  // never this archive.
  append(sessionId: string, role: string, content: string, now = Date.now() / 1000): string {
    this.get(sessionId); // validate before the durable append
    const hash = messageHash(role, content);
    this.commit({ ...this.base(sessionId, now), kind: "message.appended", role, content, hash });
    return hash;
  }

  // The renderer: five layers in ch. 17's frozen order — tools → system → static → transcript → tail.
  // Deterministic: tool order and every object key are canonicalized before JSON serialization.
  render(sessionId: string, tail: string): { prompt: string; hash: string } {
    const s = this.get(sessionId);
    const tools = [...s.template.tools].sort((a, b) => {
      const left = JSON.stringify(a, stableStringify), right = JSON.stringify(b, stableStringify);
      return left < right ? -1 : left > right ? 1 : 0;
    });
    const layers = [
      `# template=${s.template.id}@${s.template.version}`,
      "## tools", JSON.stringify(tools, stableStringify),
      "## system", s.template.system,
      s.template.staticContext ? `## static\n${s.template.staticContext}` : "",
      "## transcript", ...s.transcript.map((m) => `${m.role}: ${m.content}`),
      "## tail", tail,
    ];
    const prompt = layers.filter((x) => x !== "").join("\n");
    return { prompt, hash: createHash("sha256").update(prompt).digest("hex").slice(0, 16) };
  }

  // Byte-exact resume proof. With a persistent event store this works after a process restart,
  // because the constructor has already rebuilt the projection by replay.
  resumeHash(sessionId: string, tail: string): string { return this.render(sessionId, tail).hash; }

  /** The immutable message archive, including messages hidden by later compaction projections. */
  history(sessionId: string): ArchivedMessage[] {
    return this.get(sessionId).archive.map((message) => ({ ...message }));
  }

  // Breakpoint placement with the 4-max and the leapfrog: roll the oldest when a fifth arrives.
  addBreakpoint(sessionId: string, mark: string, now = Date.now() / 1000): void {
    this.get(sessionId);
    this.commit({ ...this.base(sessionId, now), kind: "breakpoint.added", mark });
  }
  getBreakpoints(sessionId: string): string[] { return [...this.get(sessionId).breakpoints]; }

  // Idle classification is a money decision (ch. 17): the class sets the TTL entry, the tick keeps it warm.
  tick(sessionId: string, now = Date.now() / 1000): IdleClass | null {
    const s = this.sessions.get(sessionId); if (!s) return null;
    const idle = (now - s.lastActivity) / 60;
    const cls = classifyIdle(idle);
    if (cls !== "interactive" && this.scheduler?.tryAcquire(1))
      this.ledger.events.push({ session: sessionId, kind: "keep_alive", tokens: 0, costUsd: 0, at: now, note: `ttl=${ttlRequestFor(cls)}s` });
    return cls;
  }

  // Warm compaction appends a summary fact and swaps only the active prompt projection. The
  // original messages remain available through history() and in the JSONL log.
  compact(sessionId: string, summary: string, now = Date.now() / 1000): void {
    this.get(sessionId);
    const content = `[summary] ${summary}`;
    this.commit({ ...this.base(sessionId, now), kind: "session.compacted", summary, hash: messageHash("assistant", content) });
  }

  // spawn(): children share at most the template preamble — never the transcript (ch. 17's isolation rule).
  // The first child pays the write; stagger the fleet behind it so siblings hit the read.
  spawn(template: Template, tasks: string[], parentSession: string, now = Date.now() / 1000): string[] {
    const children: string[] = [];
    tasks.forEach((task, i) => {
      const id = `${parentSession}/child-${i}`;
      this.create(template, id, now + i * 0.5); // stagger behind child 0's write (ch. 14's ~15-rpm caveat)
      this.append(id, "user", task, now + i * 0.5);
      this.ledger.events.push({ session: id, kind: "read", tokens: 0, costUsd: 0, at: now + i * 0.5, note: "shared-preamble child" });
      children.push(id);
    });
    return children;
  }

  private base(sessionId: string, at: number): StoredEventBase {
    return { version: 1, sequence: this.nextSequence, sessionId, at };
  }

  private commit(event: StoredSessionEvent): void {
    const checked = parseStoredEvent(event);
    this.eventStore.append(checked); // durability first; failed writes never mutate the projection
    this.apply(checked, false);
    this.nextSequence++;
  }

  private apply(event: StoredSessionEvent, replaying: boolean): void {
    if (event.kind === "session.created") {
      if (this.sessions.has(event.sessionId))
        throw this.replayFailure(event, `duplicate session.created for ${event.sessionId}`, replaying);
      const template = cloneTemplate(event.template);
      this.sessions.set(event.sessionId, {
        template,
        events: [{ at: event.at, kind: "message" }],
        archive: [],
        transcript: [],
        lastActivity: event.at,
        breakpoints: [template.id + ":tools", template.id + ":system", ...(template.staticContext ? [template.id + ":static"] : [])],
      });
      return;
    }

    const s = this.sessions.get(event.sessionId);
    if (!s) throw this.replayFailure(event, `${event.kind} precedes session.created for ${event.sessionId}`, replaying);
    if (event.kind === "message.appended") {
      s.archive.push({ at: event.at, role: event.role, content: event.content, hash: event.hash });
      s.transcript.push({ role: event.role, content: event.content });
      s.events.push({ at: event.at, kind: "message", hash: event.hash });
      s.lastActivity = event.at;
    } else if (event.kind === "session.compacted") {
      s.transcript = [{ role: "assistant", content: `[summary] ${event.summary}` }];
      s.events.push({ at: event.at, kind: "compaction", hash: event.hash });
      s.lastActivity = event.at;
    } else {
      if (s.breakpoints.length >= 4) s.breakpoints = [...s.breakpoints.slice(1), event.mark];
      else s.breakpoints.push(event.mark);
    }
  }

  private replayFailure(event: StoredSessionEvent, message: string, replaying: boolean): Error {
    return replaying ? new SessionReplayError(`corrupt session log at sequence ${event.sequence}: ${message}`) : new Error(message);
  }

  private renderTemplate(t: Template): string {
    return JSON.stringify([t.id, t.version, t.tools], stableStringify) + t.system + (t.staticContext ?? "");
  }
  private get(id: string): SessionState {
    const s = this.sessions.get(id); if (!s) throw new Error(`unknown session ${id}`); return s;
  }
}

function messageHash(role: string, content: string): string {
  return createHash("sha256").update(`${role}:${content}`).digest("hex").slice(0, 12);
}

function validateSequence(events: readonly StoredSessionEvent[], source: string): StoredSessionEvent[] {
  return events.map((candidate, index) => {
    const event = parseStoredEvent(cloneStoredEvent(candidate));
    const expected = index + 1;
    if (event.sequence !== expected)
      throw new SessionReplayError(`${source}: expected sequence ${expected}, got ${event.sequence}`);
    return event;
  });
}

function parseStoredEvent(value: unknown): StoredSessionEvent {
  if (!isRecord(value)) throw new Error("event must be an object");
  if (value.version !== 1) throw new Error("event version must be 1");
  if (!Number.isInteger(value.sequence) || (value.sequence as number) < 1)
    throw new Error("event sequence must be a positive integer");
  if (typeof value.sessionId !== "string" || value.sessionId === "")
    throw new Error("event sessionId must be a non-empty string");
  if (typeof value.at !== "number" || !Number.isFinite(value.at))
    throw new Error("event at must be finite");
  const base: StoredEventBase = { version: 1, sequence: value.sequence as number, sessionId: value.sessionId, at: value.at };

  if (value.kind === "session.created")
    return { ...base, kind: value.kind, template: validateTemplate(value.template) };
  if (value.kind === "message.appended") {
    if (typeof value.role !== "string" || typeof value.content !== "string" || typeof value.hash !== "string")
      throw new Error("message.appended requires string role, content, and hash");
    if (value.hash !== messageHash(value.role, value.content)) throw new Error("message.appended hash mismatch");
    return { ...base, kind: value.kind, role: value.role, content: value.content, hash: value.hash };
  }
  if (value.kind === "session.compacted") {
    if (typeof value.summary !== "string" || typeof value.hash !== "string")
      throw new Error("session.compacted requires string summary and hash");
    if (value.hash !== messageHash("assistant", `[summary] ${value.summary}`)) throw new Error("session.compacted hash mismatch");
    return { ...base, kind: value.kind, summary: value.summary, hash: value.hash };
  }
  if (value.kind === "breakpoint.added") {
    if (typeof value.mark !== "string" || value.mark === "") throw new Error("breakpoint.added requires a non-empty mark");
    return { ...base, kind: value.kind, mark: value.mark };
  }
  throw new Error(`unknown event kind ${String(value.kind)}`);
}

function validateTemplate(value: unknown): Template {
  if (!isRecord(value)) throw new Error("session.created template must be an object");
  if (typeof value.id !== "string" || value.id === "") throw new Error("template id must be a non-empty string");
  if (typeof value.version !== "string" || value.version === "") throw new Error("template version must be a non-empty string");
  if (typeof value.system !== "string") throw new Error("template system must be a string");
  if (!Array.isArray(value.tools) || value.tools.some((tool) => !isRecord(tool)))
    throw new Error("template tools must be an array of objects");
  if (value.staticContext !== undefined && typeof value.staticContext !== "string")
    throw new Error("template staticContext must be a string when present");
  return cloneTemplate(value as unknown as Template);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function cloneTemplate(template: Template): Template {
  return JSON.parse(JSON.stringify(template)) as Template;
}

function cloneStoredEvent(event: StoredSessionEvent): StoredSessionEvent {
  return JSON.parse(JSON.stringify(event)) as StoredSessionEvent;
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

// Deterministic JSON: object keys sorted recursively. Hash-map order is a named cache-breaker (ch. 17).
function stableStringify(_key: string, value: unknown): unknown {
  if (value && typeof value === "object" && !Array.isArray(value))
    return Object.fromEntries(Object.entries(value as Record<string, unknown>).sort(([a], [b]) => a < b ? -1 : a > b ? 1 : 0));
  return value;
}
