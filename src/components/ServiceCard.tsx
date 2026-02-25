"use client";

import { Service } from "@/lib/types";
import { formatMinutes } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface ServiceCardProps {
  service: Service;
  isSelected: boolean;
  onSelect: (id: string) => void;
}

export default function ServiceCard({ service, isSelected, onSelect }: ServiceCardProps) {
  return (
    <button
      onClick={() => onSelect(service.id)}
      className={cn(
        "w-full text-left rounded-2xl p-6 min-h-[140px] flex flex-col justify-between",
        "border-2 transition-all duration-200 active:scale-[0.98]",
        isSelected
          ? "bg-spa-accentLight border-spa-accent"
          : "bg-spa-surface border-spa-border hover:border-spa-muted"
      )}
    >
      <span className={cn(
        "text-xl font-semibold leading-tight",
        isSelected ? "text-spa-accent" : "text-spa-text"
      )}>
        {service.name}
      </span>
      <div className="flex items-center justify-between mt-4">
        <span className="text-sm text-spa-muted">{service.tagline}</span>
        <span className={cn(
          "text-sm font-medium tabular-nums",
          isSelected ? "text-spa-accent" : "text-spa-muted"
        )}>
          {formatMinutes(service.totalDurationSeconds)}
        </span>
      </div>
    </button>
  );
}
