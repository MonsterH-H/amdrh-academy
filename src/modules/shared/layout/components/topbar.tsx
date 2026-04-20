"use client";

import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/app";
import { useRealtime } from "@/hooks/use-realtime";
import { getViewTitle } from "@/utils/navigation";
import { getInitials } from "@/utils/format";
import { NotificationPopover } from "./notification-popover";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

// ──────────────────────────────────────────────────────────
// TopBar component
// ──────────────────────────────────────────────────────────

export function TopBar() {
  const { user, currentView, navigate, unreadCount, setUnreadCount, sidebarCollapsed } = useAppStore();
  const { isConnected } = useRealtime();

  if (!user) return null;

  return (
    <header
      className={cn(
        "fixed top-0 right-0 left-0 lg:left-auto h-14 sm:h-16 bg-white/80 backdrop-blur-xl border-b border-border/40 z-30 flex items-center px-3 sm:px-4 gap-2 sm:gap-4 transition-all duration-300",
        sidebarCollapsed ? "lg:left-[72px]" : "lg:left-[280px]"
      )}
    >
      <div className="flex-1 min-w-0">
        <h2 className="text-base sm:text-lg font-semibold text-foreground truncate pl-10 lg:pl-0">
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
          <Avatar className="w-8 h-8 cursor-pointer" onClick={() => navigate("profile")}>
            <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
              {getInitials(user.nom, user.prenom)}
            </AvatarFallback>
          </Avatar>
          <span
            className={cn(
              "absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white transition-colors duration-300",
              isConnected ? "bg-green-500" : "bg-yellow-400 animate-pulse"
            )}
            title={isConnected ? "En ligne" : "Reconnexion..."}
          />
        </div>
      </div>
    </header>
  );
}
