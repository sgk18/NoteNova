"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Upload, File } from "lucide-react";
import toast from "react-hot-toast";
import { useTheme } from "@/context/ThemeContext";

export default function UploadPage() {
  const router = useRouter();
  const { theme } = useTheme();
  const isWhite = theme === "white";
  const [form, setForm] = useState({ title: "", description: "", subject: "", semester: "", department: "", resourceType: "", yearBatch: "", tags: "", isPublic: "true" });
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) return router.push("/login");
    if (!form.title || !form.resourceType) return toast.error("Title and Resource Type are required");
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (file) fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", headers: { Authorization: `Bearer ${token}` }, body: fd });
      const data = await res.json();
      if (res.ok) { toast.success("Resource uploaded!"); router.push("/dashboard"); }
      else toast.error(data.error);
    } catch { toast.error("Upload failed"); }
    finally { setLoading(false); }
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
            {["Notes","Question Papers","Solutions","Project Reports","Study Material"].map(t => <option key={t} value={t} className={isWhite ? "bg-white" : "bg-[var(--bg-secondary)]"}>{t}</option>)}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <select name="semester" className={`${inputClass} appearance-none`} value={form.semester} onChange={handleChange}>
            <option value="" className={isWhite ? "bg-white" : "bg-[var(--bg-secondary)]"}>Semester</option>
            {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s} className={isWhite ? "bg-white" : "bg-[var(--bg-secondary)]"}>{s}</option>)}
          </select>
          <select name="department" className={`${inputClass} appearance-none`} value={form.department} onChange={handleChange}>
            <option value="" className={isWhite ? "bg-white" : "bg-[var(--bg-secondary)]"}>Department</option>
            {["CSE","IT","ECE","EEE","MECH","CIVIL","AIDS","AIML","CSE (Cyber Security)","Biomedical","Chemical","Automobile","Common"].map(d => <option key={d} value={d} className={isWhite ? "bg-white" : "bg-[var(--bg-secondary)]"}>{d}</option>)}
          </select>
        </div>

        <input name="tags" placeholder="Tags (comma separated)" className={inputClass} value={form.tags} onChange={handleChange} />

        {/* Privacy Toggle */}
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

        <div className={`border-2 border-dashed rounded-lg p-6 text-center ${isWhite ? "border-neutral-200 hover:border-neutral-300" : "border-[var(--glass-border)] hover:border-neutral-500"} transition-colors`}>
          <Upload className={`h-6 w-6 mx-auto mb-2 ${mutedText}`} />
          <label className="cursor-pointer">
            <span className={`text-sm font-medium ${headingText}`}>Choose a file</span>
            <span className={`text-xs ml-1 ${mutedText}`}>(PDF, DOCX, PPT, images)</span>
            <input type="file" className="hidden" accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.png,.jpg,.jpeg" onChange={(e) => setFile(e.target.files[0])} />
          </label>
          {file && (
            <p className={`text-xs mt-2 flex items-center justify-center gap-1 ${mutedText}`}>
              <File className="h-3 w-3" /> {file.name}
            </p>
          )}
        </div>

        <button type="submit" disabled={loading} className="w-full py-2.5 rounded-lg btn-gradient text-white text-sm font-medium disabled:opacity-50">
          {loading ? "Uploading..." : "Upload Resource"}
        </button>
      </form>
    </div>
  );
}
