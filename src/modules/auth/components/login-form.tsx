"use client";

import { useState, useMemo, useEffect } from "react";
import { useAppStore } from "@/store/app";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import {
  CircleDot,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  ChevronRight,
  Trophy,
} from "lucide-react";
import { motion } from "framer-motion";

/* ─── Password strength helper ─── */
function getPasswordStrength(pw: string) {
  if (!pw) return { score: 0, label: "", color: "", segments: 0 };
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;

  if (score <= 1) return { score: 1, label: "Faible", color: "bg-red-500", segments: 1 };
  if (score <= 2) return { score: 2, label: "Passable", color: "bg-orange-500", segments: 2 };
  if (score <= 3) return { score: 3, label: "Moyen", color: "bg-yellow-500", segments: 3 };
  if (score <= 4) return { score: 4, label: "Bon", color: "bg-emerald-500", segments: 4 };
  return { score: 5, label: "Excellent", color: "bg-primary", segments: 5 };
}

/* ─── Geometric Moroccan pattern SVG component ─── */
function MoroccanPattern({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 200 200"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <pattern id="zellige" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M0 0 L20 0 L20 20 L0 20 Z" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="0.5" />
          <path d="M10 0 L20 10 L10 20 L0 10 Z" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="0.5" />
          <circle cx="10" cy="10" r="3" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="0.5" />
          <path d="M20 0 L30 10 L20 20 L10 10 Z" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="0.5" />
        </pattern>
        <pattern id="zellige-lg" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
          <path d="M0 0 L40 0 L40 40 L0 40 Z" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="0.8" />
          <path d="M20 0 L40 20 L20 40 L0 20 Z" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="0.8" />
          <circle cx="20" cy="20" r="6" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="0.8" />
          <path d="M40 0 L60 20 L40 40 L20 20 Z" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="0.8" />
          <path d="M60 0 L80 20 L60 40 L40 20 Z" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="0.8" />
        </pattern>
      </defs>
      <rect width="200" height="200" fill="url(#zellige)" />
    </svg>
  );
}

/* ─── Handball silhouette decorative SVG ─── */
function HandballSilhouette({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Stylized handball ball */}
      <circle cx="60" cy="60" r="32" stroke="rgba(255,255,255,0.15)" strokeWidth="2" />
      <path d="M60 28 C60 28, 60 60, 60 92" stroke="rgba(255,255,255,0.12)" strokeWidth="1.5" />
      <path d="M34 44 C44 48, 76 48, 86 44" stroke="rgba(255,255,255,0.12)" strokeWidth="1.5" />
      <path d="M34 76 C44 72, 76 72, 86 76" stroke="rgba(255,255,255,0.12)" strokeWidth="1.5" />
      {/* Outer ring glow */}
      <circle cx="60" cy="60" r="40" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
      <circle cx="60" cy="60" r="48" stroke="rgba(255,255,255,0.03)" strokeWidth="0.5" />
    </svg>
  );
}

/* ─── Geometric shapes for form side background ─── */
function GeometricBgShapes() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {/* Top-right angular shape */}
      <div className="absolute -top-20 -right-20 w-64 h-64 opacity-[0.03]">
        <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
          <polygon points="100,10 190,60 160,150 40,150 10,60" stroke="currentColor" strokeWidth="1" className="text-primary" />
          <polygon points="100,30 170,65 148,135 52,135 30,65" stroke="currentColor" strokeWidth="0.5" className="text-primary" />
        </svg>
      </div>
      {/* Bottom-left geometric */}
      <div className="absolute -bottom-16 -left-16 w-48 h-48 opacity-[0.03]">
        <svg viewBox="0 0 150 150" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="15" y="15" width="120" height="120" rx="4" stroke="currentColor" strokeWidth="1" className="text-primary" />
          <rect x="35" y="35" width="80" height="80" rx="2" stroke="currentColor" strokeWidth="0.5" className="text-primary" transform="rotate(15 75 75)" />
        </svg>
      </div>
      {/* Floating diamond */}
      <div className="absolute top-1/4 right-12 w-8 h-8 rotate-45 border border-primary/[0.04]" />
      <div className="absolute bottom-1/3 left-8 w-4 h-4 rotate-45 border border-primary/[0.05]" />
      {/* Subtle dot grid */}
      <div className="absolute top-12 left-1/4 grid grid-cols-4 gap-3 opacity-[0.04]">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="w-1 h-1 rounded-full bg-primary" />
        ))}
      </div>
    </div>
  );
}

