"use client";

import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { FiDollarSign, FiCpu, FiActivity, FiDatabase } from "react-icons/fi";
import PageContainer from "@/components/ai-usage/layout/PageContainer";
import StatCard from "@/components/ai-usage/dashboard/StatCard";
import Filters from "@/components/ai-usage/dashboard/Filters";
import TrendChart from "@/components/ai-usage/dashboard/TrendChart";
import ProviderBreakdown from "@/components/ai-usage/dashboard/ProviderBreakdown";
import UsageTable from "@/components/ai-usage/dashboard/UsageTable";
import { DEFAULT_FILTER, buildQuery } from "@/lib/filters";
import { formatUsd, formatTokens, formatNumber, formatPercent } from "@/lib/format";

export default function DashboardPage() {
  const [filter, setFilter] = useState(DEFAULT_FILTER);
  const [metric, setMetric] = useState("cost");
  const [models, setModels] = useState([]);
  const [stats, setStats] = useState(null);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load the model catalog once.
  useEffect(() => {
    axios.get("/api/ai-usage/models").then((res) => setModels(res.data.models)).catch(() => {});
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    const qs = buildQuery(filter);
    try {
      const [summaryRes, usageRes] = await Promise.all([
        axios.get(`/api/ai-usage/stats/summary?${qs}`),
        axios.get(`/api/ai-usage/usage?${qs}&limit=12`),
      ]);
      setStats(summaryRes.data);
      setRecords(usageRes.data.records);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    load();
  }, [load]);

  const totals = stats?.totals;

  return (
    <PageContainer
      title="Dashboard"
      subtitle="Token usage and cost across every model you track."
    >
      <div className="space-y-6">
        <Filters value={filter} onChange={setFilter} models={models} />

        {/* KPI cards */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard
            icon={FiDollarSign}
            label="Total spend"
            value={totals ? formatUsd(totals.costUsd) : "—"}
            sub={totals ? `${formatNumber(totals.requests)} requests` : ""}
          />
          <StatCard
            icon={FiCpu}
            label="Tokens"
            value={totals ? formatTokens(totals.tokens) : "—"}
            sub={totals ? `${formatTokens(totals.outputTokens)} output` : ""}
            accent="text-anthropic"
          />
          <StatCard
            icon={FiActivity}
            label="Avg cost / request"
            value={totals ? formatUsd(totals.avgCostPerRequest, { decimals: 4 }) : "—"}
            accent="text-google"
          />
          <StatCard
            icon={FiDatabase}
            label="Cache hit rate"
            value={totals ? formatPercent(totals.cacheHitRatio) : "—"}
            sub="of input tokens"
            accent="text-brand-500"
          />
        </div>

        {/* Charts */}
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <TrendChart data={stats?.series || []} metric={metric} onMetricChange={setMetric} />
          </div>
          <ProviderBreakdown data={stats?.byProvider || []} />
        </div>

        <UsageTable records={records} />

        {loading && <p className="text-center text-sm text-content-muted">Loading…</p>}
      </div>
    </PageContainer>
  );
}
