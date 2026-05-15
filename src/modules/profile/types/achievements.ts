/**
 * @module profile/types/achievements
 * Achievement types and definitions for the AMDRH Academy profile module.
 */

export type AchievementCategory = "cours" | "quiz" | "streak" | "social" | "special";

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string; // lucide icon name
  category: AchievementCategory;
  threshold: number;
  progress: number; // 0-100
  unlocked: boolean;
  unlockedAt?: string;
}

export interface ProfileStatsData {
  enrollments: number;
  completedEnrollments: number;
  certificates: number;
  badges: number;
  quizAttempts: number;
  // Enhanced stats
  avgScore?: number;
  totalTrainingTime?: number;
  learnerRank?: number;
  totalLearners?: number;
}

export interface CompletenessDetail {
  field: string;
  done: boolean;
  weight: number;
}

export interface ProfileCompleteness {
  percentage: number;
  details: CompletenessDetail[];
}

export interface ActivityItem {
  id: string;
  type: string;
  title: string;
  message: string;
  createdAt: string;
}

export interface ExtendedUser {
  emailVerified?: Date | string | null;
  createdAt?: Date | string | null;
}

export interface ProfileApiResponse {
  user: Record<string, unknown>;
  stats: ProfileStatsData;
  completeness: ProfileCompleteness;
  recentActivity: ActivityItem[];
  achievements: Achievement[];
}
