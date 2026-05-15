"use client";

import { Card, CardContent } from "@/components/ui/card";
import {
  Users, BookPlus, Bell, BarChart3, GraduationCap, RefreshCw,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/app";
import type { AppView } from "@/types/navigation";

// ─── Quick Actions ───────────────────────────────────────────────────────────

interface QuickAction {
  label: string;
  description: string;
  view: AppView;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
}

const actions: QuickAction[] = [
  {
    label: "Gérer les utilisateurs",
    description: "Admin, formateurs, apprenants",
    view: "admin-users",
    icon: Users,
    color: "text-sky-600",
    bgColor: "bg-sky-500/10 hover:bg-sky-500/15",
  },
  {
    label: "Créer un cours",
    description: "Nouvelle formation",
    view: "course-create",
    icon: BookPlus,
    color: "text-emerald-600",
    bgColor: "bg-emerald-500/10 hover:bg-emerald-500/15",
  },
  {
    label: "Envoyer notification",
    description: "Annonces, rappels",
    view: "admin-notifications",
    icon: Bell,
    color: "text-amber-600",
    bgColor: "bg-amber-500/10 hover:bg-amber-500/15",
  },
  {
    label: "Voir analytiques",
    description: "Statistiques avancées",
    view: "admin-analytics",
    icon: BarChart3,
    color: "text-violet-600",
    bgColor: "bg-violet-500/10 hover:bg-violet-500/15",
  },
  {
    label: "Gérer les parcours",
    description: "Parcours de formation",
    view: "admin-learning-paths",
    icon: GraduationCap,
    color: "text-orange-600",
    bgColor: "bg-orange-500/10 hover:bg-orange-500/15",
  },
  {
    label: "Synchronisation",
    description: "Sync FRMHB",
    view: "admin-sync",
    icon: RefreshCw,
    color: "text-rose-600",
    bgColor: "bg-rose-500/10 hover:bg-rose-500/15",
  },
];

// ─── Quick Actions Grid ──────────────────────────────────────────────────────

export function DashboardQuickActions() {
  const navigate = useAppStore((s) => s.navigate);

  return (
    <Card className="border-border/60">
      <CardContent className="p-6">
        <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
          <RefreshCw className="w-4 h-4 text-primary" /> Actions rapides
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {actions.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.view}
                onClick={() => navigate(action.view)}
                className={cn(
                  "flex items-center gap-3 p-3.5 rounded-xl transition-all duration-200 text-left group cursor-pointer border border-transparent",
                  action.bgColor,
                  "hover:shadow-sm hover:border-border/40",
                )}
              >
                <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-transform group-hover:scale-110", action.color, "bg-card/70")}>
                  <Icon className="w-4.5 h-4.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{action.label}</p>
                  <p className="text-[10px] text-muted-foreground truncate">{action.description}</p>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/40 group-hover:text-muted-foreground transition-colors shrink-0" />
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
