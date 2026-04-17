"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import type { Route } from "next";
import { getGf, type Gf } from "@/lib/gfs";
import { parseTaggedLine, topEmotions, aggregateEmotionMix } from "@/lib/transcript";
import { StreamMessageParser } from "@/lib/stream-message-parser";

type Line = {
  who: "gf" | "me";
  turnId: number;
  body: string;
  tags: string[];
  status: "in_progress" | "end" | "interrupted";
  ts: number;
};

export function CallClient() {
  const router = useRouter();
  const params = useSearchParams();
  const slug = params.get("slug") ?? "";
  const channel = params.get("channel") ?? "";
  const uidStr = params.get("uid") ?? "";

  const gf = useMemo<Gf | null>(() => (slug ? getGf(slug) : null), [slug]);

  const [phase, setPhase] = useState<"connecting" | "live" | "ending">("connecting");
  const [lines, setLines] = useState<Line[]>([]);
  const [allTags, setAllTags] = useState<string[]>([]);
  const [muted, setMuted] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [err, setErr] = useState<string | null>(null);

  const handleRef = useRef<Awaited<ReturnType<typeof import("@/lib/agora-web")["joinChannel"]>> | null>(null);

  useEffect(() => {
    if (!slug || !channel || !uidStr) {
      router.replace("/gf" as Route);
    }
  }, [slug, channel, uidStr, router]);

  useEffect(() => {
    if (phase !== "live") return;
    const t = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(t);
  }, [phase]);

  // 5-minute hard session cap — mirrors timeout=300 on the agent side.
  useEffect(() => {
    if (phase !== "live") return;
    if (elapsed < 300) return;
    hangup();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, elapsed]);

  useEffect(() => {
    if (!slug || !channel || !uidStr || !gf) return;
    // Generate a fresh uid per mount so React's strict-mode double-mount
    // in dev doesn't trigger UID_CONFLICT when the first mount's leave()
    // hasn't finished before the second mount's join().
    const uid = Math.floor(Math.random() * 900_000_000) + 1000;
    const AGENT_UID = 2001;
    const parser = new StreamMessageParser();
    let cancelled = false;

    (async () => {
      try {
        const tr = await fetch("/api/gf/token", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ channel, uid }),
        });
        const td = await tr.json();
        if (!td.ok) throw new Error(td.error ?? "token_fail");

        const { joinChannel } = await import("@/lib/agora-web");
        const handle = await joinChannel({
          appId: td.appId,
          channel,
          token: td.token,
          uid,
          onRemoteUserAudio: (user) => {
            if (!cancelled && Number(user.uid) === AGENT_UID) setPhase("live");
          },
          onRemoteUserLeft: () => {},
          onStreamMessage: ({ data }) => {
            const evt = parser.feed(data);
            if (!evt || evt.kind !== "transcription") return;
            const who: "gf" | "me" = evt.role === "assistant" ? "gf" : "me";
            if (!evt.text) return;
            const { tags, body } = parseTaggedLine(evt.text);

            setLines((prev) => {
              const i = prev.findIndex(
                (l) => l.turnId === evt.turnId && l.who === who,
              );
              const next: Line = {
                who,
                turnId: evt.turnId,
                body,
                tags,
                status: evt.status,
                ts: Date.now(),
              };
              if (i >= 0) {
                const copy = prev.slice();
                copy[i] = next;
                return copy;
              }
              return [...prev, next];
            });

            if (who === "gf" && tags.length > 0) {
              setAllTags((prev) => [...prev, ...tags]);
            }
          },
        });
        handleRef.current = handle;

        // Kick off agent AFTER we're in the channel so we don't miss the greeting.
        const sr = await fetch("/api/gf/start", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ channel, uid, gfSlug: slug }),
        });
        const sd = await sr.json();
        if (!sd.ok) throw new Error(sd.error ?? "start_fail");
      } catch (e) {
        if (!cancelled) {
          setErr(`连不上:${String((e as Error)?.message ?? e).slice(0, 80)}`);
        }
      }
    })();

    return () => {
      cancelled = true;
      const h = handleRef.current;
      handleRef.current = null;
      (async () => {
        try {
          await fetch("/api/gf/stop", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ channel }),
          });
        } catch {}
        await h?.leave();
      })();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug, channel, uidStr]);

  useEffect(() => {
    void handleRef.current?.toggleMic(muted);
  }, [muted]);

  const pills = topEmotions(allTags, 3);

  function hangup() {
    if (phase === "ending") return;
    setPhase("ending");
    // persist summary for /end
    const mix = aggregateEmotionMix(allTags);
    const lastGfLine = [...lines].reverse().find((l) => l.who === "gf");
    const summary = {
      slug,
      durationSec: elapsed,
      lastLine: lastGfLine?.body ?? "",
      mix,
      lines,
    };
    if (typeof window !== "undefined") {
      sessionStorage.setItem("gf-call-summary", JSON.stringify(summary));
    }
    router.replace("/gf/end" as Route);
  }

  if (!gf) {
    return <div className="p-10 text-center opacity-60">gf 不存在</div>;
  }

  const mm = String(Math.floor(elapsed / 60)).padStart(2, "0");
  const ss = String(elapsed % 60).padStart(2, "0");

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col px-5 py-8">
      <div className="flex items-center justify-between text-[11px]" style={{ letterSpacing: "0.2em", opacity: 0.6 }}>
        <span>{phase === "live" ? "● LIVE" : phase === "ending" ? "● ENDING" : "● CONNECTING"}</span>
        <span>{mm}:{ss}</span>
      </div>

      <div className="mt-4 flex flex-col items-center">
        <div
          className="flex h-28 w-28 items-center justify-center rounded-full text-5xl"
          style={{
            background: `linear-gradient(135deg, ${gf.gradientFrom}, ${gf.gradientTo})`,
            animation: phase === "live" ? "gfpulse 1.4s ease-in-out infinite" : undefined,
          }}
        >
          {gf.emoji}
        </div>
        <div className="mt-2 text-base font-bold">{gf.name}</div>
        <div className="mt-1 text-[11px]" style={{ letterSpacing: "0.15em", opacity: 0.55 }}>
          {phase === "live" ? "她在说话……" : phase === "ending" ? "" : "连接中……"}
        </div>
      </div>

      {pills.length > 0 && (
        <div className="mt-3 flex flex-wrap justify-center gap-1.5">
          {pills.map((t) => (
            <span
              key={t}
              className="rounded-full px-2.5 py-0.5 text-[11px] font-bold"
              style={{
                background: "rgba(240,181,107,.15)",
                color: "#f0b56b",
                letterSpacing: "0.05em",
              }}
            >
              [{t}]
            </span>
          ))}
        </div>
      )}

      <div
        className="mt-4 flex-1 overflow-y-auto rounded-xl px-3 py-3 text-[13px] leading-relaxed"
        style={{ background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.08)" }}
      >
        {lines.length === 0 && (
          <div className="py-6 text-center opacity-40">她还在准备……</div>
        )}
        {lines.map((l, i) => (
          <div key={i} className="mb-3">
            <div className="text-[10px] font-bold" style={{ letterSpacing: "0.2em", opacity: 0.5 }}>
              {l.who === "gf" ? "SHE SAYS" : "YOU SAID"}
            </div>
            <div className="mt-1">
              {l.tags.map((t) => (
                <span key={t} style={{ opacity: 0.35, marginRight: 4 }}>[{t}]</span>
              ))}
              {l.body}
            </div>
          </div>
        ))}
      </div>

      {err && (
        <div
          className="mt-3 rounded-lg px-3 py-2 text-[12px]"
          style={{ background: "rgba(214,57,57,.14)", color: "#ff8f8f" }}
        >
          {err}
        </div>
      )}

      <div className="mt-4 flex justify-center gap-6">
        <button
          type="button"
          onClick={() => setMuted((m) => !m)}
          className="flex h-12 w-12 items-center justify-center rounded-full text-xl"
          style={{ background: "rgba(255,255,255,.08)", border: "1px solid rgba(255,255,255,.15)", color: "#fff" }}
          aria-label={muted ? "取消静音" : "静音"}
        >
          {muted ? "🔇" : "🎤"}
        </button>
        <button
          type="button"
          onClick={hangup}
          className="flex h-14 w-14 items-center justify-center rounded-full text-2xl"
          style={{ background: "#d63939", color: "#fff" }}
          aria-label="挂断"
        >
          📵
        </button>
      </div>

      <style>{`@keyframes gfpulse {
        0%, 100% { box-shadow: 0 0 0 6px rgba(240,181,107,.12), 0 0 0 18px rgba(240,181,107,.06); }
        50% { box-shadow: 0 0 0 10px rgba(240,181,107,.22), 0 0 0 26px rgba(240,181,107,.1); }
      }`}</style>
    </div>
  );
}
