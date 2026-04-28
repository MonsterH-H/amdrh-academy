"use client";

import { useAppStore } from "@/store/app";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Trophy,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Award,
  Download,
  BookOpen,
  RotateCcw,
  PartyPopper,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { QuizData, QuizResult } from "../types";

interface QuizResultsProps {
  result: QuizResult;
  questions: QuizData["questions"];
  passingScore: number;
  onRetry: () => void;
}

export function QuizResults({
  result,
  questions,
  passingScore,
  onRetry,
}: QuizResultsProps) {
  const { viewParams, navigate } = useAppStore();
  const courseId = viewParams?.courseId;

  const passed = result.status === "REUSSI";
  const hasCertificate = !!result.certificate;
  const isEnrollmentComplete = result.enrollmentCompleted === true;
  const attemptsLeft = result.attemptsRemaining ?? 0;
  const lessonsLeft = result.remainingLessons ?? 0;

  return (
    <div className="max-w-xl mx-auto animate-fadeIn space-y-4">
      <button
        onClick={() => navigate("course-detail", { id: courseId || "" })}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="w-4 h-4" /> Retour au cours
      </button>

      <Card className={cn("border-2", passed ? "border-green-300" : "border-red-300")}>
        <CardContent className="p-8 text-center">
          <div
            className={cn(
              "w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6",
              passed ? "bg-green-100" : "bg-red-100"
            )}
          >
            {passed ? (
              <Trophy className="w-10 h-10 text-green-600" />
            ) : (
              <AlertCircle className="w-10 h-10 text-red-600" />
            )}
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">
            {passed ? "Félicitations !" : "Dommage..."}
          </h2>
          <p className="text-muted-foreground mb-6">
            {passed
              ? "Vous avez réussi le quiz !"
              : "Vous n'avez pas atteint le score minimum."}
          </p>

          <div className="flex justify-center gap-6 mb-6">
            <div>
              <p className="text-3xl font-bold text-foreground">
                {result.score}/{result.maxScore}
              </p>
              <p className="text-xs text-muted-foreground">Score</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-foreground">
                {result.scorePercentage}%
              </p>
              <p className="text-xs text-muted-foreground">Pourcentage</p>
            </div>
            {!passed && (
              <div>
                <p className="text-3xl font-bold text-foreground">{attemptsLeft}</p>
                <p className="text-xs text-muted-foreground">
                  Tentative{attemptsLeft !== 1 ? "s" : ""} restante
                  {attemptsLeft !== 1 ? "s" : ""}
                </p>
              </div>
            )}
          </div>

          <div className="max-w-xs mx-auto mb-6">
            <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-1">
              <span>0%</span>
              <span>Score minimum : {passingScore}%</span>
              <span>100%</span>
            </div>
            <div className="relative h-3 bg-muted rounded-full overflow-hidden">
              <div
                className={cn(
                  "absolute inset-y-0 left-0 rounded-full transition-all duration-700",
                  passed ? "bg-green-500" : "bg-red-500"
                )}
                style={{ width: `${Math.min(result.scorePercentage, 100)}%` }}
              />
              <div
                className="absolute inset-y-0 w-0.5 bg-foreground/30"
                style={{ left: `${passingScore}%` }}
              />
            </div>
          </div>

          <div className="text-left space-y-2 max-h-72 overflow-y-auto mb-6 pr-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
              Revue des réponses
            </p>
            {result.answers?.map((a, i) => {
              const question = questions.find((q) => q.id === a.questionId);
              return (
                <div
                  key={a.questionId}
                  className={cn(
                    "p-3 rounded-lg border",
                    a.isCorrect ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"
                  )}
                >
                  <div className="flex items-start gap-2">
                    {a.isCorrect ? (
                      <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground leading-snug">
                        Question {i + 1}
                        {question &&
                          `: ${question.text.substring(0, 60)}${question.text.length > 60 ? "..." : ""}`}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {a.isCorrect
                          ? `Correct (+${a.pointsEarned} pt${a.pointsEarned > 1 ? "s" : ""})`
                          : "Incorrect (0 pt)"}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex flex-wrap justify-center gap-3">
            {!passed && attemptsLeft > 0 && (
              <Button onClick={onRetry} className="rounded-lg">
                <RotateCcw className="w-4 h-4 mr-2" />
                Réessayez ({attemptsLeft} restante{attemptsLeft > 1 ? "s" : ""})
              </Button>
            )}
            <Button
              variant={passed ? "default" : "outline"}
              onClick={() => navigate("course-detail", { id: courseId || "" })}
              className="rounded-lg"
            >
              <BookOpen className="w-4 h-4 mr-2" />
              Retour au cours
            </Button>
          </div>

          {!passed && attemptsLeft === 0 && (
            <p className="text-sm text-red-600 mt-4 font-medium">
              Nombre maximum de tentatives atteint
            </p>
          )}
        </CardContent>
      </Card>
      {passed && hasCertificate && result.certificate && (
        <Card className="border-2 border-amber-300 bg-gradient-to-br from-amber-50 to-orange-50 overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-amber-400 via-amber-500 to-orange-400" />
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-amber-100 flex items-center justify-center flex-shrink-0">
                <Award className="w-7 h-7 text-amber-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-lg font-bold text-foreground">
                    Votre certificat a été généré !
                  </h3>
                  {isEnrollmentComplete && (
                    <Badge className="bg-green-100 text-green-800 border-green-200 hover:bg-green-100">
                      <PartyPopper className="w-3 h-3 mr-1" />
                      Formation terminée !
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mt-1 mb-3">
                  Cours : {result.certificate.courseTitle}
                </p>
                <div className="bg-white rounded-lg border border-amber-200 p-4 mb-4">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                    Code du certificat
                  </p>
                  <p className="text-xl font-mono font-bold text-amber-800">
                    {result.certificate.code}
                  </p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Button
                    className="rounded-lg"
                    onClick={() => {
                      window.open(
                        `/api/certificates/verify?code=${encodeURIComponent(result.certificate!.code)}`,
                        "_blank"
                      );
                    }}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Voir le certificat
                  </Button>
                  <Button
                    variant="outline"
                    className="rounded-lg"
                    onClick={() => navigate("certificates")}
                  >
                    <Award className="w-4 h-4 mr-2" />
                    Voir mes certificats
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {passed && !hasCertificate && lessonsLeft > 0 && (
        <Card className="border-2 border-blue-200 bg-blue-50/50">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
                <BookOpen className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="text-base font-semibold text-foreground">
                  Leçons restantes à compléter
                </h3>
                <p className="text-sm text-muted-foreground mt-1 mb-4">
                  Vous avez réussi le quiz, mais il vous reste{" "}
                  <span className="font-semibold text-foreground">
                    {lessonsLeft} leçon{lessonsLeft > 1 ? "s" : ""}
                  </span>{" "}
                  à terminer pour compléter la formation.
                </p>
                <Button
                  className="rounded-lg"
                  onClick={() => navigate("course-detail", { id: courseId || "" })}
                >
                  <BookOpen className="w-4 h-4 mr-2" />
                  Continuer la formation
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {passed && !hasCertificate && isEnrollmentComplete && (
        <Card className="border-2 border-green-200 bg-green-50/50">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-base font-semibold text-foreground">
                    Formation terminée !
                  </h3>
                  <Badge className="bg-green-100 text-green-800 border-green-200 hover:bg-green-100">
                    <PartyPopper className="w-3 h-3 mr-1" />
                    Complété
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Félicitations ! Vous avez terminé cette formation avec succès.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
