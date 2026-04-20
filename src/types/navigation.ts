export type AppView =
  | "landing"
  | "login"
  | "register"
  | "forgot-password"
  | "reset-password"
  | "dashboard"
  | "courses"
  | "course-detail"
  | "learning-paths"
  | "quiz"
  | "certificates"
  | "badges"
  | "messages"
  | "conversation"
  | "notifications"
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
  | "course-create"
  | "learner-traceability"
  | "profile";

export interface ViewParams {
  id?: string;
  lessonId?: string;
  courseId?: string;
  quizId?: string;
  [key: string]: string | undefined;
}
