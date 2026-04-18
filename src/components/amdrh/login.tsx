"use client";

import { useState } from "react";
import { useAppStore } from "@/store/app";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { CircleDot, Eye, EyeOff, Loader2 } from "lucide-react";

export function LoginPage() {
  const { navigate, setUser } = useAppStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Erreur de connexion");
        return;
      }

      setUser(data.user);
      navigate("dashboard");
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
          <h2 className="text-2xl font-bold text-foreground">Connexion</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Accédez à votre espace de formation
          </p>
        </div>

        <Card className="border-border/60 shadow-sm">
          <CardContent className="p-6 sm:p-8">
            <form onSubmit={handleLogin} className="space-y-5">
              {error && (
                <div className="bg-destructive/10 text-destructive text-sm px-4 py-3 rounded-lg font-medium">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">Adresse email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="votre@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  className="h-11 rounded-lg"
                />
              </div>

              <div className="space-y-2">
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
              </div>

              <Button
                type="submit"
                className="w-full h-11 rounded-lg text-sm font-semibold"
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
            </form>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border/40" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-white px-3 text-muted-foreground">
                  ou
                </span>
              </div>
            </div>

            {/* Quick test accounts (dev only) */}
            <div className="bg-muted/40 rounded-lg p-3 sm:p-4">
              <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider mb-2 sm:mb-3">
                Comptes de démonstration
              </p>
              <div className="space-y-1.5 max-h-[240px] overflow-y-auto">
                {[
                  { label: "Admin", email: "admin@amdrh.ma", role: "ADMIN" },
                  { label: "Formateur", email: "formateur@amdrh.ma", role: "FORMATEUR" },
                  { label: "Arbitre", email: "arbitre1@amdrh.ma", role: "ARBITRE" },
                  { label: "Entraîneur", email: "entraineur1@amdrh.ma", role: "ENTRAINEUR" },
                  { label: "Joueur", email: "joueur1@amdrh.ma", role: "JOUEUR" },
                ].map((account) => (
                  <button
                    key={account.email}
                    onClick={() => { setEmail(account.email); setPassword("Password123!"); }}
                    className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs hover:bg-muted/80 transition-colors group"
                  >
                    <span className="font-medium text-foreground group-hover:text-primary transition-colors">{account.label}</span>
                    <span className="text-muted-foreground">{account.email}</span>
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-muted-foreground mt-3 text-center">
                Mot de passe : <span className="font-mono font-medium">Password123!</span>
              </p>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Pas encore de compte ?{" "}
          <button
            onClick={() => navigate("register")}
            className="text-primary font-semibold hover:underline"
          >
            Créer un compte
          </button>
        </p>
      </div>
    </div>
  );
}
