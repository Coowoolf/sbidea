"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Filler,
  type TooltipItem,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Filler
);

// ---------------------------------------------------------------------------
// 4.1 S2S model tiers
// ---------------------------------------------------------------------------
const S2S_MODELS = {
  "gpt-realtime": {
    label: "gpt-realtime",
    provider: "OpenAI",
    audioInPerMillion: 32.0,
    audioOutPerMillion: 64.0,
    curve: { base: 0.2, slope: 0.043, quadratic: 0.00055, cap: 1.6 },
    source: "https://openai.com/api/pricing/",
  },
  "gpt-4o-mini-realtime": {
    label: "gpt-4o-mini-realtime",
    provider: "OpenAI",
    audioInPerMillion: 10.0,
    audioOutPerMillion: 20.0,
    curve: { base: 0.07, slope: 0.015, quadratic: 0.00019, cap: 0.55 },
    source: "https://openai.com/api/pricing/",
  },
  "gemini-flash-native-audio": {
    label: "Gemini 2.5 Flash Native Audio",
    provider: "Google",
    audioInPerMillion: 3.0,
    audioOutPerMillion: 12.0,
    curve: { base: 0.04, slope: 0.009, quadratic: 0.00011, cap: 0.32 },
    source: "https://ai.google.dev/gemini-api/docs/pricing",
  },
} as const;

type S2SModelKey = keyof typeof S2S_MODELS;

// ---------------------------------------------------------------------------
// 4.2 Pipeline tiers
// ---------------------------------------------------------------------------
const PIPELINE_TIERS = {
  economy: {
    label: "Economy",
    stack: "Whisper + Gemini Flash-Lite + Aura-2",
    perMinute: 0.05,
    breakdown: { asr: 0.006, llm: 0.014, tts: 0.03 },
  },
  standard: {
    label: "Standard",
    stack: "Deepgram Nova-3 + GPT-4o-mini + Aura-2",
    perMinute: 0.1,
    breakdown: { asr: 0.008, llm: 0.022, tts: 0.07 },
  },
  premium: {
    label: "Premium",
    stack: "Deepgram Nova-3 + GPT-4o + ElevenLabs Flash",
    perMinute: 0.18,
    breakdown: { asr: 0.008, llm: 0.042, tts: 0.13 },
  },
} as const;

type PipelineTierKey = keyof typeof PIPELINE_TIERS;

// ---------------------------------------------------------------------------
// 4.3 Presets
// ---------------------------------------------------------------------------
const PRESETS = {
  "short-qa": {
    label: "Short Q&A",
    duration: 2,
    volume: 200,
    description: "FAQ, lookups, simple confirmations",
  },
  support: {
    label: "Customer support",
    duration: 5,
    volume: 100,
    description: "Issue triage, account questions",
  },
  "call-center": {
    label: "Call center",
    duration: 8,
    volume: 300,
    description: "Inbound/outbound voice operations",
  },
  coaching: {
    label: "Coaching / tutor",
    duration: 20,
    volume: 50,
    description: "Teaching, language practice, therapy-adjacent",
  },
} as const;

// ---------------------------------------------------------------------------
// 5.1 S2S per-minute cost
// ---------------------------------------------------------------------------
function s2sCostPerMinute(durationMinutes: number, modelKey: S2SModelKey): number {
  const { base, slope, quadratic, cap } = S2S_MODELS[modelKey].curve;
  const t = Math.max(0, durationMinutes - 1);
  const raw = base + slope * t + quadratic * t * t;
  return Math.min(cap, raw);
}

// ---------------------------------------------------------------------------
// 5.2 Pipeline per-minute cost
// ---------------------------------------------------------------------------
function pipelineCostPerMinute(tierKey: PipelineTierKey): number {
  return PIPELINE_TIERS[tierKey].perMinute;
}

// ---------------------------------------------------------------------------
// 5.3 Monthly bill
// ---------------------------------------------------------------------------
function monthlyCost(
  perMinute: number,
  callsThousandsPerMonth: number,
  durationMinutes: number
): number {
  const totalMinutes = callsThousandsPerMonth * 1000 * durationMinutes;
  return perMinute * totalMinutes;
}

