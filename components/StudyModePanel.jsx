"use client";

import { useState, useRef, useEffect } from "react";
import {
  GraduationCap,
  Brain,
  ClipboardList,
  Target,
  Zap,
  MessageCircle,
  Send,
  Copy,
  Check,
  Loader2,
  ChevronDown,
  ChevronUp,
  X,
} from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import toast from "react-hot-toast";

const STUDY_MODES = [
  { id: "explain", label: "Explain Concepts", icon: Brain, description: "Break down difficult topics in simple terms" },
  { id: "quiz", label: "Generate Quiz", icon: ClipboardList, description: "Test your knowledge with a custom quiz" },
  { id: "exam-areas", label: "Key Exam Areas", icon: Target, description: "Spot the most exam-critical topics" },
  { id: "revision", label: "5-Min Revision", icon: Zap, description: "Quick summary before your exam" },
  { id: "chat", label: "Ask About This", icon: MessageCircle, description: "Ask a specific question about this resource" },
];

function MarkdownRenderer({ content }) {
  const { theme } = useTheme();
  const isWhite = theme === "white";

  const renderContent = () => {
    const lines = content.split("\n");
    const elements = [];
    let i = 0;

    while (i < lines.length) {
      const line = lines[i];

      if (line.startsWith("### ")) {
        elements.push(<h4 key={i} className={`text-sm font-bold mt-4 mb-2 ${isWhite ? "text-neutral-700" : "text-neutral-200"}`}>{renderInline(line.slice(4))}</h4>);
      } else if (line.startsWith("## ")) {
        elements.push(<h3 key={i} className={`text-base font-bold mt-5 mb-2 ${isWhite ? "text-neutral-800" : "text-white"}`}>{renderInline(line.slice(3))}</h3>);
      } else if (line.startsWith("# ")) {
        elements.push(<h2 key={i} className={`text-lg font-bold mt-5 mb-3 ${isWhite ? "text-neutral-900" : "text-white"}`}>{renderInline(line.slice(2))}</h2>);
      } else if (line.match(/^[-*]\s/)) {
        elements.push(
          <div key={i} className="flex items-start gap-2 ml-2 my-1">
            <span className={`w-1 h-1 rounded-full mt-2 flex-shrink-0 ${isWhite ? "bg-neutral-400" : "bg-neutral-500"}`} />
            <span className={`text-sm leading-relaxed ${isWhite ? "text-neutral-600" : "text-neutral-300"}`}>{renderInline(line.replace(/^[-*]\s/, ""))}</span>
          </div>
        );
      } else if (line.match(/^\d+[.)]\s/)) {
        elements.push(
          <div key={i} className="flex items-start gap-2 ml-1 my-1">
            <span className={`text-sm font-medium flex-shrink-0 ${isWhite ? "text-neutral-500" : "text-neutral-400"}`}>{line.match(/^\d+[.)]/)[0]}</span>
            <span className={`text-sm leading-relaxed ${isWhite ? "text-neutral-600" : "text-neutral-300"}`}>{renderInline(line.replace(/^\d+[.)]\s/, ""))}</span>
          </div>
        );
      } else if (line.match(/^---+$/)) {
        elements.push(<hr key={i} className={`my-4 ${isWhite ? "border-neutral-200" : "border-neutral-700"}`} />);
      } else if (line.trim() === "") {
        elements.push(<div key={i} className="h-2" />);
      } else {
        elements.push(<p key={i} className={`text-sm leading-relaxed my-1 ${isWhite ? "text-neutral-600" : "text-neutral-300"}`}>{renderInline(line)}</p>);
      }
      i++;
    }
    return elements;
  };

  const renderInline = (text) => {
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, idx) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return <strong key={idx} className={isWhite ? "text-neutral-800" : "text-white"}>{part.slice(2, -2)}</strong>;
      }
      const codeParts = part.split(/(`[^`]+`)/g);
      return codeParts.map((cp, ci) => {
        if (cp.startsWith("`") && cp.endsWith("`")) {
          return <code key={`${idx}-${ci}`} className={`px-1.5 py-0.5 rounded text-xs font-mono ${isWhite ? "bg-neutral-100 text-neutral-700" : "bg-white/10 text-neutral-200"}`}>{cp.slice(1, -1)}</code>;
        }
        return <span key={`${idx}-${ci}`}>{cp}</span>;
      });
    });
  };

  return <div className="space-y-0.5">{renderContent()}</div>;
}

export default function StudyModePanel({ resourceId, resourceTitle }) {
  const { theme } = useTheme();
  const isWhite = theme === "white";

  const [isOpen, setIsOpen] = useState(false);
  const [activeMode, setActiveMode] = useState(null);
  const [loading, setLoading] = useState(false);
  const [answer, setAnswer] = useState("");
  const [chatQuestion, setChatQuestion] = useState("");
  const [copied, setCopied] = useState(false);
  const resultRef = useRef(null);
  const panelRef = useRef(null);

  useEffect(() => {
    if (answer) resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [answer]);

  const handleStudy = async (mode, question = "") => {
    const token = localStorage.getItem("token");
    if (!token) return toast.error("Please login to use AI Study Mode");

    setActiveMode(mode);
    setLoading(true);
    setAnswer("");

    try {
      const res = await fetch("/api/study-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ resourceId, mode, question }),
      });
      const data = await res.json();
      if (res.ok) {
        setAnswer(data.answer);
        toast.success("AI response ready");
      } else {
        toast.error(data.error || "AI request failed");
        setActiveMode(null);
      }
    } catch {
      toast.error("Failed to connect to AI");
      setActiveMode(null);
    } finally {
      setLoading(false);
    }
  };

  const handleChatSubmit = (e) => {
    e?.preventDefault();
    const trimmed = chatQuestion.trim();
    if (!trimmed) return toast.error("Please enter a question");
    handleStudy("chat", trimmed);
  };

  const handleCopy = () => { navigator.clipboard.writeText(answer); setCopied(true); toast.success("Copied"); setTimeout(() => setCopied(false), 2000); };
  const handleReset = () => { setActiveMode(null); setAnswer(""); setChatQuestion(""); };

  const headingText = isWhite ? "text-neutral-900" : "text-white";
  const mutedText = isWhite ? "text-neutral-400" : "text-neutral-500";
  const borderColor = isWhite ? "border-neutral-200" : "border-[var(--card-border)]";
  const cardBg = isWhite ? "bg-white" : "bg-[var(--card-bg)]";
  const inputClass = `w-full px-3 py-2.5 rounded-lg text-sm focus:outline-none ${isWhite ? "bg-neutral-50 border border-neutral-200 text-neutral-900 placeholder-neutral-400 focus:border-neutral-400" : "bg-[var(--input-bg)] border border-[var(--glass-border)] text-white placeholder-neutral-500 focus:border-neutral-500"}`;

  return (
    <div ref={panelRef} className="mb-6">
      {/* Toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full py-3 px-4 rounded-lg text-sm font-medium flex items-center justify-between gap-2 transition-colors btn-gradient text-white`}
      >
        <div className="flex items-center gap-2">
          <GraduationCap className="h-4 w-4" />
          <span>Study This With AI</span>
        </div>
        {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </button>

      {/* Panel */}
      {isOpen && (
        <div className={`mt-2 rounded-lg border overflow-hidden ${cardBg} ${borderColor}`}>
          {/* Mode Selector */}
          <div className={`p-4 border-b ${borderColor}`}>
            <p className={`text-xs font-medium mb-3 ${headingText}`}>Choose a study mode</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {STUDY_MODES.map((mode) => {
                const isActive = activeMode === mode.id;
                const Icon = mode.icon;
                return (
                  <button
                    key={mode.id}
                    onClick={() => mode.id === "chat" ? (setActiveMode("chat"), setAnswer("")) : handleStudy(mode.id)}
                    disabled={loading}
                    className={`relative text-left p-3 rounded-lg border transition-colors disabled:opacity-50 ${
                      isActive
                        ? isWhite ? "bg-neutral-100 border-neutral-400" : "bg-white/10 border-neutral-500"
                        : isWhite ? "bg-neutral-50 border-neutral-200 hover:border-neutral-300" : "bg-white/5 border-[var(--glass-border)] hover:border-neutral-500"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Icon className={`h-3.5 w-3.5 ${isWhite ? "text-neutral-500" : "text-neutral-400"}`} />
                      <span className={`text-xs font-medium ${headingText}`}>{mode.label}</span>
                    </div>
                    <p className={`text-[11px] ${mutedText}`}>{mode.description}</p>
                    {isActive && loading && <Loader2 className={`h-3.5 w-3.5 animate-spin absolute top-2 right-2 ${mutedText}`} />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Chat Input */}
          {activeMode === "chat" && !answer && (
            <div className={`p-4 border-b ${borderColor}`}>
              <form onSubmit={handleChatSubmit} className="space-y-2">
                <label className={`text-xs font-medium ${isWhite ? "text-neutral-600" : "text-neutral-300"}`}>
                  Ask about &quot;{resourceTitle}&quot;
                </label>
                <div className="flex gap-2">
                  <input type="text" value={chatQuestion} onChange={(e) => setChatQuestion(e.target.value)} placeholder="e.g. What is the difference between stack and queue?" disabled={loading} className={`flex-1 ${inputClass}`} onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleChatSubmit(); } }} />
                  <button type="submit" disabled={loading || !chatQuestion.trim()} className="px-4 py-2.5 rounded-lg btn-gradient text-white text-sm flex items-center disabled:opacity-50">
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div className="p-6 flex flex-col items-center gap-3">
              <Loader2 className={`h-6 w-6 animate-spin ${isWhite ? "text-neutral-400" : "text-neutral-500"}`} />
              <div className="text-center">
                <p className={`text-sm font-medium ${headingText}`}>Preparing study material...</p>
                <p className={`text-[11px] mt-0.5 ${mutedText}`}>Analyzing &quot;{resourceTitle}&quot;</p>
              </div>
            </div>
          )}

          {/* Result */}
          {answer && (
            <div ref={resultRef}>
              <div className={`flex items-center justify-between px-4 py-2.5 border-b ${borderColor}`}>
                <span className={`text-xs font-medium ${headingText}`}>{STUDY_MODES.find((m) => m.id === activeMode)?.label}</span>
                <div className="flex items-center gap-1.5">
                  <button onClick={handleCopy} className={`flex items-center gap-1 px-2 py-1 rounded text-[11px] font-medium border transition-colors ${isWhite ? "border-neutral-200 text-neutral-500 hover:bg-neutral-50" : "border-[var(--glass-border)] text-neutral-400 hover:bg-white/5"}`}>
                    {copied ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
                    {copied ? "Copied" : "Copy"}
                  </button>
                  <button onClick={handleReset} className={`flex items-center gap-1 px-2 py-1 rounded text-[11px] font-medium border transition-colors ${isWhite ? "border-neutral-200 text-neutral-500 hover:bg-neutral-50" : "border-[var(--glass-border)] text-neutral-400 hover:bg-white/5"}`}>
                    <X className="h-3 w-3" /> New
                  </button>
                </div>
              </div>
              <div className="px-4 py-4 max-h-[600px] overflow-y-auto">
                <MarkdownRenderer content={answer} />
              </div>

              {activeMode === "chat" && (
                <div className={`px-4 py-3 border-t ${borderColor}`}>
                  <form onSubmit={(e) => { e.preventDefault(); handleChatSubmit(); }} className="flex gap-2">
                    <input type="text" value={chatQuestion} onChange={(e) => setChatQuestion(e.target.value)} placeholder="Ask a follow-up..." disabled={loading} className={`flex-1 ${inputClass}`} />
                    <button type="submit" disabled={loading || !chatQuestion.trim()} className="px-3 py-2.5 rounded-lg btn-gradient text-white text-sm flex items-center disabled:opacity-50">
                      <Send className="h-3.5 w-3.5" />
                    </button>
                  </form>
                </div>
              )}
            </div>
          )}

          {/* Empty */}
          {!loading && !answer && activeMode !== "chat" && (
            <div className="p-5 text-center">
              <p className={`text-[11px] ${mutedText}`}>Select a study mode above to begin</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
