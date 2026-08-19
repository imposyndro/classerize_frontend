"use client";

import { FiAlertTriangle, FiTrendingDown, FiInfo } from "react-icons/fi";

const SEVERITY = {
  high: { icon: FiAlertTriangle, ring: "border-red-500/30", badge: "bg-red-500/10 text-red-500", label: "High impact" },
  medium: { icon: FiTrendingDown, ring: "border-amber-500/30", badge: "bg-amber-500/10 text-amber-500", label: "Opportunity" },
  low: { icon: FiInfo, ring: "border-brand-500/30", badge: "bg-brand-500/10 text-brand-500", label: "FYI" },
};

export default function InsightCard({ insight }) {
  const s = SEVERITY[insight.severity] || SEVERITY.low;
  const Icon = s.icon;

  return (
    <div className={`card border ${s.ring} p-5`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <span className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${s.badge}`}>
            <Icon size={18} />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold">{insight.title}</h3>
            </div>
            <p className="mt-1 text-sm text-content-muted">{insight.detail}</p>
          </div>
        </div>
        {insight.metric && (
          <div className="shrink-0 text-right">
            <div className="font-heading text-xl font-bold">{insight.metric}</div>
            <span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-medium ${s.badge}`}>
              {s.label}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
