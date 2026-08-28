// tinyengine/stream-normalizer.ts — one grammar for every provider (Chapter 12).
// Intake: raw SSE lines in any supported grammar. Output: four internal events.
export type Provider = "openai-chat" | "openai-responses" | "anthropic" | "gemini";
export type StopReason = "stop" | "tool_call" | "length" | "filtered" | "paused" | "unknown";
export type Event =
  | { type: "text_delta"; text: string; ts: number; ttftSeconds?: number }
  | { type: "tool_call_delta"; callId: string; name?: string; fragment: string; ts: number }
  | { type: "tool_call"; callId: string; name: string; args: object; ts: number }   // assembled once, at finish
  | { type: "usage"; freshIn: number; cachedIn: number; cacheWriteIn: number; out: number; reasoning: number; ts: number; incomplete?: true }
  | { type: "stop_reason"; value: StopReason; raw?: string; ts: number }
  | { type: "incomplete_call"; callId: string; reason: string; ts: number };

const FINISH: Record<string, StopReason> = {
  stop: "stop", length: "length", content_filter: "filtered", tool_calls: "tool_call", function_call: "tool_call",
  end_turn: "stop", stop_sequence: "stop", max_tokens: "length", tool_use: "tool_call", pause_turn: "paused",
  STOP: "stop", MAX_TOKENS: "length", SAFETY: "filtered", RECITATION: "filtered", OTHER: "unknown",
  model_stop: "stop", paused: "paused",
};

class ToolCallAccumulator {
  private calls = new Map<string, { name: string; parts: string[] }>();
  add(callId: string, name: string | undefined, fragment: string): Event[] {
    const c = this.calls.get(callId) ?? { name: name ?? "", parts: [] };
    if (name) c.name = name;
    c.parts.push(fragment);
    this.calls.set(callId, c);
    return [{ type: "tool_call_delta", callId, name, fragment, ts: Date.now() / 1000 }];
  }
  // Parse exactly once, at the finish. "" coerces to {}. Mid-escape splits survive.
  finish(ts: number): Event[] {
    const out: Event[] = [];
    for (const [callId, c] of this.calls) {
      const raw = c.parts.join("");
      try {
        const parsed: unknown = raw === "" ? {} : JSON.parse(raw);
        // The Event contract says args is an object: a payload that parses cleanly to a
        // string or number (e.g. a string-typed functionCall.args) is rejected, not passed
        // through (gate-6 A10) — same marker as unparseable arguments.
        if (typeof parsed === "object" && parsed !== null)
          out.push({ type: "tool_call", callId, name: c.name, args: parsed, ts });
        else out.push({ type: "incomplete_call", callId, reason: "arguments did not parse to an object at finish", ts });
      }
      catch { out.push({ type: "incomplete_call", callId, reason: "arguments did not parse at finish", ts }); }
    }
    this.calls.clear();
    return out;
  }
}

export class StreamNormalizer {
  private tools = new ToolCallAccumulator();
  private sawContent = false;
  private sawStop = false;                                  // first stop wins (gate-6 A7)
  private pendingIndexToId = new Map<number, string>();     // chat: index → id, resolved when id arrives
  private blockIndexToToolId = new Map<number, string>();   // anthropic: content-block index → toolu_ id (gate-6 A9)
  constructor(public provider: Provider) {}

  // One raw SSE line in. Meta-only lines (comments, event:/id:/retry:, empty) are skipped.
  ingest(line: string): Event[] {
    if (!line.startsWith("data:")) return [];              // meta-only or keep-alive: skip, never crash
    const payload = line.slice(5).trim();
    if (payload === "" || payload === "[DONE]") return []; // sentinel: not JSON, not an error
    let chunk: any;
    try { chunk = JSON.parse(payload); } catch { return []; }
    // Parsed but not an object (null, array, bare string/number): skip like an unparseable
    // line — one bad keep-alive payload must never kill the stream loop (gate-6 A1).
    if (typeof chunk !== "object" || chunk === null || Array.isArray(chunk)) return [];
    const ts = Date.now() / 1000;
    return this.provider === "openai-chat" ? this.chat(chunk, ts)
      : this.provider === "openai-responses" ? this.responses(chunk, ts)
      : this.provider === "anthropic" ? this.anthropic(chunk, ts) : this.gemini(chunk, ts);
  }

