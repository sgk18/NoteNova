"use client";

import { useRouter } from "next/navigation";
import { Download, Bookmark, BookmarkCheck, Lock, Globe } from "lucide-react";
import StarRating from "./StarRating";
import toast from "react-hot-toast";

export default function ResourceCard({ resource, onBookmark, isBookmarked, showEdit, onEdit, onDelete }) {
  const router = useRouter();

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
      className="glass rounded-2xl p-5 neon-border hover:neon-glow-strong transition-all duration-300 flex flex-col group cursor-pointer"
      onClick={() => router.push(`/resource/${resource._id}`)}
    >
      <div className="flex justify-between items-start mb-2">
        <div className="flex gap-2 flex-wrap">
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30">
            {resource.subject || "General"}
          </span>
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
            {resource.resourceType || "Notes"}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          {resource.isPublic === false ? (
            <Lock className="h-3.5 w-3.5 text-orange-400" title="Private" />
          ) : (
            <Globe className="h-3.5 w-3.5 text-green-400" title="Public" />
          )}
          <span className="text-xs text-gray-500">{resource.semester ? `Sem ${resource.semester}` : ""}</span>
        </div>
      </div>
      <h3 className="text-lg font-semibold text-white mb-1.5 line-clamp-1 group-hover:text-cyan-300 transition-colors">
        {resource.title}
      </h3>
      <p className="text-sm text-gray-400 mb-3 line-clamp-2 flex-grow">
        {resource.description || "No description"}
      </p>
      {resource.tags?.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {resource.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-gray-400 border border-white/10">
              #{tag}
            </span>
          ))}
        </div>
      )}
      <div className="flex items-center justify-between mb-4" onClick={(e) => e.stopPropagation()}>
        <StarRating rating={resource.avgRating} onRate={handleRate} size={16} />
        <span className="text-xs text-gray-500 flex items-center gap-1">
          <Download className="h-3.5 w-3.5" /> {resource.downloads || 0}
        </span>
      </div>
      <div className="flex flex-wrap gap-2" onClick={(e) => e.stopPropagation()}>
        <button onClick={handleDownload} className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 text-sm font-medium rounded-xl text-white btn-gradient">
          <Download className="h-4 w-4" /> Download
        </button>
        <button onClick={handleBookmark} className="p-2.5 rounded-xl glass border border-white/10 hover:border-purple-500/40 hover:bg-white/10 transition-all">
          {isBookmarked ? (
            <BookmarkCheck className="h-5 w-5 text-cyan-400 drop-shadow-[0_0_6px_rgba(0,212,255,0.6)]" />
          ) : (
            <Bookmark className="h-5 w-5 text-gray-500" />
          )}
        </button>
        {showEdit && (
          <>
            <button onClick={() => onEdit?.(resource)} className="px-3 py-2.5 rounded-xl text-xs font-medium glass border border-white/10 text-cyan-400 hover:bg-white/10 transition-all">
              Edit
            </button>
            <button onClick={() => onDelete?.(resource._id)} className="px-3 py-2.5 rounded-xl text-xs font-medium glass border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-all">
              Delete
            </button>
          </>
        )}
      </div>
    </div>
  );
}
