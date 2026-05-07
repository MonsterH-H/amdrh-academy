export const ROLES = {
  ADMIN: "ADMIN",
  FORMATEUR: "FORMATEUR",
  ARBITRE: "ARBITRE",
  ENTRAINEUR: "ENTRAINEUR",
  JOUEUR: "JOUEUR",
} as const;

export const ROLE_LABELS: Record<string, string> = {
  ADMIN: "Administrateur",
  FORMATEUR: "Formateur",
  ARBITRE: "Arbitre",
  ENTRAINEUR: "Entraîneur",
  JOUEUR: "Joueur",
};

export const ROLE_COLORS: Record<string, string> = {
  ADMIN: "bg-red-100 text-red-800",
  FORMATEUR: "bg-indigo-100 text-indigo-800",
  ARBITRE: "bg-blue-100 text-blue-800",
  ENTRAINEUR: "bg-green-100 text-green-800",
  JOUEUR: "bg-amber-100 text-amber-800",
};

export const ROLE_BG_COLORS: Record<string, string> = {
  ADMIN: "bg-red-500",
  FORMATEUR: "bg-indigo-500",
  ARBITRE: "bg-blue-500",
  ENTRAINEUR: "bg-green-500",
  JOUEUR: "bg-amber-500",
};

export const CATEGORIES = {
  ARBITRAGE: "ARBITRAGE",
  ENTRAINEMENT: "ENTRAINEMENT",
  JOUEURS: "JOUEURS",
  ADMINISTRATION: "ADMINISTRATION",
} as const;

export const CATEGORY_LABELS: Record<string, string> = {
  ARBITRAGE: "Arbitrage",
  ENTRAINEMENT: "Entraînement",
  JOUEURS: "Joueurs",
  ADMINISTRATION: "Administration",
};

export const CATEGORY_ICONS: Record<string, string> = {
  ARBITRAGE: "🟦",
  ENTRAINEMENT: "🟩",
  JOUEURS: "🟨",
  ADMINISTRATION: "🟪",
};

export const CATEGORY_GRADIENTS: Record<string, string> = {
  ARBITRAGE: "from-blue-500/15 to-blue-600/20",
  ENTRAINEMENT: "from-emerald-500/15 to-emerald-600/20",
  JOUEURS: "from-amber-500/15 to-amber-600/20",
  ADMINISTRATION: "from-violet-500/15 to-violet-600/20",
};

export const CATEGORY_ICON_COLORS: Record<string, string> = {
  ARBITRAGE: "text-blue-400",
  ENTRAINEMENT: "text-emerald-400",
  JOUEURS: "text-amber-400",
  ADMINISTRATION: "text-violet-400",
};

export const DIFFICULTY_LABELS: Record<string, string> = {
  DEBUTANT: "Débutant",
  INTERMEDIAIRE: "Intermédiaire",
  AVANCE: "Avancé",
  EXPERT: "Expert",
};

export const DIFFICULTY_COLORS: Record<string, string> = {
  DEBUTANT: "bg-emerald-100 text-emerald-700",
  INTERMEDIAIRE: "bg-amber-100 text-amber-700",
  AVANCE: "bg-orange-100 text-orange-700",
  EXPERT: "bg-red-100 text-red-700",
};

export const BADGE_LEVEL_LABELS: Record<string, string> = {
  BRONZE: "Bronze",
  ARGENT: "Argent",
  OR: "Or",
  PLATINE: "Platine",
};

export const BADGE_LEVEL_COLORS: Record<string, string> = {
  BRONZE: "bg-amber-700",
  ARGENT: "bg-gray-300",
  OR: "bg-yellow-400",
  PLATINE: "bg-cyan-400",
};

export const NOTIFICATION_TYPE_LABELS: Record<string, string> = {
  COURS: "Cours",
  CERTIFICAT: "Certificat",
  MESSAGE: "Message",
  QUIZ: "Quiz",
  BADGE: "Badge",
  SYSTEME: "Système",
};

export const NOTIFICATION_ICONS: Record<string, string> = {
  COURS: "BookOpen",
  CERTIFICAT: "Award",
  MESSAGE: "Mail",
  QUIZ: "HelpCircle",
  BADGE: "Star",
  SYSTEME: "Settings",
};

export const QUIZ_STATUS_LABELS: Record<string, string> = {
  EN_COURS: "En cours",
  SOUMIS: "Soumis",
  REUSSI: "Réussi",
  ECHOUE: "Échoué",
};

