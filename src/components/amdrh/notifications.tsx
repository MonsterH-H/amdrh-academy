"use client";

import { useEffect, useState } from "react";
import { useAppStore } from "@/store/app";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Bell,
  BookOpen,
  Award,
  MessageSquare,
  HelpCircle,
  Star,
  Settings,
  Check,
  CheckCheck,
  Circle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { NOTIFICATION_TYPE_LABELS } from "@/lib/constants";

// ──────────────────────────────────────────────────────────
// Type icons & colors
// ──────────────────────────────────────────────────────────

const typeIcons: Record<string, typeof BookOpen> = {
  COURS: BookOpen,
  CERTIFICAT: Award,
  MESSAGE: MessageSquare,
  QUIZ: HelpCircle,
  BADGE: Star,
  SYSTEME: Settings,
};

const typeColors: Record<string, string> = {
  COURS: "bg-blue-100 text-blue-600",
  CERTIFICAT: "bg-amber-100 text-amber-600",
  MESSAGE: "bg-green-100 text-green-600",
  QUIZ: "bg-purple-100 text-purple-600",
  BADGE: "bg-pink-100 text-pink-600",
  SYSTEME: "bg-gray-100 text-gray-600",
};

// ──────────────────────────────────────────────────────────
// Time ago helper
// ──────────────────────────────────────────────────────────

function formatTimeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "À l'instant";
  if (diffMins < 60) return `Il y a ${diffMins} min`;
  if (diffHours < 24) return `Il y a ${diffHours}h`;
  if (diffDays < 7) return `Il y a ${diffDays}j`;
  return date.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}

// ──────────────────────────────────────────────────────────
// Notification type tabs
// ──────────────────────────────────────────────────────────

const notificationTabs = [
  { value: "ALL", label: "Toutes" },
  { value: "COURS", label: "Cours", icon: BookOpen },
  { value: "QUIZ", label: "Quiz", icon: HelpCircle },
  { value: "CERTIFICAT", label: "Certificats", icon: Award },
  { value: "BADGE", label: "Badges", icon: Star },
  { value: "MESSAGE", label: "Messages", icon: MessageSquare },
  { value: "SYSTEME", label: "Système", icon: Settings },
];

// ──────────────────────────────────────────────────────────
// Notifications Page
// ──────────────────────────────────────────────────────────