/* ─── Password strength indicator component ─── */
function PasswordStrengthBar({ password }: { password: string }) {
  const strength = useMemo(() => getPasswordStrength(password), [password]);

  if (!password) return null;

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      className="mt-2 space-y-1.5"
    >
      <div className="flex gap-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className={`
              h-1 flex-1 rounded-full transition-all duration-300
              ${i < strength.segments ? strength.color : "bg-muted"}
            `}
          />
        ))}
      </div>
      <p className={`text-[11px] font-medium ${
        strength.score <= 2 ? "text-red-500" :
        strength.score <= 3 ? "text-yellow-600" :
        strength.score <= 4 ? "text-emerald-600" : "text-primary"
      }`}>
        Sécurité : {strength.label}
      </p>
    </motion.div>
  );
}

/* ─── Animation variants ─── */
const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.07, delayChildren: 0.2 } },
};

const item = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } },
};

const slideInLeft = {
  hidden: { opacity: 0, x: -30 },
  show: { opacity: 1, x: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

const slideInRight = {
  hidden: { opacity: 0, x: 30 },
  show: { opacity: 1, x: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

const fadeIn = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.4 } },
};

/* ─── Main LoginPage component ─── */
export function LoginPage() {
  const { navigate, setUser } = useAppStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [dbStatus, setDbStatus] = useState<"checking" | "connected" | "error">("checking");

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
        const errMsg = typeof data.error === "string" ? data.error : JSON.stringify(data.error) || "Erreur de connexion";
        setError(errMsg);
        return;
      }

      if (!data.user) {
        setError("Réponse serveur invalide");
        return;
      }

      setUser(data.user);
      const role = data.user.role;
      if (role === "ADMIN") navigate("admin-dashboard");
      else if (role === "FORMATEUR") navigate("formateur-dashboard");
      else navigate("dashboard");
    } catch (err) {
      setError("Erreur de connexion au serveur. Vérifiez votre connexion internet.");
    } finally {
      setLoading(false);
    }
  };

  // Check database status on mount
  useEffect(() => {
    fetch("/api/auth/check")
      .then((res) => res.json())
      .then((data) => {
        if (data.status === "ok") setDbStatus("connected");
        else setDbStatus("error");
      })
      .catch(() => setDbStatus("error"));
  }, []);

  return (
    <div className="min-h-screen flex bg-white">
      {/* ═══ Left branding panel (desktop) ═══ */}
      <motion.div
        initial="hidden"
        animate="show"
        className="hidden lg:flex lg:w-[52%] relative flex-col justify-between overflow-hidden"
      >
        {/* Deep teal gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0F766E] via-[#0C6B64] to-[#095E58]" />

        {/* Geometric overlay pattern */}
        <div className="absolute inset-0 opacity-60">
          <MoroccanPattern className="absolute inset-0 w-full h-full" />
        </div>

        {/* Radial glow */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_20%,rgba(255,255,255,0.12),transparent_60%)]" />

        {/* Decorative handball */}
        <div className="absolute top-[12%] right-[8%] opacity-30">
          <HandballSilhouette className="w-40 h-40" />
        </div>
        <div className="absolute bottom-[15%] left-[6%] opacity-20">
          <HandballSilhouette className="w-24 h-24" />
        </div>

        {/* Floating geometric shapes */}
        <div className="absolute top-1/3 left-[12%] w-16 h-16 rotate-45 border border-white/[0.08] rounded-sm" />
        <div className="absolute bottom-[30%] right-[15%] w-10 h-10 rotate-12 border border-white/[0.06] rounded-full" />
        <div className="absolute top-[60%] left-[35%] w-6 h-6 rotate-45 border border-white/[0.05]" />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between p-10 xl:p-14 min-h-screen">
          {/* Top: Logo */}
          <motion.div variants={slideInLeft}>
            <button onClick={() => navigate("landing")} className="inline-flex items-center gap-3.5 group">
              <div className="w-14 h-14 rounded-2xl bg-white/[0.12] backdrop-blur-sm border border-white/[0.15] flex items-center justify-center group-hover:bg-white/[0.18] transition-all duration-300">
                <CircleDot className="w-7 h-7 text-white" />
              </div>
              <div className="text-left">
                <h1 className="font-bold text-2xl text-white leading-tight tracking-tight">Académie</h1>
                <p className="text-[11px] text-white/60 font-semibold tracking-[0.25em] uppercase">AMDRH</p>
              </div>
            </button>
          </motion.div>

          {/* Middle: Branding */}
          <div className="flex-1 flex flex-col justify-center max-w-lg">
            <motion.div variants={slideInLeft} className="space-y-6">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.1] backdrop-blur-sm border border-white/[0.1] w-fit">
                <Trophy className="w-4 h-4 text-amber-300" />
                <span className="text-xs font-semibold text-white/90 tracking-wide">
                  Plateforme de formation officielle
                </span>
              </div>

              <h2 className="text-4xl xl:text-5xl font-bold text-white leading-[1.15] tracking-tight">
                Excellence dans
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-300">
                  l&apos;arbitrage
                </span>{" "}
                handball
              </h2>

              <p className="text-base text-white/60 leading-relaxed max-w-md">
                Programme de formation continue pour les arbitres de la
                Fédération Royale Marocaine de Handball. Améliorez vos compétences
                et obtenez vos certifications.
              </p>

              {/* Stats row */}
              <div className="flex gap-8 pt-2">
                {[
                  { value: "500+", label: "Arbitres formés" },
                  { value: "50+", label: "Modules de formation" },
                  { value: "12", label: "Régions couvertes" },
                ].map((stat) => (
                  <div key={stat.label}>
                    <p className="text-2xl font-bold text-white">{stat.value}</p>
                    <p className="text-xs text-white/50 mt-0.5">{stat.label}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Bottom: Federation info */}
          <motion.div variants={fadeIn} className="space-y-4">
            <div className="flex items-center gap-3 text-white/40">
              <div className="h-px flex-1 bg-white/10" />
              <span className="text-[10px] font-semibold tracking-[0.2em] uppercase">Partenaire officiel</span>
              <div className="h-px flex-1 bg-white/10" />
            </div>
            <p className="text-xs text-white/40">
              Association Marocaine Des Arbitres de Handball — FRMHB
            </p>
          </motion.div>
        </div>
      </motion.div>

      {/* ═══ Right form panel ═══ */}
      <div className="flex-1 relative flex items-center justify-center px-4 sm:px-6 lg:px-12 py-8 bg-white overflow-hidden">
        <GeometricBgShapes />

        <div className="w-full max-w-[420px] relative z-10">
          {/* Mobile-only logo */}
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="lg:hidden text-center mb-8"
          >
            <button onClick={() => navigate("landing")} className="inline-flex items-center gap-3 group">
              <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/25 group-hover:shadow-primary/35 transition-shadow duration-300">
                <CircleDot className="w-6 h-6 text-white" />
              </div>
              <div className="text-left">
                <h1 className="font-bold text-xl text-foreground leading-tight">Académie</h1>
                <p className="text-[10px] text-primary font-semibold tracking-[0.2em] uppercase">AMDRH</p>
              </div>
            </button>
          </motion.div>

          {/* Desktop heading */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="hidden lg:block mb-8"
          >
            <h2 className="text-[28px] font-bold text-foreground tracking-tight">Bon retour parmi nous</h2>
            <p className="text-sm text-muted-foreground mt-2">
              Connectez-vous pour accéder à votre espace de formation
            </p>
          </motion.div>

          {/* Mobile heading */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15 }}
            className="lg:hidden mb-6 text-center"
          >
            <h2 className="text-2xl font-bold text-foreground tracking-tight">Connexion</h2>
            <p className="text-sm text-muted-foreground mt-1.5">
              Espace réservé aux membres AMDRH-FRMHB
            </p>
          </motion.div>

          {/* Login card */}
          <motion.div
            variants={slideInRight}
            initial="hidden"
            animate="show"
          >
            <Card className="border-border/50 shadow-lg shadow-black/[0.04] bg-white">
              <CardContent className="p-6 sm:p-7">
                <motion.form
                  variants={container}
                  initial="hidden"
                  animate="show"
                  onSubmit={handleLogin}
                  className="space-y-5"
                >
                  {/* Database status indicator */}
                  {dbStatus === "error" && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="bg-amber-50 text-amber-800 text-xs px-4 py-3 rounded-xl font-medium border border-amber-200"
                    >
                      ⚠ Base de données indisponible. Vérifiez que <code className="font-mono bg-amber-100 px-1 rounded">DATABASE_URL</code> est configuré sur Vercel.
                    </motion.div>
                  )}

                  {/* Error banner */}
                  {error && (
                    <motion.div
                      variants={item}
                      className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-xl font-medium border border-red-100 flex items-start gap-2.5"
                    >
                      <span className="text-red-500 mt-0.5 flex-shrink-0">⚠</span>
                      <span>{error}</span>
                    </motion.div>
                  )}

                  {/* Email field */}
                  <motion.div variants={item} className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium text-foreground/80">
                      Adresse email
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="votre@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        autoComplete="email"
                        className="h-11 rounded-xl pl-10 pr-4 bg-muted/40 border-border/50 focus:bg-white focus:border-primary/30 transition-all duration-200 text-sm"
                      />
                    </div>
                  </motion.div>

                  {/* Password field */}
                  <motion.div variants={item} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password" className="text-sm font-medium text-foreground/80">
                        Mot de passe
                      </Label>
                      <button
                        type="button"
                        onClick={() => navigate("forgot-password")}
                        className="text-xs text-primary/80 font-medium hover:text-primary transition-colors"
                      >
                        Mot de passe oublié ?
                      </button>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        autoComplete="current-password"
                        className="h-11 rounded-xl pl-10 pr-10 bg-muted/40 border-border/50 focus:bg-white focus:border-primary/30 transition-all duration-200 text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/50 hover:text-foreground transition-colors"
                        aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {/* Password strength indicator */}
                    <PasswordStrengthBar password={password} />
                  </motion.div>

                  {/* Remember me */}
                  <motion.div variants={item} className="flex items-center gap-2.5 pt-0.5">
                    <Checkbox
                      id="remember-me"
                      checked={rememberMe}
                      onCheckedChange={(checked) => setRememberMe(checked === true)}
                      className="rounded-[5px] border-border/50"
                    />
                    <Label htmlFor="remember-me" className="text-sm text-muted-foreground cursor-pointer select-none">
                      Se souvenir de moi
                    </Label>
                  </motion.div>

                  {/* Submit button */}
                  <motion.div variants={item} className="pt-1">
                    <Button
                      type="submit"
                      className="w-full h-12 rounded-xl text-sm font-semibold shadow-md shadow-primary/15 hover:shadow-lg hover:shadow-primary/20 hover:brightness-110 active:scale-[0.985] transition-all duration-200"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2.5 animate-spin" />
                          Connexion en cours...
                        </>
                      ) : (
                        <>
                          Se connecter
                          <ChevronRight className="w-4 h-4 ml-1.5" />
                        </>
                      )}
                    </Button>
                  </motion.div>
                </motion.form>

              </CardContent>
            </Card>
          </motion.div>

          {/* Bottom text */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-center text-[11px] text-muted-foreground/50 mt-6 max-w-xs mx-auto lg:mx-0"
          >
            Association Marocaine Des Arbitres de Handball — Partenaire académique officiel FRMHB
          </motion.p>
        </div>
      </div>
    </div>
  );
}
