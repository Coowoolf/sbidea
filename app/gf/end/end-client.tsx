"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import { getGf, type Gf } from "@/lib/gfs";

// Must match the Line type written by call-client.tsx in Task 13.
type Line = {
  who: "gf" | "me";
  turnId: number;
  body: string;
  tags: string[];
  status: "in_progress" | "end" | "interrupted";
  ts: number;
};
type Summary = {
  slug: string;
  durationSec: number;
  lastLine: string;
  mix: Record<string, number>;
  lines: Line[];
};

export function EndClient() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [copied, setCopied] = useState(false);
  const [gf, setGf] = useState<Gf | null>(null);

  useEffect(() => {
    const raw = typeof window !== "undefined" ? sessionStorage.getItem("gf-call-summary") : null;
    if (!raw) return;
    try {
      const s = JSON.parse(raw) as Summary;
      setSummary(s);
      setGf(getGf(s.slug));
    } catch {
      // ignore
    }
  }, []);

  async function handleCopy() {
    if (!summary) return;
    const text = summary.lines
      .map((l) => `[${l.who === "gf" ? gf?.name ?? "她" : "你"}] ${l.body}`)
      .join("\n");
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  }

  if (!summary || !gf) {
    return (
      <div className="mx-auto max-w-md p-10 text-center">
        <p style={{ opacity: 0.6 }}>没找到通话记录。</p>
        <Link href={"/gf" as Route} className="mt-4 inline-block underline" style={{ color: "#f0b56b" }}>
          回去找她
        </Link>
      </div>
    );
  }

  const mm = String(Math.floor(summary.durationSec / 60)).padStart(2, "0");
  const ss = String(summary.durationSec % 60).padStart(2, "0");

  const entries = Object.entries(summary.mix).sort((a, b) => b[1] - a[1]);

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col px-5 py-10">
      <div className="text-[11px]" style={{ letterSpacing: "0.3em", opacity: 0.55 }}>
        CALL ENDED · {mm}:{ss}
      </div>

      <div className="mt-4 flex items-center gap-3">
        <div
          className="flex h-14 w-14 items-center justify-center rounded-full text-2xl"
          style={{ background: `linear-gradient(135deg, ${gf.gradientFrom}, ${gf.gradientTo})` }}
        >
          {gf.emoji}
        </div>
        <div>
          <div className="text-lg font-black">{gf.name}</div>
          <div className="text-[11px]" style={{ letterSpacing: "0.15em", opacity: 0.55 }}>
            {gf.sbtiCode} · {gf.sbtiName}
          </div>
        </div>
      </div>

      {summary.lastLine && (
        <div
          className="mt-4 rounded-xl px-3 py-3 text-[13px] leading-relaxed"
          style={{ background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.08)" }}
        >
          <div className="text-[10px] font-bold" style={{ letterSpacing: "0.2em", opacity: 0.5 }}>
            她留的话
          </div>
          <div className="mt-1">{summary.lastLine}</div>
        </div>
      )}

      {entries.length > 0 && (
        <div className="mt-4">
          <div className="flex items-center gap-2 text-[10px]" style={{ letterSpacing: "0.2em", opacity: 0.6 }}>
            EMOTION MIX
          </div>
          <div
            className="mt-1 flex h-2 overflow-hidden rounded-full"
            style={{ background: "rgba(255,255,255,.06)" }}
          >
            {entries.map(([k, v], i) => (
              <div
                key={k}
                style={{
                  width: `${Math.round(v * 100)}%`,
                  background: ["#f0b56b", "#d63939", "#9ab07a", "#7aa6d9", "#c7a3d6"][i % 5],
                }}
                title={`${k}: ${(v * 100).toFixed(0)}%`}
              />
            ))}
          </div>
          <div className="mt-1 flex flex-wrap gap-2 text-[10px]" style={{ opacity: 0.75 }}>
            {entries.slice(0, 6).map(([k, v]) => (
              <span key={k}>
                {k} {(v * 100).toFixed(0)}%
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="mt-auto flex flex-col gap-2 pt-8">
        <Link
          href={"/gf" as Route}
          className="rounded-xl px-4 py-3 text-center text-base font-black"
          style={{ background: "#f0b56b", color: "#0a0a0a" }}
        >
          🎙️ 再打一次
        </Link>
        <button
          type="button"
          onClick={handleCopy}
          className="rounded-xl px-4 py-3 text-[14px]"
          style={{
            background: "rgba(255,255,255,.08)",
            border: "1px solid rgba(255,255,255,.15)",
            color: "#fff",
          }}
        >
          {copied ? "✅ 已复制" : "📋 复制这段对话"}
        </button>
        <Link href={"/" as Route} className="mt-2 text-center text-[12px] underline" style={{ color: "#fff", opacity: 0.5 }}>
          ← 回 sbidea.ai
        </Link>
      </div>
    </div>
  );
}
