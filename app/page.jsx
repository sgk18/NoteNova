"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { TrendingUp, Search, SlidersHorizontal, Sparkles, ChevronDown, Award, Star, Users } from "lucide-react";
import ResourceCard from "@/components/ResourceCard";
import { useTheme } from "@/context/ThemeContext";

const DEPARTMENTS = ["","CSE","IT","ECE","EEE","MECH","CIVIL","AIDS","AIML","CSE (Cyber Security)","Biomedical","Chemical","Automobile","Common"];
const RESOURCE_TYPES = ["","Notes","Question Papers","Solutions","Project Reports","Study Material"];
const SEMESTERS = ["","1","2","3","4","5","6","7","8"];
const SORT_OPTIONS = [
  { value: "trending", label: "🔥 Trending" },
  { value: "latest", label: "🕐 Latest" },
  { value: "rating", label: "⭐ Highest Rated" },
  { value: "popular", label: "📥 Most Downloads" },
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
  const isGalaxy = theme === "galaxy";

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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Hero */}
      <section className="relative overflow-hidden py-16 sm:py-24">
        {!isWhite && (
          <div className="absolute inset-0">
            <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-[120px] animate-nova-pulse ${isGalaxy ? "bg-purple-600/20" : "bg-cyan-500/10"}`} />
            <div className={`absolute top-1/4 right-1/4 w-[300px] h-[300px] rounded-full blur-[100px] animate-float ${isGalaxy ? "bg-cyan-500/10" : "bg-blue-500/10"}`} />
          </div>
        )}
        <div className="relative text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black mb-6 leading-tight">
            <span className={isWhite ? "text-gray-900" : "text-white"}>Turn Your Notes</span>
            <br />
            <span className={
              isWhite
                ? "bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 bg-clip-text text-transparent"
                : isGalaxy
                  ? "bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent"
                  : "bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent"
            }>Into a Nova</span>
          </h1>
          <p className={`text-lg sm:text-xl mb-8 max-w-2xl mx-auto ${isWhite ? "text-gray-500" : "text-gray-400"}`}>
            Share, discover, and rate the best academic resources from students across campuses.
          </p>
          <form onSubmit={handleSearch} className="max-w-xl mx-auto flex gap-2">
            <div className="flex-1 relative">
              <Search className={`absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 ${isWhite ? "text-gray-400" : "text-gray-500"}`} />
              <input
                type="text"
                placeholder="Search notes, subjects, tags..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className={`w-full pl-12 pr-4 py-3.5 rounded-xl text-sm focus:outline-none ${
                  isWhite
                    ? "bg-white border border-gray-300 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    : "glass neon-border text-white placeholder-gray-500 focus:neon-glow"
                }`}
              />
            </div>
            <button type="submit" className="px-6 py-3.5 rounded-xl btn-gradient text-white font-semibold text-sm">
              Search
            </button>
          </form>
        </div>
      </section>

      {/* Top Contributors */}
      {topUsers.length > 0 && (
        <section className="mb-12">
          <h2 className={`text-lg font-bold mb-4 flex items-center gap-2 ${isWhite ? "text-gray-900" : "text-white"}`}>
            <Award className="h-5 w-5 text-yellow-400" /> Top Contributors
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {topUsers.map((u, i) => (
              <div key={u._id} className={`rounded-xl p-4 flex items-center gap-3 transition-all ${
                isWhite
                  ? "bg-white border border-gray-200 shadow-sm hover:shadow-md"
                  : "glass neon-border hover:neon-glow"
              }`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${i === 0 ? "bg-yellow-500/20 text-yellow-400 ring-2 ring-yellow-500/40" : i === 1 ? "bg-gray-400/20 text-gray-300 ring-2 ring-gray-400/40" : "bg-orange-500/20 text-orange-400 ring-2 ring-orange-500/40"}`}>
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`font-semibold text-sm truncate ${isWhite ? "text-gray-900" : "text-white"}`}>{u.name}</p>
                  <p className={`text-xs truncate ${isWhite ? "text-gray-400" : "text-gray-500"}`}>{u.department} • {u.college}</p>
                </div>
                <span className={`font-bold text-sm whitespace-nowrap ${isWhite ? "text-blue-600" : "text-cyan-400"}`}>{u.points} pts</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Filter Bar */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className={`text-xl font-bold flex items-center gap-2 ${isWhite ? "text-gray-900" : "text-white"}`}>
            <TrendingUp className={`h-5 w-5 ${isWhite ? "text-blue-600" : "text-cyan-400"}`} /> Resources
          </h2>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <select
              value={filters.sort}
              onChange={(e) => setFilters({ ...filters, sort: e.target.value })}
              className={`px-3 py-2 rounded-lg text-xs appearance-none cursor-pointer focus:outline-none ${
                isWhite
                  ? "bg-white border border-gray-300 text-gray-700"
                  : "glass neon-border text-white bg-transparent"
              }`}
            >
              {SORT_OPTIONS.map(s => <option key={s.value} value={s.value} className={isWhite ? "bg-white" : "bg-slate-900"}>{s.label}</option>)}
            </select>
            <button onClick={() => setFiltersOpen(!filtersOpen)} className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
              filtersOpen
                ? isWhite ? "bg-blue-50 text-blue-600 border border-blue-200" : "bg-purple-500/20 text-purple-300 border border-purple-500/40"
                : isWhite ? "bg-white border border-gray-300 text-gray-600" : "glass neon-border text-gray-400"
            }`}>
              <SlidersHorizontal className="h-3.5 w-3.5" /> Filters
              {activeFilterCount > 0 && <span className="ml-1 w-4 h-4 rounded-full bg-cyan-500 text-white text-[10px] flex items-center justify-center">{activeFilterCount}</span>}
            </button>
          </div>
        </div>

        {filtersOpen && (
          <div className={`rounded-xl p-4 mb-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 ${
            isWhite ? "bg-gray-50 border border-gray-200" : "glass neon-border"
          }`}>
            <select value={filters.department} onChange={(e) => setFilters({ ...filters, department: e.target.value })} className={`px-3 py-2 rounded-lg text-xs appearance-none focus:outline-none ${isWhite ? "bg-white border border-gray-300 text-gray-700" : "glass border border-white/10 text-white bg-transparent"}`}>
              <option value="" className={isWhite ? "bg-white" : "bg-slate-900"}>All Departments</option>
              {DEPARTMENTS.filter(Boolean).map(d => <option key={d} value={d} className={isWhite ? "bg-white" : "bg-slate-900"}>{d}</option>)}
            </select>
            <select value={filters.semester} onChange={(e) => setFilters({ ...filters, semester: e.target.value })} className={`px-3 py-2 rounded-lg text-xs appearance-none focus:outline-none ${isWhite ? "bg-white border border-gray-300 text-gray-700" : "glass border border-white/10 text-white bg-transparent"}`}>
              <option value="" className={isWhite ? "bg-white" : "bg-slate-900"}>All Semesters</option>
              {SEMESTERS.filter(Boolean).map(s => <option key={s} value={s} className={isWhite ? "bg-white" : "bg-slate-900"}>Semester {s}</option>)}
            </select>
            <select value={filters.resourceType} onChange={(e) => setFilters({ ...filters, resourceType: e.target.value })} className={`px-3 py-2 rounded-lg text-xs appearance-none focus:outline-none ${isWhite ? "bg-white border border-gray-300 text-gray-700" : "glass border border-white/10 text-white bg-transparent"}`}>
              <option value="" className={isWhite ? "bg-white" : "bg-slate-900"}>All Types</option>
              {RESOURCE_TYPES.filter(Boolean).map(t => <option key={t} value={t} className={isWhite ? "bg-white" : "bg-slate-900"}>{t}</option>)}
            </select>
            <select value={filters.isPublic} onChange={(e) => setFilters({ ...filters, isPublic: e.target.value })} className={`px-3 py-2 rounded-lg text-xs appearance-none focus:outline-none ${isWhite ? "bg-white border border-gray-300 text-gray-700" : "glass border border-white/10 text-white bg-transparent"}`}>
              <option value="" className={isWhite ? "bg-white" : "bg-slate-900"}>All Access</option>
              <option value="true" className={isWhite ? "bg-white" : "bg-slate-900"}>Public</option>
              <option value="false" className={isWhite ? "bg-white" : "bg-slate-900"}>Private</option>
            </select>
            <input placeholder="Subject" value={filters.subject} onChange={(e) => setFilters({ ...filters, subject: e.target.value })} className={`px-3 py-2 rounded-lg text-xs focus:outline-none ${isWhite ? "bg-white border border-gray-300 text-gray-700 placeholder-gray-400" : "glass border border-white/10 text-white placeholder-gray-500"}`} />
            {activeFilterCount > 0 && (
              <button onClick={clearFilters} className="text-xs text-red-400 hover:text-red-300 underline col-span-full text-center">
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
            <div className={`w-8 h-8 border-2 border-t-transparent rounded-full animate-spin ${isWhite ? "border-blue-500" : "border-cyan-400"}`} />
          </div>
        ) : resources.length === 0 ? (
          <div className="text-center py-20">
            <p className={isWhite ? "text-gray-400" : "text-gray-500"}>No resources found. Try adjusting your filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {resources.map((r) => (
              <ResourceCard key={r._id} resource={r} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

