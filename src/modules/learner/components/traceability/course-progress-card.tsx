"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  BookOpen, CheckCircle2, Clock, Award, ChevronDown, ChevronUp,
  ChevronRight, PlayCircle, Trophy, Target, XCircle,
} from "lucide-react";
import {
  CATEGORY_LABELS, DIFFICULTY_LABELS, DIFFICULTY_COLORS,
  LESSON_TYPE_LABELS, LESSON_TYPE_COLORS,
} from "@/lib/constants";
import { cn } from "@/lib/utils";
import { formatTime, formatDate, formatTimeAgo } from "@/utils/format";
import type { CourseData, CourseProgressDetail, QuizAttemptData } from "../../types";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getLessonTypeIcon(type: string) {
  switch (type) {
    case "VIDEO": return <span className="text-[9px]">🎬</span>;
    case "PDF": return <span className="text-[9px]">📄</span>;
    case "INTERACTIF": return <span className="text-[9px]">🖱️</span>;
    default: return <span className="text-[9px]">📄</span>;
  }
}

function getCompletionTriggerLabel(trigger: string): string {
  switch (trigger) {
    case "auto_video": return "Auto vidéo";
    case "auto_scroll": return "Auto lecture";
    case "auto_time": return "Auto temps";
    case "manual": return "Manuel";
    default: return trigger;
  }
}

// ─── Course Progress Card ─────────────────────────────────────────────────────

