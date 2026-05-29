/**
 * @module services/profile
 * @description Profile service — fetching/updating user profile, changing password, and profile stats.
 */

import type { User } from "@/store/app";
import { request } from "./auth.service";

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

/** Payload for updating the user profile. */
export interface UpdateProfilePayload {
  userId: string;
  prenom: string;
  nom: string;
  telephone?: string;
  club?: string;
  region?: string;
  bio?: string;
}

/** Payload for changing the password. */
export interface ChangePasswordPayload {
  userId: string;
  currentPassword: string;
  newPassword: string;
}

/** Profile completeness details. */
export interface CompletenessDetail {
  field: string;
  done: boolean;
  weight: number;
}

/** Profile stats response. */
export interface ProfileStatsResponse {
  user: User;
  stats: {
    enrollments: number;
    completedEnrollments: number;
    certificates: number;
    badges: number;
    quizAttempts: number;
  };
  completeness: {
    percentage: number;
    details: CompletenessDetail[];
  };
  recentActivity: Array<{
    id: string;
    type: string;
    title: string;
    message: string;
    createdAt: string;
  }>;
}

// ─────────────────────────────────────────────────────────────
// Service
// ─────────────────────────────────────────────────────────────

export const profileService = {
  /**
   * Fetch full profile statistics including enrollment counts, certificates,
   * badges, profile completeness, and recent activity.
   *
   * @param userId - The user UUID.
   * @returns User data, aggregated stats, completeness info, and recent notifications.
   */
  fetchProfileStats: async (userId: string): Promise<ProfileStatsResponse> => {
    return request<ProfileStatsResponse>(`/api/profile/stats?userId=${userId}`);
  },

  /**
   * Update the user's profile information.
   *
   * @param data - Profile update payload (userId, prenom, nom, etc.).
   * @returns The updated user object.
   */
  updateProfile: async (data: UpdateProfilePayload): Promise<{ user: User }> => {
    return request<{ user: User }>("/api/profile", {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  /**
   * Change the user's password after verifying the current one.
   *
   * @param data - Password change payload (userId, currentPassword, newPassword).
   * @returns A success flag.
   */
  changePassword: async (
    data: ChangePasswordPayload
  ): Promise<{ success: boolean }> => {
    return request<{ success: boolean }>("/api/profile/password", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
};
