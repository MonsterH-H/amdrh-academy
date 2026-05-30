"use client";

import { useEffect, useState, useCallback } from "react";
import { useAppStore } from "@/store/app";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Megaphone,
  RefreshCw,
  Users,
  UserPlus,
  BookOpen,
  Plus,
  CheckCircle2,
  XCircle,
  Clock,
  Wifi,
  WifiOff,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { ANNOUNCEMENT_TYPE_LABELS, ANNOUNCEMENT_TYPE_COLORS } from "@/lib/constants";
import { formatRelativeTime } from "@/utils/format";
import { cn } from "@/lib/utils";

// ──────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────

interface PinnedAnnouncement {
  id: string;
  title: string;
  type: string;
  publishedAt: string;
}

interface SyncStats {
  lastSyncAt: string | null;
  lastSyncStatus: string | null;
}

interface OnlineData {
  count: number;
}

// ──────────────────────────────────────────────────
// Component
// ──────────────────────────────────────────────────

export function DashboardWidgets() {
  const { user, navigate } = useAppStore();
  const [announcements, setAnnouncements] = useState<PinnedAnnouncement[]>([]);
  const [syncStats, setSyncStats] = useState<SyncStats | null>(null);
  const [onlineCount, setOnlineCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [annRes, syncRes, onlineRes] = await Promise.all([
        fetch(`/api/announcements?userId=${user?.id}&role=${user?.role}&pinned=true&limit=3`),
        fetch(`/api/sync?userId=${user?.id}&role=${user?.role}`).catch(() => null),
        fetch(`/api/realtime/online?role=${user?.role}`).catch(() => null),
      ]);

      if (annRes.ok) {
        const data = await annRes.json();
        setAnnouncements((data.announcements || []).map((a: Record<string, unknown>) => ({
          id: a.id as string,
          title: a.title as string,
          type: (a.type as string) || "INFO",
          publishedAt: a.publishedAt as string,
        })));
      }

      if (syncRes?.ok) {
        const data = await syncRes.json();
        setSyncStats(data.stats || null);
      }

      if (onlineRes?.ok) {
        const data = await onlineRes.json() as OnlineData;
        setOnlineCount(data.count || 0);
      }
    } catch { /* silent */ } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleQuickSync = async () => {
    if (syncing) return;
    setSyncing(true);
    try {
      const res = await fetch(`/api/sync?userId=${user?.id}&role=${user?.role}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "licence_sync", triggeredBy: user?.id }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        if (res.status === 409) {
          toast({ title: "Sync en cours", description: "Une synchronisation est déjà en cours." });
          return;
        }
        throw new Error(data.error || "Erreur");
      }
      toast({ title: "Synchronisation lancée", description: "Licences en cours de synchronisation..." });
    } catch (err) {
      toast({ title: "Erreur", description: err instanceof Error ? err.message : "Erreur de synchronisation", variant: "destructive" });
    } finally {
      setSyncing(false);
    }
  };

  const syncStatusConfig: Record<string, { label: string; color: string; icon: typeof CheckCircle2 }> = {
    TERMINE: { label: "Succès", color: "text-blue-600", icon: CheckCircle2 },
    ERREUR: { label: "Erreur", color: "text-red-600", icon: XCircle },
    EN_COURS: { label: "En cours", color: "text-primary", icon: RefreshCw },
    EN_ATTENTE: { label: "En attente", color: "text-muted-foreground", icon: Clock },
  };

  const syncCfg = syncStats?.lastSyncStatus
    ? syncStatusConfig[syncStats.lastSyncStatus] || syncStatusConfig.EN_ATTENTE
    : null;
  const SyncIcon = syncCfg?.icon || Clock;

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
      {/* Latest Pinned Announcements */}
      <Card className="border-border/60">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Megaphone className="w-4 h-4 text-primary" /> Dernières annonces
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={() => navigate("admin-announcements")} className="text-xs h-7 px-2">
              Voir tout
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {loading ? (
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-9 w-full rounded-lg" />)}
            </div>
          ) : announcements.length === 0 ? (
            <div className="text-center py-6">
              <Megaphone className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
              <p className="text-xs text-muted-foreground">Aucune annonce épinglée</p>
            </div>
          ) : (
            <div className="space-y-2">
              {announcements.map((a) => {
                const typeColor = ANNOUNCEMENT_TYPE_COLORS[a.type] || "bg-muted text-muted-foreground";
                const typeLabel = ANNOUNCEMENT_TYPE_LABELS[a.type] || a.type;
                return (
                  <div key={a.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/40 transition-colors">
                    <div className={cn("w-2 h-2 rounded-full flex-shrink-0", {
                      "bg-sky-500": a.type === "INFO",
                      "bg-red-500": a.type === "URGENT",
                      "bg-amber-500": a.type === "EVENEMENT",
                      "bg-violet-500": a.type === "MAINTENANCE",
                    })} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-foreground truncate">{a.title}</p>
                      <p className="text-[10px] text-muted-foreground">{formatRelativeTime(a.publishedAt)}</p>
                    </div>
                    <Badge variant="secondary" className={cn("text-[9px] px-1.5 py-0 flex-shrink-0", typeColor)}>
                      {typeLabel}
                    </Badge>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sync Status Card */}
      <Card className="border-border/60">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <RefreshCw className="w-4 h-4 text-primary" /> Synchronisation
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={() => navigate("admin-sync")} className="text-xs h-7 px-2">
              Détails
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {loading ? (
            <Skeleton className="h-20 w-full rounded-lg" />
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", {
                  "bg-blue-50 dark:bg-blue-950/50": syncCfg?.label === "Succès",
                  "bg-red-50 dark:bg-red-950/50": syncCfg?.label === "Erreur",
                  "bg-muted": !syncCfg || syncCfg?.label === "En attente",
                })}>
                  <SyncIcon className={cn("w-5 h-5", syncCfg?.color || "text-muted-foreground")} />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {syncCfg ? syncCfg.label : "Jamais synchronisé"}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    {syncStats?.lastSyncAt
                      ? `Dernière sync: ${formatRelativeTime(syncStats.lastSyncAt)}`
                      : "Aucune synchronisation effectuée"}
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleQuickSync}
                disabled={syncing}
                className="w-full rounded-lg text-xs"
              >
                <RefreshCw className={cn("w-3.5 h-3.5 mr-1.5", syncing && "animate-spin")} />
                {syncing ? "Synchronisation..." : "Synchroniser maintenant"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Online Users */}
      <Card className="border-border/60">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Users className="w-4 h-4 text-primary" /> Utilisateurs en ligne
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          {loading ? (
            <Skeleton className="h-20 w-full rounded-lg" />
          ) : (
            <div className="flex items-center gap-4">
              <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", {
                "bg-blue-50 dark:bg-blue-950/50": onlineCount > 0,
                "bg-muted": onlineCount === 0,
              })}>
                {onlineCount > 0 ? (
                  <Wifi className="w-6 h-6 text-blue-600" />
                ) : (
                  <WifiOff className="w-6 h-6 text-muted-foreground" />
                )}
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{onlineCount}</p>
                <p className="text-[10px] text-muted-foreground">
                  {onlineCount > 0 ? "utilisateur(s) connecté(s)" : "Aucun utilisateur en ligne"}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions - Full width */}
      <Card className="border-border/60 md:col-span-2 lg:col-span-3">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">Actions rapides</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <QuickActionButton
              icon={UserPlus}
              label="Nouvel utilisateur"
              color="bg-sky-50 dark:bg-sky-950/50 text-sky-600"
              onClick={() => navigate("admin-users")}
            />
            <QuickActionButton
              icon={BookOpen}
              label="Nouveau cours"
              color="bg-blue-50 dark:bg-blue-950/50 text-blue-600"
              onClick={() => navigate("course-create")}
            />
            <QuickActionButton
              icon={Plus}
              label="Nouvelle annonce"
              color="bg-amber-50 dark:bg-amber-950/50 text-amber-600"
              onClick={() => navigate("admin-announcements")}
            />
            <QuickActionButton
              icon={RefreshCw}
              label="Synchroniser"
              color="bg-violet-50 dark:bg-violet-950/50 text-violet-600"
              onClick={handleQuickSync}
              disabled={syncing}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ──────────────────────────────────────────────────
// Quick Action Button
// ──────────────────────────────────────────────────

function QuickActionButton({
  icon: Icon,
  label,
  color,
  onClick,
  disabled,
}: {
  icon: typeof UserPlus;
  label: string;
  color: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <Button
      variant="outline"
      className="h-auto py-3 px-3 rounded-lg border-border/60 hover:shadow-sm transition-all"
      onClick={onClick}
      disabled={disabled}
    >
      <div className="flex items-center gap-2.5 w-full">
        <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center shrink-0", color)}>
          <Icon className="w-4 h-4" />
        </div>
        <span className="text-xs font-medium text-foreground">{label}</span>
      </div>
    </Button>
  );
}
