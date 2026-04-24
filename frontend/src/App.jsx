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
const UI_MEMORY_KEY = "workflowUiMemoryV1";
export default function App() {
  const [tools, setTools] = useState([]);
  const [health, setHealth] = useState(null);
  const [history, setHistory] = useState([]);
  const [query, setQuery] = useState("");
  const [selectedToolBySection, setSelectedToolBySection] = useState(() => {
    try {
      const raw = localStorage.getItem(UI_MEMORY_KEY);
      const parsed = raw ? JSON.parse(raw) : {};
      return parsed.selectedToolBySection || { main: null, advanced: null };
    } catch {
      return { main: null, advanced: null };
    }
  });
  const [latestResult, setLatestResult] = useState(() => {
    try {
      const raw = localStorage.getItem(UI_MEMORY_KEY);
      const parsed = raw ? JSON.parse(raw) : {};
      return parsed.latestResult || null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(false);
  const [activeJob, setActiveJob] = useState(() => {
    try {
      const raw = localStorage.getItem(UI_MEMORY_KEY);
      const parsed = raw ? JSON.parse(raw) : {};
      return parsed.activeJob || null;
    } catch {
      return null;
    }
  });
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

  useEffect(() => {
    localStorage.setItem(
      UI_MEMORY_KEY,
      JSON.stringify({
        selectedToolBySection,
        latestResult,
        activeJob,
      }),
    );
  }, [selectedToolBySection, latestResult, activeJob]);

  const loadDashboard = async () => {
    const [toolsResponse, healthResponse, historyResponse] = await Promise.all([
      api.getTools(),
      api.getHealth(),
      api.getHistory(),
    ]);
    setTools(toolsResponse.tools);
    setHealth(healthResponse);
    setHistory(historyResponse.items || []);
    setSelectedToolBySection((current) => {
      const mainToolsList = toolsResponse.tools.filter((tool) => tool.section === "main");
      const advancedToolsList = toolsResponse.tools.filter((tool) => tool.section === "advanced");
      const currentMainValid = mainToolsList.some((tool) => tool.id === current.main);
      const currentAdvancedValid = advancedToolsList.some((tool) => tool.id === current.advanced);
      return {
        main: currentMainValid ? current.main : mainToolsList[0]?.id || null,
        advanced: currentAdvancedValid ? current.advanced : advancedToolsList[0]?.id || null,
      };
    });
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

  const selectedMainTool = useMemo(
    () => mainTools.find((tool) => tool.id === selectedToolBySection.main) || mainTools[0] || null,
    [mainTools, selectedToolBySection.main],
  );
  const selectedAdvancedTool = useMemo(
    () => advancedTools.find((tool) => tool.id === selectedToolBySection.advanced) || advancedTools[0] || null,
    [advancedTools, selectedToolBySection.advanced],
  );

  const execute = async (tool, values) => {
    if (!tool?.id) return;
    setLoading(true);
    try {
      const response = await api.executeTool(tool.id, values);
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

  const selectTool = (section, tool) => {
    if (!tool?.id) return;
    setSelectedToolBySection((current) => ({ ...current, [section]: tool.id }));
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
                  selectedTool={selectedMainTool}
                  setSelectedTool={(tool) => selectTool("main", tool)}
                  onSubmit={(values) => execute(selectedMainTool, values)}
                  rememberedValues={toolFormMemory[selectedMainTool?.id] || {}}
                  onValuesChange={(values) => updateToolFormMemory(selectedMainTool?.id, values)}
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
                  selectedTool={selectedAdvancedTool}
                  setSelectedTool={(tool) => selectTool("advanced", tool)}
                  onSubmit={(values) => execute(selectedAdvancedTool, values)}
                  rememberedValues={toolFormMemory[selectedAdvancedTool?.id] || {}}
                  onValuesChange={(values) => updateToolFormMemory(selectedAdvancedTool?.id, values)}
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

