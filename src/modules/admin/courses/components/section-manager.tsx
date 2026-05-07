"use client";

import { useState } from "react";
import { useAppStore } from "@/store/app";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Loader2 } from "lucide-react";
import {
  Layers, Clock, Award, CheckCircle2, Users, BarChart3,
  Plus, Pencil, Trash2, ChevronUp, ChevronDown,
} from "lucide-react";
import {
  CATEGORY_LABELS, DIFFICULTY_LABELS, DIFFICULTY_COLORS, COURSE_STATUS_LABELS,
} from "@/lib/constants";
import { cn } from "@/lib/utils";
import { MiniStat, STATUS_COLORS, STATUS_DOT_COLORS, LESSON_TYPE_ICONS } from "./course-list";
import type { CourseDetail } from "./course-list";
import {
  SectionDialog, LessonDialog, DeleteConfirmDialog,
  reorderLessons,
} from "./section-crud-dialogs";
import type { SectionItem, LessonItem } from "./section-crud-dialogs";
import { toast } from "@/hooks/use-toast";

// ─── Helpers ────────────────────────────────────

function authQuery() {
  const { user } = useAppStore.getState();
  return `userId=${user?.id}&role=${user?.role}`;
}

// ─── Section Manager (CRUD) ─────────────────────

interface SectionManagerProps {
  course: CourseDetail;
  onRefresh: () => void;
}

