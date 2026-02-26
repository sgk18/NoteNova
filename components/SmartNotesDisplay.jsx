"use client";

import { useState } from "react";
import { BookOpen, Brain, Layers, HelpCircle, GraduationCap, GitBranch, ChevronRight } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";

function FlashCard({ q, a }) {
  const [flipped, setFlipped] = useState(false);
  const { theme } = useTheme();
  const isWhite = theme === "white";

  return (
    <div
      onClick={() => setFlipped(!flipped)}
      className={`cursor-pointer rounded-lg p-4 min-h-[100px] flex flex-col justify-center transition-colors border ${
        flipped
          ? isWhite ? "bg-neutral-50 border-neutral-300" : "bg-white/10 border-neutral-600"
          : isWhite ? "bg-white border-neutral-200 hover:border-neutral-300" : "bg-white/5 border-[var(--glass-border)] hover:border-neutral-500"
      }`}
    >
      <p className={`text-[11px] mb-1.5 ${isWhite ? "text-neutral-400" : "text-neutral-500"}`}>{flipped ? "Answer" : "Question"} · Click to flip</p>
      <p className={`text-sm leading-relaxed ${flipped ? (isWhite ? "text-neutral-700" : "text-neutral-200") : (isWhite ? "text-neutral-800" : "text-white")}`}>
        {flipped ? a : q}
      </p>
    </div>
  );
}

