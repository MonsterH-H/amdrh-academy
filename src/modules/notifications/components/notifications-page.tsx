"use client";

import { useEffect, useState } from "react";
import { useAppStore } from "@/store/app";
import { Button } from "@/components/ui/button";
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
  CheckCheck,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { NOTIFICATION_TYPE_LABELS } from "@/lib/constants";
import { NotificationItem } from "./notification-item";
import { BulkActionsToolbar } from "./bulk-actions-toolbar";
import { Checkbox } from "@/components/ui/checkbox";

// ──────────────────────────────────────────────────────────
// Time ago helper imported from @/utils/format
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
          <div
            key={i}
            className="flex items-start gap-3 p-4 rounded-xl border border-border/40"
          >
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

// ──────────────────────────────────────────────────────────
// Notifications Page
// ──────────────────────────────────────────────────────────

export function NotificationsPage() {
  const { user, setUnreadCount, navigate } = useAppStore();
  const [notifications, setNotifications] = useState<
    Array<Record<string, unknown>>
  >([]);
  const [activeType, setActiveType] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkLoading, setBulkLoading] = useState(false);

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
      toast.error("Erreur de chargement", { description: "Impossible de charger les notifications." });
    } finally {
      setLoading(false);
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === notifications.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(notifications.map((n) => n.id as string)));
    }
  };

  const markSelectedRead = async () => {
    if (!user || selectedIds.size === 0) return;
    setBulkLoading(true);
    try {
      await fetch("/api/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationIds: Array.from(selectedIds) }),
      });
      fetchNotifications(activeType);
      setSelectedIds(new Set());
    } catch {
      toast.error("Erreur", { description: "Impossible de marquer les notifications comme lues." });
    } finally {
      setBulkLoading(false);
    }
  };

  const deleteSelected = async () => {
    if (selectedIds.size === 0) return;
    setBulkLoading(true);
    try {
      await fetch("/api/notifications", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationIds: Array.from(selectedIds) }),
      });
      fetchNotifications(activeType);
      setSelectedIds(new Set());
    } catch {
      toast.error("Erreur", { description: "Impossible de supprimer les notifications." });
    } finally {
      setBulkLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    setSelectedIds(new Set());
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
      toast.error("Erreur", { description: "Impossible de marquer comme lu." });
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
      toast.error("Erreur", { description: "Impossible de tout marquer comme lu." });
    }
  };

  const unread = notifications.filter((n) => !(n.isRead as boolean)).length;

  const typeCounts: Record<string, number> = {};
  notifications.forEach((n) => {
    if (!(n.isRead as boolean)) {
      const t = (n.type as string) || "SYSTEME";
      typeCounts[t] = (typeCounts[t] || 0) + 1;
    }
  });

  const handleNotificationClick = (notif: Record<string, unknown>) => {
    if (!(notif.isRead as boolean)) {
      markAsRead(notif.id as string);
    }
    const link = notif.link as string | null | undefined;
    if (link) {
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

      {selectedIds.size > 0 && (
        <BulkActionsToolbar
          selectedCount={selectedIds.size}
          totalCount={notifications.length}
          allSelected={selectedIds.size === notifications.length && notifications.length > 0}
          loading={bulkLoading}
          onToggleSelectAll={toggleSelectAll}
          onMarkSelectedRead={markSelectedRead}
          onDeleteSelected={deleteSelected}
          onCancelSelection={() => setSelectedIds(new Set())}
        />
      )}

      <Tabs value={activeType} onValueChange={setActiveType}>
        <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0 pb-1">
          <TabsList className="bg-card border border-border/60 rounded-lg inline-flex min-w-max">
            {notificationTabs.map((tab) => {
              const TabIcon = tab.icon;
              const count =
                tab.value === "ALL"
                  ? unread
                  : typeCounts[tab.value] || 0;
              return (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className="text-xs rounded-md gap-1.5 px-3"
                >
                  {TabIcon && (
                    <TabIcon className="w-3 h-3 hidden sm:inline" />
                  )}
                  {tab.label}
                  {count > 0 && (
                    <span
                      className={cn(
                        "ml-0.5 min-w-[16px] h-4 px-1 rounded-full text-[9px] font-bold flex items-center justify-center",
                        activeType === tab.value
                          ? "bg-white/20 text-white"
                          : "bg-primary/10 text-primary"
                      )}
                    >
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
              <h3 className="font-semibold text-foreground mb-2">
                Aucune notification
              </h3>
              <p className="text-sm text-muted-foreground">
                {activeType === "ALL"
                  ? "Vous êtes à jour !"
                  : `Aucune notification de type ${NOTIFICATION_TYPE_LABELS[activeType] || activeType.toLowerCase()}`}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {notifications.map((notif, idx) => (
                <div key={notif.id as string} className="flex items-start gap-3">
                  <Checkbox
                    checked={selectedIds.has(notif.id as string)}
                    onCheckedChange={() => toggleSelect(notif.id as string)}
                    className="mt-4"
                  />
                  <div className="flex-1">
                    <NotificationItem
                      notif={notif}
                      index={idx}
                      onMarkAsRead={markAsRead}
                      onClick={handleNotificationClick}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
