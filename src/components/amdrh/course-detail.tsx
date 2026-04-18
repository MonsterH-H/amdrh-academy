"use client";

import { useEffect, useState } from "react";
import { useAppStore } from "@/store/app";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft, BookOpen, Clock, Users, Award,
  CheckCircle2, Lock, PlayCircle, FileText, Loader2,
} from "lucide-react";
import { CATEGORY_LABELS, DIFFICULTY_LABELS, DIFFICULTY_COLORS } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function CourseDetailPage() {
  const { user, viewParams, navigate } = useAppStore();
  const courseId = viewParams?.id;
  const [course, setCourse] = useState<Record<string, unknown> | null>(null);
  const [enrollment, setEnrollment] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);

  useEffect(() => {
    if (!courseId || !user) return;
    const fetchCourse = async () => {
      try {
        const res = await fetch(`/api/courses/${courseId}?userId=${user.id}`);
        const data = await res.json();
        setCourse(data.course);
        setEnrollment(data.enrollment);
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    };
    fetchCourse();
  }, [courseId, user]);

  const handleEnroll = async () => {
    if (!user || !courseId) return;
    setEnrolling(true);
    try {
      const res = await fetch(`/api/courses/${courseId}/enroll`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id }),
      });
      if (res.ok) {
        const data = await res.json();
        setEnrollment(data.enrollment);
      }
    } catch {
      // silently fail
    } finally {
      setEnrolling(false);
    }
  };

  const handleMarkComplete = async (lessonId: string) => {
    if (!user || !courseId) return;
    try {
      await fetch(`/api/courses/${courseId}/progress`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, lessonId, completed: true }),
      });
      // Refresh course data
      const res = await fetch(`/api/courses/${courseId}?userId=${user.id}`);
      const data = await res.json();
      setCourse(data.course);
      setEnrollment(data.enrollment);
    } catch {
      // silently fail
    }
  };

  if (loading) return <CourseDetailSkeleton />;
  if (!course) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground">Cours introuvable</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate("courses")}>Retour</Button>
      </div>
    );
  }

  const sections = course.sections as Array<Record<string, unknown>>;
  const instructor = course.instructor as Record<string, unknown> | null;
  const quiz = course.quiz as Record<string, unknown> | null;
  const lessonProgress = enrollment
    ? (enrollment.lessonProgress as Array<Record<string, unknown>>)
    : [];
  const isEnrolled = !!enrollment;

  const getLessonCompleted = (lessonId: string) => {
    return lessonProgress?.some((lp) => lp.lessonId === lessonId && lp.completed) || false;
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Back */}
      <button onClick={() => navigate("courses")} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="w-4 h-4" /> Retour au catalogue
      </button>

      {/* Header */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="flex flex-wrap gap-2 mb-3">
            <Badge variant="secondary">{CATEGORY_LABELS[(course.category as string) || "ARBITRAGE"]}</Badge>
            <Badge variant="secondary" className={cn(DIFFICULTY_COLORS[(course.difficulty as string) || "DEBUTANT"])}>
              {DIFFICULTY_LABELS[(course.difficulty as string) || "DEBUTANT"]}
            </Badge>
            {course.isCertifying && (
              <Badge className="bg-amber-100 text-amber-700 text-[10px]">
                <Award className="w-3 h-3 mr-1" /> Certifiant
              </Badge>
            )}
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">{course.title as string}</h1>
          <p className="text-sm text-muted-foreground leading-relaxed">{course.description as string}</p>
        </div>

        <Card className="border-border/60 h-fit">
          <CardContent className="p-5 space-y-4">
            {isEnrolled ? (
              <>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Progression</span>
                    <span className="font-semibold">{enrollment?.progress as number}%</span>
                  </div>
                  <Progress value={enrollment?.progress as number} className="h-2" />
                </div>
                {quiz && (
                  <Button
                    className="w-full rounded-lg text-sm"
                    onClick={() => navigate("quiz", { courseId: courseId!, quizId: quiz.id as string })}
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Passer le quiz
                  </Button>
                )}
              </>
            ) : (
              <Button
                className="w-full rounded-lg text-sm h-11"
                onClick={handleEnroll}
                disabled={enrolling}
              >
                {enrolling ? <Loader2 className="w-4 h-4 animate-spin" /> : "S'inscrire au cours"}
              </Button>
            )}
            <div className="space-y-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-2"><Clock className="w-3.5 h-3.5" /> {course.duration as number} minutes</div>
              <div className="flex items-center gap-2"><Users className="w-3.5 h-3.5" /> {(course._count as Record<string, unknown>)?.enrollments as number} inscrits</div>
              {instructor && (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">
                    {(instructor.prenom as string)?.charAt(0)}{(instructor.nom as string)?.charAt(0)}
                  </div>
                  {instructor.prenom as string} {instructor.nom as string}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Content */}
      <Tabs defaultValue="contenu" className="w-full">
        <TabsList className="bg-white rounded-lg border border-border/60">
          <TabsTrigger value="contenu" className="text-sm rounded-md">Contenu</TabsTrigger>
          <TabsTrigger value="infos" className="text-sm rounded-md">Informations</TabsTrigger>
        </TabsList>

        <TabsContent value="contenu" className="mt-6">
          <div className="space-y-4">
            {sections?.map((section: Record<string, unknown>, sIdx: number) => {
              const lessons = section.lessons as Array<Record<string, unknown>>;
              return (
                <Card key={section.id as string} className="border-border/60">
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-foreground text-sm mb-3">
                      {sIdx + 1}. {section.title as string}
                    </h3>
                    <div className="space-y-1">
                      {lessons?.map((lesson: Record<string, unknown>, lIdx: number) => {
                        const completed = getLessonCompleted(lesson.id as string);
                        return (
                          <button
                            key={lesson.id as string}
                            disabled={!isEnrolled}
                            onClick={() => handleMarkComplete(lesson.id as string)}
                            className={cn(
                              "w-full flex items-center gap-3 p-3 rounded-lg text-left transition-all duration-200",
                              isEnrolled
                                ? "hover:bg-muted/60 cursor-pointer"
                                : "opacity-60 cursor-not-allowed",
                              completed && "bg-green-50"
                            )}
                          >
                            {completed ? (
                              <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                            ) : isEnrolled ? (
                              <PlayCircle className="w-5 h-5 text-primary flex-shrink-0" />
                            ) : (
                              <Lock className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-foreground">{lesson.title as string}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant="outline" className="text-[10px]">
                                  {(lesson.type as string) === "VIDEO" ? "🎬 Vidéo" : "📄 Texte"}
                                </Badge>
                                <span className="text-[10px] text-muted-foreground">{lesson.duration as number} min</span>
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="infos" className="mt-6">
          <Card className="border-border/60">
            <CardContent className="p-6">
              <h3 className="font-semibold text-foreground mb-4">À propos de ce cours</h3>
              <div className="grid sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground mb-1">Catégorie</p>
                  <p className="font-medium">{CATEGORY_LABELS[(course.category as string) || "ARBITRAGE"]}</p>
                </div>
                <div>
                  <p className="text-muted-foreground mb-1">Difficulté</p>
                  <p className="font-medium">{DIFFICULTY_LABELS[(course.difficulty as string) || "DEBUTANT"]}</p>
                </div>
                <div>
                  <p className="text-muted-foreground mb-1">Durée estimée</p>
                  <p className="font-medium">{course.duration as number} minutes</p>
                </div>
                <div>
                  <p className="text-muted-foreground mb-1">Certifiant</p>
                  <p className="font-medium">{course.isCertifying ? "Oui" : "Non"}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function CourseDetailSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-4 w-32" />
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-3">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
        <Skeleton className="h-40 rounded-xl" />
      </div>
      <Skeleton className="h-64 rounded-xl" />
    </div>
  );
}
