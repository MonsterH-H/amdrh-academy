"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Eye } from "lucide-react";
import { cn } from "@/lib/utils";
import { QUESTION_TYPE_LABELS, QUESTION_TYPE_COLORS } from "@/lib/constants";
import type { QuizBuilderQuestion } from "./quiz-builder-editor";

export interface QuizBuilderData {
  title: string;
  description: string;
  courseId: string;
  duration: number;
  passingScore: number;
  shuffleQuestions: boolean;
  showAnswers: boolean;
  maxAttempts: number;
  questions: QuizBuilderQuestion[];
}

// ─── Quiz Preview ─────────────────────────────────────────────────

export function QuizPreview({ quiz }: { quiz: QuizBuilderData }) {
  const validQuestions = quiz.questions.filter((q) => q.text.trim());

  return (
    <Card className="border-border/60 sticky top-24">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Eye className="w-4 h-4 text-primary" /> Aperçu de l&apos;étudiant
        </CardTitle>
      </CardHeader>
      <CardContent className="max-h-[70vh] overflow-y-auto">
        <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 mb-4">
          <h3 className="font-bold text-foreground">{quiz.title || "Quiz sans titre"}</h3>
          {quiz.description && <p className="text-xs text-muted-foreground mt-1">{quiz.description}</p>}
          <div className="flex gap-3 mt-2 text-[10px] text-muted-foreground">
            <span>{validQuestions.length} questions</span>
            <span>{quiz.duration} min</span>
            <span>Score min: {quiz.passingScore}%</span>
          </div>
        </div>

        {validQuestions.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">Aucune question à afficher</p>
        ) : (
          <div className="space-y-4">
            {validQuestions.map((qn, idx) => (
              <div key={qn._tempId} className="border border-border/40 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[10px] font-bold text-muted-foreground">Q{idx + 1}</span>
                  <Badge variant="secondary" className={cn("text-[9px]", QUESTION_TYPE_COLORS[qn.type])}>
                    {QUESTION_TYPE_LABELS[qn.type]}
                  </Badge>
                  <span className="text-[10px] text-muted-foreground ml-auto">{qn.points} pt{qn.points > 1 ? "s" : ""}</span>
                </div>
                <p className="text-sm font-medium mb-2">{qn.text}</p>
                {qn.type === "VRAI_FAUX" ? (
                  <div className="grid grid-cols-2 gap-2">
                    {qn.options.map((opt, i) => (
                      <div key={i} className={cn(
                        "p-2 rounded-lg border text-xs text-center font-medium",
                        qn.correctAnswer.includes(i)
                          ? "border-border bg-emerald-50 dark:bg-emerald-500/10 text-green-700"
                          : "border-border/60 text-muted-foreground"
                      )}>
                        {opt}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-1">
                    {qn.options.filter((o) => o.trim()).map((opt, i) => (
                      <div key={i} className={cn(
                        "flex items-center gap-2 p-2 rounded-lg border text-xs",
                        qn.correctAnswer.includes(i)
                          ? "border-border bg-emerald-50 dark:bg-emerald-500/10"
                          : "border-border/40"
                      )}>
                        <div className={cn(
                          "w-5 h-5 rounded-full border-2 flex items-center justify-center text-[9px] font-bold",
                          qn.correctAnswer.includes(i)
                            ? "border-green-500 bg-green-500 text-white"
                            : "border-border text-muted-foreground"
                        )}>
                          {qn.correctAnswer.includes(i) ? "✓" : String.fromCharCode(65 + i)}
                        </div>
                        <span className={qn.correctAnswer.includes(i) ? "text-green-700" : "text-muted-foreground"}>
                          {opt}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
                {qn.explanation && (
                  <p className="text-[10px] text-amber-700 bg-amber-50 dark:bg-amber-500/10 rounded p-2 mt-2 italic">
                    💡 {qn.explanation}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
