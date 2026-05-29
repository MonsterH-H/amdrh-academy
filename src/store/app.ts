import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AppView } from "@/types/navigation";
import { ROLE_PERMISSIONS } from "@/lib/constants";

export type { AppView };

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
  emailVerified?: boolean | null;
  createdAt?: Date | string | null;
  isActive?: boolean;
  lastLoginAt?: Date | string | null;
}

interface AppState {
  // Auth
  user: User | null;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  logout: () => void;

  // Navigation
  currentView: AppView;
  viewParams: Record<string, string>;
  navigate: (view: AppView, params?: Record<string, string>) => void;
  goBack: () => void;

  // Sidebar
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;

  // Notifications
  unreadCount: number;
  setUnreadCount: (count: number) => void;

  // Loading
  globalLoading: boolean;
  setGlobalLoading: (loading: boolean) => void;
}

interface HistoryEntry { view: AppView; params: Record<string, string> }
const viewHistory: HistoryEntry[] = [{ view: "landing", params: {} }]; // Already correct

/**
 * Check if a user with a given role can access a specific view.
 * Uses ROLE_PERMISSIONS from constants.ts.
 */
function canAccessView(view: string, role: string): boolean {
  // Public views — always accessible
  const publicViews = [
    "landing", "login", "register", "forgot-password", "reset-password",
    "conversation", // Can access any conversation they're part of
  ];
  if (publicViews.includes(view)) return true;

  // Check role permissions
  const allowed = ROLE_PERMISSIONS[role];
  if (!allowed) return false;
  return allowed.includes(view);
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Auth
      user: null,
      isAuthenticated: false,
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      logout: () => set({ user: null, isAuthenticated: false, currentView: "landing" }),

      // Navigation with role guard
      currentView: "landing",
      viewParams: {},
      navigate: (view, params = {}) => {
        const { currentView, viewParams: currentParams, user } = get();

        // Role-based access control
        if (user?.role && !canAccessView(view, user.role)) {
          console.warn(`[Navigation] Access denied: ${user.role} cannot access "${view}"`);
          return; // Silently block navigation
        }

        viewHistory.push({ view: currentView, params: currentParams });
        if (viewHistory.length > 50) viewHistory.splice(0, viewHistory.length - 50);
        set({ currentView: view, viewParams: params });
        window.scrollTo(0, 0);
      },
      goBack: () => {
        if (viewHistory.length > 1) {
          viewHistory.pop();
          const prev = viewHistory[viewHistory.length - 1];
          set({ currentView: prev.view, viewParams: prev.params });
        }
      },

      // Sidebar
      sidebarOpen: false,
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      sidebarCollapsed: false,
      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),

      // Notifications
      unreadCount: 0,
      setUnreadCount: (count) => set({ unreadCount: count }),

      // Loading
      globalLoading: false,
      setGlobalLoading: (loading) => set({ globalLoading: loading }),
    }),
    {
      name: 'amdrh-session',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        currentView: state.currentView,
        sidebarCollapsed: state.sidebarCollapsed,
      }),
    }
  )
);
