"use client";

import { useEffect, useState } from "react";
import { useAppStore, type AppView } from "@/store/app";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, Medal } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { BADGE_LEVEL_LABELS, BADGE_LEVEL_COLORS } from "@/lib/constants";
import { BadgeCard, type BadgeData, type UserBadgeData, getBadgeLevelStyle } from "./badge-card";

// ─── Manager Guard ──────────────────────────────────────────────────────────

function ManagerGuard({
  title,
  description,
  icon: Icon,
  navigateTo,
}: {
  title: string;
  description: string;
  icon: typeof Medal;
  navigateTo: string;
}) {
  const { navigate } = useAppStore();
  return (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <h2 className="text-2xl font-bold text-foreground">{title}</h2>
      </div>
      <div className="text-center py-20">
        <Icon className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
        <h3 className="font-semibold text-foreground mb-2">{description}</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Accédez à la gestion depuis le panneau d&apos;administration.
        </p>
        <Button onClick={() => navigate(navigateTo as AppView)} className="rounded-lg">
          Aller à la gestion
        </Button>
      </div>
    </div>
  );
}

// ─── Badges Content ─────────────────────────────────────────────────────────

function BadgesContent() {
  const { user } = useAppStore();
  const [earnedBadges, setEarnedBadges] = useState<UserBadgeData[]>([]);
  const [allBadges, setAllBadges] = useState<BadgeData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterLevel, setFilterLevel] = useState<string>("ALL");

  useEffect(() => {
    if (!user) return;
    const fetchBadges = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch("/api/badges?userId=" + user.id);
        if (!res.ok) throw new Error(`Erreur ${res.status}: ${res.statusText}`);
        const d = await res.json();
        if (d.error) throw new Error(d.error);

        const earned = (d.earnedBadges || []).map((ub: Record<string, unknown>) => ({
          id: ub.id as string,
          badgeId: ub.badgeId as string,
          earnedAt: ub.earnedAt as string,
          badge: ub.badge as BadgeData,
        }));
        const all = (d.allBadges || []).map((b: Record<string, unknown>) => ({
          id: b.id as string,
          name: b.name as string,
          description: b.description as string,
          icon: b.icon as string,
          level: b.level as string,
          criteria: b.criteria as string,
          createdAt: b.createdAt as string,
        }));

        setEarnedBadges(earned);
        setAllBadges(all);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Impossible de charger les badges";
        setError(message);
        toast({ title: "Erreur", description: message, variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };
    fetchBadges();
  }, [user]);

  if (loading) {
    return (
      <div className="space-y-4 animate-fadeIn">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-72" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6 animate-fadeIn">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Mes Badges</h2>
        </div>
        <div className="text-center py-20">
          <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
          <h3 className="font-semibold text-foreground mb-2">Erreur de chargement</h3>
          <p className="text-sm text-muted-foreground mb-4">{error}</p>
          <Button variant="outline" onClick={() => window.location.reload()}>
            Réessayer
          </Button>
        </div>
      </div>
    );
  }

  const earnedMap = new Map<string, UserBadgeData>();
  for (const ub of earnedBadges) earnedMap.set(ub.badgeId, ub);

  const filteredBadges =
    filterLevel === "ALL" ? allBadges : allBadges.filter((b) => b.level === filterLevel);
  const uniqueLevels = [...new Set(allBadges.map((b) => b.level))];

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Mes Badges</h2>
          <p className="text-muted-foreground mt-1">
            {earnedBadges.length} / {allBadges.length} badges obtenus
          </p>
        </div>

        {uniqueLevels.length > 1 && (
          <div className="flex items-center gap-2 flex-wrap">
            <Badge
              variant={filterLevel === "ALL" ? "default" : "outline"}
              className="cursor-pointer text-[10px] rounded-lg px-3 py-1"
              onClick={() => setFilterLevel("ALL")}
            >
              Tous
            </Badge>
            {uniqueLevels.map((level) => (
              <Badge
                key={level}
                variant={filterLevel === level ? "default" : "outline"}
                className={cn(
                  "cursor-pointer text-[10px] rounded-lg px-3 py-1",
                  filterLevel === level && (BADGE_LEVEL_COLORS[level] || "bg-primary")
                )}
                onClick={() => setFilterLevel(level)}
              >
                <Medal className="w-3 h-3 mr-1" />
                {BADGE_LEVEL_LABELS[level] || level}
              </Badge>
            ))}
          </div>
        )}
      </div>

      {allBadges.length > 0 && (
        <div className="max-w-xs">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
            <span>Progression</span>
            <span>{earnedBadges.length}/{allBadges.length}</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-amber-400 to-amber-600 transition-all duration-500"
              style={{
                width: `${allBadges.length > 0 ? (earnedBadges.length / allBadges.length) * 100 : 0}%`,
              }}
            />
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredBadges.map((badge) => (
          <BadgeCard
            key={badge.id}
            badge={badge}
            earned={earnedMap.get(badge.id)}
          />
        ))}
      </div>

      {allBadges.length === 0 && (
        <div className="text-center py-20">
          <div className="w-16 h-16 rounded-2xl bg-muted/60 flex items-center justify-center mx-auto mb-4">
            <Medal className="w-8 h-8 text-muted-foreground/40" />
          </div>
          <h3 className="font-semibold text-foreground mb-2">Aucun badge disponible</h3>
          <p className="text-sm text-muted-foreground">
            Les badges seront disponibles dès que vous complétez des formations
          </p>
        </div>
      )}
    </div>
  );
}

// ─── Exported Page ──────────────────────────────────────────────────────────

export function BadgesPage() {
  const { user } = useAppStore();
  if (user && (user.role === "ADMIN" || user.role === "FORMATEUR")) {
    return (
      <ManagerGuard
        title="Mes Badges"
        description={user.role === "ADMIN" ? "Gestion des badges" : "Espace formateur"}
        icon={Medal}
        navigateTo="admin-certificates"
      />
    );
  }
  return <BadgesContent />;
}
