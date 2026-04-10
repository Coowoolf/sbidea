"use client";

import { useEffect, useState } from "react";
import { SB_MEANINGS } from "@/lib/sb-meanings";

/**
 * Cycles through SB meanings in the hero section.
 * Fades in/out every 3.5 seconds.
 */
export function SbRotatingText() {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIndex((prev) => (prev + 1) % SB_MEANINGS.length);
        setVisible(true);
      }, 400);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  const current = SB_MEANINGS[index];

  return (
    <div className="mt-4 flex items-center gap-3">
      <span className="rounded-full border-2 border-[color:var(--color-ink)] px-3 py-1 text-xs font-black tracking-[0.15em]">
        SB =
      </span>
      <div
        className="transition-opacity duration-300"
        style={{ opacity: visible ? 1 : 0 }}
      >
        <span className="font-black">{current.sb}</span>
        <span className="ml-2 text-[color:var(--color-muted)]">
          {current.meaning}
        </span>
      </div>
    </div>
  );
}
