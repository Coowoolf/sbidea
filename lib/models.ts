/**
 * AI SDK v6 × OpenRouter configuration for sbidea.ai.
 *
 * ## BYOK Google AI Studio routing
 *
 * OpenRouter dynamically routes requests across multiple providers
 * (Google AI Studio, AkashML, Parasail, Venice, etc). Our BYOK key is
 * only configured for Google AI Studio, so non-:free Google models
 * include `provider.order: ["Google AI Studio"]` to force routing
 * through the provider where our key works.
 *
 * ## Secrets
 *
 * OPENROUTER_API_KEY lives in .env.local (gitignored) locally and in
 * Vercel → Settings → Environment Variables in production.
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
 * Model chain ordered by reliability + quality.
 *
 * Tier 1: BYOK Google (forced to Google AI Studio provider)
 * Tier 2: OpenAI OSS free pool
 * Tier 3: Other free models
 */
export const MODEL_CHAIN_IDS = [
  // Tier 1 — Gemini Flash via BYOK (fast, reliable structured output)
  "google/gemini-2.5-flash",

  // Tier 2 — Gemma BYOK (cheaper but weaker at complex schemas)
  "google/gemma-4-31b-it",
  "google/gemma-4-26b-a4b-it",

  // Tier 3 — OpenAI OSS free pool
  "openai/gpt-oss-20b:free",
  "openai/gpt-oss-120b:free",

  // Tier 4 — other free (last resort)
  "qwen/qwen3-next-80b-a3b-instruct:free",
  "z-ai/glm-4.5-air:free",
  "meta-llama/llama-3.3-70b-instruct:free",
] as const;

export type ModelId = (typeof MODEL_CHAIN_IDS)[number];

/**
 * Create a model instance with appropriate provider routing.
 * BYOK Google models are forced through Google AI Studio.
 */
function makeModel(id: string): LanguageModel {
  if (id.startsWith("google/") && !id.endsWith(":free")) {
    return openrouter(id, {
      extraBody: {
        provider: {
          order: ["Google AI Studio"],
          allow_fallbacks: true,
        },
      },
    });
  }
  return openrouter(id);
}

export const modelChain: LanguageModel[] = MODEL_CHAIN_IDS.map(makeModel);
export const primaryModel: LanguageModel = modelChain[0];

/** Legacy alias. */
export const MODELS = { fast: primaryModel } as const;

/* -------------------------------------------------------------------------- */
/* Per-product overrides                                                       */
/* -------------------------------------------------------------------------- */

export type ProductKey =
  | "generate"
  | "headline"
  | "deathways"
  | "slogan"
  | "tarot"
  | "daily"
  | "jargon"
  | "roast"
  | "adventure-story";

const MODEL_OVERRIDES: Partial<Record<ProductKey, ModelId>> = {};

export function getChainFor(product: ProductKey): LanguageModel[] {
  const pinId = MODEL_OVERRIDES[product];
  if (!pinId) return modelChain;
  const pin = makeModel(pinId);
  const rest = modelChain.filter((_, i) => MODEL_CHAIN_IDS[i] !== pinId);
  return [pin, ...rest];
}

export function getStreamingModelFor(product: ProductKey): LanguageModel {
  const pinId = MODEL_OVERRIDES[product];
  return pinId ? makeModel(pinId) : primaryModel;
}

/* -------------------------------------------------------------------------- */
/* Fallback wrapper                                                            */
/* -------------------------------------------------------------------------- */

/**
 * Walk the chain, trying each model in order. Return the first success.
 *
 * CRITICAL: the `run` callback must access `result.output` (or any lazy
 * getter) INSIDE the callback, not after the wrapper returns. This is
 * because AI SDK v6's `result.output` is a lazy getter that can throw
 * `AI_NoOutputGeneratedError` even when `generateText` itself succeeds.
 * If the throw happens outside the wrapper, the fallback chain can't
 * catch it. Pattern:
 *
 *   const idea = await withModelFallback("generate", async (model) => {
 *     const result = await generateText({ model, maxRetries: 0, ... });
 *     return result.output;  // ← accessed INSIDE, throws are caught
 *   });
 *   return Response.json({ ok: true, idea });
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
