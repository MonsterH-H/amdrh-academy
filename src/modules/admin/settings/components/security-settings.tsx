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
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { Save, Loader2, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { SecuritySettings } from "../types";

interface Props {
  initial: SecuritySettings;
}

export function SecuritySettingsCard({ initial }: Props) {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<SecuritySettings>({ ...initial });
  const { toast } = useToast();

  const update = (key: keyof SecuritySettings, value: number | boolean) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // The global fetch interceptor adds x-user-id header automatically
      const res = await fetch(`/api/admin/settings`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ section: "security", data: form }),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Erreur de sauvegarde");
      }
      toast({
        title: "Sécurité sauvegardée",
        description: "Les paramètres de sécurité ont été mis à jour.",
      });
    } catch (err) {
      toast({
        title: "Erreur",
        description: err instanceof Error ? err.message : "Impossible de sauvegarder les paramètres de sécurité.",
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
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-500/10">
            <Shield className="h-5 w-5 text-red-600" />
          </div>
          <div>
            <CardTitle className="text-base">Sécurité</CardTitle>
            <CardDescription>
              Politique de mots de passe, sessions et tentatives de connexion
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <Separator />
      <CardContent className="space-y-6 pt-6">
        {/* Password section */}
        <div>
          <h3 className="text-sm font-semibold mb-4">Politique de mots de passe</h3>
          <div className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="password-length">Longueur minimale</Label>
                <span className="text-sm font-mono text-primary font-semibold">
                  {form.passwordMinLength}
                </span>
              </div>
              <Slider
                id="password-length"
                value={[form.passwordMinLength]}
                onValueChange={([v]) => update("passwordMinLength", v)}
                min={6}
                max={20}
                step={1}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>6 caractères</span>
                <span>20 caractères</span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="require-uppercase" className="cursor-pointer">
                    Exiger des majuscules
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Au moins une lettre majuscule requise
                  </p>
                </div>
                <Switch
                  id="require-uppercase"
                  checked={form.passwordRequireUppercase}
                  onCheckedChange={(v) => update("passwordRequireUppercase", v)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="require-numbers" className="cursor-pointer">
                    Exiger des chiffres
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Au moins un chiffre requis
                  </p>
                </div>
                <Switch
                  id="require-numbers"
                  checked={form.passwordRequireNumbers}
                  onCheckedChange={(v) => update("passwordRequireNumbers", v)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="require-special" className="cursor-pointer">
                    Exiger des caractères spéciaux
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Au moins un caractère spécial (!@#$%^&amp;*)
                  </p>
                </div>
                <Switch
                  id="require-special"
                  checked={form.passwordRequireSpecialChars}
                  onCheckedChange={(v) => update("passwordRequireSpecialChars", v)}
                />
              </div>
            </div>
          </div>
        </div>

        <Separator />

        {/* Session section */}
        <div>
          <h3 className="text-sm font-semibold mb-4">Sessions et connexions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <Label htmlFor="session-timeout">Délai d&apos;expiration de session (minutes)</Label>
              <Input
                id="session-timeout"
                type="number"
                min={5}
                max={480}
                value={form.sessionTimeout}
                onChange={(e) => update("sessionTimeout", parseInt(e.target.value) || 60)}
              />
              <p className="text-xs text-muted-foreground">
                Déconnexion automatique après inactivité
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="max-login-attempts">Tentatives de connexion max</Label>
              <Input
                id="max-login-attempts"
                type="number"
                min={1}
                max={20}
                value={form.maxLoginAttempts}
                onChange={(e) => update("maxLoginAttempts", parseInt(e.target.value) || 5)}
              />
              <p className="text-xs text-muted-foreground">
                Verrouillage du compte après X tentatives échouées
              </p>
            </div>
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
