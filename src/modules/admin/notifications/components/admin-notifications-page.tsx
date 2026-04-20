"use client";

import { useEffect, useState, useCallback } from "react";
import { Bell, Eye, EyeOff } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useAppStore } from "@/store/app";
import { toast } from "@/hooks/use-toast";
import type { NotificationStats, NotificationWithUser } from "../types";
import { NotificationCreateForm } from "./notification-form";
import { NotificationList, StatCard, TypeBreakdownCard } from "./notification-list";

// ─── Main Component ──────────────────────────────────────────────────────────

export function AdminNotificationsPage() {
  const { user } = useAppStore();

  const [stats, setStats] = useState<NotificationStats | null>(null);
  const [notifications, setNotifications] = useState<NotificationWithUser[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchHistory = useCallback(async () => {
    setHistoryLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: "15" });
      if (typeFilter !== "ALL") params.set("type", typeFilter);
      if (searchQuery) params.set("search", searchQuery);
      const res = await fetch(`/api/admin/notifications?${params}`);
      const data = await res.json();
      setStats(data.stats || null);
      setNotifications(data.notifications || []);
      setTotalPages(data.pagination?.totalPages || 1);
    } catch {
      toast({ title: "Erreur", description: "Impossible de charger les notifications", variant: "destructive" });
    } finally { setHistoryLoading(false); }
  }, [typeFilter, searchQuery, page]);

  useEffect(() => { fetchHistory(); }, [fetchHistory]);

  const handleSearch = (e: React.FormEvent) => { e.preventDefault(); setPage(1); fetchHistory(); };

  const handleTypeFilterChange = (t: string) => { setTypeFilter(t); setPage(1); };
  const handlePageChange = (p: number) => { setPage(p); };
  const handleSearchChange = (v: string) => { setSearchQuery(v); };

  if (historyLoading && !stats) return <AdminNotificationsSkeleton />;

  return (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Gestion des notifications</h2>
        <p className="text-muted-foreground mt-1">Créer et gérer les notifications pour les utilisateurs</p>
      </div>

      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Total envoyées" value={stats.total} icon={Bell} colorClass="bg-primary/10 text-primary" />
          <StatCard label="Taux de lecture" value={`${stats.readRate}%`} icon={Eye} colorClass="bg-emerald-500/10 text-emerald-600" subtitle={`${stats.readCount} lues / ${stats.unreadCount} non lues`} />
          <StatCard label="Non lues" value={stats.unreadCount} icon={EyeOff} colorClass="bg-amber-500/10 text-amber-600" />
          <TypeBreakdownCard byType={stats.byType} />
        </div>
      )}

      <NotificationCreateForm onCreated={fetchHistory} />
      <Separator />
      <NotificationList
        notifications={notifications} typeFilter={typeFilter} searchQuery={searchQuery}
        page={page} totalPages={totalPages} loading={historyLoading}
        onTypeFilterChange={handleTypeFilterChange} onPageChange={handlePageChange}
        onSearch={handleSearch} onSearchChange={handleSearchChange}
      />
    </div>
  );
}

// ─── Skeleton ────────────────────────────────────────────────────────────────

function AdminNotificationsSkeleton() {
  return (
    <div className="space-y-6">
      <div><Skeleton className="h-8 w-64" /><Skeleton className="h-4 w-48 mt-2" /></div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}</div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6"><Skeleton className="h-[500px] rounded-xl" /><Skeleton className="h-[500px] rounded-xl" /></div>
    </div>
  );
}
