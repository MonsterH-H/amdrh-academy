"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart3, Download, Calendar } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useAppStore } from "@/store/app";
import { ROLE_LABELS, CATEGORY_LABELS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { formatMonthFull } from "../types";
import { PERIODS } from "../types";
import type { StatsData } from "../types";
import { OverviewSection } from "./stats-overview";
import { ChartsSection } from "./charts";
import { TopCoursesSection } from "./top-courses";
import type { TopCourse } from "./top-courses";
import { RecentActivitySection } from "./recent-activity";
import type { RecentEnrollment, RecentQuiz, RecentCert } from "./recent-activity";

// ─── Main Component ──────────────────────────────────────────────────────────

export function AdminAnalyticsPage() {
  const { user } = useAppStore();
  const [data, setData] = useState<StatsData | null>(null);
  const [topCourses, setTopCourses] = useState<TopCourse[]>([]);
  const [recentEnrollments, setRecentEnrollments] = useState<RecentEnrollment[]>([]);
  const [recentQuizAttempts, setRecentQuizAttempts] = useState<RecentQuiz[]>([]);
  const [recentCertificates, setRecentCertificates] = useState<RecentCert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [period, setPeriod] = useState("30");

  const fetchData = useCallback(async (p: string) => {
    try {
      setLoading(true);
      const [statsRes, coursesRes, enrollRes, quizRes, certRes] = await Promise.all([
        fetch(`/api/stats?userId=${user?.id}&role=${user?.role}&period=${p}`),
        fetch(`/api/admin/course-stats?userId=${user?.id}&role=${user?.role}`).catch(() => null),
        fetch(`/api/admin/enrollments?limit=20&userId=${user?.id}&role=${user?.role}`).catch(() => null),
        fetch(`/api/admin/quiz-attempts?limit=20&userId=${user?.id}&role=${user?.role}`).catch(() => null),
        fetch(`/api/admin/certificates?limit=20&userId=${user?.id}&role=${user?.role}`).catch(() => null),
      ]);

      if (!statsRes.ok) throw new Error("Erreur");
      const json = await statsRes.json();
      setError(false);
      setData(json);

      // Parse top courses
      if (coursesRes?.ok) {
        const cJson = await coursesRes.json();
        setTopCourses((cJson.courses || []).map((c: Record<string, unknown>) => ({
          id: c.id as string,
          title: c.title as string,
          category: (c.category as string) || "ARBITRAGE",
          difficulty: (c.difficulty as string) || "DEBUTANT",
          enrollmentCount: (c.enrollmentCount as number) || 0,
          completionRate: (c.completionRate as number) || 0,
          passRate: (c.passRate as number) || 0,
        })));
      }

      // Parse recent enrollments
      if (enrollRes?.ok) {
        const eJson = await enrollRes.json();
        setRecentEnrollments((eJson.enrollments || []).slice(0, 20).map((e: Record<string, unknown>) => ({
          id: e.id as string,
          userName: e.userName as string,
          userEmail: e.userEmail as string,
          courseTitle: (e.courseTitle as string) || "Cours",
          status: (e.status as string) || "en_cours",
          createdAt: e.createdAt as string,
        })));
      }

      // Parse recent quiz attempts
      if (quizRes?.ok) {
        const qJson = await quizRes.json();
        setRecentQuizAttempts((qJson.attempts || []).slice(0, 20).map((a: Record<string, unknown>) => ({
          id: a.id as string,
          userName: a.userName as string,
          quizTitle: a.quizTitle as string,
          score: a.score as number,
          status: a.status as string,
          submittedAt: a.submittedAt as string | null,
        })));
      }

      // Parse recent certificates
      if (certRes?.ok) {
        const crJson = await certRes.json();
        setRecentCertificates(((crJson.certificates || crJson) || []).slice(0, 20).map((c: Record<string, unknown>) => ({
          id: c.id as string,
          userName: (c.userName as string) || "Utilisateur",
          courseTitle: (c.courseTitle as string) || "Cours",
          issuedAt: c.issuedAt as string,
        })));
      }
    } catch { setError(true); } finally { setLoading(false); }
  }, [user]);

  useEffect(() => { if (user) fetchData(period); }, [user, fetchData, period]);

  const handleExport = () => {
    if (!data) return;
    const csvCell = (v: string) => `"${String(v).replace(/"/g, '""')}"`;
    const rows: string[] = [];
    rows.push(csvCell("Vue d'ensemble"), csvCell("Métrique") + "," + csvCell("Valeur"));
    rows.push(csvCell(`Utilisateurs totaux`) + "," + csvCell(`${data.overview.totalUsers}`), csvCell(`Utilisateurs actifs`) + "," + csvCell(`${data.overview.totalActiveUsers} (${data.overview.activeDays}j)`));
    rows.push(csvCell(`Cours totaux`) + "," + csvCell(`${data.overview.totalCourses}`), csvCell(`Cours publiés`) + "," + csvCell(`${data.overview.totalPublishedCourses}`));
    rows.push(csvCell(`Inscriptions`) + "," + csvCell(`${data.overview.totalEnrollments}`), csvCell(`Inscriptions terminées`) + "," + csvCell(`${data.overview.completedEnrollments}`));
    rows.push(csvCell(`Taux de complétion`) + "," + csvCell(`${data.overview.completionRate}%`), csvCell(`Certificats`) + "," + csvCell(`${data.overview.totalCertificates}`));
    rows.push(csvCell(`Tentatives de quiz`) + "," + csvCell(`${data.overview.totalQuizAttempts}`), csvCell(`Taux de réussite quiz`) + "," + csvCell(`${data.overview.quizPassRate}%`));
    rows.push(csvCell(`Badges`) + "," + csvCell(`${data.overview.totalBadges}`), csvCell(`Messages`) + "," + csvCell(`${data.overview.totalMessages}`), "");
    rows.push(csvCell("Utilisateurs par rôle"), csvCell("Rôle") + "," + csvCell("Nombre"));
    for (const r of (data.usersByRole || [])) rows.push(csvCell(ROLE_LABELS[r.role] || r.role) + "," + csvCell(String(r._count.role)));
    rows.push("", csvCell("Inscriptions par mois"), csvCell("Mois") + "," + csvCell("Nombre"));
    for (const m of (data.enrollmentsByMonth || [])) rows.push(csvCell(formatMonthFull(m.month)) + "," + csvCell(String(m.count)));
    rows.push("", csvCell("Certificats par mois"), csvCell("Mois") + "," + csvCell("Nombre"));
    for (const m of (data.certificatesByMonth || [])) rows.push(csvCell(formatMonthFull(m.month)) + "," + csvCell(String(m.count)));
    rows.push("", csvCell("Cours par catégorie"), csvCell("Catégorie") + "," + csvCell("Nombre"));
    for (const c of (data.coursesByCategory || [])) rows.push(csvCell(CATEGORY_LABELS[c.category] || c.category) + "," + csvCell(String(c._count.category)));

    const blob = new Blob(["\uFEFF" + rows.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `analytics-${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast({ title: "Export réussi", description: "Le fichier CSV a été téléchargé." });
  };

  if (loading && !data) return <AnalyticsSkeleton />;
  if (error || !data) {
    return (
      <div className="space-y-6 animate-fadeIn">
        <div><h2 className="text-2xl font-bold text-foreground">Analytique</h2><p className="text-muted-foreground mt-1">Tableau de bord analytique</p></div>
        <Card className="border-border/60"><CardContent className="p-12 text-center">
          <BarChart3 className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
          <h3 className="font-semibold text-foreground mb-2">Erreur de chargement</h3>
          <p className="text-sm text-muted-foreground">Impossible de récupérer les statistiques. Veuillez réessayer.</p>
        </CardContent></Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div><h2 className="text-2xl font-bold text-foreground">Analytique</h2><p className="text-muted-foreground mt-1">Tableau de bord analytique de la plateforme</p></div>
        <Button onClick={handleExport} variant="outline" size="sm" className="rounded-lg border-border/60 text-xs">
          <Download className="w-4 h-4 mr-1.5" />Exporter CSV
        </Button>
      </div>
      <OverviewSection overview={data.overview} />
      <div className="flex items-center gap-1.5 flex-wrap">
        <Calendar className="w-4 h-4 text-muted-foreground mr-1" />
        <span className="text-xs font-medium text-muted-foreground mr-1">Période :</span>
        {PERIODS.map((p) => (
          <button key={p.value} onClick={() => setPeriod(p.value)} className={cn(
            "px-3 py-1.5 rounded-full text-xs font-medium transition-all border",
            period === p.value ? "bg-primary text-primary-foreground border-primary" : "bg-card text-muted-foreground border-border/60 hover:border-border",
          )}>{p.label}</button>
        ))}
      </div>
      <ChartsSection data={data} />
      <TopCoursesSection courses={topCourses} loading={loading} />
      <RecentActivitySection enrollments={recentEnrollments} quizAttempts={recentQuizAttempts} certificates={recentCertificates} loading={loading} />
    </div>
  );
}

// ─── Analytics Skeleton ──────────────────────────────────────────────────────

function AnalyticsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2"><Skeleton className="h-8 w-64" /><Skeleton className="h-4 w-72" /></div>
        <Skeleton className="h-9 w-36 rounded-lg" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="border-border/60"><CardContent className="p-4">
            <Skeleton className="h-9 w-9 rounded-lg mb-3" /><Skeleton className="h-6 w-20" /><Skeleton className="h-4 w-28" />
          </CardContent></Card>
        ))}
      </div>
      <div className="grid lg:grid-cols-2 gap-6">
        {[...Array(2)].map((_, i) => (
          <Card key={i} className="border-border/60"><CardContent className="p-6">
            <Skeleton className="h-5 w-44 mb-4" /><Skeleton className="w-full h-[260px] rounded-lg" />
          </CardContent></Card>
        ))}
      </div>
      <div className="grid lg:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="border-border/60"><CardContent className="p-6">
            <Skeleton className="h-5 w-40 mb-4" /><Skeleton className="w-full h-[240px] rounded-lg" />
          </CardContent></Card>
        ))}
      </div>
    </div>
  );
}
