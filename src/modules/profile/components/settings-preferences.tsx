"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Globe, Bell, Moon, Sun, Monitor } from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

const NOTIF_PREFS = [
  { id: "notif-course", label: "Nouveaux cours et mises à jour", desc: "Soyez notifié lors de la publication de nouveaux cours" },
  { id: "notif-quiz", label: "Résultats des quiz", desc: "Recevez les résultats et rappels de quiz" },
  { id: "notif-certificate", label: "Certificats et badges", desc: "Notifications pour les certificats obtenus et badges gagnés" },
  { id: "notif-message", label: "Messages", desc: "Notifications pour les nouveaux messages reçus" },
  { id: "notif-system", label: "Annonces système", desc: "Notifications de maintenance et mises à jour de la plateforme" },
] as const;

interface SettingsPreferencesProps {
  notif: Record<string, boolean>;
  onNotifChange: (id: string) => void;
}

export function SettingsPreferences({ notif, onNotifChange }: SettingsPreferencesProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch
  useState(() => {
    setMounted(true);
  });

  const themeValue = mounted ? (theme || "light") : "light";

  return (
    <div className="space-y-4">
      {/* Language */}
      <Card className="border-border/60">
        <CardHeader className="pb-4">
          <CardTitle className="text-base flex items-center gap-2">
            <Globe className="w-4 h-4 text-primary" />
            Langue
          </CardTitle>
          <CardDescription>Choisissez la langue de l'interface</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between py-1">
            <div className="space-y-0.5">
              <Label className="text-sm font-medium text-foreground">Langue de l'interface</Label>
              <p className="text-xs text-muted-foreground">La langue utilisée dans l'application</p>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/60 border border-border/40">
              <span className="text-sm font-medium text-foreground">🇫🇷 Français</span>
              <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">par défaut</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Theme */}
      <Card className="border-border/60">
        <CardHeader className="pb-4">
          <CardTitle className="text-base flex items-center gap-2">
            {themeValue === "dark" ? (
              <Moon className="w-4 h-4 text-primary" />
            ) : (
              <Sun className="w-4 h-4 text-primary" />
            )}
            Apparence
          </CardTitle>
          <CardDescription>Personnalisez le thème de l'application</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-3">
            {[
              { value: "light", label: "Clair", icon: Sun },
              { value: "dark", label: "Sombre", icon: Moon },
              { value: "system", label: "Système", icon: Monitor },
            ].map((t) => {
              const isActive = themeValue === t.value;
              const Icon = t.icon;
              return (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setTheme(t.value)}
                  className={cn(
                    "flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200 hover:border-primary/40",
                    isActive
                      ? "border-primary bg-primary/5 shadow-sm"
                      : "border-border/60 bg-muted/30"
                  )}
                >
                  <div
                    className={cn(
                      "w-10 h-10 rounded-lg flex items-center justify-center transition-colors",
                      isActive ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                    )}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <span
                    className={cn(
                      "text-xs font-medium transition-colors",
                      isActive ? "text-foreground" : "text-muted-foreground"
                    )}
                  >
                    {t.label}
                  </span>
                  {isActive && (
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  )}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card className="border-border/60">
        <CardHeader className="pb-4">
          <CardTitle className="text-base flex items-center gap-2">
            <Bell className="w-4 h-4 text-primary" />
            Préférences de notification
          </CardTitle>
          <CardDescription>Choisissez quelles notifications vous souhaitez recevoir</CardDescription>
        </CardHeader>
        <CardContent className="space-y-1">
          {NOTIF_PREFS.map((p, idx) => (
            <div key={p.id}>
              {idx > 0 && <Separator className="my-3" />}
              <div className="flex items-center justify-between py-1">
                <div className="space-y-0.5 pr-4">
                  <Label htmlFor={p.id} className="text-sm font-medium text-foreground cursor-pointer">{p.label}</Label>
                  <p className="text-xs text-muted-foreground">{p.desc}</p>
                </div>
                <Switch id={p.id} checked={notif[p.id] ?? true} onCheckedChange={() => onNotifChange(p.id)} />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
