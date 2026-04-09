import type { Metadata } from "next";
import { SloganClient } from "./slogan-client";

export const metadata: Metadata = {
  title: "SB Slogan 对撞机 · 同一个产品的 8 种风格 slogan",
  description:
    "输入产品，AI 用 8 种风格同时写 slogan：投资人 / 抖音 / 小红书 / 老干部 / 微商 / 中二 / 脱口秀 / 央视。一眼看到反差。",
  alternates: { canonical: "/slogan" },
};

export default function SloganPage() {
  return (
    <div className="mx-auto max-w-5xl px-5 pt-12 pb-24">
      <header className="mb-8">
        <div className="sb-stamp mb-4">产品 7 / 10</div>
        <h1 className="text-4xl font-black md:text-5xl">
          🎨 SB Slogan 对撞机
        </h1>
        <p className="mt-3 text-lg text-[color:var(--color-muted)]">
          同一个产品，让 AI 用 8 种完全不同的腔调各写一条 slogan，并排给你看。
          看看你的想法在投资人嘴里和在菜市场大妈嘴里分别是什么样。
        </p>
      </header>
      <SloganClient />
    </div>
  );
}
