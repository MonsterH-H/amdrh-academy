"use client";

import { useEffect, useState, useCallback } from "react";
import { useAppStore } from "@/store/app";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BookOpen,
  CheckCircle2,
  Clock,
  Award,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  PlayCircle,
  Loader2,
  Video,
  FileText,
  MousePointerClick,
  TrendingUp,
  Trophy,
  Target,
  Calendar,
  BarChart3,
  PieChart as PieChartIcon,
  XCircle,
  Zap,
  GraduationCap,
} from "lucide-react";
import {
  CATEGORY_LABELS,
  DIFFICULTY_LABELS,
  DIFFICULTY_COLORS,
  LESSON_TYPE_LABELS,
  LESSON_TYPE_COLORS,
} from "@/lib/constants";
import { cn } from "@/lib/utils";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";

// ─── Types ────────────────────────────────────────────────────────────────────

interface EnrollmentData {
  id: string;
  progress: number;
  status: string;
  startedAt: string;
  completedAt: string | null;
}

interface CourseData {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  duration: number;
  isCertifying: boolean;
  enrollments: EnrollmentData[];
  sections: Array<{
    id: string;
    title: string;
    order: number;
    lessons: Array<{
      id: string;
      title: string;
      type: string;
      duration: number;
      order: number;
    }>;
  }>;
  quiz: { id: string; passingScore: number } | null;
}

interface LessonProgressData {
  id: string;
  lessonId: string;
  completed: boolean;
  timeSpent: number;
  watchPercentage: number;
  scrollPercentage: number;
  completionTrigger: string;
  viewedAt: string;
  completedAt: string | null;
  lesson: {
    id: string;
    title: string;
    type: string;
    duration: number;
  };
}

interface CourseProgressDetail {
  enrollment: EnrollmentData & { id: string };
  lessons: Array<{
    id: string;
    title: string;
    type: string;
    duration: number;
    completed: boolean;
    timeSpent: number;
    watchPercentage: number;
    scrollPercentage: number;
    completionTrigger: string;
    completedAt: string | null;
    viewedAt: string | null;
  }>;
  totalTimeSpent: number;
  completedLessons?: number;
  totalLessons?: number;
}

interface QuizAttemptData {
  id: string;
  score: number;
  maxScore: number;
  status: string;
  duration: number;
  submittedAt: string;
  quizTitle?: string;
  courseTitle?: string;
  courseId?: string;
}

interface CertificateData {
  id: string;
  code: string;
  courseTitle: string;
  score: number;
  maxScore: number;
  issuedAt: string;
  status: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatTime(seconds: number): string {
  if (seconds < 60) return `${seconds}min`;
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  if (hours > 0) return `${hours}h ${mins}min`;
  return `${mins}min`;
}

function timeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffMs = now - then;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffH = Math.floor(diffMin / 60);
  const diffD = Math.floor(diffH / 24);
  if (diffSec < 60) return "à l'instant";
  if (diffMin < 60) return `il y a ${diffMin}min`;
  if (diffH < 24) return `il y a ${diffH}h`;
  if (diffD < 7) return `il y a ${diffD}j`;
  return new Date(dateStr).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
  });
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function getLessonTypeIcon(type: string) {
  switch (type) {
    case "VIDEO":
      return <Video className="w-3.5 h-3.5" />;
    case "PDF":
      return <FileText className="w-3.5 h-3.5" />;
    case "INTERACTIF":
      return <MousePointerClick className="w-3.5 h-3.5" />;
    default:
      return <FileText className="w-3.5 h-3.5" />;
  }
}

function getCompletionTriggerLabel(trigger: string): string {
  switch (trigger) {
    case "auto_video":
      return "Auto vidéo";
    case "auto_scroll":
      return "Auto lecture";
    case "auto_time":
      return "Auto temps";
    case "manual":
      return "Manuel";
    default:
      return trigger;
  }
}

// ─── Colors for charts ────────────────────────────────────────────────────────

const CHART_COLORS = [
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#06b6d4",
  "#f97316",
  "#ec4899",
];

