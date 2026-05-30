"use client";

import { useEffect, useState, useCallback } from "react";
import { useAppStore } from "@/store/app";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { BookOpen, Clock, Award, Trophy, GraduationCap, Zap } from "lucide-react";
import { StatCard } from "@/modules/shared/components/stat-card";
import { CourseProgressCard } from "./course-progress-card";
import type { CourseData, CourseProgressDetail, QuizAttemptData, CertificateData } from "../../types";
import { QuizAttemptsSection } from "./quiz-attempts-section";
import { AnalyticsCharts } from "./analytics-charts";
import { formatTime } from "@/utils/format";

// ─── Traceability Skeleton ────────────────────────────────────────────────────

function TraceabilitySkeleton() {
  return (
    <div className="space-y-6 animate-fadeIn">
      <Skeleton className="h-8 w-48" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-72 rounded-xl" />
      <Skeleton className="h-96 rounded-xl" />
    </div>
  );
}

// ─── Traceability Content ──────────────────────────────────────────────────────

function TraceabilityContent() {
  const { user, navigate } = useAppStore();
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState<CourseData[]>([]);
  const [progressMap, setProgressMap] = useState<Record<string, CourseProgressDetail>>({});
  const [certificates, setCertificates] = useState<CertificateData[]>([]);
  const [quizAttempts, setQuizAttempts] = useState<QuizAttemptData[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("courses");

  const fetchCourses = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/courses?userId=${user.id}&enrolled=true&page=${page}&limit=5`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setCourses(data.courses || []);
      setTotalPages(data.pagination?.totalPages || 1);
    } catch { setError("Erreur lors du chargement des cours"); } finally { setLoading(false); }
  }, [user, page]);

  const fetchCertificates = useCallback(async () => {
    if (!user) return;
    try {
      const res = await fetch(`/api/certificates?userId=${user.id}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setCertificates(data.certificates || []);
    } catch { /* silently fail */ }
  }, [user]);

  const fetchQuizAttempts = useCallback(async () => {
    if (!user) return;
    try {
      const res = await fetch(`/api/courses?userId=${user.id}&enrolled=true&limit=50`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      const allCourses = data.courses || [];
      const allAttempts: QuizAttemptData[] = [];
      for (const course of allCourses) {
        if (course.quiz) {
          try {
            const resultRes = await fetch(`/api/quiz/${course.quiz.id}/result?userId=${user.id}`);
            if (resultRes.ok) {
              const resultData = await resultRes.json();
              if (resultData.allAttempts) {
                for (const attempt of resultData.allAttempts) {
                  allAttempts.push({ ...attempt, quizTitle: resultData.quiz?.title, courseTitle: course.title, courseId: course.id });
                }
              }
            }
          } catch { /* skip */ }
        }
      }
      allAttempts.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
      setQuizAttempts(allAttempts);
    } catch { /* silently fail */ }
  }, [user]);

  const fetchProgress = useCallback(async (courseId: string) => {
    if (!user || progressMap[courseId]) return;
    try {
      const res = await fetch(`/api/courses/${courseId}/progress?userId=${user.id}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setProgressMap((prev) => ({ ...prev, [courseId]: data }));
    } catch { /* silently fail */ }
  }, [user, progressMap]);

  useEffect(() => { fetchCourses(); fetchCertificates(); fetchQuizAttempts(); }, [fetchCourses, fetchCertificates, fetchQuizAttempts]);
  useEffect(() => { for (const course of courses) { fetchProgress(course.id); } }, [courses, fetchProgress]);

  const handleViewCourse = (courseId: string, lessonId?: string) => {
    navigate("course-detail", { id: courseId, ...(lessonId ? { lessonId } : {}) });
  };

  const inProgressCount = courses.filter((c) => c.enrollments[0]?.status === "en_cours").length;
  const completedCount = courses.filter((c) => c.enrollments[0]?.status === "termine").length;
  const totalTimeSpent = Object.values(progressMap).reduce((sum, p) => sum + (p?.totalTimeSpent || 0), 0);
  const activeCerts = certificates.filter((c) => c.status === "ACTIVE");
  const passedQuizzes = quizAttempts.filter((a) => a.status === "REUSSI").length;
  const avgQuizScore = quizAttempts.length > 0
    ? Math.round(quizAttempts.reduce((sum, a) => { const pct = a.maxScore > 0 ? (a.score / a.maxScore) * 100 : 0; return sum + pct; }, 0) / quizAttempts.length)
    : 0;

  if (loading) return <TraceabilitySkeleton />;
  if (error) {
    return (
      <div className="text-center py-20 animate-fadeIn">
        <p className="text-muted-foreground mb-4">{error}</p>
        <Button variant="outline" onClick={fetchCourses}>Réessayer</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Page header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-foreground">Ma progression</h1>
        <p className="text-sm text-muted-foreground mt-1">Suivez votre parcours d&apos;apprentissage et votre progression</p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard icon={BookOpen} label="Cours en cours" value={inProgressCount} colorClass="text-primary" bgColor="bg-primary/10" />
        <StatCard icon={GraduationCap} label="Cours terminés" value={completedCount} colorClass="text-green-600" bgColor="bg-green-50" />
        <StatCard icon={Clock} label="Temps total" value={formatTime(totalTimeSpent)} colorClass="text-amber-600" bgColor="bg-amber-50" />
        <StatCard icon={Zap} label="Quiz réussis" value={`${passedQuizzes}/${quizAttempts.length}`} colorClass="text-purple-600" bgColor="bg-purple-50" />
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="courses" className="text-xs gap-1"><BookOpen className="w-3 h-3" /> Cours</TabsTrigger>
          <TabsTrigger value="quiz" className="text-xs gap-1"><Trophy className="w-3 h-3" /> Quiz</TabsTrigger>
          <TabsTrigger value="stats" className="text-xs gap-1"><Zap className="w-3 h-3" /> Statistiques</TabsTrigger>
          <TabsTrigger value="certificates" className="text-xs gap-1"><Award className="w-3 h-3" /> Certificats</TabsTrigger>
        </TabsList>

        <TabsContent value="courses" className="mt-4">
          {courses.length > 0 ? (
            <div className="space-y-4">
              {courses.map((course) => (
                <CourseProgressCard
                  key={course.id}
                  course={course}
                  progressDetail={progressMap[course.id] || { enrollment: course.enrollments[0] as never, lessons: [], totalTimeSpent: 0 }}
                  onViewCourse={handleViewCourse}
                  quizAttempts={quizAttempts.filter((a) => a.courseId === course.id)}
                />
              ))}
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 pt-4">
                  <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}>
                    Précédent
                  </Button>
                  <span className="text-sm text-muted-foreground">{page} / {totalPages}</span>
                  <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages}>
                    Suivant
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-16">
              <BookOpen className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
              <h3 className="font-semibold text-foreground mb-2">Aucun cours</h3>
              <p className="text-sm text-muted-foreground">Vous n&apos;êtes inscrit à aucun cours pour le moment.</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="quiz" className="mt-4">
          <QuizAttemptsSection attempts={quizAttempts} onViewCourse={handleViewCourse} />
        </TabsContent>

        <TabsContent value="stats" className="mt-4">
          <div className="grid grid-cols-2 gap-3 mb-6">
            <StatCard icon={Zap} label="Score moyen" value={`${avgQuizScore}%`} colorClass="text-blue-600" bgColor="bg-blue-50" />
            <StatCard icon={Trophy} label="Taux de réussite" value={`${quizAttempts.length > 0 ? Math.round((passedQuizzes / quizAttempts.length) * 100) : 0}%`} colorClass="text-amber-600" bgColor="bg-amber-50" />
          </div>
          <AnalyticsCharts courses={courses} progressMap={progressMap} quizAttempts={quizAttempts} />
        </TabsContent>

        <TabsContent value="certificates" className="mt-4">
          {activeCerts.length > 0 ? (
            <div className="space-y-3">
              {activeCerts.map((cert) => (
                <div key={cert.id} className="flex items-center gap-4 p-4 rounded-lg border border-border/60 bg-card">
                  <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center flex-shrink-0">
                    <Award className="w-6 h-6 text-amber-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-foreground">{cert.courseTitle}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Code: {cert.code}</p>
                    <p className="text-[10px] text-muted-foreground/70 mt-0.5">
                      Délivré le {new Date(cert.issuedAt).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-lg font-bold text-blue-600">{cert.maxScore > 0 ? Math.round((cert.score / cert.maxScore) * 100) : 0}%</p>
                    <p className="text-[10px] text-muted-foreground">{cert.score}/{cert.maxScore}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <Award className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
              <h3 className="font-semibold text-foreground mb-2">Aucun certificat</h3>
              <p className="text-sm text-muted-foreground">Complétez des cours avec quiz pour obtenir vos certificats.</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ─── Exported Page Component ───────────────────────────────────────────────────

export function LearnerTraceabilityPage() {
  return <TraceabilityContent />;
}
