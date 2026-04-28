"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import {
  BookOpen,
  Award,
  HelpCircle,
  Star,
  GraduationCap,
  ChevronRight,
} from "lucide-react";

import type { AppView } from "@/store/app";

interface ProfileStatsData {
  enrollments: number;
  completedEnrollments: number;
  certificates: number;
  badges: number;
  quizAttempts: number;
}

interface ProfileStatsProps {
  stats: ProfileStatsData | null;
  loadingStats: boolean;
  onNavigate: (view: AppView) => void;
}

const STAT_CARDS = [
  { label: "Cours inscrits", key: "enrollments" as const, icon: BookOpen, color: "text-sky-500", bg: "bg-sky-50", action: "courses" as AppView },
  { label: "Cours terminés", key: "completedEnrollments" as const, icon: GraduationCap, color: "text-emerald-500", bg: "bg-emerald-50", action: "learner-traceability" as AppView },
  { label: "Certificats obtenus", key: "certificates" as const, icon: Award, color: "text-amber-500", bg: "bg-amber-50", action: "certificates" as AppView },
  { label: "Badges gagnés", key: "badges" as const, icon: Star, color: "text-yellow-500", bg: "bg-yellow-50", action: "badges" as AppView },
];

const QUICK_NAV = [
  { label: "Voir mes certificats", icon: Award, action: "certificates" as AppView, desc: "Consulter et télécharger" },
  { label: "Voir mes badges", icon: Star, action: "badges" as AppView, desc: "Mes accomplissements" },
];

export function ProfileStats({ stats, loadingStats, onNavigate }: ProfileStatsProps) {
  if (loadingStats) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="border-border/60">
            <CardContent className="p-4 space-y-3">
              <Skeleton className="w-10 h-10 rounded-lg" />
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-3 w-24" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const completionPercent = stats && stats.enrollments > 0
    ? Math.round(((stats.completedEnrollments || 0) / stats.enrollments) * 100)
    : 0;

  return (
    <>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {STAT_CARDS.map((s) => {
          const Icon = s.icon;
          return (
            <button
              key={s.label}
              onClick={() => onNavigate(s.action)}
              className="bg-card border border-border/60 rounded-xl p-4 text-left hover:shadow-md transition-all group"
            >
              <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center mb-3", s.bg)}>
                <Icon className={cn("w-5 h-5", s.color)} />
              </div>
              <p className="text-2xl font-bold text-foreground">{stats?.[s.key] ?? 0}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
            </button>
          );
        })}
      </div>

      {/* Quiz Attempts Card */}
      <Card className="border-border/60">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-emerald-500" />
            Quiz
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="text-3xl font-bold text-foreground">
              {stats?.quizAttempts ?? 0}
            </div>
            <p className="text-sm text-muted-foreground">
              quiz soumis au total
            </p>
          </div>
          {stats && stats.enrollments > 0 && (
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Taux de complétion</span>
                <span className="font-semibold text-foreground">{completionPercent}%</span>
              </div>
              <Progress value={completionPercent} className="h-2" />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick navigation */}
      <div className="grid sm:grid-cols-2 gap-3 mt-4">
        {QUICK_NAV.map((s) => {
          const Icon = s.icon;
          return (
            <button
              key={s.label}
              onClick={() => onNavigate(s.action)}
              className="flex items-center gap-3 p-3 rounded-xl border border-border/60 hover:bg-muted/30 transition-all text-left group"
            >
              <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                <Icon className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">{s.label}</p>
                <p className="text-xs text-muted-foreground">{s.desc}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground/50 group-hover:text-muted-foreground transition-colors" />
            </button>
          );
        })}
      </div>
    </>
  );
}
