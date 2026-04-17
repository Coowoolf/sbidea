"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Route } from "next";
import type { Gf } from "@/lib/gfs";

export function LandingClient({ gf }: { gf: Gf }) {
  const router = useRouter();
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleStart() {
    setErr(null);
    setBusy(true);
    try {
      // Request microphone up-front so we fail fast on denial.
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      // We don't need the stream on this page — stop it immediately,
      // the call page will request again.
      stream.getTracks().forEach((t) => t.stop());
    } catch {
      setBusy(false);
      setErr("需要麦克风才能聊天。浏览器地址栏左侧点一下,把麦克风权限打开再试。");
      return;
    }
    const slug = gf.slug;
    const uid = Math.floor(Math.random() * 1_000_000) + 1;
    const suffix = Math.random().toString(36).slice(2, 10);
    const channel = `gf-${slug}-${suffix}`;
    const params = new URLSearchParams({ slug, channel, uid: String(uid) });
    router.push(`/gf/call?${params.toString()}` as Route);
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col px-5 py-10">
      <div className="mb-4 text-xs font-black tracking-[0.3em]" style={{ opacity: 0.55 }}>
        CYBER · GF
      </div>

      <div className="flex items-center gap-4">
        <div
          className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full text-4xl"
          style={{ background: `linear-gradient(135deg, ${gf.gradientFrom}, ${gf.gradientTo})` }}
        >
          {gf.emoji}
        </div>
        <div>
          <div className="text-3xl font-black">{gf.name}</div>
          <div className="mt-1 text-xs font-bold" style={{ letterSpacing: "0.15em", opacity: 0.6 }}>
            {gf.sbtiCode} · {gf.sbtiName}
          </div>
        </div>
      </div>

      <p className="mt-5 text-[15px] leading-relaxed" style={{ opacity: 0.9 }}>
        {gf.tagline}
      </p>

      <div
        className="mt-5 rounded-xl border px-4 py-3 text-sm leading-relaxed"
        style={{ background: "rgba(255,255,255,.04)", borderColor: "rgba(255,255,255,.08)" }}
      >
        <div className="text-[10px] font-bold" style={{ letterSpacing: "0.2em", opacity: 0.5 }}>
          最近一次她说
        </div>
        <div className="mt-1">{gf.firstLine}</div>
      </div>

      <button
        type="button"
        onClick={handleStart}
        disabled={busy}
        className="mt-6 rounded-xl px-4 py-3 text-base font-black disabled:opacity-60"
        style={{ background: "#f0b56b", color: "#0a0a0a" }}
      >
        {busy ? "..." : "🎙️ 让她开口"}
      </button>
      <div className="mt-2 text-center text-[11px]" style={{ opacity: 0.45 }}>
        需要麦克风权限 · 通话上限 5 分钟
      </div>

      {err && (
        <div
          className="mt-4 rounded-lg px-3 py-2 text-[13px]"
          style={{ background: "rgba(214,57,57,.14)", color: "#ff8f8f" }}
        >
          {err}
        </div>
      )}

      <div className="mt-auto pt-10 text-center text-xs" style={{ opacity: 0.4 }}>
        <a href="/" style={{ color: "#fff" }}>
          ← 回 sbidea.ai
        </a>
      </div>
    </div>
  );
}
