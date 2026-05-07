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
  Shield,
  Settings,
  Megaphone,
  Trophy,
  Target,
  Dumbbell,
  Users,
} from "lucide-react";
import type { NavItem, BottomNavItem } from "../types";

// ──────────────────────────────────────────────────────────
// ADMIN: Gestion complète de la plateforme
// ──────────────────────────────────────────────────────────

export const adminNavItems: NavItem[] = [
  // Principal
  { view: "dashboard", label: "Tableau de bord", icon: LayoutDashboard, section: "Principal" },
  { view: "profile", label: "Mon Profil", icon: User, section: "Principal" },

  // Gestion Utilisateurs
  { view: "admin-users", label: "Utilisateurs", icon: UserPlus, section: "Gestion Utilisateurs" },

  // Gestion Contenu
  { view: "admin-courses", label: "Gestion Cours", icon: BookOpen, section: "Gestion Contenu" },
  { view: "admin-quizzes", label: "Gestion Quiz", icon: ClipboardList, section: "Gestion Contenu" },
  { view: "admin-learning-paths", label: "Parcours Formation", icon: GraduationCap, section: "Gestion Contenu" },
  { view: "admin-resources", label: "Médiathèque", icon: FolderOpen, section: "Gestion Contenu" },

  // Certification
  { view: "admin-certificates", label: "Certificats & Badges", icon: Award, section: "Certification" },

  // Communication
  { view: "messages", label: "Messagerie", icon: MessageSquare, section: "Communication" },
  { view: "admin-notifications", label: "Gestion Notifications", icon: BellRing, section: "Communication" },
  { view: "admin-announcements", label: "Annonces", icon: Megaphone, section: "Communication" },

  // Système
  { view: "admin-analytics", label: "Analyses", icon: BarChart3, section: "Système" },
  { view: "admin-traceability", label: "Traçabilité", icon: Activity, section: "Système" },
  { view: "admin-permissions", label: "Gestion Permissions", icon: Shield, section: "Système" },
  { view: "admin-sync", label: "Sync Fédération", icon: RefreshCw, section: "Système" },
  { view: "admin-settings", label: "Paramètres", icon: Settings, section: "Système" },
];

// ──────────────────────────────────────────────────────────
// FORMATEUR: Création de contenu + suivi apprenants
// ──────────────────────────────────────────────────────────

export const formateurNavItems: NavItem[] = [
  { view: "formateur-dashboard", label: "Tableau de bord", icon: LayoutDashboard, section: "Principal" },
  { view: "profile", label: "Mon Profil", icon: User, section: "Principal" },

  { view: "course-create", label: "Créer une formation", icon: Plus, section: "Mes Formations" },
  { view: "admin-courses", label: "Mes Cours", icon: BookOpen, section: "Mes Formations" },
  { view: "admin-quizzes", label: "Mes Quiz", icon: ClipboardList, section: "Mes Formations" },
  { view: "admin-learning-paths", label: "Parcours", icon: GraduationCap, section: "Mes Formations" },
  { view: "admin-resources", label: "Médiathèque", icon: FolderOpen, section: "Mes Formations" },

  { view: "courses", label: "Catalogue Cours", icon: Compass, section: "Explorer" },
  { view: "announcements", label: "Annonces", icon: Megaphone, section: "Explorer" },

  { view: "messages", label: "Messagerie", icon: MessageSquare, section: "Communication" },
  { view: "notifications", label: "Notifications", icon: Bell, section: "Communication" },
];

// ──────────────────────────────────────────────────────────
// ARBITRE: Arbitrage handball — focus règles & certifications
// ──────────────────────────────────────────────────────────

export const arbitreNavItems: NavItem[] = [
  { view: "dashboard", label: "Tableau de bord", icon: LayoutDashboard, section: "Principal" },
  { view: "profile", label: "Mon Profil", icon: User, section: "Principal" },

  { view: "courses", label: "Formations Arbitrage", icon: BookOpen, section: "Formation" },
  { view: "learning-paths", label: "Parcours Certifiant", icon: GraduationCap, section: "Formation" },
  { view: "quiz", label: "Quiz & Examens", icon: ClipboardList, section: "Formation" },

  { view: "learner-traceability", label: "Ma Progression", icon: TrendingUp, section: "Suivi" },
  { view: "certificates", label: "Certificats", icon: Award, section: "Suivi" },
  { view: "badges", label: "Badges", icon: Star, section: "Suivi" },

  { view: "announcements", label: "Annonces", icon: Megaphone, section: "Info" },
  { view: "messages", label: "Messagerie", icon: MessageSquare, section: "Communication" },
  { view: "notifications", label: "Notifications", icon: Bell, section: "Communication" },
];

