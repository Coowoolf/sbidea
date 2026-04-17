import type { Level } from "./dimensions";

export type Pattern = { code: string; levels: Level[]; };

// Order matches DIM_ORDER: S1 S2 S3 - E1 E2 E3 - A1 A2 A3 - Ac1 Ac2 Ac3 - So1 So2 So3
function pat(s: string): Level[] {
  return s.replace(/-/g, "").split("") as Level[];
}

export const PATTERNS: Pattern[] = [
  { code: "CTRL",   levels: pat("HHH-HMH-MHH-HHH-MHM") },
  { code: "ATM-er", levels: pat("HHH-HHM-HHH-HMH-MHL") },
  { code: "Dior-s", levels: pat("MHM-MMH-MHM-HMH-LHL") },
  { code: "BOSS",   levels: pat("HHH-HMH-MMH-HHH-LHL") },
  { code: "THAN-K", levels: pat("MHM-HMM-HHM-MMH-MHL") },
  { code: "OH-NO",  levels: pat("HHL-LMH-LHH-HHM-LHL") },
  { code: "GOGO",   levels: pat("HHM-HMH-MMH-HHH-MHM") },
  { code: "SEXY",   levels: pat("HMH-HHL-HMM-HMM-HLH") },
  { code: "LOVE-R", levels: pat("MLH-LHL-HLH-MLM-MLH") },
  { code: "MUM",    levels: pat("MMH-MHL-HMM-LMM-HLL") },
  { code: "FAKE",   levels: pat("HLM-MML-MLM-MLM-HLH") },
  { code: "OJBK",   levels: pat("MMH-MMM-HML-LMM-MML") },
  { code: "MALO",   levels: pat("MLH-MHM-MLH-MLH-LMH") },
  { code: "JOKE-R", levels: pat("LLH-LHL-LML-LLL-MLM") },
  { code: "WOC!",   levels: pat("HHL-HMH-MMH-HHM-LHH") },
  { code: "THIN-K", levels: pat("HHL-HMH-MLH-MHM-LHH") },
  { code: "SHIT",   levels: pat("HHL-HLH-LMM-HHM-LHH") },
  { code: "ZZZZ",   levels: pat("MHL-MLH-LML-MML-LHM") },
  { code: "POOR",   levels: pat("HHL-MLH-LMH-HHH-LHL") },
  { code: "MONK",   levels: pat("HHL-LLH-LLM-MML-LHM") },
  { code: "IMSB",   levels: pat("LLM-LMM-LLL-LLL-MLM") },
  { code: "SOLO",   levels: pat("LML-LLH-LHL-LML-LHM") },
  { code: "FUCK",   levels: pat("MLL-LHL-LLM-MLL-HLH") },
  { code: "DEAD",   levels: pat("LLL-LLM-LML-LLL-LHM") },
  { code: "IMFW",   levels: pat("LLH-LHL-LML-LLL-MLL") },
];

export const HHHH_CODE = "HHHH";
