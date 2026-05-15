"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Plus, ArrowUp, ArrowDown } from "lucide-react";
import type { SectionInput, LessonInput } from "@/lib/validations";
import { SectionEditor } from "./section-editor";
import { cn } from "@/lib/utils";

const emptyLesson = (): LessonInput => ({ title: "", type: "TEXTE", content: "", duration: 10 });
const emptySection = (): SectionInput => ({ title: "", lessons: [] });

interface CourseEditorContentProps {
  sections: SectionInput[];
  onChange: (sections: SectionInput[]) => void;
  errors: Record<string, string>;
  clearError: (key: string) => void;
}

export { emptySection, emptyLesson };

export function CourseEditorContent({
  sections, onChange, errors, clearError,
}: CourseEditorContentProps) {
  const addSection = () => onChange([...sections, emptySection()]);
  const removeSection = (idx: number) => {
    if (sections.length <= 1) return;
    onChange(sections.filter((_, i) => i !== idx));
  };
  const moveSection = (idx: number, dir: -1 | 1) => {
    const target = idx + dir;
    if (target < 0 || target >= sections.length) return;
    const updated = [...sections];
    [updated[idx], updated[target]] = [updated[target], updated[idx]];
    onChange(updated);
  };
  const updateSectionTitle = (idx: number, value: string) => {
    const updated = [...sections];
    updated[idx] = { ...updated[idx], title: value };
    onChange(updated);
  };
  const addLesson = (sectionIdx: number) => {
    const updated = [...sections];
    updated[sectionIdx] = { ...updated[sectionIdx], lessons: [...updated[sectionIdx].lessons, emptyLesson()] };
    onChange(updated);
  };
  const removeLesson = (sectionIdx: number, lessonIdx: number) => {
    const updated = [...sections];
    updated[sectionIdx] = { ...updated[sectionIdx], lessons: updated[sectionIdx].lessons.filter((_, i) => i !== lessonIdx) };
    onChange(updated);
  };
  const updateLesson = (sectionIdx: number, lessonIdx: number, field: keyof LessonInput, value: string | number) => {
    const updated = [...sections];
    const lessons = [...updated[sectionIdx].lessons];
    lessons[lessonIdx] = { ...lessons[lessonIdx], [field]: value };
    updated[sectionIdx] = { ...updated[sectionIdx], lessons };
    onChange(updated);
  };

  const totalLessons = sections.reduce((acc, s) => acc + s.lessons.length, 0);

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <span className="font-medium">{sections.length} section{sections.length > 1 ? "s" : ""}</span>
        <span className="text-border">·</span>
        <span className="font-medium">{totalLessons} leçon{totalLessons > 1 ? "s" : ""}</span>
      </div>

      {errors["sections-empty"] && (
        <div className="p-3 rounded-lg bg-red-50 dark:bg-red-500/10 border border-red-200 text-sm text-red-700">
          {errors["sections-empty"]}
        </div>
      )}

      {sections.map((section, sectionIdx) => (
        <div key={sectionIdx} className="relative group">
          {/* Reorder buttons */}
          <div className="absolute -left-10 top-6 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => moveSection(sectionIdx, -1)}
              disabled={sectionIdx === 0}
              className="p-1 rounded bg-background border border-border/60 hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ArrowUp className="w-3 h-3" />
            </button>
            <button
              onClick={() => moveSection(sectionIdx, 1)}
              disabled={sectionIdx === sections.length - 1}
              className="p-1 rounded bg-background border border-border/60 hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ArrowDown className="w-3 h-3" />
            </button>
          </div>
          <SectionEditor
            sectionIdx={sectionIdx}
            section={section}
            totalSections={sections.length}
            errors={errors}
            onUpdateTitle={updateSectionTitle}
            onRemoveSection={removeSection}
            onAddLesson={addLesson}
            onRemoveLesson={removeLesson}
            onUpdateLesson={updateLesson}
            onClearError={clearError}
          />
        </div>
      ))}

      <button
        onClick={addSection}
        className={cn(
          "w-full py-3 rounded-lg border-2 border-dashed border-border/60",
          "text-sm font-medium text-muted-foreground hover:text-[#1D4ED8] hover:border-[#1D4ED8]/40",
          "hover:bg-[#1D4ED8]/5 transition-all duration-200 flex items-center justify-center gap-2",
        )}
      >
        <Plus className="w-4 h-4" />
        Ajouter une section
      </button>
    </div>
  );
}
