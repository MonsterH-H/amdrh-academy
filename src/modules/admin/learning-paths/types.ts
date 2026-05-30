import { ROLE_LABELS, ROLE_COLORS, DIFFICULTY_LABELS, CATEGORY_LABELS } from "@/lib/constants";

// ──────────────────────────────────────────────
// Constants
// ──────────────────────────────────────────────

export const MODE_LABELS: Record<string, string> = {
  sequentiel: "Séquentiel",
  flexible: "Flexible",
  hybride: "Hybride",
};

export const MODE_COLORS: Record<string, string> = {
  sequentiel: "bg-blue-100 text-blue-700",
  flexible: "bg-amber-100 text-amber-700",
  hybride: "bg-violet-100 text-violet-700",
};

export const ENROLLMENT_STATUS_LABELS: Record<string, string> = {
  en_cours: "En cours",
  termine: "Terminé",
};

export const ENROLLMENT_STATUS_COLORS: Record<string, string> = {
  en_cours: "bg-blue-100 text-blue-700",
  termine: "bg-green-100 text-green-700",
};

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────

export interface PathCourse {
  id: string;
  courseId: string;
  order: number;
  isRequired: boolean;
  minScore: number;
  course: {
    id: string;
    title: string;
    category: string;
    difficulty: string;
    duration: number;
    status: string;
    coverImage?: string | null;
    instructor?: { id: string; nom: string; prenom: string } | null;
  };
}

export interface PathEnrollment {
  id: string;
  progress: number;
  status: string;
  currentCourseOrder: number;
  startedAt: string;
  completedAt: string | null;
  user: {
    id: string;
    nom: string;
    prenom: string;
    email: string;
    role: string;
    avatar?: string | null;
    isActive: boolean;
  };
}

export interface LearningPathItem {
  id: string;
  title: string;
  slug: string;
  description: string;
  targetRole: string;
  mode: string;
  isMandatory: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
  courses: PathCourse[];
  totalDuration: number;
  courseCount: number;
  enrollmentCount: number;
}

export interface PublishedCourse {
  id: string;
  title: string;
  category: string;
  difficulty: string;
  duration: number;
  status: string;
}

export interface PathFormCourse {
  courseId: string;
  order: number;
  isRequired: boolean;
  minScore: number;
}

// ──────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────

export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
