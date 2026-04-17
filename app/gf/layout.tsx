import type { Metadata } from "next";

const TITLE = "赛博女友 · 小野";
const DESCRIPTION =
  "和赛博女友语音通话。🐺 小野是凌晨 3 点拉你起床写代码的赛博 hustler 女友。";
const URL = "https://gf.sbidea.ai";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  openGraph: {
    type: "website",
    url: URL,
    title: TITLE,
    description: DESCRIPTION,
    siteName: "gf.sbidea.ai",
  },
  twitter: {
    card: "summary",
    title: TITLE,
    description: DESCRIPTION,
  },
  alternates: {
    canonical: URL,
  },
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
