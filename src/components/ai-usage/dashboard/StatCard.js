// A KPI card with an icon, value, label, and optional sublabel.
export default function StatCard({ icon: Icon, label, value, sub, accent = "text-brand-500" }) {
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-content-muted">{label}</span>
        {Icon && (
          <span className={`flex h-8 w-8 items-center justify-center rounded-lg bg-surface-muted ${accent}`}>
            <Icon size={16} />
          </span>
        )}
      </div>
      <div className="mt-3 font-heading text-2xl font-bold">{value}</div>
      {sub && <div className="mt-1 text-xs text-content-muted">{sub}</div>}
    </div>
  );
}
