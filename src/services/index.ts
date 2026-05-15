/**
 * @module services/index
 * @description Barrel re-export for all service modules.
 *
 * @example
 * ```ts
 * import { authService, coursesService, adminService } from "@/services";
 * ```
 */

export { authService, ApiServiceError, request } from "./auth.service";
export type {
  RegisterPayload,
  LoginResponse,
  RegisterResponse,
  ForgotPasswordResponse,
  ResetPasswordResponse,
} from "./auth.service";

export { coursesService } from "./courses.service";
export type {
  Course,
  CourseSection,
  LessonSummary,
  EnrollmentSummary,
  Pagination,
  CourseStats,
  FetchCoursesParams,
  CourseProgressResponse,
  UpdateProgressResponse,
  UpdateProgressPayload,
} from "./courses.service";

export { quizService } from "./quiz.service";
export type {
  Quiz,
  QuizQuestion,
  QuizAnswer,
  QuizAnswerResult,
  QuizSubmitResponse,
  QuizResultsResponse,
  QuizResultDetail,
  QuizAttemptSummary,
  QuizSubmitPayload,
  CertificateInfo,
} from "./quiz.service";

export { certificatesService } from "./certificates.service";
export type {
  Certificate,
  VerifyCertificateResponse,
} from "./certificates.service";

export { messagesService } from "./messages.service";
export type {
  Conversation,
  Message,
  MessageUser,
} from "./messages.service";

export { notificationsService } from "./notifications.service";
export type {
  Notification,
  NotificationsResponse,
} from "./notifications.service";

export { profileService } from "./profile.service";
export type {
  UpdateProfilePayload,
  ChangePasswordPayload,
  ProfileStatsResponse,
  CompletenessDetail,
} from "./profile.service";

export { adminService } from "./admin.service";

export type {
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

export { learningPathsService } from "./learning-paths.service";
export type {
  LearningPath,
  LearningPathCourse,
  LearningPathEnrollment,
  LearningPathEnrollmentResponse,
} from "./learning-paths.service";
