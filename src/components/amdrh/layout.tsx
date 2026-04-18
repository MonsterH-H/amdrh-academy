"use client";

import { useState } from "react";
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
  Star,
  HelpCircle,
  Settings,
  CheckCheck,
  ChevronRight as ChevronRightIcon,
  Loader2,
  ClipboardList,
  BarChart3,
  Send,
  FolderOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ROLE_LABELS, ROLE_COLORS } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";

const mainNavItems = [
  { view: "dashboard" as const, label: "Tableau de bord", icon: LayoutDashboard },
  { view: "courses" as const, label: "Catalogue Cours", icon: BookOpen },
  { view: "learning-paths" as const, label: "Parcours Formation", icon: GraduationCap },
  { view: "messages" as const, label: "Messagerie", icon: MessageSquare },
  { view: "notifications" as const, label: "Notifications", icon: Bell },
  { view: "certificates" as const, label: "Certificats", icon: Award },
  { view: "badges" as const, label: "Badges", icon: Star },
];

// Admin items per CDC rights matrix:
// ADMIN: Full access to everything
// FORMATEUR: Can create/manage own courses & quizzes
// Others: No admin access
const adminNavItems: Record<string, Array<{ view: AppView; label: string; icon: typeof BookOpen }>> = {
  ADMIN: [
    { view: "admin-courses", label: "Gestion Cours", icon: BookOpen },
    { view: "admin-quizzes", label: "Gestion Quiz", icon: ClipboardList },
    { view: "admin-learning-paths", label: "Parcours Formation", icon: GraduationCap },
    { view: "admin-resources", label: "Médiathèque", icon: FolderOpen },
    { view: "admin-certificates", label: "Certificats & Badges", icon: Award },
    { view: "admin-notifications", label: "Notifications", icon: Send },
    { view: "admin-analytics", label: "Analyses", icon: BarChart3 },
    { view: "admin-users", label: "Utilisateurs", icon: Users },
    { view: "admin-sync", label: "Sync Fédération", icon: RefreshCw },
  ],
  FORMATEUR: [
    { view: "admin-courses", label: "Mes Cours", icon: BookOpen },
    { view: "admin-quizzes", label: "Mes Quiz", icon: ClipboardList },
    { view: "admin-resources", label: "Médiathèque", icon: FolderOpen },
  ],
};

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

const notificationTypeIcons: Record<string, typeof Bell> = {
  COURS: BookOpen,
  CERTIFICAT: Award,
  MESSAGE: MessageSquare,
  QUIZ: HelpCircle,
  BADGE: Star,
  SYSTEME: Settings,
};

const notificationTypeColors: Record<string, string> = {
  COURS: "bg-blue-100 text-blue-600",
  CERTIFICAT: "bg-amber-100 text-amber-600",
  MESSAGE: "bg-green-100 text-green-600",
  QUIZ: "bg-purple-100 text-purple-600",
  BADGE: "bg-pink-100 text-pink-600",
  SYSTEME: "bg-gray-100 text-gray-600",
};

function timeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffMs = now - then;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffH = Math.floor(diffMin / 60);
  const diffD = Math.floor(diffH / 24);

  if (diffSec < 60) return "à l'instant";
  if (diffMin < 60) return `il y a ${diffMin} min`;
  if (diffH < 24) return `il y a ${diffH}h`;
  if (diffD < 7) return `il y a ${diffD}j`;
  return new Date(dateStr).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
  });
}

