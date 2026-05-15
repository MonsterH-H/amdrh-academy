"use client";

import { Badge } from "@/components/ui/badge";
import { Users, Sparkles } from "lucide-react";
import { ROLE_LABELS, ROLE_COLORS } from "@/lib/constants";
import { ConnectionStatusBadge } from "./realtime-feed";
import type { User } from "@/store/app";

function getMotivationalMessage(avgScore: number, completedCourses: number): string {
  if (completedCourses === 0 && avgScore === 0) {
    return "Commencez votre premier cours aujourd'hui et lancez votre parcours !";
  }
  if (avgScore >= 90) {
    return "Excellente performance ! Continuez sur cette lancée.";
  }
  if (avgScore >= 70) {
    return "Bon parcours ! Quelques efforts de plus pour atteindre l'excellence.";
  }
  if (completedCourses > 0) {
    return "Chaque leçon vous rapproche de vos objectifs. Continuez !";
  }
  return "Reprenez vos cours et progressez à votre rythme.";
}

export function WelcomeBanner({
  user,
  onlineCount,
  avgScore,
  completedCourses,
}: {
  user: User;
  onlineCount: number | null;
  avgScore: number;
  completedCourses: number;
}) {
  const motivational = getMotivationalMessage(avgScore, completedCourses);

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 border border-primary/10 p-6 sm:p-8">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-40 h-40 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-primary/5 rounded-full translate-y-1/2 -translate-x-1/2" />

      <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-3">
          <div className="flex items-center gap-3 flex-wrap">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
              Bonjour, {user.prenom || "Apprenant"}
            </h2>
            <Badge className={ROLE_COLORS[user.role] || "bg-muted text-foreground"}>
              {ROLE_LABELS[user.role] || user.role}
            </Badge>
          </div>
          <p className="text-muted-foreground text-sm sm:text-base max-w-lg">
            {motivational}
          </p>
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          {onlineCount !== null && onlineCount > 0 && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-card/70 backdrop-blur-sm px-3 py-1.5 rounded-full border border-border/40">
              <Users className="w-3.5 h-3.5 text-primary" />
              <span className="font-medium">{onlineCount}</span>
              <span>en ligne</span>
            </div>
          )}
          <ConnectionStatusBadge isConnected={true} />
        </div>
      </div>
    </div>
  );
}
