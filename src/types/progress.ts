export interface LessonProgress {
  id: string;
  lessonId: string;
  userId: string;
  enrollmentId: string;
  completed: boolean;
  timeSpent: number;
  watchPercentage: number;
  scrollPercentage: number;
  completionTrigger: CompletionTrigger;
  lastPosition: number;
  viewedAt: string;
  completedAt: string | null;
  lesson?: {
    id: string;
    title: string;
    type: string;
    duration: number;
  };
}

export type CompletionTrigger = "auto_video" | "auto_scroll" | "auto_time" | "manual";

export interface CourseProgressDetail {
  enrollment: {
    id: string;
    progress: number;
    status: string;
    startedAt: string;
    completedAt: string | null;
  };
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
