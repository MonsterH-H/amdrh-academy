"use client";

import { useEffect, useState, useCallback } from "react";
import { useAppStore } from "@/store/app";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  BookOpen,
  Users,
  HelpCircle,
  TrendingUp,
  FolderOpen,
  Plus,
  AlertCircle,
  RotateCcw,
  GraduationCap,
  ArrowRight,
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
} from "lucide-react";
import { StatCard } from "@/modules/shared/components/stat-card";
import {
  ROLE_LABELS,
  COURSE_STATUS_LABELS,
  COURSE_STATUS_COLORS,
  CATEGORY_LABELS,
  DIFFICULTY_LABELS,
  QUIZ_STATUS_LABELS,
  QUIZ_STATUS_COLORS,
} from "@/lib/constants";

// ─── Types ───────────────────────────────────────────────────────────────────

interface FormateurStats {
  totalCourses: number;
  totalEnrollments: number;
  avgCompletion: number;
  totalQuizzes: number;
  totalResources: number;
  passedQuizzes: number;
  avgScore: number;
  avgPassRate: number;
  pendingReviews: number;
}

interface FormateurCourse {
  id: string;
  title: string;
  category: string;
  difficulty: string;
  duration: number;
  status: string;
  isCertifying: boolean;
  enrollmentCount: number;
  avgScore: number;
  completionRate: number;
  passRate: number;
  completedCount: number;
}

interface RecentActivity {
  id: string;
  type: "quiz" | "completion";
  status: string;
  score: number;
  timestamp: number;
  user: {
    id: string;
    prenom: string;
    nom: string;
    avatar?: string | null;
  };
  quizTitle: string | null;
  courseTitle: string;
  courseId: string;
  duration: number;
  progress?: number;
}

