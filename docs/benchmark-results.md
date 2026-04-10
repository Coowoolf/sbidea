# OpenRouter Free Model Benchmark — sbidea.ai

Last run: **2026-04-10**

Script: `scripts/benchmark.mts` · run with `npx tsx scripts/benchmark.mts`

## What we tested

Against each candidate free model, we ran two tiny real-world tests:

1. **Structured JSON output** — `generateText` + `Output.object({ schema })`
   using a 4-field schema (`name`, `slogan`, `category`, `sbScore`).
   Mirrors the shape our 7 structured-output products need.
2. **Chinese creative text** — a roast-style 50-char Chinese response.
   Mirrors what `/api/roast` streams.

`maxRetries` was set to 0 so rate-limited models fell through fast (~1s
each instead of ~20s after internal retries).

Scoring: structured pass = 2 points, creative pass = 1 point. Tiebreak
by faster structured latency.

## Results snapshot (2026-04-10)

| Rank | Score | Model                                             | Structured ms | Notes |
|------|-------|---------------------------------------------------|---------------|-------|
|  1 | 3/3 | `openai/gpt-oss-20b:free`                           | 25.8s | Cleanest structured output — `快连影 / 一分钟, 连接无限`. Current default. |
|  2 | 3/3 | `openai/gpt-oss-120b:free`                          | 23.7s | Schema valid but slogan field got emoji-spammed. Still usable for hard schemas. |
|  3 | 3/3 | `nvidia/nemotron-3-super-120b-a12b:free`            | 26.6s | Schema parsed but content was garbage — filled `name` field with "不明确的schema". Demoted in chain. |
|  4 | 0/3 | `z-ai/glm-4.5-air:free`                             | n/a   | Rate-limited by Z.AI upstream. |
|  5 | 0/3 | `meta-llama/llama-3.3-70b-instruct:free`            | n/a   | Rate-limited by Venice provider. |
|  6 | 0/3 | `nousresearch/hermes-3-llama-3.1-405b:free`         | n/a   | Rate-limited by Venice provider. |
|  7 | 0/3 | `qwen/qwen3-next-80b-a3b-instruct:free`             | n/a   | Rate-limited by Venice provider. |
|  8 | 0/3 | `qwen/qwen3-coder:free`                             | n/a   | Rate-limited by Venice provider. |
|  9 | 0/3 | `minimax/minimax-m2.5:free`                         | n/a   | Rate-limited by OpenInference provider. |
| 10 | 0/3 | `google/gemma-4-26b-a4b-it:free`                    | n/a   | Rate-limited by Google AI Studio. |
| 11 | 0/3 | `google/gemma-3-12b-it:free`                        | n/a   | Rate-limited by Google AI Studio. |
| 12 | 0/3 | `google/gemma-4-31b-it:free`                        | n/a   | Rate-limited by Google AI Studio. |
| 13 | 0/3 | `google/gemma-3-27b-it:free`                        | n/a   | Rate-limited by Google AI Studio. |

## Key findings

1. **OpenRouter's free tier is highly volatile.** At the time of this run,
   *every single* non-`gpt-oss` free model was being upstream rate-limited.
   Availability can flip minute-to-minute — rate limits are pool-wide,
   not per-account.

2. **Upstream providers share quota.** Venice hosts Qwen3, Llama 3.3, and
   Hermes 3 — when Venice is throttled, all three go down together. Same
   pattern with Google AI Studio and the Gemma family.

3. **`openai/gpt-oss-*` is the only quasi-reliable free option.** It's
   routed through a different upstream (not Venice / Google / Z.AI), so
   it typically stays up when the others don't.

4. **Structured output failure ≠ rate limit.** A model can respond happily
   but still fail JSON schema coercion. We saw this with early gemma/glm
   attempts — "No object generated: could not parse the response". The
   gpt-oss family is the most schema-obedient in this group.

5. **Free-tier latency is 20-30 seconds.** Way too slow for a fun viral
   toy. The product UX should either:
   - show a playful multi-stage loading animation (current approach)
   - pre-generate a bank of ideas (future work for `/generator` + `/daily`)
   - fall back to a cheap paid model (future work)

## Chain order chosen

See `lib/models.ts` — `MODEL_CHAIN_IDS`. Summary:

```
Tier 1 (confirmed working)
  openai/gpt-oss-20b:free
  openai/gpt-oss-120b:free

Tier 2 (Gemma family — user's original primary, rate limited today
  but usually the best quality when available)
  google/gemma-4-31b-it:free
  google/gemma-3-27b-it:free
  google/gemma-4-26b-a4b-it:free
  google/gemma-3-12b-it:free

Tier 3 (big MoE / strong instruction following — different providers,
  so at least one is usually up)
  qwen/qwen3-next-80b-a3b-instruct:free
  z-ai/glm-4.5-air:free
  meta-llama/llama-3.3-70b-instruct:free
  nousresearch/hermes-3-llama-3.1-405b:free

Tier 4 (last-ditch — smaller or worse at JSON)
  minimax/minimax-m2.5:free
  nvidia/nemotron-3-super-120b-a12b:free
  qwen/qwen3-coder:free
```

## Per-product pins

`lib/models.ts` has a `MODEL_OVERRIDES` table that pins a specific model
to lead the chain for latency- or quality-sensitive products:

- `roast` → `openai/gpt-oss-20b:free` (smallest reliable for streaming TTFB)
- `generate` / `headline` / `deathways` → `openai/gpt-oss-120b:free`
  (hardest schemas benefit from the bigger model)

Leave an entry undefined to use the default chain order.

## How to re-benchmark

```bash
npx tsx scripts/benchmark.mts
```

Takes roughly 30-60 seconds depending on how many models are rate limited.
Output is plain text — copy the ranking block into this file and update
`MODEL_CHAIN_IDS` in `lib/models.ts` accordingly.
