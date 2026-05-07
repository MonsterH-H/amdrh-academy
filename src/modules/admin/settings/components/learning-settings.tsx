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
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { Save, Loader2, BookOpen } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { LearningSettings } from "../types";

interface Props {
  initial: LearningSettings;
}

export function LearningSettingsCard({ initial }: Props) {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<LearningSettings>({ ...initial });
  const { toast } = useToast();

  const update = (key: keyof LearningSettings, value: number | boolean | string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ section: "learning", data: form }),
      });
      if (!res.ok) throw new Error();
      toast({
        title: "Paramètres d&apos;apprentissage sauvegardés",
        description: "Les configurations pédagogiques ont été mises à jour.",
      });
    } catch {
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder les paramètres d&apos;apprentissage.",
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
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10">
            <BookOpen className="h-5 w-5 text-emerald-600" />
          </div>
          <div>
            <CardTitle className="text-base">Paramètres d&apos;apprentissage</CardTitle>
            <CardDescription>
              Quiz, certifications, badges et inscription automatique
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <Separator />
      <CardContent className="space-y-6 pt-6">
        {/* Quiz section */}
        <div>
          <h3 className="text-sm font-semibold mb-4">Quiz et évaluations</h3>
          <div className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="passing-score">Score de réussite par défaut (%)</Label>
                <span className="text-sm font-mono text-primary font-semibold">
                  {form.defaultPassingScore}%
                </span>
              </div>
              <Slider
                id="passing-score"
                value={[form.defaultPassingScore]}
                onValueChange={([v]) => update("defaultPassingScore", v)}
                min={50}
                max={100}
                step={5}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>50%</span>
                <span>100%</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="max-attempts">Tentatives maximales par quiz</Label>
              <Input
                id="max-attempts"
                type="number"
                min={1}
                max={20}
                value={form.maxQuizAttempts}
                onChange={(e) => update("maxQuizAttempts", parseInt(e.target.value) || 3)}
              />
              <p className="text-xs text-muted-foreground">
                Nombre maximum de tentatives autorisées pour chaque quiz
              </p>
            </div>
          </div>
        </div>

        <Separator />

        {/* Certificates section */}
        <div>
          <h3 className="text-sm font-semibold mb-4">Certifications et badges</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <Label htmlFor="cert-validity">Validité des certificats (mois)</Label>
              <Input
                id="cert-validity"
                type="number"
                min={1}
                max={120}
                value={form.certificateValidity}
                onChange={(e) =>
                  update("certificateValidity", parseInt(e.target.value) || 24)
                }
              />
              <p className="text-xs text-muted-foreground">
                Durée de validité avant renouvellement requis
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="badge-criteria">Critères d&apos;attribution des badges</Label>
              <Select
                value={form.badgeCriteria}
                onValueChange={(value) => update("badgeCriteria", value)}
              >
                <SelectTrigger id="badge-criteria" className="w-full">
                  <SelectValue placeholder="Sélectionner..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="auto">Automatique</SelectItem>
                  <SelectItem value="manual">Manuel</SelectItem>
                  <SelectItem value="hybrid">Hybride</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Mode d&apos;attribution automatique ou manuelle
              </p>
            </div>
          </div>
        </div>

        <Separator />

        {/* Auto enrollment */}
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="auto-enrollment" className="cursor-pointer">
              Inscription automatique
            </Label>
            <p className="text-xs text-muted-foreground">
              Inscrit automatiquement les apprenants aux nouveaux cours publiés
            </p>
          </div>
          <Switch
            id="auto-enrollment"
            checked={form.autoEnrollment}
            onCheckedChange={(v) => update("autoEnrollment", v)}
          />
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
