"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trophy, Calendar, Clock, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDate, formatTime } from "@/utils/format";
import type { QuizAttemptData } from "../../types";

export function QuizAttemptsSection({
  attempts,
  onViewCourse,
}: {
  attempts: QuizAttemptData[];
  onViewCourse: (courseId: string) => void;
}) {
  if (attempts.length === 0) return null;

  return (
    <Card className="border-border/60 overflow-hidden">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Trophy className="w-4 h-4 text-amber-500" />
          Historique des quiz ({attempts.length} tentative
          {attempts.length > 1 ? "s" : ""})
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {attempts.map((attempt) => {
            const pct = attempt.maxScore > 0
              ? Math.round((attempt.score / attempt.maxScore) * 100) : 0;
            return (
              <div key={attempt.id}
                className="flex items-center gap-3 p-3 rounded-lg border border-border/60 hover:bg-muted/30 transition-colors">
                <div className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
                  attempt.status === "REUSSI" ? "bg-green-100" : "bg-red-100"
                )}>
                  {attempt.status === "REUSSI" ? (
                    <Trophy className="w-4 h-4 text-green-600" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-500" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {attempt.courseTitle || "Quiz"}
                  </p>
                  <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                    <Calendar className="w-3 h-3" />
                    <span>{attempt.submittedAt ? formatDate(attempt.submittedAt) : ""}</span>
                    {attempt.duration > 0 && (
                      <><Clock className="w-3 h-3" /><span>{formatTime(attempt.duration)}</span></>
                    )}
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className={cn("text-lg font-bold",
                    pct >= 70 ? "text-green-600" : pct >= 50 ? "text-amber-600" : "text-red-600"
                  )}>{pct}%</div>
                  <p className="text-[10px] text-muted-foreground">{attempt.score}/{attempt.maxScore}</p>
                </div>
                <div className="w-12 h-1.5 bg-muted rounded-full overflow-hidden flex-shrink-0">
                  <div className={cn("h-full rounded-full",
                    pct >= 70 ? "bg-green-500" : pct >= 50 ? "bg-amber-500" : "bg-red-500"
                  )} style={{ width: `${Math.min(pct, 100)}%` }} />
                </div>
                {attempt.courseId && (
                  <Button variant="ghost" size="sm" className="h-7 text-[10px] rounded-md flex-shrink-0"
                    onClick={() => onViewCourse(attempt.courseId!)}>
                    Voir
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
