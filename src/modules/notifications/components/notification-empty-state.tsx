"use client";

import { Bell, BellOff, Filter, CheckCircle2 } from "lucide-react";
import { NOTIFICATION_TYPE_LABELS } from "@/lib/constants";

interface NotificationEmptyStateProps {
  type: "all" | "unread" | "category";
  categoryType?: string;
}

export function NotificationEmptyState({
  type,
  categoryType,
}: NotificationEmptyStateProps) {
  if (type === "all") {
    return (
      <div className="text-center py-20 animate-fadeIn">
        <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-5">
          <Bell className="w-10 h-10 text-muted-foreground/30" />
        </div>
        <h3 className="font-semibold text-foreground text-lg mb-2">
          Aucune notification
        </h3>
        <p className="text-sm text-muted-foreground max-w-xs mx-auto">
          Vous êtes à jour ! Les nouvelles notifications apparaîtront ici.
        </p>
      </div>
    );
  }

  if (type === "unread") {
    return (
      <div className="text-center py-20 animate-fadeIn">
        <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-5">
          <CheckCircle2 className="w-10 h-10 text-blue-500/40" />
        </div>
        <h3 className="font-semibold text-foreground text-lg mb-2">
          Tout est lu !
        </h3>
        <p className="text-sm text-muted-foreground max-w-xs mx-auto">
          Vous avez lu toutes vos notifications. Revenez plus tard.
        </p>
      </div>
    );
  }

  // Category filter
  const categoryLabel =
    NOTIFICATION_TYPE_LABELS[categoryType || ""] || categoryType || "";

  return (
    <div className="text-center py-20 animate-fadeIn">
      <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-5">
        <Filter className="w-10 h-10 text-muted-foreground/30" />
      </div>
      <h3 className="font-semibold text-foreground text-lg mb-2">
        Aucune notification {categoryLabel && `de type ${categoryLabel.toLowerCase()}`}
      </h3>
      <p className="text-sm text-muted-foreground max-w-xs mx-auto">
        {categoryLabel
          ? `Aucune notification dans la catégorie "${categoryLabel}" pour le moment.`
          : "Aucune notification dans cette catégorie."}
      </p>
    </div>
  );
}
