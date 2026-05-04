"use client";

import { Pause, Square, Volume2 } from "lucide-react";
import { useState } from "react";

export function BriefingAudioControls({ text }: { text: string }) {
  const [speaking, setSpeaking] = useState(false);
  const [paused, setPaused] = useState(false);

  function cleanTextForSpeech(value: string) {
    return value
      .replace(/\[(.*?)\]\(.*?\)/g, "$1")
      .replace(/[#*_>`-]/g, "")
      .replace(/\n+/g, ". ")
      .trim();
  }

  function speak() {
    if (!text || typeof window === "undefined") return;

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(cleanTextForSpeech(text));
    utterance.rate = 0.95;
    utterance.pitch = 1;
    utterance.volume = 1;

    utterance.onend = () => {
      setSpeaking(false);
      setPaused(false);
    };

    utterance.onerror = () => {
      setSpeaking(false);
      setPaused(false);
    };

    window.speechSynthesis.speak(utterance);
    setSpeaking(true);
    setPaused(false);
  }

  function pauseOrResume() {
    if (paused) {
      window.speechSynthesis.resume();
      setPaused(false);
    } else {
      window.speechSynthesis.pause();
      setPaused(true);
    }
  }

  function stop() {
    window.speechSynthesis.cancel();
    setSpeaking(false);
    setPaused(false);
  }

  return (
    <div className="mt-5 flex flex-wrap gap-3">
      <button
        onClick={speak}
        disabled={!text}
        className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:opacity-50"
      >
        <Volume2 size={16} />
        Listen to briefing
      </button>

      {speaking && (
        <>
          <button
            onClick={pauseOrResume}
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-white/10 dark:bg-white/10 dark:text-white dark:hover:bg-white/20"
          >
            <Pause size={16} />
            {paused ? "Resume" : "Pause"}
          </button>

          <button
            onClick={stop}
            className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 transition hover:bg-red-100 dark:border-red-500/30 dark:bg-red-950/40 dark:text-red-200"
          >
            <Square size={16} />
            Stop
          </button>
        </>
      )}
    </div>
  );
}
