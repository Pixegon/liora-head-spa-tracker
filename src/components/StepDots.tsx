"use client";

import { cn } from "@/lib/utils";

interface StepDotsProps {
  totalSteps: number;
  currentStep: number;
}

export default function StepDots({ totalSteps, currentStep }: StepDotsProps) {
  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: totalSteps }).map((_, i) => (
        <span
          key={i}
          className={cn(
            "rounded-full transition-all duration-300",
            i < currentStep
              ? "w-2 h-2 bg-spa-accent opacity-40"
              : i === currentStep
              ? "w-3 h-3 bg-spa-accent"
              : "w-2 h-2 bg-spa-ringTrack"
          )}
        />
      ))}
    </div>
  );
}
