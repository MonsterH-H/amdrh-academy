"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export function AdminResourcesSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2"><Skeleton className="h-7 w-48" /><Skeleton className="h-4 w-64" /></div>
        <Skeleton className="h-10 w-44 rounded-lg" />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="border-border/60"><CardContent className="p-4 flex items-center gap-3"><Skeleton className="w-10 h-10 rounded-lg" /><div className="space-y-1.5"><Skeleton className="h-5 w-16" /><Skeleton className="h-3 w-20" /></div></CardContent></Card>
        ))}
      </div>
      <Card className="border-border/60"><CardContent className="p-4 space-y-4"><div className="flex gap-3 flex-wrap"><Skeleton className="h-9 flex-1 max-w-md rounded-lg" /><Skeleton className="h-9 w-[150px] rounded-lg" /><Skeleton className="h-9 w-[170px] rounded-lg" /><Skeleton className="h-9 w-[180px] rounded-lg" /></div></CardContent></Card>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Card key={i} className="border-border/60"><CardContent className="p-4 space-y-3"><div className="flex items-start justify-between"><Skeleton className="w-10 h-10 rounded-lg" /><Skeleton className="w-7 h-7 rounded-lg" /></div><Skeleton className="h-4 w-3/4" /><Skeleton className="h-3 w-full" /><Skeleton className="h-3 w-1/2" /><div className="flex gap-1.5"><Skeleton className="h-5 w-14 rounded-full" /><Skeleton className="h-5 w-20 rounded-full" /></div><div className="pt-3 border-t border-border/40"><Skeleton className="h-3 w-24" /></div></CardContent></Card>
        ))}
      </div>
    </div>
  );
}