export const QUIZ_STATUS_COLORS: Record<string, string> = {
  EN_COURS: "bg-blue-100 text-blue-700",
  SOUMIS: "bg-gray-100 text-gray-700",
  REUSSI: "bg-green-100 text-green-700",
  ECHOUE: "bg-red-100 text-red-700",
};

export const REGIONS_MAROC = [
  "Tanger-Tétouan-Al Hoceima",
  "Oriental",
  "Fès-Meknès",
  "Rabat-Salé-Kénitra",
  "Béni Mellal-Khénifra",
  "Casablanca-Settat",
  "Marrakech-Safi",
  "Drâa-Tafilalet",
  "Souss-Massa",
  "Guelmim-Oued Noun",
  "Laâyoune-Sakia El Hamra",
  "Dakhla-Oued Ed Dahab",
];

export const LESSON_TYPE_LABELS: Record<string, string> = {
  VIDEO: "Vidéo",
  PDF: "PDF",
  TEXTE: "Texte",
  INTERACTIF: "Interactif",
};

export const LESSON_TYPE_ICONS: Record<string, string> = {
  VIDEO: "🎬",
  PDF: "📄",
  TEXTE: "📝",
  INTERACTIF: "🎯",
};

export const LESSON_TYPE_COLORS: Record<string, string> = {
  VIDEO: "bg-purple-100 text-purple-700",
  PDF: "bg-red-100 text-red-700",
  TEXTE: "bg-emerald-100 text-emerald-700",
  INTERACTIF: "bg-amber-100 text-amber-700",
};

export const COURSE_STATUS_LABELS: Record<string, string> = {
  BROUILLON: "Brouillon",
  EN_REVISION: "En révision",
  VALIDE: "Validé",
  PUBLIE: "Publié",
  ARCHIVE: "Archivé",
};

export const QUESTION_TYPE_LABELS: Record<string, string> = {
  QCM_SIMPLE: "Choix multiple",
  QCM_MULTIPLE: "Choix multiples",
  VRAI_FAUX: "Vrai / Faux",
};

export const QUESTION_TYPE_COLORS: Record<string, string> = {
  QCM_SIMPLE: "bg-primary/10 text-primary",
  QCM_MULTIPLE: "bg-amber-100 text-amber-700",
  VRAI_FAUX: "bg-emerald-100 text-emerald-700",
};

export const COURSE_STATUS_COLORS: Record<string, string> = {
  BROUILLON: "bg-gray-100 text-gray-700",
  EN_REVISION: "bg-amber-100 text-amber-700",
  VALIDE: "bg-blue-100 text-blue-700",
  PUBLIE: "bg-green-100 text-green-700",
  ARCHIVE: "bg-red-100 text-red-700",
};

export const LEARNING_PATH_MODE_LABELS: Record<string, string> = {
  SEQUENTIEL: "Séquentiel",
  FLEXIBLE: "Flexible",
  HYBRIDE: "Hybride",
};

export const LEARNING_PATH_MODE_COLORS: Record<string, string> = {
  SEQUENTIEL: "bg-blue-100 text-blue-700",
  FLEXIBLE: "bg-emerald-100 text-emerald-700",
  HYBRIDE: "bg-purple-100 text-purple-700",
};

// ────────────────────────────────────────────
// Resource (Médiathèque) constants
// ────────────────────────────────────────────

export const RESOURCE_TYPE_LABELS: Record<string, string> = {
  VIDEO: "Vidéo",
  PDF: "PDF",
  IMAGE: "Image",
  DOCUMENT: "Document",
  AUDIO: "Audio",
  ARCHIVE: "Archive",
  AUTRE: "Autre",
};

export const RESOURCE_TYPE_COLORS: Record<string, string> = {
  VIDEO: "bg-purple-100 text-purple-700",
  PDF: "bg-red-100 text-red-700",
  IMAGE: "bg-sky-100 text-sky-700",
  DOCUMENT: "bg-emerald-100 text-emerald-700",
  AUDIO: "bg-pink-100 text-pink-700",
  ARCHIVE: "bg-orange-100 text-orange-700",
  AUTRE: "bg-gray-100 text-gray-700",
};

export const RESOURCE_TYPE_ICONS: Record<string, string> = {
  VIDEO: "Video",
  PDF: "FileText",
  IMAGE: "Image",
  DOCUMENT: "File",
  AUDIO: "Music",
  ARCHIVE: "Archive",
  AUTRE: "FileQuestion",
};

