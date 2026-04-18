"use client";

import { useAppStore } from "@/store/app";
import {
  LayoutDashboard,
  BookOpen,
  GraduationCap,
  Award,
  MessageSquare,
  Bell,
  Users,
  RefreshCw,
  User,
  LogOut,
  ChevronLeft,
  ChevronRight,
  CircleDot,
  Menu,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ROLE_LABELS, ROLE_COLORS } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";

const mainNavItems = [
  { view: "dashboard" as const, label: "Tableau de bord", icon: LayoutDashboard },
  { view: "courses" as const, label: "Catalogue Cours", icon: BookOpen },
  { view: "learning-paths" as const, label: "Parcours Formation", icon: GraduationCap },
  { view: "messages" as const, label: "Messagerie", icon: MessageSquare },
  { view: "certificates" as const, label: "Certificats", icon: Award },
];

const adminNavItems = [
  { view: "admin-users" as const, label: "Gestion Utilisateurs", icon: Users },
  { view: "admin-sync" as const, label: "Sync Fédération", icon: RefreshCw },
];

const bottomNavItems = [
  { view: "dashboard" as const, label: "Accueil", icon: LayoutDashboard },
  { view: "courses" as const, label: "Cours", icon: BookOpen },
  { view: "learning-paths" as const, label: "Parcours", icon: GraduationCap },
  { view: "messages" as const, label: "Messages", icon: MessageSquare },
  { view: "profile" as const, label: "Profil", icon: User },
];

function getInitials(nom: string, prenom: string) {
  return `${prenom.charAt(0)}${nom.charAt(0)}`.toUpperCase();
}

export function Sidebar() {
  const { user, currentView, navigate, sidebarCollapsed, setSidebarCollapsed, setUser, unreadCount } = useAppStore();

  if (!user) return null;

  const isAdmin = user.role === "ADMIN" || user.role === "FORMATEUR";

  const navContent = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-border/50">
        <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
          <CircleDot className="w-5 h-5 text-white" />
        </div>
        {!sidebarCollapsed && (
          <div className="animate-fadeIn">
            <h1 className="font-bold text-sm text-foreground leading-tight">Académie</h1>
            <p className="text-[10px] text-muted-foreground font-medium tracking-wider uppercase">AMDRH</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 py-4">
        <div className="px-3 space-y-1">
          <p className={cn("text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2 px-2", sidebarCollapsed && "text-center")}>
            {sidebarCollapsed ? "•••" : "Navigation"}
          </p>
          {mainNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.view;
            return (
              <button
                key={item.view}
                onClick={() => navigate(item.view)}
                className={cn(
                  "w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-primary/10 text-primary shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/60",
                  sidebarCollapsed && "justify-center px-2"
                )}
                title={sidebarCollapsed ? item.label : undefined}
              >
                <Icon className="w-[18px] h-[18px] flex-shrink-0" />
                {!sidebarCollapsed && <span>{item.label}</span>}
                {item.view === "messages" && unreadCount > 0 && !sidebarCollapsed && (
                  <span className="ml-auto bg-destructive text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>
            );
          })}

          {isAdmin && (
            <>
              <Separator className="my-4" />
              <p className={cn("text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2 px-2", sidebarCollapsed && "text-center")}>
                {sidebarCollapsed ? "•••" : "Administration"}
              </p>
              {adminNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentView === item.view;
                return (
                  <button
                    key={item.view}
                    onClick={() => navigate(item.view)}
                    className={cn(
                      "w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                      isActive
                        ? "bg-primary/10 text-primary shadow-sm"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/60",
                      sidebarCollapsed && "justify-center px-2"
                    )}
                    title={sidebarCollapsed ? item.label : undefined}
                  >
                    <Icon className="w-[18px] h-[18px] flex-shrink-0" />
                    {!sidebarCollapsed && <span>{item.label}</span>}
                  </button>
                );
              })}
            </>
          )}
        </div>
      </ScrollArea>

      {/* User section */}
      <div className="border-t border-border/50 p-3">
        <button
          onClick={() => navigate("profile")}
          className={cn(
            "w-full flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-muted/60 transition-all duration-200",
            sidebarCollapsed && "justify-center"
          )}
        >
          <Avatar className="w-8 h-8">
            <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
              {getInitials(user.nom, user.prenom)}
            </AvatarFallback>
          </Avatar>
          {!sidebarCollapsed && (
            <div className="flex-1 text-left min-w-0">
              <p className="text-sm font-semibold text-foreground truncate">{user.prenom} {user.nom}</p>
              <Badge variant="secondary" className={cn("text-[10px] px-1.5 py-0 h-4", ROLE_COLORS[user.role] || "")}>
                {ROLE_LABELS[user.role] || user.role}
              </Badge>
            </div>
          )}
        </button>
        <button
          onClick={() => { setUser(null); navigate("landing"); }}
          className={cn(
            "w-full flex items-center gap-3 rounded-lg px-2 py-2 text-muted-foreground hover:text-destructive hover:bg-destructive/5 transition-all duration-200 mt-1",
            sidebarCollapsed && "justify-center"
          )}
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          {!sidebarCollapsed && <span className="text-xs">Déconnexion</span>}
        </button>
      </div>

      {/* Collapse toggle - desktop only */}
      <div className="hidden lg:block border-t border-border/50 p-2">
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
          "hidden lg:flex flex-col fixed left-0 top-0 bottom-0 bg-white border-r border-border/60 z-40 transition-all duration-300 ease-out",
          sidebarCollapsed ? "w-[72px]" : "w-[280px]"
        )}
      >
        {navContent}
      </aside>

      {/* Mobile sidebar (Sheet) */}
      <Sheet>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden fixed top-3 left-3 z-50 bg-white shadow-sm border border-border/50 rounded-lg"
          >
            <Menu className="w-5 h-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-[280px]">
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          {navContent}
        </SheetContent>
      </Sheet>
    </>
  );
}

