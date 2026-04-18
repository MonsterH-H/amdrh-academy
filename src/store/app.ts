import { create } from "zustand";

export type AppView =
  | "landing"
  | "login"
  | "register"
  | "forgot-password"
  | "reset-password"
  | "dashboard"
  | "courses"
  | "course-detail"
  | "learning-paths"
  | "quiz"
  | "certificates"
  | "badges"
  | "messages"
  | "conversation"
  | "notifications"
  | "admin-users"
  | "admin-user-detail"
  | "admin-courses"
  | "admin-quizzes"
  | "admin-learning-paths"
  | "admin-certificates"
  | "admin-notifications"
  | "admin-analytics"
  | "admin-sync"
  | "admin-resources"
  | "admin-traceability"
  | "course-create"
  | "learner-traceability"
  | "profile";

interface User {
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
}

interface AppState {
  // Auth
  user: User | null;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;

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

const viewHistory: AppView[] = ["landing"];

export const useAppStore = create<AppState>((set, get) => ({
  // Auth
  user: null,
  isAuthenticated: false,
  setUser: (user) => set({ user, isAuthenticated: !!user }),

  // Navigation
  currentView: "landing",
  viewParams: {},
  navigate: (view, params = {}) => {
    const { currentView, viewParams: currentParams } = get();
    viewHistory.push(currentView);
    if (Object.keys(currentParams).length > 0) {
      // Store params for history
    }
    set({ currentView: view, viewParams: params });
    window.scrollTo(0, 0);
  },
  goBack: () => {
    if (viewHistory.length > 1) {
      viewHistory.pop();
      const prev = viewHistory[viewHistory.length - 1];
      set({ currentView: prev, viewParams: {} });
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
}));
