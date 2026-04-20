"use client";

import { useState } from "react";
import { useAppStore } from "@/store/app";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { CircleDot, Eye, EyeOff, Loader2, ArrowLeft, ArrowRight, Check } from "lucide-react";
import { ROLE_LABELS, ROLE_COLORS, REGIONS_MAROC } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { RoleOption } from "../types";

const roles: RoleOption[] = [
  { value: "ARBITRE", label: "Arbitre", color: ROLE_COLORS.ARBITRE, emoji: "🔵" },
  { value: "ENTRAINEUR", label: "Entraîneur", color: ROLE_COLORS.ENTRAINEUR, emoji: "🟢" },
  { value: "JOUEUR", label: "Joueur", color: ROLE_COLORS.JOUEUR, emoji: "🟡" },
];

export function RegisterPage() {
  const { navigate, setUser } = useAppStore();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Step 1
  const [prenom, setPrenom] = useState("");
  const [nom, setNom] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Step 2
  const [role, setRole] = useState("");
  const [telephone, setTelephone] = useState("");
  const [club, setClub] = useState("");
  const [region, setRegion] = useState("");
  const [licenceNumber, setLicenceNumber] = useState("");

  const validateStep1 = () => {
    if (!prenom || prenom.length < 2) return "Prénom requis (min. 2 caractères)";
    if (!nom || nom.length < 2) return "Nom requis (min. 2 caractères)";
    if (!email || !email.includes("@")) return "Email invalide";
    if (password.length < 8) return "Mot de passe (min. 8 caractères)";
    if (!/[A-Z]/.test(password)) return "Majuscule requise";
    if (!/[a-z]/.test(password)) return "Minuscule requise";
    if (!/[0-9]/.test(password)) return "Chiffre requis";
    if (password !== confirmPassword) return "Mots de passe différents";
    return null;
  };

  const validateStep2 = () => {
    if (!role) return "Veuillez sélectionner un rôle";
    return null;
  };

  const handleNext = () => {
    const err = validateStep1();
    if (err) { setError(err); return; }
    setError("");
    setStep(2);
  };

  const handleRegister = async () => {
    const err = validateStep2();
    if (err) { setError(err); return; }
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          step1: { prenom, nom, email, password, confirmPassword },
          step2: { role, telephone, club, region, licenceNumber },
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        const msg = data.error;
        if (typeof msg === "object" && msg !== null) {
          const allErrors = Object.values(msg).flat().filter(Boolean).join(", ");
          setError(allErrors || "Erreur d'inscription");
        } else {
          setError(typeof msg === "string" ? msg : "Erreur d'inscription");
        }
        return;
      }

      // Auto login after register
      try {
        const loginRes = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });
        const loginData = await loginRes.json();

        if (loginRes.ok) {
          setUser(loginData.user);
          navigate("dashboard");
        } else {
          toast.success("Compte créé. Veuillez vous connecter.");
          navigate("login");
        }
      } catch {
        toast.success("Compte créé. Veuillez vous connecter.");
        navigate("login");
      }
    } catch {
      setError("Erreur de connexion au serveur");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md animate-fadeIn">
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
          <h2 className="text-2xl font-bold text-foreground">Créer un compte</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Rejoignez la communauté AMDRH Academy
          </p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-2 mb-6">
          {[1, 2].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300",
                  step >= s
                    ? "bg-primary text-white"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {step > s ? <Check className="w-4 h-4" /> : s}
              </div>
              {s < 2 && (
                <div className={cn(
                  "w-12 h-0.5 rounded transition-all duration-300",
                  step > s ? "bg-primary" : "bg-muted"
                )} />
              )}
            </div>
          ))}
        </div>

        <Card className="border-border/60 shadow-sm">
          <CardContent className="p-6 sm:p-8">
            {error && (
              <div className="bg-destructive/10 text-destructive text-sm px-4 py-3 rounded-lg font-medium mb-5">
                {error}
              </div>
            )}

            {step === 1 ? (
              <div className="space-y-5 animate-fadeIn">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Prénom</Label>
                    <Input value={prenom} onChange={(e) => setPrenom(e.target.value)} className="h-11 rounded-lg" placeholder="Prénom" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Nom</Label>
                    <Input value={nom} onChange={(e) => setNom(e.target.value)} className="h-11 rounded-lg" placeholder="Nom" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Email</Label>
                  <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="h-11 rounded-lg" placeholder="votre@email.com" />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Mot de passe</Label>
                  <div className="relative">
                    <Input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} className="h-11 rounded-lg pr-10" placeholder="Min. 8 caractères" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <div className="flex gap-2">
                    {[
                      { test: password.length >= 8, label: "8+ car." },
                      { test: /[A-Z]/.test(password), label: "Maj." },
                      { test: /[a-z]/.test(password), label: "Min." },
                      { test: /[0-9]/.test(password), label: "Chiffre" },
                    ].map((r) => (
                      <div key={r.label} className={cn("text-[10px] px-2 py-0.5 rounded-full font-medium", r.test ? "bg-green-100 text-green-700" : "bg-muted text-muted-foreground")}>
                        {r.label}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Confirmer le mot de passe</Label>
                  <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="h-11 rounded-lg" placeholder="Retapez le mot de passe" />
                </div>

                <Button onClick={handleNext} className="w-full h-11 rounded-lg text-sm font-semibold">
                  Continuer
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </div>
            ) : (
              <div className="space-y-5 animate-fadeIn">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Votre profil</Label>
                  <div className="grid grid-cols-3 gap-2 sm:gap-3">
                    {roles.map((r) => (
                      <button
                        key={r.value}
                        onClick={() => setRole(r.value)}
                        className={cn(
                          "flex flex-col items-center gap-1.5 sm:gap-2 p-3 sm:p-4 rounded-xl border-2 transition-all duration-200",
                          role === r.value
                            ? "border-primary bg-primary/5 shadow-sm"
                            : "border-border/60 hover:border-border"
                        )}
                      >
                        <span className="text-xl sm:text-2xl">{r.emoji}</span>
                        <span className="text-[10px] sm:text-xs font-semibold">{r.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Téléphone <span className="text-muted-foreground font-normal">(optionnel)</span></Label>
                  <Input value={telephone} onChange={(e) => setTelephone(e.target.value)} className="h-11 rounded-lg" placeholder="+212 6XX-XXXXXX" />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Club <span className="text-muted-foreground font-normal">(optionnel)</span></Label>
                  <Input value={club} onChange={(e) => setClub(e.target.value)} className="h-11 rounded-lg" placeholder="Nom du club" />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Région <span className="text-muted-foreground font-normal">(optionnel)</span></Label>
                  <select
                    value={region}
                    onChange={(e) => setRegion(e.target.value)}
                    className="w-full h-11 rounded-lg border border-input bg-transparent px-3 text-sm"
                  >
                    <option value="">Sélectionner une région</option>
                    {REGIONS_MAROC.map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">N° Licence <span className="text-muted-foreground font-normal">(optionnel)</span></Label>
                  <Input value={licenceNumber} onChange={(e) => setLicenceNumber(e.target.value)} className="h-11 rounded-lg" placeholder="XXX-2024-XXX" />
                </div>

                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setStep(1)} className="h-11 rounded-lg text-sm">
                    <ArrowLeft className="mr-2 w-4 h-4" />
                    Retour
                  </Button>
                  <Button onClick={handleRegister} className="flex-1 h-11 rounded-lg text-sm font-semibold" disabled={loading}>
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Créer mon compte"}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Déjà un compte ?{" "}
          <button onClick={() => navigate("login")} className="text-primary font-semibold hover:underline">
            Se connecter
          </button>
        </p>
      </div>
    </div>
  );
}
