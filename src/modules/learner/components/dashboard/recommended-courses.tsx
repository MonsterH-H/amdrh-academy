"use client";

import { useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, ArrowRight, Users, BookOpen, ChevronLeft, ChevronRight } from "lucide-react";
import { CATEGORY_LABELS, CATEGORY_GRADIENTS, CATEGORY_ICON_COLORS, DIFFICULTY_LABELS, DIFFICULTY_COLORS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { formatDuration } from "@/utils/format";

interface RecommendedCourse {
  id: string;
  title: string;
  category: string;
  difficulty: string;
  duration: number;
  isCertifying: boolean;
  instructor: { nom: string; prenom: string } | null;
  _count: { enrollments: number };
}

export function RecommendedCoursesSection({
  courses,
  onEnroll,
  onBrowseAll,
}: {
  courses: RecommendedCourse[];
  onEnroll: (courseId: string) => void;
  onBrowseAll: () => void;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);

  if (courses.length === 0) return null;

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const scrollAmount = 320;
    scrollRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  return (
    <section>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Recommandé pour vous</h3>
          <p className="text-sm text-muted-foreground mt-0.5">
            Cours sélectionnés pour votre parcours
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 hidden sm:flex"
            onClick={() => scroll("left")}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 hidden sm:flex"
            onClick={() => scroll("right")}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-foreground"
            onClick={onBrowseAll}
          >
            Catalogue <ArrowRight className="ml-1 w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-thin"
        style={{ scrollbarWidth: "thin" }}
      >
        {courses.map((course) => (
          <RecommendedCourseCard
            key={course.id}
            course={course}
            onEnroll={onEnroll}
          />
        ))}
      </div>
    </section>
  );
}

function RecommendedCourseCard({
  course,
  onEnroll,
}: {
  course: RecommendedCourse;
  onEnroll: (courseId: string) => void;
}) {
  const gradientClass = CATEGORY_GRADIENTS[course.category] || CATEGORY_GRADIENTS.ARBITRAGE;
  const iconColor = CATEGORY_ICON_COLORS[course.category] || CATEGORY_ICON_COLORS.ARBITRAGE;

  return (
    <Card className="min-w-[280px] max-w-[300px] w-full flex-shrink-0 border-border/50 hover:shadow-lg hover:border-primary/20 transition-all duration-300 snap-start group">
      <div className={cn("h-36 flex items-center justify-center rounded-t-xl relative", gradientClass)}>
        <BookOpen className={cn("w-10 h-10", iconColor)} />
        <div className="absolute top-3 left-3 flex gap-1.5">
          <Badge variant="secondary" className="text-[10px] bg-card/80 backdrop-blur-sm">
            {CATEGORY_LABELS[course.category] || course.category}
          </Badge>
          {course.isCertifying && (
            <Badge className="text-[10px] bg-amber-100 text-amber-700">
              Certifiant
            </Badge>
          )}
        </div>
      </div>

      <CardContent className="p-4 space-y-3">
        <div>
          <h4 className="font-semibold text-sm text-foreground line-clamp-2 leading-snug">
            {course.title}
          </h4>
          {course.instructor && (
            <p className="text-xs text-muted-foreground mt-1">
              {course.instructor.prenom} {course.instructor.nom}
            </p>
          )}
        </div>

        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>{formatDuration(course.duration)}</span>
          </div>
          <Badge className={cn("text-[10px]", DIFFICULTY_COLORS[course.difficulty] || DIFFICULTY_COLORS.DEBUTANT)}>
            {DIFFICULTY_LABELS[course.difficulty] || "Débutant"}
          </Badge>
        </div>

        {course._count.enrollments > 0 && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Users className="w-3 h-3" />
            <span>{course._count.enrollments} inscrits</span>
          </div>
        )}

        <Button
          size="sm"
          variant="outline"
          className="w-full mt-1"
          onClick={(e) => {
            e.stopPropagation();
            onEnroll(course.id);
          }}
        >
          S&apos;inscrire
        </Button>
      </CardContent>
    </Card>
  );
}
