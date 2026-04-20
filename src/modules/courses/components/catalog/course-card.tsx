"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Users, Award, BookOpen, Gavel, Dumbbell, Trophy, Building2 } from "lucide-react";
import {
  CATEGORY_LABELS,
  DIFFICULTY_LABELS,
  DIFFICULTY_COLORS,
  CATEGORY_GRADIENTS,
  CATEGORY_ICON_COLORS,
} from "@/lib/constants";
import { cn } from "@/lib/utils";

const CATEGORY_ICON_MAP: Record<string, React.ElementType> = {
  ARBITRAGE: Gavel,
  ENTRAINEMENT: Dumbbell,
  JOUEURS: Trophy,
  ADMINISTRATION: Building2,
};

interface CourseCardProps {
  course: Record<string, unknown>;
  onClick: () => void;
}

export function CourseCard({ course, onClick }: CourseCardProps) {
  const enrollments = course.enrollments as Array<Record<string, unknown>> | false;
  const userEnrollment = Array.isArray(enrollments) && enrollments.length > 0 ? enrollments[0] : null;
  const instructor = course.instructor as Record<string, unknown> | null;
  const courseCategory = (course.category as string) || "ARBITRAGE";
  const CategoryIcon = CATEGORY_ICON_MAP[courseCategory] || BookOpen;
  const iconColor = CATEGORY_ICON_COLORS[courseCategory] || "text-blue-400";
  const gradient = CATEGORY_GRADIENTS[courseCategory] || "from-blue-500/15 to-blue-600/20";

  return (
    <Card
      className="border-border/60 hover:shadow-md transition-all duration-200 cursor-pointer group"
      onClick={onClick}
    >
      <CardContent className="p-0">
        <div className={cn("relative w-full h-40 bg-gradient-to-br flex items-center justify-center overflow-hidden", gradient)}>
          <CategoryIcon className={cn("w-10 h-10 group-hover:scale-110 transition-transform duration-300", iconColor, "opacity-60")} />
          {userEnrollment && (
            <div className="absolute top-3 right-3">
              <Badge className="bg-green-500 text-white text-[10px]">
                {userEnrollment.progress as number}%
              </Badge>
            </div>
          )}
          {(course.isCertifying as boolean) && (
            <div className={cn("absolute right-3", userEnrollment ? "top-11" : "top-3")}>
              <Badge className="bg-amber-500/90 text-white text-[10px] flex items-center gap-1">
                <Award className="w-3 h-3" /> Certifiant
              </Badge>
            </div>
          )}
          <Badge variant="secondary" className="absolute top-3 left-3 text-[10px]">
            {CATEGORY_LABELS[courseCategory]}
          </Badge>
        </div>
        <div className="p-4">
          <Badge variant="secondary" className={cn("text-[10px] mb-2", DIFFICULTY_COLORS[(course.difficulty as string) || "DEBUTANT"])}>
            {DIFFICULTY_LABELS[(course.difficulty as string) || "DEBUTANT"]}
          </Badge>
          <h3 className="font-semibold text-sm text-foreground line-clamp-2 group-hover:text-primary transition-colors">
            {course.title as string}
          </h3>
          <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {course.duration as number} min</span>
            <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {(course._count as Record<string, unknown>)?.enrollments as number || 0}</span>
          </div>
          {instructor && (
            <p className="text-xs text-muted-foreground mt-2">
              {instructor.prenom as string} {instructor.nom as string}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
