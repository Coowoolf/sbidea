import type { Metadata } from "next";
import { JargonClient } from "./jargon-client";

export const metadata: Metadata = {
  title: "SB 黑话词典 · 人话 ↔ 投资人黑话双向翻译",
  description:
    "输入一句人话，AI 翻译成听起来能骗钱的投资人黑话；反向也行。附带一个『黑话含量分数』。",
  alternates: { canonical: "/jargon" },
};

export default function JargonPage() {
  return (
    <div className="mx-auto max-w-4xl px-5 pt-12 pb-24">
      <header className="mb-8">
        <div className="sb-stamp mb-4">产品 10 / 10</div>
        <h1 className="text-4xl font-black md:text-5xl">📖 SB 黑话词典</h1>
        <p className="mt-3 text-lg text-[color:var(--color-muted)]">
          把『我想做个记账 App』翻译成『打造下一代个人财务基础设施，赋能 Z 世代财商养成』。
          或者反过来，把投资人的话拉回地面。
        </p>
      </header>
      <JargonClient />
    </div>
  );
}