export function NotificationsPage() {
  const { user, setUnreadCount, navigate } = useAppStore();
  const [notifications, setNotifications] = useState<Array<Record<string, unknown>>>([]);
  const [activeType, setActiveType] = useState("ALL");
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async (type?: string) => {
    if (!user) return;
    try {
      const params = new URLSearchParams({ userId: user.id });
      if (type && type !== "ALL") params.set("type", type);
      const res = await fetch(`/api/notifications?${params}`);
      const data = await res.json();
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchNotifications(activeType);
  }, [user, activeType]);

  const markAsRead = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      await fetch("/api/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationId: id }),
      });
      fetchNotifications(activeType);
    } catch {
      // silent fail
    }
  };

  const markAllAsRead = async () => {
    if (!user) return;
    try {
      await fetch("/api/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markAll: true, userId: user.id }),
      });
      fetchNotifications(activeType);
    } catch {
      // silent fail
    }
  };

  const unread = notifications.filter((n) => !(n.isRead as boolean)).length;

  // Count per type for badges
  const typeCounts: Record<string, number> = {};
  notifications.forEach((n) => {
    if (!(n.isRead as boolean)) {
      const t = (n.type as string) || "SYSTEME";
      typeCounts[t] = (typeCounts[t] || 0) + 1;
    }
  });

  const handleNotificationClick = (notif: Record<string, unknown>) => {
    // Mark as read
    if (!(notif.isRead as boolean)) {
      markAsRead(notif.id as string);
    }
    // Navigate if link exists
    const link = notif.link as string | null | undefined;
    if (link) {
      // Parse simple link patterns
      if (link.startsWith("/messages/")) {
        const convId = link.replace("/messages/", "");
        navigate("conversation", { id: convId });
      }
    }
  };

  if (loading) return <NotificationsSkeleton />;

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Notifications</h2>
          <p className="text-muted-foreground mt-1">
            {unread > 0 ? `${unread} non lue${unread > 1 ? "s" : ""}` : "Tout est lu ✓"}
          </p>
        </div>
        {unread > 0 && (
          <Button
            variant="outline"
            size="sm"
            className="text-xs rounded-lg"
            onClick={markAllAsRead}
          >
            <CheckCheck className="w-3 h-3 mr-1.5" />
            Tout marquer comme lu
          </Button>
        )}
      </div>

      <Tabs value={activeType} onValueChange={setActiveType}>
        <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0 pb-1">
          <TabsList className="bg-white border border-border/60 rounded-lg inline-flex min-w-max">
            {notificationTabs.map((tab) => {
              const TabIcon = tab.icon;
              const count = tab.value === "ALL" ? unread : (typeCounts[tab.value] || 0);
              return (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className="text-xs rounded-md gap-1.5 px-3"
                >
                  {TabIcon && <TabIcon className="w-3 h-3 hidden sm:inline" />}
                  {tab.label}
                  {count > 0 && (
                    <span className={cn(
                      "ml-0.5 min-w-[16px] h-4 px-1 rounded-full text-[9px] font-bold flex items-center justify-center",
                      activeType === tab.value
                        ? "bg-white/20 text-white"
                        : "bg-primary/10 text-primary"
                    )}>
                      {count}
                    </span>
                  )}
                </TabsTrigger>
              );
            })}
          </TabsList>
        </div>

        <TabsContent value={activeType} className="mt-4">
          {notifications.length === 0 ? (
            <div className="text-center py-20 animate-fadeIn">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                <Bell className="w-8 h-8 text-muted-foreground/40" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Aucune notification</h3>
              <p className="text-sm text-muted-foreground">
                {activeType === "ALL"
                  ? "Vous êtes à jour !"
                  : `Aucune notification de type ${NOTIFICATION_TYPE_LABELS[activeType] || activeType.toLowerCase()}`}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {notifications.map((notif, idx) => {
                const Icon = typeIcons[(notif.type as string) || "SYSTEME"] || Bell;
                const colorClass = typeColors[(notif.type as string) || "SYSTEME"] || "bg-gray-100 text-gray-600";
                const isRead = notif.isRead as boolean;
                const type = (notif.type as string) || "SYSTEME";

                return (
                  <Card
                    key={notif.id as string}
                    className={cn(
                      "border-border/60 transition-all cursor-pointer hover:shadow-sm animate-fadeIn",
                      !isRead && "bg-primary/[0.03] border-primary/15",
                      isRead && "opacity-75"
                    )}
                    style={{ animationDelay: `${Math.min(idx * 30, 300)}ms` }}
                    onClick={() => handleNotificationClick(notif)}
                  >
                    <CardContent className="p-4 flex items-start gap-3">
                      <div className={cn(
                        "w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0",
                        colorClass
                      )}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className={cn(
                            "text-sm truncate",
                            !isRead ? "font-semibold text-foreground" : "font-medium text-muted-foreground"
                          )}>
                            {notif.title as string}
                          </p>
                          {!isRead && (
                            <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                          {notif.message as string}
                        </p>
                        <div className="flex items-center gap-2 mt-1.5">
                          <span className="text-[10px] text-muted-foreground/70">
                            {formatTimeAgo(notif.createdAt as string)}
                          </span>
                          {NOTIFICATION_TYPE_LABELS[type] && (
                            <Badge
                              variant="secondary"
                              className="text-[9px] px-1.5 py-0 opacity-60"
                            >
                              {NOTIFICATION_TYPE_LABELS[type]}
                            </Badge>
                          )}
                        </div>
                      </div>
                      {/* Mark as read button */}
                      {!isRead && (
                        <button
                          onClick={(e) => markAsRead(notif.id as string, e)}
                          className="flex-shrink-0 p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                          title="Marquer comme lu"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {isRead && (
                        <Circle className="w-3.5 h-3.5 text-muted-foreground/20 flex-shrink-0 mt-1.5" />
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ──────────────────────────────────────────────────────────
// Skeleton
// ──────────────────────────────────────────────────────────

function NotificationsSkeleton() {
  return (
    <div className="space-y-4 animate-fadeIn">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-7 w-44" />
          <Skeleton className="h-4 w-28" />
        </div>
        <Skeleton className="h-9 w-36 rounded-lg" />
      </div>
      <Skeleton className="h-10 w-full rounded-lg" />
      <div className="space-y-2">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-start gap-3 p-4 rounded-xl border border-border/40">
            <Skeleton className="w-9 h-9 rounded-lg" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-3.5 w-48" />
              <Skeleton className="h-3 w-64" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
