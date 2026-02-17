"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ResourceCard from "@/components/ResourceCard";
import { User, BookOpen, Calendar, Award, Sparkles } from "lucide-react";
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
    <div className="max-w-5xl mx-auto px-4 py-10 relative">
      <div className="absolute top-0 right-0 w-[400px] h-[400px] rounded-full bg-cyan-500/5 blur-[120px] -z-10" />

      <div className="glass-strong rounded-2xl neon-border overflow-hidden mb-8">
        <div className="h-28 bg-gradient-to-r from-purple-600/30 via-cyan-500/20 to-purple-600/30 relative">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(0,212,255,0.15),transparent_60%)]" />
        </div>
        <div className="px-6 pb-6 -mt-10">
          <div className="flex items-end gap-4">
            <div className="h-20 w-20 rounded-full glass-strong neon-border flex items-center justify-center shadow-lg">
              <User className="h-10 w-10 text-cyan-400" />
            </div>
            <div className="pb-1">
              <h1 className="text-xl font-bold text-white">{user.name}</h1>
              <p className="text-sm text-gray-400">{user.email}</p>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-400">
            {user.department && (
              <span className="flex items-center gap-1.5">
                <BookOpen className="h-4 w-4 text-purple-400" /> {user.department}
              </span>
            )}
            {user.semester && (
              <span className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4 text-purple-400" /> Semester {user.semester}
              </span>
            )}
            <span className="flex items-center gap-1.5">
              <Award className="h-4 w-4 text-cyan-400" />
              <span className="font-semibold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                {user.points || 0} points
              </span>
            </span>
          </div>
        </div>
      </div>

      <div className="flex gap-1 mb-6 glass rounded-xl p-1 neon-border w-fit">
        {["uploads", "bookmarks"].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-5 py-2 rounded-lg text-sm font-medium capitalize transition-all ${
              tab === t
                ? "bg-white/10 text-cyan-400 neon-glow"
                : "text-gray-400 hover:text-white hover:bg-white/5"
            }`}
          >
            {t === "uploads" ? `My Uploads (${resources.length})` : `Bookmarks (${bookmarked.length})`}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3].map(i => <div key={i} className="glass rounded-2xl neon-border p-5 h-56 animate-pulse" />)}
        </div>
      ) : displayResources.length === 0 ? (
        <div className="text-center py-16 glass rounded-2xl neon-border">
          <Sparkles className="h-10 w-10 text-purple-400 mx-auto mb-3" />
          <p className="text-gray-400">Nothing here yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayResources.map((r) => (
            <ResourceCard key={r._id} resource={r} onBookmark={handleBookmark} isBookmarked={bookmarkIds.includes(r._id)} />
          ))}
        </div>
      )}
    </div>
  );
}
