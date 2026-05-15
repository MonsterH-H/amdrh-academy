"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Wifi, Database, Server, Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/app";

// ─── System Health ───────────────────────────────────────────────────────────

export function DashboardSystemHealth({ totalRecords }: { totalRecords: number }) {
  const { user } = useAppStore();
  const [onlineCount, setOnlineCount] = useState<number | null>(null);
  const [realtimeOk, setRealtimeOk] = useState<boolean | null>(null);

  useEffect(() => {
    const checkOnline = async () => {
      try {
        const res = await fetch(`/api/realtime/online?role=ADMIN&userId=${user?.id}`);
        if (res.ok) {
          const data = await res.json();
          setOnlineCount(data.count ?? 0);
          setRealtimeOk(true);
        } else {
          setRealtimeOk(false);
        }
      } catch {
        setRealtimeOk(false);
      }
    };
    checkOnline();
    const interval = setInterval(checkOnline, 30000);
    return () => clearInterval(interval);
  }, [user]);

  return (
    <Card className="border-border/60">
      <CardContent className="p-4">
        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
          <Server className="w-3.5 h-3.5" /> Santé du système
        </h4>
        <div className="grid grid-cols-3 gap-3">
          {/* Realtime Service */}
          <div className="flex items-center gap-2.5 p-2.5 rounded-lg bg-muted/30">
            <Wifi className={cn("w-4 h-4", realtimeOk === true ? "text-emerald-500" : realtimeOk === false ? "text-red-400" : "text-muted-foreground/40")} />
            <div className="min-w-0">
              <p className="text-[10px] text-muted-foreground">Temps réel</p>
              <div className="flex items-center gap-1.5">
                <StatusDot ok={realtimeOk} />
                <span className={cn("text-xs font-semibold", realtimeOk === true ? "text-emerald-600" : "text-red-500")}>
                  {realtimeOk === null ? "Vérif..." : realtimeOk ? "Opérationnel" : "Hors ligne"}
                </span>
              </div>
            </div>
          </div>

          {/* Database */}
          <div className="flex items-center gap-2.5 p-2.5 rounded-lg bg-muted/30">
            <Database className="w-4 h-4 text-emerald-500" />
            <div className="min-w-0">
              <p className="text-[10px] text-muted-foreground">Base de données</p>
              <div className="flex items-center gap-1.5">
                <StatusDot ok={true} />
                <span className="text-xs font-semibold text-emerald-600">Opérationnel</span>
              </div>
            </div>
          </div>

          {/* Total Records */}
          <div className="flex items-center gap-2.5 p-2.5 rounded-lg bg-muted/30">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <div className="min-w-0">
              <p className="text-[10px] text-muted-foreground">En ligne</p>
              <span className="text-xs font-semibold text-foreground">
                {onlineCount !== null ? onlineCount : "—"}
              </span>
            </div>
          </div>
        </div>
        <p className="text-[10px] text-muted-foreground/60 mt-3 text-center">
          {totalRecords.toLocaleString("fr-FR")} enregistrements au total
        </p>
      </CardContent>
    </Card>
  );
}

// ─── Status Dot ──────────────────────────────────────────────────────────────

function StatusDot({ ok }: { ok: boolean | null }) {
  return (
    <span className={cn(
      "w-1.5 h-1.5 rounded-full",
      ok === true ? "bg-emerald-500 animate-pulse" : ok === false ? "bg-red-400" : "bg-muted-foreground/30",
    )} />
  );
}
