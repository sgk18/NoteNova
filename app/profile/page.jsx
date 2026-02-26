"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { BookOpen, Building2, GraduationCap, Award } from "lucide-react";
import ResourceCard from "@/components/ResourceCard";
import toast from "react-hot-toast";
import { useTheme } from "@/context/ThemeContext";

export default function ProfilePage() {
  const router = useRouter();
  const { theme } = useTheme();
  const isWhite = theme === "white";
  const [user, setUser] = useState(null);
  const [tab, setTab] = useState("uploads");
  const [resources, setResources] = useState([]);
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const stored = localStorage.getItem("user");
    if (!token || !stored) return router.push("/login");
    const u = JSON.parse(stored);
    setUser(u);
    fetchData(u.id, token);
  }, []);

  const fetchData = async (userId, token) => {
    try {
      const res = await fetch(`/api/resources?userId=${userId}`);
      const data = await res.json();
      setResources(data.resources || []);
      const bRes = await fetch("/api/bookmarks", { headers: { Authorization: `Bearer ${token}` } });
      if (bRes.ok) { const bData = await bRes.json(); setBookmarks(bData.bookmarks || []); }

      const fRes = await fetch(`/api/follow?userId=${userId}`);
      if (fRes.ok) {
        const fData = await fRes.json();
        setFollowersCount(fData.followersCount || 0);
        setFollowingCount(fData.followingCount || 0);
      }
    } catch {} finally { setLoading(false); }
  };

  const headingText = isWhite ? "text-neutral-900" : "text-white";
  const mutedText = isWhite ? "text-neutral-400" : "text-neutral-500";

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Profile Header */}
      <div className={`rounded-lg overflow-hidden mb-6 ${isWhite ? "bg-white border border-neutral-200" : "bg-[var(--card-bg)] border border-[var(--card-border)]"}`}>
        <div className={`h-20 ${isWhite ? "bg-neutral-100" : "bg-white/5"}`} />
        <div className="px-5 pb-5 -mt-8">
          <div className={`w-14 h-14 rounded-full flex items-center justify-center text-lg font-bold mb-3 ${isWhite ? "bg-neutral-200 text-neutral-600 ring-4 ring-white" : "bg-white/10 text-white ring-4 ring-[var(--bg-primary)]"}`}>
            {user.name?.[0]}
          </div>
          <h1 className={`text-lg font-bold ${headingText}`}>{user.name}</h1>
          <p className={`text-xs ${mutedText}`}>{user.email}</p>
          <div className="flex flex-wrap gap-3 mt-3">
            {user.college && <span className={`flex items-center gap-1 text-xs ${mutedText}`}><Building2 className="h-3 w-3" /> {user.college}</span>}
            {user.department && <span className={`flex items-center gap-1 text-xs ${mutedText}`}><BookOpen className="h-3 w-3" /> {user.department}</span>}
            {user.semester && <span className={`flex items-center gap-1 text-xs ${mutedText}`}><GraduationCap className="h-3 w-3" /> Sem {user.semester}</span>}
            <span className={`flex items-center gap-1 text-xs ${mutedText}`}><Award className="h-3 w-3" /> {user.points || 0} pts</span>
          </div>
          
          <div className="flex items-center gap-5 mt-4 pt-4 border-t border-[var(--glass-border)]">
            <div className="text-center group cursor-pointer" onClick={() => router.push(`/user/${user.id}`)}>
              <p className={`text-sm font-bold ${headingText} group-hover:underline`}>{followersCount}</p>
              <p className={`text-[10px] ${mutedText}`}>Followers</p>
            </div>
            <div className="text-center group cursor-pointer" onClick={() => router.push(`/user/${user.id}`)}>
              <p className={`text-sm font-bold ${headingText} group-hover:underline`}>{followingCount}</p>
              <p className={`text-[10px] ${mutedText}`}>Following</p>
            </div>
            <div className="text-center">
              <p className={`text-sm font-bold ${headingText}`}>{resources.length}</p>
              <p className={`text-[10px] ${mutedText}`}>Uploads</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1.5 mb-5">
        <button onClick={() => setTab("uploads")} className={`px-4 py-2 rounded-lg text-xs font-medium transition-colors ${tab === "uploads" ? "btn-gradient text-white" : isWhite ? "border border-neutral-200 text-neutral-500 hover:bg-neutral-50" : "border border-[var(--glass-border)] text-neutral-400 hover:bg-white/5"}`}>
          Uploads ({resources.length})
        </button>
        <button onClick={() => setTab("bookmarks")} className={`px-4 py-2 rounded-lg text-xs font-medium transition-colors ${tab === "bookmarks" ? "btn-gradient text-white" : isWhite ? "border border-neutral-200 text-neutral-500 hover:bg-neutral-50" : "border border-[var(--glass-border)] text-neutral-400 hover:bg-white/5"}`}>
          Bookmarks ({bookmarks.length})
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><div className={`w-6 h-6 border-2 border-t-transparent rounded-full animate-spin ${isWhite ? "border-neutral-300" : "border-neutral-600"}`} /></div>
      ) : tab === "uploads" ? (
        resources.length === 0 ? (
          <div className={`text-center py-12 rounded-lg ${isWhite ? "bg-neutral-50 border border-neutral-200" : "bg-[var(--card-bg)] border border-[var(--card-border)]"}`}>
            <p className={`text-sm ${mutedText}`}>No uploads yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {resources.map((r) => <ResourceCard key={r._id} resource={r} />)}
          </div>
        )
      ) : (
        bookmarks.length === 0 ? (
          <div className={`text-center py-12 rounded-lg ${isWhite ? "bg-neutral-50 border border-neutral-200" : "bg-[var(--card-bg)] border border-[var(--card-border)]"}`}>
            <p className={`text-sm ${mutedText}`}>No bookmarks yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {bookmarks.map((r) => <ResourceCard key={r._id} resource={r} isBookmarked />)}
          </div>
        )
      )}
    </div>
  );
}
