"use client";

import { useState, useEffect, useCallback, useRef } from "react";

export function useTTS(chunks = [], resourceId = null) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const synthRef = useRef(null);
  const utteranceRef = useRef(null);

  // Load persisted state
  useEffect(() => {
    if (resourceId) {
      const saved = localStorage.getItem(`tts_state_${resourceId}`);
      if (saved) {
        try {
          const { index, speed } = JSON.parse(saved);
          setCurrentIndex(index);
          setPlaybackSpeed(speed);
        } catch (e) {
          console.error("Failed to parse TTS state", e);
        }
      }
    }
  }, [resourceId]);

  // Persist state
  useEffect(() => {
    if (resourceId && currentIndex !== -1) {
      localStorage.setItem(`tts_state_${resourceId}`, JSON.stringify({
        index: currentIndex,
        speed: playbackSpeed
      }));
    }
  }, [resourceId, currentIndex, playbackSpeed]);

  useEffect(() => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      synthRef.current = window.speechSynthesis;
    }

    return () => {
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, []);

  const stop = useCallback(() => {
    if (synthRef.current) {
      synthRef.current.cancel();
      setIsPlaying(false);
      setCurrentIndex(-1);
      if (resourceId) {
        localStorage.removeItem(`tts_state_${resourceId}`);
      }
    }
  }, [resourceId]);

  const play = useCallback((index) => {
    if (!synthRef.current || !chunks.length) return;

    const targetIndex = index !== undefined ? index : (currentIndex === -1 ? 0 : currentIndex);
    if (targetIndex >= chunks.length) {
      stop();
      return;
    }

    synthRef.current.cancel();

    const utterance = new SpeechSynthesisUtterance(chunks[targetIndex].text);
    utterance.rate = playbackSpeed;
    
    // Attempt to find a natural sounding English voice
    const voices = synthRef.current.getVoices();
    const preferredVoice = voices.find(v => v.lang.startsWith("en-") && (v.name.includes("Google") || v.name.includes("Natural")));
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    utterance.onstart = () => {
      setIsPlaying(true);
      setCurrentIndex(targetIndex);
    };

    utterance.onend = () => {
      if (targetIndex + 1 < chunks.length) {
        play(targetIndex + 1);
      } else {
        setIsPlaying(false);
        // Don't reset currentIndex here so user can restart or see where it finished
      }
    };

    utterance.onerror = (event) => {
      console.error("SpeechSynthesisUtterance error", event);
      setIsPlaying(false);
    };

    utteranceRef.current = utterance;
    synthRef.current.speak(utterance);
  }, [chunks, currentIndex, playbackSpeed, stop]);

  const pause = useCallback(() => {
    if (synthRef.current) {
      synthRef.current.pause();
      setIsPlaying(false);
    }
  }, []);

  const resume = useCallback(() => {
    if (synthRef.current && synthRef.current.paused) {
      synthRef.current.resume();
      setIsPlaying(true);
    } else {
      play();
    }
  }, [play]);

  const skipForward = useCallback(() => {
    if (currentIndex + 1 < chunks.length) {
      play(currentIndex + 1);
    }
  }, [chunks.length, currentIndex, play]);

  const skipBackward = useCallback(() => {
    if (currentIndex > 0) {
      play(currentIndex - 1);
    } else {
      play(0);
    }
  }, [currentIndex, play]);

  const updateSpeed = (speed) => {
    setPlaybackSpeed(speed);
    if (isPlaying) {
      // Re-trigger current chunk with new speed
      play(currentIndex);
    }
  };

  return {
    isPlaying,
    currentIndex,
    playbackSpeed,
    play,
    pause,
    resume,
    stop,
    skipForward,
    skipBackward,
    updateSpeed,
  };
}
