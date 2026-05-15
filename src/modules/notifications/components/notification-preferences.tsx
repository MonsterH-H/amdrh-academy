"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import {
  BookOpen,
  Award,
  MessageSquare,
  HelpCircle,
  Settings,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  type NotificationPreferences,
  getNotificationPreferences,
  setNotificationPreferences,
} from "../utils";
import { useToast } from "@/hooks/use-toast";

const prefCategories: Array<{
  key: keyof NotificationPreferences;
  label: string;
  description: string;
  icon: typeof BookOpen;
}> = [
  {
    key: "COURS",
    label: "Cours",
    description: "Mises à jour de cours et nouvelles publications",
    icon: BookOpen,
  },
  {
    key: "CERTIFICAT",
    label: "Certificats",
    description: "Délivrance et rappels de certificats",
    icon: Award,
  },
  {
    key: "QUIZ",
    label: "Quiz",
    description: "Résultats et rappels de quiz",
    icon: HelpCircle,
  },
  {
    key: "MESSAGE",
    label: "Messages",
    description: "Nouveaux messages reçus",
    icon: MessageSquare,
  },
  {
    key: "SYSTEME",
    label: "Système",
    description: "Annonces et maintenance de la plateforme",
    icon: Settings,
  },
];

export function NotificationPreferences() {
  const [prefs, setPrefs] = useState<NotificationPreferences>(
    getNotificationPreferences,
  );
  const [collapsed, setCollapsed] = useState(true);
  const { toast } = useToast();

  const handleToggle = (key: keyof NotificationPreferences) => {
    const updated = { ...prefs, [key]: !prefs[key] };
    setPrefs(updated);
    setNotificationPreferences(updated);
    toast({
      title: "Préférence mise à jour",
      description: `Notifications ${prefCategories.find((c) => c.key === key)?.label.toLowerCase()} ${updated[key] ? "activées" : "désactivées"}`,
    });
  };

  const enabledCount = Object.values(prefs).filter(Boolean).length;

  return (
    <Card className="border-border/60">
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="w-full text-left"
      >
        <CardHeader className="pb-3 pt-4 px-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Settings className="w-4 h-4 text-muted-foreground" />
              <CardTitle className="text-sm font-semibold text-foreground">
                Préférences de notifications
              </CardTitle>
              <span className="text-[10px] text-muted-foreground font-normal">
                {enabledCount}/{prefCategories.length} activées
              </span>
            </div>
            {collapsed ? (
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            ) : (
              <ChevronUp className="w-4 h-4 text-muted-foreground" />
            )}
          </div>
        </CardHeader>
      </button>

      {!collapsed && (
        <CardContent className="px-5 pb-4 pt-0 space-y-3">
          {prefCategories.map((cat) => {
            const Icon = cat.icon;
            return (
              <div
                key={cat.key}
                className="flex items-center justify-between gap-3 py-1"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                    <Icon className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground">
                      {cat.label}
                    </p>
                    <p className="text-[11px] text-muted-foreground truncate">
                      {cat.description}
                    </p>
                  </div>
                </div>
                <Switch
                  checked={prefs[cat.key]}
                  onCheckedChange={() => handleToggle(cat.key)}
                />
              </div>
            );
          })}
        </CardContent>
      )}
    </Card>
  );
}
