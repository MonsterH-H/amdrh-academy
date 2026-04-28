"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BookOpen } from "lucide-react";
import { DIFFICULTY_LABELS, DIFFICULTY_COLORS } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function CourseProgressCard({
  enrollment,
  course,
  onViewCourse,
}: {
  enrollment: Record<string, unknown>;
  course: Record<string, unknown>;
  onViewCourse: (courseId: string) => void;
}) {
  return (
    <Card
      className="border-border/60 hover:shadow-md transition-all duration-200 cursor-pointer"
      onClick={() => onViewCourse(course.id as string)}
    >
      <CardContent className="p-4">
        <div className="w-full h-32 rounded-lg bg-gradient-to-br from-primary/20 to-blue-600/10 flex items-center justify-center mb-3">
          <BookOpen className="w-8 h-8 text-primary" />
        </div>
        <Badge variant="secondary" className={cn("text-[10px] mb-2", DIFFICULTY_COLORS[(course.difficulty as string) || "DEBUTANT"])}>
          {DIFFICULTY_LABELS[(course.difficulty as string) || "DEBUTANT"]}
        </Badge>
        <h4 className="font-semibold text-sm text-foreground line-clamp-2">{course.title as string}</h4>
        <div className="mt-3">
          <div className="flex justify-between text-xs text-muted-foreground mb-1">
            <span>Progression</span>
            <span>{enrollment.progress as number}%</span>
          </div>
          <Progress value={enrollment.progress as number} className="h-1.5" />
        </div>
      </CardContent>
    </Card>
  );
}
