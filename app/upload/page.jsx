"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Upload, File, Award, X, Image as ImageIcon, CheckCircle } from "lucide-react";
import toast from "react-hot-toast";
import { useTheme } from "@/context/ThemeContext";
import { UploadDropzone } from "@/utils/uploadthing";

export default function UploadPage() {
  const router = useRouter();
  const { theme } = useTheme();
  const isWhite = theme === "white";
  const [form, setForm] = useState({ title: "", description: "", subject: "", semester: "", department: "", resourceType: "", yearBatch: "", tags: "", isPublic: "true", price: "", notebookLMLink: "" });

  // Stores the result from Uploadthing
  const [uploadedFile, setUploadedFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    const isPdf = name.toLowerCase().endsWith(".pdf");
    
    setLoading(true);

    try {
      // 1. Send metadata to our backend (file is already uploaded to Uploadthing)
      toast.loading("Saving resource metadata...", { id: "upload-toast" });
      const metadata = { ...form };
      if (uploadedFile) {
        metadata.fileUrl = uploadedFile.url;
        metadata.fileName = uploadedFile.name;
      }

      const res = await fetch("/api/upload", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          ...form,
          title: form.title || name,
          fileUrl: url,
          fileType: isPdf ? 'pdf' : 'image'
        }),
      });

      if (response.ok) {
        setIsSavedInDB(true);
        toast.success("Saved to NoteNova database!");
      } else {
        const errData = await response.json();
        toast.error(errData.error || "Failed to save to database");
      }
    } catch (error) {
      console.error("Error saving:", error);
      toast.error("Network error while saving");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!fileUrl) return toast.error("Please upload a file first");
    if (!isSavedInDB) handleSaveToDatabase(fileUrl, fileName);
    else router.push("/dashboard");
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
        {!showPreview && (
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
        <div className={`border-2 border-dashed rounded-lg p-6 text-center ${isWhite ? "border-neutral-200" : "border-[var(--glass-border)]"} transition-colors relative`}>
          {!uploadedFile ? (
            <div className={isWhite ? "text-neutral-900" : "text-white"}>
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
                  container: `border-none p-0 max-w-none`,
                  button: `ut-ready:bg-cyan-500 ut-ready:text-white ut-uploading:bg-cyan-500/50 ut-uploading:text-white after:bg-cyan-400`,
                  label: `text-sm font-medium hover:text-cyan-400 transition-colors ${headingText}`,
                  allowedContent: `text-xs ${mutedText}`
                }}
              />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-4">
              <CheckCircle className={`h-12 w-12 mb-3 ${isWhite ? "text-green-500" : "text-green-400"}`} />
              <p className={`text-sm font-semibold truncate max-w-[280px] ${headingText}`}>
                {uploadedFile.name}
              </p>
              <p className={`text-xs mt-1 mb-4 ${mutedText}`}>
                {(uploadedFile.size / (1024 * 1024)).toFixed(2)} MB • Ready to submit
              </p>

              <button
                type="button"
                onClick={() => setUploadedFile(null)}
                className={`text-xs px-4 py-2 rounded-lg font-medium transition-colors ${isWhite
                    ? "bg-red-50 text-red-600 hover:bg-red-100"
                    : "bg-red-500/10 text-red-400 hover:bg-red-500/20"
                  }`}
              >
                Remove File
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
