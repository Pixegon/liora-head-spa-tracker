"use client";

import { useEffect, useState } from "react";
import { Service } from "@/lib/types";
import { formatTime } from "@/lib/utils";

interface StepOverviewModalProps {
  service: Service;
  currentStepIndex: number;
  onClose: () => void;
}

export default function StepOverviewModal({
  service,
  currentStepIndex,
  onClose,
}: StepOverviewModalProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Trigger slide-up after mount
    const t = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(t);
  }, []);

  function handleClose() {
    setVisible(false);
    setTimeout(onClose, 300);
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-spa-text/20 backdrop-blur-sm transition-opacity duration-300"
        style={{ opacity: visible ? 1 : 0 }}
        onClick={handleClose}
      />

      {/* Drawer */}
      <div
        className="relative z-10 bg-spa-bg rounded-t-3xl shadow-2xl flex flex-col transition-transform duration-300 ease-out"
        style={{
          maxHeight: "80vh",
          transform: visible ? "translateY(0)" : "translateY(100%)",
        }}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
          <div className="w-10 h-1 rounded-full bg-spa-border" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-3 pb-4 flex-shrink-0 border-b border-spa-border">
          <div>
            <p className="text-xs font-medium tracking-widest uppercase text-spa-muted">
              Session Overview
            </p>
            <h2 className="text-base font-semibold text-spa-text mt-0.5">
              {service.name}
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-full bg-spa-surface flex items-center justify-center text-spa-muted hover:text-spa-text hover:bg-spa-border transition-colors duration-150"
            aria-label="Close overview"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path
                d="M1 1l12 12M13 1L1 13"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        {/* Step list */}
        <div className="overflow-y-auto flex-1 px-4 py-3">
          {service.subServices.map((step, i) => {
            const isCompleted = i < currentStepIndex;
            const isCurrent = i === currentStepIndex;

            return (
              <div
                key={step.id}
                className={[
                  "flex items-center gap-4 px-3 py-3.5 rounded-2xl mb-1.5 transition-colors duration-150",
                  isCurrent ? "bg-spa-accentLight" : "hover:bg-spa-surface",
                ].join(" ")}
              >
                {/* Left indicator */}
                <div className="flex-shrink-0 w-7 flex items-center justify-center">
                  {isCompleted ? (
                    <span className="text-spa-accent opacity-60">
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path
                          d="M2.5 8l4 4 7-7"
                          stroke="currentColor"
                          strokeWidth="1.75"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>
                  ) : isCurrent ? (
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-spa-accent opacity-50" />
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-spa-accent" />
                    </span>
                  ) : (
                    <span className="text-xs font-medium text-spa-muted tabular-nums">
                      {i + 1}
                    </span>
                  )}
                </div>

                {/* Step name */}
                <div className="flex-1 min-w-0">
                  <p
                    className={[
                      "truncate leading-snug",
                      isCurrent
                        ? "text-spa-text font-semibold text-base"
                        : isCompleted
                        ? "text-spa-muted font-normal text-sm line-through decoration-spa-muted/50"
                        : "text-spa-muted font-normal text-sm",
                    ].join(" ")}
                  >
                    {step.name}
                  </p>
                  {isCurrent && (
                    <p className="text-xs text-spa-accent font-medium mt-0.5">
                      In progress
                    </p>
                  )}
                </div>

                {/* Duration */}
                <div className="flex-shrink-0 text-right">
                  <span
                    className={[
                      "text-sm tabular-nums",
                      isCurrent
                        ? "text-spa-accent font-semibold"
                        : "text-spa-muted font-normal",
                    ].join(" ")}
                  >
                    {formatTime(step.durationSeconds)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 px-6 py-4 border-t border-spa-border">
          <p className="text-xs text-spa-muted text-center">
            Step {currentStepIndex + 1} of {service.subServices.length}
          </p>
        </div>
      </div>
    </div>
  );
}
