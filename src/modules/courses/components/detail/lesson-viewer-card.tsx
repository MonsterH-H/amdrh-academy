"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  CheckCircle2, Loader2, X, ChevronLeft, ChevronRight, Clock,
} from "lucide-react";
import {
  LESSON_TYPE_LABELS, LESSON_TYPE_COLORS,
} from "@/lib/constants";
import { cn } from "@/lib/utils";
import { LessonData, LessonProgressEntry, getCompletionTriggerLabel } from "./lesson-item";
import { LessonTypeIcon } from "./lesson-item";
import { VideoSimulator } from "./video-simulator";
import { TextReaderWithTracking, LessonTypePlaceholder } from "./lesson-viewer";

interface LessonViewerCardProps {
  activeLesson: LessonData;
  activeLessonIndex: number;
  totalLessons: number;
  prevLesson: LessonData | null;
  nextLesson: LessonData | null;
  activeLessonProgress: LessonProgressEntry | null;
  activeSectionTitle: string | undefined;
  isLessonCompleted: boolean;
  isEnrolled: boolean;
  courseId: string;
  markingComplete: boolean;
  onClose: () => void;
  onMarkComplete: (lessonId: string) => void;
  onAutoComplete: () => void;
  onPrevLesson: () => void;
  onNextLesson: () => void;
}

export function LessonViewerCard({
  activeLesson,
  activeLessonIndex,
  totalLessons,
  prevLesson,
  nextLesson,
  activeLessonProgress,
  activeSectionTitle,
  isLessonCompleted,
  isEnrolled,
  courseId,
  markingComplete,
  onClose,
  onMarkComplete,
  onAutoComplete,
  onPrevLesson,
  onNextLesson,
}: LessonViewerCardProps) {
  return (
    <Card className="border-primary/20 shadow-sm mb-6 overflow-hidden">
      {/* Viewer Header */}
      <div className="px-3 sm:px-5 py-3 sm:py-4 bg-gradient-to-r from-primary/5 to-transparent flex items-start justify-between gap-3 sm:gap-4">
        <div className="min-w-0 flex-1">
          <button onClick={onClose} className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-2">
            <ChevronLeft className="w-3.5 h-3.5" /> Retour au plan du cours
          </button>
          <h2 className="text-lg font-bold text-foreground leading-snug">{activeLesson.title}</h2>
          <div className="flex flex-wrap items-center gap-2 mt-2">
            <Badge variant="secondary" className={cn("text-[11px]", LESSON_TYPE_COLORS[activeLesson.type || "TEXTE"])}>
              <LessonTypeIcon type={activeLesson.type} />
              <span className="ml-1">{LESSON_TYPE_LABELS[activeLesson.type] || activeLesson.type}</span>
            </Badge>
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Clock className="w-3 h-3" /> {activeLesson.duration} min
            </span>
            {activeSectionTitle && (
              <span className="text-xs text-muted-foreground">{activeSectionTitle}</span>
            )}
            {isLessonCompleted && (
              <Badge variant="secondary" className="bg-green-100 text-green-700 text-[11px] gap-1">
                <CheckCircle2 className="w-3 h-3" />
                {activeLessonProgress?.completionTrigger
                  ? `Complétée (${getCompletionTriggerLabel(activeLessonProgress.completionTrigger)})`
                  : "Complétée"}
              </Badge>
            )}
          </div>
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0 text-muted-foreground hover:text-foreground" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </div>
      <Separator />

      {/* Viewer Content */}
      <div className="p-3 sm:p-5">
        {activeLesson.type === "TEXTE" && activeLesson.content ? (
          <TextReaderWithTracking
            content={activeLesson.content} lessonId={activeLesson.id} courseId={courseId}
            initialScrollPercentage={activeLessonProgress?.scrollPercentage || 0}
            isCompleted={isLessonCompleted} onComplete={onAutoComplete} isEnrolled={isEnrolled}
          />
        ) : activeLesson.type === "VIDEO" ? (
          <VideoSimulator
            lessonId={activeLesson.id} courseId={courseId}
            initialWatchPercentage={activeLessonProgress?.watchPercentage || 0}
            lessonDuration={activeLesson.duration || 10}
            isCompleted={isLessonCompleted} onComplete={onAutoComplete} isEnrolled={isEnrolled}
          />
        ) : (
          <LessonTypePlaceholder type={activeLesson.type || ""} />
        )}
      </div>
      <Separator />

      {/* Viewer Footer - Actions and Navigation */}
      <div className="px-3 sm:px-5 py-3 sm:py-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        {!isLessonCompleted && (
          <div className="flex flex-col gap-1">
            <Button onClick={() => onMarkComplete(activeLesson.id)} disabled={markingComplete} className="rounded-lg text-sm bg-green-600 hover:bg-green-700">
              {markingComplete ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
              Marquer comme terminée
            </Button>
            {activeLesson.type === "VIDEO" && <p className="text-[10px] text-muted-foreground">Ou complétion automatique à 90% de visionnage</p>}
            {activeLesson.type === "TEXTE" && <p className="text-[10px] text-muted-foreground">Ou complétion automatique à 95% de lecture</p>}
          </div>
        )}
        {isLessonCompleted && (
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-2 text-sm text-green-600 font-medium">
              <CheckCircle2 className="w-4 h-4" /> Leçon terminée
            </div>
            {activeLessonProgress?.completionTrigger && activeLessonProgress.completionTrigger !== "manual" && (
              <p className="text-[10px] text-muted-foreground ml-6">
                ✓ Complétée automatiquement (
                {activeLessonProgress.completionTrigger === "auto_video"
                  ? `vidéo regardée à ${Math.round(activeLessonProgress.watchPercentage)}%`
                  : activeLessonProgress.completionTrigger === "auto_scroll"
                    ? `texte lu à ${Math.round(activeLessonProgress.scrollPercentage)}%`
                    : getCompletionTriggerLabel(activeLessonProgress.completionTrigger)}
                )
              </p>
            )}
          </div>
        )}
        <div className="flex-1" />
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="rounded-lg text-xs" disabled={!prevLesson} onClick={onPrevLesson}>
            <ChevronLeft className="w-4 h-4 mr-1" /> <span className="hidden sm:inline">Précédent</span>
          </Button>
          <span className="text-xs text-muted-foreground px-1">{activeLessonIndex + 1} / {totalLessons}</span>
          <Button variant="outline" size="sm" className="rounded-lg text-xs" disabled={!nextLesson} onClick={onNextLesson}>
            <span className="hidden sm:inline">Suivant</span> <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
