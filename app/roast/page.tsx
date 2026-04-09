import type { Metadata } from "next";
import { RoastClient } from "./roast-client";

export const metadata: Metadata = {
  title: "SB 想法鉴定所 · AI 先毒舌吐槽你的点子，再认真给建议",
  description:
    "把你的创业想法粘贴进来，AI 鉴定师先用脱口秀式毒舌吐槽一通，然后切换成投资人视角给出真诚分析。娱乐 + 建设性。",
  alternates: { canonical: "/roast" },
  openGraph: {
    title: "SB 想法鉴定所",
    description: "AI 先毒舌吐槽你的点子，再认真给建议",
    url: "/roast",
  },
};

export default function RoastPage() {
  return (
    <div className="mx-auto max-w-4xl px-5 pt-12 pb-24">
      <header className="mb-8">
        <div className="sb-stamp mb-4">产品 2 / 3</div>
        <h1 className="text-4xl font-black md:text-5xl">🔥 SB 想法鉴定所</h1>
        <p className="mt-3 text-lg text-[color:var(--color-muted)]">
          把你的创业点子粘贴进来，AI
          鉴定师先把你吐槽清醒，然后立刻切换真诚模式，给你 5
          段结构化分析：毒舌 → 冷静 → 可行性 → 风险 → 建议。
        </p>
      </header>

      <RoastClient />

      <section className="mt-16">
        <h2 className="mb-3 text-xl font-black">为什么要先吐槽再分析？</h2>
        <p className="text-[color:var(--color-muted)]">
          因为所有创业者都经历过这个循环：先兴奋、然后怀疑、最后半途而废。
          与其让你自己在凌晨 3 点自我怀疑，不如让 AI
          一次性替你说完所有最难听的话。骂完之后你会发现两件事：
        </p>
        <ul className="mt-3 space-y-2 text-[color:var(--color-muted)]">
          <li>· 有些吐槽其实不成立 → 你更有信心了</li>
          <li>· 有些吐槽真的一针见血 → 你知道第一步该补什么了</li>
        </ul>
      </section>
    </div>
  );
}
