"use client";

import { useState } from "react";
import { useAppStore } from "@/store/app";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { CircleDot, Eye, EyeOff, Loader2, Shield, Users } from "lucide-react";
import { motion } from "framer-motion";
import type { DemoAccount } from "../types";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.15 } },
};

const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
};

export function LoginPage() {
  const { navigate, setUser } = useAppStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, rememberMe }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(typeof data.error === "string" ? data.error : JSON.stringify(data.error) || "Erreur de connexion");
        return;
      }

      if (!data.user) {
        setError("Réponse serveur invalide");
        return;
      }

      setUser(data.user);
      // Navigate to role-specific dashboard
      const role = data.user.role;
      if (role === "ADMIN") navigate("admin-dashboard");
      else if (role === "FORMATEUR") navigate("formateur-dashboard");
      else navigate("dashboard");
    } catch {
      setError("Erreur de connexion au serveur");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center px-4 py-12 overflow-hidden">
      {/* Subtle gradient background */}
      <div className="absolute inset-0 bg-[#FAFAFA]">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] rounded-full bg-gradient-to-b from-primary/[0.03] to-transparent blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[400px] rounded-full bg-gradient-to-tr from-primary/[0.02] to-transparent blur-3xl" />
        <div className="absolute top-1/3 right-0 w-[400px] h-[400px] rounded-full bg-gradient-to-bl from-amber-500/[0.02] to-transparent blur-3xl" />
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
            Connexion
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-sm text-muted-foreground mt-1.5"
          >
            Espace réservé aux membres AMDRH-FRMHB
          </motion.p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.4, ease: "easeOut" }}
        >
          <Card className="border-border/60 shadow-sm shadow-black/[0.02]">
            <CardContent className="p-6 sm:p-8">
              <motion.form
                variants={container}
                initial="hidden"
                animate="show"
                onSubmit={handleLogin}
                className="space-y-5"
              >
                {error && (
                  <motion.div
                    variants={item}
                    className="bg-destructive/10 text-destructive text-sm px-4 py-3 rounded-lg font-medium border border-destructive/10"
                  >
                    {error}
                  </motion.div>
                )}

                <motion.div variants={item} className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">Adresse email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="votre@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                    className="h-11 rounded-lg bg-muted/30 focus:bg-background transition-colors"
                  />
                </motion.div>

                <motion.div variants={item} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-sm font-medium">Mot de passe</Label>
                    <button
                      type="button"
                      onClick={() => navigate("forgot-password")}
                      className="text-xs text-primary font-medium hover:text-primary/80 hover:underline transition-colors"
                    >
                      Mot de passe oublié ?
                    </button>
                  </div>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      autoComplete="current-password"
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
                </motion.div>

                <motion.div variants={item} className="flex items-center gap-2">
                  <Checkbox
                    id="remember-me"
                    checked={rememberMe}
                    onCheckedChange={(checked) => setRememberMe(checked === true)}
                    className="rounded"
                  />
                  <Label htmlFor="remember-me" className="text-sm text-muted-foreground cursor-pointer select-none">
                    Se souvenir de moi
                  </Label>
                </motion.div>

                <motion.div variants={item}>
                  <Button
                    type="submit"
                    className="w-full h-11 rounded-lg text-sm font-semibold shadow-sm hover:shadow-md transition-all duration-200"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Connexion en cours...
                      </>
                    ) : (
                      "Se connecter"
                    )}
                  </Button>
                </motion.div>
              </motion.form>

              {process.env.NODE_ENV === 'development' && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6, duration: 0.3 }}
                >
                  {/* Divider */}
                  <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-border/40" />
                    </div>
                    <div className="relative flex justify-center text-xs">
                      <span className="bg-card px-3 text-muted-foreground">
                        ou
                      </span>
                    </div>
                  </div>

                  {/* Quick test accounts (dev only) */}
                  <div className="bg-muted/40 rounded-xl p-4 border border-border/30">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-6 h-6 rounded-md bg-amber-100 flex items-center justify-center">
                        <Shield className="w-3 h-3 text-amber-600" />
                      </div>
                      <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">
                        Comptes de démonstration
                      </p>
                    </div>
                    <div className="space-y-1 max-h-[240px] overflow-y-auto">
                      {([
                        { label: "Admin", email: "admin@amdrh.ma", role: "ADMIN", password: "Admin@2024!" },
                        { label: "Formateur", email: "formateur@amdrh.ma", role: "FORMATEUR", password: "Formateur@2024!" },
                        { label: "Arbitre", email: "arbitre@amdrh.ma", role: "ARBITRE", password: "Arbitre@2024!" },
                        { label: "Entraîneur", email: "entraineur@amdrh.ma", role: "ENTRAINEUR", password: "Entraineur@2024!" },
                        { label: "Joueur", email: "joueur@amdrh.ma", role: "JOUEUR", password: "Joueur@2024!" },
                      ] as DemoAccount[]).map((account) => (
                        <button
                          key={account.email}
                          onClick={() => { setEmail(account.email); setPassword((account as DemoAccount).password || "Password123!"); }}
                          className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs hover:bg-muted/80 transition-all duration-150 group border border-transparent hover:border-border/30"
                        >
                          <div className="flex items-center gap-2">
                            <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center">
                              <Users className="w-2.5 h-2.5 text-primary" />
                            </div>
                            <span className="font-medium text-foreground group-hover:text-primary transition-colors">{account.label}</span>
                          </div>
                          <span className="text-muted-foreground text-[11px]">{account.email}</span>
                        </button>
                      ))}
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-3 text-center">
                      Mot de passe : <code className="font-mono font-medium bg-muted px-1.5 py-0.5 rounded text-foreground">Rôle@2024!</code>
                    </p>
                  </div>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Internal federation app — registration by admin only */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center text-[11px] text-muted-foreground/60 mt-8 max-w-sm mx-auto"
        >
          Association Marocaine Des Arbitres de Handball — Partenaire académique officiel FRMHB
        </motion.p>

      </div>
    </div>
  );
}
