"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  BarChart3, CheckCircle2, XCircle, Clock, Users, Target,
  TrendingUp, AlertTriangle, ArrowLeft, ChevronDown, ChevronUp,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from "recharts";
import { cn } from "@/lib/utils";
import { QUIZ_STATUS_LABELS, QUIZ_STATUS_COLORS } from "@/lib/constants";
import { QUIZ_STATUS_COLORS as QS_COLORS } from "@/lib/constants";

// ─── Types ────────────────────────────────────────────────────────

interface AttemptItem {
  id: string;
  userName: string;
  score: number;
  maxScore: number;
  status: string;
  duration: number;
  startedAt: string;
  submittedAt: string;
}

interface QuestionStats {
  questionId: string;
  text: string;
  type: string;
  totalAttempts: number;
  correctAttempts: number;
  correctRate: number;
  order: number;
}

interface QuizStatsData {
  totalAttempts: number;
  avgScore: number;
  avgScorePercent: number;
  passRate: number;
  completionRate: number;
  avgDuration: number;
  scoreDistribution: Array<{ range: string; count: number }>;
  difficultQuestions: QuestionStats[];
  attempts: AttemptItem[];
}

// ─── Helpers ──────────────────────────────────────────────────────

function formatDuration(sec: number): string {
  if (!sec) return "—";
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return m > 0 ? `${m}min ${s}s` : `${s}s`;
}

function formatDate(dateStr: string): string {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("fr-FR", {
    day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
  });
}

function getBarColor(value: number): string {
  if (value >= 70) return "#22c55e";
  if (value >= 40) return "#f59e0b";
  return "#ef4444";
}

// ─── Stat Card ────────────────────────────────────────────────────

