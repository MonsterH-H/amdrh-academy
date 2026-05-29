/**
 * @module services/courses
 * @description Course-related API service — listing, detail, enrollment, progress, and creation.
 */

import type { User } from "@/store/app";
import { request } from "./auth.service";

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

/** A single lesson summary within a section. */
export interface LessonSummary {
  id: string;
  title: string;
  type: string;
  duration: number;
  order: number;
}

/** A course section containing ordered lessons. */
export interface CourseSection {
  id: string;
  title: string;
  order: number;
  lessons: LessonSummary[];
}

/** Full course object returned by the list endpoints. */
export interface Course {
  id: string;
  title: string;
  slug: string;
  description: string;
  category: string;
  difficulty: string;
  duration: number;
  status: string;
  isCertifying: boolean;
  passingScore: number;
  maxAttempts: number;
  coverImage?: string | null;
  instructorId: string;
  instructor: Pick<User, "id" | "nom" | "prenom" | "avatar"> & { bio?: string | null };
  sections: CourseSection[];
  quiz?: { id: string; passingScore: number } | null;
  _count?: { enrollments: number; sections: number };
  enrollments?: EnrollmentSummary[];
}

/** Enrollment summary attached to a course when `userId` is provided. */
export interface EnrollmentSummary {
  id: string;
  progress: number;
  status: string;
  startedAt: string;
  completedAt: string | null;
  lastAccessAt: string;
}

/** Pagination metadata. */
export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/** Admin-only course stats. */
export interface CourseStats {
  total: number;
  published: number;
  drafts: number;
  archived: number;
}

/** Query parameters for fetching course lists. */
export interface FetchCoursesParams {
  category?: string;
  difficulty?: string;
  search?: string;
  userId?: string;
  status?: string;
  admin?: boolean;
  enrolled?: boolean;
  role?: string;
  instructorId?: string;
  page?: number;
  limit?: number;
}

/** Response from the course list endpoint. */
interface CoursesListResponse {
  courses: Course[];
  pagination: Pagination;
  stats?: CourseStats;
}

/** Lesson progress for the detail/progress view. */
export interface LessonProgressItem {
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
}

/** Response from the course progress endpoint (GET). */
export interface CourseProgressResponse {
  enrollment: {
    id: string;
    progress: number;
    status: string;
    startedAt: string;
    completedAt: string | null;
  };
  lessons: LessonProgressItem[];
  totalTimeSpent: number;
  completedLessons: number;
  totalLessons: number;
}

/** Response from the progress update endpoint (POST). */
export interface UpdateProgressResponse {
  progress: unknown;
  enrollmentProgress: number;
  autoCompleted: boolean;
  autoTrigger: string | null;
}

/** Payload for updating lesson progress. */
export interface UpdateProgressPayload {
  userId: string;
  lessonId: string;
  completed?: boolean;
  lastPosition?: number;
  timeSpent?: number;
  watchPercentage?: number;
  scrollPercentage?: number;
  completionTrigger?: string;
}

// ─────────────────────────────────────────────────────────────
// Service
// ─────────────────────────────────────────────────────────────

export const coursesService = {
  /**
   * Fetch a paginated list of courses with optional filters.
   *
   * @param params - Query parameters for filtering and pagination.
   * @returns Courses array with pagination metadata and optional admin stats.
   */
  fetchCourses: async (
    params: FetchCoursesParams = {}
  ): Promise<CoursesListResponse> => {
    const qs = new URLSearchParams();
    if (params.category && params.category !== "ALL") qs.set("category", params.category);
    if (params.difficulty && params.difficulty !== "ALL") qs.set("difficulty", params.difficulty);
    if (params.search) qs.set("search", params.search);
    if (params.userId) qs.set("userId", params.userId);
    if (params.status && params.status !== "ALL") qs.set("status", params.status);
    if (params.admin) qs.set("admin", "true");
    if (params.enrolled) qs.set("enrolled", "true");
    if (params.role) qs.set("role", params.role);
    if (params.instructorId) qs.set("instructorId", params.instructorId);
    if (params.page) qs.set("page", String(params.page));
    if (params.limit) qs.set("limit", String(params.limit));
    return request<CoursesListResponse>(`/api/courses?${qs.toString()}`);
  },

  /**
   * Fetch full details for a single course.
   *
   * @param courseId - The course UUID.
   * @param userId   - Optional user ID to include enrollment data.
   * @returns The course object with sections, lessons, quiz, and optional enrollment.
   */
  fetchCourseDetail: async (
    courseId: string,
    userId?: string
  ): Promise<{ course: Course; enrollment: unknown }> => {
    const qs = userId ? `?userId=${userId}` : "";
    return request<{ course: Course; enrollment: unknown }>(`/api/courses/${courseId}${qs}`);
  },

  /**
   * Enroll the current user in a course.
   *
   * @param courseId - The course UUID.
   * @param userId   - The user UUID.
   * @returns The created enrollment record.
   */
  enrollInCourse: async (
    courseId: string,
    userId: string
  ): Promise<{ enrollment: unknown }> => {
    return request<{ enrollment: unknown }>(`/api/courses/${courseId}/enroll`, {
      method: "POST",
      body: JSON.stringify({ userId }),
    });
  },

  /**
   * Fetch course progress (lesson-level details) for an enrolled user.
   *
   * @param courseId - The course UUID.
   * @param userId   - The user UUID.
   * @returns Enrollment info, per-lesson progress, and aggregate stats.
   */
  fetchProgress: async (
    courseId: string,
    userId: string
  ): Promise<CourseProgressResponse> => {
    return request<CourseProgressResponse>(
      `/api/courses/${courseId}/progress?userId=${userId}`
    );
  },

  /**
   * Update lesson progress (time spent, completion, watch %, etc.).
   *
   * @param courseId - The course UUID.
   * @param payload  - Progress update payload.
   * @returns Updated progress data and auto-completion info.
   */
  updateProgress: async (
    courseId: string,
    payload: UpdateProgressPayload
  ): Promise<UpdateProgressResponse> => {
    return request<UpdateProgressResponse>(`/api/courses/${courseId}/progress`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  /**
   * Create a new course (admin/formateur only).
   *
   * @param data - Full course creation payload matching `courseCreateSchema`.
   * @returns The created course with sections and lessons.
   */
  createCourse: async (data: Record<string, unknown>): Promise<{ course: Course }> => {
    return request<{ course: Course }>("/api/courses", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  /**
   * Update an existing course's metadata.
   *
   * @param courseId - The course UUID.
   * @param data     - Partial update fields (title, description, status, etc.).
   * @returns The updated course object.
   */
  updateCourse: async (
    courseId: string,
    data: Record<string, unknown>
  ): Promise<{ course: Course }> => {
    return request<{ course: Course }>(`/api/courses/${courseId}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },

  /**
   * Delete a course and all associated data (sections, lessons, quiz, etc.).
   *
   * @param courseId - The course UUID.
   * @returns A confirmation message.
   */
  deleteCourse: async (courseId: string): Promise<{ message: string }> => {
    return request<{ message: string }>(`/api/courses/${courseId}`, {
      method: "DELETE",
    });
  },
};