function MCQCard({ q, options, answer }) {
  const [selected, setSelected] = useState(null);
  const { theme } = useTheme();
  const isWhite = theme === "white";
  const answered = selected !== null;

  return (
    <div className={`rounded-lg p-4 border ${isWhite ? "bg-neutral-50 border-neutral-200" : "bg-white/5 border-[var(--glass-border)]"}`}>
      <p className={`text-sm font-medium mb-3 ${isWhite ? "text-neutral-800" : "text-white"}`}>{q}</p>
      <div className="space-y-1.5">
        {options.map((opt, i) => {
          const isCorrect = opt === answer;
          const isSelected = selected === i;
          let optClass = isWhite
            ? "bg-white border-neutral-200 text-neutral-700 hover:border-neutral-300"
            : "bg-white/5 border-[var(--glass-border)] text-neutral-300 hover:border-neutral-500";

          if (answered) {
            if (isCorrect) {
              optClass = isWhite ? "bg-green-50 border-green-300 text-green-700" : "bg-green-500/10 border-green-500/30 text-green-300";
            } else if (isSelected && !isCorrect) {
              optClass = isWhite ? "bg-red-50 border-red-300 text-red-700" : "bg-red-500/10 border-red-500/30 text-red-300";
            }
          }

          return (
            <button key={i} onClick={() => !answered && setSelected(i)} disabled={answered}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm border transition-colors ${optClass} ${answered ? "cursor-default" : "cursor-pointer"}`}>
              <span className="font-medium mr-2">{String.fromCharCode(65 + i)}.</span>{opt}
            </button>
          );
        })}
      </div>
      {answered && (
        <p className={`text-xs mt-2.5 ${options[selected] === answer ? "text-green-500" : "text-red-500"}`}>
          {options[selected] === answer ? "Correct!" : `Correct answer: ${answer}`}
        </p>
      )}
    </div>
  );
}

export default function SmartNotesDisplay({ notes, activeIndex = -1 }) {
  const { theme } = useTheme();
  const isWhite = theme === "white";

  if (!notes) return null;

  const headingText = isWhite ? "text-neutral-900" : "text-white";
  const bodyText = isWhite ? "text-neutral-600" : "text-neutral-300";
  const mutedText = isWhite ? "text-neutral-400" : "text-neutral-500";
  const iconColor = isWhite ? "text-neutral-500" : "text-neutral-400";
  const card = (isActive) => `rounded-lg p-5 mb-4 border transition-all duration-300 ${
    isActive 
      ? "ring-2 ring-cyan-500/50 bg-cyan-500/5 shadow-lg shadow-cyan-500/10 border-cyan-500/30" 
      : isWhite ? "bg-white border-neutral-200" : "bg-[var(--card-bg)] border-[var(--card-border)]"
  }`;

  const sectionHeader = (icon, title) => (
    <div className="flex items-center gap-2 mb-3">
      {icon}
      <h3 className={`text-sm font-semibold ${headingText}`}>{title}</h3>
    </div>
  );

  // Map each section to an index for highlighting
  // 0: Summary
  // 1: Key Concepts
  // 2: Flashcards
  // 3: MCQs
  // 4: Exam Questions
  // 5: Mind Map

  return (
    <div className="space-y-1">
      {notes.summary && (
        <div className={card(activeIndex === 0)}>
          {sectionHeader(<BookOpen className={`h-4 w-4 ${activeIndex === 0 ? "text-cyan-400" : iconColor}`} />, "Summary")}
          <p className={`text-sm leading-relaxed ${activeIndex === 0 ? (isWhite ? "text-neutral-900" : "text-white") : bodyText}`}>{notes.summary}</p>
        </div>
      )}

      {notes.keyConcepts?.length > 0 && (
        <div className={card(activeIndex === 1)}>
          {sectionHeader(<Brain className={`h-4 w-4 ${activeIndex === 1 ? "text-cyan-400" : iconColor}`} />, "Key Concepts")}
          <ul className="space-y-1.5 focus-within:ring-0">
            {notes.keyConcepts.map((c, i) => (
              <li key={i} className={`flex items-start gap-2 text-sm ${activeIndex === 1 ? (isWhite ? "text-neutral-900" : "text-white") : bodyText}`}>
                <ChevronRight className={`h-3.5 w-3.5 mt-0.5 flex-shrink-0 ${activeIndex === 1 ? "text-cyan-400" : iconColor}`} />
                <span>{c}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {notes.flashcards?.length > 0 && (
        <div className={card(activeIndex === 2)}>
          {sectionHeader(<Layers className={`h-4 w-4 ${activeIndex === 2 ? "text-cyan-400" : iconColor}`} />, "Flashcards")}
          <p className={`text-[11px] mb-3 ${mutedText}`}>Click a card to reveal the answer</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {notes.flashcards.map((f, i) => <FlashCard key={i} q={f.question} a={f.answer} />)}
          </div>
        </div>
      )}

      {notes.mcqs?.length > 0 && (
        <div className={card(activeIndex === 3)}>
          {sectionHeader(<HelpCircle className={`h-4 w-4 ${activeIndex === 3 ? "text-cyan-400" : iconColor}`} />, "Multiple Choice Questions")}
          <p className={`text-[11px] mb-3 ${mutedText}`}>Select an answer to check</p>
          <div className="space-y-3">
            {notes.mcqs.map((m, i) => <MCQCard key={i} q={`${i + 1}. ${m.question}`} options={m.options} answer={m.answer} />)}
          </div>
        </div>
      )}

      {notes.examQuestions?.length > 0 && (
        <div className={card(activeIndex === 4)}>
          {sectionHeader(<GraduationCap className={`h-4 w-4 ${activeIndex === 4 ? "text-cyan-400" : iconColor}`} />, "Exam Questions")}
          <ol className="space-y-2">
            {notes.examQuestions.map((q, i) => (
              <li key={i} className={`flex items-start gap-2.5 text-sm ${activeIndex === 4 ? (isWhite ? "text-neutral-900" : "text-white") : bodyText}`}>
                <span className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-medium ${activeIndex === 4 ? "bg-cyan-500/20 text-cyan-400" : (isWhite ? "bg-neutral-100 text-neutral-600" : "bg-white/10 text-neutral-300")}`}>{i + 1}</span>
                <span className="pt-0.5">{q}</span>
              </li>
            ))}
          </ol>
        </div>
      )}

      {notes.mindMap?.length > 0 && (
        <div className={card(activeIndex === 5)}>
          {sectionHeader(<GitBranch className={`h-4 w-4 ${activeIndex === 5 ? "text-cyan-400" : iconColor}`} />, "Mind Map")}
          <div className="space-y-3">
            {notes.mindMap.map((node, i) => (
              <div key={i}>
                <p className={`text-sm font-medium mb-1.5 ${activeIndex === 5 ? (isWhite ? "text-neutral-900" : "text-white") : headingText}`}>{node.topic}</p>
                <div className={`ml-3 pl-3 border-l space-y-1 ${activeIndex === 5 ? "border-cyan-500/30" : (isWhite ? "border-neutral-200" : "border-neutral-700")}`}>
                  {node.subtopics?.map((sub, j) => (
                    <p key={j} className={`text-sm flex items-center gap-2 ${activeIndex === 5 ? (isWhite ? "text-neutral-800" : "text-neutral-200") : bodyText}`}>
                      <span className={`w-1 h-1 rounded-full flex-shrink-0 ${activeIndex === 5 ? "bg-cyan-400" : (isWhite ? "bg-neutral-400" : "bg-neutral-500")}`} />
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
