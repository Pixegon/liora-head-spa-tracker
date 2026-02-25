"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Service } from "@/lib/types";
import { useTimer } from "@/hooks/useTimer";
import CountdownDisplay from "@/components/CountdownDisplay";
import SubServiceLabel from "@/components/SubServiceLabel";
import StepDots from "@/components/StepDots";
import SessionControls from "@/components/SessionControls";

interface SessionViewProps {
  service: Service;
}

export default function SessionView({ service }: SessionViewProps) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
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
        <StepDots totalSteps={service.subServices.length} currentStep={currentStepIndex} />
      </div>

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
