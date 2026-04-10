"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  QUESTIONS,
  TYPES,
  MBTI_TYPES,
  MBTI_UNKNOWN,
  codeOf,
  emptyScores,
  personalityNumber,
  type AxisLetter,
  type SbtiType,
} from "@/lib/sbti";
import type { SbtiProfile } from "../api/sbti-profile/route";

/* -------------------------------------------------------------------------- */
/* State machine                                                               */
/* -------------------------------------------------------------------------- */

type Answer = "a" | "b";

type QuizState = {
  phase: "quiz";
  step: number;
  answers: Record<string, Answer>;
};

type MbtiState = {
  phase: "mbti";
  sbtiCode: string;
  sbtiType: SbtiType;
};

type LoadingState = {
  phase: "loading";
  sbtiCode: string;
  sbtiType: SbtiType;
  mbtiType: string;
};

type ResultState = {
  phase: "result";
  sbtiCode: string;
  sbtiType: SbtiType;
  mbtiType: string;
  profile: SbtiProfile;
};

type ErrorState = {
  phase: "error";
  sbtiCode: string;
  sbtiType: SbtiType;
  mbtiType: string;
  message: string;
};

type State = QuizState | MbtiState | LoadingState | ResultState | ErrorState;

/* -------------------------------------------------------------------------- */
/* Main component                                                              */
/* -------------------------------------------------------------------------- */

