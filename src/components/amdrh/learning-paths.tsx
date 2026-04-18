"use client";

import { useEffect, useState } from "react";
import { useAppStore } from "@/store/app";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { GraduationCap, BookOpen, Clock, CheckCircle2, Lock, ArrowRight } from "lucide-react";
import { CATEGORY_LABELS, DIFFICULTY_LABELS, ROLE_LABELS } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function LearningPathsPage() {
  const { user, navigate } = useAppStore();
  const [paths, setPaths] = useState<Array<Record<string, unknown>>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchPaths = async () => {
      try {
        const res = await fetch(`/api/learning-paths?userId=${user.id}&role=${user.role}`);
        const data = await res.json();
        setPaths(data.paths || []);
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    };
    fetchPaths();
  }, [user]);

  if (loading) return <LearningPathsSkeleton />;

  return (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Parcours de formation</h2>
        <p className="text-muted-foreground mt-1">
          Suivez les parcours recommandés pour votre profil {ROLE_LABELS[user?.role || "ARBITRE"]}
        </p>
      </div>

      {paths.length === 0 ? (
        <div className="text-center py-20">
          <GraduationCap className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
          <h3 className="font-semibold text-foreground mb-2">Aucun parcours disponible</h3>
          <p className="text-sm text-muted-foreground">Consultez le catalogue pour vous inscrire à des cours</p>
          <Button className="mt-4" onClick={() => navigate("courses")}>Explorer le catalogue</Button>
        </div>
      ) : (
        <div className="space-y-8">
          {paths.map((path: Record<string, unknown>) => {
            const courses = path.courses as Array<Record<string, unknown>>;
            const enrollment = (path.enrollments as Array<Record<string, unknown>>)?.[0];
            const progress = enrollment ? enrollment.progress as number : 0;

            return (
              <Card key={path.id as string} className="border-border/60">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="secondary" className="text-[10px]">
                          {ROLE_LABELS[(path.targetRole as string) || "ARBITRE"]}
                        </Badge>
                        {path.isMandatory && (
                          <Badge className="bg-red-100 text-red-700 text-[10px]">Obligatoire</Badge>
                        )}
                      </div>
                      <h3 className="text-lg font-bold text-foreground">{path.title as string}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{path.description as string}</p>
                    </div>
                    {enrollment && (
                      <div className="text-right">
                        <p className="text-2xl font-bold text-primary">{progress}%</p>
                        <p className="text-[10px] text-muted-foreground">Progression</p>
                      </div>
                    )}
                  </div>

                  {/* Progress bar */}
                  {enrollment && (
                    <Progress value={progress} className="h-2 mb-6" />
                  )}

                  {/* Timeline */}
                  <div className="relative">
                    <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-border" />
                    <div className="space-y-4">
                      {courses?.map((pc: Record<string, unknown>, i: number) => {
                        const course = pc.course as Record<string, unknown>;
                        const isUnlocked = !enrollment || i <= ((enrollment.currentCourseOrder as number) || 0);
                        return (
                          <div key={pc.id as string} className="relative flex items-start gap-4">
                            <div className={cn(
                              "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 z-10 border-2",
                              isUnlocked ? "bg-primary text-white border-primary" : "bg-muted text-muted-foreground border-muted"
                            )}>
                              {isUnlocked ? <CheckCircle2 className="w-5 h-5" /> : <Lock className="w-4 h-4" />}
                            </div>
                            <div
                              className={cn(
                                "flex-1 p-3 rounded-lg border border-border/60 transition-all",
                                isUnlocked ? "hover:shadow-sm cursor-pointer" : "opacity-50"
                              )}
                              onClick={() => isUnlocked && navigate("course-detail", { id: course.id as string })}
                            >
                              <div className="flex items-center gap-2 mb-1">
                                <Badge variant="outline" className="text-[10px]">{CATEGORY_LABELS[(course.category as string) || "ARBITRAGE"]}</Badge>
                                <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                                  <Clock className="w-3 h-3" /> {course.duration as number} min
                                </span>
                              </div>
                              <p className="text-sm font-medium text-foreground">{course.title as string}</p>
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

function LearningPathsSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-4 w-64" />
      {[...Array(2)].map((_, i) => (
        <Skeleton key={i} className="h-64 rounded-xl" />
      ))}
    </div>
  );
}
