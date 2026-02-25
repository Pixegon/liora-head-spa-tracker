"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { SubService, TimerState, TimerControls } from "@/lib/types";

export function useTimer(subServices: SubService[]): [TimerState, TimerControls] {
  const [stepIndex, setStepIndex] = useState(0);
  const [secondsRemaining, setSecondsRemaining] = useState(
    subServices[0]?.durationSeconds ?? 0
  );
  const [isRunning, setIsRunning] = useState(true);
  const [isComplete, setIsComplete] = useState(false);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const vibrate = useCallback((pattern: number | number[]) => {
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate(pattern);
    }
  }, []);

  const advance = useCallback(() => {
    setStepIndex((prev) => {
      const next = prev + 1;
      if (next >= subServices.length) {
        // Session complete — long-short-long pattern
        vibrate([300, 100, 300, 100, 600]);
        setIsComplete(true);
        setIsRunning(false);
        return prev;
      }
      // Step complete — two short pulses
      vibrate([100, 80, 100]);
      setSecondsRemaining(subServices[next].durationSeconds);
      return next;
    });
  }, [subServices, vibrate]);

  useEffect(() => {
    if (!isRunning || isComplete) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }

    intervalRef.current = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          setTimeout(advance, 0);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, isComplete, advance]);

  const pause = useCallback(() => setIsRunning(false), []);
  const resume = useCallback(() => {
    if (!isComplete) setIsRunning(true);
  }, [isComplete]);
  const skipToNext = useCallback(() => {
    if (!isComplete) advance();
  }, [advance, isComplete]);

  const skipToPrev = useCallback(() => {
    if (isComplete) return;
    setStepIndex((prev) => {
      if (prev <= 0) return prev;
      const prevIdx = prev - 1;
      setSecondsRemaining(subServices[prevIdx].durationSeconds);
      return prevIdx;
    });
  }, [subServices, isComplete]);

  const state: TimerState = { currentStepIndex: stepIndex, secondsRemaining, isRunning, isComplete };
  const controls: TimerControls = { pause, resume, skipToNext, skipToPrev };

  return [state, controls];
}