interface DashboardData {
  type: string;
  stats: FormateurStats;
  myCourses: FormateurCourse[];
  recentLearners: Array<Record<string, unknown>>;
  recentActivity: RecentActivity[];
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDateFR(date: Date): string {
  return date.toLocaleDateString("fr-FR", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function timeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return "À l'instant";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `Il y a ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `Il y a ${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `Il y a ${days}j`;
  return `Il y a ${Math.floor(days / 7)} sem.`;
}

// ─── Main Component ──────────────────────────────────────────────────────────

export function FormateurDashboardPage() {
  const { user, navigate } = useAppStore();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [currentDate] = useState(new Date());

  const fetchDashboard = useCallback(async () => {
    if (!user) return;
    try {
      const res = await fetch(
        `/api/dashboard?role=FORMATEUR&userId=${user.id}`
      );
      if (!res.ok) throw new Error("Erreur");
      const json = await res.json();
      setData(json);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  // ─── Error State ─────────────────────────────────────────────────────────
  if (loading) return <FormateurDashboardSkeleton />;
  if (error) {
    return (
      <div className="text-center py-20 animate-fadeIn">
        <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
        <h3 className="font-semibold text-foreground mb-2">
          Erreur de chargement
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          Impossible de charger le tableau de bord
        </p>
        <Button
          variant="outline"
          onClick={() => {
            setError(false);
            setLoading(true);
            fetchDashboard();
          }}
        >
          <RotateCcw className="w-3.5 h-3.5 mr-2" />
          Réessayer
        </Button>
      </div>
    );
  }
  if (!data || !user?.id) return null;

  const { stats, myCourses, recentActivity } = data;
  const today = formatDateFR(currentDate);

  // Pending reviews (courses in BROUILLON or EN_REVISION)
  const pendingCourses = myCourses.filter(
    (c) => c.status === "BROUILLON" || c.status === "EN_REVISION"
  );

  // Quiz attempts only
  const quizResults = recentActivity.filter((a) => a.type === "quiz");

  // ─── KPI Cards ───────────────────────────────────────────────────────────
  const kpiCards = [
    {
      label: "Mes Cours",
      value: stats.totalCourses,
      icon: BookOpen,
      colorClass: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      label: "Apprenants actifs",
      value: stats.totalEnrollments,
      icon: Users,
      colorClass: "text-blue-600",
      bgColor: "bg-blue-500/10",
    },
    {
      label: "Quiz créés",
      value: stats.totalQuizzes,
      icon: HelpCircle,
      colorClass: "text-amber-600",
      bgColor: "bg-amber-500/10",
    },
    {
      label: "Taux de réussite",
      value: `${stats.avgPassRate}%`,
      icon: TrendingUp,
      colorClass: "text-violet-600",
      bgColor: "bg-violet-500/10",
    },
    {
      label: "Ressources partagées",
      value: stats.totalResources,
      icon: FolderOpen,
      colorClass: "text-rose-600",
      bgColor: "bg-rose-500/10",
    },
  ];

  // ─── Render ──────────────────────────────────────────────────────────────
  return (
    <div className="space-y-8 animate-fadeIn">
      {/* ── Welcome Section ──────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h2 className="text-2xl font-bold text-foreground">
              Bonjour, {user.prenom || "Formateur"} 👋
            </h2>
            <Badge className="bg-primary/10 text-primary border-0 text-xs">
              <GraduationCap className="w-3 h-3 mr-1" />
              {ROLE_LABELS[user.role] || "Formateur"}
            </Badge>
          </div>
          <p className="text-muted-foreground capitalize">{today}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 text-xs"
            onClick={() => navigate("admin-courses")}
          >
            <BookOpen className="w-3.5 h-3.5" />
            Gérer mes cours
          </Button>
        </div>
      </div>

      {/* ── KPI Cards ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 stagger-children">
        {kpiCards.map((kpi) => (
          <StatCard
            key={kpi.label}
            label={kpi.label}
            value={kpi.value}
            icon={kpi.icon}
            colorClass={kpi.colorClass}
            bgColor={kpi.bgColor}
          />
        ))}
      </div>

      {/* ── Main Content Grid ───────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ─── My Recent Courses (2/3 width) ─────────────────────────────── */}
        <Card className="lg:col-span-2 border-border/60">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-primary" />
                Mes cours récents
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-muted-foreground"
                onClick={() => navigate("admin-courses")}
              >
                Voir tout
                <ArrowRight className="ml-1 w-3 h-3" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            {myCourses.length === 0 ? (
              <div className="text-center py-12">
                <BookOpen className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">
                  Aucun cours créé pour le moment
                </p>
                <Button
                  size="sm"
                  className="mt-4 gap-1.5"
                  onClick={() => navigate("course-create")}
                >
                  <Plus className="w-3.5 h-3.5" />
                  Créer mon premier cours
                </Button>
              </div>
            ) : (
              <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1 custom-scrollbar">
                {myCourses.slice(0, 6).map((course) => (
                  <div
                    key={course.id}
                    className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer group"
                    onClick={() =>
                      navigate("course-detail", { id: course.id })
                    }
                  >
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/15 transition-colors">
                      <FileText className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <h4 className="text-sm font-medium text-foreground truncate">
                          {course.title}
                        </h4>
                        {course.isCertifying && (
                          <CheckCircle2 className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Badge
                          variant="secondary"
                          className={`text-[10px] px-1.5 py-0 ${COURSE_STATUS_COLORS[course.status] || "bg-gray-100 text-gray-700"}`}
                        >
                          {COURSE_STATUS_LABELS[course.status] || course.status}
                        </Badge>
                        <span className="flex items-center gap-0.5">
                          <Users className="w-3 h-3" />
                          {course.enrollmentCount}
                        </span>
                        <span className="flex items-center gap-0.5">
                          <Clock className="w-3 h-3" />
                          {course.duration} min
                        </span>
                        <span>{CATEGORY_LABELS[course.category] || course.category}</span>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0 hidden sm:block">
                      <div className="text-sm font-semibold text-foreground">
                        {course.completionRate}%
                      </div>
                      <div className="text-[10px] text-muted-foreground">
                        Progression moy.
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground/40 group-hover:text-muted-foreground transition-colors hidden sm:block" />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* ─── Sidebar (1/3 width) ──────────────────────────────────────── */}
        <div className="space-y-6">
          {/* ── Quick Actions ───────────────────────────────────────────── */}
          <Card className="border-border/60">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Plus className="w-4 h-4 text-primary" />
                Actions rapides
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 space-y-2">
              <Button
                variant="outline"
                className="w-full justify-start gap-2 h-10 cursor-pointer"
                onClick={() => navigate("course-create")}
              >
                <BookOpen className="w-4 h-4 text-primary" />
                <div className="text-left">
                  <div className="text-sm font-medium">Créer un cours</div>
                  <div className="text-[10px] text-muted-foreground">
                    Nouveau contenu de formation
                  </div>
                </div>
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start gap-2 h-10 cursor-pointer"
                onClick={() => navigate("admin-quizzes")}
              >
                <HelpCircle className="w-4 h-4 text-amber-600" />
                <div className="text-left">
                  <div className="text-sm font-medium">Créer un quiz</div>
                  <div className="text-[10px] text-muted-foreground">
                    Évaluation et exercices
                  </div>
                </div>
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start gap-2 h-10 cursor-pointer"
                onClick={() => navigate("admin-resources")}
              >
                <FolderOpen className="w-4 h-4 text-rose-600" />
                <div className="text-left">
                  <div className="text-sm font-medium">
                    Téléverser une ressource
                  </div>
                  <div className="text-[10px] text-muted-foreground">
                    Documents et médias
                  </div>
                </div>
              </Button>
            </CardContent>
          </Card>

          {/* ── Pending Reviews ─────────────────────────────────────────── */}
          <Card className="border-border/60">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Loader2 className="w-4 h-4 text-amber-500" />
                  En attente de validation
                </CardTitle>
                {pendingCourses.length > 0 && (
                  <Badge className="bg-amber-100 text-amber-700 border-0 text-[10px]">
                    {pendingCourses.length}
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              {pendingCourses.length === 0 ? (
                <div className="text-center py-6">
                  <CheckCircle2 className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                  <p className="text-xs text-muted-foreground">
                    Tous vos cours sont publiés ou validés
                  </p>
                </div>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto pr-1 custom-scrollbar">
                  {pendingCourses.map((course) => (
                    <div
                      key={course.id}
                      className="flex items-center gap-3 p-2.5 rounded-lg bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/40 dark:border-amber-800/30 cursor-pointer hover:bg-amber-50 dark:hover:bg-amber-950/40 transition-colors"
                      onClick={() =>
                        navigate("course-detail", { id: course.id })
                      }
                    >
                      <FileText className="w-4 h-4 text-amber-600 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {course.title}
                        </p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <Badge
                            variant="secondary"
                            className={`text-[10px] px-1.5 py-0 ${COURSE_STATUS_COLORS[course.status] || ""}`}
                          >
                            {COURSE_STATUS_LABELS[course.status] || course.status}
                          </Badge>
                          <span className="text-[10px] text-muted-foreground">
                            {DIFFICULTY_LABELS[course.difficulty] || course.difficulty}
                          </span>
                        </div>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-muted-foreground/40" />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ── Recent Quiz Results ──────────────────────────────────────────── */}
      <Card className="border-border/60">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-violet-600" />
              Résultats de quiz récents
            </CardTitle>
            {quizResults.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-muted-foreground"
                onClick={() => navigate("admin-quizzes")}
              >
                Voir les quiz
                <ArrowRight className="ml-1 w-3 h-3" />
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          {quizResults.length === 0 ? (
            <div className="text-center py-10">
              <HelpCircle className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">
                Aucune tentative de quiz enregistrée
              </p>
              <p className="text-xs text-muted-foreground/70 mt-1">
                Les résultats apparaîtront ici une fois que les apprenants auront
                passé vos quiz
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto -mx-4 px-4">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border/40">
                    <th className="text-left text-xs font-medium text-muted-foreground pb-2 pr-4">
                      Apprenant
                    </th>
                    <th className="text-left text-xs font-medium text-muted-foreground pb-2 pr-4 hidden sm:table-cell">
                      Quiz
                    </th>
                    <th className="text-left text-xs font-medium text-muted-foreground pb-2 pr-4 hidden md:table-cell">
                      Cours
                    </th>
                    <th className="text-center text-xs font-medium text-muted-foreground pb-2 pr-4">
                      Score
                    </th>
                    <th className="text-center text-xs font-medium text-muted-foreground pb-2">
                      Statut
                    </th>
                    <th className="text-right text-xs font-medium text-muted-foreground pb-2">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30">
                  {quizResults.slice(0, 8).map((result) => (
                    <tr
                      key={result.id}
                      className="hover:bg-muted/30 transition-colors"
                    >
                      <td className="py-3 pr-4">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center text-xs font-medium text-muted-foreground">
                            {result.user.prenom[0]}
                            {result.user.nom[0]}
                          </div>
                          <span className="text-sm text-foreground font-medium">
                            {result.user.prenom} {result.user.nom}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 pr-4 hidden sm:table-cell">
                        <span className="text-sm text-foreground/80">
                          {result.quizTitle || "—"}
                        </span>
                      </td>
                      <td className="py-3 pr-4 hidden md:table-cell">
                        <span className="text-sm text-muted-foreground">
                          {result.courseTitle}
                        </span>
                      </td>
                      <td className="py-3 pr-4 text-center">
                        <span
                          className={`text-sm font-semibold ${
                            result.score >= 70
                              ? "text-blue-600"
                              : result.score >= 50
                                ? "text-amber-600"
                                : "text-red-600"
                          }`}
                        >
                          {result.score}%
                        </span>
                      </td>
                      <td className="py-3 pr-4 text-center">
                        <Badge
                          variant="secondary"
                          className={`text-[10px] px-1.5 py-0 ${QUIZ_STATUS_COLORS[result.status] || "bg-gray-100 text-gray-700"}`}
                        >
                          {result.status === "REUSSI" ? (
                            <CheckCircle2 className="w-3 h-3 mr-0.5" />
                          ) : result.status === "ECHOUE" ? (
                            <XCircle className="w-3 h-3 mr-0.5" />
                          ) : null}
                          {QUIZ_STATUS_LABELS[result.status] || result.status}
                        </Badge>
                      </td>
                      <td className="py-3 text-right">
                        <span className="text-xs text-muted-foreground">
                          {timeAgo(result.timestamp)}
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

      {/* ── Completion Stats Overview ────────────────────────────────────── */}
      {stats.avgCompletion > 0 && (
        <Card className="border-border/60">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-600" />
              Vue d&apos;ensemble des cours
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {myCourses
                .filter((c) => c.status === "PUBLIE" && c.enrollmentCount > 0)
                .slice(0, 6)
                .map((course) => (
                  <div
                    key={course.id}
                    className="space-y-2 p-3 rounded-lg bg-muted/30 cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() =>
                      navigate("course-detail", { id: course.id })
                    }
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-foreground truncate mr-2">
                        {course.title}
                      </span>
                      <Badge
                        variant="secondary"
                        className="text-[10px] px-1.5 py-0 flex-shrink-0 bg-primary/10 text-primary"
                      >
                        {course.enrollmentCount} inscrits
                      </Badge>
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-[11px] text-muted-foreground">
                        <span>Progression moyenne</span>
                        <span className="font-medium text-foreground">
                          {course.completionRate}%
                        </span>
                      </div>
                      <Progress value={course.completionRate} className="h-1.5" />
                    </div>
                    <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-blue-500" />
                        {course.passRate}% réussite
                      </span>
                      {course.completedCount > 0 && (
                        <span className="flex items-center gap-1">
                          <GraduationCap className="w-3 h-3 text-amber-500" />
                          {course.completedCount} terminés
                        </span>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ─── Loading Skeleton ────────────────────────────────────────────────────────

function FormateurDashboardSkeleton() {
  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Welcome skeleton */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <Skeleton className="h-8 w-52" />
            <Skeleton className="h-6 w-24 rounded-full" />
          </div>
          <Skeleton className="h-4 w-72" />
        </div>
        <Skeleton className="h-9 w-36 hidden sm:block" />
      </div>

      {/* KPI Cards skeleton */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-xl" />
        ))}
      </div>

      {/* Main grid skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Courses list skeleton */}
        <Skeleton className="lg:col-span-2 h-[480px] rounded-xl" />

        {/* Sidebar skeleton */}
        <div className="space-y-6">
          <Skeleton className="h-48 rounded-xl" />
          <Skeleton className="h-52 rounded-xl" />
        </div>
      </div>

      {/* Quiz results skeleton */}
      <Skeleton className="h-64 rounded-xl" />

      {/* Course overview skeleton */}
      <Skeleton className="h-48 rounded-xl" />
    </div>
  );
}
