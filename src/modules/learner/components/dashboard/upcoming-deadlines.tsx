"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, AlertTriangle, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import { ENROLLMENT_STATUS_COLORS } from "@/lib/constants";

interface DeadlineCourse {
  id: string;
  title: string;
  progress: number;
  status: string;
  startedAt: string;
  difficulty?: string;
}

export function UpcomingDeadlines({ enrollments }: { enrollments: DeadlineCourse[] }) {
  const inProgress = enrollments
    .filter((e) => e.status === "en_cours" && e.progress < 100)
    .sort((a, b) => {
      const daysA = a.startedAt ? (Date.now() - new Date(a.startedAt).getTime()) / 86400000 : 0;
      const daysB = b.startedAt ? (Date.now() - new Date(b.startedAt).getTime()) / 86400000 : 0;
      return daysB - daysA;
    })
    .slice(0, 4);

  if (inProgress.length === 0) return null;

  const getUrgency = (progress: number, startedDays: number) => {
    if (progress < 30 && startedDays > 14) return { label: "Urgent", color: "bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-400" };
    if (progress < 50 && startedDays > 10) return { label: "Attention", color: "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400" };
    return { label: "En cours", color: "bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400" };
  };

  return (
    <Card className="border-border/60">
      <CardContent className="p-6">
        <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-500" /> Cours à compléter
        </h3>
        <div className="space-y-3">
          {inProgress.map((enrollment) => {
            const startedDays = enrollment.startedAt
              ? Math.floor((Date.now() - new Date(enrollment.startedAt).getTime()) / 86400000)
              : 0;
            const urgency = getUrgency(enrollment.progress, startedDays);

            return (
              <div key={enrollment.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                  <BookOpen className="w-4 h-4 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{enrollment.title}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden max-w-[100px]">
                      <div className={cn("h-full rounded-full transition-all", enrollment.progress >= 70 ? "bg-green-500" : enrollment.progress >= 40 ? "bg-amber-500" : "bg-red-500")} style={{ width: `${enrollment.progress}%` }} />
                    </div>
                    <span className="text-[10px] text-muted-foreground">{enrollment.progress}%</span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                  <Badge variant="secondary" className={cn("text-[9px]", urgency.color)}>{urgency.label}</Badge>
                  <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                    <Clock className="w-2.5 h-2.5" />
                    {startedDays}j
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
