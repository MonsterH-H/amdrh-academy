/**
 * @module services/admin
 * @description Admin-only service — users, courses, quizzes, certificates, learning paths,
 * notifications, analytics, traceability, enrollments, and resources management.
 */

import { request } from "./auth.service";
import type {
  Pagination,
  AdminUser,
  FetchUsersParams,
  AdminCertificate,
  CertificateStats,
  AdminQuiz,
  AdminLearningPath,
  AdminNotification,
  NotificationStats,
  TraceabilityItem,
  TraceabilityStats,
  Resource,
  ResourceStats,
  AdminStatsOverview,
  DashboardResponse,
  AdminEnrollment,
} from "./admin.types";

// Re-export types so existing consumers (e.g. barrel index.ts) continue to work.
export type {
  Pagination,
  AdminUser,
  FetchUsersParams,
  AdminCertificate,
  CertificateStats,
  AdminQuiz,
  AdminLearningPath,
  AdminNotification,
  NotificationStats,
  TraceabilityItem,
  TraceabilityStats,
  Resource,
  ResourceStats,
  AdminStatsOverview,
  DashboardResponse,
  AdminEnrollment,
} from "./admin.types";

// ─────────────────────────────────────────────────────────────
// Service
// ─────────────────────────────────────────────────────────────

