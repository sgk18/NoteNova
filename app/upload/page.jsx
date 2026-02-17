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

      const res = await fetch("/api/upload", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Resource uploaded!");
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
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Upload Resource</h1>
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 space-y-5">
        <input name="title" placeholder="Title *" required className="w-full px-4 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" value={form.title} onChange={handleChange} />
        <textarea name="description" placeholder="Description" rows={3} className="w-full px-4 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none resize-none" value={form.description} onChange={handleChange} />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <input name="subject" placeholder="Subject" className="w-full px-4 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" value={form.subject} onChange={handleChange} />
          <select name="semester" className="w-full px-4 py-2.5 border rounded-lg text-sm bg-white focus:ring-2 focus:ring-indigo-500 outline-none" value={form.semester} onChange={handleChange}>
            <option value="">Semester</option>
            {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <input name="department" placeholder="Department" className="w-full px-4 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" value={form.department} onChange={handleChange} />
        </div>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
          <label className="cursor-pointer">
            <span className="text-sm text-indigo-600 font-medium hover:underline">Choose a file</span>
            <input type="file" className="hidden" accept=".pdf,.doc,.docx,.ppt,.pptx,.txt" onChange={(e) => setFile(e.target.files[0])} />
          </label>
          {file && <p className="text-sm text-gray-500 mt-2 flex items-center justify-center gap-1"><File className="h-4 w-4" /> {file.name}</p>}
        </div>
        <button type="submit" disabled={loading} className="w-full py-2.5 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50">
          {loading ? "Uploading..." : "Upload Resource"}
        </button>
      </form>
    </div>
  );
}
