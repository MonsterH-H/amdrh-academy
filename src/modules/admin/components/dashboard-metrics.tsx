"use client";

import { Card, CardContent } from "@/components/ui/card";
import {
  Users, UserCheck, BookOpen, GraduationCap, Award, Target,
  TrendingUp, TrendingDown, Wifi,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface DashboardMetrics {
  totalUsers: number;
  activeUsers: number;
  onlineUsers: number;
  publishedCourses: number;
  activeEnrollments: number;
  totalCertificates: number;
  quizPassRate: number;
  userGrowth: number;
  enrollmentGrowth: number;
  certGrowth: number;
}

// ─── Metric Card ─────────────────────────────────────────────────────────────

interface MetricConfig {
  label: string;
  value: string | number;
  trend?: number;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  accent: string;
  suffix?: string;
  subtitle?: string;
}

function MetricCard({ config }: { config: MetricConfig }) {
  const Icon = config.icon;
  const isPositive = (config.trend ?? 0) >= 0;

  return (
    <Card className="border-border/60 relative overflow-hidden group hover:shadow-md transition-all duration-200">
      <div className={cn("absolute top-0 left-0 w-full h-0.5", config.accent)} />
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", config.color)}>
            <Icon className="w-5 h-5" />
          </div>
          {config.trend !== undefined && (
            <div className={cn(
              "flex items-center gap-0.5 text-[11px] font-semibold px-1.5 py-0.5 rounded-full",
              isPositive ? "bg-blue-50 dark:bg-blue-500/10 text-blue-600" : "bg-red-50 dark:bg-red-500/10 text-red-600",
            )}>
              {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {Math.abs(config.trend)}%
            </div>
          )}
        </div>
        <p className="text-2xl font-bold text-foreground leading-none">
          {config.value}
          {config.suffix && <span className="text-base font-medium text-muted-foreground">{config.suffix}</span>}
        </p>
        <p className="text-xs text-muted-foreground mt-1.5 font-medium">{config.label}</p>
        {config.subtitle && (
          <p className="text-[10px] text-muted-foreground/70 mt-0.5">{config.subtitle}</p>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Metrics Grid ────────────────────────────────────────────────────────────

export function DashboardMetricsGrid({ metrics }: { metrics: DashboardMetrics }) {
  const cards: MetricConfig[] = [
    {
      label: "Total utilisateurs",
      value: metrics.totalUsers,
      trend: metrics.userGrowth,
      icon: Users,
      color: "bg-sky-500/10 text-sky-600",
      accent: "bg-sky-500",
      subtitle: `${metrics.activeUsers} actifs récemment`,
    },
    {
      label: "En ligne maintenant",
      value: metrics.onlineUsers,
      icon: Wifi,
      color: "bg-blue-500/10 text-blue-600",
      accent: "bg-blue-500",
      subtitle: "Utilisateurs connectés",
    },
    {
      label: "Cours publiés",
      value: metrics.publishedCourses,
      icon: BookOpen,
      color: "bg-violet-500/10 text-violet-600",
      accent: "bg-violet-500",
      subtitle: "Formations disponibles",
    },
    {
      label: "Inscriptions en cours",
      value: metrics.activeEnrollments,
      trend: metrics.enrollmentGrowth,
      icon: GraduationCap,
      color: "bg-amber-500/10 text-amber-600",
      accent: "bg-amber-500",
      subtitle: "Parcours actifs",
    },
    {
      label: "Certificats délivrés",
      value: metrics.totalCertificates,
      trend: metrics.certGrowth,
      icon: Award,
      color: "bg-orange-500/10 text-orange-600",
      accent: "bg-orange-500",
      subtitle: "Certifications obtenues",
    },
    {
      label: "Taux de réussite quiz",
      value: metrics.quizPassRate,
      suffix: "%",
      icon: Target,
      color: "bg-rose-500/10 text-rose-600",
      accent: "bg-rose-500",
      subtitle: "Moyenne plate-forme",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
      {cards.map((card) => (
        <MetricCard key={card.label} config={card} />
      ))}
    </div>
  );
}
