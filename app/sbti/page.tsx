import type { Metadata } from "next";
import { SbtiClient } from "./sbti-client";

export const metadata: Metadata = {
  title: "SBTI · 创业人格 × MBTI 融合测试",
  description:
    "12 道创业人格题 + MBTI 类型融合，AI 生成独一无二的深度画像：你的创业人格编号、优势与盲区、最佳合伙人、3 个最适合你的 SB 创业点子、创业运势。",
  alternates: { canonical: "/sbti" },
  openGraph: {
    title: "SBTI · 创业人格 × MBTI 融合测试",
    description:
      "12 道题 + MBTI，AI 生成你的创业人格画像 · 创业人格 Top 100，你是第几号？",
    url: "/sbti",
  },
};

export default function SbtiPage() {
  return (
    <div className="mx-auto max-w-3xl px-5 pt-12 pb-24">
      <header className="mb-8">
        <div className="sb-stamp wobble mb-4">创业人格 Top 100</div>
        <h1 className="text-4xl font-black md:text-5xl">
          🧠 SBTI · 创业人格测试
        </h1>
        <p className="mt-3 text-lg text-[color:var(--color-muted)]">
          <strong>12 道创业人格题 + 你的 MBTI 类型</strong>，AI
          把两套性格体系融合，生成一份只属于你的深度画像。
          包含你的创业人格编号、优势与盲区、最佳合伙人类型、
          3 个最适合你的 SB 创业点子，以及你的创业运势。
        </p>
        <div className="mt-4 flex flex-wrap gap-3 text-sm text-[color:var(--color-muted)]">
          <span className="rounded-full border px-3 py-1">⏱ 约 3 分钟</span>
          <span className="rounded-full border px-3 py-1">🧬 SBTI × MBTI 融合</span>
          <span className="rounded-full border px-3 py-1">🤖 AI 深度画像</span>
          <span className="rounded-full border px-3 py-1">🎲 联动 SB 想法生成器</span>
        </div>
      </header>
      <SbtiClient />
    </div>
  );
}
