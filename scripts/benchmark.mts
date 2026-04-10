/**
 * Lightweight benchmark for sbidea.ai free model selection.
 *
 * Runs TWO tiny real-world tests against each candidate free model:
 *   A) Structured JSON output (the hard case — 7 of our 10 products need it)
 *   B) Chinese creative streaming text (the easy case — /roast)
 *
 * For each model we record:
 *   - pass/fail per test
 *   - latency
 *   - a short preview of the output
 *
 * Kept deliberately small: 13 models × 2 tests = 26 requests.
 * maxRetries is 0 so failing models fall through fast.
 *
 * Run with:
 *   npx tsx scripts/benchmark.mts
 */

import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { generateText, Output } from "ai";
import { z } from "zod";
import { readFileSync } from "node:fs";

// Load .env.local manually so we don't need dotenv
try {
  const env = readFileSync(".env.local", "utf8");
  for (const line of env.split("\n")) {
    const match = line.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.+)$/);
    if (match) process.env[match[1]] ??= match[2].trim();
  }
} catch {
  /* optional */
}

if (!process.env.OPENROUTER_API_KEY) {
  console.error("Missing OPENROUTER_API_KEY");
  process.exit(1);
}

const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
  headers: {
    "HTTP-Referer": "https://sbidea.ai",
    "X-Title": "sbidea.ai-bench",
  },
});

// Candidate free models (skipping models < 7B and vision-only)
const CANDIDATES = [
  "google/gemma-4-31b-it:free",
  "google/gemma-4-26b-a4b-it:free",
  "google/gemma-3-27b-it:free",
  "google/gemma-3-12b-it:free",
  "qwen/qwen3-next-80b-a3b-instruct:free",
  "qwen/qwen3-coder:free",
  "z-ai/glm-4.5-air:free",
  "minimax/minimax-m2.5:free",
  "meta-llama/llama-3.3-70b-instruct:free",
  "nousresearch/hermes-3-llama-3.1-405b:free",
  "nvidia/nemotron-3-super-120b-a12b:free",
  "openai/gpt-oss-120b:free",
  "openai/gpt-oss-20b:free",
];

// Mini schema mirroring the shape all our structured-output products use
const IdeaSchema = z.object({
  name: z.string().describe("产品名，8 字以内"),
  slogan: z.string().describe("一句话 slogan，20 字以内"),
  category: z.string().describe("赛道，例如 社交 / 工具 / 餐饮"),
  sbScore: z.number().int().min(1).max(10).describe("SB 指数 1-10"),
});

type TestResult = {
  pass: boolean;
  ms: number;
  preview: string;
  error?: string;
};

async function testStructured(modelId: string): Promise<TestResult> {
  const model = openrouter(modelId);
  const start = Date.now();
  try {
    const result = await generateText({
      model,
      maxRetries: 0,
      output: Output.object({ schema: IdeaSchema }),
      system: "你是一个创业点子生成器。输出必须严格遵守 schema。",
      prompt: "生成一个听起来很 SB 但其实可能赚钱的中文创业点子。",
      temperature: 0.9,
    });
    const out = result.output;
    const preview = `${out.name} | ${out.slogan} | ${out.category} | SB${out.sbScore}`;
    return { pass: true, ms: Date.now() - start, preview };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return {
      pass: false,
      ms: Date.now() - start,
      preview: "",
      error: msg.slice(0, 120),
    };
  }
}

async function testCreative(modelId: string): Promise<TestResult> {
  const model = openrouter(modelId);
  const start = Date.now();
  try {
    const result = await generateText({
      model,
      maxRetries: 0,
      system:
        "你是一个脱口秀演员。用中文吐槽用户的创业点子，50 字以内，犀利但不恶毒。",
      prompt: "这个点子：一个 App 让你给路边野猫发红包。",
      temperature: 0.95,
      maxOutputTokens: 200,
    });
    const text = result.text.trim();
    return {
      pass: text.length > 5,
      ms: Date.now() - start,
      preview: text.slice(0, 80),
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return {
      pass: false,
      ms: Date.now() - start,
      preview: "",
      error: msg.slice(0, 120),
    };
  }
}

async function main() {
  console.log(`\n📊 sbidea.ai · benchmark of ${CANDIDATES.length} free models\n`);
  console.log("=".repeat(80));

  type Row = {
    model: string;
    structured: TestResult;
    creative: TestResult;
    score: number;
  };

  // Run in parallel batches of 4 so we don't hammer OpenRouter too hard
  const results: Row[] = [];
  const BATCH = 4;
  for (let i = 0; i < CANDIDATES.length; i += BATCH) {
    const batch = CANDIDATES.slice(i, i + BATCH);
    const rows = await Promise.all(
      batch.map(async (modelId) => {
        const [structured, creative] = await Promise.all([
          testStructured(modelId),
          testCreative(modelId),
        ]);
        // Composite score: structured is 2x weighted (more important)
        const score =
          (structured.pass ? 2 : 0) + (creative.pass ? 1 : 0);
        return { model: modelId, structured, creative, score };
      })
    );
    for (const row of rows) {
      const s = row.structured;
      const c = row.creative;
      console.log(
        `\n${row.model}   [score ${row.score}/3]\n  structured: ${s.pass ? "✅" : "❌"} ${s.ms}ms ${s.pass ? `→ ${s.preview}` : `(${s.error})`}\n  creative  : ${c.pass ? "✅" : "❌"} ${c.ms}ms ${c.pass ? `→ ${c.preview}` : `(${c.error})`}`
      );
    }
    results.push(...rows);
  }

  console.log("\n" + "=".repeat(80));
  console.log("\n🏆 Ranking (best → worst)\n");
  results.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    // Tiebreak by faster structured response
    return a.structured.ms - b.structured.ms;
  });
  for (let i = 0; i < results.length; i++) {
    const r = results[i];
    const sIcon = r.structured.pass ? "✅" : "❌";
    const cIcon = r.creative.pass ? "✅" : "❌";
    console.log(
      `${String(i + 1).padStart(2)}. ${sIcon}${cIcon}  ${r.model.padEnd(52)}  ${r.structured.ms}ms`
    );
  }

  console.log(
    "\nLegend: first check = structured JSON (2pts), second = creative text (1pt)\n"
  );
}

await main().catch((e) => {
  console.error("Benchmark crashed:", e);
  process.exit(1);
});
