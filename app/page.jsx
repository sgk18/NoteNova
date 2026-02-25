"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, SlidersHorizontal, ChevronDown } from "lucide-react";
import ResourceCard from "@/components/ResourceCard";
import { useTheme } from "@/context/ThemeContext";

const DEPARTMENTS = ["","CSE","IT","ECE","EEE","MECH","CIVIL","AIDS","AIML","CSE (Cyber Security)","Biomedical","Chemical","Automobile","Common"];
const RESOURCE_TYPES = ["","Notes","Question Papers","Solutions","Project Reports","Study Material"];
const SEMESTERS = ["","1","2","3","4","5","6","7","8"];
const SORT_OPTIONS = [
  { value: "trending", label: "Trending" },
  { value: "latest", label: "Latest" },
  { value: "rating", label: "Highest Rated" },
  { value: "popular", label: "Most Downloads" },
];

export default function HomePage() {
  const router = useRouter();
  const { theme } = useTheme();
  const [resources, setResources] = useState([]);
  const [topUsers, setTopUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filters, setFilters] = useState({ subject: "", semester: "", department: "", resourceType: "", isPublic: "", sort: "trending" });

  const isWhite = theme === "white";

  const fetchResources = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (filters.subject) params.set("subject", filters.subject);
      if (filters.semester) params.set("semester", filters.semester);
      if (filters.department) params.set("department", filters.department);
      if (filters.resourceType) params.set("resourceType", filters.resourceType);
      if (filters.isPublic) params.set("isPublic", filters.isPublic);
      if (filters.sort) params.set("sort", filters.sort);

      const token = localStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await fetch(`/api/resources?${params.toString()}`, { headers });
      const data = await res.json();
      setResources(data.resources || []);
    } catch {
      setResources([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
    fetch("/api/leaderboard").then(r => r.json()).then(d => setTopUsers((d.users || []).slice(0, 3))).catch(() => {});
  }, []);

  useEffect(() => { fetchResources(); }, [filters]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchResources();
  };

  const clearFilters = () => {
    setFilters({ subject: "", semester: "", department: "", resourceType: "", isPublic: "", sort: "trending" });
    setSearch("");
  };

  const activeFilterCount = Object.values(filters).filter((v, i) => v && Object.keys(filters)[i] !== "sort").length;

  const selectClass = `px-3 py-2 rounded-lg text-xs focus:outline-none ${
    isWhite ? "bg-white border border-neutral-200 text-neutral-700" : "bg-[var(--input-bg)] border border-[var(--glass-border)] text-white"
  }`;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6">
      {/* Hero */}
      <section className="py-16 sm:py-24 text-center">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-4 leading-tight">
          <span className={isWhite ? "text-neutral-900" : "text-white"}>Share your notes.</span>
          <br />
          <span className={isWhite ? "text-neutral-400" : "text-neutral-500"}>Discover more.</span>
        </h1>
        <p className={`text-base sm:text-lg mb-8 max-w-lg mx-auto ${isWhite ? "text-neutral-500" : "text-neutral-400"}`}>
          The best academic resources from students across campuses.
        </p>
        <form onSubmit={handleSearch} className="max-w-md mx-auto flex gap-2">
          <div className="flex-1 relative">
            <Search className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 ${isWhite ? "text-neutral-400" : "text-neutral-500"}`} />
            <input
              type="text"
              placeholder="Search notes, subjects..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={`w-full pl-9 pr-4 py-2.5 rounded-lg text-sm focus:outline-none ${
                isWhite
                  ? "bg-white border border-neutral-200 text-neutral-900 placeholder-neutral-400 focus:border-neutral-400"
                  : "bg-[var(--input-bg)] border border-[var(--glass-border)] text-white placeholder-neutral-500 focus:border-neutral-500"
              }`}
            />
          </div>
          <button type="submit" className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
            isWhite
              ? "bg-neutral-900 text-white hover:bg-neutral-800"
              : "btn-gradient text-white neon-glow"
          }`}>
            Search
          </button>
        </form>
      </section>

      {/* Top Contributors */}
      {topUsers.length > 0 && (
        <section className="mb-10">
          <h2 className={`text-sm font-medium mb-3 ${isWhite ? "text-neutral-500" : "text-neutral-400"}`}>
            Top Contributors
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {topUsers.map((u, i) => (
              <div key={u._id} className={`rounded-lg p-3.5 flex items-center gap-3 ${
                isWhite ? "bg-white border border-neutral-200" : "bg-[var(--card-bg)] border border-[var(--card-border)]"
              }`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold ${
                  isWhite ? "bg-neutral-100 text-neutral-600" : "bg-white/10 text-white"
                }`}>
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`font-medium text-sm truncate ${isWhite ? "text-neutral-900" : "text-white"}`}>{u.name}</p>
                  <p className={`text-xs truncate ${isWhite ? "text-neutral-400" : "text-neutral-500"}`}>{u.department}</p>
                </div>
                <span className={`text-sm font-semibold ${isWhite ? "text-neutral-900" : "text-white"}`}>{u.points}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Filter Bar */}
      <section className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className={`text-lg font-semibold ${isWhite ? "text-neutral-900" : "text-white"}`}>
            Resources
          </h2>
          <div className="flex items-center gap-2">
            <select
              value={filters.sort}
              onChange={(e) => setFilters({ ...filters, sort: e.target.value })}
              className={`${selectClass} appearance-none cursor-pointer`}
            >
              {SORT_OPTIONS.map(s => <option key={s.value} value={s.value} className={isWhite ? "bg-white" : "bg-[var(--bg-secondary)]"}>{s.label}</option>)}
            </select>
            <button onClick={() => setFiltersOpen(!filtersOpen)} className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
              filtersOpen
                ? isWhite ? "bg-neutral-900 text-white" : "bg-white text-neutral-900"
                : isWhite ? "bg-white border border-neutral-200 text-neutral-600" : "bg-[var(--input-bg)] border border-[var(--glass-border)] text-neutral-400"
            }`}>
              <SlidersHorizontal className="h-3.5 w-3.5" /> Filters
              {activeFilterCount > 0 && <span className="ml-1 w-4 h-4 rounded-full bg-neutral-500 text-white text-[10px] flex items-center justify-center">{activeFilterCount}</span>}
            </button>
          </div>
        </div>

        {filtersOpen && (
          <div className={`rounded-lg p-3 mb-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 ${
            isWhite ? "bg-neutral-50 border border-neutral-200" : "bg-[var(--card-bg)] border border-[var(--card-border)]"
          }`}>
            <select value={filters.department} onChange={(e) => setFilters({ ...filters, department: e.target.value })} className={selectClass}>
              <option value="" className={isWhite ? "bg-white" : "bg-[var(--bg-secondary)]"}>All Departments</option>
              {DEPARTMENTS.filter(Boolean).map(d => <option key={d} value={d} className={isWhite ? "bg-white" : "bg-[var(--bg-secondary)]"}>{d}</option>)}
            </select>
            <select value={filters.semester} onChange={(e) => setFilters({ ...filters, semester: e.target.value })} className={selectClass}>
              <option value="" className={isWhite ? "bg-white" : "bg-[var(--bg-secondary)]"}>All Semesters</option>
              {SEMESTERS.filter(Boolean).map(s => <option key={s} value={s} className={isWhite ? "bg-white" : "bg-[var(--bg-secondary)]"}>Semester {s}</option>)}
            </select>
            <select value={filters.resourceType} onChange={(e) => setFilters({ ...filters, resourceType: e.target.value })} className={selectClass}>
              <option value="" className={isWhite ? "bg-white" : "bg-[var(--bg-secondary)]"}>All Types</option>
              {RESOURCE_TYPES.filter(Boolean).map(t => <option key={t} value={t} className={isWhite ? "bg-white" : "bg-[var(--bg-secondary)]"}>{t}</option>)}
            </select>
            <select value={filters.isPublic} onChange={(e) => setFilters({ ...filters, isPublic: e.target.value })} className={selectClass}>
              <option value="" className={isWhite ? "bg-white" : "bg-[var(--bg-secondary)]"}>All Access</option>
              <option value="true" className={isWhite ? "bg-white" : "bg-[var(--bg-secondary)]"}>Public</option>
              <option value="false" className={isWhite ? "bg-white" : "bg-[var(--bg-secondary)]"}>Private</option>
            </select>
            <input placeholder="Subject" value={filters.subject} onChange={(e) => setFilters({ ...filters, subject: e.target.value })} className={`${selectClass}`} />
            {activeFilterCount > 0 && (
              <button onClick={clearFilters} className="text-xs text-red-500 hover:underline col-span-full text-center py-1">
                Clear all filters
              </button>
            )}
          </div>
        )}
      </section>

      {/* Resources Grid */}
      <section className="pb-16">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className={`w-6 h-6 border-2 border-t-transparent rounded-full animate-spin ${isWhite ? "border-neutral-300" : "border-neutral-600"}`} />
          </div>
        ) : resources.length === 0 ? (
          <div className="text-center py-20">
            <p className={isWhite ? "text-neutral-400" : "text-neutral-500"}>No resources found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {resources.map((r) => (
              <ResourceCard key={r._id} resource={r} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