export function CourseProgressCard({
  course,
  progressDetail,
  onViewCourse,
  quizAttempts,
}: {
  course: CourseData;
  progressDetail: CourseProgressDetail;
  onViewCourse: (courseId: string, lessonId?: string) => void;
  quizAttempts?: QuizAttemptData[];
}) {
  const [expanded, setExpanded] = useState(false);

  const enrollment = course.enrollments[0];
  const progress = enrollment?.progress || 0;
  const isComplete = enrollment?.status === "termine";

  const apiLessons = progressDetail?.lessons || [];
  const allLessons = course.sections.flatMap((s) => s.lessons);

  const lpMap = new Map<string, typeof apiLessons[number]>();
  for (const l of apiLessons) { lpMap.set(l.id, l); }

  const completedLessons = apiLessons.filter((l) => l.completed) || [];
  const completedCount = completedLessons.length || 0;
  const totalCount = allLessons.length || apiLessons.length || 0;

  const timelineItems: Array<{ icon: typeof CheckCircle2; label: string; time: string; colorClass: string }> = [];
  for (const l of completedLessons) {
    if (l.completedAt) {
      const triggerLabel = getCompletionTriggerLabel(l.completionTrigger || "manual");
      timelineItems.push({
        icon: CheckCircle2, label: `Leçon "${l.title}" complétée (${triggerLabel})`,
        time: formatTimeAgo(l.completedAt), colorClass: "text-green-500",
      });
    }
  }
  if (isComplete && enrollment?.completedAt) {
    timelineItems.push({ icon: Award, label: "Cours terminé !", time: formatTimeAgo(enrollment.completedAt), colorClass: "text-primary" });
  }
  timelineItems.reverse();

  const visibleLessons = expanded ? allLessons : allLessons.slice(0, 3);

  const bestAttempt = quizAttempts && quizAttempts.length > 0
    ? quizAttempts.reduce((best, a) => {
        const pct = a.maxScore > 0 ? (a.score / a.maxScore) * 100 : 0;
        const bestPct = best.maxScore > 0 ? (best.score / best.maxScore) * 100 : 0;
        return pct > bestPct ? a : best;
      })
    : null;

  return (
    <Card className="border-border/60 hover:shadow-sm transition-shadow overflow-hidden">
      <CardContent className="p-5 sm:p-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-foreground text-sm sm:text-base leading-snug cursor-pointer hover:text-primary transition-colors"
              onClick={() => onViewCourse(course.id)}>
              {course.title}
            </h3>
            <div className="flex flex-wrap items-center gap-1.5 mt-2">
              <Badge variant="secondary" className="text-[10px]">
                {CATEGORY_LABELS[course.category] || course.category}
              </Badge>
              <Badge variant="secondary" className={cn("text-[10px]", DIFFICULTY_COLORS[course.difficulty])}>
                {DIFFICULTY_LABELS[course.difficulty] || course.difficulty}
              </Badge>
              {isComplete && (
                <Badge className="bg-green-100 text-green-700 text-[10px] gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Terminé
                </Badge>
              )}
            </div>
          </div>
          <div className="text-right flex-shrink-0">
            <div className="text-lg font-bold text-foreground">{progress}%</div>
            <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden mt-1">
              <div className={cn("h-full rounded-full transition-all duration-500", isComplete ? "bg-green-500" : "bg-primary")}
                style={{ width: `${progress}%` }} />
            </div>
          </div>
        </div>

        <Separator className="mb-4" />

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <BookOpen className="w-3.5 h-3.5 flex-shrink-0" />
            <span>{completedCount}/{totalCount} leçons</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Clock className="w-3.5 h-3.5 flex-shrink-0" />
            <span>{formatTime(progressDetail?.totalTimeSpent || 0)}</span>
          </div>
          {bestAttempt && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Target className="w-3.5 h-3.5 flex-shrink-0" />
              <span className={cn(bestAttempt.status === "REUSSI" ? "text-green-600 font-medium" : "")}>
                {bestAttempt.maxScore > 0 ? Math.round((bestAttempt.score / bestAttempt.maxScore) * 100) : 0}%
                {bestAttempt.status === "REUSSI" ? " (Réussi)" : ""}
              </span>
            </div>
          )}
          {isComplete && (
            <div className="flex items-center gap-2 text-xs text-amber-600">
              <Award className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="font-medium">Terminé</span>
            </div>
          )}
        </div>

        {/* Quiz attempts mini */}
        {quizAttempts && quizAttempts.length > 0 && (
          <div className="mb-4">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">Tentatives de quiz</p>
            <div className="flex items-center gap-2 flex-wrap">
              {quizAttempts.map((attempt) => {
                const pct = attempt.maxScore > 0 ? Math.round((attempt.score / attempt.maxScore) * 100) : 0;
                return (
                  <Badge key={attempt.id} variant="secondary" className={cn("text-[10px] gap-1",
                    attempt.status === "REUSSI" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                  )}>
                    {attempt.status === "REUSSI" ? <Trophy className="w-2.5 h-2.5" /> : <XCircle className="w-2.5 h-2.5" />}
                    {pct}%
                    <span className="opacity-60">{attempt.submittedAt ? formatDate(attempt.submittedAt) : ""}</span>
                  </Badge>
                );
              })}
            </div>
          </div>
        )}

        <Separator className="mb-4" />

        {/* Lesson List */}
        <div className="space-y-1.5">
          {visibleLessons.map((lesson) => {
            const lp = lpMap.get(lesson.id);
            const isCompleted = lp?.completed || false;
            const hasProgress = lp && (lp.watchPercentage > 0 || lp.scrollPercentage > 0);
            return (
              <button key={lesson.id} onClick={() => onViewCourse(course.id, lesson.id)}
                className="w-full flex items-center gap-3 p-2.5 rounded-lg text-left hover:bg-muted/50 transition-colors group">
                {isCompleted ? (
                  <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                ) : hasProgress ? (
                  <PlayCircle className="w-4 h-4 text-amber-500 flex-shrink-0" />
                ) : (
                  <div className="w-4 h-4 rounded-full border-2 border-muted-foreground/30 flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className={cn("text-xs font-medium truncate", isCompleted ? "text-foreground/70" : "text-foreground")}>
                    {lesson.title}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <Badge variant="outline" className={cn("text-[9px] gap-0.5 px-1.5 py-0 h-4", LESSON_TYPE_COLORS[lesson.type])}>
                      {getLessonTypeIcon(lesson.type)}
                      {LESSON_TYPE_LABELS[lesson.type] || lesson.type}
                    </Badge>
                    {isCompleted && lp?.completionTrigger && (
                      <span className="text-[9px] text-green-600">{getCompletionTriggerLabel(lp.completionTrigger)}</span>
                    )}
                  </div>
                </div>
                {hasProgress && !isCompleted && (
                  <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden flex-shrink-0">
                    <div className="h-full rounded-full bg-amber-400" style={{
                      width: `${Math.max(lesson.type === "VIDEO" ? lp?.watchPercentage || 0 : lp?.scrollPercentage || 0, 0)}%`,
                    }} />
                  </div>
                )}
                {lp && lp.timeSpent > 0 && (
                  <span className="text-[10px] text-muted-foreground flex-shrink-0 hidden sm:inline">{formatTime(lp.timeSpent)}</span>
                )}
                <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/40 group-hover:text-muted-foreground flex-shrink-0 transition-colors" />
              </button>
            );
          })}
        </div>

        {allLessons.length > 3 && (
          <button onClick={() => setExpanded(!expanded)}
            className="w-full flex items-center justify-center gap-1 text-xs text-muted-foreground hover:text-foreground mt-3 py-1.5 rounded-lg hover:bg-muted/50 transition-colors">
            {expanded ? (<><ChevronUp className="w-3.5 h-3.5" /> Voir moins</>) : (<><ChevronDown className="w-3.5 h-3.5" /> Voir les {allLessons.length - 3} leçons restantes</>)}
          </button>
        )}

        {/* Timeline */}
        {timelineItems.length > 0 && (
          <>
            <Separator className="my-4" />
            <div className="space-y-2">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">Activité récente</p>
              {timelineItems.slice(0, 3).map((item, idx) => {
                const Icon = item.icon;
                return (
                  <div key={idx} className="flex items-start gap-2.5 text-xs">
                    <Icon className={cn("w-3.5 h-3.5 mt-0.5 flex-shrink-0", item.colorClass)} />
                    <div className="flex-1 min-w-0">
                      <p className="text-muted-foreground leading-snug">{item.label}</p>
                      <p className="text-[10px] text-muted-foreground/60 mt-0.5">{item.time}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        <div className="mt-4 flex justify-end">
          <Button variant="ghost" size="sm" className="text-xs text-primary hover:text-primary/80 gap-1.5"
            onClick={() => onViewCourse(course.id)}>
            Voir les détails <ChevronRight className="w-3.5 h-3.5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
