/**
 * Agora DataStream transcript message parser — mirrors the Android demo's
 * MessageParser.kt and handleParsedMessage dispatch.
 *
 * Wire protocol (per message chunk):
 *    messageId|partIndex|totalParts|base64Content
 *
 * - Multiple chunks with the same messageId must be assembled in order
 *   (partIndex is 1-based) before decoding.
 * - Assembled content is base64-decoded → UTF-8 string → JSON.parse.
 * - Unfinished messages expire after 5 minutes.
 */

export type TurnStatus = "in_progress" | "end" | "interrupted";

export type Transcription = {
  kind: "transcription";
  role: "assistant" | "user";
  text: string;
  turnId: number;           // falls back to stream_id or text_ts if turn_id absent
  userId: string;
  status: TurnStatus;
};

export type InterruptMsg = {
  kind: "interrupt";
  turnId: number;
  startMs: number;
};

export type StateMsg = {
  kind: "state";
  state: string;
};

export type ParsedStreamEvent = Transcription | InterruptMsg | StateMsg | { kind: "unknown"; raw: unknown };

const MAX_MESSAGE_AGE_MS = 5 * 60 * 1000;

export class StreamMessageParser {
  private partsByMsg = new Map<string, Map<number, string>>();
  private lastSeen = new Map<string, number>();

  /**
   * Feed one raw stream-message payload. Returns an assembled+dispatched
   * event if the message is complete, or null if still waiting for more parts
   * (or if the chunk is malformed — callers can ignore null).
   */
  feed(bytes: Uint8Array): ParsedStreamEvent | null {
    this.sweepExpired();
    const text = new TextDecoder().decode(bytes);
    const parts = text.split("|");
    if (parts.length !== 4) return null;

    const [messageId, partIndexStr, totalPartsStr, base64Content] = parts;
    const partIndex = Number.parseInt(partIndexStr, 10);
    const totalParts = Number.parseInt(totalPartsStr, 10);
    if (!Number.isFinite(partIndex) || !Number.isFinite(totalParts)) return null;
    if (partIndex < 1 || partIndex > totalParts) return null;

    this.lastSeen.set(messageId, Date.now());
    let parts_ = this.partsByMsg.get(messageId);
    if (!parts_) {
      parts_ = new Map();
      this.partsByMsg.set(messageId, parts_);
    }
    parts_.set(partIndex, base64Content);
    if (parts_.size !== totalParts) return null;

    let combined = "";
    for (let i = 1; i <= totalParts; i += 1) {
      const part = parts_.get(i);
      if (part === undefined) return null;
      combined += part;
    }
    this.partsByMsg.delete(messageId);
    this.lastSeen.delete(messageId);

    let json: unknown;
    try {
      const bin = atob(combined);
      const buf = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i += 1) buf[i] = bin.charCodeAt(i);
      const jsonStr = new TextDecoder().decode(buf);
      json = JSON.parse(jsonStr);
    } catch {
      return null;
    }

    return dispatch(json);
  }

  private sweepExpired() {
    const now = Date.now();
    for (const [id, ts] of this.lastSeen) {
      if (now - ts > MAX_MESSAGE_AGE_MS) {
        this.lastSeen.delete(id);
        this.partsByMsg.delete(id);
      }
    }
  }
}

function dispatch(msg: unknown): ParsedStreamEvent {
  const m = (msg ?? {}) as Record<string, unknown>;
  const object = typeof m.object === "string" ? m.object : "";
  const dataType = typeof m.data_type === "string" ? m.data_type : "";
  const role = typeof m.role === "string" ? m.role.toLowerCase() : "";

  if (dataType === "transcribe") {
    if (role === "assistant" || role === "user") return asTranscription(m, role);
  }
  if (object === "assistant.transcription") return asTranscription(m, "assistant");
  if (object === "user.transcription") return asTranscription(m, "user");
  if (object === "message.interrupt") {
    return {
      kind: "interrupt",
      turnId: asNumber(m.turn_id),
      startMs: asNumber(m.start_ms),
    };
  }
  if (object === "message.state") {
    return { kind: "state", state: String(m.state ?? "") };
  }
  return { kind: "unknown", raw: msg };
}

function asTranscription(m: Record<string, unknown>, role: "assistant" | "user"): Transcription {
  const text = typeof m.text === "string" ? m.text : "";
  const turnIdCandidate =
    asNumber(m.turn_id) || asNumber(m.stream_id) || asNumber(m.text_ts);
  const userId =
    typeof m.user_id === "string"
      ? m.user_id
      : m.user_id !== undefined
        ? String(m.user_id)
        : "";

  const turnStatus = asNumber(m.turn_status, -1);
  let status: TurnStatus;
  if (turnStatus >= 0) {
    status = turnStatus === 1 ? "end" : turnStatus === 2 ? "interrupted" : "in_progress";
  } else {
    status = m.is_final === true ? "end" : "in_progress";
  }
  return { kind: "transcription", role, text, turnId: turnIdCandidate, userId, status };
}

function asNumber(v: unknown, fallback = 0): number {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string" && v.length > 0) {
    const n = Number(v);
    return Number.isFinite(n) ? n : fallback;
  }
  return fallback;
}
