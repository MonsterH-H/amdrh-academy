"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/app";
import { useRealtime } from "@/hooks/use-realtime";
import { formatTimeAgo } from "@/utils/format";
import { notificationTypeIcons, notificationTypeColors } from "../data/notification-config";
import { toast } from "sonner";
import { Bell, ChevronRight, Loader2, CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";

interface RecentNotif {
  id: string;
  title: string;
  message: string;
  type: string;
  createdAt: string;
  isRead: boolean;
}

interface NotificationPopoverProps {
  unreadCount: number;
  setUnreadCount: (count: number) => void;
  onNavigate: (view: "notifications") => void;
}

export function NotificationPopover({ unreadCount, setUnreadCount, onNavigate }: NotificationPopoverProps) {
  const { user, isAuthenticated } = useAppStore();
  const { subscribeNotifications, on } = useRealtime();
  const [notifOpen, setNotifOpen] = useState(false);
  const notifOpenRef = useRef(false);
  const [notifLoading, setNotifLoading] = useState(false);
  const [notifMarkingAll, setNotifMarkingAll] = useState(false);
  const [recentNotifs, setRecentNotifs] = useState<RecentNotif[]>([]);

  const fetchRecentNotifications = useCallback(async () => {
    if (!user) return;
    setNotifLoading(true);
    try {
      const res = await fetch(`/api/notifications?userId=${user.id}&unreadOnly=true`);
      if (!res.ok) return;
      const data = await res.json();
      const notifs = (data.notifications || []).slice(0, 5);
      setRecentNotifs(notifs.map((n: Record<string, unknown>) => ({
        id: n.id as string, title: n.title as string, message: n.message as string,
        type: n.type as string, createdAt: n.createdAt as string, isRead: n.isRead as boolean,
      })));
      setUnreadCount(data.unreadCount || 0);
    } catch { /* silently fail */ } finally { setNotifLoading(false); }
  }, [user, setUnreadCount]);

  useEffect(() => {
    if (!isAuthenticated || !user) return;
    subscribeNotifications();
  }, [isAuthenticated, user, subscribeNotifications]);

  useEffect(() => {
    const unsubNewNotif = on("notification:new", (...args: unknown[]) => {
      const data = args[0] as Record<string, unknown> | undefined;
      if (data) {
        toast.info(data.title as string || "Nouvelle notification", { description: data.message as string, duration: 5000 });
        if (notifOpenRef.current) fetchRecentNotifications();
      }
    });
    const unsubPresence = on("presence:change", () => { /* future presence-based features */ });
    return () => { unsubNewNotif(); unsubPresence(); };
  }, [on, fetchRecentNotifications]);

  const handleOpenChange = (open: boolean) => { setNotifOpen(open); notifOpenRef.current = open; if (open) fetchRecentNotifications(); };

  const handleMarkAllRead = async () => {
    if (!user || notifMarkingAll) return;
    setNotifMarkingAll(true);
    try {
      const res = await fetch("/api/notifications", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ markAll: true, userId: user.id }) });
      if (!res.ok) return;
      setUnreadCount(0);
      setRecentNotifs([]);
    } catch { /* silently fail */ } finally { setNotifMarkingAll(false); }
  };

  const handleSeeAll = () => { setNotifOpen(false); onNavigate("notifications"); };

  return (
    <Popover open={notifOpen} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative rounded-lg">
          <Bell className="w-5 h-5 text-muted-foreground" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 bg-destructive text-white text-[9px] font-bold rounded-full w-4.5 h-4.5 min-w-[18px] min-h-[18px] flex items-center justify-center px-1">{unreadCount}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" sideOffset={8} className="w-80 max-w-[calc(100vw-2rem)] sm:w-96 p-0 rounded-lg shadow-lg border-border/60">
        <div className="flex items-center justify-between px-4 pt-4 pb-2">
          <div>
            <h3 className="text-sm font-semibold text-foreground">Notifications</h3>
            {unreadCount > 0 && <p className="text-xs text-muted-foreground mt-0.5">{unreadCount} non lue{unreadCount > 1 ? "s" : ""}</p>}
          </div>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" className="text-xs text-muted-foreground hover:text-foreground h-7 px-2 rounded-lg" onClick={handleMarkAllRead} disabled={notifMarkingAll}>
              {notifMarkingAll ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <CheckCheck className="w-3 h-3 mr-1" />}
              Tout marquer comme lu
            </Button>
          )}
        </div>
        <Separator className="mx-4" />
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
                const colorClass = notificationTypeColors[notif.type] || "bg-muted text-muted-foreground";
                return (
                  <button key={notif.id} className="w-full flex items-start gap-3 px-4 py-3 hover:bg-muted/50 transition-colors text-left"
                    onClick={() => { setNotifOpen(false); onNavigate("notifications"); }}>
                    <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5", colorClass)}>
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-foreground truncate">{notif.title}</p>
                        <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{notif.message}</p>
                      <p className="text-[10px] text-muted-foreground/70 mt-1">{formatTimeAgo(notif.createdAt)}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
        <Separator className="mx-4" />
        <div className="px-4 py-2.5">
          <button onClick={handleSeeAll} className="w-full flex items-center justify-center gap-1.5 text-xs font-medium text-primary hover:text-primary/80 transition-colors py-1 rounded-md hover:bg-primary/5">
            Voir tout <ChevronRight className="w-3 h-3" />
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
