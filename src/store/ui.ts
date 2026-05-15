import { create } from "zustand";

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

/** Shape of the UI slice of global state (sidebar, notifications, loading). */
export interface UIState {
  /** Whether the mobile sidebar drawer is open. */
  sidebarOpen: boolean;
  /** Toggle the mobile sidebar drawer. */
  setSidebarOpen: (open: boolean) => void;
  /** Whether the desktop sidebar is collapsed to icon-only mode. */
  sidebarCollapsed: boolean;
  /** Toggle the desktop sidebar collapsed state. */
  setSidebarCollapsed: (collapsed: boolean) => void;
  /** Global loading overlay flag. */
  globalLoading: boolean;
  /** Show / hide the global loading overlay. */
  setGlobalLoading: (loading: boolean) => void;
  /** Number of unread notifications (cached count from the server). */
  unreadCount: number;
  /** Update the cached unread notification count. */
  setUnreadCount: (count: number) => void;
}

// ─────────────────────────────────────────────────────────────
// Store
// ─────────────────────────────────────────────────────────────

/** Zustand store slice for sidebar, notifications badge, and global loading. */
export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: false,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  sidebarCollapsed: false,
  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
  globalLoading: false,
  setGlobalLoading: (loading) => set({ globalLoading: loading }),
  unreadCount: 0,
  setUnreadCount: (count) => set({ unreadCount: count }),
}));
