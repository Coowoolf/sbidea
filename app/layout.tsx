import type { Metadata, Viewport } from "next";
import { headers } from "next/headers";
import { AdventureProvider } from "@/components/adventure-provider";
import { AdventureDetect } from "@/components/adventure-detect";
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

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const h = await headers();
  const host = h.get("host") ?? "";
  // proxy.ts sets `x-pathname` on every passthrough/rewrite. Fall back to
  // the legacy Next.js headers in case the proxy matcher missed the request.
  const path =
    h.get("x-pathname") ??
    h.get("x-invoke-path") ??
    h.get("x-matched-path") ??
    "";
  const isBare =
    host.startsWith("gf.") ||
    host.startsWith("cal.") ||
    path.startsWith("/gf") ||
    path.startsWith("/cal");

  return (
    <html lang="zh-CN">
      <body className="min-h-screen grain">
        {isBare ? (
          <main>{children}</main>
        ) : (
          <AdventureProvider>
            <main>{children}</main>
            <AdventureDetect />
          </AdventureProvider>
        )}
      </body>
    </html>
  );
}
