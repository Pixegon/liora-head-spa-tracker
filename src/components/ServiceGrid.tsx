"use client";

import { Service } from "@/lib/types";
import ServiceCard from "@/components/ServiceCard";

interface ServiceGridProps {
  services: Service[];
  onSelect: (id: string) => void;
}

export default function ServiceGrid({ services, onSelect }: ServiceGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
      {services.map((service) => (
        <ServiceCard
          key={service.id}
          service={service}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
}
