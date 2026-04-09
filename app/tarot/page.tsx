import type { Metadata } from "next";
import { TarotClient } from "./tarot-client";

export const metadata: Metadata = {
  title: "SB 创业塔罗 · 一副 22 张牌问问你的创业命运",
  description:
    "22 张大阿卡那创业塔罗，AI 随机抽 3 张（现状 / 挑战 / 结果）并结合你的问题给出解读。把塔罗当作一种被强制换角度的思考工具。",
  alternates: { canonical: "/tarot" },
};

export default function TarotPage() {
  return (
    <div className="mx-auto max-w-4xl px-5 pt-12 pb-24">
      <header className="mb-8">
        <div className="sb-stamp mb-4">产品 8 / 10</div>
        <h1 className="text-4xl font-black md:text-5xl">🔮 SB 创业塔罗</h1>
        <p className="mt-3 text-lg text-[color:var(--color-muted)]">
          写下你现在最纠结的一个创业问题，AI 会从 22
          张大阿卡那里随机抽 3 张，解读你的现状、挑战和结果。
          不是迷信，是一种强制换角度思考的工具。
        </p>
      </header>
      <TarotClient />
    </div>
  );
}
