"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Building2, BookOpen, GraduationCap, Award, UserPlus, UserMinus,
  Users, Loader2, Calendar, BadgeCheck
} from "lucide-react";
import ResourceCard from "@/components/ResourceCard";
import { useTheme } from "@/context/ThemeContext";
import toast from "react-hot-toast";

export default function PublicProfilePage() {
  const { id } = useParams();
  const router = useRouter();
  const { theme } = useTheme();
  const isWhite = theme === "white";

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [followLoading, setFollowLoading] = useState(false);
  const [showModal, setShowModal] = useState(null); // "followers" | "following" | null
  const [modalUsers, setModalUsers] = useState([]);
  const [modalLoading, setModalLoading] = useState(false);

  const fetchProfile = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await fetch(`/api/user/${id}`, { headers });
      const data = await res.json();
      if (res.ok) {
        setProfile(data);
      } else {
        toast.error(data.error || "User not found");
      }
    } catch {
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchProfile(); }, [fetchProfile]);

  const handleFollow = async () => {
    const token = localStorage.getItem("token");
    if (!token) { toast.error("Please login to follow"); router.push("/login"); return; }

    setFollowLoading(true);
    try {
      const res = await fetch("/api/follow", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ targetUserId: id }),
      });
      const data = await res.json();
      if (res.ok) {
        setProfile(prev => ({
          ...prev,
          isFollowing: data.followed,
          followersCount: prev.followersCount + (data.followed ? 1 : -1),
        }));
        toast.success(data.followed ? "Following!" : "Unfollowed");
      } else {
        toast.error(data.error || "Failed");
      }
    } catch { toast.error("Failed"); }
    finally { setFollowLoading(false); }
  };

  const openModal = async (type) => {
    setShowModal(type);
    setModalLoading(true);
    try {
      const res = await fetch(`/api/follow?userId=${id}&type=${type}`);
      const data = await res.json();
      setModalUsers(data.users || []);
    } catch { setModalUsers([]); }
    finally { setModalLoading(false); }
  };

  const headingText = isWhite ? "text-neutral-900" : "text-white";
  const bodyText = isWhite ? "text-neutral-600" : "text-neutral-300";
  const mutedText = isWhite ? "text-neutral-400" : "text-neutral-500";
  const cardBg = isWhite ? "bg-white border border-neutral-200" : "bg-[var(--card-bg)] border border-[var(--card-border)]";
  const borderColor = isWhite ? "border-neutral-200" : "border-[var(--card-border)]";

  if (loading) {
    return (
      <div className="flex justify-center py-32">
        <Loader2 className={`h-6 w-6 animate-spin ${mutedText}`} />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <p className={`text-sm ${mutedText}`}>User not found</p>
      </div>
    );
  }

  const { user, followersCount, followingCount, isFollowing, isOwnProfile, resources } = profile;
  const joinDate = new Date(user.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" });

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Profile Card */}
      <div className={`rounded-xl overflow-hidden mb-6 ${cardBg}`}>
        {/* Banner */}
        <div className={`h-28 relative ${
          isWhite
            ? "bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50"
            : "bg-gradient-to-r from-cyan-900/30 via-purple-900/30 to-blue-900/30"
        }`}>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.1),transparent)]" />
        </div>

        <div className="px-5 pb-5 -mt-10">
          {/* Avatar */}
          <div className={`w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold mb-3 ${
            isWhite
              ? "bg-white text-neutral-600 ring-4 ring-white shadow-md"
              : "bg-[var(--card-bg)] text-white ring-4 ring-[var(--bg-primary)] shadow-lg"
          }`}>
            {user.name?.[0]?.toUpperCase()}
          </div>

          {/* Info + Follow button row */}
          <div className="flex items-start justify-between flex-wrap gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h1 className={`text-xl font-bold ${headingText}`}>{user.name}</h1>
                {user.role === "verified_scholar" && (
                  <BadgeCheck className="h-5 w-5 text-blue-500" title="Verified Nova Scholar" />
                )}
                {user.role === "gold_creator" && (
                  <Award className="h-5 w-5 text-amber-500" title="Gold Badge Creator" />
                )}
              </div>
              <div className="flex flex-wrap items-center gap-3 mt-1.5">
                {user.college && (
                  <span className={`flex items-center gap-1 text-xs ${mutedText}`}>
                    <Building2 className="h-3 w-3" /> {user.college}
                  </span>
                )}
                {user.department && (
                  <span className={`flex items-center gap-1 text-xs ${mutedText}`}>
                    <BookOpen className="h-3 w-3" /> {user.department}
                  </span>
                )}
                {user.semester && (
                  <span className={`flex items-center gap-1 text-xs ${mutedText}`}>
                    <GraduationCap className="h-3 w-3" /> Sem {user.semester}
                  </span>
                )}
                <span className={`flex items-center gap-1 text-xs ${mutedText}`}>
                  <Calendar className="h-3 w-3" /> Joined {joinDate}
                </span>
              </div>
            </div>

            {/* Follow / Edit Profile button */}
            {isOwnProfile ? (
              <button
                onClick={() => router.push("/profile")}
                className={`px-4 py-2 rounded-lg text-xs font-medium border transition-colors ${
                  isWhite ? "border-neutral-200 text-neutral-600 hover:bg-neutral-50" : "border-[var(--glass-border)] text-neutral-300 hover:bg-white/5"
                }`}
              >
                Edit Profile
              </button>
            ) : (
              <button
                onClick={handleFollow}
                disabled={followLoading}
                className={`px-4 py-2 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all disabled:opacity-50 ${
                  isFollowing
                    ? isWhite
                      ? "border border-neutral-200 text-neutral-600 hover:bg-red-50 hover:text-red-500 hover:border-red-200"
                      : "border border-[var(--glass-border)] text-neutral-300 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20"
                    : "btn-gradient text-white"
                }`}
              >
                {followLoading ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : isFollowing ? (
                  <><UserMinus className="h-3.5 w-3.5" /> Following</>
                ) : (
                  <><UserPlus className="h-3.5 w-3.5" /> Follow</>
                )}
              </button>
            )}
          </div>

          {/* Stats row */}
          <div className="flex items-center gap-5 mt-4">
            <button
              onClick={() => openModal("followers")}
              className={`text-center group cursor-pointer`}
            >
              <p className={`text-lg font-bold ${headingText} group-hover:underline`}>{followersCount}</p>
              <p className={`text-[11px] ${mutedText}`}>Followers</p>
            </button>
            <button
              onClick={() => openModal("following")}
              className={`text-center group cursor-pointer`}
            >
              <p className={`text-lg font-bold ${headingText} group-hover:underline`}>{followingCount}</p>
              <p className={`text-[11px] ${mutedText}`}>Following</p>
            </button>
            <div className="text-center">
              <p className={`text-lg font-bold ${headingText}`}>{resources?.length || 0}</p>
              <p className={`text-[11px] ${mutedText}`}>Resources</p>
            </div>
            <div className="text-center">
              <p className={`text-lg font-bold ${headingText}`}>
                <span className="inline-flex items-center gap-0.5">
                  <Award className="h-4 w-4 text-yellow-500" /> {user.points || 0}
                </span>
              </p>
              <p className={`text-[11px] ${mutedText}`}>Points</p>
            </div>
          </div>
        </div>
      </div>

      {/* Resources */}
      <div className="mb-4">
        <h2 className={`text-base font-semibold ${headingText}`}>
          Public Resources
        </h2>
      </div>

      {resources?.length === 0 ? (
        <div className={`text-center py-12 rounded-lg ${cardBg}`}>
          <p className={`text-sm ${mutedText}`}>No public resources yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {resources.map(r => <ResourceCard key={r._id} resource={r} />)}
        </div>
      )}

      {/* Followers/Following Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowModal(null)}>
          <div
            className={`w-full max-w-sm rounded-xl max-h-[70vh] overflow-hidden ${cardBg}`}
            onClick={e => e.stopPropagation()}
          >
            <div className={`px-4 py-3 border-b ${borderColor} flex items-center justify-between`}>
              <h3 className={`text-sm font-semibold ${headingText}`}>
                {showModal === "followers" ? "Followers" : "Following"}
              </h3>
              <button onClick={() => setShowModal(null)} className={`text-xs ${mutedText} hover:underline`}>Close</button>
            </div>
            <div className="overflow-y-auto max-h-[60vh]">
              {modalLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className={`h-5 w-5 animate-spin ${mutedText}`} />
                </div>
              ) : modalUsers.length === 0 ? (
                <p className={`text-center py-8 text-sm ${mutedText}`}>No {showModal} yet</p>
              ) : (
                modalUsers.map(u => (
                  <button
                    key={u._id}
                    onClick={() => { setShowModal(null); router.push(`/user/${u._id}`); }}
                    className={`w-full text-left px-4 py-3 flex items-center gap-3 border-b ${borderColor} transition-colors ${
                      isWhite ? "hover:bg-neutral-50" : "hover:bg-white/5"
                    }`}
                  >
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                      isWhite ? "bg-neutral-100 text-neutral-600" : "bg-white/10 text-white"
                    }`}>
                      {u.name?.[0]?.toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className={`text-sm font-medium truncate ${headingText}`}>{u.name}</p>
                      <p className={`text-[11px] truncate ${mutedText}`}>
                        {u.college || ""}{u.department ? ` · ${u.department}` : ""}
                      </p>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
