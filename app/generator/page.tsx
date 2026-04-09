import type { Metadata } from "next";
import { GeneratorClient } from "./generator-client";

export const metadata: Metadata = {
  title: "SB 想法生成器 · 一键生成听起来很傻其实能赚钱的点子",
  description:
    "SB 想法生成器：AI 每次吐出一个『听起来 SB、细想真行』的创业点子，附带 SB 指数和独角兽指数。灵感枯竭就来点一下。",
  alternates: { canonical: "/generator" },
  openGraph: {
    title: "SB 想法生成器",
    description: "AI 每次吐出一个听起来很傻但其实可能能赚钱的创业点子",
    url: "/generator",
  },
};

export default function GeneratorPage() {
  return (
    <div className="mx-auto max-w-4xl px-5 pt-12 pb-24">
      <header className="mb-8">
        <div className="sb-stamp mb-4">产品 1 / 3</div>
        <h1 className="text-4xl font-black md:text-5xl">
          🎲 SB 想法生成器
        </h1>
        <p className="mt-3 text-lg text-[color:var(--color-muted)]">
          点一下按钮，AI
          会吐出一个『第一眼看上去很 SB』的创业点子，然后告诉你它到底能不能成。
        </p>
      </header>

      <GeneratorClient />

      <section className="mt-16">
        <h2 className="mb-3 text-xl font-black">使用指南</h2>
        <ul className="space-y-2 text-[color:var(--color-muted)]">
          <li>· 每一次点击都会让 AI 重新发散，不要怕 SB，越 SB 越好</li>
          <li>· 可以在输入框给出方向提示，例如"银发族"、"宠物"、"音频"</li>
          <li>· 喜欢的点子可以复制分享，让朋友看看你是不是疯了</li>
          <li>· 所有内容由 AI 生成，仅供灵感参考，不构成投资建议</li>
        </ul>
      </section>
    </div>
  );
}
