"use client";

import { useMemo, useState } from "react";
import {
  QUESTIONS,
  TYPES,
  codeOf,
  emptyScores,
  type AxisLetter,
} from "@/lib/sbti";

type Answer = "a" | "b";
type State =
  | { status: "quiz"; step: number; answers: Record<string, Answer> }
  | { status: "result"; code: string };

export function SbtiClient() {
  const [state, setState] = useState<State>({
    status: "quiz",
    step: 0,
    answers: {},
  });

  const total = QUESTIONS.length;

  function handleAnswer(a: Answer) {
    if (state.status !== "quiz") return;
    const q = QUESTIONS[state.step];
    const nextAnswers = { ...state.answers, [q.id]: a };

    if (state.step < total - 1) {
      setState({
        status: "quiz",
        step: state.step + 1,
        answers: nextAnswers,
      });
      return;
    }

    // finalize
    const scores = emptyScores();
    for (const question of QUESTIONS) {
      const picked = nextAnswers[question.id];
      if (!picked) continue;
      const [first, second] = question.axis.split("") as [
        AxisLetter,
        AxisLetter,
      ];
      scores[picked === "a" ? first : second] += 1;
    }
    const code = codeOf(scores);
    setState({ status: "result", code });
  }

  function handleBack() {
    if (state.status !== "quiz" || state.step === 0) return;
    setState({
      status: "quiz",
      step: state.step - 1,
      answers: state.answers,
    });
  }

  function handleRestart() {
    setState({ status: "quiz", step: 0, answers: {} });
  }

  if (state.status === "quiz") {
    const q = QUESTIONS[state.step];
    const progress = Math.round(((state.step + 1) / total) * 100);
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="h-2 flex-1 overflow-hidden rounded-full border-2 border-[color:var(--color-ink)]">
            <div
              className="h-full bg-[color:var(--color-accent)] transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="text-sm font-bold text-[color:var(--color-muted)]">
            {state.step + 1} / {total}
          </div>
        </div>

        <div className="sb-card slide-up p-6 md:p-8">
          <div className="text-xs font-bold uppercase tracking-wide text-[color:var(--color-muted)]">
            题目 {state.step + 1}
          </div>
          <h2 className="mt-2 text-2xl font-black leading-tight md:text-3xl">
            {q.prompt}
          </h2>

          <div className="mt-6 space-y-3">
            <button
              type="button"
              onClick={() => handleAnswer("a")}
              className="w-full rounded-xl border-2 border-[color:var(--color-ink)] bg-transparent p-4 text-left text-base font-semibold transition-transform hover:-translate-y-0.5 hover:bg-[color:var(--color-ink)] hover:text-[color:var(--color-paper)]"
            >
              <span className="mr-2 font-black">A.</span>
              {q.a}
            </button>
            <button
              type="button"
              onClick={() => handleAnswer("b")}
              className="w-full rounded-xl border-2 border-[color:var(--color-ink)] bg-transparent p-4 text-left text-base font-semibold transition-transform hover:-translate-y-0.5 hover:bg-[color:var(--color-ink)] hover:text-[color:var(--color-paper)]"
            >
              <span className="mr-2 font-black">B.</span>
              {q.b}
            </button>
          </div>

          {state.step > 0 && (
            <button
              type="button"
              onClick={handleBack}
              className="mt-5 text-sm font-bold text-[color:var(--color-muted)] underline"
            >
              ← 返回上一题
            </button>
          )}
        </div>
      </div>
    );
  }

  return <SbtiResult code={state.code} onRestart={handleRestart} />;
}

function SbtiResult({
  code,
  onRestart,
}: {
  code: string;
  onRestart: () => void;
}) {
  const type = TYPES[code];

  const shareText = useMemo(() => {
    if (!type) return "";
    return [
      `【SBTI · SB 创业人格测试】`,
      `我是 ${type.code} · ${type.name} ${type.emoji}`,
      type.tagline,
      ``,
      `适合：${type.suitableIdeas}`,
      ``,
      `你是哪一型？来测测 → https://sbidea.ai/sbti`,
    ].join("\n");
  }, [type]);

  async function handleShare() {
    try {
      if (typeof navigator !== "undefined" && navigator.share) {
        await navigator.share({
          title: `我的 SBTI 是 ${type?.name}`,
          text: shareText,
        });
        return;
      }
      await navigator.clipboard.writeText(shareText);
      alert("已复制到剪贴板，去炫耀一下吧");
    } catch {
      /* ignore */
    }
  }

  if (!type) {
    return (
      <div className="sb-card p-6 text-center">
        <p>结果出错了，请重新测试。</p>
        <button type="button" onClick={onRestart} className="sb-btn mt-4">
          重新测试
        </button>
      </div>
    );
  }

  return (
    <article className="sb-card slide-up p-6 md:p-10">
      <div className="mb-2 text-sm font-bold uppercase tracking-[0.3em] text-[color:var(--color-muted)]">
        你的 SBTI 类型
      </div>
      <div className="flex items-baseline gap-3">
        <span className="text-5xl md:text-6xl">{type.emoji}</span>
        <h2 className="text-4xl font-black md:text-5xl">{type.name}</h2>
      </div>
      <div className="mt-2 inline-block rounded-full border-2 border-[color:var(--color-ink)] bg-[color:var(--color-ink)] px-3 py-1 text-sm font-black tracking-[0.25em] text-[color:var(--color-paper)]">
        {type.code}
      </div>
      <p className="mt-3 text-lg text-[color:var(--color-muted)]">
        {type.tagline}
      </p>

      <section className="mt-8">
        <h3 className="mb-2 text-sm font-bold uppercase tracking-wide text-[color:var(--color-muted)]">
          典型日常
        </h3>
        <ul className="space-y-1.5">
          {type.traits.map((t) => (
            <li key={t} className="flex gap-2">
              <span>·</span>
              <span>{t}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-6 grid gap-6 md:grid-cols-2">
        <div>
          <h3 className="mb-2 text-sm font-bold uppercase tracking-wide text-[color:var(--color-muted)]">
            优势
          </h3>
          <ul className="space-y-1.5">
            {type.strengths.map((t) => (
              <li key={t} className="flex gap-2">
                <span className="text-[color:var(--color-accent)]">✓</span>
                <span>{t}</span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="mb-2 text-sm font-bold uppercase tracking-wide text-[color:var(--color-muted)]">
            要小心
          </h3>
          <ul className="space-y-1.5">
            {type.watchOut.map((t) => (
              <li key={t} className="flex gap-2">
                <span className="text-[color:var(--color-accent)]">⚠</span>
                <span>{t}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mt-6 grid gap-4 border-t-2 border-[color:var(--color-line)] pt-6">
        <Info label="适合的 SB 点子" value={type.suitableIdeas} />
        <Info label="要远离" value={type.avoid} />
        <Info label="类似风格的创始人" value={type.famousKind} />
      </section>

      <div className="mt-8 flex flex-wrap gap-3">
        <button type="button" onClick={handleShare} className="sb-btn">
          📋 分享我的类型
        </button>
        <button
          type="button"
          onClick={onRestart}
          className="sb-btn sb-btn-ghost"
        >
          🔁 重新测一次
        </button>
      </div>
    </article>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs font-bold uppercase tracking-wide text-[color:var(--color-muted)]">
        {label}
      </div>
      <p className="mt-1">{value}</p>
    </div>
  );
}
