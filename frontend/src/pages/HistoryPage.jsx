import { api } from "../services/api";
import { shortValue } from "../utils/format";

export function HistoryPage({ history }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-semibold text-ink">History / Results</h1>
        <p className="mt-2 text-sm text-slate-600">Every completed synchronous API execution is recorded here with payloads and outputs.</p>
      </div>
      <div className="space-y-4">
        {history.map((item, index) => (
          <div key={`${item.tool_id}-${index}`} className="rounded-[1.75rem] bg-white/90 p-6 shadow-panel">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent">{item.tool_id}</p>
                <h3 className="mt-2 font-display text-xl font-semibold text-ink">{item.tool_name}</h3>
              </div>
              {(item.result?.artifacts || []).length > 0 && (
                <a
                  href={api.downloadUrl(item.result.artifacts[0].path)}
                  className="rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white"
                >
                  Download first artifact
                </a>
              )}
            </div>
            <div className="mt-4 grid gap-4 lg:grid-cols-2">
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Payload</p>
                <pre className="overflow-auto whitespace-pre-wrap text-sm text-slate-700">{JSON.stringify(item.payload, null, 2)}</pre>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Result Snapshot</p>
                <pre className="overflow-auto whitespace-pre-wrap text-sm text-slate-700">{shortValue(item.result)}</pre>
              </div>
            </div>
          </div>
        ))}
        {history.length === 0 && <div className="rounded-[1.75rem] bg-white/70 p-8 text-sm text-slate-500 shadow-panel">No executions yet.</div>}
      </div>
    </div>
  );
}

