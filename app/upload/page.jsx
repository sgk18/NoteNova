"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Upload, File } from "lucide-react";
import toast from "react-hot-toast";

export default function UploadPage() {
  const router = useRouter();
  const [form, setForm] = useState({ title: "", description: "", subject: "", semester: "", department: "", resourceType: "", yearBatch: "", tags: "", isPublic: "true" });
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

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

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <input name="subject" placeholder="Subject / Course" className="w-full px-4 py-3 rounded-xl glass neon-border text-white placeholder-gray-500 text-sm focus:outline-none focus:neon-glow" value={form.subject} onChange={handleChange} />
          <select name="resourceType" required className="w-full px-4 py-3 rounded-xl glass neon-border text-white text-sm focus:outline-none focus:neon-glow bg-transparent appearance-none" value={form.resourceType} onChange={handleChange}>
            <option value="" className="bg-slate-900">Resource Type *</option>
            {["Notes", "Question Papers", "Solutions", "Project Reports", "Study Material"].map(t => <option key={t} value={t} className="bg-slate-900">{t}</option>)}
          </select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <select name="semester" className="w-full px-4 py-3 rounded-xl glass neon-border text-white text-sm focus:outline-none focus:neon-glow bg-transparent appearance-none" value={form.semester} onChange={handleChange}>
            <option value="" className="bg-slate-900">Semester</option>
            {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s} className="bg-slate-900">{s}</option>)}
          </select>
          <select name="department" className="w-full px-4 py-3 rounded-xl glass neon-border text-white text-sm focus:outline-none focus:neon-glow bg-transparent appearance-none" value={form.department} onChange={handleChange}>
            <option value="" className="bg-slate-900">Department</option>
            {["CSE","IT","ECE","EEE","MECH","CIVIL","AIDS","AIML","CSE (Cyber Security)","Biomedical","Chemical","Automobile","Common"].map(d => <option key={d} value={d} className="bg-slate-900">{d}</option>)}
          </select>
        </div>

        <input name="tags" placeholder="Tags (comma separated, e.g. dsa, algorithms, trees)" className="w-full px-4 py-3 rounded-xl glass neon-border text-white placeholder-gray-500 text-sm focus:outline-none focus:neon-glow" value={form.tags} onChange={handleChange} />

        {/* Privacy Toggle */}
        <div className="flex items-center justify-between glass rounded-xl p-4 neon-border">
          <div>
            <p className="text-sm font-medium text-white">Access Level</p>
            <p className="text-xs text-gray-400 mt-0.5">
              {form.isPublic === "true" ? "Anyone can access this resource" : "Only students from your college can access"}
            </p>
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={() => setForm({ ...form, isPublic: "true" })} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${form.isPublic === "true" ? "bg-green-500/20 text-green-400 border border-green-500/40" : "glass text-gray-500 border border-white/10"}`}>
              Public
            </button>
            <button type="button" onClick={() => setForm({ ...form, isPublic: "false" })} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${form.isPublic === "false" ? "bg-orange-500/20 text-orange-400 border border-orange-500/40" : "glass text-gray-500 border border-white/10"}`}>
              Private
            </button>
          </div>
        </div>

        <div className="border-2 border-dashed border-purple-500/30 rounded-2xl p-8 text-center hover:border-purple-500/50 transition-colors group">
          <Upload className="h-8 w-8 mx-auto text-purple-400 mb-3 group-hover:scale-110 transition-transform" />
          <label className="cursor-pointer">
            <span className="text-sm text-cyan-400 font-medium hover:text-cyan-300 transition-colors">Choose a file</span>
            <span className="text-sm text-gray-500 ml-1">(PDF, DOCX, PPT, images)</span>
            <input type="file" className="hidden" accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.png,.jpg,.jpeg" onChange={(e) => setFile(e.target.files[0])} />
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
