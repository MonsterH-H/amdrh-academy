"use client";

import { Skeleton } from "@/components/ui/skeleton";

export function AdminUsersSkeleton() {
  return <div aria-hidden="true" className="space-y-4"><Skeleton className="h-8 w-64" /><Skeleton className="h-10 w-64" /><Skeleton className="h-96 rounded-xl" /></div>;
}
