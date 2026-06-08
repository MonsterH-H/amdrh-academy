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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Save, Loader2, Mail, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { EmailSettings as EmailSettingsType } from "../types";

interface Props {
  initial: EmailSettingsType;
}

export function EmailSettingsCard({ initial }: Props) {
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [form, setForm] = useState<EmailSettingsType>({ ...initial });
  const { toast } = useToast();

  const update = (key: keyof EmailSettingsType, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // The global fetch interceptor adds x-user-id header automatically
      const res = await fetch(`/api/admin/settings`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ section: "email", data: form }),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Erreur de sauvegarde");
      }
      toast({
        title: "Paramètres e-mail sauvegardés",
        description: "La configuration SMTP a été mise à jour.",
      });
    } catch (err) {
      toast({
        title: "Erreur",
        description: err instanceof Error ? err.message : "Impossible de sauvegarder les paramètres e-mail.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleTestEmail = async () => {
    setTesting(true);
    try {
      // The global fetch interceptor adds x-user-id header automatically
      const res = await fetch(`/api/admin/settings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "test-email" }),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Erreur lors de l'envoi");
      }
      const data = await res.json();
      toast({
        title: "E-mail de test envoyé",
        description: data.message,
      });
    } catch (err) {
      toast({
        title: "Erreur",
        description: err instanceof Error ? err.message : "Impossible d'envoyer l'e-mail de test.",
        variant: "destructive",
      });
    } finally {
      setTesting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-500/10">
            <Mail className="h-5 w-5 text-orange-600" />
          </div>
          <div>
            <CardTitle className="text-base">Configuration e-mail</CardTitle>
            <CardDescription>
              Paramètres SMTP pour l&apos;envoi d&apos;e-mails et de notifications
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <Separator />
      <CardContent className="space-y-5 pt-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="space-y-2">
            <Label htmlFor="smtp-host">Hôte SMTP</Label>
            <Input
              id="smtp-host"
              value={form.smtpHost}
              onChange={(e) => update("smtpHost", e.target.value)}
              placeholder="smtp.example.com"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="smtp-port">Port SMTP</Label>
            <Input
              id="smtp-port"
              value={form.smtpPort}
              onChange={(e) => update("smtpPort", e.target.value)}
              placeholder="587"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="smtp-encryption">Chiffrement</Label>
            <Select
              value={form.encryption}
              onValueChange={(value) => update("encryption", value)}
            >
              <SelectTrigger id="smtp-encryption" className="w-full">
                <SelectValue placeholder="Sélectionner..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tls">TLS</SelectItem>
                <SelectItem value="ssl">SSL</SelectItem>
                <SelectItem value="none">Aucun</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-2">
            <Label htmlFor="smtp-user">Utilisateur SMTP</Label>
            <Input
              id="smtp-user"
              value={form.smtpUser}
              onChange={(e) => update("smtpUser", e.target.value)}
              placeholder="user@example.com"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="smtp-password">Mot de passe SMTP</Label>
            <Input
              id="smtp-password"
              type="password"
              value={form.smtpPassword}
              onChange={(e) => update("smtpPassword", e.target.value)}
              placeholder="••••••••"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="from-email">E-mail d&apos;expédition</Label>
          <Input
            id="from-email"
            type="email"
            value={form.fromEmail}
            onChange={(e) => update("fromEmail", e.target.value)}
            placeholder="noreply@amdrh-academie.org"
          />
          <p className="text-xs text-muted-foreground">
            Adresse utilisée comme expéditeur pour les e-mails automatiques
          </p>
        </div>

        <Separator />
        <div className="flex flex-col sm:flex-row justify-between gap-3">
          <Button
            variant="outline"
            onClick={handleTestEmail}
            disabled={testing}
            className="cursor-pointer"
          >
            {testing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            Envoyer un e-mail de test
          </Button>
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
