"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Lock, Medal } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  BADGE_LEVEL_LABELS,
  BADGE_LEVEL_COLORS,
} from "@/lib/constants";

// ─── Types ──────────────────────────────────────────────────────────────────

export interface BadgeData {
  id: string;
  name: string;
  description: string;
  icon: string;
  level: string;
  criteria: string;
  createdAt: string;
}

export interface UserBadgeData {
  id: string;
  badgeId: string;
  earnedAt: string;
  badge: BadgeData;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

export function getBadgeLevelStyle(level: string): {
  gradient: string;
  border: string;
  bg: string;
} {
  switch (level) {
    case "PLATINE":
      return { gradient: "from-cyan-400 to-cyan-600", border: "border-cyan-300", bg: "bg-cyan-50" };
    case "OR":
      return { gradient: "from-yellow-400 to-amber-500", border: "border-amber-300", bg: "bg-amber-50" };
    case "ARGENT":
      return { gradient: "from-gray-300 to-gray-500", border: "border-gray-300", bg: "bg-gray-50" };
    default:
      return { gradient: "from-amber-600 to-amber-800", border: "border-amber-600", bg: "bg-amber-50" };
  }
}

// ─── Badge Card ─────────────────────────────────────────────────────────────

interface BadgeCardProps {
  badge: BadgeData;
  earned: UserBadgeData | undefined;
}

export function BadgeCard({ badge, earned }: BadgeCardProps) {
  const levelStyle = getBadgeLevelStyle(badge.level);

  return (
    <Card
      className={cn(
        "border-2 transition-all duration-200 overflow-hidden",
        earned
          ? cn(levelStyle.border, levelStyle.bg)
          : "border-border/60 opacity-50"
      )}
    >
      {earned && (
        <div className={cn("h-1 bg-gradient-to-r", levelStyle.gradient)} />
      )}
      <CardContent className="p-5 text-center">
        <div
          className={cn(
            "w-14 h-14 rounded-2xl mx-auto flex items-center justify-center mb-3",
            earned
              ? cn("bg-gradient-to-br", levelStyle.gradient)
              : "bg-muted/60"
          )}
        >
          <span className="text-3xl">{badge.icon}</span>
        </div>
        <h3 className="font-semibold text-sm text-foreground">{badge.name}</h3>
        <p className="text-[10px] text-muted-foreground mt-1 leading-relaxed">
          {badge.description}
        </p>
        <div className="flex items-center justify-center gap-1.5 mt-2">
          <Badge
            variant="outline"
            className={cn(
              "text-[9px]",
              earned
                ? BADGE_LEVEL_COLORS[badge.level] || ""
                : "text-muted-foreground"
            )}
          >
            <Medal className="w-2.5 h-2.5 mr-0.5" />
            {BADGE_LEVEL_LABELS[badge.level] || badge.level}
          </Badge>
        </div>
        {earned && (
          <div className="mt-2">
            <Badge className="bg-green-100 text-green-800 text-[10px] gap-1">
              <CheckCircle2 className="w-3 h-3" />
              Obtenu
            </Badge>
            <p className="text-[9px] text-muted-foreground mt-1">
              {new Date(earned.earnedAt).toLocaleDateString("fr-FR", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </p>
          </div>
        )}
        {!earned && (
          <div className="mt-2">
            <Badge
              variant="secondary"
              className="text-[10px] gap-1 bg-muted text-muted-foreground"
            >
              <Lock className="w-3 h-3" />
              Non obtenu
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
