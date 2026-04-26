import { useEffect, useMemo, useState } from "react";
import { LoaderCircle, Play, UploadCloud } from "lucide-react";

const initialValueForParam = (param) => {
  if (param.default !== undefined) return param.default;
  if (param.type === "boolean") return false;
  return "";
};

export function ToolForm({ tool, onSubmit, rememberedValues, onValuesChange, loading, activeJob }) {
  const [values, setValues] = useState({});
  const [error, setError] = useState("");

  useEffect(() => {
    if (!tool) return;
    const next = {};
    tool.params.forEach((param) => {
      next[param.name] =
        rememberedValues?.[param.name] !== undefined ? rememberedValues[param.name] : initialValueForParam(param);
    });
    setValues(next);
    setError("");
    // Re-initialize only when switching tools. Including rememberedValues here
    // can clear file inputs because File objects are intentionally not persisted.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tool]);

  const submitLabel = useMemo(() => (tool?.async ? "Queue Job" : "Run Tool"), [tool]);

  if (!tool) {
    return (
      <div className="rounded-[1.75rem] border border-dashed border-slate-300 bg-white/60 p-10 text-center text-slate-500">
        Select a tool to generate its form automatically.
      </div>
    );
  }

  const updateValue = (name, value) => {
    setValues((current) => {
      const next = { ...current, [name]: value };
      onValuesChange?.(next);
      return next;
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    const missing = (tool?.params || [])
      .filter((param) => param.required)
      .filter((param) => {
        const value = values[param.name];
        if (param.type === "file") {
          return !(value instanceof File) && !(typeof value === "string" && value.trim());
        }
        return value === undefined || value === null || value === "";
      })
      .map((param) => param.name);
    if (missing.length) {
      setError(`Missing required parameter(s): ${missing.join(", ")}`);
      return;
    }
    try {
      await onSubmit(values);
    } catch (submissionError) {
      setError(submissionError.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 rounded-[1.75rem] bg-white/90 p-6 shadow-panel">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent">{tool.section === "advanced" ? "Advanced tool" : "Main workflow"}</p>
        <h3 className="mt-2 font-display text-2xl font-semibold text-ink">{tool.name}</h3>
        <p className="mt-2 text-sm leading-6 text-slate-600">{tool.description}</p>
      </div>

      <div className="space-y-4">
        {tool.params.map((param) => (
          <label key={param.name} className="block">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-700">{param.name}</span>
              <span className="text-xs text-slate-400">{param.type}</span>
            </div>
            {["text", "directory", "number", "dropdown", "textarea", "json", "file"].includes(param.type) && (
              <>
                {param.type === "textarea" && (
                  <textarea
                    rows={6}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-accent"
                    value={values[param.name] ?? ""}
                    onChange={(event) => updateValue(param.name, event.target.value)}
                  />
                )}
                {param.type === "json" && (
                  <textarea
                    rows={8}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 font-mono text-sm outline-none transition focus:border-accent"
                    value={typeof values[param.name] === "string" ? values[param.name] : JSON.stringify(values[param.name] ?? {}, null, 2)}
                    onChange={(event) => updateValue(param.name, event.target.value)}
                  />
                )}
                {param.type === "dropdown" && (
                  <select
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-accent"
                    value={values[param.name] ?? ""}
                    onChange={(event) => updateValue(param.name, event.target.value)}
                  >
                    {param.options?.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                )}
                {param.type === "file" && (
                  <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-center">
                    <UploadCloud className="mx-auto mb-3 h-6 w-6 text-slate-400" />
                    <input
                      type="file"
                      accept={param.accept}
                      onChange={(event) => updateValue(param.name, event.target.files?.[0] ?? null)}
                      className="mx-auto block text-sm text-slate-500"
                    />
                    <p className="mt-2 text-xs text-slate-500">
                      {values[param.name] instanceof File
                        ? `Selected: ${values[param.name].name}`
                        : typeof values[param.name] === "string" && values[param.name].trim()
                          ? `Using path: ${values[param.name]}`
                          : "No file selected"}
                    </p>
                    <input
                      type="text"
                      placeholder="Or enter an absolute file path available to backend"
                      className="mt-3 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-accent"
                      value={typeof values[param.name] === "string" ? values[param.name] : ""}
                      onChange={(event) => updateValue(param.name, event.target.value)}
                    />
                  </div>
                )}
                {!["textarea", "json", "dropdown", "file"].includes(param.type) && (
                  <input
                    type={param.type === "number" ? "number" : "text"}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-accent"
                    value={values[param.name] ?? ""}
                    onChange={(event) => updateValue(param.name, event.target.value)}
                  />
                )}
              </>
            )}
            {param.type === "boolean" && (
              <label className="inline-flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm">
                <input
                  type="checkbox"
                  checked={Boolean(values[param.name])}
                  onChange={(event) => updateValue(param.name, event.target.checked)}
                />
                <span>{param.name}</span>
              </label>
            )}
          </label>
        ))}
      </div>

      {activeJob && (
        <div className="rounded-2xl bg-slate-100 px-4 py-3 text-sm text-slate-600">
          Job status: <span className="font-semibold text-ink">{activeJob.status}</span>
          {" · "}
          Progress: <span className="font-semibold text-ink">{activeJob.progress ?? 0}%</span>
          {activeJob.message ? ` · ${activeJob.message}` : ""}
        </div>
      )}

      {error && <div className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>}

      <button
        type="submit"
        disabled={loading}
        className="inline-flex items-center gap-2 rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
        {submitLabel}
      </button>
    </form>
  );
}

