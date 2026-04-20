"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Filter, Grid3X3, List, X } from "lucide-react";
import {
  RESOURCE_TYPE_LABELS,
  RESOURCE_CATEGORY_LABELS,
} from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { CourseOption } from "../types";

// ────────────────────────────────────────────
// Resource Filters Props
// ────────────────────────────────────────────

interface ResourceFiltersProps {
  search: string;
  typeFilter: string;
  categoryFilter: string;
  courseFilter: string;
  viewMode: "grid" | "list";
  total: number;
  hasActiveFilters: boolean;
  courses: CourseOption[];
  onSearchChange: (value: string) => void;
  onTypeFilterChange: (value: string) => void;
  onCategoryFilterChange: (value: string) => void;
  onCourseFilterChange: (value: string) => void;
  onViewModeChange: (mode: "grid" | "list") => void;
  onClearFilters: () => void;
}

// ────────────────────────────────────────────
// Resource Filters Component
// ────────────────────────────────────────────

export function ResourceFilters({
  search,
  typeFilter,
  categoryFilter,
  courseFilter,
  viewMode,
  total,
  hasActiveFilters,
  courses,
  onSearchChange,
  onTypeFilterChange,
  onCategoryFilterChange,
  onCourseFilterChange,
  onViewModeChange,
  onClearFilters,
}: ResourceFiltersProps) {
  return (
    <Card className="border-border/60">
      <CardContent className="p-4 space-y-4">
        <div className="flex gap-3 flex-wrap">
          {/* Search input */}
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher par titre ou description..."
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-9 rounded-lg h-9"
            />
          </div>

          {/* Type filter */}
          <Select value={typeFilter} onValueChange={onTypeFilterChange}>
            <SelectTrigger className="h-9 w-[150px] rounded-lg text-xs">
              <Filter className="w-3.5 h-3.5 mr-1.5 text-muted-foreground" />
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Tous les types</SelectItem>
              {Object.entries(RESOURCE_TYPE_LABELS).map(([k, v]) => (
                <SelectItem key={k} value={k}>
                  {v}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Category filter */}
          <Select value={categoryFilter} onValueChange={onCategoryFilterChange}>
            <SelectTrigger className="h-9 w-[170px] rounded-lg text-xs">
              <SelectValue placeholder="Catégorie" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Toutes catégories</SelectItem>
              {Object.entries(RESOURCE_CATEGORY_LABELS).map(([k, v]) => (
                <SelectItem key={k} value={k}>
                  {v}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Course filter */}
          <Select value={courseFilter} onValueChange={onCourseFilterChange}>
            <SelectTrigger className="h-9 w-[180px] rounded-lg text-xs">
              <SelectValue placeholder="Cours" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Tous les cours</SelectItem>
              {courses.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  <span className="truncate">{c.title}</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Clear filters */}
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              className="rounded-lg text-xs text-muted-foreground h-9"
              onClick={onClearFilters}
            >
              <X className="w-3.5 h-3.5 mr-1" />
              Effacer filtres
            </Button>
          )}
        </div>

        {/* View toggle + count */}
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            {total} ressource{total > 1 ? "s" : ""} trouvée{total > 1 ? "s" : ""}
          </p>
          <div className="flex items-center gap-1 border border-border/60 rounded-lg p-0.5">
            <button
              onClick={() => onViewModeChange("grid")}
              className={cn(
                "p-1.5 rounded-md transition-colors",
                viewMode === "grid"
                  ? "bg-[#1D4ED8] text-white"
                  : "text-muted-foreground hover:text-foreground"
              )}
              aria-label="Vue grille"
            >
              <Grid3X3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => onViewModeChange("list")}
              className={cn(
                "p-1.5 rounded-md transition-colors",
                viewMode === "list"
                  ? "bg-[#1D4ED8] text-white"
                  : "text-muted-foreground hover:text-foreground"
              )}
              aria-label="Vue liste"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
