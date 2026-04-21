export function StatCard({ label, value, tone = "default" }) {
  const toneClass =
    tone === "accent"
      ? "from-accent/10 to-accent/5"
      : tone === "warn"
        ? "from-amber-400/20 to-orange-500/10"
        : "from-white to-white/80";

  return (
    <div className={`rounded-[1.75rem] border border-white/70 bg-gradient-to-br ${toneClass} p-5 shadow-panel`}>
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-3 font-display text-3xl font-semibold text-ink">{value}</p>
    </div>
  );
}

