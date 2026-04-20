"use client";

import { ListChecks, HelpCircle, Target } from "lucide-react";
import type { ReactNode } from "react";

// ─── Types ──────────────────────────────────────────────────────────────────

export type QuizState = "loading" | "intro" | "playing" | "submitted" | "results" | "error";

export interface QuizData {
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

export interface CertificateInfo {
  code: string;
  type: string;
  courseTitle: string;
}

export interface QuizResult {
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

export function shuffleArray<T>(arr: T[]): T[] {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function formatTime(s: number) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
}

export function getQuestionTypeIcon(type: string): ReactNode {
  switch (type) {
    case "QCM_MULTIPLE":
      return <ListChecks className="w-3.5 h-3.5" />;
    case "VRAI_FAUX":
      return <HelpCircle className="w-3.5 h-3.5" />;
    default:
      return <Target className="w-3.5 h-3.5" />;
  }
}
