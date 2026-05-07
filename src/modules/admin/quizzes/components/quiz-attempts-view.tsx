"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  FileQuestion, Target, BarChart3, CheckCircle2, Clock,
  ChevronLeft, ChevronRight, Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { QuizStats } from "../types";

// ============================================
// Types
// ============================================
interface AttemptRow {
  id: string;
  userId: string;
  userName: string;
  userPrenom: string;
  userNom: string;
  userAvatar: string | null;
  score: number;
  maxScore: number;
  scorePercent: number;
  status: string;
  duration: number;
  startedAt: string;
  submittedAt: string | null;
  attemptNumber: number;
}

// ============================================
// Stat Card Helper
// ============================================
function StatCard({
  icon: Icon, label, value, color,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number | string;
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

// ============================================
// Status badge config
// ============================================
const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  EN_COURS: {
    label: "En cours",
    className: "bg-amber-100 text-amber-800 border-amber-200",
  },
  SOUMIS: {
    label: "Soumis",
    className: "bg-blue-100 text-blue-800 border-blue-200",
  },
  REUSSI: {
    label: "Réussi",
    className: "bg-green-100 text-green-800 border-green-200",
  },
  ECHOUE: {
    label: "Échoué",
    className: "bg-red-100 text-red-800 border-red-200",
  },
};

// ============================================
// Helpers
// ============================================
function formatFrenchDate(isoString: string | null): string {
  if (!isoString) return "—";
  const d = new Date(isoString);
  return d.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDuration(seconds: number): string {
  if (!seconds || seconds <= 0) return "—";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (m === 0) return `${s}s`;
  return `${m} min ${s}s`;
}

function getInitials(prenom: string, nom: string): string {
  return `${(prenom?.[0] ?? "").toUpperCase()}${(nom?.[0] ?? "").toUpperCase()}`;
}

// ============================================
// Quiz Attempts & Statistics View
// ============================================
interface QuizAttemptsViewProps {
  quizId: string;
  questionCount: number;
  totalPoints: number;
  stats: QuizStats;
  duration: number;
  passingScore: number;
  maxAttempts: number;
  shuffleQuestions: boolean;
}

const PAGE_SIZE = 10;

export function QuizAttemptsView({
  quizId, questionCount, totalPoints, stats, duration, passingScore, maxAttempts, shuffleQuestions,
}: QuizAttemptsViewProps) {
  const [attempts, setAttempts] = useState<AttemptRow[]>([]);
  const [loadingAttempts, setLoadingAttempts] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchAttempts = useCallback(async (p: number) => {
    setLoadingAttempts(true);
    try {
      const params = new URLSearchParams({
        quizId,
        page: String(p),
        limit: String(PAGE_SIZE),
      });
      const res = await fetch(`/api/admin/quiz-attempts?${params}`);
      const data = await res.json();
      setAttempts(data.attempts || []);
      setTotalPages(data.pagination?.totalPages || 1);
      setTotal(data.pagination?.total || 0);
    } catch {
      setAttempts([]);
    } finally {
      setLoadingAttempts(false);
    }
  }, [quizId]);

  useEffect(() => {
    fetchAttempts(page);
  }, [page, fetchAttempts]);

  return (
    <>
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <StatCard
          icon={FileQuestion} label="Questions" value={questionCount}
          color="bg-primary/10 text-primary"
        />
        <StatCard
          icon={Target} label="Points total" value={totalPoints || 0}
          color="bg-amber-500/10 text-amber-600"
        />
        <StatCard
          icon={BarChart3} label="Tentatives" value={stats.submittedCount}
          color="bg-violet-500/10 text-violet-600"
        />
        <StatCard
          icon={CheckCircle2} label="Taux réussite" value={`${stats.passRate}%`}
          color="bg-green-500/10 text-green-600"
        />
        <StatCard
          icon={BarChart3} label="Score moyen" value={`${stats.avgScore}%`}
          color="bg-emerald-500/10 text-emerald-600"
        />
      </div>

      {/* Settings summary */}
      <Card className="border-border/60">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <h3 className="text-sm font-semibold">Paramètres</h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Durée</p>
              <p className="font-medium">{duration} min</p>
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Score minimum</p>
              <p className="font-medium">{passingScore}%</p>
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Max tentatives</p>
              <p className="font-medium">{maxAttempts}</p>
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Mélanger</p>
              <p className="font-medium">{shuffleQuestions ? "Oui" : "Non"}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Individual Attempts Table */}
      <Card className="border-border/60">
        <CardContent className="p-0">
          <div className="flex items-center gap-2 p-4 pb-3">
            <Users className="w-4 h-4 text-muted-foreground" />
            <h3 className="text-sm font-semibold">Tentatives des apprenants</h3>
            <span className="text-xs text-muted-foreground ml-auto">{total} résultat{total > 1 ? "s" : ""}</span>
          </div>

          {loadingAttempts ? (
            <div className="p-8 text-center">
              <div className="animate-pulse space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-10 bg-muted rounded" />
                ))}
              </div>
            </div>
          ) : attempts.length === 0 ? (
            <div className="p-8 text-center">
              <Users className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">Aucune tentative pour le moment</p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="pl-4">Apprenant</TableHead>
                    <TableHead>Tentative</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Durée</TableHead>
                    <TableHead>Date de soumission</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {attempts.map((a) => {
                    const passed = a.scorePercent >= passingScore;
                    const statusCfg = STATUS_CONFIG[a.status] || {
                      label: a.status,
                      className: "bg-gray-100 text-gray-800 border-gray-200",
                    };

                    return (
                      <TableRow key={a.id}>
                        {/* Learner name + avatar */}
                        <TableCell className="pl-4">
                          <div className="flex items-center gap-3">
                            <Avatar className="size-8">
                              {a.userAvatar && <AvatarImage src={a.userAvatar} alt={a.userName} />}
                              <AvatarFallback className="text-[11px] font-medium">
                                {getInitials(a.userPrenom, a.userNom)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-sm leading-none">{a.userName}</p>
                            </div>
                          </div>
                        </TableCell>

                        {/* Attempt number */}
                        <TableCell>
                          <span className="text-sm text-muted-foreground">#{a.attemptNumber}</span>
                        </TableCell>

                        {/* Score */}
                        <TableCell>
                          <div className="flex flex-col">
                            <span
                              className={cn(
                                "text-sm font-bold",
                                passed ? "text-green-600" : "text-red-600",
                              )}
                            >
                              {a.scorePercent}%
                            </span>
                            <span className="text-[10px] text-muted-foreground">
                              {a.score}/{a.maxScore} pts
                            </span>
                          </div>
                        </TableCell>

                        {/* Status */}
                        <TableCell>
                          <Badge variant="outline" className={cn("text-[11px]", statusCfg.className)}>
                            {statusCfg.label}
                          </Badge>
                        </TableCell>

                        {/* Duration */}
                        <TableCell>
                          <span className="text-sm text-muted-foreground">
                            {formatDuration(a.duration)}
                          </span>
                        </TableCell>

                        {/* Submitted date */}
                        <TableCell>
                          <span className="text-sm text-muted-foreground">
                            {formatFrenchDate(a.submittedAt)}
                          </span>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-4 py-3 border-t">
                  <p className="text-xs text-muted-foreground">
                    Page {page} sur {totalPages}
                  </p>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 px-2"
                      disabled={page <= 1}
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    {/* Page numbers */}
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter((n) => {
                        // Show first, last, current, and neighbors
                        if (n === 1 || n === totalPages) return true;
                        if (Math.abs(n - page) <= 1) return true;
                        return false;
                      })
                      .reduce<(number | "...")[]>((acc, n, idx, arr) => {
                        if (idx > 0 && n - (arr[idx - 1] as number) > 1) {
                          acc.push("...");
                        }
                        acc.push(n);
                        return acc;
                      }, [])
                      .map((item, idx) =>
                        item === "..." ? (
                          <span key={`dots-${idx}`} className="px-1 text-xs text-muted-foreground">
                            …
                          </span>
                        ) : (
                          <Button
                            key={item}
                            variant={page === item ? "default" : "outline"}
                            size="sm"
                            className="h-7 w-7 p-0 text-xs"
                            onClick={() => setPage(item as number)}
                          >
                            {item}
                          </Button>
                        ),
                      )}
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 px-2"
                      disabled={page >= totalPages}
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </>
  );
}
