"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { Download, Lock, Globe, ArrowLeft, Star, Calendar, Tag, BookOpen, Building2, Send, ExternalLink, Sparkles, Eye, FileText, RefreshCw } from "lucide-react";
import StarRating from "@/components/StarRating";
import SmartNotesDisplay from "@/components/SmartNotesDisplay";
import toast from "react-hot-toast";

export default function ResourceDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [resource, setResource] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [avgRating, setAvgRating] = useState(0);
  const [loading, setLoading] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);
  const [myRating, setMyRating] = useState(0);
  const [myReview, setMyReview] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [smartNotes, setSmartNotes] = useState(null);
  const [smartNotesLoading, setSmartNotesLoading] = useState(false);
  const [visible, setVisible] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(true);
  const [previewError, setPreviewError] = useState(false);
  const contentRef = useRef(null);
  const smartNotesRef = useRef(null);

  useEffect(() => {
    if (!id) return;
    fetchDetail();
  }, [id]);

  useEffect(() => {
    if (resource) {
      setTimeout(() => setVisible(true), 50);
      // Load cached smart notes if available
      if (resource.smartNotes) {
        setSmartNotes(resource.smartNotes);
      }
    }
  }, [resource]);

  useEffect(() => {
    if (resource) {
      setPreviewLoading(true);
      setPreviewError(false);
    }
  }, [resource?.fileUrl]);

  // --- URL helper functions ---

  const getFileExtension = (url) => {
    if (!url) return "";
    try {
      const pathname = new URL(url).pathname;
      return pathname.split(".").pop().toLowerCase();
    } catch {
      return "";
    }
  };

  const isImageExt = (ext) => ["png", "jpg", "jpeg", "gif", "webp", "svg"].includes(ext);
  const isPdfExt = (ext) => ext === "pdf";
  const isOfficeExt = (ext) => ["doc", "docx", "ppt", "pptx", "xls", "xlsx"].includes(ext);

  // For images stored as "raw" in Cloudinary, convert to /image/upload/ for display
  const getImageDisplayUrl = (url) => {
    if (!url) return url;
    if (url.includes("cloudinary.com") && url.includes("/raw/upload/")) {
      return url.replace("/raw/upload/", "/image/upload/");
    }
    return url;
  };

  // Google Docs Viewer URL — works for any publicly accessible PDF/doc URL
  const getGoogleViewerUrl = (url) => {
    return `https://docs.google.com/gview?url=${encodeURIComponent(url)}&embedded=true`;
  };

  // Office Online Viewer URL
  const getOfficeViewerUrl = (url) => {
    return `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(url)}`;
  };

  // For "Open in New Tab": PDFs use Google Docs Viewer, images use direct URL
  const getOpenInTabUrl = (url) => {
    if (!url) return url;
    const ext = getFileExtension(url);
    if (isPdfExt(ext)) {
      // Google Docs Viewer renders PDFs regardless of Cloudinary resource type
      return `https://docs.google.com/gview?url=${encodeURIComponent(url)}`;
    }
    if (isOfficeExt(ext)) {
      return `https://view.officeapps.live.com/op/view.aspx?src=${encodeURIComponent(url)}`;
    }
    if (isImageExt(ext)) {
      return getImageDisplayUrl(url);
    }
    return url;
  };

  // For download: use Cloudinary fl_attachment flag to force proper download
  const getDownloadUrl = (url) => {
    if (!url) return url;
    if (url.includes("cloudinary.com") && url.includes("/upload/")) {
      // Insert fl_attachment flag after /upload/ to force download with correct headers
      return url.replace("/upload/", "/upload/fl_attachment/");
    }
    return url;
  };

  // --- Preview renderer ---

  const renderFilePreview = () => {
    const fileUrl = resource?.fileUrl;
    if (!fileUrl) {
      return (
        <div className="flex flex-col items-center justify-center py-16 text-gray-500">
          <FileText className="h-12 w-12 mb-3 opacity-40" />
          <p className="text-sm">No file attached to this resource</p>
        </div>
      );
    }

    const ext = getFileExtension(fileUrl);

    if (previewError) {
      return (
        <div className="flex flex-col items-center justify-center py-16 text-gray-500">
          <FileText className="h-12 w-12 mb-3 opacity-40" />
          <p className="text-sm mb-3">Preview could not be loaded</p>
          <a
            href={getOpenInTabUrl(fileUrl)}
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-2.5 rounded-xl btn-gradient text-white text-sm font-medium flex items-center gap-2 no-underline"
          >
            <Eye className="h-4 w-4" /> Open File in Browser
          </a>
        </div>
      );
    }

    // Image preview — direct <img> tag
    if (isImageExt(ext)) {
      const displayUrl = getImageDisplayUrl(fileUrl);
      return (
        <div className="flex justify-center">
          {previewLoading && (
            <div className="flex items-center justify-center py-16">
              <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
            </div>
          )}
          <img
            src={displayUrl}
            alt={resource.title}
            className={`max-w-full max-h-[600px] rounded-xl object-contain ${previewLoading ? "hidden" : ""}`}
            onLoad={() => setPreviewLoading(false)}
            onError={() => { setPreviewLoading(false); setPreviewError(true); }}
          />
        </div>
      );
    }

    // PDF preview — Google Docs Viewer (works with ANY Cloudinary URL)
    if (isPdfExt(ext)) {
      return (
        <div className="relative">
          {previewLoading && (
            <div className="absolute inset-0 flex items-center justify-center z-10">
              <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                <p className="text-xs text-gray-500">Loading PDF preview...</p>
              </div>
            </div>
          )}
          <iframe
            src={getGoogleViewerUrl(fileUrl)}
            className="w-full rounded-xl border border-white/10"
            style={{ height: "600px" }}
            frameBorder="0"
            allow="autoplay"
            onLoad={() => setPreviewLoading(false)}
            onError={() => { setPreviewLoading(false); setPreviewError(true); }}
            title="PDF Preview"
          />
          {!previewLoading && (
            <div className="mt-3 flex justify-end">
              <a
                href={getOpenInTabUrl(fileUrl)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors"
              >
                <Eye className="h-3 w-3" /> Open in new tab
              </a>
            </div>
          )}
        </div>
      );
    }

    // Office docs — Office Online Viewer
    if (isOfficeExt(ext)) {
      return (
        <div className="relative">
          {previewLoading && (
            <div className="absolute inset-0 flex items-center justify-center z-10">
              <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                <p className="text-xs text-gray-500">Loading document preview...</p>
              </div>
            </div>
          )}
          <iframe
            src={getOfficeViewerUrl(fileUrl)}
            className="w-full rounded-xl border border-white/10"
            style={{ height: "600px" }}
            frameBorder="0"
            allow="autoplay"
            onLoad={() => setPreviewLoading(false)}
            onError={() => { setPreviewLoading(false); setPreviewError(true); }}
            title="Document Preview"
          />
          {!previewLoading && (
            <div className="mt-3 flex justify-end">
              <a
                href={getOpenInTabUrl(fileUrl)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors"
              >
                <Eye className="h-3 w-3" /> Open in new tab
              </a>
            </div>
          )}
        </div>
      );
    }

    // Fallback
    return (
      <div className="flex flex-col items-center justify-center py-16 text-gray-500">
        <FileText className="h-12 w-12 mb-3 opacity-40" />
        <p className="text-sm mb-3">Preview not available for this file type (.{ext})</p>
        <a
          href={fileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="px-5 py-2.5 rounded-xl btn-gradient text-white text-sm font-medium flex items-center gap-2 no-underline"
        >
          <Eye className="h-4 w-4" /> Open File in Browser
        </a>
      </div>
    );
  };

  // --- Data fetching & actions ---

  const fetchDetail = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await fetch(`/api/resource/${id}`, { headers });

      if (res.status === 403) {
        const data = await res.json();
        setAccessDenied(true);
        toast.error(data.error || "Access denied");
        setLoading(false);
        return;
      }

      const data = await res.json();
      if (res.ok) {
        setResource(data.resource);
        setReviews(data.reviews || []);
        setAvgRating(data.avgRating || 0);
      } else {
        toast.error(data.error || "Resource not found");
      }
    } catch {
      toast.error("Failed to load resource");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Please login to download");
      router.push("/login");
      return;
    }
    try {
      // Track download count via API
      const res = await fetch(`/api/resources?download=${id}`);
      const data = await res.json();
      if (data.fileUrl) {
        const ext = getFileExtension(data.fileUrl);
        if (isPdfExt(ext) || isOfficeExt(ext)) {
          // For PDFs/docs: use fl_attachment to force download with correct content-type
          const downloadUrl = getDownloadUrl(data.fileUrl);
          window.open(downloadUrl, "_blank");
        } else {
          // For images: open directly (browser shows inline)
          const displayUrl = getImageDisplayUrl(data.fileUrl);
          window.open(displayUrl, "_blank");
        }
        toast.success("Download started");
      } else {
        toast.error("File not available");
      }
    } catch {
      toast.error("Download failed");
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Please login to review");
      router.push("/login");
      return;
    }
    if (!myRating) return toast.error("Please select a rating");
    setSubmitting(true);
    try {
      const res = await fetch("/api/rate", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ resourceId: id, rating: myRating, review: myReview }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message || "Review submitted");
        setMyRating(0);
        setMyReview("");
        fetchDetail();
      } else {
        toast.error(data.error);
      }
    } catch {
      toast.error("Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  };

  const handleGenerateSmartNotes = async (regenerate = false) => {
    setSmartNotesLoading(true);
    try {
      const res = await fetch("/api/generate-smart-notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resourceId: id, regenerate }),
      });
      const data = await res.json();
      if (res.ok) {
        setSmartNotes(data.smartNotes);
        toast.success(data.cached ? "Smart Notes loaded from cache" : "Smart Notes generated!");
        setTimeout(() => {
          smartNotesRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 100);
      } else {
        toast.error(data.error || "Failed to generate Smart Notes");
      }
    } catch {
      toast.error("Failed to generate Smart Notes");
    } finally {
      setSmartNotesLoading(false);
    }
  };

  // --- Render ---

  if (loading) {
    return (
      <div className="flex justify-center py-32">
        <div className="w-10 h-10 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (accessDenied) {
    return (
      <div className="text-center py-32 max-w-md mx-auto">
        <Lock className="h-12 w-12 text-orange-400 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">Access Restricted</h2>
        <p className="text-gray-400 text-sm mb-6">This resource is private and only available to students from the same college.</p>
        <button onClick={() => router.push("/")} className="text-cyan-400 hover:text-cyan-300 text-sm">← Back to Home</button>
      </div>
    );
  }

  if (!resource) {
    return (
      <div className="text-center py-32">
        <p className="text-gray-500 text-lg">Resource not found</p>
        <button onClick={() => router.push("/")} className="mt-4 text-cyan-400 hover:text-cyan-300 text-sm">← Go back</button>
      </div>
    );
  }

  return (
    <div className={`max-w-4xl mx-auto px-4 py-10 transition-all duration-500 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
      <button onClick={() => router.back()} className="flex items-center gap-1 text-sm text-gray-400 hover:text-white mb-6 transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back
      </button>

      {/* Resource Header */}
      <div ref={contentRef} className="glass-strong rounded-2xl p-5 sm:p-8 neon-border mb-8">
        <div className="flex flex-wrap gap-2 mb-4">
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
            {resource.resourceType || "Notes"}
          </span>
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30">
            {resource.subject || "General"}
          </span>
          {resource.isPublic === false ? (
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-orange-500/20 text-orange-400 border border-orange-500/30 flex items-center gap-1">
              <Lock className="h-3 w-3" /> Private
            </span>
          ) : (
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-500/20 text-green-400 border border-green-500/30 flex items-center gap-1">
              <Globe className="h-3 w-3" /> Public
            </span>
          )}
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-3">{resource.title}</h1>
        <p className="text-gray-400 mb-6">{resource.description || "No description provided"}</p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {resource.semester && (
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <BookOpen className="h-4 w-4 text-purple-400" /> Semester {resource.semester}
            </div>
          )}
          {resource.department && (
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <Building2 className="h-4 w-4 text-cyan-400" /> {resource.department}
            </div>
          )}
          {resource.yearBatch && (
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <Calendar className="h-4 w-4 text-green-400" /> {resource.yearBatch}
            </div>
          )}
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <Download className="h-4 w-4 text-yellow-400" /> {resource.downloads || 0} downloads
          </div>
        </div>

        {resource.tags?.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {resource.tags.map((tag) => (
              <span key={tag} className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-white/5 text-gray-400 border border-white/10">
                <Tag className="h-3 w-3" /> {tag}
              </span>
            ))}
          </div>
        )}

        {/* Uploader */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 glass rounded-xl p-4 border border-white/10 mb-6">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center text-white font-bold flex-shrink-0">
              {resource.uploadedBy?.name?.[0] || "?"}
            </div>
            <div className="min-w-0">
              <p className="text-white font-semibold text-sm truncate">{resource.uploadedBy?.name || "Unknown"}</p>
              <p className="text-xs text-gray-500 truncate">{resource.uploadedBy?.college} • {resource.uploadedBy?.department}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            <StarRating rating={avgRating} size={18} />
            <span className="text-sm text-gray-400">({avgRating})</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button onClick={handleDownload} className="flex-1 py-3.5 rounded-xl btn-gradient text-white font-semibold text-sm flex items-center justify-center gap-2">
            <Download className="h-5 w-5" /> Download
          </button>
          {resource.fileUrl && (
            <a href={getOpenInTabUrl(resource.fileUrl)} target="_blank" rel="noopener noreferrer" className="flex-1 py-3.5 rounded-xl glass neon-border text-white font-semibold text-sm flex items-center justify-center gap-2 hover:bg-white/10 transition-all">
              <ExternalLink className="h-4 w-4" /> Open in New Tab
            </a>
          )}
        </div>
      </div>

      {/* File Preview Section */}
      <div className="glass-strong rounded-2xl p-8 neon-border mb-8">
        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <Eye className="h-5 w-5 text-cyan-400" /> File Preview
        </h2>
        {renderFilePreview()}
      </div>

      {/* Smart Notes Button */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => handleGenerateSmartNotes(false)}
            disabled={smartNotesLoading}
            className="flex-1 py-4 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-300 disabled:opacity-50 shadow-lg shadow-purple-500/20"
          >
            {smartNotesLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Generating Smart Notes...
              </>
            ) : (
              <>
                <Sparkles className="h-5 w-5" /> ✨ Generate Smart Notes
              </>
            )}
          </button>
          {smartNotes && (
            <button
              onClick={() => handleGenerateSmartNotes(true)}
              disabled={smartNotesLoading}
              className="py-4 px-6 rounded-xl glass neon-border text-gray-300 font-medium text-sm flex items-center justify-center gap-2 hover:bg-white/10 transition-all disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${smartNotesLoading ? "animate-spin" : ""}`} /> Regenerate
            </button>
          )}
        </div>
      </div>

      {/* Smart Notes Display */}
      {smartNotes && (
        <div ref={smartNotesRef}>
          <SmartNotesDisplay notes={smartNotes} />
        </div>
      )}

      {/* Reviews */}
      <div className="glass-strong rounded-2xl p-5 sm:p-8 neon-border mb-8">
        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <Star className="h-5 w-5 text-yellow-400" /> Reviews ({reviews.length})
        </h2>

        <form onSubmit={handleSubmitReview} className="glass rounded-xl p-5 border border-white/10 mb-6">
          <p className="text-sm text-white font-medium mb-3">Write a Review</p>
          <div className="flex items-center gap-3 mb-3">
            <span className="text-sm text-gray-400">Your Rating:</span>
            <StarRating rating={myRating} onRate={setMyRating} size={20} />
          </div>
          <textarea rows={3} placeholder="Share your thoughts about this resource..." value={myReview} onChange={(e) => setMyReview(e.target.value)} className="w-full px-4 py-3 rounded-xl glass border border-white/10 text-white placeholder-gray-500 text-sm focus:outline-none focus:neon-glow resize-none mb-3" />
          <button type="submit" disabled={submitting} className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl btn-gradient text-white text-sm font-medium disabled:opacity-50">
            <Send className="h-4 w-4" /> {submitting ? "Submitting..." : "Submit Review"}
          </button>
        </form>

        {reviews.length === 0 ? (
          <p className="text-gray-500 text-sm text-center py-6">No reviews yet. Be the first to review!</p>
        ) : (
          <div className="space-y-4">
            {reviews.map((r) => (
              <div key={r._id} className="glass rounded-xl p-4 border border-white/10">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                      {r.userId?.name?.[0] || "?"}
                    </div>
                    <div className="min-w-0">
                      <p className="text-white font-medium text-sm truncate">{r.userId?.name || "Anonymous"}</p>
                      <p className="text-xs text-gray-500 truncate">{r.userId?.college || ""}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <StarRating rating={r.rating} size={14} />
                    <span className="text-xs text-gray-500">{new Date(r.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                {r.review && <p className="text-sm text-gray-400 mt-2">{r.review}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
