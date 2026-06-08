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
import { Separator } from "@/components/ui/separator";
import { Save, Loader2, Building2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { PlatformSettings } from "../types";

interface Props {
  initial: PlatformSettings;
}

export function PlatformSettingsCard({ initial }: Props) {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<PlatformSettings>({ ...initial });
  const { toast } = useToast();

  const update = (key: keyof PlatformSettings, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // The global fetch interceptor adds x-user-id header automatically
      const res = await fetch(`/api/admin/settings`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ section: "platform", data: form }),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Erreur de sauvegarde");
      }
      toast({
        title: "Paramètres sauvegardés",
        description: "Les informations de la plateforme ont été mises à jour.",
      });
    } catch (err) {
      toast({
        title: "Erreur",
        description: err instanceof Error ? err.message : "Impossible de sauvegarder les paramètres.",
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
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Building2 className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-base">Informations de la plateforme</CardTitle>
            <CardDescription>
              Nom, description et coordonnées de l&apos;Académie AMDRH
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <Separator />
      <CardContent className="space-y-5 pt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-2">
            <Label htmlFor="platform-name">Nom de la plateforme</Label>
            <Input
              id="platform-name"
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              placeholder="Académie AMDRH"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="academic-year">Année académique</Label>
            <Input
              id="academic-year"
              value={form.academicYear}
              onChange={(e) => update("academicYear", e.target.value)}
              placeholder="2024-2025"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="platform-description">Description</Label>
          <Input
            id="platform-description"
            value={form.description}
            onChange={(e) => update("description", e.target.value)}
            placeholder="Description de la plateforme..."
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-2">
            <Label htmlFor="contact-email">E-mail de contact</Label>
            <Input
              id="contact-email"
              type="email"
              value={form.contactEmail}
              onChange={(e) => update("contactEmail", e.target.value)}
              placeholder="contact@amdrh-academie.org"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="frmhb-partnership">Partenariat FRMHB</Label>
            <Input
              id="frmhb-partnership"
              value={form.frmhbPartnership}
              onChange={(e) => update("frmhbPartnership", e.target.value)}
              placeholder="Partenaire académique officiel FRMHB"
            />
          </div>
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
