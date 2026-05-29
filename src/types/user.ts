// src/types/user.ts — Single source of truth for User type

export type UserRole = 'ADMIN' | 'FORMATEUR' | 'ARBITRE' | 'ENTRAINEUR' | 'JOUEUR'

export const ALL_ROLES: UserRole[] = ['ADMIN', 'FORMATEUR', 'ARBITRE', 'ENTRAINEUR', 'JOUEUR']

export const ROLE_LABELS: Record<UserRole, string> = {
  ADMIN: 'Administrateur',
  FORMATEUR: 'Formateur',
  ARBITRE: 'Arbitre',
  ENTRAINEUR: 'Entraîneur',
  JOUEUR: 'Joueur',
}

export interface User {
  id: string;
  email: string;
  nom: string;
  prenom: string;
  role: UserRole;
  avatar?: string | null;
  telephone?: string | null;
  club?: string | null;
  region?: string | null;
  bio?: string | null;
  licenceNumber?: string | null;
  emailVerified?: boolean | null;
  createdAt?: Date | string | null;
  isActive?: boolean;
  lastLoginAt?: Date | string | null;
}

export interface UserProfile extends User {
  completeness?: ProfileCompleteness;
  stats?: ProfileStats;
}

export interface ProfileStats {
  enrollments: number;
  completedEnrollments: number;
  certificates: number;
  badges: number;
  quizAttempts: number;
}

export interface CompletenessDetail {
  field: string;
  done: boolean;
  weight: number;
}

export interface ProfileCompleteness {
  percentage: number;
  details: CompletenessDetail[];
}
