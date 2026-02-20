"use client";

import { useEffect, useState } from "react";
import { Trophy, Medal, Shield, Award, Star } from "lucide-react";
import toast from "react-hot-toast";

function getBadge(points) {
  if (points >= 300) return { name: "Gold", color: "text-yellow-400", bg: "bg-yellow-400/10 border-yellow-400/30" };
  if (points >= 150) return { name: "Silver", color: "text-gray-300", bg: "bg-gray-300/10 border-gray-300/30" };
  if (points >= 50) return { name: "Bronze", color: "text-amber-600", bg: "bg-amber-600/10 border-amber-600/30" };
  return { name: "Starter", color: "text-gray-500", bg: "bg-gray-500/10 border-gray-500/30" };
}

export default function LeaderboardPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await fetch("/api/leaderboard");
        const data = await res.json();
        setUsers(data.users || []);
      } catch {
        toast.error("Failed to load leaderboard");
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  const rankEmoji = ["🥇", "🥈", "🥉"];

  return (
    <div className="max-w-3xl mx-auto px-4 py-10 relative">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[300px] rounded-full bg-yellow-500/5 blur-[120px] -z-10" />
      <div className="flex items-center gap-3 mb-8">
        <Trophy className="h-8 w-8 text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]" />
        <h1 className="text-2xl font-bold text-white">Leaderboard</h1>
      </div>

      <div className="glass-strong rounded-2xl neon-border overflow-hidden">
        {/* Desktop table header — hidden on mobile */}
        <div className="hidden sm:grid grid-cols-12 gap-4 px-6 py-3 border-b border-white/10 text-xs font-semibold text-gray-400 uppercase tracking-wider">
          <div className="col-span-1">Rank</div>
          <div className="col-span-3">Name</div>
          <div className="col-span-3">College</div>
          <div className="col-span-2">Dept</div>
          <div className="col-span-1">Badge</div>
          <div className="col-span-2 text-right">Points</div>
        </div>

        {loading ? (
          [...Array(5)].map((_, i) => (
            <div key={i} className="px-4 sm:px-6 py-5 border-t border-white/5 animate-pulse">
              <div className="h-4 bg-white/5 rounded w-3/4" />
            </div>
          ))
        ) : users.length === 0 ? (
          <p className="text-center text-gray-500 py-16">No users yet</p>
        ) : (
          users.map((u, i) => {
            const badge = getBadge(u.points);
            return (
              <div key={u._id}>
                {/* Mobile card layout */}
                <div
                  className={`sm:hidden px-4 py-4 border-t border-white/5 transition-all hover:bg-white/5 ${
                    i < 3 ? "bg-white/[0.02]" : ""
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3 min-w-0">
                      {i < 3 ? (
                        <span className="text-xl flex-shrink-0">{rankEmoji[i]}</span>
                      ) : (
                        <span className="text-sm font-medium text-gray-500 w-6 text-center flex-shrink-0">{i + 1}</span>
                      )}
                      <div className="min-w-0">
                        <p className="font-semibold text-white text-sm truncate">{u.name}</p>
                        <p className="text-xs text-gray-500 truncate">
                          {u.college || "—"} {u.department ? `• ${u.department}` : ""}
                          {u.semester ? ` • Sem ${u.semester}` : ""}
                        </p>
                      </div>
                    </div>
                    <span className="text-sm font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent whitespace-nowrap ml-2">
                      {u.points} pts
                    </span>
                  </div>
                  <div className="flex items-center justify-end">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${badge.bg} ${badge.color}`}>
                      <Shield className="h-3 w-3" /> {badge.name}
                    </span>
                  </div>
                </div>

                {/* Desktop row layout */}
                <div
                  className={`hidden sm:grid grid-cols-12 gap-4 px-6 py-4 border-t border-white/5 items-center transition-all hover:bg-white/5 ${
                    i < 3 ? "bg-white/[0.02]" : ""
                  }`}
                >
                  <div className="col-span-1">
                    {i < 3 ? (
                      <span className="text-xl">{rankEmoji[i]}</span>
                    ) : (
                      <span className="text-sm font-medium text-gray-500">{i + 1}</span>
                    )}
                  </div>
                  <div className="col-span-3">
                    <p className="font-semibold text-white text-sm">{u.name}</p>
                    {u.semester && <p className="text-xs text-gray-500">Sem {u.semester}</p>}
                  </div>
                  <div className="col-span-3 text-sm text-gray-400 truncate">{u.college || "—"}</div>
                  <div className="col-span-2 text-sm text-gray-400">{u.department || "—"}</div>
                  <div className="col-span-1">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${badge.bg} ${badge.color}`}>
                      <Shield className="h-3 w-3" /> {badge.name}
                    </span>
                  </div>
                  <div className="col-span-2 text-right">
                    <span className="text-sm font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                      {u.points} pts
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
