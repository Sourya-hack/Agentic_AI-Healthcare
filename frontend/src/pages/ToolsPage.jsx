import { SearchBar } from "../components/SearchBar";
import { ToolCard } from "../components/ToolCard";
import { ToolForm } from "../components/ToolForm";
import { ResultRenderer } from "../components/ResultRenderer";

export function ToolsPage({
  title,
  tools,
  query,
  setQuery,
  selectedTool,
  setSelectedTool,
  onSubmit,
  rememberedValues,
  onValuesChange,
  loading,
  latestResult,
  activeJob,
}) {
  return (
    <div className="grid gap-6 xl:grid-cols-[1.1fr_1.1fr_1.2fr]">
      <div className="space-y-4">
        <div>
          <h1 className="font-display text-3xl font-semibold text-ink">{title}</h1>
          <p className="mt-2 text-sm text-slate-600">Browse, search, and run every extracted function from the original notebook pipeline.</p>
        </div>
        <SearchBar value={query} onChange={setQuery} />
        <div className="grid gap-4">
          {tools.map((tool) => (
            <ToolCard key={tool.id} tool={tool} onSelect={setSelectedTool} />
          ))}
        </div>
      </div>
      <ToolForm
        tool={selectedTool}
        onSubmit={onSubmit}
        rememberedValues={rememberedValues}
        onValuesChange={onValuesChange}
        loading={loading}
        activeJob={activeJob}
      />
      <ResultRenderer result={latestResult} />
    </div>
  );
}

