/**
 * @module lib/permissions
 * Définition des permissions granulaires par module et par rôle
 * pour l'Académie AMDRH.
 */

export const PERMISSION_MODULES = [
  { id: "users", label: "Utilisateurs", icon: "User" },
  { id: "courses", label: "Cours", icon: "BookOpen" },
  { id: "quiz", label: "Quiz", icon: "ClipboardList" },
  { id: "learning_paths", label: "Parcours Formation", icon: "GraduationCap" },
  { id: "certificates", label: "Certificats & Badges", icon: "Award" },
  { id: "resources", label: "Médiathèque", icon: "FolderOpen" },
  { id: "notifications", label: "Notifications", icon: "Bell" },
  { id: "messages", label: "Messagerie", icon: "MessageSquare" },
  { id: "analytics", label: "Analyses", icon: "BarChart3" },
  { id: "traceability", label: "Traçabilité", icon: "Activity" },
  { id: "sync", label: "Sync Fédération", icon: "RefreshCw" },
  { id: "permissions", label: "Permissions", icon: "Shield" },
] as const;

export type PermissionModuleId = (typeof PERMISSION_MODULES)[number]["id"];

/**
 * Toutes les permissions disponibles, organisées par module.
 * Chaque permission est de la forme "module.action".
 */
export const ALL_PERMISSIONS: Record<string, { id: string; label: string; description: string }[]> = {
  users: [
    { id: "users.view", label: "Voir les utilisateurs", description: "Accéder à la liste des utilisateurs" },
    { id: "users.create", label: "Créer un utilisateur", description: "Ajouter un nouvel utilisateur" },
    { id: "users.edit", label: "Modifier un utilisateur", description: "Éditer le profil d'un utilisateur" },
    { id: "users.delete", label: "Supprimer un utilisateur", description: "Retirer un utilisateur de la plateforme" },
    { id: "users.roles", label: "Gérer les rôles", description: "Changer le rôle d'un utilisateur" },
  ],
  courses: [
    { id: "courses.view", label: "Voir les cours", description: "Accéder au catalogue des cours" },
    { id: "courses.create", label: "Créer un cours", description: "Ajouter un nouveau cours" },
    { id: "courses.edit", label: "Modifier un cours", description: "Éditer le contenu d'un cours" },
    { id: "courses.delete", label: "Supprimer un cours", description: "Retirer un cours de la plateforme" },
    { id: "courses.publish", label: "Publier un cours", description: "Changer le statut de publication" },
  ],
  quiz: [
    { id: "quiz.view", label: "Voir les quiz", description: "Accéder à la liste des quiz" },
    { id: "quiz.create", label: "Créer un quiz", description: "Ajouter un nouveau quiz" },
    { id: "quiz.edit", label: "Modifier un quiz", description: "Éditer les questions d'un quiz" },
    { id: "quiz.delete", label: "Supprimer un quiz", description: "Retirer un quiz de la plateforme" },
    { id: "quiz.results", label: "Voir les résultats", description: "Consulter les tentatives et scores" },
  ],
  learning_paths: [
    { id: "learning_paths.view", label: "Voir les parcours", description: "Accéder à la liste des parcours" },
    { id: "learning_paths.create", label: "Créer un parcours", description: "Ajouter un nouveau parcours" },
    { id: "learning_paths.edit", label: "Modifier un parcours", description: "Éditer un parcours existant" },
    { id: "learning_paths.delete", label: "Supprimer un parcours", description: "Retirer un parcours" },
    { id: "learning_paths.assign", label: "Assigner des cours", description: "Ajouter/retirer des cours d'un parcours" },
  ],
  certificates: [
    { id: "certificates.view", label: "Voir les certificats", description: "Consulter la liste des certificats" },
    { id: "certificates.create", label: "Créer un certificat", description: "Émettre un nouveau certificat" },
    { id: "certificates.revoke", label: "Révoquer un certificat", description: "Invalider un certificat émis" },
    { id: "certificates.badges", label: "Gérer les badges", description: "Créer et attribuer des badges" },
  ],
  resources: [
    { id: "resources.view", label: "Voir les ressources", description: "Accéder à la médiathèque" },
    { id: "resources.upload", label: "Téléverser", description: "Ajouter des fichiers dans la médiathèque" },
    { id: "resources.edit", label: "Modifier", description: "Éditer les métadonnées d'une ressource" },
    { id: "resources.delete", label: "Supprimer", description: "Retirer une ressource" },
  ],
  notifications: [
    { id: "notifications.view", label: "Voir les notifications", description: "Accéder au centre de notifications" },
    { id: "notifications.create", label: "Créer une notification", description: "Envoyer une notification" },
    { id: "notifications.manage", label: "Gérer les annonces", description: "Créer/modifier les annonces globales" },
  ],
  messages: [
    { id: "messages.view", label: "Voir les messages", description: "Accéder à la messagerie" },
    { id: "messages.send", label: "Envoyer des messages", description: "Envoyer des messages privés" },
  ],
  analytics: [
    { id: "analytics.view", label: "Voir les analyses", description: "Accéder aux tableaux de bord analytiques" },
    { id: "analytics.export", label: "Exporter les données", description: "Télécharger les rapports CSV" },
  ],
  traceability: [
    { id: "traceability.view", label: "Voir la traçabilité", description: "Accéder au suivi des inscriptions" },
    { id: "traceability.export", label: "Exporter", description: "Télécharger les données de traçabilité" },
  ],
  sync: [
    { id: "sync.view", label: "Voir la sync", description: "Accéder à la page de synchronisation" },
    { id: "sync.execute", label: "Lancer une sync", description: "Déclencher une synchronisation fédérale" },
  ],
  permissions: [
    { id: "permissions.view", label: "Voir les permissions", description: "Accéder à la matrice des permissions" },
    { id: "permissions.manage", label: "Gérer les permissions", description: "Modifier les permissions par rôle" },
  ],
};

