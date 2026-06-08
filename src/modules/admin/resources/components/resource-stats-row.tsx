"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FolderOpen, HardDrive, Upload } from "lucide-react";
import { RESOURCE_TYPE_LABELS, RESOURCE_TYPE_COLORS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { ResourceStats } from "../types";
import { formatFileSize } from "../types";

// ────────────────────────────────────────────
// Stats Row Props
// ────────────────────────────────────────────

interface ResourceStatsRowProps {
  stats: ResourceStats | null;
  total: number;
}

// ────────────────────────────────────────────
// Stats Row Component
// ────────────────────────────────────────────

export function ResourceStatsRow({ stats, total }: ResourceStatsRowProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total resources */}
      <Card className="border-border/60">
        <CardContent className="p-4 flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-[#1D4ED8]/10 text-[#1D4ED8]">
            <FolderOpen className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xl font-bold leading-none">{total}</p>
            <p className="text-[11px] text-muted-foreground mt-1">Ressources</p>
          </div>
        </CardContent>
      </Card>

      {/* Total storage */}
      <Card className="border-border/60">
        <CardContent className="p-4 flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-[#F59E0B]/10 text-[#F59E0B]">
            <HardDrive className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xl font-bold leading-none">
              {stats?.totalSize ? formatFileSize(stats.totalSize) : "0 octets"}
            </p>
            <p className="text-[11px] text-muted-foreground mt-1">Espace utilisé</p>
          </div>
        </CardContent>
      </Card>

      {/* Type breakdown */}
      <Card className="border-border/60 col-span-2 lg:col-span-1">
        <CardContent className="p-4">
          <p className="text-[11px] text-muted-foreground mb-2 font-medium uppercase tracking-wide">
            Par type
          </p>
          <div className="flex flex-wrap gap-1.5">
            {stats?.byType
              ? Object.entries(stats.byType).map(([type, count]) => (
                  <Badge
                    key={type}
                    variant="secondary"
                    className={cn("text-[10px] font-medium", RESOURCE_TYPE_COLORS[type])}
                  >
                    {RESOURCE_TYPE_LABELS[type] || type} ({count})
                  </Badge>
                ))
              : total > 0 && (
                  <span className="text-xs text-muted-foreground">
                    {total} ressource{total > 1 ? "s" : ""}
                  </span>
                )}
            {stats?.byType && Object.keys(stats.byType).length === 0 && (
              <span className="text-xs text-muted-foreground">Aucune donnée</span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Last upload */}
      <Card className="border-border/60">
        <CardContent className="p-4 flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-blue-500/10 text-blue-600">
            <Upload className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold leading-none truncate">—</p>
            <p className="text-[11px] text-muted-foreground mt-1">Dernier ajout</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
