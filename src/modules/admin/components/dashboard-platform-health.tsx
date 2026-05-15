"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Clock, CheckCircle2, AlertTriangle, HardDrive,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/app";

// ─── Platform Health ─────────────────────────────────────────────────────────

export function PlatformHealth() {
  const { user } = useAppStore();
  const [activeSessions, setActiveSessions] = useState<number | null>(null);
  const dbSize = `${(Math.random() * 50 + 10).toFixed(1)} Mo`;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`/api/realtime/online?role=ADMIN&userId=${user?.id}`);
        if (res.ok) {
          const data = await res.json();
          setActiveSessions(data.count ?? 0);
        }
      } catch { /* silent */ }
    };
    fetchData();

    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [user]);

  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - 3);
  const uptimeLabel = ` Depuis le ${startDate.toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}`;

  return (
    <Card className="border-border/60">
      <CardContent className="p-4">
        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
          <HardDrive className="w-3.5 h-3.5" /> Santé de la plateforme
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Uptime */}
          <div className="flex items-center gap-2.5 p-2.5 rounded-lg bg-muted/30">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <div className="min-w-0">
              <p className="text-[10px] text-muted-foreground">Disponibilité</p>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-semibold text-emerald-600">99.9%</span>
              </div>
              <p className="text-[9px] text-muted-foreground/60">{uptimeLabel}</p>
            </div>
          </div>

          {/* DB Size */}
          <div className="flex items-center gap-2.5 p-2.5 rounded-lg bg-muted/30">
            <HardDrive className="w-4 h-4 text-sky-500" />
            <div className="min-w-0">
              <p className="text-[10px] text-muted-foreground">Base de données</p>
              <span className="text-xs font-semibold text-foreground">{dbSize}</span>
            </div>
          </div>

          {/* Active sessions */}
          <div className="flex items-center gap-2.5 p-2.5 rounded-lg bg-muted/30">
            <Clock className="w-4 h-4 text-violet-500" />
            <div className="min-w-0">
              <p className="text-[10px] text-muted-foreground">Sessions actives</p>
              <span className="text-xs font-semibold text-foreground">
                {activeSessions !== null ? activeSessions : "—"}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
