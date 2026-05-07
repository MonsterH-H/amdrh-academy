"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Save, Loader2, Palette } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAppStore } from "@/store/app";
import type { AppearanceSettings } from "../types";

interface Props {
  initial: AppearanceSettings;
}

export function AppearanceSettingsCard({ initial }: Props) {
  const user = useAppStore((s) => s.user);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<AppearanceSettings>({ ...initial });
  const { toast } = useToast();

  const update = (key: keyof AppearanceSettings, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/settings?userId=${user?.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ section: "appearance", data: form }),
      });
      if (!res.ok) throw new Error();
      toast({
        title: "Apparence sauvegardée",
        description: "Les paramètres visuels ont été mis à jour.",
      });
    } catch {
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder les paramètres d'apparence.",
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
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-pink-500/10">
            <Palette className="h-5 w-5 text-pink-600" />
          </div>
          <div>
            <CardTitle className="text-base">Apparence</CardTitle>
            <CardDescription>
              Couleurs, logo, favicon et CSS personnalisé
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <Separator />
      <CardContent className="space-y-5 pt-6">
        {/* Color picker */}
        <div className="space-y-2">
          <Label htmlFor="primary-color">Couleur principale</Label>
          <div className="flex items-center gap-3">
            <div
              className="h-10 w-14 rounded-md border border-border shadow-sm"
              style={{ backgroundColor: form.primaryColor }}
            />
            <Input
              id="primary-color"
              type="color"
              value={form.primaryColor}
              onChange={(e) => update("primaryColor", e.target.value)}
              className="w-20 h-10 p-1 cursor-pointer"
            />
            <Input
              value={form.primaryColor}
              onChange={(e) => update("primaryColor", e.target.value)}
              placeholder="#0F766E"
              className="flex-1 font-mono"
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Utilisée pour les boutons, liens et éléments d&apos;accentuation
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-2">
            <Label htmlFor="logo-url">URL du logo</Label>
            <Input
              id="logo-url"
              value={form.logoUrl}
              onChange={(e) => update("logoUrl", e.target.value)}
              placeholder="/logo.svg"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="favicon-url">URL du favicon</Label>
            <Input
              id="favicon-url"
              value={form.faviconUrl}
              onChange={(e) => update("faviconUrl", e.target.value)}
              placeholder="/logo.svg"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="custom-css">CSS personnalisé</Label>
          <Textarea
            id="custom-css"
            value={form.customCSS}
            onChange={(e) => update("customCSS", e.target.value)}
            placeholder="/* Ajoutez votre CSS personnalisé ici */"
            className="min-h-[120px] font-mono text-sm"
          />
          <p className="text-xs text-muted-foreground">
            Styles CSS additionnels injectés dans toutes les pages
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
