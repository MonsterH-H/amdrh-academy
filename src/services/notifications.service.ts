/**
 * @module services/notifications
 * @description Notification service — fetching, marking read, and creating notifications.
 */

import { request } from "./auth.service";

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

/** A notification record. */
export interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  link?: string | null;
  isRead: boolean;
  createdAt: string;
}

/** Response from the notification list endpoint. */
export interface NotificationsResponse {
  notifications: Notification[];
  unreadCount: number;
}

// ─────────────────────────────────────────────────────────────
// Service
// ─────────────────────────────────────────────────────────────

export const notificationsService = {
  /**
   * Fetch notifications for a user, optionally filtered by type and read status.
   *
   * @param userId    - The user UUID.
   * @param type      - Optional notification type filter.
   * @param unreadOnly - If true, only return unread notifications.
   * @returns Notifications array and the total unread count.
   */
  fetchNotifications: async (
    userId: string,
    type?: string,
    unreadOnly?: boolean
  ): Promise<NotificationsResponse> => {
    const qs = new URLSearchParams({ userId });
    if (type) qs.set("type", type);
    if (unreadOnly) qs.set("unreadOnly", "true");
    return request<NotificationsResponse>(
      `/api/notifications?${qs.toString()}`
    );
  },

  /**
   * Mark a single notification as read.
   *
   * @param notificationId - The notification UUID.
   * @returns A success flag.
   */
  markAsRead: async (
    notificationId: string
  ): Promise<{ success: boolean }> => {
    return request<{ success: boolean }>("/api/notifications", {
      method: "POST",
      body: JSON.stringify({ notificationId }),
    });
  },

  /**
   * Mark all notifications as read for a given user.
   *
   * @param userId - The user UUID.
   * @returns A success flag.
   */
  markAllRead: async (userId: string): Promise<{ success: boolean }> => {
    return request<{ success: boolean }>("/api/notifications", {
      method: "POST",
      body: JSON.stringify({ userId, markAll: true }),
    });
  },

  /**
   * Create a new notification for a user (with real-time push).
   *
   * @param userId   - Target user UUID.
   * @param title    - Notification title.
   * @param message  - Notification body.
   * @param type     - Notification type (e.g. "SYSTEME", "QUIZ", "CERTIFICAT").
   * @param link     - Optional deep-link.
   * @returns The created notification and success flag.
   */
  createNotification: async (
    userId: string,
    title: string,
    message: string,
    type: string,
    link?: string
  ): Promise<{ success: boolean; notification: Notification }> => {
    return request<{ success: boolean; notification: Notification }>(
      "/api/notifications",
      {
        method: "POST",
        body: JSON.stringify({ action: "create", userId, title, message, type, link }),
      }
    );
  },
};
