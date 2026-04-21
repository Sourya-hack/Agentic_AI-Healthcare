import { Search } from "lucide-react";

export function SearchBar({ value, onChange, placeholder = "Search tools..." }) {
  return (
    <label className="flex items-center gap-3 rounded-2xl border border-white/80 bg-white/90 px-4 py-3 shadow-panel">
      <Search className="h-4 w-4 text-slate-400" />
      <input
        className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
      />
    </label>
  );
}

