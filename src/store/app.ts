import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AppView } from "@/types/navigation";
import type { User } from "@/types/user";
import { ROLE_PERMISSIONS } from "@/lib/constants";

export type { AppView, User };

const SESSION_TIMEOUT_MS = 24 * 60 * 60 * 1000; // 24 hours

interface AppState {
  // Auth
  user: User | null;
  isAuthenticated: boolean;
  lastActivityAt: number;
  setUser: (user: User | null) => void;
  logout: () => void;
  checkSessionExpiry: () => boolean;

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
const viewHistory: HistoryEntry[] = [{ view: "landing", params: {} }];

/**
 * Check if a user with a given role can access a specific view.
 * Uses ROLE_PERMISSIONS from constants.ts.
 */
function canAccessView(view: string, role: string): boolean {
  // Public views — always accessible
  const publicViews = [
    "landing", "login", "forgot-password", "reset-password",
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
      lastActivityAt: Date.now(),
      setUser: (user) => set({
        user,
        isAuthenticated: !!user,
        lastActivityAt: user ? Date.now() : 0,
      }),
      logout: () => set({
        user: null,
        isAuthenticated: false,
        currentView: "landing",
        lastActivityAt: 0,
      }),
      checkSessionExpiry: () => {
        const { lastActivityAt, user } = get();
        // No active session — nothing to expire, allow all operations
        if (!user) return true;
        if (lastActivityAt && Date.now() - lastActivityAt > SESSION_TIMEOUT_MS) {
          get().logout();
          console.warn("[Session] Session expired (24h inactivity), logged out");
          return false;
        }
        return true;
      },

      // Navigation with role guard
      currentView: "landing",
      viewParams: {},
      navigate: (view, params = {}) => {
        const { currentView, viewParams: currentParams, user } = get();

        // Check session expiry before navigation
        if (!get().checkSessionExpiry()) return;

        // Role-based access control
        if (user?.role && !canAccessView(view, user.role)) {
          console.warn(`[Navigation] Access denied: ${user.role} cannot access "${view}"`);
          return; // Silently block navigation
        }

        viewHistory.push({ view: currentView, params: currentParams });
        if (viewHistory.length > 50) viewHistory.splice(0, viewHistory.length - 50);
        set({ currentView: view, viewParams: params, lastActivityAt: Date.now() });
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
        // Do NOT persist isAuthenticated — derived from user presence on hydration
        currentView: state.currentView,
        sidebarCollapsed: state.sidebarCollapsed,
        lastActivityAt: state.lastActivityAt,
      }),
      // Re-derive isAuthenticated from user on hydration
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Check session expiry on hydration
          if (state.user && state.lastActivityAt) {
            if (Date.now() - state.lastActivityAt > SESSION_TIMEOUT_MS) {
              state.user = null;
              state.currentView = "landing";
              state.lastActivityAt = 0;
            }
          }
          state.isAuthenticated = !!state.user;
        }
      },
    }
  )
);
