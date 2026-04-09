import type { Metadata } from "next";
import { DailyClient } from "./daily-client";

export const metadata: Metadata = {
  title: "SB 成功学日签 · 每天一句反成功学口号",
  description:
    "点一下按钮，AI 给你写一张 SB 风格的每日口号海报，反成功学，带一点反讽，适合当朋友圈日签。",
  alternates: { canonical: "/daily" },
};

export default function DailyPage() {
  return (
    <div className="mx-auto max-w-3xl px-5 pt-12 pb-24">
      <header className="mb-8">
        <div className="sb-stamp mb-4">产品 9 / 10</div>
        <h1 className="text-4xl font-black md:text-5xl">🏆 SB 成功学日签</h1>
        <p className="mt-3 text-lg text-[color:var(--color-muted)]">
          每次点击都会生成一句荒诞但带能量的反成功学口号，自动配色、自动排版，
          右键另存就能发朋友圈。
        </p>
      </header>
      <DailyClient />
    </div>
  );
}
