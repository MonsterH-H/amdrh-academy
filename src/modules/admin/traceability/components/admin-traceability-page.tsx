"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  TrendingUp, CheckCircle, Clock, Target, Search, Download,
  ChevronLeft, ChevronRight, Filter,
  AlertCircle, BookOpen,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useAppStore } from "@/store/app";
import { cn } from "@/lib/utils";
import {
  LESSON_TYPE_LABELS, LESSON_TYPE_COLORS,
  CATEGORY_LABELS, ENROLLMENT_STATUS_LABELS, ENROLLMENT_STATUS_COLORS,
  COMPLETION_TRIGGER_LABELS,
} from "@/lib/constants";
import { formatTime } from "@/utils/format";
import { EnrollmentRowComponent, type EnrollmentRow } from "./enrollment-table";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface TraceStats {
  totalEnrolled: number;
  totalCompleted: number;
  totalAbandoned: number;
  avgCompletionRate: number;
  avgTimePerCourse: number;
}

// ─── Main Component ──────────────────────────────────────────────────────────

export function AdminTraceabilityPage() {
  const { user } = useAppStore();
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

  useEffect(() => {
    fetch("/api/courses?limit=200").then((r) => r.json()).then((d) => setCourses(d.courses || [])).catch(() => {});
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ page: String(page), limit: "10" });
      if (search) params.set("search", search);
      if (courseId && courseId !== "all") params.set("courseId", courseId);
      if (statusFilter && statusFilter !== "all") params.set("status", statusFilter);
      if (user) { params.set("userId", user.id); params.set("role", user.role); }
      const res = await fetch(`/api/admin/traceability?${params}`);
      const data = await res.json();
      setEnrollments(data.enrollments || []);
      setTotalPages(data.pagination?.totalPages || 1);
      setTotal(data.pagination?.total || 0);
      setStats(data.stats || null);
    } catch { toast({ title: "Erreur", description: "Impossible de charger les données.", variant: "destructive" }); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [page, search, courseId, statusFilter, user]);

  const handleSearch = (e: React.FormEvent) => { e.preventDefault(); setPage(1); setExpandedId(null); };
  const handleFilterChange = (_key: string, value: string) => { if (_key === "courseId") setCourseId(value); if (_key === "status") setStatusFilter(value); setPage(1); setExpandedId(null); };

  const handleToggleExpand = async (row: EnrollmentRow) => {
    if (expandedId === row.id) { setExpandedId(null); return; }
    if (row.lessonDetails.length > 0) { setExpandedId(row.id); return; }
    setDetailsLoading(row.id);
    try {
      const params = new URLSearchParams({ page: String(page), limit: "10", includeDetails: "true" });
      if (search) params.set("search", search);
      if (courseId && courseId !== "all") params.set("courseId", courseId);
      if (statusFilter && statusFilter !== "all") params.set("status", statusFilter);
      if (user) { params.set("userId", user.id); params.set("role", user.role); }
      const res = await fetch(`/api/admin/traceability?${params}`);
      const data = await res.json();
      const found = (data.enrollments || []).find((e: EnrollmentRow) => e.id === row.id);
      if (found) setEnrollments((prev) => prev.map((e) => (e.id === row.id ? { ...e, lessonDetails: found.lessonDetails } : e)));
      setExpandedId(row.id);
    } catch { toast({ title: "Erreur", description: "Impossible de charger les détails.", variant: "destructive" }); }
    finally { setDetailsLoading(null); }
  };

  const handleExport = () => {
    const params = new URLSearchParams();
    if (user) { params.set("userId", user.id); params.set("role", user.role); }
    if (search) params.set("search", search);
    if (courseId && courseId !== "all") params.set("courseId", courseId);
    if (statusFilter && statusFilter !== "all") params.set("status", statusFilter);
    window.open(`/api/admin/traceability/export?${params}`, "_blank");
  };

  if (loading && enrollments.length === 0) return <TraceabilitySkeleton />;

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div><h2 className="text-2xl font-bold text-foreground">Traçabilité</h2><p className="text-muted-foreground mt-1">Suivi détaillé de la progression des apprenants</p></div>
        <Button variant="outline" size="sm" onClick={handleExport} className="rounded-lg border-border/60 text-xs"><Download className="w-4 h-4 mr-1.5" />Exporter CSV</Button>
      </div>
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="border-border/60 relative overflow-hidden"><div className="absolute top-0 left-0 w-full h-0.5 bg-blue-500" /><CardContent className="p-4 flex items-center gap-3"><div className="bg-blue-50 text-blue-600 p-2.5 rounded-lg"><TrendingUp className="w-5 h-5" /></div><div><p className="text-2xl font-bold leading-none text-foreground">{stats.totalEnrolled}</p><p className="text-[11px] text-muted-foreground mt-1">Inscriptions en cours</p></div></CardContent></Card>
          <Card className="border-border/60 relative overflow-hidden"><div className="absolute top-0 left-0 w-full h-0.5 bg-green-500" /><CardContent className="p-4 flex items-center gap-3"><div className="bg-green-50 text-green-600 p-2.5 rounded-lg"><CheckCircle className="w-5 h-5" /></div><div><p className="text-2xl font-bold leading-none text-foreground">{stats.totalCompleted}</p><p className="text-[11px] text-muted-foreground mt-1">Inscriptions terminées</p></div></CardContent></Card>
          <Card className="border-border/60 relative overflow-hidden"><div className="absolute top-0 left-0 w-full h-0.5 bg-amber-500" /><CardContent className="p-4 flex items-center gap-3"><div className="bg-amber-50 text-amber-600 p-2.5 rounded-lg"><Clock className="w-5 h-5" /></div><div><p className="text-2xl font-bold leading-none text-foreground">{formatTime(stats.avgTimePerCourse)}</p><p className="text-[11px] text-muted-foreground mt-1">Temps moyen / cours</p></div></CardContent></Card>
          <Card className="border-border/60 relative overflow-hidden"><div className="absolute top-0 left-0 w-full h-0.5 bg-purple-500" /><CardContent className="p-4 flex items-center gap-3"><div className="bg-purple-50 text-purple-600 p-2.5 rounded-lg"><Target className="w-5 h-5" /></div><div><p className="text-2xl font-bold leading-none text-foreground">{stats.avgCompletionRate}%</p><p className="text-[11px] text-muted-foreground mt-1">Taux de complétion moyen</p></div></CardContent></Card>
        </div>
      )}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-end">
        <form onSubmit={handleSearch} className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Rechercher par nom ou email..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 rounded-lg h-10" />
        </form>
        <div className="flex items-center gap-2 flex-wrap">
          <Select value={courseId} onValueChange={(v) => handleFilterChange("courseId", v)}>
            <SelectTrigger className="h-10 rounded-lg w-48 text-xs"><BookOpen className="w-4 h-4 mr-1.5 text-muted-foreground" /><SelectValue placeholder="Tous les cours" /></SelectTrigger>
            <SelectContent className="max-h-60"><SelectItem value="all">Tous les cours</SelectItem>{courses.map((c) => <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>)}</SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={(v) => handleFilterChange("status", v)}>
            <SelectTrigger className="h-10 rounded-lg w-36 text-xs"><Filter className="w-4 h-4 mr-1.5 text-muted-foreground" /><SelectValue placeholder="Tous" /></SelectTrigger>
            <SelectContent><SelectItem value="all">Tous les statuts</SelectItem><SelectItem value="en_cours">En cours</SelectItem><SelectItem value="termine">Terminé</SelectItem><SelectItem value="abandonne">Abandonné</SelectItem></SelectContent>
          </Select>
        </div>
      </div>
      <div className="flex items-center justify-between"><p className="text-sm text-muted-foreground">{total} inscription{total > 1 ? "s" : ""}</p></div>
      {enrollments.length === 0 ? (
        <div className="text-center py-20"><AlertCircle className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" /><h3 className="font-semibold text-foreground mb-2">Aucune inscription trouvée</h3><p className="text-sm text-muted-foreground">Modifiez vos filtres pour voir plus de résultats</p></div>
      ) : (
        <>
          <Card className="border-border/60 overflow-hidden"><div className="overflow-x-auto"><table className="w-full">
            <thead><tr className="bg-muted/50 text-xs text-muted-foreground">
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
            </tr></thead>
            <tbody>
              {enrollments.map((row) => (
                <EnrollmentRowComponent key={row.id} row={row} expanded={expandedId === row.id} detailsLoading={detailsLoading === row.id} onToggle={() => handleToggleExpand(row)} />
              ))}
            </tbody>
          </table></div></Card>
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)} className="rounded-lg"><ChevronLeft className="w-4 h-4" /></Button>
              <span className="text-sm text-muted-foreground">Page {page} / {totalPages}</span>
              <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)} className="rounded-lg"><ChevronRight className="w-4 h-4" /></Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ─── Skeleton ────────────────────────────────────────────────────────────────

function TraceabilitySkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between"><div className="space-y-2"><Skeleton className="h-8 w-48" /><Skeleton className="h-4 w-72" /></div><Skeleton className="h-9 w-28 rounded-lg" /></div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}</div>
      <div className="flex gap-3"><Skeleton className="h-10 w-64 rounded-lg" /><Skeleton className="h-10 w-48 rounded-lg" /><Skeleton className="h-10 w-36 rounded-lg" /></div>
      <div className="space-y-3">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-14 w-full rounded-lg" />)}</div>
    </div>
  );
}
