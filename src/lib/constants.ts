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

export const COURSE_STATUS_LABELS: Record<string, string> = {
  BROUILLON: "Brouillon",
  EN_REVISION: "En révision",
  VALIDE: "Validé",
  PUBLIE: "Publié",
  ARCHIVE: "Archivé",
};
