"use client";

import { useEffect, useState } from "react";
import ResourceCard from "@/components/ResourceCard";
import { TrendingUp, Search } from "lucide-react";
import toast from "react-hot-toast";

export default function HomePage() {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [bookmarks, setBookmarks] = useState([]);

  const fetchResources = async (query = "") => {
    setLoading(true);
    try {
      const url = query ? `/api/resources?search=${encodeURIComponent(query)}&sort=trending` : "/api/resources?sort=trending";
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

  useEffect(() => {
    fetchResources();
    fetchBookmarks();
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="text-center mb-10">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 mb-3">
          Collaborative Academic <span className="text-indigo-600">Resource Platform</span>
        </h1>
        <p className="text-gray-500 max-w-2xl mx-auto">Share, access, and collaborate on academic resources. Find notes, question papers, solutions, and more.</p>
      </div>

      <form onSubmit={handleSearch} className="max-w-xl mx-auto mb-10 flex gap-2">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
            placeholder="Search by title, subject..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button type="submit" className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors">Search</button>
      </form>

      <div className="flex items-center gap-2 mb-6">
        <TrendingUp className="text-indigo-600 h-6 w-6" />
        <h2 className="text-2xl font-bold text-gray-900">Trending Resources</h2>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 animate-pulse h-56" />
          ))}
        </div>
      ) : resources.length === 0 ? (
        <p className="text-center text-gray-500 py-12">No resources found. Be the first to upload!</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {resources.map((r) => (
            <ResourceCard key={r._id} resource={r} onBookmark={handleBookmark} isBookmarked={bookmarks.includes(r._id)} />
          ))}
        </div>
      )}
    </div>
  );
}
