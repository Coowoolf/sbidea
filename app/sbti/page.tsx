import type { Metadata } from "next";
import { SbtiClient } from "./sbti-client";

export const metadata: Metadata = {
  title: "SBTI · SB 创业 16 型人格测试",
  description:
    "12 道题，测你是 16 种 SB 创始人中的哪一种。独狼推销员 / 车库艺术家 / 摇滚乐队主唱 / 匠人……每一种都有自己的命运。",
  alternates: { canonical: "/sbti" },
  openGraph: {
    title: "SBTI · SB 创业 16 型人格测试",
    description: "12 道题，测出你的 SB 创始人类型",
    url: "/sbti",
  },
};

export default function SbtiPage() {
  return (
    <div className="mx-auto max-w-3xl px-5 pt-12 pb-24">
      <header className="mb-8">
        <div className="sb-stamp mb-4">产品 4 / 10</div>
        <h1 className="text-4xl font-black md:text-5xl">
          🧠 SBTI · 创业 16 型人格
        </h1>
        <p className="mt-3 text-lg text-[color:var(--color-muted)]">
          12 道题，大约 2 分钟。我们会在四个维度上给你打分，
          然后告诉你是独狼推销员、车库艺术家、摇滚乐队主唱还是深夜孵化家。
        </p>
      </header>
      <SbtiClient />
    </div>
  );
}
