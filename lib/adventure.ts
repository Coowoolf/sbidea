// lib/adventure.ts — types, route map, localStorage helpers

import { SB_MEANINGS } from "./sb-meanings";

export type StopResult = {
  completedAt: string;
  summary: string;
  data: Record<string, unknown>;
};

export type StoryStyle = "techcrunch" | "founder" | "biography";

export type AdventureState = {
  sbtiCode: string;
  mbtiType: string;
  sbtiProfileName: string;
  sbtiProfileEmoji: string;
  sbtiProfileNumber: number;
  route: string[];
  currentStep: number;
  stops: Record<string, StopResult>;
  todaySbMeaning: string;
  story?: { style: StoryStyle; content: string; generatedAt: string };
  startedAt: string;
  version: 1;

};

const STORAGE_KEY = "sbidea-adventure";

// 16 SBTI types → 5 recommended stations (from 10 tools)
// Stations: generator, roast, deathways, headline, slogan, tarot, daily, jargon
// (sbti excluded — it's the prerequisite, not a station)
// (hall excluded — it's static content, not interactive)
const ROUTE_MAP: Record<string, string[]> = {
  WFIM: ["generator", "roast", "deathways", "headline", "daily"],
  WFIA: ["generator", "tarot", "slogan", "roast", "daily"],
  WFTM: ["generator", "roast", "headline", "jargon", "daily"],
  WFTA: ["generator", "slogan", "tarot", "roast", "daily"],
  WSIM: ["tarot", "generator", "deathways", "jargon", "headline"],
  WSIA: ["tarot", "generator", "slogan", "daily", "deathways"],
  WSTM: ["generator", "jargon", "roast", "headline", "deathways"],
  WSTA: ["tarot", "slogan", "generator", "daily", "roast"],
  ZFIM: ["generator", "jargon", "roast", "deathways", "headline"],
  ZFIA: ["generator", "slogan", "daily", "tarot", "roast"],
  ZFTM: ["generator", "jargon", "headline", "roast", "deathways"],
  ZFTA: ["slogan", "generator", "tarot", "daily", "roast"],
  ZSIM: ["tarot", "jargon", "generator", "deathways", "headline"],
  ZSIA: ["tarot", "daily", "slogan", "generator", "deathways"],
  ZSTM: ["jargon", "generator", "headline", "roast", "deathways"],
  ZSTA: ["tarot", "slogan", "daily", "generator", "roast"],
};

const DEFAULT_ROUTE = ["generator", "roast", "deathways", "headline", "daily"];

export function generateRoute(sbtiCode: string): string[] {
  return ROUTE_MAP[sbtiCode] ?? DEFAULT_ROUTE;
}

export function pickRandomSbMeaning(): string {
  const item = SB_MEANINGS[Math.floor(Math.random() * SB_MEANINGS.length)];
  return `SB = ${item.sb} · ${item.meaning}`;
}

export const STATION_LABELS: Record<string, { emoji: string; name: string }> = {
  generator: { emoji: "🎲", name: "想法生成器" },
  roast: { emoji: "🔥", name: "想法鉴定所" },
  deathways: { emoji: "💀", name: "死法占卜" },
  headline: { emoji: "📰", name: "融资头条" },
  slogan: { emoji: "🎨", name: "Slogan 对撞机" },
  tarot: { emoji: "🔮", name: "创业塔罗" },
  daily: { emoji: "🏆", name: "成功学日签" },
  jargon: { emoji: "📖", name: "黑话词典" },
};

// --- localStorage helpers ---

export function loadAdventure(): AdventureState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AdventureState;
  } catch {
    return null;
  }
}

export function saveAdventure(state: AdventureState): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function clearAdventure(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}

export function startAdventure(
  sbtiCode: string,
  mbtiType: string,
  profileName: string,
  profileEmoji: string,
  profileNumber: number
): AdventureState {
  const state: AdventureState = {
    sbtiCode,
    mbtiType,
    sbtiProfileName: profileName,
    sbtiProfileEmoji: profileEmoji,
    sbtiProfileNumber: profileNumber,
    route: generateRoute(sbtiCode),
    currentStep: 0,
    stops: {},
    todaySbMeaning: pickRandomSbMeaning(),
    startedAt: new Date().toISOString(),
    version: 1,
  };
  saveAdventure(state);
  return state;
}

export function recordStop(
  product: string,
  summary: string,
  data: Record<string, unknown>
): void {
  const state = loadAdventure();
  if (!state) return;
  state.stops[product] = {
    completedAt: new Date().toISOString(),
    summary,
    data,
  };
  // Advance step if this is the current station
  const idx = state.route.indexOf(product);
  if (idx >= 0 && idx >= state.currentStep) {
    state.currentStep = Math.min(idx + 1, state.route.length);
  }
  saveAdventure(state);
}

export function isAdventureComplete(state: AdventureState): boolean {
  return state.route.every((s) => s in state.stops);
}

export function nextStation(state: AdventureState): string | null {
  for (const s of state.route) {
    if (!(s in state.stops)) return s;
  }
  return null;
}
