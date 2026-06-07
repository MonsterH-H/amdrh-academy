import { create } from "zustand";

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

/** All possible views in the SPA-like navigation system. */
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

/** Shape of the navigation slice of global state. */
export interface NavigationState {
  /** The currently active view. */
  currentView: AppView;
  /** Parameters passed to the current view (e.g. `{ id: "123" }`). */
  viewParams: Record<string, string>;
  /** Navigate to a new view, pushing the current one onto the history stack. */
  navigate: (view: AppView, params?: Record<string, string>) => void;
  /** Go back to the previous view in the history stack. */
  goBack: () => void;
}

// ─────────────────────────────────────────────────────────────
// Internal history (module-scoped)
// ─────────────────────────────────────────────────────────────

const viewHistory: AppView[] = ["landing"];

// ─────────────────────────────────────────────────────────────
// Store
// ─────────────────────────────────────────────────────────────

/** Zustand store slice for SPA-style navigation. */
export const useNavigationStore = create<NavigationState>((set, get) => ({
  currentView: "landing",
  viewParams: {},
  navigate: (view, params = {}) => {
    const { currentView } = get();
    viewHistory.push(currentView);
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
}));
