"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  RefreshCw, Download, Wifi, WifiOff, Shield, Clock, Bell,
  AlertCircle,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useRealtime } from "@/hooks/use-realtime";
import { useAppStore } from "@/store/app";
import { ROLE_LABELS } from "../types";
import type { AdminDashboardData } from "../types";
import { DashboardKPICards } from "./dashboard-kpi-cards";
import { EnrollmentTrendChart, RoleDistributionChart, TopCoursesChart } from "./dashboard-charts";
import {
  ActivityFeed, TopPerformersWidget, RecentUsersWidget,
  QuickActionsWidget, PendingTasksWidget,
} from "./dashboard-widgets";

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Bonjour";
  if (h < 18) return "Bon après-midi";
  return "Bonsoir";
}

function formatDate(): string {
  return new Date().toLocaleDateString("fr-FR", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });
}

function exportCsv(data: AdminDashboardData) {
  const rows = data.recentUsers.map((u) => ({
    Nom: `${u.prenom} ${u.nom}`, Email: u.email,
    Rôle: ROLE_LABELS[u.role] ?? u.role,
    Inscrit: new Date(u.createdAt).toLocaleDateString("fr-FR"),
    Actif: u.isActive ? "Oui" : "Non",
  }));
  const header = Object.keys(rows[0] ?? {}).join(";");
  const body = rows.map((r) => Object.values(r).join(";")).join("\n");
  const csv = "\uFEFF" + header + "\n" + body;
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `utilisateurs_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export function AdminDashboardPage() {
  const [data, setData] = useState<AdminDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { isConnected } = useRealtime();
  const user = useAppStore((s) => s.user);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (!user) return;
      const res = await fetch(`/api/admin/dashboard?userId=${user.id}`);
      if (!res.ok) throw new Error(`Erreur ${res.status}`);
      const json = await res.json();
      setData(json);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur de chargement");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleExport = () => {
    if (!data) return;
    exportCsv(data);
    toast({ title: "Export CSV", description: "Fichier téléchargé avec succès" });
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <AlertCircle className="h-12 w-12 text-destructive" />
        <p className="text-muted-foreground">{error}</p>
        <Button onClick={fetchData} variant="outline"><RefreshCw className="mr-2 h-4 w-4" /> Réessayer</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{getGreeting()} {user?.prenom ?? "Admin"}</h1>
          <p className="text-muted-foreground capitalize">{formatDate()}</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="secondary" className="gap-1">
            {isConnected ? <Wifi className="h-3 w-3 text-green-500" /> : <WifiOff className="h-3 w-3 text-red-500" />}
            {isConnected ? "En ligne" : "Hors ligne"}
          </Badge>
          <Button variant="outline" size="sm" onClick={handleExport} disabled={!data}>
            <Download className="mr-2 h-4 w-4" /> CSV
          </Button>
          <Button variant="outline" size="sm" onClick={fetchData}>
            <RefreshCw className="mr-2 h-4 w-4" />
          </Button>
        </div>
      </div>

      {loading ? <DashboardSkeleton /> : data && (
        <>
          {/* KPI Cards */}
          <DashboardKPICards kpi={data.kpi} />

          {/* Pending Tasks */}
          <PendingTasksWidget kpi={data.kpi} />

          {/* Charts Row 1 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <EnrollmentTrendChart data={data.charts} />
            <RoleDistributionChart data={data.usersByRole} />
          </div>

          {/* Charts Row 2 + Feed + Performers */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <TopCoursesChart data={data.topCourses} />
            <ActivityFeed enrollments={data.recentEnrollments} quizAttempts={data.recentQuizAttempts} />
            <TopPerformersWidget performers={data.topPerformers} />
          </div>

          {/* Bottom Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <RecentUsersWidget users={data.recentUsers} />
            <QuickActionsWidget />
          </div>

          {/* System Info Footer */}
          <Card className="bg-muted/30">
            <CardContent className="py-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
              <span className="font-medium text-foreground">{user?.prenom} {user?.nom}</span>
              <Badge variant="outline">{ROLE_LABELS[user?.role ?? ""] ?? user?.role}</Badge>
              <span className="flex items-center gap-1"><Shield className="h-3.5 w-3.5" /> {data.kpi.learningPathCount} parcours</span>
              <span className="flex items-center gap-1"><Bell className="h-3.5 w-3.5" /> {data.kpi.totalAnnouncements} annonces</span>
              <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> Dernière sync: {data.lastSync ? new Date(data.lastSync.completedAt ?? data.lastSync.startedAt).toLocaleString("fr-FR") : "Jamais"}</span>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex gap-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-32 rounded-xl flex-1" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Skeleton className="h-80 rounded-xl" />
        <Skeleton className="h-80 rounded-xl" />
      </div>
    </div>
  );
}
