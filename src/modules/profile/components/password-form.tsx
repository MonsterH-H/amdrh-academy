"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Lock, Loader2, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PasswordFormProps {
  userId: string;
}

export function PasswordForm({ userId }: PasswordFormProps) {
  const { toast } = useToast();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast({
        title: "Champs requis",
        description: "Tous les champs sont requis.",
        variant: "destructive",
      });
      return;
    }

    if (newPassword.length < 8) {
      toast({
        title: "Mot de passe faible",
        description: "Le nouveau mot de passe doit contenir au moins 8 caractères.",
        variant: "destructive",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: "Confirmation incorrecte",
        description: "Les mots de passe ne correspondent pas.",
        variant: "destructive",
      });
      return;
    }

    setChangingPassword(true);
    try {
      const res = await fetch("/api/profile/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          currentPassword,
          newPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast({
          title: "Erreur",
          description: data.error || "Impossible de changer le mot de passe.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Mot de passe modifié",
        description: "Votre mot de passe a été mis à jour avec succès.",
      });

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch {
      toast({
        title: "Erreur réseau",
        description: "Une erreur est survenue. Veuillez réessayer.",
        variant: "destructive",
      });
    } finally {
      setChangingPassword(false);
    }
  };

  return (
    <Card className="border-border/60">
      <CardHeader className="pb-4">
        <CardTitle className="text-base flex items-center gap-2">
          <Lock className="w-4 h-4 text-primary" />
          Changer le mot de passe
        </CardTitle>
        <CardDescription>Modifiez votre mot de passe pour sécuriser votre compte</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="current-pw" className="text-sm">Mot de passe actuel</Label>
          <div className="relative">
            <Input
              id="current-pw"
              type={showCurrentPw ? "text" : "password"}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="h-10 rounded-lg pr-10"
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowCurrentPw(!showCurrentPw)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              {showCurrentPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="new-pw" className="text-sm">Nouveau mot de passe</Label>
            <div className="relative">
              <Input
                id="new-pw"
                type={showNewPw ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="h-10 rounded-lg pr-10"
                placeholder="Min. 8 caractères"
              />
              <button
                type="button"
                onClick={() => setShowNewPw(!showNewPw)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showNewPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {newPassword.length > 0 && (
              <div className="space-y-1">
                {(() => {
                  let score = 0;
                  if (/[A-Z]/.test(newPassword)) score++;
                  if (/[a-z]/.test(newPassword)) score++;
                  if (/[0-9]/.test(newPassword)) score++;
                  if (/[^A-Za-z0-9]/.test(newPassword)) score++;
                  if (newPassword.length >= 12) score += 2;
                  const level = score <= 1 ? 0 : score <= 3 ? 1 : 2;
                  const label = newPassword.length < 8 ? "Trop court" : score <= 1 ? "Faible" : score <= 3 ? "Moyen" : "Fort";
                  const colorClass = newPassword.length < 8 ? "bg-red-500" : score <= 1 ? "bg-red-500" : score <= 3 ? "bg-amber-500" : "bg-blue-500";
                  const textClass = newPassword.length < 8 ? "text-red-600" : score <= 1 ? "text-red-600" : score <= 3 ? "text-amber-600" : "text-blue-600";
                  return (
                    <>
                      <div className="flex gap-1">
                        {[0, 1, 2].map((i) => (
                          <div
                            key={i}
                            className={cn(
                              "h-1 flex-1 rounded-full transition-colors",
                              i <= level ? colorClass : "bg-muted"
                            )}
                          />
                        ))}
                      </div>
                      <p className={cn("text-[10px]", textClass)}>
                        {label}
                      </p>
                    </>
                  );
                })()}
              </div>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm-pw" className="text-sm">Confirmer le mot de passe</Label>
            <Input
              id="confirm-pw"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="h-10 rounded-lg"
              placeholder="Confirmer"
            />
            {confirmPassword.length > 0 && newPassword !== confirmPassword && (
              <p className="text-[10px] text-red-500">Les mots de passe ne correspondent pas</p>
            )}
            {confirmPassword.length > 0 && newPassword === confirmPassword && (
              <p className="text-[10px] text-blue-500">Les mots de passe correspondent ✓</p>
            )}
          </div>
        </div>
        <Button
          variant="outline"
          className="rounded-lg text-sm"
          onClick={handleChangePassword}
          disabled={changingPassword || !currentPassword || !newPassword || !confirmPassword}
        >
          {changingPassword ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Modification...
            </>
          ) : (
            <>
              <Lock className="w-4 h-4 mr-2" />
              Mettre à jour le mot de passe
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
