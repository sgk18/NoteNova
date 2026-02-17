"use client";

<<<<<<< HEAD
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Download, Lock, Globe, ArrowLeft, Star, Calendar, Tag, BookOpen, Building2, Send } from "lucide-react";
=======
import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { Download, Lock, Globe, ArrowLeft, Star, Calendar, Tag, BookOpen, Building2, Send, ExternalLink, Sparkles, Eye } from "lucide-react";
>>>>>>> 20e1cd558b63141784a903ec708d98775e66730e
import StarRating from "@/components/StarRating";
import toast from "react-hot-toast";

export default function ResourceDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [resource, setResource] = useState(null);
  const [reviews, setReviews] = useState([]);
<<<<<<< HEAD
  const [loading, setLoading] = useState(true);
  const [myRating, setMyRating] = useState(0);
  const [myReview, setMyReview] = useState("");
  const [submitting, setSubmitting] = useState(false);
=======
  const [avgRating, setAvgRating] = useState(0);
  const [loading, setLoading] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);
  const [myRating, setMyRating] = useState(0);
  const [myReview, setMyReview] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [aiSummary, setAiSummary] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [visible, setVisible] = useState(false);
  const contentRef = useRef(null);
>>>>>>> 20e1cd558b63141784a903ec708d98775e66730e

  useEffect(() => {
    if (!id) return;
    fetchDetail();
  }, [id]);

<<<<<<< HEAD
  const fetchDetail = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/resource/${id}`);
=======
  useEffect(() => {
    if (resource) {
      setTimeout(() => setVisible(true), 50);
    }
  }, [resource]);

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

>>>>>>> 20e1cd558b63141784a903ec708d98775e66730e
      const data = await res.json();
      if (res.ok) {
        setResource(data.resource);
        setReviews(data.reviews || []);
<<<<<<< HEAD
=======
        setAvgRating(data.avgRating || 0);
>>>>>>> 20e1cd558b63141784a903ec708d98775e66730e
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
<<<<<<< HEAD
    try {
      const res = await fetch(`/api/resources?download=${id}`);
      const data = await res.json();
      if (data.fileUrl) {
        window.open(data.fileUrl, "_blank");
        toast.success("Download started");
      } else {
        toast.error("File not available");
      }
    } catch {
      toast.error("Download failed");
=======
    if (resource?.fileUrl) {
      window.open(resource.fileUrl, "_blank");
      toast.success("Download started");
    } else {
      toast.error("File not available");
>>>>>>> 20e1cd558b63141784a903ec708d98775e66730e
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
<<<<<<< HEAD
    if (!token) {
      toast.error("Please login to review");
      router.push("/login");
      return;
    }
=======
    if (!token) { toast.error("Please login to review"); router.push("/login"); return; }
>>>>>>> 20e1cd558b63141784a903ec708d98775e66730e
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
<<<<<<< HEAD
      } else {
        toast.error(data.error);
      }
    } catch {
      toast.error("Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  };

=======
      } else { toast.error(data.error); }
    } catch { toast.error("Failed to submit review"); }
    finally { setSubmitting(false); }
  };

  const handleGenerateAINotes = async () => {
    if (!resource) return;
    setAiLoading(true);
    setAiSummary("");
    try {
      const res = await fetch("/api/ask-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: `Generate detailed study notes for: "${resource.title}" — Subject: ${resource.subject || "General"}. Include key concepts, formulas if applicable, and exam-relevant points.` }),
      });
      const data = await res.json();
      if (res.ok) {
        setAiSummary(data.answer);
      } else {
        toast.error(data.error || "AI generation failed");
      }
    } catch { toast.error("Failed to generate AI notes"); }
    finally { setAiLoading(false); }
  };

  const isPdf = resource?.fileUrl?.toLowerCase()?.endsWith(".pdf") || resource?.fileUrl?.includes("/upload/") || resource?.fileUrl?.includes("cloudinary");

>>>>>>> 20e1cd558b63141784a903ec708d98775e66730e
  if (loading) {
    return (
      <div className="flex justify-center py-32">
        <div className="w-10 h-10 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

<<<<<<< HEAD
=======
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

>>>>>>> 20e1cd558b63141784a903ec708d98775e66730e
  if (!resource) {
    return (
      <div className="text-center py-32">
        <p className="text-gray-500 text-lg">Resource not found</p>
        <button onClick={() => router.push("/")} className="mt-4 text-cyan-400 hover:text-cyan-300 text-sm">← Go back</button>
      </div>
    );
  }

  return (
<<<<<<< HEAD
    <div className="max-w-4xl mx-auto px-4 py-10">
=======
    <div className={`max-w-4xl mx-auto px-4 py-10 transition-all duration-500 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
>>>>>>> 20e1cd558b63141784a903ec708d98775e66730e
      <button onClick={() => router.back()} className="flex items-center gap-1 text-sm text-gray-400 hover:text-white mb-6 transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back
      </button>

      {/* Resource Header */}
<<<<<<< HEAD
      <div className="glass-strong rounded-2xl p-8 neon-border mb-8">
=======
      <div ref={contentRef} className="glass-strong rounded-2xl p-8 neon-border mb-8">
>>>>>>> 20e1cd558b63141784a903ec708d98775e66730e
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

        <h1 className="text-3xl font-bold text-white mb-3">{resource.title}</h1>
        <p className="text-gray-400 mb-6">{resource.description || "No description provided"}</p>

