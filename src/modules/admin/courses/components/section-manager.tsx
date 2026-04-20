"use client";

import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Layers, Clock, Award, CheckCircle2, Users, BarChart3 } from "lucide-react";
import {
  CATEGORY_LABELS, DIFFICULTY_LABELS, DIFFICULTY_COLORS, COURSE_STATUS_LABELS,
} from "@/lib/constants";
import { cn } from "@/lib/utils";
import { MiniStat, STATUS_COLORS, STATUS_DOT_COLORS, LESSON_TYPE_ICONS } from "./course-list";
import type { CourseDetail } from "./course-list";

interface SectionManagerProps {
  course: CourseDetail;
}

export function SectionManager({ course }: SectionManagerProps) {
  return (
    <>
      {/* Sections & Lessons */}
      <div>
        <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
          <Layers className="w-4 h-4 text-primary" />
          Contenu du cours
        </h4>
        {course.sections.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">
            Aucune section définie
          </p>
        ) : (
          <div className="space-y-3">
            {course.sections.map((section, idx) => (
              <div key={section.id} className="border border-border/60 rounded-lg overflow-hidden">
                <div className="px-4 py-2.5 bg-muted/40 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-[10px] font-bold flex items-center justify-center">
                    {idx + 1}
                  </span>
                  <span className="text-sm font-medium text-foreground">{section.title}</span>
                  <span className="text-[10px] text-muted-foreground ml-auto">
                    {section.lessons.length} leçon{section.lessons.length > 1 ? "s" : ""}
                  </span>
                </div>
                {section.lessons.length > 0 && (
                  <div className="divide-y divide-border/30">
                    {section.lessons.map((lesson) => (
                      <div key={lesson.id} className="px-4 py-2 flex items-center gap-3 hover:bg-muted/30 transition-colors">
                        <span className="text-sm">{LESSON_TYPE_ICONS[lesson.type] || "📝"}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-foreground truncate">{lesson.title}</p>
                          <p className="text-[10px] text-muted-foreground">{lesson.type}</p>
                        </div>
                        {lesson.duration > 0 && (
                          <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {lesson.duration} min
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

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
    </>
  );
}

// ─── Course Detail Content ─────────────────────

export function CourseDetailContent({ course }: { course: CourseDetail }) {
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
      <SectionManager course={course} />
    </div>
  );
}
