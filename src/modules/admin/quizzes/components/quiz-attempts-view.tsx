"use client";

import { Card, CardContent } from "@/components/ui/card";
import {
  FileQuestion, Target, BarChart3, CheckCircle2, Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { QuizStats } from "../types";

// ============================================
// Stat Card Helper
// ============================================
function StatCard({
  icon: Icon, label, value, color,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number | string;
  color: string;
}) {
  return (
    <Card className="border-border/60">
      <CardContent className="p-4 flex items-center gap-3">
        <div className={cn("p-2 rounded-lg", color)}>
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <p className="text-xl font-bold leading-none">{value}</p>
          <p className="text-[11px] text-muted-foreground mt-1">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================
// Quiz Attempts & Statistics View
// ============================================
interface QuizAttemptsViewProps {
  questionCount: number;
  totalPoints: number;
  stats: QuizStats;
  duration: number;
  passingScore: number;
  maxAttempts: number;
  shuffleQuestions: boolean;
}

export function QuizAttemptsView({
  questionCount, totalPoints, stats, duration, passingScore, maxAttempts, shuffleQuestions,
}: QuizAttemptsViewProps) {
  return (
    <>
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <StatCard
          icon={FileQuestion} label="Questions" value={questionCount}
          color="bg-primary/10 text-primary"
        />
        <StatCard
          icon={Target} label="Points total" value={totalPoints || 0}
          color="bg-amber-500/10 text-amber-600"
        />
        <StatCard
          icon={BarChart3} label="Tentatives" value={stats.submittedCount}
          color="bg-violet-500/10 text-violet-600"
        />
        <StatCard
          icon={CheckCircle2} label="Taux réussite" value={`${stats.passRate}%`}
          color="bg-green-500/10 text-green-600"
        />
        <StatCard
          icon={BarChart3} label="Score moyen" value={`${stats.avgScore}%`}
          color="bg-emerald-500/10 text-emerald-600"
        />
      </div>

      {/* Settings summary */}
      <Card className="border-border/60">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <h3 className="text-sm font-semibold">Paramètres</h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Durée</p>
              <p className="font-medium">{duration} min</p>
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Score minimum</p>
              <p className="font-medium">{passingScore}%</p>
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Max tentatives</p>
              <p className="font-medium">{maxAttempts}</p>
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Mélanger</p>
              <p className="font-medium">{shuffleQuestions ? "Oui" : "Non"}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
