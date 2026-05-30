"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Clock, Award, BookOpen, ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatTime } from "@/utils/format";
import {
  LESSON_TYPE_LABELS, LESSON_TYPE_COLORS,
  CATEGORY_LABELS, ENROLLMENT_STATUS_LABELS, ENROLLMENT_STATUS_COLORS,
  COMPLETION_TRIGGER_LABELS,
} from "@/lib/constants";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface LessonDetail {
  id: string;
  lessonId: string;
  lessonTitle: string;
  lessonType: string;
  completed: boolean;
  timeSpent: number;
  watchPercentage: number;
  scrollPercentage: number;
  completionTrigger: string;
  completedAt: string | null;
  viewedAt: string;
}

export interface EnrollmentRow {
  id: string;
  userId: string;
  courseId: string;
  userName: string;
  userEmail: string;
  userRole: string;
  userInitials: string;
  courseTitle: string;
  courseCategory: string;
  progress: number;
  status: string;
  completedLessons: number;
  totalLessons: number;
  totalTimeSpent: number;
  quizBestScore: string | null;
  quizStatus: string | null;
  certificateId: string | null;
  certificateCode: string | null;
  certificateStatus: string | null;
  lastAccessAt: string;
  startedAt: string;
  completedAt: string | null;
  lessonDetails: LessonDetail[];
}

// ─── Enrollment Row Component ─────────────────────────────────────────────────

