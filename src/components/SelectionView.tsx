"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Service } from "@/lib/types";
import ServiceGrid from "@/components/ServiceGrid";
import { cn } from "@/lib/utils";

interface SelectionViewProps {
  services: Service[];
}

export default function SelectionView({ services }: SelectionViewProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const router = useRouter();

  const handleBegin = () => {
    if (selectedId) router.push(`/session/${selectedId}`);
  };

  return (
    <div className="min-h-screen flex flex-col px-6 py-10 md:px-12 md:py-14">
      {/* Header */}
      <div className="flex items-start justify-between mb-10">
        <div>
          <p className="text-spa-muted text-sm font-medium tracking-widest uppercase mb-1">
            Liora Head Spa
          </p>
          <h1 className="text-4xl md:text-5xl font-bold text-spa-text">
            Select Service
          </h1>
        </div>
        <Link
          href="/dashboard"
          className="text-spa-muted text-sm hover:text-spa-text transition-colors mt-1"
        >
          Dashboard →
        </Link>
      </div>

      {/* Service grid */}
      <div className="flex-1">
        <ServiceGrid
          services={services}
          selectedId={selectedId}
          onSelect={setSelectedId}
        />
      </div>

      {/* Begin button */}
      <div className="mt-10">
        <button
          onClick={handleBegin}
          disabled={!selectedId}
          className={cn(
            "w-full h-16 rounded-2xl text-lg font-semibold transition-all duration-200",
            selectedId
              ? "bg-spa-accent text-white active:scale-[0.98] hover:opacity-90"
              : "bg-spa-surface text-spa-muted cursor-not-allowed"
          )}
        >
          {selectedId ? "Begin Session" : "Choose a service to begin"}
        </button>
      </div>
    </div>
  );
}
