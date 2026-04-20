"use client";

import { useEffect, useState, useCallback } from "react";
import { useAppStore } from "@/store/app";
import { useRealtime } from "@/hooks/use-realtime";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowRight, Clock, Users, BookOpen, FileCheck, Award, TrendingUp, AlertCircle } from "lucide-react";
import { StatCard } from "@/modules/shared/components/stat-card";
import { ROLE_LABELS, CATEGORY_LABELS } from "@/lib/constants";
import { RealtimeActivityFeed, ConnectionStatusBadge, type ActivityItem } from "./realtime-feed";

export function LearnerDashboardPage() {
  const { user, navigate } = useAppStore();
  const { isConnected, on } = useRealtime();
  const [data, setData] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [onlineCount, setOnlineCount] = useState<number | null>(null);
  const [activityFeed, setActivityFeed] = useState<ActivityItem[]>([]);

  const fetchDashboard = useCallback(async () => {
    if (!user) return;
    try {
      const res = await fetch(`/api/dashboard?userId=${user.id}&role=${user.role}`);
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

  const fetchOnlineCount = useCallback(async () => {
    try {
      const res = await fetch(`/api/realtime/online`);
      const json = await res.json();
      setOnlineCount(json.count || 0);
    } catch {
      setOnlineCount(0);
    }
  }, []);

  useEffect(() => {
    fetchOnlineCount();
    const interval = setInterval(fetchOnlineCount, 30000);
    return () => clearInterval(interval);
  }, [fetchOnlineCount]);

  useEffect(() => {
    const unsubQuiz = on("quiz:submit", (...args: unknown[]) => {
      const d = args[0] as Record<string, unknown> | undefined;
      if (!d) return;
      setActivityFeed((prev) => [{
        id: `quiz-${Date.now()}`, type: "quiz" as const, title: "Quiz soumis",
        description: `Score: ${d.score}% — ${d.passed ? "Réussi ✓" : "À retenter"}`,
        timestamp: d.timestamp as number || Date.now(),
      }, ...prev].slice(0, 10));
    });

    const unsubProgress = on("progress:update", (...args: unknown[]) => {
      const d = args[0] as Record<string, unknown> | undefined;
      if (!d) return;
      setActivityFeed((prev) => [{
        id: `progress-${Date.now()}`, type: "progress" as const, title: "Progression mise à jour",
        description: `Progression: ${d.progress}%`,
        timestamp: d.timestamp as number || Date.now(),
      }, ...prev].slice(0, 10));
    });

    const unsubPresence = on("presence:change", (...args: unknown[]) => {
      const d = args[0] as Record<string, unknown> | undefined;
      if (!d) return;
      if (d.isOnline) {
        setActivityFeed((prev) => [{
          id: `presence-${Date.now()}`, type: "connection" as const,
          title: "Utilisateur en ligne",
          description: "Un utilisateur vient de se connecter",
          timestamp: d.timestamp as number || Date.now(),
        }, ...prev].slice(0, 10));
      }
      fetchOnlineCount();
    });

    return () => { unsubQuiz(); unsubProgress(); unsubPresence(); };
  }, [on, fetchOnlineCount]);

  if (loading) return <DashboardSkeleton />;
  if (error) {
    return (
      <div className="text-center py-20 animate-fadeIn">
        <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
        <h3 className="font-semibold text-foreground mb-2">Erreur de chargement</h3>
        <p className="text-sm text-muted-foreground mb-4">Impossible de charger le tableau de bord</p>
        <Button variant="outline" onClick={() => { setError(false); setLoading(true); fetchDashboard(); }}>Réessayer</Button>
      </div>
    );
  }
  if (!data || !user?.id || !user?.role) return null;

  const statsData = (data.stats || {}) as Record<string, unknown>;
  const stats = {
    coursesEnCours: (statsData.coursesEnCours as number) ?? 0,
    coursesTermines: (statsData.coursesTermines as number) ?? 0,
    certificatesCount: (statsData.certificatesCount as number) ?? 0,
    avgScore: (statsData.avgScore as number) ?? 0,
  };
  const enrollments = (data.enrollments || []) as Array<Record<string, unknown>>;
  const recommended = (data.recommended || []) as Array<Record<string, unknown>>;

  const statCards = [
    { label: "Cours en cours", value: stats.coursesEnCours, icon: BookOpen, colorClass: "text-blue-600", bgColor: "bg-blue-100" },
    { label: "Cours terminés", value: stats.coursesTermines, icon: FileCheck, colorClass: "text-green-600", bgColor: "bg-green-100" },
    { label: "Certificats", value: stats.certificatesCount, icon: Award, colorClass: "text-amber-600", bgColor: "bg-amber-100" },
    { label: "Score moyen", value: `${stats.avgScore}%`, icon: TrendingUp, colorClass: "text-purple-600", bgColor: "bg-purple-100" },
  ];

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Welcome */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-foreground">
            Bonjour, {user.prenom || "there"} 👋
          </h2>
          <p className="text-muted-foreground mt-1">
            Continuez votre apprentissage avec {ROLE_LABELS[user.role] || "votre parcours"}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {onlineCount !== null && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/60 px-2.5 py-1 rounded-full">
              <Users className="w-3 h-3" />
              {onlineCount} en ligne
            </div>
          )}
          <ConnectionStatusBadge isConnected={isConnected} />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
        {statCards.map((stat) => (
          <StatCard key={stat.label} label={stat.label} value={stat.value} icon={stat.icon} colorClass={stat.colorClass} bgColor={stat.bgColor} />
        ))}
      </div>

      {/* Current courses */}
      {enrollments && enrollments.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-foreground">Mes cours en cours</h3>
            <Button variant="ghost" size="sm" className="text-xs" onClick={() => navigate("courses")}>
              Voir tout <ArrowRight className="ml-1 w-3 h-3" />
            </Button>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {enrollments
              .filter((e: Record<string, unknown>) => e.status === "en_cours")
              .slice(0, 3)
              .map((enrollment: Record<string, unknown>) => {
                const course = enrollment.course as Record<string, unknown>;
                return (
                  <Card
                    key={enrollment.id as string}
                    className="border-border/60 hover:shadow-md transition-all duration-200 cursor-pointer"
                    onClick={() => navigate("course-detail", { id: course.id as string })}
                  >
                    <CardContent className="p-4">
                      <div className="w-full h-32 rounded-lg bg-gradient-to-br from-blue-500/20 to-blue-600/10 flex items-center justify-center mb-3">
                        <BookOpen className="w-8 h-8 text-blue-500" />
                      </div>
                      <Badge variant="secondary" className="text-[10px] mb-2 bg-blue-100 text-blue-700">
                        {(course.difficulty as string) || "Débutant"}
                      </Badge>
                      <h4 className="font-semibold text-sm text-foreground line-clamp-2">{course.title as string}</h4>
                      <div className="mt-3">
                        <div className="flex justify-between text-xs text-muted-foreground mb-1">
                          <span>Progression</span>
                          <span>{enrollment.progress as number}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-primary rounded-full" style={{ width: `${enrollment.progress as number}%` }} />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
          </div>
        </div>
      )}

      {/* Real-time Activity Feed */}
      <RealtimeActivityFeed items={activityFeed} />

      {/* Recommended */}
      {recommended && recommended.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-foreground">Recommandé pour vous</h3>
            <Button variant="ghost" size="sm" className="text-xs" onClick={() => navigate("courses")}>
              Catalogue <ArrowRight className="ml-1 w-3 h-3" />
            </Button>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {recommended.slice(0, 4).map((course: Record<string, unknown>) => (
              <Card
                key={course.id as string}
                className="border-border/60 hover:shadow-md transition-all duration-200 cursor-pointer"
                onClick={() => navigate("course-detail", { id: course.id as string })}
              >
                <CardContent className="p-4">
                  <Badge variant="secondary" className="text-[10px] mb-2">
                    {CATEGORY_LABELS[(course.category as string) || "ARBITRAGE"]}
                  </Badge>
                  <h4 className="font-semibold text-sm text-foreground line-clamp-2">{course.title as string}</h4>
                  <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {course.duration as number} min
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-8 w-32" />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-64 rounded-xl" />
      <Skeleton className="h-48 rounded-xl" />
    </div>
  );
}
