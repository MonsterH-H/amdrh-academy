"use client";

import { cn } from "@/lib/utils";
import {
  LESSON_TYPE_LABELS,
  LESSON_TYPE_ICONS,
} from "@/lib/constants";
import {
  CheckCircle2,
  PlayCircle,
  Lock,
  ChevronRight,
  Video,
  FileText,
  MousePointerClick,
  BookOpen,
} from "lucide-react";

export interface LessonData {
  id: string;
  title: string;
  type: string;
  content: string;
  duration: number;
  order: number;
  sectionId: string;
}

export interface LessonProgressEntry {
  id: string;
  lessonId: string;
  completed: boolean;
  timeSpent: number;
  watchPercentage: number;
  scrollPercentage: number;
  completionTrigger: string;
  lastPosition: number;
  viewedAt: string;
  completedAt: string | null;
}

export interface ResourceData {
  id: string;
  title: string;
  description: string | null;
  fileName: string;
  fileSize: number;
  fileType: string;
  filePath: string;
  category: string;
  isDownloadable: boolean;
  downloadCount: number;
  createdAt: string;
}

// ─── Helpers ──────────────────────────────────────

export function formatTime(seconds: number): string {
  if (!seconds || seconds <= 0) return "0min";
  if (seconds < 60) return `${Math.round(seconds)}s`;
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  if (hours > 0) return `${hours}h ${mins}min`;
  return `${mins}min`;
}

export function getCompletionTriggerLabel(trigger: string): string {
  switch (trigger) {
    case "auto_video": return "Auto vidéo";
    case "auto_scroll": return "Auto lecture";
    case "auto_time": return "Auto temps";
    case "manual": return "Manuel";
    default: return trigger;
  }
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 o";
  const units = ["o", "Ko", "Mo", "Go"];
  const k = 1024;
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${units[i]}`;
}

export function LessonTypeIcon({ type }: { type: string }) {
  switch (type) {
    case "VIDEO": return <Video className="w-4 h-4" />;
    case "PDF": return <FileText className="w-4 h-4" />;
    case "INTERACTIF": return <MousePointerClick className="w-4 h-4" />;
    default: return <BookOpen className="w-4 h-4" />;
  }
}

// ─── Lesson Item ──────────────────────────────────

interface LessonItemProps {
  lesson: Record<string, unknown>;
  isEnrolled: boolean;
  isActive: boolean;
  onClick: () => void;
  getLessonCompleted: (lessonId: string) => boolean;
  getLessonProgressData: (lessonId: string) => LessonProgressEntry | null;
}

export function LessonItem({
  lesson,
  isEnrolled,
  isActive,
  onClick,
  getLessonCompleted,
  getLessonProgressData,
}: LessonItemProps) {
  const lessonIdStr = lesson.id as string;
  const completed = getLessonCompleted(lessonIdStr);
  const lessonType = lesson.type as string;
  const lp = getLessonProgressData(lessonIdStr);
  const hasProgress = lp && (lp.watchPercentage > 0 || lp.scrollPercentage > 0);
  const progressPct = lessonType === "VIDEO"
    ? (lp?.watchPercentage || 0)
    : (lp?.scrollPercentage || 0);

  return (
    <button
      disabled={!isEnrolled}
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 p-3 rounded-lg text-left transition-all duration-200",
        isEnrolled
          ? "hover:bg-muted/60 cursor-pointer"
          : "opacity-60 cursor-not-allowed",
        completed && !isActive && "bg-green-50/50",
        isActive && "bg-primary/10 ring-1 ring-primary/25",
      )}
    >
      {completed ? (
        <div className="flex-shrink-0">
          <CheckCircle2 className="w-5 h-5 text-green-500" />
          {lp?.completionTrigger && lp.completionTrigger !== "manual" && (
            <span className="text-[8px] text-green-600 block text-center mt-0.5">
              {getCompletionTriggerLabel(lp.completionTrigger)}
            </span>
          )}
        </div>
      ) : hasProgress ? (
        <div className="flex-shrink-0 relative">
          <PlayCircle className="w-5 h-5 text-amber-500" />
          <div className="absolute -bottom-1 left-0 right-0 h-1 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-amber-400 rounded-full"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
      ) : isEnrolled ? (
        <PlayCircle className="w-5 h-5 text-primary flex-shrink-0" />
      ) : (
        <Lock className="w-5 h-5 text-muted-foreground flex-shrink-0" />
      )}
      <div className="flex-1 min-w-0">
        <p className={cn(
          "text-sm font-medium text-foreground",
          isActive && "text-primary",
        )}>{lesson.title as string}</p>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-[10px] text-muted-foreground gap-1 inline-flex items-center">
            {LESSON_TYPE_ICONS[lessonType] || "📝"}
            {LESSON_TYPE_LABELS[lessonType] || lessonType}
          </span>
          <span className="text-[10px] text-muted-foreground">{lesson.duration as number} min</span>
          {lp && lp.timeSpent > 0 && (
            <span className="text-[10px] text-muted-foreground">
              · {formatTime(lp.timeSpent)}
            </span>
          )}
        </div>
      </div>
      {isEnrolled && (
        <ChevronRight className={cn(
          "w-4 h-4 flex-shrink-0 transition-colors",
          isActive ? "text-primary" : "text-muted-foreground/50",
        )} />
      )}
    </button>
  );
}
