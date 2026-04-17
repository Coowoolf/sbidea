import { PATTERNS } from "./patterns";
import type { Level } from "./dimensions";

const levelValue: Record<Level, number> = { L: 0, M: 1, H: 2 };

function manhattan(a: Level[], b: Level[]): number {
  let d = 0;
  for (let i = 0; i < a.length; i += 1) {
    d += Math.abs(levelValue[a[i]] - levelValue[b[i]]);
  }
  return d;
}

export type Match = { code: string; label: "similar" | "opposite" };

/** Given a user SBTI code, return 2 most similar + 1 most opposite (excluding self). */
export function findMatches(userCode: string): Match[] {
  const userPattern = PATTERNS.find((p) => p.code === userCode);
  if (!userPattern) {
    // HHHH (fallback) — just recommend top 3 by template similarity to nothing
    return [
      { code: "GOGO",   label: "similar" },
      { code: "THAN-K", label: "similar" },
      { code: "WOC!",   label: "opposite" },
    ];
  }
  const scored = PATTERNS
    .filter((p) => p.code !== userCode)
    .map((p) => ({ code: p.code, dist: manhattan(userPattern.levels, p.levels) }));
  scored.sort((a, b) => a.dist - b.dist);
  const twoSimilar = scored.slice(0, 2).map((s) => ({ code: s.code, label: "similar" as const }));
  const oneOpposite = scored[scored.length - 1];
  return [
    ...twoSimilar,
    { code: oneOpposite.code, label: "opposite" as const },
  ];
}
