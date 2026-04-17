/**
 * Parse a line of assistant transcript that may contain inline
 * emotion tags like "[FOMO] 你快点 ship" → { tags: ["FOMO"], body: "你快点 ship" }
 *
 * - Tags are [a-z][a-z0-9-]*, case-insensitive, matched non-greedily.
 * - body keeps the raw text but with the [tag] substrings stripped out
 *   (UI can decide whether to dim them instead by re-parsing).
 */
export function parseTaggedLine(line: string): { tags: string[]; body: string } {
  const re = /\[([a-z][a-z0-9-]*)\]/gi;
  const tags = [...line.matchAll(re)].map((m) => m[1]);
  const body = line.replace(re, "").replace(/\s{2,}/g, " ").trim();
  return { tags, body };
}

/**
 * Given a flat list of tags collected over the session, return a
 * normalised frequency map: { tag: 0..1 } summing to ~1.
 */
export function aggregateEmotionMix(tags: string[]): Record<string, number> {
  if (tags.length === 0) return {};
  const counts: Record<string, number> = {};
  for (const t of tags) counts[t] = (counts[t] ?? 0) + 1;
  const total = tags.length;
  return Object.fromEntries(
    Object.entries(counts).map(([k, v]) => [k, v / total]),
  );
}

/**
 * Pick top N emotion tags by count for a pills bar.
 * Stable by insertion order on ties.
 */
export function topEmotions(tags: string[], n = 3): string[] {
  if (tags.length === 0) return [];
  const counts = new Map<string, number>();
  for (const t of tags) counts.set(t, (counts.get(t) ?? 0) + 1);
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([k]) => k);
}
