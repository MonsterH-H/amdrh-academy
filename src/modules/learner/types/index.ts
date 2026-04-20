// ─── Types ────────────────────────────────────────────────────────────────────

export interface EnrollmentData {
  id: string;
  progress: number;
  status: string;
  startedAt: string;
  completedAt: string | null;
}

export interface CourseData {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  duration: number;
  isCertifying: boolean;
  enrollments: EnrollmentData[];
  sections: Array<{
    id: string;
    title: string;
    order: number;
    lessons: Array<{
      id: string;
      title: string;
      type: string;
      duration: number;
      order: number;
    }>;
  }>;
  quiz: { id: string; passingScore: number } | null;
}

export interface CourseProgressDetail {
  enrollment: EnrollmentData & { id: string };
  lessons: Array<{
    id: string;
    title: string;
    type: string;
    duration: number;
    completed: boolean;
    timeSpent: number;
    watchPercentage: number;
    scrollPercentage: number;
    completionTrigger: string;
    completedAt: string | null;
    viewedAt: string | null;
  }>;
  totalTimeSpent: number;
  completedLessons?: number;
  totalLessons?: number;
}

export interface QuizAttemptData {
  id: string;
  score: number;
  maxScore: number;
  status: string;
  duration: number;
  submittedAt: string;
  quizTitle?: string;
  courseTitle?: string;
  courseId?: string;
}

export interface CertificateData {
  id: string;
  code: string;
  courseTitle: string;
  score: number;
  maxScore: number;
  issuedAt: string;
  status: string;
}