export function EnrollmentRowComponent({ row, expanded, detailsLoading, onToggle }: {
  row: EnrollmentRow; expanded: boolean; detailsLoading: boolean; onToggle: () => void;
}) {
  const progressColor = row.progress >= 80 ? "text-green-600" : row.progress >= 40 ? "text-amber-600" : "text-red-500";

  return (
    <>
      <tr className="border-t border-border/30 hover:bg-muted/30 transition-colors">
        <td className="py-3 px-4">
          <div className="flex items-center gap-2.5">
            <Avatar className="w-8 h-8"><AvatarFallback className="text-[10px] font-bold bg-primary/10 text-primary">{row.userInitials}</AvatarFallback></Avatar>
            <div className="min-w-0"><p className="text-sm font-medium truncate max-w-[160px]">{row.userName}</p><p className="text-[10px] text-muted-foreground truncate max-w-[160px]">{row.userEmail}</p></div>
          </div>
        </td>
        <td className="py-3 px-4 hidden sm:table-cell">
          <p className="text-sm text-foreground truncate max-w-[180px]">{row.courseTitle}</p>
          <Badge variant="secondary" className={cn("text-[9px] mt-1", CATEGORY_LABELS[row.courseCategory] ? "bg-muted/80" : "")}>{CATEGORY_LABELS[row.courseCategory] || row.courseCategory}</Badge>
        </td>
        <td className="py-3 px-4 hidden md:table-cell">
          <div className="flex items-center gap-2 min-w-[120px]"><Progress value={row.progress} className="w-16 h-1.5" /><span className={cn("text-xs font-semibold", progressColor)}>{Math.round(row.progress)}%</span></div>
        </td>
        <td className="py-3 px-4 hidden lg:table-cell"><span className="text-sm text-muted-foreground">{row.completedLessons}/{row.totalLessons || "—"}</span></td>
        <td className="py-3 px-4 hidden lg:table-cell"><div className="flex items-center gap-1 text-xs text-muted-foreground"><Clock className="w-3 h-3" />{formatTime(row.totalTimeSpent)}</div></td>
        <td className="py-3 px-4 hidden xl:table-cell">
          {row.quizBestScore ? <span className={cn("text-xs font-semibold", row.quizStatus === "REUSSI" ? "text-green-700" : "text-amber-700")}>{row.quizBestScore}</span> : <span className="text-xs text-muted-foreground">—</span>}
        </td>
        <td className="py-3 px-4 hidden xl:table-cell">
          {row.certificateCode ? <Badge variant="secondary" className="text-[9px] bg-blue-50 text-blue-700"><Award className="w-3 h-3 mr-0.5" />Obtenu</Badge> : <span className="text-xs text-muted-foreground">Non</span>}
        </td>
        <td className="py-3 px-4 hidden md:table-cell">
          <Badge variant="secondary" className={cn("text-[9px]", ENROLLMENT_STATUS_COLORS[row.status] || "")}>{ENROLLMENT_STATUS_LABELS[row.status] || row.status}</Badge>
        </td>
        <td className="py-3 px-4 hidden lg:table-cell">
          <span className="text-[11px] text-muted-foreground">{(() => { const d = Date.now() - new Date(row.lastAccessAt).getTime(); const m = Math.floor(d / 60000); const h = Math.floor(m / 60); const dd = Math.floor(h / 24); if (m < 1) return "à l'instant"; if (m < 60) return `il y a ${m}min`; if (h < 24) return `il y a ${h}h`; if (dd < 7) return `il y a ${dd}j`; return new Date(row.lastAccessAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short" }); })()}</span>
        </td>
        <td className="py-3 px-4 text-right">
          <Button variant="ghost" size="sm" className="h-8 rounded-lg text-xs gap-1" onClick={onToggle}>
            {detailsLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">Détails</span>
          </Button>
        </td>
      </tr>
      {expanded && (
        <tr className="border-t border-border/20 bg-muted/20">
          <td colSpan={10} className="px-4 py-0">
            <div className="py-4 max-h-96 overflow-y-auto">
              {row.lessonDetails.length === 0 ? (
                <div className="text-center py-8"><BookOpen className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" /><p className="text-sm text-muted-foreground">Aucune leçon consultée</p></div>
              ) : (
                <table className="w-full">
                  <thead><tr className="text-[10px] text-muted-foreground border-b border-border/30">
                    <th className="text-left py-2 px-3 font-medium">Leçon</th>
                    <th className="text-left py-2 px-3 font-medium hidden sm:table-cell">Type</th>
                    <th className="text-left py-2 px-3 font-medium hidden md:table-cell">Statut</th>
                    <th className="text-left py-2 px-3 font-medium hidden md:table-cell">Temps</th>
                    <th className="text-left py-2 px-3 font-medium hidden lg:table-cell">Vidéo %</th>
                    <th className="text-left py-2 px-3 font-medium hidden lg:table-cell">Scroll %</th>
                    <th className="text-left py-2 px-3 font-medium hidden xl:table-cell">Complétion</th>
                    <th className="text-left py-2 px-3 font-medium hidden lg:table-cell">Date</th>
                  </tr></thead>
                  <tbody>
                    {row.lessonDetails.map((lesson) => (
                      <tr key={lesson.id} className="border-b border-border/10 last:border-0">
                        <td className="py-2 px-3"><p className="text-xs font-medium text-foreground truncate max-w-[200px]">{lesson.lessonTitle}</p></td>
                        <td className="py-2 px-3 hidden sm:table-cell"><Badge variant="secondary" className={cn("text-[9px]", LESSON_TYPE_COLORS[lesson.lessonType] || "")}>{LESSON_TYPE_LABELS[lesson.lessonType] || lesson.lessonType}</Badge></td>
                        <td className="py-2 px-3 hidden md:table-cell">{lesson.completed ? <span className="text-[10px] text-green-700 font-medium">✓ Terminée</span> : <span className="text-[10px] text-amber-600 font-medium">○ En cours</span>}</td>
                        <td className="py-2 px-3 hidden md:table-cell"><span className="text-[11px] text-muted-foreground">{formatTime(lesson.timeSpent)}</span></td>
                        <td className="py-2 px-3 hidden lg:table-cell"><span className={cn("text-[11px] font-medium", lesson.lessonType === "VIDEO" && lesson.watchPercentage >= 90 ? "text-green-700" : "text-muted-foreground")}>{lesson.lessonType === "VIDEO" ? `${Math.round(lesson.watchPercentage)}%` : "—"}</span></td>
                        <td className="py-2 px-3 hidden lg:table-cell"><span className={cn("text-[11px] font-medium", (lesson.lessonType === "TEXTE" || lesson.lessonType === "PDF") && lesson.scrollPercentage >= 90 ? "text-green-700" : "text-muted-foreground")}>{(lesson.lessonType === "TEXTE" || lesson.lessonType === "PDF") ? `${Math.round(lesson.scrollPercentage)}%` : "—"}</span></td>
                        <td className="py-2 px-3 hidden xl:table-cell"><Badge variant="secondary" className="text-[9px] bg-muted/60">{COMPLETION_TRIGGER_LABELS[lesson.completionTrigger] || lesson.completionTrigger}</Badge></td>
                        <td className="py-2 px-3 hidden lg:table-cell"><span className="text-[10px] text-muted-foreground">{lesson.completedAt ? new Date(lesson.completedAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short" }) : "—"}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </td>
        </tr>
      )}
    </>
  );
}
