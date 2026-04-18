"use client";

import { useEffect, useState, useMemo } from "react";
import { useAppStore } from "@/store/app";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ArrowLeft, BookOpen, Clock, Users, Award,
  CheckCircle2, Lock, PlayCircle, Loader2,
  X, ChevronLeft, ChevronRight, Video, FileText,
  MousePointerClick, GraduationCap, Download, FolderOpen,
} from "lucide-react";
import {
  CATEGORY_LABELS, DIFFICULTY_LABELS, DIFFICULTY_COLORS,
  LESSON_TYPE_LABELS, LESSON_TYPE_ICONS, LESSON_TYPE_COLORS,
  RESOURCE_TYPE_LABELS, RESOURCE_TYPE_COLORS, RESOURCE_TYPE_ICONS,
  RESOURCE_CATEGORY_LABELS, RESOURCE_CATEGORY_COLORS,
} from "@/lib/constants";
import { cn } from "@/lib/utils";

interface LessonData {
  id: string;
  title: string;
  type: string;
  content: string;
  duration: number;
  order: number;
  sectionId: string;
}

interface ResourceData {
  id: string;
  title: string;
  description: string | null;
  fileName: string;
  fileSize: number;
  fileType: string;
  category: string;
  isDownloadable: boolean;
  downloadCount: number;
  createdAt: string;
}

