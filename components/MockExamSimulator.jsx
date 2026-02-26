"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  Timer, Play, Flag, ChevronLeft, ChevronRight, CheckCircle2,
  XCircle, AlertTriangle, Loader2, Trophy, RotateCcw, Clock,
} from "lucide-react";
import { Menu, MenuButton, MenuItem, MenuItems, Transition } from '@headlessui/react';
import { ChevronDownIcon } from '@heroicons/react/20/solid';
import { useTheme } from "@/context/ThemeContext";
import toast from "react-hot-toast";
import { Fragment } from "react";

const PHASES = { SETUP: "setup", EXAM: "exam", RESULTS: "results" };

function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

export default function MockExamSimulator({ resourceId, resourceTitle, customText }) {
  const { theme } = useTheme();
  const isWhite = theme === "white";

  const [phase, setPhase] = useState(PHASES.SETUP);
  const [exam, setExam] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [grading, setGrading] = useState(false);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState({});
  const [flagged, setFlagged] = useState({});
  const [timeLeft, setTimeLeft] = useState(30 * 60);
  const [results, setResults] = useState(null);
  const [confirmSubmit, setConfirmSubmit] = useState(false);
  const [difficulty, setDifficulty] = useState("mixed"); // "easy", "medium", "hard", "mixed"
  const [durationMinutes, setDurationMinutes] = useState(30);
  const timerRef = useRef(null);
  const startTimeRef = useRef(null);

  // Theme classes
  const headingText = isWhite ? "text-neutral-900" : "text-white";
  const bodyText = isWhite ? "text-neutral-600" : "text-neutral-300";
  const mutedText = isWhite ? "text-neutral-400" : "text-neutral-500";
  const cardBg = isWhite ? "bg-white border-neutral-200" : "bg-[var(--card-bg)] border-[var(--card-border)]";
  const borderColor = isWhite ? "border-neutral-200" : "border-[var(--card-border)]";
  const menuBg = isWhite ? "bg-white" : "bg-neutral-900/90 backdrop-blur-md";
  const menuItemHover = isWhite ? "bg-neutral-100 text-neutral-900" : "bg-white/10 text-white";
  const inputClass = `w-full px-3 py-2.5 rounded-lg text-sm focus:outline-none resize-none ${
    isWhite
      ? "bg-neutral-50 border border-neutral-200 text-neutral-900 placeholder-neutral-400 focus:border-neutral-400"
      : "bg-[var(--input-bg)] border border-[var(--glass-border)] text-white placeholder-neutral-500 focus:border-neutral-500"
  }`;

  // Generate exam
  const generateExam = async () => {
    setGenerating(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/mock-exam/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ resourceId, customText, customTitle: resourceTitle, difficulty, durationMinutes }),
      });
      const data = await res.json();
      if (res.ok && data.exam) {
        setExam(data.exam);
        setTimeLeft(data.exam.duration * 60 || durationMinutes * 60);
        setPhase(PHASES.EXAM);
        startTimeRef.current = Date.now();
        toast.success("Exam generated! Good luck!");
      } else {
        toast.error(data.error || "Failed to generate exam");
      }
    } catch {
      toast.error("Failed to generate exam");
    } finally {
      setGenerating(false);
    }
  };

  // Timer
  useEffect(() => {
    if (phase !== PHASES.EXAM) return;

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          submitExam();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [phase]);

  // Submit exam
  const submitExam = useCallback(async () => {
    if (grading) return;
    clearInterval(timerRef.current);
    setGrading(true);
    setConfirmSubmit(false);

    const timeTaken = startTimeRef.current ? Math.round((Date.now() - startTimeRef.current) / 1000) : 0;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/mock-exam/grade", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ questions: exam.questions, answers, timeTaken }),
      });
      const data = await res.json();
      if (res.ok) {
        setResults(data);
        setPhase(PHASES.RESULTS);
      } else {
        toast.error(data.error || "Failed to grade exam");
      }
    } catch {
      toast.error("Failed to grade exam");
    } finally {
      setGrading(false);
    }
  }, [exam, answers, grading]);

  const setAnswer = (qId, value) => {
    setAnswers(prev => ({ ...prev, [qId]: value }));
  };

  const toggleFlag = (qId) => {
    setFlagged(prev => ({ ...prev, [qId]: !prev[qId] }));
  };

  const retakeExam = () => {
    setPhase(PHASES.SETUP);
    setExam(null);
    setAnswers({});
    setFlagged({});
    setResults(null);
    setCurrentQ(0);
    setTimeLeft(durationMinutes * 60);
    setConfirmSubmit(false);
  };

  // ========================
  // PHASE: SETUP
  // ========================
  if (phase === PHASES.SETUP) {
    return (
      <div className="text-center py-8 space-y-5">
        <div className={`w-14 h-14 rounded-2xl mx-auto flex items-center justify-center ${
          isWhite ? "bg-neutral-100" : "bg-white/10"
        }`}>
          <Timer className={`h-7 w-7 ${isWhite ? "text-neutral-600" : "text-neutral-300"}`} />
        </div>
        <div>
          <h3 className={`text-lg font-bold ${headingText}`}>Mock Exam Simulator</h3>
          <p className={`text-sm mt-1 ${bodyText}`}>
            AI-generated timed exam for &quot;{resourceTitle}&quot;
          </p>
        </div>
        <div className={`rounded-lg p-4 mx-auto max-w-xs border ${cardBg}`}>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <p className={`text-xl font-bold ${headingText}`}>20</p>
              <p className={`text-[10px] ${mutedText}`}>Questions</p>
            </div>
            <div>
              <p className={`text-xl font-bold ${headingText}`}>{durationMinutes}</p>
              <p className={`text-[10px] ${mutedText}`}>Minutes</p>
            </div>
            <div>
              <p className={`text-xl font-bold ${headingText}`}>100</p>
              <p className={`text-[10px] ${mutedText}`}>Points</p>
            </div>
          </div>
        </div>

        {/* Configuration Options */}
        <div className="flex flex-col sm:flex-row gap-4 max-w-sm mx-auto text-left py-2">
          {/* Difficulty Dropdown */}
          <div className="flex-1">
            <label className={`block text-[10px] font-bold uppercase tracking-wider mb-1.5 ml-1 ${mutedText}`}>Difficulty</label>
            <Menu as="div" className="relative">
              <MenuButton className={`group flex items-center justify-between w-full px-3 py-2.5 rounded-xl text-xs font-medium border transition-all ${
                isWhite 
                  ? "bg-white border-neutral-200 text-neutral-900 hover:border-neutral-300 shadow-sm" 
                  : "bg-white/5 border-white/10 text-white hover:border-white/20"
              }`}>
                <span className="capitalize">{difficulty}</span>
                <ChevronDownIcon className={`h-4 w-4 transition-transform group-data-open:rotate-180 ${mutedText}`} />
              </MenuButton>

              <Transition
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
              >
                <MenuItems className={`absolute z-20 mt-2 w-full origin-top-left rounded-xl border p-1 shadow-xl focus:outline-none ${menuBg} ${borderColor}`}>
                  {["easy", "medium", "hard", "mixed"].map((lvl) => (
                    <MenuItem key={lvl}>
                      {({ active }) => (
                        <button
                          onClick={() => setDifficulty(lvl)}
                          className={`flex w-full items-center rounded-lg px-3 py-2 text-xs transition-colors ${
                            active ? menuItemHover : bodyText
                          }`}
                        >
                          <span className="capitalize">{lvl === "mixed" ? "Mixed (Default)" : lvl}</span>
                        </button>
                      )}
                    </MenuItem>
                  ))}
                </MenuItems>
              </Transition>
            </Menu>
          </div>

          {/* Time Limit Dropdown */}
          <div className="flex-1">
            <label className={`block text-[10px] font-bold uppercase tracking-wider mb-1.5 ml-1 ${mutedText}`}>Time Limit</label>
            <Menu as="div" className="relative">
              <MenuButton className={`group flex items-center justify-between w-full px-3 py-2.5 rounded-xl text-xs font-medium border transition-all ${
                isWhite 
                  ? "bg-white border-neutral-200 text-neutral-900 hover:border-neutral-300 shadow-sm" 
                  : "bg-white/5 border-white/10 text-white hover:border-white/20"
              }`}>
                <span>{durationMinutes} Minutes</span>
                <ChevronDownIcon className={`h-4 w-4 transition-transform group-data-open:rotate-180 ${mutedText}`} />
              </MenuButton>

              <Transition
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
              >
                <MenuItems className={`absolute z-20 mt-2 w-full origin-top-left rounded-xl border p-1 shadow-xl focus:outline-none ${menuBg} ${borderColor}`}>
                  {[15, 30, 45, 60].map((mins) => (
                    <MenuItem key={mins}>
                      {({ active }) => (
                        <button
                          onClick={() => setDurationMinutes(mins)}
                          className={`flex w-full items-center rounded-lg px-3 py-2 text-xs transition-colors ${
                            active ? menuItemHover : bodyText
                          }`}
                        >
                          {mins} Minutes
                        </button>
                      )}
                    </MenuItem>
                  ))}
                </MenuItems>
              </Transition>
            </Menu>
          </div>
        </div>

        <div className={`text-xs ${mutedText} max-w-xs mx-auto`}>
          Mix of MCQ, True/False, and Short Answer questions. Auto-submitted when time runs out.
        </div>
        <button
          onClick={generateExam}
          disabled={generating}
          className="px-6 py-3 rounded-lg btn-gradient text-white text-sm font-medium flex items-center gap-2 mx-auto disabled:opacity-50"
        >
          {generating ? (
            <><Loader2 className="h-4 w-4 animate-spin" /> Generating Exam...</>
          ) : (
            <><Play className="h-4 w-4" /> Start Exam</>
          )}
        </button>
      </div>
    );
  }

  // ========================
  // PHASE: EXAM
  // ========================
  if (phase === PHASES.EXAM) {
    const q = exam.questions[currentQ];
    const answeredCount = Object.keys(answers).length;
    const totalQ = exam.questions.length;
    const isTimeLow = timeLeft < 300;

    return (
      <div className="space-y-4">
        {/* Timer bar */}
        <div className={`flex items-center justify-between py-2 px-3 rounded-lg border ${borderColor} ${
          isTimeLow ? (isWhite ? "bg-red-50" : "bg-red-500/10") : (isWhite ? "bg-neutral-50" : "bg-white/5")
        }`}>
          <div className="flex items-center gap-2">
            <Clock className={`h-4 w-4 ${isTimeLow ? "text-red-500 animate-pulse" : mutedText}`} />
            <span className={`text-sm font-mono font-bold ${isTimeLow ? "text-red-500" : headingText}`}>
              {formatTime(timeLeft)}
            </span>
          </div>
          <span className={`text-xs ${mutedText}`}>{answeredCount}/{totalQ} answered</span>
        </div>

        {/* Question navigation */}
        <div className="flex flex-wrap gap-1.5">
          {exam.questions.map((qq, i) => {
            const isAnswered = answers[qq.id] !== undefined && answers[qq.id] !== "";
            const isFlagged = flagged[qq.id];
            const isCurrent = i === currentQ;
            let btnClass = isWhite
              ? "bg-neutral-100 text-neutral-500 border-neutral-200"
              : "bg-white/5 text-neutral-500 border-[var(--glass-border)]";

            if (isCurrent) {
              btnClass = isWhite
                ? "bg-neutral-900 text-white border-neutral-900"
                : "bg-white text-neutral-900 border-white";
            } else if (isAnswered) {
              btnClass = isWhite
                ? "bg-green-50 text-green-600 border-green-200"
                : "bg-green-500/15 text-green-400 border-green-500/20";
            }

            return (
              <button
                key={qq.id}
                onClick={() => setCurrentQ(i)}
                className={`w-8 h-8 rounded-lg text-xs font-medium border transition-all flex items-center justify-center relative ${btnClass}`}
              >
                {i + 1}
                {isFlagged && <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-orange-400" />}
              </button>
            );
          })}
        </div>

        {/* Question */}
        {q && (
          <div className={`rounded-lg p-5 border ${cardBg}`}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className={`text-xs font-medium px-2 py-0.5 rounded ${
                  q.type === "mcq"
                    ? isWhite ? "bg-blue-50 text-blue-600" : "bg-blue-500/15 text-blue-400"
                    : q.type === "trueFalse"
                    ? isWhite ? "bg-purple-50 text-purple-600" : "bg-purple-500/15 text-purple-400"
                    : isWhite ? "bg-orange-50 text-orange-600" : "bg-orange-500/15 text-orange-400"
                }`}>
                  {q.type === "mcq" ? "MCQ" : q.type === "trueFalse" ? "True / False" : "Short Answer"}
                </span>
                <span className={`text-[10px] ${mutedText}`}>{q.points} pts • {q.difficulty}</span>
              </div>
              <button
                onClick={() => toggleFlag(q.id)}
                className={`p-1.5 rounded-lg transition-colors ${
                  flagged[q.id]
                    ? "text-orange-400 bg-orange-500/10"
                    : isWhite ? "text-neutral-400 hover:bg-neutral-100" : "text-neutral-500 hover:bg-white/5"
                }`}
              >
                <Flag className="h-3.5 w-3.5" />
              </button>
            </div>

            <p className={`text-sm font-medium mb-4 ${headingText}`}>
              {currentQ + 1}. {q.question}
            </p>

            {/* MCQ options */}
            {q.type === "mcq" && q.options && (
              <div className="space-y-2">
                {q.options.map((opt, i) => (
                  <button
                    key={i}
                    onClick={() => setAnswer(q.id, opt)}
                    className={`w-full text-left px-3 py-2.5 rounded-lg text-sm border transition-colors ${
                      answers[q.id] === opt
                        ? isWhite ? "bg-blue-50 border-blue-300 text-blue-700" : "bg-blue-500/15 border-blue-500/30 text-blue-300"
                        : isWhite ? "bg-white border-neutral-200 text-neutral-700 hover:border-neutral-300" : "bg-white/5 border-[var(--glass-border)] text-neutral-300 hover:border-neutral-500"
                    }`}
                  >
                    <span className="font-medium mr-2">{String.fromCharCode(65 + i)}.</span>{opt}
                  </button>
                ))}
              </div>
            )}

            {/* True/False */}
            {q.type === "trueFalse" && (
              <div className="flex gap-2">
                {["True", "False"].map(val => (
                  <button
                    key={val}
                    onClick={() => setAnswer(q.id, val)}
                    className={`flex-1 py-3 rounded-lg text-sm font-medium border transition-colors ${
                      answers[q.id] === val
                        ? isWhite ? "bg-blue-50 border-blue-300 text-blue-700" : "bg-blue-500/15 border-blue-500/30 text-blue-300"
                        : isWhite ? "bg-white border-neutral-200 text-neutral-700 hover:border-neutral-300" : "bg-white/5 border-[var(--glass-border)] text-neutral-300 hover:border-neutral-500"
                    }`}
                  >
                    {val}
                  </button>
                ))}
              </div>
            )}

            {/* Short answer */}
            {q.type === "shortAnswer" && (
              <textarea
                rows={3}
                value={answers[q.id] || ""}
                onChange={e => setAnswer(q.id, e.target.value)}
                placeholder="Type your answer..."
                className={inputClass}
              />
            )}
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => setCurrentQ(prev => Math.max(0, prev - 1))}
            disabled={currentQ === 0}
            className={`px-3 py-2 rounded-lg text-sm flex items-center gap-1 disabled:opacity-30 transition-colors ${
              isWhite ? "text-neutral-600 hover:bg-neutral-100" : "text-neutral-400 hover:bg-white/5"
            }`}
          >
            <ChevronLeft className="h-4 w-4" /> Previous
          </button>

          {currentQ < totalQ - 1 ? (
            <button
              onClick={() => setCurrentQ(prev => Math.min(totalQ - 1, prev + 1))}
              className={`px-3 py-2 rounded-lg text-sm flex items-center gap-1 transition-colors ${
                isWhite ? "text-neutral-600 hover:bg-neutral-100" : "text-neutral-400 hover:bg-white/5"
              }`}
            >
              Next <ChevronRight className="h-4 w-4" />
            </button>
          ) : (
            <div className="relative">
              {confirmSubmit ? (
                <div className={`flex items-center gap-2 p-2 rounded-lg border ${borderColor} ${isWhite ? "bg-neutral-50" : "bg-white/5"}`}>
                  <span className={`text-xs ${bodyText}`}>Submit?</span>
                  <button onClick={submitExam} disabled={grading} className="px-3 py-1.5 rounded-lg bg-green-500 text-white text-xs font-medium disabled:opacity-50">
                    {grading ? <Loader2 className="h-3 w-3 animate-spin" /> : "Yes"}
                  </button>
                  <button onClick={() => setConfirmSubmit(false)} className="px-3 py-1.5 rounded-lg bg-red-500 text-white text-xs font-medium">
                    No
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    const unanswered = totalQ - answeredCount;
                    if (unanswered > 0) {
                      setConfirmSubmit(true);
                    } else {
                      setConfirmSubmit(true);
                    }
                  }}
                  className="px-4 py-2 rounded-lg btn-gradient text-white text-sm font-medium flex items-center gap-1.5"
                >
                  <CheckCircle2 className="h-4 w-4" /> Submit Exam
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ========================
  // PHASE: RESULTS
  // ========================
  if (phase === PHASES.RESULTS && results) {
    const gradeColors = {
      "A+": "text-green-400", A: "text-green-400", B: "text-blue-400",
      C: "text-yellow-400", D: "text-orange-400", F: "text-red-400",
    };

    return (
      <div className="space-y-5">
        {/* Score header */}
        <div className="text-center py-6 space-y-3">
          <Trophy className={`h-10 w-10 mx-auto ${results.percentage >= 70 ? "text-yellow-400" : mutedText}`} />
          <div>
            <p className={`text-4xl font-bold ${gradeColors[results.grade] || headingText}`}>
              {results.grade}
            </p>
            <p className={`text-sm mt-1 ${bodyText}`}>
              {results.score} / {results.total} points ({results.percentage}%)
            </p>
          </div>
          {results.timeTaken && (
            <p className={`text-xs ${mutedText}`}>
              Completed in {formatTime(results.timeTaken)}
            </p>
          )}
        </div>

        {/* AI Score Image */}
        {results.scoreImage && (
          <div className="flex justify-center">
            <img
              src={results.scoreImage}
              alt="Score celebration"
              className="rounded-xl max-w-full max-h-48 object-contain"
            />
          </div>
        )}

        {/* Score bar */}
        <div className={`rounded-lg p-4 border ${cardBg}`}>
          <div className="flex items-center justify-between mb-2">
            <span className={`text-xs font-medium ${headingText}`}>Score</span>
            <span className={`text-xs ${mutedText}`}>{results.percentage}%</span>
          </div>
          <div className={`w-full rounded-full h-3 ${isWhite ? "bg-neutral-100" : "bg-white/10"}`}>
            <div
              className={`h-3 rounded-full transition-all ${
                results.percentage >= 70 ? "bg-green-500" : results.percentage >= 50 ? "bg-yellow-500" : "bg-red-500"
              }`}
              style={{ width: `${results.percentage}%` }}
            />
          </div>
        </div>

        {/* Breakdown */}
        <div>
          <h4 className={`text-sm font-semibold mb-3 ${headingText}`}>Question Breakdown</h4>
          <div className="space-y-2">
            {results.breakdown?.map((b, i) => (
              <div key={b.id} className={`rounded-lg p-3 border ${cardBg}`}>
                <div className="flex items-start gap-2">
                  {b.isCorrect ? (
                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  ) : b.earned > 0 ? (
                    <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs ${headingText}`}>
                      {i + 1}. {b.question}
                    </p>
                    <div className="mt-1 space-y-0.5">
                      <p className={`text-[11px] ${mutedText}`}>
                        Your answer: <span className={bodyText}>{b.userAnswer || "(skipped)"}</span>
                      </p>
                      {!b.isCorrect && (
                        <p className={`text-[11px] text-green-500`}>
                          Correct: {b.correctAnswer}
                        </p>
                      )}
                    </div>
                  </div>
                  <span className={`text-xs font-medium flex-shrink-0 ${b.isCorrect ? "text-green-500" : b.earned > 0 ? "text-yellow-500" : "text-red-500"}`}>
                    {b.earned}/{b.points}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Retake */}
        <div className="flex justify-center">
          <button onClick={retakeExam} className="px-5 py-2.5 rounded-lg btn-gradient text-white text-sm font-medium flex items-center gap-2">
            <RotateCcw className="h-4 w-4" /> Retake Exam
          </button>
        </div>
      </div>
    );
  }

  return null;
}
