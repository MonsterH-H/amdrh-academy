"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Users, BookOpen, GraduationCap, CheckCircle, Award,
  ClipboardCheck, Shield, FolderOpen, Route, Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { AdminKpi } from "../types";

function AnimatedNumber({ value, suffix = "", decimals = 0 }: {
  value: number; suffix?: string; decimals?: number;
}) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    const start = performance.now();
    const duration = 600;
    const tick = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(eased * value);
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [value]);

  return (
    <span className="text-2xl font-bold tracking-tight">
      {decimals > 0 ? display.toFixed(decimals) : Math.round(display)}
      {suffix}
    </span>
  );
}

interface KpiCardDef {
  key: keyof AdminKpi;
  label: string;
  subtitle: string;
  icon: React.ElementType;
  color: string;
  suffix: string;
  decimals: number;
}

const KPI_CARDS: KpiCardDef[] = [
  { key: "totalUsers", label: "Utilisateurs", subtitle: "Total inscrits", icon: Users, color: "sky", suffix: "", decimals: 0 },
  { key: "publishedCourses", label: "Cours publiés", subtitle: "En ligne", icon: BookOpen, color: "blue", suffix: "", decimals: 0 },
  { key: "activeEnrollments", label: "Inscriptions actives", subtitle: "En cours", icon: GraduationCap, color: "violet", suffix: "", decimals: 0 },
  { key: "completionRate", label: "Taux complétion", subtitle: "Moyenne globale", icon: CheckCircle, color: "green", suffix: "%", decimals: 1 },
  { key: "totalCertificates", label: "Certificats", subtitle: "Émis au total", icon: Award, color: "amber", suffix: "", decimals: 0 },
  { key: "passedQuizAttempts", label: "Quiz réussis", subtitle: "Tentatives réussies", icon: ClipboardCheck, color: "lime", suffix: "", decimals: 0 },
  { key: "earnedBadges", label: "Badges décernés", subtitle: "Total obtenu", icon: Shield, color: "orange", suffix: "", decimals: 0 },
  { key: "totalResources", label: "Ressources", subtitle: "Documents & médias", icon: FolderOpen, color: "rose", suffix: "", decimals: 0 },
  { key: "learningPathCount", label: "Parcours formation", subtitle: "Parcours créés", icon: Route, color: "indigo", suffix: "", decimals: 0 },
  { key: "unverifiedUsers", label: "En attente vérif.", subtitle: "À vérifier", icon: Clock, color: "red", suffix: "", decimals: 0 },
];

const ACCENT_MAP: Record<string, { classes: string; borderClass: string }> = {
  sky: { classes: "bg-sky-500/10 text-sky-600", borderClass: "border-t-sky-500" },
  blue: { classes: "bg-blue-500/10 text-blue-600", borderClass: "border-t-blue-500" },
  violet: { classes: "bg-violet-500/10 text-violet-600", borderClass: "border-t-violet-500" },
  green: { classes: "bg-green-500/10 text-green-600", borderClass: "border-t-green-500" },
  amber: { classes: "bg-amber-500/10 text-amber-600", borderClass: "border-t-amber-500" },
  lime: { classes: "bg-lime-500/10 text-lime-600", borderClass: "border-t-lime-500" },
  orange: { classes: "bg-orange-500/10 text-orange-600", borderClass: "border-t-orange-500" },
  rose: { classes: "bg-rose-500/10 text-rose-600", borderClass: "border-t-rose-500" },
  indigo: { classes: "bg-indigo-500/10 text-indigo-600", borderClass: "border-t-indigo-500" },
  red: { classes: "bg-red-500/10 text-red-600", borderClass: "border-t-red-500" },
};

export function DashboardKPICards({ kpi }: { kpi: AdminKpi }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {KPI_CARDS.map((card) => {
        const Icon = card.icon;
        const accent = ACCENT_MAP[card.color];
        return (
          <Card key={card.key} className="border-border/60 overflow-hidden py-0 gap-0">
            <div className={cn("h-0.5 border-t-2", accent.borderClass)} />
            <CardContent className="p-4 flex flex-col items-center text-center gap-2">
              <div className={cn("p-2 rounded-full", accent.classes)}>
                <Icon className="h-5 w-5" />
              </div>
              <AnimatedNumber
                value={kpi[card.key] as number}
                suffix={card.suffix}
                decimals={card.decimals}
              />
              <p className="text-sm font-medium text-foreground">{card.label}</p>
              <p className="text-xs text-muted-foreground">{card.subtitle}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
