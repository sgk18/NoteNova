"use client";

import { useState, useRef, useEffect } from "react";
import { Sparkles, Send, Copy, Check, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

const MAX_CHARS = 500;

const SUGGESTIONS = [
  "Explain Binary Search with time complexity",
  "What is an Operating System? Explain its types",
  "Explain Fourier Transform with applications",
];

export default function AskAIPage() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [visible, setVisible] = useState(false);
  const answerRef = useRef(null);

  // Auto-scroll & fade-in when answer appears
  useEffect(() => {
    if (answer) {
      setVisible(false);
      const t = setTimeout(() => {
        setVisible(true);
        answerRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 50);
      return () => clearTimeout(t);
    }
  }, [answer]);

  const handleAsk = async () => {
    const trimmed = question.trim();
    if (!trimmed) return toast.error("Please enter a question");
    if (trimmed.length > MAX_CHARS) return toast.error(`Question must be under ${MAX_CHARS} characters`);

    setLoading(true);
    setAnswer("");
    setError("");
    setVisible(false);

    try {
      const res = await fetch("/api/ask-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: trimmed }),
      });
      const data = await res.json();
      if (res.ok) {
        setAnswer(data.answer);
      } else {
        setError(data.error || "Something went wrong");
      }
    } catch {
      setError("Failed to connect to AI service");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(answer);
    setCopied(true);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleAsk();
    }
  };

  const charCount = question.length;
  const isOverLimit = charCount > MAX_CHARS;

  return (
    <div className="max-w-3xl mx-auto px-4 py-10 relative">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[400px] rounded-full bg-purple-600/10 blur-[120px] -z-10" />

      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="p-2.5 rounded-xl bg-gradient-to-br from-purple-500 to-cyan-500 shadow-lg shadow-purple-500/20">
          <Sparkles className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Ask AI</h1>
          <p className="text-sm text-gray-400">Get instant academic help powered by AI</p>
        </div>
      </div>

      {/* Input */}
      <div className="glass-strong rounded-2xl p-6 neon-border mb-6">
        <div className="relative">
          <textarea
            rows={4}
            maxLength={MAX_CHARS + 50}
            placeholder="Ask any academic question... e.g. 'Explain binary search trees with examples'"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full px-4 py-3 rounded-xl glass neon-border text-white placeholder-gray-500 text-sm focus:outline-none focus:neon-glow resize-none"
          />
          <span className={`absolute bottom-3 right-3 text-xs ${isOverLimit ? "text-red-400" : "text-gray-600"}`}>
            {charCount}/{MAX_CHARS}
          </span>
        </div>
        <button
          onClick={handleAsk}
          disabled={loading || isOverLimit}
          className="w-full mt-4 py-3.5 rounded-xl btn-gradient text-white font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 transition-all"
        >
          {loading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="animate-pulse">Thinking...</span>
            </>
          ) : (
            <>
              <Send className="h-4 w-4" /> Ask AI
            </>
          )}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="glass rounded-xl p-4 border border-red-500/30 mb-6">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {/* Answer */}
      {answer && (
        <div
          ref={answerRef}
          className={`glass-strong rounded-2xl neon-border overflow-hidden mb-8 transition-all duration-500 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
        >
          <div className="flex items-center justify-between px-6 py-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-cyan-400" />
              <span className="text-sm font-medium text-white">AI Response</span>
            </div>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium glass border border-white/10 text-gray-400 hover:text-white hover:border-cyan-500/40 transition-all"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-green-400" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
          <div className="px-6 py-5">
            <div className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">{answer}</div>
          </div>
        </div>
      )}

      {/* Suggestions */}
      {!answer && !loading && (
        <div className="glass rounded-xl p-5 neon-border">
          <p className="text-sm font-medium text-white mb-3">💡 Try asking:</p>
          <div className="space-y-2">
            {SUGGESTIONS.map((tip) => (
              <button
                key={tip}
                onClick={() => setQuestion(tip)}
                className="block w-full text-left px-4 py-2.5 rounded-xl glass border border-white/5 text-sm text-gray-400 hover:text-white hover:border-purple-500/30 hover:bg-white/5 transition-all"
              >
                {tip}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
