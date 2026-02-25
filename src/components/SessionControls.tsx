"use client";

import { cn } from "@/lib/utils";

interface SessionControlsProps {
  isRunning: boolean;
  isComplete: boolean;
  canGoPrev: boolean;
  onPause: () => void;
  onResume: () => void;
  onPrev: () => void;
  onNext: () => void;
  onEnd: () => void;
}

export default function SessionControls({
  isRunning,
  isComplete,
  canGoPrev,
  onPause,
  onResume,
  onPrev,
  onNext,
  onEnd,
}: SessionControlsProps) {
  if (isComplete) return null;

  return (
    <div className="flex flex-col items-center gap-5 w-full">
      {/* Prev / Pause-Resume / Next */}
      <div className="flex items-center gap-4 w-full max-w-2xl px-4">
        <button
          onClick={onPrev}
          disabled={!canGoPrev}
          aria-label="Previous step"
          className="h-20 w-20 shrink-0 rounded-2xl bg-spa-surface border-2 border-spa-border text-spa-text text-3xl flex items-center justify-center transition-all duration-200 active:scale-95 disabled:opacity-25 hover:border-spa-muted"
        >
          ←
        </button>

        <button
          onClick={isRunning ? onPause : onResume}
          className={cn(
            "flex-1 h-20 rounded-2xl text-2xl font-bold tracking-wide transition-all duration-200 active:scale-[0.97]",
            isRunning
              ? "bg-spa-surface border-2 border-spa-border text-spa-text hover:border-spa-muted"
              : "bg-spa-accent text-white hover:opacity-90"
          )}
        >
          {isRunning ? "Pause" : "Resume"}
        </button>

        <button
          onClick={onNext}
          aria-label="Next step"
          className="h-20 w-20 shrink-0 rounded-2xl bg-spa-surface border-2 border-spa-border text-spa-text text-3xl flex items-center justify-center transition-all duration-200 active:scale-95 hover:border-spa-muted"
        >
          →
        </button>
      </div>

      <button
        onClick={onEnd}
        className="text-spa-muted text-base hover:text-spa-text transition-colors"
      >
        End Session
      </button>
    </div>
  );
}
