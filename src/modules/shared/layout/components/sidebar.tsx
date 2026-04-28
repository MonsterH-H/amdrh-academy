"use client";

import { cn } from "@/lib/utils";
import { ROLE_LABELS, ROLE_COLORS } from "@/lib/constants";
import { useAppStore } from "@/store/app";
import { getInitials } from "@/utils/format";
import { getNavItemsForRole } from "../data/navigation";
import { SidebarNavItem } from "./sidebar-nav-item";
import {
  CircleDot,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";

// ──────────────────────────────────────────────────────────
// Sidebar component
// ──────────────────────────────────────────────────────────

export function Sidebar() {
  const { user, currentView, navigate, sidebarCollapsed, setSidebarCollapsed, logout, unreadCount } = useAppStore();

  if (!user) return null;

  const userRole = user.role as string;
  const navItems = getNavItemsForRole(userRole);

  const navContent = (collapsed: boolean) => (
    <div className="flex flex-col h-full">
      {/* Logo + Role badge */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-border/50 flex-shrink-0">
        <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
          <CircleDot className="w-5 h-5 text-white" />
        </div>
        {!collapsed && (
          <div className="animate-fadeIn flex items-center gap-2 min-w-0">
            <div className="min-w-0">
              <h1 className="font-bold text-sm text-foreground leading-tight">Académie</h1>
              <p className="text-[10px] text-muted-foreground font-medium tracking-wider uppercase">AMDRH</p>
            </div>
            <Badge
              variant="secondary"
              className={cn(
                "text-[9px] px-1.5 py-0 h-4 font-semibold flex-shrink-0",
                ROLE_COLORS[userRole] || ""
              )}
            >
              {ROLE_LABELS[userRole] || userRole}
            </Badge>
          </div>
        )}
      </div>

      {/* Scrollable Navigation */}
      <ScrollArea className="flex-1 min-h-0 scroll-smooth">
        <div className="px-3 py-4 space-y-1">
          {navItems.map((item, i) => {
            const showSectionHeader =
              item.section &&
              (i === 0 || navItems[i - 1].section !== item.section);

            return (
              <div key={item.view}>
                {showSectionHeader && (
                  <>
                    {i > 0 && <Separator className="my-3" />}
                    <p
                      className={cn(
                        "text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2 px-2",
                        collapsed && "text-center"
                      )}
                    >
                      {collapsed ? "•••" : item.section}
                    </p>
                  </>
                )}

                <SidebarNavItem
                  item={item}
                  isActive={currentView === item.view}
                  collapsed={collapsed}
                  onClick={() => navigate(item.view)}
                  badge={item.view === "messages" ? unreadCount : undefined}
                />
              </div>
            );
          })}
        </div>
      </ScrollArea>

      {/* User section — pinned at bottom */}
      <div className="border-t border-border/50 p-3 flex-shrink-0">
        <button
          onClick={() => navigate("profile")}
          className={cn(
            "w-full flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-muted/60 transition-all duration-200",
            collapsed && "justify-center"
          )}
        >
          <Avatar className="w-8 h-8 flex-shrink-0">
            <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
              {getInitials(user.nom, user.prenom)}
            </AvatarFallback>
          </Avatar>
          {!collapsed && (
            <div className="flex-1 text-left min-w-0">
              <p className="text-sm font-semibold text-foreground truncate">{user.prenom} {user.nom}</p>
              <Badge variant="secondary" className={cn("text-[10px] px-1.5 py-0 h-4", ROLE_COLORS[user.role] || "")}>
                {ROLE_LABELS[user.role] || user.role}
              </Badge>
            </div>
          )}
        </button>
        <button
          onClick={() => { logout(); navigate("landing"); }}
          className={cn(
            "w-full flex items-center gap-3 rounded-lg px-2 py-2 text-muted-foreground hover:text-destructive hover:bg-destructive/5 transition-all duration-200 mt-1",
            collapsed && "justify-center"
          )}
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          {!collapsed && <span className="text-xs">Déconnexion</span>}
        </button>
      </div>

      {/* Collapse toggle — desktop only */}
      <div className="hidden lg:block border-t border-border/50 p-2 flex-shrink-0">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="w-full flex items-center justify-center"
        >
          {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </Button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={cn(
          "hidden lg:flex flex-col fixed left-0 top-0 bottom-0 bg-card border-r border-border/60 z-40 transition-all duration-300 ease-out",
          sidebarCollapsed ? "w-[72px]" : "w-[280px]"
        )}
      >
        {navContent(sidebarCollapsed)}
      </aside>

      {/* Mobile sidebar (Sheet) — always full-width, never collapsed */}
      <Sheet>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden fixed top-2.5 sm:top-3 left-3 z-50 bg-card shadow-sm border border-border/50 rounded-lg"
          >
            <Menu className="w-5 h-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-[280px]">
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          {navContent(false)}
        </SheetContent>
      </Sheet>
    </>
  );
}
