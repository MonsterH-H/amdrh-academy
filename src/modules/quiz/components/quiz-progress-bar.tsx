"use client";

import { useAppStore } from "@/store/app";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatTime } from "../types";

interface QuizProgressBarProps {
  timeLeft: number;
  originalDuration: number;
  currentIdx: number;
  totalQuestions: number;
  answeredCount: number;
}

export function QuizProgressBar({
  timeLeft,
  originalDuration,
  currentIdx,
  totalQuestions,
  answeredCount,
}: QuizProgressBarProps) {
  const { viewParams, navigate } = useAppStore();
  const courseId = viewParams?.courseId;
  const progressPct = ((currentIdx + 1) / totalQuestions) * 100;
  const timePercent = originalDuration > 0 ? (timeLeft / originalDuration) * 100 : 0;

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => navigate("course-detail", { id: courseId || "" })}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4" /> Quitter
        </button>
        <div className="flex items-center gap-3">
          <Badge variant="secondary" className="text-[10px]">
            {answeredCount}/{totalQuestions} répondu{answeredCount > 1 ? "s" : ""}
          </Badge>
          <div
            className={cn(
              "flex items-center gap-2 text-sm font-mono font-bold px-3 py-1.5 rounded-lg",
              timeLeft < 120
                ? "text-red-600 bg-red-50"
                : timeLeft < 300
                  ? "text-amber-600 bg-amber-50"
                  : "text-foreground bg-muted/50"
            )}
          >
            <Clock className="w-4 h-4" />
            {formatTime(timeLeft)}
          </div>
        </div>
      </div>

      <div className="relative mb-6">
        <Progress value={progressPct} className="h-1.5" />
        {timeLeft < 120 && (
          <Progress value={timePercent} className="h-0.5 mt-0.5 opacity-50" />
        )}
      </div>
    </>
  );
}
