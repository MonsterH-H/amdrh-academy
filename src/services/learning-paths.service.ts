/**
 * @module services/learning-paths
 * @description Learning paths service — fetching paths and enrolling users.
 */

import { request } from "./auth.service";

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

/** A course summary within a learning path. */
export interface LearningPathCourse {
  id: string;
  course: {
    id: string;
    title: string;
    category: string;
    difficulty: string;
    coverImage?: string | null;
    duration: number;
    instructor?: { nom: string; prenom: string } | null;
  };
}

/** Enrollment data attached to a learning path. */
export interface LearningPathEnrollment {
  id: string;
  progress: number;
  status: string;
  currentCourseOrder: number;
  startedAt: string;
  completedAt: string | null;
}

/** A learning path with computed fields. */
export interface LearningPath {
  id: string;
  title: string;
  slug: string;
  description: string;
  targetRole: string;
  mode: string;
  isMandatory: boolean;
  order: number;
  courses: LearningPathCourse[];
  enrollments?: LearningPathEnrollment[];
  totalDuration: number;
  courseCount: number;
}

/** Enrollment response. */
export interface LearningPathEnrollmentResponse {
  enrollment: {
    id: string;
    userId: string;
    learningPathId: string;
    status: string;
    progress: number;
    currentCourseOrder: number;
    startedAt: string;
  };
}

// ─────────────────────────────────────────────────────────────
// Service
// ─────────────────────────────────────────────────────────────

export const learningPathsService = {
  /**
   * Fetch learning paths, optionally filtered by user role.
   * If `userId` is provided, includes the user's enrollment data.
   *
   * @param userId - Optional user UUID for enrollment data.
   * @param role   - Optional role filter (non-ADMIN only).
   * @returns Array of learning paths with computed duration and course count.
   */
  fetchLearningPaths: async (
    userId?: string,
    role?: string
  ): Promise<{ paths: LearningPath[] }> => {
    const qs = new URLSearchParams();
    if (userId) qs.set("userId", userId);
    if (role && role !== "ADMIN") qs.set("role", role);
    return request<{ paths: LearningPath[] }>(
      `/api/learning-paths?${qs.toString()}`
    );
  },

  /**
   * Enroll a user in a learning path.
   *
   * @param userId          - The user UUID.
   * @param learningPathId  - The learning path UUID.
   * @returns The created enrollment record.
   */
  enrollInPath: async (
    userId: string,
    learningPathId: string
  ): Promise<LearningPathEnrollmentResponse> => {
    return request<LearningPathEnrollmentResponse>("/api/learning-paths", {
      method: "POST",
      body: JSON.stringify({ userId, learningPathId }),
    });
  },
};
