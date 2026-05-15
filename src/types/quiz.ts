export interface Quiz {
  id: string;
  title: string;
  description: string | null;
  duration: number;
  passingScore: number;
  shuffleQuestions: boolean;
  showAnswers: boolean;
  maxAttempts: number;
  courseId: string;
  course: {
    id: string;
    title: string;
    isCertifying: boolean;
  };
  questions: Question[];
}

export interface Question {
  id: string;
  text: string;
  type: QuestionType;
  options: string;
  points: number;
  order: number;
}

export type QuestionType = "QCM_SIMPLE" | "QCM_MULTIPLE" | "VRAI_FAUX";

export interface QuizAttempt {
  id: string;
  score: number;
  maxScore: number;
  status: QuizAttemptStatus;
  duration: number;
  submittedAt: string;
  quizId?: string;
  userId?: string;
  quizTitle?: string;
  courseTitle?: string;
  courseId?: string;
}

export type QuizAttemptStatus = "REUSSI" | "ECHOUE" | "EN_COURS";

export interface QuizResult {
  attemptId: string;
  score: number;
  maxScore: number;
  scorePercentage: number;
  status: string;
  answers: QuizResultAnswer[];
  certificate?: CertificateInfo;
  enrollmentCompleted?: boolean;
  attemptsRemaining?: number;
  remainingLessons?: number;
}

export interface QuizResultAnswer {
  questionId: string;
  isCorrect: boolean;
  pointsEarned: number;
  correctAnswer: number[];
}

export interface CertificateInfo {
  code: string;
  type: string;
  courseTitle: string;
}
