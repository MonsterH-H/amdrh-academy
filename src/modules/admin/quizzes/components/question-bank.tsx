"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Pencil, Trash2, ChevronUp, ChevronDown, FileQuestion, Plus, Loader2,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { QUESTION_TYPE_LABELS, QUESTION_TYPE_COLORS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { QuestionItem } from "../types";

// ============================================
// Question Row Component
// ============================================
function QuestionRow({
  question, index, total, quizId, onEdit, onReorder, onDelete,
}: {
  question: QuestionItem;
  index: number;
  total: number;
  quizId: string;
  onEdit: () => void;
  onReorder: () => void;
  onDelete: () => void;
}) {
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [reorderLoading, setReorderLoading] = useState(false);

  let options: string[] = [];
  let correctAnswer: number[] = [];
  try { options = JSON.parse(question.options); } catch { /* empty */ }
  try { correctAnswer = JSON.parse(question.correctAnswer); } catch { /* empty */ }

  const handleMove = async (newOrder: number) => {
    setReorderLoading(true);
    try {
      await fetch(`/api/admin/quizzes/${quizId}/questions`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionId: question.id, order: newOrder }),
      });
      onReorder();
    } catch { toast({ title: "Erreur", variant: "destructive" }); }
    finally { setReorderLoading(false); }
  };

  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      const res = await fetch(
        `/api/admin/quizzes/${quizId}/questions?questionId=${question.id}`,
        { method: "DELETE" }
      );
      if (res.ok) { toast({ title: "Question supprimée" }); onDelete(); }
    } catch { toast({ title: "Erreur", variant: "destructive" }); }
    finally { setDeleteLoading(false); }
  };

  return (
    <div className="flex items-start gap-3 p-3 rounded-lg border border-border/40 hover:border-border/80 transition-colors group">
      {/* Reorder controls */}
      <div className="flex flex-col items-center gap-0.5 pt-1">
        <button onClick={() => handleMove(question.order - 1)}
          disabled={index === 0 || reorderLoading}
          className="p-0.5 rounded hover:bg-muted disabled:opacity-30 transition-colors"
        >
          <ChevronUp className="w-3.5 h-3.5 text-muted-foreground" />
        </button>
        <span className="text-[10px] font-bold text-muted-foreground">{question.order + 1}</span>
        <button onClick={() => handleMove(question.order + 1)}
          disabled={index === total - 1 || reorderLoading}
          className="p-0.5 rounded hover:bg-muted disabled:opacity-30 transition-colors"
        >
          <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
        </button>
      </div>

      {/* Question content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start gap-2">
          <p className="text-sm font-medium text-foreground flex-1">{question.text}</p>
          <div className="flex items-center gap-1 flex-shrink-0">
            <Badge variant="secondary" className={cn("text-[9px]", QUESTION_TYPE_COLORS[question.type] || "")}>
              {QUESTION_TYPE_LABELS[question.type] || question.type}
            </Badge>
            <Badge variant="outline" className="text-[9px]">
              {question.points} pt{question.points > 1 ? "s" : ""}
            </Badge>
          </div>
        </div>

        {/* Options preview (non VRAI_FAUX) */}
        {options.length > 0 && question.type !== "VRAI_FAUX" && (
          <div className="mt-2 flex flex-wrap gap-1">
            {options.map((opt, i) => (
              <span key={i} className={cn(
                "inline-flex items-center px-2 py-0.5 rounded text-[10px]",
                correctAnswer.includes(i)
                  ? "bg-green-100 text-green-700 font-medium"
                  : "bg-muted text-muted-foreground"
              )}>
                {correctAnswer.includes(i) ? "✓" : ""} {opt}
              </span>
            ))}
          </div>
        )}

        {/* VRAI_FAUX options */}
        {question.type === "VRAI_FAUX" && options.length >= 2 && (
          <div className="mt-2 flex gap-1">
            {[0, 1].map((i) => (
              <span key={i} className={cn(
                "inline-flex items-center px-2 py-0.5 rounded text-[10px]",
                correctAnswer.includes(i)
                  ? "bg-green-100 text-green-700 font-medium"
                  : "bg-muted text-muted-foreground"
              )}>
                {correctAnswer.includes(i) ? "✓" : ""} {options[i]}
              </span>
            ))}
          </div>
        )}

        {question.explanation && (
          <p className="text-[11px] text-muted-foreground mt-1.5 italic">💡 {question.explanation}</p>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 pt-1">
        <Button variant="ghost" size="sm" className="h-8 w-8 rounded-lg p-0" onClick={onEdit}>
          <Pencil className="w-3.5 h-3.5" />
        </Button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="ghost" size="sm"
              className="h-8 w-8 rounded-lg p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
              disabled={deleteLoading}
            >
              {deleteLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Supprimer cette question ?</AlertDialogTitle>
              <AlertDialogDescription>
                Cette action est irréversible. Les réponses associées seront supprimées.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Annuler</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
                Supprimer
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}

// ============================================
// Question Bank View
// ============================================
export function QuestionBankView({
  questions, quizId, onEdit, onReorder, onAddClick,
}: {
  questions: QuestionItem[];
  quizId: string;
  onEdit: (questionId: string) => void;
  onReorder: () => void;
  onAddClick: () => void;
}) {
  return (
    <Card className="border-border/60">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <FileQuestion className="w-4 h-4 text-primary" />
          Questions
          <Badge variant="secondary" className="text-[10px] ml-auto">{questions.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {questions.length === 0 ? (
          <div className="text-center py-12">
            <FileQuestion className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground mb-3">Aucune question ajoutée</p>
            <Button onClick={onAddClick} variant="outline" size="sm" className="rounded-lg">
              <Plus className="w-4 h-4 mr-1.5" /> Ajouter une question
            </Button>
          </div>
        ) : (
          <div className="space-y-2 max-h-[600px] overflow-y-auto">
            {questions.map((q, index) => (
              <QuestionRow
                key={q.id}
                question={q}
                index={index}
                total={questions.length}
                quizId={quizId}
                onEdit={() => onEdit(q.id)}
                onReorder={onReorder}
                onDelete={onReorder}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
