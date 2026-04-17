import { NextResponse } from "next/server";
import pkg from "agora-access-token";
const { RtcTokenBuilder, RtcRole } = pkg;

export const runtime = "nodejs";

type Body = { channel?: string; uid?: number };

export async function POST(req: Request) {
  let body: Body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "bad_json" }, { status: 400 });
  }
  const { channel, uid } = body;
  if (!channel || typeof channel !== "string" || channel.length > 64) {
    return NextResponse.json({ ok: false, error: "bad_channel" }, { status: 400 });
  }
  if (!uid || typeof uid !== "number") {
    return NextResponse.json({ ok: false, error: "bad_uid" }, { status: 400 });
  }

  const appId = process.env.NEXT_PUBLIC_AGORA_APP_ID;
  const appCert = process.env.AGORA_APP_CERT;
  if (!appId || !appCert) {
    return NextResponse.json(
      { ok: false, error: "missing_env" },
      { status: 500 },
    );
  }

  const nowSec = Math.floor(Date.now() / 1000);
  const expireTs = nowSec + 600; // 10 min window — call cap is 5 min, leaves buffer

  const token = RtcTokenBuilder.buildTokenWithUid(
    appId,
    appCert,
    channel,
    uid,
    RtcRole.PUBLISHER,
    expireTs,
  );

  return NextResponse.json({ ok: true, token, appId, expireTs });
}
