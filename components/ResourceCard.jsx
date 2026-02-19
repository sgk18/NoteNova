"use client";

import { useRouter } from "next/navigation";
import { Download, Bookmark, BookmarkCheck, Lock, Globe } from "lucide-react";
import StarRating from "./StarRating";
import toast from "react-hot-toast";
import { useTheme } from "@/context/ThemeContext";

export default function ResourceCard({ resource, onBookmark, isBookmarked, showEdit, onEdit, onDelete }) {
  const router = useRouter();
  const { theme } = useTheme();
  const isWhite = theme === "white";

  const handleDownload = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Please login to download");
      router.push("/login");
      return;
    }
    try {
      const res = await fetch(`/api/resources?download=${resource._id}`);
      const data = await res.json();
      if (data.fileUrl) {
        window.open(data.fileUrl, "_blank");
        toast.success("Download started");
      } else {
        toast.error("File not available");
      }
    } catch {
      toast.error("Download failed");
    }
  };

  const handleRate = async (rating) => {
    const token = localStorage.getItem("token");
    if (!token) return toast.error("Please login to rate");
    try {
      const res = await fetch("/api/rate", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ resourceId: resource._id, rating }),
      });
      const data = await res.json();
      if (res.ok) toast.success(`Rated ${rating} ★`);
      else toast.error(data.error || "Rating failed");
    } catch {
      toast.error("Rating failed");
    }
  };

  const handleBookmark = () => {
    const token = localStorage.getItem("token");
    if (!token) return toast.error("Please login first");
    onBookmark?.(resource._id);
  };

  return (
    <div
      className={`rounded-2xl p-5 transition-all duration-300 flex flex-col group cursor-pointer ${
        isWhite
          ? "bg-white border border-gray-200 shadow-sm hover:shadow-lg"
          : "glass neon-border hover:neon-glow-strong"
      }`}
      onClick={() => router.push(`/resource/${resource._id}`)}
    >
      <div className="flex justify-between items-start mb-2">
        <div className="flex gap-2 flex-wrap">
          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
            isWhite ? "bg-purple-50 text-purple-600 border border-purple-200" : "bg-purple-500/20 text-purple-300 border border-purple-500/30"
          }`}>
            {resource.subject || "General"}
          </span>
          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
            isWhite ? "bg-blue-50 text-blue-600 border border-blue-200" : "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
          }`}>
            {resource.resourceType || "Notes"}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          {resource.isPublic === false ? (
            <Lock className="h-3.5 w-3.5 text-orange-400" title="Private" />
          ) : (
            <Globe className="h-3.5 w-3.5 text-green-400" title="Public" />
          )}
          <span className={`text-xs ${isWhite ? "text-gray-400" : "text-gray-500"}`}>{resource.semester ? `Sem ${resource.semester}` : ""}</span>
        </div>
      </div>
      <h3 className={`text-lg font-semibold mb-1.5 line-clamp-1 transition-colors ${
        isWhite ? "text-gray-900 group-hover:text-blue-600" : "text-white group-hover:text-cyan-300"
      }`}>
        {resource.title}
      </h3>
      <p className={`text-sm mb-3 line-clamp-2 flex-grow ${isWhite ? "text-gray-500" : "text-gray-400"}`}>
        {resource.description || "No description"}
      </p>
      {resource.tags?.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {resource.tags.slice(0, 3).map((tag) => (
            <span key={tag} className={`text-xs px-2 py-0.5 rounded-full ${
              isWhite ? "bg-gray-100 text-gray-500 border border-gray-200" : "bg-white/5 text-gray-400 border border-white/10"
            }`}>
              #{tag}
            </span>
          ))}
        </div>
      )}
      <div className="flex items-center justify-between mb-4" onClick={(e) => e.stopPropagation()}>
        <StarRating rating={resource.avgRating} onRate={handleRate} size={16} />
        <span className={`text-xs flex items-center gap-1 ${isWhite ? "text-gray-400" : "text-gray-500"}`}>
          <Download className="h-3.5 w-3.5" /> {resource.downloads || 0}
        </span>
      </div>
      <div className="flex flex-wrap gap-2" onClick={(e) => e.stopPropagation()}>
        <button onClick={handleDownload} className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 text-sm font-medium rounded-xl text-white btn-gradient">
          <Download className="h-4 w-4" /> Download
        </button>
        <button onClick={handleBookmark} className={`p-2.5 rounded-xl transition-all ${
          isWhite
            ? "bg-gray-50 border border-gray-200 hover:border-purple-300 hover:bg-purple-50"
            : "glass border border-white/10 hover:border-purple-500/40 hover:bg-white/10"
        }`}>
          {isBookmarked ? (
            <BookmarkCheck className={`h-5 w-5 ${isWhite ? "text-blue-600" : "text-cyan-400 drop-shadow-[0_0_6px_rgba(0,212,255,0.6)]"}`} />
          ) : (
            <Bookmark className={`h-5 w-5 ${isWhite ? "text-gray-400" : "text-gray-500"}`} />
          )}
        </button>
        {showEdit && (
          <>
            <button onClick={() => onEdit?.(resource)} className={`px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
              isWhite ? "bg-blue-50 border border-blue-200 text-blue-600 hover:bg-blue-100" : "glass border border-white/10 text-cyan-400 hover:bg-white/10"
            }`}>
              Edit
            </button>
            <button onClick={() => onDelete?.(resource._id)} className={`px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
              isWhite ? "bg-red-50 border border-red-200 text-red-500 hover:bg-red-100" : "glass border border-red-500/30 text-red-400 hover:bg-red-500/10"
            }`}>
              Delete
            </button>
          </>
        )}
      </div>
    </div>
  );
}

