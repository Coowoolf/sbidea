"use client";

import { useRef, useState } from "react";
import { useAdventure } from "@/components/adventure-provider";
import {
  isAdventureComplete,
  type AdventureState,
  type StoryStyle,
} from "@/lib/adventure";

type StoryState =
  | { status: "pick" }
  | { status: "streaming"; text: string }
  | { status: "done"; text: string }
  | { status: "error"; message: string };

const STYLES: {
  key: StoryStyle;
  emoji: string;
  title: string;
  desc: string;
}[] = [
  {
    key: "techcrunch",
    emoji: "\uD83D\uDCF0",
    title: "TechCrunch \u62A5\u9053\u4F53",
    desc: "\u4ECE\u672A\u6765\u7A7F\u8D8A\u56DE\u6765\u7684\u878D\u8D44\u65B0\u95FB",
  },
  {
    key: "founder",
    emoji: "\uD83D\uDCDD",
    title: "\u521B\u59CB\u4EBA\u81EA\u8FF0\u4F53",
    desc: "\u7B2C\u4E00\u4EBA\u79F0\uFF0C\u50CF YC \u521B\u59CB\u4EBA\u7684 blog",
  },
  {
    key: "biography",
    emoji: "\uD83D\uDCD6",
    title: "\u4F20\u8BB0\u7279\u5199\u4F53",
    desc: "\u7B2C\u4E09\u4EBA\u79F0\u4EBA\u7269\u6742\u5FD7\u7279\u5199",
  },
];

export function StoryClient() {
  const { adventure } = useAdventure();

  // Guard: no adventure or not complete
  if (!adventure || !isAdventureComplete(adventure)) {
    return (
      <div className="sb-card p-8 text-center">
        <p className="text-xl font-black mb-2">
          {"\uD83D\uDEA7"} \u8FD8\u6CA1\u6709\u5B8C\u6210\u5192\u9669\u65C5\u7A0B
        </p>
        <p className="text-[color:var(--color-muted)] mb-6">
          \u5B8C\u6210\u6240\u6709 5 \u7AD9\u63A2\u7D22\u540E\uFF0C\u5C31\u80FD\u89E3\u9501\u4F60\u7684\u4E13\u5C5E\u6210\u529F\u6545\u4E8B\u3002
        </p>
        <a href="/adventure" className="sb-btn inline-block">
          {"\uD83C\uDF0D"} \u8FD4\u56DE\u5192\u9669\u5730\u56FE
        </a>
      </div>
    );
  }

  return <StoryFlow adventure={adventure} />;
}