export function Sidebar() {
  const { user, currentView, navigate, sidebarCollapsed, setSidebarCollapsed, setUser, unreadCount } = useAppStore();

  if (!user) return null;

  const userRole = user.role as string;
  const adminItems = adminNavItems[userRole] || [];

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

          {adminItems.length > 0 && (
            <>
              <Separator className="my-4" />
              <p className={cn("text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2 px-2", sidebarCollapsed && "text-center")}>
                {sidebarCollapsed ? "•••" : userRole === "FORMATEUR" ? "Formateur" : "Administration"}
              </p>
              {adminItems.map((item) => {
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
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifLoading, setNotifLoading] = useState(false);
  const [notifMarkingAll, setNotifMarkingAll] = useState(false);
  const [recentNotifs, setRecentNotifs] = useState<Array<{
    id: string;
    title: string;
    message: string;
    type: string;
    createdAt: string;
    isRead: boolean;
  }>>([]);

  const fetchUnreadCount = async () => {
    try {
      const res = await fetch(`/api/notifications?userId=${user!.id}&unreadOnly=true`);
      const data = await res.json();
      setUnreadCount(data.unreadCount || 0);
    } catch {
      // silently fail
    }
  };

  const fetchRecentNotifications = async () => {
    if (!user) return;
    setNotifLoading(true);
    try {
      const res = await fetch(`/api/notifications?userId=${user.id}&unreadOnly=true`);
      const data = await res.json();
      const notifs = (data.notifications || []).slice(0, 5);
      setRecentNotifs(notifs.map((n: Record<string, unknown>) => ({
        id: n.id as string,
        title: n.title as string,
        message: n.message as string,
        type: n.type as string,
        createdAt: n.createdAt as string,
        isRead: n.isRead as boolean,
      })));
      setUnreadCount(data.unreadCount || 0);
    } catch {
      // silently fail
    } finally {
      setNotifLoading(false);
    }
  };

  const handlePopoverOpenChange = (open: boolean) => {
    setNotifOpen(open);
    if (open) {
      fetchRecentNotifications();
    }
  };

  const handleMarkAllRead = async () => {
    if (!user || notifMarkingAll) return;
    setNotifMarkingAll(true);
    try {
      await fetch("/api/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markAll: true, userId: user.id }),
      });
      setUnreadCount(0);
      setRecentNotifs([]);
    } catch {
      // silently fail
    } finally {
      setNotifMarkingAll(false);
    }
  };

  const handleSeeAll = () => {
    setNotifOpen(false);
    navigate("notifications");
  };

  if (!user) return null;

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
        {/* Notifications Popover */}
        <Popover open={notifOpen} onOpenChange={handlePopoverOpenChange}>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="relative rounded-lg">
              <Bell className="w-5 h-5 text-muted-foreground" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-destructive text-white text-[9px] font-bold rounded-full w-4.5 h-4.5 min-w-[18px] min-h-[18px] flex items-center justify-center px-1">
                  {unreadCount}
                </span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent
            align="end"
            sideOffset={8}
            className="w-80 sm:w-96 p-0 rounded-lg shadow-lg border-border/60"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 pt-4 pb-2">
              <div>
                <h3 className="text-sm font-semibold text-foreground">Notifications</h3>
                {unreadCount > 0 && (
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {unreadCount} non lue{unreadCount > 1 ? "s" : ""}
                  </p>
                )}
              </div>
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs text-muted-foreground hover:text-foreground h-7 px-2 rounded-lg"
                  onClick={handleMarkAllRead}
                  disabled={notifMarkingAll}
                >
                  {notifMarkingAll ? (
                    <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                  ) : (
                    <CheckCheck className="w-3 h-3 mr-1" />
                  )}
                  Tout marquer comme lu
                </Button>
              )}
            </div>

            <Separator className="mx-4" />

            {/* Notifications list */}
            <div className="max-h-80 overflow-y-auto">
              {notifLoading ? (
                <div className="flex flex-col items-center justify-center py-8 gap-2">
                  <Loader2 className="w-5 h-5 text-muted-foreground animate-spin" />
                  <p className="text-xs text-muted-foreground">Chargement...</p>
                </div>
              ) : recentNotifs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 px-4">
                  <div className="w-12 h-12 rounded-full bg-muted/60 flex items-center justify-center mb-3">
                    <Bell className="w-5 h-5 text-muted-foreground/60" />
                  </div>
                  <p className="text-sm font-medium text-foreground">Aucune notification</p>
                  <p className="text-xs text-muted-foreground mt-1">Vous êtes à jour !</p>
                </div>
              ) : (
                <div className="py-1">
                  {recentNotifs.map((notif) => {
                    const Icon = notificationTypeIcons[notif.type] || Bell;
                    const colorClass = notificationTypeColors[notif.type] || "bg-gray-100 text-gray-600";
                    return (
                      <button
                        key={notif.id}
                        className="w-full flex items-start gap-3 px-4 py-3 hover:bg-muted/50 transition-colors text-left"
                        onClick={() => {
                          setNotifOpen(false);
                          navigate("notifications");
                        }}
                      >
                        <div className={cn(
                          "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5",
                          colorClass
                        )}>
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium text-foreground truncate">
                              {notif.title}
                            </p>
                            <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                            {notif.message}
                          </p>
                          <p className="text-[10px] text-muted-foreground/70 mt-1">
                            {timeAgo(notif.createdAt)}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            <Separator className="mx-4" />
            <div className="px-4 py-2.5">
              <button
                onClick={handleSeeAll}
                className="w-full flex items-center justify-center gap-1.5 text-xs font-medium text-primary hover:text-primary/80 transition-colors py-1 rounded-md hover:bg-primary/5"
              >
                Voir tout
                <ChevronRightIcon className="w-3 h-3" />
              </button>
            </div>
          </PopoverContent>
        </Popover>

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
    "admin-certificates": "Certificats & Badges",
    "admin-learning-paths": "Gestion des parcours",
    "admin-courses": "Gestion des cours",
    "admin-notifications": "Gestion des notifications",
    "admin-analytics": "Analytique",
    "admin-resources": "Médiathèque",
    profile: "Mon profil",
  };
  return titles[view] || view;
}
