import { create } from "zustand";

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

/** User object returned from the API and stored in state. */
export interface User {
  id: string;
  email: string;
  nom: string;
  prenom: string;
  role: string;
  avatar?: string | null;
  telephone?: string | null;
  club?: string | null;
  region?: string | null;
  bio?: string | null;
  licenceNumber?: string | null;
  emailVerified?: Date | string | null;
  createdAt?: Date | string | null;
  isActive?: boolean;
  lastLoginAt?: Date | string | null;
}

/** Shape of the authentication slice of global state. */
export interface AuthState {
  /** Currently logged-in user (null when logged out). */
  user: User | null;
  /** Whether the user is authenticated. Derived from `user` presence. */
  isAuthenticated: boolean;
  /** Set the current user (used after login / session restore). */
  setUser: (user: User | null) => void;
  /** Clear user data and mark as unauthenticated. */
  logout: () => void;
}

// ─────────────────────────────────────────────────────────────
// Store
// ─────────────────────────────────────────────────────────────

/** Zustand store slice for authentication state. */
export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  logout: () => set({ user: null, isAuthenticated: false }),
}));
