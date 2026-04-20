"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { GraduationCap, BookOpen, Clock, Users, Plus, Pencil, Eye, Trash2 } from "lucide-react";
import { ROLE_LABELS, ROLE_COLORS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { MODE_LABELS, MODE_COLORS, formatDuration } from "../types";
import type { LearningPathItem } from "../types";

// ──────────────────────────────────────────────
// Path List Props
// ──────────────────────────────────────────────

interface PathListProps {
  paths: LearningPathItem[];
  roleFilter: string;
  onOpenDetail: (path: LearningPathItem) => void;
  onOpenEdit: (path: LearningPathItem) => void;
  onDelete: (pathId: string) => void;
  onOpenCreate: () => void;
  onRoleFilterChange: (value: string) => void;
  setLoading: (v: boolean) => void;
}

const ROLE_FILTERS = [
  { value: "ALL", label: "Tous" },
  { value: "ADMIN", label: "Admins" },
  { value: "FORMATEUR", label: "Formateurs" },
  { value: "ARBITRE", label: "Arbitres" },
  { value: "ENTRAINEUR", label: "Entraîneurs" },
  { value: "JOUEUR", label: "Joueurs" },
];

// ──────────────────────────────────────────────
// Path List Component
// ──────────────────────────────────────────────

export function PathList({
  paths,
  roleFilter,
  onOpenDetail,
  onOpenEdit,
  onDelete,
  onOpenCreate,
  onRoleFilterChange,
  setLoading,
}: PathListProps) {
  return (
    <>
      {/* Filters */}
      <div className="flex gap-1.5 flex-wrap">
        {ROLE_FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => { onRoleFilterChange(f.value); setLoading(true); }}
            className={cn(
              "px-3 py-1.5 rounded-full text-xs font-medium transition-all border",
              roleFilter === f.value
                ? "bg-primary text-white border-primary"
                : "bg-white text-muted-foreground border-border/60 hover:border-border"
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Paths list */}
      {paths.length === 0 ? (
        <div className="text-center py-20">
          <GraduationCap className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
          <h3 className="font-semibold text-foreground mb-2">Aucun parcours trouvé</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Commencez par créer votre premier parcours de formation
          </p>
          <Button className="rounded-lg" onClick={onOpenCreate}>
            <Plus className="w-4 h-4 mr-1.5" />
            Créer un parcours
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {paths.map((path) => (
            <Card key={path.id} className="border-border/60">
              <CardContent className="p-5">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  {/* Left: path info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <Badge variant="secondary" className={cn("text-[10px]", ROLE_COLORS[path.targetRole] || "")}>
                        {ROLE_LABELS[path.targetRole] || path.targetRole}
                      </Badge>
                      <Badge className={cn("text-[10px]", MODE_COLORS[path.mode] || "")}>
                        {MODE_LABELS[path.mode] || path.mode}
                      </Badge>
                      {path.isMandatory && (
                        <Badge className="text-[10px] bg-red-100 text-red-700">Obligatoire</Badge>
                      )}
                    </div>
                    <h3 className="text-base font-bold text-foreground">{path.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{path.description}</p>
                    <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground flex-wrap">
                      <span className="flex items-center gap-1"><BookOpen className="w-3.5 h-3.5" />{path.courseCount} cours</span>
                      <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{formatDuration(path.totalDuration)}</span>
                      <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" />{path.enrollmentCount} inscrits</span>
                    </div>
                  </div>

                  {/* Right: actions */}
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <Button variant="ghost" size="sm" className="h-8 rounded-lg" onClick={() => onOpenDetail(path)}><Eye className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="sm" className="h-8 rounded-lg" onClick={() => onOpenEdit(path)}><Pencil className="w-4 h-4" /></Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 rounded-lg text-red-500 hover:bg-red-50 hover:text-red-600"><Trash2 className="w-4 h-4" /></Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Supprimer le parcours ?</AlertDialogTitle>
                          <AlertDialogDescription>Le parcours &quot;{path.title}&quot; et ses {path.enrollmentCount} inscription(s) seront définitivement supprimés.</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Annuler</AlertDialogCancel>
                          <AlertDialogAction className="bg-destructive text-white hover:bg-destructive/90" onClick={(e) => { e.preventDefault(); onDelete(path.id); }}>Supprimer</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>

                {/* Course preview chips */}
                {path.courses.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {path.courses.slice(0, 5).map((pc) => (
                      <span key={pc.id} className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-muted/60 text-[11px] text-muted-foreground">
                        <span className="text-[10px] font-mono text-primary/60">{pc.order + 1}.</span>
                        {pc.course.title}
                      </span>
                    ))}
                    {path.courses.length > 5 && (
                      <span className="px-2 py-1 rounded-md bg-muted/40 text-[11px] text-muted-foreground">+{path.courses.length - 5} autres</span>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
