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
      <CardContent className="p-3 sm:p-4">
        <div className="flex items-center gap-2.5">
          <div
            className={cn(
              "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
              bgColor
            )}
          >
            <Icon className={cn("w-4 h-4", colorClass)} />
          </div>
          <div>
            <p className="text-xl font-bold text-foreground leading-tight">
              {value}
            </p>
            <p className="text-[11px] text-muted-foreground mt-0.5">{label}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
