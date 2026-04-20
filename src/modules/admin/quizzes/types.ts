export interface QuizStats {
  passRate: number;
  avgScore: number;
  submittedCount: number;
}

export interface QuizItem {
  id: string;
  title: string;
  description: string | null;
  courseId: string;
  duration: number;
  passingScore: number;
  shuffleQuestions: boolean;
  showAnswers: boolean;
  maxAttempts: number;
  createdAt: string;
  course: { title: string; category: string; slug?: string };
  questionCount: number;
  attemptCount: number;
  stats: QuizStats;
}

export interface QuestionItem {
  id: string;
  quizId: string;
  text: string;
  type: string;
  options: string;
  correctAnswer: string;
  explanation: string | null;
  points: number;
  order: number;
}

export interface CourseOption {
  id: string;
  title: string;
  category: string;
}
