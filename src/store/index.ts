/**
 * @module store/index
 * @description
 * Central re-export barrel for all modular Zustand store slices.
 * Also exposes a **backward-compatible** `useAppStore` wrapper that selects
 * state from every slice so existing consumers can be migrated incrementally.
 */

// ─────────────────────────────────────────────────────────────
// Slice stores
// ─────────────────────────────────────────────────────────────
export { useAuthStore } from "./auth";
export type { User, AuthState } from "./auth";

export { useNavigationStore } from "./navigation";
export type { AppView, NavigationState } from "./navigation";

export { useUIStore } from "./ui";
export type { UIState } from "./ui";

// ─────────────────────────────────────────────────────────────
// Backward-compatible combined selector
// ─────────────────────────────────────────────────────────────

import { useAuthStore } from "./auth";
import { useNavigationStore } from "./navigation";
import { useUIStore } from "./ui";

/** Aggregate type that mirrors the original monolithic `AppState`. */
export interface CombinedAppState {
  // Auth
  user: ReturnType<typeof useAuthStore.getState>["user"];
  isAuthenticated: ReturnType<typeof useAuthStore.getState>["isAuthenticated"];
  setUser: ReturnType<typeof useAuthStore.getState>["setUser"];
  logout: ReturnType<typeof useAuthStore.getState>["logout"];

  // Navigation
  currentView: ReturnType<typeof useNavigationStore.getState>["currentView"];
  viewParams: ReturnType<typeof useNavigationStore.getState>["viewParams"];
  navigate: ReturnType<typeof useNavigationStore.getState>["navigate"];
  goBack: ReturnType<typeof useNavigationStore.getState>["goBack"];

  // UI
  sidebarOpen: ReturnType<typeof useUIStore.getState>["sidebarOpen"];
  setSidebarOpen: ReturnType<typeof useUIStore.getState>["setSidebarOpen"];
  sidebarCollapsed: ReturnType<typeof useUIStore.getState>["sidebarCollapsed"];
  setSidebarCollapsed: ReturnType<typeof useUIStore.getState>["setSidebarCollapsed"];
  globalLoading: ReturnType<typeof useUIStore.getState>["globalLoading"];
  setGlobalLoading: ReturnType<typeof useUIStore.getState>["setGlobalLoading"];
  unreadCount: ReturnType<typeof useUIStore.getState>["unreadCount"];
  setUnreadCount: ReturnType<typeof useUIStore.getState>["setUnreadCount"];
}

/**
 * A combined selector hook that pulls state from all slices into a single
 * object matching the shape of the original monolithic store.
 *
 * @example
 * ```tsx
 * const { user, currentView, sidebarOpen } = useAppStore();
 * ```
 *
 * @note Prefer the individual slice hooks (`useAuthStore`, etc.) for new code.
 *       This hook exists solely to ease migration.
 */
export function useAppStore(): CombinedAppState {
  const auth = useAuthStore();
  const nav = useNavigationStore();
  const ui = useUIStore();

  return {
    // Auth
    user: auth.user,
    isAuthenticated: auth.isAuthenticated,
    setUser: auth.setUser,
    logout: auth.logout,
    // Navigation
    currentView: nav.currentView,
    viewParams: nav.viewParams,
    navigate: nav.navigate,
    goBack: nav.goBack,
    // UI
    sidebarOpen: ui.sidebarOpen,
    setSidebarOpen: ui.setSidebarOpen,
    sidebarCollapsed: ui.sidebarCollapsed,
    setSidebarCollapsed: ui.setSidebarCollapsed,
    globalLoading: ui.globalLoading,
    setGlobalLoading: ui.setGlobalLoading,
    unreadCount: ui.unreadCount,
    setUnreadCount: ui.setUnreadCount,
  };
}
