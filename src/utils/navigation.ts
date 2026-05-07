import type { AppView } from "@/types/navigation";

/**
 * Get the human-readable page title for a given AppView.
 *
 * @param view - The AppView identifier
 * @returns French page title string
 */
export function getViewTitle(view: AppView): string {
  const titles: Record<string, string> = {
    landing: "Académie AMDRH",
    login: "Connexion",
    register: "Inscription",
    "forgot-password": "Mot de passe oublié",
    "reset-password": "Réinitialiser le mot de passe",
    dashboard: "Tableau de bord",
    courses: "Catalogue des cours",
    "course-detail": "Détail du cours",
    "learner-traceability": "Ma progression",
    "learning-paths": "Parcours de formation",
    quiz: "Quiz",
    certificates: "Certificats",
    badges: "Badges",
    messages: "Messagerie",
    conversation: "Conversation",
    notifications: "Notifications",
    "admin-users": "Gestion des utilisateurs",
    "admin-user-detail": "Détail utilisateur",
    "admin-quizzes": "Gestion des quiz",
    "admin-sync": "Synchronisation Fédération",
    "admin-certificates": "Certificats & Badges",
    "admin-learning-paths": "Gestion des parcours",
    "admin-courses": "Gestion des cours",
    "admin-notifications": "Gestion des notifications",
    "course-create": "Créer une formation",
    "admin-analytics": "Analytique",
    "admin-resources": "Médiathèque",
    "admin-traceability": "Traçabilité",
    profile: "Mon profil",
  };
  return titles[view] || view;
}
