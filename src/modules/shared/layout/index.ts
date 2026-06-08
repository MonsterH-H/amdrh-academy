/**
 * AMDRH Layout Module — barrel exports
 *
 * Re-exports the three layout shell components consumed by the app shell:
 *   - Sidebar     (desktop + mobile sheet sidebar)
 *   - TopBar      (fixed header with notification popover)
 *   - MobileBottomNav  (5-tab mobile bottom navigation)
 */

export { Sidebar } from "./components/sidebar";
export { TopBar } from "./components/topbar";
export { MobileBottomNav } from "./components/mobile-bottom-nav";
export { getViewTitle as ViewTitle } from "./components/view-title";
