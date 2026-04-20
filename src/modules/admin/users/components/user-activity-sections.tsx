"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BookOpen, Award, Star, Route, Trophy, CheckCircle2, XCircle, Clock } from "lucide-react";
import { ROLE_LABELS, QUIZ_STATUS_LABELS, QUIZ_STATUS_COLORS } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface UserActivityPanelsProps {
  enrollments: Array<Record<string, unknown>>;
  certificates: Array<Record<string, unknown>>;
  quizAttempts: Array<Record<string, unknown>>;
  counts: Record<string, number>;
  pathEnrollments: Array<Record<string, unknown>>;
}

export function UserStatsGrid({ counts, passedQuizzes }: { counts: Record<string, number>; passedQuizzes: number }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {[
        { label: "Cours suivis", value: counts.enrollments || 0, icon: BookOpen, color: "bg-primary/10 text-primary" },
        { label: "Certificats", value: counts.certificates || 0, icon: Award, color: "bg-emerald-500/10 text-emerald-600" },
        { label: "Quiz réussis", value: passedQuizzes, icon: CheckCircle2, color: "bg-amber-500/10 text-amber-600" },
        { label: "Badges", value: counts.userBadges || 0, icon: Star, color: "bg-violet-500/10 text-violet-600" },
      ].map((stat) => (
        <Card key={stat.label} className="border-border/60">
          <CardContent className="p-4 flex items-center gap-3">
            <div className={cn("p-2 rounded-lg", stat.color)}>
              <stat.icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xl font-bold leading-none">{stat.value}</p>
              <p className="text-[11px] text-muted-foreground mt-1">{stat.label}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function LearningPathsCard({ pathEnrollments }: { pathEnrollments: Array<Record<string, unknown>> }) {
  return (
    <Card className="border-border/60">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Route className="w-4 h-4 text-primary" />
          Parcours d&apos;apprentissage
        </CardTitle>
      </CardHeader>
      <CardContent>
        {pathEnrollments.length === 0 ? (
          <div className="text-center py-8"><Route className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" /><p className="text-sm text-muted-foreground">Aucun parcours suivi</p></div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {pathEnrollments.slice(0, 10).map((pe) => {
              const path = pe.learningPath as Record<string, unknown>;
              const isCompleted = pe.status === "termine";
              const progress = (pe.progress as number) || 0;
              return (
                <div key={pe.id as string} className="p-3 rounded-lg border border-border/40 hover:border-border/80 transition-colors">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-medium truncate">{path.title as string}</p>
                        {!!path.isMandatory && <Badge variant="secondary" className="text-[9px] bg-red-50 text-red-600 border-red-200">Obligatoire</Badge>}
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-0.5">Parcours {ROLE_LABELS[path.targetRole as string] || (path.targetRole as string)}</p>
                    </div>
                    <Badge variant={isCompleted ? "default" : "secondary"} className={cn("text-[10px] flex-shrink-0", isCompleted ? "bg-green-100 text-green-700" : "")}>
                      {isCompleted ? "Terminé" : "En cours"}
                    </Badge>
                  </div>
                  <div className="mt-2">
                    <div className="flex items-center justify-between text-[11px] text-muted-foreground mb-1">
                      <span>Progression</span><span className="font-medium text-foreground">{Math.round(progress)}%</span>
                    </div>
                    <Progress value={progress} className="h-1.5" />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function QuizAndCoursesCards({
  enrollments,
  quizAttempts,
}: {
  enrollments: Array<Record<string, unknown>>;
  quizAttempts: Array<Record<string, unknown>>;
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="border-border/60">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Trophy className="w-4 h-4 text-primary" />
            Tentatives de quiz
            <Badge variant="secondary" className="text-[10px] ml-auto">{quizAttempts.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {quizAttempts.length === 0 ? (
            <div className="text-center py-8"><Trophy className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" /><p className="text-sm text-muted-foreground">Aucune tentative</p></div>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {quizAttempts.slice(0, 10).map((qa) => {
                const quiz = qa.quiz as Record<string, unknown>;
                const score = qa.score as number;
                const maxScore = qa.maxScore as number;
                const percentage = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
                const isPassed = qa.status === "REUSSI";
                const isFailed = qa.status === "ECHOUE";
                const submittedAt = qa.submittedAt as string | null;
                return (
                  <div key={qa.id as string} className="flex items-center justify-between p-2.5 rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={cn("w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0", isPassed ? "bg-green-100" : isFailed ? "bg-red-100" : "bg-gray-100")}>
                        {isPassed ? <CheckCircle2 className="w-4 h-4 text-green-600" /> : isFailed ? <XCircle className="w-4 h-4 text-red-600" /> : <Clock className="w-4 h-4 text-gray-500" />}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{quiz.title as string}</p>
                        <p className="text-[10px] text-muted-foreground">{submittedAt ? new Date(submittedAt).toLocaleDateString("fr-FR") : "En cours"}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className={cn("text-sm font-semibold", isPassed ? "text-green-700" : isFailed ? "text-red-700" : "text-muted-foreground")}>{percentage}%</span>
                      <Badge variant="secondary" className={cn("text-[9px]", QUIZ_STATUS_COLORS[(qa.status as string)] || "")}>
                        {QUIZ_STATUS_LABELS[(qa.status as string)] || String(qa.status)}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-border/60">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <BookOpen className="w-4 h-4 text-primary" />
            Cours suivis
            <Badge variant="secondary" className="text-[10px] ml-auto">{enrollments.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {enrollments.length === 0 ? (
            <div className="text-center py-8"><BookOpen className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" /><p className="text-sm text-muted-foreground">Aucun cours suivi</p></div>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {enrollments.slice(0, 10).map((e) => {
                const course = e.course as Record<string, unknown>;
                const progress = (e.progress as number) || 0;
                const isCompleted = e.status === "termine";
                return (
                  <div key={e.id as string} className="p-2.5 rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="min-w-0 mr-2">
                        <p className="text-sm font-medium truncate">{course.title as string}</p>
                        <p className="text-[10px] text-muted-foreground">{course.category as string}</p>
                      </div>
                      <Badge variant={isCompleted ? "default" : "secondary"} className={cn("text-[10px] flex-shrink-0", isCompleted ? "bg-green-100 text-green-700" : "")}>
                        {isCompleted ? "Terminé" : `${Math.round(progress)}%`}
                      </Badge>
                    </div>
                    {!isCompleted && <Progress value={progress} className="h-1" />}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export function CertificatesCard({ certificates }: { certificates: Array<Record<string, unknown>> }) {
  if (certificates.length === 0) return null;
  return (
    <Card className="border-border/60">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Award className="w-4 h-4 text-emerald-600" />
          Certificats obtenus
          <Badge variant="secondary" className="text-[10px] ml-auto">{certificates.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 max-h-72 overflow-y-auto">
          {certificates.slice(0, 10).map((cert) => (
            <div key={cert.id as string} className="flex items-center justify-between p-2.5 rounded-lg hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                  <Award className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{cert.courseTitle as string}</p>
                  <p className="text-[10px] text-muted-foreground">{cert.code as string} • {new Date(cert.issuedAt as string).toLocaleDateString("fr-FR")}</p>
                </div>
              </div>
              <span className="text-sm font-semibold text-foreground flex-shrink-0">{(cert.score as number) || 0}/{(cert.maxScore as number) || 0}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
