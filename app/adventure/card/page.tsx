import type { Metadata } from "next";
import { CardClient } from "./card-client";

export const metadata: Metadata = {
  title: "我的创业名片 · SB Idea",
  description:
    "你的极简创业人格名片 — 保存图片，分享给朋友。",
  alternates: { canonical: "/adventure/card" },
  openGraph: {
    title: "我的创业名片 · SB Idea",
    description: "极简创业人格名片 · 保存图片分享给朋友",
    url: "/adventure/card",
  },
};

export default function CardPage() {
  return (
    <div className="mx-auto max-w-3xl px-5 pt-12 pb-24">
      <CardClient />
    </div>
  );
}
