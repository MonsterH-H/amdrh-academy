"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Search, ShieldCheck, ShieldX, Loader2, CheckCircle, Award } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { formatDateLong } from "@/utils/format";

interface VerifyResult {
  valid: boolean;
  certificate?: {
    code: string;
    type: string;
    status: string;
    courseTitle: string;
    userName: string;
    score: number;
    maxScore: number;
    issuedAt: string;
    expiresAt: string | null;
  };
  error?: string;
  revokedAt?: string | null;
  revokeReason?: string | null;
}

export function CertificateVerify() {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<VerifyResult | null>(null);

  const handleVerify = async () => {
    const trimmed = code.trim();
    if (!trimmed) {
      toast({ title: "Code requis", description: "Veuillez saisir un code de certificat.", variant: "destructive" });
      return;
    }
    try {
      setLoading(true);
      setResult(null);
      const res = await fetch("/api/certificates/verify?code=" + encodeURIComponent(trimmed));
      if (!res.ok) throw new Error(`Erreur ${res.status}`);
      const data = await res.json() as VerifyResult;
      setResult(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erreur de vérification";
      toast({ title: "Erreur", description: message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-border/60">
      <CardContent className="p-6">
        <h3 className="font-semibold text-foreground mb-1 flex items-center gap-2">
          <Search className="w-4 h-4 text-primary" /> Vérifier un certificat
        </h3>
        <p className="text-xs text-muted-foreground mb-4">
          Saisissez le code d&apos;un certificat pour vérifier son authenticité
        </p>

        <div className="flex gap-2">
          <Input
            placeholder="Ex: AMDRH-2026-00001"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleVerify()}
            className="font-mono text-sm rounded-lg"
          />
          <Button
            onClick={handleVerify}
            disabled={loading}
            className="gap-1.5 rounded-lg flex-shrink-0"
          >
            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ShieldCheck className="w-3.5 h-3.5" />}
            Vérifier
          </Button>
        </div>

        {result && (
          <div className="mt-4 animate-fadeIn">
            <Separator className="mb-4" />
            {result.valid && result.certificate ? (
              <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800/40 rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-green-100 dark:bg-green-900/60 flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-green-700 dark:text-green-400">Certificat valide</p>
                    <p className="text-[10px] text-green-600 dark:text-green-500">Ce certificat est authentique et en cours de validité.</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <p className="text-muted-foreground">Titulaire</p>
                    <p className="font-medium text-foreground">{result.certificate.userName}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Formation</p>
                    <p className="font-medium text-foreground truncate">{result.certificate.courseTitle}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Score</p>
                    <p className={cn("font-medium", result.certificate.score / result.certificate.maxScore >= 0.7 ? "text-green-600 dark:text-green-400" : "text-amber-600 dark:text-amber-400")}>
                      {result.certificate.score}/{result.certificate.maxScore}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Délivré le</p>
                    <p className="font-medium text-foreground">{formatDateLong(result.certificate.issuedAt)}</p>
                  </div>
                </div>
                <Badge className="bg-green-100 dark:bg-green-900/60 text-green-700 dark:text-green-400 gap-1 text-[10px]">
                  <Award className="w-3 h-3" /> Certifié AMDRH
                </Badge>
              </div>
            ) : (
              <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/40 rounded-xl p-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-900/60 flex items-center justify-center">
                    <ShieldX className="w-4 h-4 text-red-600 dark:text-red-400" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-red-700 dark:text-red-400">
                      {result.certificate ? "Certificat invalide" : "Certificat introuvable"}
                    </p>
                    <p className="text-[10px] text-red-600 dark:text-red-500">
                      {result.error || "Ce certificat ne peut pas être vérifié."}
                    </p>
                  </div>
                </div>
                {result.certificate && (
                  <div className="mt-3 text-xs space-y-1">
                    <p className="text-muted-foreground">
                      Formation : <span className="font-medium text-foreground">{result.certificate.courseTitle}</span>
                    </p>
                    {result.revokeReason && (
                      <p className="text-red-600 dark:text-red-400">
                        Raison : {result.revokeReason}
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
