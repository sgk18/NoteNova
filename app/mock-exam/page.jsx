"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Timer, Search, BookOpen, ChevronRight, Loader2, FileText, Library } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import MockExamSimulator from "@/components/MockExamSimulator";
import toast from "react-hot-toast";

export default function MockExamPage() {
  const router = useRouter();
  const { theme } = useTheme();
  const isWhite = theme === "white";

  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedResource, setSelectedResource] = useState(null);
  const [activeTab, setActiveTab] = useState("library"); // 'library' | 'custom'
  const [customTitle, setCustomTitle] = useState("");
  const [customText, setCustomText] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Please login to access Mock Exams");
      router.push("/login");
      return;
    }
    fetchResources();
  }, []);

  const fetchResources = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/resources?sort=trending", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setResources(data.resources || []);
    } catch {
      setResources([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredResources = resources.filter(r =>
    r.title.toLowerCase().includes(search.toLowerCase()) ||
    (r.subject || "").toLowerCase().includes(search.toLowerCase())
  );

  const headingText = isWhite ? "text-neutral-900" : "text-white";
  const bodyText = isWhite ? "text-neutral-600" : "text-neutral-300";
  const mutedText = isWhite ? "text-neutral-400" : "text-neutral-500";
  const cardBg = isWhite ? "bg-white border-neutral-200" : "bg-[var(--card-bg)] border-[var(--card-border)]";

  // If resource is selected, show the exam simulator
  if (selectedResource) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <button
          onClick={() => setSelectedResource(null)}
          className={`flex items-center gap-1 text-sm mb-6 ${mutedText} hover:underline`}
        >
          ← Back to resource selection
        </button>
        <div className={`rounded-lg border p-5 ${cardBg}`}>
          <div className="flex items-center gap-2 mb-4">
            <Timer className={`h-5 w-5 ${isWhite ? "text-neutral-600" : "text-neutral-300"}`} />
            <h1 className={`text-lg font-bold ${headingText}`}>Mock Exam</h1>
          </div>
          <p className={`text-xs mb-4 ${mutedText}`}>
            Resource: {selectedResource.title}
          </p>
          <MockExamSimulator
            resourceId={selectedResource.isCustom ? null : selectedResource._id}
            resourceTitle={selectedResource.title}
            customText={selectedResource.isCustom ? selectedResource.text : null}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <div className={`w-14 h-14 rounded-2xl mx-auto flex items-center justify-center mb-4 ${
          isWhite ? "bg-neutral-100" : "bg-white/10"
        }`}>
          <Timer className={`h-7 w-7 ${isWhite ? "text-neutral-600" : "text-neutral-300"}`} />
        </div>
        <h1 className={`text-2xl font-bold ${headingText}`}>Mock Exam Simulator</h1>
        <p className={`text-sm mt-2 ${bodyText}`}>
          Select a resource to generate an AI-powered timed exam
        </p>
      </div>

      {/* Tabs */}
      <div className={`flex w-full rounded-lg p-1 mb-6 border ${isWhite ? "bg-neutral-100 border-neutral-200" : "bg-white/5 border-white/10"}`}>
        <button
          onClick={() => setActiveTab("library")}
          className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-md transition-all ${
            activeTab === "library"
              ? isWhite ? "bg-white text-neutral-900 shadow-sm" : "bg-white/10 text-white"
              : isWhite ? "text-neutral-500 hover:text-neutral-700" : "text-neutral-400 hover:text-white"
          }`}
        >
          <Library className="h-4 w-4" /> From Library
        </button>
        <button
          onClick={() => setActiveTab("custom")}
          className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-md transition-all ${
            activeTab === "custom"
              ? isWhite ? "bg-white text-neutral-900 shadow-sm" : "bg-white/10 text-white"
              : isWhite ? "text-neutral-500 hover:text-neutral-700" : "text-neutral-400 hover:text-white"
          }`}
        >
          <FileText className="h-4 w-4" /> Custom Material
        </button>
      </div>

      {activeTab === "library" ? (
        <>
          {/* Search */}
          <div className="mb-6 relative">
            <Search className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 ${mutedText}`} />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search resources..."
              className={`w-full pl-9 pr-4 py-2.5 rounded-lg text-sm focus:outline-none ${
                isWhite
                  ? "bg-white border border-neutral-200 text-neutral-900 placeholder-neutral-400 focus:border-neutral-400"
                  : "bg-[var(--input-bg)] border border-[var(--glass-border)] text-white placeholder-neutral-500 focus:border-neutral-500"
              }`}
            />
          </div>

          {/* Resource list */}
          {loading ? (
            <div className="flex justify-center py-16">
              <Loader2 className={`h-6 w-6 animate-spin ${mutedText}`} />
            </div>
          ) : filteredResources.length === 0 ? (
            <div className="text-center py-16">
              <p className={`text-sm ${mutedText}`}>No resources found. Upload some resources first!</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredResources.map(r => (
                <button
                  key={r._id}
                  onClick={() => setSelectedResource(r)}
                  className={`w-full text-left rounded-lg p-4 border transition-all hover:shadow-md ${cardBg} group`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        isWhite ? "bg-neutral-100" : "bg-white/10"
                      }`}>
                        <BookOpen className={`h-4 w-4 ${isWhite ? "text-neutral-500" : "text-neutral-400"}`} />
                      </div>
                      <div className="min-w-0">
                        <p className={`text-sm font-medium truncate ${headingText}`}>{r.title}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          {r.subject && (
                            <span className={`text-[11px] ${mutedText}`}>{r.subject}</span>
                          )}
                          {r.department && (
                            <span className={`text-[11px] ${mutedText}`}>• {r.department}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <ChevronRight className={`h-4 w-4 flex-shrink-0 transition-transform group-hover:translate-x-0.5 ${mutedText}`} />
                  </div>
                </button>
              ))}
            </div>
          )}
        </>
      ) : (
        <div className={`p-5 rounded-lg border ${cardBg}`}>
          <div className="space-y-4">
            <div>
              <label className={`block text-xs font-semibold mb-1.5 ${headingText}`}>Exam Title</label>
              <input
                type="text"
                value={customTitle}
                onChange={e => setCustomTitle(e.target.value)}
                placeholder="e.g. Chapter 5 Physics Quiz"
                className={`w-full px-3 py-2.5 rounded-lg text-sm focus:outline-none ${
                  isWhite
                    ? "bg-white border border-neutral-200 text-neutral-900 placeholder-neutral-400"
                    : "bg-[var(--input-bg)] border border-[var(--glass-border)] text-white placeholder-neutral-500"
                }`}
              />
            </div>
            <div>
              <label className={`block text-xs font-semibold mb-1.5 ${headingText}`}>Source Material</label>
              <textarea
                value={customText}
                onChange={e => setCustomText(e.target.value)}
                placeholder="Paste the text, article, or study notes you want the AI to base the exam on... (Max 15k characters)"
                maxLength={15000}
                rows={8}
                className={`w-full px-3 py-2.5 rounded-lg text-sm focus:outline-none resize-none ${
                  isWhite
                    ? "bg-white border border-neutral-200 text-neutral-900 placeholder-neutral-400"
                    : "bg-[var(--input-bg)] border border-[var(--glass-border)] text-white placeholder-neutral-500"
                }`}
              />
              <p className={`text-right text-[10px] mt-1 ${customText.length > 14000 ? "text-orange-500" : mutedText}`}>
                {customText.length} / 15000
              </p>
            </div>
            <button
              onClick={() => {
                if (!customTitle.trim() || !customText.trim()) {
                  toast.error("Please provide both a title and source material");
                  return;
                }
                setSelectedResource({ isCustom: true, title: customTitle, text: customText });
              }}
              className="w-full py-3 rounded-lg btn-gradient text-white text-sm font-medium flex items-center justify-center gap-2"
            >
              Configure Exam <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
