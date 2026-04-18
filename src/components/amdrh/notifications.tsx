"use client";

import { useEffect, useState } from "react";
import { useAppStore } from "@/store/app";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Bell, BookOpen, Award, MessageSquare, HelpCircle, Star, Settings,
  Check, CheckCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { NOTIFICATION_TYPE_LABELS } from "@/lib/constants";

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

export function NotificationsPage() {
  const { user, setUnreadCount } = useAppStore();
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
    fetchNotifications(activeType);
  }, [user, activeType]);

  const markAsRead = async (id: string) => {
    await fetch("/api/notifications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notificationId: id }),
    });
    fetchNotifications(activeType);
  };

  const markAllAsRead = async () => {
    if (!user) return;
    await fetch("/api/notifications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ markAll: true, userId: user.id }),
    });
    fetchNotifications(activeType);
  };

  const unread = notifications.filter((n) => !n.isRead).length;

  if (loading) return <NotificationsSkeleton />;

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Notifications</h2>
          <p className="text-muted-foreground mt-1">
            {unread > 0 ? `${unread} non lue${unread > 1 ? "s" : ""}` : "Tout est lu"}
          </p>
        </div>
        {unread > 0 && (
          <Button variant="outline" size="sm" className="text-xs rounded-lg" onClick={markAllAsRead}>
            <CheckCheck className="w-3 h-3 mr-1.5" /> Tout marquer comme lu
          </Button>
        )}
      </div>

      <Tabs value={activeType} onValueChange={setActiveType}>
        <TabsList className="bg-white border border-border/60 rounded-lg">
          <TabsTrigger value="ALL" className="text-xs rounded-md">Toutes</TabsTrigger>
          <TabsTrigger value="COURS" className="text-xs rounded-md">Cours</TabsTrigger>
          <TabsTrigger value="QUIZ" className="text-xs rounded-md">Quiz</TabsTrigger>
          <TabsTrigger value="CERTIFICAT" className="text-xs rounded-md">Certificats</TabsTrigger>
          <TabsTrigger value="BADGE" className="text-xs rounded-md">Badges</TabsTrigger>
        </TabsList>

        <TabsContent value={activeType} className="mt-4">
          {notifications.length === 0 ? (
            <div className="text-center py-20">
              <Bell className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
              <h3 className="font-semibold text-foreground mb-2">Aucune notification</h3>
              <p className="text-sm text-muted-foreground">Vous êtes à jour !</p>
            </div>
          ) : (
            <div className="space-y-2">
              {notifications.map((notif) => {
                const Icon = typeIcons[(notif.type as string) || "SYSTEME"] || Bell;
                const colorClass = typeColors[(notif.type as string) || "SYSTEME"] || "bg-gray-100 text-gray-600";
                return (
                  <Card
                    key={notif.id as string}
                    className={cn(
                      "border-border/60 transition-all cursor-pointer hover:shadow-sm",
                      !(notif.isRead as boolean) && "bg-blue-50/50 border-blue-200/60"
                    )}
                    onClick={() => !(notif.isRead as boolean) && markAsRead(notif.id as string)}
                  >
                    <CardContent className="p-4 flex items-start gap-3">
                      <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0", colorClass)}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className={cn("text-sm font-medium", !(notif.isRead as boolean) ? "text-foreground" : "text-muted-foreground")}>
                            {notif.title as string}
                          </p>
                          {!(notif.isRead as boolean) && (
                            <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{notif.message as string}</p>
                        <p className="text-[10px] text-muted-foreground mt-1">
                          {new Date(notif.createdAt as string).toLocaleDateString("fr-FR", {
                            day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
                          })}
                        </p>
                      </div>
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

function NotificationsSkeleton() {
  return <div className="space-y-4"><Skeleton className="h-8 w-48" />{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)}</div>;
}
