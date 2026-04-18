"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  TrendingUp, CheckCircle, Clock, Target, Search, Download,
  ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Filter,
  Loader2, Award, AlertCircle, BookOpen,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import {
  LESSON_TYPE_LABELS, LESSON_TYPE_COLORS,
  CATEGORY_LABELS, ENROLLMENT_STATUS_LABELS, ENROLLMENT_STATUS_COLORS,
  COMPLETION_TRIGGER_LABELS,
} from "@/lib/constants";

// ─── Types ────────────────────────────────────────────────────────────────────

interface LessonDetail {
  id: string;
  lessonId: string;
  lessonTitle: string;
  lessonType: string;
  completed: boolean;
  timeSpent: number;
  watchPercentage: number;
  scrollPercentage: number;
  completionTrigger: string;
  completedAt: string | null;
  viewedAt: string;
}

interface EnrollmentRow {
  id: string;
  userId: string;
  courseId: string;
  userName: string;
  userEmail: string;
  userRole: string;
  userInitials: string;
  courseTitle: string;
  courseCategory: string;
  progress: number;
  status: string;
  completedLessons: number;
  totalLessons: number;
  totalTimeSpent: number;
  quizBestScore: string | null;
  quizStatus: string | null;
  certificateId: string | null;
  certificateCode: string | null;
  certificateStatus: string | null;
  lastAccessAt: string;
  startedAt: string;
  completedAt: string | null;
  lessonDetails: LessonDetail[];
}

