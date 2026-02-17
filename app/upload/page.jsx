"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Upload, File } from "lucide-react";
import toast from "react-hot-toast";

export default function UploadPage() {
  const router = useRouter();
  const [form, setForm] = useState({ title: "", description: "", subject: "", semester: "", department: "" });
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) return router.push("/login");
    if (!form.title) return toast.error("Title is required");
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (file) fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", headers: { Authorization: `Bearer ${token}` }, body: fd });
      const data = await res.json();
      if (res.ok) {
        toast.success("Resource uploaded! +10 points 🚀");
        router.push("/dashboard");
      } else {
        toast.error(data.error);
      }
    } catch {
      toast.error("Upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-10 relative">
      <div className="absolute top-0 right-0 w-[400px] h-[400px] rounded-full bg-purple-600/10 blur-[120px] -z-10" />
      <h1 className="text-2xl font-bold text-white mb-6">Upload Resource</h1>
      <form onSubmit={handleSubmit} className="glass-strong rounded-2xl p-8 neon-border space-y-5">
        <input name="title" placeholder="Title *" required className="w-full px-4 py-3 rounded-xl glass neon-border text-white placeholder-gray-500 text-sm focus:outline-none focus:neon-glow" value={form.title} onChange={handleChange} />
        <textarea name="description" placeholder="Description" rows={3} className="w-full px-4 py-3 rounded-xl glass neon-border text-white placeholder-gray-500 text-sm focus:outline-none focus:neon-glow resize-none" value={form.description} onChange={handleChange} />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <input name="subject" placeholder="Subject" className="w-full px-4 py-3 rounded-xl glass neon-border text-white placeholder-gray-500 text-sm focus:outline-none focus:neon-glow" value={form.subject} onChange={handleChange} />
          <select name="semester" className="w-full px-4 py-3 rounded-xl glass neon-border text-white text-sm focus:outline-none focus:neon-glow bg-transparent appearance-none" value={form.semester} onChange={handleChange}>
            <option value="" className="bg-slate-900">Semester</option>
            {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s} className="bg-slate-900">{s}</option>)}
          </select>
          <input name="department" placeholder="Department" className="w-full px-4 py-3 rounded-xl glass neon-border text-white placeholder-gray-500 text-sm focus:outline-none focus:neon-glow" value={form.department} onChange={handleChange} />
        </div>
        <div className="border-2 border-dashed border-purple-500/30 rounded-2xl p-8 text-center hover:border-purple-500/50 transition-colors group">
          <Upload className="h-8 w-8 mx-auto text-purple-400 mb-3 group-hover:scale-110 transition-transform" />
          <label className="cursor-pointer">
            <span className="text-sm text-cyan-400 font-medium hover:text-cyan-300 transition-colors">Choose a file</span>
            <span className="text-sm text-gray-500 ml-1">or drag & drop</span>
            <input type="file" className="hidden" accept=".pdf,.doc,.docx,.ppt,.pptx,.txt" onChange={(e) => setFile(e.target.files[0])} />
          </label>
          {file && (
            <p className="text-sm text-gray-400 mt-3 flex items-center justify-center gap-1.5">
              <File className="h-4 w-4 text-cyan-400" /> {file.name}
            </p>
          )}
        </div>
        <button type="submit" disabled={loading} className="w-full py-3 rounded-xl btn-gradient text-white font-semibold text-sm disabled:opacity-50">
          {loading ? "Uploading..." : "Upload Resource"}
        </button>
      </form>
    </div>
  );
}