export function SectionManager({ course, onRefresh }: SectionManagerProps) {
  const [sectionDialog, setSectionDialog] = useState<{ open: boolean; edit: SectionItem | null }>({ open: false, edit: null });
  const [lessonDialog, setLessonDialog] = useState<{ open: boolean; sectionId: string; edit: LessonItem | null }>({ open: false, sectionId: "", edit: null });
  const [deleteTarget, setDeleteTarget] = useState<{ type: "section" | "lesson"; id: string; title: string; sectionId?: string } | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [reorderLoading, setReorderLoading] = useState<string | null>(null);

  // ── Section CRUD ──

  const handleDelete = async () => {
    if (!deleteTarget || !course) return;
    setDeleteLoading(true);
    try {
      const url = deleteTarget.type === "section"
        ? `/api/courses/${course.id}/sections?${authQuery()}&sectionId=${deleteTarget.id}`
        : `/api/sections/${deleteTarget.sectionId}/lessons?${authQuery()}&lessonId=${deleteTarget.id}`;
      const res = await fetch(url, { method: "DELETE" });
      if (res.ok) {
        toast({ title: "Supprimé", description: `"${deleteTarget.title}" a été supprimé.` });
        setDeleteTarget(null);
        onRefresh();
      } else {
        const data = await res.json();
        toast({ title: "Erreur", description: data.error || "Échec de la suppression", variant: "destructive" });
      }
    } catch { toast({ title: "Erreur serveur", variant: "destructive" }); }
    finally { setDeleteLoading(false); }
  };

  // ── Lesson Reorder ──

  const handleMoveLesson = async (section: SectionItem, lesson: LessonItem, direction: "up" | "down") => {
    const idx = section.lessons.findIndex((l) => l.id === lesson.id);
    const newIdx = direction === "up" ? idx - 1 : idx + 1;
    if (newIdx < 0 || newIdx >= section.lessons.length) return;

    const newOrder = [...section.lessons];
    [newOrder[idx], newOrder[newIdx]] = [newOrder[newIdx], newOrder[idx]];
    const lessonIds = newOrder.map((l) => l.id);

    setReorderLoading(lesson.id);
    const ok = await reorderLessons(section.id, lessonIds);
    setReorderLoading(null);
    if (ok) { onRefresh(); }
    else { toast({ title: "Erreur", description: "Impossible de réordonner", variant: "destructive" }); }
  };

  return (
    <>
      {/* Sections & Lessons */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Layers className="w-4 h-4 text-primary" />
            Contenu du cours
          </h4>
          <Button size="sm" className="rounded-lg h-7 text-xs gap-1" onClick={() => setSectionDialog({ open: true, edit: null })}>
            <Plus className="w-3.5 h-3.5" /> Section
          </Button>
        </div>
        {course.sections.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">Aucune section définie</p>
        ) : (
          <div className="space-y-3">
            {course.sections.map((section, idx) => (
              <div key={section.id} className="border border-border/60 rounded-lg overflow-hidden">
                {/* Section header */}
                <div className="px-4 py-2.5 bg-muted/40 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-[10px] font-bold flex items-center justify-center flex-shrink-0">
                    {idx + 1}
                  </span>
                  <span className="text-sm font-medium text-foreground flex-1 truncate">{section.title}</span>
                  <span className="text-[10px] text-muted-foreground mr-1">
                    {section.lessons.length} leçon{section.lessons.length > 1 ? "s" : ""}
                  </span>
                  <button onClick={() => setSectionDialog({ open: true, edit: section })} className="p-1 rounded hover:bg-muted/60 transition-colors">
                    <Pencil className="w-3.5 h-3.5 text-muted-foreground" />
                  </button>
                  <button onClick={() => setDeleteTarget({ type: "section", id: section.id, title: section.title })} className="p-1 rounded hover:bg-red-50 transition-colors">
                    <Trash2 className="w-3.5 h-3.5 text-red-500" />
                  </button>
                </div>

                {/* Lessons */}
                {section.lessons.length > 0 && (
                  <div className="divide-y divide-border/30">
                    {section.lessons.map((lesson, lIdx) => (
                      <div key={lesson.id} className="px-4 py-2 flex items-center gap-2 hover:bg-muted/30 transition-colors group">
                        {/* Reorder arrows */}
                        <div className="flex flex-col gap-0.5 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleMoveLesson(section, lesson, "up")}
                            disabled={lIdx === 0 || !!reorderLoading}
                            className="p-0.5 rounded hover:bg-muted/60 disabled:opacity-30"
                          >
                            <ChevronUp className="w-3 h-3 text-muted-foreground" />
                          </button>
                          <button
                            onClick={() => handleMoveLesson(section, lesson, "down")}
                            disabled={lIdx === section.lessons.length - 1 || !!reorderLoading}
                            className="p-0.5 rounded hover:bg-muted/60 disabled:opacity-30"
                          >
                            <ChevronDown className="w-3 h-3 text-muted-foreground" />
                          </button>
                        </div>
                        {reorderLoading === lesson.id && <Loader2 className="w-3.5 h-3.5 animate-spin text-primary flex-shrink-0" />}

                        <span className="text-sm flex-shrink-0">{LESSON_TYPE_ICONS[lesson.type] || "📝"}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-foreground truncate">{lesson.title}</p>
                          <p className="text-[10px] text-muted-foreground">{lesson.type}</p>
                        </div>
                        {lesson.duration > 0 && (
                          <span className="text-[10px] text-muted-foreground flex items-center gap-1 flex-shrink-0">
                            <Clock className="w-3 h-3" />{lesson.duration} min
                          </span>
                        )}
                        <div className="flex gap-0.5 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => setLessonDialog({ open: true, sectionId: section.id, edit: lesson })} className="p-1 rounded hover:bg-muted/60">
                            <Pencil className="w-3 h-3 text-muted-foreground" />
                          </button>
                          <button onClick={() => setDeleteTarget({ type: "lesson", id: lesson.id, title: lesson.title, sectionId: section.id })} className="p-1 rounded hover:bg-red-50">
                            <Trash2 className="w-3 h-3 text-red-500" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add lesson button */}
                <button
                  onClick={() => setLessonDialog({ open: true, sectionId: section.id, edit: null })}
                  className="w-full px-4 py-2 text-xs text-muted-foreground hover:text-primary hover:bg-muted/30 transition-colors flex items-center gap-1.5 border-t border-border/30"
                >
                  <Plus className="w-3.5 h-3.5" /> Ajouter une leçon
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Dialogs */}
      <SectionDialog
        open={sectionDialog.open}
        onOpenChange={(v) => setSectionDialog((s) => ({ ...s, open: v }))}
        courseId={course.id}
        editSection={sectionDialog.edit}
        onSuccess={onRefresh}
      />
      <LessonDialog
        open={lessonDialog.open}
        onOpenChange={(v) => setLessonDialog((s) => ({ ...s, open: v }))}
        sectionId={lessonDialog.sectionId}
        editLesson={lessonDialog.edit}
        onSuccess={onRefresh}
      />
      <DeleteConfirmDialog
        open={!!deleteTarget}
        onOpenChange={() => setDeleteTarget(null)}
        title={deleteTarget?.type === "section" ? "Supprimer la section" : "Supprimer la leçon"}
        description={
          deleteTarget?.type === "section"
            ? `La section "${deleteTarget?.title}" et toutes ses leçons seront supprimées. Cette action est irréversible.`
            : `La leçon "${deleteTarget?.title}" sera supprimée. Cette action est irréversible.`
        }
        loading={deleteLoading}
        onConfirm={handleDelete}
      />
    </>
  );
}

// ─── Course Detail Content ──────────────────────

export function CourseDetailContent({
  course,
  onRefresh,
}: {
  course: CourseDetail;
  onRefresh: () => void;
}) {
  return (
    <div className="space-y-4">
      {/* Title + status */}
      <div>
        <h3 className="text-lg font-bold text-foreground">{course.title}</h3>
        <div className="flex items-center gap-2 mt-2 flex-wrap">
          <Badge variant="secondary" className={cn("text-[10px]", STATUS_COLORS[course.status])}>
            <span className={cn("w-1.5 h-1.5 rounded-full mr-1.5", STATUS_DOT_COLORS[course.status])} />
            {COURSE_STATUS_LABELS[course.status]}
          </Badge>
          <Badge variant="secondary" className="text-[10px] bg-muted">{CATEGORY_LABELS[course.category]}</Badge>
          <Badge variant="secondary" className={cn("text-[10px]", DIFFICULTY_COLORS[course.difficulty])}>{DIFFICULTY_LABELS[course.difficulty]}</Badge>
        </div>
      </div>

      {/* Meta info */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <MiniStat icon={Users} label="Inscrits" value={course._count?.enrollments || 0} />
        <MiniStat icon={Layers} label="Sections" value={course.sections?.length || 0} />
        <MiniStat icon={CheckCircle2} label="Leçons" value={course.sections?.reduce((a, s) => a + s.lessons.length, 0) || 0} />
        <MiniStat icon={Clock} label="Durée" value={`${course.duration || 0} min`} />
      </div>

      {/* Description */}
      <div>
        <p className="text-xs font-medium text-muted-foreground mb-1">Description</p>
        <p className="text-sm text-foreground leading-relaxed">{course.description}</p>
      </div>

      {/* Instructor */}
      {course.instructor && (
        <div className="flex items-center gap-2">
          <Award className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            Formateur : <span className="text-foreground font-medium">{course.instructor.prenom} {course.instructor.nom}</span>
          </span>
        </div>
      )}

      {/* Certifying info */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 rounded-lg bg-muted/50">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Certifiant</p>
          <p className={cn("text-sm font-medium mt-0.5", course.isCertifying ? "text-green-700" : "text-muted-foreground")}>
            {course.isCertifying ? "Oui" : "Non"}
          </p>
        </div>
        {course.isCertifying && (
          <>
            <div className="p-3 rounded-lg bg-muted/50">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Score min.</p>
              <p className="text-sm font-medium mt-0.5">{course.passingScore}%</p>
            </div>
            <div className="p-3 rounded-lg bg-muted/50">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Tentatives max.</p>
              <p className="text-sm font-medium mt-0.5">{course.maxAttempts}</p>
            </div>
          </>
        )}
      </div>

      <Separator />

      {/* Sections & Quiz */}
      <SectionManager course={course} onRefresh={onRefresh} />

      {/* Quiz info */}
      {course.quiz && (
        <>
          <Separator />
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-500" />
              Quiz d&apos;évaluation
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <MiniStat icon={BarChart3} label="Questions" value={course.quiz._count.questions} />
              <MiniStat icon={Users} label="Tentatives" value={course.quiz._count.attempts} />
              <MiniStat icon={CheckCircle2} label="Score min." value={`${course.quiz.passingScore}%`} />
              <MiniStat icon={Clock} label="Durée" value={`${course.quiz.duration} min`} />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
