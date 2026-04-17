import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "赛博女友 · sbidea.ai",
  description: "凌晨 3 点拉你起床写代码的赛博 hustler 女友",
};

export default function GfLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="min-h-screen"
      style={{
        background:
          "radial-gradient(circle at 70% 18%, rgba(255,180,80,.18), transparent 55%), #0a0a0a",
        color: "#fff",
      }}
    >
      {children}
    </div>
  );
}
