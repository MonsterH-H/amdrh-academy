"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { useAppStore } from "@/store/app";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Award } from "lucide-react";
import {
  CATEGORY_LABELS, DIFFICULTY_LABELS, DIFFICULTY_COLORS,
} from "@/lib/constants";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import {
  LessonItem,
  LessonData,
  LessonProgressEntry,
  ResourceData,
} from "./lesson-item";
import { LessonViewerCard } from "./lesson-viewer-card";
import { ProgressTracker, QuizBanner } from "./progress-tracker";
import { ResourceTab } from "./resource-tab";

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

export function CourseDetailPage() {
  const { user, viewParams, navigate } = useAppStore();
  const courseId = viewParams?.id;
  const initialLessonId = viewParams?.lessonId || null;

  const [course, setCourse] = useState<Record<string, unknown> | null>(null);
  const [enrollment, setEnrollment] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [activeLessonId, setActiveLessonId] = useState<string | null>(null);
  const [markingComplete, setMarkingComplete] = useState(false);
  const [resources, setResources] = useState<ResourceData[]>([]);
  const [resourcesLoading, setResourcesLoading] = useState(false);
  const [lessonProgressMap, setLessonProgressMap] = useState<Record<string, LessonProgressEntry>>({});

  useEffect(() => {
    if (!courseId || !user) return;
    const fetchCourse = async () => {
      try {
        const res = await fetch(`/api/courses/${courseId}?userId=${user.id}`);
        if (!res.ok) throw new Error("Erreur");
        const data = await res.json();
        setCourse(data.course);
        setEnrollment(data.enrollment);
        if (data.enrollment?.lessonProgress) {
          const map: Record<string, LessonProgressEntry> = {};
          for (const lp of data.enrollment.lessonProgress as unknown as LessonProgressEntry[]) {
            map[lp.lessonId] = lp;
          }
          setLessonProgressMap(map);
        }
        if (initialLessonId) setActiveLessonId(initialLessonId);
      } catch {
        toast({ title: "Erreur", description: "Impossible de charger le cours.", variant: "destructive" });
      } finally { setLoading(false); }
    };
    fetchCourse();
  }, [courseId, user, initialLessonId]);

  useEffect(() => {
    if (!courseId) return;
    const fetchResources = async () => {
      setResourcesLoading(true);
      try {
        const res = await fetch(`/api/resources?courseId=${courseId}&limit=50`);
        if (!res.ok) throw new Error("Erreur");
        const data = await res.json();
        setResources((data.resources || []) as ResourceData[]);
      } catch {
        toast({ title: "Erreur", description: "Impossible de charger les ressources.", variant: "destructive" });
      } finally { setResourcesLoading(false); }
    };
    fetchResources();
  }, [courseId]);

  const allLessons = useMemo(() => {
    if (!course) return [] as LessonData[];
    const secs = course.sections as Array<Record<string, unknown>>;
    if (!secs) return [] as LessonData[];
    const flat: LessonData[] = [];
    for (const section of secs) {
      const lessons = section.lessons as Array<Record<string, unknown>>;
      if (lessons) {
        for (const lesson of lessons) {
          flat.push({
            id: lesson.id as string, title: lesson.title as string,
            type: lesson.type as string, content: lesson.content as string,
            duration: lesson.duration as number, order: lesson.order as number,
            sectionId: section.id as string,
          });
        }
      }
    }
    return flat;
  }, [course]);

  const activeLessonIndex = useMemo(() => {
    if (!activeLessonId) return -1;
    return allLessons.findIndex((l) => l.id === activeLessonId);
  }, [activeLessonId, allLessons]);

  const activeLesson = activeLessonIndex >= 0 ? allLessons[activeLessonIndex] : null;
  const prevLesson = activeLessonIndex > 0 ? allLessons[activeLessonIndex - 1] : null;
  const nextLesson = activeLessonIndex < allLessons.length - 1 ? allLessons[activeLessonIndex + 1] : null;

  const activeSection = useMemo(() => {
    if (!activeLesson || !course) return null;
    const secs = course.sections as Array<Record<string, unknown>>;
    return secs?.find((s) => s.id === activeLesson.sectionId) as Record<string, unknown> | undefined;
  }, [activeLesson, course]);

  const activeLessonProgress = activeLessonId ? lessonProgressMap[activeLessonId] : null;
  const isLessonCompleted = activeLessonProgress?.completed || false;
  const isEnrolled = !!enrollment;
  const isManager = user?.role === "ADMIN" || user?.role === "FORMATEUR";

  const handleEnroll = async () => {
    if (!user || !courseId) return;
    setEnrolling(true);
    try {
      const res = await fetch(`/api/courses/${courseId}/enroll`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id }),
      });
      const data = await res.json();
      if (res.ok) { setEnrollment(data.enrollment); }
      else { toast({ title: "Erreur", description: data.error || "Impossible de s'inscrire", variant: "destructive" }); }
    } catch {
      toast({ title: "Erreur", description: "Impossible de s'inscrire au cours.", variant: "destructive" });
    } finally { setEnrolling(false); }
  };

  const refreshCourseData = useCallback(async () => {
    if (!user || !courseId) return;
    try {
      const res = await fetch(`/api/courses/${courseId}?userId=${user.id}`);
      const data = await res.json();
      setCourse(data.course); setEnrollment(data.enrollment);
      if (data.enrollment?.lessonProgress) {
        const map: Record<string, LessonProgressEntry> = {};
        for (const lp of data.enrollment.lessonProgress as unknown as LessonProgressEntry[]) map[lp.lessonId] = lp;
        setLessonProgressMap(map);
      }
    } catch {
      toast({ title: "Erreur", description: "Impossible de rafraîchir les données.", variant: "destructive" });
    }
  }, [user, courseId]);

  const handleMarkComplete = async (lessonId: string) => {
    if (!user || !courseId) return;
    setMarkingComplete(true);
    try {
      await fetch(`/api/courses/${courseId}/progress`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, lessonId, completed: true, completionTrigger: "manual" }),
      });
      toast({ title: "Leçon marquée comme terminée", description: "Votre progression a été mise à jour." });
      await refreshCourseData();
    } catch {
      toast({ title: "Erreur", description: "Impossible de mettre à jour la progression.", variant: "destructive" });
    } finally { setMarkingComplete(false); }
  };

  const handleAutoComplete = useCallback(() => { refreshCourseData(); }, [refreshCourseData]);
  const handleLessonClick = (lessonId: string) => { if (!isEnrolled && !isManager) return; setActiveLessonId(lessonId); };
  const handleDownloadResource = (resourceId: string) => { window.open(`/api/resources/${resourceId}?download=true`, "_blank"); };
  const getLessonCompleted = (lessonId: string) => lessonProgressMap[lessonId]?.completed || false;
  const getLessonProgressData = (lessonId: string) => lessonProgressMap[lessonId] || null;

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
  const handleNavigateQuiz = () => { if (courseId && quiz) navigate("quiz", { courseId, quizId: quiz.id as string }); };

  return (
    <div className="space-y-6 animate-fadeIn">
      <button onClick={() => navigate(isManager ? "admin-courses" : "courses")} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="w-4 h-4" /> {isManager ? "Retour à la gestion" : "Retour au catalogue"}
      </button>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="flex flex-wrap gap-2 mb-3">
            <Badge variant="secondary">{CATEGORY_LABELS[(course.category as string) || "ARBITRAGE"]}</Badge>
            <Badge variant="secondary" className={cn(DIFFICULTY_COLORS[(course.difficulty as string) || "DEBUTANT"])}>
              {DIFFICULTY_LABELS[(course.difficulty as string) || "DEBUTANT"]}
            </Badge>
            {course.isCertifying as boolean && (
              <Badge className="bg-amber-100 text-amber-700 text-[10px]"><Award className="w-3 h-3 mr-1" /> Certifiant</Badge>
            )}
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">{course.title as string}</h1>
          <p className="text-sm text-muted-foreground leading-relaxed">{course.description as string}</p>
        </div>
        <ProgressTracker
          enrollment={enrollment} isEnrolled={isEnrolled} isManager={isManager}
          enrolling={enrolling} quiz={quiz} courseId={courseId!} course={course}
          sections={sections} instructor={instructor} user={user as unknown as Record<string, unknown> | null}
          onEnroll={handleEnroll} onNavigateQuiz={handleNavigateQuiz}
        />
      </div>

      <Tabs defaultValue="contenu" className="w-full">
        <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
          <TabsList className="bg-card rounded-lg border border-border/60 inline-flex min-w-max">
            <TabsTrigger value="contenu" className="text-sm rounded-md">Contenu</TabsTrigger>
            <TabsTrigger value="ressources" className="text-sm rounded-md">
              Ressources {resources.length > 0 && `(${resources.length})`}
            </TabsTrigger>
            <TabsTrigger value="infos" className="text-sm rounded-md">Informations</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="contenu" className="mt-6">
          <QuizBanner quiz={quiz} enrollment={enrollment} isEnrolled={isEnrolled} courseId={courseId!} onNavigateQuiz={handleNavigateQuiz} />

          {activeLesson && (
            <LessonViewerCard
              activeLesson={activeLesson} activeLessonIndex={activeLessonIndex}
              totalLessons={allLessons.length} prevLesson={prevLesson} nextLesson={nextLesson}
              activeLessonProgress={activeLessonProgress}
              activeSectionTitle={activeSection?.title as string | undefined}
              isLessonCompleted={isLessonCompleted} isEnrolled={isEnrolled}
              courseId={courseId!} markingComplete={markingComplete}
              onClose={() => setActiveLessonId(null)}
              onMarkComplete={handleMarkComplete} onAutoComplete={handleAutoComplete}
              onPrevLesson={() => prevLesson && setActiveLessonId(prevLesson.id)}
              onNextLesson={() => nextLesson && setActiveLessonId(nextLesson.id)}
            />
          )}

          <div className="space-y-4">
            {sections?.map((section: Record<string, unknown>, sIdx: number) => {
              const lessons = section.lessons as Array<Record<string, unknown>>;
              return (
                <Card key={section.id as string} className="border-border/60">
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-foreground text-sm mb-3">{sIdx + 1}. {section.title as string}</h3>
                    <div className="space-y-1">
                      {lessons?.map((lesson: Record<string, unknown>) => (
                        <LessonItem
                          key={lesson.id as string} lesson={lesson} isEnrolled={isEnrolled}
                          isActive={activeLessonId === (lesson.id as string)}
                          onClick={() => handleLessonClick(lesson.id as string)}
                          getLessonCompleted={getLessonCompleted} getLessonProgressData={getLessonProgressData}
                        />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="ressources" className="mt-6">
          <ResourceTab resources={resources} resourcesLoading={resourcesLoading} onDownload={handleDownloadResource} />
        </TabsContent>

        <TabsContent value="infos" className="mt-6">
          <Card className="border-border/60">
            <CardContent className="p-6">
              <h3 className="font-semibold text-foreground mb-4">À propos de ce cours</h3>
              <div className="grid sm:grid-cols-2 gap-4 text-sm">
                <div><p className="text-muted-foreground mb-1">Catégorie</p><p className="font-medium">{CATEGORY_LABELS[(course.category as string) || "ARBITRAGE"]}</p></div>
                <div><p className="text-muted-foreground mb-1">Difficulté</p><p className="font-medium">{DIFFICULTY_LABELS[(course.difficulty as string) || "DEBUTANT"]}</p></div>
                <div><p className="text-muted-foreground mb-1">Durée estimée</p><p className="font-medium">{course.duration as number} minutes</p></div>
                <div><p className="text-muted-foreground mb-1">Certifiant</p><p className="font-medium">{course.isCertifying ? "Oui" : "Non"}</p></div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
