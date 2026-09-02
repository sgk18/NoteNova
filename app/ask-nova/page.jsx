"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Send, Copy, Check, Loader2, Volume2, Users, Play, Pause, Square } from "lucide-react";
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

function formatTime(secs) {
  if (isNaN(secs) || secs < 0) return "00:00";
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

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
        elements.push(<h4 key={i} className={`text-sm font-bold mt-4 mb-2 ${isWhite ? "text-neutral-800" : "text-neutral-200"}`}>{renderInline(line.slice(4))}</h4>);
      } else if (line.startsWith("## ")) {
        elements.push(<h3 key={i} className={`text-base font-bold mt-5 mb-2 ${isWhite ? "text-neutral-900" : "text-white"}`}>{renderInline(line.slice(3))}</h3>);
      } else if (line.startsWith("# ")) {
        elements.push(<h2 key={i} className={`text-lg font-bold mt-5 mb-3 ${isWhite ? "text-neutral-900" : "text-white"}`}>{renderInline(line.slice(2))}</h2>);
      } else if (line.match(/^[-*]\s/)) {
        elements.push(
          <div key={i} className="flex items-start gap-2 ml-2 my-1">
            <span className={`w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0 ${isWhite ? "bg-neutral-400" : "bg-neutral-500"}`} />
            <span className={`text-sm leading-relaxed ${isWhite ? "text-neutral-600" : "text-neutral-300"}`}>{renderInline(line.replace(/^[-*]\s/, ""))}</span>
          </div>
        );
      } else if (line.match(/^\d+[.)]\s/)) {
        elements.push(
          <div key={i} className="flex items-start gap-2 ml-1 my-1">
            <span className={`text-sm font-semibold flex-shrink-0 ${isWhite ? "text-neutral-700" : "text-neutral-300"}`}>{line.match(/^\d+[.)]/)[0]}</span>
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
        return <strong key={idx} className={isWhite ? "text-neutral-900 font-bold" : "text-white font-bold"}>{part.slice(2, -2)}</strong>;
      }
      const codeParts = part.split(/(`[^`]+`)/g);
      return codeParts.map((cp, ci) => {
        if (cp.startsWith("`") && cp.endsWith("`")) {
          return <code key={`${idx}-${ci}`} className={`px-1.5 py-0.5 rounded text-xs font-mono ${isWhite ? "bg-neutral-100 text-neutral-800" : "bg-white/10 text-neutral-200"}`}>{cp.slice(1, -1)}</code>;
        }
        return <span key={`${idx}-${ci}`}>{cp}</span>;
      });
    });
  };

  return <div className="space-y-0.5">{renderContent()}</div>;
}

export default function AskNovaPage() {
  const { theme } = useTheme();
  const isWhite = theme === "white";
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [audioLoading, setAudioLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const [audioCurrentTime, setAudioCurrentTime] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const [user, setUser] = useState(null);
  const [showExpertChat, setShowExpertChat] = useState(false);

  const { emitEscalation } = useSocket();
  const answerRef = useRef(null);
  const audioRef = useRef(null);
  const speechIntervalRef = useRef(null);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) {
      try { setUser(JSON.parse(stored)); } catch {}
    }
  }, []);

  useEffect(() => {
    if (answer) answerRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [answer]);

  // Clean up audio on unmount or new question
  const handleStopAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    if (speechIntervalRef.current) {
      clearInterval(speechIntervalRef.current);
      speechIntervalRef.current = null;
    }
    setIsPlaying(false);
    setAudioProgress(0);
    setAudioCurrentTime(0);
  }, []);

  useEffect(() => {
    return () => {
      handleStopAudio();
    };
  }, [handleStopAudio]);

  const handleAsk = async () => {
    const trimmed = question.trim();
    if (!trimmed) return toast.error("Please enter a question");
    if (trimmed.length > MAX_CHARS) return toast.error(`Max ${MAX_CHARS} characters`);

    handleStopAudio();
    setLoading(true); setAnswer(""); setError(""); setAudioUrl("");

    try {
      const res = await fetch("/api/ask-nova", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: trimmed })
      });
      const data = await res.json();
      if (res.ok) setAnswer(data.answer);
      else setError(data.error || "Something went wrong");
    } catch { setError("Failed to connect to AI"); }
    finally { setLoading(false); }
  };

  const startSpeechSynthesis = (textToRead) => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(textToRead);
    const estDuration = Math.max(5, Math.ceil(textToRead.length / 15));
    setAudioDuration(estDuration);

    utterance.onstart = () => {
      setIsPlaying(true);
      setAudioProgress(0);
      setAudioCurrentTime(0);

      let elapsed = 0;
      if (speechIntervalRef.current) clearInterval(speechIntervalRef.current);

      speechIntervalRef.current = setInterval(() => {
        elapsed += 0.2;
        setAudioCurrentTime(elapsed);
        const pct = (elapsed / estDuration) * 100;
        setAudioProgress(Math.min(100, pct));
        if (elapsed >= estDuration) {
          clearInterval(speechIntervalRef.current);
        }
      }, 200);
    };

    utterance.onend = () => {
      if (speechIntervalRef.current) clearInterval(speechIntervalRef.current);
      setIsPlaying(false);
      setAudioProgress(100);
      setAudioCurrentTime(estDuration);
    };

    utterance.onerror = (e) => {
      if (e.error !== "canceled") {
        toast.error("Audio playback error");
      }
      handleStopAudio();
    };

    window.speechSynthesis.speak(utterance);
    toast.success("Playing audio response");
  };

  const handleGenerateAudio = async () => {
    if (!answer) return;

    // If audio element exists, toggle play/pause
    if (audioRef.current && audioUrl) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play().catch(() => {});
        setIsPlaying(true);
      }
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
        audioRef.current = audio;

        audio.onloadedmetadata = () => {
          setAudioDuration(audio.duration || 0);
        };
        audio.ontimeupdate = () => {
          setAudioCurrentTime(audio.currentTime);
          if (audio.duration) {
            setAudioProgress((audio.currentTime / audio.duration) * 100);
          }
        };
        audio.onended = () => {
          setIsPlaying(false);
          setAudioProgress(100);
        };

        audio.play().catch(() => {});
        setIsPlaying(true);
      } else {
        startSpeechSynthesis(answer.slice(0, 350));
      }
    } catch {
      startSpeechSynthesis(answer.slice(0, 350));
    } finally {
      setAudioLoading(false);
    }
  };

  const handleCopy = () => { navigator.clipboard.writeText(answer); setCopied(true); toast.success("Copied"); setTimeout(() => setCopied(false), 2000); };
  const handleKeyDown = (e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleAsk(); } };

  const headingText = isWhite ? "text-neutral-900" : "text-white";
  const mutedText = isWhite ? "text-neutral-400" : "text-neutral-500";
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
            <MarkdownRenderer content={answer} />
          </div>

          {/* Audio Player Bar */}
          {(audioLoading || isPlaying || audioProgress > 0 || audioUrl) && (
            <div className={`mx-4 mb-4 p-3.5 rounded-xl border flex flex-col gap-2.5 transition-all ${
              isWhite ? "bg-cyan-50/80 border-cyan-200" : "bg-cyan-950/30 border-cyan-500/20"
            }`}>
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
                    <Volume2 className={`h-4 w-4 ${isPlaying ? "animate-pulse text-cyan-400" : "text-cyan-500"}`} />
                  </div>
                  <div>
                    <p className={`text-xs font-semibold ${headingText}`}>
                      {audioLoading ? "Preparing Audio..." : isPlaying ? "Playing Audio Response" : "Audio Paused"}
                    </p>
                    <p className={`text-[10px] ${mutedText}`}>
                      {formatTime(audioCurrentTime)} / {formatTime(audioDuration || 30)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* Play/Pause Button */}
                  {!audioLoading && (
                    <button
                      onClick={handleGenerateAudio}
                      className="p-2 rounded-lg bg-cyan-500 hover:bg-cyan-600 text-white transition-all shadow-md shadow-cyan-500/20 active:scale-95 flex items-center gap-1 text-xs font-medium"
                      title={isPlaying ? "Pause" : "Play"}
                    >
                      {isPlaying ? <Pause className="h-3.5 w-3.5 fill-current" /> : <Play className="h-3.5 w-3.5 fill-current ml-0.5" />}
                    </button>
                  )}

                  {/* Stop Listening Button */}
                  {(isPlaying || audioProgress > 0) && (
                    <button
                      onClick={handleStopAudio}
                      className={`p-2 rounded-lg transition-all border flex items-center gap-1.5 text-xs font-medium ${
                        isWhite
                          ? "bg-red-50 border-red-200 text-red-600 hover:bg-red-100"
                          : "bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20"
                      }`}
                      title="Stop Listening"
                    >
                      <Square className="h-3.5 w-3.5 fill-current" />
                      Stop
                    </button>
                  )}
                </div>
              </div>

              {/* Interactive Progress / Load Bar */}
              <div
                className="w-full bg-cyan-950/20 rounded-full h-1.5 overflow-hidden relative cursor-pointer"
                onClick={(e) => {
                  if (audioRef.current && audioDuration > 0) {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const clickX = e.clientX - rect.left;
                    const newTime = (clickX / rect.width) * audioDuration;
                    audioRef.current.currentTime = newTime;
                    setAudioCurrentTime(newTime);
                    setAudioProgress((clickX / rect.width) * 100);
                  }
                }}
              >
                <div
                  className="bg-gradient-to-r from-cyan-400 to-purple-500 h-full rounded-full transition-all duration-150"
                  style={{ width: `${Math.min(100, Math.max(0, audioProgress))}%` }}
                />
              </div>
            </div>
          )}

          {/* Action Footer */}
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
            <button
              onClick={handleGenerateAudio}
              disabled={audioLoading}
              className="py-2 px-4 rounded-lg btn-gradient text-white text-xs font-medium flex items-center gap-2 neon-glow transition-all"
            >
              {audioLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : isPlaying ? (
                <Pause className="h-4 w-4 fill-current" />
              ) : (
                <Volume2 className="h-4 w-4" />
              )}
              {audioLoading
                ? "Generating Audio..."
                : isPlaying
                ? "Pause Audio"
                : audioProgress > 0
                ? "Resume Audio"
                : "Listen to Response"}
            </button>
          </div>
        </div>
      )}

      {showExpertChat && (
        <ExpertChat
          room={`esc-${user?.id || "anon"}-${Date.now()}`}
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