  // The stream ended (sentinel, finish event, or clean close): assemble tool calls once.
  finish(): Event[] { return this.tools.finish(Date.now() / 1000); }

  private text(text: string, ts: number): Event[] {
    if (text === "") return [];
    const e: Event = { type: "text_delta", text, ts };
    if (!this.sawContent) { this.sawContent = true; (e as any).ttftSeconds = ts - this.t0; }
    return [e];
  }
  private t0 = Date.now() / 1000;

  // One stop per stream: a retried/repeated finish chunk never re-fires the stop event
  // (gate-6 A7) — the stream already ended; the duplicate is a transport artifact.
  private stop(value: StopReason, raw: string | undefined, ts: number): Event[] {
    if (this.sawStop) return [];
    this.sawStop = true;
    return [{ type: "stop_reason", value, raw, ts }];
  }

  private chat(c: any, ts: number): Event[] {
    const out: Event[] = [];
    const u = c.usage;
    if (u) out.push(this.usageEvt(u.prompt_tokens - (u.prompt_tokens_details?.cached_tokens ?? 0),
      u.prompt_tokens_details?.cached_tokens ?? 0, u.prompt_tokens_details?.cache_write_tokens ?? 0,
      u.completion_tokens, u.completion_tokens_details?.reasoning_tokens ?? 0, ts));
    for (const ch of c.choices ?? []) {
      out.push(...this.text(ch.delta?.content ?? "", ts));
      for (const tc of ch.delta?.tool_calls ?? []) {
        let id = tc.id ?? this.pendingIndexToId.get(tc.index);
        if (tc.id) { this.pendingIndexToId.set(tc.index, tc.id); id = tc.id; }
        const frag = tc.function?.arguments ?? "";
        if (frag !== "" || id) out.push(...this.tools.add(id ?? `idx:${tc.index}`, tc.function?.name, frag));
      }
      if (ch.finish_reason) out.push(...this.stop(FINISH[ch.finish_reason] ?? "unknown", ch.finish_reason, ts));
    }
    return out;
  }

  private responses(c: any, ts: number): Event[] {
    const out: Event[] = [];
    if (c.type === "response.output_text.delta") out.push(...this.text(c.delta ?? "", ts));
    else if (c.type === "response.function_call_arguments.delta" || c.type === "response.output_item.added") {
      const id = c.item_id ?? c.item?.id ?? c.call_id ?? "resp:?";
      const frag = c.delta ?? "";
      if (c.item?.name || frag) out.push(...this.tools.add(id, c.item?.name, frag));
    } else if (c.type === "response.completed") { // terminal contract per ch12's dated snapshot — unattested event names are not handled
      const u = c.response?.usage;
      if (u) out.push(this.usageEvt((u.input_tokens ?? 0) - (u.input_tokens_details?.cached_tokens ?? 0),
        u.input_tokens_details?.cached_tokens ?? 0, u.input_tokens_details?.cache_write_tokens ?? 0,
        u.output_tokens, u.output_tokens_details?.reasoning_tokens ?? 0, ts));
      out.push(...this.stop(FINISH[c.response?.status_details?.reason ?? c.response?.status] ?? "unknown",
        c.response?.status_details?.reason ?? c.response?.status, ts));
    }
    return out;
  }

