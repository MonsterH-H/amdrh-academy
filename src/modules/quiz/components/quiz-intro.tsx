"use client";

import { useAppStore } from "@/store/app";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  Clock,
  Trophy,
  Zap,
  Target,
  ShieldCheck,
  ListChecks,
  RotateCcw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { QUESTION_TYPE_LABELS, QUESTION_TYPE_COLORS } from "@/lib/constants";
import type { QuizData } from "../types";
import { formatDuration, getQuestionTypeIcon } from "../types";

interface QuizIntroProps {
  quizData: QuizData | null;
  questions: QuizData["questions"];
  passingScore: number;
  maxAttempts: number;
  onStart: () => void;
}

export function QuizIntro({
  quizData,
  questions,
  passingScore,
  maxAttempts,
  onStart,
}: QuizIntroProps) {
  const { viewParams, navigate } = useAppStore();
  const courseId = viewParams?.courseId;

  const questionTypes = [...new Set(questions.map((q) => q.type))];
  const totalPoints = questions.reduce((sum, q) => sum + q.points, 0);

  return (
    <div className="max-w-xl mx-auto animate-fadeIn">
      <button
        onClick={() => navigate("course-detail", { id: courseId || "" })}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="w-4 h-4" /> Retour au cours
      </button>

      <Card className="border-border/60 overflow-hidden">
        <div className="h-1.5 bg-gradient-to-r from-primary to-primary/60" />
        <CardHeader className="pb-4">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Trophy className="w-7 h-7 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <CardTitle className="text-xl leading-snug">
                {quizData?.title || "Quiz"}
              </CardTitle>
              {quizData?.description && (
                <p className="text-sm text-muted-foreground mt-1">
                  {quizData.description}
                </p>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <Separator className="mb-5" />

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <ListChecks className="w-5 h-5 text-primary flex-shrink-0" />
              <div>
                <p className="text-lg font-bold text-foreground">{questions.length}</p>
                <p className="text-[11px] text-muted-foreground">
                  Question{questions.length > 1 ? "s" : ""}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <Clock className="w-5 h-5 text-amber-600 flex-shrink-0" />
              <div>
                <p className="text-lg font-bold text-foreground">
                  {formatDuration(quizData?.duration || 30)}
                </p>
                <p className="text-[11px] text-muted-foreground">Durée</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <Target className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              <div>
                <p className="text-lg font-bold text-foreground">{passingScore}%</p>
                <p className="text-[11px] text-muted-foreground">Score minimum</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <Zap className="w-5 h-5 text-orange-500 flex-shrink-0" />
              <div>
                <p className="text-lg font-bold text-foreground">{totalPoints} pts</p>
                <p className="text-[11px] text-muted-foreground">Score total</p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5 mb-5">
            {questionTypes.map((type) => (
              <Badge
                key={type}
                variant="secondary"
                className={cn("text-[10px] gap-1", QUESTION_TYPE_COLORS[type] || "")}
              >
                {getQuestionTypeIcon(type)}
                {QUESTION_TYPE_LABELS[type] || type}
              </Badge>
            ))}
            {quizData?.shuffleQuestions && (
              <Badge variant="secondary" className="text-[10px] gap-1 bg-purple-100 text-purple-700">
                <RotateCcw className="w-3 h-3" />
                Questions mélangées
              </Badge>
            )}
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-6">
            <div className="flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
              <div className="text-xs text-amber-800 space-y-0.5">
                <p className="font-semibold">Consignes</p>
                <p>• Maximum {maxAttempts} tentative{maxAttempts > 1 ? "s" : ""} autorisée{maxAttempts > 1 ? "s" : ""}</p>
                <p>• Le quiz se soumet automatiquement quand le temps est écoulé</p>
                <p>• Vous pouvez naviguer librement entre les questions</p>
              </div>
            </div>
          </div>

          <Button className="rounded-lg h-11 px-8 w-full" onClick={onStart}>
            <Zap className="w-4 h-4 mr-2" />
            Commencer le quiz
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
