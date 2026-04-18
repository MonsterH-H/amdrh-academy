"use client";

import { useEffect, useState } from "react";
import { useAppStore } from "@/store/app";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { RefreshCw, CheckCircle2, XCircle, Clock, Loader2, Database } from "lucide-react";
import { cn } from "@/lib/utils";

const statusConfig: Record<string, { label: string; color: string; icon: typeof CheckCircle2 }> = {
  EN_ATTENTE: { label: "En attente", color: "bg-gray-100 text-gray-700", icon: Clock },
  EN_COURS: { label: "En cours", color: "bg-blue-100 text-blue-700", icon: Loader2 },
  TERMINE: { label: "Terminé", color: "bg-green-100 text-green-700", icon: CheckCircle2 },
  ERREUR: { label: "Erreur", color: "bg-red-100 text-red-700", icon: XCircle },
};

export function AdminSyncPage() {
  const { user } = useAppStore();
  const [syncs, setSyncs] = useState<Array<Record<string, unknown>>>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    fetchSyncs();
  }, []);

  const fetchSyncs = async () => {
    try {
      const res = await fetch("/api/sync");
      const data = await res.json();
      setSyncs(data.syncs || []);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async (type: string) => {
    setSyncing(true);
    try {
      await fetch("/api/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, triggeredBy: user?.id }),
      });
      fetchSyncs();
    } catch {
      // silently fail
    } finally {
      setSyncing(false);
    }
  };

  if (loading) return <SyncSkeleton />;

  return (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Synchronisation Fédération</h2>
        <p className="text-muted-foreground mt-1">Gérez la synchronisation avec le système FRMHB</p>
      </div>

      {/* Sync actions */}
      <div className="grid sm:grid-cols-2 gap-4">
        <Card className="border-border/60">
          <CardContent className="p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <Database className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground text-sm">Licences</h3>
                <p className="text-[10px] text-muted-foreground">Synchroniser les licences fédérales</p>
              </div>
            </div>
            <Button
              className="w-full rounded-lg text-sm"
              onClick={() => handleSync("licence_sync")}
              disabled={syncing}
            >
              {syncing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-2" />}
              Synchroniser les licences
            </Button>
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardContent className="p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                <Database className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground text-sm">Certifications</h3>
                <p className="text-[10px] text-muted-foreground">Exporter les certifications obtenues</p>
              </div>
            </div>
            <Button
              className="w-full rounded-lg text-sm"
              variant="outline"
              onClick={() => handleSync("certification_sync")}
              disabled={syncing}
            >
              {syncing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-2" />}
              Synchroniser les certifications
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Sync history */}
      <Card className="border-border/60">
        <CardContent className="p-6">
          <h3 className="font-semibold text-foreground mb-4">Historique des synchronisations</h3>
          {syncs.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">Aucune synchronisation effectuée</p>
          ) : (
            <div className="space-y-3">
              {syncs.map((sync) => {
                const cfg = statusConfig[(sync.status as string) || "EN_ATTENTE"];
                const Icon = cfg.icon;
                return (
                  <div key={sync.id as string} className="flex items-center gap-4 p-3 rounded-lg border border-border/40">
                    <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center", cfg.color)}>
                      <Icon className={cn("w-4 h-4", sync.status === "EN_COURS" && "animate-spin")} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-foreground">{sync.type as string}</p>
                        <Badge variant="secondary" className={cn("text-[10px]", cfg.color)}>{cfg.label}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {sync.totalRecords as number} enregistrements • {sync.processedRecords as number} traités
                        {(sync.errorRecords as number) > 0 && ` • ${sync.errorRecords as number} erreurs`}
                      </p>
                    </div>
                    <p className="text-[10px] text-muted-foreground hidden sm:block">
                      {new Date(sync.startedAt as string).toLocaleDateString("fr-FR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                    </p>
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

function SyncSkeleton() {
  return <div className="space-y-4"><Skeleton className="h-8 w-64" /><Skeleton className="h-24 rounded-xl" /><Skeleton className="h-64 rounded-xl" /></div>;
}
