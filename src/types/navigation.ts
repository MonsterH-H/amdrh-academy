export type AppView =
  | "landing"
  | "login"
  | "register"
  | "forgot-password"
  | "reset-password"
  | "dashboard"
  | "admin-dashboard"
  | "courses"
  | "course-detail"
  | "learning-paths"
  | "quiz"
  | "certificates"
  | "badges"
  | "messages"
  | "conversation"
  | "notifications"
  | "profile"
  | "admin-users"
  | "admin-user-detail"
  | "admin-courses"
  | "admin-quizzes"
  | "admin-learning-paths"
  | "admin-certificates"
  | "admin-notifications"
  | "admin-analytics"
  | "admin-sync"
  | "admin-resources"
  | "admin-traceability"
  | "admin-permissions"
  | "course-create"
  | "learner-traceability";

export interface ViewParams {
  id?: string;
  lessonId?: string;
  courseId?: string;
  quizId?: string;
  q?: string;
  tab?: string;
}
