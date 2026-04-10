"use client";

import { useEffect, useState } from "react";
import { productUrl } from "@/lib/urls";

const DISMISS_KEY = "sbidea-detect-dismissed";
const ADVENTURE_KEY = "sbidea-adventure";

/**
 * Floating prompt that nudges users to take the SBTI personality test.
 *
 * Shows a subtle bottom-right toast when:
 *   1. No adventure state in localStorage (user hasn't started adventure)
 *   2. User hasn't dismissed this prompt before
 *   3. User isn't already on sbti.sbidea.ai (checks hostname)
 *
 * Dismissible — saves dismiss flag to localStorage.
 */
export function AdventureDetect() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Don't show on the SBTI page itself
    if (typeof window === "undefined") return;
    if (window.location.hostname.startsWith("sbti.")) return;
    if (window.location.pathname.startsWith("/sbti")) return;

    // Already dismissed
    if (localStorage.getItem(DISMISS_KEY)) return;

    // Already has adventure state (took SBTI and started adventure)
    if (localStorage.getItem(ADVENTURE_KEY)) return;

    // Show after a short delay so it doesn't flash on page load
    const timer = setTimeout(() => setVisible(true), 2000);
    return () => clearTimeout(timer);
  }, []);

  function handleDismiss() {
    setVisible(false);
    localStorage.setItem(DISMISS_KEY, "1");
  }

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-xs slide-up">
      <div className="rounded-xl border-2 border-[color:var(--color-ink)] bg-[color:var(--color-paper)] p-4 shadow-[4px_4px_0_var(--color-ink)]">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-sm font-black leading-snug">
              先花 2 分钟认识一下自己？
            </div>
            <p className="mt-1 text-xs text-[color:var(--color-muted)]">
              完成创业人格测试，解锁你的专属冒险路线
            </p>
          </div>
          <button
            type="button"
            onClick={handleDismiss}
            className="shrink-0 text-[color:var(--color-muted)] hover:text-[color:var(--color-ink)]"
            aria-label="关闭"
          >
            ✕
          </button>
        </div>
        <a
          href={productUrl("sbti")}
          className="mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-lg border-2 border-[color:var(--color-ink)] bg-[color:var(--color-ink)] px-4 py-2 text-sm font-black text-[color:var(--color-paper)] transition-transform hover:-translate-y-0.5"
        >
          → 开始测试
        </a>
      </div>
    </div>
  );
}
