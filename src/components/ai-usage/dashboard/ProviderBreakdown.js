"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { formatUsd, providerColor } from "@/lib/format";

function TooltipBox({ active, payload }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="card px-3 py-2 text-sm shadow-card">
      <div className="font-medium">{d.provider}</div>
      <div className="text-content-muted">{formatUsd(d.costUsd)}</div>
    </div>
  );
}

export default function ProviderBreakdown({ data }) {
  const total = data.reduce((s, d) => s + d.costUsd, 0);

  return (
    <div className="card p-5">
      <h2 className="text-lg font-semibold">Spend by provider</h2>
      <p className="text-xs text-content-muted">Share of total cost</p>

      <div className="mt-2 h-56 w-full">
        {total === 0 ? (
          <div className="flex h-full items-center justify-center text-sm text-content-muted">
            No data
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="costUsd"
                nameKey="provider"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={2}
                stroke="none"
              >
                {data.map((d) => (
                  <Cell key={d.provider} fill={providerColor(d.provider)} />
                ))}
              </Pie>
              <Tooltip content={<TooltipBox />} />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="mt-2 space-y-2">
        {data.map((d) => (
          <div key={d.provider} className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: providerColor(d.provider) }}
              />
              {d.provider}
            </span>
            <span className="text-content-muted">
              {formatUsd(d.costUsd)} · {total ? Math.round((d.costUsd / total) * 100) : 0}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
