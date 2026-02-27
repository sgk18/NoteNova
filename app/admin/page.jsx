"use client";

import { useState, useEffect, useCallback } from "react";
import {
    Trash2, Search, FileText, Image, File, ExternalLink,
    Loader2, ShieldCheck, X, AlertTriangle, Filter,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useTheme } from "@/context/ThemeContext";
import toast from "react-hot-toast";

const RESOURCE_TYPES = [
    "All Types",
    "Notes",
    "Question Papers",
    "Solutions",
    "Project Reports",
    "Study Material",
    "Google NotebookLM",
];

function getFileIcon(fileType) {
    if (!fileType) return <File className="h-4 w-4" />;
    if (fileType.includes("pdf")) return <FileText className="h-4 w-4 text-red-400" />;
    if (fileType.includes("image") || fileType.includes("png") || fileType.includes("jpg") || fileType.includes("jpeg"))
        return <Image className="h-4 w-4 text-blue-400" />;
    return <File className="h-4 w-4 text-neutral-400" />;
}

function formatDate(dateStr) {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("en-IN", {
        day: "numeric", month: "short", year: "numeric",
    });
}

export default function AdminPage() {
    const { theme } = useTheme();
    const isWhite = theme === "white";
    const router = useRouter();

    const [user, setUser] = useState(null);
    const [documents, setDocuments] = useState([]);
    const [stats, setStats] = useState({ total: 0, byType: {} });
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [filterType, setFilterType] = useState("All Types");
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deleting, setDeleting] = useState(false);

    // Auth guard
    useEffect(() => {
        const stored = localStorage.getItem("user");
        if (!stored) { router.push("/login"); return; }
        const parsed = JSON.parse(stored);
        if (parsed.role !== "admin") { router.push("/dashboard"); return; }
        setUser(parsed);
    }, [router]);

    const fetchDocuments = useCallback(async () => {
        const token = localStorage.getItem("token");
        if (!token) return;
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (search) params.set("search", search);
            if (filterType !== "All Types") params.set("resourceType", filterType);
            const res = await fetch(`/api/admin/documents?${params}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.status === 403) { router.push("/dashboard"); return; }
            const data = await res.json();
            if (res.ok) {
                setDocuments(data.resources || []);
                setStats(data.stats || { total: 0, byType: {} });
            } else {
                toast.error(data.error || "Failed to load documents");
            }
        } catch {
            toast.error("Failed to connect to server");
        } finally {
            setLoading(false);
        }
    }, [search, filterType, router]);

    useEffect(() => {
        if (user) fetchDocuments();
    }, [user, fetchDocuments]);

    const handleDelete = async () => {
        if (!deleteTarget) return;
        const token = localStorage.getItem("token");
        setDeleting(true);
        try {
            const res = await fetch(`/api/admin/documents?id=${deleteTarget._id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            if (res.ok) {
                toast.success("Document deleted permanently");
                setDocuments((prev) => prev.filter((d) => d._id !== deleteTarget._id));
                setStats((prev) => ({ ...prev, total: prev.total - 1 }));
            } else {
                toast.error(data.error || "Failed to delete");
            }
        } catch {
            toast.error("Failed to connect to server");
        } finally {
            setDeleting(false);
            setDeleteTarget(null);
        }
    };

    // Theme classes
    const cardBg = isWhite ? "bg-white border border-neutral-200" : "bg-[var(--card-bg)] border border-[var(--card-border)]";
    const headingText = isWhite ? "text-neutral-900" : "text-white";
    const mutedText = isWhite ? "text-neutral-500" : "text-neutral-400";
    const bodyText = isWhite ? "text-neutral-700" : "text-neutral-300";
    const inputClass = isWhite
        ? "bg-neutral-50 border border-neutral-200 text-neutral-900 placeholder-neutral-400 focus:border-neutral-400"
        : "bg-[var(--input-bg)] border border-[var(--glass-border)] text-white placeholder-neutral-500 focus:border-neutral-500";
    const hoverRow = isWhite ? "hover:bg-neutral-50" : "hover:bg-white/5";

    if (!user || user.role !== "admin") {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="h-6 w-6 animate-spin text-neutral-400" />
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-xl ${isWhite ? "bg-red-50" : "bg-red-500/10"}`}>
                        <ShieldCheck className={`h-5 w-5 ${isWhite ? "text-red-600" : "text-red-400"}`} />
                    </div>
                    <div>
                        <h1 className={`text-xl font-bold ${headingText}`}>Admin Panel</h1>
                        <p className={`text-xs ${mutedText}`}>Manage all uploaded documents</p>
                    </div>
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                    <div className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${isWhite ? "bg-blue-50 text-blue-700 border border-blue-200" : "bg-blue-500/10 text-blue-400 border border-blue-500/20"}`}>
                        {stats.total} Total Documents
                    </div>
                    {Object.entries(stats.byType).slice(0, 3).map(([type, count]) => (
                        <div key={type} className={`hidden sm:block px-3 py-1.5 rounded-lg text-xs font-medium ${isWhite ? "bg-neutral-100 text-neutral-600" : "bg-white/5 text-neutral-400"}`}>
                            {type}: {count}
                        </div>
                    ))}
                </div>
            </div>

            {/* Search & Filter */}
            <div className={`rounded-xl p-4 mb-6 ${cardBg}`}>
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                        <Search className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 ${mutedText}`} />
                        <input
                            type="text"
                            placeholder="Search documents by title, subject, or description..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className={`w-full pl-10 pr-3 py-2.5 rounded-lg text-sm focus:outline-none ${inputClass}`}
                        />
                    </div>
                    <div className="relative">
                        <Filter className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 ${mutedText}`} />
                        <select
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value)}
                            className={`pl-10 pr-8 py-2.5 rounded-lg text-sm focus:outline-none appearance-none cursor-pointer ${inputClass}`}
                        >
                            {RESOURCE_TYPES.map((t) => (
                                <option key={t} value={t}>{t}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Loading */}
            {loading && (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="h-6 w-6 animate-spin text-neutral-400" />
                    <span className={`ml-3 text-sm ${mutedText}`}>Loading documents...</span>
                </div>
            )}

            {/* Empty */}
            {!loading && documents.length === 0 && (
                <div className={`text-center py-20 rounded-xl ${cardBg}`}>
                    <FileText className={`h-10 w-10 mx-auto mb-3 ${mutedText}`} />
                    <p className={`text-sm font-medium ${headingText}`}>No documents found</p>
                    <p className={`text-xs mt-1 ${mutedText}`}>Try adjusting your search or filter</p>
                </div>
            )}

            {/* Desktop Table */}
            {!loading && documents.length > 0 && (
                <div className={`hidden md:block rounded-xl overflow-hidden ${cardBg}`}>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className={`text-left text-xs font-semibold uppercase tracking-wider ${isWhite ? "bg-neutral-50 text-neutral-500 border-b border-neutral-200" : "bg-white/5 text-neutral-500 border-b border-[var(--glass-border)]"}`}>
                                    <th className="px-4 py-3">Document</th>
                                    <th className="px-4 py-3">Uploaded By</th>
                                    <th className="px-4 py-3">Type</th>
                                    <th className="px-4 py-3">Date</th>
                                    <th className="px-4 py-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className={`divide-y ${isWhite ? "divide-neutral-100" : "divide-[var(--glass-border)]"}`}>
                                {documents.map((doc) => (
                                    <tr key={doc._id} className={`transition-colors ${hoverRow}`}>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                {getFileIcon(doc.fileType)}
                                                <div className="min-w-0">
                                                    <p className={`text-sm font-medium truncate max-w-[300px] ${headingText}`}>{doc.title}</p>
                                                    {doc.subject && <p className={`text-xs truncate ${mutedText}`}>{doc.subject}</p>}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <p className={`text-sm ${bodyText}`}>{doc.uploadedBy?.name || "Anonymous"}</p>
                                            <p className={`text-xs ${mutedText}`}>{doc.uploadedBy?.email || "—"}</p>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${isWhite ? "bg-neutral-100 text-neutral-600" : "bg-white/10 text-neutral-300"}`}>
                                                {doc.resourceType || "—"}
                                            </span>
                                        </td>
                                        <td className={`px-4 py-3 text-sm ${mutedText}`}>
                                            {formatDate(doc.createdAt)}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center justify-end gap-2">
                                                {doc.fileUrl && (
                                                    <a
                                                        href={doc.fileUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className={`p-2 rounded-lg transition-colors ${isWhite ? "text-neutral-400 hover:text-blue-600 hover:bg-blue-50" : "text-neutral-500 hover:text-blue-400 hover:bg-white/5"}`}
                                                        title="Preview file"
                                                    >
                                                        <ExternalLink className="h-4 w-4" />
                                                    </a>
                                                )}
                                                <button
                                                    onClick={() => setDeleteTarget(doc)}
                                                    className={`p-2 rounded-lg transition-colors ${isWhite ? "text-neutral-400 hover:text-red-600 hover:bg-red-50" : "text-neutral-500 hover:text-red-400 hover:bg-white/5"}`}
                                                    title="Delete document"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Mobile Cards */}
            {!loading && documents.length > 0 && (
                <div className="md:hidden space-y-3">
                    {documents.map((doc) => (
                        <div key={doc._id} className={`rounded-xl p-4 ${cardBg}`}>
                            <div className="flex items-start justify-between gap-3">
                                <div className="flex items-start gap-3 min-w-0">
                                    {getFileIcon(doc.fileType)}
                                    <div className="min-w-0">
                                        <p className={`text-sm font-medium truncate ${headingText}`}>{doc.title}</p>
                                        {doc.subject && <p className={`text-xs mt-0.5 ${mutedText}`}>{doc.subject}</p>}
                                    </div>
                                </div>
                                <div className="flex items-center gap-1 flex-shrink-0">
                                    {doc.fileUrl && (
                                        <a
                                            href={doc.fileUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className={`p-1.5 rounded-lg ${isWhite ? "text-neutral-400 hover:text-blue-600" : "text-neutral-500 hover:text-blue-400"}`}
                                        >
                                            <ExternalLink className="h-4 w-4" />
                                        </a>
                                    )}
                                    <button
                                        onClick={() => setDeleteTarget(doc)}
                                        className={`p-1.5 rounded-lg ${isWhite ? "text-neutral-400 hover:text-red-600" : "text-neutral-500 hover:text-red-400"}`}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                            <div className={`mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs ${mutedText}`}>
                                <span>{doc.uploadedBy?.name || "Anonymous"}</span>
                                <span>{doc.resourceType || "—"}</span>
                                <span>{formatDate(doc.createdAt)}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {deleteTarget && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className={`w-full max-w-md rounded-2xl p-6 ${isWhite ? "bg-white" : "bg-slate-900 border border-white/10"}`}>
                        <div className="flex items-start gap-4">
                            <div className={`p-3 rounded-xl flex-shrink-0 ${isWhite ? "bg-red-50" : "bg-red-500/10"}`}>
                                <AlertTriangle className={`h-5 w-5 ${isWhite ? "text-red-600" : "text-red-400"}`} />
                            </div>
                            <div className="min-w-0">
                                <h3 className={`text-base font-bold ${headingText}`}>Delete Document</h3>
                                <p className={`text-sm mt-2 ${bodyText}`}>
                                    Are you sure you want to permanently delete{" "}
                                    <span className="font-semibold">"{deleteTarget.title}"</span>?
                                </p>
                                <p className={`text-xs mt-2 ${mutedText}`}>
                                    This will remove the file from storage and the database. This action cannot be undone.
                                </p>
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 mt-6">
                            <button
                                onClick={() => setDeleteTarget(null)}
                                disabled={deleting}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${isWhite ? "text-neutral-600 bg-neutral-100 hover:bg-neutral-200" : "text-neutral-300 bg-white/10 hover:bg-white/15"}`}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={deleting}
                                className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-red-600 hover:bg-red-700 transition-colors flex items-center gap-2 disabled:opacity-50"
                            >
                                {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                                {deleting ? "Deleting..." : "Delete Permanently"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
