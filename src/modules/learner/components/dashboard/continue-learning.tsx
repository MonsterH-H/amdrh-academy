"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { BookOpen, Clock, ArrowRight, PlayCircle, Timer, History } from "lucide-react";
import { CATEGORY_GRADIENTS, CATEGORY_ICON_COLORS, DIFFICULTY_LABELS, DIFFICULTY_COLORS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { formatTimestampAgo, formatDuration } from "@/utils/format";

interface EnrollmentData {
  id: string;
  status: string;
  progress: number;
  lastAccessAt: string;
  course: {
    id: string;
    title: string;
    category: string;
    difficulty: string;
    coverImage: string | null;
    duration: number;
    instructor: { nom: string; prenom: string } | null;
  };
}

export function ContinueLearningSection({
  enrollments,
  onContinue,
  onViewAll,
}: {
  enrollments: EnrollmentData[];
  onContinue: (courseId: string) => void;
  onViewAll: () => void;
}) {
  const inProgress = enrollments.filter((e) => e.status === "en_cours");

  if (inProgress.length === 0) return null;

  return (
    <section>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Continuer l&apos;apprentissage</h3>
          <p className="text-sm text-muted-foreground mt-0.5">
            {inProgress.length} cours en cours
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground hover:text-foreground"
          onClick={onViewAll}
        >
          Voir tout <ArrowRight className="ml-1 w-3.5 h-3.5" />
        </Button>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 stagger-children">
        {inProgress.slice(0, 3).map((enrollment) => (
          <ContinueLearningCard
            key={enrollment.id}
            enrollment={enrollment}
            onContinue={onContinue}
          />
        ))}
      </div>
    </section>
  );
}

function ContinueLearningCard({
  enrollment,
  onContinue,
}: {
  enrollment: EnrollmentData;
  onContinue: (courseId: string) => void;
}) {
  const { course } = enrollment;
  const progress = Math.round(enrollment.progress || 0);
  const timeSince = formatTimestampAgo(new Date(enrollment.lastAccessAt).getTime());
  const gradientClass = CATEGORY_GRADIENTS[course.category] || CATEGORY_GRADIENTS.ARBITRAGE;
  const iconColor = CATEGORY_ICON_COLORS[course.category] || CATEGORY_ICON_COLORS.ARBITRAGE;

  // Estimated remaining time: (remaining percentage / 100) * total duration
  const remainingMinutes = course.duration > 0
    ? Math.round(((100 - progress) / 100) * course.duration)
    : 0;

  // Format last accessed time
  const lastAccessDisplay = timeSince
    .replace("à l'instant", "quelques instants")
    .replace("il y a ", "");

  return (
    <Card className="border-border/50 hover:shadow-lg hover:border-primary/20 transition-all duration-300 overflow-hidden group">
      {/* Course thumbnail area */}
      <div className={cn("h-32 flex items-center justify-center relative", gradientClass)}>
        <BookOpen className={cn("w-10 h-10", iconColor)} />
        <div className="absolute top-3 left-3">
          <Badge className={cn("text-[10px] shadow-sm", DIFFICULTY_COLORS[course.difficulty] || DIFFICULTY_COLORS.DEBUTANT)}>
            {DIFFICULTY_LABELS[course.difficulty] || "Débutant"}
          </Badge>
        </div>
        {progress >= 80 && (
          <div className="absolute top-3 right-3">
            <Badge className="bg-amber-100 text-amber-700 text-[10px] shadow-sm">
              Presque terminé
            </Badge>
          </div>
        )}
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

        {/* Progress bar with percentage */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center text-xs">
            <span className="text-muted-foreground">Progression</span>
            <span className="font-semibold text-primary">{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Meta info: last activity + estimated time */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <History className="w-3 h-3" />
            <span>Dernière activité: {lastAccessDisplay}</span>
          </div>
          {remainingMinutes > 0 && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Timer className="w-3 h-3" />
              <span>{formatDuration(remainingMinutes)}</span>
            </div>
          )}
        </div>

        {/* Resume button */}
        <Button
          size="sm"
          className="w-full gap-2 mt-1"
          onClick={(e) => {
            e.stopPropagation();
            onContinue(course.id);
          }}
        >
          <PlayCircle className="w-4 h-4" />
          Reprendre
        </Button>
      </CardContent>
    </Card>
  );
}