// ---------------------------------------------------------------------------
// 5.4 Insight generator
// ---------------------------------------------------------------------------
function generateInsight(
  duration: number,
  volume: number,
  s2sPerMin: number,
  pipelinePerMin: number,
  s2sModelKey: S2SModelKey,
  pipelineTierKey: PipelineTierKey
): string {
  const ratio = pipelinePerMin === 0 ? Infinity : s2sPerMin / pipelinePerMin;
  const s2sMonthly = monthlyCost(s2sPerMin, volume, duration);
  const pipelineMonthly = monthlyCost(pipelinePerMin, volume, duration);
  const monthlyDiff = fmtMoney(Math.abs(s2sMonthly - pipelineMonthly));
  const annualDiff = fmtMoney(Math.abs(s2sMonthly - pipelineMonthly) * 12);
  const s2sModelLabel = S2S_MODELS[s2sModelKey].label;
  const pipelineTierLabel = PIPELINE_TIERS[pipelineTierKey].label;

  if (ratio >= 1.3) {
    return `At ${duration}-minute sessions, ${s2sModelLabel} costs ${fmtRatio(ratio)} more per minute than the ${pipelineTierLabel} pipeline. At ${volume}k calls/month that's ${monthlyDiff} extra monthly, ${annualDiff} annually.`;
  } else if (ratio >= 0.9) {
    const pctDiff = Math.round(Math.abs(ratio - 1) * 100);
    return `At ${duration}-minute sessions with this model mix, S2S and Pipeline land within ${pctDiff}% of each other. The architectural choice here is about observability and control, not cost.`;
  } else {
    return `At this short session length with this low-cost S2S model, S2S edges out Pipeline on raw cost. Short transactional calls are where S2S economics work — extend the session and the curve flips.`;
  }
}

// ---------------------------------------------------------------------------
// 6.6 Number formatting helpers
// ---------------------------------------------------------------------------
function fmtMoney(n: number): string {
  if (n >= 1_000_000) return "$" + (n / 1_000_000).toFixed(2) + "M";
  if (n >= 10_000) return "$" + Math.round(n / 1000) + "k";
  if (n >= 1_000) return "$" + (n / 1000).toFixed(1) + "k";
  if (n >= 100) return "$" + Math.round(n).toLocaleString();
  if (n >= 10) return "$" + n.toFixed(0);
  return "$" + n.toFixed(2);
}

function fmtPerMin(n: number): string {
  return "$" + n.toFixed(2);
}

function fmtRatio(n: number): string {
  return n.toFixed(1) + "x";
}

// ---------------------------------------------------------------------------
// Dynamic Y-max
// ---------------------------------------------------------------------------
function computeYMax(s2sCPM: number, pipelineCPM: number): number {
  const peak = Math.max(s2sCPM, pipelineCPM);
  const raw = Math.max(0.6, peak * 1.15);
  return Math.ceil(raw * 10) / 10;
}

