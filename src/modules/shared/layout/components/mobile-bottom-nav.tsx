"use client";

import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/app";
import { getBottomNavForRole } from "../data/navigation";

// ──────────────────────────────────────────────────────────
// Mobile Bottom Navigation
// ──────────────────────────────────────────────────────────

export function MobileBottomNav() {
  const { user, currentView, navigate, unreadCount, isAuthenticated } = useAppStore();

  if (!user || !isAuthenticated) return null;

  const bottomItems = getBottomNavForRole(user.role);

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border/60 z-50 pb-safe">
      <div className="flex items-center justify-around px-1 py-1">
        {bottomItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.view;
          return (
            <button
              key={item.view}
              onClick={() => navigate(item.view)}
              className="flex flex-col items-center justify-center gap-0.5 min-h-[44px] min-w-[44px] px-2 rounded-lg transition-all duration-200"
            >
              <div className="relative">
                <Icon
                  className={cn(
                    "w-5 h-5 transition-colors duration-200",
                    isActive ? "text-primary" : "text-muted-foreground"
                  )}
                />
                {item.view === "messages" && unreadCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-destructive text-white text-[8px] font-bold rounded-full w-3.5 h-3.5 flex items-center justify-center">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </div>
              <span className={cn(
                "text-[10px] font-medium transition-colors duration-200",
                isActive ? "text-primary" : "text-muted-foreground"
              )}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
