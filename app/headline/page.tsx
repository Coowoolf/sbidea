import type { Metadata } from "next";
import { HeadlineClient } from "./headline-client";

export const metadata: Metadata = {
  title: "SB 融资头条 · 把你的 SB 点子变成一篇融资新闻",
  description:
    "输入创业点子 → AI 生成一篇看起来完全真实的 TechCrunch 风格融资报道，包含虚构投资机构、估值、创始人引言和关键数据。",
  alternates: { canonical: "/headline" },
};

export default function HeadlinePage() {
  return (
    <div className="mx-auto max-w-4xl px-5 pt-12 pb-24">
      <header className="mb-8">
        <div className="sb-stamp mb-4">产品 5 / 10</div>
        <h1 className="text-4xl font-black md:text-5xl">📰 SB 融资头条</h1>
        <p className="mt-3 text-lg text-[color:var(--color-muted)]">
          把你的点子粘进来，AI 会帮你写一篇完全煞有介事的融资报道。
          投资机构是虚构的，但新闻腔调是真的。适合用来自 high、晒朋友圈、贴到冰箱上。
        </p>
      </header>
      <HeadlineClient />
    </div>
  );
}
