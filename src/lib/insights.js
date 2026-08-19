// Optimization rules engine. Given usage records (joined with model) and the
// pricing catalog, returns a list of actionable suggestions. Pure + deterministic.

import { summarize, byModel, byLabel, timeSeries, flatten } from "./aggregate";

const fmtUsd = (n) => `$${n.toFixed(2)}`;
const fmtPct = (n) => `${(n * 100).toFixed(0)}%`;

export function generateInsights(records, models = []) {
  if (!records.length) return [];

  const insights = [];
  const totals = summarize(records);
  const perModel = byModel(records);
  const perLabel = byLabel(records);
  const rows = records.map(flatten);

  // 1) Spend concentration ---------------------------------------------------
  const top = perModel[0];
  if (top && totals.costUsd > 0) {
    const share = top.costUsd / totals.costUsd;
    if (share > 0.4) {
      insights.push({
        id: "concentration",
        severity: share > 0.6 ? "high" : "medium",
        title: "Spend is concentrated in one model",
        detail: `${top.model} accounts for ${fmtPct(share)} of total spend (${fmtUsd(top.costUsd)}). A small efficiency win here moves your whole bill.`,
        metric: fmtPct(share),
      });
    }
  }

  // 2) Cheaper-model substitution -------------------------------------------
  // For the top-spend model, find a cheaper model (prefer same provider) and
  // estimate savings if ~40% of its workload moved over.
  if (top) {
    const topRows = rows.filter((r) => r.modelDisplay === top.model);
    const topModel = models.find((m) => m.displayName === top.model || m.name === topRows[0]?.modelName);
    if (topModel) {
      const cheaper = models
        .filter((m) => m.active && m.outputPricePerMTok < topModel.outputPricePerMTok)
        .sort((a, b) => {
          // prefer same provider, then closest-but-cheaper output price
          const sp = (b.provider === topModel.provider) - (a.provider === topModel.provider);
          if (sp !== 0) return sp;
          return b.outputPricePerMTok - a.outputPricePerMTok;
        })[0];

      if (cheaper) {
        // Estimate current vs. alternative cost on the top model's token mix.
        const mix = topRows.reduce(
          (acc, r) => {
            acc.inputTokens += r.inputTokens;
            acc.cachedInputTokens += r.cachedInputTokens;
            acc.outputTokens += r.outputTokens;
            return acc;
          },
          { inputTokens: 0, cachedInputTokens: 0, outputTokens: 0 }
        );
        const M = 1_000_000;
        const altCost =
          (mix.inputTokens * cheaper.inputPricePerMTok +
            mix.cachedInputTokens * cheaper.cachedInputPricePerMTok +
            mix.outputTokens * cheaper.outputPricePerMTok) /
          M;
        const movable = 0.4; // assume 40% of work is simple enough to downgrade
        const savings = Math.max(0, (top.costUsd - altCost) * movable);
        if (savings > 0.5) {
          insights.push({
            id: "substitution",
            severity: "medium",
            title: `Route simpler ${top.model} traffic to ${cheaper.displayName}`,
            detail: `If ~40% of ${top.model} requests are simple enough for ${cheaper.displayName}, you could save about ${fmtUsd(savings)} over this period at the same token volume.`,
            metric: `~${fmtUsd(savings)}`,
          });
        }
      }
    }
  }

  // 3) Low cache-hit ratio ---------------------------------------------------
  if (totals.inputTokens > 0 && totals.cacheHitRatio < 0.2) {
    // Rough upside: caching ~30% of currently-uncached input at ~90% discount.
    const avgInputPrice = weightedAvgInputPrice(perModel, models);
    const cacheableTokens = totals.inputTokens * 0.3;
    const potential = (cacheableTokens * avgInputPrice * 0.9) / 1_000_000;
    if (potential > 0.25) {
      insights.push({
        id: "cache",
        severity: "medium",
        title: "Low prompt-cache utilization",
        detail: `Only ${fmtPct(totals.cacheHitRatio)} of input tokens are served from cache. Caching stable prompt prefixes (system prompts, shared context) could recover roughly ${fmtUsd(potential)}.`,
        metric: fmtPct(totals.cacheHitRatio),
      });
    }
  }

  // 4) Cost-per-task breakdown ----------------------------------------------
  const topLabel = perLabel[0];
  if (topLabel && perLabel.length > 1 && totals.costUsd > 0) {
    insights.push({
      id: "task",
      severity: "low",
      title: `"${topLabel.label}" is your most expensive workflow`,
      detail: `It drives ${fmtUsd(topLabel.costUsd)} (${fmtPct(topLabel.costUsd / totals.costUsd)}) across ${topLabel.records} logged events. Worth profiling its prompts for token bloat.`,
      metric: fmtUsd(topLabel.costUsd),
    });
  }

  // 5) Projected monthly spend ----------------------------------------------
  const daily = timeSeries(records, "day");
  if (daily.length >= 7) {
    const recent = daily.slice(-14);
    const avgPerDay = recent.reduce((s, d) => s + d.costUsd, 0) / recent.length;
    const projected = avgPerDay * 30;
    insights.push({
      id: "projection",
      severity: "low",
      title: "Projected monthly spend",
      detail: `Based on your last ${recent.length} days (${fmtUsd(avgPerDay)}/day on average), you're trending toward about ${fmtUsd(projected)} over a 30-day month.`,
      metric: fmtUsd(projected),
    });
  }

  return insights;
}

function weightedAvgInputPrice(perModel, models) {
  let weightedSum = 0;
  let tokenSum = 0;
  for (const g of perModel) {
    const model = models.find((m) => m.displayName === g.model || m.name === g.model);
    if (!model) continue;
    weightedSum += model.inputPricePerMTok * (g.inputTokens || 0);
    tokenSum += g.inputTokens || 0;
  }
  return tokenSum ? weightedSum / tokenSum : 3; // fallback ~$3/MTok
}