function StatCard({
  icon: Icon, label, value, color,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
  color: string;
}) {
  return (
    <Card className="border-border/60">
      <CardContent className="p-4 flex items-center gap-3">
        <div className={cn("p-2 rounded-lg", color)}>
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <p className="text-xl font-bold leading-none">{value}</p>
          <p className="text-[11px] text-muted-foreground mt-1">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Main Component ───────────────────────────────────────────────

export function QuizResults({
  quizId,
  quizTitle,
  onBack,
}: {
  quizId: string;
  quizTitle: string;
  onBack: () => void;
}) {
  const [stats, setStats] = useState<QuizStatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedAttempt, setSelectedAttempt] = useState<AttemptItem | null>(null);
  const [attemptDetail, setAttemptDetail] = useState<Record<string, unknown> | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/quizzes/${quizId}/stats`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setStats(data);
    } catch {
      setStats(null);
    } finally {
      setLoading(false);
    }
  }, [quizId]);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  const fetchAttemptDetail = useCallback(async (attemptId: string) => {
    try {
      const res = await fetch(`/api/quiz/${quizId}/result?userId=__all__&attemptId=${attemptId}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setAttemptDetail(data);
    } catch {
      setAttemptDetail(null);
    }
  }, [quizId]);

  const handleSelectAttempt = (attempt: AttemptItem) => {
    if (selectedAttempt?.id === attempt.id) {
      setSelectedAttempt(null);
      setAttemptDetail(null);
    } else {
      setSelectedAttempt(attempt);
      fetchAttemptDetail(attempt.id);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Skeleton className="w-8 h-8 rounded-lg" />
          <Skeleton className="h-8 w-64" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Skeleton className="h-64 rounded-xl" />
          <Skeleton className="h-64 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="p-2 rounded-lg hover:bg-muted transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h2 className="text-xl font-bold text-foreground">Résultats — {quizTitle}</h2>
          <p className="text-xs text-muted-foreground">
            Statistiques et analyse des tentatives
          </p>
        </div>
      </div>

      {!stats || stats.totalAttempts === 0 ? (
        <Card className="border-border/60">
          <CardContent className="p-12 text-center">
            <BarChart3 className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">Aucune tentative pour ce quiz</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Stats Overview */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <StatCard icon={Users} label="Tentatives" value={stats.totalAttempts} color="bg-primary/10 text-primary" />
            <StatCard icon={Target} label="Score moyen" value={`${stats.avgScorePercent}%`} color="bg-amber-500/10 text-amber-600" />
            <StatCard icon={CheckCircle2} label="Taux réussite" value={`${stats.passRate}%`} color="bg-green-500/10 text-green-600" />
            <StatCard icon={TrendingUp} label="Taux complétion" value={`${stats.completionRate}%`} color="bg-violet-500/10 text-violet-600" />
            <StatCard icon={Clock} label="Temps moyen" value={formatDuration(stats.avgDuration)} color="bg-blue-500/10 text-blue-600" />
          </div>

          {/* Charts + Difficult Questions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Score Distribution */}
            <Card className="border-border/60">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-primary" /> Distribution des scores
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-52">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats.scoreDistribution} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="range" tick={{ fontSize: 10 }} />
                      <YAxis allowDecimals={false} tick={{ fontSize: 10 }} />
                      <Tooltip
                        contentStyle={{ fontSize: 12, borderRadius: 8 }}
                        formatter={(val: number) => [`${val} tentative${val > 1 ? "s" : ""}`, "Nombre"]}
                      />
                      <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                        {stats.scoreDistribution.map((entry, idx) => (
                          <Cell key={idx} fill={idx >= 7 ? "#22c55e" : idx >= 4 ? "#f59e0b" : "#ef4444"} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Most Difficult Questions */}
            <Card className="border-border/60">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-500" /> Questions les plus difficiles
                </CardTitle>
              </CardHeader>
              <CardContent>
                {stats.difficultQuestions.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">Toutes les questions sont bien réussies</p>
                ) : (
                  <div className="space-y-2 max-h-52 overflow-y-auto">
                    {stats.difficultQuestions.slice(0, 8).map((q) => (
                      <div key={q.questionId} className="flex items-center gap-3 p-2 rounded-lg border border-border/40">
                        <span className="text-[10px] font-bold text-muted-foreground w-6">Q{q.order + 1}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-foreground truncate">{q.text}</p>
                          <p className="text-[10px] text-muted-foreground">
                            {q.correctAttempts}/{q.totalAttempts} correct{q.totalAttempts > 1 ? "s" : ""}
                          </p>
                        </div>
                        <Badge variant="secondary" className={cn(
                          "text-[10px] flex-shrink-0",
                          q.correctRate >= 70 ? "bg-emerald-50 dark:bg-emerald-500/10 text-green-700"
                            : q.correctRate >= 40 ? "bg-amber-50 dark:bg-amber-500/10 text-amber-700"
                            : "bg-red-50 dark:bg-red-500/10 text-red-700"
                        )}>
                          {q.correctRate}%
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <Separator />

          {/* Attempts List */}
          <Card className="border-border/60">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Users className="w-4 h-4 text-primary" />
                Tentatives ({stats.attempts.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {stats.attempts.map((attempt) => {
                  const scorePercent = attempt.maxScore > 0
                    ? Math.round((attempt.score / attempt.maxScore) * 100) : 0;
                  const isSelected = selectedAttempt?.id === attempt.id;
                  return (
                    <div key={attempt.id}>
                      <button
                        onClick={() => handleSelectAttempt(attempt)}
                        className={cn(
                          "w-full flex items-center gap-3 p-3 rounded-lg border transition-all text-left",
                          isSelected
                            ? "border-primary/50 bg-primary/5"
                            : "border-border/40 hover:border-border/80"
                        )}
                      >
                        <div className={cn(
                          "w-9 h-9 rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0",
                          attempt.status === "REUSSI"
                            ? "bg-emerald-50 dark:bg-emerald-500/10 text-green-700"
                            : "bg-red-50 dark:bg-red-500/10 text-red-700"
                        )}>
                          {scorePercent}%
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground">{attempt.userName}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <Badge variant="secondary" className={cn("text-[9px]", QS_COLORS[attempt.status])}>
                              {QUIZ_STATUS_LABELS[attempt.status] || attempt.status}
                            </Badge>
                            <span className="text-[10px] text-muted-foreground">
                              {attempt.score}/{attempt.maxScore}
                            </span>
                            <span className="text-[10px] text-muted-foreground">•</span>
                            <span className="text-[10px] text-muted-foreground">
                              {formatDuration(attempt.duration)}
                            </span>
                          </div>
                        </div>
                        <span className="text-[10px] text-muted-foreground hidden sm:block">
                          {formatDate(attempt.submittedAt)}
                        </span>
                        {isSelected ? (
                          <ChevronUp className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                        )}
                      </button>

                      {/* Attempt Detail */}
                      {isSelected && attemptDetail && attemptDetail.results && (
                        <div className="ml-4 mt-1 mb-2 p-3 rounded-lg bg-muted/30 border border-border/30 space-y-2">
                          {(attemptDetail.results as Array<Record<string, unknown>>).map(
                            (r: Record<string, unknown>, idx: number) => (
                              <div key={String(r.questionId)} className={cn(
                                "flex items-start gap-2 p-2 rounded text-xs",
                                r.isCorrect ? "bg-emerald-50 dark:bg-emerald-500/10" : "bg-red-50 dark:bg-red-500/10"
                              )}>
                                {r.isCorrect
                                  ? <CheckCircle2 className="w-3.5 h-3.5 text-green-500 mt-0.5 flex-shrink-0" />
                                  : <XCircle className="w-3.5 h-3.5 text-red-500 mt-0.5 flex-shrink-0" />}
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium truncate">
                                    Q{idx + 1}: {String(r.questionText || "").substring(0, 80)}
                                  </p>
                                  {r.explanation && (
                                    <p className="text-muted-foreground mt-0.5 italic">💡 {String(r.explanation)}</p>
                                  )}
                                </div>
                                <span className="flex-shrink-0 text-muted-foreground">
                                  {r.pointsEarned}/{r.maxPoints} pt{Number(r.maxPoints) > 1 ? "s" : ""}
                                </span>
                              </div>
                            )
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
