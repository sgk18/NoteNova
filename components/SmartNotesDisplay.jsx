"use client";

import { useState } from "react";
import { BookOpen, Brain, Layers, HelpCircle, GraduationCap, GitBranch, ChevronRight } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";

function FlashCard({ q, a }) {
  const [flipped, setFlipped] = useState(false);
  const { theme } = useTheme();
  const isGalaxy = theme === "galaxy";

  return (
    <div
      onClick={() => setFlipped(!flipped)}
      className={`cursor-pointer rounded-xl p-5 min-h-[120px] flex flex-col justify-center transition-all duration-300 border ${
        flipped
          ? isGalaxy
            ? "bg-purple-500/10 border-purple-500/30"
            : "bg-blue-500/10 border-blue-500/30"
          : isGalaxy
            ? "bg-white/5 border-white/10 hover:border-purple-500/30"
            : "bg-slate-800/50 border-slate-700 hover:border-blue-500/30"
      }`}
    >
      <p className="text-xs text-gray-500 mb-2">{flipped ? "Answer" : "Question"} • Click to flip</p>
      <p className={`text-sm leading-relaxed ${flipped ? (isGalaxy ? "text-purple-200" : "text-blue-200") : "text-white"}`}>
        {flipped ? a : q}
      </p>
    </div>
  );
}

function MCQCard({ q, options, answer }) {
  const [selected, setSelected] = useState(null);
  const { theme } = useTheme();
  const isGalaxy = theme === "galaxy";
  const answered = selected !== null;

  return (
    <div className={`rounded-xl p-5 border transition-all duration-300 ${
      isGalaxy ? "bg-white/5 border-white/10" : "bg-slate-800/50 border-slate-700"
    }`}>
      <p className="text-sm text-white font-medium mb-3">{q}</p>
      <div className="space-y-2">
        {options.map((opt, i) => {
          const isCorrect = opt === answer;
          const isSelected = selected === i;
          let optClass = isGalaxy
            ? "bg-white/5 border-white/10 text-gray-300 hover:border-cyan-500/30"
            : "bg-slate-700/50 border-slate-600 text-gray-300 hover:border-blue-500/30";

          if (answered) {
            if (isCorrect) {
              optClass = "bg-green-500/15 border-green-500/40 text-green-300";
            } else if (isSelected && !isCorrect) {
              optClass = "bg-red-500/15 border-red-500/40 text-red-300";
            }
          }

          return (
            <button
              key={i}
              onClick={() => !answered && setSelected(i)}
              disabled={answered}
              className={`w-full text-left px-4 py-2.5 rounded-lg text-sm border transition-all duration-200 ${optClass} ${answered ? "cursor-default" : "cursor-pointer"}`}
            >
              <span className="font-medium mr-2">{String.fromCharCode(65 + i)}.</span>
              {opt}
            </button>
          );
        })}
      </div>
      {answered && (
        <p className={`text-xs mt-3 ${selected !== null && options[selected] === answer ? "text-green-400" : "text-red-400"}`}>
          {options[selected] === answer ? "✓ Correct!" : `✗ Correct answer: ${answer}`}
        </p>
      )}
    </div>
  );
}

export default function SmartNotesDisplay({ notes }) {
  const { theme } = useTheme();
  const isGalaxy = theme === "galaxy";

  if (!notes) return null;

  const sectionHeader = (icon, title) => (
    <div className="flex items-center gap-2 mb-4">
      {icon}
      <h3 className="text-lg font-bold text-white">{title}</h3>
    </div>
  );

  const sectionCard = `glass-strong rounded-2xl p-6 neon-border mb-6 transition-all duration-300`;

  return (
    <div className="space-y-2 animate-fade-in">
      {/* Summary */}
      {notes.summary && (
        <div className={sectionCard}>
          {sectionHeader(<BookOpen className={`h-5 w-5 ${isGalaxy ? "text-cyan-400" : "text-blue-400"}`} />, "📌 Summary")}
          <p className="text-sm text-gray-300 leading-relaxed">{notes.summary}</p>
        </div>
      )}

      {/* Key Concepts */}
      {notes.keyConcepts?.length > 0 && (
        <div className={sectionCard}>
          {sectionHeader(<Brain className={`h-5 w-5 ${isGalaxy ? "text-purple-400" : "text-blue-400"}`} />, "🧠 Key Concepts")}
          <ul className="space-y-2">
            {notes.keyConcepts.map((c, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                <ChevronRight className={`h-4 w-4 mt-0.5 flex-shrink-0 ${isGalaxy ? "text-cyan-400" : "text-blue-400"}`} />
                <span>{c}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Flashcards */}
      {notes.flashcards?.length > 0 && (
        <div className={sectionCard}>
          {sectionHeader(<Layers className={`h-5 w-5 ${isGalaxy ? "text-yellow-400" : "text-blue-400"}`} />, "🎴 Flashcards")}
          <p className="text-xs text-gray-500 mb-4">Click a card to reveal the answer</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {notes.flashcards.map((f, i) => (
              <FlashCard key={i} q={f.question} a={f.answer} />
            ))}
          </div>
        </div>
      )}

      {/* MCQs */}
      {notes.mcqs?.length > 0 && (
        <div className={sectionCard}>
          {sectionHeader(<HelpCircle className={`h-5 w-5 ${isGalaxy ? "text-green-400" : "text-blue-400"}`} />, "❓ Multiple Choice Questions")}
          <p className="text-xs text-gray-500 mb-4">Select an answer to check</p>
          <div className="space-y-4">
            {notes.mcqs.map((m, i) => (
              <MCQCard key={i} q={`${i + 1}. ${m.question}`} options={m.options} answer={m.answer} />
            ))}
          </div>
        </div>
      )}

      {/* Exam Questions */}
      {notes.examQuestions?.length > 0 && (
        <div className={sectionCard}>
          {sectionHeader(<GraduationCap className={`h-5 w-5 ${isGalaxy ? "text-orange-400" : "text-blue-400"}`} />, "🎓 Exam Questions")}
          <ol className="space-y-2.5">
            {notes.examQuestions.map((q, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-gray-300">
                <span className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  isGalaxy ? "bg-orange-500/20 text-orange-300" : "bg-blue-500/20 text-blue-300"
                }`}>{i + 1}</span>
                <span className="pt-0.5">{q}</span>
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* Mind Map */}
      {notes.mindMap?.length > 0 && (
        <div className={sectionCard}>
          {sectionHeader(<GitBranch className={`h-5 w-5 ${isGalaxy ? "text-pink-400" : "text-blue-400"}`} />, "🗺 Mind Map")}
          <div className="space-y-4">
            {notes.mindMap.map((node, i) => (
              <div key={i}>
                <p className={`text-sm font-semibold mb-2 ${isGalaxy ? "text-cyan-300" : "text-blue-300"}`}>
                  {node.topic}
                </p>
                <div className={`ml-4 pl-4 border-l-2 space-y-1.5 ${
                  isGalaxy ? "border-purple-500/30" : "border-blue-500/30"
                }`}>
                  {node.subtopics?.map((sub, j) => (
                    <p key={j} className="text-sm text-gray-400 flex items-center gap-2">
                      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${isGalaxy ? "bg-purple-400" : "bg-blue-400"}`} />
                      {sub}
                    </p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
