"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { QUESTION_TYPE_LABELS, QUESTION_TYPE_COLORS } from "@/lib/constants";
import type { QuizData } from "../types";
import { getQuestionTypeIcon } from "../types";

interface QuizQuestionProps {
  question: QuizData["questions"][number];
  questionType: string;
  isMultiple: boolean;
  isTrueFalse: boolean;
  selected: number[];
  currentIdx: number;
  totalQuestions: number;
  onSingleSelect: (questionId: string, optionIndex: number) => void;
  onMultiSelect: (questionId: string, optionIndex: number) => void;
}

export function QuizQuestion({
  question,
  questionType,
  isMultiple,
  isTrueFalse,
  selected,
  currentIdx,
  totalQuestions,
  onSingleSelect,
  onMultiSelect,
}: QuizQuestionProps) {
  let options: string[] = [];
  try { options = JSON.parse(question?.options || "[]"); } catch { options = []; }

  return (
    <Card className="border-border/60">
      <CardContent className="p-6 sm:p-8">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs text-muted-foreground">
            Question {currentIdx + 1} sur {totalQuestions}
          </span>
          <Badge
            variant="secondary"
            className={cn("text-[10px] gap-1", QUESTION_TYPE_COLORS[questionType] || "")}
          >
            {getQuestionTypeIcon(questionType)}
            {QUESTION_TYPE_LABELS[questionType] || questionType}
          </Badge>
          <Badge variant="outline" className="text-[10px] gap-1 ml-auto">
            {question?.points} pt{question && question.points > 1 ? "s" : ""}
          </Badge>
        </div>

        <h3 className="text-lg font-semibold text-foreground mb-6 leading-snug">
          {question?.text}
        </h3>

        {isTrueFalse && options.length === 2 ? (
          <div className="grid grid-cols-2 gap-4">
            {options.map((opt, i) => (
              <button
                key={i}
                onClick={() => onSingleSelect(question.id, i)}
                className={cn(
                  "flex items-center justify-center gap-3 p-5 rounded-xl border-2 text-base font-medium transition-all duration-200",
                  selected.includes(i)
                    ? i === 0
                      ? "border-green-400 bg-green-50 text-green-700"
                      : "border-red-400 bg-red-50 text-red-700"
                    : "border-border/60 hover:border-primary/30"
                )}
              >
                {i === 0 ? (
                  <CheckCircle2 className="w-5 h-5" />
                ) : (
                  <XCircle className="w-5 h-5" />
                )}
                {opt}
              </button>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {options.map((opt, i) => {
              const isSelected = selected.includes(i);
              return (
                <button
                  key={i}
                  onClick={() =>
                    isMultiple
                      ? onMultiSelect(question.id, i)
                      : onSingleSelect(question.id, i)
                  }
                  className={cn(
                    "w-full flex items-center gap-3 p-4 rounded-lg border-2 text-left text-sm transition-all duration-200",
                    isSelected
                      ? "border-primary bg-primary/5 text-primary font-medium"
                      : "border-border/60 hover:border-primary/30"
                  )}
                >
                  {isMultiple ? (
                    <div
                      className={cn(
                        "w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all",
                        isSelected
                          ? "border-primary bg-primary text-white"
                          : "border-border"
                      )}
                    >
                      {isSelected && (
                        <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none">
                          <path
                            d="M2 6l3 3 5-5"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      )}
                    </div>
                  ) : (
                    <div
                      className={cn(
                        "w-7 h-7 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all",
                        isSelected
                          ? "border-primary bg-primary text-white"
                          : "border-border"
                      )}
                    >
                      <span className="text-xs font-bold">
                        {String.fromCharCode(65 + i)}
                      </span>
                    </div>
                  )}
                  <span className="flex-1">{opt}</span>
                  {isMultiple && isSelected && (
                    <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                  )}
                </button>
              );
            })}
            {isMultiple && (
              <p className="text-[10px] text-muted-foreground italic mt-1">
                Sélectionnez toutes les réponses qui conviennent
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
