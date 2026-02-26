"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Upload, File, Award, X, Image as ImageIcon } from "lucide-react";
import toast from "react-hot-toast";
import { useTheme } from "@/context/ThemeContext";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "application/pdf",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation"
];

export default function UploadPage() {
  const router = useRouter();
  const { theme } = useTheme();
  const isWhite = theme === "white";
  const [form, setForm] = useState({ title: "", description: "", subject: "", semester: "", department: "", resourceType: "", yearBatch: "", tags: "", isPublic: "true", price: "", notebookLMLink: "" });
  const [file, setFile] = useState(null);
  const [fileType, setFileType] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    if (selectedFile.size > MAX_FILE_SIZE) {
      toast.error("File size must be less than 10MB");
      e.target.value = "";
      return;
    }

    if (!ALLOWED_TYPES.includes(selectedFile.type)) {
      toast.error("Invalid file type. Allowed: JPG, PNG, PDF, PPT, PPTX");
      e.target.value = "";
      return;
    }

    setFile(selectedFile);
    setFileType(selectedFile.type);
    setPreviewUrl(URL.createObjectURL(selectedFile));
  };

  const removeFile = () => {
    setFile(null);
    setFileType(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  };

  const uploadToCloudinary = async (fileToUpload) => {
    const fd = new FormData();
    fd.append("file", fileToUpload);
    fd.append("upload_preset", "app_uploads");

    // Determine the correct resource type endpoint
    const isImage = fileToUpload.type.startsWith("image/");
    const endpoint = isImage
      ? "https://api.cloudinary.com/v1_1/daiox49tz/image/upload"
      : "https://api.cloudinary.com/v1_1/daiox49tz/raw/upload";

    const res = await fetch(endpoint, {
      method: "POST",
      body: fd,
    });

    if (!res.ok) {
      throw new Error("Failed to upload to Cloudinary");
    }

    const data = await res.json();
    return data.secure_url;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) return router.push("/login");
    if (!form.title || !form.resourceType) return toast.error("Title and Resource Type are required");

    setLoading(true);
    let uploadedFileUrl = "";

    try {
      // 1. Upload file to Cloudinary first if exists
      if (file) {
        toast.loading("Uploading file to Cloudinary...", { id: "upload-toast" });
        uploadedFileUrl = await uploadToCloudinary(file);
      }

      // 2. Send metadata to our backend
      toast.loading("Saving resource metadata...", { id: "upload-toast" });
      const metadata = { ...form };
      if (uploadedFileUrl) {
        metadata.fileUrl = uploadedFileUrl;
        metadata.fileName = file.name;
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
        <div className={`border-2 border-dashed rounded-lg p-6 text-center ${isWhite ? "border-neutral-200 hover:border-neutral-300" : "border-[var(--glass-border)] hover:border-neutral-500"} transition-colors relative`}>
          {!file && (
            <>
              <Upload className={`h-6 w-6 mx-auto mb-2 ${mutedText}`} />
              <label className="cursor-pointer">
                <span className={`text-sm font-medium ${headingText}`}>Choose a file (Max 10MB)</span>
                <span className={`text-xs ml-1 block mt-1 ${mutedText}`}>
                  {form.resourceType === "Google NotebookLM" ? "(Optional Notebook Export)" : "Allowed: JPG, PNG, PDF, PPT, PPTX"}
                </span>
                <input
                  type="file"
                  className="hidden"
                  accept="image/jpeg,image/png,application/pdf,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation"
                  onChange={handleFileChange}
                />
              </label>
            </>
          )}

          {file && (
            <div className="flex flex-col items-center justify-center">
              <button
                type="button"
                onClick={removeFile}
                className="absolute top-2 right-2 p-1 bg-red-500/10 text-red-500 rounded-full hover:bg-red-500/20"
              >
                <X className="h-4 w-4" />
              </button>

              {previewUrl && fileType?.startsWith("image/") && (
                <div className="relative w-full max-w-[200px] h-32 mx-auto rounded overflow-hidden mb-3">
                  <img src={previewUrl} alt="Preview" className="object-contain w-full h-full" />
                </div>
              )}
              {previewUrl && fileType === "application/pdf" && (
                <div className="relative w-full h-[400px] mb-3">
                  <iframe src={previewUrl} className={`w-full h-full border rounded-lg ${isWhite ? "border-neutral-200" : "border-neutral-700"}`} />
                </div>
              )}
              {(!previewUrl || (!fileType?.startsWith("image/") && fileType !== "application/pdf")) && (
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3 ${isWhite ? "bg-blue-50 text-blue-500" : "bg-blue-500/10 text-blue-400"}`}>
                  <File className="h-8 w-8" />
                </div>
              )}

              <p className={`text-sm font-medium ${headingText} truncate max-w-[250px]`}>{file.name}</p>
              <p className={`text-xs mt-1 ${mutedText}`}>
                {(file.size / (1024 * 1024)).toFixed(2)} MB
              </p>
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
