"use client";

import { useRef, useCallback } from "react";
import Link from "next/link";
import { useAdventure } from "@/components/adventure-provider";
import { isAdventureComplete } from "@/lib/adventure";

// Map SBTI first letter to gradient: W→warm, Z→cool
function gradientForCode(code: string): string {
  const first = code.charAt(0).toUpperCase();
  if (first === "W") {
    return "linear-gradient(135deg, #f97316 0%, #ec4899 50%, #a855f7 100%)";
  }
  return "linear-gradient(135deg, #3b82f6 0%, #6366f1 50%, #8b5cf6 100%)";
}

export function CardClient() {
  const { adventure } = useAdventure();
  const cardRef = useRef<HTMLDivElement>(null);

  const handleSaveImage = useCallback(async () => {
    const el = cardRef.current;
    if (!el || !adventure) return;

    try {
      const { default: html2canvas } = await import("html2canvas-pro");
      const canvas = await html2canvas(el, {
        scale: 2,
        useCORS: true,
        backgroundColor: null,
      });
      const dataUrl = canvas.toDataURL("image/png");

      // Try native share with file (mobile)
      if (typeof navigator !== "undefined" && navigator.share) {
        const blob = await (await fetch(dataUrl)).blob();
        const file = new File(
          [blob],
          `adventure-card-${adventure.sbtiCode}-${adventure.sbtiProfileNumber}.png`,
          { type: "image/png" },
        );
        try {
          await navigator.share({
            title: `创业人格 #${adventure.sbtiProfileNumber} · ${adventure.sbtiProfileName}`,
            files: [file],
          });
          return;
        } catch {
          /* share cancelled or unsupported, fall through to download */
        }
      }

      // Fallback: download PNG
      const link = document.createElement("a");
      link.download = `adventure-card-${adventure.sbtiCode}-${adventure.sbtiProfileNumber}.png`;
      link.href = dataUrl;
      link.click();
    } catch {
      // ignore capture failures silently
    }
  }, [adventure]);

  // --- No adventure or not complete ---
  if (!adventure || !isAdventureComplete(adventure)) {
    return (
      <div className="py-20 text-center">
        <p className="text-lg text-[color:var(--color-muted)]">
          完成全部 5 站冒险后，才能生成你的创业名片。
        </p>
        <Link
          href="/"
          className="mt-6 inline-block rounded-full bg-[color:var(--color-accent)] px-6 py-3 font-bold text-white"
        >
          前往冒险 →
        </Link>
      </div>
    );
  }

  const bg = gradientForCode(adventure.sbtiCode);
  const pNumber = adventure.sbtiProfileNumber;

  return (
    <div className="flex flex-col items-center gap-8">
      {/* === Card (capture area) === */}
      <div
        ref={cardRef}
        style={{
          background: bg,
          width: 375,
          height: 500,
          borderRadius: 24,
          position: "relative",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: 32,
          color: "#fff",
          fontFamily:
            '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        }}
      >
        {/* Badge top-right */}
        <div
          style={{
            position: "absolute",
            top: 20,
            right: 20,
            background: "rgba(255,255,255,0.2)",
            backdropFilter: "blur(8px)",
            borderRadius: 999,
            padding: "6px 14px",
            fontSize: 13,
            fontWeight: 800,
          }}
        >
          创业人格 #{pNumber}
        </div>

        {/* Emoji */}
        <div style={{ fontSize: 72, lineHeight: 1, marginBottom: 12 }}>
          {adventure.sbtiProfileEmoji}
        </div>

        {/* Personality name */}
        <div
          style={{
            fontSize: 28,
            fontWeight: 900,
            textAlign: "center",
            marginBottom: 16,
          }}
        >
          {adventure.sbtiProfileName}
        </div>

        {/* SBTI x MBTI tags */}
        <div
          style={{
            display: "flex",
            gap: 8,
            marginBottom: 20,
          }}
        >
          <span
            style={{
              background: "rgba(255,255,255,0.2)",
              borderRadius: 999,
              padding: "4px 12px",
              fontSize: 14,
              fontWeight: 700,
            }}
          >
            {adventure.sbtiCode}
          </span>
          <span
            style={{
              background: "rgba(255,255,255,0.2)",
              borderRadius: 999,
              padding: "4px 12px",
              fontSize: 14,
              fontWeight: 700,
            }}
          >
            {adventure.mbtiType}
          </span>
        </div>

        {/* todaySbMeaning */}
        <div
          style={{
            fontSize: 14,
            fontStyle: "italic",
            opacity: 0.85,
            textAlign: "center",
            maxWidth: 280,
            lineHeight: 1.5,
          }}
        >
          {adventure.todaySbMeaning}
        </div>

        {/* Branding bottom */}
        <div
          style={{
            position: "absolute",
            bottom: 20,
            fontSize: 13,
            opacity: 0.6,
            fontWeight: 600,
            letterSpacing: 1,
          }}
        >
          sbidea.ai
        </div>
      </div>

      {/* === Buttons (outside capture area) === */}
      <div className="flex gap-4">
        <button
          onClick={handleSaveImage}
          className="rounded-full bg-[color:var(--color-accent)] px-6 py-3 font-bold text-white transition-opacity hover:opacity-90"
        >
          📸 保存图片
        </button>
        <Link
          href="/"
          className="rounded-full border px-6 py-3 font-bold transition-opacity hover:opacity-80"
        >
          ← 返回冒险
        </Link>
      </div>
    </div>
  );
}
