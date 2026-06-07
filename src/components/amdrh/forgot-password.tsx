"use client";

import { useState } from "react";
import { useAppStore } from "@/store/app";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { CircleDot, ArrowLeft, Loader2, Mail, CheckCircle2 } from "lucide-react";

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
          <h2 className="text-2xl font-bold text-foreground">Mot de passe oublié ?</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Entrez votre email pour recevoir un lien de réinitialisation
          </p>
        </div>

        <Card className="border-border/60 shadow-sm">
          <CardContent className="p-6 sm:p-8">
            {!sent ? (
              <>
                {/* Info box */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <div className="flex gap-3">
                    <Mail className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-blue-900">
                        Instructions envoyées par email
                      </p>
                      <p className="text-xs text-blue-700 mt-1">
                        Vous recevrez un lien de réinitialisation valable 1 heure si un compte est associé à cet email.
                      </p>
                    </div>
                  </div>
                </div>

                {error && (
                  <div className="bg-destructive/10 text-destructive text-sm px-4 py-3 rounded-lg font-medium mb-5">
                    {typeof error === "string" ? error : JSON.stringify(error)}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="forgot-email" className="text-sm font-medium">Adresse email</Label>
                    <Input
                      id="forgot-email"
                      type="email"
                      placeholder="votre@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="h-11 rounded-lg"
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-11 rounded-lg text-sm font-semibold"
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
                </form>
              </>
            ) : (
              <div className="text-center py-4 animate-fadeIn">
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="font-bold text-lg text-foreground mb-2">
                  Email envoyé !
                </h3>
                <p className="text-sm text-muted-foreground mb-6">
                  Si un compte existe avec <span className="font-semibold text-foreground">{email}</span>,
                  vous recevrez un lien de réinitialisation sous quelques instants.
                </p>

                {devToken && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6 text-left">
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
                  </div>
                )}

                <div className="space-y-3">
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
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <p className="text-center text-sm text-muted-foreground mt-6">
          <button
            onClick={() => navigate("login")}
            className="text-primary font-semibold hover:underline"
          >
            Retour à la connexion
          </button>
        </p>
      </div>
    </div>
  );
}
