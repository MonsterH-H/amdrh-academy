"use client";

import {
  Bell, BookOpen, Award, MessageSquare, HelpCircle, Star, Settings,
} from "lucide-react";
import {
  NOTIFICATION_TYPE_LABELS, ROLE_LABELS, ROLE_COLORS,
} from "@/lib/constants";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface NotificationWithUser {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  user: {
    id: string;
    prenom: string;
    nom: string;
    email: string;
    role: string;
    avatar: string | null;
  };
}

export interface NotificationStats {
  total: number;
  byType: Record<string, number>;
  readRate: number;
  readCount: number;
  unreadCount: number;
}

export type TargetMode = "all" | "roles" | "user";

export const NOTIFICATION_TYPES = Object.keys(NOTIFICATION_TYPE_LABELS) as Array<
  keyof typeof NOTIFICATION_TYPE_LABELS
>;

export const TYPE_COLORS: Record<string, string> = {
  COURS: "bg-blue-100 text-blue-700",
  CERTIFICAT: "bg-amber-100 text-amber-700",
  MESSAGE: "bg-green-100 text-green-700",
  QUIZ: "bg-purple-100 text-purple-700",
  BADGE: "bg-pink-100 text-pink-700",
  SYSTEME: "bg-gray-100 text-gray-700",
};

export const TYPE_ICON_MAP: Record<string, typeof Bell> = {
  COURS: BookOpen,
  CERTIFICAT: Award,
  MESSAGE: MessageSquare,
  QUIZ: HelpCircle,
  BADGE: Star,
  SYSTEME: Settings,
};

export const ROLES_FOR_TARGET = ["ADMIN", "FORMATEUR", "ARBITRE", "ENTRAINEUR", "JOUEUR"] as const;

// ─── Helpers ─────────────────────────────────────────────────────────────────

export function getBadgeBg(t: string): string {
  const map: Record<string, string> = {
    COURS: "#3b82f6", CERTIFICAT: "#f59e0b", MESSAGE: "#22c55e",
    QUIZ: "#a855f7", BADGE: "#ec4899", SYSTEME: "#6b7280",
  };
  return map[t] || "#6b7280";
}

export function getBarColor(t: string): string {
  const map: Record<string, string> = {
    COURS: "bg-blue-500", CERTIFICAT: "bg-amber-500", MESSAGE: "bg-green-500",
    QUIZ: "bg-purple-500", BADGE: "bg-pink-500", SYSTEME: "bg-gray-500",
  };
  return map[t] || "bg-gray-500";
}

export { ROLE_LABELS, ROLE_COLORS, NOTIFICATION_TYPE_LABELS };