export function MobileBottomNav() {
  const { user, currentView, navigate, unreadCount, isAuthenticated } = useAppStore();

  if (!user || !isAuthenticated) return null;

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-border/60 z-50 pb-safe">
      <div className="flex items-center justify-around px-2 py-2">
        {bottomNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.view;
          return (
            <button
              key={item.view}
              onClick={() => navigate(item.view)}
              className="flex flex-col items-center gap-0.5 py-1 px-3 rounded-lg transition-all duration-200"
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

export function TopBar() {
  const { user, currentView, navigate, unreadCount, setUnreadCount, sidebarCollapsed } = useAppStore();

  if (!user) return null;

  const fetchUnreadCount = async () => {
    try {
      const res = await fetch(`/api/notifications?userId=${user.id}&unreadOnly=true`);
      const data = await res.json();
      setUnreadCount(data.unreadCount || 0);
    } catch {
      // silently fail
    }
  };

  return (
    <header
      className={cn(
        "fixed top-0 right-0 left-0 lg:left-auto h-16 bg-white/80 backdrop-blur-xl border-b border-border/40 z-30 flex items-center px-4 gap-4 transition-all duration-300",
        sidebarCollapsed ? "lg:left-[72px]" : "lg:left-[280px]"
      )}
    >
      <div className="flex-1 min-w-0">
        <h2 className="text-lg font-semibold text-foreground truncate pl-10 lg:pl-0">
          {getViewTitle(currentView)}
        </h2>
      </div>

      <div className="flex items-center gap-2">
        {/* Notifications */}
        <Button
          variant="ghost"
          size="icon"
          className="relative rounded-lg"
          onClick={() => navigate("notifications")}
        >
          <Bell className="w-5 h-5 text-muted-foreground" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 bg-destructive text-white text-[9px] font-bold rounded-full w-4.5 h-4.5 min-w-[18px] min-h-[18px] flex items-center justify-center px-1">
              {unreadCount}
            </span>
          )}
        </Button>

        {/* Quick profile */}
        <Avatar className="w-8 h-8 cursor-pointer" onClick={() => navigate("profile")}>
          <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
            {getInitials(user.nom, user.prenom)}
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}

function getViewTitle(view: string): string {
  const titles: Record<string, string> = {
    landing: "Académie AMDRH",
    login: "Connexion",
    register: "Inscription",
    dashboard: "Tableau de bord",
    courses: "Catalogue des cours",
    "course-detail": "Détail du cours",
    "learning-paths": "Parcours de formation",
    quiz: "Quiz",
    certificates: "Certificats",
    badges: "Badges",
    messages: "Messagerie",
    conversation: "Conversation",
    notifications: "Notifications",
    "admin-users": "Gestion des utilisateurs",
    "admin-user-detail": "Détail utilisateur",
    "admin-sync": "Synchronisation Fédération",
    profile: "Mon profil",
  };
  return titles[view] || view;
}
