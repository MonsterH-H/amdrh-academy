"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useAppStore } from "@/store/app";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Clock, CheckCircle2, XCircle, Trophy, AlertCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type QuizState = "loading" | "intro" | "playing" | "submitted" | "results";

export function QuizPage() {
  const { user, viewParams, navigate } = useAppStore();
  const quizId = viewParams?.quizId;
  const courseId = viewParams?.courseId;
  const [state, setState] = useState<QuizState>("loading");
  const [questions, setQuestions] = useState<Array<Record<string, unknown>>>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number[]>>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const [attemptId, setAttemptId] = useState("");
  const [passingScore, setPassingScore] = useState(70);
  const handleSubmitRef = useRef<() => void>(() => {});

  useEffect(() => {
    if (!quizId) return;
    const fetchQuiz = async () => {
      try {
        const res = await fetch(`/api/quiz/${quizId}`);
        const data = await res.json();
        setQuestions(data.quiz?.questions || []);
        setTimeLeft(data.quiz?.duration ? data.quiz.duration * 60 : 1800);
        setPassingScore(data.quiz?.passingScore || 70);
        setState("intro");
      } catch {
        setState("intro");
      }
    };
    fetchQuiz();
  }, [quizId]);

  // Timer
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

  const handleSubmit = useCallback(async () => {
    if (!quizId || !user) return;
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
      setResult(data);
      setState("results");
    } catch {
      setState("results");
    }
  }, [quizId, user, answers, attemptId]);

  useEffect(() => {
    handleSubmitRef.current = handleSubmit;
  }, [handleSubmit]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
  };

  if (state === "loading") {
    return (
      <div className="space-y-4">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  // Intro
  if (state === "intro") {
    return (
      <div className="max-w-xl mx-auto animate-fadeIn">
        <button onClick={() => navigate("course-detail", { id: courseId || "" })} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="w-4 h-4" /> Retour au cours
        </button>
        <Card className="border-border/60">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <Trophy className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-xl font-bold text-foreground mb-2">Prêt pour le quiz ?</h2>
            <p className="text-sm text-muted-foreground mb-6">
              {questions.length} questions • {formatTime(timeLeft)} • Score minimum {passingScore}%
            </p>
            <Button className="rounded-lg h-11 px-8" onClick={() => setState("playing")}>
              Commencer le quiz
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Submitted
  if (state === "submitted") {
    return (
      <div className="max-w-xl mx-auto text-center py-20 animate-fadeIn">
        <Loader2 className="w-10 h-10 text-primary animate-spin mx-auto mb-4" />
        <h2 className="text-lg font-semibold text-foreground">Correction en cours...</h2>
      </div>
    );
  }

  // Results
  if (state === "results" && result) {
    const passed = result.status === "REUSSI";
    return (
      <div className="max-w-xl mx-auto animate-fadeIn">
        <Card className={cn("border-2", passed ? "border-green-300" : "border-red-300")}>
          <CardContent className="p-8 text-center">
            <div className={cn("w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6", passed ? "bg-green-100" : "bg-red-100")}>
              {passed ? <Trophy className="w-10 h-10 text-green-600" /> : <AlertCircle className="w-10 h-10 text-red-600" />}
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">
              {passed ? "Félicitations !" : "Dommage..."}
            </h2>
            <p className="text-muted-foreground mb-6">
              {passed ? "Vous avez réussi le quiz !" : "Vous n'avez pas atteint le score minimum."}
            </p>
            <div className="flex justify-center gap-6 mb-6">
              <div>
                <p className="text-3xl font-bold text-foreground">{String(result.score)}/{String(result.maxScore)}</p>
                <p className="text-xs text-muted-foreground">Score</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-foreground">{String(result.scorePercentage)}%</p>
                <p className="text-xs text-muted-foreground">Pourcentage</p>
              </div>
            </div>

            {/* Answer review */}
            <div className="text-left space-y-3 mb-6">
              {(result.answers as Array<Record<string, unknown>>)?.map((a, i) => (
                <div key={i} className={cn("p-3 rounded-lg border", a.isCorrect ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200")}>
                  <div className="flex items-start gap-2">
                    {a.isCorrect ? <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5" /> : <XCircle className="w-4 h-4 text-red-500 mt-0.5" />}
                    <div className="flex-1">
                      <p className="text-sm font-medium">Question {i + 1}</p>
                      <p className="text-xs text-muted-foreground">
                        {a.isCorrect ? "Correct" : "Incorrect"}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <Button onClick={() => navigate("course-detail", { id: courseId || "" })} className="rounded-lg">
              Retour au cours
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Playing
  const currentQuestion = questions[currentIdx];
  const options = currentQuestion ? JSON.parse((currentQuestion.options as string) || "[]") : [];
  const selected = answers[currentQuestion?.id as string] || [];
  const progressPct = ((currentIdx + 1) / questions.length) * 100;

  return (
    <div className="max-w-2xl mx-auto animate-fadeIn">
      <div className="flex items-center justify-between mb-4">
        <button onClick={() => navigate("course-detail", { id: courseId || "" })} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-4 h-4" /> Quitter
        </button>
        <div className={cn("flex items-center gap-2 text-sm font-mono font-bold", timeLeft < 120 ? "text-red-600" : "text-foreground")}>
          <Clock className="w-4 h-4" /> {formatTime(timeLeft)}
        </div>
      </div>

      <Progress value={progressPct} className="h-1.5 mb-6" />

      <Card className="border-border/60">
        <CardContent className="p-6 sm:p-8">
          <p className="text-xs text-muted-foreground mb-2">
            Question {currentIdx + 1} sur {questions.length}
          </p>
          <h3 className="text-lg font-semibold text-foreground mb-6">
            {currentQuestion?.text as string}
          </h3>

          <div className="space-y-3">
            {options.map((opt: string, i: number) => (
              <button
                key={i}
                onClick={() => setAnswers({ ...answers, [currentQuestion?.id as string]: [i] })}
                className={cn(
                  "w-full flex items-center gap-3 p-4 rounded-lg border-2 text-left text-sm transition-all duration-200",
                  selected.includes(i)
                    ? "border-primary bg-primary/5 text-primary font-medium"
                    : "border-border/60 hover:border-primary/30"
                )}
              >
                <div className={cn(
                  "w-7 h-7 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all",
                  selected.includes(i)
                    ? "border-primary bg-primary text-white"
                    : "border-border"
                )}>
                  <span className="text-xs font-bold">{String.fromCharCode(65 + i)}</span>
                </div>
                {opt}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between mt-6">
        <Button
          variant="outline" onClick={() => setCurrentIdx(Math.max(0, currentIdx - 1))}
          disabled={currentIdx === 0} className="rounded-lg"
        >
          Précédent
        </Button>

        <div className="flex gap-1">
          {questions.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentIdx(i)}
              className={cn(
                "w-8 h-8 rounded-full text-xs font-bold transition-all",
                i === currentIdx
                  ? "bg-primary text-white"
                  : answers[questions[i]?.id as string]
                  ? "bg-primary/20 text-primary"
                  : "bg-muted text-muted-foreground"
              )}
            >
              {i + 1}
            </button>
          ))}
        </div>

        {currentIdx === questions.length - 1 ? (
          <Button onClick={handleSubmit} className="rounded-lg">
            Soumettre
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
