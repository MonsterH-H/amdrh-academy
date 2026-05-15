/**
 * @module services/auth
 * @description Authentication service — login, register, password reset flows.
 * Each method is typed, documented with JSDoc, and handles errors gracefully.
 */

import type { User } from "@/store/auth";

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

/** Payload accepted by {@link authService.register}. */
export interface RegisterPayload {
  step1: {
    prenom: string;
    nom: string;
    email: string;
    password: string;
    confirmPassword: string;
  };
  step2: {
    role: "ARBITRE" | "ENTRAINEUR" | "JOUEUR";
    telephone?: string;
    club?: string;
    region?: string;
    licenceNumber?: string;
  };
}

/** Response from the login endpoint. */
export interface LoginResponse {
  user: User;
}

/** Response from the register endpoint. */
export interface RegisterResponse {
  user: Pick<User, "id" | "email" | "nom" | "prenom" | "role">;
}

/** Response from forgot-password (always returns success to prevent email enumeration). */
export interface ForgotPasswordResponse {
  message: string;
  devToken?: string;
}

/** Response from reset-password. */
export interface ResetPasswordResponse {
  message: string;
  user?: Pick<User, "id" | "email" | "nom" | "prenom">;
}

/** Standard error shape returned by the API. */
interface ApiError {
  error: string | Record<string, string[]>;
}

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────

const API_BASE = "";

class ApiServiceError extends Error {
  constructor(
    message: string,
    public status: number,
    public details?: string | Record<string, string[]>
  ) {
    super(message);
    this.name = "ApiServiceError";
  }
}

/** Wrapper around `fetch` that throws typed errors for non-2xx responses. */
async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${url}`, {
    headers: { "Content-Type": "application/json", ...init?.headers },
    ...init,
  });

  const data = await res.json();

  if (!res.ok) {
    const err = data as ApiError;
    const message =
      typeof err.error === "string" ? err.error : JSON.stringify(err.error);
    throw new ApiServiceError(message, res.status, err.error);
  }

  return data as T;
}

// ─────────────────────────────────────────────────────────────
// Service
// ─────────────────────────────────────────────────────────────

export const authService = {
  /**
   * Authenticate a user with email & password.
   *
   * @param email    - User email address.
   * @param password - Plain-text password.
   * @returns The authenticated user object (without passwordHash).
   * @throws {ApiServiceError} On invalid credentials or server error.
   */
  login: async (email: string, password: string): Promise<LoginResponse> => {
    return request<LoginResponse>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  },

  /**
   * Register a new user account (two-step registration).
   *
   * @param data - Registration payload containing step1 (credentials) and step2 (profile).
   * @returns The created user object (id, email, nom, prenom, role).
   * @throws {ApiServiceError} On validation failure (409/400) or server error.
   */
  register: async (data: RegisterPayload): Promise<RegisterResponse> => {
    return request<RegisterResponse>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  /**
   * Request a password-reset email. Always returns success to prevent
   * email-enumeration attacks.
   *
   * @param email - The account email address.
   * @returns A confirmation message. In development, includes `devToken`.
   * @throws {ApiServiceError} On server error (500).
   */
  forgotPassword: async (email: string): Promise<ForgotPasswordResponse> => {
    return request<ForgotPasswordResponse>("/api/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  },

  /**
   * Reset a user's password using a token from the forgot-password flow.
   *
   * @param token    - The reset token (hex string).
   * @param password - The new password (min 8 chars, 1 uppercase, 1 digit).
   * @returns A success message and the updated user object.
   * @throws {ApiServiceError} On invalid/expired token or validation failure.
   */
  resetPassword: async (
    token: string,
    password: string
  ): Promise<ResetPasswordResponse> => {
    return request<ResetPasswordResponse>("/api/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({ token, password }),
    });
  },
};

export { ApiServiceError, request };
