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
      className={`rounded-lg p-4 flex flex-col group cursor-pointer transition-shadow ${
        isWhite
          ? "bg-white border border-neutral-200 hover:shadow-md"
          : "bg-[var(--card-bg)] border border-[var(--card-border)] hover:border-neutral-600"
      }`}
      onClick={() => router.push(`/resource/${resource._id}`)}
    >
      <div className="flex justify-between items-start mb-2">
        <div className="flex gap-1.5 flex-wrap">
          <span className={`px-2 py-0.5 rounded text-[11px] font-medium ${
            isWhite ? "bg-neutral-100 text-neutral-600" : "bg-white/5 text-neutral-300"
          }`}>
            {resource.subject || "General"}
          </span>
          <span className={`px-2 py-0.5 rounded text-[11px] font-medium ${
            isWhite ? "bg-neutral-100 text-neutral-500" : "bg-white/5 text-neutral-400"
          }`}>
            {resource.resourceType || "Notes"}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          {resource.isPublic === false ? (
            <Lock className="h-3 w-3 text-orange-400" title="Private" />
          ) : (
            <Globe className="h-3 w-3 text-green-500" title="Public" />
          )}
          <span className={`text-[11px] ${isWhite ? "text-neutral-400" : "text-neutral-500"}`}>{resource.semester ? `Sem ${resource.semester}` : ""}</span>
        </div>
      </div>
      <h3 className={`text-sm font-semibold mb-1 line-clamp-1 ${isWhite ? "text-neutral-900" : "text-white"}`}>
        {resource.title}
      </h3>
      <p className={`text-xs mb-3 line-clamp-2 flex-grow ${isWhite ? "text-neutral-400" : "text-neutral-500"}`}>
        {resource.description || "No description"}
      </p>
      {resource.tags?.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {resource.tags.slice(0, 3).map((tag) => (
            <span key={tag} className={`text-[11px] px-1.5 py-0.5 rounded ${
              isWhite ? "bg-neutral-50 text-neutral-400" : "bg-white/5 text-neutral-500"
            }`}>
              #{tag}
            </span>
          ))}
        </div>
      )}
      <div className="flex items-center justify-between mb-3" onClick={(e) => e.stopPropagation()}>
        <StarRating rating={resource.avgRating} onRate={handleRate} size={14} />
        <span className={`text-[11px] flex items-center gap-1 ${isWhite ? "text-neutral-400" : "text-neutral-500"}`}>
          <Download className="h-3 w-3" /> {resource.downloads || 0}
        </span>
      </div>
      <div className="flex flex-wrap gap-2" onClick={(e) => e.stopPropagation()}>
        <button onClick={handleDownload} className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-medium rounded-lg text-white btn-gradient">
          <Download className="h-3.5 w-3.5" /> Download
        </button>
        <button onClick={handleBookmark} className={`p-2 rounded-lg transition-colors ${
          isWhite
            ? "border border-neutral-200 hover:bg-neutral-50"
            : "border border-[var(--glass-border)] hover:bg-white/5"
        }`}>
          {isBookmarked ? (
            <BookmarkCheck className={`h-4 w-4 ${isWhite ? "text-neutral-900" : "text-white"}`} />
          ) : (
            <Bookmark className={`h-4 w-4 ${isWhite ? "text-neutral-400" : "text-neutral-500"}`} />
          )}
        </button>
        {showEdit && (
          <>
            <button onClick={() => onEdit?.(resource)} className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
              isWhite ? "border border-neutral-200 text-neutral-600 hover:bg-neutral-50" : "border border-[var(--glass-border)] text-neutral-300 hover:bg-white/5"
            }`}>
              Edit
            </button>
            <button onClick={() => onDelete?.(resource._id)} className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
              isWhite ? "border border-red-200 text-red-500 hover:bg-red-50" : "border border-red-500/30 text-red-400 hover:bg-red-500/10"
            }`}>
              Delete
            </button>
          </>
        )}
      </div>
    </div>
  );
}
