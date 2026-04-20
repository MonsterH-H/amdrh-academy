"use client";

import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Lock, CirclePlay, ArrowRight, Clock } from "lucide-react";
import { CATEGORY_LABELS, DIFFICULTY_LABELS } from "@/lib/constants";
import { cn } from "@/lib/utils";

import type { PathCourse, PathEnrollment } from "./path-card";
import type { AppView } from "@/store/app";

interface PathDetailProps {
  courses: PathCourse[];
  enrollment: PathEnrollment | undefined;
  enrollmentStatus: string;
  onNavigate: (view: AppView, params?: Record<string, string>) => void;
}

export function PathDetail({ courses, enrollment, enrollmentStatus, onNavigate }: PathDetailProps) {
  return (
    <div className="relative">
      <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-border" />
      <div className="space-y-3">
        {courses.map((pc, i) => {
          const isUnlocked = !enrollment || i <= (enrollment.currentCourseOrder || 0);
          const isCurrentCourse = enrollment && i === enrollment.currentCourseOrder;
          const isCompleted = enrollment && i < (enrollment.currentCourseOrder || 0);
          const isLocked = !isUnlocked;

          return (
            <div key={pc.id} className="relative flex items-start gap-4">
              <div
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 z-10 border-2 transition-all",
                  isCurrentCourse
                    ? "bg-primary text-white border-primary ring-4 ring-primary/20"
                    : isCompleted
                      ? "bg-green-500 text-white border-green-500"
                      : isLocked
                        ? "bg-muted text-muted-foreground border-muted"
                        : "bg-primary text-white border-primary"
                )}
              >
                {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : isCurrentCourse ? <CirclePlay className="w-5 h-5" /> : <Lock className="w-4 h-4" />}
              </div>
              <div
                className={cn(
                  "flex-1 p-3 rounded-lg border border-border/60 transition-all",
                  isUnlocked ? "hover:shadow-sm cursor-pointer" : "opacity-50",
                  isCurrentCourse && "border-primary/50 bg-primary/5",
                  isCompleted && "opacity-80"
                )}
                onClick={() => isUnlocked && onNavigate("course-detail", { id: pc.course.id })}
              >
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <Badge variant="outline" className="text-[10px]">
                    {CATEGORY_LABELS[pc.course.category || "ARBITRAGE"]}
                  </Badge>
                  <Badge variant="outline" className="text-[10px]">
                    {DIFFICULTY_LABELS[pc.course.difficulty || "DEBUTANT"]}
                  </Badge>
                  <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {pc.course.duration} min
                  </span>
                </div>
                <p className="text-sm font-medium text-foreground">{pc.course.title}</p>
                {isCurrentCourse && (
                  <p className="text-[10px] text-primary font-medium mt-1 flex items-center gap-1">
                    <ArrowRight className="w-3 h-3" /> Cours en cours
                  </p>
                )}
                {isCompleted && (
                  <p className="text-[10px] text-green-600 font-medium mt-1 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Complété
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
