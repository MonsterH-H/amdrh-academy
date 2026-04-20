import type { AppView } from "@/types/navigation";

// ──────────────────────────────────────────────────────────
// Navigation item with optional section grouping
// ──────────────────────────────────────────────────────────

export interface NavItem {
  view: AppView;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  section?: string;
}

// ──────────────────────────────────────────────────────────
// Bottom nav item (lighter — no section)
// ──────────────────────────────────────────────────────────

export interface BottomNavItem {
  view: AppView;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

// ──────────────────────────────────────────────────────────
// Navigation arrays grouped by role
// ──────────────────────────────────────────────────────────

export type NavItemsByRole = Record<string, NavItem[]>;
export type BottomNavByRole = Record<string, BottomNavItem[]>;
