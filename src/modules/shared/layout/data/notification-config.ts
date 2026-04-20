import {
  Bell,
  BookOpen,
  Award,
  MessageSquare,
  HelpCircle,
  Star,
  Settings,
} from "lucide-react";

// ──────────────────────────────────────────────────────────
// Notification type → icon mapping
// ──────────────────────────────────────────────────────────

export const notificationTypeIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  COURS: BookOpen,
  CERTIFICAT: Award,
  MESSAGE: MessageSquare,
  QUIZ: HelpCircle,
  BADGE: Star,
  SYSTEME: Settings,
};

// ──────────────────────────────────────────────────────────
// Notification type → color classes
// ──────────────────────────────────────────────────────────

export const notificationTypeColors: Record<string, string> = {
  COURS: "bg-blue-100 text-blue-600",
  CERTIFICAT: "bg-amber-100 text-amber-600",
  MESSAGE: "bg-green-100 text-green-600",
  QUIZ: "bg-purple-100 text-purple-600",
  BADGE: "bg-pink-100 text-pink-600",
  SYSTEME: "bg-gray-100 text-gray-600",
};
