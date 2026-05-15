"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

// ─── Dashboard Skeleton ──────────────────────────────────────────────────────

export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="space-y-2">
          <Skeleton className="h-8 w-72" />
          <Skeleton className="h-4 w-48" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-24 rounded-lg" />
          <Skeleton className="h-9 w-9 rounded-lg" />
          <Skeleton className="h-9 w-28 rounded-lg" />
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="border-border/60">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <Skeleton className="h-10 w-10 rounded-xl" />
                <Skeleton className="h-5 w-12 rounded-full" />
              </div>
              <Skeleton className="h-7 w-16 mb-1" />
              <Skeleton className="h-3.5 w-24" />
              <Skeleton className="h-3 w-32 mt-0.5" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="grid lg:grid-cols-5 gap-6">
        <Card className="border-border/60 lg:col-span-3">
          <CardContent className="p-6">
            <Skeleton className="h-5 w-44 mb-4" />
            <Skeleton className="w-full h-[280px] rounded-lg" />
          </CardContent>
        </Card>
        <Card className="border-border/60 lg:col-span-2">
          <CardContent className="p-6">
            <Skeleton className="h-5 w-40 mb-4" />
            <Skeleton className="w-full h-[280px] rounded-lg" />
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid lg:grid-cols-2 gap-6">
        {[...Array(2)].map((_, i) => (
          <Card key={i} className="border-border/60">
            <CardContent className="p-6">
              <Skeleton className="h-5 w-44 mb-4" />
              <Skeleton className="w-full h-[280px] rounded-lg" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Activity + Quick Actions */}
      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="border-border/60 lg:col-span-2">
          <CardContent className="p-6">
            <Skeleton className="h-5 w-36 mb-4" />
            <div className="space-y-2">{[...Array(6)].map((_, i) => <Skeleton key={i} className="h-11 w-full rounded-lg" />)}</div>
          </CardContent>
        </Card>
        <Card className="border-border/60">
          <CardContent className="p-6">
            <Skeleton className="h-5 w-32 mb-4" />
            <div className="grid grid-cols-2 gap-3">{[...Array(6)].map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-xl" />)}</div>
          </CardContent>
        </Card>
      </div>

      {/* System Health */}
      <Skeleton className="h-24 w-full rounded-xl" />
    </div>
  );
}
