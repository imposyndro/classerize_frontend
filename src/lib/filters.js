// Client-safe helpers for turning dashboard filter state into a query string.

export const DEFAULT_FILTER = {
  range: "30",
  provider: "",
  model: "",
  granularity: "day",
};

export function buildQuery(filter = DEFAULT_FILTER) {
  const params = new URLSearchParams();

  if (filter.range && filter.range !== "all") {
    const days = parseInt(filter.range, 10);
    if (Number.isFinite(days)) {
      const from = new Date();
      from.setDate(from.getDate() - days);
      from.setHours(0, 0, 0, 0);
      params.set("from", from.toISOString());
    }
  }
  if (filter.provider) params.set("provider", filter.provider);
  if (filter.model) params.set("model", filter.model);
  if (filter.granularity) params.set("granularity", filter.granularity);

  return params.toString();
}
