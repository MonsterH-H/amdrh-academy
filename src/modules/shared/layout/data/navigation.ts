import {
  LayoutDashboard,
  BookOpen,
  GraduationCap,
  Award,
  MessageSquare,
  Bell,
  UserPlus,
  Plus,
  BellRing,
  RefreshCw,
  User,
  ClipboardList,
  BarChart3,
  FolderOpen,
  TrendingUp,
  Star,
  Compass,
  Activity,
} from "lucide-react";
import type { NavItem, BottomNavItem } from "../types";

// ──────────────────────────────────────────────────────────
// ADMIN: Platform management
// ──────────────────────────────────────────────────────────

export const adminNavItems: NavItem[] = [
  { view: "dashboard", label: "Tableau de bord", icon: LayoutDashboard, section: "Principal" },
  { view: "admin-users", label: "Utilisateurs", icon: UserPlus, section: "Gestion Utilisateurs" },
  { view: "admin-courses", label: "Gestion Cours", icon: BookOpen, section: "Gestion Contenu" },
  { view: "admin-quizzes", label: "Gestion Quiz", icon: ClipboardList, section: "Gestion Contenu" },
  { view: "admin-learning-paths", label: "Parcours Formation", icon: GraduationCap, section: "Gestion Contenu" },
  { view: "admin-resources", label: "Médiathèque", icon: FolderOpen, section: "Gestion Contenu" },
  { view: "admin-certificates", label: "Certificats & Badges", icon: Award, section: "Certification" },
  { view: "messages", label: "Messagerie", icon: MessageSquare, section: "Communication" },
  { view: "admin-notifications", label: "Gestion Notifications", icon: BellRing, section: "Communication" },
  { view: "admin-analytics", label: "Analyses", icon: BarChart3, section: "Système" },
  { view: "admin-traceability", label: "Traçabilité", icon: Activity, section: "Système" },
  { view: "admin-sync", label: "Sync Fédération", icon: RefreshCw, section: "Système" },
];

// ──────────────────────────────────────────────────────────
// FORMATEUR: Content creation + learner tracking
// ──────────────────────────────────────────────────────────

export const formateurNavItems: NavItem[] = [
  { view: "dashboard", label: "Tableau de bord", icon: LayoutDashboard, section: "Principal" },
  { view: "course-create", label: "Créer une formation", icon: Plus, section: "Mes Formations" },
  { view: "admin-courses", label: "Mes Cours", icon: BookOpen, section: "Mes Formations" },
  { view: "admin-quizzes", label: "Mes Quiz", icon: ClipboardList, section: "Mes Formations" },
  { view: "courses", label: "Catalogue Cours", icon: Compass, section: "Explorer" },
  { view: "admin-resources", label: "Médiathèque", icon: FolderOpen, section: "Ressources" },
  { view: "messages", label: "Messagerie", icon: MessageSquare, section: "Communication" },
  { view: "notifications", label: "Notifications", icon: Bell, section: "Communication" },
];

// ──────────────────────────────────────────────────────────
// ARBITRE / ENTRAINEUR / JOUEUR: Learners
// ──────────────────────────────────────────────────────────

export const learnerNavItems: NavItem[] = [
  { view: "dashboard", label: "Tableau de bord", icon: LayoutDashboard, section: "Principal" },
  { view: "courses", label: "Catalogue Cours", icon: BookOpen, section: "Formation" },
  { view: "learning-paths", label: "Parcours Formation", icon: GraduationCap, section: "Formation" },
  { view: "learner-traceability", label: "Ma Progression", icon: TrendingUp, section: "Suivi" },
  { view: "certificates", label: "Certificats", icon: Award, section: "Suivi" },
  { view: "badges", label: "Badges", icon: Star, section: "Suivi" },
  { view: "messages", label: "Messagerie", icon: MessageSquare, section: "Communication" },
  { view: "notifications", label: "Notifications", icon: Bell, section: "Communication" },
];

// ──────────────────────────────────────────────────────────
// Helper: get sidebar nav items for a role
// ──────────────────────────────────────────────────────────

export function getNavItemsForRole(role: string): NavItem[] {
  switch (role) {
    case "ADMIN":
      return adminNavItems;
    case "FORMATEUR":
      return formateurNavItems;
    case "ARBITRE":
    case "ENTRAINEUR":
    case "JOUEUR":
    default:
      return learnerNavItems;
  }
}

// ──────────────────────────────────────────────────────────
// Mobile bottom nav per role
// ──────────────────────────────────────────────────────────

export const learnerBottomNav: BottomNavItem[] = [
  { view: "courses", label: "Cours", icon: BookOpen },
  { view: "learner-traceability", label: "Progrès", icon: TrendingUp },
  { view: "learning-paths", label: "Parcours", icon: GraduationCap },
  { view: "messages", label: "Messages", icon: MessageSquare },
  { view: "profile", label: "Profil", icon: User },
];

export const adminBottomNav: BottomNavItem[] = [
  { view: "dashboard", label: "Accueil", icon: LayoutDashboard },
  { view: "admin-courses", label: "Cours", icon: BookOpen },
  { view: "admin-users", label: "Utilis.", icon: UserPlus },
  { view: "messages", label: "Messages", icon: MessageSquare },
  { view: "profile", label: "Profil", icon: User },
];

export const formateurBottomNav: BottomNavItem[] = [
  { view: "dashboard", label: "Accueil", icon: LayoutDashboard },
  { view: "course-create", label: "Créer", icon: Plus },
  { view: "admin-courses", label: "Mes Cours", icon: BookOpen },
  { view: "messages", label: "Messages", icon: MessageSquare },
  { view: "profile", label: "Profil", icon: User },
];

export function getBottomNavForRole(role: string): BottomNavItem[] {
  switch (role) {
    case "ADMIN":
      return adminBottomNav;
    case "FORMATEUR":
      return formateurBottomNav;
    default:
      return learnerBottomNav;
  }
}
