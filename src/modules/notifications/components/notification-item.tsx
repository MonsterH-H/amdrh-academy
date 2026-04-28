"use client";

import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Bell,
  BookOpen,
  Award,
  MessageSquare,
  HelpCircle,
  Star,
  Settings,
  Check,
  Circle,
} from "lucide-react";
import { NOTIFICATION_TYPE_LABELS } from "@/lib/constants";
import { formatTimeAgo } from "@/utils/format";

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
  COURS: "bg-primary/10 text-primary",
  CERTIFICAT: "bg-amber-500/10 text-amber-600",
  MESSAGE: "bg-emerald-500/10 text-emerald-600",
  QUIZ: "bg-violet-500/10 text-violet-600",
  BADGE: "bg-pink-500/10 text-pink-600",
  SYSTEME: "bg-muted text-muted-foreground",
};

// ──────────────────────────────────────────────────────────
// Notification Item
// ──────────────────────────────────────────────────────────

export interface NotificationItemProps {
  notif: Record<string, unknown>;
  index: number;
  onMarkAsRead: (id: string, e?: React.MouseEvent) => void;
  onClick: (notif: Record<string, unknown>) => void;
}

export function NotificationItem({
  notif,
  index,
  onMarkAsRead,
  onClick,
}: NotificationItemProps) {
  const Icon = typeIcons[(notif.type as string) || "SYSTEME"] || Bell;
  const colorClass =
    typeColors[(notif.type as string) || "SYSTEME"] ||
    "bg-muted text-muted-foreground";
  const isRead = notif.isRead as boolean;
  const type = (notif.type as string) || "SYSTEME";

  return (
    <Card
      className={cn(
        "border-border/60 transition-all cursor-pointer hover:shadow-sm animate-fadeIn",
        !isRead && "bg-primary/[0.03] border-primary/15",
        isRead && "opacity-75"
      )}
      style={{ animationDelay: `${Math.min(index * 30, 300)}ms` }}
      onClick={() => onClick(notif)}
    >
      <CardContent className="p-4 flex items-start gap-3">
        <div
          className={cn(
            "w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0",
            colorClass
          )}
        >
          <Icon className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p
              className={cn(
                "text-sm truncate",
                !isRead
                  ? "font-semibold text-foreground"
                  : "font-medium text-muted-foreground"
              )}
            >
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
        {!isRead && (
          <button
            onClick={(e) => onMarkAsRead(notif.id as string, e)}
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
}
