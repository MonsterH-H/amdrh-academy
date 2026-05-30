"use client";

import { useEffect, useState, useCallback } from "react";
import { useAppStore } from "@/store/app";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  BookOpen, Users, Award, TrendingUp, ClipboardCheck, Clock,
  CheckCircle2, XCircle, Eye,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { QUIZ_STATUS_LABELS, QUIZ_STATUS_COLORS, COURSE_STATUS_LABELS, COURSE_STATUS_COLORS } from "@/lib/constants";
import { StatCard } from "@/modules/shared/components/stat-card";

// ─── Types ───────────────────────────────────────────────────────────────────

interface FormateurStats {
  totalCourses: number;
  totalEnrollments: number;
  avgCompletion: number;
  avgScore: number;
  avgPassRate: number;
  pendingReviews: number;
  passedQuizzes: number;
}

interface CourseInfo {
  id: string;
  title: string;
  category: string;
  difficulty: string;
  status: string;
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
  user: { id: string; prenom: string; nom: string; avatar: string | null };
  quizTitle: string | null;
  courseTitle: string;
  courseId: string;
  duration: number;
  progress?: number;
}

interface DashboardData {
  stats: FormateurStats;
  myCourses: CourseInfo[];
  recentActivity: RecentActivity[];
}

// ─── Main Component ──────────────────────────────────────────────────────────

