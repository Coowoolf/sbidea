"use client";

import { useState } from "react";
import type { JargonResult } from "../api/jargon/route";

type Direction = "toJargon" | "toPlain";

type State =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "success"; direction: Direction; result: JargonResult };

export function JargonClient() {
  const [text, setText] = useState("");
  const [direction, setDirection] = useState<Direction>("toJargon");
  const [state, setState] = useState<State>({ status: "idle" });

  async function handleTranslate() {
    const cleaned = text.trim();
    if (!cleaned) return;
    setState({ status: "loading" });
    try {
      const res = await fetch("/api/jargon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: cleaned, direction }),
      });
      const data = (await res.json()) as
        | { ok: true; result: JargonResult; direction: Direction }
        | { ok: false; error: string };
      if (!data.ok) {
        setState({ status: "error", message: data.error });
        return;
      }
      setState({
        status: "success",
        direction: data.direction,
        result: data.result,
      });
    } catch (err) {
      setState({
        status: "error",
        message: err instanceof Error ? err.message : "网络异常",
      });
    }
  }

  async function handleShare() {
    if (state.status !== "success") return;
    const labelFrom =
      state.direction === "toJargon" ? "人话" : "投资人黑话";
    const labelTo =
      state.direction === "toJargon" ? "投资人黑话" : "人话";
    const shareText = [
      `【SB 黑话词典】`,
      `${labelFrom}：${text}`,
      `${labelTo}：${state.result.translation}`,
      `黑话含量：${state.result.jargonScore}/100`,
      `调性：${state.result.vibe}`,
      ``,
      `来自 https://sbidea.ai/jargon`,
    ].join("\n");
    try {
      if (typeof navigator !== "undefined" && navigator.share) {
        await navigator.share({ title: "SB 黑话词典", text: shareText });
        return;
      }
      await navigator.clipboard.writeText(shareText);
      alert("已复制到剪贴板");
    } catch {
      /* ignore */
    }
  }

  const labelFrom = direction === "toJargon" ? "人话输入" : "投资人黑话输入";

  return (
    <div className="space-y-6">
      <div className="sb-card p-6">
        <div className="mb-4 inline-flex rounded-full border-2 border-[color:var(--color-ink)] p-1">
          <DirectionButton
            active={direction === "toJargon"}
            onClick={() => setDirection("toJargon")}
            label="人话 → 黑话"
          />
          <DirectionButton
            active={direction === "toPlain"}
            onClick={() => setDirection("toPlain")}
            label="黑话 → 人话"
          />
        </div>
        <label
          htmlFor="text"
          className="mb-2 block text-sm font-bold uppercase tracking-wide text-[color:var(--color-muted)]"
        >
          {labelFrom}（300 字以内）
        </label>
        <textarea
          id="text"
          rows={5}
          maxLength={300}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={
            direction === "toJargon"
              ? "例如：我想做一个帮人记账的 App。"
              : "例如：我们正在打造下一代 AI Native 的组织协同操作系统。"
          }
          className="w-full resize-none rounded-lg border-2 border-[color:var(--color-ink)] bg-transparent px-4 py-3 text-base outline-none focus:bg-white"
        />
        <div className="mt-1 text-right text-xs text-[color:var(--color-muted)]">
          {text.length} / 300
        </div>
        <div className="mt-4 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handleTranslate}
            disabled={state.status === "loading" || !text.trim()}
            className="sb-btn disabled:cursor-not-allowed disabled:opacity-60"
          >
            {state.status === "loading" ? "翻译中…" : "📖 开始翻译"}
          </button>
          {state.status === "success" && (
            <>
              <button
                type="button"
                onClick={handleTranslate}
                className="sb-btn sb-btn-ghost"
              >
                🔁 换个说法
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
        <article className="sb-card slide-up p-6 md:p-8">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="text-xs font-bold uppercase tracking-wide text-[color:var(--color-muted)]">
              {state.direction === "toJargon"
                ? "翻译后的投资人版本"
                : "人话版本"}
            </div>
            <JargonScore score={state.result.jargonScore} />
          </div>
          <blockquote className="text-2xl font-black leading-snug md:text-3xl">
            &ldquo;{state.result.translation}&rdquo;
          </blockquote>
          <div className="mt-4 text-sm italic text-[color:var(--color-muted)]">
            调性：{state.result.vibe}
          </div>

          <section className="mt-6 border-t-2 border-[color:var(--color-line)] pt-5">
            <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-[color:var(--color-muted)]">
              关键词对照
            </h3>
            <ul className="space-y-2">
              {state.result.highlights.map((h) => (
                <li key={h} className="flex gap-2">
                  <span className="text-[color:var(--color-accent)]">→</span>
                  <span>{h}</span>
                </li>
              ))}
            </ul>
          </section>
        </article>
      )}
    </div>
  );
}

function DirectionButton({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-4 py-1.5 text-sm font-bold transition-colors ${
        active
          ? "bg-[color:var(--color-ink)] text-[color:var(--color-paper)]"
          : "text-[color:var(--color-ink)] hover:bg-[color:var(--color-line)]"
      }`}
    >
      {label}
    </button>
  );
}

function JargonScore({ score }: { score: number }) {
  const color =
    score >= 70
      ? "bg-[color:var(--color-accent)] text-[color:var(--color-paper)]"
      : score >= 40
        ? "bg-[color:var(--color-gold)] text-[color:var(--color-ink)]"
        : "bg-[color:var(--color-ink)] text-[color:var(--color-paper)]";
  return (
    <div
      className={`rounded-full border-2 border-[color:var(--color-ink)] px-3 py-1 text-xs font-black ${color}`}
    >
      黑话含量 {score}/100
    </div>
  );
}
