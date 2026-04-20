"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GripVertical, Trash2, Plus } from "lucide-react";
import type { SectionInput, LessonInput } from "@/lib/validations";
import { cn } from "@/lib/utils";
import { LessonEditor } from "./lesson-editor";

interface SectionEditorProps {
  sectionIdx: number;
  section: SectionInput;
  totalSections: number;
  errors: Record<string, string>;
  onUpdateTitle: (sectionIdx: number, value: string) => void;
  onRemoveSection: (sectionIdx: number) => void;
  onAddLesson: (sectionIdx: number) => void;
  onRemoveLesson: (sectionIdx: number, lessonIdx: number) => void;
  onUpdateLesson: (sectionIdx: number, lessonIdx: number, field: keyof LessonInput, value: string | number) => void;
  onClearError: (key: string) => void;
}

export function SectionEditor({
  sectionIdx,
  section,
  totalSections,
  errors,
  onUpdateTitle,
  onRemoveSection,
  onAddLesson,
  onRemoveLesson,
  onUpdateLesson,
  onClearError,
}: SectionEditorProps) {
  const titleKey = `section-${sectionIdx}-title`;

  return (
    <div className="border border-border/60 rounded-lg overflow-hidden">
      {/* Section header */}
      <div className="flex items-center gap-3 p-4 bg-muted/40">
        <GripVertical className="w-4 h-4 text-muted-foreground shrink-0" />
        <span className="text-xs font-bold text-[#1D4ED8] uppercase tracking-wide shrink-0">
          Section {sectionIdx + 1}
        </span>
        <Input
          placeholder="Titre de la section"
          value={section.title}
          onChange={(e) => {
            onUpdateTitle(sectionIdx, e.target.value);
            onClearError(titleKey);
          }}
          className={cn(
            "flex-1 h-8 text-sm rounded-lg bg-background border-border/60",
            errors[titleKey] && "border-red-500",
          )}
        />
        {totalSections > 1 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onRemoveSection(sectionIdx)}
            className="shrink-0 text-red-500 hover:text-red-600 hover:bg-red-50 h-8 w-8 p-0"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        )}
      </div>
      {errors[titleKey] && (
        <p className="text-xs text-red-500 px-4 pt-1">{errors[titleKey]}</p>
      )}

      {/* Lessons */}
      <div className="p-4 pt-2 space-y-3">
        {section.lessons.map((lesson, lessonIdx) => (
          <LessonEditor
            key={lessonIdx}
            sectionIdx={sectionIdx}
            lessonIdx={lessonIdx}
            lesson={lesson}
            errors={errors}
            onUpdate={onUpdateLesson}
            onRemove={onRemoveLesson}
            onClearError={onClearError}
          />
        ))}

        {/* Add lesson button */}
        <button
          onClick={() => onAddLesson(sectionIdx)}
          className="flex items-center gap-1.5 text-xs text-[#1D4ED8] hover:text-[#1D4ED8]/80 font-medium py-1.5 px-3 rounded-lg hover:bg-[#1D4ED8]/5 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          Ajouter une leçon
        </button>
      </div>
    </div>
  );
}
