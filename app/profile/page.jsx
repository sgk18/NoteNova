"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ResourceCard from "@/components/ResourceCard";
import { User, BookOpen, Calendar, Award } from "lucide-react";
import toast from "react-hot-toast";

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [resources, setResources] = useState([]);
  const [bookmarked, setBookmarked] = useState([]);
  const [bookmarkIds, setBookmarkIds] = useState([]);
  const [tab, setTab] = useState("uploads");
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
        const bks = bookData.bookmarks || [];
        setBookmarked(bks.filter((b) => b.resourceId).map((b) => b.resourceId));
        setBookmarkIds(bks.map((b) => b.resourceId?._id || b.resourceId));
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
    const already = bookmarkIds.includes(resourceId);
    try {
      if (already) {
        await fetch(`/api/bookmark?resourceId=${resourceId}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
        setBookmarkIds((p) => p.filter((id) => id !== resourceId));
        setBookmarked((p) => p.filter((r) => r._id !== resourceId));
        toast.success("Removed");
      } else {
        await fetch("/api/bookmark", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ resourceId }) });
        setBookmarkIds((p) => [...p, resourceId]);
        toast.success("Bookmarked!");
      }
    } catch { toast.error("Failed"); }
  };

  if (!user) return null;

  const displayResources = tab === "uploads" ? resources : bookmarked;

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-8">
        <div className="bg-indigo-600 h-28" />
        <div className="px-6 pb-6 -mt-10">
          <div className="flex items-end gap-4">
            <div className="h-20 w-20 rounded-full bg-white shadow flex items-center justify-center border-4 border-white">
              <User className="h-10 w-10 text-gray-400" />
            </div>
            <div className="pb-1">
              <h1 className="text-xl font-bold text-gray-900">{user.name}</h1>
              <p className="text-sm text-gray-500">{user.email}</p>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-600">
            {user.department && <span className="flex items-center gap-1"><BookOpen className="h-4 w-4" /> {user.department}</span>}
            {user.semester && <span className="flex items-center gap-1"><Calendar className="h-4 w-4" /> Semester {user.semester}</span>}
            <span className="flex items-center gap-1"><Award className="h-4 w-4 text-indigo-600" /> {user.points || 0} points</span>
          </div>
        </div>
      </div>

      <div className="flex gap-4 mb-6 border-b">
        {["uploads", "bookmarks"].map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`pb-2 px-1 text-sm font-medium capitalize transition-colors ${tab === t ? "text-indigo-600 border-b-2 border-indigo-600" : "text-gray-500 hover:text-gray-700"}`}>
            {t === "uploads" ? `My Uploads (${resources.length})` : `Bookmarks (${bookmarked.length})`}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3].map(i => <div key={i} className="bg-white rounded-xl p-5 h-56 animate-pulse shadow-sm" />)}
        </div>
      ) : displayResources.length === 0 ? (
        <p className="text-center text-gray-500 py-12">Nothing here yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayResources.map((r) => <ResourceCard key={r._id} resource={r} onBookmark={handleBookmark} isBookmarked={bookmarkIds.includes(r._id)} />)}
        </div>
      )}
    </div>
  );
}
