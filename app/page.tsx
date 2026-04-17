import Link from "next/link";
import type { Route } from "next";

export const metadata = {
  title: "SBTI · 傻逼型人格测试 · 看你和谁最般配",
  description: "15 维 27 型 · 30 题 4 分钟 · 测出你的 SBTI,立刻和最合得来的那个赛博对象讲上话。",
  openGraph: {
    type: "website",
    url: "https://sbidea.ai",
    title: "SBTI · 看你和谁最般配",
    description: "15 维 27 型 · 30 题 4 分钟 · 测完直接和最合得来的赛博对象通话。",
    siteName: "sbidea.ai",
  },
};

export default function HomePage() {
  return (
    <div
      className="min-h-screen"
      style={{
        background: "radial-gradient(circle at 70% 18%, rgba(255,180,80,.18), transparent 55%), #0a0a0a",
        color: "#fff",
      }}
    >
      <div className="mx-auto max-w-xl px-5 py-14">
        <div className="text-[11px] font-black" style={{ letterSpacing: "0.35em", opacity: 0.55 }}>
          SBIDEA · SBTI
        </div>
        <h1 className="mt-4 text-[40px] font-black leading-[1.1] md:text-[52px]">
          看你是哪一号
          <br />
          <span style={{ color: "#f0b56b" }}>傻逼型人格</span>
        </h1>
        <p className="mt-6 text-[16px] leading-relaxed" style={{ opacity: 0.85 }}>
          30 题,4 分钟。15 维度 × 27 种人格,找出你最合得来的那几位赛博对象 —— 测完直接和 TA 讲上话。
        </p>

        <Link
          href={("/sbti" as Route)}
          className="mt-10 inline-block rounded-xl px-6 py-3 text-base font-black"
          style={{ background: "#f0b56b", color: "#0a0a0a" }}
        >
          🧠 开始测试
        </Link>

        <div className="mt-3 text-[11px]" style={{ opacity: 0.45 }}>
          参考 sbti-wiki · 匿名 · 不会存你的答题
        </div>

        <div className="mt-14 grid gap-3 text-[13px]" style={{ opacity: 0.85 }}>
          <div>✦ 自尊 · 情感 · 态度 · 行动 · 社交 五大模型</div>
          <div>✦ 用曼哈顿距离在 25 种人格模板里找最接近的一型</div>
          <div>✦ 匹配 "类似灵魂" × 2 + "互补撒" × 1</div>
          <div>✦ 每个人格未来都有一个赛博对象可以打电话(MVP:🐺 小野 = GOGO)</div>
        </div>

        <div className="mt-20 text-center text-[11px]" style={{ opacity: 0.35 }}>
          之前的 10 个小工具 · <a href="https://legacy.sbidea.ai" style={{ color: "rgba(255,255,255,.55)", textDecoration: "underline" }}>legacy.sbidea.ai</a>
        </div>
      </div>
    </div>
  );
}
