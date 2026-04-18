"use client";

import { useEffect, useState } from "react";
import { useAppStore } from "@/store/app";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BookOpen, Award, FileCheck, TrendingUp,
  ArrowRight, Clock, Users, GraduationCap,
  BarChart3, PieChart,
} from "lucide-react";
import { CATEGORY_LABELS, DIFFICULTY_LABELS, DIFFICULTY_COLORS, ROLE_LABELS } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function DashboardPage() {
  const { user, navigate } = useAppStore();
  const [data, setData] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      try {
        const res = await fetch(`/api/dashboard?userId=${user.id}&role=${user.role}`);
        const json = await res.json();
        setData(json);
      } catch {
        // error silently
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  if (loading) return <DashboardSkeleton />;
  if (!data || !user) return null;

  if (data.type === "admin") return <AdminDashboard data={data} user={user} />;
  return <LearnerDashboard data={data} user={user} />;
}

function LearnerDashboard({ data, user }: { data: Record<string, unknown>; user: { id: string; role: string } }) {
  const { navigate } = useAppStore();
  const stats = data.stats as { coursesEnCours: number; coursesTermines: number; certificatesCount: number; avgScore: number };
  const enrollments = data.enrollments as Array<Record<string, unknown>>;
  const recommended = data.recommended as Array<Record<string, unknown>>;

  const statCards = [
    { label: "Cours en cours", value: stats.coursesEnCours, icon: BookOpen, color: "text-blue-600 bg-blue-100" },
    { label: "Cours terminés", value: stats.coursesTermines, icon: FileCheck, color: "text-green-600 bg-green-100" },
    { label: "Certificats", value: stats.certificatesCount, icon: Award, color: "text-amber-600 bg-amber-100" },
    { label: "Score moyen", value: `${stats.avgScore}%`, icon: TrendingUp, color: "text-purple-600 bg-purple-100" },
  ];

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Welcome */}
      <div>
        <h2 className="text-2xl font-bold text-foreground">
          Bonjour, {user.prenom} 👋
        </h2>
        <p className="text-muted-foreground mt-1">
          Continuez votre apprentissage avec {ROLE_LABELS[user.role] || "votre parcours"}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="border-border/60">
              <CardContent className="p-4">
                <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center mb-3", stat.color)}>
                  <Icon className="w-4 h-4" />
                </div>
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
              </CardContent>
            </Card>
          );
        })}
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
                      <Badge variant="secondary" className={cn("text-[10px] mb-2", DIFFICULTY_COLORS[(course.difficulty as string) || "DEBUTANT"])}>
                        {DIFFICULTY_LABELS[(course.difficulty as string) || "DEBUTANT"]}
                      </Badge>
                      <h4 className="font-semibold text-sm text-foreground line-clamp-2">{course.title as string}</h4>
                      <div className="mt-3">
                        <div className="flex justify-between text-xs text-muted-foreground mb-1">
                          <span>Progression</span>
                          <span>{enrollment.progress as number}%</span>
                        </div>
                        <Progress value={enrollment.progress as number} className="h-1.5" />
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
          </div>
        </div>
      )}

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
                  {(course as Record<string, unknown>)._count && (
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                      <Users className="w-3 h-3" /> {(course._count as Record<string, unknown>).enrollments as number} inscrits
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function AdminDashboard({ data }: { data: Record<string, unknown>; user: { id: string; role: string } }) {
  const { navigate } = useAppStore();
  const stats = data.stats as { totalUsers: number; totalCourses: number; totalCertificates: number; completionRate: number };
  const recentUsers = data.recentUsers as Array<Record<string, unknown>>;
  const roleDistribution = data.roleDistribution as Array<{ role: string; _count: { role: number } }>;
  const popularCourses = data.popularCourses as Array<Record<string, unknown>>;

  const statCards = [
    { label: "Apprenants", value: stats.totalUsers, icon: Users, color: "text-blue-600 bg-blue-100" },
    { label: "Cours publiés", value: stats.totalCourses, icon: BookOpen, color: "text-green-600 bg-green-100" },
    { label: "Taux complétion", value: `${stats.completionRate}%`, icon: BarChart3, color: "text-amber-600 bg-amber-100" },
    { label: "Certificats émis", value: stats.totalCertificates, icon: Award, color: "text-purple-600 bg-purple-100" },
  ];

  const roleColors: Record<string, string> = { ADMIN: "#EF4444", FORMATEUR: "#8B5CF6", ARBITRE: "#3B82F6", ENTRAINEUR: "#10B981", JOUEUR: "#F59E0B" };

  return (
    <div className="space-y-8 animate-fadeIn">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Tableau de bord Admin</h2>
        <p className="text-muted-foreground mt-1">Vue d&apos;ensemble de la plateforme</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="border-border/60">
              <CardContent className="p-4">
                <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center mb-3", stat.color)}>
                  <Icon className="w-4 h-4" />
                </div>
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Role Distribution */}
        <Card className="border-border/60">
          <CardContent className="p-6">
            <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <PieChart className="w-4 h-4 text-primary" /> Répartition des rôles
            </h3>
            <div className="space-y-3">
              {roleDistribution?.map((r) => {
                const total = roleDistribution.reduce((sum, rd) => sum + rd._count.role, 0);
                const pct = total > 0 ? Math.round((r._count.role / total) * 100) : 0;
                return (
                  <div key={r.role} className="flex items-center gap-3">
                    <div className="w-16 text-xs font-medium text-foreground">{ROLE_LABELS[r.role]}</div>
                    <div className="flex-1 h-6 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${pct}%`, backgroundColor: roleColors[r.role] || "#6B7280" }}
                      />
                    </div>
                    <div className="w-20 text-right text-xs text-muted-foreground">
                      {r._count.role} ({pct}%)
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Popular Courses */}
        <Card className="border-border/60">
          <CardContent className="p-6">
            <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-primary" /> Cours populaires
            </h3>
            <div className="space-y-3">
              {popularCourses?.map((c, i) => (
                <div
                  key={c.id as string}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                  onClick={() => navigate("course-detail", { id: c.id as string })}
                >
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{c.title as string}</p>
                    <p className="text-[10px] text-muted-foreground">{CATEGORY_LABELS[(c.category as string) || "ARBITRAGE"]}</p>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {(c._count as Record<string, unknown>).enrollments as number}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Users */}
      <Card className="border-border/60">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-foreground">Dernières inscriptions</h3>
            <Button variant="ghost" size="sm" className="text-xs" onClick={() => navigate("admin-users")}>
              Gérer <ArrowRight className="ml-1 w-3 h-3" />
            </Button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-xs text-muted-foreground border-b border-border/40">
                  <th className="text-left py-2 font-medium">Nom</th>
                  <th className="text-left py-2 font-medium hidden sm:table-cell">Email</th>
                  <th className="text-left py-2 font-medium">Rôle</th>
                  <th className="text-left py-2 font-medium hidden sm:table-cell">Inscription</th>
                </tr>
              </thead>
              <tbody>
                {recentUsers?.map((u) => (
                  <tr key={u.id as string} className="border-b border-border/20 last:border-0">
                    <td className="py-3 text-sm font-medium text-foreground">{u.prenom as string} {u.nom as string}</td>
                    <td className="py-3 text-sm text-muted-foreground hidden sm:table-cell">{u.email as string}</td>
                    <td className="py-3">
                      <Badge variant="secondary" className="text-[10px]">{ROLE_LABELS[(u.role as string) || "ARBITRE"]}</Badge>
                    </td>
                    <td className="py-3 text-xs text-muted-foreground hidden sm:table-cell">
                      {new Date(u.createdAt as string).toLocaleDateString("fr-FR")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      <div>
        <Skeleton className="h-8 w-48 mb-2" />
        <Skeleton className="h-4 w-64" />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="border-border/60">
            <CardContent className="p-4">
              <Skeleton className="w-9 h-9 rounded-lg mb-3" />
              <Skeleton className="h-8 w-20 mb-1" />
              <Skeleton className="h-3 w-24" />
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="border-border/60">
            <CardContent className="p-4">
              <Skeleton className="w-full h-32 rounded-lg mb-3" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-2 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