// ---------------------------------------------------------------------------
// Chart data builder
// ---------------------------------------------------------------------------
function buildChartData(
  duration: number,
  s2sModelKey: S2SModelKey,
  pipelineTierKey: PipelineTierKey
) {
  const labels: number[] = [];
  const s2sData: number[] = [];
  const pipelineData: number[] = [];

  for (let d = 1; d <= 30; d++) {
    labels.push(d);
    s2sData.push(s2sCostPerMinute(d, s2sModelKey));
    pipelineData.push(pipelineCostPerMinute(pipelineTierKey));
  }

  const yourPointIndex = Math.min(Math.max(duration - 1, 0), 29);
  const yourPointY = s2sCostPerMinute(duration, s2sModelKey);
  const yourPointData = new Array(30).fill(null) as (number | null)[];
  yourPointData[yourPointIndex] = yourPointY;

  return { labels, s2sData, pipelineData, yourPointData };
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------
// Dark theme palette matching sbidea.ai's main aesthetic (dark bg + orange accent).
// S2S kept coral-family, Pipeline kept teal-family — brightened so they're
// legible on the dark background. Brand accent is #f0b56b (same as sbidea home,
// /gf, /sbti etc.).
const C = {
  s2s: "#ff8a5c",
  s2sFill: "rgba(255,138,92,0.12)",
  s2sText: "#ffcfb5",
  s2sTextAlt: "#ffe1cd",
  pipeline: "#34d399",
  pipelineFill: "rgba(52,211,153,0.1)",
  pipelineText: "#bbf7d0",
  pipelineTextAlt: "#dcfce7",
  ink: "#ffffff",
  surface: "rgba(255,255,255,0.05)",
  surfaceBorder: "rgba(255,255,255,0.08)",
  muted: "rgba(255,255,255,0.6)",
  accent: "#f0b56b",
  grid: "rgba(255,255,255,0.06)",
} as const;

const FONT_STACK =
  '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------
export default function CalculatorClient() {
  const [duration, setDuration] = useState(5);
  const [volume, setVolume] = useState(100);
  const [s2sModel, setS2sModel] = useState<S2SModelKey>("gpt-realtime");
  const [pipelineTier, setPipelineTier] = useState<PipelineTierKey>("standard");

  const durationRef = useRef<HTMLInputElement>(null);
  const volumeRef = useRef<HTMLInputElement>(null);

  // Derived values
  const s2sCPM = s2sCostPerMinute(duration, s2sModel);
  const pipelineCPM = pipelineCostPerMinute(pipelineTier);
  const s2sMonthly = monthlyCost(s2sCPM, volume, duration);
  const pipelineMonthly = monthlyCost(pipelineCPM, volume, duration);
  const diff = s2sMonthly - pipelineMonthly;
  const ratio = pipelineCPM === 0 ? Infinity : s2sCPM / pipelineCPM;
  const insight = generateInsight(
    duration,
    volume,
    s2sCPM,
    pipelineCPM,
    s2sModel,
    pipelineTier
  );

  const yMax = computeYMax(
    s2sCostPerMinute(30, s2sModel),
    pipelineCostPerMinute(pipelineTier)
  );

  const { labels, s2sData, pipelineData, yourPointData } = buildChartData(
    duration,
    s2sModel,
    pipelineTier
  );

  const applyPreset = useCallback(
    (d: number, v: number) => {
      setDuration(d);
      setVolume(v);
      if (durationRef.current) durationRef.current.value = String(d);
      if (volumeRef.current) volumeRef.current.value = String(v);
    },
    []
  );

  const chartData = {
    labels,
    datasets: [
      {
        label: "S2S cost/min",
        data: s2sData,
        borderColor: C.s2s,
        borderWidth: 2,
        pointRadius: 0,
        fill: true,
        backgroundColor: "rgba(255,138,92,0.08)",
        tension: 0.3,
      },
      {
        label: "Pipeline cost/min",
        data: pipelineData,
        borderColor: C.pipeline,
        borderWidth: 2,
        borderDash: [5, 4],
        pointRadius: 0,
        fill: false,
        tension: 0,
      },
      {
        label: "Your session",
        data: yourPointData,
        borderColor: C.accent,
        backgroundColor: C.accent,
        pointRadius: 6,
        pointHoverRadius: 7,
        showLine: false,
        fill: false,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: false as const,
    interaction: {
      mode: "index" as const,
      intersect: false,
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          title: (items: TooltipItem<"line">[]) =>
            `Session length: ${items[0]?.label} min`,
          label: (item: TooltipItem<"line">) => {
            if (item.dataset.label === "Your session") return undefined;
            return `${item.dataset.label}: ${item.formattedValue}/min`;
          },
        },
        filter: (item: TooltipItem<"line">) =>
          item.dataset.label !== "Your session",
      },
    },
    scales: {
      x: {
        type: "linear" as const,
        min: 1,
        max: 30,
        ticks: {
          stepSize: 5,
          values: [1, 5, 10, 15, 20, 25, 30],
          color: C.muted,
          font: { size: 11, family: FONT_STACK },
        },
        title: {
          display: true,
          text: "Session length (minutes)",
          color: C.muted,
          font: { size: 11, family: FONT_STACK },
        },
        grid: { color: C.grid },
      },
      y: {
        min: 0,
        max: yMax,
        ticks: {
          color: C.muted,
          font: { size: 11, family: FONT_STACK },
          callback: (v: number | string) => "$" + Number(v).toFixed(2),
        },
        title: {
          display: true,
          text: "Cost per minute (USD)",
          color: C.muted,
          font: { size: 11, family: FONT_STACK },
        },
        grid: { color: C.grid },
      },
    },
  };

  return (
    <div
      style={{
        fontFamily: FONT_STACK,
        color: C.ink,
        maxWidth: 960,
        margin: "0 auto",
        padding: "32px 24px 48px",
        boxSizing: "border-box" as const,
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1
          style={{
            fontSize: 22,
            fontWeight: 500,
            margin: "0 0 8px",
            color: C.ink,
          }}
        >
          S2S vs Pipeline — voice agent cost calculator
        </h1>
        <p
          style={{
            fontSize: 14,
            color: C.muted,
            margin: 0,
            lineHeight: 1.55,
          }}
        >
          Model your monthly voice agent bill by session length, volume, and
          architecture. Prices verified April 2026.
        </p>
      </div>

      {/* Presets */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 8,
          marginBottom: 24,
        }}
        className="presets-grid"
      >
        {(Object.entries(PRESETS) as [string, typeof PRESETS[keyof typeof PRESETS]][]).map(
          ([key, preset]) => (
            <button
              key={key}
              onClick={() => applyPreset(preset.duration, preset.volume)}
              style={{
                border: `1px solid ${C.surfaceBorder}`,
                borderRadius: 8,
                background: "rgba(255,255,255,0.03)",
                padding: "10px 12px",
                textAlign: "left" as const,
                cursor: "pointer",
                color: C.ink,
                transition: "background 0.1s, border-color 0.1s",
                fontFamily: FONT_STACK,
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.08)";
                (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(240,181,107,0.4)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.03)";
                (e.currentTarget as HTMLButtonElement).style.borderColor = C.surfaceBorder;
              }}
              onMouseDown={(e) =>
                ((e.currentTarget as HTMLButtonElement).style.transform =
                  "scale(0.98)")
              }
              onMouseUp={(e) =>
                ((e.currentTarget as HTMLButtonElement).style.transform = "scale(1)")
              }
            >
              <div
                style={{ fontSize: 13, fontWeight: 500, color: C.ink, marginBottom: 2 }}
              >
                {preset.label}
              </div>
              <div style={{ fontSize: 12, color: C.muted }}>
                {preset.duration}min · {preset.volume}k/mo
              </div>
              <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>
                {preset.description}
              </div>
            </button>
          )
        )}
      </div>

      {/* Inputs card */}
      <div
        style={{
          background: C.surface,
          border: `1px solid ${C.surfaceBorder}`,
          borderRadius: 12,
          padding: "20px 24px",
          marginBottom: 24,
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 20,
        }}
        className="inputs-grid"
      >
        {/* Session duration slider */}
        <div>
          <div
            style={{
              fontSize: 13,
              fontWeight: 500,
              textTransform: "uppercase" as const,
              letterSpacing: "0.5px",
              color: C.muted,
              marginBottom: 10,
            }}
          >
            Session length
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <input
              ref={durationRef}
              type="range"
              min={1}
              max={30}
              step={1}
              defaultValue={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              style={{ flex: 1, accentColor: C.s2s }}
            />
            <span
              style={{
                minWidth: 54,
                textAlign: "right" as const,
                fontSize: 14,
                fontWeight: 400,
                color: C.ink,
              }}
            >
              {duration} min
            </span>
          </div>
        </div>

        {/* Monthly volume slider */}
        <div>
          <div
            style={{
              fontSize: 13,
              fontWeight: 500,
              textTransform: "uppercase" as const,
              letterSpacing: "0.5px",
              color: C.muted,
              marginBottom: 10,
            }}
          >
            Monthly volume
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <input
              ref={volumeRef}
              type="range"
              min={10}
              max={1000}
              step={10}
              defaultValue={volume}
              onChange={(e) => setVolume(Number(e.target.value))}
              style={{ flex: 1, accentColor: C.pipeline }}
            />
            <span
              style={{
                minWidth: 54,
                textAlign: "right" as const,
                fontSize: 14,
                fontWeight: 400,
                color: C.ink,
              }}
            >
              {volume}k
            </span>
          </div>
        </div>

        {/* S2S model dropdown */}
        <div>
          <div
            style={{
              fontSize: 13,
              fontWeight: 500,
              textTransform: "uppercase" as const,
              letterSpacing: "0.5px",
              color: C.muted,
              marginBottom: 10,
            }}
          >
            S2S model
          </div>
          <select
            value={s2sModel}
            onChange={(e) => setS2sModel(e.target.value as S2SModelKey)}
            style={{
              width: "100%",
              padding: "8px 10px",
              border: `1px solid rgba(255,255,255,0.15)`,
              borderRadius: 6,
              fontSize: 14,
              color: C.ink,
              background: "#1a1a1a",
              fontFamily: FONT_STACK,
              cursor: "pointer",
            }}
          >
            {(Object.entries(S2S_MODELS) as [S2SModelKey, typeof S2S_MODELS[S2SModelKey]][]).map(
              ([key, model]) => (
                <option key={key} value={key}>
                  {model.label} ({model.provider})
                </option>
              )
            )}
          </select>
        </div>

        {/* Pipeline tier dropdown */}
        <div>
          <div
            style={{
              fontSize: 13,
              fontWeight: 500,
              textTransform: "uppercase" as const,
              letterSpacing: "0.5px",
              color: C.muted,
              marginBottom: 10,
            }}
          >
            Pipeline tier
          </div>
          <select
            value={pipelineTier}
            onChange={(e) => setPipelineTier(e.target.value as PipelineTierKey)}
            style={{
              width: "100%",
              padding: "8px 10px",
              border: `1px solid rgba(255,255,255,0.15)`,
              borderRadius: 6,
              fontSize: 14,
              color: C.ink,
              background: "#1a1a1a",
              fontFamily: FONT_STACK,
              cursor: "pointer",
            }}
          >
            {(Object.entries(PIPELINE_TIERS) as [PipelineTierKey, typeof PIPELINE_TIERS[PipelineTierKey]][]).map(
              ([key, tier]) => (
                <option key={key} value={key}>
                  {tier.label} ({tier.stack})
                </option>
              )
            )}
          </select>
        </div>
      </div>

      {/* Result cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: 12,
          marginBottom: 28,
        }}
        className="result-cards-grid"
      >
        {/* S2S card */}
        <div
          style={{
            background: C.s2sFill,
            border: `1px solid rgba(255,138,92,0.2)`,
            borderRadius: 12,
            padding: "16px 20px",
          }}
        >
          <div
            style={{
              fontSize: 13,
              fontWeight: 500,
              textTransform: "uppercase" as const,
              letterSpacing: "0.5px",
              color: C.s2sTextAlt,
              marginBottom: 8,
            }}
          >
            S2S Monthly
          </div>
          <div
            style={{
              fontSize: 27,
              fontWeight: 500,
              color: C.s2sText,
              lineHeight: 1.1,
            }}
          >
            {fmtMoney(s2sMonthly)}
          </div>
          <div style={{ fontSize: 12, color: C.s2sTextAlt, marginTop: 6 }}>
            {fmtPerMin(s2sCPM)}/min at {duration} min
          </div>
        </div>

        {/* Pipeline card */}
        <div
          style={{
            background: C.pipelineFill,
            border: `1px solid rgba(52,211,153,0.2)`,
            borderRadius: 12,
            padding: "16px 20px",
          }}
        >
          <div
            style={{
              fontSize: 13,
              fontWeight: 500,
              textTransform: "uppercase" as const,
              letterSpacing: "0.5px",
              color: C.pipelineTextAlt,
              marginBottom: 8,
            }}
          >
            Pipeline Monthly
          </div>
          <div
            style={{
              fontSize: 27,
              fontWeight: 500,
              color: C.pipelineText,
              lineHeight: 1.1,
            }}
          >
            {fmtMoney(pipelineMonthly)}
          </div>
          <div style={{ fontSize: 12, color: C.pipelineTextAlt, marginTop: 6 }}>
            {fmtPerMin(pipelineCPM)}/min flat
          </div>
        </div>

        {/* Difference card */}
        <div
          style={{
            background: C.surface,
            borderRadius: 12,
            padding: "16px 20px",
            border: `1px solid ${C.surfaceBorder}`,
          }}
        >
          <div
            style={{
              fontSize: 13,
              fontWeight: 500,
              textTransform: "uppercase" as const,
              letterSpacing: "0.5px",
              color: C.muted,
              marginBottom: 8,
            }}
          >
            Difference
          </div>
          <div
            style={{
              fontSize: 27,
              fontWeight: 500,
              color: diff >= 0 ? C.s2sText : C.pipelineText,
              lineHeight: 1.1,
            }}
          >
            {diff >= 0 ? "+" : "\u2212"}
            {fmtMoney(Math.abs(diff))}
          </div>
          <div style={{ fontSize: 12, color: C.muted, marginTop: 6 }}>
            {diff >= 0
              ? "S2S costs more"
              : "Pipeline costs more"}{" "}
            · {fmtRatio(Math.abs(ratio))} ratio
          </div>
        </div>
      </div>

      {/* Custom chart legend */}
      <div
        style={{
          display: "flex",
          gap: 20,
          alignItems: "center",
          marginBottom: 10,
          flexWrap: "wrap" as const,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div
            style={{
              width: 24,
              height: 2,
              background: C.s2s,
            }}
          />
          <span style={{ fontSize: 12, color: C.muted }}>
            S2S cost/min (solid)
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div
            style={{
              width: 24,
              height: 2,
              background: C.pipeline,
              backgroundImage: `repeating-linear-gradient(to right, ${C.pipeline} 0, ${C.pipeline} 5px, transparent 5px, transparent 9px)`,
            }}
          />
          <span style={{ fontSize: 12, color: C.muted }}>
            Pipeline cost/min (dashed)
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div
            style={{
              width: 10,
              height: 10,
              borderRadius: "50%",
              background: C.accent,
            }}
          />
          <span style={{ fontSize: 12, color: C.muted }}>
            Your session
          </span>
        </div>
      </div>

      {/* Chart */}
      <div
        style={{
          height: 260,
          marginBottom: 24,
          background: "rgba(255,255,255,0.03)",
          borderRadius: 8,
          padding: "12px 12px 4px",
          border: `1px solid ${C.surfaceBorder}`,
        }}
      >
        <Line data={chartData} options={chartOptions} />
      </div>

      {/* Insight panel */}
      <div
        style={{
          background: C.surface,
          border: `1px solid ${C.surfaceBorder}`,
          borderRadius: 8,
          padding: 12,
          marginBottom: 24,
          fontSize: 14,
          lineHeight: 1.55,
          color: C.ink,
        }}
      >
        {insight}
      </div>

      {/* Assumptions collapsible */}
      <details style={{ marginBottom: 32 }}>
        <summary
          style={{
            fontSize: 13,
            fontWeight: 500,
            color: C.muted,
            cursor: "pointer",
            userSelect: "none" as const,
            padding: "4px 0",
          }}
        >
          How the numbers are calculated
        </summary>
        <div
          style={{
            marginTop: 12,
            fontSize: 12,
            color: C.muted,
            lineHeight: 1.7,
            display: "flex",
            flexDirection: "column" as const,
            gap: 12,
          }}
        >
          <p style={{ margin: 0 }}>
            S2S per-minute cost rises with session length because audio tokens
            from all prior turns are re-billed on every turn — this is documented
            in Google's Vertex Live API spec and confirmed by OpenAI developer
            community reports. We model this with a quadratic-with-cap curve
            calibrated against published token rates and independent benchmarks:
            gpt-realtime runs roughly $0.24/min at 2 minutes, $1.00/min at 15
            minutes, and reaches context window limits around $1.50/min for
            30-minute sessions. Sources: OpenAI pricing page, Google AI pricing
            page.
          </p>
          <p style={{ margin: 0 }}>
            Pipeline per-minute cost is flat because streaming ASR and TTS are
            billed per audio minute, and only compact text context accumulates
            for the LLM. Tiers: Economy ~$0.05/min, Standard ~$0.10/min, Premium
            ~$0.18/min — based on Deepgram Nova-3 ($0.0077/min), GPT-4o-mini /
            Gemini Flash-Lite / GPT-4o text rates, and Aura-2 / ElevenLabs Flash
            TTS pricing.
          </p>
          <p style={{ margin: 0 }}>
            Excludes: telephony/SIP, orchestration platform markup,
            network/transport costs. These apply to both architectures equally
            and do not change the comparison. Approximation is deliberate: this
            tool is for sizing, not invoicing.
          </p>
        </div>
      </details>

      {/* Footer */}
      <div
        style={{
          textAlign: "right" as const,
          fontSize: 12,
          color: C.muted,
        }}
      >
        ConvoAI · Agora · April 2026
      </div>

      {/* Responsive styles */}
      <style>{`
        @media (max-width: 719px) {
          .presets-grid {
            grid-template-columns: 1fr 1fr !important;
          }
          .inputs-grid {
            grid-template-columns: 1fr !important;
          }
          .result-cards-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