/** Main story flow — only renders when adventure is complete. */
function StoryFlow({ adventure }: { adventure: AdventureState }) {
  const [state, setState] = useState<StoryState>({ status: "pick" });
  const [selectedStyle, setSelectedStyle] = useState<StoryStyle | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const articleRef = useRef<HTMLDivElement>(null);

  async function handleGenerate(style: StoryStyle) {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setSelectedStyle(style);
    setState({ status: "streaming", text: "" });

    try {
      const res = await fetch("/api/adventure-story", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sbtiCode: adventure.sbtiCode,
          mbtiType: adventure.mbtiType,
          profileName: adventure.sbtiProfileName,
          profileEmoji: adventure.sbtiProfileEmoji,
          profileNumber: adventure.sbtiProfileNumber,
          style,
          todaySbMeaning: adventure.todaySbMeaning,
          stops: adventure.stops,
        }),
        signal: controller.signal,
      });

      if (!res.ok) {
        const errText = await res.text();
        setState({
          status: "error",
          message: errText || "\u6545\u4E8B\u751F\u6210\u5931\u8D25",
        });
        return;
      }

      const reader = res.body?.getReader();
      if (!reader) {
        setState({
          status: "error",
          message: "\u6D4F\u89C8\u5668\u4E0D\u652F\u6301\u6D41\u5F0F\u54CD\u5E94",
        });
        return;
      }

      const decoder = new TextDecoder();
      let acc = "";
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        setState({ status: "streaming", text: acc });
      }
      acc += decoder.decode();
      setState({ status: "done", text: acc });
    } catch (err) {
      if ((err as { name?: string } | null)?.name === "AbortError") return;
      setState({
        status: "error",
        message:
          err instanceof Error
            ? err.message
            : "\u6545\u4E8B\u751F\u6210\u5931\u8D25\uFF0C\u8BF7\u7A0D\u540E\u518D\u8BD5",
      });
    }
  }

  function handleRetry() {
    setSelectedStyle(null);
    setState({ status: "pick" });
  }

  async function handleSaveImage() {
    const el = articleRef.current;
    if (!el) return;

    try {
      const { default: html2canvas } = await import("html2canvas-pro");
      const canvas = await html2canvas(el, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#fffdf5",
      });
      const dataUrl = canvas.toDataURL("image/png");

      // Try native share (mobile)
      if (typeof navigator !== "undefined" && navigator.share) {
        const blob = await (await fetch(dataUrl)).blob();
        const file = new File(
          [blob],
          `story-${adventure.sbtiCode}-${adventure.sbtiProfileNumber}.png`,
          { type: "image/png" },
        );
        try {
          await navigator.share({
            title: `\u521B\u4E1A\u6210\u529F\u6545\u4E8B \u00B7 #${adventure.sbtiProfileNumber} ${adventure.sbtiProfileName}`,
            files: [file],
          });
          return;
        } catch {
          /* share cancelled or unsupported, fall through to download */
        }
      }

      // Fallback: download
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = `story-${adventure.sbtiCode}-${adventure.sbtiProfileNumber}.png`;
      a.click();
    } catch {
      alert("\u56FE\u7247\u4FDD\u5B58\u5931\u8D25\uFF0C\u8BF7\u622A\u56FE\u4FDD\u5B58");
    }
  }

  const streamingText =
    state.status === "streaming" || state.status === "done" ? state.text : "";

  return (
    <div className="space-y-8">
      {/* Header */}
      <header>
        <div className="sb-stamp mb-4">
          \u5192\u9669\u7EC8\u7AD9 \u00B7 \u793C\u7269 1/2
        </div>
        <h1 className="text-3xl font-black md:text-4xl">
          {adventure.sbtiProfileEmoji}{" "}
          \u4F60\u7684\u521B\u4E1A\u6210\u529F\u6545\u4E8B
        </h1>
        <p className="mt-2 text-[color:var(--color-muted)]">
          \u57FA\u4E8E\u4F60\u7684\u521B\u4E1A\u4EBA\u683C\u548C\u5192\u9669\u4E2D\u7684\u6BCF\u4E00\u7AD9\u6536\u83B7\uFF0CAI
          \u4E3A\u4F60\u7F16\u7EC7\u4E00\u7BC7\u672A\u6765\u53D9\u4E8B\u3002
        </p>
      </header>

      {/* Style picker */}
      {state.status === "pick" && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold">
            \u9009\u62E9\u4F60\u559C\u6B22\u7684\u6587\u98CE
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {STYLES.map((s) => (
              <button
                key={s.key}
                type="button"
                onClick={() => handleGenerate(s.key)}
                className="sb-card p-5 text-left transition-transform hover:scale-[1.02] hover:border-[color:var(--color-accent)] active:scale-[0.98]"
              >
                <div className="text-3xl mb-2">{s.emoji}</div>
                <div className="font-black text-base mb-1">{s.title}</div>
                <div className="text-sm text-[color:var(--color-muted)]">
                  {s.desc}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Error */}
      {state.status === "error" && (
        <div className="sb-card border-[color:var(--color-accent)] p-6 text-[color:var(--color-accent)]">
          <p className="mb-3">{"\u26A0\uFE0F"} {state.message}</p>
          <button
            type="button"
            onClick={handleRetry}
            className="sb-btn sb-btn-ghost"
          >
            \u91CD\u8BD5
          </button>
        </div>
      )}

      {/* Streaming / Done */}
      {(state.status === "streaming" || state.status === "done") && (
        <>
          {state.status === "streaming" && (
            <div className="flex items-center gap-2 text-sm font-bold text-[color:var(--color-accent)]">
              <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-[color:var(--color-accent)]" />
              {selectedStyle === "techcrunch"
                ? "TechCrunch \u8BB0\u8005\u6B63\u5728\u64B0\u7A3F\u2026"
                : selectedStyle === "founder"
                  ? "\u521B\u59CB\u4EBA\u6B63\u5728\u56DE\u5FC6\u2026"
                  : "\u7279\u7A3F\u4F5C\u5BB6\u6B63\u5728\u4E66\u5199\u2026"}
            </div>
          )}

          {/* Article */}
          <article
            ref={articleRef}
            className="sb-card slide-up overflow-hidden"
          >
            {/* Article inner with WeChat-style padding */}
            <div className="px-6 py-8 md:px-10 md:py-12">
              <StoryMarkdown text={streamingText} />
              {state.status === "streaming" && (
                <span className="ml-0.5 inline-block h-5 w-1.5 animate-pulse bg-[color:var(--color-ink)] align-middle" />
              )}
            </div>
          </article>

          {/* Action buttons — only when done */}
          {state.status === "done" && (
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handleSaveImage}
                className="sb-btn"
              >
                {"\uD83D\uDCF8"} \u4FDD\u5B58\u56FE\u7247
              </button>
              <a href="/adventure/card" className="sb-btn sb-btn-ghost">
                {"\uD83E\uDEA7"} \u751F\u6210\u540D\u7247
              </a>
              <button
                type="button"
                onClick={handleRetry}
                className="sb-btn sb-btn-ghost"
              >
                {"\uD83D\uDD04"} \u6362\u4E00\u79CD\u6587\u98CE
              </button>
            </div>
          )}
        </>
      )}

      {/* Style tag — shown below during streaming/done */}
      {selectedStyle && state.status !== "pick" && state.status !== "error" && (
        <div className="text-xs text-[color:var(--color-muted)]">
          \u6587\u98CE\uFF1A{STYLES.find((s) => s.key === selectedStyle)?.title}
        </div>
      )}
    </div>
  );
}

/**
 * Minimal markdown renderer for the story.
 * Handles: ## headings, > blockquotes, **bold**, ---, paragraphs.
 * Same approach as RoastMarkdown — split by double newline.
 */
function StoryMarkdown({ text }: { text: string }) {
  if (!text) {
    return (
      <div className="text-[color:var(--color-muted)]">
        \u6B63\u5728\u8FDE\u63A5 AI \u5199\u624B\u2026
      </div>
    );
  }

  const blocks = text.split(/\n\s*\n/);

  return (
    <div className="space-y-5 leading-[1.9] text-[0.97rem]">
      {blocks.map((block, i) => {
        const trimmed = block.trim();
        if (!trimmed) return null;

        // --- horizontal rule
        if (/^-{3,}$/.test(trimmed)) {
          return (
            <hr
              key={i}
              className="my-6 border-t-2 border-[color:var(--color-ink)] opacity-10"
            />
          );
        }

        // ## Heading
        if (trimmed.startsWith("## ")) {
          return (
            <h3
              key={i}
              className="text-xl font-black tracking-tight md:text-2xl mt-8 mb-2"
            >
              {trimmed.replace(/^##\s+/, "")}
            </h3>
          );
        }

        // # Heading
        if (trimmed.startsWith("# ")) {
          return (
            <h2
              key={i}
              className="text-2xl font-black md:text-3xl mt-6 mb-3"
            >
              {trimmed.replace(/^#\s+/, "")}
            </h2>
          );
        }

        // > Blockquote (may span multiple lines)
        if (trimmed.startsWith("> ")) {
          const quoteText = trimmed
            .split("\n")
            .map((line) => line.replace(/^>\s?/, ""))
            .join("\n");
          return (
            <blockquote
              key={i}
              className="border-l-4 border-[color:var(--color-accent)] pl-4 italic text-[color:var(--color-muted)]"
            >
              <InlineBold text={quoteText} />
            </blockquote>
          );
        }

        // Regular paragraph — first block gets drop cap style
        return (
          <p
            key={i}
            className={
              i === 0
                ? "first-letter:text-4xl first-letter:font-black first-letter:leading-none first-letter:float-left first-letter:mr-1.5 first-letter:mt-1"
                : ""
            }
          >
            <InlineBold text={trimmed} />
          </p>
        );
      })}
    </div>
  );
}

/** Renders **bold** inline segments */
function InlineBold({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return (
            <strong key={i} className="font-black">
              {part.slice(2, -2)}
            </strong>
          );
        }
        return <span key={i}>{part}</span>;
      })}
    </>
  );
}
