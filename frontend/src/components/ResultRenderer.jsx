import { Download } from "lucide-react";
import { BarChart, Bar, CartesianGrid, PieChart, Pie, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { api } from "../services/api";
import { shortValue } from "../utils/format";

function TableView({ data }) {
  const columns = data.columns || Object.keys(data.rows?.[0] || {});
  return (
    <div className="overflow-auto rounded-2xl border border-slate-200">
      <table className="min-w-full divide-y divide-slate-200 text-sm">
        <thead className="bg-slate-50">
          <tr>
            {columns.map((column) => (
              <th key={column} className="px-4 py-3 text-left font-semibold text-slate-600">
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">
          {(data.rows || []).map((row, index) => (
            <tr key={`${index}-${columns[0]}`}>
              {columns.map((column) => (
                <td key={column} className="px-4 py-3 align-top text-slate-700">
                  {shortValue(row[column])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ChartView({ objectValue }) {
  const entries = Object.entries(objectValue || {}).map(([name, value]) => ({ name, value }));
  if (!entries.length) return null;
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="h-72 rounded-2xl bg-slate-50 p-3">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={entries}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" hide />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" fill="#0f766e" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="h-72 rounded-2xl bg-slate-50 p-3">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={entries} dataKey="value" nameKey="name" outerRadius={90} label>
              {entries.map((entry, index) => (
                <Cell key={entry.name} fill={["#0f766e", "#c2410c", "#ca8a04", "#1d4ed8", "#be185d"][index % 5]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function ResultRenderer({ result }) {
  if (!result) {
    return (
      <div className="rounded-[1.75rem] border border-dashed border-slate-300 bg-white/60 p-10 text-center text-slate-500">
        Tool results, logs, tables, charts, and downloads will appear here.
      </div>
    );
  }

  const artifacts = result.artifacts || [];
  const preview = result.preview;

  return (
    <div className="space-y-5 rounded-[1.75rem] bg-white/90 p-6 shadow-panel">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-gold">Output</p>
          <h3 className="mt-2 font-display text-2xl font-semibold text-ink">Execution Results</h3>
        </div>
      </div>

      {preview?.type === "table" && <TableView data={preview} />}
      {!preview?.type && preview?.rows && <TableView data={preview} />}
      {!preview?.type && preview && Array.isArray(preview) && preview.length > 0 && <TableView data={{ rows: preview, columns: Object.keys(preview[0]) }} />}
      {!preview?.type && preview && !Array.isArray(preview) && preview.rows && <TableView data={preview} />}

      {result.history && <ChartView objectValue={{ train_loss_last: result.history.train_loss?.slice(-1)[0], val_loss_last: result.history.val_loss?.slice(-1)[0], val_auc_last: result.history.val_auc?.slice(-1)[0] }} />}
      {result.error_distribution && <ChartView objectValue={result.error_distribution} />}
      {result.top_confused_pairs && !Array.isArray(result.top_confused_pairs) && <ChartView objectValue={result.top_confused_pairs} />}
      {result.summary && !Array.isArray(result.summary) && (
        <div className="rounded-2xl bg-slate-50 p-4">
          <pre className="overflow-auto whitespace-pre-wrap text-sm text-slate-700">{JSON.stringify(result.summary, null, 2)}</pre>
        </div>
      )}
      {!result.summary && !preview && (
        <div className="rounded-2xl bg-slate-50 p-4">
          <pre className="overflow-auto whitespace-pre-wrap text-sm text-slate-700">{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}

      {artifacts.length > 0 && (
        <div>
          <h4 className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Downloads</h4>
          <div className="grid gap-3 md:grid-cols-2">
            {artifacts.map((artifact) => (
              <a
                key={artifact.path}
                href={api.downloadUrl(artifact.path)}
                className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 transition hover:border-accent/40"
              >
                <span>{artifact.label}</span>
                <Download className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