export function SbtiClient() {
  const [state, setState] = useState<State>({
    phase: "quiz",
    step: 0,
    answers: {},
  });

  const total = QUESTIONS.length;

  /* --- Quiz Phase --- */

  function handleAnswer(a: Answer) {
    if (state.phase !== "quiz") return;
    const q = QUESTIONS[state.step];
    const nextAnswers = { ...state.answers, [q.id]: a };

    if (state.step < total - 1) {
      setState({ phase: "quiz", step: state.step + 1, answers: nextAnswers });
      return;
    }

    // Finalize SBTI scores
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
    const sbtiType = TYPES[code];
    setState({ phase: "mbti", sbtiCode: code, sbtiType });
  }

  function handleBack() {
    if (state.phase !== "quiz" || state.step === 0) return;
    setState({ phase: "quiz", step: state.step - 1, answers: state.answers });
  }

  /* --- MBTI Phase --- */

  async function handleMbtiSelect(mbtiCode: string) {
    if (state.phase !== "mbti") return;
    const { sbtiCode, sbtiType } = state;
    setState({ phase: "loading", sbtiCode, sbtiType, mbtiType: mbtiCode });

    try {
      const res = await fetch("/api/sbti-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sbtiCode, mbtiType: mbtiCode }),
      });
      const data = (await res.json()) as
        | { ok: true; profile: SbtiProfile }
        | { ok: false; error: string };

      if (!data.ok) {
        setState({
          phase: "error",
          sbtiCode,
          sbtiType,
          mbtiType: mbtiCode,
          message: data.error,
        });
        return;
      }
      setState({
        phase: "result",
        sbtiCode,
        sbtiType,
        mbtiType: mbtiCode,
        profile: data.profile,
      });
    } catch (err) {
      setState({
        phase: "error",
        sbtiCode,
        sbtiType,
        mbtiType: mbtiCode,
        message: err instanceof Error ? err.message : "网络异常",
      });
    }
  }

  /* --- Restart --- */

  function handleRestart() {
    setState({ phase: "quiz", step: 0, answers: {} });
  }

  /* --- Render by phase --- */

  if (state.phase === "quiz") {
    const q = QUESTIONS[state.step];
    const progress = Math.round(((state.step + 1) / total) * 100);
    return (
      <div className="space-y-6">
        {/* Progress */}
        <div className="flex items-center gap-3">
          <div className="text-xs font-bold uppercase tracking-[0.2em] text-[color:var(--color-muted)]">
            创业人格测试
          </div>
          <div className="h-2 flex-1 overflow-hidden rounded-full border-2 border-[color:var(--color-ink)]">
            <div
              className="h-full bg-[color:var(--color-accent)] transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="text-sm font-bold text-[color:var(--color-muted)]">
            {state.step + 1}/{total}
          </div>
        </div>

        {/* Question card */}
        <div className="sb-card slide-up p-6 md:p-8">
          <div className="text-xs font-bold uppercase tracking-wide text-[color:var(--color-muted)]">
            题目 {state.step + 1}
          </div>
          <h2 className="mt-2 text-2xl font-black leading-tight md:text-3xl">
            {q.prompt}
          </h2>
          <div className="mt-6 space-y-3">
            <ChoiceButton label="A" text={q.a} onClick={() => handleAnswer("a")} />
            <ChoiceButton label="B" text={q.b} onClick={() => handleAnswer("b")} />
          </div>
          {state.step > 0 && (
            <button
              type="button"
              onClick={handleBack}
              className="mt-5 text-sm font-bold text-[color:var(--color-muted)] underline"
            >
              ← 上一题
            </button>
          )}
        </div>
      </div>
    );
  }

  if (state.phase === "mbti") {
    return (
      <div className="space-y-6">
        <div className="sb-card slide-up p-6 md:p-8">
          <div className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-[color:var(--color-muted)]">
            你的创业人格: {state.sbtiCode} · {state.sbtiType.name} {state.sbtiType.emoji}
          </div>
          <h2 className="text-2xl font-black md:text-3xl">
            最后一步：你的 MBTI 是？
          </h2>
          <p className="mt-2 text-[color:var(--color-muted)]">
            选择你的 MBTI 类型，AI 会把它和你的创业人格融合，生成一份独一无二的深度画像。
          </p>

          <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
            {MBTI_TYPES.map((m) => (
              <button
                key={m.code}
                type="button"
                onClick={() => handleMbtiSelect(m.code)}
                className="flex flex-col items-center gap-1 rounded-xl border-2 border-[color:var(--color-ink)] bg-transparent p-3 text-center transition-transform hover:-translate-y-0.5 hover:bg-[color:var(--color-ink)] hover:text-[color:var(--color-paper)]"
              >
                <span className="text-2xl">{m.emoji}</span>
                <span className="text-sm font-black">{m.code}</span>
                <span className="text-[10px] text-[color:var(--color-muted)]">
                  {m.name}
                </span>
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => handleMbtiSelect(MBTI_UNKNOWN)}
            className="mt-4 w-full rounded-xl border-2 border-dashed border-[color:var(--color-muted)] p-3 text-sm font-bold text-[color:var(--color-muted)] hover:border-[color:var(--color-ink)] hover:text-[color:var(--color-ink)]"
          >
            🤷 不确定 / 没测过 MBTI（AI 会帮你推测）
          </button>
        </div>
      </div>
    );
  }

  if (state.phase === "loading") {
    return (
      <div className="sb-card slide-up flex min-h-[400px] flex-col items-center justify-center gap-6 p-8 text-center">
        <div className="text-6xl">{state.sbtiType.emoji}</div>
        <div>
          <div className="text-sm font-bold uppercase tracking-[0.3em] text-[color:var(--color-muted)]">
            AI 正在融合你的双重人格
          </div>
          <div className="mt-2 text-lg font-black">
            {state.sbtiCode} × {state.mbtiType === MBTI_UNKNOWN ? "???" : state.mbtiType}
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm text-[color:var(--color-muted)]">
          <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-[color:var(--color-accent)]" />
          正在生成你的创业人格画像…
        </div>
      </div>
    );
  }

  if (state.phase === "error") {
    return (
      <div className="space-y-4">
        <div className="sb-card border-[color:var(--color-accent)] p-6 text-[color:var(--color-accent)]">
          ⚠️ {state.message}
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() =>
              handleMbtiSelect(state.mbtiType)
            }
            className="sb-btn"
          >
            🔁 重试
          </button>
          <button type="button" onClick={handleRestart} className="sb-btn sb-btn-ghost">
            重新测试
          </button>
        </div>
      </div>
    );
  }

  // phase === "result"
  return (
    <ProfileResult
      sbtiCode={state.sbtiCode}
      sbtiType={state.sbtiType}
      mbtiType={state.mbtiType}
      profile={state.profile}
      onRestart={handleRestart}
    />
  );
}