/** Rôles de la plateforme */
export const ROLES = ["ADMIN", "FORMATEUR", "ARBITRE", "ENTRAINEUR", "JOUEUR"] as const;
export type Role = (typeof ROLES)[number];
export const ALL_ROLES = ROLES;

/** Permissions aplaties (flat list) pour le seed et l'itération */
export const ALL_PERMISSIONS_FLAT = Object.values(ALL_PERMISSIONS).flat().map((p) => ({
  name: p.id,
  label: p.label,
  description: p.description,
  module: p.id.split(".")[0],
  action: p.id.split(".")[1] || "view",
}));

export const ROLE_LABELS: Record<string, string> = {
  ADMIN: "Administrateur",
  FORMATEUR: "Formateur",
  ARBITRE: "Arbitre",
  ENTRAINEUR: "Entraîneur",
  JOUEUR: "Joueur",
};

/**
 * Permissions par défaut pour chaque rôle.
 * ADMIN a toutes les permissions.
 * Les autres rôles ont un sous-ensemble limité.
 */
export const DEFAULT_ROLE_PERMISSIONS: Record<string, string[]> = {
  ADMIN: Object.values(ALL_PERMISSIONS).flat().map((p) => p.id),
  FORMATEUR: [
    "courses.view", "courses.create", "courses.edit", "courses.publish",
    "quiz.view", "quiz.create", "quiz.edit", "quiz.results",
    "learning_paths.view",
    "resources.view", "resources.upload", "resources.edit",
    "notifications.view", "messages.view", "messages.send",
    "certificates.view",
  ],
  ARBITRE: [
    "courses.view",
    "quiz.view",
    "learning_paths.view",
    "certificates.view",
    "resources.view",
    "notifications.view", "messages.view", "messages.send",
  ],
  ENTRAINEUR: [
    "courses.view",
    "quiz.view",
    "learning_paths.view",
    "certificates.view",
    "resources.view",
    "notifications.view", "messages.view", "messages.send",
  ],
  JOUEUR: [
    "courses.view",
    "quiz.view",
    "learning_paths.view",
    "certificates.view",
    "resources.view",
    "notifications.view", "messages.view", "messages.send",
  ],
};

/** Obtenir le label français d'une permission */
export function getPermissionLabel(permId: string): string {
  for (const perms of Object.values(ALL_PERMISSIONS)) {
    const found = perms.find((p) => p.id === permId);
    if (found) return found.label;
  }
  return permId;
}

/** Obtenir la description d'une permission */
export function getPermissionDescription(permId: string): string {
  for (const perms of Object.values(ALL_PERMISSIONS)) {
    const found = perms.find((p) => p.id === permId);
    if (found) return found.description;
  }
  return "";
}
