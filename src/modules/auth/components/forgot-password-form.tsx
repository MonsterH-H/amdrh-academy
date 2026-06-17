"use client";

import { useState } from "react";
import { useAppStore } from "@/store/app";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  CircleDot,
  ArrowLeft,
  Loader2,
  Mail,
  CheckCircle2,
  ChevronRight,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

/* ─── Geometric Moroccan pattern SVG component (reused) ─── */
function MoroccanPattern({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 200 200"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <pattern id="zellige-fp" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M0 0 L20 0 L20 20 L0 20 Z" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="0.5" />
          <path d="M10 0 L20 10 L10 20 L0 10 Z" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="0.5" />
          <circle cx="10" cy="10" r="3" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="0.5" />
          <path d="M20 0 L30 10 L20 20 L10 10 Z" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="0.5" />
        </pattern>
      </defs>
      <rect width="200" height="200" fill="url(#zellige-fp)" />
    </svg>
  );
}

/* ─── Handball silhouette ─── */
function HandballSilhouette({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="60" cy="60" r="32" stroke="rgba(255,255,255,0.15)" strokeWidth="2" />
      <path d="M60 28 C60 28, 60 60, 60 92" stroke="rgba(255,255,255,0.12)" strokeWidth="1.5" />
      <path d="M34 44 C44 48, 76 48, 86 44" stroke="rgba(255,255,255,0.12)" strokeWidth="1.5" />
      <path d="M34 76 C44 72, 76 72, 86 76" stroke="rgba(255,255,255,0.12)" strokeWidth="1.5" />
      <circle cx="60" cy="60" r="40" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
      <circle cx="60" cy="60" r="48" stroke="rgba(255,255,255,0.03)" strokeWidth="0.5" />
    </svg>
  );
}

/* ─── Geometric shapes for form side background ─── */
function GeometricBgShapes() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      <div className="absolute -top-20 -right-20 w-64 h-64 opacity-[0.03]">
        <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
          <polygon points="100,10 190,60 160,150 40,150 10,60" stroke="currentColor" strokeWidth="1" className="text-primary" />
          <polygon points="100,30 170,65 148,135 52,135 30,65" stroke="currentColor" strokeWidth="0.5" className="text-primary" />
        </svg>
      </div>
      <div className="absolute -bottom-16 -left-16 w-48 h-48 opacity-[0.03]">
        <svg viewBox="0 0 150 150" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="15" y="15" width="120" height="120" rx="4" stroke="currentColor" strokeWidth="1" className="text-primary" />
          <rect x="35" y="35" width="80" height="80" rx="2" stroke="currentColor" strokeWidth="0.5" className="text-primary" transform="rotate(15 75 75)" />
        </svg>
      </div>
      <div className="absolute top-1/4 right-12 w-8 h-8 rotate-45 border border-primary/[0.04]" />
      <div className="absolute bottom-1/3 left-8 w-4 h-4 rotate-45 border border-primary/[0.05]" />
      <div className="absolute top-12 left-1/4 grid grid-cols-4 gap-3 opacity-[0.04]">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="w-1 h-1 rounded-full bg-primary" />
        ))}
      </div>
    </div>
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

