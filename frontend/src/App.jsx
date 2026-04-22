import { useEffect, useMemo, useState } from "react";
import { Route, Routes } from "react-router-dom";
import { Sidebar } from "./components/Sidebar";
import { HomePage } from "./pages/HomePage";
import { ToolsPage } from "./pages/ToolsPage";
import { HistoryPage } from "./pages/HistoryPage";
import { SettingsPage } from "./pages/SettingsPage";
import { api } from "./services/api";
import { usePolling } from "./hooks/usePolling";

const TOOL_MEMORY_KEY = "toolFormMemoryV1";

export default function App() {
  const [tools, setTools] = useState([]);
  const [health, setHealth] = useState(null);
  const [history, setHistory] = useState([]);
  const [query, setQuery] = useState("");
  const [selectedTool, setSelectedTool] = useState(null);
  const [latestResult, setLatestResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeJob, setActiveJob] = useState(null);
  const [toolFormMemory, setToolFormMemory] = useState(() => {
    try {
      const raw = localStorage.getItem(TOOL_MEMORY_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    localStorage.setItem(TOOL_MEMORY_KEY, JSON.stringify(toolFormMemory));
  }, [toolFormMemory]);

  const loadDashboard = async () => {
    const [toolsResponse, healthResponse, historyResponse] = await Promise.all([
      api.getTools(),
      api.getHealth(),
      api.getHistory(),
    ]);
    setTools(toolsResponse.tools);
    setHealth(healthResponse);
    setHistory(historyResponse.items || []);
    setSelectedTool((current) => current || toolsResponse.tools[0] || null);
  };

  useEffect(() => {
    loadDashboard().catch((error) => setLatestResult({ summary: { error: error.message } }));
  }, []);

  usePolling(
    async () => {
      try {
        if (!activeJob?.id) return;
        const job = await api.getJob(activeJob.id);
        setActiveJob(job);
        if (job.status === "completed") {
          setLatestResult(job.result);
          setLoading(false);
          setActiveJob(null);
          loadDashboard().catch(() => {});
        }
        if (job.status === "failed") {
          setLatestResult({ summary: { error: job.error || "Job failed" } });
          setLoading(false);
          setActiveJob(null);
        }
      } catch (error) {
        setLatestResult({ summary: { error: error.message || "Failed to fetch job status" } });
        setLoading(false);
        setActiveJob(null);
      }
    },
    Boolean(activeJob?.id),
    3000,
  );

  const mainTools = useMemo(
    () => tools.filter((tool) => tool.section === "main" && `${tool.name} ${tool.description}`.toLowerCase().includes(query.toLowerCase())),
    [tools, query],
  );

  const advancedTools = useMemo(
    () => tools.filter((tool) => tool.section === "advanced" && `${tool.name} ${tool.description}`.toLowerCase().includes(query.toLowerCase())),
    [tools, query],
  );

  const execute = async (values) => {
    setLoading(true);
    try {
      const response = await api.executeTool(selectedTool.id, values);
      if (response.job_id) {
        setActiveJob({ id: response.job_id, status: response.status, progress: 0 });
        return;
      }
      setLatestResult(response.result);
      await loadDashboard();
    } catch (error) {
      // Keep result panel informative even when request fails.
      setLatestResult({ summary: { error: error.message || "Tool execution failed" } });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateToolFormMemory = (toolId, values) => {
    if (!toolId) return;
    // Persist only serializable values. File objects stay in-memory in ToolForm state.
    const serializable = Object.fromEntries(
      Object.entries(values || {}).filter(([, value]) => !(value instanceof File)),
    );
    setToolFormMemory((current) => ({ ...current, [toolId]: serializable }));
  };

  return (
    <div className="min-h-screen px-4 py-4 lg:px-6">
      <div className="mx-auto grid max-w-[1600px] gap-6 lg:grid-cols-[280px_1fr]">
        <Sidebar />
        <main className="rounded-[2rem] bg-white/50 p-6 backdrop-blur-sm lg:p-8">
          <Routes>
            <Route path="/" element={<HomePage health={health} tools={tools} />} />
            <Route
              path="/tools"
              element={
                <ToolsPage
                  title="Main Tools"
                  tools={mainTools}
                  query={query}
                  setQuery={setQuery}
                  selectedTool={selectedTool}
                  setSelectedTool={setSelectedTool}
                  onSubmit={execute}
                  rememberedValues={toolFormMemory[selectedTool?.id] || {}}
                  onValuesChange={(values) => updateToolFormMemory(selectedTool?.id, values)}
                  loading={loading}
                  latestResult={latestResult}
                  activeJob={activeJob}
                />
              }
            />
            <Route
              path="/advanced"
              element={
                <ToolsPage
                  title="Advanced Tools"
                  tools={advancedTools}
                  query={query}
                  setQuery={setQuery}
                  selectedTool={selectedTool}
                  setSelectedTool={setSelectedTool}
                  onSubmit={execute}
                  rememberedValues={toolFormMemory[selectedTool?.id] || {}}
                  onValuesChange={(values) => updateToolFormMemory(selectedTool?.id, values)}
                  loading={loading}
                  latestResult={latestResult}
                  activeJob={activeJob}
                />
              }
            />
            <Route path="/history" element={<HistoryPage history={history} />} />
            <Route path="/settings" element={<SettingsPage health={health} />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

