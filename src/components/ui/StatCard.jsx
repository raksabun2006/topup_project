export function StatCard({ icon: Icon, label, value, hint, accent = 'emerald' }) {
  const accents = {
    emerald: 'bg-emerald-500/10 text-emerald-600',
    amber: 'bg-amber-500/10 text-amber-700',
    rose: 'bg-rose-500/10 text-rose-700',
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-ink-900 p-6 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-500">{label}</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">{value}</p>
          {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
        </div>
        <div className={`rounded-xl p-3 ${accents[accent]}`}>
          <Icon size={22} />
        </div>
      </div>
    </div>
  );
}