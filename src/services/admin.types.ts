/**
 * @module services/admin.types
 * @description Type definitions for the Admin service — covers users, courses, quizzes,
 * certificates, learning paths, notifications, analytics, traceability, enrollments,
 * and resources management.
 */

// ─────────────────────────────────────────────────────────────
// Generic types
// ─────────────────────────────────────────────────────────────

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// ─────────────────────────────────────────────────────────────
// Admin: Users
// ─────────────────────────────────────────────────────────────

export interface AdminUser {
  id: string;
  email: string;
  nom: string;
  prenom: string;
  role: string;
  avatar?: string | null;
  telephone?: string | null;
  club?: string | null;
  region?: string | null;
  licenceNumber?: string | null;
  isActive: boolean;
  lastLoginAt?: string | null;
  createdAt: string;
  _count: { enrollments: number; certificates: number };
}

export interface FetchUsersParams {
  role?: string;
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}

// ─────────────────────────────────────────────────────────────
// Admin: Certificates
// ─────────────────────────────────────────────────────────────

export interface AdminCertificate {
  id: string;
  code: string;
  type: string;
  status: string;
  userId: string;
  courseId: string;
  courseTitle: string;
  userName: string;
  score: number;
  maxScore: number;
  issuedAt: string;
  expiresAt?: string | null;
  revokedAt?: string | null;
  revokeReason?: string | null;
  user?: Pick<AdminUser, "id" | "nom" | "prenom" | "email" | "role">;
}

export interface CertificateStats {
  total: number;
  thisMonth: number;
  valid: number;
  expired: number;
}

// ─────────────────────────────────────────────────────────────
// Admin: Quizzes
// ─────────────────────────────────────────────────────────────

export interface AdminQuiz {
  id: string;
  title: string;
  description?: string | null;
  courseId: string;
  duration: number;
  passingScore: number;
  shuffleQuestions: boolean;
  showAnswers: boolean;
  maxAttempts: number;
  createdAt: string;
  course: { title: string; category: string; slug: string; instructorId: string };
  questionCount: number;
  attemptCount: number;
  stats: { passRate: number; avgScore: number; submittedCount: number };
}

// ─────────────────────────────────────────────────────────────
// Admin: Learning Paths
// ─────────────────────────────────────────────────────────────

export interface AdminLearningPath {
  id: string;
  title: string;
  slug: string;
  description: string;
  targetRole: string;
  mode: string;
  isMandatory: boolean;
  order: number;
  totalDuration: number;
  courseCount: number;
  enrollmentCount: number;
  courses: Array<{
    course: {
      id: string;
      title: string;
      category: string;
      difficulty: string;
      duration: number;
      status?: string;
      coverImage?: string | null;
      instructor?: Pick<AdminUser, "id" | "nom" | "prenom"> | null;
    };
  }>;
  enrollments?: unknown[];
}

// ─────────────────────────────────────────────────────────────
// Admin: Notifications
// ─────────────────────────────────────────────────────────────

export interface AdminNotification {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  link?: string | null;
  isRead: boolean;
  createdAt: string;
  user?: Pick<AdminUser, "id" | "prenom" | "nom" | "email" | "role" | "avatar">;
}

export interface NotificationStats {
  total: number;
  byType: Record<string, number>;
  readRate: number;
  readCount: number;
  unreadCount: number;
}

// ─────────────────────────────────────────────────────────────
// Admin: Traceability
// ─────────────────────────────────────────────────────────────

export interface TraceabilityItem {
  id: string;
  userId: string;
  courseId: string;
  userName: string;
  userEmail: string;
  userRole: string;
  userInitials: string;
  courseTitle: string;
  courseCategory: string;
  progress: number;
  status: string;
  completedLessons: number;
  totalLessons: number;
  totalTimeSpent: number;
  quizBestScore: string | null;
  quizStatus: string | null;
  certificateId: string | null;
  certificateCode: string | null;
  certificateStatus: string | null;
  lastAccessAt: string;
  startedAt: string;
  completedAt: string | null;
  lessonDetails: unknown[];
}

export interface TraceabilityStats {
  totalEnrolled: number;
  totalCompleted: number;
  totalAbandoned: number;
  avgCompletionRate: number;
  avgTimePerCourse: number;
}

// ─────────────────────────────────────────────────────────────
// Admin: Resources
// ─────────────────────────────────────────────────────────────

export interface Resource {
  id: string;
  title: string;
  description?: string | null;
  fileName: string;
  filePath: string;
  fileSize: number;
  fileType: string;
  mimeType?: string | null;
  category: string;
  courseId?: string | null;
  sectionId?: string | null;
  lessonId?: string | null;
  isDownloadable: boolean;
  downloadCount: number;
  order: number;
  uploadedById: string;
  uploadedBy: Pick<AdminUser, "id" | "prenom" | "nom" | "role">;
  course?: { id: string; title: string } | null;
}

export interface ResourceStats {
  totalSize: number;
  byType: Record<string, number>;
  byCategory: Record<string, number>;
}

// ─────────────────────────────────────────────────────────────
// Admin: Analytics / Dashboard
// ─────────────────────────────────────────────────────────────

export interface AdminStatsOverview {
  totalUsers: number;
  totalActiveUsers: number;
  activeDays: number;
  totalCourses: number;
  totalPublishedCourses: number;
  totalEnrollments: number;
  completedEnrollments: number;
  completionRate: number;
  totalCertificates: number;
  totalQuizAttempts: number;
  quizPassRate: number;
  quizFailRate: number;
  passedAttempts: number;
  failedAttempts: number;
  totalBadges: number;
  totalMessages: number;
}

export interface DashboardResponse {
  type: "admin" | "formateur" | "learner";
  stats: Record<string, unknown>;
  recentUsers?: AdminUser[];
  enrollmentsByMonth?: Array<{ month: string; count: number }>;
  roleDistribution?: Array<{ role: string; count: number }>;
  completionByCategory?: Array<{ category: string; completed: number }>;
  popularCourses?: Array<Record<string, unknown>>;
  myCourses?: unknown[];
  recentLearners?: unknown[];
  recentActivity?: unknown[];
  enrollments?: unknown[];
  certificates?: unknown[];
  badges?: unknown[];
  quizAttempts?: unknown[];
  recommended?: unknown[];
}

// ─────────────────────────────────────────────────────────────
// Admin: Enrollments
// ─────────────────────────────────────────────────────────────

export interface AdminEnrollment {
  id: string;
  userName: string;
  userEmail: string;
  userRole: string;
  courseTitle: string;
  status: string;
  progress: number;
  createdAt: string;
}
