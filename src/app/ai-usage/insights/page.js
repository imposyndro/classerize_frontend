"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { FiZap } from "react-icons/fi";
import PageContainer from "@/components/ai-usage/layout/PageContainer";
import InsightCard from "@/components/ai-usage/insights/InsightCard";

export default function InsightsPage() {
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get("/api/ai-usage/insights")
      .then((res) => setInsights(res.data.insights))
      .finally(() => setLoading(false));
  }, []);

  return (
    <PageContainer
      title="Optimization insights"
      subtitle="Concrete ways to cut spend, generated from your tracked usage."
    >
      {loading ? (
        <p className="text-sm text-content-muted">Analyzing your usage…</p>
      ) : insights.length === 0 ? (
        <div className="card flex flex-col items-center gap-3 p-12 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-500/10 text-brand-500">
            <FiZap size={22} />
          </span>
          <h3 className="text-lg font-semibold">No insights yet</h3>
          <p className="max-w-sm text-sm text-content-muted">
            Import or log some usage and we&apos;ll surface cost-saving opportunities here.
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {insights.map((insight) => (
            <InsightCard key={insight.id} insight={insight} />
          ))}
        </div>
      )}
    </PageContainer>
  );
}
