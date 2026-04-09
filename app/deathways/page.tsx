import type { Metadata } from "next";
import { DeathwaysClient } from "./deathways-client";

export const metadata: Metadata = {
  title: "SB 死法占卜 · 你的创业点子最可能以哪 7 种方式死掉",
  description:
    "输入你的点子，AI 死亡占卜师用黑色幽默的方式预言 7 种它最可能的死法，每一种都有时间线和根本原因。",
  alternates: { canonical: "/deathways" },
};

export default function DeathwaysPage() {
  return (
    <div className="mx-auto max-w-4xl px-5 pt-12 pb-24">
      <header className="mb-8">
        <div className="sb-stamp mb-4">产品 6 / 10</div>
        <h1 className="text-4xl font-black md:text-5xl">💀 SB 死法占卜</h1>
        <p className="mt-3 text-lg text-[color:var(--color-muted)]">
          把你的点子交给死亡占卜师，她会给你预言 7 种最戏剧化的死法。
          每一种都有剧情和根本原因。读完你会知道第一步该保护什么。
        </p>
      </header>
      <DeathwaysClient />
    </div>
  );
}
