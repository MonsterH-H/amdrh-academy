"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/app";
import {
  BookOpen, Award, HelpCircle, Star, GraduationCap, ChevronRight,
  Clock, TrendingUp, Trophy, BarChart3,
} from "lucide-react";
import type { ProfileStatsData } from "../types/achievements";

interface ProfileStatsEnhancedProps {
  stats: ProfileStatsData | null;
  loadingStats: boolean;
}

const STAT_CARDS: Array<{
  label: string;
  key: keyof ProfileStatsData;
  icon: typeof BookOpen;
  color: string;
  bg: string;
}> = [
  { label: "Cours suivis", key: "enrollments", icon: BookOpen, color: "text-sky-500", bg: "bg-sky-500/10" },
  { label: "Quiz complétés", key: "quizAttempts", icon: HelpCircle, color: "text-emerald-500", bg: "bg-emerald-500/10" },
  { label: "Certificats obtenus", key: "certificates", icon: Award, color: "text-amber-500", bg: "bg-amber-500/10" },
  { label: "Badges gagnés", key: "badges", icon: Star, color: "text-yellow-500", bg: "bg-yellow-500/10" },
];

const EXTRA_CARDS: Array<{
  label: string;
  getValue: (s: ProfileStatsData) => string;
  icon: typeof Clock;
  color: string;
  bg: string;
}> = [
  {
    label: "Temps de formation",
    getValue: (s) => {
      const mins = s.totalTrainingTime ?? 0;
      if (mins < 60) return `${mins} min`;
      const h = Math.floor(mins / 60);
      const m = mins % 60;
      return m > 0 ? `${h}h ${m}min` : `${h}h`;
    },
    icon: Clock,
    color: "text-violet-500",
    bg: "bg-violet-500/10",
  },
  {
    label: "Note moyenne",
    getValue: (s) => s.avgScore != null ? `${s.avgScore}%` : "—",
    icon: TrendingUp,
    color: "text-rose-500",
    bg: "bg-rose-500/10",
  },
  {
    label: "Cours terminés",
    getValue: (s) => `${s.completedEnrollments ?? 0}`,
    icon: GraduationCap,
    color: "text-teal-500",
    bg: "bg-teal-500/10",
  },
  {
    label: "Rang",
    getValue: (s) => {
      if (!s.learnerRank || !s.totalLearners) return "—";
      return `${s.learnerRank}/${s.totalLearners}`;
    },
    icon: Trophy,
    color: "text-orange-500",
    bg: "bg-orange-500/10",
  },
];

function StatCard({ label, value, icon: Icon, color, bg }: {
  label: string; value: string | number; icon: typeof BookOpen; color: string; bg: string;
}) {
  const { navigate } = useAppStore();
  return (
    <button
      onClick={() => navigate("learner-traceability")}
      className="rounded-xl p-4 text-left hover:shadow-md transition-all border border-border/60 bg-card group"
    >
      <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center mb-3", bg)}>
        <Icon className={cn("w-5 h-5", color)} />
      </div>
      <p className="text-2xl font-bold text-foreground">{value}</p>
      <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
    </button>
  );
}

export function ProfileStatsEnhanced({ stats, loadingStats }: ProfileStatsEnhancedProps) {
  if (loadingStats) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="border-border/60"><CardContent className="p-4 space-y-3">
            <Skeleton className="w-10 h-10 rounded-lg" />
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-3 w-24" />
          </CardContent></Card>
        ))}
      </div>
    );
  }

  const s = stats ?? { enrollments: 0, completedEnrollments: 0, certificates: 0, badges: 0, quizAttempts: 0 };
  const completionPercent = s.enrollments > 0
    ? Math.round(((s.completedEnrollments || 0) / s.enrollments) * 100)
    : 0;

  return (
    <div className="space-y-4">
      {/* Primary stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {STAT_CARDS.map((c) => (
          <StatCard
            key={c.key}
            label={c.label}
            value={s[c.key] ?? 0}
            icon={c.icon}
            color={c.color}
            bg={c.bg}
          />
        ))}
      </div>

      {/* Extended stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {EXTRA_CARDS.map((c) => (
          <StatCard
            key={c.label}
            label={c.label}
            value={c.getValue(s)}
            icon={c.icon}
            color={c.color}
            bg={c.bg}
          />
        ))}
      </div>

      {/* Completion progress */}
      {s.enrollments > 0 && (
        <Card className="border-border/60">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                <BarChart3 className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-muted-foreground font-medium">Taux de complétion</span>
                  <span className="font-bold text-foreground">{completionPercent}%</span>
                </div>
                <Progress value={completionPercent} className="h-2" />
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground/40" />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
