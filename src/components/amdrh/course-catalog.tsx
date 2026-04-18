"use client";

import { useEffect, useState } from "react";
import { useAppStore } from "@/store/app";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, SlidersHorizontal, BookOpen, Clock, Users, ChevronLeft, ChevronRight } from "lucide-react";
import { CATEGORY_LABELS, DIFFICULTY_LABELS, DIFFICULTY_COLORS } from "@/lib/constants";
import { cn } from "@/lib/utils";

const categories = [
  { value: "ALL", label: "Tous" },
  ...Object.entries(CATEGORY_LABELS).map(([k, v]) => ({ value: k, label: v })),
];

const difficulties = [
  { value: "ALL", label: "Tous niveaux" },
  ...Object.entries(DIFFICULTY_LABELS).map(([k, v]) => ({ value: k, label: v })),
];

export function CourseCatalogPage() {
  const { user, navigate } = useAppStore();
  const [courses, setCourses] = useState<Array<Record<string, unknown>>>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("ALL");
  const [difficulty, setDifficulty] = useState("ALL");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchCourses();
  }, [category, difficulty, page]);

  const fetchCourses = async () => {
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
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchCourses();
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Catalogue des cours</h2>
        <p className="text-muted-foreground mt-1">Explorez notre catalogue de formations</p>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <form onSubmit={handleSearch} className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher un cours..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-10 pl-9 rounded-lg"
          />
        </form>
      </div>

      <div className="flex flex-wrap gap-2">
        <div className="flex gap-1 flex-wrap">
          {categories.map((c) => (
            <button
              key={c.value}
              onClick={() => { setCategory(c.value); setPage(1); }}
              className={cn(
                "px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200",
                category === c.value
                  ? "bg-primary text-white shadow-sm"
                  : "bg-white text-muted-foreground border border-border/60 hover:border-primary/30"
              )}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-1 flex-wrap">
        {difficulties.map((d) => (
          <button
            key={d.value}
            onClick={() => { setDifficulty(d.value); setPage(1); }}
            className={cn(
              "px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200",
              difficulty === d.value
                ? "bg-secondary text-secondary-foreground shadow-sm"
                : "bg-white text-muted-foreground border border-border/60 hover:border-border"
            )}
          >
            {d.label}
          </button>
        ))}
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
            {courses.map((course: Record<string, unknown>) => {
              const enrollments = course.enrollments as Array<Record<string, unknown>> | false;
              const userEnrollment = Array.isArray(enrollments) && enrollments.length > 0 ? enrollments[0] : null;
              const instructor = course.instructor as Record<string, unknown> | null;

              return (
                <Card
                  key={course.id as string}
                  className="border-border/60 hover:shadow-md transition-all duration-200 cursor-pointer group"
                  onClick={() => navigate("course-detail", { id: course.id as string })}
                >
                  <CardContent className="p-0">
                    <div className="relative w-full h-40 bg-gradient-to-br from-blue-500/10 to-blue-600/20 flex items-center justify-center overflow-hidden">
                      <BookOpen className="w-10 h-10 text-blue-400/60 group-hover:scale-110 transition-transform duration-300" />
                      {userEnrollment && (
                        <div className="absolute top-3 right-3">
                          <Badge className="bg-green-500 text-white text-[10px]">
                            {userEnrollment.progress as number}%
                          </Badge>
                        </div>
                      )}
                      <Badge variant="secondary" className="absolute top-3 left-3 text-[10px]">
                        {CATEGORY_LABELS[(course.category as string) || "ARBITRAGE"]}
                      </Badge>
                    </div>
                    <div className="p-4">
                      <Badge variant="secondary" className={cn("text-[10px] mb-2", DIFFICULTY_COLORS[(course.difficulty as string) || "DEBUTANT"])}>
                        {DIFFICULTY_LABELS[(course.difficulty as string) || "DEBUTANT"]}
                      </Badge>
                      <h3 className="font-semibold text-sm text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                        {course.title as string}
                      </h3>
                      <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {course.duration as number} min</span>
                        <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {(course._count as Record<string, unknown>)?.enrollments as number || 0}</span>
                      </div>
                      {instructor && (
                        <p className="text-xs text-muted-foreground mt-2">
                          {instructor.prenom as string} {instructor.nom as string}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              <Button
                variant="outline" size="sm" disabled={page <= 1}
                onClick={() => setPage(page - 1)} className="rounded-lg"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <Button
                  key={p}
                  variant={page === p ? "default" : "outline"}
                  size="sm" onClick={() => setPage(p)} className="rounded-lg w-9"
                >
                  {p}
                </Button>
              ))}
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
