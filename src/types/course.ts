export interface Course {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  duration: number;
  isCertifying: boolean;
  status: string;
  instructorId?: string;
  instructor?: {
    id: string;
    nom: string;
    prenom: string;
    avatar?: string | null;
  } | null;
  coverImage?: string | null;
  _count?: {
    enrollments: number;
  };
  enrollments?: Enrollment[];
  sections?: Section[];
  quiz?: {
    id: string;
    passingScore: number;
  } | null;
}

export interface Section {
  id: string;
  title: string;
  order: number;
  courseId: string;
  lessons?: Lesson[];
}

export interface Lesson {
  id: string;
  title: string;
  type: LessonType;
  content?: string;
  duration: number;
  order: number;
  sectionId: string;
  section?: Section;
}

export type LessonType = "VIDEO" | "PDF" | "TEXTE" | "INTERACTIF";

export interface Enrollment {
  id: string;
  progress: number;
  status: EnrollmentStatus;
  startedAt: string;
  completedAt: string | null;
  userId: string;
  courseId: string;
  course?: Course;
  lessonProgress?: LessonProgressEntry[];
}

export type EnrollmentStatus = "en_cours" | "termine" | "non_inscrit";

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
  sections: Section[];
  quiz: { id: string; passingScore: number } | null;
}

export interface LessonData {
  id: string;
  title: string;
  type: string;
  content: string;
  duration: number;
  order: number;
  sectionId: string;
}

export interface LessonProgressEntry {
  id: string;
  lessonId: string;
  completed: boolean;
  timeSpent: number;
  watchPercentage: number;
  scrollPercentage: number;
  completionTrigger: string;
  lastPosition: number;
  viewedAt: string;
  completedAt: string | null;
}
