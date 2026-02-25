"use client";

import { formatTime } from "@/lib/utils";

interface CountdownDisplayProps {
  secondsRemaining: number;
}

export default function CountdownDisplay({ secondsRemaining }: CountdownDisplayProps) {
  return (
    <div
      className="tabular-nums font-mono font-bold text-spa-text leading-none select-none"
      style={{ fontSize: "clamp(120px, 30vw, 320px)" }}
    >
      {formatTime(secondsRemaining)}
    </div>
  );
}
