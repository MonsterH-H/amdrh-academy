"use client";

import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/app";
import { useRealtime } from "@/hooks/use-realtime";
import { getViewTitle } from "@/utils/navigation";
import { getInitials } from "@/utils/format";
import { NotificationPopover } from "./notification-popover";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

// ──────────────────────────────────────────────────────────
// TopBar component — premium glass header
// ──────────────────────────────────────────────────────────

export function TopBar() {
  const { user, currentView, navigate, unreadCount, setUnreadCount, sidebarCollapsed } = useAppStore();
  const { isConnected, isEnabled } = useRealtime();

  if (!user) return null;

  return (
    <header
      className={cn(
        "fixed top-0 right-0 left-0 lg:left-auto h-10 sm:h-[42px] z-30 flex items-center px-2.5 sm:px-3 gap-2 sm:gap-2.5 transition-all duration-300",
        "bg-card/60 backdrop-blur-xl border-b border-border/30",
        "shadow-[0_1px_3px_rgba(0,0,0,0.04)]",
        sidebarCollapsed ? "lg:left-[52px]" : "lg:left-[200px]"
      )}
    >
      <div className="flex-1 min-w-0">
        <h2 className="text-xs sm:text-[13px] font-semibold text-foreground truncate pl-10 lg:pl-0">
          {getViewTitle(currentView)}
        </h2>
      </div>

      <div className="flex items-center gap-2">
        {/* Notifications */}
        <NotificationPopover
          unreadCount={unreadCount}
          setUnreadCount={setUnreadCount}
          onNavigate={navigate}
        />

        {/* Quick profile with realtime status indicator */}
        <div className="relative">
          <Avatar className="w-7 h-7 cursor-pointer ring-2 ring-primary/20 hover:ring-primary/40 transition-all duration-300" onClick={() => navigate("profile")}>
            <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-bold">
              {getInitials(user.nom, user.prenom)}
            </AvatarFallback>
          </Avatar>
          {isEnabled && (
            <span
              className={cn(
                "absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-card transition-all duration-300",
                isConnected
                  ? "bg-blue-500 shadow-[0_0_6px_rgba(37,99,235,0.5)]"
                  : "bg-yellow-400 animate-pulse"
              )}
              title={isConnected ? "En ligne" : "Reconnexion..."}
            />
          )}
        </div>
      </div>
    </header>
  );
}
