"use client";

import { useEffect, useRef, useState } from "react";
import { useAdventure } from "@/components/adventure-provider";
import { AdventureBar } from "@/components/adventure-bar";
import { AdventureCTA } from "@/components/adventure-cta";

type RoastState =
  | { status: "idle" }
  | { status: "streaming"; text: string }
  | { status: "done"; text: string }
  | { status: "error"; message: string };

const EXAMPLES = [
  "一个 App，让你给路边野猫发红包，系统会自动找志愿者喂猫并拍照反馈。",
  "线下开一家『静音餐厅』，所有人只能打手语点菜，不许说话，气氛全靠眼神。",
  "一个订阅制服务，每天早上给你发一个『今日最废物行为指南』，鼓励你躺平。",
  "做一个 AI 工具，帮你把老板发来的消息自动翻译成阴阳怪气版或真诚版。",
];

export function RoastClient() {
  const [idea, setIdea] = useState("");
  const [state, setState] = useState<RoastState>({ status: "idle" });
  const abortRef = useRef<AbortController | null>(null);
  const { recordStop } = useAdventure();
  const stoppedRef = useRef(false);

  useEffect(() => {
    if (state.status === "done" && !stoppedRef.current) {
      stoppedRef.current = true;
      recordStop("roast", "鉴定完成", { textLength: state.text.length });
    }
    if (state.status !== "done") {
      stoppedRef.current = false;
    }
  }, [state, recordStop]);

  async function handleSubmit() {
    const cleaned = idea.trim();
    if (!cleaned) return;

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setState({ status: "streaming", text: "" });

    try {
      const res = await fetch("/api/roast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idea: cleaned }),
        signal: controller.signal,
      });

      if (!res.ok) {
        const errText = await res.text();
        setState({ status: "error", message: errText || "鉴定师翻车了" });
        return;
      }

      const reader = res.body?.getReader();
      if (!reader) {
        setState({ status: "error", message: "浏览器不支持流式响应" });
        return;
      }
      const decoder = new TextDecoder();
      let acc = "";
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        setState({ status: "streaming", text: acc });
      }
      acc += decoder.decode();
      setState({ status: "done", text: acc });
    } catch (err) {
      if ((err as { name?: string } | null)?.name === "AbortError") return;
      setState({
        status: "error",
        message: err instanceof Error ? err.message : "鉴定师喝多了",
      });
    }
  }

  function handleExample(text: string) {
    setIdea(text);
    setState({ status: "idle" });
  }

  async function handleShare() {
    if (state.status !== "done") return;
    const text = [
      `【SB 想法鉴定所】`,
      `我的点子：${idea}`,
      ``,
      state.text,
      ``,
      `来自 https://sbidea.ai/roast`,
    ].join("\n");
    try {
      if (typeof navigator !== "undefined" && navigator.share) {
        await navigator.share({ title: "SB 想法鉴定所", text });
        return;
      }
      await navigator.clipboard.writeText(text);
      alert("已复制到剪贴板");
    } catch {
      /* ignore */
    }
  }

  const streamingText =
    state.status === "streaming" || state.status === "done" ? state.text : "";

  return (
    <div className="space-y-6">
      <AdventureBar />
      <div className="sb-card p-6">
        <label
          htmlFor="idea"
          className="mb-2 block text-sm font-bold uppercase tracking-wide text-[color:var(--color-muted)]"
        >
          你的创业点子（中文或英文，600 字以内）
        </label>
        <textarea
          id="idea"
          value={idea}
          onChange={(e) => setIdea(e.target.value)}
          placeholder="例如：我想做一个 App，让你……"
          rows={6}
          maxLength={600}
          className="w-full resize-none rounded-lg border-2 border-[color:var(--color-ink)] bg-transparent px-4 py-3 text-base outline-none focus:bg-white"
        />
        <div className="mt-1 text-right text-xs text-[color:var(--color-muted)]">
          {idea.length} / 600
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {EXAMPLES.map((ex) => (
            <button
              key={ex}
              type="button"
              onClick={() => handleExample(ex)}
              className="rounded-full border-2 border-[color:var(--color-ink)] bg-transparent px-3 py-1 text-xs font-bold hover:bg-[color:var(--color-ink)] hover:text-[color:var(--color-paper)]"
            >
              随机示例
            </button>
          ))}
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={state.status === "streaming" || !idea.trim()}
            className="sb-btn disabled:cursor-not-allowed disabled:opacity-60"
          >
            {state.status === "streaming"
              ? "鉴定师正在开麦…"
              : "🔥 鉴定我的点子"}
          </button>
          {state.status === "done" && (
            <>
              <button
                type="button"
                onClick={handleSubmit}
                className="sb-btn sb-btn-ghost"
              >
                🔁 再来一次
              </button>
              <button
                type="button"
                onClick={handleShare}
                className="sb-btn sb-btn-ghost"
              >
                📋 复制 / 分享
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

      {(state.status === "streaming" || state.status === "done") && (
        <article className="sb-card slide-up p-6 md:p-8">
          <div className="mb-4 flex items-center justify-between">
            <div className="text-xs font-bold uppercase tracking-wide text-[color:var(--color-muted)]">
              🎤 SB 鉴定师实时开麦
            </div>
            {state.status === "streaming" && (
              <div className="flex items-center gap-1 text-xs font-bold text-[color:var(--color-accent)]">
                <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-[color:var(--color-accent)]" />
                LIVE
              </div>
            )}
          </div>
          <RoastMarkdown text={streamingText} />
          {state.status === "streaming" && (
            <span className="ml-0.5 inline-block h-5 w-1.5 animate-pulse bg-[color:var(--color-ink)] align-middle" />
          )}
        </article>
      )}

      {state.status === "done" && <AdventureCTA product="roast" />}
    </div>
  );
}

/**
 * Minimal markdown renderer — only what our prompt outputs:
 * - "## Heading" → styled h3
 * - blank lines → paragraph breaks
 * No external dep to keep bundle tiny.
 */
function RoastMarkdown({ text }: { text: string }) {
  if (!text) {
    return (
      <div className="text-[color:var(--color-muted)]">正在连接鉴定师…</div>
    );
  }
  const blocks = text.split(/\n\s*\n/);
  return (
    <div className="space-y-4 leading-relaxed">
      {blocks.map((block, i) => {
        const trimmed = block.trim();
        if (!trimmed) return null;
        if (trimmed.startsWith("## ")) {
          return (
            <h3
              key={i}
              className="text-xl font-black tracking-tight md:text-2xl"
            >
              {trimmed.replace(/^##\s+/, "")}
            </h3>
          );
        }
        if (trimmed.startsWith("# ")) {
          return (
            <h2 key={i} className="text-2xl font-black">
              {trimmed.replace(/^#\s+/, "")}
            </h2>
          );
        }
        return (
          <p key={i} className="text-[0.97rem]">
            {trimmed}
          </p>
        );
      })}
    </div>
  );
}
