"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { BookOpen, PlayCircle } from "lucide-react";
import { useAppStore } from "@/store/app";
import { cn } from "@/lib/utils";
import { DIFFICULTY_LABELS, DIFFICULTY_COLORS } from "@/lib/constants";

interface QuickResumeCourse {
  id: string;
  title: string;
  difficulty: string;
  progress: number;
  category?: string;
}

export function QuickResume({ courses }: { courses: QuickResumeCourse[] }) {
  const { navigate } = useAppStore();
  const lastCourse = courses[0];

  if (!lastCourse) return null;

  const difficulty = lastCourse.difficulty || "DEBUTANT";

  return (
    <Card className="border-border/60 overflow-hidden">
      <CardContent className="p-0">
        <div className="flex flex-col sm:flex-row">
          <div className={cn(
            "sm:w-48 flex-shrink-0 flex items-center justify-center p-6 sm:p-8",
            "bg-gradient-to-br from-primary/10 via-primary/5 to-transparent",
          )}>
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
              <BookOpen className="w-8 h-8 text-primary" />
            </div>
          </div>
          <div className="flex-1 p-5 sm:p-6">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full uppercase tracking-wider">
                Reprendre
              </span>
              <span className={cn("text-[10px] px-2 py-0.5 rounded-full", DIFFICULTY_COLORS[difficulty])}>
                {DIFFICULTY_LABELS[difficulty] || difficulty}
              </span>
            </div>
            <h3 className="font-semibold text-foreground text-lg mb-1">{lastCourse.title}</h3>
            <div className="flex items-center gap-3 mt-3 mb-4">
              <div className="flex-1">
                <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
                  <span>Progression</span>
                  <span className="font-medium text-foreground">{lastCourse.progress}%</span>
                </div>
                <Progress value={lastCourse.progress} className="h-2" />
              </div>
            </div>
            <Button
              className="gap-2 rounded-lg"
              onClick={() => navigate("course-detail", { id: lastCourse.id })}
            >
              <PlayCircle className="w-4 h-4" />
              Continuer
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
