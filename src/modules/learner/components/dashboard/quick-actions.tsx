"use client";

import { BookOpen, Award, HelpCircle, LayoutGrid, Compass } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface QuickAction {
  id: string;
  label: string;
  description: string;
  icon: typeof BookOpen;
  colorClass: string;
  bgClass: string;
  onClick: () => void;
}

export function QuickActionsSection({
  onNavigate,
}: {
  onNavigate: (view: string, params?: Record<string, string>) => void;
}) {
  const actions: QuickAction[] = [
    {
      id: "courses",
      label: "Parcourir les cours",
      description: "Catalogue complet",
      icon: LayoutGrid,
      colorClass: "text-blue-600",
      bgClass: "bg-blue-50 hover:bg-blue-100/80 dark:hover:bg-blue-500/10 border-blue-100 dark:border-blue-500/20",
      onClick: () => onNavigate("courses"),
    },
    {
      id: "certificates",
      label: "Mes certificats",
      description: "Certificats obtenus",
      icon: Award,
      colorClass: "text-amber-600",
      bgClass: "bg-amber-50 hover:bg-amber-100/80 dark:hover:bg-amber-500/10 border-amber-100 dark:border-amber-500/20",
      onClick: () => onNavigate("certificates"),
    },
    {
      id: "quiz",
      label: "Passer un quiz",
      description: "Évaluer vos connaissances",
      icon: HelpCircle,
      colorClass: "text-emerald-600",
      bgClass: "bg-emerald-50 hover:bg-emerald-100/80 dark:hover:bg-emerald-500/10 border-emerald-100 dark:border-emerald-500/20",
      onClick: () => onNavigate("courses"),
    },
    {
      id: "paths",
      label: "Parcours d'apprentissage",
      description: "Guidés par rôle",
      icon: Compass,
      colorClass: "text-violet-600",
      bgClass: "bg-violet-50 hover:bg-violet-100/80 dark:hover:bg-violet-500/10 border-violet-100 dark:border-violet-500/20",
      onClick: () => onNavigate("learning-paths"),
    },
  ];

  return (
    <section>
      <div className="mb-5">
        <h3 className="text-lg font-semibold text-foreground">Actions rapides</h3>
        <p className="text-sm text-muted-foreground mt-0.5">
          Accédez rapidement aux fonctionnalités
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 stagger-children">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.id}
              onClick={action.onClick}
              className={cn(
                "flex flex-col items-center gap-2 p-4 rounded-xl border transition-all duration-200 cursor-pointer group active:scale-[0.98]",
                action.bgClass
              )}
            >
              <div className="w-10 h-10 rounded-lg bg-card/70 flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
                <Icon className={cn("w-5 h-5", action.colorClass)} />
              </div>
              <div className="text-center">
                <p className="text-xs font-semibold text-foreground leading-tight">
                  {action.label}
                </p>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  {action.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
