import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: "S2S vs Pipeline — Voice Agent Cost Calculator",
  description:
    "Model your monthly voice agent bill by session length, volume, and architecture. Compare S2S (GPT Realtime, Gemini Native Audio) vs cascaded Pipeline costs. Prices verified April 2026.",
  openGraph: {
    type: "website",
    title: "S2S vs Pipeline — Voice Agent Cost Calculator",
    description:
      "Model your monthly voice agent bill by session length, volume, and architecture. Prices verified April 2026.",
  },
  twitter: {
    card: "summary_large_image",
    title: "S2S vs Pipeline — Voice Agent Cost Calculator",
    description:
      "Model your monthly voice agent bill by session length, volume, and architecture. Prices verified April 2026.",
  },
};

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
  width: "device-width",
  initialScale: 1,
};

export default function CalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at 70% 18%, rgba(255,180,80,.14), transparent 55%), #0a0a0a",
        color: "#fff",
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      {children}
    </div>
  );
}
