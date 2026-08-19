// Cost computation — the single source of truth for turning token counts into USD.
//
// Convention (matches provider `usage` objects):
//   inputTokens        = UNCACHED input tokens (full price)
//   cachedInputTokens  = cache-read input tokens (discounted)
//   outputTokens       = output tokens
// Prices on a Model are USD per 1,000,000 tokens.

const TOKENS_PER_MILLION = 1_000_000;

export function computeCostUsd(model, usage = {}) {
  if (!model) return 0;
  const inputTokens = Number(usage.inputTokens) || 0;
  const cachedInputTokens = Number(usage.cachedInputTokens) || 0;
  const outputTokens = Number(usage.outputTokens) || 0;

  const cost =
    (inputTokens * model.inputPricePerMTok +
      cachedInputTokens * model.cachedInputPricePerMTok +
      outputTokens * model.outputPricePerMTok) /
    TOKENS_PER_MILLION;

  // Round to 6 decimal places to avoid floating-point noise on tiny amounts.
  return Math.round(cost * 1e6) / 1e6;
}

// Total tokens for a record/usage object (used for token-volume charts).
export function totalTokens(usage = {}) {
  return (
    (Number(usage.inputTokens) || 0) +
    (Number(usage.cachedInputTokens) || 0) +
    (Number(usage.outputTokens) || 0)
  );
}

// Effective blended price ($/MTok) given a usage mix — handy for comparisons.
export function blendedPricePerMTok(model, usage = {}) {
  const tokens = totalTokens(usage);
  if (!tokens) return 0;
  return (computeCostUsd(model, usage) / tokens) * TOKENS_PER_MILLION;
}
