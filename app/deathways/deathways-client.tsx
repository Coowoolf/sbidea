"use client";

import { useEffect, useRef, useState } from "react";
import type { DeathOracle } from "../api/deathways/route";
import { useAdventure } from "@/components/adventure-provider";
import { AdventureBar } from "@/components/adventure-bar";
import { AdventureCTA } from "@/components/adventure-cta";
import { getIdeaFromState, loadAdventure } from "@/lib/adventure";

type State =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "success"; oracle: DeathOracle };

export function DeathwaysClient() {
  const [idea, setIdea] = useState("");
  const [state, setState] = useState<State>({ status: "idle" });
  const { recordStop } = useAdventure();
  const stoppedRef = useRef(false);

  // Pre-fill idea: URL param first, then fall back to adventure state (cookie)
  useEffect(() => {
    if (idea) return;
    const params = new URLSearchParams(window.location.search);
    const urlIdea = params.get("idea");
    if (urlIdea) {
      setIdea(urlIdea.slice(0, 400));
      return;
    }
    const fromState = getIdeaFromState(loadAdventure());
    if (fromState) setIdea(fromState.slice(0, 400));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (state.status === "success" && !stoppedRef.current) {
      stoppedRef.current = true;
      recordStop("deathways", state.oracle.ways[0]?.title ?? "占卜完成", {
        waysCount: state.oracle.ways.length,
      });
    }
    if (state.status !== "success") {
      stoppedRef.current = false;
    }
  }, [state, recordStop]);

  async function handleGenerate() {
    const cleaned = idea.trim();
    if (!cleaned) return;
    setState({ status: "loading" });
    try {
      const res = await fetch("/api/deathways", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idea: cleaned }),
      });
      const data = (await res.json()) as
        | { ok: true; oracle: DeathOracle }
        | { ok: false; error: string };
      if (!data.ok) {
        setState({ status: "error", message: data.error });
        return;
      }
      setState({ status: "success", oracle: data.oracle });
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
      `【SB 死法占卜】`,
      `我的点子：${idea}`,
      ``,
      ...state.oracle.ways.map(
        (w, i) => `${i + 1}. ${w.title}（${w.timeline}）— ${w.rootCause}`
      ),
      ``,
      `来自 https://sbidea.ai/deathways`,
    ].join("\n");
    try {
      if (typeof navigator !== "undefined" && navigator.share) {
        await navigator.share({ title: "SB 死法占卜", text });
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
          htmlFor="idea"
          className="mb-2 block text-sm font-bold uppercase tracking-wide text-[color:var(--color-muted)]"
        >
          你的点子
        </label>
        <textarea
          id="idea"
          rows={5}
          maxLength={400}
          value={idea}
          onChange={(e) => setIdea(e.target.value)}
          placeholder="输入你的创业点子，AI 会预言它会如何死掉。"
          className="w-full resize-none rounded-lg border-2 border-[color:var(--color-ink)] bg-transparent px-4 py-3 text-base outline-none focus:bg-white"
        />
        <div className="mt-1 text-right text-xs text-[color:var(--color-muted)]">
          {idea.length} / 400
        </div>
        <div className="mt-4 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handleGenerate}
            disabled={state.status === "loading" || !idea.trim()}
            className="sb-btn disabled:cursor-not-allowed disabled:opacity-60"
          >
            {state.status === "loading" ? "占卜师正在洗牌…" : "💀 开始占卜"}
          </button>
          {state.status === "success" && (
            <>
              <button
                type="button"
                onClick={handleGenerate}
                className="sb-btn sb-btn-ghost"
              >
                🔁 再占一次
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
        <>
          <div className="space-y-4">
            {state.oracle.ways.map((w, i) => (
              <article key={i} className="sb-card slide-up p-6 md:p-8">
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-[color:var(--color-ink)] bg-[color:var(--color-ink)] text-sm font-black text-[color:var(--color-paper)]">
                      {i + 1}
                    </span>
                    <h3 className="text-xl font-black md:text-2xl">
                      {w.title}
                    </h3>
                  </div>
                  <div className="text-xs font-bold uppercase tracking-wide text-[color:var(--color-muted)]">
                    {w.timeline}
                  </div>
                </div>
                <p className="leading-relaxed">{w.story}</p>
                <div className="mt-4 border-t-2 border-[color:var(--color-line)] pt-3 text-sm">
                  <span className="font-black text-[color:var(--color-accent)]">
                    根本原因：
                  </span>
                  <span className="text-[color:var(--color-muted)]">
                    {w.rootCause}
                  </span>
                </div>
              </article>
            ))}
          </div>
          <article className="sb-card slide-up bg-[color:var(--color-ink)] p-6 text-[color:var(--color-paper)] md:p-8">
            <div className="mb-2 text-xs font-bold uppercase tracking-[0.3em] opacity-60">
              墓志铭
            </div>
            <p className="text-lg italic leading-relaxed">
              {state.oracle.finalEulogy}
            </p>
          </article>

          <AdventureCTA
            product="deathways"
            nextQuery={idea ? `idea=${encodeURIComponent(idea.slice(0, 400))}` : undefined}
          />
        </>
      )}
    </div>
  );
}
