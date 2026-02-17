"use client";

import { useEffect, useState } from "react";
import { Trophy, Medal } from "lucide-react";
import toast from "react-hot-toast";

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

  const rankColors = ["text-yellow-500", "text-gray-400", "text-amber-600"];

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="flex items-center gap-3 mb-8">
        <Trophy className="h-8 w-8 text-yellow-500" />
        <h1 className="text-2xl font-bold text-gray-900">Leaderboard</h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-gray-50 text-xs font-semibold text-gray-500 uppercase">
          <div className="col-span-1">Rank</div>
          <div className="col-span-5">Name</div>
          <div className="col-span-3">Department</div>
          <div className="col-span-3 text-right">Points</div>
        </div>
        {loading ? (
          [...Array(5)].map((_, i) => (
            <div key={i} className="grid grid-cols-12 gap-4 px-6 py-4 border-t animate-pulse">
              <div className="col-span-1 h-4 bg-gray-200 rounded" />
              <div className="col-span-5 h-4 bg-gray-200 rounded" />
              <div className="col-span-3 h-4 bg-gray-200 rounded" />
              <div className="col-span-3 h-4 bg-gray-200 rounded" />
            </div>
          ))
        ) : users.length === 0 ? (
          <p className="text-center text-gray-500 py-12">No users yet</p>
        ) : (
          users.map((u, i) => (
            <div key={u._id} className={`grid grid-cols-12 gap-4 px-6 py-4 border-t items-center ${i < 3 ? "bg-yellow-50/50" : ""}`}>
              <div className="col-span-1">
                {i < 3 ? <Medal className={`h-5 w-5 ${rankColors[i]}`} /> : <span className="text-sm font-medium text-gray-500">{i + 1}</span>}
              </div>
              <div className="col-span-5 text-sm font-medium text-gray-900">{u.name}</div>
              <div className="col-span-3 text-sm text-gray-500">{u.department || "—"}</div>
              <div className="col-span-3 text-right text-sm font-bold text-indigo-600">{u.points} pts</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
