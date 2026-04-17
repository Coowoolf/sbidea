// 15 dimensions for SBTI-v2. Mirrors sbti-wiki's dimensions.json.
// Source: https://github.com/serenakeyitan/sbti-wiki (MIT)

export type Dim =
  | "S1" | "S2" | "S3"
  | "E1" | "E2" | "E3"
  | "A1" | "A2" | "A3"
  | "Ac1" | "Ac2" | "Ac3"
  | "So1" | "So2" | "So3";

export type Level = "L" | "M" | "H";

export const DIM_ORDER: Dim[] = [
  "S1", "S2", "S3",
  "E1", "E2", "E3",
  "A1", "A2", "A3",
  "Ac1", "Ac2", "Ac3",
  "So1", "So2", "So3",
];

export const DIM_LABEL: Record<Dim, string> = {
  S1: "自尊 / 自信",
  S2: "自我清晰度",
  S3: "核心价值",
  E1: "依恋安全感",
  E2: "情感投入",
  E3: "边界 / 独立性",
  A1: "世界观倾向",
  A2: "规则 / 灵活度",
  A3: "人生意义",
  Ac1: "动机取向",
  Ac2: "决策风格",
  Ac3: "执行模式",
  So1: "社交主动性",
  So2: "人际边界",
  So3: "表达真实度",
};
