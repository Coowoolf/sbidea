import type { Metadata, Viewport } from "next";
import { productUrl, homeUrl } from "@/lib/urls";
import "./globals.css";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://sbidea.ai";
const SITE_NAME = "SB Idea · 傻想法研究所";
const SITE_DESCRIPTION =
  "看起来 SB，赚起来真。AI 帮你生成、吐槽、鉴定那些听起来很傻但可能封神的创业点子。";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_NAME,
    template: "%s · SB Idea",
  },
  description: SITE_DESCRIPTION,
  keywords: [
    "创业点子",
    "startup ideas",
    "side business",
    "独角兽",
    "unicorn",
    "AI 生成",
    "idea validator",
    "创业想法",
    "SB idea",
  ],
  authors: [{ name: "SB Idea Lab" }],
  openGraph: {
    type: "website",
    url: SITE_URL,
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    siteName: SITE_NAME,
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
  },
  icons: {
    icon: "/favicon.svg",
  },
};

export const viewport: Viewport = {
  themeColor: "#fafaf7",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen grain">
        <header className="border-b-2 border-[color:var(--color-ink)] bg-[color:var(--color-paper)]">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
            <a
              href={homeUrl()}
              className="flex items-center gap-2 text-xl font-black tracking-tight"
            >
              <span className="sb-stamp">SB</span>
              <span>idea.ai</span>
            </a>
            <nav className="hidden items-center gap-4 text-sm font-semibold md:flex">
              <a href={productUrl("generator")} className="hover:underline">
                生成器
              </a>
              <a href={productUrl("sbti")} className="hover:underline">
                SBTI
              </a>
              <a href={productUrl("tarot")} className="hover:underline">
                塔罗
              </a>
              <a href={productUrl("hall")} className="hover:underline">
                名人堂
              </a>
              <a
                href={homeUrl()}
                className="rounded-full border-2 border-[color:var(--color-ink)] px-3 py-1 hover:bg-[color:var(--color-ink)] hover:text-[color:var(--color-paper)]"
              >
                全部 10 个
              </a>
            </nav>
            <a
              href={homeUrl()}
              className="rounded-full border-2 border-[color:var(--color-ink)] px-3 py-1 text-xs font-semibold md:hidden"
            >
              10 个工具
            </a>
          </div>
        </header>
        <main>{children}</main>
        <footer className="mt-24 border-t-2 border-[color:var(--color-ink)] bg-[color:var(--color-paper)]">
          <div className="mx-auto flex max-w-6xl flex-col gap-2 px-5 py-8 text-sm text-[color:var(--color-muted)] md:flex-row md:items-center md:justify-between">
            <div>
              © {new Date().getFullYear()} sbidea.ai · 看起来 SB，赚起来真
            </div>
            <div className="flex flex-wrap gap-3">
              <a href={productUrl("generator")} className="hover:text-[color:var(--color-ink)]">生成器</a>
              <a href={productUrl("roast")} className="hover:text-[color:var(--color-ink)]">鉴定所</a>
              <a href={productUrl("hall")} className="hover:text-[color:var(--color-ink)]">名人堂</a>
              <a href={productUrl("sbti")} className="hover:text-[color:var(--color-ink)]">SBTI</a>
              <a href={productUrl("headline")} className="hover:text-[color:var(--color-ink)]">融资头条</a>
              <a href={productUrl("deathways")} className="hover:text-[color:var(--color-ink)]">死法占卜</a>
              <a href={productUrl("slogan")} className="hover:text-[color:var(--color-ink)]">Slogan</a>
              <a href={productUrl("tarot")} className="hover:text-[color:var(--color-ink)]">塔罗</a>
              <a href={productUrl("daily")} className="hover:text-[color:var(--color-ink)]">日签</a>
              <a href={productUrl("jargon")} className="hover:text-[color:var(--color-ink)]">黑话词典</a>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