function LessonTypeIcon({ type }: { type: string }) {
  switch (type) {
    case "VIDEO":
      return <Video className="w-4 h-4" />;
    case "PDF":
      return <FileText className="w-4 h-4" />;
    case "INTERACTIF":
      return <MousePointerClick className="w-4 h-4" />;
    default:
      return <BookOpen className="w-4 h-4" />;
  }
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 o";
  const units = ["o", "Ko", "Mo", "Go"];
  const k = 1024;
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${units[i]}`;
}

function ResourceIcon({ type }: { type: string }) {
  switch (type) {
    case "VIDEO": return <Video className="w-5 h-5" />;
    case "PDF": return <FileText className="w-5 h-5" />;
    case "IMAGE": return <GraduationCap className="w-5 h-5" />;
    case "AUDIO": return <PlayCircle className="w-5 h-5" />;
    default: return <FolderOpen className="w-5 h-5" />;
  }
}

function LessonTypePlaceholder({ type }: { type: string }) {
  switch (type) {
    case "VIDEO":
      return (
        <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
          <div className="w-20 h-20 rounded-2xl bg-purple-100 flex items-center justify-center mb-4">
            <Video className="w-10 h-10 text-purple-500" />
          </div>
          <h3 className="font-semibold text-foreground mb-2">Contenu vidéo</h3>
          <p className="text-sm text-muted-foreground max-w-sm">
            La vidéo de cette leçon sera bientôt disponible. Consultez le contenu textuel en attendant.
          </p>
        </div>
      );
    case "PDF":
      return (
        <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
          <div className="w-20 h-20 rounded-2xl bg-red-100 flex items-center justify-center mb-4">
            <FileText className="w-10 h-10 text-red-500" />
          </div>
          <h3 className="font-semibold text-foreground mb-2">Document PDF</h3>
          <p className="text-sm text-muted-foreground max-w-sm">
            Le document PDF associé à cette leçon sera disponible prochainement.
          </p>
        </div>
      );
    case "INTERACTIF":
      return (
        <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
          <div className="w-20 h-20 rounded-2xl bg-amber-100 flex items-center justify-center mb-4">
            <MousePointerClick className="w-10 h-10 text-amber-500" />
          </div>
          <h3 className="font-semibold text-foreground mb-2">Exercice interactif</h3>
          <p className="text-sm text-muted-foreground max-w-sm">
            Un exercice interactif sera bientôt proposé pour cette leçon. Il vous permettra de pratiquer les concepts abordés.
          </p>
        </div>
      );
    default:
      return null;
  }
}

export function CourseDetailPage() {
  const { user, viewParams, navigate } = useAppStore();
  const courseId = viewParams?.id;
  const [course, setCourse] = useState<Record<string, unknown> | null>(null);
  const [enrollment, setEnrollment] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [activeLessonId, setActiveLessonId] = useState<string | null>(null);
  const [markingComplete, setMarkingComplete] = useState(false);
  const [resources, setResources] = useState<ResourceData[]>([]);
  const [resourcesLoading, setResourcesLoading] = useState(false);

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

  // Fetch resources for this course
  useEffect(() => {
    if (!courseId) return;
    const fetchResources = async () => {
      setResourcesLoading(true);
      try {
        const res = await fetch(`/api/resources?courseId=${courseId}&limit=50`);
        const data = await res.json();
        setResources((data.resources || []) as ResourceData[]);
      } catch {
        // silently fail
      } finally {
        setResourcesLoading(false);
      }
    };
    fetchResources();
  }, [courseId]);

  // Build flat lessons array for navigation
  const allLessons = useMemo(() => {
    if (!course) return [] as LessonData[];
    const sections = course.sections as Array<Record<string, unknown>>;
    if (!sections) return [] as LessonData[];
    const flat: LessonData[] = [];
    for (const section of sections) {
      const lessons = section.lessons as Array<Record<string, unknown>>;
      if (lessons) {
        for (const lesson of lessons) {
          flat.push({
            id: lesson.id as string,
            title: lesson.title as string,
            type: lesson.type as string,
            content: lesson.content as string,
            duration: lesson.duration as number,
            order: lesson.order as number,
            sectionId: section.id as string,
          });
        }
      }
    }
    return flat;
  }, [course]);

  // Compute active lesson and neighbors
  const activeLessonIndex = useMemo(() => {
    if (!activeLessonId) return -1;
    return allLessons.findIndex((l) => l.id === activeLessonId);
  }, [activeLessonId, allLessons]);

  const activeLesson = activeLessonIndex >= 0 ? allLessons[activeLessonIndex] : null;
  const prevLesson = activeLessonIndex > 0 ? allLessons[activeLessonIndex - 1] : null;
  const nextLesson = activeLessonIndex < allLessons.length - 1 ? allLessons[activeLessonIndex + 1] : null;

  // Find which section the active lesson belongs to (must be before early returns)
  const activeSection = useMemo(() => {
    if (!activeLesson || !course) return null;
    const sections = course.sections as Array<Record<string, unknown>>;
    if (!sections) return null;
    return sections.find((s) => s.id === activeLesson.sectionId) as Record<string, unknown> | undefined;
  }, [activeLesson, course]);

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
    setMarkingComplete(true);
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
    } finally {
      setMarkingComplete(false);
    }
  };

  const handleLessonClick = (lessonId: string) => {
    if (!isEnrolled) return;
    setActiveLessonId(lessonId);
  };

  const handleCloseLesson = () => {
    setActiveLessonId(null);
  };

  const handlePrevLesson = () => {
    if (prevLesson) setActiveLessonId(prevLesson.id);
  };

  const handleNextLesson = () => {
    if (nextLesson) setActiveLessonId(nextLesson.id);
  };

  const handleDownloadResource = (resourceId: string) => {
    window.open(`/api/resources/${resourceId}?download=true`, "_blank");
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

  const isLessonCompleted = activeLesson ? getLessonCompleted(activeLesson.id) : false;

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
          <TabsTrigger value="ressources" className="text-sm rounded-md">
            Ressources {resources.length > 0 && `(${resources.length})`}
          </TabsTrigger>
          <TabsTrigger value="infos" className="text-sm rounded-md">Informations</TabsTrigger>
        </TabsList>

        <TabsContent value="contenu" className="mt-6">
          {/* Lesson Content Viewer */}
          {activeLesson && (
            <Card className="border-primary/20 shadow-sm mb-6 overflow-hidden">
              {/* Viewer Header */}
              <div className="px-5 py-4 bg-gradient-to-r from-primary/5 to-transparent flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <button
                    onClick={handleCloseLesson}
                    className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-2"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    Retour au plan du cours
                  </button>
                  <h2 className="text-lg font-bold text-foreground leading-snug">{activeLesson.title}</h2>
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    <Badge variant="secondary" className={cn("text-[11px]", LESSON_TYPE_COLORS[activeLesson.type || "TEXTE"])}>
                      <LessonTypeIcon type={activeLesson.type} />
                      <span className="ml-1">{LESSON_TYPE_LABELS[activeLesson.type] || activeLesson.type}</span>
                    </Badge>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {activeLesson.duration} min
                    </span>
                    {activeSection && (
                      <span className="text-xs text-muted-foreground">
                        {activeSection.title as string}
                      </span>
                    )}
                    {isLessonCompleted && (
                      <Badge variant="secondary" className="bg-green-100 text-green-700 text-[11px]">
                        <CheckCircle2 className="w-3 h-3 mr-1" /> Complétée
                      </Badge>
                    )}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 flex-shrink-0 text-muted-foreground hover:text-foreground"
                  onClick={handleCloseLesson}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <Separator />

              {/* Viewer Content */}
              <div className="p-5">
                {activeLesson.type === "TEXTE" && activeLesson.content ? (
                  <div className="prose prose-sm max-w-none">
                    <ScrollArea className="max-h-[400px]">
                      <div className="pr-4 pb-2">
                        {activeLesson.content.split("\n").map((paragraph, idx) => {
                          if (!paragraph.trim()) return <div key={idx} className="h-3" />;
                          return (
                            <p key={idx} className="text-sm text-foreground/90 leading-relaxed mb-3">
                              {paragraph}
                            </p>
                          );
                        })}
                      </div>
                    </ScrollArea>
                  </div>
                ) : (
                  <LessonTypePlaceholder type={activeLesson.type} />
                )}
              </div>

              <Separator />

              {/* Viewer Footer - Actions and Navigation */}
              <div className="px-5 py-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                {/* Mark as Complete */}
                {!isLessonCompleted && (
                  <Button
                    onClick={() => handleMarkComplete(activeLesson.id)}
                    disabled={markingComplete}
                    className="rounded-lg text-sm bg-green-600 hover:bg-green-700"
                  >
                    {markingComplete ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                    )}
                    Marquer comme terminée
                  </Button>
                )}
                {isLessonCompleted && (
                  <div className="flex items-center gap-2 text-sm text-green-600 font-medium">
                    <CheckCircle2 className="w-4 h-4" />
                    Leçon terminée
                  </div>
                )}

                {/* Spacer */}
                <div className="flex-1" />

                {/* Prev / Next Navigation */}
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-lg text-xs"
                    disabled={!prevLesson}
                    onClick={handlePrevLesson}
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    <span className="hidden sm:inline">Précédent</span>
                  </Button>
                  <span className="text-xs text-muted-foreground px-1">
                    {activeLessonIndex + 1} / {allLessons.length}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-lg text-xs"
                    disabled={!nextLesson}
                    onClick={handleNextLesson}
                  >
                    <span className="hidden sm:inline">Suivant</span>
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {/* Course Outline */}
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
                        const isActive = activeLessonId === lesson.id;
                        const lessonType = lesson.type as string;
                        return (
                          <button
                            key={lesson.id as string}
                            disabled={!isEnrolled}
                            onClick={() => handleLessonClick(lesson.id as string)}
                            className={cn(
                              "w-full flex items-center gap-3 p-3 rounded-lg text-left transition-all duration-200",
                              isEnrolled
                                ? "hover:bg-muted/60 cursor-pointer"
                                : "opacity-60 cursor-not-allowed",
                              completed && !isActive && "bg-green-50/50",
                              isActive && "bg-primary/10 ring-1 ring-primary/25",
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
                              <p className={cn(
                                "text-sm font-medium text-foreground",
                                isActive && "text-primary",
                              )}>{lesson.title as string}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant="outline" className="text-[10px] gap-1">
                                  {LESSON_TYPE_ICONS[lessonType] || "📝"}
                                  {LESSON_TYPE_LABELS[lessonType] || lessonType}
                                </Badge>
                                <span className="text-[10px] text-muted-foreground">{lesson.duration as number} min</span>
                              </div>
                            </div>
                            {isEnrolled && (
                              <ChevronRight className={cn(
                                "w-4 h-4 flex-shrink-0 transition-colors",
                                isActive ? "text-primary" : "text-muted-foreground/50",
                              )} />
                            )}
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

        <TabsContent value="ressources" className="mt-6">
          {resourcesLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-20 rounded-xl" />
              ))}
            </div>
          ) : resources.length === 0 ? (
            <Card className="border-border/60">
              <CardContent className="p-10 text-center">
                <div className="w-14 h-14 rounded-2xl bg-muted/60 flex items-center justify-center mx-auto mb-4">
                  <FolderOpen className="w-6 h-6 text-muted-foreground/60" />
                </div>
                <h3 className="font-semibold text-foreground mb-1">Aucune ressource</h3>
                <p className="text-sm text-muted-foreground">
                  Ce cours n'a pas encore de ressources téléchargeables.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {resources.map((resource) => (
                <Card key={resource.id} className="border-border/60 hover:border-primary/20 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0",
                        RESOURCE_TYPE_COLORS[resource.fileType] || "bg-gray-100 text-gray-600"
                      )}>
                        <ResourceIcon type={resource.fileType} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="text-sm font-semibold text-foreground truncate">{resource.title}</h4>
                          <Badge variant="secondary" className={cn("text-[10px] flex-shrink-0", RESOURCE_TYPE_COLORS[resource.fileType])}>
                            {RESOURCE_TYPE_LABELS[resource.fileType] || resource.fileType}
                          </Badge>
                          {resource.category && resource.category !== "AUTRE" && (
                            <Badge variant="outline" className="text-[10px] flex-shrink-0">
                              {RESOURCE_CATEGORY_LABELS[resource.category] || resource.category}
                            </Badge>
                          )}
                        </div>
                        {resource.description && (
                          <p className="text-xs text-muted-foreground line-clamp-1 mb-1">{resource.description}</p>
                        )}
                        <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                          <span>{formatFileSize(resource.fileSize)}</span>
                          <span>{resource.downloadCount} téléchargement{resource.downloadCount > 1 ? "s" : ""}</span>
                        </div>
                      </div>
                      {resource.isDownloadable && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-lg flex-shrink-0 gap-1.5 text-xs"
                          onClick={() => handleDownloadResource(resource.id)}
                        >
                          <Download className="w-3.5 h-3.5" />
                          Télécharger
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
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
