/**
 * AI SDK v6 × OpenRouter configuration for sbidea.ai.
 *
 * ## Why a chain, not a single model
 *
 * OpenRouter's free tier is a shared pool. At any given minute a model
 * can be rate-limited upstream (Google AI Studio / Venice / Z.AI etc.),
 * or a small model may refuse to emit valid JSON. We walk a chain of
 * candidates with `maxRetries: 0` so each hop is immediate.
 *
 * ## Chain order
 *
 * Ordered by a real benchmark (`scripts/benchmark.mts`) against both
 * structured JSON output and Chinese creative text. Models near the top
 * are expected to be more reliable today; models near the bottom are
 * attempted as last-ditch fallbacks (they may be rate-limited right now
 * but tend to recover within minutes).
 *
 * Rankings as of 2026-04-10 are stored in `docs/benchmark-results.md`.
 *
 * ## Per-product override
 *
 * Most products share the same chain, but for very schema-sensitive
 * products you can pin a preferred model via `MODEL_OVERRIDES`. That
 * model is tried first, then the remaining chain is attempted as
 * fallback (order preserved).
 *
 * ## Secrets
 *
 * OPENROUTER_API_KEY is read from .env.local (gitignored) locally and
 * from Vercel → Settings → Environment Variables in production.
 * Never hardcode the key.
 */

import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import type { LanguageModel } from "ai";

const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY ?? "",
  headers: {
    "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL ?? "https://sbidea.ai",
    "X-Title": "sbidea.ai",
  },
});

/**
 * Full catalog of free OpenRouter models we're willing to route to,
 * ordered roughly best-first based on the benchmark above. We keep
 * rate-limited models in the list because they recover quickly.
 */
export const MODEL_CHAIN_IDS = [
  // Tier 1: confirmed working with structured output + Chinese output
  "openai/gpt-oss-20b:free",
  "openai/gpt-oss-120b:free",

  // Tier 2: user-chosen primary + well-regarded quality (often rate-limited)
  "google/gemma-4-31b-it:free",
  "google/gemma-3-27b-it:free",
  "google/gemma-4-26b-a4b-it:free",
  "google/gemma-3-12b-it:free",

  // Tier 3: big MoE / strong instruction-following
  "qwen/qwen3-next-80b-a3b-instruct:free",
  "z-ai/glm-4.5-air:free",
  "meta-llama/llama-3.3-70b-instruct:free",
  "nousresearch/hermes-3-llama-3.1-405b:free",

  // Tier 4: last-ditch
  "minimax/minimax-m2.5:free",
  "nvidia/nemotron-3-super-120b-a12b:free",
  "qwen/qwen3-coder:free",
] as const;

export type ModelId = (typeof MODEL_CHAIN_IDS)[number];

export const modelChain: LanguageModel[] = MODEL_CHAIN_IDS.map((id) =>
  openrouter(id)
);

export const primaryModel: LanguageModel = modelChain[0];
export const fallbackModel: LanguageModel = modelChain[1];

/** Legacy alias kept so older routes importing `MODELS.fast` still compile. */
export const MODELS = {
  fast: primaryModel,
  fallback: fallbackModel,
} as const;

/* -------------------------------------------------------------------------- */
/* Per-product overrides                                                       */
/* -------------------------------------------------------------------------- */

export type ProductKey =
  | "generate" // /api/generate — 12-field schema, HARD
  | "headline" // /api/headline — 11-field schema with array, HARD
  | "deathways" // /api/deathways — array of 7 objects, HARD
  | "slogan" // /api/slogan — 8-enum array, medium
  | "tarot" // /api/tarot — 5-field schema, medium
  | "daily" // /api/daily — 5-field schema with hex colors, medium
  | "jargon" // /api/jargon — 4-field schema, easy
  | "roast"; // /api/roast — streaming markdown, no JSON

/**
 * Pin a specific model to lead the chain for a given product.
 * The pinned model is tried first; if it fails, the remaining chain
 * (minus the pinned model) is tried in order.
 *
 * Leave an entry undefined to use the default chain order.
 */
const MODEL_OVERRIDES: Partial<Record<ProductKey, ModelId>> = {
  // Streaming is latency-sensitive — use the smallest reliable model
  roast: "openai/gpt-oss-20b:free",
  // The hardest schemas benefit from the 120b variant, which follows schemas
  // more obediently at the cost of a few extra seconds
  generate: "openai/gpt-oss-120b:free",
  headline: "openai/gpt-oss-120b:free",
  deathways: "openai/gpt-oss-120b:free",
};

/** Return the ordered list of models to try for a given product. */
export function getChainFor(product: ProductKey): LanguageModel[] {
  const pinId = MODEL_OVERRIDES[product];
  if (!pinId) return modelChain;
  const pin = openrouter(pinId);
  const rest = modelChain.filter((_, i) => MODEL_CHAIN_IDS[i] !== pinId);
  return [pin, ...rest];
}

/** Return just the preferred model for streaming (no fallback chain). */
export function getStreamingModelFor(product: ProductKey): LanguageModel {
  const pinId = MODEL_OVERRIDES[product];
  return pinId ? openrouter(pinId) : primaryModel;
}

/* -------------------------------------------------------------------------- */
/* Fallback wrapper                                                            */
/* -------------------------------------------------------------------------- */

/**
 * Walk the configured chain for a product, trying each model in order.
 * Return the first success. Pass `maxRetries: 0` on the inner generateText
 * call so a failing model returns control to the chain immediately.
 *
 *   const result = await withModelFallback("generate", (model) =>
 *     generateText({
 *       model,
 *       maxRetries: 0,
 *       output: Output.object({ schema }),
 *       prompt,
 *     })
 *   );
 *   result.output; // typed from the schema
 *
 * Streaming calls should NOT use this wrapper — use
 * `getStreamingModelFor(product)` directly.
 */
export async function withModelFallback<T>(
  product: ProductKey,
  run: (model: LanguageModel) => Promise<T>
): Promise<T> {
  const chain = getChainFor(product);
  let lastError: unknown;
  for (let i = 0; i < chain.length; i++) {
    try {
      return await run(chain[i]);
    } catch (error) {
      lastError = error;
      const msg = error instanceof Error ? error.message : String(error);
      const preview = msg.length > 160 ? `${msg.slice(0, 160)}…` : msg;
      // We log the model ID by cross-referencing the chain position.
      const id =
        i < MODEL_CHAIN_IDS.length ? MODEL_CHAIN_IDS[i] : `chain[${i}]`;
      console.warn(
        `[ai:${product}] chain ${i + 1}/${chain.length} ${id} failed: ${preview}`
      );
    }
  }
  throw lastError instanceof Error
    ? lastError
    : new Error(`All fallback models in the chain failed for ${product}`);
}
