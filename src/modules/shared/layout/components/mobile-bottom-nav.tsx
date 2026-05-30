"use client";

import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/app";
import { getBottomNavForRole } from "../data/navigation";

// ──────────────────────────────────────────────────────────
// Mobile Bottom Navigation — blue accent, premium feel
// ──────────────────────────────────────────────────────────

export function MobileBottomNav() {
  const { user, currentView, navigate, unreadCount, isAuthenticated } = useAppStore();

  if (!user || !isAuthenticated) return null;

  const bottomItems = getBottomNavForRole(user.role);

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-card/80 backdrop-blur-xl border-t border-border/30 z-50 pb-safe shadow-[0_-1px_8px_rgba(0,0,0,0.04)]">
      <div className="flex items-center justify-around px-1 py-1">
        {bottomItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.view;
          return (
            <button
              key={item.view}
              onClick={() => navigate(item.view)}
              className="relative flex flex-col items-center justify-center gap-0.5 min-h-[44px] min-w-[44px] px-2 rounded-xl transition-all duration-200 active:scale-90"
            >
              <div className="relative">
                <Icon
                  className={cn(
                    "w-5 h-5 transition-all duration-200",
                    isActive
                      ? "text-primary drop-shadow-[0_0_6px_rgba(37,99,235,0.4)]"
                      : "text-muted-foreground"
                  )}
                />
                {item.view === "messages" && unreadCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-destructive text-white text-[8px] font-bold rounded-full w-3.5 h-3.5 flex items-center justify-center shadow-sm">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </div>
              <span className={cn(
                "text-[10px] font-medium transition-all duration-200",
                isActive ? "text-primary font-semibold" : "text-muted-foreground"
              )}>
                {item.label}
              </span>
              {/* Active indicator dot */}
              {isActive && (
                <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
