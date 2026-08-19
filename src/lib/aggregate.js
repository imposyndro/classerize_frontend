// Pure aggregation helpers. Take an array of usage records (each joined with its
// model) and reshape them for charts and KPI cards. No DB access here so these
// are easy to test and reuse on the client.

import { totalTokens } from "./pricing";

// Normalize a Prisma UsageRecord (with `model` included) into a flat shape.
function flatten(record) {
  return {
    id: record.id,
    occurredAt: new Date(record.occurredAt),
    provider: record.model?.provider ?? "Unknown",
    modelName: record.model?.name ?? "unknown",
    modelDisplay: record.model?.displayName ?? record.model?.name ?? "Unknown",
    inputTokens: record.inputTokens,
    cachedInputTokens: record.cachedInputTokens,
    outputTokens: record.outputTokens,
    tokens: totalTokens(record),
    requestCount: record.requestCount,
    costUsd: record.costUsd,
    label: record.label ?? "untagged",
  };
}

function emptyBucket() {
  return { costUsd: 0, tokens: 0, inputTokens: 0, cachedInputTokens: 0, outputTokens: 0, requests: 0, records: 0 };
}

function addInto(bucket, r) {
  bucket.costUsd += r.costUsd;
  bucket.tokens += r.tokens;
  bucket.inputTokens += r.inputTokens;
  bucket.cachedInputTokens += r.cachedInputTokens;
  bucket.outputTokens += r.outputTokens;
  bucket.requests += r.requestCount;
  bucket.records += 1;
}

// Headline totals across all records.
export function summarize(records) {
  const rows = records.map(flatten);
  const totals = emptyBucket();
  rows.forEach((r) => addInto(totals, r));
  return {
    ...totals,
    avgCostPerRequest: totals.requests ? totals.costUsd / totals.requests : 0,
    cacheHitRatio: totals.inputTokens + totals.cachedInputTokens
      ? totals.cachedInputTokens / (totals.inputTokens + totals.cachedInputTokens)
      : 0,
  };
}

// Bucket records by calendar day (UTC). granularity: "day" | "week" | "month".
export function timeSeries(records, granularity = "day") {
  const rows = records.map(flatten);
  const map = new Map();

  for (const r of rows) {
    const key = bucketKey(r.occurredAt, granularity);
    if (!map.has(key)) map.set(key, { date: key, ...emptyBucket() });
    addInto(map.get(key), r);
  }
  return Array.from(map.values()).sort((a, b) => (a.date < b.date ? -1 : 1));
}

function bucketKey(date, granularity) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  if (granularity === "month") return `${y}-${m}`;
  if (granularity === "week") {
    // ISO-ish week start (Monday).
    const tmp = new Date(date);
    const day = (tmp.getDay() + 6) % 7;
    tmp.setDate(tmp.getDate() - day);
    return `${tmp.getFullYear()}-${String(tmp.getMonth() + 1).padStart(2, "0")}-${String(tmp.getDate()).padStart(2, "0")}`;
  }
  return `${y}-${m}-${d}`;
}

// Group by an arbitrary key extractor (model, provider, label).
// `metaFn` optionally captures extra fields from the first row in each group.
function groupBy(records, keyFn, metaFn) {
  const rows = records.map(flatten);
  const map = new Map();
  for (const r of rows) {
    const key = keyFn(r);
    if (!map.has(key)) map.set(key, { key, ...(metaFn ? metaFn(r) : {}), ...emptyBucket() });
    addInto(map.get(key), r);
  }
  return Array.from(map.values()).sort((a, b) => b.costUsd - a.costUsd);
}

export const byModel = (records) =>
  groupBy(records, (r) => r.modelDisplay, (r) => ({ provider: r.provider, modelName: r.modelName })).map(
    (g) => ({ ...g, model: g.key })
  );
export const byProvider = (records) =>
  groupBy(records, (r) => r.provider).map((g) => ({ ...g, provider: g.key }));
export const byLabel = (records) =>
  groupBy(records, (r) => r.label).map((g) => ({ ...g, label: g.key }));

export { flatten };
