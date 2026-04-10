"use client";

import { useState, useEffect, useCallback } from "react";
import { productUrl } from "@/lib/urls";
import { SB_MEANINGS } from "@/lib/sb-meanings";
import {
  loadAdventure,
  clearAdventure,
  startAdventure,
  pickRandomSbMeaning,
  isAdventureComplete,
  nextStation,
  STATION_LABELS,
  type AdventureState,
} from "@/lib/adventure";

/* -------------------------------------------------------------------------- */
/* Constants                                                                   */
/* -------------------------------------------------------------------------- */

const SBTI_STORAGE_KEY = "sbidea-sbti";

type SbtiData = {
  sbtiCode: string;
  mbtiType: string;
  profileName: string;
  profileEmoji: string;
  profileNumber: number;
};

function loadSbtiData(): SbtiData | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(SBTI_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed.sbtiCode) return null;
    return {
      sbtiCode: parsed.sbtiCode,
      mbtiType: parsed.mbtiType ?? "UNKNOWN",
      profileName: parsed.profileName ?? parsed.sbtiCode,
      profileEmoji: parsed.profileEmoji ?? "🧠",
      profileNumber: parsed.profileNumber ?? 0,
    };
  } catch {
    return null;
  }
}

/* -------------------------------------------------------------------------- */
/* Client component                                                            */
/* -------------------------------------------------------------------------- */

export function AdventureClient() {
  const [adventure, setAdventure] = useState<AdventureState | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [sbMeaning, setSbMeaning] = useState("");

  // Load adventure state from localStorage on mount
  useEffect(() => {
    setAdventure(loadAdventure());
    setSbMeaning(pickRandomSbMeaning());
    setLoaded(true);
  }, []);

  const handleStart = useCallback(() => {
    const sbti = loadSbtiData();
    if (!sbti) {
      // Redirect to SBTI to take the test first
      window.location.href = productUrl("sbti");
      return;
    }
    const state = startAdventure(
      sbti.sbtiCode,
      sbti.mbtiType,
      sbti.profileName,
      sbti.profileEmoji,
      sbti.profileNumber,
    );
    setAdventure(state);
  }, []);

  const handleReset = useCallback(() => {
    clearAdventure();
    setAdventure(null);
    setSbMeaning(pickRandomSbMeaning());
  }, []);

  // Don't render until localStorage is loaded (avoid hydration mismatch)
  if (!loaded) return null;

  // State C: Adventure complete
  if (adventure && isAdventureComplete(adventure)) {
    return <CompleteView adventure={adventure} onReset={handleReset} />;
  }

  // State B: Adventure active
  if (adventure) {
    return <ActiveView adventure={adventure} sbMeaning={sbMeaning} />;
  }

  // State A: No adventure
  return <HeroView sbMeaning={sbMeaning} onStart={handleStart} />;
}

/* -------------------------------------------------------------------------- */
/* State A: Hero / No Adventure                                                */
/* -------------------------------------------------------------------------- */

