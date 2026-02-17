"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { User, BookOpen, Building2, GraduationCap, Award } from "lucide-react";
import ResourceCard from "@/components/ResourceCard";
import toast from "react-hot-toast";

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [tab, setTab] = useState("uploads");
  const [resources, setResources] = useState([]);
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);

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
      if (bRes.ok) {
        const bData = await bRes.json();
        setBookmarks(bData.bookmarks || []);
      }
    } catch {} finally { setLoading(false); }
  };

  if (!user) return null;

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      {/* Profile Header */}
      <div className="glass-strong rounded-2xl neon-border overflow-hidden mb-8">
        <div className="h-32 bg-gradient-to-r from-purple-600/30 via-cyan-500/20 to-pink-500/30 relative">
          <div className="absolute -bottom-10 left-8">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center text-white text-3xl font-bold ring-4 ring-[#0B1F3A] shadow-xl">
              {user.name?.[0]}
            </div>
          </div>
        </div>
        <div className="pt-14 pb-6 px-8">
          <h1 className="text-2xl font-bold text-white">{user.name}</h1>
          <p className="text-sm text-gray-400">{user.email}</p>
          <div className="flex flex-wrap gap-4 mt-4">
            {user.college && (
              <span className="flex items-center gap-1.5 text-sm text-gray-400">
                <Building2 className="h-4 w-4 text-cyan-400" /> {user.college}
              </span>
            )}
            {user.department && (
              <span className="flex items-center gap-1.5 text-sm text-gray-400">
                <BookOpen className="h-4 w-4 text-purple-400" /> {user.department}
              </span>
            )}
            {user.semester && (
              <span className="flex items-center gap-1.5 text-sm text-gray-400">
                <GraduationCap className="h-4 w-4 text-green-400" /> Semester {user.semester}
              </span>
            )}
            <span className="flex items-center gap-1.5 text-sm text-gray-400">
              <Award className="h-4 w-4 text-yellow-400" /> {user.points || 0} points
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button onClick={() => setTab("uploads")} className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${tab === "uploads" ? "btn-gradient text-white" : "glass neon-border text-gray-400 hover:text-white"}`}>
          My Uploads ({resources.length})
        </button>
        <button onClick={() => setTab("bookmarks")} className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${tab === "bookmarks" ? "btn-gradient text-white" : "glass neon-border text-gray-400 hover:text-white"}`}>
          Bookmarks ({bookmarks.length})
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : tab === "uploads" ? (
        resources.length === 0 ? (
          <div className="text-center py-16 glass rounded-2xl neon-border">
            <p className="text-gray-500">No uploads yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {resources.map((r) => <ResourceCard key={r._id} resource={r} />)}
          </div>
        )
      ) : (
        bookmarks.length === 0 ? (
          <div className="text-center py-16 glass rounded-2xl neon-border">
            <p className="text-gray-500">No bookmarks yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {bookmarks.map((r) => <ResourceCard key={r._id} resource={r} isBookmarked />)}
          </div>
        )
      )}
    </div>
  );
}
