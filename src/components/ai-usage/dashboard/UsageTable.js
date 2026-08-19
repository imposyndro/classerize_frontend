"use client";

import { formatUsd, formatTokens, providerColor } from "@/lib/format";

// Compact table of the most recent usage records.
export default function UsageTable({ records = [] }) {
  return (
    <div className="card overflow-hidden">
      <div className="flex items-center justify-between border-b border-surface-border px-5 py-4">
        <h2 className="text-lg font-semibold">Recent usage</h2>
        <span className="text-xs text-content-muted">{records.length} shown</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs uppercase tracking-wide text-content-muted">
              <th className="px-5 py-3 font-medium">Date</th>
              <th className="px-5 py-3 font-medium">Model</th>
              <th className="px-5 py-3 font-medium">Label</th>
              <th className="px-5 py-3 text-right font-medium">Tokens</th>
              <th className="px-5 py-3 text-right font-medium">Cost</th>
            </tr>
          </thead>
          <tbody>
            {records.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-8 text-center text-content-muted">
                  No records yet.
                </td>
              </tr>
            )}
            {records.map((r) => {
              const tokens =
                (r.inputTokens || 0) + (r.cachedInputTokens || 0) + (r.outputTokens || 0);
              const date = new Date(r.occurredAt);
              return (
                <tr key={r.id} className="border-t border-surface-border/70 hover:bg-surface-muted">
                  <td className="whitespace-nowrap px-5 py-3 text-content-muted">
                    {date.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </td>
                  <td className="px-5 py-3">
                    <span className="flex items-center gap-2">
                      <span
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: providerColor(r.model?.provider) }}
                      />
                      {r.model?.displayName || r.model?.name}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-content-muted">{r.label || "—"}</td>
                  <td className="px-5 py-3 text-right">{formatTokens(tokens)}</td>
                  <td className="px-5 py-3 text-right font-medium">{formatUsd(r.costUsd)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
