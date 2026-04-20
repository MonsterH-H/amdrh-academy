"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Trash2, Video, File, FileText, Target } from "lucide-react";
import { LESSON_TYPE_LABELS } from "@/lib/constants";
import type { LessonInput } from "@/lib/validations";
import { cn } from "@/lib/utils";

export const LESSON_TYPE_ICONS_MAP: Record<string, React.ReactNode> = {
  VIDEO: <Video className="w-4 h-4" />,
  PDF: <File className="w-4 h-4" />,
  TEXTE: <FileText className="w-4 h-4" />,
  INTERACTIF: <Target className="w-4 h-4" />,
};

export const LESSON_TYPE_COLORS_MAP: Record<string, string> = {
  VIDEO: "bg-purple-100 text-purple-700",
  PDF: "bg-red-100 text-red-700",
  TEXTE: "bg-emerald-100 text-emerald-700",
  INTERACTIF: "bg-amber-100 text-amber-700",
};

interface LessonEditorProps {
  sectionIdx: number;
  lessonIdx: number;
  lesson: LessonInput;
  errors: Record<string, string>;
  onUpdate: (sectionIdx: number, lessonIdx: number, field: keyof LessonInput, value: string | number) => void;
  onRemove: (sectionIdx: number, lessonIdx: number) => void;
  onClearError: (key: string) => void;
}

export function LessonEditor({
  sectionIdx,
  lessonIdx,
  lesson,
  errors,
  onUpdate,
  onRemove,
  onClearError,
}: LessonEditorProps) {
  const titleKey = `section-${sectionIdx}-lesson-${lessonIdx}-title`;
  const durationKey = `section-${sectionIdx}-lesson-${lessonIdx}-duration`;

  return (
    <div className="flex items-start gap-3 p-3 rounded-lg bg-background border border-border/40">
      {/* Lesson order */}
      <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-[10px] font-bold text-muted-foreground shrink-0 mt-0.5">
        {lessonIdx + 1}
      </div>

      <div className="flex-1 space-y-2">
        <Input
          placeholder="Titre de la leçon"
          value={lesson.title}
          onChange={(e) => {
            onUpdate(sectionIdx, lessonIdx, "title", e.target.value);
            onClearError(titleKey);
          }}
          className={cn(
            "h-8 text-sm rounded-lg",
            errors[titleKey] && "border-red-500",
          )}
        />
        {errors[titleKey] && <p className="text-xs text-red-500">{errors[titleKey]}</p>}

        <div className="flex flex-wrap items-center gap-2">
          {/* Lesson type select */}
          <Select
            value={lesson.type}
            onValueChange={(v) => onUpdate(sectionIdx, lessonIdx, "type", v)}
          >
            <SelectTrigger className="h-8 w-36 text-xs rounded-lg">
              <div className="flex items-center gap-1.5">
                {LESSON_TYPE_ICONS_MAP[lesson.type]}
                <SelectValue />
              </div>
            </SelectTrigger>
            <SelectContent>
              {Object.entries(LESSON_TYPE_LABELS).map(([key, label]) => (
                <SelectItem key={key} value={key}>
                  <div className="flex items-center gap-1.5">
                    {LESSON_TYPE_ICONS_MAP[key]}
                    {label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Duration */}
          <div className="flex items-center gap-1">
            <Input
              type="number"
              min={1}
              value={lesson.duration}
              onChange={(e) => onUpdate(sectionIdx, lessonIdx, "duration", parseInt(e.target.value) || 1)}
              className="h-8 w-16 text-xs rounded-lg"
            />
            <span className="text-xs text-muted-foreground">min</span>
          </div>

          {/* Lesson type badge */}
          <span className={cn(
            "px-2 py-0.5 rounded-full text-[10px] font-medium",
            LESSON_TYPE_COLORS_MAP[lesson.type],
          )}>
            {LESSON_TYPE_LABELS[lesson.type]}
          </span>
        </div>
      </div>

      {/* Remove lesson button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onRemove(sectionIdx, lessonIdx)}
        className="shrink-0 text-muted-foreground hover:text-red-500 hover:bg-red-50 h-8 w-8 p-0"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </Button>
    </div>
  );
}
