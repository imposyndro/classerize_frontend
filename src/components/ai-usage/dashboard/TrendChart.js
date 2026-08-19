"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatUsd, formatTokens } from "@/lib/format";

const METRICS = [
  { key: "cost", label: "Cost", fmt: (n) => formatUsd(n), dataKey: "costUsd", color: "#6366f1" },
  { key: "tokens", label: "Tokens", fmt: (n) => formatTokens(n), dataKey: "tokens", color: "#d97757" },
];

function ChartTooltip({ active, payload, label, fmt }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="card px-3 py-2 text-sm shadow-card">
      <div className="font-medium">{label}</div>
      <div className="text-content-muted">{fmt(payload[0].value)}</div>
    </div>
  );
}

export default function TrendChart({ data, metric = "cost", onMetricChange }) {
  const active = METRICS.find((m) => m.key === metric) || METRICS[0];

  return (
    <div className="card p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Usage over time</h2>
          <p className="text-xs text-content-muted">Daily {active.label.toLowerCase()} for the selected range</p>
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

      <div className="h-72 w-full">
        {data.length === 0 ? (
          <EmptyChart />
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 5, right: 8, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={active.color} stopOpacity={0.45} />
                  <stop offset="100%" stopColor={active.color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-surface-border" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11 }}
                stroke="currentColor"
                className="text-content-muted"
                minTickGap={24}
              />
              <YAxis
                tick={{ fontSize: 11 }}
                stroke="currentColor"
                className="text-content-muted"
                tickFormatter={active.fmt}
                width={56}
              />
              <Tooltip content={<ChartTooltip fmt={active.fmt} />} />
              <Area
                type="monotone"
                dataKey={active.dataKey}
                stroke={active.color}
                strokeWidth={2}
                fill="url(#trendFill)"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}

function EmptyChart() {
  return (
    <div className="flex h-full items-center justify-center text-sm text-content-muted">
      No usage in this range. Try widening the filters or importing data.
    </div>
  );
}
