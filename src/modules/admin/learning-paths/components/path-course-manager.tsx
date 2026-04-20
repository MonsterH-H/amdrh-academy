"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, ArrowUp, ArrowDown, GripVertical, X, Search } from "lucide-react";
import { DIFFICULTY_LABELS, CATEGORY_LABELS } from "@/lib/constants";
import type { PublishedCourse, PathFormCourse } from "../types";
import { formatDuration } from "../types";

// ──────────────────────────────────────────────
// Path Course Manager Props
// ──────────────────────────────────────────────

interface PathCourseManagerProps {
  formCourses: PathFormCourse[];
  setFormCourses: React.Dispatch<React.SetStateAction<PathFormCourse[]>>;
  publishedCourses: PublishedCourse[];
  coursesLoading: boolean;
  courseSearch: string;
  setCourseSearch: (v: string) => void;
}

// ──────────────────────────────────────────────
// Path Course Manager
// ──────────────────────────────────────────────

export function PathCourseManager({
  formCourses,
  setFormCourses,
  publishedCourses,
  coursesLoading,
  courseSearch,
  setCourseSearch,
}: PathCourseManagerProps) {
  const addCourseToForm = (courseId: string) => {
    if (formCourses.some((fc) => fc.courseId === courseId)) return;
    setFormCourses([
      ...formCourses,
      { courseId, order: formCourses.length, isRequired: true, minScore: 70 },
    ]);
  };

  const removeCourseFromForm = (courseId: string) => {
    const filtered = formCourses.filter((fc) => fc.courseId !== courseId);
    setFormCourses(filtered.map((fc, i) => ({ ...fc, order: i })));
  };

  const moveCourse = (index: number, direction: "up" | "down") => {
    const arr = [...formCourses];
    const target = direction === "up" ? index - 1 : index + 1;
    if (target < 0 || target >= arr.length) return;
    [arr[index], arr[target]] = [arr[target], arr[index]];
    setFormCourses(arr.map((fc, i) => ({ ...fc, order: i })));
  };

  const availableCourses = publishedCourses.filter(
    (c) => !formCourses.some((fc) => fc.courseId === c.id)
  );
  const filteredAvailable = courseSearch
    ? availableCourses.filter((c) =>
        c.title.toLowerCase().includes(courseSearch.toLowerCase())
      )
    : availableCourses;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <Label className="text-xs font-medium">Cours du parcours</Label>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            {formCourses.length} cours ajouté(s)
          </p>
        </div>
      </div>

      {/* Course search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          className="pl-9 h-9 rounded-lg text-sm"
          placeholder="Rechercher un cours publié..."
          value={courseSearch}
          onChange={(e) => setCourseSearch(e.target.value)}
        />
      </div>

      {/* Available courses list */}
      {coursesLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      ) : (
        <div className="max-h-48 overflow-y-auto border border-border/40 rounded-lg divide-y divide-border/30">
          {filteredAvailable.length === 0 ? (
            <div className="py-6 text-center text-xs text-muted-foreground">
              {availableCourses.length === 0
                ? "Aucun cours publié disponible"
                : "Aucun cours correspondant"}
            </div>
          ) : (
            filteredAvailable.map((course) => (
              <button
                key={course.id}
                onClick={() => addCourseToForm(course.id)}
                className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-muted/50 transition-colors text-left"
              >
                <Plus className="w-4 h-4 text-primary flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{course.title}</p>
                  <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                    <Badge variant="outline" className="text-[9px]">
                      {CATEGORY_LABELS[course.category] || course.category}
                    </Badge>
                    <Badge variant="outline" className="text-[9px]">
                      {DIFFICULTY_LABELS[course.difficulty] || course.difficulty}
                    </Badge>
                    <span>{formatDuration(course.duration)}</span>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      )}

      {/* Selected courses (ordered list) */}
      {formCourses.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground">Ordre des cours :</p>
          <div className="space-y-1.5">
            {formCourses.map((fc, i) => {
              const courseInfo = publishedCourses.find((c) => c.id === fc.courseId);
              return (
                <div
                  key={fc.courseId}
                  className="flex items-center gap-2 p-2.5 rounded-lg border border-border/60 bg-white"
                >
                  <div className="flex flex-col gap-0.5">
                    <button onClick={() => moveCourse(i, "up")} disabled={i === 0} className="text-muted-foreground hover:text-foreground disabled:opacity-30"><ArrowUp className="w-3 h-3" /></button>
                    <button onClick={() => moveCourse(i, "down")} disabled={i === formCourses.length - 1} className="text-muted-foreground hover:text-foreground disabled:opacity-30"><ArrowDown className="w-3 h-3" /></button>
                  </div>
                  <GripVertical className="w-4 h-4 text-muted-foreground/40 flex-shrink-0" />
                  <span className="text-[10px] font-mono text-primary/60 w-4 text-center flex-shrink-0">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{courseInfo?.title || "Cours"}</p>
                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                      {courseInfo && (
                        <>
                          <span>{CATEGORY_LABELS[courseInfo.category] || courseInfo.category}</span>
                          <span>•</span>
                          <span>{formatDuration(courseInfo.duration)}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <div className="flex items-center gap-1">
                      <Checkbox checked={fc.isRequired} onCheckedChange={(v) => { const arr = [...formCourses]; arr[i] = { ...arr[i], isRequired: !!v }; setFormCourses(arr); }} className="w-4 h-4" />
                      <span className="text-[10px] text-muted-foreground whitespace-nowrap">Oblig.</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Label className="text-[10px] text-muted-foreground whitespace-nowrap">Score min</Label>
                      <Input type="number" min={0} max={100} value={fc.minScore} onChange={(e) => { const arr = [...formCourses]; arr[i] = { ...arr[i], minScore: parseInt(e.target.value, 10) || 0 }; setFormCourses(arr); }} className="w-14 h-7 text-[11px] rounded-md px-2" />
                    </div>
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-red-500 hover:bg-red-50 hover:text-red-600 rounded-md" onClick={() => removeCourseFromForm(fc.courseId)}><X className="w-3.5 h-3.5" /></Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
