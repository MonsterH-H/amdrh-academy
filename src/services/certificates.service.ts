/**
 * @module services/certificates
 * @description Certificate service — fetching user certificates, public verification, and PDF generation.
 */

import { request } from "./auth.service";

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

/** A certificate record. */
export interface Certificate {
  id: string;
  code: string;
  type: "ATTESTATION" | "CERTIFICAT" | "CERTIFICAT_COMPLETION" | "DIPLOME";
  status: "ACTIVE" | "REVOKED" | "SUSPENDED";
  userId: string;
  courseId: string;
  courseTitle: string;
  userName: string;
  userLicence?: string | null;
  score: number;
  maxScore: number;
  issuedAt: string;
  expiresAt?: string | null;
  revokedAt?: string | null;
  revokeReason?: string | null;
  qrCodeUrl: string;
}

/** Public verification result. */
export interface VerifyCertificateResponse {
  valid: boolean;
  error?: string;
  revokedAt?: string;
  revokeReason?: string;
  certificate?: {
    code: string;
    type: string;
    status: string;
    courseTitle: string;
    userName: string;
    score: number;
    maxScore: number;
    issuedAt: string;
    expiresAt?: string | null;
  };
}

// ─────────────────────────────────────────────────────────────
// Service
// ─────────────────────────────────────────────────────────────

export const certificatesService = {
  /**
   * Fetch all certificates for a given user.
   *
   * @param userId - The user UUID.
   * @returns Array of certificates ordered by issue date (newest first).
   */
  fetchCertificates: async (
    userId: string
  ): Promise<{ certificates: Certificate[] }> => {
    return request<{ certificates: Certificate[] }>(
      `/api/certificates?userId=${userId}`
    );
  },

  /**
   * Publicly verify a certificate by its code. No authentication required.
   *
   * @param code - The certificate code (e.g. `AMDRH-2026-00001`).
   * @returns Verification result with validity, error, and certificate details.
   */
  verifyCertificate: async (
    code: string
  ): Promise<VerifyCertificateResponse> => {
    return request<VerifyCertificateResponse>(
      `/api/certificates/verify?code=${encodeURIComponent(code)}`
    );
  },

  /**
   * Generate an HTML certificate page (print-ready / PDF viewable).
   * Returns HTML content suitable for printing or rendering in an iframe.
   *
   * @param certificateId - The certificate UUID.
   * @param userId        - The user UUID (ownership check).
   * @returns An object with a `url` pointing to the HTML endpoint.
   */
  downloadCertificatePdf: async (
    certificateId: string,
    userId: string
  ): Promise<{ url: string }> => {
    // The endpoint returns HTML directly, so we return the URL for the caller
    // to open in a new tab / iframe.
    return {
      url: `/api/certificates/${certificateId}/pdf?userId=${userId}`,
    };
  },
};
