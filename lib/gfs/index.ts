import type { Gf } from "./types";
import { xiaoYe } from "./characters/xiao-ye";

const REGISTRY: Record<string, Gf> = {
  [xiaoYe.slug]: xiaoYe,
};

export function getGf(slug: string): Gf | null {
  return REGISTRY[slug] ?? null;
}

export function listGfs(): Gf[] {
  return Object.values(REGISTRY);
}

export { xiaoYe };
export type { Gf };
