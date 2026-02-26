"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { UploadCloud, Download, Star, X } from "lucide-react";
import ResourceCard from "@/components/ResourceCard";
import toast from "react-hot-toast";
import { useTheme } from "@/context/ThemeContext";
import Dropdown from "@/components/Dropdown";

export default function DashboardPage() {
  const router = useRouter();
  const { theme } = useTheme();
  const isWhite = theme === "white";
  const [user, setUser] = useState(null);
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editModal, setEditModal] = useState(null);
  const [editForm, setEditForm] = useState({});

  useEffect(() => {
    const token = localStorage.getItem("token");
    const stored = localStorage.getItem("user");
    if (!token || !stored) return router.push("/login");
    setUser(JSON.parse(stored));
    fetchMyResources(JSON.parse(stored).id);
  }, []);

  const fetchMyResources = async (userId) => {
    try {
      const res = await fetch(`/api/resources?userId=${userId}`);
      const data = await res.json();
      setResources(data.resources || []);
    } catch {} finally { setLoading(false); }
  };

  const handleDelete = async (resourceId) => {
    if (!confirm("Are you sure you want to delete this resource?")) return;
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`/api/resources?resourceId=${resourceId}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) { toast.success("Resource deleted"); setResources(resources.filter((r) => r._id !== resourceId)); }
      else { const data = await res.json(); toast.error(data.error || "Delete failed"); }
    } catch { toast.error("Delete failed"); }
  };

  const openEdit = (resource) => {
    setEditForm({ resourceId: resource._id, title: resource.title, description: resource.description || "", subject: resource.subject || "", semester: resource.semester || "", department: resource.department || "", resourceType: resource.resourceType || "Notes", yearBatch: resource.yearBatch || "", tags: (resource.tags || []).join(", "), isPublic: resource.isPublic !== false });
    setEditModal(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    try {
      const body = { ...editForm, tags: editForm.tags.split(",").map((t) => t.trim()).filter(Boolean) };
      const res = await fetch("/api/resources", { method: "PUT", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify(body) });
      if (res.ok) { toast.success("Resource updated"); setEditModal(null); fetchMyResources(user.id); }
      else { const data = await res.json(); toast.error(data.error || "Edit failed"); }
    } catch { toast.error("Edit failed"); }
  };

  const totalDownloads = resources.reduce((s, r) => s + (r.downloads || 0), 0);
  const avgRating = resources.length ? (resources.reduce((s, r) => s + (r.avgRating || 0), 0) / resources.length).toFixed(1) : "0";

  const headingText = isWhite ? "text-neutral-900" : "text-white";
  const mutedText = isWhite ? "text-neutral-400" : "text-neutral-500";
  const card = `rounded-lg p-4 ${isWhite ? "bg-white border border-neutral-200" : "bg-[var(--card-bg)] border border-[var(--card-border)]"}`;
  const inputClass = `w-full px-3 py-2.5 rounded-lg text-sm focus:outline-none ${isWhite ? "bg-white border border-neutral-200 text-neutral-900 placeholder-neutral-400 focus:border-neutral-400" : "bg-[var(--input-bg)] border border-[var(--glass-border)] text-white placeholder-neutral-500 focus:border-neutral-500"}`;

  const stats = [
    { label: "Uploads", value: resources.length },
    { label: "Downloads", value: totalDownloads },
    { label: "Avg Rating", value: avgRating },
  ];

  if (loading) return <div className="flex justify-center py-32"><div className={`w-6 h-6 border-2 border-t-transparent rounded-full animate-spin ${isWhite ? "border-neutral-300" : "border-neutral-600"}`} /></div>;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <h1 className={`text-xl font-bold mb-1 ${headingText}`}>Dashboard</h1>
      <p className={`text-sm mb-6 ${mutedText}`}>Welcome back, {user?.name}</p>

      <div className="grid grid-cols-3 gap-3 mb-8">
        {stats.map((s) => (
          <div key={s.label} className={card}>
            <p className={`text-2xl font-bold ${headingText}`}>{s.value}</p>
            <p className={`text-xs ${mutedText}`}>{s.label}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between mb-4">
        <h2 className={`text-base font-semibold ${headingText}`}>My Resources</h2>
        <button onClick={() => router.push("/upload")} className="px-3 py-2 rounded-lg btn-gradient text-white text-xs font-medium flex items-center gap-1.5">
          <UploadCloud className="h-3.5 w-3.5" /> Upload
        </button>
      </div>

      {resources.length === 0 ? (
        <div className={`text-center py-12 rounded-lg ${isWhite ? "bg-neutral-50 border border-neutral-200" : "bg-[var(--card-bg)] border border-[var(--card-border)]"}`}>
          <p className={`text-sm ${mutedText}`}>No uploads yet</p>
          <button onClick={() => router.push("/upload")} className={`mt-2 text-xs ${headingText} hover:underline`}>Upload your first resource →</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {resources.map((r) => <ResourceCard key={r._id} resource={r} showEdit onEdit={openEdit} onDelete={handleDelete} />)}
        </div>
      )}

      {/* Edit Modal */}
      {editModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className={`w-full max-w-lg rounded-lg p-5 sm:p-6 relative max-h-[90vh] overflow-y-auto ${isWhite ? "bg-white border border-neutral-200" : "bg-[var(--card-bg)] border border-[var(--card-border)]"}`}>
            <button onClick={() => setEditModal(null)} className={`absolute top-3 right-3 ${mutedText} hover:opacity-70`}><X className="h-4 w-4" /></button>
            <h3 className={`text-base font-semibold mb-4 ${headingText}`}>Edit Resource</h3>
            <form onSubmit={handleEditSubmit} className="space-y-3">
              <input name="title" placeholder="Title" className={inputClass} value={editForm.title} onChange={(e) => setEditForm({ ...editForm, title: e.target.value })} />
              <textarea name="description" placeholder="Description" rows={2} className={`${inputClass} resize-none`} value={editForm.description} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} />
              <div className="grid grid-cols-2 gap-2">
                <input name="subject" placeholder="Subject" className={inputClass} value={editForm.subject} onChange={(e) => setEditForm({ ...editForm, subject: e.target.value })} />
                <Dropdown
                  name="resourceType"
                  options={["Notes","Question Papers","Solutions","Project Reports","Study Material", "Google NotebookLM"]}
                  value={editForm.resourceType}
                  onChange={(e) => setEditForm({ ...editForm, resourceType: e.target.value })}
                  placeholder="Type"
                  isWhite={isWhite}
                />
                <Dropdown
                  name="semester"
                  options={["1","2","3","4","5","6","7","8"]}
                  value={editForm.semester}
                  onChange={(e) => setEditForm({ ...editForm, semester: e.target.value })}
                  placeholder="Semester"
                  isWhite={isWhite}
                />
                <input name="yearBatch" placeholder="Year / Batch" className={inputClass} value={editForm.yearBatch} onChange={(e) => setEditForm({ ...editForm, yearBatch: e.target.value })} />
              </div>
              <input name="tags" placeholder="Tags (comma separated)" className={inputClass} value={editForm.tags} onChange={(e) => setEditForm({ ...editForm, tags: e.target.value })} />
              <div className="flex gap-2">
                <button type="button" onClick={() => setEditForm({ ...editForm, isPublic: true })} className={`flex-1 py-2 rounded-lg text-xs font-medium border transition-colors ${editForm.isPublic ? "bg-green-500/10 text-green-500 border-green-500/30" : isWhite ? "border-neutral-200 text-neutral-400" : "border-[var(--glass-border)] text-neutral-500"}`}>Public</button>
                <button type="button" onClick={() => setEditForm({ ...editForm, isPublic: false })} className={`flex-1 py-2 rounded-lg text-xs font-medium border transition-colors ${!editForm.isPublic ? "bg-orange-500/10 text-orange-500 border-orange-500/30" : isWhite ? "border-neutral-200 text-neutral-400" : "border-[var(--glass-border)] text-neutral-500"}`}>Private</button>
              </div>
              <button type="submit" className="w-full py-2.5 rounded-lg btn-gradient text-white text-sm font-medium">Save Changes</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
