"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  GraduationCap, Clock, CheckCircle2, Lock, ArrowRight,
  Loader2, PlayCircle, UserCheck, ListOrdered, Calendar, Zap,
} from "lucide-react";
import {
  CATEGORY_LABELS, DIFFICULTY_LABELS, ROLE_LABELS,
  LEARNING_PATH_MODE_LABELS, LEARNING_PATH_MODE_COLORS,
} from "@/lib/constants";
import { cn } from "@/lib/utils";
import { PathDetail } from "./path-detail";

import type { AppView } from "@/store/app";

export interface PathCourse {
  id: string;
  order: number;
  course: {
    id: string;
    title: string;
    category: string;
    difficulty: string;
    duration: number;
    coverImage: string | null;
    instructor: { nom: string; prenom: string } | null;
  };
}

export interface PathEnrollment {
  id: string;
  progress: number;
  status: string;
  currentCourseOrder: number;
  startedAt: string;
  completedAt: string | null;
}

export interface LearningPathData {
  id: string;
  title: string;
  description: string;
  targetRole: string;
  isMandatory: boolean;
  mode: string;
  totalDuration: number;
  courseCount: number;
  courses: PathCourse[];
  enrollments: PathEnrollment[];
}

const ENROLLMENT_STATUS_LABELS: Record<string, string> = {
  non_inscrit: "Non inscrit", en_cours: "En cours", termine: "Terminé",
};

const ENROLLMENT_STATUS_COLORS: Record<string, string> = {
  non_inscrit: "bg-gray-100 text-gray-600",
  en_cours: "bg-blue-100 text-blue-700",
  termine: "bg-green-100 text-green-700",
};

function formatTotalDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60), m = minutes % 60;
  return m > 0 ? `${h}h ${m}min` : `${h}h`;
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });
}

function getRoleGradient(role: string): string {
  const m: Record<string, string> = {
    ARBITRE: "from-blue-500 to-blue-600", ENTRAINEUR: "from-emerald-500 to-emerald-600",
    JOUEUR: "from-amber-500 to-amber-600", FORMATEUR: "from-purple-500 to-purple-600",
  };
  return m[role] || "from-gray-500 to-gray-600";
}

interface PathCardProps {
  path: LearningPathData;
  enrollingPathId: string | null;
  onEnroll: (pathId: string) => void;
  onContinue: (path: LearningPathData) => void;
  onNavigate: (view: AppView, params?: Record<string, string>) => void;
}

export function PathCard({ path, enrollingPathId, onEnroll, onContinue, onNavigate }: PathCardProps) {
  const enrollment = path.enrollments?.[0];
  const progress = enrollment ? enrollment.progress : 0;
  const enrollmentStatus = enrollment ? enrollment.status : "non_inscrit";
  const isEnrolling = enrollingPathId === path.id;
  const roleGradient = getRoleGradient(path.targetRole);

  const statusIcon = enrollmentStatus === "non_inscrit" ? <UserCheck className="w-3 h-3 mr-1" />
    : enrollmentStatus === "en_cours" ? <PlayCircle className="w-3 h-3 mr-1" />
    : <CheckCircle2 className="w-3 h-3 mr-1" />;

  return (
    <Card className={cn("border-border/60 overflow-hidden", enrollment && enrollmentStatus === "termine" && "border-green-200")}>
      <CardContent className="p-6">
        {/* Top gradient bar */}
        {enrollment && enrollmentStatus === "en_cours" && (
          <div className={cn("-mx-6 -mt-6 mb-4 h-1.5 bg-gradient-to-r", roleGradient)} />
        )}
        {enrollment && enrollmentStatus === "termine" && (
          <div className="-mx-6 -mt-6 mb-4 h-1.5 bg-gradient-to-r from-green-400 to-green-600" />
        )}

        {/* Header row */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <Badge variant="secondary" className="text-[10px] gap-1">
                <GraduationCap className="w-3 h-3" />{ROLE_LABELS[path.targetRole || "ARBITRE"]}
              </Badge>
              {path.isMandatory && (
                <Badge className="bg-red-100 text-red-700 text-[10px] gap-1"><Zap className="w-3 h-3" />Obligatoire</Badge>
              )}
              <Badge variant="secondary" className={cn("text-[10px]", LEARNING_PATH_MODE_COLORS[path.mode] || "")}>
                {LEARNING_PATH_MODE_LABELS[path.mode] || path.mode}
              </Badge>
              <Badge className={cn("text-[10px]", ENROLLMENT_STATUS_COLORS[enrollmentStatus])}>
                {statusIcon}{ENROLLMENT_STATUS_LABELS[enrollmentStatus]}
              </Badge>
            </div>
            <h3 className="text-lg font-bold text-foreground">{path.title}</h3>
            <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{path.description}</p>
          </div>

          {/* Right side: progress or action */}
          <div className="flex flex-col items-end gap-2 flex-shrink-0">
            {enrollment && (
              <div className="text-right">
                <p className="text-2xl font-bold text-primary">{Math.round(progress)}%</p>
                <p className="text-[10px] text-muted-foreground">Progression</p>
              </div>
            )}
            {!enrollment && (
              <Button size="sm" disabled={isEnrolling} onClick={() => onEnroll(path.id)} className="gap-2 rounded-lg">
                {isEnrolling ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserCheck className="w-4 h-4" />}
                {isEnrolling ? "Inscription..." : "S'inscrire"}
              </Button>
            )}
            {enrollment && enrollmentStatus === "en_cours" && (
              <Button size="sm" variant="outline" className="gap-2 rounded-lg" onClick={() => onContinue(path)}>
                <PlayCircle className="w-4 h-4" /> Continuer
              </Button>
            )}
            {enrollment && enrollmentStatus === "termine" && (
              <Badge className="bg-green-100 text-green-700 gap-1 px-3 py-1"><CheckCircle2 className="w-3.5 h-3.5" /> Parcours terminé</Badge>
            )}
          </div>
        </div>

        {/* Meta info */}
        <div className="flex items-center gap-4 mb-4 text-xs text-muted-foreground flex-wrap">
          <span className="flex items-center gap-1"><ListOrdered className="w-3.5 h-3.5" />{path.courseCount} cours</span>
          <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{formatTotalDuration(path.totalDuration)}</span>
          {enrollment?.startedAt && (
            <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />Commencé le {formatDate(enrollment.startedAt)}</span>
          )}
        </div>

        {/* Progress bar */}
        {enrollment && <Progress value={progress} className="h-2 mb-6" />}

        {/* Course Timeline */}
        <Separator className="mb-4" />
        <PathDetail courses={path.courses} enrollment={enrollment} enrollmentStatus={enrollmentStatus} onNavigate={onNavigate} />
      </CardContent>
    </Card>
  );
}