<<<<<<< HEAD
        {/* Meta info */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {resource.semester && (
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <BookOpen className="h-4 w-4 text-purple-400" />
              <span>Semester {resource.semester}</span>
=======
        {/* Meta */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {resource.semester && (
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <BookOpen className="h-4 w-4 text-purple-400" /> Semester {resource.semester}
>>>>>>> 20e1cd558b63141784a903ec708d98775e66730e
            </div>
          )}
          {resource.department && (
            <div className="flex items-center gap-2 text-sm text-gray-400">
<<<<<<< HEAD
              <Building2 className="h-4 w-4 text-cyan-400" />
              <span>{resource.department}</span>
=======
              <Building2 className="h-4 w-4 text-cyan-400" /> {resource.department}
>>>>>>> 20e1cd558b63141784a903ec708d98775e66730e
            </div>
          )}
          {resource.yearBatch && (
            <div className="flex items-center gap-2 text-sm text-gray-400">
<<<<<<< HEAD
              <Calendar className="h-4 w-4 text-green-400" />
              <span>{resource.yearBatch}</span>
            </div>
          )}
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <Download className="h-4 w-4 text-yellow-400" />
            <span>{resource.downloads || 0} downloads</span>
=======
              <Calendar className="h-4 w-4 text-green-400" /> {resource.yearBatch}
            </div>
          )}
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <Download className="h-4 w-4 text-yellow-400" /> {resource.downloads || 0} downloads
>>>>>>> 20e1cd558b63141784a903ec708d98775e66730e
          </div>
        </div>

        {/* Tags */}
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
<<<<<<< HEAD
        <div className="flex items-center justify-between glass rounded-xl p-4 border border-white/10">
=======
        <div className="flex items-center justify-between glass rounded-xl p-4 border border-white/10 mb-6">
>>>>>>> 20e1cd558b63141784a903ec708d98775e66730e
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center text-white font-bold">
              {resource.uploadedBy?.name?.[0] || "?"}
            </div>
            <div>
              <p className="text-white font-semibold text-sm">{resource.uploadedBy?.name || "Unknown"}</p>
              <p className="text-xs text-gray-500">{resource.uploadedBy?.college} • {resource.uploadedBy?.department}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
<<<<<<< HEAD
            <StarRating rating={resource.avgRating} size={18} />
            <span className="text-sm text-gray-400">({resource.avgRating?.toFixed(1)})</span>
          </div>
        </div>

        {/* Download Button */}
        <button onClick={handleDownload} className="w-full mt-6 py-3.5 rounded-xl btn-gradient text-white font-semibold text-sm flex items-center justify-center gap-2">
          <Download className="h-5 w-5" /> Download Resource
        </button>
      </div>

      {/* Reviews Section */}
=======
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
            <a href={resource.fileUrl} target="_blank" rel="noopener noreferrer" className="flex-1 py-3.5 rounded-xl glass neon-border text-white font-semibold text-sm flex items-center justify-center gap-2 hover:bg-white/10 transition-all">
              <ExternalLink className="h-4 w-4" /> Open in New Tab
            </a>
          )}
          <button onClick={handleGenerateAINotes} disabled={aiLoading} className="flex-1 py-3.5 rounded-xl glass border border-purple-500/30 text-purple-300 font-semibold text-sm flex items-center justify-center gap-2 hover:bg-purple-500/10 transition-all disabled:opacity-50">
            <Sparkles className="h-4 w-4" /> {aiLoading ? "Generating..." : "AI Notes"}
          </button>
        </div>
      </div>

      {/* PDF Preview */}
      {resource.fileUrl && isPdf && (
        <div className="glass-strong rounded-2xl neon-border overflow-hidden mb-8">
          <div className="flex items-center gap-2 px-6 py-3 border-b border-white/10">
            <Eye className="h-4 w-4 text-cyan-400" />
            <span className="text-sm font-medium text-white">Document Preview</span>
          </div>
          <iframe
            src={resource.fileUrl}
            className="w-full h-[600px] bg-white/5"
            title="Resource Preview"
          />
        </div>
      )}

      {/* AI Summary */}
      {aiSummary && (
        <div className="glass-strong rounded-2xl neon-border overflow-hidden mb-8">
          <div className="flex items-center gap-2 px-6 py-3 border-b border-white/10">
            <Sparkles className="h-4 w-4 text-purple-400" />
            <span className="text-sm font-medium text-white">AI Generated Notes</span>
          </div>
          <div className="px-6 py-5">
            <div className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">{aiSummary}</div>
          </div>
        </div>
      )}

      {/* Reviews */}
>>>>>>> 20e1cd558b63141784a903ec708d98775e66730e
      <div className="glass-strong rounded-2xl p-8 neon-border mb-8">
        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <Star className="h-5 w-5 text-yellow-400" /> Reviews ({reviews.length})
        </h2>

<<<<<<< HEAD
        {/* Submit Review Form */}
=======
>>>>>>> 20e1cd558b63141784a903ec708d98775e66730e
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

<<<<<<< HEAD
        {/* Review List */}
=======
>>>>>>> 20e1cd558b63141784a903ec708d98775e66730e
        {reviews.length === 0 ? (
          <p className="text-gray-500 text-sm text-center py-6">No reviews yet. Be the first to review!</p>
        ) : (
          <div className="space-y-4">
            {reviews.map((r) => (
              <div key={r._id} className="glass rounded-xl p-4 border border-white/10">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center text-white font-bold text-xs">
                      {r.userId?.name?.[0] || "?"}
                    </div>
                    <div>
                      <p className="text-white font-medium text-sm">{r.userId?.name || "Anonymous"}</p>
                      <p className="text-xs text-gray-500">{r.userId?.college || ""}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
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
