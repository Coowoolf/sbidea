"use client";

import { useEffect, useRef, useState } from "react";
import type { FakeArticle } from "../api/headline/route";
import { useAdventure } from "@/components/adventure-provider";
import { AdventureBar } from "@/components/adventure-bar";
import { AdventureCTA } from "@/components/adventure-cta";

type State =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "success"; article: FakeArticle };

export function HeadlineClient() {
  const [idea, setIdea] = useState("");
  const [state, setState] = useState<State>({ status: "idle" });
  const { recordStop } = useAdventure();
  const stoppedRef = useRef(false);

  // Pre-fill idea from URL params (Roast → Headline via ?idea=...)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ideaParam = params.get("idea");
    if (ideaParam && !idea) {
      setIdea(ideaParam.slice(0, 400)); // respect the 400 char limit
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // only on mount

  useEffect(() => {
    if (state.status === "success" && !stoppedRef.current) {
      stoppedRef.current = true;
      recordStop("headline", state.article.companyName, {
        headline: state.article.headline,
        valuation: state.article.valuation,
      });
    }
    if (state.status !== "success") {
      stoppedRef.current = false;
    }
  }, [state, recordStop]);

  async function handleGenerate() {
    const cleaned = idea.trim();
    if (!cleaned) return;
    setState({ status: "loading" });
    try {
      const res = await fetch("/api/headline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idea: cleaned }),
      });
      const data = (await res.json()) as
        | { ok: true; article: FakeArticle }
        | { ok: false; error: string };
      if (!data.ok) {
        setState({ status: "error", message: data.error });
        return;
      }
      setState({ status: "success", article: data.article });
    } catch (err) {
      setState({
        status: "error",
        message: err instanceof Error ? err.message : "网络异常",
      });
    }
  }

  async function handleShare() {
    if (state.status !== "success") return;
    const a = state.article;
    const text = [
      a.headline,
      a.subheadline,
      ``,
      a.dateline,
      a.leadParagraph,
      ``,
      `"${a.founderQuote}" —— ${a.companyName} 创始人`,
      ``,
      `来自 SB 融资头条 https://sbidea.ai/headline`,
    ].join("\n");
    try {
      if (typeof navigator !== "undefined" && navigator.share) {
        await navigator.share({ title: a.headline, text });
        return;
      }
      await navigator.clipboard.writeText(text);
      alert("已复制到剪贴板");
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="space-y-6">
      <AdventureBar />
      <div className="sb-card p-6">
        <label
          htmlFor="idea"
          className="mb-2 block text-sm font-bold uppercase tracking-wide text-[color:var(--color-muted)]"
        >
          你的点子（400 字以内）
        </label>
        <textarea
          id="idea"
          rows={5}
          maxLength={400}
          value={idea}
          onChange={(e) => setIdea(e.target.value)}
          placeholder="例如：一个 App，让用户给路边野猫发红包，系统自动找志愿者喂猫并拍照反馈。"
          className="w-full resize-none rounded-lg border-2 border-[color:var(--color-ink)] bg-transparent px-4 py-3 text-base outline-none focus:bg-white"
        />
        <div className="mt-1 text-right text-xs text-[color:var(--color-muted)]">
          {idea.length} / 400
        </div>
        <div className="mt-4 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handleGenerate}
            disabled={state.status === "loading" || !idea.trim()}
            className="sb-btn disabled:cursor-not-allowed disabled:opacity-60"
          >
            {state.status === "loading"
              ? "记者正在编…"
              : "📰 生成融资新闻"}
          </button>
          {state.status === "success" && (
            <>
              <button
                type="button"
                onClick={handleGenerate}
                className="sb-btn sb-btn-ghost"
              >
                🔁 换一个写法
              </button>
              <button
                type="button"
                onClick={handleShare}
                className="sb-btn sb-btn-ghost"
              >
                📋 复制 / 分享
              </button>
            </>
          )}
        </div>
      </div>

      {state.status === "error" && (
        <div className="sb-card border-[color:var(--color-accent)] p-6 text-[color:var(--color-accent)]">
          ⚠️ {state.message}
        </div>
      )}

      {state.status === "success" && <ArticleView article={state.article} />}

      {state.status === "success" && <AdventureCTA product="headline" />}
    </div>
  );
}

function ArticleView({ article }: { article: FakeArticle }) {
  return (
    <article className="sb-card slide-up p-6 md:p-10">
      <div className="mb-1 text-xs font-bold uppercase tracking-wide text-[color:var(--color-accent)]">
        SB 融资头条 · 独家报道
      </div>
      <h1 className="mt-1 text-3xl font-black leading-tight md:text-4xl">
        {article.headline}
      </h1>
      <p className="mt-2 text-lg text-[color:var(--color-muted)]">
        {article.subheadline}
      </p>
      <div className="mt-4 border-y-2 border-[color:var(--color-line)] py-3 text-sm text-[color:var(--color-muted)]">
        {article.dateline}
      </div>

      <p className="mt-4 text-[1.02rem] leading-relaxed first-letter:text-4xl first-letter:font-black first-letter:mr-1">
        {article.leadParagraph}
      </p>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 md:grid-cols-3">
        {article.fakeMetrics.map((m) => (
          <div
            key={m}
            className="rounded-lg border-2 border-[color:var(--color-line)] bg-[color:var(--color-paper)] p-3 text-sm"
          >
            📈 {m}
          </div>
        ))}
      </div>

      <div className="mt-6 space-y-4 leading-relaxed">
        {article.body.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>

      <blockquote className="mt-6 border-l-4 border-[color:var(--color-accent)] pl-4 italic">
        &ldquo;{article.founderQuote}&rdquo;
        <footer className="mt-1 text-sm not-italic text-[color:var(--color-muted)]">
          —— {article.companyName} 创始人
        </footer>
      </blockquote>

      <blockquote className="mt-4 border-l-4 border-[color:var(--color-ink)] pl-4 italic">
        &ldquo;{article.investorQuote}&rdquo;
        <footer className="mt-1 text-sm not-italic text-[color:var(--color-muted)]">
          —— {article.leadInvestor} 合伙人
        </footer>
      </blockquote>

      <div className="mt-8 grid gap-2 rounded-xl border-2 border-[color:var(--color-line)] bg-[color:var(--color-paper)] p-4 text-sm md:grid-cols-4">
        <Stat label="公司" value={article.companyName} />
        <Stat label="轮次" value={article.fundingStage} />
        <Stat label="金额" value={article.fundingAmount} />
        <Stat label="估值" value={article.valuation} />
      </div>

      <div className="mt-6 text-xs text-[color:var(--color-muted)]">
        * 本文由 AI 生成，所有机构、数据、人名均为虚构，仅供娱乐与自 high。
      </div>
    </article>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[10px] font-bold uppercase tracking-wide text-[color:var(--color-muted)]">
        {label}
      </div>
      <div className="font-black">{value}</div>
    </div>
  );
}
