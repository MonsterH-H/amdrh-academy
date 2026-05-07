"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Pin, Clock, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import { ANNOUNCEMENT_TYPE_LABELS, ANNOUNCEMENT_TYPE_COLORS } from "@/lib/constants";
import { formatTimeAgo, formatDateLong } from "@/utils/format";
import type { AnnouncementData } from "./announcement-card";

interface AnnouncementDetailDialogProps {
  announcement: AnnouncementData | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AnnouncementDetailDialog({
  announcement,
  open,
  onOpenChange,
}: AnnouncementDetailDialogProps) {
  if (!announcement) return null;

  const typeLabel = ANNOUNCEMENT_TYPE_LABELS[announcement.type] || announcement.type;
  const typeColor = ANNOUNCEMENT_TYPE_COLORS[announcement.type] || "bg-gray-100 text-gray-700";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader className="space-y-3 pb-2">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="secondary" className={cn("text-xs font-semibold px-2.5 py-0.5", typeColor)}>
              {typeLabel}
            </Badge>
            {announcement.isPinned && (
              <div className="flex items-center gap-1 text-primary/70">
                <Pin className="w-3.5 h-3.5" />
                <span className="text-xs font-medium">Épinglé</span>
              </div>
            )}
          </div>
          <DialogTitle className="text-lg sm:text-xl leading-tight text-foreground">
            {announcement.title}
          </DialogTitle>
          <DialogDescription className="sr-only">
            Détails de l&apos;annonce : {announcement.title}
          </DialogDescription>
          <div className="flex items-center gap-4 text-muted-foreground/70 text-xs">
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              <span>{formatTimeAgo(announcement.createdAt)}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              <span>{formatDateLong(announcement.createdAt)}</span>
            </div>
          </div>
        </DialogHeader>
        <div className="mt-4">
          <div className="prose prose-sm max-w-none text-foreground/90 leading-relaxed whitespace-pre-line">
            {announcement.content}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
