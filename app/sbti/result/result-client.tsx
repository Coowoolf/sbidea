"use client";

import { useMemo } from "react";
import Link from "next/link";
import type { Route } from "next";
import { useSearchParams } from "next/navigation";
import { TYPES, findMatches, type TypeMeta } from "@/lib/sbti-v2";

// The only companion currently implemented is 小野, mapped to GOGO.
const IMPLEMENTED_SLUG: Record<string, string> = {
  GOGO: "xiao-ye",
};

export function ResultClient() {
  const params = useSearchParams();
  const code = params.get("code") ?? "HHHH";
  const you = TYPES[code] ?? TYPES.HHHH;
  const matches = useMemo(() => findMatches(code), [code]);

  return (
    <div
      className="min-h-screen"
      style={{
        background: "radial-gradient(circle at 70% 18%, rgba(255,180,80,.14), transparent 55%), #0a0a0a",
        color: "#fff",
      }}
    >
      <div className="mx-auto max-w-2xl px-5 py-10">
        <div className="text-[11px]" style={{ letterSpacing: "0.3em", opacity: 0.55 }}>
          YOUR SBTI
        </div>
        <YouCard meta={you} />

        <div className="mt-10 text-[11px]" style={{ letterSpacing: "0.3em", opacity: 0.55 }}>
          配对推荐
        </div>
        <div className="mt-4 grid gap-4">
          {matches.map((m) => {
            const meta = TYPES[m.code];
            if (!meta) return null;
            const slug = IMPLEMENTED_SLUG[m.code];
            return (
              <MatchCard
                key={m.code}
                meta={meta}
                label={m.label === "similar" ? "类似灵魂" : "互补撒"}
                slug={slug}
              />
            );
          })}
        </div>

        <div className="mt-10 text-center">
          <Link
            href={("/sbti" as Route)}
            className="text-[12px] underline"
            style={{ color: "#f0b56b" }}
          >
            重测一次
          </Link>
        </div>
      </div>
    </div>
  );
}

function YouCard({ meta }: { meta: TypeMeta }) {
  return (
    <div
      className="mt-3 flex items-center gap-4 rounded-2xl p-5"
      style={{
        background: "rgba(255,255,255,.05)",
        border: "1px solid rgba(255,255,255,.1)",
      }}
    >
      <div
        className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full text-4xl"
        style={{ background: `linear-gradient(135deg, ${meta.gradient[0]}, ${meta.gradient[1]})` }}
      >
        {meta.emoji}
      </div>
      <div>
        <div className="text-3xl font-black">{meta.name}</div>
        <div className="mt-1 text-[11px] font-bold" style={{ letterSpacing: "0.15em", opacity: 0.6 }}>
          {meta.code}
        </div>
        <div className="mt-2 text-[14px]" style={{ opacity: 0.9 }}>
          {meta.tagline}
        </div>
      </div>
    </div>
  );
}

function MatchCard({
  meta,
  label,
  slug,
}: {
  meta: TypeMeta;
  label: string;
  slug?: string;
}) {
  const live = Boolean(slug);
  const callHref = (slug
    ? `/gf?slug=${encodeURIComponent(slug)}`
    : "#") as Route;
  return (
    <div
      className="flex items-center gap-3 rounded-xl p-4"
      style={{
        background: "rgba(255,255,255,.04)",
        border: "1px solid rgba(255,255,255,.09)",
      }}
    >
      <div
        className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-2xl"
        style={{ background: `linear-gradient(135deg, ${meta.gradient[0]}, ${meta.gradient[1]})` }}
      >
        {meta.emoji}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <div className="text-lg font-black truncate">{meta.name}</div>
          <span
            className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold"
            style={{ background: "rgba(240,181,107,.15)", color: "#f0b56b", letterSpacing: "0.1em" }}
          >
            {label}
          </span>
        </div>
        <div className="text-[10px] font-bold" style={{ letterSpacing: "0.15em", opacity: 0.55 }}>
          {meta.code}
        </div>
        <div className="mt-1 truncate text-[13px]" style={{ opacity: 0.8 }}>
          {meta.tagline}
        </div>
      </div>
      {live ? (
        <Link
          href={callHref}
          className="shrink-0 rounded-lg px-3 py-2 text-[13px] font-black"
          style={{ background: "#f0b56b", color: "#0a0a0a" }}
        >
          打电话
        </Link>
      ) : (
        <span
          className="shrink-0 rounded-lg px-3 py-2 text-[12px]"
          style={{ background: "rgba(255,255,255,.06)", color: "rgba(255,255,255,.55)" }}
        >
          即将上线
        </span>
      )}
    </div>
  );
}
