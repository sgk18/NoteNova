"use client";

import Link from "next/link";
import { Download, Bookmark, BookmarkCheck } from "lucide-react";
import StarRating from "./StarRating";
import toast from "react-hot-toast";

export default function ResourceCard({ resource, onBookmark, isBookmarked }) {
  const handleDownload = async () => {
    const token = localStorage.getItem("token");
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
      if (res.ok) {
        toast.success(`Rated ${rating} ★`);
      } else {
        toast.error(data.error || "Rating failed");
      }
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
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow flex flex-col">
      <div className="flex justify-between items-start mb-2">
        <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-700">
          {resource.subject || "General"}
        </span>
        <span className="text-xs text-gray-400">{resource.semester || "—"}</span>
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-1">{resource.title}</h3>
      <p className="text-sm text-gray-500 mb-3 line-clamp-2 flex-grow">{resource.description || "No description"}</p>
      <div className="flex items-center justify-between mb-3">
        <StarRating rating={resource.avgRating} onRate={handleRate} size={16} />
        <span className="text-xs text-gray-400">{resource.downloads || 0} downloads</span>
      </div>
      <div className="flex gap-2">
        <button onClick={handleDownload} className="flex-1 flex items-center justify-center gap-1 py-2 px-3 text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 transition-colors">
          <Download className="h-4 w-4" /> Download
        </button>
        <button onClick={handleBookmark} className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
          {isBookmarked ? <BookmarkCheck className="h-5 w-5 text-indigo-600" /> : <Bookmark className="h-5 w-5 text-gray-400" />}
        </button>
      </div>
    </div>
  );
}
