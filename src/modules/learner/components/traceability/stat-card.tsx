"use client";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

export function StatCard({
  icon: Icon,
  label,
  value,
  colorClass,
  bgColor,
}: {
  icon: LucideIcon;
  label: string;
  value: string | number;
  colorClass: string;
  bgColor: string;
}) {
  return (
    <Card className="border-border/60 hover:shadow-sm transition-shadow">
      <CardContent className="p-4 sm:p-5">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0",
              bgColor
            )}
          >
            <Icon className={cn("w-5 h-5", colorClass)} />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground leading-tight">
              {value}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
