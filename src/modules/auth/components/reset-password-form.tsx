"use client";

import { useState } from "react";
import { useAppStore } from "@/store/app";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { CircleDot, Eye, EyeOff, Loader2, ArrowLeft, CheckCircle2, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import type { PasswordRule } from "../types";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.15 } },
};

const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
};

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
        if (typeof msg === "object" && msg !== null) {
          const allErrors = Object.values(msg).flat().filter(Boolean).join(", ");
          setError(allErrors || "Erreur de réinitialisation");
        } else {
          setError(typeof msg === "string" ? msg : "Erreur de réinitialisation");
        }
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
    <div className="min-h-screen relative flex items-center justify-center px-4 py-12 overflow-hidden">
      {/* Subtle gradient background matching login */}
      <div className="absolute inset-0 bg-[#FAFAFA]">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] rounded-full bg-gradient-to-b from-primary/[0.03] to-transparent blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[400px] rounded-full bg-gradient-to-tr from-primary/[0.02] to-transparent blur-3xl" />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="text-center mb-8"
        >
          <button onClick={() => navigate("landing")} className="inline-flex items-center gap-3 mb-6 group">
            <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20 group-hover:shadow-primary/30 transition-shadow duration-300">
              <CircleDot className="w-6 h-6 text-white" />
            </div>
            <div className="text-left">
              <h1 className="font-bold text-xl text-foreground leading-tight">Académie</h1>
              <p className="text-[10px] text-primary font-semibold tracking-[0.2em] uppercase">AMDRH</p>
            </div>
          </button>
          <motion.h2
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-2xl font-bold text-foreground"
          >
            Réinitialiser le mot de passe
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-sm text-muted-foreground mt-1.5"
          >
            Créez un nouveau mot de passe sécurisé
          </motion.p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.4, ease: "easeOut" }}
        >
          <Card className="border-border/60 shadow-sm shadow-black/[0.02]">
            <CardContent className="p-6 sm:p-8">
              <AnimatePresence mode="wait">
                {!success ? (
                  <motion.div
                    key="form"
                    variants={container}
                    initial="hidden"
                    animate="show"
                    exit={{ opacity: 0, y: -8, transition: { duration: 0.2 } }}
                  >
                    {/* Security notice */}
                    <motion.div
                      variants={item}
                      className="bg-amber-50 border border-amber-200/60 rounded-lg p-4 mb-6"
                    >
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
                    </motion.div>

                    {error && (
                      <motion.div
                        variants={item}
                        className="bg-destructive/10 text-destructive text-sm px-4 py-3 rounded-lg font-medium mb-5 border border-destructive/10"
                      >
                        {error}
                      </motion.div>
                    )}

                    {!token && (
                      <motion.div
                        variants={item}
                        className="bg-destructive/10 text-destructive text-sm px-4 py-3 rounded-lg font-medium mb-5 border border-destructive/10"
                      >
                        Aucun token de réinitialisation fourni. Veuillez utiliser le lien envoyé par email.
                      </motion.div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                      <motion.div variants={item} className="space-y-2">
                        <Label htmlFor="new-password" className="text-sm font-medium">Nouveau mot de passe</Label>
                        <div className="relative">
                          <Input
                            id="new-password"
                            type={showPassword ? "text" : "password"}
                            placeholder="Min. 8 caractères"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="h-11 rounded-lg pr-10 bg-muted/30 focus:bg-background transition-colors"
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
                            <motion.div
                              key={rule.label}
                              initial={false}
                              animate={{ scale: rule.test ? 1.05 : 1 }}
                              transition={{ duration: 0.15 }}
                              className={cn(
                                "text-[10px] px-2 py-0.5 rounded-full font-medium transition-colors duration-200",
                                rule.test
                                  ? "bg-green-100 text-green-700"
                                  : "bg-muted text-muted-foreground"
                              )}
                            >
                              {rule.test ? "✓" : "○"} {rule.label}
                            </motion.div>
                          ))}
                        </div>
                      </motion.div>

                      <motion.div variants={item} className="space-y-2">
                        <Label htmlFor="confirm-new-password" className="text-sm font-medium">Confirmer le mot de passe</Label>
                        <Input
                          id="confirm-new-password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Retapez le mot de passe"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          required
                          className="h-11 rounded-lg bg-muted/30 focus:bg-background transition-colors"
                        />
                        {confirmPassword && confirmPassword !== password && (
                          <p className="text-xs text-destructive font-medium">
                            Les mots de passe ne correspondent pas
                          </p>
                        )}
                      </motion.div>

                      {/* Password strength indicator */}
                      {password.length > 0 && (
                        <motion.div
                          variants={item}
                          className="space-y-2"
                        >
                          <div className="flex gap-1">
                            {[1, 2, 3, 4].map((level) => (
                              <motion.div
                                key={level}
                                initial={false}
                                animate={{ backgroundColor: level <= (allRulesPassed ? 4 : password.length >= 6 ? 3 : password.length >= 4 ? 2 : 1) ? (allRulesPassed ? '#22C55E' : '#F59E0B') : '#F1F5F9' }}
                                transition={{ duration: 0.3 }}
                                className="h-1 flex-1 rounded-full"
                              />
                            ))}
                          </div>
                          <p className={cn(
                            "text-[10px] font-medium transition-colors duration-200",
                            allRulesPassed ? "text-green-600" : "text-amber-600"
                          )}>
                            {allRulesPassed ? "Fort" : password.length >= 6 ? "Moyen" : "Faible"}
                          </p>
                        </motion.div>
                      )}

                      <motion.div variants={item}>
                        <Button
                          type="submit"
                          className="w-full h-11 rounded-lg text-sm font-semibold shadow-sm hover:shadow-md transition-all duration-200"
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
                      </motion.div>
                    </form>
                  </motion.div>
                ) : (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    className="text-center py-6"
                  >
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.15, type: "spring", stiffness: 200 }}
                      className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4"
                    >
                      <CheckCircle2 className="w-8 h-8 text-green-600" />
                    </motion.div>
                    <h3 className="font-bold text-lg text-foreground mb-2">
                      Mot de passe modifié !
                    </h3>
                    <p className="text-sm text-muted-foreground mb-8">
                      Votre mot de passe a été réinitialisé avec succès.
                      Vous pouvez maintenant vous connecter avec votre nouveau mot de passe.
                    </p>
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 }}
                    >
                      <Button
                        onClick={() => navigate("login")}
                        className="w-full h-11 rounded-lg text-sm font-semibold shadow-sm hover:shadow-md transition-all duration-200"
                      >
                        Se connecter
                        <ArrowLeft className="w-4 h-4 ml-2 rotate-180" />
                      </Button>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </motion.div>

        {!success && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center text-sm text-muted-foreground mt-6"
          >
            <button
              onClick={() => navigate("login")}
              className="text-primary font-semibold hover:underline"
            >
              Retour à la connexion
            </button>
          </motion.p>
        )}
      </div>
    </div>
  );
}
