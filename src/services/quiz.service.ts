/**
 * @module services/quiz
 * @description Quiz service — fetching quizzes, submitting answers, and retrieving results.
 */

import { request } from "./auth.service";

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

/** A single question within a quiz (without the correct answer for learner view). */
export interface QuizQuestion {
  id: string;
  text: string;
  type: string;
  options: string; // JSON-encoded array
  points: number;
  order: number;
}

/** A quiz attached to a course. */
export interface Quiz {
  id: string;
  title: string;
  description?: string | null;
  courseId: string;
  duration: number;
  passingScore: number;
  shuffleQuestions: boolean;
  showAnswers: boolean;
  maxAttempts: number;
  questions: QuizQuestion[];
  course?: {
    title: string;
    maxAttempts?: number;
    isCertifying?: boolean;
    passingScore?: number;
    category?: string;
    slug?: string;
    instructorId?: string;
  };
}

/** A single answer submitted by the learner. */
export interface QuizAnswer {
  questionId: string;
  selectedAnswer: number[] | string;
  answerId?: string;
}

/** Result for a single answered question. */
export interface QuizAnswerResult {
  questionId: string;
  isCorrect: boolean;
  pointsEarned: number;
  correctAnswer: number[];
}

/** Certificate info returned upon passing a certifying quiz. */
export interface CertificateInfo {
  code: string;
  type: string;
  courseTitle: string;
}

/** Response from submitting a quiz. */
export interface QuizSubmitResponse {
  attemptId: string;
  score: number;
  maxScore: number;
  scorePercentage: number;
  status: "REUSSI" | "ECHOUE";
  answers: QuizAnswerResult[];
  certificate?: CertificateInfo | null;
  enrollmentCompleted: boolean;
  attemptsRemaining: number;
  remainingLessons?: number;
}

/** Detailed result for a single question in the results view. */
export interface QuizResultDetail {
  questionId: string;
  questionText: string;
  questionType: string;
  options: unknown[];
  correctAnswer: number[];
  selectedAnswer: number[];
  isCorrect: boolean;
  pointsEarned: number;
  maxPoints: number;
  explanation: string | null;
}

/** A quiz attempt summary. */
export interface QuizAttemptSummary {
  id: string;
  score: number;
  maxScore: number;
  status: string;
  duration?: number;
  startedAt: string;
  submittedAt: string;
}

/** Response from the quiz results endpoint. */
export interface QuizResultsResponse {
  quiz: {
    id: string;
    title: string;
    passingScore: number;
    showAnswers: boolean;
    course: { id: string; title: string; passingScore: number };
  };
  attempt: Omit<QuizAttemptSummary, "duration"> & { duration?: number };
  results: QuizResultDetail[];
  allAttempts: QuizAttemptSummary[];
}

/** Payload for submitting a quiz. */
export interface QuizSubmitPayload {
  userId: string;
  answers: QuizAnswer[];
  attemptId?: string;
}

// ─────────────────────────────────────────────────────────────
// Service
// ─────────────────────────────────────────────────────────────

export const quizService = {
  /**
   * Fetch a quiz by ID (without correct answers — learner view).
   *
   * @param quizId - The quiz UUID.
   * @returns The quiz with its questions and course metadata.
   */
  fetchQuiz: async (quizId: string): Promise<{ quiz: Quiz }> => {
    return request<{ quiz: Quiz }>(`/api/quiz/${quizId}`);
  },

  /**
   * Submit answers for a quiz attempt.
   *
   * @param quizId - The quiz UUID.
   * @param payload - The user ID, answers array, and optional attempt ID.
   * @returns Score, status, answer results, and optional certificate info.
   */
  submitQuiz: async (
    quizId: string,
    payload: QuizSubmitPayload
  ): Promise<QuizSubmitResponse> => {
    return request<QuizSubmitResponse>(`/api/quiz/${quizId}`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  /**
   * Fetch detailed results for a quiz attempt, including correct answers
   * and all historical attempts.
   *
   * @param quizId    - The quiz UUID.
   * @param userId    - The user UUID.
   * @param attemptId - Optional specific attempt UUID.
   * @returns Quiz metadata, attempt results, and all past attempts.
   */
  fetchQuizResults: async (
    quizId: string,
    userId: string,
    attemptId?: string
  ): Promise<QuizResultsResponse> => {
    const qs = new URLSearchParams({ userId });
    if (attemptId) qs.set("attemptId", attemptId);
    return request<QuizResultsResponse>(`/api/quiz/${quizId}/result?${qs.toString()}`);
  },
};
