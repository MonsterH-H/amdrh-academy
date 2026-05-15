"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft, Download, Mail, Phone, MapPin, CreditCard,
  BookOpen, Award, ClipboardCheck, TrendingUp, Clock, Lightbulb,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useAppStore } from "@/store/app";
import { cn } from "@/lib/utils";
import {
  ROLE_LABELS, ROLE_COLORS, ENROLLMENT_STATUS_LABELS, ENROLLMENT_STATUS_COLORS,
  QUIZ_STATUS_LABELS, QUIZ_STATUS_COLORS,
} from "@/lib/constants";

// ─── Types ───────────────────────────────────────────────────────────────────

interface ProgressData {
  student: {
    id: string; email: string; nom: string; prenom: string; telephone: string | null;
    avatar: string | null; role: string; licenceNumber: string | null; club: string | null;
    region: string | null; bio: string | null; isActive: boolean; emailVerified: boolean;
    lastLoginAt: string | null; createdAt: string;
  };
  enrollments: Array<{
    id: string; progress: number; status: string; startedAt: string;
    completedAt: string | null; lastAccessAt: string;
    course: { id: string; title: string; category: string; difficulty: string; status: string; isCertifying: boolean };
    lessonCount: number; completedLessons: number;
  }>;
  quizAttempts: Array<{
    id: string; score: number; maxScore: number; status: string; duration: number;
    startedAt: string; submittedAt: string | null;
    quiz: { id: string; title: string; passingScore: number; course: { id: string; title: string } };
  }>;
  certificates: Array<{ id: string; courseTitle: string; score: number; maxScore: number; issuedAt: string; status: string }>;
  badges: Array<{ id: string; name: string; level: string; earnedAt: string }>;
  timeline: Array<{ id: string; type: string; title: string; description: string; timestamp: number }>;
  summary: {
    totalEnrollments: number; completedEnrollments: number; avgProgress: number;
    passedQuizzes: number; totalQuizAttempts: number; avgQuizScore: number;
    totalCertificates: number; totalBadges: number;
  };
  recommendations: string[];
}

// ─── Main Component ──────────────────────────────────────────────────────────

