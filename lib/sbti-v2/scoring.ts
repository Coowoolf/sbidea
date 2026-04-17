import { DIM_ORDER, type Dim, type Level } from "./dimensions";
import { HHHH_CODE, PATTERNS } from "./patterns";
import { QUESTIONS } from "./questions";

const levelValue: Record<Level, number> = { L: 0, M: 1, H: 2 };

export type Answers = Record<string, Level>; // questionId -> chosen level

/** Reduce 30 answers to a 15-dim LMH vector (2 Qs per dim, average → bucket). */
export function computeDimVector(answers: Answers): Level[] {
  const groups: Record<Dim, number[]> = {
    S1: [], S2: [], S3: [],
    E1: [], E2: [], E3: [],
    A1: [], A2: [], A3: [],
    Ac1: [], Ac2: [], Ac3: [],
    So1: [], So2: [], So3: [],
  };
  for (const q of QUESTIONS) {
    const a = answers[q.id];
    if (!a) continue;
    groups[q.dim].push(levelValue[a]);
  }
  return DIM_ORDER.map((d) => {
    const arr = groups[d];
    if (arr.length === 0) return "M"; // default if skipped
    const avg = arr.reduce((s, v) => s + v, 0) / arr.length;
    if (avg < 0.67) return "L";
    if (avg < 1.34) return "M";
    return "H";
  });
}

function manhattan(a: Level[], b: Level[]): number {
  let d = 0;
  for (let i = 0; i < a.length; i += 1) {
    d += Math.abs(levelValue[a[i]] - levelValue[b[i]]);
  }
  return d;
}

export type ScoreResult = {
  code: string;
  similarity: number; // 0..1
  vector: Level[];
  isFallback: boolean;
};

const MAX_DISTANCE = 30; // 15 dims * max 2 per dim

/** Match user's vector against 25 templates; <60% similarity → HHHH fallback. */
export function scoreAnswers(answers: Answers): ScoreResult {
  const vector = computeDimVector(answers);
  let best = { code: "", dist: Infinity };
  for (const p of PATTERNS) {
    const d = manhattan(vector, p.levels);
    if (d < best.dist) best = { code: p.code, dist: d };
  }
  const similarity = 1 - best.dist / MAX_DISTANCE;
  if (similarity < 0.6) {
    return { code: HHHH_CODE, similarity, vector, isFallback: true };
  }
  return { code: best.code, similarity, vector, isFallback: false };
}