export const RESOURCE_CATEGORY_LABELS: Record<string, string> = {
  SUPPORT_COURS: "Support de cours",
  RESSOURCE_ANNEXE: "Ressource annexe",
  EVALUATION: "Évaluation",
  MEDIA_COURS: "Média du cours",
  AUTRE: "Autre",
};

export const RESOURCE_CATEGORY_COLORS: Record<string, string> = {
  SUPPORT_COURS: "bg-blue-100 text-blue-700",
  RESSOURCE_ANNEXE: "bg-amber-100 text-amber-700",
  EVALUATION: "bg-emerald-100 text-emerald-700",
  MEDIA_COURS: "bg-purple-100 text-purple-700",
  AUTRE: "bg-gray-100 text-gray-700",
};

// ────────────────────────────────────────────
// Certificate types
// ────────────────────────────────────────────

export const CERTIFICATE_TYPE_LABELS: Record<string, string> = {
  ATTESTATION: "Attestation",
  CERTIFICAT_COMPLETION: "Certificat",
  CERTIFICAT: "Certificat",
  DIPLOME: "Diplôme",
};

export const CERTIFICATE_TYPE_COLORS: Record<string, string> = {
  ATTESTATION: "bg-emerald-100 text-emerald-700",
  CERTIFICAT_COMPLETION: "bg-blue-100 text-blue-700",
  CERTIFICAT: "bg-blue-100 text-blue-700",
  DIPLOME: "bg-amber-100 text-amber-700",
};

export const CERTIFICATE_STATUS_LABELS: Record<string, string> = {
  ACTIVE: "Actif",
  REVOKED: "Révoqué",
  SUSPENDED: "Suspendu",
};

export const CERTIFICATE_STATUS_COLORS: Record<string, string> = {
  ACTIVE: "bg-green-100 text-green-700",
  REVOKED: "bg-red-100 text-red-700",
  SUSPENDED: "bg-amber-100 text-amber-700",
};

// ────────────────────────────────────────────
// Enrollment status
// ────────────────────────────────────────────

export const ENROLLMENT_STATUS_LABELS: Record<string, string> = {
  en_cours: "En cours",
  termine: "Terminé",
  abandonne: "Abandonné",
};

export const ENROLLMENT_STATUS_COLORS: Record<string, string> = {
  en_cours: "bg-blue-100 text-blue-700",
  termine: "bg-green-100 text-green-700",
  abandonne: "bg-red-100 text-red-700",
};

// Completion trigger labels
export const COMPLETION_TRIGGER_LABELS: Record<string, string> = {
  manual: "Manuel",
  auto_video: "Auto vidéo",
  auto_scroll: "Auto lecture",
  auto_time: "Auto temps",
};

// ────────────────────────────────────────────
// Permission matrices for each role
// ────────────────────────────────────────────

export const ROLE_PERMISSIONS: Record<string, string[]> = {
  ADMIN: [
    "dashboard", "admin-dashboard", "admin-users", "admin-user-detail",
    "admin-courses", "admin-quizzes", "admin-learning-paths",
    "admin-resources", "admin-certificates", "admin-notifications",
    "admin-analytics", "admin-sync", "admin-traceability",
    "admin-permissions",
    "messages", "notifications", "profile",
    "courses", "course-detail", "course-create", "learning-paths",
    "quiz", "certificates", "badges", "learner-traceability",
  ],
  FORMATEUR: [
    "dashboard", "courses", "course-detail", "course-create",
    "admin-courses", "admin-quizzes", "admin-learning-paths",
    "admin-resources",
    "learning-paths",
    "messages", "notifications", "profile",
    "quiz", "certificates", "badges",
  ],
  ARBITRE: [
    "dashboard", "courses", "course-detail", "learning-paths",
    "learner-traceability", "certificates", "badges", "quiz",
    "messages", "notifications", "profile",
  ],
  ENTRAINEUR: [
    "dashboard", "courses", "course-detail", "learning-paths",
    "learner-traceability", "certificates", "badges", "quiz",
    "messages", "notifications", "profile",
  ],
  JOUEUR: [
    "dashboard", "courses", "course-detail", "learning-paths",
    "learner-traceability", "certificates", "badges", "quiz",
    "messages", "notifications", "profile",
  ],
};
