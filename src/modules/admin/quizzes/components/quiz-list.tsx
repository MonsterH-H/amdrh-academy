"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Eye, Trash2, Clock, Target, Loader2, GraduationCap, Copy,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { CATEGORY_LABELS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { QuizItem } from "../types";

// ============================================
// Quiz Card Component
// ============================================
export function QuizCard({
  quiz,
  onView,
  onRefresh,
}: {
  quiz: QuizItem;
  onView: () => void;
  onRefresh: () => void;
}) {
  const [deleteLoading, setDeleteLoading] = useState(false);

  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      const res = await fetch(`/api/admin/quizzes/${quiz.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast({
          title: "Quiz supprimé",
          description: `"${quiz.title}" a été supprimé.`,
        });
        onRefresh();
      } else {
        toast({
          title: "Erreur",
          description: "Impossible de supprimer ce quiz.",
          variant: "destructive",
        });
      }
    } catch {
      toast({ title: "Erreur serveur", variant: "destructive" });
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <Card className="border-border/60 hover:shadow-md transition-all group">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-base font-semibold truncate">
              {quiz.title}
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1.5">
              <GraduationCap className="w-3 h-3" />
              {quiz.course.title}
            </p>
          </div>
          <Badge variant="secondary" className="text-[10px] flex-shrink-0">
            {CATEGORY_LABELS[quiz.course.category] || quiz.course.category}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Stats row */}
        <div className="grid grid-cols-3 gap-2">
          <div className="text-center p-2 rounded-lg bg-muted/50">
            <p className="text-lg font-bold text-foreground">{quiz.questionCount}</p>
            <p className="text-[10px] text-muted-foreground">Questions</p>
          </div>
          <div className="text-center p-2 rounded-lg bg-muted/50">
            <p className="text-lg font-bold text-foreground">{quiz.attemptCount}</p>
            <p className="text-[10px] text-muted-foreground">Tentatives</p>
          </div>
          <div className="text-center p-2 rounded-lg bg-muted/50">
            <p className={cn(
              "text-lg font-bold",
              quiz.stats.passRate >= 70 ? "text-green-600" : quiz.stats.passRate >= 40 ? "text-amber-600" : "text-red-600"
            )}>
              {quiz.attemptCount > 0 ? `${quiz.stats.passRate}%` : "—"}
            </p>
            <p className="text-[10px] text-muted-foreground">Réussite</p>
          </div>
        </div>

        {/* Settings badges */}
        <div className="flex flex-wrap gap-1.5">
          <Badge variant="outline" className="text-[10px] font-normal gap-1">
            <Clock className="w-3 h-3" /> {quiz.duration} min
          </Badge>
          <Badge variant="outline" className="text-[10px] font-normal gap-1">
            <Target className="w-3 h-3" /> {quiz.passingScore}%
          </Badge>
          <Badge variant="outline" className="text-[10px] font-normal">
            Max {quiz.maxAttempts} tent.
          </Badge>
          {quiz.shuffleQuestions && (
            <Badge variant="outline" className="text-[10px] font-normal gap-1">
              <Copy className="w-3 h-3" /> Mélange
            </Badge>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 pt-2 border-t border-border/30">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 h-9 rounded-lg text-xs"
            onClick={onView}
          >
            <Eye className="w-3.5 h-3.5 mr-1.5" />
            Gérer
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-9 w-9 rounded-lg text-red-600 hover:text-red-700 hover:bg-red-50 p-0"
                disabled={deleteLoading}
              >
                {deleteLoading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Trash2 className="w-3.5 h-3.5" />
                )}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Supprimer le quiz ?</AlertDialogTitle>
                <AlertDialogDescription>
                  Le quiz &quot;{quiz.title}&quot; et toutes ses questions et tentatives seront supprimés définitivement.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Annuler</AlertDialogCancel>
                <AlertDialogAction
                  onClick={async (e) => { e.preventDefault(); await handleDelete(); }}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Supprimer
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================
// Quiz Pagination
// ============================================
export function QuizPagination({
  page,
  totalPages,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  onPageChange: (p: number) => void;
}) {
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-center gap-2">
      <Button
        variant="outline" size="sm"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
        className="rounded-lg"
      >
        <span className="sr-only">Page précédente</span>
        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
      </Button>
      <span className="text-sm text-muted-foreground">Page {page} / {totalPages}</span>
      <Button
        variant="outline" size="sm"
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
        className="rounded-lg"
      >
        <span className="sr-only">Page suivante</span>
        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
      </Button>
    </div>
  );
}

// ============================================
// Skeleton
// ============================================
export function AdminQuizzesSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-32" />
        </div>
        <Skeleton className="h-10 w-36 rounded-lg" />
      </div>
      <div className="flex gap-3">
        <Skeleton className="h-10 flex-1 max-w-md rounded-lg" />
        <Skeleton className="h-10 w-64 rounded-lg" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="border-border/60">
            <CardHeader className="pb-3">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-3 w-1/2 mt-1" />
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-3 gap-2">
                {Array.from({ length: 3 }).map((_, j) => (
                  <Skeleton key={j} className="h-14 rounded-lg" />
                ))}
              </div>
              <Skeleton className="h-8 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
