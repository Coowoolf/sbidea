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
          {/* Overall — its own bordered sub-card */}
          <section>
            <div className="text-xs font-bold uppercase tracking-[0.25em] text-[color:var(--color-muted)]">
              整体解读
            </div>
            <p className="mt-3 whitespace-pre-wrap break-words text-base leading-relaxed md:text-lg">
              {state.reading.overall || "（这次占卜没有拿到整体解读，点『再抽一次』试试）"}
            </p>
          </section>

          {/* Divider */}
          <hr className="my-8 border-0 border-t-2 border-[color:var(--color-line)]" />

          {/* Three-position breakdown — each position in its own sub-card */}
          <section>
            <div className="mb-4 text-xs font-bold uppercase tracking-[0.25em] text-[color:var(--color-muted)]">
              三张牌的具体解读
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <PositionReading
                position="现状"
                emoji={state.cards.past.emoji}
                cardName={state.cards.past.name}
                text={state.reading.past}
              />
              <PositionReading
                position="挑战"
                emoji={state.cards.challenge.emoji}
                cardName={state.cards.challenge.name}
                text={state.reading.challenge}
              />
              <PositionReading
                position="结果"
                emoji={state.cards.outcome.emoji}
                cardName={state.cards.outcome.name}
                text={state.reading.outcome}
              />
            </div>
          </section>

          {/* Action tip */}
          <div className="mt-8 rounded-xl border-2 border-[color:var(--color-accent)] bg-[color:var(--color-accent)] p-5 text-[color:var(--color-paper)]">
            <div className="text-xs font-bold uppercase tracking-[0.25em] opacity-90">
              今晚就开始做这一件事
            </div>
            <p className="mt-2 whitespace-pre-wrap break-words text-lg font-bold leading-snug">
              {state.reading.actionTip || "今晚就把这次抽到的三张牌写在纸上，贴在显示器旁边"}
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

function PositionReading({
  position,
  emoji,
  cardName,
  text,
}: {
  position: string;
  emoji: string;
  cardName: string;
  text: string;
}) {
  const safeText =
    text && text.trim().length >= 10
      ? text
      : "（这张牌这次没拿到针对性解读，可以点『再抽一次』重试）";

  return (
    <div className="flex min-w-0 flex-col rounded-xl border-2 border-[color:var(--color-line)] bg-[color:var(--color-paper)] p-5">
      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-[color:var(--color-muted)]">
        <span className="text-xl">{emoji}</span>
        <span>{position}</span>
      </div>
      <div className="mt-2 text-base font-black leading-tight">{cardName}</div>
      <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-relaxed">
        {safeText}
      </p>
    </div>
  );
}
