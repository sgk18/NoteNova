"use client";

import { Play, Pause, RotateCcw, RotateCw, SkipBack, SkipForward, Volume2, X } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { useState, useEffect } from "react";

export default function AudioPlayer({ 
  isPlaying, 
  currentIndex, 
  totalChunks, 
  onPlay, 
  onPause, 
  onResume, 
  onSkipForward, 
  onSkipBackward, 
  playbackSpeed, 
  onSpeedChange,
  onClose,
  currentTitle
}) {
  const { theme } = useTheme();
  const isWhite = theme === "white";
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);

  const speeds = [1, 1.25, 1.5, 2];

  if (currentIndex === -1 && !isPlaying) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-md">
      <div className={`
        relative rounded-2xl shadow-2xl overflow-hidden backdrop-blur-xl border
        ${isWhite ? "bg-white/90 border-neutral-200 shadow-neutral-200/50" : "bg-[#0a0a0a]/90 border-white/10 shadow-black/50"}
      `}>
        {/* Progress Bar */}
        <div className="absolute top-0 left-0 h-1 bg-cyan-500/20 w-full">
          <div 
            className="h-full bg-cyan-500 transition-all duration-500"
            style={{ width: `${((currentIndex + 1) / totalChunks) * 100}%` }}
          />
        </div>

        <div className="p-4 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center flex-shrink-0">
                <Volume2 className="h-5 w-5 text-cyan-400" />
              </div>
              <div className="overflow-hidden">
                <p className={`text-[10px] font-medium uppercase tracking-wider ${isWhite ? "text-neutral-400" : "text-neutral-500"}`}>
                  Now Reading
                </p>
                <p className={`text-sm font-semibold truncate ${isWhite ? "text-neutral-800" : "text-white"}`}>
                  {currentTitle || "Smart Notes"}
                </p>
              </div>
            </div>
            
            <button 
              onClick={onClose}
              className={`p-1.5 rounded-lg transition-colors ${isWhite ? "hover:bg-neutral-100 text-neutral-400" : "hover:bg-white/5 text-neutral-500"}`}
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="flex items-center justify-between gap-4">
            {/* Speed Toggle */}
            <div className="relative">
              <button 
                onClick={() => setShowSpeedMenu(!showSpeedMenu)}
                className={`text-xs font-bold px-2 py-1.5 rounded-lg transition-colors min-w-[3.5rem]
                  ${isWhite ? "bg-neutral-100 text-neutral-600 hover:bg-neutral-200" : "bg-white/5 text-neutral-400 hover:bg-white/10"}
                `}
              >
                {playbackSpeed}x
              </button>
              
              {showSpeedMenu && (
                <div className={`
                  absolute bottom-full mb-2 left-0 rounded-xl p-1 border shadow-xl flex flex-col
                  ${isWhite ? "bg-white border-neutral-100" : "bg-[#161616] border-neutral-800"}
                `}>
                  {speeds.map(s => (
                    <button
                      key={s}
                      onClick={() => {
                        onSpeedChange(s);
                        setShowSpeedMenu(false);
                      }}
                      className={`
                        px-3 py-1.5 rounded-lg text-xs font-medium text-left transition-colors
                        ${playbackSpeed === s 
                          ? "bg-cyan-500/10 text-cyan-400" 
                          : isWhite ? "hover:bg-neutral-50 text-neutral-600" : "hover:bg-white/5 text-neutral-400"}
                      `}
                    >
                      {s}x
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Controls */}
            <div className="flex items-center gap-4">
              <button 
                onClick={onSkipBackward}
                className={`p-2 rounded-full transition-colors ${isWhite ? "hover:bg-neutral-100 text-neutral-600" : "hover:bg-white/5 text-neutral-400"}`}
              >
                <SkipBack className="h-5 w-5 fill-current" />
              </button>

              <button 
                onClick={isPlaying ? onPause : onResume}
                className="w-12 h-12 rounded-full bg-cyan-500 flex items-center justify-center text-white shadow-lg shadow-cyan-500/25 hover:scale-105 transition-all active:scale-95"
              >
                {isPlaying ? <Pause className="h-6 w-6 fill-current" /> : <Play className="h-6 w-6 fill-current ml-1" />}
              </button>

              <button 
                onClick={onSkipForward}
                className={`p-2 rounded-full transition-colors ${isWhite ? "hover:bg-neutral-100 text-neutral-600" : "hover:bg-white/5 text-neutral-400"}`}
              >
                <SkipForward className="h-5 w-5 fill-current" />
              </button>
            </div>

            {/* Dummy placeholder for layout balance */}
            <div className="w-[3.5rem]" />
          </div>

          <div className="flex justify-center">
            <p className={`text-[10px] ${isWhite ? "text-neutral-400" : "text-neutral-600"}`}>
              Step {currentIndex + 1} of {totalChunks}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
