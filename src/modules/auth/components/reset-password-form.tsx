"use client";

import { useState } from "react";
import { useAppStore } from "@/store/app";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { CircleDot, Eye, EyeOff, Loader2, ArrowLeft, CheckCircle2, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PasswordRule } from "../types";

export function ResetPasswordPage() {
  const { navigate, viewParams } = useAppStore();
  const token = viewParams.token || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const passwordRules: PasswordRule[] = [
    { test: password.length >= 8, label: "8+ caractères" },
    { test: /[A-Z]/.test(password), label: "Majuscule" },
    { test: /[0-9]/.test(password), label: "Chiffre" },
    { test: /[a-z]/.test(password), label: "Minuscule" },
  ];

  const allRulesPassed = passwordRules.every((r) => r.test);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!token) {
      setError("Lien de réinitialisation invalide. Veuillez demander un nouveau lien.");
      return;
    }

    if (password.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères");
      return;
    }

    if (!/[A-Z]/.test(password)) {
      setError("Le mot de passe doit contenir au moins une majuscule");
      return;
    }

    if (!/[0-9]/.test(password)) {
      setError("Le mot de passe doit contenir au moins un chiffre");
      return;
    }

    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        const msg = data.error;
        if (typeof msg === "object" && msg.token) setError(msg.token[0]);
        else setError(typeof msg === "string" ? msg : "Erreur de réinitialisation");
        return;
      }

      setSuccess(true);
    } catch {
      setError("Erreur de connexion au serveur");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md animate-fadeIn">
        {/* Logo */}
        <div className="text-center mb-8">
          <button onClick={() => navigate("landing")} className="inline-flex items-center gap-3 mb-6">
            <div className="w-11 h-11 rounded-xl bg-primary flex items-center justify-center">
              <CircleDot className="w-6 h-6 text-white" />
            </div>
            <div className="text-left">
              <h1 className="font-bold text-lg text-foreground leading-tight">Académie</h1>
              <p className="text-[10px] text-muted-foreground font-medium tracking-wider uppercase">AMDRH</p>
            </div>
          </button>
          <h2 className="text-2xl font-bold text-foreground">Réinitialiser le mot de passe</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Créez un nouveau mot de passe sécurisé
          </p>
        </div>

        <Card className="border-border/60 shadow-sm">
          <CardContent className="p-6 sm:p-8">
            {!success ? (
              <>
                {/* Security notice */}
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
                  <div className="flex gap-3">
                    <Shield className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-amber-900">
                        Nouveau mot de passe sécurisé
                      </p>
                      <p className="text-xs text-amber-700 mt-1">
                        Choisissez un mot de passe robuste que vous n&apos;utilisez pas sur d&apos;autres sites.
                      </p>
                    </div>
                  </div>
                </div>

                {error && (
                  <div className="bg-destructive/10 text-destructive text-sm px-4 py-3 rounded-lg font-medium mb-5">
                    {error}
                  </div>
                )}

                {!token && (
                  <div className="bg-destructive/10 text-destructive text-sm px-4 py-3 rounded-lg font-medium mb-5">
                    Aucun token de réinitialisation fourni. Veuillez utiliser le lien envoyé par email.
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="new-password" className="text-sm font-medium">Nouveau mot de passe</Label>
                    <div className="relative">
                      <Input
                        id="new-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Min. 8 caractères"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="h-11 rounded-lg pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {/* Password rules */}
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {passwordRules.map((rule) => (
                        <div
                          key={rule.label}
                          className={cn(
                            "text-[10px] px-2 py-0.5 rounded-full font-medium transition-all duration-200",
                            rule.test
                              ? "bg-green-100 text-green-700"
                              : "bg-muted text-muted-foreground"
                          )}
                        >
                          {rule.test ? "✓" : "○"} {rule.label}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirm-new-password" className="text-sm font-medium">Confirmer le mot de passe</Label>
                    <Input
                      id="confirm-new-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Retapez le mot de passe"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      className="h-11 rounded-lg"
                    />
                    {confirmPassword && confirmPassword !== password && (
                      <p className="text-xs text-destructive font-medium">
                        Les mots de passe ne correspondent pas
                      </p>
                    )}
                  </div>

                  {/* Password strength indicator */}
                  {password.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex gap-1">
                        {[1, 2, 3, 4].map((level) => (
                          <div
                            key={level}
                            className={cn(
                              "h-1 flex-1 rounded-full transition-all duration-300",
                              level <= (allRulesPassed ? 4 : password.length >= 6 ? 3 : password.length >= 4 ? 2 : 1)
                                ? allRulesPassed
                                  ? "bg-green-500"
                                  : "bg-amber-500"
                                : "bg-muted"
                            )}
                          />
                        ))}
                      </div>
                      <p className={cn(
                        "text-[10px] font-medium",
                        allRulesPassed ? "text-green-600" : "text-amber-600"
                      )}>
                        {allRulesPassed ? "Fort" : password.length >= 6 ? "Moyen" : "Faible"}
                      </p>
                    </div>
                  )}

                  <Button
                    type="submit"
                    className="w-full h-11 rounded-lg text-sm font-semibold"
                    disabled={loading || !token || !allRulesPassed || password !== confirmPassword}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Réinitialisation en cours...
                      </>
                    ) : (
                      "Réinitialiser le mot de passe"
                    )}
                  </Button>
                </form>
              </>
            ) : (
              <div className="text-center py-6 animate-fadeIn">
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="font-bold text-lg text-foreground mb-2">
                  Mot de passe modifié !
                </h3>
                <p className="text-sm text-muted-foreground mb-8">
                  Votre mot de passe a été réinitialisé avec succès.
                  Vous pouvez maintenant vous connecter avec votre nouveau mot de passe.
                </p>
                <Button
                  onClick={() => navigate("login")}
                  className="w-full h-11 rounded-lg text-sm font-semibold"
                >
                  Se connecter
                  <ArrowLeft className="w-4 h-4 ml-2 rotate-180" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {!success && (
          <p className="text-center text-sm text-muted-foreground mt-6">
            <button
              onClick={() => navigate("login")}
              className="text-primary font-semibold hover:underline"
            >
              Retour à la connexion
            </button>
          </p>
        )}
      </div>
    </div>
  );
}
