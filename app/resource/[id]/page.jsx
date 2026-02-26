"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { Download, Lock, Globe, ArrowLeft, Star, Calendar, Tag, BookOpen, Building2, Send, ExternalLink, Sparkles, Eye, FileText, RefreshCw, BadgeCheck, Award, CreditCard, CheckCircle2, ShieldCheck } from "lucide-react";
import StarRating from "@/components/StarRating";
import SmartNotesDisplay from "@/components/SmartNotesDisplay";
import StudyModePanel from "@/components/StudyModePanel";
import AudioPlayer from "@/components/AudioPlayer";
import toast from "react-hot-toast";
import { useTheme } from "@/context/ThemeContext";
import { useTTS } from "@/hooks/useTTS";

export default function ResourceDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { theme } = useTheme();
  const isWhite = theme === "white";
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
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [hasPurchased, setHasPurchased] = useState(false);
  const [audioChunks, setAudioChunks] = useState([]);
  const contentRef = useRef(null);
  const smartNotesRef = useRef(null);

  const {
    isPlaying,
    currentIndex,
    playbackSpeed,
    play,
    pause,
    resume,
    stop,
    skipForward,
    skipBackward,
    updateSpeed
  } = useTTS(audioChunks, id);

  useEffect(() => { if (id) fetchDetail(); }, [id]);
  
  useEffect(() => { 
    if (resource?.smartNotes) {
      setSmartNotes(resource.smartNotes); 
      setAudioChunks(extractAudioChunks(resource.smartNotes));
    } 
  }, [resource]);

  const extractAudioChunks = (notes) => {
    if (!notes) return [];
    
    const chunks = [];
    
    if (notes.summary) {
      chunks.push({ id: 0, title: "Summary", text: `Summary: ${notes.summary}` });
    }
    
    if (notes.keyConcepts?.length > 0) {
      chunks.push({ id: 1, title: "Key Concepts", text: `Key Concepts: ${notes.keyConcepts.join(". ")}` });
    }
    
    if (notes.flashcards?.length > 0) {
      const text = notes.flashcards.map(f => `Question: ${f.question}. Answer: ${f.answer}`).join(". ");
      chunks.push({ id: 2, title: "Flashcards", text: `Flashcards: ${text}` });
    }
    
    if (notes.mcqs?.length > 0) {
      const text = notes.mcqs.map((m, i) => `Question ${i + 1}: ${m.question}. Options are: ${m.options.join(", ")}. Correct answer is ${m.answer}`).join(". ");
      chunks.push({ id: 3, title: "Multiple Choice Questions", text: `Practice Questions: ${text}` });
    }
    
    if (notes.examQuestions?.length > 0) {
      chunks.push({ id: 4, title: "Exam Questions", text: `Possible Exam Questions: ${notes.examQuestions.join(". ")}` });
    }
    
    if (notes.mindMap?.length > 0) {
      const text = notes.mindMap.map(node => `Topic: ${node.topic}. Subtopics: ${node.subtopics?.join(", ")}`).join(". ");
      chunks.push({ id: 5, title: "Mind Map Structure", text: `Mind Map Overview: ${text}` });
    }
    
    return chunks;
  };

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
      // Handle base64 or blob URLs gracefully
      if (url.startsWith("data:") || url.startsWith("blob:")) return "";

      const pathname = new URL(url).pathname;
      const parts = pathname.split(".");
      if (parts.length > 1) {
        return parts.pop().toLowerCase();
      }
      return "";
    } catch {
      return "";
    }
  };

  const isImageExt = (ext) => ["png", "jpg", "jpeg", "gif", "webp", "svg"].includes(ext);
  const isPdfExt = (ext) => ext === "pdf";
  const isOfficeExt = (ext) => ["doc", "docx", "ppt", "pptx", "xls", "xlsx"].includes(ext);

  const getImageDisplayUrl = (url) => url;

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
      // Google Docs Viewer renders PDFs
      return `https://docs.google.com/gview?url=${encodeURIComponent(getInlineCloudinaryUrl(url))}`;
    }
    if (isOfficeExt(ext)) {
      return `https://view.officeapps.live.com/op/view.aspx?src=${encodeURIComponent(url)}`;
    }
    if (isImageExt(ext)) {
      return getImageDisplayUrl(url);
    }
    return url;
  };

  const getDownloadUrl = (url) => url;

  // Modifies Cloudinary URLs to force inline display instead of downloading
  const getInlineCloudinaryUrl = (url) => {
    if (!url || !url.includes("res.cloudinary.com")) return url;
    // Inject fl_attachment:false after /upload/ to override raw download behavior
    return url.replace("/upload/", "/upload/fl_attachment:false/");
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

    // PDF preview — Google Docs Viewer
    if (isPdfExt(ext)) {
      return (
        <div className="relative">
          {previewLoading && (
            <div className="absolute inset-0 flex items-center justify-center z-10 bg-black/40 rounded-xl backdrop-blur-sm">
              <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                <p className="text-xs text-white">Loading PDF preview...</p>
              </div>
            </div>
          )}
          <iframe
            src={getGoogleViewerUrl(getInlineCloudinaryUrl(fileUrl))}
            className="w-full rounded-xl border border-white/10 bg-white"
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
      if (res.status === 403) { setAccessDenied(true); toast.error("Access denied"); setLoading(false); return; }
      const data = await res.json();
      if (res.ok) { setResource(data.resource); setReviews(data.reviews || []); setAvgRating(data.avgRating || 0); }
      else toast.error(data.error || "Resource not found");
    } catch { toast.error("Failed to load resource"); }
    finally { setLoading(false); }
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

  const handleBuy = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Please login to purchase items");
      router.push("/login");
      return;
    }
    setShowPaymentModal(true);
  };

  const processPayment = () => {
    setPaymentProcessing(true);
    // Simulate payment gateway delay
    setTimeout(() => {
      setPaymentProcessing(false);
      setShowPaymentModal(false);
      setHasPurchased(true); // Grant access
      toast.success("Payment successful! You now have access.");
    }, 2000);
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) { toast.error("Please login to review"); router.push("/login"); return; }
    if (!myRating) return toast.error("Please select a rating");
    setSubmitting(true);
    try {
      const res = await fetch("/api/rate", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ resourceId: id, rating: myRating, review: myReview }) });
      const data = await res.json();
      if (res.ok) { toast.success(data.message || "Review submitted"); setMyRating(0); setMyReview(""); fetchDetail(); }
      else toast.error(data.error);
    } catch { toast.error("Failed to submit review"); }
    finally { setSubmitting(false); }
  };

  const handleGenerateSmartNotes = async (regenerate = false) => {
    setSmartNotesLoading(true);
    try {
      const res = await fetch("/api/generate-smart-notes", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ resourceId: id, regenerate }) });
      const data = await res.json();
      if (res.ok) { setSmartNotes(data.smartNotes); toast.success(data.cached ? "Smart Notes loaded" : "Smart Notes generated!"); setTimeout(() => smartNotesRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100); }
      else toast.error(data.error || "Failed to generate Smart Notes");
    } catch { toast.error("Failed to generate Smart Notes"); }
    finally { setSmartNotesLoading(false); }
  };

  // --- Render ---

  const card = `rounded-lg p-5 sm:p-6 mb-6 ${isWhite ? "bg-white border border-neutral-200" : "bg-[var(--card-bg)] border border-[var(--card-border)]"}`;
  const labelText = isWhite ? "text-neutral-500" : "text-neutral-400";
  const headingText = isWhite ? "text-neutral-900" : "text-white";
  const bodyText = isWhite ? "text-neutral-600" : "text-neutral-300";
  const mutedText = isWhite ? "text-neutral-400" : "text-neutral-500";

  if (loading) return <div className="flex justify-center py-32"><div className={`w-6 h-6 border-2 border-t-transparent rounded-full animate-spin ${isWhite ? "border-neutral-300" : "border-neutral-600"}`} /></div>;

  if (accessDenied) return (
    <div className="text-center py-32 max-w-md mx-auto">
      <Lock className={`h-10 w-10 mx-auto mb-4 ${mutedText}`} />
      <h2 className={`text-lg font-semibold mb-2 ${headingText}`}>Access Restricted</h2>
      <p className={`text-sm mb-6 ${mutedText}`}>This resource is private and only available to students from the same college.</p>
      <button onClick={() => router.push("/")} className={`text-sm ${labelText} hover:underline`}>← Back to Home</button>
    </div>
  );

  if (!resource) return (
    <div className="text-center py-32">
      <p className={`text-sm ${mutedText}`}>Resource not found</p>
      <button onClick={() => router.push("/")} className={`mt-4 text-sm ${labelText} hover:underline`}>← Go back</button>
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <button onClick={() => router.back()} className={`flex items-center gap-1 text-sm mb-6 ${mutedText} hover:underline`}>
        <ArrowLeft className="h-3.5 w-3.5" /> Back
      </button>

      {/* Resource Header */}
      <div className={card}>
        <div className="flex flex-wrap gap-1.5 mb-3">
          <span className={`px-2 py-0.5 rounded text-[11px] font-medium ${isWhite ? "bg-neutral-100 text-neutral-600" : "bg-white/5 text-neutral-300"}`}>
            {resource.resourceType || "Notes"}
          </span>
          <span className={`px-2 py-0.5 rounded text-[11px] font-medium ${isWhite ? "bg-neutral-100 text-neutral-500" : "bg-white/5 text-neutral-400"}`}>
            {resource.subject || "General"}
          </span>
          {resource.isPublic === false ? (
            <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-orange-500/10 text-orange-500 flex items-center gap-1"><Lock className="h-2.5 w-2.5" /> Private</span>
          ) : (
            <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-green-500/10 text-green-500 flex items-center gap-1"><Globe className="h-2.5 w-2.5" /> Public</span>
          )}
        </div>

        <h1 className={`text-xl sm:text-2xl font-bold mb-2 ${headingText}`}>{resource.title}</h1>
        <p className={`text-sm mb-5 ${bodyText}`}>{resource.description || "No description provided"}</p>

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
          <div className="flex flex-wrap gap-1.5 mb-5">
            {resource.tags.map((tag) => (
              <span key={tag} className={`flex items-center gap-1 text-[11px] px-2 py-0.5 rounded ${isWhite ? "bg-neutral-50 text-neutral-400" : "bg-white/5 text-neutral-500"}`}>
                <Tag className="h-2.5 w-2.5" /> {tag}
              </span>
            ))}
          </div>
        )}

        {/* Uploader */}
        <div className={`rounded-lg p-3.5 mb-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${isWhite ? "bg-neutral-50 border border-neutral-100" : "bg-white/5 border border-[var(--glass-border)]"}`}>
          <div className="flex items-center gap-3 min-w-0">
            <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0 ${isWhite ? "bg-neutral-200 text-neutral-600" : "bg-white/10 text-white"}`}>
              {resource.uploadedBy?.name?.[0] || "?"}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <p className={`font-medium text-sm truncate ${headingText}`}>{resource.uploadedBy?.name || "Unknown"}</p>
                {resource.uploaderRole === "verified_scholar" && (
                  <BadgeCheck className="h-4 w-4 text-blue-500 flex-shrink-0" title="Verified Nova Scholar" />
                )}
                {resource.uploaderRole === "gold_creator" && (
                  <Award className="h-4 w-4 text-amber-500 flex-shrink-0" title="Gold Badge Creator" />
                )}
              </div>
              <p className={`text-xs truncate ${mutedText}`}>{resource.uploadedBy?.college} · {resource.uploadedBy?.department}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <StarRating rating={avgRating} size={14} />
            <span className={`text-xs ${mutedText}`}>({avgRating})</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-2">
          {resource.notebookLMLink && (
            <a
              href={resource.notebookLMLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 transition-all active:scale-95"
            >
              <Sparkles className="h-4 w-4" /> View in NotebookLM
            </a>
          )}
          {resource.price > 0 && !hasPurchased ? (
            <button onClick={handleBuy} className="flex-1 py-2.5 rounded-lg bg-gradient-to-r from-amber-500 to-orange-600 shadow-md shadow-amber-500/20 text-white text-sm font-medium flex items-center justify-center gap-2">
              <CreditCard className="h-4 w-4" /> Buy for ₹{resource.price}
            </button>
          ) : (
            <button onClick={handleDownload} className="flex-1 py-2.5 rounded-lg btn-gradient text-white text-sm font-medium flex items-center justify-center gap-2 neon-glow">
              <Download className="h-4 w-4" /> {hasPurchased ? "Download Purchased Item" : "Download"}
            </button>
          )}

          {(resource.fileUrl && (hasPurchased || !resource.price)) && (
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
      <div className="mb-6 flex flex-col sm:flex-row gap-2">
        <button onClick={() => handleGenerateSmartNotes(false)} disabled={smartNotesLoading} className="flex-1 py-2.5 rounded-lg btn-gradient text-white text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-50">
          {smartNotesLoading ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Generating...</> : <>Generate Smart Notes</>}
        </button>
        {smartNotes && (
          <button onClick={() => handleGenerateSmartNotes(true)} disabled={smartNotesLoading} className={`py-2.5 px-4 rounded-lg text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-50 transition-colors ${isWhite ? "border border-neutral-200 text-neutral-600 hover:bg-neutral-50" : "border border-[var(--glass-border)] text-neutral-300 hover:bg-white/5"}`}>
            <RefreshCw className={`h-3.5 w-3.5 ${smartNotesLoading ? "animate-spin" : ""}`} /> Regenerate
          </button>
        )}
      </div>

      {/* Smart Notes Display */}
      {smartNotes && (
        <div ref={smartNotesRef}>
          <SmartNotesDisplay 
            notes={smartNotes} 
            activeIndex={currentIndex !== -1 ? audioChunks[currentIndex]?.id : -1} 
          />
        </div>
      )}

      {/* Audio Player Container */}
      {smartNotes && (
        <AudioPlayer 
          isPlaying={isPlaying}
          currentIndex={currentIndex}
          totalChunks={audioChunks.length}
          onPlay={() => play()}
          onPause={pause}
          onResume={resume}
          onSkipForward={skipForward}
          onSkipBackward={skipBackward}
          playbackSpeed={playbackSpeed}
          onSpeedChange={updateSpeed}
          onClose={stop}
          currentTitle={currentIndex !== -1 ? audioChunks[currentIndex]?.title : "Smart Notes"}
        />
      )}

      {/* AI Study Mode */}
      <StudyModePanel resourceId={id} resourceTitle={resource.title} smartNotes={smartNotes} />

      {/* Reviews */}
      <div className={card}>
        <h2 className={`text-base font-semibold mb-5 flex items-center gap-2 ${headingText}`}>
          Reviews ({reviews.length})
        </h2>

        <form onSubmit={handleSubmitReview} className={`rounded-lg p-4 mb-5 ${isWhite ? "bg-neutral-50 border border-neutral-100" : "bg-white/5 border border-[var(--glass-border)]"}`}>
          <p className={`text-sm font-medium mb-2 ${headingText}`}>Write a Review</p>
          <div className="flex items-center gap-3 mb-2">
            <span className={`text-xs ${mutedText}`}>Your Rating:</span>
            <StarRating rating={myRating} onRate={setMyRating} size={16} />
          </div>
          <textarea rows={3} placeholder="Share your thoughts..." value={myReview} onChange={(e) => setMyReview(e.target.value)} className={`w-full px-3 py-2 rounded-lg text-sm focus:outline-none resize-none mb-2 ${isWhite ? "bg-white border border-neutral-200 text-neutral-900 placeholder-neutral-400" : "bg-[var(--input-bg)] border border-[var(--glass-border)] text-white placeholder-neutral-500"}`} />
          <button type="submit" disabled={submitting} className="flex items-center gap-1.5 px-4 py-2 rounded-lg btn-gradient text-white text-xs font-medium disabled:opacity-50">
            <Send className="h-3.5 w-3.5" /> {submitting ? "Submitting..." : "Submit Review"}
          </button>
        </form>

        {reviews.length === 0 ? (
          <p className={`text-sm text-center py-6 ${mutedText}`}>No reviews yet. Be the first to review!</p>
        ) : (
          <div className="space-y-3">
            {reviews.map((r) => (
              <div key={r._id} className={`rounded-lg p-3.5 ${isWhite ? "bg-neutral-50 border border-neutral-100" : "bg-white/5 border border-[var(--glass-border)]"}`}>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-semibold flex-shrink-0 ${isWhite ? "bg-neutral-200 text-neutral-600" : "bg-white/10 text-white"}`}>
                      {r.userId?.name?.[0] || "?"}
                    </div>
                    <div className="min-w-0">
                      <p className={`font-medium text-sm truncate ${headingText}`}>{r.userId?.name || "Anonymous"}</p>
                      <p className={`text-[11px] truncate ${mutedText}`}>{r.userId?.college || ""}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <StarRating rating={r.rating} size={12} />
                    <span className={`text-[11px] ${mutedText}`}>{new Date(r.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                {r.review && <p className={`text-sm ${bodyText}`}>{r.review}</p>}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Dummy Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => !paymentProcessing && setShowPaymentModal(false)}>
          <div
            className={`w-full max-w-sm rounded-xl overflow-hidden shadow-2xl transform transition-all ${isWhite ? "bg-white" : "bg-[#111]"}`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className={`p-4 border-b flex items-center justify-between ${isWhite ? "border-neutral-100 bg-neutral-50" : "border-neutral-800 bg-[#161616]"}`}>
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-emerald-500" />
                <h3 className={`font-semibold ${isWhite ? "text-neutral-900" : "text-white"}`}>Secure Checkout</h3>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded font-medium ${isWhite ? "bg-amber-100 text-amber-700" : "bg-amber-500/20 text-amber-400"}`}>
                <Award className="h-3 w-3 inline mr-1" /> Nova Marketplace
              </span>
            </div>

            {/* Body */}
            <div className="p-5">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className={`font-medium line-clamp-2 ${isWhite ? "text-neutral-800" : "text-neutral-200"}`}>{resource.title}</h4>
                  <p className={`text-xs mt-1 ${isWhite ? "text-neutral-500" : "text-neutral-400"}`}>By {resource.uploadedBy?.name || "Creator"}</p>
                </div>
              </div>

              <div className={`rounded-lg p-3 mb-5 border ${isWhite ? "bg-neutral-50 border-neutral-100" : "bg-white/5 border-neutral-800"}`}>
                <div className="flex justify-between text-sm mb-2">
                  <span className={isWhite ? "text-neutral-500" : "text-neutral-400"}>Item Price</span>
                  <span className={isWhite ? "text-neutral-700" : "text-neutral-300"}>₹{(resource.price * 0.85).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm mb-3">
                  <span className={isWhite ? "text-neutral-500" : "text-neutral-400"}>Platform Fee (15%)</span>
                  <span className={isWhite ? "text-neutral-700" : "text-neutral-300"}>₹{(resource.price * 0.15).toFixed(2)}</span>
                </div>
                <div className={`flex justify-between font-bold pt-3 border-t ${isWhite ? "border-neutral-200 text-neutral-900" : "border-neutral-700 text-white"}`}>
                  <span>Total Amount</span>
                  <span>₹{resource.price}</span>
                </div>
              </div>

              <button
                onClick={processPayment}
                disabled={paymentProcessing}
                className={`w-full py-3 rounded-lg text-white font-medium flex items-center justify-center gap-2 transition-transform active:scale-[0.98] ${paymentProcessing ? "bg-emerald-500/70 cursor-not-allowed" : "bg-emerald-500 hover:bg-emerald-600 shadow-lg shadow-emerald-500/20"
                  }`}
              >
                {paymentProcessing ? (
                  <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Processing...</>
                ) : (
                  <><CheckCircle2 className="h-5 w-5" /> Pay ₹{resource.price}</>
                )}
              </button>
              <p className={`text-center text-[10px] mt-3 ${isWhite ? "text-neutral-400" : "text-neutral-500"}`}>
                Simulated Payment via Razorpay/Stripe (Demo)
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}