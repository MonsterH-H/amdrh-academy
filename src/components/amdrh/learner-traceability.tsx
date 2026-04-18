"use client";

import { useEffect, useState, useCallback } from "react";
import { useAppStore } from "@/store/app";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  BookOpen, CheckCircle2, Clock, Award,
  ChevronDown, ChevronUp, ChevronRight, Eye, PlayCircle,
  Loader2, Video, FileText, MousePointerClick, TrendingUp,
  Trophy, Target, Calendar,
} from "lucide-react";
import {
  CATEGORY_LABELS, DIFFICULTY_LABELS, DIFFICULTY_COLORS,
  LESSON_TYPE_LABELS, LESSON_TYPE_COLORS,
} from "@/lib/constants";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────

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

interface CourseProgressDetail {
  enrollment: EnrollmentData & { id: string };
  lessons: Array<{
    id: string;
    title: string;
    type: string;
    duration: number;
    sectionId: string;
    section: { id: string; title: string; order: number };
  }>;
  lessonProgress: LessonProgressData[];
  totalTimeSpent: number;
  quizAttempts: Array<{ id: string; score: number; maxScore: number; status: string; submittedAt: string }>;
  bestQuizScore: number | null;
  quizPassed: boolean;
  passingScore: number;
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

// ─── Helpers ──────────────────────────────────────

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
  return new Date(dateStr).toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}

