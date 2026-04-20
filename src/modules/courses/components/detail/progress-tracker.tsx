"use client";

import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  BookOpen, Clock, Users, Award, CheckCircle2, Loader2, FileText,
} from "lucide-react";
import {
  CATEGORY_LABELS, DIFFICULTY_LABELS, DIFFICULTY_COLORS,
} from "@/lib/constants";
import { cn } from "@/lib/utils";

// ─── Progress Tracker ─────────────────────────────

interface ProgressTrackerProps {
  enrollment: Record<string, unknown> | null;
  isEnrolled: boolean;
  isManager: boolean;
  enrolling: boolean;
  quiz: Record<string, unknown> | null;
  courseId: string;
  course: Record<string, unknown>;
  sections: Array<Record<string, unknown>>;
  instructor: Record<string, unknown> | null;
  user: Record<string, unknown> | null;
  onEnroll: () => void;
  onNavigateQuiz: () => void;
}

export function ProgressTracker({
  enrollment,
  isEnrolled,
  isManager,
  enrolling,
  quiz,
  course,
  sections,
  instructor,
  onEnroll,
  onNavigateQuiz,
}: ProgressTrackerProps) {
  return (
    <Card className="border-border/60 h-fit">
      <CardContent className="p-5 space-y-4">
        {isManager ? (
          <>
            <div className="flex items-center gap-2 p-3 rounded-lg bg-primary/5">
              <BookOpen className="w-4 h-4 text-primary" />
              <span className="text-xs font-medium text-primary">Mode gestion</span>
            </div>
            <div className="space-y-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-2"><Clock className="w-3.5 h-3.5" /> {course.duration as number} minutes</div>
              <div className="flex items-center gap-2"><Users className="w-3.5 h-3.5" /> {(course._count as Record<string, unknown>)?.enrollments as number} inscrits</div>
              <div className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5" /> {sections?.reduce((s: number, sec: Record<string, unknown>) => s + ((sec.lessons as unknown[])?.length || 0), 0) || 0} leçons</div>
              {quiz && (
                <div className="flex items-center gap-2"><FileText className="w-3.5 h-3.5" /> Quiz ({quiz.passingScore as number}% requis)</div>
              )}
              {instructor && (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">
                    {(instructor.prenom as string)?.charAt(0) || ""}{(instructor.nom as string)?.charAt(0) || ""}
                  </div>
                  {(instructor.prenom as string) || ""} {(instructor.nom as string) || ""}
                </div>
              )}
            </div>
          </>
        ) : isEnrolled ? (
          <>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">Progression</span>
                <span className="font-semibold">{enrollment?.progress as number}%</span>
              </div>
              <Progress value={enrollment?.progress as number} className="h-2" />
            </div>
            {quiz && (
              <Button className="w-full rounded-lg text-sm" onClick={onNavigateQuiz}>
                <FileText className="w-4 h-4 mr-2" />
                Passer le quiz
              </Button>
            )}
          </>
        ) : (
          <>
            <Button className="w-full rounded-lg text-sm h-11" onClick={onEnroll} disabled={enrolling}>
              {enrolling ? <Loader2 className="w-4 h-4 animate-spin" /> : "S'inscrire au cours"}
            </Button>
            <div className="space-y-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-2"><Clock className="w-3.5 h-3.5" /> {course.duration as number} minutes</div>
              <div className="flex items-center gap-2"><Users className="w-3.5 h-3.5" /> {(course._count as Record<string, unknown>)?.enrollments as number} inscrits</div>
              {instructor && (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">
                    {(instructor.prenom as string)?.charAt(0) || ""}{(instructor.nom as string)?.charAt(0) || ""}
                  </div>
                  {(instructor.prenom as string) || ""} {(instructor.nom as string) || ""}
                </div>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Quiz Banner ──────────────────────────────────

interface QuizBannerProps {
  quiz: Record<string, unknown> | null;
  enrollment: Record<string, unknown> | null;
  isEnrolled: boolean;
  courseId: string;
  onNavigateQuiz: () => void;
}

export function QuizBanner({
  quiz,
  enrollment,
  isEnrolled,
  onNavigateQuiz,
}: QuizBannerProps) {
  if (!quiz || !isEnrolled || !enrollment) return null;

  const progress = enrollment.progress as number;
  const isComplete = progress === 100;

  return (
    <div className={cn(
      "rounded-xl border p-4 flex flex-col sm:flex-row items-start sm:items-center gap-3",
      isComplete
        ? "border-green-200 bg-green-50/50"
        : "border-amber-200 bg-amber-50/50",
    )}>
      <div className={cn(
        "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0",
        isComplete ? "bg-green-100" : "bg-amber-100",
      )}>
        <Award className={cn("w-5 h-5", isComplete ? "text-green-600" : "text-amber-600")} />
      </div>
      <div className="flex-1">
        <h4 className={cn("text-sm font-semibold", isComplete ? "text-green-800" : "text-amber-800")}>
          {isComplete ? "Prêt pour le quiz !" : "Complétez d'abord toutes les leçons"}
        </h4>
        <p className="text-xs text-muted-foreground mt-0.5">
          {isComplete
            ? `Quiz disponible — Score requis: ${quiz.passingScore as number}%`
            : `Progression: ${progress}% — Le quiz sera disponible une fois toutes les leçons terminées.`}
        </p>
      </div>
      {isComplete && (
        <Button size="sm" className="rounded-lg text-sm" onClick={onNavigateQuiz}>
          <FileText className="w-4 h-4 mr-1.5" />
          Passer le quiz
        </Button>
      )}
    </div>
  );
}
