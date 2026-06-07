"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useAppStore } from "@/store/app";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  Clock,
  CheckCircle2,
  XCircle,
  Trophy,
  AlertCircle,
  Loader2,
  Award,
  Download,
  BookOpen,
  RotateCcw,
  PartyPopper,
  HelpCircle,
  Zap,
  Target,
  ShieldCheck,
  ListChecks,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { QUESTION_TYPE_LABELS, QUESTION_TYPE_COLORS } from "@/lib/constants";

type QuizState = "loading" | "intro" | "playing" | "submitted" | "results";

interface QuizData {
  id: string;
  title: string;
  description: string | null;
  duration: number;
  passingScore: number;
  shuffleQuestions: boolean;
  showAnswers: boolean;
  maxAttempts: number;
  course: {
    title: string;
    maxAttempts: number;
    isCertifying: boolean;
  };
  questions: Array<{
    id: string;
    text: string;
    type: string;
    options: string;
    points: number;
    order: number;
  }>;
}

interface CertificateInfo {
  code: string;
  type: string;
  courseTitle: string;
}

interface QuizResult {
  attemptId: string;
  score: number;
  maxScore: number;
  scorePercentage: number;
  status: string;
  answers: Array<{
    questionId: string;
    isCorrect: boolean;
    pointsEarned: number;
    correctAnswer: number[];
  }>;
  certificate?: CertificateInfo;
  enrollmentCompleted?: boolean;
  attemptsRemaining?: number;
  remainingLessons?: number;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function shuffleArray<T>(arr: T[]): T[] {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function formatTime(s: number) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
}

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
}

// ─── Question Type Icon ─────────────────────────────────────────────────────

function getQuestionTypeIcon(type: string) {
  switch (type) {
    case "QCM_MULTIPLE":
      return <ListChecks className="w-3.5 h-3.5" />;
    case "VRAI_FAUX":
      return <HelpCircle className="w-3.5 h-3.5" />;
    default:
      return <Target className="w-3.5 h-3.5" />;
  }
}

