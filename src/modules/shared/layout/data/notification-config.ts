import {
  Bell,
  BookOpen,
  Award,
  MessageSquare,
  HelpCircle,
  Star,
  Settings,
  AlertTriangle,
  UserPlus,
  Megaphone,
  Trophy,
  Clock,
  ShieldCheck,
  FileCheck,
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
  ALERTE: AlertTriangle,
  INSCRIPTION: UserPlus,
  ANNONCE: Megaphone,
  TROPHÉE: Trophy,
  RAPPEL: Clock,
  SÉCURITÉ: ShieldCheck,
  VALIDATION: FileCheck,
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
  ALERTE: "bg-red-100 text-red-600",
  INSCRIPTION: "bg-teal-100 text-teal-600",
  ANNONCE: "bg-indigo-100 text-indigo-600",
  TROPHÉE: "bg-yellow-100 text-yellow-700",
  RAPPEL: "bg-orange-100 text-orange-600",
  SÉCURITÉ: "bg-emerald-100 text-emerald-600",
  VALIDATION: "bg-cyan-100 text-cyan-600",
};

// ──────────────────────────────────────────────────────────
// Default fallback
// ──────────────────────────────────────────────────────────
export const defaultNotificationIcon = Bell;
export const defaultNotificationColor = "bg-muted text-muted-foreground";
