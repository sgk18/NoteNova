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
    if (!token) return router.push("/login");
    if (!form.title || !form.resourceType) return toast.error("Title and Resource Type are required");

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
        body: JSON.stringify(metadata)
      });

      const data = await res.json();
      if (res.ok) {
        toast.success("Resource uploaded successfully!", { id: "upload-toast" });
        router.push("/dashboard");
      } else {
        toast.error(data.error || "Failed to save metadata", { id: "upload-toast" });
      }
    } catch (err) {
      toast.error(err.message || "Upload failed", { id: "upload-toast" });
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
        <input name="title" placeholder="Title *" required className={inputClass} value={form.title} onChange={handleChange} />
        <textarea name="description" placeholder="Description" rows={3} className={`${inputClass} resize-none`} value={form.description} onChange={handleChange} />

        <div className="grid grid-cols-2 gap-3">
          <input name="subject" placeholder="Subject / Course" className={inputClass} value={form.subject} onChange={handleChange} />
          <select name="resourceType" required className={`${inputClass} appearance-none`} value={form.resourceType} onChange={handleChange}>
            <option value="" className={isWhite ? "bg-white" : "bg-[var(--bg-secondary)]"}>Resource Type *</option>
            {["Notes", "Question Papers", "Solutions", "Project Reports", "Study Material", "Google NotebookLM"].map(t => <option key={t} value={t} className={isWhite ? "bg-white" : "bg-[var(--bg-secondary)]"}>{t}</option>)}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <select name="semester" className={`${inputClass} appearance-none`} value={form.semester} onChange={handleChange}>
            <option value="" className={isWhite ? "bg-white" : "bg-[var(--bg-secondary)]"}>Semester</option>
            {[1, 2, 3, 4, 5, 6, 7, 8].map(s => <option key={s} value={s} className={isWhite ? "bg-white" : "bg-[var(--bg-secondary)]"}>{s}</option>)}
          </select>
          <select name="department" className={`${inputClass} appearance-none`} value={form.department} onChange={handleChange}>
            <option value="" className={isWhite ? "bg-white" : "bg-[var(--bg-secondary)]"}>Department</option>
            {["CSE", "IT", "ECE", "EEE", "MECH", "CIVIL", "AIDS", "AIML", "CSE (Cyber Security)", "Biomedical", "Chemical", "Automobile", "Common"].map(d => <option key={d} value={d} className={isWhite ? "bg-white" : "bg-[var(--bg-secondary)]"}>{d}</option>)}
          </select>
        </div>

        <input name="tags" placeholder="Tags (comma separated)" className={inputClass} value={form.tags} onChange={handleChange} />

        {/* Pricing for Creators */}
        <div className={`rounded-lg p-4 border ${isWhite ? "bg-amber-50/50 border-amber-200" : "bg-amber-900/10 border-amber-700/50"}`}>
          <div className="flex justify-between items-start mb-2">
            <div>
              <p className={`text-sm font-bold flex items-center gap-1.5 ${isWhite ? "text-amber-800" : "text-amber-500"}`}>
                <Award className="h-4 w-4" /> Creator Marketplace
              </p>
              <p className={`text-[11px] mt-0.5 ${isWhite ? "text-amber-700/70" : "text-amber-500/70"}`}>
                Gold Badge Creators can set prices. We take a 15% platform fee. Leave blank for Free.
              </p>
            </div>
          </div>
          <div className="relative mt-3">
            <span className={`absolute left-3 top-2.5 font-medium ${isWhite ? "text-neutral-500" : "text-neutral-400"}`}>₹</span>
            <input type="number" min="0" step="1" name="price" placeholder="Price (e.g. 49)" className={`${inputClass} pl-8 border-amber-500/30 focus:border-amber-500`} value={form.price} onChange={handleChange} />
          </div>
        </div>

        {form.resourceType === "Google NotebookLM" && (
          <div className="space-y-1.5 animate-in fade-in slide-in-from-top-2 duration-300">
            <label className={`text-[10px] font-bold uppercase tracking-wider ml-1 ${mutedText}`}>NotebookLM Share Link</label>
            <input
              name="notebookLMLink"
              placeholder="https://notebooklm.google.com/notebook/..."
              className={`${inputClass} border-blue-500/30 focus:border-blue-500`}
              value={form.notebookLMLink}
              onChange={handleChange}
            />
            <p className={`text-[10px] ml-1 ${mutedText}`}>
              Make sure the notebook is set to "Public" or "Anyone with the link".
            </p>
          </div>
        )}

        {/* Access Level Toggle */}
        <div className={`flex items-center justify-between rounded-lg p-3.5 ${isWhite ? "bg-neutral-50 border border-neutral-100" : "bg-white/5 border border-[var(--glass-border)]"}`}>
          <div>
            <p className={`text-sm font-medium ${headingText}`}>Access Level</p>
            <p className={`text-[11px] mt-0.5 ${mutedText}`}>
              {form.isPublic === "true" ? "Anyone can access" : "College-only access"}
            </p>
          </div>
          <div className="flex gap-1.5">
            <button type="button" onClick={() => setForm({ ...form, isPublic: "true" })} className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${form.isPublic === "true" ? "bg-green-500/10 text-green-500 border-green-500/30" : isWhite ? "border-neutral-200 text-neutral-400" : "border-[var(--glass-border)] text-neutral-500"}`}>
              Public
            </button>
            <button type="button" onClick={() => setForm({ ...form, isPublic: "false" })} className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${form.isPublic === "false" ? "bg-orange-500/10 text-orange-500 border-orange-500/30" : isWhite ? "border-neutral-200 text-neutral-400" : "border-[var(--glass-border)] text-neutral-500"}`}>
              Private
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
          )}
        </div>

        <button type="submit" disabled={loading} className="w-full py-2.5 rounded-lg btn-gradient text-white text-sm font-medium disabled:opacity-50">
          {loading ? "Uploading to Cloud..." : "Upload Resource"}
        </button>
      </form>
    </div>
  );
}
