// tinyengine/session-store.ts — a session is a byte-exact asset (Chapter 17).
import { createHash } from "node:crypto";
import type { CacheLedger } from "./cache-ledger.js";

export type IdleClass = "interactive" | "think_time" | "overnight";
export interface Template {                      // frozen at session start; version + key order pinned
  id: string; version: string;
  tools: object[];                               // sorted by name at render — a lying serializer kills hits
  system: string; staticContext?: string;        // L1/L2/L3 of ch. 17's five layers
}

export interface SessionEvent { at: number; kind: "message" | "compaction" | "resume" | "spawn"; hash?: string }

// TTL policy (ch. 17): classify the idle pattern, request the entry class that matches the gap.
export function classifyIdle(idleMinutes: number): IdleClass {
  if (idleMinutes < 5) return "interactive";
  if (idleMinutes < 60) return "think_time";
  return "overnight";
}
export function ttlRequestFor(c: IdleClass): 300 | 3600 { return c === "interactive" ? 300 : 3600; }

export interface SchedulerGate { tryAcquire(n: number): boolean }   // ch. 15 keeps the tick inside the budget

export class SessionStore {
  private sessions = new Map<string, { template: Template; events: SessionEvent[]; transcript: { role: string; content: string }[]; lastActivity: number; breakpoints: string[] }>();

  constructor(private ledger: CacheLedger, private scheduler?: SchedulerGate) {}

  create(template: Template, sessionId: string, now = Date.now() / 1000): void {
    this.sessions.set(sessionId, { template, events: [{ at: now, kind: "message" }], transcript: [], lastActivity: now,
      // breakpoint stack: the template's frozen layers, the last marking the shared block's end (ch. 17.5)
      breakpoints: [template.id + ":tools", template.id + ":system", ...(template.staticContext ? [template.id + ":static"] : [])] });
    this.ledger.deploy(template.id, this.renderTemplate(template)); // template hash visible as a cache event
  }

  // Append-only: every message stored once, content-hashed, never mutated. The transcript IS the archive.
  append(sessionId: string, role: string, content: string, now = Date.now() / 1000): string {
    const s = this.get(sessionId);
    const hash = createHash("sha256").update(`${role}:${content}`).digest("hex").slice(0, 12);
    s.transcript.push({ role, content });
    s.events.push({ at: now, kind: "message", hash });
    s.lastActivity = now;
    return hash;
  }

  // The renderer: five layers in ch. 17's frozen order — tools → system → static → transcript → tail.
  // Deterministic: tool keys sorted by name, JSON.stringify with sorted keys, versions pinned.
  render(sessionId: string, tail: string): { prompt: string; hash: string } {
    const s = this.get(sessionId);
    const tools = [...s.template.tools].sort((a, b) => JSON.stringify(a) < JSON.stringify(b) ? -1 : 1);
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

  // Byte-exact resume proof (ch. 17): render → hash → resume → render → hash; equality is the test.
  resumeHash(sessionId: string, tail: string): string { return this.render(sessionId, tail).hash; }

  // Breakpoint placement with the 4-max and the leapfrog: roll the oldest when a fifth arrives.
  addBreakpoint(sessionId: string, mark: string): void {
    const s = this.get(sessionId);
    if (s.breakpoints.length >= 4) s.breakpoints = [...s.breakpoints.slice(1), mark]; // leapfrog past it
    else s.breakpoints.push(mark);
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

  // Warm compaction (ch. 17): summarize while the cache is warm; the summary call rides the cached prefix.
  compact(sessionId: string, summary: string, now = Date.now() / 1000): void {
    const s = this.get(sessionId);
    s.transcript = [{ role: "assistant", content: `[summary] ${summary}` }];
    s.events.push({ at: now, kind: "compaction" });
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

  private renderTemplate(t: Template): string { return JSON.stringify([t.id, t.version, t.tools], stableStringify) + t.system + (t.staticContext ?? ""); }
  private get(id: string) { const s = this.sessions.get(id); if (!s) throw new Error(`unknown session ${id}`); return s; }
}

// Deterministic JSON: object keys sorted recursively. Hash-map order is a named cache-breaker (ch. 17).
function stableStringify(_key: string, value: unknown): unknown {
  if (value && typeof value === "object" && !Array.isArray(value))
    return Object.fromEntries(Object.entries(value as Record<string, unknown>).sort(([a], [b]) => a < b ? -1 : 1));
  return value;
}
