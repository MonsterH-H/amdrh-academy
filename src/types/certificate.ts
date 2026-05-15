export interface Certificate {
  id: string;
  code: string;
  type: CertificateType;
  status: CertificateStatus;
  courseTitle: string;
  userName: string;
  score: number;
  maxScore: number;
  issuedAt: string;
  expiresAt: string | null;
  revokedAt: string | null;
  revokeReason: string | null;
  userId: string;
}

export type CertificateType = "CERTIFICAT" | "ATTESTATION" | "DIPLOME";
export type CertificateStatus = "ACTIVE" | "REVOKED" | "EXPIRED";

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  level: BadgeLevel;
  criteria: string;
  createdAt: string;
}

export type BadgeLevel = "BRONZE" | "ARGENT" | "OR" | "PLATINE";

export interface UserBadge {
  id: string;
  badgeId: string;
  earnedAt: string;
  badge: Badge;
}
