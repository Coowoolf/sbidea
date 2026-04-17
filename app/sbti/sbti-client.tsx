"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Route } from "next";
import { QUESTIONS, scoreAnswers, type Answers } from "@/lib/sbti-v2";

export function SbtiQuizClient() {
  const router = useRouter();
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const q = QUESTIONS[idx];
  const progress = ((idx) / QUESTIONS.length) * 100;

  function pick(value: "L" | "M" | "H") {
    const nextAnswers = { ...answers, [q.id]: value };
    setAnswers(nextAnswers);
    if (idx + 1 < QUESTIONS.length) {
      setIdx(idx + 1);
    } else {
      const r = scoreAnswers(nextAnswers);
      const url = `/sbti/result?code=${encodeURIComponent(r.code)}` as Route;
      router.push(url);
    }
  }

  function back() {
    if (idx > 0) setIdx(idx - 1);
  }

  return (
    <div
      className="min-h-screen"
      style={{
        background: "radial-gradient(circle at 70% 18%, rgba(255,180,80,.14), transparent 55%), #0a0a0a",
        color: "#fff",
      }}
    >
      <div className="mx-auto max-w-xl px-5 py-8">
        {/* progress */}
        <div className="mb-6">
          <div className="mb-2 flex items-center justify-between text-[11px]" style={{ letterSpacing: "0.2em", opacity: 0.6 }}>
            <span>SBTI · {idx + 1} / {QUESTIONS.length}</span>
            {idx > 0 && (
              <button type="button" onClick={back} className="underline" style={{ color: "#f0b56b" }}>
                ← 上一题
              </button>
            )}
          </div>
          <div className="h-1.5 overflow-hidden rounded-full" style={{ background: "rgba(255,255,255,.08)" }}>
            <div className="h-full transition-all" style={{ width: `${progress}%`, background: "#f0b56b" }} />
          </div>
        </div>

        <h2 className="text-xl font-black leading-snug md:text-2xl">{q.prompt}</h2>

        <div className="mt-6 grid gap-3">
          {q.options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => pick(opt.value)}
              className="rounded-xl border px-4 py-3 text-left text-[15px] leading-relaxed transition-transform hover:-translate-y-0.5"
              style={{
                background: "rgba(255,255,255,.04)",
                borderColor: "rgba(255,255,255,.12)",
                color: "#fff",
              }}
            >
              {opt.text}
            </button>
          ))}
        </div>

        <div className="mt-10 text-center text-[11px]" style={{ opacity: 0.45 }}>
          这个测试参考了 serenakeyitan/sbti-wiki (MIT)
        </div>
      </div>
    </div>
  );
}
