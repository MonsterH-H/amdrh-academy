"use client";

import { BarChart3 } from "lucide-react";

export function EmptyChartState({ message }: { message: string }) {
  return (
    <div className="flex items-center justify-center h-[200px] text-muted-foreground/50">
      <div className="text-center">
        <BarChart3 className="w-8 h-8 mx-auto mb-2 opacity-40" />
        <p className="text-xs">{message}</p>
      </div>
    </div>
  );
}