  private anthropic(c: any, ts: number): Event[] {
    const out: Event[] = [];
    if (c.type === "message_start") {
      const u = c.message?.usage ?? {};
      out.push(this.usageEvt(u.input_tokens ?? 0, u.cache_read_input_tokens ?? 0,
        u.cache_creation_input_tokens ?? 0, 0, 0, ts)); // output lands in message_delta
    } else if (c.type === "content_block_start") {
      if (c.content_block?.type === "tool_use") {
        const id = c.content_block.id ?? `block:${c.index}`;  // toolu_ id keys the call
        this.blockIndexToToolId.set(c.index, id);              // deltas key by block index (gate-6 A9)
        out.push(...this.tools.add(id, c.content_block.name, ""));
      } // text blocks: nothing to emit until deltas arrive
    } else if (c.type === "content_block_stop") {
      this.blockIndexToToolId.delete(c.index);                 // a later delta for this index is an orphan
    } else if (c.type === "content_block_delta") {
      const d = c.delta ?? {};
      if (d.type === "text_delta") out.push(...this.text(d.text ?? "", ts));
      else if (d.type === "input_json_delta" || d.type === "partial_json") {
        // Keyed by the delta's block index, not the last start seen: interleaved tool
        // blocks attribute correctly. A delta with no prior block start (lost on a
        // dropped event) is an orphan — skipped, never merged into another call (gate-6 A8).
        const id = this.blockIndexToToolId.get(c.index);
        if (id !== undefined) out.push(...this.tools.add(id, undefined, d.partial_json ?? ""));
      }
    } else if (c.type === "message_delta") {
      const u = c.usage ?? {};
      if (u.output_tokens !== undefined) out.push(this.usageEvt(0, 0, 0, u.output_tokens, 0, ts));
      if (c.delta?.stop_reason) out.push(...this.stop(FINISH[c.delta.stop_reason] ?? "unknown", c.delta.stop_reason, ts));
    }
    return out;
  }

  private gemini(c: any, ts: number): Event[] {
    const out: Event[] = [];
    const u = c.usageMetadata;
    if (u) out.push(this.usageEvt((u.promptTokenCount ?? 0) - (u.promptTokensDetails?.cachedContentTokenCount ?? 0),
      u.promptTokensDetails?.cachedContentTokenCount ?? 0, 0, u.candidatesTokenCount ?? 0, u.thoughtsTokenCount ?? 0, ts));
    for (const part of c.candidates?.[0]?.content?.parts ?? []) {
      if (typeof part.text === "string") out.push(...this.text(part.text, ts));
      if (part.functionCall) {
        // args is an object in Gemini's grammar. A JSON-text string is a lenient variant
        // (fed as a fragment, parsed at finish); any other non-object is rejected there
        // by the accumulator's object guard (gate-6 A10).
        const frag = typeof part.functionCall.args === "string"
          ? part.functionCall.args : JSON.stringify(part.functionCall.args ?? {});
        out.push(...this.tools.add(`step:${part.functionCall.name}`, part.functionCall.name, frag));
      }
    }
    const fr = c.candidates?.[0]?.finishReason;
    if (fr) out.push(...this.stop(FINISH[fr] ?? "unknown", fr, ts));
    return out;
  }

  // The single usage constructor. A wrapper that renames or stringifies fields yields
  // undefined arithmetic → NaN; NaN poisons every sum downstream forever. Non-numeric
  // fields coerce to 0 and the event is flagged `incomplete` — visible, not silent (gate-6 A2).
  private usageEvt(freshIn: number, cachedIn: number, cacheWriteIn: number, out: number, reasoning: number, ts: number): Event {
    const num = (x: number) => Number.isFinite(x) ? x : 0;
    const incomplete = [freshIn, cachedIn, cacheWriteIn, out, reasoning].some((x) => !Number.isFinite(x));
    const e: Event = { type: "usage", freshIn: Math.max(0, num(freshIn)), cachedIn: num(cachedIn),
      cacheWriteIn: num(cacheWriteIn), out: num(out), reasoning: num(reasoning), ts };
    return incomplete ? { ...e, incomplete: true } : e;
  }
}
