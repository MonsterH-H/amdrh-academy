"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { formatDate } from "@/utils/format";
import {
  BookOpen, Target, Flame, BookMarked, Trophy, Star, MessageSquare,
  FileCheck, Sparkles, Lock, CheckCircle2,
} from "lucide-react";
import type { Achievement, AchievementCategory } from "../types/achievements";

interface AchievementsGridProps {
  achievements: Achievement[];
  loading: boolean;
}

const CATEGORY_FILTERS: Array<{ id: AchievementCategory | "all"; label: string }> = [
  { id: "all", label: "Tous" },
  { id: "cours", label: "Cours" },
  { id: "quiz", label: "Quiz" },
  { id: "streak", label: "Streak" },
  { id: "social", label: "Social" },
  { id: "special", label: "Spécial" },
];

const CATEGORY_COLORS: Record<AchievementCategory, string> = {
  cours: "text-sky-500 bg-sky-500/10",
  quiz: "text-blue-500 bg-blue-500/10",
  streak: "text-orange-500 bg-orange-500/10",
  social: "text-violet-500 bg-violet-500/10",
  special: "text-amber-500 bg-amber-500/10",
};

function AchievementIcon({ iconName, className }: { iconName: string; className?: string }) {
  const icons: Record<string, typeof BookOpen> = {
    BookOpen, Target, Flame, BookMarked, Trophy, Star,
    MessageSquare, FileCheck, Sparkles,
  };
  const Icon = icons[iconName] || Star;
  return <Icon className={className} />;
}

function AchievementCard({ achievement }: { achievement: Achievement }) {
  const catColor = CATEGORY_COLORS[achievement.category];
  const isPartial = !achievement.unlocked && achievement.progress > 0;

  return (
    <div
      className={cn(
        "relative rounded-xl border p-4 transition-all duration-200",
        achievement.unlocked
          ? "border-amber-200/60 bg-gradient-to-br from-amber-50/50 to-transparent dark:from-amber-950/20"
          : "border-border/60 bg-card opacity-80",
      )}
    >
      {/* Unlocked badge */}
      {achievement.unlocked && (
        <div className="absolute top-2 right-2">
          <CheckCircle2 className="w-4 h-4 text-amber-500" />
        </div>
      )}

      {/* Icon */}
      <div className={cn(
        "w-12 h-12 rounded-xl flex items-center justify-center mb-3",
        achievement.unlocked ? catColor : "bg-muted",
      )}>
        {achievement.unlocked ? (
          <AchievementIcon iconName={achievement.icon} className="w-6 h-6" />
        ) : (
          <Lock className="w-5 h-5 text-muted-foreground/40" />
        )}
      </div>

      {/* Title & Description */}
      <h4 className={cn(
        "text-sm font-semibold leading-tight",
        achievement.unlocked ? "text-foreground" : "text-muted-foreground",
      )}>
        {achievement.title}
      </h4>
      <p className={cn(
        "text-xs mt-1 leading-relaxed",
        achievement.unlocked ? "text-muted-foreground" : "text-muted-foreground/50",
      )}>
        {achievement.description}
      </p>

      {/* Progress bar for partial */}
      {isPartial && (
        <div className="mt-3 space-y-1">
          <div className="flex items-center justify-between text-[10px]">
            <span className="text-muted-foreground">Progression</span>
            <span className="font-medium text-foreground">{achievement.progress}%</span>
          </div>
          <div className="h-1.5 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-amber-500/70 transition-all duration-500"
              style={{ width: `${achievement.progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Unlocked date */}
      {achievement.unlocked && achievement.unlockedAt && (
        <p className="text-[10px] text-amber-600/70 mt-2">
          Débloqué le {formatDate(achievement.unlockedAt)}
        </p>
      )}

      {/* Category badge */}
      <Badge variant="secondary" className={cn("text-[10px] mt-2", catColor)}>
        {CATEGORY_FILTERS.find(c => c.id === achievement.category)?.label || achievement.category}
      </Badge>
    </div>
  );
}

export function AchievementsGrid({ achievements, loading }: AchievementsGridProps) {
  const [activeCategory, setActiveCategory] = useState<AchievementCategory | "all">("all");

  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const totalCount = achievements.length;

  const filtered = activeCategory === "all"
    ? achievements
    : achievements.filter(a => a.category === activeCategory);

  if (loading) {
    return (
      <Card className="border-border/60">
        <CardContent className="p-4 sm:p-5">
          <Skeleton className="h-5 w-40 mb-4" />
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="rounded-xl border border-border/60 p-4 space-y-3">
                <Skeleton className="w-12 h-12 rounded-xl" />
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-3 w-36" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with counts */}
      <Card className="border-border/60">
        <CardContent className="p-4 sm:p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <Trophy className="w-4 h-4 text-amber-500" />
                Succès et accomplissements
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                {unlockedCount} / {totalCount} succès débloqués
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-24 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-amber-500 transition-all duration-700"
                  style={{ width: totalCount > 0 ? `${(unlockedCount / totalCount) * 100}%` : "0%" }}
                />
              </div>
              <span className="text-xs font-semibold text-foreground">
                {totalCount > 0 ? Math.round((unlockedCount / totalCount) * 100) : 0}%
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Category filter tabs */}
      <div className="flex gap-1.5 overflow-x-auto pb-1">
        {CATEGORY_FILTERS.map((f) => (
          <button
            key={f.id}
            onClick={() => setActiveCategory(f.id)}
            className={cn(
              "px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all",
              activeCategory === f.id
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80",
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <Card className="border-border/60">
          <CardContent className="p-8 text-center">
            <Trophy className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">Aucun succès dans cette catégorie</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {filtered.map((a) => (
            <AchievementCard key={a.id} achievement={a} />
          ))}
        </div>
      )}
    </div>
  );
}
