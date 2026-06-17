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
// Sidebar component — premium glass-morphism design
// ──────────────────────────────────────────────────────────

export function Sidebar() {
  const { user, currentView, navigate, sidebarCollapsed, setSidebarCollapsed, logout, unreadCount } = useAppStore();

  if (!user) return null;

  const userRole = user.role as string;
  const navItems = getNavItemsForRole(userRole);

  const navContent = (collapsed: boolean) => (
    <div className="flex flex-col h-full">
      {/* Logo + Role badge — cleaner branding */}
      <div className="flex items-center gap-2 px-2.5 py-2.5 border-b border-border/40 flex-shrink-0">
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-primary/20">
          <CircleDot className="w-3.5 h-3.5 text-white" />
        </div>
        {!collapsed && (
          <div className="animate-fadeIn flex items-center gap-1.5 min-w-0">
            <div className="min-w-0">
              <h1 className="font-bold text-[11px] text-foreground leading-tight tracking-tight">Académie</h1>
              <p className="text-[8px] text-primary/70 font-semibold tracking-[0.12em] uppercase">AMDRH</p>
            </div>
            <Badge
              variant="secondary"
              className={cn(
                "text-[7px] px-1 py-0 h-3 font-semibold flex-shrink-0",
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
        <div className="px-1.5 py-1.5 space-y-0.5">
          {navItems.map((item, i) => {
            const showSectionHeader =
              item.section &&
              (i === 0 || navItems[i - 1].section !== item.section);

            return (
              <div key={item.view}>
                {showSectionHeader && (
                  <>
                    {i > 0 && <Separator className="my-2" />}
                    <p
                      className={cn(
                        "text-[9px] font-semibold uppercase tracking-wider text-muted-foreground/60 mb-1.5 px-2",
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

      {/* User section — polished with blue avatar ring */}
      <div className="border-t border-border/40 p-3 flex-shrink-0">
        <button
          onClick={() => navigate("profile")}
          className={cn(
            "w-full flex items-center gap-2.5 rounded-lg px-2 py-2 hover:bg-muted/50 transition-all duration-200 group",
            collapsed && "justify-center"
          )}
        >
          <div className="relative flex-shrink-0">
            <Avatar className="w-6 h-6">
              <AvatarFallback className="bg-primary/10 text-primary text-[9px] font-bold">
                {getInitials(user.nom, user.prenom)}
              </AvatarFallback>
            </Avatar>
            {/* Blue ring around avatar */}
            <span className="absolute -inset-0.5 rounded-full ring-2 ring-primary/30 group-hover:ring-primary/50 transition-all duration-300" />
          </div>
          {!collapsed && (
            <div className="flex-1 text-left min-w-0">
              <p className="text-[11px] font-semibold text-foreground truncate leading-tight">{user.prenom} {user.nom}</p>
              <Badge variant="secondary" className={cn("text-[8px] px-1 py-0 h-3 mt-0.5", ROLE_COLORS[user.role] || "")}>
                {ROLE_LABELS[user.role] || user.role}
              </Badge>
            </div>
          )}
        </button>
        {/* Déconnexion button */}
        <button
          onClick={() => { logout(); navigate("landing"); }}
          className={cn(
            "w-full flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/5 transition-all duration-200 mt-0.5 group",
            collapsed && "justify-center"
          )}
        >
          <LogOut className="w-3 h-3 flex-shrink-0 group-hover:rotate-12 transition-transform duration-200" />
          {!collapsed && <span className="text-[10px] font-medium">Déconnexion</span>}
        </button>
      </div>

      {/* Collapse toggle — desktop only */}
      <div className="hidden lg:block border-t border-border/40 p-2 flex-shrink-0">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="w-full flex items-center justify-center rounded-lg hover:bg-muted/50 transition-all duration-200"
        >
          <div className={cn("transition-transform duration-300 ease-out", sidebarCollapsed && "rotate-180")}>
            {sidebarCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
          </div>
        </Button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar — glass morphism */}
      <aside
        className={cn(
          "hidden lg:flex flex-col fixed left-0 top-0 bottom-0 z-40 transition-all duration-300 ease-out",
          "bg-card/70 backdrop-blur-xl border-r border-border/40",
          "shadow-[0_0_40px_rgba(0,0,0,0.04)]",
          sidebarCollapsed ? "w-[52px]" : "w-[200px]"
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
            className="lg:hidden fixed top-2.5 sm:top-3 left-3 z-50 bg-card/80 backdrop-blur-md shadow-sm border border-border/40 rounded-xl hover:bg-muted/50 transition-all duration-200"
          >
            <Menu className="w-5 h-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-[200px] bg-card/95 backdrop-blur-xl border-border/40">
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          {navContent(false)}
        </SheetContent>
      </Sheet>
    </>
  );
}
