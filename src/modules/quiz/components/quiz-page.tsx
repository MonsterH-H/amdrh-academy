"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useAppStore } from "@/store/app";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Trophy, Loader2, ClipboardList, Clock, Target,
  CheckCircle2, XCircle, ArrowRight, BookOpen,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import type { QuizState, QuizData, QuizResult } from "../types";
import { shuffleArray } from "../types";
import { QuizIntro } from "./quiz-intro";
import { QuizQuestion } from "./quiz-question";
import { QuizProgressBar } from "./quiz-progress-bar";
import { QuizResults } from "./quiz-results";

interface LearnerQuizItem {
  quizId: string;
  courseId: string;
  quizTitle: string;
  quizDescription: string | null;
  courseTitle: string;
  courseCategory: string;
  courseDifficulty: string;
  courseCoverImage: string | null;
  courseIsCertifying: boolean;
  duration: number;
  passingScore: number;
  maxAttempts: number;
  totalQuestions: number;
  maxScore: number;
  enrollmentStatus: string;
  enrollmentProgress: number;
  attemptsUsed: number;
  attemptsRemaining: number;
  bestScore: number | null;
  bestScorePercentage: number | null;
  bestStatus: string | null;
  lastAttemptDate: string | null;
}

function QuizListingPage() {
  const { user, navigate } = useAppStore();
  const [quizzes, setQuizzes] = useState<LearnerQuizItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const res = await fetch("/api/learner/quizzes");
        if (!res.ok) throw new Error("Erreur");
        const data = await res.json();
        setQuizzes(data.quizzes || []);
      } catch {
        setError(true);
        toast({ title: "Erreur", description: "Impossible de charger les quiz.", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchQuizzes();
  }, [user]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-4 animate-fadeIn">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96" />
        <div className="grid gap-4 mt-6">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-xl mx-auto text-center py-20 animate-fadeIn">
        <h2 className="text-lg font-semibold text-foreground mb-2">Erreur</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Impossible de charger les quiz. Veuillez réessayer.
        </p>
        <Button
          variant="outline"
          onClick={() => setLoading(true)}
          className="rounded-lg"
        >
          Réessayer
        </Button>
      </div>
    );
  }

  if (quizzes.length === 0) {
    return (
      <div className="max-w-xl mx-auto text-center py-20 animate-fadeIn">
        <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-6">
          <ClipboardList className="w-8 h-8 text-muted-foreground" />
        </div>
        <h2 className="text-xl font-bold text-foreground mb-2">
          Aucun quiz disponible
        </h2>
        <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
          Vous n&apos;êtes inscrit(e) à aucune formation comportant un quiz.
          Inscrivez-vous à une formation pour accéder à ses quiz.
        </p>
        <Button
          onClick={() => navigate("courses")}
          className="rounded-lg gap-2"
        >
          <BookOpen className="w-4 h-4" />
          Voir les formations
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto animate-fadeIn">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Quiz & Examens</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Quiz de vos formations inscrites
        </p>
      </div>

      <div className="grid gap-4">
        {quizzes.map((quiz) => (
          <Card
            key={quiz.quizId}
            className="border-border/60 hover:border-primary/30 transition-all cursor-pointer group"
          >
            <CardContent className="p-5">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-foreground truncate">
                      {quiz.quizTitle}
                    </h3>
                    {quiz.courseIsCertifying && (
                      <Badge variant="outline" className="text-xs flex-shrink-0 bg-amber-50 text-amber-700 border-amber-200">
                        Certifiant
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mb-3">
                    Formation : {quiz.courseTitle}
                  </p>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Target className="w-3.5 h-3.5" />
                      {quiz.totalQuestions} question{quiz.totalQuestions > 1 ? "s" : ""}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {quiz.duration} min
                    </span>
                    <span className="flex items-center gap-1">
                      Seuil : {quiz.passingScore}%
                    </span>
                    <span>
                      {quiz.attemptsUsed}/{quiz.maxAttempts} tentative{quiz.maxAttempts > 1 ? "s" : ""}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 sm:flex-col sm:items-end">
                  {quiz.bestStatus && (
                    <div className="flex items-center gap-1.5">
                      {quiz.bestStatus === "REUSSI" ? (
                        <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          Réussi {quiz.bestScorePercentage}%
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-red-600 border-red-200 text-xs gap-1">
                          <XCircle className="w-3 h-3" />
                          Échoué {quiz.bestScorePercentage}%
                        </Badge>
                      )}
                    </div>
                  )}

                  <Button
                    size="sm"
                    className="rounded-lg gap-1.5 group-hover:gap-2 transition-all"
                    disabled={quiz.attemptsRemaining <= 0 && quiz.bestStatus !== "REUSSI"}
                    onClick={() =>
                      navigate("quiz", {
                        quizId: quiz.quizId,
                        courseId: quiz.courseId,
                      })
                    }
                  >
                    {quiz.attemptsRemaining <= 0 && quiz.bestStatus !== "REUSSI"
                      ? "Aucune tentative"
                      : quiz.bestStatus === "REUSSI"
                        ? "Revoir"
                        : "Commencer"}
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export function QuizPage() {
  const { user, viewParams, navigate } = useAppStore();
  const quizId = viewParams?.quizId;
  const courseId = viewParams?.courseId;

  // If no quizId, show the quiz listing page
  if (!quizId) {
    return <QuizListingPage />;
  }

  return <QuizTakingPage quizId={quizId} courseId={courseId} />;
}

function QuizTakingPage({ quizId, courseId }: { quizId: string; courseId?: string }) {
  const { user, navigate } = useAppStore();

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

      if (data.status === "REUSSI") {
        if (data.certificate) {
          toast({ title: "Certificat obtenu !", description: `Votre certificat ${data.certificate.code} a été généré.` });
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
        <div className="flex gap-3 justify-center">
          <Button variant="outline" onClick={() => navigate("quiz")} className="rounded-lg">
            ← Mes quiz
          </Button>
          <Button variant="outline" onClick={() => navigate("course-detail", { id: courseId || "" })} className="rounded-lg">
            Retour au cours
          </Button>
        </div>
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
