export interface LearningPath {
  id: string;
  title: string;
  description: string;
  targetRole: string;
  isMandatory: boolean;
  mode: LearningPathMode;
  totalDuration: number;
  courseCount: number;
  courses: LearningPathCourse[];
  enrollments?: LearningPathEnrollment[];
}

export type LearningPathMode = "SEQUENTIEL" | "LIBRE" | "LOCK_STEP";

export interface LearningPathCourse {
  id: string;
  order: number;
  learningPathId: string;
  courseId: string;
  course: {
    id: string;
    title: string;
    category: string;
    difficulty: string;
    duration: number;
    coverImage: string | null;
    instructor?: { nom: string; prenom: string } | null;
  };
}

export interface LearningPathEnrollment {
  id: string;
  progress: number;
  status: string;
  currentCourseOrder: number;
  startedAt: string;
  completedAt: string | null;
  userId: string;
  learningPathId: string;
}