function HeroView({
  sbMeaning,
  onStart,
}: {
  sbMeaning: string;
  onStart: () => void;
}) {
  return (
    <div className="slide-up">
      <header className="mb-10 text-center">
        <div className="sb-stamp wobble mb-4 inline-block">冒险模式</div>
        <h1 className="text-4xl font-black md:text-5xl">
          开始你的创业冒险
        </h1>
        <p className="mt-4 text-lg text-[color:var(--color-muted)]">
          一条专属于你的创业自我发现之旅：
          <strong>12 题人格测试</strong> →{" "}
          <strong>5 站个性化探索</strong> →{" "}
          <strong>双重礼物</strong>
        </p>
        <div className="mt-3 flex flex-wrap justify-center gap-3 text-sm text-[color:var(--color-muted)]">
          <span className="rounded-full border px-3 py-1">🧠 SBTI 人格测试</span>
          <span className="rounded-full border px-3 py-1">🗺️ 5 站探索路线</span>
          <span className="rounded-full border px-3 py-1">📖 AI 成功故事</span>
          <span className="rounded-full border px-3 py-1">🪪 创业名片</span>
        </div>
      </header>

      {/* Today's SB meaning */}
      <div className="sb-card mb-8 text-center">
        <div className="text-xs font-semibold uppercase tracking-widest text-[color:var(--color-muted)]">
          今日 SB 定义
        </div>
        <div className="mt-2 text-lg font-bold">{sbMeaning}</div>
      </div>

      {/* Journey overview */}
      <div className="sb-card mb-8">
        <h2 className="mb-4 text-xl font-black">冒险流程</h2>
        <ol className="space-y-3 text-[color:var(--color-muted)]">
          <li className="flex items-start gap-3">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 border-[color:var(--color-ink)] text-sm font-bold text-[color:var(--color-ink)]">
              1
            </span>
            <span>
              <strong className="text-[color:var(--color-ink)]">人格测试</strong>{" "}
              — 12 道创业人格题 + MBTI 融合，生成你的专属画像
            </span>
          </li>
          <li className="flex items-start gap-3">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 border-[color:var(--color-ink)] text-sm font-bold text-[color:var(--color-ink)]">
              2
            </span>
            <span>
              <strong className="text-[color:var(--color-ink)]">5 站探索</strong>{" "}
              — 根据你的人格类型，推荐最适合你的 5 个创业工具
            </span>
          </li>
          <li className="flex items-start gap-3">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 border-[color:var(--color-ink)] text-sm font-bold text-[color:var(--color-ink)]">
              3
            </span>
            <span>
              <strong className="text-[color:var(--color-ink)]">双重礼物</strong>{" "}
              — AI 生成你的未来成功故事 + 极简创业名片
            </span>
          </li>
        </ol>
      </div>

      <div className="text-center">
        <button onClick={onStart} className="sb-btn text-lg px-8 py-3">
          🚀 开始冒险
        </button>
        <p className="mt-3 text-sm text-[color:var(--color-muted)]">
          可随时中断，下次回来继续 · 数据保存在你的浏览器中
        </p>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* State B: Active Adventure                                                   */
/* -------------------------------------------------------------------------- */

function ActiveView({
  adventure,
  sbMeaning,
}: {
  adventure: AdventureState;
  sbMeaning: string;
}) {
  const completedCount = adventure.route.filter(
    (s) => s in adventure.stops,
  ).length;
  const current = nextStation(adventure);

  return (
    <div className="slide-up">
      <header className="mb-8">
        <div className="sb-stamp wobble mb-4">冒险进行中</div>
        <h1 className="text-3xl font-black md:text-4xl">
          {adventure.sbtiProfileEmoji} {adventure.sbtiProfileName} 的冒险路线
        </h1>
        <p className="mt-2 text-[color:var(--color-muted)]">
          {adventure.todaySbMeaning}
        </p>
      </header>

      {/* Progress bar */}
      <div className="sb-card mb-8">
        <div className="flex items-center justify-between text-sm font-semibold">
          <span>冒险进度</span>
          <span>{completedCount}/5 站完成</span>
        </div>
        <div className="mt-2 h-3 overflow-hidden rounded-full border-2 border-[color:var(--color-ink)] bg-[color:var(--color-paper)]">
          <div
            className="h-full bg-[color:var(--color-accent)] transition-all duration-500"
            style={{ width: `${(completedCount / 5) * 100}%` }}
          />
        </div>
      </div>

      {/* Route map — vertical timeline */}
      <div className="relative space-y-0">
        {adventure.route.map((stationId, idx) => {
          const label = STATION_LABELS[stationId] ?? {
            emoji: "📍",
            name: stationId,
          };
          const isCompleted = stationId in adventure.stops;
          const isCurrent = stationId === current;
          const stop = adventure.stops[stationId];

          return (
            <div key={stationId} className="relative flex gap-4">
              {/* Timeline line */}
              <div className="flex flex-col items-center">
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 text-lg ${
                    isCompleted
                      ? "border-[color:var(--color-accent)] bg-[color:var(--color-accent)] text-white"
                      : isCurrent
                        ? "border-[color:var(--color-ink)] bg-[color:var(--color-ink)] text-[color:var(--color-paper)]"
                        : "border-[color:var(--color-line)] text-[color:var(--color-muted)]"
                  }`}
                >
                  {isCompleted ? "✅" : isCurrent ? label.emoji : "○"}
                </div>
                {idx < adventure.route.length - 1 && (
                  <div
                    className={`w-0.5 grow ${
                      isCompleted
                        ? "bg-[color:var(--color-accent)]"
                        : "bg-[color:var(--color-line)]"
                    }`}
                    style={{ minHeight: "2rem" }}
                  />
                )}
              </div>

              {/* Card */}
              <div
                className={`sb-card mb-4 flex-1 ${
                  isCurrent ? "border-[color:var(--color-ink)] border-2" : ""
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">{label.emoji}</span>
                  <span className="font-bold">{label.name}</span>
                  <span className="ml-auto text-sm text-[color:var(--color-muted)]">
                    第 {idx + 1} 站
                  </span>
                </div>
                {isCompleted && stop && (
                  <p className="mt-2 text-sm text-[color:var(--color-muted)]">
                    {stop.summary}
                  </p>
                )}
                {isCurrent && (
                  <a
                    href={productUrl(stationId)}
                    className="sb-btn mt-3 inline-block text-sm"
                  >
                    前往 {label.name} →
                  </a>
                )}
                {!isCompleted && !isCurrent && (
                  <p className="mt-2 text-sm text-[color:var(--color-muted)]">
                    等待解锁
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* State C: Adventure Complete                                                 */
/* -------------------------------------------------------------------------- */

function CompleteView({
  adventure,
  onReset,
}: {
  adventure: AdventureState;
  onReset: () => void;
}) {
  return (
    <div className="slide-up">
      <header className="mb-10 text-center">
        <div className="sb-stamp wobble mb-4 inline-block">冒险完成</div>
        <h1 className="text-4xl font-black md:text-5xl">
          🎉 冒险完成！
        </h1>
        <p className="mt-3 text-lg text-[color:var(--color-muted)]">
          {adventure.sbtiProfileEmoji} {adventure.sbtiProfileName}，你已走完全部 5 站。
        </p>
        <p className="mt-1 text-sm text-[color:var(--color-muted)]">
          {adventure.todaySbMeaning}
        </p>
      </header>

      {/* Station summary */}
      <div className="sb-card mb-8">
        <h2 className="mb-4 text-xl font-black">旅途回顾</h2>
        <ul className="space-y-3">
          {adventure.route.map((stationId, idx) => {
            const label = STATION_LABELS[stationId] ?? {
              emoji: "📍",
              name: stationId,
            };
            const stop = adventure.stops[stationId];
            return (
              <li key={stationId} className="flex items-start gap-3">
                <span className="text-lg">{label.emoji}</span>
                <div>
                  <div className="font-bold">
                    第 {idx + 1} 站 · {label.name}
                  </div>
                  {stop && (
                    <p className="text-sm text-[color:var(--color-muted)]">
                      {stop.summary}
                    </p>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Gift CTAs */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2">
        <a href="/story" className="sb-card group block text-center">
          <div className="text-4xl">🎁</div>
          <div className="mt-2 text-lg font-black group-hover:underline">
            生成你的成功故事
          </div>
          <p className="mt-1 text-sm text-[color:var(--color-muted)]">
            AI 根据旅途数据，写一篇属于你的未来成功报道
          </p>
        </a>
        <a href="/card" className="sb-card group block text-center">
          <div className="text-4xl">🪪</div>
          <div className="mt-2 text-lg font-black group-hover:underline">
            生成你的创业名片
          </div>
          <p className="mt-1 text-sm text-[color:var(--color-muted)]">
            极简社交名片，展示你的创业人格
          </p>
        </a>
      </div>

      {/* Reset */}
      <div className="text-center">
        <button onClick={onReset} className="sb-btn-ghost">
          🔄 重新冒险
        </button>
        <p className="mt-2 text-xs text-[color:var(--color-muted)]">
          重置将清除当前冒险数据，重新开始一段全新旅程
        </p>
      </div>
    </div>
  );
}
