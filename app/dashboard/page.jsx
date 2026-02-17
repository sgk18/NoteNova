"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { UploadCloud, Download, Star, Trash2, Pencil, X } from "lucide-react";
import ResourceCard from "@/components/ResourceCard";
import toast from "react-hot-toast";

export default function DashboardPage() {
  const router = useRouter();
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
      const res = await fetch(`/api/resources?resourceId=${resourceId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        toast.success("Resource deleted");
        setResources(resources.filter((r) => r._id !== resourceId));
      } else {
        const data = await res.json();
        toast.error(data.error || "Delete failed");
      }
    } catch {
      toast.error("Delete failed");
    }
  };

  const openEdit = (resource) => {
    setEditForm({
      resourceId: resource._id,
      title: resource.title,
      description: resource.description || "",
      subject: resource.subject || "",
      semester: resource.semester || "",
      department: resource.department || "",
      resourceType: resource.resourceType || "Notes",
      yearBatch: resource.yearBatch || "",
      tags: (resource.tags || []).join(", "),
      isPublic: resource.isPublic !== false,
    });
    setEditModal(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    try {
      const body = {
        ...editForm,
        tags: editForm.tags.split(",").map((t) => t.trim()).filter(Boolean),
      };
      const res = await fetch("/api/resources", {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        toast.success("Resource updated");
        setEditModal(null);
        fetchMyResources(user.id);
      } else {
        const data = await res.json();
        toast.error(data.error || "Edit failed");
      }
    } catch {
      toast.error("Edit failed");
    }
  };

  const totalDownloads = resources.reduce((s, r) => s + (r.downloads || 0), 0);
  const avgRating = resources.length ? (resources.reduce((s, r) => s + (r.avgRating || 0), 0) / resources.length).toFixed(1) : "0";

  const stats = [
    { label: "Uploads", value: resources.length, icon: UploadCloud, gradient: "from-purple-500 to-blue-500" },
    { label: "Downloads", value: totalDownloads, icon: Download, gradient: "from-cyan-500 to-teal-500" },
    { label: "Avg Rating", value: avgRating, icon: Star, gradient: "from-yellow-500 to-orange-500" },
  ];

  if (loading) {
    return <div className="flex justify-center py-32"><div className="w-10 h-10 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" /></div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-2xl font-bold text-white mb-2">Dashboard</h1>
      <p className="text-gray-400 text-sm mb-8">Welcome back, {user?.name}</p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-10">
        {stats.map((s) => (
          <div key={s.label} className="glass rounded-2xl p-6 neon-border hover:neon-glow transition-all duration-300 flex items-center gap-4">
            <div className={`p-3 rounded-xl bg-gradient-to-br ${s.gradient} shadow-lg`}>
              <s.icon className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{s.value}</p>
              <p className="text-sm text-gray-400">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white">My Resources</h2>
        <button onClick={() => router.push("/upload")} className="px-4 py-2 rounded-xl btn-gradient text-white text-sm font-medium flex items-center gap-1.5">
          <UploadCloud className="h-4 w-4" /> Upload
        </button>
      </div>

      {resources.length === 0 ? (
        <div className="text-center py-16 glass rounded-2xl neon-border">
          <p className="text-gray-500 mb-3">You haven&apos;t uploaded any resources yet</p>
          <button onClick={() => router.push("/upload")} className="text-cyan-400 hover:text-cyan-300 text-sm">Upload your first resource →</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {resources.map((r) => (
            <ResourceCard key={r._id} resource={r} showEdit onEdit={openEdit} onDelete={handleDelete} />
          ))}
        </div>
      )}

      {/* Edit Modal */}
      {editModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg glass-strong rounded-2xl p-8 neon-border relative max-h-[90vh] overflow-y-auto">
            <button onClick={() => setEditModal(null)} className="absolute top-4 right-4 text-gray-400 hover:text-white">
              <X className="h-5 w-5" />
            </button>
            <h3 className="text-lg font-bold text-white mb-5">Edit Resource</h3>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <input name="title" placeholder="Title" className="w-full px-4 py-3 rounded-xl glass neon-border text-white placeholder-gray-500 text-sm focus:outline-none" value={editForm.title} onChange={(e) => setEditForm({ ...editForm, title: e.target.value })} />
              <textarea name="description" placeholder="Description" rows={2} className="w-full px-4 py-3 rounded-xl glass neon-border text-white placeholder-gray-500 text-sm focus:outline-none resize-none" value={editForm.description} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} />
              <div className="grid grid-cols-2 gap-3">
                <input name="subject" placeholder="Subject" className="px-4 py-3 rounded-xl glass neon-border text-white placeholder-gray-500 text-sm focus:outline-none" value={editForm.subject} onChange={(e) => setEditForm({ ...editForm, subject: e.target.value })} />
                <select name="resourceType" className="px-4 py-3 rounded-xl glass neon-border text-white text-sm bg-transparent appearance-none focus:outline-none" value={editForm.resourceType} onChange={(e) => setEditForm({ ...editForm, resourceType: e.target.value })}>
                  {["Notes","Question Papers","Solutions","Project Reports","Study Material"].map(t => <option key={t} value={t} className="bg-slate-900">{t}</option>)}
                </select>
                <select name="semester" className="px-4 py-3 rounded-xl glass neon-border text-white text-sm bg-transparent appearance-none focus:outline-none" value={editForm.semester} onChange={(e) => setEditForm({ ...editForm, semester: e.target.value })}>
                  <option value="" className="bg-slate-900">Semester</option>
                  {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s} className="bg-slate-900">{s}</option>)}
                </select>
                <input name="yearBatch" placeholder="Year / Batch" className="px-4 py-3 rounded-xl glass neon-border text-white placeholder-gray-500 text-sm focus:outline-none" value={editForm.yearBatch} onChange={(e) => setEditForm({ ...editForm, yearBatch: e.target.value })} />
              </div>
              <input name="tags" placeholder="Tags (comma separated)" className="w-full px-4 py-3 rounded-xl glass neon-border text-white placeholder-gray-500 text-sm focus:outline-none" value={editForm.tags} onChange={(e) => setEditForm({ ...editForm, tags: e.target.value })} />
              <div className="flex gap-2">
                <button type="button" onClick={() => setEditForm({ ...editForm, isPublic: true })} className={`flex-1 py-2 rounded-lg text-xs font-medium ${editForm.isPublic ? "bg-green-500/20 text-green-400 border border-green-500/40" : "glass text-gray-500 border border-white/10"}`}>Public</button>
                <button type="button" onClick={() => setEditForm({ ...editForm, isPublic: false })} className={`flex-1 py-2 rounded-lg text-xs font-medium ${!editForm.isPublic ? "bg-orange-500/20 text-orange-400 border border-orange-500/40" : "glass text-gray-500 border border-white/10"}`}>Private</button>
              </div>
              <button type="submit" className="w-full py-3 rounded-xl btn-gradient text-white font-semibold text-sm">Save Changes</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