export function StudentProgressView({ studentId }: { studentId: string }) {
  const { user, navigate } = useAppStore();
  const [data, setData] = useState<ProgressData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/formateur/student-progress/${studentId}?userId=${user?.id}&role=${user?.role}`);
      if (!res.ok) throw new Error("Erreur");
      const json = await res.json();
      setData(json);
    } catch {
      toast({ title: "Erreur", description: "Impossible de charger la progression.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [studentId, user]);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (loading) return <StudentProgressSkeleton />;
  if (!data) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground">Impossible de charger la progression de l&apos;étudiant.</p>
      </div>
    );
  }

  const { student, enrollments, quizAttempts, certificates, badges, timeline, summary, recommendations } = data;

  const handleExport = () => {
    const lines: string[] = [];
    lines.push(`Progression de ${student.prenom} ${student.nom}`);
    lines.push(`Email: ${student.email}`);
    lines.push(`Rôle: ${ROLE_LABELS[student.role] || student.role}`);
    lines.push("");
    lines.push("=== RÉSUMÉ ===");
    lines.push(`Inscriptions: ${summary.totalEnrollments}`);
    lines.push(`Complétées: ${summary.completedEnrollments}`);
    lines.push(`Progression moyenne: ${summary.avgProgress}%`);
    lines.push(`Quiz réussis: ${summary.passedQuizzes}/${summary.totalQuizAttempts}`);
    lines.push(`Score quiz moyen: ${summary.avgQuizScore}%`);
    lines.push(`Certificats: ${summary.totalCertificates}`);
    lines.push(`Badges: ${summary.totalBadges}`);
    lines.push("");
    lines.push("=== FORMATIONS ===");
    for (const e of enrollments) {
      lines.push(`${e.course.title} - ${e.progress}% (${ENROLLMENT_STATUS_LABELS[e.status] || e.status})`);
    }
    lines.push("");
    lines.push("=== TENTATIVES QUIZ ===");
    for (const q of quizAttempts) {
      const score = q.maxScore > 0 ? Math.round((q.score / q.maxScore) * 100) : 0;
      lines.push(`${q.quiz.title} - ${score}% (${QUIZ_STATUS_LABELS[q.status] || q.status})`);
    }
    const blob = new Blob([lines.join("\n")], { type: "text/plain;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `progression-${student.prenom}-${student.nom}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Export réussi" });
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Back button */}
      <button onClick={() => navigate("admin-users")} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="w-4 h-4" /> Retour
      </button>

      {/* Student Profile */}
      <Card className="border-border/60">
        <CardContent className="p-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <Avatar className="w-16 h-16">
                <AvatarFallback className="bg-primary/10 text-primary text-lg font-bold">
                  {student.prenom.charAt(0)}{student.nom.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-xl font-bold text-foreground">{student.prenom} {student.nom}</h2>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <Badge variant="secondary" className={cn("text-[10px]", ROLE_COLORS[student.role] || "")}>{ROLE_LABELS[student.role] || student.role}</Badge>
                  {student.isActive ? <Badge variant="secondary" className="text-[10px] bg-emerald-50 dark:bg-emerald-500/10 text-green-700">Actif</Badge> : null}
                </div>
                <div className="flex flex-wrap gap-3 mt-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {student.email}</span>
                  {student.telephone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {student.telephone}</span>}
                  {student.club && <span className="flex items-center gap-1"><CreditCard className="w-3 h-3" /> {student.club}</span>}
                  {student.region && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {student.region}</span>}
                </div>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={handleExport} className="rounded-lg text-xs gap-1.5">
              <Download className="w-3.5 h-3.5" /> Exporter le rapport
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatMini icon={BookOpen} label="Inscriptions" value={`${summary.completedEnrollments}/${summary.totalEnrollments}`} color="text-sky-600" />
        <StatMini icon={TrendingUp} label="Progression moy." value={`${summary.avgProgress}%`} color="text-emerald-600" />
        <StatMini icon={ClipboardCheck} label="Quiz réussis" value={`${summary.passedQuizzes}/${summary.totalQuizAttempts}`} color="text-amber-600" />
        <StatMini icon={Award} label="Certificats" value={String(summary.totalCertificates)} color="text-violet-600" />
      </div>

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <Card className="border-amber-200 dark:border-amber-500/30 bg-amber-50/50 dark:bg-amber-500/5">
          <CardContent className="p-4">
            <h4 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-amber-600" /> Recommandations
            </h4>
            <ul className="space-y-1">
              {recommendations.map((r, i) => (
                <li key={i} className="text-xs text-muted-foreground">• {r}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Course Progress */}
        <div className="lg:col-span-2">
          <Card className="border-border/60">
            <CardContent className="p-6">
              <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-primary" /> Progression par formation
              </h3>
              {enrollments.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">Aucune inscription</p>
              ) : (
                <div className="space-y-3 max-h-80 overflow-y-auto">
                  {enrollments.map((e) => (
                    <div key={e.id} className="p-3 rounded-lg bg-muted/20 hover:bg-muted/30 transition-colors">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-medium text-foreground truncate">{e.course.title}</p>
                        <div className="flex items-center gap-2 shrink-0">
                          <Badge variant="secondary" className={cn("text-[9px]", ENROLLMENT_STATUS_COLORS[e.status] || "bg-muted text-foreground")}>
                            {ENROLLMENT_STATUS_LABELS[e.status] || e.status}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mb-2">
                        <span>{e.completedLessons}/{e.lessonCount} leçons</span>
                        <span>·</span>
                        <span>{e.progress}%</span>
                        <span>·</span>
                        <span>{new Date(e.lastAccessAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}</span>
                      </div>
                      <Progress value={e.progress} className="h-1.5" />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quiz Attempts */}
        <div>
          <Card className="border-border/60">
            <CardContent className="p-6">
              <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                <ClipboardCheck className="w-4 h-4 text-primary" /> Tentatives quiz
              </h3>
              {quizAttempts.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">Aucune tentative</p>
              ) : (
                <div className="space-y-2 max-h-80 overflow-y-auto">
                  {quizAttempts.slice(0, 10).map((q) => {
                    const score = q.maxScore > 0 ? Math.round((q.score / q.maxScore) * 100) : 0;
                    return (
                      <div key={q.id} className="p-2.5 rounded-lg bg-muted/20">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-medium text-foreground truncate">{q.quiz.title}</p>
                          <Badge variant="secondary" className={cn("text-[9px] shrink-0 ml-2", QUIZ_STATUS_COLORS[q.status] || "bg-muted text-foreground")}>
                            {score}%
                          </Badge>
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-1">
                          {q.quiz.course.title} · {q.submittedAt ? new Date(q.submittedAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short" }) : "En cours"}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Activity Timeline */}
      <Card className="border-border/60">
        <CardContent className="p-6">
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary" /> Chronologie d&apos;activité
          </h3>
          {timeline.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">Aucune activité</p>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {timeline.slice(0, 15).map((item) => (
                <div key={item.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/30 transition-colors">
                  <TimelineDot type={item.type} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-foreground">{item.title}</p>
                    <p className="text-[10px] text-muted-foreground truncate">{item.description}</p>
                  </div>
                  <span className="text-[10px] text-muted-foreground shrink-0">
                    {new Date(item.timestamp).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function StatMini({ icon: Icon, label, value, color }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string; color: string }) {
  return (
    <Card className="border-border/60">
      <CardContent className="p-4 flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-muted/50 flex items-center justify-center">
          <Icon className={cn("w-4 h-4", color)} />
        </div>
        <div>
          <p className="text-lg font-bold text-foreground">{value}</p>
          <p className="text-[10px] text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function TimelineDot({ type }: { type: string }) {
  const colorMap: Record<string, string> = {
    enrollment: "bg-sky-500",
    completion: "bg-emerald-500",
    quiz: "bg-amber-500",
    certificate: "bg-violet-500",
    badge: "bg-orange-500",
  };
  return <div className={cn("w-2 h-2 rounded-full shrink-0", colorMap[type] || "bg-muted-foreground")} />;
}

// ─── Skeleton ────────────────────────────────────────────────────────────────

function StudentProgressSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-6 w-32" />
      <Skeleton className="h-32 rounded-xl" />
      <div className="grid grid-cols-4 gap-4">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}</div>
      <div className="grid lg:grid-cols-3 gap-6"><div className="lg:col-span-2"><Skeleton className="h-72 rounded-xl" /></div><Skeleton className="h-72 rounded-xl" /></div>
    </div>
  );
}