function getLessonTypeIcon(type: string) {
  switch (type) {
    case "VIDEO": return <Video className="w-3.5 h-3.5" />;
    case "PDF": return <FileText className="w-3.5 h-3.5" />;
    case "INTERACTIF": return <MousePointerClick className="w-3.5 h-3.5" />;
    default: return <FileText className="w-3.5 h-3.5" />;
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

// ─── Stat Card ────────────────────────────────────

function StatCard({
  icon: Icon, label, value, colorClass, bgColor,
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
          <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0", bgColor)}>
            <Icon className={cn("w-5 h-5", colorClass)} />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground leading-tight">{value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Course Card ──────────────────────────────────

function CourseProgressCard({
  course, progressDetail, onViewCourse,
}: {
  course: CourseData;
  progressDetail: CourseProgressDetail;
  onViewCourse: (courseId: string, lessonId?: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);

  const enrollment = course.enrollments[0];
  const progress = enrollment?.progress || 0;
  const isComplete = enrollment?.status === "termine";

  // Flatten all lessons
  const allLessons = course.sections.flatMap((s) => s.lessons);

  // Build lesson progress map
  const lpMap = new Map<string, LessonProgressData>();
  if (progressDetail?.lessonProgress) {
    for (const lp of progressDetail.lessonProgress) {
      lpMap.set(lp.lessonId, lp);
    }
  }

  const completedCount = progressDetail?.lessonProgress.filter((lp) => lp.completed).length || 0;
  const totalCount = allLessons.length;
  const completedLessons = progressDetail?.lessonProgress.filter((lp) => lp.completed) || [];

  // Timeline items from progress data
  const timelineItems: Array<{ icon: typeof CheckCircle2; label: string; time: string; colorClass: string }> = [];

  for (const lp of completedLessons) {
    if (lp.completedAt) {
      const triggerLabel = getCompletionTriggerLabel(lp.completionTrigger);
      timelineItems.push({
        icon: CheckCircle2,
        label: `Leçon "${lp.lesson.title}" complétée (${triggerLabel})`,
        time: timeAgo(lp.completedAt),
        colorClass: "text-green-500",
      });
    }
  }

  if (progressDetail?.quizPassed) {
    const bestAttempt = progressDetail.quizAttempts.find((a) => a.status === "REUSSI");
    if (bestAttempt?.submittedAt) {
      timelineItems.push({
        icon: Trophy,
        label: `Quiz réussi avec ${progressDetail.bestQuizScore}/${progressDetail.passingScore}%`,
        time: timeAgo(bestAttempt.submittedAt),
        colorClass: "text-amber-500",
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

  // Sort timeline by time (most recent first, but reverse for display)
  timelineItems.reverse();

  const visibleLessons = expanded ? allLessons : allLessons.slice(0, 3);

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
            <span>{completedCount}/{totalCount} leçons terminées</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Clock className="w-3.5 h-3.5 flex-shrink-0" />
            <span>{formatTime(progressDetail?.totalTimeSpent || 0)}</span>
          </div>
          {progressDetail?.bestQuizScore !== null && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Target className="w-3.5 h-3.5 flex-shrink-0" />
              <span className={cn(progressDetail.quizPassed ? "text-green-600 font-medium" : "")}>
                {progressDetail.bestQuizScore}% {progressDetail.quizPassed ? "(Réussi)" : ""}
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

        <Separator className="mb-4" />

        {/* Lesson List */}
        <div className="space-y-1.5">
          {visibleLessons.map((lesson) => {
            const lp = lpMap.get(lesson.id);
            const isCompleted = lp?.completed || false;
            const hasProgress = lp && (lp.watchPercentage > 0 || lp.scrollPercentage > 0);

            return (
              <button
                key={lesson.id}
                onClick={() => onViewCourse(course.id, lesson.id)}
                className="w-full flex items-center gap-3 p-2.5 rounded-lg text-left hover:bg-muted/50 transition-colors group"
              >
                {/* Status icon */}
                {isCompleted ? (
                  <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                ) : hasProgress ? (
                  <PlayCircle className="w-4 h-4 text-amber-500 flex-shrink-0" />
                ) : (
                  <div className="w-4 h-4 rounded-full border-2 border-muted-foreground/30 flex-shrink-0" />
                )}

                {/* Lesson info */}
                <div className="flex-1 min-w-0">
                  <p className={cn(
                    "text-xs font-medium truncate",
                    isCompleted ? "text-foreground/70" : "text-foreground"
                  )}>
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

                {/* Progress indicator */}
                {hasProgress && !isCompleted && (
                  <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden flex-shrink-0">
                    <div
                      className="h-full rounded-full bg-amber-400"
                      style={{
                        width: `${Math.max(
                          lesson.type === "VIDEO" ? (lp?.watchPercentage || 0) : (lp?.scrollPercentage || 0),
                          0
                        )}%`,
                      }}
                    />
                  </div>
                )}

                {/* Time spent */}
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

// ─── Main Component ───────────────────────────────

export function LearnerTraceabilityPage() {
  const { user, navigate } = useAppStore();
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState<CourseData[]>([]);
  const [progressMap, setProgressMap] = useState<Record<string, CourseProgressDetail>>({});
  const [certificates, setCertificates] = useState<CertificateData[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [expandedCourseId, setExpandedCourseId] = useState<string | null>(null);
  const [loadingProgress, setLoadingProgress] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchCourses = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/courses?userId=${user.id}&enrolled=true&page=${page}&limit=5`);
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

  const fetchProgress = useCallback(async (courseId: string) => {
    if (!user || progressMap[courseId]) return;
    setLoadingProgress(courseId);
    try {
      const res = await fetch(`/api/courses/${courseId}/progress?userId=${user.id}`);
      const data = await res.json();
      setProgressMap((prev) => ({ ...prev, [courseId]: data }));
    } catch {
      // silently fail
    } finally {
      setLoadingProgress(null);
    }
  }, [user, progressMap]);

  useEffect(() => {
    fetchCourses();
    fetchCertificates();
  }, [fetchCourses, fetchCertificates]);

  // Fetch progress for all loaded courses
  useEffect(() => {
    for (const course of courses) {
      fetchProgress(course.id);
    }
  }, [courses, fetchProgress]);

  const handleViewCourse = (courseId: string, lessonId?: string) => {
    navigate("course-detail", { id: courseId, ...(lessonId ? { lessonId } : {}) });
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

  if (loading) return <TraceabilitySkeleton />;
  if (error) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground mb-4">{error}</p>
        <Button variant="outline" onClick={fetchCourses}>Réessayer</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Page header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-foreground">Ma progression</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Suivez votre parcours d'apprentissage et votre progression
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
          label="Certificats obtenus"
          value={activeCerts.length}
          colorClass="text-amber-500"
          bgColor="bg-amber-50"
        />
      </div>

      {/* Enrolled Courses */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">Mes cours</h2>
          {totalPages > 1 && (
            <div className="flex items-center gap-2">
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
        </div>

        {courses.length === 0 ? (
          <Card className="border-border/60">
            <CardContent className="p-10 text-center">
              <div className="w-14 h-14 rounded-2xl bg-muted/60 flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-6 h-6 text-muted-foreground/60" />
              </div>
              <h3 className="font-semibold text-foreground mb-1">Aucun cours suivi</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Vous n'êtes inscrit à aucun cours pour le moment.
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
                      <span className="text-sm text-muted-foreground">Chargement de la progression...</span>
                    </CardContent>
                  </Card>
                );
              }
              return (
                <CourseProgressCard
                  key={course.id}
                  course={course}
                  progressDetail={detail}
                  onViewCourse={handleViewCourse}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* Certificates Section */}
      {activeCerts.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-4">Mes certificats</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {activeCerts.map((cert) => (
              <Card key={cert.id} className="border-amber-200/60 bg-gradient-to-br from-amber-50/50 to-transparent">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
                      <Award className="w-5 h-5 text-amber-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold text-foreground truncate">{cert.courseTitle}</h4>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        Score: {cert.score}/{cert.maxScore}
                      </p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        Délivré le {new Date(cert.issuedAt).toLocaleDateString("fr-FR")}
                      </p>
                      <Badge variant="secondary" className="text-[9px] mt-1.5 bg-amber-100 text-amber-700">
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
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────

function TraceabilitySkeleton() {
  return (
    <div className="space-y-6">
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
