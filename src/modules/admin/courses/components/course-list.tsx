"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Eye, Edit3, Trash2, Archive, Send, CheckCircle2,
  Globe, FileText, Layers, Clock, Users, Award, MoreHorizontal,
} from "lucide-react";
import {
  CATEGORY_LABELS, DIFFICULTY_LABELS, DIFFICULTY_COLORS, COURSE_STATUS_LABELS,
} from "@/lib/constants";
import { cn } from "@/lib/utils";

// ─── Types (shared) ────────────────────────────

export interface CourseItem {
  id: string;
  title: string;
  slug: string;
  description: string;
  coverImage: string | null;
  category: string;
  difficulty: string;
  status: string;
  duration: number;
  isCertifying: boolean;
  passingScore: number;
  maxAttempts: number;
  createdAt: string;
  updatedAt: string;
  instructorId: string | null;
  instructor: { id: string; nom: string; prenom: string; avatar: string | null } | null;
  _count: { enrollments: number; sections: number };
}

export interface CourseDetail extends CourseItem {
  sections: Array<{
    id: string;
    title: string;
    order: number;
    lessons: Array<{
      id: string;
      title: string;
      type: string;
      duration: number;
      order: number;
    }>;
  }>;
  quiz: {
    id: string;
    title: string;
    duration: number;
    passingScore: number;
    maxAttempts: number;
    _count: { questions: number; attempts: number };
  } | null;
}

// ─── Constants ─────────────────────────────────

export const STATUS_COLORS: Record<string, string> = {
  BROUILLON: "bg-gray-100 text-gray-700",
  EN_REVISION: "bg-amber-100 text-amber-700",
  VALIDE: "bg-blue-100 text-blue-700",
  PUBLIE: "bg-green-100 text-green-700",
  ARCHIVE: "bg-red-100 text-red-600",
};

export const STATUS_DOT_COLORS: Record<string, string> = {
  BROUILLON: "bg-gray-400",
  EN_REVISION: "bg-amber-400",
  VALIDE: "bg-blue-400",
  PUBLIE: "bg-green-500",
  ARCHIVE: "bg-red-400",
};

export const STATUS_FILTERS = [
  { value: "ALL", label: "Tous" },
  { value: "BROUILLON", label: "Brouillons" },
  { value: "EN_REVISION", label: "En révision" },
  { value: "VALIDE", label: "Validés" },
  { value: "PUBLIE", label: "Publiés" },
  { value: "ARCHIVE", label: "Archivés" },
];

export const LESSON_TYPE_ICONS: Record<string, string> = {
  VIDEO: "🎬",
  PDF: "📄",
  TEXTE: "📝",
  INTERACTIF: "🎯",
};

// ─── Mini Stat ─────────────────────────────────

export function MiniStat({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number | string;
}) {
  return (
    <div className="flex items-center gap-2">
      <Icon className="w-4 h-4 text-muted-foreground" />
      <div>
        <p className="text-sm font-semibold leading-none">{value}</p>
        <p className="text-[10px] text-muted-foreground mt-0.5">{label}</p>
      </div>
    </div>
  );
}

// ─── Course Row ────────────────────────────────

export function CourseRow({
  course,
  onView,
  onEdit,
  onDelete,
  onStatusChange,
}: {
  course: CourseItem;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onStatusChange: (status: string) => void;
}) {
  return (
    <Card className="border-border/60 hover:border-border/90 transition-colors">
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          {/* Category icon */}
          <div className={cn(
            "w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 text-lg",
            course.category === "ARBITRAGE" && "bg-blue-50",
            course.category === "ENTRAINEMENT" && "bg-emerald-50",
            course.category === "JOUEURS" && "bg-amber-50",
            course.category === "ADMINISTRATION" && "bg-violet-50",
          )}>
            {course.category === "ARBITRAGE" && "🟦"}
            {course.category === "ENTRAINEMENT" && "🟩"}
            {course.category === "JOUEURS" && "🟨"}
            {course.category === "ADMINISTRATION" && "🟪"}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <button onClick={onView} className="text-sm font-semibold text-foreground hover:text-primary transition-colors text-left truncate block w-full">
                  {course.title}
                </button>
                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{course.description}</p>
              </div>

              {/* Actions dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-lg flex-shrink-0">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={onView} className="cursor-pointer"><Eye className="w-4 h-4 mr-2" /> Voir les détails</DropdownMenuItem>
                  <DropdownMenuItem onClick={onEdit} className="cursor-pointer"><Edit3 className="w-4 h-4 mr-2" /> Modifier</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel>Changer le statut</DropdownMenuLabel>
                  {course.status !== "PUBLIE" && <DropdownMenuItem onClick={() => onStatusChange("PUBLIE")} className="cursor-pointer"><Globe className="w-4 h-4 mr-2 text-green-600" /> Publier</DropdownMenuItem>}
                  {course.status !== "EN_REVISION" && course.status !== "PUBLIE" && <DropdownMenuItem onClick={() => onStatusChange("EN_REVISION")} className="cursor-pointer"><Send className="w-4 h-4 mr-2 text-amber-600" /> Envoyer en révision</DropdownMenuItem>}
                  {course.status !== "VALIDE" && course.status !== "PUBLIE" && <DropdownMenuItem onClick={() => onStatusChange("VALIDE")} className="cursor-pointer"><CheckCircle2 className="w-4 h-4 mr-2 text-blue-600" /> Valider</DropdownMenuItem>}
                  {course.status !== "ARCHIVE" && <DropdownMenuItem onClick={() => onStatusChange("ARCHIVE")} className="cursor-pointer"><Archive className="w-4 h-4 mr-2 text-red-600" /> Archiver</DropdownMenuItem>}
                  {course.status !== "BROUILLON" && <DropdownMenuItem onClick={() => onStatusChange("BROUILLON")} className="cursor-pointer"><FileText className="w-4 h-4 mr-2 text-gray-600" /> Repasser en brouillon</DropdownMenuItem>}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={onDelete} className="cursor-pointer text-red-600 focus:text-red-600"><Trash2 className="w-4 h-4 mr-2" /> Supprimer</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Meta row */}
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <Badge variant="secondary" className={cn("text-[10px]", STATUS_COLORS[course.status])}>
                <span className={cn("w-1.5 h-1.5 rounded-full mr-1", STATUS_DOT_COLORS[course.status])} />
                {COURSE_STATUS_LABELS[course.status]}
              </Badge>
              <Badge variant="secondary" className="text-[10px]">{CATEGORY_LABELS[course.category]}</Badge>
              <Badge variant="secondary" className={cn("text-[10px]", DIFFICULTY_COLORS[course.difficulty])}>{DIFFICULTY_LABELS[course.difficulty]}</Badge>
              {course.isCertifying && <Badge variant="secondary" className="text-[10px] bg-amber-50 text-amber-700 border-amber-200"><Award className="w-3 h-3 mr-1" /> Certifiant</Badge>}
              <span className="text-[10px] text-muted-foreground ml-auto flex items-center gap-1"><Users className="w-3 h-3" />{course._count?.enrollments || 0}</span>
              <span className="text-[10px] text-muted-foreground flex items-center gap-1"><Layers className="w-3 h-3" />{course._count?.sections || 0} sections</span>
              {course.duration > 0 && <span className="text-[10px] text-muted-foreground flex items-center gap-1"><Clock className="w-3 h-3" />{course.duration} min</span>}
            </div>

            {/* Instructor */}
            {course.instructor && (
              <p className="text-[10px] text-muted-foreground mt-1">
                Par {course.instructor.prenom} {course.instructor.nom}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
