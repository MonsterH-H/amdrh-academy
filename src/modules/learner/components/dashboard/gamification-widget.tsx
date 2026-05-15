"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Flame,
  Zap,
  Trophy,
  Star,
  BookOpen,
  Award,
  CalendarCheck,
  Target,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/app";

// ─── Types ────────────────────────────────────────────────────────────────────

interface GamificationData {
  currentStreak: number;
  longestStreak: number;
  totalXP: number;
  level: {
    name: string;
    xpRequired: number;
    nextLevel: string | null;
    nextLevelXP: number | null;
    progress: number;
  };
  pointsBreakdown: {
    lessons: { xp: number; count: number; label: string };
    quizzes: { xp: number; count: number; label: string };
    certificates: { xp: number; count: number; label: string };
    badges: { xp: number; count: number; label: string };
    dailyLogin: { xp: number; count: number; label: string };
  };
  pointsToday: number;
  heatmap: Array<{ week: string; days: number[] }>;
}

const BREAKDOWN_CONFIG = [
  { key: "lessons" as const, icon: BookOpen, color: "text-emerald-600 dark:text-emerald-400" },
  { key: "quizzes" as const, icon: Target, color: "text-blue-600 dark:text-blue-400" },
  { key: "certificates" as const, icon: Award, color: "text-amber-600 dark:text-amber-400" },
  { key: "badges" as const, icon: Star, color: "text-violet-600 dark:text-violet-400" },
  { key: "dailyLogin" as const, icon: CalendarCheck, color: "text-orange-600 dark:text-orange-400" },
];

const LEVEL_COLORS: Record<string, string> = {
  "Débutant": "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  "Apprenti": "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  "Confirmé": "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  "Avancé": "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  "Expert": "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  "Maître": "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
};

// ─── Component ────────────────────────────────────────────────────────────────

export function GamificationWidget() {
  const { user } = useAppStore();
  const [data, setData] = useState<GamificationData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    const fetchGamification = async () => {
      try {
        const res = await fetch(`/api/gamification?userId=${user.id}`);
        if (!res.ok) return;
        const json = await res.json();
        setData(json);
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    };
    fetchGamification();
  }, [user?.id]);

  if (loading) {
    return <GamificationSkeleton />;
  }

  if (!data) return null;

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
      {/* Level & XP Card */}
      <Card className="border-border/50 hover:shadow-lg transition-all duration-300">
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                <Trophy className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Niveau</p>
                <p className="text-sm font-bold text-foreground">{data.level.name}</p>
              </div>
            </div>
            <Badge className={cn("text-[10px]", LEVEL_COLORS[data.level.name] || LEVEL_COLORS["Débutant"])}>
              {data.totalXP} XP
            </Badge>
          </div>
          <div className="space-y-1.5">
            <div className="flex justify-between text-[11px]">
              <span className="text-muted-foreground">
                {data.level.nextLevel ? `Vers ${data.level.nextLevel}` : "Niveau max"}
              </span>
              <span className="font-semibold text-primary">{data.level.progress}%</span>
            </div>
            <Progress value={data.level.progress} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Streak Card */}
      <Card className="border-border/50 hover:shadow-lg transition-all duration-300">
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-orange-50 dark:bg-orange-500/10 flex items-center justify-center">
              <Flame className="w-5 h-5 text-orange-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Série actuelle</p>
              <p className="text-sm font-bold text-foreground flex items-center gap-1">
                {data.currentStreak} jour{data.currentStreak !== 1 ? "s" : ""}
                {data.currentStreak >= 3 && <span className="text-sm">🔥</span>}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
            <Star className="w-3 h-3" />
            <span>Record : {data.longestStreak} jour{data.longestStreak !== 1 ? "s" : ""}</span>
          </div>
        </CardContent>
      </Card>

      {/* Points Today Card */}
      <Card className="border-border/50 hover:shadow-lg transition-all duration-300">
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center">
              <Zap className="w-5 h-5 text-emerald-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Points aujourd&apos;hui</p>
              <p className="text-sm font-bold text-foreground">{data.pointsToday} XP</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
            <CalendarCheck className="w-3 h-3" />
            <span>Total : {data.totalXP} XP</span>
          </div>
        </CardContent>
      </Card>

      {/* XP Breakdown Card */}
      <Card className="border-border/50 hover:shadow-lg transition-all duration-300">
        <CardContent className="p-4 space-y-2">
          <p className="text-xs text-muted-foreground mb-1">Détail des points</p>
          {BREAKDOWN_CONFIG.map(({ key, icon: Icon, color }) => {
            const item = data.pointsBreakdown[key];
            if (!item || item.count === 0) return null;
            return (
              <div key={key} className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                  <Icon className={cn("w-3 h-3", color)} />
                  <span>{item.label}</span>
                </div>
                <span className="text-[11px] font-semibold text-foreground">+{item.xp}</span>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function GamificationSkeleton() {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i} className="border-border/50">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Skeleton className="w-9 h-9 rounded-xl" />
              <div className="space-y-1">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-4 w-20" />
              </div>
            </div>
            <Skeleton className="h-2 w-full" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