const PIE_COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444"];

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({
  icon: Icon,
  label,
  value,
  colorClass,
  bgColor,
}: {
  icon: typeof BookOpen;
  label: string;
  value: string | number;
  colorClass: string;
  bgColor: string;
}) {
  return (
    <Card className="border-border/60 hover:shadow-sm transition-shadow">
      <CardContent className="p-4 sm:p-5">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0",
              bgColor
            )}
          >
            <Icon className={cn("w-5 h-5", colorClass)} />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground leading-tight">
              {value}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Course Card ──────────────────────────────────────────────────────────────

function CourseProgressCard({
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

  // Build map from API lessons (progress merged into lesson objects)
  const lpMap = new Map<string, typeof apiLessons[number]>();
  for (const l of apiLessons) {
    lpMap.set(l.id, l);
  }

  const completedLessons = apiLessons.filter((l) => l.completed) || [];
  const completedCount = completedLessons.length || 0;
  const totalCount = allLessons.length || apiLessons.length || 0;

  const timelineItems: Array<{
    icon: typeof CheckCircle2;
    label: string;
    time: string;
    colorClass: string;
  }> = [];

  for (const l of completedLessons) {
    if (l.completedAt) {
      const triggerLabel = getCompletionTriggerLabel(l.completionTrigger || "manual");
      timelineItems.push({
        icon: CheckCircle2,
        label: `Leçon "${l.title}" complétée (${triggerLabel})`,
        time: timeAgo(l.completedAt),
        colorClass: "text-green-500",
      });
    }
  }

  if (isComplete && enrollment?.completedAt) {
    timelineItems.push({
      icon: Award,
      label: "Cours terminé !",
      time: timeAgo(enrollment.completedAt),
      colorClass: "text-primary",
    });
  }

  timelineItems.reverse();

  const visibleLessons = expanded ? allLessons : allLessons.slice(0, 3);

  // Best quiz attempt
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
            <h3
              className="font-semibold text-foreground text-sm sm:text-base leading-snug cursor-pointer hover:text-primary transition-colors"
              onClick={() => onViewCourse(course.id)}
            >
              {course.title}
            </h3>
            <div className="flex flex-wrap items-center gap-1.5 mt-2">
              <Badge variant="secondary" className="text-[10px]">
                {CATEGORY_LABELS[course.category] || course.category}
              </Badge>
              <Badge
                variant="secondary"
                className={cn(
                  "text-[10px]",
                  DIFFICULTY_COLORS[course.difficulty]
                )}
              >
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
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-500",
                  isComplete ? "bg-green-500" : "bg-primary"
                )}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        <Separator className="mb-4" />

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <BookOpen className="w-3.5 h-3.5 flex-shrink-0" />
            <span>
              {completedCount}/{totalCount} leçons
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Clock className="w-3.5 h-3.5 flex-shrink-0" />
            <span>{formatTime(progressDetail?.totalTimeSpent || 0)}</span>
          </div>
          {bestAttempt && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Target className="w-3.5 h-3.5 flex-shrink-0" />
              <span
                className={cn(
                  bestAttempt.status === "REUSSI"
                    ? "text-green-600 font-medium"
                    : ""
                )}
              >
                {bestAttempt.maxScore > 0
                  ? Math.round((bestAttempt.score / bestAttempt.maxScore) * 100)
                  : 0}
                % {bestAttempt.status === "REUSSI" ? "(Réussi)" : ""}
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

        {/* Quiz attempts mini timeline */}
        {quizAttempts && quizAttempts.length > 0 && (
          <div className="mb-4">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
              Tentatives de quiz
            </p>
            <div className="flex items-center gap-2 flex-wrap">
              {quizAttempts.map((attempt) => {
                const pct =
                  attempt.maxScore > 0
                    ? Math.round((attempt.score / attempt.maxScore) * 100)
                    : 0;
                return (
                  <Badge
                    key={attempt.id}
                    variant="secondary"
                    className={cn(
                      "text-[10px] gap-1",
                      attempt.status === "REUSSI"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    )}
                  >
                    {attempt.status === "REUSSI" ? (
                      <Trophy className="w-2.5 h-2.5" />
                    ) : (
                      <XCircle className="w-2.5 h-2.5" />
                    )}
                    {pct}%
                    <span className="opacity-60">
                      {attempt.submittedAt
                        ? formatDate(attempt.submittedAt)
                        : ""}
                    </span>
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
            const hasProgress =
              lp && (lp.watchPercentage > 0 || lp.scrollPercentage > 0);

            return (
              <button
                key={lesson.id}
                onClick={() => onViewCourse(course.id, lesson.id)}
                className="w-full flex items-center gap-3 p-2.5 rounded-lg text-left hover:bg-muted/50 transition-colors group"
              >
                {isCompleted ? (
                  <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                ) : hasProgress ? (
                  <PlayCircle className="w-4 h-4 text-amber-500 flex-shrink-0" />
                ) : (
                  <div className="w-4 h-4 rounded-full border-2 border-muted-foreground/30 flex-shrink-0" />
                )}

                <div className="flex-1 min-w-0">
                  <p
                    className={cn(
                      "text-xs font-medium truncate",
                      isCompleted ? "text-foreground/70" : "text-foreground"
                    )}
                  >
                    {lesson.title}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-[9px] gap-0.5 px-1.5 py-0 h-4",
                        LESSON_TYPE_COLORS[lesson.type]
                      )}
                    >
                      {getLessonTypeIcon(lesson.type)}
                      {LESSON_TYPE_LABELS[lesson.type] || lesson.type}
                    </Badge>
                    {isCompleted && lp?.completionTrigger && (
                      <span className="text-[9px] text-green-600">
                        {getCompletionTriggerLabel(lp.completionTrigger)}
                      </span>
                    )}
                  </div>
                </div>

                {hasProgress && !isCompleted && (
                  <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden flex-shrink-0">
                    <div
                      className="h-full rounded-full bg-amber-400"
                      style={{
                        width: `${Math.max(
                          lesson.type === "VIDEO"
                            ? lp?.watchPercentage || 0
                            : lp?.scrollPercentage || 0,
                          0
                        )}%`,
                      }}
                    />
                  </div>
                )}

                {lp && lp.timeSpent > 0 && (
                  <span className="text-[10px] text-muted-foreground flex-shrink-0 hidden sm:inline">
                    {formatTime(lp.timeSpent)}
                  </span>
                )}

                <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/40 group-hover:text-muted-foreground flex-shrink-0 transition-colors" />
              </button>
            );
          })}
        </div>

        {/* Expand/Collapse */}
        {allLessons.length > 3 && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="w-full flex items-center justify-center gap-1 text-xs text-muted-foreground hover:text-foreground mt-3 py-1.5 rounded-lg hover:bg-muted/50 transition-colors"
          >
            {expanded ? (
              <>
                <ChevronUp className="w-3.5 h-3.5" />
                Voir moins
              </>
            ) : (
              <>
                <ChevronDown className="w-3.5 h-3.5" />
                Voir les {allLessons.length - 3} leçons restantes
              </>
            )}
          </button>
        )}

        {/* Timeline */}
        {timelineItems.length > 0 && (
          <>
            <Separator className="my-4" />
            <div className="space-y-2">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                Activité récente
              </p>
              {timelineItems.slice(0, 3).map((item, idx) => {
                const Icon = item.icon;
                return (
                  <div key={idx} className="flex items-start gap-2.5 text-xs">
                    <Icon
                      className={cn(
                        "w-3.5 h-3.5 mt-0.5 flex-shrink-0",
                        item.colorClass
                      )}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-muted-foreground leading-snug">
                        {item.label}
                      </p>
                      <p className="text-[10px] text-muted-foreground/60 mt-0.5">
                        {item.time}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* View Course Link */}
        <div className="mt-4 flex justify-end">
          <Button
            variant="ghost"
            size="sm"
            className="text-xs text-primary hover:text-primary/80 gap-1.5"
            onClick={() => onViewCourse(course.id)}
          >
            Voir les détails
            <ChevronRight className="w-3.5 h-3.5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Quiz Attempts Table ──────────────────────────────────────────────────────

function QuizAttemptsSection({
  attempts,
  onViewCourse,
}: {
  attempts: QuizAttemptData[];
  onViewCourse: (courseId: string) => void;
}) {
  if (attempts.length === 0) return null;

  return (
    <Card className="border-border/60 overflow-hidden">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Trophy className="w-4 h-4 text-amber-500" />
          Historique des quiz ({attempts.length} tentative
          {attempts.length > 1 ? "s" : ""})
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {attempts.map((attempt) => {
            const pct =
              attempt.maxScore > 0
                ? Math.round((attempt.score / attempt.maxScore) * 100)
                : 0;
            return (
              <div
                key={attempt.id}
                className="flex items-center gap-3 p-3 rounded-lg border border-border/60 hover:bg-muted/30 transition-colors"
              >
                <div
                  className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
                    attempt.status === "REUSSI"
                      ? "bg-green-100"
                      : "bg-red-100"
                  )}
                >
                  {attempt.status === "REUSSI" ? (
                    <Trophy className="w-4 h-4 text-green-600" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-500" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {attempt.courseTitle || "Quiz"}
                  </p>
                  <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                    <Calendar className="w-3 h-3" />
                    <span>
                      {attempt.submittedAt
                        ? formatDate(attempt.submittedAt)
                        : ""}
                    </span>
                    {attempt.duration > 0 && (
                      <>
                        <Clock className="w-3 h-3" />
                        <span>{formatTime(attempt.duration)}</span>
                      </>
                    )}
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div
                    className={cn(
                      "text-lg font-bold",
                      pct >= 70 ? "text-green-600" : pct >= 50 ? "text-amber-600" : "text-red-600"
                    )}
                  >
                    {pct}%
                  </div>
                  <p className="text-[10px] text-muted-foreground">
                    {attempt.score}/{attempt.maxScore}
                  </p>
                </div>
                <div className="w-12 h-1.5 bg-muted rounded-full overflow-hidden flex-shrink-0">
                  <div
                    className={cn(
                      "h-full rounded-full",
                      pct >= 70 ? "bg-green-500" : pct >= 50 ? "bg-amber-500" : "bg-red-500"
                    )}
                    style={{ width: `${Math.min(pct, 100)}%` }}
                  />
                </div>
                {attempt.courseId && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-[10px] rounded-md flex-shrink-0"
                    onClick={() => onViewCourse(attempt.courseId!)}
                  >
                    Voir
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Charts Section ───────────────────────────────────────────────────────────

function AnalyticsCharts({
  courses,
  progressMap,
  quizAttempts,
}: {
  courses: CourseData[];
  progressMap: Record<string, CourseProgressDetail>;
  quizAttempts: QuizAttemptData[];
}) {
  // Course progress data for bar chart
  const courseProgressData = courses
    .slice(0, 8)
    .map((c) => {
      const enrollment = c.enrollments[0];
      return {
        name: c.title.length > 20 ? c.title.substring(0, 18) + "…" : c.title,
        progression: enrollment?.progress || 0,
      };
    });

  // Category distribution for pie chart
  const categoryMap = new Map<string, number>();
  for (const c of courses) {
    const cat = CATEGORY_LABELS[c.category] || c.category;
    categoryMap.set(cat, (categoryMap.get(cat) || 0) + 1);
  }
  const categoryData = Array.from(categoryMap.entries()).map(
    ([name, value]) => ({ name, value })
  );

  // Quiz scores over time for line chart
  const quizScoreData = [...quizAttempts]
    .sort(
      (a, b) =>
        new Date(a.submittedAt).getTime() -
        new Date(b.submittedAt).getTime()
    )
    .slice(0, 10)
    .map((a, idx) => ({
      name: `T${idx + 1}`,
      score: a.maxScore > 0 ? Math.round((a.score / a.maxScore) * 100) : 0,
    }));

  // Time spent per course
  const timeData = courses
    .slice(0, 6)
    .map((c) => {
      const detail = progressMap[c.id];
      return {
        name:
          c.title.length > 15 ? c.title.substring(0, 13) + "…" : c.title,
        minutes: Math.round((detail?.totalTimeSpent || 0) / 60),
      };
    });

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
        <BarChart3 className="w-5 h-5 text-primary" />
        Statistiques
      </h2>

      <Tabs defaultValue="progress" className="w-full">
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="progress" className="text-xs gap-1">
            <TrendingUp className="w-3 h-3" />
            Progression
          </TabsTrigger>
          <TabsTrigger value="time" className="text-xs gap-1">
            <Clock className="w-3 h-3" />
            Temps
          </TabsTrigger>
          <TabsTrigger value="quizzes" className="text-xs gap-1">
            <Trophy className="w-3 h-3" />
            Quiz
          </TabsTrigger>
          <TabsTrigger value="categories" className="text-xs gap-1">
            <PieChartIcon className="w-3 h-3" />
            Catégories
          </TabsTrigger>
        </TabsList>

        <TabsContent value="progress" className="mt-4">
          <Card className="border-border/60">
            <CardContent className="p-4 sm:p-6">
              <p className="text-sm font-medium text-foreground mb-4">
                Progression par cours
              </p>
              {courseProgressData.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={courseProgressData}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 10 }}
                      interval={0}
                      angle={-25}
                      textAnchor="end"
                      height={60}
                    />
                    <YAxis
                      tick={{ fontSize: 11 }}
                      domain={[0, 100]}
                      tickFormatter={(v) => `${v}%`}
                    />
                    <Tooltip
                      formatter={(value: number) => [`${value}%`, "Progression"]}
                      contentStyle={{
                        borderRadius: "8px",
                        fontSize: "12px",
                        border: "1px solid #e5e7eb",
                      }}
                    />
                    <Bar
                      dataKey="progression"
                      fill="#3b82f6"
                      radius={[4, 4, 0, 0]}
                      maxBarSize={40}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[250px] flex items-center justify-center text-sm text-muted-foreground">
                  Aucune donnée disponible
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="time" className="mt-4">
          <Card className="border-border/60">
            <CardContent className="p-4 sm:p-6">
              <p className="text-sm font-medium text-foreground mb-4">
                Temps passé par cours (minutes)
              </p>
              {timeData.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={timeData}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 10 }}
                      interval={0}
                      angle={-25}
                      textAnchor="end"
                      height={60}
                    />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip
                      formatter={(value: number) => [
                        `${value} min`,
                        "Temps passé",
                      ]}
                      contentStyle={{
                        borderRadius: "8px",
                        fontSize: "12px",
                        border: "1px solid #e5e7eb",
                      }}
                    />
                    <Bar
                      dataKey="minutes"
                      fill="#f59e0b"
                      radius={[4, 4, 0, 0]}
                      maxBarSize={40}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[250px] flex items-center justify-center text-sm text-muted-foreground">
                  Aucune donnée disponible
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="quizzes" className="mt-4">
          <Card className="border-border/60">
            <CardContent className="p-4 sm:p-6">
              <p className="text-sm font-medium text-foreground mb-4">
                Scores des quiz (%)
              </p>
              {quizScoreData.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={quizScoreData}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis
                      tick={{ fontSize: 11 }}
                      domain={[0, 100]}
                      tickFormatter={(v) => `${v}%`}
                    />
                    <Tooltip
                      formatter={(value: number) => [
                        `${value}%`,
                        "Score",
                      ]}
                      contentStyle={{
                        borderRadius: "8px",
                        fontSize: "12px",
                        border: "1px solid #e5e7eb",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="score"
                      stroke="#10b981"
                      strokeWidth={2}
                      dot={{ r: 4, fill: "#10b981" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[250px] flex items-center justify-center text-sm text-muted-foreground">
                  Aucune tentative de quiz
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories" className="mt-4">
          <Card className="border-border/60">
            <CardContent className="p-4 sm:p-6">
              <p className="text-sm font-medium text-foreground mb-4">
                Répartition par catégorie
              </p>
              {categoryData.length > 0 ? (
                <div className="flex items-center justify-center">
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={3}
                        dataKey="value"
                        label={({ name, percent }) =>
                          `${name} (${(percent * 100).toFixed(0)}%)`
                        }
                      >
                        {categoryData.map((_, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={CHART_COLORS[index % CHART_COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          borderRadius: "8px",
                          fontSize: "12px",
                          border: "1px solid #e5e7eb",
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-[250px] flex items-center justify-center text-sm text-muted-foreground">
                  Aucune donnée disponible
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

function TraceabilityContent() {
  const { user, navigate } = useAppStore();
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState<CourseData[]>([]);
  const [progressMap, setProgressMap] = useState<
    Record<string, CourseProgressDetail>
  >({});
  const [certificates, setCertificates] = useState<CertificateData[]>([]);
  const [quizAttempts, setQuizAttempts] = useState<QuizAttemptData[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("courses");

  const fetchCourses = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/courses?userId=${user.id}&enrolled=true&page=${page}&limit=5`
      );
      const data = await res.json();
      setCourses(data.courses || []);
      setTotalPages(data.pagination?.totalPages || 1);
    } catch {
      setError("Erreur lors du chargement des cours");
    } finally {
      setLoading(false);
    }
  }, [user, page]);

  const fetchCertificates = useCallback(async () => {
    if (!user) return;
    try {
      const res = await fetch(`/api/certificates?userId=${user.id}`);
      const data = await res.json();
      setCertificates(data.certificates || []);
    } catch {
      // silently fail
    }
  }, [user]);

  const fetchQuizAttempts = useCallback(async () => {
    if (!user) return;
    try {
      // Fetch all quiz attempts for the user from all enrolled courses
      const res = await fetch(
        `/api/courses?userId=${user.id}&enrolled=true&limit=50`
      );
      const data = await res.json();
      const allCourses = data.courses || [];

      // For each course with a quiz, fetch attempts
      const allAttempts: QuizAttemptData[] = [];
      for (const course of allCourses) {
        if (course.quiz) {
          try {
            const resultRes = await fetch(
              `/api/quiz/${course.quiz.id}/result?userId=${user.id}`
            );
            if (resultRes.ok) {
              const resultData = await resultRes.json();
              if (resultData.allAttempts) {
                for (const attempt of resultData.allAttempts) {
                  allAttempts.push({
                    ...attempt,
                    quizTitle: resultData.quiz?.title,
                    courseTitle: course.title,
                    courseId: course.id,
                  });
                }
              }
            }
          } catch {
            // skip
          }
        }
      }

      // Sort by date descending
      allAttempts.sort(
        (a, b) =>
          new Date(b.submittedAt).getTime() -
          new Date(a.submittedAt).getTime()
      );
      setQuizAttempts(allAttempts);
    } catch {
      // silently fail
    }
  }, [user]);

  const fetchProgress = useCallback(
    async (courseId: string) => {
      if (!user || progressMap[courseId]) return;
      try {
        const res = await fetch(
          `/api/courses/${courseId}/progress?userId=${user.id}`
        );
        const data = await res.json();
        setProgressMap((prev) => ({ ...prev, [courseId]: data }));
      } catch {
        // silently fail
      }
    },
    [user, progressMap]
  );

  useEffect(() => {
    fetchCourses();
    fetchCertificates();
    fetchQuizAttempts();
  }, [fetchCourses, fetchCertificates, fetchQuizAttempts]);

  useEffect(() => {
    for (const course of courses) {
      fetchProgress(course.id);
    }
  }, [courses, fetchProgress]);

  const handleViewCourse = (courseId: string, lessonId?: string) => {
    navigate("course-detail", {
      id: courseId,
      ...(lessonId ? { lessonId } : {}),
    });
  };

  // Compute stats
  const inProgressCount = courses.filter(
    (c) => c.enrollments[0]?.status === "en_cours"
  ).length;
  const completedCount = courses.filter(
    (c) => c.enrollments[0]?.status === "termine"
  ).length;

  const totalTimeSpent = Object.values(progressMap).reduce(
    (sum, p) => sum + (p?.totalTimeSpent || 0),
    0
  );

  const activeCerts = certificates.filter((c) => c.status === "ACTIVE");

  const passedQuizzes = quizAttempts.filter(
    (a) => a.status === "REUSSI"
  ).length;
  const avgQuizScore =
    quizAttempts.length > 0
      ? Math.round(
          quizAttempts.reduce((sum, a) => {
            const pct = a.maxScore > 0 ? (a.score / a.maxScore) * 100 : 0;
            return sum + pct;
          }, 0) / quizAttempts.length
        )
      : 0;

  if (loading) return <TraceabilitySkeleton />;
  if (error) {
    return (
      <div className="text-center py-20 animate-fadeIn">
        <p className="text-muted-foreground mb-4">{error}</p>
        <Button variant="outline" onClick={fetchCourses}>
          Réessayer
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Page header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-foreground">
          Ma progression
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Suivez votre parcours d&apos;apprentissage et votre progression
        </p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          icon={BookOpen}
          label="Cours en cours"
          value={inProgressCount}
          colorClass="text-primary"
          bgColor="bg-primary/10"
        />
        <StatCard
          icon={CheckCircle2}
          label="Cours terminés"
          value={completedCount}
          colorClass="text-green-600"
          bgColor="bg-green-100"
        />
        <StatCard
          icon={Clock}
          label="Temps total"
          value={formatTime(totalTimeSpent)}
          colorClass="text-amber-600"
          bgColor="bg-amber-100"
        />
        <StatCard
          icon={Award}
          label="Certificats"
          value={activeCerts.length}
          colorClass="text-amber-500"
          bgColor="bg-amber-50"
        />
      </div>

      {/* Tabs: Courses / Quiz / Charts */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="courses" className="text-xs gap-1.5">
            <GraduationCap className="w-3.5 h-3.5" />
            Mes cours
          </TabsTrigger>
          <TabsTrigger value="quizzes" className="text-xs gap-1.5">
            <Trophy className="w-3.5 h-3.5" />
            Quiz
            {quizAttempts.length > 0 && (
              <Badge
                variant="secondary"
                className="text-[9px] h-4 px-1.5 ml-1"
              >
                {quizAttempts.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="analytics" className="text-xs gap-1.5">
            <BarChart3 className="w-3.5 h-3.5" />
            Statistiques
          </TabsTrigger>
        </TabsList>

        {/* Courses Tab */}
        <TabsContent value="courses" className="mt-4">
          <div>
            {totalPages > 1 && (
              <div className="flex items-center justify-end gap-2 mb-4">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs rounded-lg"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  Précédent
                </Button>
                <span className="text-xs text-muted-foreground">
                  {page} / {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs rounded-lg"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Suivant
                </Button>
              </div>
            )}

            {courses.length === 0 ? (
              <Card className="border-border/60">
                <CardContent className="p-10 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-muted/60 flex items-center justify-center mx-auto mb-4">
                    <TrendingUp className="w-6 h-6 text-muted-foreground/60" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-1">
                    Aucun cours suivi
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Vous n&apos;êtes inscrit à aucun cours pour le moment.
                  </p>
                  <Button
                    className="rounded-lg text-sm"
                    onClick={() => navigate("courses")}
                  >
                    <BookOpen className="w-4 h-4 mr-2" />
                    Explorer le catalogue
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {courses.map((course) => {
                  const detail = progressMap[course.id];
                  if (!detail) {
                    return (
                      <Card key={course.id} className="border-border/60">
                        <CardContent className="p-6 flex items-center justify-center gap-3">
                          <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            Chargement de la progression...
                          </span>
                        </CardContent>
                      </Card>
                    );
                  }
                  const courseQuizAttempts = quizAttempts.filter(
                    (a) => a.courseId === course.id
                  );
                  return (
                    <CourseProgressCard
                      key={course.id}
                      course={course}
                      progressDetail={detail}
                      onViewCourse={handleViewCourse}
                      quizAttempts={courseQuizAttempts}
                    />
                  );
                })}
              </div>
            )}
          </div>

          {/* Certificates Section */}
          {activeCerts.length > 0 && (
            <div className="mt-6">
              <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-500" />
                Mes certificats
              </h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {activeCerts.map((cert) => (
                  <Card
                    key={cert.id}
                    className="border-amber-200/60 bg-gradient-to-br from-amber-50/50 to-transparent"
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
                          <Award className="w-5 h-5 text-amber-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-semibold text-foreground truncate">
                            {cert.courseTitle}
                          </h4>
                          <p className="text-[10px] text-muted-foreground mt-0.5">
                            Score : {cert.score}/{cert.maxScore}
                          </p>
                          <p className="text-[10px] text-muted-foreground mt-0.5">
                            Délivré le{" "}
                            {new Date(cert.issuedAt).toLocaleDateString("fr-FR")}
                          </p>
                          <Badge
                            variant="secondary"
                            className="text-[9px] mt-1.5 bg-amber-100 text-amber-700 font-mono"
                          >
                            {cert.code}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </TabsContent>

        {/* Quiz Tab */}
        <TabsContent value="quizzes" className="mt-4 space-y-6">
          {/* Quiz summary stats */}
          <div className="grid grid-cols-3 gap-3">
            <Card className="border-border/60">
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-foreground">
                  {quizAttempts.length}
                </p>
                <p className="text-[11px] text-muted-foreground">Tentatives</p>
              </CardContent>
            </Card>
            <Card className="border-border/60">
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-green-600">
                  {passedQuizzes}
                </p>
                <p className="text-[11px] text-muted-foreground">Réussis</p>
              </CardContent>
            </Card>
            <Card className="border-border/60">
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-foreground">
                  {avgQuizScore}%
                </p>
                <p className="text-[11px] text-muted-foreground">Score moyen</p>
              </CardContent>
            </Card>
          </div>

          {/* All attempts */}
          {quizAttempts.length > 0 ? (
            <QuizAttemptsSection
              attempts={quizAttempts}
              onViewCourse={(courseId) => handleViewCourse(courseId)}
            />
          ) : (
            <Card className="border-border/60">
              <CardContent className="p-10 text-center">
                <div className="w-14 h-14 rounded-2xl bg-muted/60 flex items-center justify-center mx-auto mb-4">
                  <Trophy className="w-6 h-6 text-muted-foreground/60" />
                </div>
                <h3 className="font-semibold text-foreground mb-1">
                  Aucun quiz passé
                </h3>
                <p className="text-sm text-muted-foreground">
                  Passez des quiz pour suivre votre progression
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="mt-4">
          {courses.length > 0 ? (
            <AnalyticsCharts
              courses={courses}
              progressMap={progressMap}
              quizAttempts={quizAttempts}
            />
          ) : (
            <Card className="border-border/60">
              <CardContent className="p-10 text-center">
                <div className="w-14 h-14 rounded-2xl bg-muted/60 flex items-center justify-center mx-auto mb-4">
                  <BarChart3 className="w-6 h-6 text-muted-foreground/60" />
                </div>
                <h3 className="font-semibold text-foreground mb-1">
                  Aucune donnée
                </h3>
                <p className="text-sm text-muted-foreground">
                  Les statistiques apparaîtront une fois que vous aurez suivi des
                  cours
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function TraceabilitySkeleton() {
  return (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-4 w-72 mt-2" />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-xl" />
        ))}
      </div>
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-64 rounded-xl" />
        ))}
      </div>
    </div>
  );
}

// ─── Exported Page ────────────────────────────────────────────────────────────

export function LearnerTraceabilityPage() {
  const { user, navigate } = useAppStore();
  if (user && (user.role === "ADMIN" || user.role === "FORMATEUR")) {
    return (
      <div className="animate-fadeIn">
        <div className="mb-6">
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">
            Ma progression
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Suivi de parcours d&apos;apprentissage
          </p>
        </div>
        <Card className="border-border/60">
          <CardContent className="p-10 text-center">
            <div className="w-14 h-14 rounded-2xl bg-muted/60 flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="w-6 h-6 text-muted-foreground/60" />
            </div>
            <h3 className="font-semibold text-foreground mb-1">
              {user.role === "ADMIN"
                ? "Espace administrateur"
                : "Espace formateur"}
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              {user.role === "ADMIN"
                ? "En tant qu'administrateur, vous gérez la plateforme. Consultez les statistiques et la traçabilité depuis le tableau de bord."
                : "En tant que formateur, vous créez et gérez les contenus. Consultez la progression de vos apprenants depuis votre tableau de bord."}
            </p>
            <Button
              className="rounded-lg text-sm"
              onClick={() => navigate("dashboard")}
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              Aller au tableau de bord
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  return <TraceabilityContent />;
}