// ─── Main Component ─────────────────────────────────────────────────────────

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

        // Shuffle questions if configured
        const questionsToUse = quiz.shuffleQuestions
          ? shuffleArray(quiz.questions)
          : quiz.questions;
        setQuestions(questionsToUse);

        const dur = quiz.duration * 60;
        setTimeLeft(dur);
        setOriginalDuration(dur);
        setState("intro");
      } catch {
        toast({
          title: "Erreur",
          description: "Impossible de charger le quiz.",
          variant: "destructive",
        });
        setState("intro");
      }
    };
    fetchQuiz();
  }, [quizId]);

  // Timer countdown
  useEffect(() => {
    if (state !== "playing" || timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timer);
          handleSubmitRef.current();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [state, timeLeft]);

  // Submit quiz
  const handleSubmit = useCallback(async () => {
    if (!quizId || !user || submittedRef.current) return;
    submittedRef.current = true;
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
        toast({
          title: "Erreur",
          description: data.error,
          variant: "destructive",
        });
        setState("playing");
        submittedRef.current = false;
        return;
      }

      setResult(data);
      setState("results");

      if (data.status === "REUSSI") {
        if (data.certificate) {
          toast({
            title: "🎉 Certificat obtenu !",
            description: `Votre certificat ${data.certificate.code} a été généré.`,
          });
        } else if (data.enrollmentCompleted) {
          toast({
            title: "Formation terminée !",
            description:
              "Vous avez complété cette formation avec succès.",
          });
        } else {
          toast({
            title: "Quiz réussi !",
            description:
              data.remainingLessons > 0
                ? `${data.remainingLessons} leçon${data.remainingLessons > 1 ? "s" : ""} restante${data.remainingLessons > 1 ? "s" : ""} à compléter.`
                : "Continuez votre parcours !",
          });
        }
      } else {
        const remaining = data.attemptsRemaining ?? 0;
        if (remaining > 0) {
          toast({
            title: "Quiz non réussi",
            description: `Ne vous découragez pas ! Il vous reste ${remaining} tentative${remaining > 1 ? "s" : ""}.`,
          });
        } else {
          toast({
            title: "Quiz non réussi",
            description: "Nombre maximum de tentatives atteint.",
            variant: "destructive",
          });
        }
      }
    } catch {
      toast({
        title: "Erreur réseau",
        description: "Veuillez réessayer.",
        variant: "destructive",
      });
      setState("playing");
      submittedRef.current = false;
    }
  }, [quizId, user, answers, attemptId]);

  useEffect(() => {
    handleSubmitRef.current = handleSubmit;
  }, [handleSubmit]);

  // Retry handler
  const handleRetry = () => {
    if (!quizData) return;
    setAnswers({});
    setCurrentIdx(0);
    setAttemptId(result?.attemptId || "");
    setResult(null);
    submittedRef.current = false;

    // Re-shuffle questions on retry
    const questionsToUse = quizData.shuffleQuestions
      ? shuffleArray(quizData.questions)
      : quizData.questions;
    setQuestions(questionsToUse);

    setTimeLeft(originalDuration);
    setState("intro");
  };

  // Toggle answer for single-select
  const handleSingleSelect = (questionId: string, optionIndex: number) => {
    setAnswers((prev) => ({ ...prev, [questionId]: [optionIndex] }));
  };

  // Toggle answer for multi-select
  const handleMultiSelect = (questionId: string, optionIndex: number) => {
    setAnswers((prev) => {
      const current = prev[questionId] || [];
      const isSelected = current.includes(optionIndex);
      return {
        ...prev,
        [questionId]: isSelected
          ? current.filter((i) => i !== optionIndex)
          : [...current, optionIndex],
      };
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
          <ArrowLeft className="w-4 h-4" /> Retour au cours
        </button>
        <Card className="border-border/60">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 rounded-2xl bg-amber-100 flex items-center justify-center mx-auto mb-6">
              <Trophy className="w-8 h-8 text-amber-600" />
            </div>
            <h2 className="text-xl font-bold text-foreground mb-2">
              Accès réservé aux apprenants
            </h2>
            <p className="text-sm text-muted-foreground mb-4">
              En tant que{" "}
              {user.role === "ADMIN" ? "administrateur" : "formateur"}, vous ne
              passez pas les quiz. Vous pouvez consulter les résultats depuis le
              tableau de bord.
            </p>
            <Button
              onClick={() => navigate("admin-quizzes")}
              className="rounded-lg"
            >
              Voir la gestion des quiz
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Loading state
  if (state === "loading") {
    return (
      <div className="max-w-xl mx-auto space-y-4 animate-fadeIn">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  // Intro screen
  if (state === "intro") {
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
          {/* Decorative top bar */}
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

            {/* Quiz Info Grid */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <ListChecks className="w-5 h-5 text-primary flex-shrink-0" />
                <div>
                  <p className="text-lg font-bold text-foreground">
                    {questions.length}
                  </p>
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
                  <p className="text-lg font-bold text-foreground">
                    {passingScore}%
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    Score minimum
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <Zap className="w-5 h-5 text-orange-500 flex-shrink-0" />
                <div>
                  <p className="text-lg font-bold text-foreground">
                    {totalPoints} pts
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    Score total
                  </p>
                </div>
              </div>
            </div>

            {/* Question types */}
            <div className="flex flex-wrap gap-1.5 mb-5">
              {questionTypes.map((type) => (
                <Badge
                  key={type}
                  variant="secondary"
                  className={cn(
                    "text-[10px] gap-1",
                    QUESTION_TYPE_COLORS[type] || ""
                  )}
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

            {/* Rules */}
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

            <Button
              className="rounded-lg h-11 px-8 w-full"
              onClick={() => setState("playing")}
            >
              <Zap className="w-4 h-4 mr-2" />
              Commencer le quiz
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Submitted state
  if (state === "submitted") {
    return (
      <div className="max-w-xl mx-auto text-center py-20 animate-fadeIn">
        <Loader2 className="w-10 h-10 text-primary animate-spin mx-auto mb-4" />
        <h2 className="text-lg font-semibold text-foreground">
          Correction en cours...
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Veuillez patienter pendant la correction de vos réponses.
        </p>
      </div>
    );
  }

  // Results state
  if (state === "results" && result) {
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

        <Card
          className={cn(
            "border-2",
            passed ? "border-green-300" : "border-red-300"
          )}
        >
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
                  <p className="text-3xl font-bold text-foreground">
                    {attemptsLeft}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Tentative{attemptsLeft !== 1 ? "s" : ""} restante
                    {attemptsLeft !== 1 ? "s" : ""}
                  </p>
                </div>
              )}
            </div>

            {/* Score bar */}
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

            {/* Answer review */}
            <div className="text-left space-y-2 max-h-72 overflow-y-auto mb-6 pr-1">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                Revue des réponses
              </p>
              {result.answers?.map((a, i) => {
                const question = questions.find(
                  (q) => q.id === a.questionId
                );
                return (
                  <div
                    key={a.questionId}
                    className={cn(
                      "p-3 rounded-lg border",
                      a.isCorrect
                        ? "bg-green-50 border-green-200"
                        : "bg-red-50 border-red-200"
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
                          {question && `: ${question.text.substring(0, 60)}${question.text.length > 60 ? "..." : ""}`}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {a.isCorrect
                            ? `Correct (+${a.pointsEarned} pt${a.pointsEarned > 1 ? "s" : ""})`
                            : `Incorrect (0 pt)`}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap justify-center gap-3">
              {!passed && attemptsLeft > 0 && (
                <Button onClick={handleRetry} className="rounded-lg">
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Réessayez ({attemptsLeft} restante
                  {attemptsLeft > 1 ? "s" : ""})
                </Button>
              )}

              <Button
                variant={passed ? "default" : "outline"}
                onClick={() =>
                  navigate("course-detail", { id: courseId || "" })
                }
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

        {/* Certificate celebratory section */}
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

        {/* Passed without certificate: remaining lessons */}
        {passed && !hasCertificate && lessonsLeft > 0 && (
          <Card className="border-2 border-blue-200 bg-blue-50/50">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <BookOpen className="w-6 h-6 text-blue-600" />
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
                    onClick={() =>
                      navigate("course-detail", { id: courseId || "" })
                    }
                  >
                    <BookOpen className="w-4 h-4 mr-2" />
                    Continuer la formation
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Passed, enrollment complete, no certificate */}
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
                    Félicitations ! Vous avez terminé cette formation avec
                    succès.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  // ─── Playing State ─────────────────────────────────────────────────────────
  const currentQuestion = questions[currentIdx];
  const options: string[] = currentQuestion
    ? JSON.parse(currentQuestion.options || "[]")
    : [];
  const selected = answers[currentQuestion?.id || ""] || [];
  const progressPct = ((currentIdx + 1) / questions.length) * 100;
  const questionType = currentQuestion?.type || "QCM_SIMPLE";
  const isMultiple = questionType === "QCM_MULTIPLE";
  const isTrueFalse = questionType === "VRAI_FAUX";
  const answeredCount = Object.keys(answers).length;
  const timePercent = (timeLeft / originalDuration) * 100;

  return (
    <div className="max-w-2xl mx-auto animate-fadeIn">
      {/* Top bar */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => navigate("course-detail", { id: courseId || "" })}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4" /> Quitter
        </button>
        <div className="flex items-center gap-3">
          <Badge variant="secondary" className="text-[10px]">
            {answeredCount}/{questions.length} répondu{answeredCount > 1 ? "s" : ""}
          </Badge>
          <div
            className={cn(
              "flex items-center gap-2 text-sm font-mono font-bold px-3 py-1.5 rounded-lg",
              timeLeft < 120
                ? "text-red-600 bg-red-50"
                : timeLeft < 300
                  ? "text-amber-600 bg-amber-50"
                  : "text-foreground bg-muted/50"
            )}
          >
            <Clock className="w-4 h-4" />
            {formatTime(timeLeft)}
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="relative mb-6">
        <Progress value={progressPct} className="h-1.5" />
        {timeLeft < 120 && (
          <Progress
            value={timePercent}
            className="h-0.5 mt-0.5 opacity-50"
          />
        )}
      </div>

      {/* Question Card */}
      <Card className="border-border/60">
        <CardContent className="p-6 sm:p-8">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs text-muted-foreground">
              Question {currentIdx + 1} sur {questions.length}
            </span>
            <Badge
              variant="secondary"
              className={cn(
                "text-[10px] gap-1",
                QUESTION_TYPE_COLORS[questionType] || ""
              )}
            >
              {getQuestionTypeIcon(questionType)}
              {QUESTION_TYPE_LABELS[questionType] || questionType}
            </Badge>
            <Badge variant="outline" className="text-[10px] gap-1 ml-auto">
              {currentQuestion?.points} pt{currentQuestion && currentQuestion.points > 1 ? "s" : ""}
            </Badge>
          </div>

          <h3 className="text-lg font-semibold text-foreground mb-6 leading-snug">
            {currentQuestion?.text}
          </h3>

          {/* True/False special rendering */}
          {isTrueFalse && options.length === 2 ? (
            <div className="grid grid-cols-2 gap-4">
              {options.map((opt, i) => (
                <button
                  key={i}
                  onClick={() =>
                    handleSingleSelect(currentQuestion.id, i)
                  }
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
            /* Standard options rendering */
            <div className="space-y-3">
              {options.map((opt, i) => {
                const isSelected = selected.includes(i);
                return (
                  <button
                    key={i}
                    onClick={() =>
                      isMultiple
                        ? handleMultiSelect(currentQuestion.id, i)
                        : handleSingleSelect(currentQuestion.id, i)
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
                          <svg
                            className="w-3 h-3"
                            viewBox="0 0 12 12"
                            fill="none"
                          >
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

      {/* Navigation */}
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
          <Button
            onClick={handleSubmit}
            className="rounded-lg"
            disabled={submittedRef.current}
          >
            {submittedRef.current ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              "Soumettre"
            )}
          </Button>
        ) : (
          <Button
            onClick={() => setCurrentIdx(currentIdx + 1)}
            className="rounded-lg"
          >
            Suivant
          </Button>
        )}
      </div>
    </div>
  );
}
