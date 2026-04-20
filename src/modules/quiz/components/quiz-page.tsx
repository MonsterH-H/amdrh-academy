"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useAppStore } from "@/store/app";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Trophy, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import type { QuizState, QuizData, QuizResult } from "../types";
import { shuffleArray } from "../types";
import { QuizIntro } from "./quiz-intro";
import { QuizQuestion } from "./quiz-question";
import { QuizProgressBar } from "./quiz-progress-bar";
import { QuizResults } from "./quiz-results";

export function QuizPage() {
  const { user, viewParams, navigate } = useAppStore();
  const quizId = viewParams?.quizId;
  const courseId = viewParams?.courseId;

  const [state, setState] = useState<QuizState>("loading");
  const [quizData, setQuizData] = useState<QuizData | null>(null);
  const [questions, setQuestions] = useState<QuizData["questions"]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number[]>>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [originalDuration, setOriginalDuration] = useState(1800);
  const [result, setResult] = useState<QuizResult | null>(null);
  const [attemptId, setAttemptId] = useState("");
  const [passingScore, setPassingScore] = useState(70);
  const [maxAttempts, setMaxAttempts] = useState(3);
  const handleSubmitRef = useRef<() => void>(() => {});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submittedRef = useRef(false);

  // Fetch quiz data
  useEffect(() => {
    if (!quizId) return;
    const fetchQuiz = async () => {
      try {
        const res = await fetch(`/api/quiz/${quizId}`);
        if (!res.ok) throw new Error("Quiz introuvable");
        const data = await res.json();
        if (data.error) throw new Error(data.error);
        const quiz = data.quiz as QuizData;
        setQuizData(quiz);
        setPassingScore(quiz.passingScore);
        setMaxAttempts(quiz.maxAttempts);
        setQuestions(quiz.shuffleQuestions ? shuffleArray(quiz.questions) : quiz.questions);
        const dur = quiz.duration * 60;
        setTimeLeft(dur);
        setOriginalDuration(dur);
        setState("intro");
      } catch {
        toast({ title: "Erreur", description: "Impossible de charger le quiz.", variant: "destructive" });
        setState("error");
      }
    };
    fetchQuiz();
  }, [quizId]);

  // Timer countdown
  useEffect(() => {
    if (state !== "playing" || timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) { clearInterval(timer); handleSubmitRef.current(); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [state]);

  // Submit quiz
  const handleSubmit = useCallback(async () => {
    if (!quizId || !user || submittedRef.current) return;
    submittedRef.current = true;
    setIsSubmitting(true);
    setState("submitted");
    try {
      const payload = {
        userId: user.id,
        quizId,
        answers: Object.entries(answers).map(([qId, sel]) => ({
          questionId: qId,
          selectedAnswer: JSON.stringify(sel),
        })),
        attemptId: attemptId || undefined,
      };
      const res = await fetch(`/api/quiz/${quizId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.error) {
        toast({ title: "Erreur", description: data.error, variant: "destructive" });
        setState("playing"); submittedRef.current = false; setIsSubmitting(false); return;
      }
      setResult(data);
      setState("results");

      // Toast notifications based on result
      if (data.status === "REUSSI") {
        if (data.certificate) {
          toast({ title: "🎉 Certificat obtenu !", description: `Votre certificat ${data.certificate.code} a été généré.` });
        } else if (data.enrollmentCompleted) {
          toast({ title: "Formation terminée !", description: "Vous avez complété cette formation avec succès." });
        } else {
          const lessons = data.remainingLessons;
          toast({
            title: "Quiz réussi !",
            description: lessons > 0
              ? `${lessons} leçon${lessons > 1 ? "s" : ""} restante${lessons > 1 ? "s" : ""} à compléter.`
              : "Continuez votre parcours !",
          });
        }
      } else {
        const rem = data.attemptsRemaining ?? 0;
        toast({
          title: "Quiz non réussi",
          description: rem > 0
            ? `Ne vous découragez pas ! Il vous reste ${rem} tentative${rem > 1 ? "s" : ""}.`
            : "Nombre maximum de tentatives atteint.",
          ...(rem === 0 && { variant: "destructive" }),
        });
      }
    } catch {
      toast({ title: "Erreur réseau", description: "Veuillez réessayer.", variant: "destructive" });
      setState("playing"); submittedRef.current = false; setIsSubmitting(false);
    }
  }, [quizId, user, answers, attemptId]);

  useEffect(() => { handleSubmitRef.current = handleSubmit; }, [handleSubmit]);

  const handleRetry = () => {
    if (!quizData) return;
    setAnswers({});
    setCurrentIdx(0);
    setAttemptId("");
    setResult(null);
    submittedRef.current = false;
    setQuestions(quizData.shuffleQuestions ? shuffleArray(quizData.questions) : quizData.questions);
    setTimeLeft(originalDuration);
    setState("intro");
  };

  const handleSingleSelect = (questionId: string, optionIndex: number) => {
    setAnswers((prev) => ({ ...prev, [questionId]: [optionIndex] }));
  };

  const handleMultiSelect = (questionId: string, optionIndex: number) => {
    setAnswers((prev) => {
      const current = prev[questionId] || [];
      const isSelected = current.includes(optionIndex);
      return { ...prev, [questionId]: isSelected ? current.filter((i) => i !== optionIndex) : [...current, optionIndex] };
    });
  };

  // ADMIN and FORMATEUR guard
  if (user && (user.role === "ADMIN" || user.role === "FORMATEUR")) {
    return (
      <div className="max-w-xl mx-auto animate-fadeIn">
        <button
          onClick={() => navigate("course-detail", { id: courseId || "" })}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"
        >
          ← Retour au cours
        </button>
        <Card className="border-border/60">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 rounded-2xl bg-amber-100 flex items-center justify-center mx-auto mb-6">
              <Trophy className="w-8 h-8 text-amber-600" />
            </div>
            <h2 className="text-xl font-bold text-foreground mb-2">Accès réservé aux apprenants</h2>
            <p className="text-sm text-muted-foreground mb-4">
              En tant que {user.role === "ADMIN" ? "administrateur" : "formateur"}, vous ne passez pas les quiz.
              Vous pouvez consulter les résultats depuis le tableau de bord.
            </p>
            <Button onClick={() => navigate("admin-quizzes")} className="rounded-lg">
              Voir la gestion des quiz
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (state === "loading") {
    return (
      <div className="max-w-xl mx-auto space-y-4 animate-fadeIn">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  if (state === "error") {
    return (
      <div className="max-w-xl mx-auto text-center py-20 animate-fadeIn">
        <h2 className="text-lg font-semibold text-foreground mb-2">Erreur</h2>
        <p className="text-sm text-muted-foreground mb-4">Impossible de charger le quiz. Veuillez réessayer.</p>
        <Button variant="outline" onClick={() => navigate("course-detail", { id: courseId || "" })} className="rounded-lg">
          Retour
        </Button>
      </div>
    );
  }

  if (state === "intro") {
    return (
      <QuizIntro
        quizData={quizData} questions={questions} passingScore={passingScore}
        maxAttempts={maxAttempts} onStart={() => setState("playing")}
      />
    );
  }

  if (state === "submitted") {
    return (
      <div className="max-w-xl mx-auto text-center py-20 animate-fadeIn">
        <Loader2 className="w-10 h-10 text-primary animate-spin mx-auto mb-4" />
        <h2 className="text-lg font-semibold text-foreground">Correction en cours...</h2>
        <p className="text-sm text-muted-foreground mt-1">Veuillez patienter pendant la correction de vos réponses.</p>
      </div>
    );
  }

  if (state === "results" && result) {
    return (
      <QuizResults
        result={result} questions={questions} passingScore={passingScore} onRetry={handleRetry}
      />
    );
  }

  // Playing state
  const currentQuestion = questions[currentIdx];
  const selected = answers[currentQuestion?.id || ""] || [];
  const questionType = currentQuestion?.type || "QCM_SIMPLE";
  const answeredCount = Object.keys(answers).length;

  return (
    <div className="max-w-2xl mx-auto animate-fadeIn">
      <QuizProgressBar
        timeLeft={timeLeft} originalDuration={originalDuration}
        currentIdx={currentIdx} totalQuestions={questions.length} answeredCount={answeredCount}
      />

      <QuizQuestion
        question={currentQuestion} questionType={questionType}
        isMultiple={questionType === "QCM_MULTIPLE"} isTrueFalse={questionType === "VRAI_FAUX"}
        selected={selected} currentIdx={currentIdx} totalQuestions={questions.length}
        onSingleSelect={handleSingleSelect} onMultiSelect={handleMultiSelect}
      />

      <div className="flex items-center justify-between mt-6">
        <Button
          variant="outline"
          onClick={() => setCurrentIdx(Math.max(0, currentIdx - 1))}
          disabled={currentIdx === 0}
          className="rounded-lg"
        >
          Précédent
        </Button>

        <div className="flex gap-1 max-w-xs overflow-x-auto">
          {questions.map((q, i) => {
            const isAnswered = answers[q.id]?.length > 0;
            const isCurrent = i === currentIdx;
            return (
              <button
                key={q.id}
                onClick={() => setCurrentIdx(i)}
                className={cn(
                  "w-8 h-8 rounded-full text-xs font-bold transition-all flex-shrink-0",
                  isCurrent
                    ? "bg-primary text-white ring-2 ring-primary/30"
                    : isAnswered
                      ? "bg-primary/20 text-primary"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                )}
                title={`Question ${i + 1}${isAnswered ? " (répondu)" : ""}`}
              >
                {i + 1}
              </button>
            );
          })}
        </div>

        {currentIdx === questions.length - 1 ? (
          <Button onClick={handleSubmit} className="rounded-lg" disabled={isSubmitting || submittedRef.current}>
            {isSubmitting || submittedRef.current ? <Loader2 className="w-4 h-4 animate-spin" /> : "Soumettre"}
          </Button>
        ) : (
          <Button onClick={() => setCurrentIdx(currentIdx + 1)} className="rounded-lg">
            Suivant
          </Button>
        )}
      </div>
    </div>
  );
}
