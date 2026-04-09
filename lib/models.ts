/**
 * AI SDK v6 model configuration.
 *
 * Uses Vercel AI Gateway via the provider/model string syntax.
 * On Vercel, requests auto-route through the Gateway when
 * `AI_GATEWAY_API_KEY` is set (or OIDC token in Vercel env).
 * Locally you can set AI_GATEWAY_API_KEY or ANTHROPIC_API_KEY.
 */

export const MODELS = {
  // Fast + cheap, perfect for playful generation and roasts
  fast: "anthropic/claude-haiku-4-5",
  // Smart for longer analyses
  smart: "anthropic/claude-sonnet-4-6",
} as const;

export type ModelKey = keyof typeof MODELS;
