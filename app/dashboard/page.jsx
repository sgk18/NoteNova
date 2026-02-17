"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ResourceCard from "@/components/ResourceCard";
import Link from "next/link";
import { Plus, FileText, Download, Star } from "lucide-react";
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
    if (!stored || !token) {
      router.push("/login");
      return;
    }
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
    } catch {
      toast.error("Failed");
    }
  };

  const totalDownloads = resources.reduce((s, r) => s + (r.downloads || 0), 0);
  const avgRating = resources.length ? (resources.reduce((s, r) => s + (r.avgRating || 0), 0) / resources.length).toFixed(1) : "0";

  if (!user) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-wrap justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <Link href="/upload" className="flex items-center gap-1 px-5 py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors">
          <Plus className="h-5 w-5" /> Upload Resource
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-10">
        {[
          { label: "Total Uploads", value: resources.length, icon: FileText, color: "text-blue-600 bg-blue-100" },
          { label: "Total Downloads", value: totalDownloads, icon: Download, color: "text-green-600 bg-green-100" },
          { label: "Avg Rating", value: avgRating, icon: Star, color: "text-yellow-600 bg-yellow-100" },
        ].map((s) => (
          <div key={s.label} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className={`p-3 rounded-lg ${s.color}`}><s.icon className="h-6 w-6" /></div>
            <div>
              <p className="text-sm text-gray-500">{s.label}</p>
              <p className="text-2xl font-bold text-gray-900">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      <h2 className="text-xl font-bold text-gray-900 mb-4">Your Resources</h2>
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3].map(i => <div key={i} className="bg-white rounded-xl p-5 h-56 animate-pulse shadow-sm" />)}
        </div>
      ) : resources.length === 0 ? (
        <p className="text-center text-gray-500 py-12">No resources yet. Upload your first one!</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {resources.map((r) => <ResourceCard key={r._id} resource={r} onBookmark={handleBookmark} isBookmarked={bookmarks.includes(r._id)} />)}
        </div>
      )}
    </div>
  );
}
