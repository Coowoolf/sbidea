import { NextResponse } from "next/server";

export const runtime = "nodejs";

type Body = { channel?: string };

export async function POST(req: Request) {
  let body: Body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "bad_json" }, { status: 400 });
  }
  const { channel } = body;
  if (!channel) {
    return NextResponse.json({ ok: false, error: "missing_channel" }, { status: 400 });
  }

  const backend = process.env.AGORA_TOKEN_BACKEND;
  if (!backend) {
    return NextResponse.json({ ok: false, error: "missing_backend" }, { status: 500 });
  }

  const url = backend.replace(/\/$/, "") + "/stop";
  try {
    const r = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        request_id: crypto.randomUUID(),
        channel_name: channel,
      }),
    });
    // Even if backend returns non-200, we don't want to block the client hang-up.
    if (!r.ok) {
      const text = await r.text();
      return NextResponse.json(
        { ok: false, error: `backend_${r.status}`, detail: text.slice(0, 200) },
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