export const adminService = {
  // ── Users ──────────────────────────────────────────────

  /** Fetch paginated users with role, status, and search filters. */
  fetchUsers: async (
    params: FetchUsersParams = {}
  ): Promise<{ users: AdminUser[]; pagination: Pagination }> => {
    const qs = new URLSearchParams();
    if (params.role && params.role !== "ALL") qs.set("role", params.role);
    if (params.status) qs.set("status", params.status);
    if (params.search) qs.set("search", params.search);
    if (params.page) qs.set("page", String(params.page));
    if (params.limit) qs.set("limit", String(params.limit));
    return request<{ users: AdminUser[]; pagination: Pagination }>(
      `/api/users?${qs.toString()}`
    );
  },

  // ── Dashboard ──────────────────────────────────────────

  /** Fetch role-specific dashboard data. */
  fetchDashboard: async (
    userId: string,
    role: string
  ): Promise<DashboardResponse> => {
    return request<DashboardResponse>(
      `/api/dashboard?userId=${userId}&role=${role}`
    );
  },

  /** Fetch platform-wide analytics (admin only). */
  fetchAdminStats: async (
    period?: string
  ): Promise<{
    overview: AdminStatsOverview;
    usersByRole: Array<{ role: string; _count: { role: number } }>;
    usersByMonth: Array<{ month: string; count: number }>;
    enrollmentsByMonth: Array<{ month: string; count: number }>;
    certificatesByMonth: Array<{ month: string; count: number }>;
    coursesByCategory: Array<{ category: string; _count: { category: number } }>;
  }> => {
    const qs = period ? `?period=${period}` : "";
    return request(`/api/stats${qs}`);
  },

  // ── Courses ────────────────────────────────────────────

  /** Admin: fetch courses with stats (used by admin-courses view). */
  fetchAdminCourses: (params: Record<string, unknown> = {}) =>
    // Reuses the public courses endpoint with admin=true
    request(`/api/courses?${new URLSearchParams(
      Object.fromEntries(Object.entries(params).map(([k, v]) => [k, String(v)]))
    ).toString()}`),

  // ── Quizzes ────────────────────────────────────────────

  /** Fetch admin quiz list with pass-rate stats. */
  fetchQuizzes: async (params: {
    search?: string;
    courseId?: string;
    role?: string;
    instructorId?: string;
    page?: number;
    limit?: number;
  } = {}): Promise<{
    quizzes: AdminQuiz[];
    courses: Array<{ id: string; title: string; category: string }>;
    pagination: Pagination;
  }> => {
    const qs = new URLSearchParams();
    if (params.search) qs.set("search", params.search);
    if (params.courseId) qs.set("courseId", params.courseId);
    if (params.role) qs.set("role", params.role);
    if (params.instructorId) qs.set("instructorId", params.instructorId);
    if (params.page) qs.set("page", String(params.page));
    if (params.limit) qs.set("limit", String(params.limit));
    return request(`/api/admin/quizzes?${qs.toString()}`);
  },

  /** Create a new quiz for a course. */
  createQuiz: async (data: {
    title: string;
    courseId: string;
    description?: string;
    duration?: number;
    passingScore?: number;
    shuffleQuestions?: boolean;
    showAnswers?: boolean;
    maxAttempts?: number;
  }): Promise<{ quiz: unknown }> => {
    return request("/api/admin/quizzes", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  /** Get a single quiz with full details and attempt stats. */
  fetchQuizDetail: async (quizId: string): Promise<{ quiz: AdminQuiz & { totalPoints: number } }> => {
    return request(`/api/admin/quizzes/${quizId}`);
  },

  /** Update a quiz's settings. */
  updateQuiz: async (
    quizId: string,
    data: Partial<{
      title: string;
      description: string;
      duration: number;
      passingScore: number;
      shuffleQuestions: boolean;
      showAnswers: boolean;
      maxAttempts: number;
    }>
  ): Promise<{ quiz: unknown }> => {
    return request(`/api/admin/quizzes/${quizId}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },

  /** Delete a quiz and all associated data. */
  deleteQuiz: async (quizId: string): Promise<{ success: boolean }> => {
    return request(`/api/admin/quizzes/${quizId}`, { method: "DELETE" });
  },

  // ── Certificates ───────────────────────────────────────

  /** Fetch all certificates with pagination, search, and date range filters. */
  fetchCertificates: async (params: {
    search?: string;
    dateFrom?: string;
    dateTo?: string;
    page?: number;
    limit?: number;
  } = {}): Promise<{
    certificates: AdminCertificate[];
    pagination: Pagination;
    stats: CertificateStats;
  }> => {
    const qs = new URLSearchParams();
    if (params.search) qs.set("search", params.search);
    if (params.dateFrom) qs.set("dateFrom", params.dateFrom);
    if (params.dateTo) qs.set("dateTo", params.dateTo);
    if (params.page) qs.set("page", String(params.page));
    if (params.limit) qs.set("limit", String(params.limit));
    return request(`/api/admin/certificates?${qs.toString()}`);
  },

  /** Manually create a certificate. */
  createCertificate: async (data: {
    userId: string;
    courseId: string;
    score: number;
    maxScore: number;
    expiryDate?: string;
    type?: string;
  }): Promise<{ certificate: AdminCertificate }> => {
    return request("/api/admin/certificates", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  /** Revoke, suspend, or reactivate a certificate. */
  updateCertificateStatus: async (
    certificateId: string,
    status: "ACTIVE" | "REVOKED" | "SUSPENDED",
    revokeReason?: string
  ): Promise<{ certificate: AdminCertificate }> => {
    return request(`/api/admin/certificates/${certificateId}`, {
      method: "PATCH",
      body: JSON.stringify({ status, revokeReason }),
    });
  },

  /** Bulk-issue certificates to multiple users for a course. */
  bulkIssueCertificates: async (data: {
    courseId: string;
    userIds: string[];
    type?: string;
  }): Promise<{
    results: Array<{ userId: string; success: boolean; code?: string; error?: string }>;
    summary: { total: number; succeeded: number; failed: number };
  }> => {
    return request("/api/admin/certificates/bulk-issue", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  // ── Learning Paths ─────────────────────────────────────

  /** Fetch all learning paths with admin stats. */
  fetchLearningPaths: async (params: {
    targetRole?: string;
    page?: number;
    limit?: number;
  } = {}): Promise<{
    paths: AdminLearningPath[];
    pagination: Pagination;
  }> => {
    const qs = new URLSearchParams();
    if (params.targetRole) qs.set("targetRole", params.targetRole);
    if (params.page) qs.set("page", String(params.page));
    if (params.limit) qs.set("limit", String(params.limit));
    return request(`/api/admin/learning-paths?${qs.toString()}`);
  },

  /** Create a new learning path. */
  createLearningPath: async (data: {
    title: string;
    description: string;
    targetRole: string;
    mode?: string;
    isMandatory?: boolean;
    courses?: Array<{ courseId: string; order?: number; isRequired?: boolean; minScore?: number }>;
  }): Promise<AdminLearningPath> => {
    return request("/api/admin/learning-paths", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  /** Update a learning path's metadata and/or course associations. */
  updateLearningPath: async (
    pathId: string,
    data: Partial<{
      title: string;
      description: string;
      targetRole: string;
      mode: string;
      isMandatory: boolean;
      order: number;
      courses: Array<{ courseId: string; order?: number; isRequired?: boolean; minScore?: number }>;
    }>
  ): Promise<AdminLearningPath> => {
    return request(`/api/admin/learning-paths/${pathId}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },

  /** Delete a learning path and all its enrollments. */
  deleteLearningPath: async (
    pathId: string
  ): Promise<{ message: string; deletedEnrollments: number }> => {
    return request(`/api/admin/learning-paths/${pathId}`, { method: "DELETE" });
  },

  // ── Notifications ──────────────────────────────────────

  /** Fetch all notifications (admin) with stats. */
  fetchNotifications: async (params: {
    type?: string;
    search?: string;
    page?: number;
    limit?: number;
  } = {}): Promise<{
    stats: NotificationStats;
    notifications: AdminNotification[];
    pagination: Pagination;
  }> => {
    const qs = new URLSearchParams();
    if (params.type) qs.set("type", params.type);
    if (params.search) qs.set("search", params.search);
    if (params.page) qs.set("page", String(params.page));
    if (params.limit) qs.set("limit", String(params.limit));
    return request(`/api/admin/notifications?${qs.toString()}`);
  },

  /** Send a notification to a specific user, role group, or all users. */
  sendNotification: async (data: {
    title: string;
    message: string;
    type: string;
    targetAll?: boolean;
    targetRoles?: string[];
    userId?: string;
  }): Promise<{ count: number; message: string }> => {
    return request("/api/admin/notifications", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  // ── Traceability ───────────────────────────────────────

  /** Fetch learner traceability data with detailed lesson progress. */
  fetchTraceability: async (params: {
    search?: string;
    courseId?: string;
    status?: string;
    page?: number;
    limit?: number;
    includeDetails?: boolean;
  } = {}): Promise<{
    enrollments: TraceabilityItem[];
    pagination: Pagination;
    stats: TraceabilityStats;
  }> => {
    const qs = new URLSearchParams();
    if (params.search) qs.set("search", params.search);
    if (params.courseId) qs.set("courseId", params.courseId);
    if (params.status && params.status !== "all") qs.set("status", params.status);
    if (params.page) qs.set("page", String(params.page));
    if (params.limit) qs.set("limit", String(params.limit));
    if (params.includeDetails) qs.set("includeDetails", "true");
    return request(`/api/admin/traceability?${qs.toString()}`);
  },

  // ── Enrollments ────────────────────────────────────────

  /** Fetch recent enrollments across all courses. */
  fetchEnrollments: async (
    limit = 20
  ): Promise<{ enrollments: AdminEnrollment[] }> => {
    return request(`/api/admin/enrollments?limit=${limit}`);
  },

  // ── Resources ──────────────────────────────────────────

  /** Fetch resources with filters. */
  fetchResources: async (params: {
    courseId?: string;
    type?: string;
    category?: string;
    search?: string;
    uploadedById?: string;
    page?: number;
    limit?: number;
  } = {}): Promise<{
    resources: Resource[];
    total: number;
    pagination: Pagination;
    stats: ResourceStats;
  }> => {
    const qs = new URLSearchParams();
    if (params.courseId) qs.set("courseId", params.courseId);
    if (params.type) qs.set("type", params.type);
    if (params.category) qs.set("category", params.category);
    if (params.search) qs.set("search", params.search);
    if (params.uploadedById) qs.set("uploadedById", params.uploadedById);
    if (params.page) qs.set("page", String(params.page));
    if (params.limit) qs.set("limit", String(params.limit));
    return request(`/api/resources?${qs.toString()}`);
  },

  /** Fetch a single resource by ID. */
  fetchResource: async (resourceId: string): Promise<{ resource: Resource }> => {
    return request(`/api/resources/${resourceId}`);
  },

  /** Update resource metadata. */
  updateResource: async (
    resourceId: string,
    data: Partial<{
      title: string;
      description: string;
      category: string;
      isDownloadable: boolean;
      courseId: string;
      sectionId: string;
      lessonId: string;
      order: number;
    }>
  ): Promise<{ resource: Resource }> => {
    return request(`/api/resources/${resourceId}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },

  /** Delete a resource (and its physical file if local). */
  deleteResource: async (
    resourceId: string
  ): Promise<{ message: string }> => {
    return request(`/api/resources/${resourceId}`, { method: "DELETE" });
  },
};
