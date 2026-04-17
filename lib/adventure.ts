// lib/adventure.ts — types, route map, cross-subdomain cookie storage

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

const COOKIE_NAME = "sbidea-adventure";
const STORY_LOCAL_KEY = "sbidea-adventure-story";
const DISMISS_COOKIE = "sbidea-detect-dismissed";
const COOKIE_MAX_AGE = 30 * 24 * 60 * 60; // 30 days

// 16 SBTI types → 5 recommended stations (from 10 tools)
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

// --- cross-subdomain cookie helpers ---

function isProdHost(): boolean {
  if (typeof window === "undefined") return false;
  const h = window.location.hostname;
  return h === "sbidea.ai" || h.endsWith(".sbidea.ai");
}

function cookieDomainSuffix(): string {
  // On prod: share across all *.sbidea.ai subdomains.
  // On localhost: no domain → cookie scoped to origin.
  return isProdHost() ? "; domain=.sbidea.ai" : "";
}

function setCookie(name: string, value: string, maxAgeSec = COOKIE_MAX_AGE): void {
  if (typeof document === "undefined") return;
  const encoded = encodeURIComponent(value);
  document.cookie =
    `${name}=${encoded}; path=/; max-age=${maxAgeSec}; SameSite=Lax` +
    cookieDomainSuffix();
}

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const prefix = `${name}=`;
  for (const part of document.cookie.split("; ")) {
    if (part.startsWith(prefix)) {
      try {
        return decodeURIComponent(part.slice(prefix.length));
      } catch {
        return null;
      }
    }
  }
  return null;
}

function deleteCookie(name: string): void {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=; path=/; max-age=0` + cookieDomainSuffix();
}

// --- adventure state storage ---

export function loadAdventure(): AdventureState | null {
  if (typeof window === "undefined") return null;
  const raw = getCookie(COOKIE_NAME);
  if (!raw) return null;
  try {
    const core = JSON.parse(raw) as AdventureState;
    // Story is kept in localStorage (too large for cookie budget).
    // It only matters on the adventure subdomain where it was written.
    try {
      const story = localStorage.getItem(STORY_LOCAL_KEY);
      if (story) core.story = JSON.parse(story);
    } catch {
      // ignore
    }
    return core;
  } catch {
    return null;
  }
}

export function saveAdventure(state: AdventureState): void {
  if (typeof window === "undefined") return;
  // Strip story from the cookie payload (4KB budget).
  const { story, ...core } = state;
  setCookie(COOKIE_NAME, JSON.stringify(core));
  if (story) {
    try {
      localStorage.setItem(STORY_LOCAL_KEY, JSON.stringify(story));
    } catch {
      // ignore storage full
    }
  }
}

export function clearAdventure(): void {
  if (typeof window === "undefined") return;
  deleteCookie(COOKIE_NAME);
  try {
    localStorage.removeItem(STORY_LOCAL_KEY);
  } catch {
    // ignore
  }
}

// --- detect-prompt dismiss flag (also cross-subdomain) ---

export function isDetectDismissed(): boolean {
  return getCookie(DISMISS_COOKIE) === "1";
}

export function markDetectDismissed(): void {
  setCookie(DISMISS_COOKIE, "1");
}

// --- lifecycle helpers ---

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
  // Advance step if this is at or after the current station
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

// --- pre-fill helpers (used by downstream stations) ---

/**
 * Returns the idea text generated in the generator stop, if any.
 * Format: "Name — one-liner"
 */
export function getIdeaFromState(state: AdventureState | null): string | null {
  if (!state) return null;
  const gen = state.stops.generator;
  if (!gen) return null;
  const name = typeof gen.data.name === "string" ? gen.data.name : null;
  const oneLiner =
    typeof gen.data.oneLiner === "string" ? gen.data.oneLiner : null;
  if (name && oneLiner) return `${name} — ${oneLiner}`;
  if (name) return name;
  return gen.summary || null;
}
