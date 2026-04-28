"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { CATEGORY_LABELS, DIFFICULTY_LABELS } from "@/lib/constants";
import { cn } from "@/lib/utils";

const categories = [
  { value: "ALL", label: "Tous" },
  ...Object.entries(CATEGORY_LABELS).map(([k, v]) => ({ value: k, label: v })),
];

const difficulties = [
  { value: "ALL", label: "Tous niveaux" },
  ...Object.entries(DIFFICULTY_LABELS).map(([k, v]) => ({ value: k, label: v })),
];

interface CourseFiltersProps {
  category: string;
  difficulty: string;
  search: string;
  onCategoryChange: (value: string) => void;
  onDifficultyChange: (value: string) => void;
  onSearchChange: (value: string) => void;
  onSearchSubmit: (e: React.FormEvent) => void;
}

export function CourseFilters({
  category,
  difficulty,
  search,
  onCategoryChange,
  onDifficultyChange,
  onSearchChange,
  onSearchSubmit,
}: CourseFiltersProps) {
  const [localSearch, setLocalSearch] = useState(search);

  const handleSearchChange = (value: string) => {
    setLocalSearch(value);
    onSearchChange(value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearchSubmit(e);
  };

  return (
    <>
      {/* Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <form onSubmit={handleSubmit} className="flex-1 relative">
          <Input
            placeholder="Rechercher un cours..."
            value={localSearch}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="h-10 pl-9 rounded-lg"
          />
        </form>
      </div>

      {/* Category Filters */}
      <div className="flex flex-wrap gap-2">
        <div className="flex gap-1 flex-wrap">
          {categories.map((c) => (
            <button
              key={c.value}
              onClick={() => onCategoryChange(c.value)}
              className={cn(
                "px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200",
                category === c.value
                  ? "bg-primary text-white shadow-sm"
                  : "bg-card text-muted-foreground border border-border/60 hover:border-primary/30"
              )}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Difficulty Filters */}
      <div className="flex gap-1 flex-wrap">
        {difficulties.map((d) => (
          <button
            key={d.value}
            onClick={() => onDifficultyChange(d.value)}
            className={cn(
              "px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200",
              difficulty === d.value
                ? "bg-secondary text-secondary-foreground shadow-sm"
                : "bg-card text-muted-foreground border border-border/60 hover:border-border"
            )}
          >
            {d.label}
          </button>
        ))}
      </div>
    </>
  );
}
