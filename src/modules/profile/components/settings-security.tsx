"use client";

import { useState } from "react";
import { useAppStore } from "@/store/app";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { Lock, Loader2, Eye, EyeOff, Shield, Clock, Mail } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { PasswordForm } from "./password-form";

interface SettingsSecurityProps {
  lastLoginAt?: Date | string | null;
  emailVerified: boolean;
}

export function SettingsSecurity({ lastLoginAt, emailVerified }: SettingsSecurityProps) {
  const { user } = useAppStore();
  const { toast } = useToast();
  const [requestingVerification, setRequestingVerification] = useState(false);

  const handleRequestVerification = async () => {
    if (!user) return;
    setRequestingVerification(true);
    try {
      const res = await fetch("/api/profile/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id }),
      });
      if (res.ok) {
        toast({
          title: "Email de vérification envoyé",
          description: "Vérifiez votre boîte de réception et cliquez sur le lien.",
        });
      } else {
        const data = await res.json();
        toast({
          title: "Erreur",
          description: data.error || "Impossible d'envoyer l'email de vérification.",
          variant: "destructive",
        });
      }
    } catch {
      toast({
        title: "Erreur réseau",
        description: "Une erreur est survenue. Veuillez réessayer.",
        variant: "destructive",
      });
    } finally {
      setRequestingVerification(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Change Password */}
      <PasswordForm userId={user?.id || ""} />

      {/* Last Login & Email Verification */}
      <Card className="border-border/60">
        <CardHeader className="pb-4">
          <CardTitle className="text-base flex items-center gap-2">
            <Shield className="w-4 h-4 text-primary" />
            Sécurité du compte
          </CardTitle>
          <CardDescription>Informations sur la sécurité de votre compte</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Last Login */}
          <div className="flex items-center justify-between py-2">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center">
                <Clock className="w-4 h-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Dernière connexion</p>
                <p className="text-xs text-muted-foreground">
                  {lastLoginAt
                    ? new Date(lastLoginAt).toLocaleDateString("fr-FR", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "Non disponible"}
                </p>
              </div>
            </div>
          </div>

          <Separator className="my-2" />

          {/* Email Verification */}
          <div className="flex items-center justify-between py-2">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center">
                <Mail className="w-4 h-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Vérification de l'email</p>
                <div className="flex items-center gap-2 mt-0.5">
                  {emailVerified ? (
                    <Badge variant="secondary" className="bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 text-[10px] px-1.5 py-0">
                      Vérifié ✓
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 text-[10px] px-1.5 py-0">
                      Non vérifié
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            {!emailVerified && (
              <Button
                variant="outline"
                size="sm"
                className="rounded-lg text-xs"
                onClick={handleRequestVerification}
                disabled={requestingVerification}
              >
                {requestingVerification ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                    Envoi...
                  </>
                ) : (
                  <>
                    <Mail className="w-3.5 h-3.5 mr-1.5" />
                    Envoyer
                  </>
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
