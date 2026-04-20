"use client";

import { useEffect, useState, useCallback } from "react";
import { useAppStore } from "@/store/app";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { GraduationCap, PlayCircle, CheckCircle2, Filter, BookOpen } from "lucide-react";
import { ROLE_LABELS } from "@/lib/constants";
import { toast } from "@/hooks/use-toast";
import { PathCard } from "./path-card";
import type { LearningPathData } from "./path-card";

// ─── Skeleton ──────────────────────────────────────────────────────────

function LearningPathsSkeleton() {
  return (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-64 mt-2" />
      </div>
      <div className="grid grid-cols-3 gap-3">
        {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}
      </div>
      {[...Array(2)].map((_, i) => <Skeleton key={i} className="h-72 rounded-xl" />)}
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────

export function LearningPathsPage() {
  const { user, navigate } = useAppStore();
  const [paths, setPaths] = useState<LearningPathData[]>([]);
  const [loading, setLoading] = useState(true);
  const [enrollingPathId, setEnrollingPathId] = useState<string | null>(null);
  const [roleFilter, setRoleFilter] = useState<string>("ALL");

  const fetchPaths = useCallback(async () => {
    if (!user) return;
    try {
      const res = await fetch(`/api/learning-paths?userId=${user.id}&role=${user.role}`);
      const data = await res.json();
      setPaths(data.paths || []);
    } catch {
      toast({ title: "Erreur", description: "Impossible de charger les parcours de formation", variant: "destructive" });
    } finally { setLoading(false); }
  }, [user]);

  useEffect(() => { fetchPaths(); }, [fetchPaths]);

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
        toast({ title: "Erreur", description: data.error || "Impossible de s'inscrire", variant: "destructive" });
        return;
      }
      toast({ title: "Inscription réussie", description: "Vous êtes inscrit au parcours. Bon apprentissage !" });
      await fetchPaths();
    } catch {
      toast({ title: "Erreur réseau", description: "Veuillez réessayer", variant: "destructive" });
    } finally { setEnrollingPathId(null); }
  };

  const handleContinue = (path: LearningPathData) => {
    const enrollment = path.enrollments?.[0];
    if (!enrollment || !path.courses.length) return;
    const nextCourse = path.courses.find((pc) => pc.order > enrollment.currentCourseOrder);
    const courseId = nextCourse?.course.id || path.courses[0].course.id;
    navigate("course-detail", { id: courseId });
  };

  // Filter & stats
  const filteredPaths = roleFilter === "ALL" ? paths : paths.filter((p) => p.targetRole === roleFilter);
  const availableRoles = [...new Set(paths.map((p) => p.targetRole))];
  const enrolledCount = paths.filter((p) => p.enrollments && p.enrollments.length > 0).length;
  const completedCount = paths.filter((p) => p.enrollments?.[0]?.status === "termine").length;

  if (loading) return <LearningPathsSkeleton />;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-foreground">Parcours de formation</h2>
        <p className="text-muted-foreground mt-1">
          Suivez les parcours recommandés pour votre profil{" "}
          <span className="font-medium text-foreground">{ROLE_LABELS[user?.role || "ARBITRE"]}</span>
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
                <p className="text-xl font-bold text-foreground">{paths.length}</p>
                <p className="text-[11px] text-muted-foreground">Parcours disponible{paths.length > 1 ? "s" : ""}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/60">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
                <PlayCircle className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xl font-bold text-foreground">{enrolledCount}</p>
                <p className="text-[11px] text-muted-foreground">{enrolledCount} {enrolledCount > 1 ? "Inscrits" : "Inscrit"}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/60">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-xl font-bold text-foreground">{completedCount}</p>
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
          <Badge variant={roleFilter === "ALL" ? "default" : "outline"} className="cursor-pointer text-[10px] rounded-lg px-3 py-1" onClick={() => setRoleFilter("ALL")}>
            Tous les profils
          </Badge>
          {availableRoles.map((role) => (
            <Badge key={role} variant={roleFilter === role ? "default" : "outline"} className="cursor-pointer text-[10px] rounded-lg px-3 py-1" onClick={() => setRoleFilter(role)}>
              {ROLE_LABELS[role] || role}
            </Badge>
          ))}
        </div>
      )}

      {/* Content */}
      {paths.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 rounded-2xl bg-muted/60 flex items-center justify-center mx-auto mb-4">
            <GraduationCap className="w-8 h-8 text-muted-foreground/40" />
          </div>
          <h3 className="font-semibold text-foreground mb-2">Aucun parcours disponible</h3>
          <p className="text-sm text-muted-foreground">Consultez le catalogue pour vous inscrire à des cours</p>
          <Button className="mt-4 rounded-lg" onClick={() => navigate("courses")}>
            <BookOpen className="w-4 h-4 mr-2" /> Explorer le catalogue
          </Button>
        </div>
      ) : filteredPaths.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-sm text-muted-foreground">Aucun parcours ne correspond à ce filtre.</p>
          <Button variant="outline" size="sm" className="mt-3 rounded-lg" onClick={() => setRoleFilter("ALL")}>Réinitialiser le filtre</Button>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredPaths.map((path) => (
            <PathCard
              key={path.id}
              path={path}
              enrollingPathId={enrollingPathId}
              onEnroll={handleEnroll}
              onContinue={handleContinue}
              onNavigate={navigate}
            />
          ))}
        </div>
      )}
    </div>
  );
}
