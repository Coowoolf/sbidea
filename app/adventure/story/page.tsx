import type { Metadata } from "next";
import { StoryClient } from "./story-client";

export const metadata: Metadata = {
  title: "你的创业成功故事 · SB Idea",
  description:
    "基于你的创业人格和冒险旅程，AI 为你编织一篇个性化的未来成功故事。三种文风可选：TechCrunch 报道、创始人自述、传记特写。",
  alternates: { canonical: "/adventure/story" },
  openGraph: {
    title: "你的创业成功故事 · SB Idea",
    description:
      "AI 为你生成个性化的未来成功故事——基于你的创业人格和冒险旅程中的每一站收获。",
    url: "/adventure/story",
  },
};

export default function StoryPage() {
  return (
    <div className="mx-auto max-w-3xl px-5 pt-12 pb-24">
      <StoryClient />
    </div>
  );
}
