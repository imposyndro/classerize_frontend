"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import PageContainer from "@/components/ai-usage/layout/PageContainer";
import ComparisonChart from "@/components/ai-usage/compare/ComparisonChart";
import { DEFAULT_FILTER, buildQuery } from "@/lib/filters";
import { formatUsd, providerColor } from "@/lib/format";

const RANGES = [
  { key: "30", label: "30d" },
  { key: "90", label: "90d" },
  { key: "all", label: "All" },
];

export default function ComparePage() {
  const [range, setRange] = useState("90");
  const [metric, setMetric] = useState("cost");
  const [byModel, setByModel] = useState([]);
  const [models, setModels] = useState([]);

  useEffect(() => {
    axios.get("/api/ai-usage/models").then((res) => setModels(res.data.models)).catch(() => {});
  }, []);

  useEffect(() => {
    const qs = buildQuery({ ...DEFAULT_FILTER, range });
    axios.get(`/api/ai-usage/stats/summary?${qs}`).then((res) => setByModel(res.data.byModel)).catch(() => {});
  }, [range]);

  return (
    <PageContainer
      title="Compare models"
      subtitle="Claude vs Gemini vs everything else — on your actual usage and on list price."
      actions={
        <div className="flex rounded-lg border border-surface-border p-0.5">
          {RANGES.map((r) => (
            <button
              key={r.key}
              onClick={() => setRange(r.key)}
              className={`rounded-md px-3 py-1 text-xs font-medium transition ${
                range === r.key ? "bg-brand-500 text-white" : "text-content-muted hover:text-content"
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      }
    >
      <div className="space-y-6">
        <ComparisonChart data={byModel} metric={metric} onMetricChange={setMetric} />

        {/* List-price reference table */}
        <div className="card overflow-hidden">
          <div className="border-b border-surface-border px-5 py-4">
            <h2 className="text-lg font-semibold">List pricing</h2>
            <p className="text-xs text-content-muted">USD per 1M tokens — the catalog used to compute your costs</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-content-muted">
                  <th className="px-5 py-3 font-medium">Model</th>
                  <th className="px-5 py-3 font-medium">Provider</th>
                  <th className="px-5 py-3 text-right font-medium">Input</th>
                  <th className="px-5 py-3 text-right font-medium">Cached input</th>
                  <th className="px-5 py-3 text-right font-medium">Output</th>
                  <th className="px-5 py-3 text-right font-medium">Context</th>
                </tr>
              </thead>
              <tbody>
                {models.map((m) => (
                  <tr key={m.name} className="border-t border-surface-border/70 hover:bg-surface-muted">
                    <td className="px-5 py-3 font-medium">{m.displayName}</td>
                    <td className="px-5 py-3">
                      <span className="flex items-center gap-2 text-content-muted">
                        <span
                          className="h-2 w-2 rounded-full"
                          style={{ backgroundColor: providerColor(m.provider) }}
                        />
                        {m.provider}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right">{formatUsd(m.inputPricePerMTok, { decimals: 2 })}</td>
                    <td className="px-5 py-3 text-right text-content-muted">
                      {formatUsd(m.cachedInputPricePerMTok, { decimals: 2 })}
                    </td>
                    <td className="px-5 py-3 text-right">{formatUsd(m.outputPricePerMTok, { decimals: 2 })}</td>
                    <td className="px-5 py-3 text-right text-content-muted">
                      {(m.contextWindow / 1000).toLocaleString()}K
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
