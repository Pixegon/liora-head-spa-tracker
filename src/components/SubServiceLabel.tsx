"use client";

interface SubServiceLabelProps {
  name: string;
  stepIndex: number;
  totalSteps: number;
}

export default function SubServiceLabel({ name, stepIndex, totalSteps }: SubServiceLabelProps) {
  return (
    <div className="text-center px-4">
      <p className="text-spa-muted text-lg font-medium tracking-widest uppercase mb-3">
        Step {stepIndex + 1} of {totalSteps}
      </p>
      <h2
        className="font-semibold text-spa-text leading-tight"
        style={{ fontSize: "clamp(32px, 5.5vw, 64px)" }}
      >
        {name}
      </h2>
    </div>
  );
}
