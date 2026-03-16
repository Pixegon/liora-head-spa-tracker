"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Service, Category } from "@/lib/types";
import ServiceCard from "@/components/ServiceCard";
import ThemeToggle from "@/components/ThemeToggle";
import { cn } from "@/lib/utils";

interface SelectionViewProps {
  services: Service[];
  categories: Category[];
}

function CategoryCard({ category, count, onClick }: { category: Category; count: number; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full text-left rounded-2xl p-6 min-h-[140px] flex flex-col justify-between",
        "border-2 transition-all duration-200 active:scale-[0.98]",
        "bg-spa-surface border-spa-border hover:border-spa-muted hover:bg-spa-accentLight"
      )}
    >
      <span className="text-xl font-semibold leading-tight text-spa-text">
        {category.name}
      </span>
      <div className="flex items-center justify-between mt-4">
        <span className="text-sm text-spa-muted">
          {count} {count === 1 ? "service" : "services"}
        </span>
        <span className="text-sm text-spa-muted">→</span>
      </div>
    </button>
  );
}

export default function SelectionView({ services, categories }: SelectionViewProps) {
  const router = useRouter();
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);

  const onSelect = (id: string) => router.push(`/session/${id}`);

  const uncategorized = services.filter((s) => !s.categoryId);
  const hasCategories = categories.length > 0;

  // Category drill-down view
  if (selectedCategoryId) {
    const category = categories.find((c) => c.id === selectedCategoryId);
    const categoryServices = services.filter((s) => s.categoryId === selectedCategoryId);

    return (
      <div className="min-h-screen flex flex-col px-6 py-10 md:px-12 md:py-14">
        <div className="flex items-start justify-between mb-10">
          <div>
            <button
              onClick={() => setSelectedCategoryId(null)}
              className="text-spa-muted text-sm font-medium tracking-widest uppercase mb-1 hover:text-spa-text transition-colors flex items-center gap-1.5"
            >
              ← Liora Head Spa
            </button>
            <h1 className="text-4xl md:text-5xl font-bold text-spa-text">
              {category?.name}
            </h1>
          </div>
          <ThemeToggle />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
          {categoryServices.map((service) => (
            <ServiceCard key={service.id} service={service} onSelect={onSelect} />
          ))}
        </div>
      </div>
    );
  }

  // Home view
  const categoriesWithServices = categories.filter((cat) =>
    services.some((s) => s.categoryId === cat.id)
  );

  const allItems = [
    ...uncategorized.map((s) => ({ kind: "service" as const, service: s })),
    ...categoriesWithServices.map((c) => ({ kind: "category" as const, category: c })),
  ];

  // If no categories configured at all, show flat grid (original behavior)
  const items = !hasCategories ? uncategorized.map((s) => ({ kind: "service" as const, service: s })) : allItems;

  return (
    <div className="min-h-screen flex flex-col px-6 py-10 md:px-12 md:py-14">
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
        {items.map((item) =>
          item.kind === "service" ? (
            <ServiceCard key={item.service.id} service={item.service} onSelect={onSelect} />
          ) : (
            <CategoryCard
              key={item.category.id}
              category={item.category}
              count={services.filter((s) => s.categoryId === item.category.id).length}
              onClick={() => setSelectedCategoryId(item.category.id)}
            />
          )
        )}
      </div>
    </div>
  );
}
