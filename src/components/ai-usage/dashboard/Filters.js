"use client";

const RANGES = [
  { key: "7", label: "7d" },
  { key: "30", label: "30d" },
  { key: "90", label: "90d" },
  { key: "all", label: "All" },
];

const GRANULARITIES = [
  { key: "day", label: "Day" },
  { key: "week", label: "Week" },
  { key: "month", label: "Month" },
];

// Controlled filter bar. `value` = { range, provider, model, granularity }.
export default function Filters({ value, onChange, models = [] }) {
  const providers = Array.from(new Set(models.map((m) => m.provider)));
  const modelOptions = value.provider
    ? models.filter((m) => m.provider === value.provider)
    : models;

  const set = (patch) => onChange({ ...value, ...patch });

  return (
    <div className="card flex flex-wrap items-center gap-3 p-4">
      {/* Date range */}
      <div className="flex rounded-lg border border-surface-border p-0.5">
        {RANGES.map((r) => (
          <button
            key={r.key}
            onClick={() => set({ range: r.key })}
            className={`rounded-md px-3 py-1 text-xs font-medium transition ${
              value.range === r.key ? "bg-brand-500 text-white" : "text-content-muted hover:text-content"
            }`}
          >
            {r.label}
          </button>
        ))}
      </div>

      {/* Provider */}
      <select
        value={value.provider}
        onChange={(e) => set({ provider: e.target.value, model: "" })}
        className="rounded-lg border-surface-border bg-surface py-1.5 text-sm text-content focus:border-brand-500 focus:ring-brand-500"
      >
        <option value="">All providers</option>
        {providers.map((p) => (
          <option key={p} value={p}>
            {p}
          </option>
        ))}
      </select>

      {/* Model */}
      <select
        value={value.model}
        onChange={(e) => set({ model: e.target.value })}
        className="rounded-lg border-surface-border bg-surface py-1.5 text-sm text-content focus:border-brand-500 focus:ring-brand-500"
      >
        <option value="">All models</option>
        {modelOptions.map((m) => (
          <option key={m.name} value={m.name}>
            {m.displayName}
          </option>
        ))}
      </select>

      {/* Granularity */}
      <div className="ml-auto flex rounded-lg border border-surface-border p-0.5">
        {GRANULARITIES.map((g) => (
          <button
            key={g.key}
            onClick={() => set({ granularity: g.key })}
            className={`rounded-md px-3 py-1 text-xs font-medium transition ${
              value.granularity === g.key ? "bg-brand-500 text-white" : "text-content-muted hover:text-content"
            }`}
          >
            {g.label}
          </button>
        ))}
      </div>
    </div>
  );
}
