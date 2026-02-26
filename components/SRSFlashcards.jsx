"use client";

import { useState, useEffect, useCallback } from "react";
import { RotateCcw, Check, Zap, ArrowRight, Trophy, Loader2 } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import toast from "react-hot-toast";

const BUCKET_LABELS = { new: "New", learning: "Learning", review: "Review", mastered: "Mastered" };
const BUCKET_COLORS = {
  new: "bg-blue-500/15 text-blue-400",
  learning: "bg-orange-500/15 text-orange-400",
  review: "bg-yellow-500/15 text-yellow-400",
  mastered: "bg-green-500/15 text-green-400",
};
const BUCKET_COLORS_WHITE = {
  new: "bg-blue-50 text-blue-600",
  learning: "bg-orange-50 text-orange-600",
  review: "bg-yellow-50 text-yellow-600",
  mastered: "bg-green-50 text-green-600",
};

export default function SRSFlashcards({ resourceId }) {
  const { theme } = useTheme();
  const isWhite = theme === "white";

  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [sessionDone, setSessionDone] = useState(false);
  const [sessionStats, setSessionStats] = useState({ reviewed: 0, correct: 0, wrong: 0 });

  const fetchProgress = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/srs/progress?resourceId=${resourceId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setProgress(data.progress);
      } else {
        toast.error(data.error || "Failed to load flashcards");
      }
    } catch {
      toast.error("Failed to load flashcards");
    } finally {
      setLoading(false);
    }
  }, [resourceId]);

  useEffect(() => { fetchProgress(); }, [fetchProgress]);

  // Sort cards: learning first, then new, then review. Skip mastered.
  const getStudyQueue = useCallback(() => {
    if (!progress?.cards) return [];
    const now = new Date();
    return progress.cards
      .filter(c => c.bucket !== "mastered" || new Date(c.nextReview) <= now)
      .sort((a, b) => {
        const order = { learning: 0, new: 1, review: 2, mastered: 3 };
        if (order[a.bucket] !== order[b.bucket]) return order[a.bucket] - order[b.bucket];
        return new Date(a.nextReview) - new Date(b.nextReview);
      });
  }, [progress]);

  const studyQueue = getStudyQueue();
  const currentCard = studyQueue[currentIndex];
  const masteredCount = progress?.cards?.filter(c => c.bucket === "mastered").length || 0;
  const totalCards = progress?.cards?.length || 0;

  const handleAnswer = async (result) => {
    if (!currentCard || updating) return;
    setUpdating(true);

    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/srs/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ resourceId, cardIndex: currentCard.cardIndex, result }),
      });
      const data = await res.json();
      if (res.ok) {
        setProgress(data.progress);
        setSessionStats(prev => ({
          reviewed: prev.reviewed + 1,
          correct: prev.correct + (result !== "wrong" ? 1 : 0),
          wrong: prev.wrong + (result === "wrong" ? 1 : 0),
        }));
        setFlipped(false);

        // Move to next card or end session
        const newQueue = data.progress.cards
          .filter(c => c.bucket !== "mastered" || new Date(c.nextReview) <= new Date())
          .sort((a, b) => {
            const order = { learning: 0, new: 1, review: 2, mastered: 3 };
            if (order[a.bucket] !== order[b.bucket]) return order[a.bucket] - order[b.bucket];
            return new Date(a.nextReview) - new Date(b.nextReview);
          });

        if (newQueue.length === 0 || (currentIndex >= newQueue.length - 1 && sessionStats.reviewed >= 5)) {
          setSessionDone(true);
        } else {
          setCurrentIndex(prev => prev >= newQueue.length - 1 ? 0 : prev);
        }
      } else {
        toast.error(data.error || "Failed to update");
      }
    } catch {
      toast.error("Failed to update card");
    } finally {
      setUpdating(false);
    }
  };

  const restartSession = () => {
    setSessionDone(false);
    setCurrentIndex(0);
    setSessionStats({ reviewed: 0, correct: 0, wrong: 0 });
    setFlipped(false);
    fetchProgress();
  };

  const headingText = isWhite ? "text-neutral-900" : "text-white";
  const bodyText = isWhite ? "text-neutral-600" : "text-neutral-300";
  const mutedText = isWhite ? "text-neutral-400" : "text-neutral-500";
  const cardBg = isWhite ? "bg-white border-neutral-200" : "bg-[var(--card-bg)] border-[var(--card-border)]";
  const bucketColors = isWhite ? BUCKET_COLORS_WHITE : BUCKET_COLORS;

  if (loading) {
    return (
      <div className="flex flex-col items-center gap-3 py-10">
        <Loader2 className={`h-6 w-6 animate-spin ${mutedText}`} />
        <p className={`text-sm ${mutedText}`}>Loading flashcards...</p>
      </div>
    );
  }

  if (!progress || totalCards === 0) {
    return (
      <div className="text-center py-10">
        <p className={`text-sm ${mutedText}`}>No flashcards available. Generate Smart Notes first.</p>
      </div>
    );
  }

  // Session complete screen
  if (sessionDone || studyQueue.length === 0) {
    const pct = sessionStats.reviewed > 0 ? Math.round((sessionStats.correct / sessionStats.reviewed) * 100) : 100;
    return (
      <div className="text-center py-8 space-y-4">
        <Trophy className={`h-10 w-10 mx-auto ${pct >= 70 ? "text-yellow-400" : isWhite ? "text-neutral-400" : "text-neutral-500"}`} />
        <h3 className={`text-lg font-bold ${headingText}`}>
          {studyQueue.length === 0 ? "All Cards Mastered!" : "Session Complete!"}
        </h3>
        <div className="flex justify-center gap-6">
          <div className="text-center">
            <p className={`text-2xl font-bold ${headingText}`}>{sessionStats.reviewed}</p>
            <p className={`text-xs ${mutedText}`}>Reviewed</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-500">{sessionStats.correct}</p>
            <p className={`text-xs ${mutedText}`}>Correct</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-red-500">{sessionStats.wrong}</p>
            <p className={`text-xs ${mutedText}`}>Wrong</p>
          </div>
        </div>
        <p className={`text-sm ${bodyText}`}>{masteredCount}/{totalCards} cards mastered</p>
        <div className={`w-full rounded-full h-2 ${isWhite ? "bg-neutral-100" : "bg-white/10"}`}>
          <div className="h-2 rounded-full bg-green-500 transition-all" style={{ width: `${(masteredCount / totalCards) * 100}%` }} />
        </div>
        <button onClick={restartSession} className="px-5 py-2.5 rounded-lg btn-gradient text-white text-sm font-medium flex items-center gap-2 mx-auto">
          <RotateCcw className="h-4 w-4" /> Study Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Progress bar */}
      <div className="flex items-center justify-between mb-2">
        <p className={`text-xs ${mutedText}`}>
          Card {currentIndex + 1} of {studyQueue.length} · {masteredCount}/{totalCards} mastered
        </p>
        <div className="flex gap-1">
          {Object.entries(BUCKET_LABELS).map(([key, label]) => {
            const count = progress.cards.filter(c => c.bucket === key).length;
            if (count === 0) return null;
            return (
              <span key={key} className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${bucketColors[key]}`}>
                {count} {label}
              </span>
            );
          })}
        </div>
      </div>

      <div className={`w-full rounded-full h-1.5 ${isWhite ? "bg-neutral-100" : "bg-white/10"}`}>
        <div className="h-1.5 rounded-full bg-green-500 transition-all" style={{ width: `${(masteredCount / totalCards) * 100}%` }} />
      </div>

      {/* Flashcard */}
      <div
        onClick={() => !flipped && setFlipped(true)}
        className={`rounded-xl p-6 min-h-[180px] flex flex-col justify-center border cursor-pointer transition-all ${
          flipped
            ? isWhite ? "bg-neutral-50 border-neutral-300" : "bg-white/10 border-neutral-600"
            : `${cardBg} hover:shadow-lg`
        }`}
      >
        <div className="flex items-center justify-between mb-3">
          <span className={`text-[10px] font-medium ${bucketColors[currentCard.bucket]} px-2 py-0.5 rounded`}>
            {BUCKET_LABELS[currentCard.bucket]}
          </span>
          <span className={`text-[10px] ${mutedText}`}>{flipped ? "Answer" : "Click to reveal answer"}</span>
        </div>
        <p className={`text-base leading-relaxed ${flipped ? bodyText : headingText}`}>
          {flipped ? currentCard.answer : currentCard.question}
        </p>
      </div>

      {/* Answer buttons — shown after flip */}
      {flipped && (
        <div className="flex gap-2">
          <button
            onClick={() => handleAnswer("wrong")}
            disabled={updating}
            className={`flex-1 py-3 rounded-lg text-sm font-medium flex items-center justify-center gap-1.5 transition-colors border disabled:opacity-50 ${
              isWhite ? "bg-red-50 border-red-200 text-red-600 hover:bg-red-100" : "bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20"
            }`}
          >
            <RotateCcw className="h-3.5 w-3.5" /> Again
          </button>
          <button
            onClick={() => handleAnswer("correct")}
            disabled={updating}
            className={`flex-1 py-3 rounded-lg text-sm font-medium flex items-center justify-center gap-1.5 transition-colors border disabled:opacity-50 ${
              isWhite ? "bg-blue-50 border-blue-200 text-blue-600 hover:bg-blue-100" : "bg-blue-500/10 border-blue-500/20 text-blue-400 hover:bg-blue-500/20"
            }`}
          >
            <Check className="h-3.5 w-3.5" /> Good
          </button>
          <button
            onClick={() => handleAnswer("easy")}
            disabled={updating}
            className={`flex-1 py-3 rounded-lg text-sm font-medium flex items-center justify-center gap-1.5 transition-colors border disabled:opacity-50 ${
              isWhite ? "bg-green-50 border-green-200 text-green-600 hover:bg-green-100" : "bg-green-500/10 border-green-500/20 text-green-400 hover:bg-green-500/20"
            }`}
          >
            <Zap className="h-3.5 w-3.5" /> Easy
          </button>
        </div>
      )}
    </div>
  );
}
