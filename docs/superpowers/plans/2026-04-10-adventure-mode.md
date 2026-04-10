# Adventure Mode (创业冒险旅程) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn 10 scattered tools into a guided 5-station journey that ends with a personalized AI success story + shareable card.

**Architecture:** A React context (AdventureProvider) wraps the app, managing journey state in localStorage. Each tool page conditionally renders a progress bar and "next station" CTA. A new `adventure.sbidea.ai` subdomain hosts the journey hub, story generator, and card exporter.

**Tech Stack:** Next.js 16 App Router, React 19 Context, localStorage, AI SDK v6 + Gemini Flash, html2canvas-pro

---

## File Map

| Action | Path | Responsibility |
|--------|------|----------------|
| Create | `lib/adventure.ts` | Types, route generation, localStorage read/write helpers |
| Create | `components/adventure-provider.tsx` | React context provider wrapping the app |
| Create | `components/adventure-bar.tsx` | Progress bar shown at top of tool pages |
| Create | `components/adventure-cta.tsx` | "Next station" CTA shown after tool results |
| Create | `components/adventure-detect.tsx` | SBTI auto-detect floating prompt |
| Create | `app/adventure/page.tsx` | Journey hub: route map + progress |
| Create | `app/adventure/story/page.tsx` | Story page: style picker + rendered story |
| Create | `app/adventure/story/story-client.tsx` | Client component for story generation |
| Create | `app/adventure/card/page.tsx` | Card page: render + image export |
| Create | `app/adventure/card/card-client.tsx` | Client component for card rendering |
| Create | `app/api/adventure-story/route.ts` | AI generates 800-1200 word success story |
| Modify | `app/layout.tsx` | Wrap children with AdventureProvider |
| Modify | `proxy.ts` | adventure subdomain already added |

Tool pages that need data bridge + CTA (modify existing client files):
- `app/generator/generator-client.tsx`
- `app/roast/roast-client.tsx`
- `app/deathways/deathways-client.tsx`
- `app/headline/headline-client.tsx`
- `app/slogan/slogan-client.tsx`
- `app/tarot/tarot-client.tsx`
- `app/daily/daily-client.tsx`
- `app/jargon/jargon-client.tsx`
- `app/sbti/sbti-client.tsx`

---

### Task 1: Adventure state types + localStorage helpers

**Files:**
- Create: `lib/adventure.ts`

- [ ] **Step 1: Create adventure types and route generation**

```ts
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
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add lib/adventure.ts
git commit -m "feat: adventure state types + localStorage helpers + route generation"
```

---

### Task 2: AdventureProvider context + AdventureBar + CTA + detect

**Files:**
- Create: `components/adventure-provider.tsx`
- Create: `components/adventure-bar.tsx`
- Create: `components/adventure-cta.tsx`
- Create: `components/adventure-detect.tsx`

- [ ] **Step 1: Create AdventureProvider**

A React context that loads adventure state from localStorage on mount and exposes it + mutators to all descendants.

```tsx
// components/adventure-provider.tsx
"use client";
import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react";
import {
  loadAdventure, saveAdventure, recordStop as _recordStop,
  type AdventureState,
} from "@/lib/adventure";

type AdventureCtx = {
  adventure: AdventureState | null;
  setAdventure: (s: AdventureState | null) => void;
  recordStop: (product: string, summary: string, data: Record<string, unknown>) => void;
  isActive: boolean;
};

const Ctx = createContext<AdventureCtx>({
  adventure: null, setAdventure: () => {}, recordStop: () => {}, isActive: false,
});

export function AdventureProvider({ children }: { children: ReactNode }) {
  const [adventure, setAdventureRaw] = useState<AdventureState | null>(null);
  useEffect(() => { setAdventureRaw(loadAdventure()); }, []);

  const setAdventure = useCallback((s: AdventureState | null) => {
    setAdventureRaw(s);
    if (s) saveAdventure(s);
  }, []);

  const recordStop = useCallback((product: string, summary: string, data: Record<string, unknown>) => {
    _recordStop(product, summary, data);
    setAdventureRaw(loadAdventure());
  }, []);

  return (
    <Ctx.Provider value={{ adventure, setAdventure, recordStop, isActive: !!adventure }}>
      {children}
    </Ctx.Provider>
  );
}

export function useAdventure() { return useContext(Ctx); }
```

- [ ] **Step 2: Create AdventureBar**

Compact progress bar shown at top of tool pages when adventure is active.

- [ ] **Step 3: Create AdventureCTA**

"Continue adventure → next station" button shown after tool results.

- [ ] **Step 4: Create AdventureDetect**

Floating prompt that asks user to take SBTI if they haven't.

- [ ] **Step 5: Verify TypeScript compiles**

Run: `npx tsc --noEmit`

- [ ] **Step 6: Commit**

```bash
git add components/adventure-*.tsx
git commit -m "feat: adventure UI components (provider, bar, CTA, detect)"
```

---

### Task 3: Wire AdventureProvider into layout + add detect

**Files:**
- Modify: `app/layout.tsx`

- [ ] **Step 1: Wrap children with AdventureProvider and AdventureDetect**

In `app/layout.tsx`, import and wrap `<main>{children}</main>` with the provider. Add AdventureDetect inside the provider.

- [ ] **Step 2: Verify build**

Run: `npx next build`

- [ ] **Step 3: Commit**

```bash
git add app/layout.tsx
git commit -m "feat: wire AdventureProvider + detect into root layout"
```

---

### Task 4: Adventure hub page (adventure.sbidea.ai)

**Files:**
- Create: `app/adventure/page.tsx`
- Create: `app/adventure/adventure-client.tsx`

