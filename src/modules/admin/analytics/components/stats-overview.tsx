"use client";

import { Card, CardContent } from "@/components/ui/card";
import {
  Users, BookOpen, GraduationCap, Award, Target, MessageSquare,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { StatsOverview } from "../types";

// ─── Overview Section ────────────────────────────────────────────────────────

export function OverviewSection({ overview }: { overview: StatsOverview }) {
  const cards = [
    {
      label: "Utilisateurs",
      value: overview.totalUsers,
      sub: `${overview.totalActiveUsers} actifs (${overview.activeDays}j)`,
      icon: Users,
      color: "bg-sky-500/10 text-sky-600",
      accent: "bg-sky-500",
    },
    {
      label: "Cours",
      value: overview.totalCourses,
      sub: `${overview.totalPublishedCourses} publiés`,
      icon: BookOpen,
      color: "bg-blue-500/10 text-blue-600",
      accent: "bg-blue-500",
    },
    {
      label: "Inscriptions",
      value: overview.totalEnrollments,
      sub: `Taux complétion: ${overview.completionRate}%`,
      icon: GraduationCap,
      color: "bg-violet-500/10 text-violet-600",
      accent: "bg-violet-500",
    },
    {
      label: "Certificats",
      value: overview.totalCertificates,
      sub: "Émis au total",
      icon: Award,
      color: "bg-amber-500/10 text-amber-600",
      accent: "bg-amber-500",
    },
    {
      label: "Quiz réussis",
      value: `${overview.quizPassRate}%`,
      sub: `${overview.totalQuizAttempts} tentatives`,
      icon: Target,
      color: "bg-green-500/10 text-green-600",
      accent: "bg-green-500",
    },
    {
      label: "Messages",
      value: overview.totalMessages,
      sub: "Sur la plateforme",
      icon: MessageSquare,
      color: "bg-rose-500/10 text-rose-600",
      accent: "bg-rose-500",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <Card key={card.label} className="border-border/60 relative overflow-hidden">
            <div className={cn("absolute top-0 left-0 w-full h-0.5", card.accent)} />
            <CardContent className="p-4">
              <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center mb-3", card.color)}>
                <Icon className="w-4 h-4" />
              </div>
              <p className="text-2xl font-bold text-foreground leading-none">{card.value}</p>
              <p className="text-[11px] text-muted-foreground mt-1 font-medium">{card.label}</p>
              <p className="text-[10px] text-muted-foreground/70 mt-0.5">{card.sub}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
