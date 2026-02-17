"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ResourceCard from "@/components/ResourceCard";
import Link from "next/link";
import { Plus, FileText, Download, Star, Sparkles } from "lucide-react";
import toast from "react-hot-toast";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [resources, setResources] = useState([]);
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    const token = localStorage.getItem("token");
    if (!stored || !token) { router.push("/login"); return; }
    const u = JSON.parse(stored);
    setUser(u);

    const fetchData = async () => {
      try {
        const [resRes, bookRes] = await Promise.all([
          fetch(`/api/resources?userId=${u.id}`),
          fetch("/api/bookmark", { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        const resData = await resRes.json();
        const bookData = await bookRes.json();
        setResources(resData.resources || []);
        setBookmarks(bookData.bookmarks?.map((b) => b.resourceId?._id || b.resourceId) || []);
      } catch {
        toast.error("Failed to load data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [router]);

  const handleBookmark = async (resourceId) => {
    const token = localStorage.getItem("token");
    const already = bookmarks.includes(resourceId);
    try {
      if (already) {
        await fetch(`/api/bookmark?resourceId=${resourceId}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
        setBookmarks((p) => p.filter((id) => id !== resourceId));
        toast.success("Removed");
      } else {
        await fetch("/api/bookmark", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ resourceId }) });
        setBookmarks((p) => [...p, resourceId]);
        toast.success("Bookmarked!");
      }
    } catch { toast.error("Failed"); }
  };

  const totalDownloads = resources.reduce((s, r) => s + (r.downloads || 0), 0);
  const avgRating = resources.length ? (resources.reduce((s, r) => s + (r.avgRating || 0), 0) / resources.length).toFixed(1) : "0";

  if (!user) return null;

  const stats = [
    { label: "Total Uploads", value: resources.length, icon: FileText, gradient: "from-blue-500 to-cyan-400" },
    { label: "Total Downloads", value: totalDownloads, icon: Download, gradient: "from-green-500 to-emerald-400" },
    { label: "Avg Rating", value: avgRating, icon: Star, gradient: "from-yellow-500 to-orange-400" },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-wrap justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-sm text-gray-400 mt-1">Welcome back, {user.name}</p>
        </div>
        <Link href="/upload" className="flex items-center gap-1.5 px-5 py-2.5 btn-gradient rounded-xl text-white font-medium text-sm">
          <Plus className="h-5 w-5" /> Upload Resource
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-10">
        {stats.map((s) => (
          <div key={s.label} className="glass rounded-2xl p-6 neon-border hover:neon-glow transition-all duration-300 flex items-center gap-4">
            <div className={`p-3 rounded-xl bg-gradient-to-br ${s.gradient} shadow-lg`}>
              <s.icon className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-400">{s.label}</p>
              <p className="text-2xl font-bold text-white">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      <h2 className="text-xl font-bold text-white mb-5">Your Resources</h2>
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3].map(i => <div key={i} className="glass rounded-2xl neon-border p-5 h-56 animate-pulse" />)}
        </div>
      ) : resources.length === 0 ? (
        <div className="text-center py-16 glass rounded-2xl neon-border">
          <Sparkles className="h-10 w-10 text-purple-400 mx-auto mb-3" />
          <p className="text-gray-400">No resources yet. Upload your first one!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {resources.map((r) => <ResourceCard key={r._id} resource={r} onBookmark={handleBookmark} isBookmarked={bookmarks.includes(r._id)} />)}
        </div>
      )}
    </div>
  );
}