/* -------------------------------------------------------------------------- */
/* Sub-components                                                              */
/* -------------------------------------------------------------------------- */

function ChoiceButton({
  label,
  text,
  onClick,
}: {
  label: string;
  text: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full rounded-xl border-2 border-[color:var(--color-ink)] bg-transparent p-4 text-left text-base font-semibold transition-transform hover:-translate-y-0.5 hover:bg-[color:var(--color-ink)] hover:text-[color:var(--color-paper)]"
    >
      <span className="mr-2 font-black">{label}.</span>
      {text}
    </button>
  );
}

/* -------------------------------------------------------------------------- */
/* Result display                                                              */
/* -------------------------------------------------------------------------- */

function ProfileResult({
  sbtiCode,
  sbtiType,
  mbtiType,
  profile,
  onRestart,
}: {
  sbtiCode: string;
  sbtiType: SbtiType;
  mbtiType: string;
  profile: SbtiProfile;
  onRestart: () => void;
}) {
  const pNumber = personalityNumber(sbtiCode, mbtiType);
  const bg = `linear-gradient(135deg, ${profile.gradientFrom || "#667eea"}, ${profile.gradientTo || "#764ba2"})`;

  const shareText = useMemo(() => {
    const mbtiLabel =
      mbtiType === MBTI_UNKNOWN ? "" : ` × ${mbtiType}`;
    return [
      `【SBTI · 创业人格测试】`,
      `我是创业人格 #${pNumber}`,
      `${profile.emoji} ${profile.name}`,
      `${sbtiCode}${mbtiLabel}`,
      ``,
      profile.tagline,
      ``,
      `优势：${profile.strengths.join(" / ")}`,
      ``,
      `最适合的 SB 点子：${profile.sbIdeas.map((i) => i.name).join("、")}`,
      ``,
      `来测测你是哪一号 → https://sbti.sbidea.ai`,
    ].join("\n");
  }, [sbtiCode, mbtiType, pNumber, profile]);

  async function handleShare() {
    try {
      if (typeof navigator !== "undefined" && navigator.share) {
        await navigator.share({
          title: `我是创业人格 #${pNumber} · ${profile.name}`,
          text: shareText,
        });
        return;
      }
      await navigator.clipboard.writeText(shareText);
      alert("已复制到剪贴板，去分享一下吧");
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="space-y-6">
      {/* Hero card */}
      <div
        className="sb-card slide-up relative overflow-hidden p-8 text-white md:p-10"
        style={{ background: bg }}
      >
        <div className="absolute right-4 top-4 rounded-full bg-white/20 px-3 py-1 text-xs font-black backdrop-blur">
          创业人格 #{pNumber}
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.3em] opacity-80">
            <span>SBTI {sbtiCode}</span>
            {mbtiType !== MBTI_UNKNOWN && (
              <>
                <span>×</span>
                <span>MBTI {mbtiType}</span>
              </>
            )}
          </div>
          <div className="mt-4 flex items-baseline gap-3">
            <span className="text-5xl md:text-6xl">{profile.emoji}</span>
            <h2 className="text-4xl font-black drop-shadow-md md:text-5xl">
              {profile.name}
            </h2>
          </div>
          <p className="mt-3 text-lg font-semibold opacity-95">
            {profile.tagline}
          </p>
        </div>
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 mix-blend-overlay opacity-20"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 20%, rgba(255,255,255,0.4), transparent 50%)",
          }}
        />
      </div>

      {/* Overview */}
      <article className="sb-card p-6 md:p-8">
        <SectionHeader>深度画像</SectionHeader>
        <p className="mt-3 whitespace-pre-wrap break-words text-base leading-relaxed md:text-lg">
          {profile.overview}
        </p>
      </article>

      {/* Strengths & Blindspots */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="sb-card p-6">
          <SectionHeader>核心优势</SectionHeader>
          <ul className="mt-3 space-y-2">
            {profile.strengths.map((s) => (
              <li key={s} className="flex gap-2">
                <span className="text-[color:var(--color-accent)]">✦</span>
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="sb-card p-6">
          <SectionHeader>盲区 / 暗面</SectionHeader>
          <ul className="mt-3 space-y-2">
            {profile.blindspots.map((b) => (
              <li key={b} className="flex gap-2">
                <span className="text-[color:var(--color-muted)]">⚠</span>
                <span>{b}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Ideal Co-founder */}
      <div className="sb-card p-6 md:p-8">
        <SectionHeader>最佳合伙人</SectionHeader>
        <div className="mt-3 flex items-center gap-3">
          <div className="rounded-full border-2 border-[color:var(--color-ink)] bg-[color:var(--color-ink)] px-3 py-1 text-sm font-black tracking-[0.2em] text-[color:var(--color-paper)]">
            {profile.idealCofounder.sbtiCode}
          </div>
          <span>
            {TYPES[profile.idealCofounder.sbtiCode]?.name ??
              profile.idealCofounder.sbtiCode}
          </span>
        </div>
        <p className="mt-2 text-[color:var(--color-muted)]">
          {profile.idealCofounder.reason}
        </p>
      </div>

      {/* SB Ideas — linkage to generator! */}
      <div className="sb-card p-6 md:p-8">
        <SectionHeader>你最适合做的 3 个 SB 点子</SectionHeader>
        <p className="mt-1 text-sm text-[color:var(--color-muted)]">
          基于你的 {sbtiCode}
          {mbtiType !== MBTI_UNKNOWN ? ` × ${mbtiType}` : ""}{" "}
          人格特质，AI 推荐了以下点子
        </p>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {profile.sbIdeas.map((idea) => (
            <Link
              key={idea.name}
              href={`/generator`}
              className="flex flex-col rounded-xl border-2 border-[color:var(--color-ink)] bg-transparent p-4 transition-transform hover:-translate-y-0.5 hover:bg-[color:var(--color-ink)] hover:text-[color:var(--color-paper)]"
            >
              <div className="text-lg font-black">{idea.name}</div>
              <div className="mt-1 text-sm">{idea.oneLiner}</div>
              <div className="mt-3 border-t border-[color:var(--color-line)] pt-2 text-xs text-[color:var(--color-muted)]">
                💡 {idea.whyFit}
              </div>
            </Link>
          ))}
        </div>
        <div className="mt-4 text-center">
          <Link
            href="/generator"
            className="text-sm font-bold underline"
          >
            → 去 SB 想法生成器探索更多
          </Link>
        </div>
      </div>

      {/* Fortune */}
      <div className="sb-card bg-[color:var(--color-ink)] p-6 text-[color:var(--color-paper)] md:p-8">
        <div className="mb-3 text-xs font-bold uppercase tracking-[0.3em] opacity-60">
          创业运势
        </div>
        <p className="whitespace-pre-wrap break-words text-lg italic leading-relaxed">
          {profile.fortune}
        </p>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-3">
        <button type="button" onClick={handleShare} className="sb-btn">
          📋 分享我的创业人格
        </button>
        <button
          type="button"
          onClick={onRestart}
          className="sb-btn sb-btn-ghost"
        >
          🔁 重新测一次
        </button>
      </div>
    </div>
  );
}

function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-xs font-bold uppercase tracking-[0.25em] text-[color:var(--color-muted)]">
      {children}
    </div>
  );
}
