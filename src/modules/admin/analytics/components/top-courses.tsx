"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { BookOpen, GraduationCap } from "lucide-react";
import { useAppStore } from "@/store/app";
import { cn } from "@/lib/utils";
import { CATEGORY_LABELS } from "@/lib/constants";

// ─── Types ───────────────────────────────────────────────────────────────────

interface TopCourse {
  id: string;
  title: string;
  category: string;
  difficulty: string;
  enrollmentCount: number;
  completionRate: number;
  passRate: number;
}

// ─── Top Courses Section ─────────────────────────────────────────────────────

export function TopCoursesSection() {
  const { user } = useAppStore();
  const [courses, setCourses] = useState<TopCourse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await fetch(`/api/admin/course-stats?userId=${user?.id}&role=${user?.role}`);
        if (!res.ok) throw new Error("Erreur");
        const json = await res.json();
        const courseList: TopCourse[] = (json.courses || []).map(
          (c: Record<string, unknown>) => ({
            id: c.id as string,
            title: c.title as string,
            category: (c.category as string) || "ARBITRAGE",
            difficulty: (c.difficulty as string) || "DEBUTANT",
            enrollmentCount: (c.enrollmentCount as number) || 0,
            completionRate: (c.completionRate as number) || 0,
            passRate: (c.passRate as number) || 0,
          }),
        );
        setCourses(courseList);
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, [user]);

  return (
    <Card className="border-border/60">
      <CardContent className="p-6">
        <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
          <GraduationCap className="w-4 h-4 text-primary" /> Cours les plus suivis
        </h3>
        {loading ? (
          <div className="space-y-3">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full rounded-lg" />)}</div>
        ) : courses.length === 0 ? (
          <div className="text-center py-8">
            <BookOpen className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Aucun cours disponible</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-xs text-muted-foreground border-b border-border/40">
                  <th className="text-left py-2.5 px-3 font-medium">#</th>
                  <th className="text-left py-2.5 px-3 font-medium">Cours</th>
                  <th className="text-left py-2.5 px-3 font-medium hidden sm:table-cell">Catégorie</th>
                  <th className="text-left py-2.5 px-3 font-medium text-right">Inscriptions</th>
                  <th className="text-left py-2.5 px-3 font-medium text-right hidden md:table-cell">Complétion</th>
                  <th className="text-left py-2.5 px-3 font-medium text-right hidden lg:table-cell">Réussite</th>
                </tr>
              </thead>
              <tbody>
                {courses.map((course, i) => (
                  <tr key={course.id} className="border-b border-border/20 last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="py-3 px-3">
                      <span className={cn("inline-flex items-center justify-center w-6 h-6 rounded-full text-[10px] font-bold",
                        i < 3 ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground")}>{i + 1}</span>
                    </td>
                    <td className="py-3 px-3">
                      <p className="text-sm font-medium text-foreground truncate max-w-[200px]">{course.title}</p>
                    </td>
                    <td className="py-3 px-3 hidden sm:table-cell">
                      <Badge variant="secondary" className={cn("text-[10px]", CATEGORY_LABELS[course.category] ? "bg-muted/80" : "")}>
                        {CATEGORY_LABELS[course.category] || course.category}
                      </Badge>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <span className="text-sm font-semibold text-foreground">{course.enrollmentCount}</span>
                    </td>
                    <td className="py-3 px-3 text-right hidden md:table-cell">
                      <div className="flex items-center justify-end gap-2">
                        <Progress value={course.completionRate} className="w-16 h-1.5" />
                        <span className="text-xs text-muted-foreground w-8 text-right">{course.completionRate}%</span>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-right hidden lg:table-cell">
                      <span className={cn("text-xs font-medium",
                        course.passRate >= 70 ? "text-green-600" : course.passRate >= 50 ? "text-amber-600" : "text-red-600")}>
                        {course.passRate}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
