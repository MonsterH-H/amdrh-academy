"use client";

export interface AdminKpi {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  totalCourses: number;
  publishedCourses: number;
  draftCourses: number;
  totalEnrollments: number;
  activeEnrollments: number;
  completedEnrollments: number;
  completionRate: number;
  totalCertificates: number;
  recentCertificates: number;
  totalQuizAttempts: number;
  passedQuizAttempts: number;
  quizPassRate: number;
  totalBadges: number;
  earnedBadges: number;
  totalResources: number;
  totalMessages: number;
  unreadMessages: number;
  unverifiedUsers: number;
  coursesInReview: number;
  learningPathCount: number;
  mandatoryPaths: number;
  totalAnnouncements: number;
}

export interface RoleDistribution { role: string; count: number; }
export interface MonthData { month: string; count: number; }

export interface ChartData {
  enrollmentsByMonth: MonthData[];
  usersByMonth: MonthData[];
  certificatesByMonth: MonthData[];
}

export interface RecentUser {
  id: string; nom: string; prenom: string; email: string; role: string;
  avatar: string | null; createdAt: string; lastLoginAt: string | null; isActive: boolean;
}

export interface RecentEnrollment {
  id: string;
  user: { id: string; prenom: string; nom: string; avatar: string | null; role: string };
  course: { id: string; title: string };
  startedAt: string;
}

export interface RecentQuizAttempt {
  id: string;
  user: { id: string; prenom: string; nom: string; avatar: string | null; role: string };
  quizTitle: string; courseTitle: string; score: number; status: string;
  submittedAt: string; duration: number;
}

export interface TopPerformer {
  userId: string;
  user: { id: string; prenom: string; nom: string; avatar: string | null; role: string };
  bestScore: number; quizTitle: string; courseTitle: string; achievedAt: string;
}

export interface TopCourse {
  id: string; title: string; category: string; difficulty: string;
  _count: { enrollments: number };
}

export interface PinnedAnnouncement {
  id: string; title: string; content: string; type: string; publishedAt: string;
  author: { prenom: string; nom: string };
}

export interface LastSync {
  id: string; status: string; startedAt: string; completedAt: string | null;
  totalRecords: number; processedRecords: number;
}

export interface AdminDashboardData {
  kpi: AdminKpi; charts: ChartData; usersByRole: RoleDistribution[];
  recentUsers: RecentUser[]; recentEnrollments: RecentEnrollment[];
  recentQuizAttempts: RecentQuizAttempt[]; topPerformers: TopPerformer[];
  topCourses: TopCourse[]; pinnedAnnouncements: PinnedAnnouncement[];
  lastSync: LastSync | null;
}

export const ROLE_LABELS: Record<string, string> = {
  ADMIN: "Administrateur", FORMATEUR: "Formateur", ARBITRE: "Arbitre",
  ENTRAINEUR: "Entraîneur", JOUEUR: "Joueur",
};

export const MONTH_NAMES: Record<string, string> = {
  "01": "Jan", "02": "Fév", "03": "Mar", "04": "Avr",
  "05": "Mai", "06": "Juin", "07": "Juil", "08": "Août",
  "09": "Sep", "10": "Oct", "11": "Nov", "12": "Déc",
};

export function formatMonth(key: string): string {
  const parts = key.split("-");
  return parts.length === 2 ? `${MONTH_NAMES[parts[1]] || parts[1]} ${parts[0]}` : key;
}

export function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "À l'instant";
  if (mins < 60) return `Il y a ${mins}min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `Il y a ${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `Il y a ${days}j`;
  return new Date(dateStr).toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}
