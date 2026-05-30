"use client";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface StatsOverview {
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

export interface RoleData {
  role: string;
  _count: { role: number };
}

export interface MonthData {
  month: string;
  count: number;
}

export interface CategoryData {
  category: string;
  _count: { category: number };
}

export interface StatsData {
  overview: StatsOverview;
  usersByRole: RoleData[];
  usersByMonth: MonthData[];
  enrollmentsByMonth: MonthData[];
  certificatesByMonth: MonthData[];
  coursesByCategory: CategoryData[];
}

// ─── Colors ──────────────────────────────────────────────────────────────────

export const ROLE_CHART_COLORS: Record<string, string> = {
  ADMIN: "#EF4444",
  FORMATEUR: "#8B5CF6",
  ARBITRE: "#06B6D4",
  ENTRAINEUR: "#2563EB",
  JOUEUR: "#F59E0B",
};

export const CATEGORY_CHART_COLORS: Record<string, string> = {
  ARBITRAGE: "#06B6D4",
  ENTRAINEMENT: "#2563EB",
  JOUEURS: "#F59E0B",
  ADMINISTRATION: "#8B5CF6",
};

const MONTH_NAMES: Record<string, string> = {
  "01": "Jan", "02": "Fév", "03": "Mar", "04": "Avr",
  "05": "Mai", "06": "Juin", "07": "Juil", "08": "Août",
  "09": "Sep", "10": "Oct", "11": "Nov", "12": "Déc",
};

export const PERIODS = [
  { value: "7", label: "7 jours", shortLabel: "7j" },
  { value: "30", label: "30 jours", shortLabel: "30j" },
  { value: "90", label: "90 jours", shortLabel: "90j" },
  { value: "all", label: "Tout le temps", shortLabel: "Tout" },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

export function formatMonth(monthKey: string): string {
  const parts = monthKey.split("-");
  if (parts.length === 2) return MONTH_NAMES[parts[1]] || monthKey;
  return monthKey;
}

export function formatMonthFull(monthKey: string): string {
  const parts = monthKey.split("-");
  if (parts.length === 2) return `${MONTH_NAMES[parts[1]] || monthKey} ${parts[0]}`;
  return monthKey;
}

export const tooltipStyle = {
  borderRadius: "8px",
  border: "1px solid var(--border)",
  fontSize: "12px",
  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
};
