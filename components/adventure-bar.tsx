"use client";

import { useAdventure } from "@/components/adventure-provider";
import { STATION_LABELS } from "@/lib/adventure";
import { productUrl } from "@/lib/urls";

/**
 * Compact adventure progress bar.
 * Renders only when an adventure is active.
 *
 * Example output:
 *   冒险进度 ●●●○○ 3/5 | 当前站: 💀 死法占卜
 */
export function AdventureBar() {
  const { adventure, isActive } = useAdventure();
  if (!isActive || !adventure) return null;

  const { route, stops } = adventure;
  const total = route.length;
  const completed = route.filter((s) => s in stops).length;

  // Current station = first incomplete station in route
  const currentProduct = route.find((s) => !(s in stops)) ?? route[total - 1];
  const label = STATION_LABELS[currentProduct];

  return (
    <div className="slide-up mb-6 flex flex-wrap items-center gap-3 rounded-xl border-2 border-[color:var(--color-ink)] bg-[color:var(--color-paper)] px-4 py-2.5 text-sm font-bold">
      <span className="tracking-wide text-[color:var(--color-muted)]">
        冒险进度
      </span>

      {/* Dot indicators */}
      <span className="flex gap-0.5" aria-label={`${completed}/${total} 完成`}>
        {route.map((s) => (
          <span
            key={s}
            className={
              s in stops
                ? "text-[color:var(--color-accent)]"
                : "text-[color:var(--color-line)]"
            }
          >
            {s in stops ? "●" : "○"}
          </span>
        ))}
      </span>

      <span>
        {completed}/{total}
      </span>

      <span className="text-[color:var(--color-line)]">|</span>

      {/* Current station link */}
      <a
        href={productUrl(currentProduct)}
        className="inline-flex items-center gap-1 underline decoration-[color:var(--color-accent)] underline-offset-2 hover:text-[color:var(--color-accent)]"
      >
        当前站: {label?.emoji} {label?.name ?? currentProduct}
      </a>
    </div>
  );
}
