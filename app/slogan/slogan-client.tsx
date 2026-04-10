"use client";

import { useEffect, useRef, useState } from "react";
import type { SloganResult } from "../api/slogan/route";
import { STYLES } from "../api/slogan/route";
import { useAdventure } from "@/components/adventure-provider";
import { AdventureBar } from "@/components/adventure-bar";
import { AdventureCTA } from "@/components/adventure-cta";

type State =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "success"; result: SloganResult };

const STYLE_COLORS: Record<string, string> = {
  vc: "from-blue-100 to-blue-50",
  douyin: "from-pink-100 to-rose-50",
  redbook: "from-red-100 to-pink-50",
  laoganbu: "from-green-100 to-emerald-50",
  micro: "from-yellow-100 to-amber-50",
  anime: "from-purple-100 to-violet-50",
  talkshow: "from-orange-100 to-yellow-50",
  cctv: "from-red-100 to-orange-50",
};

export function SloganClient() {
  const [concept, setConcept] = useState("");
  const [state, setState] = useState<State>({ status: "idle" });
  const { recordStop } = useAdventure();
  const stoppedRef = useRef(false);

  useEffect(() => {
    if (state.status === "success" && !stoppedRef.current) {
      stoppedRef.current = true;
      recordStop("slogan", "8 种风格", {
        count: state.result.slogans.length,
      });
    }
    if (state.status !== "success") {
      stoppedRef.current = false;
    }
  }, [state, recordStop]);

  async function handleGenerate() {
    const cleaned = concept.trim();
    if (!cleaned) return;
    setState({ status: "loading" });
    try {
      const res = await fetch("/api/slogan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ concept: cleaned }),
      });
      const data = (await res.json()) as
        | { ok: true; result: SloganResult }
        | { ok: false; error: string };
      if (!data.ok) {
        setState({ status: "error", message: data.error });
        return;
      }
      setState({ status: "success", result: data.result });
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
      `【SB Slogan 对撞机】`,
      `产品：${concept}`,
      ``,
      ...state.result.slogans.map((s) => {
        const label = STYLES.find((x) => x.key === s.styleKey)?.label ?? s.styleKey;
        return `【${label}】${s.text}`;
      }),
      ``,
      `来自 https://sbidea.ai/slogan`,
    ].join("\n");
    try {
      if (typeof navigator !== "undefined" && navigator.share) {
        await navigator.share({ title: "SB Slogan 对撞机", text });
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
      <AdventureBar />
      <div className="sb-card p-6">
        <label
          htmlFor="concept"
          className="mb-2 block text-sm font-bold uppercase tracking-wide text-[color:var(--color-muted)]"
        >
          产品概念（200 字以内）
        </label>
        <textarea
          id="concept"
          rows={4}
          maxLength={200}
          value={concept}
          onChange={(e) => setConcept(e.target.value)}
          placeholder="例如：一个帮你写日记的 AI，每晚 10 点主动问你今天发生了什么。"
          className="w-full resize-none rounded-lg border-2 border-[color:var(--color-ink)] bg-transparent px-4 py-3 text-base outline-none focus:bg-white"
        />
        <div className="mt-1 text-right text-xs text-[color:var(--color-muted)]">
          {concept.length} / 200
        </div>
        <div className="mt-4 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handleGenerate}
            disabled={state.status === "loading" || !concept.trim()}
            className="sb-btn disabled:cursor-not-allowed disabled:opacity-60"
          >
            {state.status === "loading"
              ? "8 个文案打起来了…"
              : "🎨 让 8 个文案各写一条"}
          </button>
          {state.status === "success" && (
            <>
              <button
                type="button"
                onClick={handleGenerate}
                className="sb-btn sb-btn-ghost"
              >
                🔁 再来一轮
              </button>
              <button
                type="button"
                onClick={handleShare}
                className="sb-btn sb-btn-ghost"
              >
                📋 分享
              </button>
            </>
          )}
        </div>
      </div>

      {state.status === "error" && (
        <div className="sb-card border-[color:var(--color-accent)] p-6 text-[color:var(--color-accent)]">
          ⚠️ {state.message}
        </div>
      )}

      {state.status === "success" && (
        <div className="grid gap-4 md:grid-cols-2">
          {state.result.slogans.map((s) => {
            const meta = STYLES.find((x) => x.key === s.styleKey);
            const color = STYLE_COLORS[s.styleKey] ?? "from-gray-100 to-gray-50";
            return (
              <article
                key={s.styleKey}
                className={`sb-card slide-up bg-gradient-to-br ${color} p-6`}
              >
                <div className="mb-2 text-xs font-bold uppercase tracking-wide text-[color:var(--color-muted)]">
                  {meta?.label ?? s.styleKey}
                </div>
                <p className="text-2xl font-black leading-tight">{s.text}</p>
              </article>
            );
          })}
        </div>
      )}

      {state.status === "success" && <AdventureCTA product="slogan" />}
    </div>
  );
}
