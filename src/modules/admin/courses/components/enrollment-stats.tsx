"use client";

import { useState, useEffect, useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Users, CheckCircle2, Clock, XCircle, TrendingUp,
} from "lucide-react";
import { ENROLLMENT_STATUS_LABELS, ENROLLMENT_STATUS_COLORS } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface EnrollmentStat {
  status: string;
  count: number;
}

interface EnrollmentStatsProps {
  courseId: string;
  totalEnrolled: number;
}

export function EnrollmentStats({ courseId, totalEnrolled }: EnrollmentStatsProps) {
  const [stats, setStats] = useState<EnrollmentStat[]>([]);
  const [loading, setLoading] = useState(!!courseId && totalEnrolled > 0);

  const fetchStats = useCallback(() => {
    if (!courseId || totalEnrolled === 0) return;
    fetch(`/api/courses/${courseId}/stats`)
      .then((res) => res.json())
      .then((data) => { setStats(data.enrollmentStats || []); setLoading(false); })
      .catch(() => { setLoading(false); });
  }, [courseId, totalEnrolled]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  if (totalEnrolled === 0) {
    return (
      <div className="text-center py-6">
        <Users className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
        <p className="text-sm text-muted-foreground">Aucune inscription</p>
      </div>
    );
  }

  const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
    en_cours: Clock,
    termine: CheckCircle2,
    abandonne: XCircle,
  };

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
        <TrendingUp className="w-4 h-4 text-primary" />
        Statistiques d&apos;inscription ({totalEnrolled})
      </h4>
      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full rounded-lg" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {stats.map((stat) => {
            const Icon = iconMap[stat.status] || Users;
            const pct = totalEnrolled > 0 ? Math.round((stat.count / totalEnrolled) * 100) : 0;
            return (
              <div key={stat.status} className="p-3 rounded-lg bg-muted/50 border border-border/30">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">
                      {ENROLLMENT_STATUS_LABELS[stat.status] || stat.status}
                    </span>
                  </div>
                  <Badge variant="secondary" className={cn("text-[10px]", ENROLLMENT_STATUS_COLORS[stat.status])}>
                    {stat.count}
                  </Badge>
                </div>
                <div className="w-full h-1.5 rounded-full bg-border/40 overflow-hidden">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all duration-500",
                      stat.status === "termine" && "bg-green-500",
                      stat.status === "en_cours" && "bg-blue-500",
                      stat.status === "abandonne" && "bg-red-400",
                    )}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <p className="text-[10px] text-muted-foreground mt-1">{pct}%</p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
