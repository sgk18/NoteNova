"use client";

import { useEffect, useState } from "react";
import ResourceCard from "@/components/ResourceCard";
import { TrendingUp, Search, Sparkles, Trophy, ArrowRight } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

export default function HomePage() {
  const [resources, setResources] = useState([]);
  const [topUsers, setTopUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [bookmarks, setBookmarks] = useState([]);

  const fetchResources = async (query = "") => {
    setLoading(true);
    try {
      const url = query
        ? `/api/resources?search=${encodeURIComponent(query)}&sort=trending`
        : "/api/resources?sort=trending";
      const res = await fetch(url);
      const data = await res.json();
      setResources(data.resources || []);
    } catch {
      toast.error("Failed to load resources");
    } finally {
      setLoading(false);
    }
  };

  const fetchBookmarks = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const res = await fetch("/api/bookmark", { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      setBookmarks(data.bookmarks?.map((b) => b.resourceId?._id || b.resourceId) || []);
    } catch {}
  };

  const fetchTopUsers = async () => {
    try {
      const res = await fetch("/api/leaderboard");
      const data = await res.json();
      setTopUsers((data.users || []).slice(0, 3));
    } catch {}
  };

  useEffect(() => {
    fetchResources();
    fetchBookmarks();
    fetchTopUsers();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchResources(search);
  };

  const handleBookmark = async (resourceId) => {
    const token = localStorage.getItem("token");
    if (!token) return toast.error("Please login first");
    const already = bookmarks.includes(resourceId);
    try {
      if (already) {
        await fetch(`/api/bookmark?resourceId=${resourceId}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
        setBookmarks((prev) => prev.filter((id) => id !== resourceId));
        toast.success("Bookmark removed");
      } else {
        await fetch("/api/bookmark", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ resourceId }),
        });
        setBookmarks((prev) => [...prev, resourceId]);
        toast.success("Bookmarked!");
      }
    } catch {
      toast.error("Bookmark action failed");
    }
  };

  const rankEmoji = ["🥇", "🥈", "🥉"];

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden py-20 sm:py-28">
        <div className="absolute inset-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-purple-600/20 blur-[120px] animate-nova-pulse" />
          <div className="absolute top-1/4 right-1/4 w-[300px] h-[300px] rounded-full bg-cyan-500/10 blur-[100px] animate-nova-pulse" style={{ animationDelay: "2s" }} />
        </div>
        <div className="relative max-w-4xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass neon-border text-sm text-cyan-300 mb-6 animate-float">
            <Sparkles className="h-4 w-4" /> Collaborative Academic Platform
          </div>
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-black mb-6 leading-tight">
            <span className="text-white">Turn Your Notes</span>
            <br />
            <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Into a Nova
            </span>
          </h1>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto mb-10">
            Share, discover, and collaborate on academic resources. Every upload sparks knowledge. Every download fuels growth.
          </p>
          <form onSubmit={handleSearch} className="max-w-xl mx-auto flex gap-3">
            <div className="relative flex-grow">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
              <input
                type="text"
                className="w-full pl-11 pr-4 py-3.5 rounded-xl glass neon-border text-white placeholder-gray-500 focus:outline-none focus:neon-glow-strong text-sm"
                placeholder="Search notes, subjects, topics..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <button type="submit" className="px-7 py-3.5 rounded-xl btn-gradient text-white font-semibold text-sm">
              Search
            </button>
          </form>
        </div>
      </section>

      {/* Top Contributors */}
      {topUsers.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Trophy className="h-6 w-6 text-yellow-400" />
              <h2 className="text-xl font-bold text-white">Top Contributors</h2>
            </div>
            <Link href="/leaderboard" className="flex items-center gap-1 text-sm text-cyan-400 hover:text-cyan-300 transition-colors">
              View All <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {topUsers.map((u, i) => (
              <div key={u._id} className="glass rounded-2xl p-5 neon-border hover:neon-glow transition-all duration-300 flex items-center gap-4">
                <span className="text-2xl">{rankEmoji[i]}</span>
                <div className="flex-grow">
                  <p className="font-semibold text-white">{u.name}</p>
                  <p className="text-xs text-gray-400">{u.department || "Student"}</p>
                </div>
                <span className="text-sm font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                  {u.points} pts
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Trending */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="flex items-center gap-2.5 mb-6">
          <TrendingUp className="text-cyan-400 h-6 w-6" />
          <h2 className="text-xl font-bold text-white">Trending Resources</h2>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="glass rounded-2xl neon-border p-5 animate-pulse h-56" />
            ))}
          </div>
        ) : resources.length === 0 ? (
          <div className="text-center py-20 glass rounded-2xl neon-border">
            <Sparkles className="h-12 w-12 text-purple-400 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">No resources found. Be the first to upload!</p>
            <Link href="/upload" className="inline-block mt-4 px-6 py-2.5 btn-gradient rounded-xl text-white font-medium text-sm">
              Upload Now
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {resources.map((r) => (
              <ResourceCard key={r._id} resource={r} onBookmark={handleBookmark} isBookmarked={bookmarks.includes(r._id)} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
