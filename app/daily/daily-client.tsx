"use client";

import { useEffect, useState } from "react";
import type { Daily } from "../api/daily/route";

type State =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "success"; daily: Daily };

export function DailyClient() {
  const [state, setState] = useState<State>({ status: "idle" });

  // auto-fire one on mount so the page feels alive
  useEffect(() => {
    handleGenerate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleGenerate() {
    setState({ status: "loading" });
    try {
      const res = await fetch("/api/daily", { method: "POST" });
      const data = (await res.json()) as
        | { ok: true; daily: Daily }
        | { ok: false; error: string };
      if (!data.ok) {
        setState({ status: "error", message: data.error });
        return;
      }
      setState({ status: "success", daily: data.daily });
    } catch (err) {
      setState({
        status: "error",
        message: err instanceof Error ? err.message : "网络异常",
      });
    }
  }

  async function handleShare() {
    if (state.status !== "success") return;
    const text = [
      `【SB 成功学日签】`,
      state.daily.quote,
      ``,
      state.daily.explanation,
      `— ${state.daily.signature}`,
      ``,
      `来自 https://sbidea.ai/daily`,
    ].join("\n");
    try {
      if (typeof navigator !== "undefined" && navigator.share) {
        await navigator.share({ title: "SB 成功学日签", text });
        return;
      }
      await navigator.clipboard.writeText(text);
      alert("已复制到剪贴板");
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={handleGenerate}
          disabled={state.status === "loading"}
          className="sb-btn disabled:cursor-not-allowed disabled:opacity-60"
        >
          {state.status === "loading" ? "今日一签刷新中…" : "🔁 换一张日签"}
        </button>
        {state.status === "success" && (
          <button
            type="button"
            onClick={handleShare}
            className="sb-btn sb-btn-ghost"
          >
            📋 复制 / 分享
          </button>
        )}
      </div>

      {state.status === "error" && (
        <div className="sb-card border-[color:var(--color-accent)] p-6 text-[color:var(--color-accent)]">
          ⚠️ {state.message}
        </div>
      )}

      {state.status === "success" && <Poster daily={state.daily} />}

      {state.status === "loading" && (
        <div className="sb-card slide-up flex h-80 items-center justify-center text-[color:var(--color-muted)]">
          正在给你抄一句……
        </div>
      )}
    </div>
  );
}

function Poster({ daily }: { daily: Daily }) {
  const bg = `linear-gradient(135deg, ${daily.colorA}, ${daily.colorB})`;
  return (
    <figure
      className="sb-card slide-up relative min-h-[420px] overflow-hidden p-8 text-white md:p-12"
      style={{ background: bg }}
    >
      <div className="absolute right-6 top-6 text-sm font-bold uppercase tracking-[0.3em] opacity-80">
        sbidea.ai
      </div>
      <div className="relative z-10 flex h-full flex-col justify-between gap-10">
        <div>
          <div className="text-xs font-bold uppercase tracking-[0.3em] opacity-80">
            今日 SB 日签
          </div>
          <blockquote className="mt-6 text-3xl font-black leading-snug drop-shadow-md md:text-4xl">
            『{daily.quote}』
          </blockquote>
        </div>
        <div className="text-sm leading-relaxed opacity-95">
          <p>{daily.explanation}</p>
          <p className="mt-3 font-bold">— {daily.signature}</p>
        </div>
      </div>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 mix-blend-overlay opacity-20"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 20%, rgba(255,255,255,0.4), transparent 50%), radial-gradient(circle at 80% 70%, rgba(0,0,0,0.25), transparent 55%)",
        }}
      />
    </figure>
  );
}
