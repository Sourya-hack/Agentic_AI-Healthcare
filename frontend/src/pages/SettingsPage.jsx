export function SettingsPage({ health }) {
  const settings = [
    ["API Base URL", import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api"],
    ["Torch available", health?.torch_available ? "Yes" : "No"],
    ["Artifacts folder", health?.artifacts_dir],
    ["Notebook source", health?.source_file],
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-semibold text-ink">Settings</h1>
        <p className="mt-2 text-sm text-slate-600">Environment details, backend wiring, and deployment-sensitive values.</p>
      </div>
      <div className="rounded-[1.75rem] bg-white/90 p-6 shadow-panel">
        <dl className="space-y-4">
          {settings.map(([label, value]) => (
            <div key={label} className="grid gap-2 md:grid-cols-[220px_1fr]">
              <dt className="text-sm font-semibold text-slate-500">{label}</dt>
              <dd className="break-all text-sm text-slate-700">{value || "—"}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}

