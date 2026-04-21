import { Info, Sparkles } from "lucide-react";

export function ToolCard({ tool, onSelect }) {
  return (
    <button
      type="button"
      onClick={() => onSelect(tool)}
      className="group rounded-[1.75rem] border border-white/70 bg-white/90 p-5 text-left shadow-panel transition hover:-translate-y-1 hover:border-accent/30"
    >
      <div className="mb-3 flex items-center justify-between">
        <span className="rounded-full bg-accent/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-accent">
          {tool.section === "advanced" ? "Advanced" : "Workflow"}
        </span>
        <Sparkles className="h-4 w-4 text-gold transition group-hover:text-amber-500" />
      </div>
      <h3 className="font-display text-lg font-semibold text-ink">{tool.name}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-600">{tool.description}</p>
      <div className="mt-4 flex items-center gap-2 text-xs text-slate-500">
        <Info className="h-3.5 w-3.5" />
        <span>{tool.params.length} parameter(s)</span>
      </div>
    </button>
  );
}

