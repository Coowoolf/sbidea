"use client";

import { useState } from "react";
import type { GeneratedIdea } from "../api/generate/route";

type GenerateState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "success"; idea: GeneratedIdea };

export function GeneratorClient() {
  const [hint, setHint] = useState("");
  const [state, setState] = useState<GenerateState>({ status: "idle" });

  async function handleGenerate() {
    setState({ status: "loading" });
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hint: hint.trim() || undefined }),
      });
      const data = (await res.json()) as
        | { ok: true; idea: GeneratedIdea }
        | { ok: false; error: string };
      if (!data.ok) {
        setState({ status: "error", message: data.error });
        return;
      }
      setState({ status: "success", idea: data.idea });
    } catch (err) {
      setState({
        status: "error",
        message: err instanceof Error ? err.message : "网络异常",
      });
    }
  }

  return (
    <div className="space-y-6">
      <div className="sb-card p-6">
        <label
          htmlFor="hint"
          className="mb-2 block text-sm font-bold uppercase tracking-wide text-[color:var(--color-muted)]"
        >
          方向提示（可选）
        </label>
        <input
          id="hint"
          type="text"
          value={hint}
          onChange={(e) => setHint(e.target.value)}
          placeholder="例如：宠物 / 银发族 / 音频 / 夜猫子 / 反精致 ..."
          className="w-full rounded-lg border-2 border-[color:var(--color-ink)] bg-transparent px-4 py-3 text-base outline-none focus:bg-white"
          maxLength={40}
        />
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleGenerate}
            disabled={state.status === "loading"}
            className="sb-btn disabled:cursor-not-allowed disabled:opacity-60"
          >
            {state.status === "loading" ? "AI 正在发癫…" : "🎲 给我来一个 SB 点子"}
          </button>
          {state.status === "success" && (
            <button
              type="button"
              onClick={handleGenerate}
              className="sb-btn sb-btn-ghost"
            >
              🔁 再来一个
            </button>
          )}
        </div>
      </div>

      {state.status === "error" && (
        <div className="sb-card border-[color:var(--color-accent)] p-6 text-[color:var(--color-accent)]">
          ⚠️ {state.message}
        </div>
      )}

      {state.status === "loading" && <SkeletonCard />}

      {state.status === "success" && <IdeaCard idea={state.idea} />}
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="sb-card slide-up space-y-4 p-6">
      <div className="h-6 w-40 animate-pulse rounded bg-[color:var(--color-line)]" />
      <div className="h-10 w-80 animate-pulse rounded bg-[color:var(--color-line)]" />
      <div className="h-4 w-full animate-pulse rounded bg-[color:var(--color-line)]" />
      <div className="h-4 w-5/6 animate-pulse rounded bg-[color:var(--color-line)]" />
      <div className="h-4 w-2/3 animate-pulse rounded bg-[color:var(--color-line)]" />
    </div>
  );
}

function IdeaCard({ idea }: { idea: GeneratedIdea }) {
  async function handleShare() {
    const text = [
      `【SB 想法生成器】`,
      `${idea.name} — ${idea.oneLiner}`,
      ``,
      `😒 为啥听起来 SB：${idea.whySB}`,
      ``,
      `🚀 为啥其实能成：${idea.whyWorks}`,
      ``,
      `SB 指数 ${idea.sbScore}/10 · 独角兽指数 ${idea.unicornScore}/10`,
      ``,
      `来自 https://sbidea.ai/generator`,
    ].join("\n");

    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title: idea.name, text });
        return;
      } catch {
        /* fall back to copy */
      }
    }
    try {
      await navigator.clipboard.writeText(text);
      alert("已复制到剪贴板，去炫耀一下吧");
    } catch {
      alert("复制失败，请手动选择文本");
    }
  }

  return (
    <article className="sb-card slide-up p-6 md:p-8">
      <div className="mb-3 flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-wide text-[color:var(--color-muted)]">
        <span>{idea.category}</span>
        <span>·</span>
        <span>目标用户：{idea.targetUser}</span>
      </div>

      <h2 className="text-3xl font-black md:text-4xl">{idea.name}</h2>
      <p className="mt-2 text-lg text-[color:var(--color-muted)]">
        {idea.oneLiner}
      </p>

      <div className="mt-6 flex flex-wrap gap-3">
        <Metric label="SB 指数" value={idea.sbScore} accent />
        <Metric label="独角兽指数" value={idea.unicornScore} />
      </div>

      <section className="mt-6 grid gap-6 md:grid-cols-2">
        <div>
          <div className="mb-1 text-xs font-bold uppercase tracking-wide text-[color:var(--color-accent)]">
            😒 为啥听起来 SB
          </div>
          <p className="text-[0.97rem] leading-relaxed">{idea.whySB}</p>
        </div>
        <div>
          <div className="mb-1 text-xs font-bold uppercase tracking-wide">
            🚀 为啥其实能成
          </div>
          <p className="text-[0.97rem] leading-relaxed">{idea.whyWorks}</p>
        </div>
      </section>

      <section className="mt-6 grid gap-4 border-t-2 border-[color:var(--color-line)] pt-6 md:grid-cols-3">
        <Info label="护城河" value={idea.moat} />
        <Info label="第一个 MVP" value={idea.firstMvp} />
        <Info label="市场规模感觉" value={idea.marketSizeGuess} />
      </section>

      <div className="mt-8 flex flex-wrap gap-3">
        <button type="button" onClick={handleShare} className="sb-btn">
          📋 复制 / 分享
        </button>
      </div>
    </article>
  );
}

function Metric({
  label,
  value,
  accent = false,
}: {
  label: string;
  value: number;
  accent?: boolean;
}) {
  return (
    <div
      className={`flex items-center gap-2 rounded-full border-2 px-4 py-1.5 text-sm font-bold ${
        accent
          ? "border-[color:var(--color-accent)] bg-[color:var(--color-accent)] text-[color:var(--color-paper)]"
          : "border-[color:var(--color-ink)]"
      }`}
    >
      <span>{label}</span>
      <span className="font-black">{value}/10</span>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="mb-1 text-xs font-bold uppercase tracking-wide text-[color:var(--color-muted)]">
        {label}
      </div>
      <p className="text-sm leading-relaxed">{value}</p>
    </div>
  );
}
