"use client";

import { useState } from "react";
import { drawThree, type TarotCard } from "@/lib/tarot";
import type { TarotReading } from "../api/tarot/route";

type DrawnCards = {
  past: TarotCard;
  challenge: TarotCard;
  outcome: TarotCard;
};

type State =
  | { status: "idle" }
  | { status: "loading"; cards: DrawnCards }
  | { status: "error"; message: string; cards: DrawnCards }
  | { status: "success"; cards: DrawnCards; reading: TarotReading };

export function TarotClient() {
  const [question, setQuestion] = useState("");
  const [state, setState] = useState<State>({ status: "idle" });

  async function handleDraw() {
    const cleaned = question.trim();
    if (!cleaned) return;

    const [past, challenge, outcome] = drawThree();
    const cards: DrawnCards = { past, challenge, outcome };
    setState({ status: "loading", cards });

    try {
      const res = await fetch("/api/tarot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: cleaned,
          cards: [
            { position: "past", ...past },
            { position: "challenge", ...challenge },
            { position: "outcome", ...outcome },
          ],
        }),
      });
      const data = (await res.json()) as
        | { ok: true; reading: TarotReading }
        | { ok: false; error: string };
      if (!data.ok) {
        setState({ status: "error", message: data.error, cards });
        return;
      }
      setState({ status: "success", cards, reading: data.reading });
    } catch (err) {
      setState({
        status: "error",
        message: err instanceof Error ? err.message : "网络异常",
        cards,
      });
    }
  }

  async function handleShare() {
    if (state.status !== "success") return;
    const text = [
      `【SB 创业塔罗】`,
      `问题：${question}`,
      ``,
      `现状：${state.cards.past.name} ${state.cards.past.emoji}`,
      `挑战：${state.cards.challenge.name} ${state.cards.challenge.emoji}`,
      `结果：${state.cards.outcome.name} ${state.cards.outcome.emoji}`,
      ``,
      state.reading.overall,
      ``,
      `行动建议：${state.reading.actionTip}`,
      ``,
      `来自 https://sbidea.ai/tarot`,
    ].join("\n");
    try {
      if (typeof navigator !== "undefined" && navigator.share) {
        await navigator.share({ title: "SB 创业塔罗", text });
        return;
      }
      await navigator.clipboard.writeText(text);
      alert("已复制到剪贴板");
    } catch {
      /* ignore */
    }
  }

  const drawnCards =
    state.status === "loading" ||
    state.status === "error" ||
    state.status === "success"
      ? state.cards
      : null;

  return (
    <div className="space-y-6">
      <div className="sb-card p-6">
        <label
          htmlFor="question"
          className="mb-2 block text-sm font-bold uppercase tracking-wide text-[color:var(--color-muted)]"
        >
          你想问塔罗什么？（300 字以内）
        </label>
        <textarea
          id="question"
          rows={4}
          maxLength={300}
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="例如：我现在是应该离职全职创业，还是再兼职做一年？"
          className="w-full resize-none rounded-lg border-2 border-[color:var(--color-ink)] bg-transparent px-4 py-3 text-base outline-none focus:bg-white"
        />
        <div className="mt-1 text-right text-xs text-[color:var(--color-muted)]">
          {question.length} / 300
        </div>
        <div className="mt-4 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handleDraw}
            disabled={state.status === "loading" || !question.trim()}
            className="sb-btn disabled:cursor-not-allowed disabled:opacity-60"
          >
            {state.status === "loading" ? "塔罗师正在洗牌…" : "🔮 抽 3 张牌"}
          </button>
          {state.status === "success" && (
            <>
              <button
                type="button"
                onClick={handleDraw}
                className="sb-btn sb-btn-ghost"
              >
                🔁 再抽一次
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

      {drawnCards && (
        <div className="grid gap-4 md:grid-cols-3">
          <CardView position="现状" card={drawnCards.past} />
          <CardView position="挑战" card={drawnCards.challenge} />
          <CardView position="结果" card={drawnCards.outcome} />
        </div>
      )}

      {state.status === "error" && (
        <div className="sb-card border-[color:var(--color-accent)] p-6 text-[color:var(--color-accent)]">
          ⚠️ {state.message}
        </div>
      )}

      {state.status === "success" && (
        <article className="sb-card slide-up p-6 md:p-8">
          <h3 className="mb-3 text-xl font-black">整体解读</h3>
          <p className="leading-relaxed">{state.reading.overall}</p>

          <div className="mt-6 grid gap-5 md:grid-cols-3">
            <Reading title="现状" text={state.reading.past} />
            <Reading title="挑战" text={state.reading.challenge} />
            <Reading title="结果" text={state.reading.outcome} />
          </div>

          <div className="mt-6 rounded-xl border-2 border-[color:var(--color-accent)] bg-[color:var(--color-accent)] p-5 text-[color:var(--color-paper)]">
            <div className="text-xs font-bold uppercase tracking-wide opacity-90">
              今晚就开始做这一件事
            </div>
            <p className="mt-1 text-lg font-bold">
              {state.reading.actionTip}
            </p>
          </div>
        </article>
      )}
    </div>
  );
}

function CardView({ position, card }: { position: string; card: TarotCard }) {
  return (
    <div className="sb-card slide-up p-5">
      <div className="text-xs font-bold uppercase tracking-wide text-[color:var(--color-muted)]">
        {position}
      </div>
      <div className="mt-2 text-5xl">{card.emoji}</div>
      <div className="mt-2 text-lg font-black">{card.name}</div>
      <div className="mt-1 text-xs text-[color:var(--color-muted)]">
        {card.keywords.join(" · ")}
      </div>
      <p className="mt-3 text-sm leading-relaxed">{card.meaning}</p>
    </div>
  );
}

function Reading({ title, text }: { title: string; text: string }) {
  return (
    <div>
      <div className="mb-1 text-xs font-bold uppercase tracking-wide text-[color:var(--color-muted)]">
        {title}
      </div>
      <p className="leading-relaxed">{text}</p>
    </div>
  );
}
