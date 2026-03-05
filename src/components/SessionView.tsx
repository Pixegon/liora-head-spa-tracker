"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Service } from "@/lib/types";
import { useTimer } from "@/hooks/useTimer";
import CountdownDisplay from "@/components/CountdownDisplay";
import SubServiceLabel from "@/components/SubServiceLabel";
import StepDots from "@/components/StepDots";
import SessionControls from "@/components/SessionControls";
import StepOverviewModal from "@/components/StepOverviewModal";

interface SessionViewProps {
  service: Service;
}

export default function SessionView({ service }: SessionViewProps) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [showOverview, setShowOverview] = useState(false);
  const [wasRunningOnOpen, setWasRunningOnOpen] = useState(false);
  const [{ currentStepIndex, secondsRemaining, isRunning, isComplete }, controls] =
    useTimer(service.subServices);

  // Prevent hydration mismatch — render neutral state until mounted
  useEffect(() => {
    setMounted(true);
  }, []);

  // Screen Wake Lock — prevent tablet from sleeping during session
  useEffect(() => {
    let wakeLock: WakeLockSentinel | null = null;
    if ("wakeLock" in navigator) {
      navigator.wakeLock.request("screen").then((lock) => {
        wakeLock = lock;
      }).catch(() => {/* silently ignore if unavailable */});
    }
    return () => {
      wakeLock?.release();
    };
  }, []);

  const currentStep = service.subServices[currentStepIndex];
  const currentStepTotal = currentStep?.durationSeconds ?? 0;

  const displaySeconds = mounted ? secondsRemaining : currentStepTotal;

  return (
    <div className="min-h-screen flex flex-col items-center justify-between px-6 py-10 md:px-12 md:py-14 relative overflow-hidden">

      {/* Top bar */}
      <div className="w-full flex items-center justify-between">
        <div>
          <p className="text-spa-muted text-sm font-medium tracking-widest uppercase">
            Liora Head Spa
          </p>
          <h1 className="text-xl md:text-2xl font-semibold text-spa-text mt-0.5">
            {service.name}
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => { setWasRunningOnOpen(isRunning); controls.pause(); setShowOverview(true); }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-spa-surface border border-spa-border text-spa-muted hover:text-spa-text hover:bg-spa-border transition-colors duration-150 text-xs font-medium tracking-wide"
            aria-label="Show session overview"
          >
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none" className="flex-shrink-0">
              <rect x="0.75" y="0.75" width="4.5" height="4.5" rx="1" stroke="currentColor" strokeWidth="1.25"/>
              <rect x="7.75" y="0.75" width="4.5" height="4.5" rx="1" stroke="currentColor" strokeWidth="1.25"/>
              <rect x="0.75" y="7.75" width="4.5" height="4.5" rx="1" stroke="currentColor" strokeWidth="1.25"/>
              <rect x="7.75" y="7.75" width="4.5" height="4.5" rx="1" stroke="currentColor" strokeWidth="1.25"/>
            </svg>
            Overview
          </button>
          <StepDots totalSteps={service.subServices.length} currentStep={currentStepIndex} />
        </div>
      </div>

      {/* Step overview modal */}
      {showOverview && (
        <StepOverviewModal
          service={service}
          currentStepIndex={currentStepIndex}
          onClose={() => { setShowOverview(false); if (wasRunningOnOpen) controls.resume(); }}
        />
      )}

      {/* Timer center */}
      <div className="flex-1 flex flex-col items-center justify-center gap-6 w-full">
        <CountdownDisplay secondsRemaining={displaySeconds} />

        {currentStep && (
          <SubServiceLabel
            name={currentStep.name}
            stepIndex={currentStepIndex}
            totalSteps={service.subServices.length}
          />
        )}
      </div>

      {/* Controls */}
      <SessionControls
        isRunning={isRunning}
        isComplete={isComplete}
        canGoPrev={currentStepIndex > 0}
        onPause={controls.pause}
        onResume={controls.resume}
        onPrev={controls.skipToPrev}
        onNext={controls.skipToNext}
        onEnd={() => router.push("/")}
      />

      {/* Session complete overlay */}
      {isComplete && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-spa-bg z-10">
          <p className="text-spa-muted text-sm font-medium tracking-widest uppercase mb-4">
            Session Complete
          </p>
          <h2
            className="font-bold text-spa-text text-center leading-tight mb-2"
            style={{ fontSize: "clamp(36px, 6vw, 72px)" }}
          >
            {service.name}
          </h2>
          <p className="text-spa-muted text-lg mb-12">Well done.</p>
          <button
            onClick={() => router.push("/")}
            className="h-16 px-12 rounded-2xl bg-spa-accent text-white text-lg font-semibold active:scale-[0.98] hover:opacity-90 transition-all duration-200"
          >
            Back to Services
          </button>
        </div>
      )}
    </div>
  );
}
