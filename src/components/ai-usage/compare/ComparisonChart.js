"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatUsd, formatTokens, providerColor } from "@/lib/format";

const METRICS = [
  { key: "cost", label: "Total cost", get: (d) => d.costUsd, fmt: (n) => formatUsd(n) },
  { key: "tokens", label: "Tokens", get: (d) => d.tokens, fmt: (n) => formatTokens(n) },
  {
    key: "avg",
    label: "Avg $/request",
    get: (d) => (d.requests ? d.costUsd / d.requests : 0),
    fmt: (n) => formatUsd(n, { decimals: 4 }),
  },
];

function TooltipBox({ active, payload, fmt }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="card px-3 py-2 text-sm shadow-card">
      <div className="font-medium">{d.model}</div>
      <div className="text-content-muted">{fmt(payload[0].value)}</div>
    </div>
  );
}

export default function ComparisonChart({ data, metric, onMetricChange }) {
  const active = METRICS.find((m) => m.key === metric) || METRICS[0];
  const chartData = data.map((d) => ({ ...d, value: active.get(d) }));

  return (
    <div className="card p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Model comparison</h2>
          <p className="text-xs text-content-muted">{active.label} per model in range</p>
        </div>
        <div className="flex rounded-lg border border-surface-border p-0.5">
          {METRICS.map((m) => (
            <button
              key={m.key}
              onClick={() => onMetricChange?.(m.key)}
              className={`rounded-md px-3 py-1 text-xs font-medium transition ${
                m.key === metric ? "bg-brand-500 text-white" : "text-content-muted hover:text-content"
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      <div className="h-80 w-full">
        {chartData.length === 0 ? (
          <div className="flex h-full items-center justify-center text-sm text-content-muted">
            No data in range
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} layout="vertical" margin={{ left: 8, right: 16 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-surface-border" horizontal={false} />
              <XAxis
                type="number"
                tickFormatter={active.fmt}
                tick={{ fontSize: 11 }}
                stroke="currentColor"
                className="text-content-muted"
              />
              <YAxis
                type="category"
                dataKey="model"
                width={130}
                tick={{ fontSize: 11 }}
                stroke="currentColor"
                className="text-content-muted"
              />
              <Tooltip content={<TooltipBox fmt={active.fmt} />} cursor={{ fill: "currentColor", opacity: 0.05 }} />
              <Bar dataKey="value" radius={[0, 6, 6, 0]}>
                {chartData.map((d) => (
                  <Cell key={d.model} fill={providerColor(d.provider)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