// ──────────────────────────────────────────────────────────
// ENTRAINEUR: Entraînement & coaching
// ──────────────────────────────────────────────────────────

export const entraineurNavItems: NavItem[] = [
  { view: "dashboard", label: "Tableau de bord", icon: LayoutDashboard, section: "Principal" },
  { view: "profile", label: "Mon Profil", icon: User, section: "Principal" },

  { view: "courses", label: "Formations Coaching", icon: Dumbbell, section: "Formation" },
  { view: "learning-paths", label: "Parcours Entraînement", icon: GraduationCap, section: "Formation" },
  { view: "quiz", label: "Quiz", icon: ClipboardList, section: "Formation" },

  { view: "learner-traceability", label: "Ma Progression", icon: TrendingUp, section: "Suivi" },
  { view: "certificates", label: "Certificats", icon: Award, section: "Suivi" },
  { view: "badges", label: "Badges", icon: Trophy, section: "Suivi" },

  { view: "announcements", label: "Annonces", icon: Megaphone, section: "Info" },
  { view: "messages", label: "Messagerie", icon: MessageSquare, section: "Communication" },
  { view: "notifications", label: "Notifications", icon: Bell, section: "Communication" },
];

// ──────────────────────────────────────────────────────────
// JOUEUR: Formation joueur & règles du jeu
// ──────────────────────────────────────────────────────────

export const joueurNavItems: NavItem[] = [
  { view: "dashboard", label: "Tableau de bord", icon: LayoutDashboard, section: "Principal" },
  { view: "profile", label: "Mon Profil", icon: User, section: "Principal" },

  { view: "courses", label: "Cours Joueurs", icon: Target, section: "Formation" },
  { view: "learning-paths", label: "Parcours Jeune", icon: GraduationCap, section: "Formation" },
  { view: "quiz", label: "Quiz", icon: ClipboardList, section: "Formation" },

  { view: "learner-traceability", label: "Ma Progression", icon: TrendingUp, section: "Suivi" },
  { view: "badges", label: "Badges", icon: Star, section: "Suivi" },

  { view: "announcements", label: "Annonces", icon: Megaphone, section: "Info" },
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
      return arbitreNavItems;
    case "ENTRAINEUR":
      return entraineurNavItems;
    case "JOUEUR":
      return joueurNavItems;
    default:
      return arbitreNavItems;
  }
}

// ──────────────────────────────────────────────────────────
// Mobile bottom nav per role
// ──────────────────────────────────────────────────────────

export const arbitreBottomNav: BottomNavItem[] = [
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
  { view: "formateur-dashboard", label: "Accueil", icon: LayoutDashboard },
  { view: "course-create", label: "Créer", icon: Plus },
  { view: "admin-courses", label: "Mes Cours", icon: BookOpen },
  { view: "messages", label: "Messages", icon: MessageSquare },
  { view: "profile", label: "Profil", icon: User },
];

export const entraineurBottomNav: BottomNavItem[] = [
  { view: "courses", label: "Cours", icon: BookOpen },
  { view: "learner-traceability", label: "Progrès", icon: TrendingUp },
  { view: "learning-paths", label: "Parcours", icon: GraduationCap },
  { view: "messages", label: "Messages", icon: MessageSquare },
  { view: "profile", label: "Profil", icon: User },
];

export const joueurBottomNav: BottomNavItem[] = [
  { view: "courses", label: "Cours", icon: BookOpen },
  { view: "learner-traceability", label: "Progrès", icon: TrendingUp },
  { view: "badges", label: "Badges", icon: Star },
  { view: "messages", label: "Messages", icon: MessageSquare },
  { view: "profile", label: "Profil", icon: User },
];

export function getBottomNavForRole(role: string): BottomNavItem[] {
  switch (role) {
    case "ADMIN":
      return adminBottomNav;
    case "FORMATEUR":
      return formateurBottomNav;
    case "ENTRAINEUR":
      return entraineurBottomNav;
    case "JOUEUR":
      return joueurBottomNav;
    case "ARBITRE":
    default:
      return arbitreBottomNav;
  }
}
