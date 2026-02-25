"use client";

import { calcProgress } from "@/lib/utils";

interface ProgressRingProps {
  secondsRemaining: number;
  totalSeconds: number;
  size?: number;
  strokeWidth?: number;
}

export default function ProgressRing({
  secondsRemaining,
  totalSeconds,
  size = 380,
  strokeWidth = 6,
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = calcProgress(secondsRemaining, totalSeconds);
  const offset = circumference * (1 - progress);

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className="absolute"
      style={{ maxWidth: "min(70vw, 70vh)", maxHeight: "min(70vw, 70vh)", width: "100%", height: "100%" }}
    >
      {/* Track */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="#EDE5DC"
        strokeWidth={strokeWidth}
      />
      {/* Progress arc */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="#9C6B4E"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        style={{ transition: "stroke-dashoffset 1000ms linear" }}
      />
    </svg>
  );
}
