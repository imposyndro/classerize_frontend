// Small display formatters shared across components.

export function formatUsd(n, opts = {}) {
  const value = Number(n) || 0;
  const decimals = opts.decimals ?? (Math.abs(value) < 100 ? 2 : 0);
  return `$${value.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })}`;
}

export function formatTokens(n) {
  const value = Number(n) || 0;
  if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(2)}B`;
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(2)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return String(value);
}

export function formatNumber(n) {
  return (Number(n) || 0).toLocaleString("en-US");
}

export function formatPercent(n, decimals = 0) {
  return `${((Number(n) || 0) * 100).toFixed(decimals)}%`;
}

// Stable color per provider for charts/badges.
export const PROVIDER_COLORS = {
  Anthropic: "#d97757",
  Google: "#4285f4",
  OpenAI: "#10a37f",
  Unknown: "#94a3b8",
};

export function providerColor(provider) {
  return PROVIDER_COLORS[provider] || "#6366f1";
}

// A palette for per-model series (cycled).
export const SERIES_COLORS = [
  "#6366f1",
  "#d97757",
  "#4285f4",
  "#10b981",
  "#f59e0b",
  "#ec4899",
  "#8b5cf6",
];
