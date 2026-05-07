"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Pin, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { ANNOUNCEMENT_TYPE_LABELS, ANNOUNCEMENT_TYPE_COLORS } from "@/lib/constants";
import { formatTimeAgo } from "@/utils/format";

export interface AnnouncementData {
  id: string;
  title: string;
  content: string;
  type: string;
  isPinned: boolean;
  createdAt: string;
}

interface AnnouncementCardProps {
  announcement: AnnouncementData;
  onClick: (announcement: AnnouncementData) => void;
}

export function AnnouncementCard({ announcement, onClick }: AnnouncementCardProps) {
  const typeLabel = ANNOUNCEMENT_TYPE_LABELS[announcement.type] || announcement.type;
  const typeColor = ANNOUNCEMENT_TYPE_COLORS[announcement.type] || "bg-gray-100 text-gray-700";
  const isLong = announcement.content.length > 180;
  const truncatedContent = isLong
    ? announcement.content.slice(0, 180).trimEnd() + "..."
    : announcement.content;

  return (
    <Card
      className={cn(
        "cursor-pointer border border-border/60 bg-card transition-all duration-200 hover:shadow-md hover:border-border group",
        announcement.isPinned && "ring-1 ring-primary/20 border-primary/30"
      )}
      onClick={() => onClick(announcement)}
    >
      <CardContent className="p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="secondary" className={cn("text-[11px] font-semibold px-2 py-0.5", typeColor)}>
                {typeLabel}
              </Badge>
              {announcement.isPinned && (
                <div className="flex items-center gap-1 text-primary/70">
                  <Pin className="w-3 h-3" />
                  <span className="text-[11px] font-medium">Épinglé</span>
                </div>
              )}
            </div>
            <h3 className="font-semibold text-foreground text-sm sm:text-base leading-snug line-clamp-1 group-hover:text-primary transition-colors">
              {announcement.title}
            </h3>
            <p className="text-muted-foreground text-sm leading-relaxed line-clamp-2 whitespace-pre-line">
              {truncatedContent}
            </p>
            <div className="flex items-center gap-1.5 text-muted-foreground/60">
              <Clock className="w-3 h-3" />
              <span className="text-xs">{formatTimeAgo(announcement.createdAt)}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
