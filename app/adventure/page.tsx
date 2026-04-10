import type { Metadata } from "next";
import { AdventureClient } from "./adventure-client";

export const metadata: Metadata = {
  title: "SB 创业冒险 · 你的创业自我发现之旅",
  description:
    "12 题人格测试 → 5 站个性化探索 → 双重礼物（AI 成功故事 + 创业名片）。一条引导式剧情线，发现你的创业人格。",
  alternates: { canonical: "/adventure" },
  openGraph: {
    title: "SB 创业冒险 · 你的创业自我发现之旅",
    description:
      "12 题人格测试 → 5 站探索 → 双重礼物。发现你的创业人格，生成你的成功故事。",
    url: "/adventure",
  },
};

export default function AdventurePage() {
  return (
    <div className="mx-auto max-w-3xl px-5 pt-12 pb-24">
      <AdventureClient />
    </div>
  );
}