export function FormateurDashboard() {
  const { user, navigate } = useAppStore();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchDashboard = useCallback(async () => {
    if (!user) return;
    try {
      const res = await fetch(`/api/dashboard?userId=${user.id}&role=FORMATEUR`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setData(json);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { fetchDashboard(); }, [fetchDashboard]);

  if (loading) return <FormateurDashboardSkeleton />;
  if (!user) return <FormateurDashboardSkeleton />;
  if (error || !data) {
    return (
      <div className="text-center py-20 animate-fadeIn">
        <Clock className="w-10 h-10 text-muted-foreground/40 mx-auto mb-4" />
        <h3 className="font-semibold text-foreground mb-2">Erreur de chargement</h3>
        <p className="text-sm text-muted-foreground mb-4">Impossible de charger le tableau de bord formateur.</p>
        <Button variant="outline" size="sm" onClick={() => { setError(false); setLoading(true); fetchDashboard(); }} className="gap-2">
          Réessayer
        </Button>
      </div>
    );
  }

  const { stats, myCourses, recentActivity } = data;

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Welcome */}
      <div>
        <h2 className="text-2xl font-bold text-foreground">
          Tableau de bord formateur
        </h2>
        <p className="text-muted-foreground mt-1">
          Bienvenue, {user.prenom} ! Voici un aperçu de vos formations.
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={BookOpen} label="Mes formations" value={stats.totalCourses} colorClass="text-sky-600" bgColor="bg-gradient-to-br from-sky-50 to-sky-100/60 dark:from-sky-500/10 dark:to-sky-500/5" />
        <StatCard icon={Users} label="Total inscrits" value={stats.totalEnrollments} colorClass="text-blue-600" bgColor="bg-gradient-to-br from-blue-50 to-blue-100/60 dark:from-blue-500/10 dark:to-blue-500/5" />
        <StatCard icon={TrendingUp} label="Complétion moy." value={`${stats.avgCompletion}%`} colorClass="text-amber-600" bgColor="bg-gradient-to-br from-amber-50 to-amber-100/60 dark:from-amber-500/10 dark:to-amber-500/5" />
        <StatCard icon={Award} label="Score moyen quiz" value={`${stats.avgScore}%`} colorClass="text-violet-600" bgColor="bg-gradient-to-br from-violet-50 to-violet-100/60 dark:from-violet-500/10 dark:to-violet-500/5" />
      </div>

      {/* Two-column layout */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Submissions / Activity */}
        <div className="lg:col-span-2">
          <Card className="border-border/60">
            <CardContent className="p-6">
              <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                <ClipboardCheck className="w-4 h-4 text-primary" /> Activité récente des apprenants
              </h3>
              {recentActivity.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">Aucune activité récente</p>
              ) : (
                <div className="space-y-2 max-h-80 overflow-y-auto">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/30 transition-colors">
                      <Avatar className="w-8 h-8 shrink-0">
                        <AvatarFallback className="text-[10px] font-bold bg-primary/10 text-primary">
                          {activity.user.prenom.charAt(0)}{activity.user.nom.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {activity.user.prenom} {activity.user.nom}
                        </p>
                        <p className="text-[11px] text-muted-foreground truncate">
                          {activity.type === "quiz" ? activity.quizTitle : "A complété"} — {activity.courseTitle}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        {activity.type === "quiz" ? (
                          <Badge variant="secondary" className={cn("text-[10px]", QUIZ_STATUS_COLORS[activity.status] || "bg-muted text-foreground")}>
                            {activity.score}%
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="text-[10px] bg-blue-50 dark:bg-blue-500/10 text-blue-700">
                            Complété
                          </Badge>
                        )}
                        <p className="text-[9px] text-muted-foreground mt-0.5">
                          {new Date(activity.timestamp).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Pending Reviews + Quick Info */}
        <div className="space-y-6">
          {stats.pendingReviews > 0 && (
            <Card className="border-amber-200 dark:border-amber-500/30 bg-amber-50/50 dark:bg-amber-500/5">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-500/20 flex items-center justify-center">
                    <Clock className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-lg font-bold text-foreground">{stats.pendingReviews}</p>
                    <p className="text-xs text-muted-foreground">Formation(s) en attente de révision</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Pass Rate Card */}
          <Card className="border-border/60">
            <CardContent className="p-4">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Taux de réussite quiz</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-foreground font-medium">{stats.avgPassRate}%</span>
                  <span className="text-xs text-muted-foreground">{stats.passedQuizzes} réussi(s)</span>
                </div>
                <Progress value={stats.avgPassRate} className="h-2" />
              </div>
            </CardContent>
          </Card>

          {/* Quick actions */}
          <Card className="border-border/60">
            <CardContent className="p-4">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Actions rapides</h4>
              <div className="space-y-2">
                <Button variant="outline" size="sm" className="w-full justify-start rounded-lg text-xs gap-2" onClick={() => navigate("course-create")}>
                  <BookOpen className="w-3.5 h-3.5" /> Créer une formation
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start rounded-lg text-xs gap-2" onClick={() => navigate("admin-courses")}>
                  <Eye className="w-3.5 h-3.5" /> Voir mes cours
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start rounded-lg text-xs gap-2" onClick={() => navigate("admin-quizzes")}>
                  <ClipboardCheck className="w-3.5 h-3.5" /> Gérer les quiz
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Course Performance */}
      {myCourses.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary" /> Performance par formation
          </h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {myCourses.map((course) => (
              <Card key={course.id} className="border-border/60 hover:shadow-sm transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-foreground truncate">{course.title}</p>
                      <Badge variant="secondary" className={cn("text-[9px] mt-1", COURSE_STATUS_COLORS[course.status] || "bg-muted text-foreground")}>
                        {COURSE_STATUS_LABELS[course.status] || course.status}
                      </Badge>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">{course.enrollmentCount} inscrit(s)</span>
                      <span className="text-muted-foreground">{course.completedCount} terminé(s)</span>
                    </div>
                    <div>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-muted-foreground">Complétion</span>
                        <span className="font-medium text-foreground">{course.completionRate}%</span>
                      </div>
                      <Progress value={course.completionRate} className="h-1.5" />
                    </div>
                    <div>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-muted-foreground">Score quiz</span>
                        <span className="font-medium text-foreground">{course.avgScore}%</span>
                      </div>
                      <Progress value={course.avgScore} className="h-1.5" />
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Taux réussite</span>
                      <span className={cn("font-medium", course.passRate >= 70 ? "text-blue-600" : "text-amber-600")}>{course.passRate}%</span>
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

// ─── Skeleton ────────────────────────────────────────────────────────────────

function FormateurDashboardSkeleton() {
  return (
    <div className="space-y-8">
      <div className="space-y-2"><Skeleton className="h-8 w-64" /><Skeleton className="h-4 w-80" /></div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}</div>
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2"><Skeleton className="h-80 rounded-xl" /></div>
        <div className="space-y-6"><Skeleton className="h-24 rounded-xl" /><Skeleton className="h-40 rounded-xl" /></div>
      </div>
    </div>
  );
}
