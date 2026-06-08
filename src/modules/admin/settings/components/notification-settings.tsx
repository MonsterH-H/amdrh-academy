"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { Save, Loader2, Bell } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { NotificationSettings } from "../types";

interface Props {
  initial: NotificationSettings;
}

export function NotificationSettingsCard({ initial }: Props) {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<NotificationSettings>({ ...initial });
  const { toast } = useToast();

  const update = (key: keyof NotificationSettings, value: number | boolean) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // The global fetch interceptor adds x-user-id header automatically
      const res = await fetch(`/api/admin/settings`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ section: "notifications", data: form }),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Erreur de sauvegarde");
      }
      toast({
        title: "Notifications sauvegardées",
        description: "Les préférences de notification ont été mises à jour.",
      });
    } catch (err) {
      toast({
        title: "Erreur",
        description: err instanceof Error ? err.message : "Impossible de sauvegarder les paramètres de notification.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-500/10">
            <Bell className="h-5 w-5 text-violet-600" />
          </div>
          <div>
            <CardTitle className="text-base">Notifications</CardTitle>
            <CardDescription>
              Canaux de notification et durée de rétention
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <Separator />
      <CardContent className="space-y-6 pt-6">
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="email-notifications" className="cursor-pointer">
                Notifications par e-mail
              </Label>
              <p className="text-xs text-muted-foreground">
                Envoyer les notifications par e-mail aux utilisateurs
              </p>
            </div>
            <Switch
              id="email-notifications"
              checked={form.emailNotifications}
              onCheckedChange={(v) => update("emailNotifications", v)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="push-notifications" className="cursor-pointer">
                Notifications push
              </Label>
              <p className="text-xs text-muted-foreground">
                Notifications en temps réel dans le navigateur
              </p>
            </div>
            <Switch
              id="push-notifications"
              checked={form.pushNotifications}
              onCheckedChange={(v) => update("pushNotifications", v)}
            />
          </div>
        </div>

        <Separator />

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label htmlFor="notification-retention">
              Durée de rétention des notifications
            </Label>
            <span className="text-sm font-mono text-primary font-semibold">
              {form.notificationRetention} jours
            </span>
          </div>
          <Slider
            id="notification-retention"
            value={[form.notificationRetention]}
            onValueChange={([v]) => update("notificationRetention", v)}
            min={7}
            max={365}
            step={1}
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>7 jours</span>
            <span>365 jours</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Les notifications sont automatiquement supprimées après cette durée
          </p>
        </div>

        <Separator />
        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={saving} className="cursor-pointer">
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Sauvegarder
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