- [ ] **Step 1: Create adventure hub server page with metadata**

- [ ] **Step 2: Create adventure client component**

Shows:
- If no adventure: "开始创业冒险" hero + brief explanation + start button
- If adventure active: route map with 5 stations, completed stations checked, current highlighted, next station CTA
- If adventure complete: "冒险完成！" + links to story and card

The start button calls `startAdventure()` (requires SBTI data from localStorage — if no SBTI, redirect to sbti.sbidea.ai first).

- [ ] **Step 3: Verify build**

Run: `npx next build`

- [ ] **Step 4: Commit**

```bash
git add app/adventure/
git commit -m "feat: adventure hub page (route map + progress)"
```

---

### Task 5: Data bridge — integrate into existing tool pages

**Files:**
- Modify: all 9 tool client components (generator, roast, deathways, headline, slogan, tarot, daily, jargon, sbti)

- [ ] **Step 1: Add adventure hooks to each tool**

For each tool, when the user gets a result:
1. Call `recordStop(productName, summary, data)` from the adventure context
2. Render `<AdventureCTA />` below the result
3. Render `<AdventureBar />` at the top of the page (if adventure is active)

Each tool passes different summary/data:
- generator: `{ summary: idea.name, data: { name: idea.name, oneLiner: idea.oneLiner, sbScore: idea.sbScore } }`
- roast: `{ summary: "鉴定完成", data: { textLength: text.length } }`
- deathways: `{ summary: oracle.ways[0].title, data: { waysCount: oracle.ways.length } }`
- headline: `{ summary: article.companyName, data: { headline: article.headline, valuation: article.valuation } }`
- slogan: `{ summary: "8 种风格", data: { styles: result.slogans.length } }`
- tarot: `{ summary: cards.join(" → "), data: { overall: reading.overall } }`
- daily: `{ summary: daily.quote, data: { quote: daily.quote } }`
- jargon: `{ summary: "黑话含量 " + result.jargonScore, data: { translation: result.translation, score: result.jargonScore } }`
- sbti: `{ summary: profile.name, data: { code: sbtiCode, mbtiType, number: profile.number, name: profile.name, emoji: profile.emoji } }`

- [ ] **Step 2: Verify build**

Run: `npx next build`

- [ ] **Step 3: Commit**

```bash
git add app/generator/ app/roast/ app/deathways/ app/headline/ app/slogan/ app/tarot/ app/daily/ app/jargon/ app/sbti/
git commit -m "feat: data bridge — all 9 tools write results to adventure state"
```

---

### Task 6: Story generation (API + page)

**Files:**
- Create: `app/api/adventure-story/route.ts`
- Create: `app/adventure/story/page.tsx`
- Create: `app/adventure/story/story-client.tsx`

- [ ] **Step 1: Create story API route**

POST endpoint that takes the full adventure state + chosen style, generates an 800-1200 word story using Gemini Flash.

System prompt includes:
- User's SBTI profile (code, name, strengths, blindspots)
- All stop results (summaries + key data)
- Today's SB meaning
- The chosen narrative style (techcrunch/founder/biography)

Returns: `{ ok: true, story: string }` (plain markdown text)

- [ ] **Step 2: Create story page + client component**

Shows:
- 3 style cards (TechCrunch / 创始人自述 / 传记特写) — user picks one
- Loading state with animation
- Rendered story in article format (like a WeChat public account long-form post)
- "保存图片" button using html2canvas on the story article
- "生成名片" button → links to adventure.sbidea.ai/card

- [ ] **Step 3: Verify build**

Run: `npx next build`

- [ ] **Step 4: Test with dev server**

Run: `npx next dev --port 3456`
Create a mock adventure in localStorage, then visit /adventure/story

- [ ] **Step 5: Commit**

```bash
git add app/api/adventure-story/ app/adventure/story/
git commit -m "feat: AI success story generation (3 styles, 800-1200 words)"
```

---

### Task 7: Card generation page

**Files:**
- Create: `app/adventure/card/page.tsx`
- Create: `app/adventure/card/card-client.tsx`

- [ ] **Step 1: Create card page + client component**

Renders a beautiful minimal card with:
- 创业人格编号 #XX
- emoji + name
- SBTI code × MBTI code
- tagline (from SBTI profile)
- today's SB meaning (watermark)
- sbidea.ai branding

"📸 保存图片" button uses html2canvas to generate PNG.
"📋 分享" uses navigator.share() with the PNG file.

- [ ] **Step 2: Verify build**

Run: `npx next build`

- [ ] **Step 3: Commit**

```bash
git add app/adventure/card/
git commit -m "feat: adventure card — minimal shareable personality card"
```

---

### Task 8: Full integration test + deploy

- [ ] **Step 1: TypeScript check**

Run: `npx tsc --noEmit`

- [ ] **Step 2: Production build**

Run: `npx next build`

- [ ] **Step 3: Dev server QA**

Start dev server, manually walk through:
1. Visit adventure.sbidea.ai → see "start" state
2. Start adventure → redirects to SBTI if needed
3. Complete SBTI → adventure starts with route
4. Visit first station → see AdventureBar at top
5. Complete the station → see AdventureCTA
6. Click "next station" → navigates to next tool
7. Complete all 5 → visit adventure.sbidea.ai → see "complete"
8. Pick story style → AI generates story
9. Visit card page → see card → export PNG

- [ ] **Step 4: Commit everything**

```bash
git add -A
git commit -m "feat: adventure mode complete — guided journey + story + card"
```

- [ ] **Step 5: Push + deploy**

```bash
git push origin main
```

Auto-deploy to Vercel. Verify adventure.sbidea.ai loads.
