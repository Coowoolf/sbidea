import { NextResponse } from "next/server";
import { getGf } from "@/lib/gfs";

export const runtime = "nodejs";

type Body = { channel?: string; uid?: number; gfSlug?: string };

const GRAPH_NAME = "voice_assistant_rewrite3";
// Matches Android demo's DEFAULT_AGENT_UID so the web client can identify
// which remote user is the agent.
const AGENT_UID = 2001;
const CALL_CAP_SEC = 300;
// The LLM extension node in voice_assistant_rewrite3 is named "openai_llm2_python"
// (uses doubao-mini). Confirmed by backend owner.
const LLM_EXTENSION = "openai_llm2_python";

export async function POST(req: Request) {
  let body: Body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "bad_json" }, { status: 400 });
  }
  const { channel, uid, gfSlug } = body;
  if (!channel || !uid || !gfSlug) {
    return NextResponse.json({ ok: false, error: "missing_field" }, { status: 400 });
  }
  const gf = getGf(gfSlug);
  if (!gf) {
    return NextResponse.json({ ok: false, error: "unknown_gf" }, { status: 404 });
  }

  const backend = process.env.AGORA_TOKEN_BACKEND;
  if (!backend) {
    return NextResponse.json({ ok: false, error: "missing_backend" }, { status: 500 });
  }

  const payload = {
    request_id: crypto.randomUUID(),
    channel_name: channel,
    user_uid: uid,
    bot_uid: AGENT_UID,
    graph_name: GRAPH_NAME,
    properties: {
      [LLM_EXTENSION]: { system_prompt: gf.systemPrompt },
    },
    timeout: CALL_CAP_SEC,
  };

  const url = backend.replace(/\/$/, "") + "/start";
  try {
    const r = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!r.ok) {
      const text = await r.text();
      return NextResponse.json(
        { ok: false, error: `backend_${r.status}`, detail: text.slice(0, 400) },
        { status: 502 },
      );
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: "backend_unreachable", detail: String(e).slice(0, 200) },
      { status: 502 },
    );
  }
}
