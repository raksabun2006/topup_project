export function StatCard({ icon: Icon, label, value, hint, accent = 'purple' }) {
  const accents = {
    purple: 'bg-purple-500/10 text-purple-400',
    emerald: 'bg-emerald-500/10 text-emerald-400',
    amber: 'bg-amber-500/10 text-amber-400',
    rose: 'bg-rose-500/10 text-rose-400',
  };

  return (
    <div className="rounded-2xl border border-purple-900/30 bg-ink-900 p-6 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-400">{label}</p>
          <p className="mt-2 text-3xl font-bold text-white">{value}</p>
          {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
        </div>
        <div className={`rounded-xl p-3 ${accents[accent]}`}>
          <Icon size={22} />
        </div>
      </div>
    </div>
  );
}