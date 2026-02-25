"use client";

import { useRouter } from "next/navigation";
import { Service } from "@/lib/types";
import ServiceGrid from "@/components/ServiceGrid";
import ThemeToggle from "@/components/ThemeToggle";

interface SelectionViewProps {
  services: Service[];
}

export default function SelectionView({ services }: SelectionViewProps) {
  const router = useRouter();

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
        <ThemeToggle />
      </div>

      {/* Service grid */}
      <ServiceGrid
        services={services}
        onSelect={(id) => router.push(`/session/${id}`)}
      />
    </div>
  );
}
