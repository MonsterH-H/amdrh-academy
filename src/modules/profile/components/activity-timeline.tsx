"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { formatTimeAgo } from "@/utils/format";
import {
  Award, HelpCircle, BookOpen, Star, Mail, Activity,
} from "lucide-react";
import type { ActivityItem } from "../types/achievements";

interface ActivityTimelineProps {
  activity: ActivityItem[];
  loading: boolean;
}

function getActivityIcon(type: string) {
  const m: Record<string, React.ReactNode> = {
    CERTIFICAT: <Award className="w-4 h-4 text-amber-500" />,
    QUIZ: <HelpCircle className="w-4 h-4 text-blue-500" />,
    COURS: <BookOpen className="w-4 h-4 text-sky-500" />,
    BADGE: <Star className="w-4 h-4 text-yellow-500" />,
    MESSAGE: <Mail className="w-4 h-4 text-violet-500" />,
  };
  return m[type] || <Activity className="w-4 h-4 text-muted-foreground" />;
}

function getDateGroup(dateStr: string): string {
  if (!dateStr) return "";
  const now = new Date();
  const date = new Date(dateStr);
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today.getTime() - 86400000);
  const weekAgo = new Date(today.getTime() - 7 * 86400000);
  const itemDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  if (itemDay.getTime() === today.getTime()) return "Aujourd\u2019hui";
  if (itemDay.getTime() === yesterday.getTime()) return "Hier";
  if (itemDay >= weekAgo) return "Cette semaine";
  return date.toLocaleDateString("fr-FR", { day: "numeric", month: "long" });
}

interface GroupedActivity { group: string; items: ActivityItem[]; }

function groupByDate(items: ActivityItem[]): GroupedActivity[] {
  const groups = new Map<string, ActivityItem[]>();
  for (const item of items) {
    const g = getDateGroup(item.createdAt);
    if (!g) continue;
    if (!groups.has(g)) groups.set(g, []);
    groups.get(g)!.push(item);
  }
  return Array.from(groups.entries()).map(([group, items]) => ({ group, items }));
}

export function ActivityTimeline({ activity, loading }: ActivityTimelineProps) {
  return (
    <Card className="border-border/60">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Activity className="w-4 h-4 text-primary" /> Activité récente
        </CardTitle>
        <CardDescription>Vos dernières actions sur la plateforme</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-4 py-4">{[...Array(4)].map((_, i) => (
            <div key={i} className="flex gap-3">
              <Skeleton className="w-8 h-8 rounded-full flex-shrink-0" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-3.5 w-48" />
                <Skeleton className="h-3 w-32" />
                <Skeleton className="h-2.5 w-16" />
              </div>
            </div>
          ))}</div>
        ) : activity.length === 0 ? (
          <div className="text-center py-8">
            <Activity className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">Aucune activité récente</p>
            <p className="text-xs text-muted-foreground/60 mt-1">Commencez une formation pour voir votre activité ici</p>
          </div>
        ) : (
          <div className="max-h-96 overflow-y-auto pr-1 space-y-6">
            {groupByDate(activity).map((g) => (
              <div key={g.group}>
                <p className="text-xs font-semibold text-muted-foreground/60 uppercase tracking-wider mb-3">{g.group}</p>
                <div className="space-y-0">
                  {g.items.map((item, idx) => (
                    <div key={item.id} className="relative flex gap-3 pb-4 last:pb-0">
                      {idx < g.items.length - 1 && (
                        <div className="absolute left-[15px] top-8 bottom-0 w-px bg-border" />
                      )}
                      <div className={cn(
                        "relative z-10 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5",
                        "bg-muted",
                      )}>
                        {getActivityIcon(item.type)}
                      </div>
                      <div className="flex-1 min-w-0 pt-0.5">
                        <p className="text-sm font-medium text-foreground leading-tight">{item.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{item.message}</p>
                        <p className="text-[10px] text-muted-foreground/60 mt-1">{formatTimeAgo(item.createdAt)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