interface TraceStats {
  totalEnrolled: number;
  totalCompleted: number;
  totalAbandoned: number;
  avgCompletionRate: number;
  avgTimePerCourse: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatTime(seconds: number): string {
  if (seconds < 60) return `${Math.round(seconds)}min`;
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}min`;
  return `${m}min`;
}

function timeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffMs = now - then;
  const diffMin = Math.floor(diffMs / 60000);
  const diffH = Math.floor(diffMin / 60);
  const diffD = Math.floor(diffH / 24);
  if (diffMin < 1) return "à l'instant";
  if (diffMin < 60) return `il y a ${diffMin}min`;
  if (diffH < 24) return `il y a ${diffH}h`;
  if (diffD < 7) return `il y a ${diffD}j`;
  return new Date(dateStr).toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function AdminTraceabilityPage() {
  const [enrollments, setEnrollments] = useState<EnrollmentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<TraceStats | null>(null);
  const [search, setSearch] = useState("");
  const [courseId, setCourseId] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [detailsLoading, setDetailsLoading] = useState<string | null>(null);
  const [courses, setCourses] = useState<Array<{ id: string; title: string }>>([]);

  // Fetch courses for filter dropdown
  useEffect(() => {
    fetch("/api/courses?limit=200")
      .then((r) => r.json())
      .then((d) => setCourses(d.courses || []))
      .catch(() => {});
  }, []);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ page: String(page), limit: "10" });
      if (search) params.set("search", search);
      if (courseId && courseId !== "all") params.set("courseId", courseId);
      if (statusFilter && statusFilter !== "all") params.set("status", statusFilter);

      const res = await fetch(`/api/admin/traceability?${params}`);
      const data = await res.json();
      setEnrollments(data.enrollments || []);
      setTotalPages(data.pagination?.totalPages || 1);
      setTotal(data.pagination?.total || 0);
      setStats(data.stats || null);
    } catch {
      toast({ title: "Erreur", description: "Impossible de charger les données.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [page, search, courseId, statusFilter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setExpandedId(null);
  };

  const handleFilterChange = (key: string, value: string) => {
    if (key === "courseId") setCourseId(value);
    if (key === "status") setStatusFilter(value);
    setPage(1);
    setExpandedId(null);
  };

  const handleToggleExpand = async (row: EnrollmentRow) => {
    if (expandedId === row.id) {
      setExpandedId(null);
      return;
    }

    if (row.lessonDetails.length > 0) {
      setExpandedId(row.id);
      return;
    }

    // Fetch lesson details
    setDetailsLoading(row.id);
    try {
      const params = new URLSearchParams({ page: String(page), limit: "10", includeDetails: "true" });
      if (search) params.set("search", search);
      if (courseId && courseId !== "all") params.set("courseId", courseId);
      if (statusFilter && statusFilter !== "all") params.set("status", statusFilter);
      const res = await fetch(`/api/admin/traceability?${params}`);
      const data = await res.json();
      const found = (data.enrollments || []).find((e: EnrollmentRow) => e.id === row.id);
      if (found) {
        setEnrollments((prev) =>
          prev.map((e) => (e.id === row.id ? { ...e, lessonDetails: found.lessonDetails } : e))
        );
      }
      setExpandedId(row.id);
    } catch {
      toast({ title: "Erreur", description: "Impossible de charger les détails.", variant: "destructive" });
    } finally {
      setDetailsLoading(null);
    }
  };

  const handleExport = () => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (courseId && courseId !== "all") params.set("courseId", courseId);
    if (statusFilter && statusFilter !== "all") params.set("status", statusFilter);
    window.open(`/api/admin/traceability/export?${params}`, "_blank");
  };

  if (loading && enrollments.length === 0) return <TraceabilitySkeleton />;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Traçabilité</h2>
          <p className="text-muted-foreground mt-1">Suivi détaillé de la progression des apprenants</p>
        </div>
        <Button variant="outline" size="sm" onClick={handleExport} className="rounded-lg border-border/60 text-xs">
          <Download className="w-4 h-4 mr-1.5" />
          Exporter CSV
        </Button>
      </div>

      {/* Stats Row */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="border-border/60 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-0.5 bg-blue-500" />
            <CardContent className="p-4 flex items-center gap-3">
              <div className="bg-blue-50 text-blue-600 p-2.5 rounded-lg">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <p className="text-2xl font-bold leading-none text-foreground">{stats.totalEnrolled}</p>
                <p className="text-[11px] text-muted-foreground mt-1">Inscriptions en cours</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/60 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-0.5 bg-green-500" />
            <CardContent className="p-4 flex items-center gap-3">
              <div className="bg-green-50 text-green-600 p-2.5 rounded-lg">
                <CheckCircle className="w-5 h-5" />
              </div>
              <div>
                <p className="text-2xl font-bold leading-none text-foreground">{stats.totalCompleted}</p>
                <p className="text-[11px] text-muted-foreground mt-1">Inscriptions terminées</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/60 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-0.5 bg-amber-500" />
            <CardContent className="p-4 flex items-center gap-3">
              <div className="bg-amber-50 text-amber-600 p-2.5 rounded-lg">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <p className="text-2xl font-bold leading-none text-foreground">{formatTime(stats.avgTimePerCourse)}</p>
                <p className="text-[11px] text-muted-foreground mt-1">Temps moyen / cours</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/60 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-0.5 bg-purple-500" />
            <CardContent className="p-4 flex items-center gap-3">
              <div className="bg-purple-50 text-purple-600 p-2.5 rounded-lg">
                <Target className="w-5 h-5" />
              </div>
              <div>
                <p className="text-2xl font-bold leading-none text-foreground">{stats.avgCompletionRate}%</p>
                <p className="text-[11px] text-muted-foreground mt-1">Taux de complétion moyen</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-end">
        <form onSubmit={handleSearch} className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher par nom ou email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 rounded-lg h-10"
          />
        </form>
        <div className="flex items-center gap-2 flex-wrap">
          <Select value={courseId} onValueChange={(v) => handleFilterChange("courseId", v)}>
            <SelectTrigger className="h-10 rounded-lg w-48 text-xs">
              <BookOpen className="w-4 h-4 mr-1.5 text-muted-foreground" />
              <SelectValue placeholder="Tous les cours" />
            </SelectTrigger>
            <SelectContent className="max-h-60">
              <SelectItem value="all">Tous les cours</SelectItem>
              {courses.map((c) => (
                <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={(v) => handleFilterChange("status", v)}>
            <SelectTrigger className="h-10 rounded-lg w-36 text-xs">
              <Filter className="w-4 h-4 mr-1.5 text-muted-foreground" />
              <SelectValue placeholder="Tous" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les statuts</SelectItem>
              <SelectItem value="en_cours">En cours</SelectItem>
              <SelectItem value="termine">Terminé</SelectItem>
              <SelectItem value="abandonne">Abandonné</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{total} inscription{total > 1 ? "s" : ""}</p>
      </div>

      {/* Table */}
      {enrollments.length === 0 ? (
        <div className="text-center py-20">
          <AlertCircle className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
          <h3 className="font-semibold text-foreground mb-2">Aucune inscription trouvée</h3>
          <p className="text-sm text-muted-foreground">Modifiez vos filtres pour voir plus de résultats</p>
        </div>
      ) : (
        <>
          <Card className="border-border/60 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-muted/50 text-xs text-muted-foreground">
                    <th className="text-left py-3 px-4 font-medium">Apprenant</th>
                    <th className="text-left py-3 px-4 font-medium hidden sm:table-cell">Cours</th>
                    <th className="text-left py-3 px-4 font-medium hidden md:table-cell">Progression</th>
                    <th className="text-left py-3 px-4 font-medium hidden lg:table-cell">Leçons</th>
                    <th className="text-left py-3 px-4 font-medium hidden lg:table-cell">Temps</th>
                    <th className="text-left py-3 px-4 font-medium hidden xl:table-cell">Quiz</th>
                    <th className="text-left py-3 px-4 font-medium hidden xl:table-cell">Certificat</th>
                    <th className="text-left py-3 px-4 font-medium hidden md:table-cell">Statut</th>
                    <th className="text-left py-3 px-4 font-medium hidden lg:table-cell">Dernier accès</th>
                    <th className="text-right py-3 px-4 font-medium">Détails</th>
                  </tr>
                </thead>
                <tbody>
                  {enrollments.map((row) => (
                    <EnrollmentRowComponent
                      key={row.id}
                      row={row}
                      expanded={expandedId === row.id}
                      detailsLoading={detailsLoading === row.id}
                      onToggle={() => handleToggleExpand(row)}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)} className="rounded-lg">
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="text-sm text-muted-foreground">Page {page} / {totalPages}</span>
              <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)} className="rounded-lg">
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ─── Enrollment Row Component ─────────────────────────────────────────────────

function EnrollmentRowComponent({
  row, expanded, detailsLoading, onToggle,
}: {
  row: EnrollmentRow;
  expanded: boolean;
  detailsLoading: boolean;
  onToggle: () => void;
}) {
  const isExpanded = expanded;
  const progressColor =
    row.progress >= 80 ? "text-green-600" : row.progress >= 40 ? "text-amber-600" : "text-red-500";

  return (
    <>
      <tr className="border-t border-border/30 hover:bg-muted/30 transition-colors">
        {/* Apprenant */}
        <td className="py-3 px-4">
          <div className="flex items-center gap-2.5">
            <Avatar className="w-8 h-8">
              <AvatarFallback className="text-[10px] font-bold bg-primary/10 text-primary">
                {row.userInitials}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="text-sm font-medium truncate max-w-[160px]">{row.userName}</p>
              <p className="text-[10px] text-muted-foreground truncate max-w-[160px]">{row.userEmail}</p>
            </div>
          </div>
        </td>

        {/* Cours */}
        <td className="py-3 px-4 hidden sm:table-cell">
          <p className="text-sm text-foreground truncate max-w-[180px]">{row.courseTitle}</p>
          <Badge variant="secondary" className={cn("text-[9px] mt-1", CATEGORY_LABELS[row.courseCategory] ? "bg-muted/80" : "")}>
            {CATEGORY_LABELS[row.courseCategory] || row.courseCategory}
          </Badge>
        </td>

        {/* Progression */}
        <td className="py-3 px-4 hidden md:table-cell">
          <div className="flex items-center gap-2 min-w-[120px]">
            <Progress value={row.progress} className="w-16 h-1.5" />
            <span className={cn("text-xs font-semibold", progressColor)}>{Math.round(row.progress)}%</span>
          </div>
        </td>

        {/* Leçons */}
        <td className="py-3 px-4 hidden lg:table-cell">
          <span className="text-sm text-muted-foreground">{row.completedLessons}/{row.totalLessons || "—"}</span>
        </td>

        {/* Temps */}
        <td className="py-3 px-4 hidden lg:table-cell">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="w-3 h-3" />
            {formatTime(row.totalTimeSpent)}
          </div>
        </td>

        {/* Quiz */}
        <td className="py-3 px-4 hidden xl:table-cell">
          {row.quizBestScore ? (
            <span className={cn(
              "text-xs font-semibold",
              row.quizStatus === "REUSSI" ? "text-green-700" : "text-amber-700"
            )}>
              {row.quizBestScore}
            </span>
          ) : (
            <span className="text-xs text-muted-foreground">—</span>
          )}
        </td>

        {/* Certificat */}
        <td className="py-3 px-4 hidden xl:table-cell">
          {row.certificateCode ? (
            <Badge variant="secondary" className="text-[9px] bg-emerald-50 text-emerald-700">
              <Award className="w-3 h-3 mr-0.5" /> Obtenu
            </Badge>
          ) : (
            <span className="text-xs text-muted-foreground">Non</span>
          )}
        </td>

        {/* Statut */}
        <td className="py-3 px-4 hidden md:table-cell">
          <Badge variant="secondary" className={cn("text-[9px]", ENROLLMENT_STATUS_COLORS[row.status] || "")}>
            {ENROLLMENT_STATUS_LABELS[row.status] || row.status}
          </Badge>
        </td>

        {/* Dernier accès */}
        <td className="py-3 px-4 hidden lg:table-cell">
          <span className="text-[11px] text-muted-foreground">{timeAgo(row.lastAccessAt)}</span>
        </td>

        {/* Détails button */}
        <td className="py-3 px-4 text-right">
          <Button variant="ghost" size="sm" className="h-8 rounded-lg text-xs gap-1" onClick={onToggle}>
            {detailsLoading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : isExpanded ? (
              <ChevronUp className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
            <span className="hidden sm:inline">Détails</span>
          </Button>
        </td>
      </tr>

      {/* Expanded Detail Row */}
      {isExpanded && (
        <tr className="border-t border-border/20 bg-muted/20">
          <td colSpan={10} className="px-4 py-0">
            <div className="py-4 max-h-96 overflow-y-auto">
              {row.lessonDetails.length === 0 ? (
                <div className="text-center py-8">
                  <BookOpen className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Aucune leçon consultée</p>
                </div>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="text-[10px] text-muted-foreground border-b border-border/30">
                      <th className="text-left py-2 px-3 font-medium">Leçon</th>
                      <th className="text-left py-2 px-3 font-medium hidden sm:table-cell">Type</th>
                      <th className="text-left py-2 px-3 font-medium hidden md:table-cell">Statut</th>
                      <th className="text-left py-2 px-3 font-medium hidden md:table-cell">Temps</th>
                      <th className="text-left py-2 px-3 font-medium hidden lg:table-cell">Vidéo %</th>
                      <th className="text-left py-2 px-3 font-medium hidden lg:table-cell">Scroll %</th>
                      <th className="text-left py-2 px-3 font-medium hidden xl:table-cell">Complétion</th>
                      <th className="text-left py-2 px-3 font-medium hidden lg:table-cell">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {row.lessonDetails.map((lesson) => (
                      <tr key={lesson.id} className="border-b border-border/10 last:border-0">
                        <td className="py-2 px-3">
                          <p className="text-xs font-medium text-foreground truncate max-w-[200px]">{lesson.lessonTitle}</p>
                        </td>
                        <td className="py-2 px-3 hidden sm:table-cell">
                          <Badge variant="secondary" className={cn("text-[9px]", LESSON_TYPE_COLORS[lesson.lessonType] || "")}>
                            {LESSON_TYPE_LABELS[lesson.lessonType] || lesson.lessonType}
                          </Badge>
                        </td>
                        <td className="py-2 px-3 hidden md:table-cell">
                          {lesson.completed ? (
                            <span className="text-[10px] text-green-700 font-medium">✓ Terminée</span>
                          ) : (
                            <span className="text-[10px] text-amber-600 font-medium">○ En cours</span>
                          )}
                        </td>
                        <td className="py-2 px-3 hidden md:table-cell">
                          <span className="text-[11px] text-muted-foreground">{formatTime(lesson.timeSpent)}</span>
                        </td>
                        <td className="py-2 px-3 hidden lg:table-cell">
                          <span className={cn(
                            "text-[11px] font-medium",
                            lesson.lessonType === "VIDEO" && lesson.watchPercentage >= 90
                              ? "text-green-700" : "text-muted-foreground"
                          )}>
                            {lesson.lessonType === "VIDEO" ? `${Math.round(lesson.watchPercentage)}%` : "—"}
                          </span>
                        </td>
                        <td className="py-2 px-3 hidden lg:table-cell">
                          <span className={cn(
                            "text-[11px] font-medium",
                            (lesson.lessonType === "TEXTE" || lesson.lessonType === "PDF") && lesson.scrollPercentage >= 90
                              ? "text-green-700" : "text-muted-foreground"
                          )}>
                            {(lesson.lessonType === "TEXTE" || lesson.lessonType === "PDF") ? `${Math.round(lesson.scrollPercentage)}%` : "—"}
                          </span>
                        </td>
                        <td className="py-2 px-3 hidden xl:table-cell">
                          <Badge variant="secondary" className="text-[9px] bg-muted/60">
                            {COMPLETION_TRIGGER_LABELS[lesson.completionTrigger] || lesson.completionTrigger}
                          </Badge>
                        </td>
                        <td className="py-2 px-3 hidden lg:table-cell">
                          <span className="text-[10px] text-muted-foreground">
                            {lesson.completedAt
                              ? new Date(lesson.completedAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })
                              : "—"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function TraceabilitySkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-72" />
        </div>
        <Skeleton className="h-9 w-28 rounded-lg" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-20 rounded-xl" />
        ))}
      </div>
      <div className="flex gap-3">
        <Skeleton className="h-10 w-64 rounded-lg" />
        <Skeleton className="h-10 w-48 rounded-lg" />
        <Skeleton className="h-10 w-36 rounded-lg" />
      </div>
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-14 w-full rounded-lg" />
        ))}
      </div>
    </div>
  );
}
