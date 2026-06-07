"use client";

import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, TrendingUp, Wifi, WifiOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatTimestampAgo } from "@/utils/format";

export interface ActivityItem {
  id: string;
  type: "quiz" | "progress" | "connection";
  title: string;
  description: string;
  timestamp: number;
}

export function RealtimeActivityFeed({ items }: { items: ActivityItem[] }) {
  if (items.length === 0) return null;

  return (
    <Card className="border-border/60">
      <CardContent className="p-6">
        <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-primary" /> Activité en direct
        </h3>
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {items.map((item) => {
            const timeAgo = formatTimestampAgo(item.timestamp);
            return (
              <div key={item.id} className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors animate-fadeIn">
                <div className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5",
                  item.type === "quiz"
                    ? "bg-violet-100 text-violet-600"
                    : item.type === "progress"
                      ? "bg-blue-100 text-blue-600"
                      : "bg-blue-100 text-blue-600"
                )}>
                  {item.type === "quiz" ? (
                    <CheckCircle className="w-3.5 h-3.5" />
                  ) : item.type === "progress" ? (
                    <TrendingUp className="w-3.5 h-3.5" />
                  ) : (
                    <Wifi className="w-3.5 h-3.5" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{item.title}</p>
                  <p className="text-xs text-muted-foreground line-clamp-1">{item.description}</p>
                  <p className="text-[10px] text-muted-foreground/70 mt-0.5">{timeAgo}</p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

export function ConnectionStatusBadge({ isConnected, isEnabled = true }: { isConnected: boolean; isEnabled?: boolean }) {
  if (!isEnabled) return null;
  return (
    <div className={cn(
      "flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full transition-colors duration-300",
      isConnected
        ? "bg-green-50 text-green-700 border border-green-200/60"
        : "bg-yellow-50 text-yellow-700 border border-yellow-200/60"
    )}>
      {isConnected ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
      {isConnected ? "Temps réel actif" : "Reconnexion..."}
    </div>
  );
}