export function ForgotPasswordPage() {
  const { navigate } = useAppStore();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const [devToken, setDevToken] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Erreur lors de la demande");
        return;
      }

      setSent(true);
      if (data.devToken) {
        setDevToken(data.devToken);
      }
    } catch {
      setError("Erreur de connexion au serveur");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white">
      {/* ═══ Left branding panel (desktop) ═══ */}
      <motion.div
        initial="hidden"
        animate="show"
        className="hidden lg:flex lg:w-[52%] relative flex-col justify-between overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-[#0F766E] via-[#0C6B64] to-[#095E58]" />
        <div className="absolute inset-0 opacity-60">
          <MoroccanPattern className="absolute inset-0 w-full h-full" />
        </div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_20%,rgba(255,255,255,0.12),transparent_60%)]" />
        <div className="absolute top-[12%] right-[8%] opacity-30">
          <HandballSilhouette className="w-40 h-40" />
        </div>
        <div className="absolute bottom-[15%] left-[6%] opacity-20">
          <HandballSilhouette className="w-24 h-24" />
        </div>
        <div className="absolute top-1/3 left-[12%] w-16 h-16 rotate-45 border border-white/[0.08] rounded-sm" />
        <div className="absolute bottom-[30%] right-[15%] w-10 h-10 rotate-12 border border-white/[0.06] rounded-full" />

        <div className="relative z-10 flex flex-col justify-between p-10 xl:p-14 min-h-screen">
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

          <div className="flex-1 flex flex-col justify-center max-w-lg">
            <motion.div variants={slideInLeft} className="space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.1] backdrop-blur-sm border border-white/[0.1] w-fit">
                <Mail className="w-4 h-4 text-amber-300" />
                <span className="text-xs font-semibold text-white/90 tracking-wide">
                  Récupération de compte
                </span>
              </div>

              <h2 className="text-4xl xl:text-5xl font-bold text-white leading-[1.15] tracking-tight">
                Mot de passe
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-300">
                  oublié ?
                </span>
              </h2>

              <p className="text-base text-white/60 leading-relaxed max-w-md">
                Pas d&apos;inquiétude. Entrez votre adresse email et nous vous enverrons
                un lien sécurisé pour réinitialiser votre mot de passe en quelques minutes.
              </p>
            </motion.div>
          </div>

          <motion.div variants={fadeIn}>
            <div className="flex items-center gap-3 text-white/40">
              <div className="h-px flex-1 bg-white/10" />
              <span className="text-[10px] font-semibold tracking-[0.2em] uppercase">Partenaire officiel</span>
              <div className="h-px flex-1 bg-white/10" />
            </div>
            <p className="text-xs text-white/40 mt-4">
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
            <h2 className="text-xl font-bold text-foreground tracking-tight">Mot de passe oublié</h2>
            <p className="text-sm text-muted-foreground mt-2">
              Entrez votre email pour recevoir un lien de réinitialisation
            </p>
          </motion.div>

          {/* Mobile heading */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15 }}
            className="lg:hidden mb-6 text-center"
          >
            <h2 className="text-2xl font-bold text-foreground tracking-tight">Mot de passe oublié ?</h2>
            <p className="text-sm text-muted-foreground mt-1.5">
              Entrez votre email pour recevoir un lien de réinitialisation
            </p>
          </motion.div>

          {/* Card */}
          <motion.div
            variants={slideInRight}
            initial="hidden"
            animate="show"
          >
            <Card className="border-border/50 shadow-lg shadow-black/[0.04] bg-white">
              <CardContent className="p-6 sm:p-7">
                <AnimatePresence mode="wait">
                  {!sent ? (
                    <motion.div
                      key="form"
                      variants={container}
                      initial="hidden"
                      animate="show"
                      exit={{ opacity: 0, y: -8, transition: { duration: 0.2 } }}
                    >
                      {/* Info box */}
                      <motion.div
                        variants={item}
                        className="bg-primary/[0.04] border border-primary/[0.1] rounded-xl p-4 mb-6"
                      >
                        <div className="flex gap-3">
                          <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <Mail className="w-4 h-4 text-primary" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-foreground">
                              Instructions envoyées par email
                            </p>
                            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                              Vous recevrez un lien de réinitialisation valable 1 heure
                              si un compte est associé à cet email.
                            </p>
                          </div>
                        </div>
                      </motion.div>

                      {error && (
                        <motion.div
                          variants={item}
                          className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-xl font-medium border border-red-100 flex items-start gap-2.5 mb-5"
                        >
                          <span className="text-red-500 mt-0.5 flex-shrink-0">⚠</span>
                          <span>{typeof error === "string" ? error : JSON.stringify(error)}</span>
                        </motion.div>
                      )}

                      <form onSubmit={handleSubmit} className="space-y-5">
                        <motion.div variants={item} className="space-y-2">
                          <Label htmlFor="forgot-email" className="text-sm font-medium text-foreground/80">
                            Adresse email
                          </Label>
                          <div className="relative">
                            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
                            <Input
                              id="forgot-email"
                              type="email"
                              placeholder="votre@email.com"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              required
                              className="h-11 rounded-xl pl-10 pr-4 bg-muted/40 border-border/50 focus:bg-white focus:border-primary/30 transition-all duration-200 text-sm"
                            />
                          </div>
                        </motion.div>

                        <motion.div variants={item} className="pt-1">
                          <Button
                            type="submit"
                            className="w-full h-12 rounded-xl text-sm font-semibold shadow-md shadow-primary/15 hover:shadow-lg hover:shadow-primary/20 hover:brightness-110 active:scale-[0.985] transition-all duration-200"
                            disabled={loading || !email}
                          >
                            {loading ? (
                              <>
                                <Loader2 className="w-4 h-4 mr-2.5 animate-spin" />
                                Envoi en cours...
                              </>
                            ) : (
                              <>
                                Envoyer le lien de réinitialisation
                                <ChevronRight className="w-4 h-4 ml-1.5" />
                              </>
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
                      className="text-center py-2"
                    >
                      <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.15, type: "spring", stiffness: 200 }}
                        className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center mx-auto mb-5"
                      >
                        <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                      </motion.div>
                      <h3 className="font-bold text-lg text-foreground mb-2">
                        Email envoyé !
                      </h3>
                      <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                        Si un compte existe avec{" "}
                        <span className="font-semibold text-foreground">{email}</span>,
                        vous recevrez un lien de réinitialisation sous quelques instants.
                      </p>

                      {devToken && (
                        <motion.div
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.2 }}
                          className="bg-amber-50 border border-amber-200/80 rounded-xl p-4 mb-6 text-left"
                        >
                          <p className="text-xs font-semibold text-amber-800 mb-2">Mode développement — Token :</p>
                          <p className="text-xs text-amber-700 font-mono break-all bg-amber-100/80 rounded-lg p-2.5">
                            {devToken}
                          </p>
                          <button
                            onClick={() => {
                              navigate("reset-password", { token: devToken });
                            }}
                            className="mt-2.5 text-xs font-semibold text-amber-800 hover:text-amber-900 transition-colors flex items-center gap-1"
                          >
                            Continuer vers la réinitialisation
                            <ChevronRight className="w-3 h-3" />
                          </button>
                        </motion.div>
                      )}

                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="space-y-3"
                      >
                        <Button
                          variant="outline"
                          onClick={() => { setSent(false); setEmail(""); }}
                          className="w-full h-11 rounded-xl text-sm font-medium border-border/50"
                        >
                          Renvoyer un autre email
                        </Button>
                        <Button
                          variant="ghost"
                          onClick={() => navigate("login")}
                          className="w-full h-11 rounded-xl text-sm"
                        >
                          <ArrowLeft className="w-4 h-4 mr-2" />
                          Retour à la connexion
                        </Button>
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>
          </motion.div>

          {/* Back to login link (mobile) */}
          {!sent && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-center text-sm text-muted-foreground mt-6"
            >
              <button
                onClick={() => navigate("login")}
                className="text-primary font-semibold hover:text-primary/80 transition-colors inline-flex items-center gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Retour à la connexion
              </button>
            </motion.p>
          )}
        </div>
      </div>
    </div>
  );
}
