"use client";

import { useState } from "react";
import { Sparkles, Send, Copy, Check, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

export default function AskAIPage() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const handleAsk = async () => {
    if (!question.trim()) return toast.error("Please enter a question");
    setLoading(true);
    setAnswer("");
    setError("");
    try {
      const res = await fetch("/api/ask-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: question.trim() }),
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

      {/* Input Area */}
      <div className="glass-strong rounded-2xl p-6 neon-border mb-6">
        <textarea
          rows={4}
          placeholder="Ask any academic question... e.g. 'Explain binary search trees with examples'"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-full px-4 py-3 rounded-xl glass neon-border text-white placeholder-gray-500 text-sm focus:outline-none focus:neon-glow resize-none mb-4"
        />
        <button
          onClick={handleAsk}
          disabled={loading}
          className="w-full py-3.5 rounded-xl btn-gradient text-white font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-purple-500/20 hover:shadow-purple-500/30 transition-shadow"
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
        <div className="glass-strong rounded-2xl neon-border overflow-hidden">
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

      {/* Tips */}
      {!answer && !loading && (
        <div className="glass rounded-xl p-5 neon-border">
          <p className="text-sm font-medium text-white mb-3">💡 Try asking:</p>
          <div className="space-y-2">
            {[
              "Explain binary search trees with time complexity",
              "What are the differences between TCP and UDP?",
              "Explain normalization in DBMS with examples",
            ].map((tip) => (
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
