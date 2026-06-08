"use client";

import { useEffect, useState, useCallback } from "react";
import { useAppStore } from "@/store/app";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, BookOpen, ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { CourseFilters } from "./course-filters";
import { CourseCard } from "./course-card";

export function CourseCatalogPage() {
  const { user, navigate } = useAppStore();
  const [courses, setCourses] = useState<Array<Record<string, unknown>>>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("ALL");
  const [difficulty, setDifficulty] = useState("ALL");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchCourses = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: "12" });
      if (category !== "ALL") params.set("category", category);
      if (difficulty !== "ALL") params.set("difficulty", difficulty);
      if (search) params.set("search", search);
      if (user) params.set("userId", user.id);

      const res = await fetch(`/api/courses?${params}`);
      const data = await res.json();
      setCourses(data.courses || []);
      setTotalPages(data.pagination?.totalPages || 1);
    } catch (err) {
      console.error("Failed to fetch courses:", err);
    } finally {
      setLoading(false);
    }
  }, [user, category, difficulty, page, search]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchCourses();
  };

  const handleCategoryChange = (value: string) => {
    setCategory(value);
    setPage(1);
  };

  const handleDifficultyChange = (value: string) => {
    setDifficulty(value);
    setPage(1);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-foreground">Catalogue des cours</h2>
          <p className="text-muted-foreground mt-1">Explorez notre catalogue de formations</p>
        </div>
        {user && (user.role === "ADMIN" || user.role === "FORMATEUR") && (
          <Button
            onClick={() => navigate("course-create")}
            className="bg-[#1D4ED8] hover:bg-[#1D4ED8]/90 rounded-lg shrink-0 w-full sm:w-auto"
            size="sm"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Créer un cours
          </Button>
        )}
      </div>

      {/* Search & Filters */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none z-10" />
        <CourseFilters
          category={category}
          difficulty={difficulty}
          search={search}
          onCategoryChange={handleCategoryChange}
          onDifficultyChange={handleDifficultyChange}
          onSearchChange={setSearch}
          onSearchSubmit={handleSearch}
        />
      </div>

      {/* Course Grid */}
      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="border-border/60">
              <CardContent className="p-0">
                <Skeleton className="w-full h-40" />
                <div className="p-4 space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-5 w-full" />
                  <Skeleton className="h-3 w-32" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : courses.length === 0 ? (
        <div className="text-center py-20">
          <BookOpen className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
          <h3 className="font-semibold text-foreground mb-2">Aucun cours trouvé</h3>
          <p className="text-sm text-muted-foreground">Essayez de modifier vos filtres de recherche</p>
        </div>
      ) : (
        <>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 stagger-children">
            {courses.map((course: Record<string, unknown>) => (
              <CourseCard
                key={course.id as string}
                course={course}
                onClick={() => navigate("course-detail", { id: course.id as string })}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-1 sm:gap-2 pt-4 overflow-x-auto">
              <Button
                variant="outline" size="sm" disabled={page <= 1}
                onClick={() => setPage(page - 1)} className="rounded-lg"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              {(() => {
                const pages: (number | "...")[] = [];
                if (totalPages <= 7) {
                  for (let i = 1; i <= totalPages; i++) pages.push(i);
                } else if (page <= 3) {
                  pages.push(1, 2, 3, 4, "...", totalPages);
                } else if (page >= totalPages - 2) {
                  pages.push(1, "...", totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
                } else {
                  pages.push(1, "...", page - 1, page, page + 1, "...", totalPages);
                }
                return pages.map((p, i) =>
                  p === "..." ? (
                    <span key={`ellipsis-${i}`} className="w-9 text-center text-sm text-muted-foreground select-none">...</span>
                  ) : (
                    <Button
                      key={p}
                      variant={page === p ? "default" : "outline"}
                      size="sm" onClick={() => setPage(p)} className="rounded-lg w-9"
                    >
                      {p}
                    </Button>
                  )
                );
              })()}
              <Button
                variant="outline" size="sm" disabled={page >= totalPages}
                onClick={() => setPage(page + 1)} className="rounded-lg"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
