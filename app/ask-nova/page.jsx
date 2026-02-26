"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Copy, Check, Loader2, Volume2, Users } from "lucide-react";
import toast from "react-hot-toast";
import { useTheme } from "@/context/ThemeContext";
import ExpertChat from "@/components/ExpertChat";
import { useSocket } from "@/hooks/useSocket";

const MAX_CHARS = 500;
const SUGGESTIONS = [
  "Explain Binary Search with time complexity",
  "What is an Operating System? Explain its types",
  "Explain Fourier Transform with applications",
];

export default function AskNovaPage() {
  const { theme } = useTheme();
  const isWhite = theme === "white";
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [audioLoading, setAudioLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [showExpertChat, setShowExpertChat] = useState(false);
  const { emitEscalation } = useSocket();
  const answerRef = useRef(null);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) setUser(JSON.parse(stored));
  }, []);

  useEffect(() => {
    if (answer) answerRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [answer]);

  const handleAsk = async () => {
    const trimmed = question.trim();
    if (!trimmed) return toast.error("Please enter a question");
    if (trimmed.length > MAX_CHARS) return toast.error(`Max ${MAX_CHARS} characters`);
    setLoading(true); setAnswer(""); setError(""); setAudioUrl("");
    try {
      const res = await fetch("/api/ask-nova", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ question: trimmed }) });
      const data = await res.json();
      if (res.ok) setAnswer(data.answer);
      else setError(data.error || "Something went wrong");
    } catch { setError("Failed to connect to AI"); }
    finally { setLoading(false); }
  };

  const handleGenerateAudio = async () => {
    if (!answer) return;
    if (audioUrl) {
      const audio = new Audio(audioUrl);
      audio.play();
      return;
    }
    setAudioLoading(true);
    try {
      const res = await fetch("/api/text-to-speech", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: answer.slice(0, 500) })
      });
      const result = await res.json();
      if (res.ok && result.data) {
        let finalUrl = "";
        if (Array.isArray(result.data)) {
          const arr = new Uint8Array(result.data);
          const blob = new Blob([arr], { type: "audio/wav" });
          finalUrl = URL.createObjectURL(blob);
        } else if (typeof result.data === 'string') {
           finalUrl = result.data.startsWith('http') ? result.data : `data:audio/wav;base64,${result.data}`;
        }
        setAudioUrl(finalUrl);
        const audio = new Audio(finalUrl);
        audio.play();
      } else {
        toast.error(result.error || "Failed to generate audio");
      }
    } catch {
      toast.error("Failed to connect to audio service");
    } finally {
      setAudioLoading(false);
    }
  };

  const handleCopy = () => { navigator.clipboard.writeText(answer); setCopied(true); toast.success("Copied"); setTimeout(() => setCopied(false), 2000); };
  const handleKeyDown = (e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleAsk(); } };

  const headingText = isWhite ? "text-neutral-900" : "text-white";
  const mutedText = isWhite ? "text-neutral-400" : "text-neutral-500";
  const bodyText = isWhite ? "text-neutral-600" : "text-neutral-300";
  const isOverLimit = question.length > MAX_CHARS;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className={`text-xl font-bold ${headingText}`}>Ask Nova</h1>
        <p className={`text-xs mt-1 ${mutedText}`}>Get instant academic help powered by AI</p>
      </div>

      {/* Input */}
      <div className={`rounded-lg p-5 mb-5 ${isWhite ? "bg-white border border-neutral-200" : "bg-[var(--card-bg)] border border-[var(--card-border)]"}`}>
        <div className="relative">
          <textarea
            rows={4}
            maxLength={MAX_CHARS + 50}
            placeholder="Ask any academic question..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={handleKeyDown}
            className={`w-full px-3 py-2.5 rounded-lg text-sm focus:outline-none resize-none ${isWhite ? "bg-neutral-50 border border-neutral-200 text-neutral-900 placeholder-neutral-400 focus:border-neutral-400" : "bg-[var(--input-bg)] border border-[var(--glass-border)] text-white placeholder-neutral-500 focus:border-neutral-500"}`}
          />
          <span className={`absolute bottom-3 right-3 text-[11px] ${isOverLimit ? "text-red-400" : mutedText}`}>{question.length}/{MAX_CHARS}</span>
        </div>
        <button onClick={handleAsk} disabled={loading || isOverLimit} className="w-full mt-3 py-2.5 rounded-lg btn-gradient text-white text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-50">
          {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Thinking...</> : <><Send className="h-3.5 w-3.5" /> Ask Nova</>}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className={`rounded-lg p-3 mb-5 border ${isWhite ? "border-red-200 bg-red-50" : "border-red-500/30 bg-red-500/5"}`}>
          <p className="text-sm text-red-500">{error}</p>
        </div>
      )}

      {/* Answer */}
      {answer && (
        <div ref={answerRef} className={`rounded-lg overflow-hidden mb-5 ${isWhite ? "bg-white border border-neutral-200" : "bg-[var(--card-bg)] border border-[var(--card-border)]"}`}>
          <div className={`flex items-center justify-between px-4 py-2.5 border-b ${isWhite ? "border-neutral-100 bg-neutral-50" : "border-[var(--glass-border)] bg-white/5"}`}>
            <span className={`text-xs font-medium ${headingText}`}>Nova Response</span>
            <div className="flex gap-2 items-center">
              <button onClick={handleCopy} className={`flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-medium border transition-colors ${isWhite ? "border-neutral-200 text-neutral-500 hover:bg-neutral-100" : "border-[var(--glass-border)] text-neutral-400 hover:bg-white/5"}`}>
                {copied ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
          </div>
          <div className="px-4 py-4">
            <div className={`text-sm leading-relaxed whitespace-pre-wrap ${bodyText}`}>{answer}</div>
          </div>
          <div className={`px-4 py-3 border-t flex flex-wrap justify-end gap-2 ${isWhite ? "border-neutral-100 bg-neutral-50" : "border-[var(--glass-border)] bg-white/5"}`}>
            <button 
              onClick={() => {
                setShowExpertChat(true);
                emitEscalation(user?.department || "CSE", user, question, Date.now());
                toast.success("Escalation request sent to Seniors!");
              }} 
              className={`py-2 px-4 rounded-lg text-xs font-medium flex items-center gap-2 transition-all border ${isWhite ? "border-neutral-200 text-neutral-600 hover:bg-neutral-100" : "border-white/10 text-neutral-400 hover:bg-white/5"}`}
            >
                <Users className="h-4 w-4" />
                Escalate to a Senior
            </button>
            <button onClick={handleGenerateAudio} disabled={audioLoading} className="py-2 px-4 rounded-lg btn-gradient text-white text-xs font-medium flex items-center gap-2 neon-glow transition-all">
                {audioLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Volume2 className="h-4 w-4" />}
                {audioLoading ? "Generating Audio..." : (audioUrl ? "Replay Audio" : "Listen to Response")}
            </button>
          </div>
        </div>
      )}

      {showExpertChat && (
        <ExpertChat 
          room={`esc-${user?.userId || "anon"}-${Date.now()}`}
          currentUser={user}
          topic={question.slice(0, 30)}
          onClose={() => setShowExpertChat(false)}
        />
      )}

      {/* Suggestions */}
      {!answer && !loading && (
        <div className={`rounded-lg p-4 ${isWhite ? "bg-neutral-50 border border-neutral-200" : "bg-[var(--card-bg)] border border-[var(--card-border)]"}`}>
          <p className={`text-xs font-medium mb-2.5 ${headingText}`}>Try asking:</p>
          <div className="space-y-1.5">
            {SUGGESTIONS.map((tip) => (
              <button key={tip} onClick={() => setQuestion(tip)} className={`block w-full text-left px-3 py-2 rounded-lg text-xs transition-colors ${isWhite ? "text-neutral-500 hover:bg-white hover:text-neutral-700" : "text-neutral-400 hover:bg-white/5 hover:text-white"}`}>
                {tip}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
