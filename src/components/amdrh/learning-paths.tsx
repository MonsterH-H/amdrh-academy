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
  GraduationCap,
  BookOpen,
  Clock,
  CheckCircle2,
  Lock,
  ArrowRight,
  Loader2,
  PlayCircle,
  UserCheck,
  ListOrdered,
  Filter,
  Zap,
  Calendar,
} from "lucide-react";
import {
  CATEGORY_LABELS,
  DIFFICULTY_LABELS,
  ROLE_LABELS,
  LEARNING_PATH_MODE_LABELS,
  LEARNING_PATH_MODE_COLORS,
} from "@/lib/constants";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

// ─── Types ────────────────────────────────────────────────────────────────────

interface LearningPathData {
  id: string;
  title: string;
  description: string;
  targetRole: string;
  isMandatory: boolean;
  mode: string;
  totalDuration: number;
  courseCount: number;
  courses: Array<{
    id: string;
    order: number;
    course: {
      id: string;
      title: string;
      category: string;
      difficulty: string;
      duration: number;
      coverImage: string | null;
      instructor: { nom: string; prenom: string } | null;
    };
  }>;
  enrollments: Array<{
    id: string;
    progress: number;
    status: string;
    currentCourseOrder: number;
    startedAt: string;
    completedAt: string | null;
  }>;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const ENROLLMENT_STATUS_LABELS: Record<string, string> = {
  non_inscrit: "Non inscrit",
  en_cours: "En cours",
  termine: "Terminé",
};

const ENROLLMENT_STATUS_COLORS: Record<string, string> = {
  non_inscrit: "bg-gray-100 text-gray-600",
  en_cours: "bg-blue-100 text-blue-700",
  termine: "bg-green-100 text-green-700",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatTotalDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function getRoleGradient(role: string): string {
  switch (role) {
    case "ARBITRE":
      return "from-blue-500 to-blue-600";
    case "ENTRAINEUR":
      return "from-emerald-500 to-emerald-600";
    case "JOUEUR":
      return "from-amber-500 to-amber-600";
    case "FORMATEUR":
      return "from-purple-500 to-purple-600";
    default:
      return "from-gray-500 to-gray-600";
  }
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function LearningPathsPage() {
  const { user, navigate } = useAppStore();
  const [paths, setPaths] = useState<LearningPathData[]>([]);
  const [loading, setLoading] = useState(true);
  const [enrollingPathId, setEnrollingPathId] = useState<string | null>(null);
  const [roleFilter, setRoleFilter] = useState<string>("ALL");

  const fetchPaths = useCallback(async () => {
    if (!user) return;
    try {
      const res = await fetch(
        `/api/learning-paths?userId=${user.id}&role=${user.role}`
      );
      const data = await res.json();
      setPaths(data.paths || []);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchPaths();
  }, [fetchPaths]);

  const handleEnroll = async (pathId: string) => {
    if (!user) return;
    setEnrollingPathId(pathId);
    try {
      const res = await fetch("/api/learning-paths", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, learningPathId: pathId }),
      });
      const data = await res.json();

      if (!res.ok) {
        toast({
          title: "Erreur",
          description: data.error || "Impossible de s'inscrire",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Inscription réussie",
        description: "Vous êtes inscrit au parcours. Bon apprentissage !",
      });

      await fetchPaths();
    } catch {
      toast({
        title: "Erreur réseau",
        description: "Veuillez réessayer",
        variant: "destructive",
      });
    } finally {
      setEnrollingPathId(null);
    }
  };

  const handleContinue = (path: LearningPathData) => {
    const enrollment = path.enrollments?.[0];
    if (!enrollment || !path.courses.length) return;

    const nextCourse = path.courses.find(
      (pc) => pc.order >= enrollment.currentCourseOrder
    );
    const courseId = nextCourse?.course.id || path.courses[0].course.id;
    navigate("course-detail", { id: courseId });
  };

  // Filter logic
  const filteredPaths =
    roleFilter === "ALL"
      ? paths
      : paths.filter((p) => p.targetRole === roleFilter);

  // Unique roles from available paths
  const availableRoles = [...new Set(paths.map((p) => p.targetRole))];

  // Stats
  const enrolledCount = paths.filter(
    (p) => p.enrollments && p.enrollments.length > 0
  ).length;
  const completedCount = paths.filter(
    (p) => p.enrollments?.[0]?.status === "termine"
  ).length;

  if (loading) return <LearningPathsSkeleton />;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-foreground">
          Parcours de formation
        </h2>
        <p className="text-muted-foreground mt-1">
          Suivez les parcours recommandés pour votre profil{" "}
          <span className="font-medium text-foreground">
            {ROLE_LABELS[user?.role || "ARBITRE"]}
          </span>
        </p>
      </div>

      {/* Stats row */}
      {paths.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          <Card className="border-border/60">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <GraduationCap className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-xl font-bold text-foreground">
                  {paths.length}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  Parcours disponible{paths.length > 1 ? "s" : ""}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/60">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
                <PlayCircle className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xl font-bold text-foreground">
                  {enrolledCount}
                </p>
                <p className="text-[11px] text-muted-foreground">Inscrit</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/60">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-xl font-bold text-foreground">
                  {completedCount}
                </p>
                <p className="text-[11px] text-muted-foreground">Terminé</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Role filter */}
      {availableRoles.length > 1 && (
        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <Badge
            variant={roleFilter === "ALL" ? "default" : "outline"}
            className="cursor-pointer text-[10px] rounded-lg px-3 py-1"
            onClick={() => setRoleFilter("ALL")}
          >
            Tous les profils
          </Badge>
          {availableRoles.map((role) => (
            <Badge
              key={role}
              variant={roleFilter === role ? "default" : "outline"}
              className="cursor-pointer text-[10px] rounded-lg px-3 py-1"
              onClick={() => setRoleFilter(role)}
            >
              {ROLE_LABELS[role] || role}
            </Badge>
          ))}
        </div>
      )}

      {/* Empty state */}
      {paths.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 rounded-2xl bg-muted/60 flex items-center justify-center mx-auto mb-4">
            <GraduationCap className="w-8 h-8 text-muted-foreground/40" />
          </div>
          <h3 className="font-semibold text-foreground mb-2">
            Aucun parcours disponible
          </h3>
          <p className="text-sm text-muted-foreground">
            Consultez le catalogue pour vous inscrire à des cours
          </p>
          <Button className="mt-4 rounded-lg" onClick={() => navigate("courses")}>
            <BookOpen className="w-4 h-4 mr-2" />
            Explorer le catalogue
          </Button>
        </div>
      ) : filteredPaths.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-sm text-muted-foreground">
            Aucun parcours ne correspond à ce filtre.
          </p>
          <Button
            variant="outline"
            size="sm"
            className="mt-3 rounded-lg"
            onClick={() => setRoleFilter("ALL")}
          >
            Réinitialiser le filtre
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredPaths.map((path) => {
            const enrollment = path.enrollments?.[0];
            const progress = enrollment ? enrollment.progress : 0;
            const enrollmentStatus = enrollment
              ? enrollment.status
              : "non_inscrit";
            const isEnrolling = enrollingPathId === path.id;
            const roleGradient = getRoleGradient(path.targetRole);

            return (
              <Card
                key={path.id}
                className={cn(
                  "border-border/60 overflow-hidden",
                  enrollment && enrollmentStatus === "termine" && "border-green-200"
                )}
              >
                <CardContent className="p-6">
                  {/* Top gradient bar for enrolled */}
                  {enrollment && enrollmentStatus === "en_cours" && (
                    <div
                      className={cn(
                        "-mx-6 -mt-6 mb-4 h-1.5 bg-gradient-to-r",
                        roleGradient
                      )}
                    />
                  )}
                  {enrollment && enrollmentStatus === "termine" && (
                    <div className="-mx-6 -mt-6 mb-4 h-1.5 bg-gradient-to-r from-green-400 to-green-600" />
                  )}

                  {/* Header row */}
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <Badge
                          variant="secondary"
                          className="text-[10px] gap-1"
                        >
                          <GraduationCap className="w-3 h-3" />
                          {ROLE_LABELS[path.targetRole || "ARBITRE"]}
                        </Badge>
                        {path.isMandatory && (
                          <Badge className="bg-red-100 text-red-700 text-[10px] gap-1">
                            <Zap className="w-3 h-3" />
                            Obligatoire
                          </Badge>
                        )}
                        <Badge
                          variant="secondary"
                          className={cn(
                            "text-[10px]",
                            LEARNING_PATH_MODE_COLORS[path.mode] || ""
                          )}
                        >
                          {LEARNING_PATH_MODE_LABELS[path.mode] || path.mode}
                        </Badge>
                        <Badge
                          className={cn(
                            "text-[10px]",
                            ENROLLMENT_STATUS_COLORS[enrollmentStatus]
                          )}
                        >
                          {enrollmentStatus === "non_inscrit" && (
                            <UserCheck className="w-3 h-3 mr-1" />
                          )}
                          {enrollmentStatus === "en_cours" && (
                            <PlayCircle className="w-3 h-3 mr-1" />
                          )}
                          {enrollmentStatus === "termine" && (
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                          )}
                          {ENROLLMENT_STATUS_LABELS[enrollmentStatus]}
                        </Badge>
                      </div>
                      <h3 className="text-lg font-bold text-foreground">
                        {path.title}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                        {path.description}
                      </p>
                    </div>

                    {/* Right side: progress or action */}
                    <div className="flex flex-col items-end gap-2 flex-shrink-0">
                      {enrollment && (
                        <div className="text-right">
                          <p className="text-2xl font-bold text-primary">
                            {Math.round(progress)}%
                          </p>
                          <p className="text-[10px] text-muted-foreground">
                            Progression
                          </p>
                        </div>
                      )}

                      {!enrollment && (
                        <Button
                          size="sm"
                          disabled={isEnrolling}
                          onClick={() => handleEnroll(path.id)}
                          className="gap-2 rounded-lg"
                        >
                          {isEnrolling ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <UserCheck className="w-4 h-4" />
                          )}
                          {isEnrolling
                            ? "Inscription..."
                            : "S'inscrire"}
                        </Button>
                      )}

                      {enrollment && enrollmentStatus === "en_cours" && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-2 rounded-lg"
                          onClick={() => handleContinue(path)}
                        >
                          <PlayCircle className="w-4 h-4" />
                          Continuer
                        </Button>
                      )}

                      {enrollment && enrollmentStatus === "termine" && (
                        <Badge className="bg-green-100 text-green-700 gap-1 px-3 py-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Parcours terminé
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Meta info row */}
                  <div className="flex items-center gap-4 mb-4 text-xs text-muted-foreground flex-wrap">
                    <span className="flex items-center gap-1">
                      <ListOrdered className="w-3.5 h-3.5" />
                      {path.courseCount}{" "}
                      {path.courseCount > 1 ? "cours" : "cours"}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {formatTotalDuration(path.totalDuration)}
                    </span>
                    {enrollment?.startedAt && (
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        Commencé le {formatDate(enrollment.startedAt)}
                      </span>
                    )}
                  </div>

                  {/* Progress bar */}
                  {enrollment && (
                    <Progress value={progress} className="h-2 mb-6" />
                  )}

                  {/* Timeline */}
                  <Separator className="mb-4" />
                  <div className="relative">
                    <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-border" />
                    <div className="space-y-3">
                      {path.courses.map((pc, i) => {
                        const isUnlocked =
                          !enrollment ||
                          i <= (enrollment.currentCourseOrder || 0);
                        const isCurrentCourse =
                          enrollment &&
                          i === enrollment.currentCourseOrder;
                        const isCompleted =
                          enrollment &&
                          enrollmentStatus === "termine";
                        return (
                          <div
                            key={pc.id}
                            className="relative flex items-start gap-4"
                          >
                            <div
                              className={cn(
                                "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 z-10 border-2 transition-all",
                                isCurrentCourse
                                  ? "bg-primary text-white border-primary ring-4 ring-primary/20"
                                  : isUnlocked
                                    ? isCompleted
                                      ? "bg-green-500 text-white border-green-500"
                                      : "bg-primary text-white border-primary"
                                    : "bg-muted text-muted-foreground border-muted"
                              )}
                            >
                              {isUnlocked ? (
                                <CheckCircle2 className="w-5 h-5" />
                              ) : (
                                <Lock className="w-4 h-4" />
                              )}
                            </div>
                            <div
                              className={cn(
                                "flex-1 p-3 rounded-lg border border-border/60 transition-all",
                                isUnlocked
                                  ? "hover:shadow-sm cursor-pointer"
                                  : "opacity-50",
                                isCurrentCourse &&
                                  "border-primary/50 bg-primary/5"
                              )}
                              onClick={() =>
                                isUnlocked &&
                                navigate("course-detail", {
                                  id: pc.course.id,
                                })
                              }
                            >
                              <div className="flex items-center gap-2 mb-1 flex-wrap">
                                <Badge
                                  variant="outline"
                                  className="text-[10px]"
                                >
                                  {CATEGORY_LABELS[
                                    pc.course.category || "ARBITRAGE"
                                  ]}
                                </Badge>
                                <Badge
                                  variant="outline"
                                  className="text-[10px]"
                                >
                                  {DIFFICULTY_LABELS[
                                    pc.course.difficulty || "DEBUTANT"
                                  ]}
                                </Badge>
                                <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                                  <Clock className="w-3 h-3" />{" "}
                                  {pc.course.duration} min
                                </span>
                              </div>
                              <p className="text-sm font-medium text-foreground">
                                {pc.course.title}
                              </p>
                              {isCurrentCourse && (
                                <p className="text-[10px] text-primary font-medium mt-1 flex items-center gap-1">
                                  <ArrowRight className="w-3 h-3" />
                                  Cours en cours
                                </p>
                              )}
                              {isCompleted && i < path.courses.length - 1 && (
                                <p className="text-[10px] text-green-600 font-medium mt-1 flex items-center gap-1">
                                  <CheckCircle2 className="w-3 h-3" />
                                  Complété
                                </p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function LearningPathsSkeleton() {
  return (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-64 mt-2" />
      </div>
      <div className="grid grid-cols-3 gap-3">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-20 rounded-xl" />
        ))}
      </div>
      {[...Array(2)].map((_, i) => (
        <Skeleton key={i} className="h-72 rounded-xl" />
      ))}
    </div>
  );
}
