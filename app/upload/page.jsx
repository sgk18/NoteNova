"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Upload, File, Award, X, Image as ImageIcon, CheckCircle, Eye, RefreshCcw } from "lucide-react";
import toast from "react-hot-toast";
import { useTheme } from "@/context/ThemeContext";
import { UploadDropzone } from "@/utils/uploadthing";

export default function UploadPage() {
  const router = useRouter();
  const { theme } = useTheme();
  const isWhite = theme === "white";
  
  const [form, setForm] = useState({ 
    title: "", 
    description: "", 
    subject: "", 
    semester: "", 
    department: "", 
    resourceType: "", 
    yearBatch: "", 
    tags: "", 
    isPublic: "true", 
    notebookLMLink: "" 
  });

  const [uploadedFile, setUploadedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!uploadedFile) return toast.error("Please upload a file first");
    
    const token = localStorage.getItem("token");
    setLoading(true);

    try {
      toast.loading("Saving resource metadata...", { id: "upload-toast" });
      
      const res = await fetch("/api/resources", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          ...form,
          fileUrl: uploadedFile.url,
          fileType: uploadedFile.name.toLowerCase().endsWith(".pdf") ? "pdf" : "image"
        }),
      });

      if (res.ok) {
        toast.success("Resource created successfully!", { id: "upload-toast" });
        router.push("/dashboard");
      } else {
        const errData = await res.json();
        toast.error(errData.error || "Failed to save resource", { id: "upload-toast" });
      }
    } catch (error) {
      console.error("Error saving:", error);
      toast.error("Network error while saving", { id: "upload-toast" });
    } finally {
      setLoading(false);
    }
  };

  const headingText = isWhite ? "text-neutral-900" : "text-white";
  const mutedText = isWhite ? "text-neutral-400" : "text-neutral-500";
  const inputClass = `w-full px-3 py-2.5 rounded-lg text-sm focus:outline-none ${isWhite ? "bg-white border border-neutral-200 text-neutral-900 placeholder-neutral-400 focus:border-neutral-400" : "bg-[var(--input-bg)] border border-[var(--glass-border)] text-white placeholder-neutral-500 focus:border-neutral-500"}`;

  const resourceTypeOptions = ["Notes", "Question Papers", "Solutions", "Project Reports", "Study Material", "Google NotebookLM"];
  const semesterOptions = ["1", "2", "3", "4", "5", "6", "7", "8"];
  const departmentOptions = ["CSE", "IT", "ECE", "EEE", "MECH", "CIVIL", "AIDS", "AIML", "CSE (Cyber Security)", "Biomedical", "Chemical", "Automobile", "Common"];

  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      <h1 className={`text-xl font-bold mb-5 ${headingText}`}>Upload Resource</h1>
      <form onSubmit={handleSubmit} className={`rounded-lg p-5 sm:p-6 space-y-4 ${isWhite ? "bg-white border border-neutral-200" : "bg-[var(--card-bg)] border border-[var(--card-border)]"}`}>
        {!showPreview ? (
          <>
            <input name="title" placeholder="Title *" required className={inputClass} value={form.title} onChange={handleChange} />
            <textarea name="description" placeholder="Description" rows={2} className={`${inputClass} resize-none`} value={form.description} onChange={handleChange} />

            <div className="grid grid-cols-2 gap-3">
              <input name="subject" placeholder="Subject / Course" className={inputClass} value={form.subject} onChange={handleChange} />
              <select name="resourceType" required className={`${inputClass} appearance-none`} value={form.resourceType} onChange={handleChange}>
                <option value="" className={isWhite ? "bg-white" : "bg-[var(--bg-secondary)]"}>Resource Type *</option>
                {resourceTypeOptions.map(t => <option key={t} value={t} className={isWhite ? "bg-white" : "bg-[var(--bg-secondary)]"}>{t}</option>)}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <select name="semester" className={`${inputClass} appearance-none`} value={form.semester} onChange={handleChange}>
                <option value="" className={isWhite ? "bg-white" : "bg-[var(--bg-secondary)]"}>Semester</option>
                {semesterOptions.map(s => <option key={s} value={s} className={isWhite ? "bg-white" : "bg-[var(--bg-secondary)]"}>{s}</option>)}
              </select>
              <select name="department" className={`${inputClass} appearance-none`} value={form.department} onChange={handleChange}>
                <option value="" className={isWhite ? "bg-white" : "bg-[var(--bg-secondary)]"}>Department</option>
                {departmentOptions.map(d => <option key={d} value={d} className={isWhite ? "bg-white" : "bg-[var(--bg-secondary)]"}>{d}</option>)}
              </select>
            </div>

            {/* Access Level Toggle */}
            <div className={`flex items-center justify-between rounded-lg p-3 ${isWhite ? "bg-neutral-50 border border-neutral-100" : "bg-white/5 border border-[var(--glass-border)]"}`}>
              <p className={`text-xs font-medium ${headingText}`}>Public Access</p>
              <div className="flex gap-1.5">
                <button type="button" onClick={() => setForm({ ...form, isPublic: "true" })} className={`px-3 py-1 rounded-lg text-xs transition-colors ${form.isPublic === "true" ? "bg-green-500/10 text-green-500 border border-green-500/30" : isWhite ? "border-neutral-200 text-neutral-400" : "border-[var(--glass-border)] text-neutral-500"}`}>
                  Yes
                </button>
                <button type="button" onClick={() => setForm({ ...form, isPublic: "false" })} className={`px-3 py-1 rounded-lg text-xs transition-colors ${form.isPublic === "false" ? "bg-orange-500/10 text-orange-500 border border-orange-500/30" : isWhite ? "border-neutral-200 text-neutral-400" : "border-[var(--glass-border)] text-neutral-500"}`}>
                  No
                </button>
              </div>
            </div>

            {/* File Upload UI */}
            <div className={`border-2 border-dashed rounded-xl p-6 text-center ${isWhite ? "border-neutral-200" : "border-[var(--glass-border)]"} transition-colors relative`}>
              {!uploadedFile ? (
                <UploadDropzone
                  endpoint="courseResource"
                  onClientUploadComplete={(res) => {
                    toast.success("File uploaded to cloud!");
                    setUploadedFile({
                      url: res[0].url,
                      name: res[0].name,
                      size: res[0].size
                    });
                  }}
                  onUploadError={(error) => {
                    toast.error(`Error uploading: ${error.message}`);
                  }}
                  appearance={{
                    button: "btn-gradient text-xs px-4 py-2 rounded-lg",
                    label: `text-sm font-medium ${headingText}`,
                    allowedContent: `text-[10px] ${mutedText}`
                  }}
                />
              ) : (
                <div className="flex flex-col items-center justify-center py-2">
                  <CheckCircle className={`h-10 w-10 mb-2 ${isWhite ? "text-green-500" : "text-green-400"}`} />
                  <p className={`text-sm font-semibold truncate max-w-[280px] ${headingText}`}>
                    {uploadedFile.name}
                  </p>
                  <p className={`text-xs mt-0.5 mb-3 ${mutedText}`}>
                    {(uploadedFile.size / (1024 * 1024)).toFixed(2)} MB • Ready
                  </p>

                  <div className="flex gap-2 w-full max-w-[280px]">
                    <button 
                      type="button"
                      onClick={() => setShowPreview(true)}
                      className="flex-grow py-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-500 text-xs font-bold hover:bg-cyan-500/20 transition-all flex items-center justify-center gap-2"
                    >
                      <Eye className="h-4 w-4" /> Preview
                    </button>
                    <button 
                      type="button"
                      onClick={() => setUploadedFile(null)}
                      className={`p-2 rounded-lg border flex items-center justify-center ${isWhite ? "bg-white border-neutral-200 text-neutral-400" : "bg-white/5 border-white/10 text-neutral-500 hover:text-red-400"}`}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            <button type="submit" disabled={!uploadedFile || loading} className="w-full py-3 rounded-xl btn-gradient text-white text-sm font-bold shadow-lg shadow-cyan-500/20 disabled:opacity-50 transition-all">
              {loading ? "Submitting..." : "Complete Upload"}
            </button>
          </>
        ) : (
          <div className="flex flex-col gap-4 animate-in fade-in zoom-in duration-300">
            <div className="flex items-center justify-between">
              <h3 className={`text-sm font-bold ${headingText}`}>Document Preview</h3>
              <button 
                type="button"
                onClick={() => setShowPreview(false)} 
                className={`text-xs font-bold px-3 py-1.5 rounded-lg border ${isWhite ? "bg-white text-neutral-600 border-neutral-200" : "bg-white/5 text-neutral-400 border-white/10 hover:bg-white/10"}`}
              >
                Back to Details
              </button>
            </div>
            <div className={`w-full h-[500px] rounded-xl overflow-hidden border ${isWhite ? "bg-white border-neutral-200" : "bg-black/40 border-white/10"}`}>
              {uploadedFile.name.toLowerCase().endsWith(".pdf") ? (
                <iframe
                  src={`${uploadedFile.url}#toolbar=0`}
                  className="w-full h-full"
                  title="PDF Preview"
                />
              ) : (
                <img src={uploadedFile.url} alt="Preview" className="w-full h-full object-contain" />
              )}
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
