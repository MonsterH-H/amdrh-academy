"use client";

import { cn } from "@/lib/utils";
import type { NavItem } from "../types";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// ──────────────────────────────────────────────────────────
// Sidebar nav item button (with tooltip support when collapsed)
// ──────────────────────────────────────────────────────────

interface SidebarNavItemProps {
  item: NavItem;
  isActive: boolean;
  collapsed: boolean;
  onClick: () => void;
  badge?: number;
}

export function SidebarNavItem({
  item,
  isActive,
  collapsed,
  onClick,
  badge,
}: SidebarNavItemProps) {
  const Icon = item.icon;

  const button = (
    <button
      onClick={onClick}
      className={cn(
        "relative w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
        item.view === "course-create"
          ? isActive
            ? "bg-primary text-primary-foreground shadow-sm"
            : "bg-primary/5 border border-primary/20 text-primary hover:bg-primary/10"
          : isActive
            ? "bg-primary/10 text-primary shadow-sm"
            : "text-muted-foreground hover:text-foreground hover:bg-muted/60",
        collapsed && "justify-center px-2"
      )}
    >
      {/* Emerald accent line on active item */}
      {isActive && item.view !== "course-create" && (
        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-primary" />
      )}
      <Icon className={cn("w-[18px] h-[18px] flex-shrink-0", isActive && item.view !== "course-create" && "drop-shadow-[0_0_6px_rgba(16,185,129,0.4)]")} />
      {!collapsed && <span>{item.label}</span>}
      {badge !== undefined && badge > 0 && !collapsed && (
        <span className="ml-auto bg-destructive text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
          {badge > 9 ? "9+" : badge}
        </span>
      )}
    </button>
  );

  if (collapsed) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{button}</TooltipTrigger>
        <TooltipContent side="right" sideOffset={8}>
          {item.label}
        </TooltipContent>
      </Tooltip>
    );
  }

  return button;
}
