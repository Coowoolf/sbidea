"use client";

import { useAdventure } from "@/components/adventure-provider";
import { nextStation, STATION_LABELS } from "@/lib/adventure";
import { productUrl } from "@/lib/urls";

/**
 * CTA button shown after tool results when adventure is active.
 *
 * Props:
 *   product — the current tool's product name (e.g. "generator", "roast").
 *
 * Renders only when:
 *   1. Adventure is active
 *   2. This product is in the adventure route
 *
 * Shows: "本站完成！继续冒险 → 下一站: [name]"
 * Links to the next station's subdomain via productUrl().
 * If this is the last station, links to adventure hub instead.
 */
export function AdventureCTA({ product }: { product: string }) {
  const { adventure, isActive } = useAdventure();
  if (!isActive || !adventure) return null;

  // Only show if this product is in the route
  if (!adventure.route.includes(product)) return null;

  const next = nextStation(adventure);

  // All stations complete — link to adventure hub
  if (!next) {
    return (
      <a
        href={productUrl("adventure")}
        className="sb-card slide-up mt-6 flex items-center gap-3 border-[color:var(--color-accent)] p-5 font-bold transition-transform hover:-translate-y-0.5"
      >
        <span className="text-2xl">🎉</span>
        <span>
          全部站点完成！查看你的创业冒险成果 →
        </span>
      </a>
    );
  }

  // Next station exists — show CTA to continue
  const nextLabel = STATION_LABELS[next];

  return (
    <a
      href={productUrl(next)}
      className="sb-card slide-up mt-6 flex items-center gap-3 border-[color:var(--color-accent)] p-5 font-bold transition-transform hover:-translate-y-0.5"
    >
      <span className="text-2xl">✅</span>
      <span>
        本站完成！继续冒险 → 下一站:{" "}
        {nextLabel?.emoji} {nextLabel?.name ?? next}
      </span>
    </a>
  );
}
