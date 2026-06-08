"use client";

import { useState } from "react";
import { useAppStore } from "@/store/app";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { CircleDot, ArrowLeft, Loader2, Mail, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.15 } },
};

const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
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
    <div className="min-h-screen relative flex items-center justify-center px-4 py-12 overflow-hidden">
      {/* Subtle gradient background matching login */}
      <div className="absolute inset-0 bg-[#FAFAFA]">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] rounded-full bg-gradient-to-b from-primary/[0.03] to-transparent blur-3xl" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[400px] rounded-full bg-gradient-to-tl from-primary/[0.02] to-transparent blur-3xl" />
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
            Mot de passe oublié ?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-sm text-muted-foreground mt-1.5"
          >
            Entrez votre email pour recevoir un lien de réinitialisation
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
                      className="bg-primary/5 border border-primary/15 rounded-lg p-4 mb-6"
                    >
                      <div className="flex gap-3">
                        <Mail className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-foreground">
                            Instructions envoyées par email
                          </p>
                          <p className="text-xs text-primary/80 mt-1">
                            Vous recevrez un lien de réinitialisation valable 1 heure si un compte est associé à cet email.
                          </p>
                        </div>
                      </div>
                    </motion.div>

                    {error && (
                      <motion.div
                        variants={item}
                        className="bg-destructive/10 text-destructive text-sm px-4 py-3 rounded-lg font-medium mb-5 border border-destructive/10"
                      >
                        {typeof error === "string" ? error : JSON.stringify(error)}
                      </motion.div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                      <motion.div variants={item} className="space-y-2">
                        <Label htmlFor="forgot-email" className="text-sm font-medium">Adresse email</Label>
                        <Input
                          id="forgot-email"
                          type="email"
                          placeholder="votre@email.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          className="h-11 rounded-lg bg-muted/30 focus:bg-background transition-colors"
                        />
                      </motion.div>

                      <motion.div variants={item}>
                        <Button
                          type="submit"
                          className="w-full h-11 rounded-lg text-sm font-semibold shadow-sm hover:shadow-md transition-all duration-200"
                          disabled={loading || !email}
                        >
                          {loading ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Envoi en cours...
                            </>
                          ) : (
                            "Envoyer le lien de réinitialisation"
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
                    className="text-center py-4"
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
                      Email envoyé !
                    </h3>
                    <p className="text-sm text-muted-foreground mb-6">
                      Si un compte existe avec <span className="font-semibold text-foreground">{email}</span>,
                      vous recevrez un lien de réinitialisation sous quelques instants.
                    </p>

                    {devToken && (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6 text-left"
                      >
                        <p className="text-xs font-semibold text-amber-800 mb-2">Mode développement — Token :</p>
                        <p className="text-xs text-amber-700 font-mono break-all bg-amber-100 rounded p-2">
                          {devToken}
                        </p>
                        <button
                          onClick={() => {
                            navigate("reset-password", { token: devToken });
                          }}
                          className="mt-2 text-xs font-semibold text-amber-800 hover:underline"
                        >
                          Continuer vers la réinitialisation →
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
                        className="w-full h-11 rounded-lg text-sm"
                      >
                        Renvoyer un autre email
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={() => navigate("login")}
                        className="w-full h-11 rounded-lg text-sm"
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

        {!sent && (
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
