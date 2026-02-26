"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Shield, BadgeCheck, Award } from "lucide-react";
import toast from "react-hot-toast";
import { useTheme } from "@/context/ThemeContext";

function getBadge(points) {
  if (points >= 300) return { name: "Gold", color: "text-yellow-500" };
  if (points >= 150) return { name: "Silver", color: "text-neutral-400" };
  if (points >= 50) return { name: "Bronze", color: "text-amber-600" };
  return { name: "Starter", color: "text-neutral-500" };
}

export default function LeaderboardPage() {
  const { theme } = useTheme();
  const isWhite = theme === "white";
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/leaderboard").then(r => r.json()).then(d => setUsers(d.users || [])).catch(() => toast.error("Failed to load leaderboard")).finally(() => setLoading(false));
  }, []);

  const headingText = isWhite ? "text-neutral-900" : "text-white";
  const mutedText = isWhite ? "text-neutral-400" : "text-neutral-500";

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className={`text-xl font-bold mb-6 ${headingText}`}>Leaderboard</h1>

      <div className={`rounded-lg overflow-hidden ${isWhite ? "bg-white border border-neutral-200" : "bg-[var(--card-bg)] border border-[var(--card-border)]"}`}>
        {/* Header */}
        <div className={`hidden sm:grid grid-cols-12 gap-3 px-4 py-2.5 text-[11px] font-medium uppercase tracking-wider border-b ${isWhite ? "border-neutral-100 text-neutral-400 bg-neutral-50" : "border-[var(--glass-border)] text-neutral-500 bg-white/5"}`}>
          <div className="col-span-1">Rank</div>
          <div className="col-span-3">Name</div>
          <div className="col-span-3">College</div>
          <div className="col-span-2">Dept</div>
          <div className="col-span-1">Badge</div>
          <div className="col-span-2 text-right">Points</div>
        </div>

        {loading ? (
          [...Array(5)].map((_, i) => (
            <div key={i} className={`px-4 py-4 border-t ${isWhite ? "border-neutral-100" : "border-[var(--glass-border)]"}`}>
              <div className={`h-3 rounded w-3/4 animate-pulse ${isWhite ? "bg-neutral-100" : "bg-white/5"}`} />
            </div>
          ))
        ) : users.length === 0 ? (
          <p className={`text-center text-sm py-12 ${mutedText}`}>No users yet</p>
        ) : (
          users.map((u, i) => {
            const badge = getBadge(u.points);
            return (
              <div key={u._id}>
                {/* Mobile */}
                <div className={`sm:hidden px-4 py-3 border-t ${isWhite ? "border-neutral-100" : "border-[var(--glass-border)]"}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className={`text-xs font-medium w-5 text-center flex-shrink-0 ${i < 3 ? headingText : mutedText}`}>{i + 1}</span>
                      <div className="min-w-0">
                        <Link href={`/user/${u._id}`} className={`font-medium text-sm truncate hover:underline flex items-center gap-1 ${headingText}`}>
                          {u.name}
                          {u.role === "verified_scholar" && <BadgeCheck className="h-3.5 w-3.5 text-blue-500" title="Verified Nova Scholar" />}
                          {u.role === "gold_creator" && <Award className="h-3.5 w-3.5 text-amber-500" title="Gold Badge Creator" />}
                        </Link>
                        <p className={`text-[11px] truncate ${mutedText}`}>{u.college || "—"} {u.department ? `· ${u.department}` : ""}</p>
                      </div>
                    </div>
                    <span className={`text-sm font-semibold ml-2 ${headingText}`}>{u.points}</span>
                  </div>
                </div>

                {/* Desktop */}
                <div className={`hidden sm:grid grid-cols-12 gap-3 px-4 py-3 items-center border-t ${isWhite ? "border-neutral-100" : "border-[var(--glass-border)]"}`}>
                  <div className={`col-span-1 text-sm font-medium ${i < 3 ? headingText : mutedText}`}>{i + 1}</div>
                  <div className="col-span-3">
                    <Link href={`/user/${u._id}`} className={`font-medium text-sm hover:underline flex items-center gap-1 ${headingText}`}>
                      {u.name}
                      {u.role === "verified_scholar" && <BadgeCheck className="h-4 w-4 text-blue-500" title="Verified Nova Scholar" />}
                      {u.role === "gold_creator" && <Award className="h-4 w-4 text-amber-500" title="Gold Badge Creator" />}
                    </Link>
                    {u.semester && <p className={`text-[11px] ${mutedText}`}>Sem {u.semester}</p>}
                  </div>
                  <div className={`col-span-3 text-xs truncate ${mutedText}`}>{u.college || "—"}</div>
                  <div className={`col-span-2 text-xs ${mutedText}`}>{u.department || "—"}</div>
                  <div className="col-span-1">
                    <span className={`inline-flex items-center gap-0.5 text-[11px] font-medium ${badge.color}`}>
                      <Shield className="h-3 w-3" /> {badge.name}
                    </span>
                  </div>
                  <div className={`col-span-2 text-right text-sm font-semibold ${headingText}`}>{u.points}</div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
